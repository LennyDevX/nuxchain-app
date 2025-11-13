import { useState, useCallback, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import EnhancedSmartStakingABI from '../../abi/EnhancedSmartStaking.json';

// ✅ Add BigInt serialization support for React DevTools
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;

// ✅ Add BigInt serialization support for React DevTools
if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}

interface DepositData {
  amount: bigint;
  timestamp: bigint;
  lastClaimTime: bigint;
  lockupDuration: bigint;
}

interface UserStakingData {
  totalStaked: string;
  totalStakedBigInt: bigint;
  pendingRewards: string;
  pendingRewardsBigInt: bigint;
  apy: string;
  activePositions: number;
  isLoading: boolean;
  error: string | null;
}

export function useUserStaking(): UserStakingData {
  const { address, isConnected } = useAccount();
  const [error] = useState<string | null>(null);

  // ✅ Memoize contract config
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
  }), []);

  // ✅ Get total deposit with optimized cache
  const { data: totalDeposit, isLoading: loadingDeposit } = useReadContract({
    ...contractConfig,
    functionName: 'getTotalDeposit',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false, // ✅ Disable auto-refetch
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  });

  // ✅ Get pending rewards with faster update (financial data)
  const { data: pendingRewards, isLoading: loadingRewards } = useReadContract({
    ...contractConfig,
    functionName: 'calculateRewards',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 30000, // 30 seconds for rewards
      gcTime: 3 * 60 * 1000, // 3 minutes cache
      refetchInterval: false, // ✅ Disable auto-refetch
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  });

  // ✅ Get user deposits to count active positions
  const { data: userDeposits, isLoading: loadingDeposits } = useReadContract({
    ...contractConfig,
    functionName: 'getUserDeposits',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false, // ✅ Disable auto-refetch
      refetchOnWindowFocus: true,
      refetchOnMount: false,
    }
  });

  const totalStakedBigInt = (totalDeposit as bigint) || 0n;
  const pendingRewardsBigInt = (pendingRewards as bigint) || 0n;
  
  const deposits = useMemo(() => {
    return (userDeposits as DepositData[]) || [];
  }, [userDeposits]);

  // Count active positions (deposits with amount > 0)
  const activePositions = deposits.filter((deposit: DepositData) => 
    deposit && deposit.amount && BigInt(deposit.amount) > 0n
  ).length;

  // Calculate APY - more accurate calculation
  const calculateAPY = useCallback(() => {
    try {
      const stakedAmount = parseFloat(formatEther(totalStakedBigInt));
      const rewardsAmount = parseFloat(formatEther(pendingRewardsBigInt));
      
      if (stakedAmount === 0 || rewardsAmount === 0) return '0.00';
      
      // Get the lock duration from deposits to estimate APY
      if (deposits.length > 0) {
        const lastDeposit = deposits[0];
        const lockupDays = Number(lastDeposit.lockupDuration) / (24 * 60 * 60);
        
        // Different rates based on lockup period (hourly percentage)
        const rates: { [key: number]: number } = {
          0: 0.005,   // Flexible: 0.005%/hour = ~43.8% APY
          30: 0.010,  // 30 days: 0.010%/hour = ~87.6% APY
          90: 0.014,  // 90 days: 0.014%/hour = ~122.64% APY
          180: 0.017, // 180 days: 0.017%/hour = ~149.28% APY
          365: 0.025  // 365 days: 0.025%/hour = ~219% APY
        };
        
        const hourlyPercentage = rates[lockupDays] || 0.005;
        const apy = hourlyPercentage * 24 * 365;
        
        return apy.toFixed(2);
      }
      
      // Fallback: calculate from actual rewards
      const dailyRate = (rewardsAmount / stakedAmount);
      const apy = dailyRate * 365 * 100;
      
      return apy.toFixed(2);
    } catch {
      return '0.00';
    }
  }, [totalStakedBigInt, pendingRewardsBigInt, deposits]);

  return {
    totalStaked: formatEther(totalStakedBigInt),
    totalStakedBigInt,
    pendingRewards: formatEther(pendingRewardsBigInt),
    pendingRewardsBigInt,
    apy: calculateAPY(),
    activePositions,
    isLoading: loadingDeposit || loadingRewards || loadingDeposits,
    error
  };
}
