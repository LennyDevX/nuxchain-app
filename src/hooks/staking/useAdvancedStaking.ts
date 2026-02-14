import { useMemo } from 'react';
import { useAccount, useReadContracts, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json';

const STAKING_VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface AdvancedStakingData {
  /** Complete dashboard data in one call */
  dashboard: DashboardData | null;
  /** Detailed user stats with skills */
  userStats: UserDetailedStats | null;
  /** Earnings breakdown (daily/monthly/annual) */
  earnings: EarningsBreakdown | null;
  /** Withdrawable deposits info */
  withdrawable: WithdrawableInfo | null;
  /** Next unlock countdown */
  nextUnlock: NextUnlockInfo | null;
  /** Portfolio summary */
  portfolio: PortfolioSummary | null;
  /** Loading */
  isLoading: boolean;
  /** Refetch all */
  refetchAll: () => Promise<void>;
}

export interface DashboardData {
  poolTotalValue: string;
  poolTotalValueRaw: bigint;
  poolActiveUsers: number;
  poolContractBalance: string;
  poolHealthStatus: number;
  poolHealthLabel: string;
  poolHealthColor: string;
  userStaked: string;
  userStakedRaw: bigint;
  userRewards: string;
  userDeposits: number;
  userFlexible: string;
  userLocked: string;
}

export interface UserDetailedStats {
  totalDeposited: string;
  totalDepositedRaw: bigint;
  totalRewards: string;
  boostedRewards: string;
  boostedRewardsWithRarity: string;
  depositCount: number;
  lastWithdrawTime: Date | null;
  userLevel: number;
  userXP: string;
  maxActiveSkills: number;
  activeSkillsCount: number;
  stakingBoostTotal: number;    // basis points
  feeDiscountTotal: number;     // basis points
  hasAutoCompound: boolean;
}

export interface EarningsBreakdown {
  dailyEarnings: string;
  dailyEarningsRaw: bigint;
  monthlyEarnings: string;
  monthlyEarningsRaw: bigint;
  annualEarnings: string;
  annualEarningsRaw: bigint;
}

export interface WithdrawableInfo {
  withdrawableIndices: number[];
  withdrawableAmount: string;
  withdrawableAmountRaw: bigint;
  totalDeposits: number;
  withdrawableCount: number;
}

export interface NextUnlockInfo {
  secondsUntilUnlock: number;
  nextUnlockTime: Date | null;
  formattedCountdown: string;
  hasLockedDeposits: boolean;
}

export interface PortfolioSummary {
  totalDeposited: string;
  pendingRewards: string;
  totalValue: string;
  totalValueRaw: bigint;
  depositCount: number;
  rewardEfficiency: number; // percentage
}

// ============================================
// MAIN HOOK
// ============================================

export function useAdvancedStaking(): AdvancedStakingData {
  const { address, chain, isConnected } = useAccount();

  const viewConfig = useMemo(() => ({
    address: STAKING_VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // Multicall: Fetch all advanced analytics in one batch
  const { data: multicallData, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        ...viewConfig,
        functionName: 'getDashboardData',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getUserDetailedStats',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getEarningsBreakdown',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getWithdrawableDeposits',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getNextUnlockTime',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getPortfolioSummary',
        args: [address],
      },
    ],
    query: {
      enabled: !!address && isConnected,
      staleTime: 45000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  const result = useMemo((): AdvancedStakingData => {
    // Parse getDashboardData
    const dashRaw = multicallData?.[0]?.result as readonly [bigint, bigint, bigint, number, bigint, bigint, bigint, bigint, bigint] | undefined;
    const dashboard: DashboardData | null = dashRaw ? (() => {
      const healthStatus = Number(dashRaw[3]);
      const healthInfo = getHealthInfo(healthStatus);
      return {
        poolTotalValue: formatPOL(dashRaw[0]),
        poolTotalValueRaw: dashRaw[0],
        poolActiveUsers: Number(dashRaw[1]),
        poolContractBalance: formatPOL(dashRaw[2]),
        poolHealthStatus: healthStatus,
        poolHealthLabel: healthInfo.label,
        poolHealthColor: healthInfo.color,
        userStaked: formatPOL(dashRaw[4]),
        userStakedRaw: dashRaw[4],
        userRewards: formatPOL(dashRaw[5], 6),
        userDeposits: Number(dashRaw[6]),
        userFlexible: formatPOL(dashRaw[7]),
        userLocked: formatPOL(dashRaw[8]),
      };
    })() : null;

    // Parse getUserDetailedStats
    const statsRaw = multicallData?.[1]?.result;
    const userStats: UserDetailedStats | null = statsRaw ? (() => {
      const s = statsRaw as {
        totalDeposited: bigint;
        totalRewards: bigint;
        boostedRewards: bigint;
        boostedRewardsWithRarity: bigint;
        depositCount: bigint;
        lastWithdrawTime: bigint;
        userLevel: number;
        userXP: bigint;
        maxActiveSkills: number;
        activeSkillsCount: number;
        stakingBoostTotal: number;
        feeDiscountTotal: number;
        hasAutoCompound: boolean;
      };
      return {
        totalDeposited: formatPOL(s.totalDeposited),
        totalDepositedRaw: s.totalDeposited,
        totalRewards: formatPOL(s.totalRewards, 6),
        boostedRewards: formatPOL(s.boostedRewards, 6),
        boostedRewardsWithRarity: formatPOL(s.boostedRewardsWithRarity, 6),
        depositCount: Number(s.depositCount),
        lastWithdrawTime: s.lastWithdrawTime > 0n ? new Date(Number(s.lastWithdrawTime) * 1000) : null,
        userLevel: Number(s.userLevel),
        userXP: s.userXP.toString(),
        maxActiveSkills: Number(s.maxActiveSkills),
        activeSkillsCount: Number(s.activeSkillsCount),
        stakingBoostTotal: Number(s.stakingBoostTotal),
        feeDiscountTotal: Number(s.feeDiscountTotal),
        hasAutoCompound: s.hasAutoCompound,
      };
    })() : null;

    // Parse getEarningsBreakdown
    const earningsRaw = multicallData?.[2]?.result as readonly [bigint, bigint, bigint] | undefined;
    const earnings: EarningsBreakdown | null = earningsRaw ? {
      dailyEarnings: formatPOL(earningsRaw[0], 6),
      dailyEarningsRaw: earningsRaw[0],
      monthlyEarnings: formatPOL(earningsRaw[1], 4),
      monthlyEarningsRaw: earningsRaw[1],
      annualEarnings: formatPOL(earningsRaw[2], 2),
      annualEarningsRaw: earningsRaw[2],
    } : null;

    // Parse getWithdrawableDeposits
    const withdrawRaw = multicallData?.[3]?.result as readonly [readonly bigint[], bigint] | undefined;
    const withdrawable: WithdrawableInfo | null = withdrawRaw ? {
      withdrawableIndices: withdrawRaw[0].map(Number),
      withdrawableAmount: formatPOL(withdrawRaw[1]),
      withdrawableAmountRaw: withdrawRaw[1],
      totalDeposits: dashboard?.userDeposits || 0,
      withdrawableCount: withdrawRaw[0].length,
    } : null;

    // Parse getNextUnlockTime
    const unlockRaw = multicallData?.[4]?.result as readonly [bigint, bigint] | undefined;
    const nextUnlock: NextUnlockInfo | null = unlockRaw ? (() => {
      const seconds = Number(unlockRaw[0]);
      const unlockTime = unlockRaw[1] > 0n ? new Date(Number(unlockRaw[1]) * 1000) : null;
      return {
        secondsUntilUnlock: seconds,
        nextUnlockTime: unlockTime,
        formattedCountdown: formatCountdown(seconds),
        hasLockedDeposits: seconds > 0,
      };
    })() : null;

    // Parse getPortfolioSummary
    const portfolioRaw = multicallData?.[5]?.result;
    const portfolio: PortfolioSummary | null = portfolioRaw ? (() => {
      const p = portfolioRaw as {
        totalDeposited: bigint;
        pendingRewards: bigint;
        totalValue: bigint;
        depositCount: bigint;
        rewardEfficiency: bigint;
      };
      return {
        totalDeposited: formatPOL(p.totalDeposited),
        pendingRewards: formatPOL(p.pendingRewards, 6),
        totalValue: formatPOL(p.totalValue),
        totalValueRaw: p.totalValue,
        depositCount: Number(p.depositCount),
        rewardEfficiency: Number(p.rewardEfficiency),
      };
    })() : null;

    const refetchAll = async () => { await refetch(); };

    return {
      dashboard,
      userStats,
      earnings,
      withdrawable,
      nextUnlock,
      portfolio,
      isLoading,
      refetchAll,
    };
  }, [multicallData, isLoading, refetch]);

  return result;
}

// ============================================
// DEPOSIT DETAILS HOOK (per-deposit deep dive)
// ============================================

export function useDepositDetails(depositIndex: number) {
  const { address, chain, isConnected } = useAccount();

  const { data, isLoading } = useReadContract({
    address: STAKING_VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
    functionName: 'getDepositDetails',
    args: [address, BigInt(depositIndex)],
    chainId: chain?.id,
    query: {
      enabled: !!address && isConnected && depositIndex >= 0,
      staleTime: 30000,
    },
  });

  return useMemo(() => {
    if (!data) return { deposit: null, isLoading };
    
    const d = data as {
      depositIndex: bigint;
      amount: bigint;
      currentRewards: bigint;
      timestamp: bigint;
      lastClaimTime: bigint;
      lockupDuration: bigint;
      unlockTime: bigint;
      lockupType: string;
      isLocked: boolean;
      isWithdrawable: boolean;
    };

    return {
      deposit: {
        index: Number(d.depositIndex),
        amount: formatPOL(d.amount),
        amountRaw: d.amount,
        currentRewards: formatPOL(d.currentRewards, 8),
        timestamp: new Date(Number(d.timestamp) * 1000),
        lastClaimTime: new Date(Number(d.lastClaimTime) * 1000),
        lockupDuration: Number(d.lockupDuration),
        unlockTime: d.unlockTime > 0n ? new Date(Number(d.unlockTime) * 1000) : null,
        lockupType: d.lockupType,
        isLocked: d.isLocked,
        isWithdrawable: d.isWithdrawable,
      },
      isLoading,
    };
  }, [data, isLoading]);
}

// ============================================
// HELPERS
// ============================================

function formatPOL(value: bigint, decimals = 4): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function getHealthInfo(status: number) {
  switch (status) {
    case 0: return { label: 'Critical', color: 'text-red-500' };
    case 1: return { label: 'Low', color: 'text-orange-500' };
    case 2: return { label: 'Moderate', color: 'text-yellow-500' };
    case 3: return { label: 'Excellent', color: 'text-emerald-500' };
    case 4: return { label: 'Exceptional', color: 'text-green-400' };
    default: return { label: 'Unknown', color: 'text-gray-500' };
  }
}

function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return 'Unlocked';
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default useAdvancedStaking;
