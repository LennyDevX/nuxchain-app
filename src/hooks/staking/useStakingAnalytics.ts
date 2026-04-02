import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import { EnhancedSmartStakingViewABI } from '../../lib/export/abis/legacy';
import { useStakingContext } from '../../context/useStakingContext';

const STAKING_VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface FormattedGlobalStats {
  tvl: string;
  tvlRaw: bigint;
  uniqueUsers: number;
  contractBalance: string;
  availableRewards: string;
  healthStatus: number;
  healthLabel: string;
  healthColor: string;
  timestamp: Date;
}

export interface FormattedRewardsProjection {
  hourly: string;
  daily: string;
  weekly: string;
  monthly: string;
  yearly: string;
  pending: string;
}

export interface FormattedWithdrawalStatus {
  canWithdraw: boolean;
  withdrawableRewards: string;
  lockedUntilDate: Date | null;
  lockedUntilFormatted: string;
  dailyLimitRemaining: string;
  dailyLimitUsedPercent: number;
}

export interface FormattedStakingEfficiency {
  score: number;
  level: 'Poor' | 'Fair' | 'Good' | 'Excellent' | 'Master';
  suggestions: string[];
  color: string;
}

// ============================================
// MAIN HOOK (REFACTORED TO USE CONTEXT)
// ============================================

export function useStakingAnalytics() {
  const { address, isConnected } = useAccount();
  const context = useStakingContext();

  // Common config for dynamic hooks
  const viewConfig = useMemo(() => ({
    address: STAKING_VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
  }), []);

  // 1. Process Global Stats from Context
  const globalStats = useMemo((): FormattedGlobalStats | null => {
    const { pool, protocolHealth } = context;
    if (!pool) return null;

    return {
      tvl: formatPOL(pool.totalPoolBalance),
      tvlRaw: pool.totalPoolBalance,
      uniqueUsers: Number(pool.uniqueUsersCount),
      contractBalance: formatPOL(pool.totalPoolBalance), // Simplified or use secondary source
      availableRewards: 'N/A', // Add if needed in context
      healthStatus: protocolHealth.status,
      healthLabel: protocolHealth.statusLabel,
      healthColor: protocolHealth.statusColor,
      timestamp: new Date(),
    };
  }, [context]);

  // 2. Process Rewards Projection from Context
  const rewardsProjection = useMemo((): FormattedRewardsProjection | null => {
    const { analytics, user } = context;
    
    console.log('[useStakingAnalytics] Context data:', {
      hasAnalytics: !!analytics,
      hasRewardsProjection: !!analytics.rewardsProjection,
      dailyValue: analytics.rewardsProjection?.daily?.toString(),
      dailyFormatted: formatPOL(analytics.rewardsProjection?.daily || 0n, 6)
    });
    
    if (!analytics.rewardsProjection) return null;

    const result = {
      hourly: formatPOL(analytics.rewardsProjection.hourly, 8),
      daily: formatPOL(analytics.rewardsProjection.daily, 6),
      weekly: formatPOL(analytics.rewardsProjection.weekly, 4),
      monthly: formatPOL(analytics.rewardsProjection.monthly, 4),
      yearly: formatPOL(analytics.rewardsProjection.yearly, 2),
      pending: formatPOL(user.pendingRewards, 6),
    };
    
    console.log('[useStakingAnalytics] Final result:', result);
    return result;
  }, [context]);

  // 4. Process Withdrawal Status from Context
  const withdrawalStatus = useMemo((): FormattedWithdrawalStatus | null => {
    const { analytics } = context;
    const { withdrawalStatus: ws } = analytics;

    const DAILY_LIMIT = 2000n * 10n ** 18n; // 2000 POL standard
    const lockedDate = ws.lockedUntil > 0n ? new Date(Number(ws.lockedUntil) * 1000) : null;
    const limitUsedPercent = Number(((DAILY_LIMIT - ws.dailyLimitRemaining) * 100n) / DAILY_LIMIT);

    return {
      canWithdraw: ws.canWithdraw,
      withdrawableRewards: formatPOL(ws.withdrawableRewards),
      lockedUntilDate: lockedDate,
      lockedUntilFormatted: lockedDate
        ? lockedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Available now',
      dailyLimitRemaining: formatPOL(ws.dailyLimitRemaining),
      dailyLimitUsedPercent: Math.min(100, Math.max(0, limitUsedPercent)),
    };
  }, [context]);

  // ============================================
  // DYNAMIC HOOKS (Stay as ReadContracts if they need on-demand data)
  // ============================================

  const useCalculatePotentialEarnings = (amount: bigint, lockupPeriodIndex: number, daysToProject: number) => {
    const { data, isLoading } = useReadContract({
      ...viewConfig,
      functionName: 'calculatePotentialEarnings',
      args: [amount, lockupPeriodIndex, BigInt(daysToProject)],
      query: {
        enabled: amount > 0n,
        staleTime: 60000,
      }
    });

    return useMemo(() => {
      if (!data) return null;
      const raw = data as readonly [bigint, bigint];
      return {
        projectedEarnings: formatPOL(raw[0]),
        projectedEarningsRaw: raw[0],
        effectiveAPY: (Number(raw[1]) / 100).toFixed(2) + '%',
        isLoading,
      };
    }, [data, isLoading]);
  };

  const useDepositRewardRates = (depositIndex: number) => {
    const { data, isLoading } = useReadContract({
      ...viewConfig,
      functionName: 'getDepositRewardRates',
      args: [address, BigInt(depositIndex)],
      query: {
        enabled: !!address && isConnected && depositIndex >= 0,
        staleTime: 30000,
      }
    });

    return useMemo(() => {
      if (!data) return null;
      const raw = data as readonly [bigint, bigint, bigint, bigint];
      return {
        hourlyRate: formatPOL(raw[0], 10),
        dailyRate: formatPOL(raw[1], 8),
        monthlyRate: formatPOL(raw[2], 6),
        totalAccrued: formatPOL(raw[3], 6),
        isLoading,
      };
    }, [data, isLoading]);
  };

  return {
    // Formatted data from context
    globalStats,
    rewardsProjection,
    withdrawalStatus,
    
    // Loading states from context
    isLoading: context.isLoading || context.isUserLoading,
    loadingEfficiency: context.isUserLoading,
    loadingProjection: context.isUserLoading,
    loadingWithdrawal: context.isUserLoading,
    loadingGlobalStats: context.isPoolLoading,

    // Hooks for dynamic data
    useCalculatePotentialEarnings,
    useDepositRewardRates,

    // Refresh functions
    refreshAll: context.refetchAll,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatPOL(value: bigint, decimals = 4): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

export default useStakingAnalytics;
