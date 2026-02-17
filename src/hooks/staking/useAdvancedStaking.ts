import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingCoreABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import { useUserDeposits } from './useUserDeposits';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;

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

  // ✅ FIX: Use Core Contract instead of View Contract (which is reverting)
  const { 
    deposits: userDeposits, 
    isLoading: loadingDeposits,
    refetch: refetchDeposits 
  } = useUserDeposits();

  // Get user info from Core Contract
  const { data: userInfoData, isLoading: loadingUserInfo, refetch: refetchUserInfo } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingCoreABI.abi as Abi,
    functionName: 'getUserInfo',
    args: [address],
    chainId: chain?.id,
    query: {
      enabled: !!address && isConnected,
      staleTime: 45000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  }) as { data: readonly [bigint?, bigint?, bigint?, bigint?] | undefined; isLoading: boolean; refetch: () => Promise<unknown> };

  // Get contract balance from Core Contract
  const { data: contractBalanceData, isLoading: loadingBalance, refetch: refetchBalance } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingCoreABI.abi as Abi,
    functionName: 'getContractBalance',
    chainId: chain?.id,
    query: {
      enabled: true,
      staleTime: 45000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    }
  }) as { data: bigint | undefined; isLoading: boolean; refetch: () => Promise<unknown> };

  const isLoading = loadingDeposits || loadingUserInfo || loadingBalance;

  const result = useMemo((): AdvancedStakingData => {
    // Extract from getUserInfo: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
    const totalDeposited = userInfoData?.[0] || 0n;
    const totalRewards = userInfoData?.[1] || 0n;
    const depositCount = Number(userInfoData?.[2] || 0n);
    const lastWithdrawTime = userInfoData?.[3] || 0n;

    const contractBalance = contractBalanceData || 0n;

    // ============================================
    // DASHBOARD DATA
    // ============================================
    const dashboard: DashboardData | null = (totalDeposited > 0n || contractBalance > 0n) ? (() => {
      // Calculate pool health status based on reserve ratio
      const poolTotalValue = contractBalance; // Conservative: use contract balance as total
      const healthStatus = contractBalance >= totalDeposited ? 3 : contractBalance >= (totalDeposited * 75n / 100n) ? 2 : 1;
      const healthInfo = getHealthInfo(healthStatus);

      // Separate flexible vs locked (from userDeposits)
      const flexibleAmount = (userDeposits || [])
        .filter(d => d.isActive && !d.isLocked)
        .reduce((acc, d) => acc + d.amount, 0n);
      const lockedAmount = (userDeposits || [])
        .filter(d => d.isActive && d.isLocked)
        .reduce((acc, d) => acc + d.amount, 0n);

      return {
        poolTotalValue: formatPOL(poolTotalValue),
        poolTotalValueRaw: poolTotalValue,
        poolActiveUsers: 0, // Cannot determine without View Contract
        poolContractBalance: formatPOL(contractBalance),
        poolHealthStatus: healthStatus,
        poolHealthLabel: healthInfo.label,
        poolHealthColor: healthInfo.color,
        userStaked: formatPOL(totalDeposited),
        userStakedRaw: totalDeposited,
        userRewards: formatPOL(totalRewards, 6),
        userDeposits: depositCount,
        userFlexible: formatPOL(flexibleAmount),
        userLocked: formatPOL(lockedAmount),
      };
    })() : null;

    // ============================================
    // USER DETAILED STATS
    // ============================================
    const userStats: UserDetailedStats | null = totalDeposited > 0n ? {
      totalDeposited: formatPOL(totalDeposited),
      totalDepositedRaw: totalDeposited,
      totalRewards: formatPOL(totalRewards, 6),
      boostedRewards: formatPOL(totalRewards, 6), // Cannot calculate boost without View Contract
      boostedRewardsWithRarity: formatPOL(totalRewards, 6),
      depositCount,
      lastWithdrawTime: lastWithdrawTime > 0n ? new Date(Number(lastWithdrawTime) * 1000) : null,
      userLevel: 0, // Cannot determine without View Contract
      userXP: '0',
      maxActiveSkills: 0,
      activeSkillsCount: 0,
      stakingBoostTotal: 0,
      feeDiscountTotal: 0,
      hasAutoCompound: false,
    } : null;

    // ============================================
    // EARNINGS BREAKDOWN
    // ============================================
    const earnings: EarningsBreakdown | null = totalDeposited > 0n ? (() => {
      // Estimate earnings based on 5% APY
      const BASE_APY = 0.05;
      const dailyRate = BASE_APY / 365;
      const monthlyRate = BASE_APY / 12;
      const annualRate = BASE_APY;

      const dailyEarningsRaw = BigInt(Math.floor(Number(totalDeposited) * dailyRate));
      const monthlyEarningsRaw = BigInt(Math.floor(Number(totalDeposited) * monthlyRate));
      const annualEarningsRaw = BigInt(Math.floor(Number(totalDeposited) * annualRate));

      return {
        dailyEarnings: formatPOL(dailyEarningsRaw, 6),
        dailyEarningsRaw,
        monthlyEarnings: formatPOL(monthlyEarningsRaw, 4),
        monthlyEarningsRaw,
        annualEarnings: formatPOL(annualEarningsRaw, 2),
        annualEarningsRaw,
      };
    })() : null;

    // ============================================
    // WITHDRAWABLE INFO
    // ============================================
    const withdrawable: WithdrawableInfo | null = (userDeposits || []).length > 0 ? (() => {
      const withdrawableDeposits = (userDeposits || []).filter(d => d.isActive && !d.isLocked);
      const withdrawableAmount = withdrawableDeposits.reduce((acc, d) => acc + d.amount, 0n);

      return {
        withdrawableIndices: withdrawableDeposits.map(d => d.index),
        withdrawableAmount: formatPOL(withdrawableAmount),
        withdrawableAmountRaw: withdrawableAmount,
        totalDeposits: depositCount,
        withdrawableCount: withdrawableDeposits.length,
      };
    })() : null;

    // ============================================
    // NEXT UNLOCK INFO
    // ============================================
    const nextUnlock: NextUnlockInfo | null = (userDeposits || []).length > 0 ? (() => {
      const lockedDeposits = (userDeposits || []).filter(d => d.isActive && d.isLocked);
      
      if (lockedDeposits.length === 0) {
        return {
          secondsUntilUnlock: 0,
          nextUnlockTime: null,
          formattedCountdown: 'No locked deposits',
          hasLockedDeposits: false,
        };
      }

      // Find earliest unlock time
      const nowSeconds = BigInt(Math.floor(Date.now() / 1000));
      const nextUnlockTimeSeconds = lockedDeposits.length > 0 ? lockedDeposits.reduce((min, d) => {
        const unlockSeconds = d.unlockTime;
        return unlockSeconds < min ? unlockSeconds : min;
      }, lockedDeposits[0]?.unlockTime || 0n) : 0n;

      const secondsUntilUnlock = Number(nextUnlockTimeSeconds - nowSeconds);

      return {
        secondsUntilUnlock: Math.max(0, secondsUntilUnlock),
        nextUnlockTime: new Date(Number(nextUnlockTimeSeconds) * 1000),
        formattedCountdown: formatCountdown(secondsUntilUnlock),
        hasLockedDeposits: true,
      };
    })() : null;

    // ============================================
    // PORTFOLIO SUMMARY
    // ============================================
    const portfolio: PortfolioSummary | null = totalDeposited > 0n ? {
      totalDeposited: formatPOL(totalDeposited),
      pendingRewards: formatPOL(totalRewards, 6),
      totalValue: formatPOL(totalDeposited + totalRewards),
      totalValueRaw: totalDeposited + totalRewards,
      depositCount,
      rewardEfficiency: totalDeposited > 0n ? Number((totalRewards * 10000n) / totalDeposited) : 0, // basis points
    } : null;

    const refetchAll = async () => { 
      await Promise.all([refetchDeposits(), refetchUserInfo(), refetchBalance()]); 
    };

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
  }, [userInfoData, contractBalanceData, userDeposits, isLoading, refetchDeposits, refetchUserInfo, refetchBalance]);

  return result;
}

// ============================================
// DEPOSIT DETAILS HOOK (per-deposit deep dive)
// ============================================
// NOTE: This hook requires View Contract which is currently reverting
// Use useUserDeposits instead for basic deposit information

/*
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
*/

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
