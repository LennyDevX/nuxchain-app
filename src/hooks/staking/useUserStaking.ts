import { useState, useCallback, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import EnhancedSmartStakingCoreABI from '../../abi/SmartStaking/EnhancedSmartStaking.json';
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json';

// ✅ Add BigInt serialization support for React DevTools
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;
const STAKING_VIEW_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS;

// ✅ Add BigInt serialization support for React DevTools
if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
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
  const coreConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingCoreABI.abi,
  }), []);

  // ✅ View contract config for read-only functions
  const viewConfig = useMemo(() => ({
    address: STAKING_VIEW_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingViewABI.abi,
  }), []);

  // ✅ Get total deposit with optimized cache - using View contract
  const { data: totalDeposit, isLoading: loadingDeposit } = useReadContract({
    ...viewConfig,
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
    ...coreConfig,
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

  // ✅ Get user deposit info (not individual deposits array) - using View contract
  const { data: userDepositInfo, isLoading: loadingDeposits } = useReadContract({
    ...viewConfig,
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
  
  // Extract deposit count from userDepositInfo struct
  const depositCount = useMemo(() => {
    if (!userDepositInfo || typeof userDepositInfo !== 'object') return 0;
    // userDepositInfo is a tuple: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
    const info = userDepositInfo as unknown as [bigint, bigint, bigint, bigint];
    return Number(info[2] || 0n); // depositCount is the 3rd element
  }, [userDepositInfo]);

  // Since we don't have individual deposit details, we'll use depositCount as activePositions
  const activePositions = depositCount;

  // Calculate APY - more accurate calculation
  const calculateAPY = useCallback(() => {
    try {
      const stakedAmount = parseFloat(formatEther(totalStakedBigInt));
      
      // If no stake at all, return 0
      if (stakedAmount === 0) return '0.00';
      
      // Use flexible rate as default (0 days lockup = 43.8% APY)
      // Future: Get actual lockup duration from individual deposits
      const hourlyPercentage = 0.005; // Flexible: 0.005%/hour = ~43.8% APY
      const apy = hourlyPercentage * 24 * 365;
      
      return apy.toFixed(2);
    } catch (err) {
      console.error('Error calculating APY:', err);
      return '0.00';
    }
  }, [totalStakedBigInt]);

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
