// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title IERC20
 * @dev Minimal interface for ERC20 tokens.
 */
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

/**
 * @title Ownable
 * @dev Contract module which provides a basic access control mechanism.
 */
abstract contract Ownable {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        _transferOwnership(msg.sender);
    }

    function owner() public view virtual returns (address) {
        return _owner;
    }

    modifier onlyOwner() {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

/**
 * @title Airdrop
 * @dev Enhanced airdrop contract with improved security and functionality.
 * Features: pausable, blacklist, fund management, and comprehensive state tracking.
 */
contract Airdrop is Ownable, Pausable, ReentrancyGuard {
    
    // Token configuration
    IERC20 public immutable token;
    uint256 public immutable airdropAmount;
    
    // Time configuration
    uint256 public immutable registrationEndTime;
    uint256 public immutable claimStartTime;
    uint256 public immutable claimEndTime;
    
    // State tracking - optimized storage packing
    uint128 public registeredUserCount;
    uint128 public claimedUserCount;
    uint256 public totalTokensClaimed;
    
    // User management - packed struct for gas optimization
    struct UserData {
        uint64 registrationTime;  // 8 bytes - sufficient until year 2554
        bool isRegistered;        // 1 byte
        bool hasClaimed;         // 1 byte  
        bool isBlacklisted;      // 1 byte
        // Total: 11 bytes, fits in 1 storage slot with address (32 bytes total)
    }
    
    mapping(address => UserData) public userData;
    
    // Optimized arrays instead of EnumerableSet for gas efficiency
    address[] public registeredUsers;
    address[] public claimedUsers;
    address[] public blacklistedUsers;
    
    // Mappings for O(1) index lookup
    mapping(address => uint256) private registeredUserIndex;
    mapping(address => uint256) private claimedUserIndex;
    mapping(address => uint256) private blacklistedUserIndex;
    
    // Events
    event UserRegistered(address indexed user, uint256 timestamp);
    event TokensClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event TokensWithdrawn(address indexed contractOwner, uint256 amount);
    event ContractFunded(address indexed funder, uint256 amount);
    event UserBlacklisted(address indexed user);
    event UserUnblacklisted(address indexed user);
    event EmergencyWithdrawal(address indexed to, uint256 amount);
    
    // Custom errors for gas efficiency
    error RegistrationClosed();
    error AlreadyRegistered();
    error ClaimNotStarted();
    error ClaimExpired();
    error NotRegistered();
    error AlreadyClaimed();
    error InsufficientContractBalance();
    error TransferFailed();
    error UserIsBlacklisted();
    error InvalidAmount();
    error InvalidTimeConfiguration();
    error InvalidToken();

    /**
     * @dev Sets up the airdrop contract with enhanced configuration.
     * @param _token The address of the ERC20 token to be distributed.
     * @param _registrationDuration The duration of the registration period in seconds.
     * @param _claimDelay The delay in seconds after registration ends before claiming can start.
     * @param _claimDuration The duration of the claim period in seconds (0 = unlimited).
     */
    constructor(
        address _token,
        uint256 _registrationDuration,
        uint256 _claimDelay,
        uint256 _claimDuration
    ) {
        if (_token == address(0)) revert InvalidToken();
        if (_registrationDuration == 0) revert InvalidTimeConfiguration();
        if (_registrationDuration > 365 days) revert InvalidTimeConfiguration(); // Max 1 year registration
        if (_claimDelay > 30 days) revert InvalidTimeConfiguration(); // Max 30 days delay
        if (_claimDuration > 365 days) revert InvalidTimeConfiguration(); // Max 1 year claim period
        
        token = IERC20(_token);
        airdropAmount = 5 ether; // Fixed amount: 5 tokens (assuming 18 decimals)
        
        registrationEndTime = block.timestamp + _registrationDuration;
        claimStartTime = registrationEndTime + _claimDelay;
        
        // Set claim end time (0 means unlimited)
        if (_claimDuration > 0) {
            claimEndTime = claimStartTime + _claimDuration;
        } else {
            claimEndTime = 0; // Unlimited claiming period
        }
        
        // Enhanced time configuration validation
        if (claimStartTime <= registrationEndTime) revert InvalidTimeConfiguration();
        if (claimEndTime > 0 && claimEndTime <= claimStartTime) revert InvalidTimeConfiguration();
        if (claimStartTime > block.timestamp + 400 days) revert InvalidTimeConfiguration(); // Sanity check
    }

    // Modifiers - updated for optimized storage
    modifier notBlacklisted() {
        if (userData[msg.sender].isBlacklisted) revert UserIsBlacklisted();
        _;
    }
    
    modifier canRegister() {
        if (block.timestamp >= registrationEndTime) revert RegistrationClosed();
        if (userData[msg.sender].isRegistered) revert AlreadyRegistered();
        _;
    }
    
    modifier canClaim() {
        if (block.timestamp < claimStartTime) revert ClaimNotStarted();
        if (claimEndTime > 0 && block.timestamp >= claimEndTime) revert ClaimExpired();
        if (!userData[msg.sender].isRegistered) revert NotRegistered();
        if (userData[msg.sender].hasClaimed) revert AlreadyClaimed();
        _;
    }

    /**
     * @dev Allows the owner to fund the contract by pulling tokens from their wallet.
     * @param amount The amount of tokens to fund the contract with.
     */
    function fundContract(uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0) revert InvalidAmount();
        if (block.timestamp >= registrationEndTime) revert RegistrationClosed();
        
        // Enhanced security validations
        uint256 maxReasonableAmount = 1_000_000 * 10**18; // 1M tokens max per funding
        if (amount > maxReasonableAmount) revert InvalidAmount();
        
        uint256 allowance = token.allowance(msg.sender, address(this));
        require(allowance >= amount, "Airdrop: Insufficient allowance");
        
        // Check for potential overflow
        uint256 currentBalance = token.balanceOf(address(this));
        require(currentBalance + amount >= currentBalance, "Airdrop: Balance overflow");
        
        bool success = token.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();
        
        emit ContractFunded(msg.sender, amount);
    }

    /**
     * @dev Allows a user to register for the airdrop.
     */
    function register() external whenNotPaused notBlacklisted canRegister {
        userData[msg.sender] = UserData({
            registrationTime: uint64(block.timestamp),
            isRegistered: true,
            hasClaimed: false,
            isBlacklisted: false
        });
        
        registeredUserCount++;
        
        // Add to array and store index for O(1) lookup
        registeredUserIndex[msg.sender] = registeredUsers.length;
        registeredUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, block.timestamp);
    }

    /**
     * @dev Allows a registered user to claim their tokens.
     */
    function claim() external whenNotPaused notBlacklisted canClaim nonReentrant {
        // Check contract has sufficient balance
        uint256 contractBalance = token.balanceOf(address(this));
        if (contractBalance < airdropAmount) revert InsufficientContractBalance();
        
        // Update state before transfer
        userData[msg.sender].hasClaimed = true;
        claimedUserCount++;
        totalTokensClaimed += airdropAmount;
        
        // Add to claimed users array and store index
        claimedUserIndex[msg.sender] = claimedUsers.length;
        claimedUsers.push(msg.sender);
        
        // Transfer tokens
        bool success = token.transfer(msg.sender, airdropAmount);
        if (!success) revert TransferFailed();
        
        emit TokensClaimed(msg.sender, airdropAmount, block.timestamp);
    }

    /**
     * @dev Returns comprehensive airdrop information.
     */
    function getAirdropInfo() external view returns (
        uint256 _registrationEndTime,
        uint256 _claimStartTime,
        uint256 _claimEndTime,
        uint256 _airdropAmount,
        uint256 registeredUsersCount, // Renamed to avoid shadowing
        uint256 claimedUsersCount,    // <-- Renamed from _claimedUsers
        uint256 _totalClaimed,
        uint256 _contractBalance,
        bool _isRegistrationOpen,
        bool _isClaimOpen
    ) {
        return (
            registrationEndTime,
            claimStartTime,
            claimEndTime,
            airdropAmount,
            registeredUserCount,
            claimedUserCount, // <-- Updated to match renamed variable
            totalTokensClaimed,
            token.balanceOf(address(this)),
            block.timestamp < registrationEndTime,
            block.timestamp >= claimStartTime && (claimEndTime == 0 || block.timestamp < claimEndTime)
        );
    }

    /**
     * @dev Returns user-specific information.
     */
    function getUserInfo(address userAddress) external view returns (
        bool _isRegistered,
        bool _hasClaimed,
        uint256 _registrationTime,
        bool _canClaim,
        bool _isBlacklisted
    ) {
        UserData memory data = userData[userAddress];
        bool canClaimNow = data.isRegistered && 
                          !data.hasClaimed && 
                          block.timestamp >= claimStartTime &&
                          (claimEndTime == 0 || block.timestamp < claimEndTime) &&
                          !data.isBlacklisted;
                          
        return (
            data.isRegistered,
            data.hasClaimed,
            uint256(data.registrationTime),
            canClaimNow,
            data.isBlacklisted
        );
    }

    /**
     * @dev Returns time until different phases.
     */
    function getTimeInfo() external view returns (
        uint256 timeUntilRegistrationEnd,
        uint256 timeUntilClaimStart,
        uint256 timeUntilClaimEnd
    ) {
        uint256 currentTime = block.timestamp;
        
        timeUntilRegistrationEnd = currentTime >= registrationEndTime ? 0 : registrationEndTime - currentTime;
        timeUntilClaimStart = currentTime >= claimStartTime ? 0 : claimStartTime - currentTime;
        
        if (claimEndTime > 0) {
            timeUntilClaimEnd = currentTime >= claimEndTime ? 0 : claimEndTime - currentTime;
        } else {
            timeUntilClaimEnd = 0; // Unlimited
        }
        
        return (timeUntilRegistrationEnd, timeUntilClaimStart, timeUntilClaimEnd);
    }

    /**
     * @dev Returns a paginated list of registered users.
     * @param start Starting index.
     * @param count Maximum number of users to return.
     * @return users Array of registered user addresses.
     * @return total Total number of registered users.
     */
    function getRegisteredUsers(uint256 start, uint256 count) 
        external 
        view 
        returns (address[] memory users, uint256 total) 
    {
        total = registeredUsers.length;
        
        if (start >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = start + count;
        if (end > total) {
            end = total;
        }
        
        users = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            users[i - start] = registeredUsers[i];
        }
    }

    /**
     * @dev Returns a paginated list of users who have claimed.
     * @param start Starting index.
     * @param count Maximum number of users to return.
     * @return users Array of claimed user addresses.
     * @return total Total number of users who have claimed.
     */
    function getClaimedUsers(uint256 start, uint256 count) 
        external 
        view 
        returns (address[] memory users, uint256 total) 
    {
        total = claimedUsers.length;
        
        if (start >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = start + count;
        if (end > total) {
            end = total;
        }
        
        users = new address[](end - start);
        for (uint256 i = start; i < end; i++) {
            users[i - start] = claimedUsers[i];
        }
    }

    // Administrative functions

    /**
     * @dev Blacklists a user from participating in the airdrop.
     */
    function blacklistUser(address userAddress) external onlyOwner {
        require(userAddress != address(0), "Airdrop: Cannot blacklist zero address");
        require(!userData[userAddress].isBlacklisted, "User already blacklisted");
        
        userData[userAddress].isBlacklisted = true;
        
        // Add to blacklisted users array and store index
        blacklistedUserIndex[userAddress] = blacklistedUsers.length;
        blacklistedUsers.push(userAddress);
        
        emit UserBlacklisted(userAddress);
    }

    /**
     * @dev Removes a user from the blacklist.
     */
    function unblacklistUser(address userAddress) external onlyOwner {
        require(userData[userAddress].isBlacklisted, "User is not blacklisted");
        
        userData[userAddress].isBlacklisted = false;
        
        // Remove from blacklisted users array
        uint256 index = blacklistedUserIndex[userAddress];
        uint256 lastIndex = blacklistedUsers.length - 1;
        
        if (index != lastIndex) {
            address lastUser = blacklistedUsers[lastIndex];
            blacklistedUsers[index] = lastUser;
            blacklistedUserIndex[lastUser] = index;
        }
        
        blacklistedUsers.pop();
        delete blacklistedUserIndex[userAddress];
        
        emit UserUnblacklisted(userAddress);
    }

    /**
     * @dev Allows the owner to withdraw remaining tokens from the contract.
     */
    function withdrawRemainingTokens() external onlyOwner nonReentrant {
        uint256 remainingBalance = token.balanceOf(address(this));
        if (remainingBalance > 0) {
            bool success = token.transfer(owner(), remainingBalance);
            if (!success) revert TransferFailed();
            emit TokensWithdrawn(owner(), remainingBalance);
        }
    }

    /**
     * @dev Emergency withdrawal function for the owner.
     */
    function emergencyWithdraw(address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "Airdrop: Cannot withdraw to zero address");
        require(amount <= token.balanceOf(address(this)), "Airdrop: Insufficient balance");
        
        bool success = token.transfer(to, amount);
        if (!success) revert TransferFailed();
        
        emit EmergencyWithdrawal(to, amount);
    }

    /**
     * @dev Pauses the contract.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpauses the contract.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Calculates estimated tokens needed for all registered users.
     */
    function getEstimatedTokensNeeded() external view returns (uint256) {
        return registeredUserCount * airdropAmount;
    }

    /**
     * @dev Returns the total number of different user categories.
     */
    function getUserCounts() external view returns (
        uint256 totalRegistered,
        uint256 totalClaimed,
        uint256 totalBlacklisted,
        uint256 pendingClaims
    ) {
        return (
            registeredUsers.length,
            claimedUsers.length,
            blacklistedUsers.length,
            registeredUsers.length - claimedUsers.length
        );
    }

    /**
     * @dev Batch function to get user info for multiple addresses.
     * @param users Array of user addresses to query.
     * @return userInfos Array of user information structs.
     */
    function getBatchUserInfo(address[] calldata users) 
        external 
        view 
        returns (UserData[] memory userInfos) 
    {
        require(users.length <= 100, "Batch size too large");
        userInfos = new UserData[](users.length);
        
        for (uint256 i = 0; i < users.length; i++) {
            userInfos[i] = userData[users[i]];
        }
    }

    /**
     * @dev Batch blacklist multiple users (gas optimized).
     * @param users Array of user addresses to blacklist.
     */
    function batchBlacklistUsers(address[] calldata users) external onlyOwner {
        require(users.length <= 50, "Batch size too large");
        
        for (uint256 i = 0; i < users.length; i++) {
            address user = users[i];
            require(user != address(0), "Cannot blacklist zero address");
            
            if (!userData[user].isBlacklisted) {
                userData[user].isBlacklisted = true;
                blacklistedUserIndex[user] = blacklistedUsers.length;
                blacklistedUsers.push(user);
                emit UserBlacklisted(user);
            }
        }
    }

    /**
     * @dev Returns whether multiple users are registered.
     * @param users Array of user addresses to check.
     * @return registered Array of boolean values indicating registration status.
     */
    function getBatchRegistrationStatus(address[] calldata users) 
        external 
        view 
        returns (bool[] memory registered) 
    {
        require(users.length <= 100, "Batch size too large");
        registered = new bool[](users.length);
        
        for (uint256 i = 0; i < users.length; i++) {
            registered[i] = userData[users[i]].isRegistered;
        }
    }
}

