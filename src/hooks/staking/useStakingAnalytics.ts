import { useMemo } from 'react';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json';

const STAKING_VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Global stats from getGlobalStats() */
export interface GlobalStakingStats {
  totalValueLocked: bigint;
  totalUniqueUsers: bigint;
  contractBalance: bigint;
  availableRewards: bigint;
  healthStatus: number; // 0=Critical, 1=Low, 2=Moderate, 3=Excellent, 4=Exceptional
  timestamp: bigint;
}

/** Staking rates info from getStakingRatesInfo() */
export interface StakingRatesInfo {
  lockupPeriods: readonly [bigint, bigint, bigint, bigint, bigint];
  hourlyROI: readonly [bigint, bigint, bigint, bigint, bigint];
  annualAPY: readonly [bigint, bigint, bigint, bigint, bigint];
  periodNames: readonly [string, string, string, string, string];
}

/** User rewards projection from getUserRewardsProjection() */
export interface UserRewardsProjection {
  hourlyRewards: bigint;
  dailyRewards: bigint;
  weeklyRewards: bigint;
  monthlyRewards: bigint;
  yearlyRewards: bigint;
  currentPendingRewards: bigint;
}

/** User lockup analysis from getUserLockupAnalysis() */
export interface UserLockupAnalysis {
  totalFlexible: bigint;
  totalLocked30: bigint;
  totalLocked90: bigint;
  totalLocked180: bigint;
  totalLocked365: bigint;
  nextUnlockAmount: bigint;
  nextUnlockTime: bigint;
}

/** Withdrawal status from getWithdrawalStatus() */
export interface WithdrawalStatus {
  canWithdraw: boolean;
  withdrawableRewards: bigint;
  lockedUntil: bigint;
  dailyLimitRemaining: bigint;
}

/** Deposit reward rates from getDepositRewardRates() */
export interface DepositRewardRates {
  hourlyRate: bigint;
  dailyRate: bigint;
  monthlyRate: bigint;
  totalAccrued: bigint;
}

/** Staking efficiency from getStakingEfficiency() */
export interface StakingEfficiency {
  efficiency: bigint; // 0-100 percentage
  suggestions: readonly [string, string, string];
}

/** Potential earnings from calculatePotentialEarnings() */
export interface PotentialEarnings {
  projectedEarnings: bigint;
  effectiveAPY: bigint;
}

// ============================================
// FORMATTED DATA INTERFACES
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
  hourlyRaw: bigint;
  dailyRaw: bigint;
  weeklyRaw: bigint;
  monthlyRaw: bigint;
  yearlyRaw: bigint;
}

export interface FormattedLockupAnalysis {
  flexible: string;
  locked30: string;
  locked90: string;
  locked180: string;
  locked365: string;
  totalLocked: string;
  nextUnlockAmount: string;
  nextUnlockTime: Date | null;
  nextUnlockTimeFormatted: string;
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

export interface FormattedRatesInfo {
  periods: { days: number; name: string; hourlyROI: string; annualAPY: string }[];
}

// ============================================
// MAIN HOOK
// ============================================

export function useStakingAnalytics() {
  const { address, chain, isConnected } = useAccount();

  const viewConfig = useMemo(() => ({
    address: STAKING_VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // ============================================
  // CONTRACT READS
  // ============================================

  // ============================================
  // CONTRACT READS (OPTIMIZED MULTICALL)
  // ============================================

  const {
    data: multicallData,
    isLoading: loadingMulticall,
    refetch: refetchMulticall
  } = useReadContracts({
    contracts: [
      {
        ...viewConfig,
        functionName: 'getGlobalStats',
      },
      {
        ...viewConfig,
        functionName: 'getHourlyROIRates',
      },
      {
        ...viewConfig,
        functionName: 'getStakingRatesInfo',
      },
      {
        ...viewConfig,
        functionName: 'getUserRewardsProjection',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getUserLockupAnalysis',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getWithdrawalStatus',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getStakingEfficiency',
        args: [address],
      }
    ],
    query: {
      enabled: !!address && isConnected,
      staleTime: 60000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  });

  // Extract data results
  const globalStatsRaw = multicallData?.[0]?.result;
  const hourlyROIRaw = multicallData?.[1]?.result;
  const stakingRatesRaw = multicallData?.[2]?.result;
  const rewardsProjectionRaw = multicallData?.[3]?.result;
  const lockupAnalysisRaw = multicallData?.[4]?.result;
  const withdrawalStatusRaw = multicallData?.[5]?.result;
  const efficiencyRaw = multicallData?.[6]?.result;

  // Extract individual loading states and refetch functions for compatibility
  // Note: With multicall, they generally load and refetch together
  const loadingGlobalStats = loadingMulticall;
  const loadingROI = loadingMulticall;
  const loadingRates = loadingMulticall;
  const loadingProjection = loadingMulticall;
  const loadingLockup = loadingMulticall;
  const loadingWithdrawal = loadingMulticall;
  const loadingEfficiency = loadingMulticall;

  const refetchGlobalStats = refetchMulticall;
  const refetchProjection = refetchMulticall;
  const refetchLockup = refetchMulticall;
  const refetchWithdrawal = refetchMulticall;
  const refetchEfficiency = refetchMulticall;

  // ============================================
  // FORMATTED DATA
  // ============================================

  const globalStats = useMemo((): FormattedGlobalStats | null => {
    if (!globalStatsRaw) return null;

    const raw = globalStatsRaw as {
      totalValueLocked: bigint;
      totalUniqueUsers: bigint;
      contractBalance: bigint;
      availableRewards: bigint;
      healthStatus: number;
      timestamp: bigint;
    };

    const getHealthInfo = (status: number) => {
      switch (status) {
        case 0: return { label: 'Critical', color: 'text-red-500' };
        case 1: return { label: 'Low', color: 'text-orange-500' };
        case 2: return { label: 'Moderate', color: 'text-yellow-500' };
        case 3: return { label: 'Excellent', color: 'text-emerald-500' };
        case 4: return { label: 'Exceptional', color: 'text-green-400' };
        default: return { label: 'Unknown', color: 'text-gray-500' };
      }
    };

    const healthInfo = getHealthInfo(raw.healthStatus);

    return {
      tvl: formatPOL(raw.totalValueLocked),
      tvlRaw: raw.totalValueLocked,
      uniqueUsers: Number(raw.totalUniqueUsers),
      contractBalance: formatPOL(raw.contractBalance),
      availableRewards: formatPOL(raw.availableRewards),
      healthStatus: raw.healthStatus,
      healthLabel: healthInfo.label,
      healthColor: healthInfo.color,
      timestamp: new Date(Number(raw.timestamp) * 1000),
    };
  }, [globalStatsRaw]);

  const rewardsProjection = useMemo((): FormattedRewardsProjection | null => {
    if (!rewardsProjectionRaw) return null;

    const raw = rewardsProjectionRaw as UserRewardsProjection;

    return {
      hourly: formatPOL(raw.hourlyRewards, 8),
      daily: formatPOL(raw.dailyRewards, 6),
      weekly: formatPOL(raw.weeklyRewards, 4),
      monthly: formatPOL(raw.monthlyRewards, 4),
      yearly: formatPOL(raw.yearlyRewards, 2),
      pending: formatPOL(raw.currentPendingRewards, 6),
      hourlyRaw: raw.hourlyRewards,
      dailyRaw: raw.dailyRewards,
      weeklyRaw: raw.weeklyRewards,
      monthlyRaw: raw.monthlyRewards,
      yearlyRaw: raw.yearlyRewards,
    };
  }, [rewardsProjectionRaw]);

  const lockupAnalysis = useMemo((): FormattedLockupAnalysis | null => {
    if (!lockupAnalysisRaw) return null;

    const raw = lockupAnalysisRaw as UserLockupAnalysis;
    const totalLocked = raw.totalLocked30 + raw.totalLocked90 + raw.totalLocked180 + raw.totalLocked365;
    const nextUnlockDate = raw.nextUnlockTime > 0n ? new Date(Number(raw.nextUnlockTime) * 1000) : null;

    return {
      flexible: formatPOL(raw.totalFlexible),
      locked30: formatPOL(raw.totalLocked30),
      locked90: formatPOL(raw.totalLocked90),
      locked180: formatPOL(raw.totalLocked180),
      locked365: formatPOL(raw.totalLocked365),
      totalLocked: formatPOL(totalLocked),
      nextUnlockAmount: formatPOL(raw.nextUnlockAmount),
      nextUnlockTime: nextUnlockDate,
      nextUnlockTimeFormatted: nextUnlockDate
        ? nextUnlockDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No locked deposits',
    };
  }, [lockupAnalysisRaw]);

  const withdrawalStatus = useMemo((): FormattedWithdrawalStatus | null => {
    if (!withdrawalStatusRaw) return null;

    const raw = withdrawalStatusRaw as readonly [boolean, bigint, bigint, bigint];
    const DAILY_LIMIT = 2000n * 10n ** 18n; // 2000 POL daily limit
    const lockedDate = raw[2] > 0n ? new Date(Number(raw[2]) * 1000) : null;
    const limitUsed = DAILY_LIMIT - raw[3];
    const limitUsedPercent = Number((limitUsed * 100n) / DAILY_LIMIT);

    return {
      canWithdraw: raw[0],
      withdrawableRewards: formatPOL(raw[1]),
      lockedUntilDate: lockedDate,
      lockedUntilFormatted: lockedDate
        ? lockedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'Available now',
      dailyLimitRemaining: formatPOL(raw[3]),
      dailyLimitUsedPercent: Math.min(100, Math.max(0, limitUsedPercent)),
    };
  }, [withdrawalStatusRaw]);

  const stakingEfficiency = useMemo((): FormattedStakingEfficiency | null => {
    if (!efficiencyRaw) return null;

    const raw = efficiencyRaw as readonly [bigint, readonly [string, string, string]];
    const score = Number(raw[0]);

    const getLevel = (s: number): { level: FormattedStakingEfficiency['level']; color: string } => {
      if (s >= 90) return { level: 'Master', color: 'text-yellow-400' };
      if (s >= 70) return { level: 'Excellent', color: 'text-emerald-400' };
      if (s >= 50) return { level: 'Good', color: 'text-blue-400' };
      if (s >= 30) return { level: 'Fair', color: 'text-orange-400' };
      return { level: 'Poor', color: 'text-red-400' };
    };

    const levelInfo = getLevel(score);

    return {
      score,
      level: levelInfo.level,
      suggestions: raw[1].filter(s => s && s.length > 0),
      color: levelInfo.color,
    };
  }, [efficiencyRaw]);

  const stakingRates = useMemo((): FormattedRatesInfo | null => {
    if (!stakingRatesRaw) return null;

    const raw = stakingRatesRaw as StakingRatesInfo;

    return {
      periods: [0, 1, 2, 3, 4].map(i => ({
        days: Number(raw.lockupPeriods[i]),
        name: raw.periodNames[i],
        hourlyROI: (Number(raw.hourlyROI[i]) / 1000).toFixed(4) + '%',
        annualAPY: (Number(raw.annualAPY[i]) / 100).toFixed(2) + '%',
      })),
    };
  }, [stakingRatesRaw]);

  const hourlyROI = useMemo(() => {
    if (!hourlyROIRaw) return null;
    const raw = hourlyROIRaw as readonly [bigint, bigint, bigint, bigint, bigint];
    return raw.map(r => Number(r) / 1000); // Convert basis points to percentage
  }, [hourlyROIRaw]);

  // ============================================
  // CALCULATE POTENTIAL EARNINGS FUNCTION
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

  // ============================================
  // GET DEPOSIT REWARD RATES FUNCTION
  // ============================================

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

  // ============================================
  // REFRESH ALL
  // ============================================

  const refreshAll = async () => {
    await Promise.all([
      refetchGlobalStats(),
      refetchProjection(),
      refetchLockup(),
      refetchWithdrawal(),
      refetchEfficiency(),
    ]);
  };

  return {
    // Formatted data
    globalStats,
    rewardsProjection,
    lockupAnalysis,
    withdrawalStatus,
    stakingEfficiency,
    stakingRates,
    hourlyROI,

    // Loading states
    isLoading: loadingGlobalStats || loadingROI || loadingRates || loadingProjection || loadingLockup || loadingWithdrawal || loadingEfficiency,
    loadingGlobalStats,
    loadingProjection,
    loadingLockup,
    loadingWithdrawal,
    loadingEfficiency,
    loadingRates,

    // Hooks for dynamic data
    useCalculatePotentialEarnings,
    useDepositRewardRates,

    // Refresh functions
    refreshAll,
    refetchGlobalStats,
    refetchProjection,
    refetchLockup,
    refetchWithdrawal,
    refetchEfficiency,
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
