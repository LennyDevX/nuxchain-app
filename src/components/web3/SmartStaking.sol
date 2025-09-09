// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/// @title NuvoLogic Staking Contract v3.0
/// @notice A staking protocol that allows users to earn rewards based on time and amount staked
/// @dev Implements security measures including reentrancy protection, pausability, and ownership controls
/// @custom:security-contact security@nuvo.com
/// @custom:version 3.0.0
/// @custom:solc-version 0.8.28
contract SmartStaking is Ownable, Pausable, ReentrancyGuard {
    using Address for address payable;

    // ════════════════════════════════════════════════════════════════════════════════════════
    // CONSTANTS (Gas optimized - immutable where possible)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    uint256 private constant HOURLY_ROI_PERCENTAGE = 100; // 0.01% per hour (base ROI)
    uint16 private constant MAX_ROI_PERCENTAGE = 12500; // 125%
    uint16 private constant COMMISSION_PERCENTAGE = 600; // 6% (in basis points)
    uint256 private constant MAX_DEPOSIT = 10000 ether;
    uint256 private constant MIN_DEPOSIT = 5 ether;
    uint16 private constant MAX_DEPOSITS_PER_USER = 300;
    uint256 private constant CONTRACT_VERSION = 3;
    uint256 private constant BASIS_POINTS = 10000;
    uint256 private constant SECONDS_PER_HOUR = 3600;
    uint256 private constant REWARD_PRECISION = 1000000;

    // Time constants for bonuses (gas optimization)
    uint256 private constant THIRTY_DAYS = 30 days;
    uint256 private constant NINETY_DAYS = 90 days;
    uint256 private constant ONE_HUNDRED_EIGHTY_DAYS = 180 days;
    uint256 private constant THREE_HUNDRED_SIXTY_FIVE_DAYS = 365 days;

    // Withdrawal limits
    uint256 private constant DAILY_WITHDRAWAL_LIMIT = 1000 ether; // Example: 50 ETH per day
    uint256 private constant WITHDRAWAL_LIMIT_PERIOD = 1 days; // 24 hours

    // Hourly ROI percentages for lock-up periods (in basis points, 100 = 0.01%)
    uint256 private constant ROI_30_DAYS_LOCKUP = 120; // 0.012% per hour
    uint256 private constant ROI_90_DAYS_LOCKUP = 160; // 0.016% per hour
    uint256 private constant ROI_180_DAYS_LOCKUP = 200;  // 0.02% per hour
    uint256 private constant ROI_365_DAYS_LOCKUP = 300;  // 0.03% per hour

    // ════════════════════════════════════════════════════════════════════════════════════════
    // STATE VARIABLES (Optimized packing)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Address of the treasury wallet
    address public treasury;
    
    /// @notice Address of the new contract for migration
    address public newContractAddress;
    
    /// @notice Total balance in the staking pool
    uint256 public totalPoolBalance;
    
    /// @notice Accumulated commission if transfer fails
    uint256 public pendingCommission;
    
    /// @notice Count of unique users who have staked
    uint256 public uniqueUsersCount;
    
    /// @notice Whether the contract has been migrated
    bool public migrated;

    // ════════════════════════════════════════════════════════════════════════════════════════
    // STRUCTS (Optimized for storage)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Structure representing a user deposit
    /// @dev Packed to optimize storage slots
    struct Deposit {
        uint128 amount;          // Sufficient for max deposit (10k ETH)
        uint64 timestamp;        // Unix timestamp fits in uint64 until year 584,942,417,355
        uint64 lastClaimTime;    // Same as above
        uint64 lockupDuration;   // Duration of the lock-up period in seconds (0 if no lock-up)
    }

    /// @notice Structure representing user data
    /// @dev Optimized storage packing to reduce gas costs
    struct User {
        uint128 totalDeposited;  // Total amount deposited by user (slot 0)
        uint64 lastWithdrawTime; // Last withdrawal timestamp (slot 0)
        uint64 reserved;         // Reserved for future use (slot 0)
        Deposit[] deposits;      // Dynamic array of deposits (slot 1+)
    }

    /// @notice Structure for external user information queries
    struct UserInfo {
        uint256 totalDeposited;
        uint256 pendingRewards;
        uint256 lastWithdraw;
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // MAPPINGS
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Maps user addresses to their staking data
    mapping(address => User) private users;

    // Withdrawal limit tracking
    mapping(address => uint256) private _dailyWithdrawalAmount;
    mapping(address => uint64) private _lastWithdrawalDay;

    // ════════════════════════════════════════════════════════════════════════════════════════
    // EVENTS (Enhanced with indexed parameters)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Emitted when a user makes a deposit
    event DepositMade(
        address indexed user,
        uint256 indexed depositId,
        uint256 amount,
        uint256 commission,
        uint256 indexed timestamp
    );
    
    /// @notice Emitted when a user withdraws rewards
    event WithdrawalMade(
        address indexed user,
        uint256 amount,
        uint256 commission,
        uint256 indexed timestamp,
        uint256 depositId // Added depositId for more detail
    );
    
    /// @notice Emitted when contract is paused
    event ContractPaused(address indexed owner, uint256 indexed timestamp);
    
    /// @notice Emitted when contract is unpaused
    event ContractUnpaused(address indexed owner, uint256 indexed timestamp);
    
    /// @notice Emitted when balance is added to contract
    event BalanceAdded(uint256 amount, uint256 indexed timestamp);
    
    /// @notice Emitted when treasury address changes
    event TreasuryAddressChanged(
        address indexed previousTreasury,
        address indexed newTreasury,
        uint256 indexed timestamp
    );
    
    /// @notice Emitted when user makes emergency withdrawal
    event EmergencyWithdrawUser(
        address indexed user,
        uint256 amount,
        uint256 indexed timestamp
    );

    /// @notice Emitted when a user compounds their rewards.
    /// @param user The address of the user who compounded rewards.
    /// @param amount The amount of rewards compounded.
    event RewardsCompounded(address indexed user, uint256 amount);
    
    /// @notice Emitted when owner makes emergency withdrawal
    event EmergencyWithdrawOwner(
        address indexed owner, 
        address indexed to, 
        uint256 amount, 
        uint256 indexed timestamp
    );
    
    /// @notice Emitted when contract is migrated
    event ContractMigrated(address indexed newContract, uint256 indexed timestamp);
    
    /// @notice Emitted when commission is paid
    event CommissionPaid(
        address indexed receiver, 
        uint256 amount, 
        uint256 indexed timestamp
    );

    // ════════════════════════════════════════════════════════════════════════════════════════
    // CUSTOM ERRORS (Gas efficient error handling)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Thrown when deposit is below minimum
    error DepositTooLow(uint256 provided, uint256 minimum);
    
    /// @notice Thrown when deposit exceeds maximum
    error DepositTooHigh(uint256 provided, uint256 maximum);
    
    /// @notice Thrown when user reaches maximum deposits
    error MaxDepositsReached(address user, uint16 maxDeposits);
    
    /// @notice Thrown when address is zero
    error InvalidAddress();
    
    /// @notice Thrown when contract is migrated
    error ContractIsMigrated();
    
    /// @notice Thrown when no rewards available
    error NoRewardsAvailable();
    
    /// @notice Thrown when insufficient balance
    error InsufficientBalance();
    
    /// @notice Thrown when no deposits found
    error NoDepositsFound();
    
    /// @notice Thrown when already migrated
    error AlreadyMigrated();
    
    /// @notice Thrown when no pending commission
    error NoPendingCommission();
    
    /// @notice Thrown when unauthorized sender
    error UnauthorizedSender();

    /// @notice Thrown when an invalid lock-up duration is provided
    error InvalidLockupDuration();

    /// @notice Thrown when funds are still locked
    error FundsAreLocked();

    /// @notice Thrown when a user exceeds their daily withdrawal limit.
    /// @param availableToWithdraw The remaining amount the user can withdraw today.
    error DailyWithdrawalLimitExceeded(uint256 availableToWithdraw);

    // ════════════════════════════════════════════════════════════════════════════════════════
    // MODIFIERS (Enhanced with custom errors)
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Ensures contract is not migrated
    modifier notMigrated() {
        if (migrated) revert ContractIsMigrated();
        _;
    }

    /// @notice Validates address is not zero
    /// @param _address The address to validate.
    modifier validAddress(address _address) {
        if (_address == address(0)) revert InvalidAddress();
        _;
    }

    /// @notice Validates deposit amount against minimum and maximum limits.
    /// @param _amount The amount to validate.
    modifier sufficientDeposit(uint256 _amount) {
        if (_amount < MIN_DEPOSIT) revert DepositTooLow(_amount, MIN_DEPOSIT);
        if (_amount > MAX_DEPOSIT) revert DepositTooHigh(_amount, MAX_DEPOSIT);
        _;
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // CONSTRUCTOR
    // ════════════════════════════════════════════════════════════════════════════════════════
    
    /// @notice Initializes the contract with treasury address
    /// @param _treasury Address of the treasury wallet
    constructor(address _treasury) validAddress(_treasury) {
        treasury = _treasury;
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // ADMIN FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════════

    /// @notice Changes the treasury address.
    /// @param _newTreasury The new address for the treasury.
    function changeTreasuryAddress(address _newTreasury) 
        external 
        onlyOwner 
        validAddress(_newTreasury) 
    {
        address previousTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryAddressChanged(previousTreasury, _newTreasury, block.timestamp);
    }

    /// @notice Pauses the contract, preventing most state-changing operations.
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender, block.timestamp);
    }

    /// @notice Unpauses the contract, allowing state-changing operations to resume.
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender, block.timestamp);
    }

    /// @notice Allows the owner to add funds to the contract's balance.
    function addBalance() external payable onlyOwner {
        if (msg.value == 0) revert DepositTooLow(0, 1);
        
        totalPoolBalance += msg.value;
        emit BalanceAdded(msg.value, block.timestamp);
    }

    /// @notice Sets a new contract address for migration and marks the current contract as migrated.
    /// @param _newContractAddress The address of the new contract to migrate to.
    function migrateToNewContract(address _newContractAddress) 
        external 
        onlyOwner 
        validAddress(_newContractAddress) 
    {
        if (migrated) revert AlreadyMigrated();
        
        newContractAddress = _newContractAddress;
        migrated = true;
        emit ContractMigrated(_newContractAddress, block.timestamp);
    }

    /// @notice Allows the owner to withdraw accumulated pending commissions to the treasury.
    function withdrawPendingCommission() external onlyOwner {
        if (pendingCommission == 0) revert NoPendingCommission();
        
        uint256 amount = pendingCommission;
        pendingCommission = 0;
        
        (bool sent, ) = payable(treasury).call{value: amount}("");
        if (!sent) revert InsufficientBalance();
        
        emit CommissionPaid(treasury, amount, block.timestamp);
    }

    /// @notice Allows the owner to perform an emergency withdrawal of the entire contract balance to a specified address when the contract is paused.
    /// @param to The address to send the funds to.
    function emergencyWithdraw(address to) 
        external 
        onlyOwner 
        whenPaused 
        validAddress(to) 
    {
        uint256 balance = address(this).balance;
        payable(to).sendValue(balance);
        emit EmergencyWithdrawOwner(msg.sender, to, balance, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // USER FUNCTIONS
    // ════════════════════════════════════════════════════════════════════════════════════════

    /// @notice Allows users to stake tokens
    /// @dev Implements commission calculation and fallback mechanism
    /// @notice Allows users to stake tokens with an optional lock-up period
    /// @dev Implements commission calculation and fallback mechanism
    /// @param _lockupDuration The desired lock-up duration in days (0 for no lock-up)
    function deposit(uint64 _lockupDuration) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        notMigrated 
        sufficientDeposit(msg.value) 
    {
        // Validate lock-up duration
        if (_lockupDuration != 0 && _lockupDuration != 30 && _lockupDuration != 90 && _lockupDuration != 180 && _lockupDuration != 365) {
             revert InvalidLockupDuration();
         }

        User storage user = users[msg.sender];

        if (user.deposits.length >= MAX_DEPOSITS_PER_USER) {
            revert MaxDepositsReached(msg.sender, MAX_DEPOSITS_PER_USER);
        }

        // Calculate commission and deposit amount
        uint256 commission = (msg.value * COMMISSION_PERCENTAGE) / BASIS_POINTS;
        uint256 depositAmount = msg.value - commission;

        // Update user count for new users
        if (user.deposits.length == 0) {
            unchecked {
                ++uniqueUsersCount;
             }
        }

        // Update balances
        totalPoolBalance += depositAmount;
        user.totalDeposited += uint128(depositAmount);
        
        uint256 depositId = user.deposits.length;
        uint64 currentTime = uint64(block.timestamp);
        uint64 lockupDurationSeconds = _lockupDuration * 1 days; // Convert days to seconds

        // Add new deposit
        user.deposits.push(Deposit({
            amount: uint128(depositAmount),
            timestamp: currentTime,
            lastClaimTime: currentTime,
            lockupDuration: lockupDurationSeconds
        }));

        // Handle commission transfer with fallback
        _transferCommission(commission);
        
        emit DepositMade(msg.sender, depositId, depositAmount, commission, block.timestamp);
    }

    /// @notice Withdraws accumulated rewards
    /// @dev Implements daily withdrawal limits to manage contract liquidity.
    function withdraw() external nonReentrant whenNotPaused notMigrated {
        User storage user = users[msg.sender];
        uint256 depositsLength = user.deposits.length; // Cache length for gas optimization

        // Check and enforce daily withdrawal limit
        uint64 currentDay = uint64(block.timestamp / WITHDRAWAL_LIMIT_PERIOD);
        if (currentDay > _lastWithdrawalDay[msg.sender]) {
            _dailyWithdrawalAmount[msg.sender] = 0;
            _lastWithdrawalDay[msg.sender] = currentDay;
        }

        uint256 totalRewards = calculateRewards(msg.sender);
        if (totalRewards == 0) revert NoRewardsAvailable();

        uint256 availableToWithdraw = DAILY_WITHDRAWAL_LIMIT - _dailyWithdrawalAmount[msg.sender];
        if (totalRewards > availableToWithdraw) {
            revert DailyWithdrawalLimitExceeded(availableToWithdraw);
        }

        // Check lockup periods for all deposits
        for (uint256 i; i < depositsLength;) {
            Deposit storage userDeposit = user.deposits[i];
            if (userDeposit.lockupDuration > 0 && block.timestamp < userDeposit.timestamp + userDeposit.lockupDuration) {
                revert FundsAreLocked();
            }
            unchecked { ++i; }
        }

        _dailyWithdrawalAmount[msg.sender] += totalRewards;
        uint256 commission = (totalRewards * COMMISSION_PERCENTAGE) / BASIS_POINTS;
        uint256 netAmount = totalRewards - commission;

        if (address(this).balance < netAmount + commission) {
            revert InsufficientBalance();
        }

        // Update claim times
        uint64 currentTime = uint64(block.timestamp);
        
        for (uint256 i; i < depositsLength;) {
            user.deposits[i].lastClaimTime = currentTime;
            unchecked { ++i; }
        }
        user.lastWithdrawTime = currentTime;

        // Handle transfers
        _transferCommission(commission);
        payable(msg.sender).sendValue(netAmount);

        emit WithdrawalMade(msg.sender, netAmount, commission, block.timestamp, 0); // depositId 0 for reward withdrawals
    }

    /// @notice Withdraws all deposits and accumulated rewards
    /// @notice Withdraws all deposits and accumulated rewards
    /// @notice Compounds accumulated rewards into a new deposit
    /// @dev Allows users to reinvest their rewards without withdrawing
    /// @param _lockupDuration The desired lock-up duration in days for compounded rewards (0 for no lock-up)
    function compound(uint64 _lockupDuration) external nonReentrant whenNotPaused notMigrated {
        // Validate lock-up duration
        if (_lockupDuration != 0 && _lockupDuration != 30 && _lockupDuration != 90 && _lockupDuration != 180 && _lockupDuration != 365) {
            revert InvalidLockupDuration();
        }
        
        User storage user = users[msg.sender];
        
        // Check if user has reached maximum deposits
        if (user.deposits.length >= MAX_DEPOSITS_PER_USER) {
            revert MaxDepositsReached(msg.sender, MAX_DEPOSITS_PER_USER);
        }
        
        uint256 totalRewards = calculateRewards(msg.sender);
        if (totalRewards == 0) revert NoRewardsAvailable();
        
        // Update claim times for all deposits
        uint64 currentTime = uint64(block.timestamp);
        uint256 depositsLength = user.deposits.length; // Cache length for gas optimization
        for (uint256 i; i < depositsLength;) {
            user.deposits[i].lastClaimTime = currentTime;
            unchecked { ++i; }
        }
        
        uint64 lockupDurationSeconds = _lockupDuration * 1 days; // Convert days to seconds
        
        // Create new deposit with compounded rewards
        user.deposits.push(Deposit({
            amount: uint128(totalRewards),
            timestamp: currentTime,
            lastClaimTime: currentTime,
            lockupDuration: lockupDurationSeconds
        }));
        
        user.totalDeposited += uint128(totalRewards);
        totalPoolBalance += totalRewards;
        
        emit RewardsCompounded(msg.sender, totalRewards);
    }

    /// @notice Withdraws all deposits and accumulated rewards
    /// @dev Implements daily withdrawal limits and clears user data
    function withdrawAll() external nonReentrant whenNotPaused notMigrated {
        User storage user = users[msg.sender];
        uint256 depositsLength = user.deposits.length; // Cache length for gas optimization
        if (depositsLength == 0) revert NoDepositsFound();

        // Check lockup periods for all deposits before proceeding
        for (uint256 i; i < depositsLength;) {
            Deposit storage userDeposit = user.deposits[i];
            if (userDeposit.lockupDuration > 0 && block.timestamp < userDeposit.timestamp + userDeposit.lockupDuration) {
                revert FundsAreLocked();
            }
            unchecked { ++i; }
        }

        // Check and enforce daily withdrawal limit
        uint64 currentDay = uint64(block.timestamp / WITHDRAWAL_LIMIT_PERIOD);
        if (currentDay > _lastWithdrawalDay[msg.sender]) {
            _dailyWithdrawalAmount[msg.sender] = 0;
            _lastWithdrawalDay[msg.sender] = currentDay;
        }

        uint256 totalRewards = calculateRewards(msg.sender);
        uint256 totalWithdrawal = user.totalDeposited + totalRewards;

        uint256 availableToWithdraw = DAILY_WITHDRAWAL_LIMIT - _dailyWithdrawalAmount[msg.sender];
        if (totalWithdrawal > availableToWithdraw) {
            revert DailyWithdrawalLimitExceeded(availableToWithdraw);
        }

        _dailyWithdrawalAmount[msg.sender] += totalWithdrawal;

        // Calculate commission on rewards only
        uint256 commission = (totalRewards * COMMISSION_PERCENTAGE) / BASIS_POINTS;
        uint256 userAmount = totalWithdrawal - commission;

        // Store values before clearing user data
        uint256 userTotalDeposited = user.totalDeposited;

        if (address(this).balance < userAmount + commission) {
            revert InsufficientBalance();
        }

        // Update contract state
        totalPoolBalance -= userTotalDeposited;
        unchecked {
            --uniqueUsersCount;
        }

        // Clear user data
        delete users[msg.sender];

        // Transfer funds to user
        payable(msg.sender).sendValue(userAmount);

        // Handle commission transfer with fallback
        if (commission > 0) {
            _transferCommission(commission);
        }

        emit WithdrawalMade(msg.sender, userAmount, commission, block.timestamp, type(uint256).max); // Use max uint for withdrawAll identifier
        emit EmergencyWithdrawUser(msg.sender, userTotalDeposited, block.timestamp);
    }

    /// @notice Allows a user to withdraw their total deposited amount during a pause, without rewards.
    function emergencyUserWithdraw() external nonReentrant whenPaused {
        User storage user = users[msg.sender];
        uint256 depositsLength = user.deposits.length; // Cache length for gas optimization
        if (depositsLength == 0 || user.totalDeposited == 0) revert NoDepositsFound();

        uint256 totalDeposit = user.totalDeposited;
        
        // Validate contract has sufficient balance
        if (address(this).balance < totalDeposit) revert InsufficientBalance();
        
        totalPoolBalance -= totalDeposit;
        
        // Decrement unique users count before clearing data
        unchecked {
            --uniqueUsersCount;
        }
        
        delete users[msg.sender];
        payable(msg.sender).sendValue(totalDeposit);

        emit EmergencyWithdrawUser(msg.sender, totalDeposit, block.timestamp);
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // VIEW FUNCTIONS (Gas optimized)
    // ════════════════════════════════════════════════════════════════════════════════════════

    /// @notice Calculates pending rewards for a user
    /// @param _user Address of the user
    /// @return Total pending rewards
    function calculateRewards(address _user) public view returns (uint256) {
        User storage user = users[_user];
        uint256 totalRewards;
        uint256 depositsLength = user.deposits.length; // Cache length for gas optimization
        
        for (uint256 i; i < depositsLength;) {
            Deposit storage userDeposit = user.deposits[i];
            
            // Prevent overflow by checking if elapsed time is reasonable
            uint256 elapsedTime = block.timestamp - userDeposit.lastClaimTime;
            if (elapsedTime > 365 days) {
                elapsedTime = 365 days; // Cap at 1 year to prevent overflow
            }
            
            uint256 elapsedHours = elapsedTime / SECONDS_PER_HOUR;
            
            if (elapsedHours > 0) {
                uint256 roiPercentage = _calculateTimeBonus(userDeposit.lockupDuration);
                uint256 hourlyReward = (userDeposit.amount * roiPercentage) / (BASIS_POINTS * REWARD_PRECISION);
                
                // Additional overflow protection
                uint256 maxReward = (userDeposit.amount * MAX_ROI_PERCENTAGE) / BASIS_POINTS;
                uint256 calculatedReward = hourlyReward * elapsedHours;
                
                // Cap rewards at maximum ROI
                if (calculatedReward > maxReward) {
                    calculatedReward = maxReward;
                }
                
                totalRewards += calculatedReward;
            }
            
            unchecked { ++i; }
        }
        
        return totalRewards;
    }

    /// @notice Retrieves the total amount deposited by a specific user.
    /// @param userAddress The address of the user.
    /// @return The total deposited amount for the user.
    function getTotalDeposit(address userAddress) external view returns (uint256) {
        return users[userAddress].totalDeposited;
    }

    /// @notice Retrieves all individual deposit entries for a specific user.
    /// @param userAddress The address of the user.
    /// @return An array of `Deposit` structs representing all of the user's deposits.
    function getUserDeposits(address userAddress) 
        external 
        view 
        validAddress(userAddress) 
        returns (Deposit[] memory) 
    {
        return users[userAddress].deposits;
    }

    /// @notice Retrieves comprehensive information about a user, including total deposited amount, pending rewards, and last withdrawal time.
    /// @param userAddress The address of the user.
    /// @return A `UserInfo` struct containing the user's total deposited amount, pending rewards, and last withdrawal timestamp.
    function getUserInfo(address userAddress) external view returns (UserInfo memory) {
        User storage user = users[userAddress];
        return UserInfo({
            totalDeposited: user.totalDeposited,
            pendingRewards: calculateRewards(userAddress),
            lastWithdraw: user.lastWithdrawTime
        });
    }

    /// @notice Retrieves the current balance of the contract.
    /// @return The current balance of the contract in Wei.
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Retrieves the current version of the contract.
    /// @return The contract version number.
    function getContractVersion() external pure returns (uint256) {
        return CONTRACT_VERSION;
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // INTERNAL FUNCTIONS (Gas optimized)
    // ════════════════════════════════════════════════════════════════════════════════════════

    /// @notice Calculates ROI percentage based on lockup duration
    /// @param lockupDuration Duration of lockup in seconds
    /// @return ROI percentage in basis points
    function _calculateTimeBonus(uint256 lockupDuration) internal pure returns (uint256) {
        if (lockupDuration == 0) {
            return HOURLY_ROI_PERCENTAGE; // 0.01% per hour for no lockup
        } else if (lockupDuration == 30 days) {
            return ROI_30_DAYS_LOCKUP; // 0.012% per hour
        } else if (lockupDuration == 90 days) {
            return ROI_90_DAYS_LOCKUP; // 0.016% per hour
        } else if (lockupDuration == 180 days) {
            return ROI_180_DAYS_LOCKUP; // 0.02% per hour
        } else if (lockupDuration == 365 days) {
            return ROI_365_DAYS_LOCKUP; // 0.03% per hour
        } else {
            return HOURLY_ROI_PERCENTAGE; // Default to base ROI
        }
    }

    /// @notice Transfers commission to treasury with fallback mechanism
    /// @param commission Amount of commission to transfer
    function _transferCommission(uint256 commission) internal {
        if (commission > 0) {
            // Use Address.sendValue for better security and gas efficiency
            (bool success,) = payable(treasury).call{value: commission, gas: 2300}("");
            if (success) {
                emit CommissionPaid(treasury, commission, block.timestamp);
            } else {
                // If transfer fails, accumulate in pending commission
                pendingCommission += commission;
            }
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════════════
    // RECEIVE FUNCTION (Restricted)
    // ════════════════════════════════════════════════════════════════════════════════════════

    /// @notice Fallback function to receive Ether.
    /// @dev This function is restricted to only allow the treasury address to send Ether directly to the contract.
    receive() external payable {
        if (msg.sender != treasury) revert UnauthorizedSender();
    }
}