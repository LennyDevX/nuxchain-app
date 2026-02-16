/**
 * useDepositManagement - Hook for individual deposit management
 * Fetches deposit details by type, individual deposit info, and handles per-deposit withdrawals
 * 
 * UPDATED: Now uses Core Contract functions instead of View Contract (which is reverting)
 * Delegates to useUserDeposits for deposit fetching and calculates derived data in frontend
 */

import { useMemo, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingABI from '../../abi/SmartStaking/EnhancedSmartStakingCoreV2.json';
import { useUserDeposits } from './useUserDeposits';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface DepositDetail {
  index: number;
  amount: string;
  amountRaw: bigint;
  currentRewards: string;
  currentRewardsRaw: bigint;
  depositDate: Date;
  lastClaimDate: Date;
  lockupDays: number;
  lockupType: string;
  unlockDate: Date | null;
  isLocked: boolean;
  isWithdrawable: boolean;
  daysRemaining: number;
  progressPercent: number; // 0-100 lockup progress
}

export interface DepositsByType {
  flexible: { count: number; totalAmount: string; totalAmountRaw: bigint };
  locked30: { count: number; totalAmount: string; totalAmountRaw: bigint };
  locked90: { count: number; totalAmount: string; totalAmountRaw: bigint };
  locked180: { count: number; totalAmount: string; totalAmountRaw: bigint };
  locked365: { count: number; totalAmount: string; totalAmountRaw: bigint };
}

export interface WithdrawalStatusInfo {
  canWithdraw: boolean;
  withdrawableRewards: string;
  withdrawableRewardsRaw: bigint;
  dailyLimitRemaining: string;
  dailyLimitRemainingRaw: bigint;
  dailyLimitUsedPercent: number;
}

export interface EstimatedRewardsInfo {
  baseEstimate: string;
  boostedEstimate: string;
  baseEstimateRaw: bigint;
  boostedEstimateRaw: bigint;
  boostDifference: string;
}

export interface DepositManagementReturn {
  // Read data
  deposits: DepositDetail[];
  depositsByType: DepositsByType | null;
  withdrawalStatus: WithdrawalStatusInfo | null;
  estimatedRewards: EstimatedRewardsInfo | null;
  totalDeposits: number;
  withdrawableCount: number;
  lockedCount: number;

  // Write functions
  withdrawDeposit: (depositIndex: number) => void;
  withdrawBoosted: (depositIndex: number) => void;

  // Transaction state
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  txHash: `0x${string}` | undefined;

  // Loading
  isLoading: boolean;
  refetch: () => Promise<void>;
}

// ============================================
// MAIN HOOK
// ============================================

export function useDepositManagement(): DepositManagementReturn {
  const { address, chain, isConnected } = useAccount();

  // ✅ FIX: Use Core Contract via useUserDeposits instead of View Contract (which is reverting)
  const { 
    deposits: userDeposits, 
    isLoading: loadingDeposits,
    refetch: refetchDeposits 
  } = useUserDeposits();

  // Get user info from Core Contract for rewards calculation
  const { data: userInfoData, isLoading: loadingUserInfo, refetch: refetchUserInfo } = useReadContract({
    address: STAKING_CONTRACT_ADDRESS,
    abi: EnhancedSmartStakingABI.abi as Abi,
    functionName: 'getUserInfo',
    args: [address],
    chainId: chain?.id,
    query: {
      enabled: !!address && isConnected,
      staleTime: 30000,
      gcTime: 5 * 60 * 1000,
    }
  }) as { data: readonly [bigint?, bigint?, bigint?, bigint?] | undefined; isLoading: boolean; refetch: () => Promise<unknown> };

  // Write contract setup
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const isLoading = loadingDeposits || loadingUserInfo;

  // Extract total rewards from getUserInfo: [totalDeposited, totalRewards, depositCount, lastWithdrawTime]
  const totalRewards = userInfoData?.[1] || 0n;
  const totalDeposited = userInfoData?.[0] || 0n;

  // Parse individual deposits from useUserDeposits (Core Contract)
  const deposits = useMemo((): DepositDetail[] => {
    if (!userDeposits || userDeposits.length === 0) {
      if (import.meta.env.DEV) {
        console.log('[useDepositManagement] No deposits found from useUserDeposits');
      }
      return [];
    }

    const now = Date.now();

    // Distribute total rewards proportionally across deposits based on amount
    const totalDepositedBigInt = userDeposits.reduce((acc, d) => acc + d.amount, 0n);
    
    return userDeposits
      .filter(d => d.isActive && d.amount > 0n) // Only active deposits
      .map((d) => {
        const lockupSeconds = Number(d.lockupDuration);
        const lockupDays = Math.round(lockupSeconds / 86400);
        const depositTime = Number(d.depositTime) * 1000;
        const unlockTime = Number(d.unlockTime) * 1000;

        // Calculate proportional rewards for this deposit
        const depositProportion = totalDepositedBigInt > 0n 
          ? Number(d.amount) / Number(totalDepositedBigInt) 
          : 0;
        const depositRewards = BigInt(Math.floor(Number(totalRewards) * depositProportion));

        // Calculate progress
        let progressPercent = 100;
        if (lockupSeconds > 0 && depositTime > 0 && unlockTime > now) {
          const elapsed = now - depositTime;
          const total = unlockTime - depositTime;
          progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
        } else if (lockupSeconds > 0 && unlockTime <= now) {
          progressPercent = 100; // Completed
        }

        const daysRemaining = unlockTime > now
          ? Math.ceil((unlockTime - now) / 86400000)
          : 0;

        const isWithdrawable = !d.isLocked && d.isActive;

        return {
          index: d.index,
          amount: formatPOL(d.amount),
          amountRaw: d.amount,
          currentRewards: formatPOL(depositRewards, 8),
          currentRewardsRaw: depositRewards,
          depositDate: new Date(depositTime),
          lastClaimDate: new Date(Number(d.lastClaimTime) * 1000),
          lockupDays,
          lockupType: getLockupLabel(lockupDays),
          unlockDate: unlockTime > 0 ? new Date(unlockTime) : null,
          isLocked: d.isLocked,
          isWithdrawable,
          daysRemaining,
          progressPercent,
        };
      });
  }, [userDeposits, totalRewards]);

  // Parse deposits by type - calculated in frontend from Core Contract data
  const depositsByType = useMemo((): DepositsByType | null => {
    if (deposits.length === 0) return null;

    const flex = deposits.filter(d => d.lockupDays === 0);
    const l30 = deposits.filter(d => d.lockupDays > 0 && d.lockupDays <= 30);
    const l90 = deposits.filter(d => d.lockupDays > 30 && d.lockupDays <= 90);
    const l180 = deposits.filter(d => d.lockupDays > 90 && d.lockupDays <= 180);
    const l365 = deposits.filter(d => d.lockupDays > 180);
    
    const sumRaw = (arr: DepositDetail[]) => arr.reduce((acc, d) => acc + d.amountRaw, 0n);
    
    return {
      flexible: { count: flex.length, totalAmount: formatPOL(sumRaw(flex)), totalAmountRaw: sumRaw(flex) },
      locked30: { count: l30.length, totalAmount: formatPOL(sumRaw(l30)), totalAmountRaw: sumRaw(l30) },
      locked90: { count: l90.length, totalAmount: formatPOL(sumRaw(l90)), totalAmountRaw: sumRaw(l90) },
      locked180: { count: l180.length, totalAmount: formatPOL(sumRaw(l180)), totalAmountRaw: sumRaw(l180) },
      locked365: { count: l365.length, totalAmount: formatPOL(sumRaw(l365)), totalAmountRaw: sumRaw(l365) },
    };
  }, [deposits]);

  // Calculate withdrawal status - derived from Core Contract data
  const withdrawalStatus = useMemo((): WithdrawalStatusInfo | null => {
    if (!address) return null;

    const canWithdraw = deposits.some(d => d.isWithdrawable);
    const withdrawableRewardsRaw = deposits
      .filter(d => d.isWithdrawable)
      .reduce((acc, d) => acc + d.currentRewardsRaw, 0n);

    // Assume daily limit of 100 POL (standard limit) - cannot get exact value without View Contract
    const ASSUMED_DAILY_LIMIT = 100n * 10n ** 18n; // 100 POL in wei
    const dailyLimitRemainingRaw = ASSUMED_DAILY_LIMIT; // Conservative: assume full limit available
    const dailyLimitUsedPercent = 0; // Cannot calculate without View Contract

    return {
      canWithdraw,
      withdrawableRewards: formatPOL(withdrawableRewardsRaw),
      withdrawableRewardsRaw,
      dailyLimitRemaining: formatPOL(dailyLimitRemainingRaw),
      dailyLimitRemainingRaw,
      dailyLimitUsedPercent,
    };
  }, [deposits, address]);

  // Estimate rewards - calculated from Core Contract data
  const estimatedRewards = useMemo((): EstimatedRewardsInfo | null => {
    if (totalDeposited === 0n || !address) return null;

    // Estimate daily rewards: assume 5% APY base rate
    const BASE_APY = 0.05;
    const dailyRate = BASE_APY / 365;
    
    const baseEstimateRaw = BigInt(Math.floor(Number(totalDeposited) * dailyRate));
    const boostedEstimateRaw = baseEstimateRaw + (baseEstimateRaw * 20n / 100n); // Assume 20% boost
    const boostDiff = boostedEstimateRaw - baseEstimateRaw;

    return {
      baseEstimate: formatPOL(baseEstimateRaw, 6),
      boostedEstimate: formatPOL(boostedEstimateRaw, 6),
      baseEstimateRaw,
      boostedEstimateRaw,
      boostDifference: formatPOL(boostDiff, 6),
    };
  }, [totalDeposited, address]);

  // Withdrawable deposits info
  const withdrawableInfo = useMemo(() => {
    const withdrawableDeposits = deposits.filter(d => d.isWithdrawable);
    return {
      count: withdrawableDeposits.length,
      indices: withdrawableDeposits.map(d => d.index),
    };
  }, [deposits]);

  // Write functions
  const withdrawDeposit = useCallback((depositIndex: number) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: EnhancedSmartStakingABI.abi as Abi,
      functionName: 'withdraw',
      args: [BigInt(depositIndex)],
    });
  }, [writeContract]);

  const withdrawBoosted = useCallback((depositIndex: number) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: EnhancedSmartStakingABI.abi as Abi,
      functionName: 'withdrawBoosted',
      args: [BigInt(depositIndex)],
    });
  }, [writeContract]);

  const refetchAll = useCallback(async () => {
    await Promise.all([refetchDeposits(), refetchUserInfo()]);
  }, [refetchDeposits, refetchUserInfo]);

  // Debug logging
  if (import.meta.env.DEV && deposits.length > 0) {
    console.log('[useDepositManagement] Processed deposits:', {
      total: deposits.length,
      withdrawable: withdrawableInfo.count,
      locked: deposits.filter(d => d.isLocked).length,
      totalRewards: formatPOL(totalRewards, 6),
    });
  }

  return {
    deposits,
    depositsByType,
    withdrawalStatus,
    estimatedRewards,
    totalDeposits: deposits.length,
    withdrawableCount: withdrawableInfo.count,
    lockedCount: deposits.filter(d => d.isLocked).length,
    withdrawDeposit,
    withdrawBoosted,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    isLoading,
    refetch: refetchAll,
  };
}

// ============================================
// HELPERS
// ============================================

function formatPOL(value: bigint | undefined | null, decimals = 4): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function getLockupLabel(days: number): string {
  if (days === 0) return 'Flexible';
  if (days <= 30) return '30 Days';
  if (days <= 90) return '90 Days';
  if (days <= 180) return '180 Days';
  return '365 Days';
}

export default useDepositManagement;
