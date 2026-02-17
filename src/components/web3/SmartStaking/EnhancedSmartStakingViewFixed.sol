// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.28;

import "../interfaces/IStakingIntegration.sol";

/// @title EnhancedSmartStakingView - FIXED VERSION
/// @notice Robust view functions that handle errors gracefully
/// @dev This version uses try-catch to prevent reverts
contract EnhancedSmartStakingViewFixed {
    
    struct UserRewardsProjection {
        uint256 hourlyRewards;
        uint256 dailyRewards;
        uint256 weeklyRewards;
        uint256 monthlyRewards;
        uint256 yearlyRewards;
        uint256 currentPendingRewards;
    }
    
    interface IStakingCore {
        function getUserInfo(address user) external view returns (uint256, uint256, uint256, uint256);
        function calculateRewards(address user) external view returns (uint256);
        function getUserDeposit(address user, uint256 index) external view returns (uint128, uint64, uint64, uint64);
        function totalPoolBalance() external view returns (uint256);
        function baseAPY() external view returns (uint16);
        function lockupBonuses(uint8 tier) external view returns (uint16);
    }
    
    IStakingCore public stakingContract;
    address public owner;
    
    event StakingContractUpdated(address indexed newAddress);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    constructor(address _stakingContract) {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = IStakingCore(_stakingContract);
        owner = msg.sender;
    }
    
    /// @notice Update staking contract reference
    function setStakingContract(address _stakingContract) external onlyOwner {
        require(_stakingContract != address(0), "Invalid staking contract");
        stakingContract = IStakingCore(_stakingContract);
        emit StakingContractUpdated(_stakingContract);
    }
    
    /// @notice Get user rewards projection with error handling
    /// @param _user User address
    /// @return projection Rewards projection breakdown
    function getUserRewardsProjection(address _user) external view returns (UserRewardsProjection memory projection) {
        // Get current pending rewards (always works)
        projection.currentPendingRewards = _safeCalculateRewards(_user);
        
        // Try to get detailed breakdown
        (uint256 dailyEst, uint256 monthlyEst, uint256 annualEst) = _getEarningsBreakdownSafe(_user);
        
        projection.dailyRewards = dailyEst;
        projection.hourlyRewards = dailyEst / 24;
        projection.weeklyRewards = dailyEst * 7;
        projection.monthlyRewards = monthlyEst;
        projection.yearlyRewards = annualEst;
        
        return projection;
    }
    
    /// @notice Safe version of calculateRewards that never reverts
    function _safeCalculateRewards(address _user) internal view returns (uint256) {
        try stakingContract.calculateRewards(_user) returns (uint256 rewards) {
            return rewards;
        } catch {
            return 0;
        }
    }
    
    /// @notice Robust earnings breakdown that handles errors
    /// @param _user User address
    /// @return dailyEarnings Estimated daily earnings
    /// @return monthlyEarnings Estimated monthly earnings
    /// @return annualEarnings Estimated annual earnings
    function _getEarningsBreakdownSafe(address _user) internal view returns (
        uint256 dailyEarnings,
        uint256 monthlyEarnings,
        uint256 annualEarnings
    ) {
        // Try to get user info
        (uint256 totalDeposited, , uint256 depCount, ) = _safeGetUserInfo(_user);
        
        if (depCount == 0 || totalDeposited == 0) {
            return (0, 0, 0);
        }
        
        // Get current rewards
        uint256 totalRewards = _safeCalculateRewards(_user);
        
        if (totalRewards == 0) {
            // Use APY-based estimation instead
            return _estimateFromAPY(_user, totalDeposited);
        }
        
        // Try to calculate time-based average
        (uint256 totalTimeLapsed, uint256 activeDepositCount) = _safeGetDepositTimes(_user, depCount);
        
        if (activeDepositCount == 0 || totalTimeLapsed == 0) {
            // Fallback to APY-based estimation
            return _estimateFromAPY(_user, totalDeposited);
        }
        
        // Calculate average time per deposit
        uint256 avgTimeLapsed = totalTimeLapsed / activeDepositCount;
        
        if (avgTimeLapsed < 1 hours) {
            // Too recent, use APY-based estimation
            return _estimateFromAPY(_user, totalDeposited);
        }
        
        // Estimate daily earnings based on actual rewards
        dailyEarnings = (totalRewards * 1 days) / avgTimeLapsed;
        monthlyEarnings = dailyEarnings * 30;
        annualEarnings = dailyEarnings * 365;
        
        return (dailyEarnings, monthlyEarnings, annualEarnings);
    }
    
    /// @notice Estimate earnings based on APY when time-based calculation fails
    function _estimateFromAPY(address _user, uint256 totalDeposited) internal view returns (
        uint256 dailyEarnings,
        uint256 monthlyEarnings,
        uint256 annualEarnings
    ) {
        if (totalDeposited == 0) {
            return (0, 0, 0);
        }
        
        // Get base APY (default to 19.7% if call fails)
        uint256 baseAPY = 1970;
        try stakingContract.baseAPY() returns (uint16 apy) {
            baseAPY = uint256(apy);
        } catch {}
        
        // TODO: Add logic to detect locked deposits and add bonus APY
        // For now, use base APY
        
        // Calculate annual earnings: totalDeposited * (APY / 10000)
        annualEarnings = (totalDeposited * baseAPY) / 10000;
        
        // Daily: annual / 365
        dailyEarnings = annualEarnings / 365;
        
        // Monthly: daily * 30
        monthlyEarnings = dailyEarnings * 30;
        
        return (dailyEarnings, monthlyEarnings, annualEarnings);
    }
    
    /// @notice Safely get user info without reverting
    function _safeGetUserInfo(address _user) internal view returns (
        uint256 totalDeposited,
        uint256 totalRewards,
        uint256 depositCount,
        uint256 lastWithdrawTime
    ) {
        try stakingContract.getUserInfo(_user) returns (
            uint256 _totalDeposited,
            uint256 _totalRewards,
            uint256 _depositCount,
            uint256 _lastWithdrawTime
        ) {
            return (_totalDeposited, _totalRewards, _depositCount, _lastWithdrawTime);
        } catch {
            return (0, 0, 0, 0);
        }
    }
    
    /// @notice Safely get deposit times for multiple deposits
    function _safeGetDepositTimes(address _user, uint256 depCount) internal view returns (
        uint256 totalTimeLapsed,
        uint256 activeDepositCount
    ) {
        // Limit to reasonable number to avoid gas issues
        uint256 maxCheck = depCount > 50 ? 50 : depCount;
        
        for (uint256 i = 0; i < maxCheck; i++) {
            try stakingContract.getUserDeposit(_user, i) returns (
                uint128,
                uint64 timestamp,
                uint64,
                uint64
            ) {
                if (uint256(timestamp) < block.timestamp) {
                    totalTimeLapsed += (block.timestamp - uint256(timestamp));
                    activeDepositCount++;
                }
            } catch {
                // Skip failed deposits
                continue;
            }
        }
        
        return (totalTimeLapsed, activeDepositCount);
    }
}
