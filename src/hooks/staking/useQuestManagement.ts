/**
 * useQuestManagement - Hook for managing quests and gamification
 * Fetches quest rewards, XP info, badges, and handles quest/achievement claiming
 */

import { useMemo, useCallback } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import EnhancedSmartStakingGamificationABI from '../../abi/SmartStaking/EnhancedSmartStakingGamification.json';

const GAMIFICATION_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_GAMIFICATION_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface QuestRewardInfo {
  questId: number;
  rewardAmount: string;
  rewardAmountRaw: bigint;
  isClaimed: boolean;
  isExpired: boolean;
  expiresAt: Date | null;
}

export interface AchievementRewardInfo {
  achievementId: number;
  rewardAmount: string;
  rewardAmountRaw: bigint;
  isClaimed: boolean;
  isExpired: boolean;
}

export interface UserXPInfo {
  currentXP: bigint;
  currentLevel: number;
  xpForNextLevel: bigint;
  xpProgress: number; // percentage 0-100
  totalXPEarned: bigint;
}

export interface BadgeInfo {
  badgeId: number;
  name: string;
  earnedAt: Date;
}

export interface AutoCompoundConfig {
  isEnabled: boolean;
  minAmount: string;
  minAmountRaw: bigint;
  frequency: number;
  lastExecution: Date | null;
}

export interface ProtocolHealthInfo {
  status: number;
  statusLabel: string;
  statusColor: string;
  contractBalance: string;
  totalPendingRewards: string;
  isHealthy: boolean;
}

export interface QuestManagementReturn {
  // Read data
  questRewards: QuestRewardInfo[];
  achievementRewards: AchievementRewardInfo[];
  userXP: UserXPInfo | null;
  badges: BadgeInfo[];
  badgeCount: number;
  autoCompoundConfig: AutoCompoundConfig | null;
  protocolHealth: ProtocolHealthInfo | null;

  // Write functions
  claimQuestReward: (questId: number) => void;
  claimAchievementReward: (achievementId: number) => void;
  enableAutoCompound: (minAmount: bigint) => void;
  disableAutoCompound: () => void;

  // Transaction state
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  reset: () => void;

  // Loading
  isLoading: boolean;
  refetch: () => Promise<void>;
}

// ============================================
// MAIN HOOK
// ============================================

export function useQuestManagement(): QuestManagementReturn {
  const { address, chain, isConnected } = useAccount();

  const gamifConfig = useMemo(() => ({
    address: GAMIFICATION_ADDRESS,
    abi: EnhancedSmartStakingGamificationABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // Write contract setup - with error handling (suppress default error UI)
  const { writeContract, data: txHash, isPending, error: writeError, reset: resetWrite } = useWriteContract({
    mutation: {
      onError: () => {
        // Suppress default wagmi error UI - we handle it ourselves with custom toast
      },
    },
  });
  const { isLoading: isConfirming, isSuccess: isConfirmed, error: waitError } = useWaitForTransactionReceipt({ hash: txHash });

  // Multicall: Fetch all gamification data
  const { data: multicallData, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        ...gamifConfig,
        functionName: 'getAllQuestRewards',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getAllAchievementRewards',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getUserXPInfo',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getUserBadges',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getUserBadgeCount',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getAutoCompoundConfig',
        args: [address],
      },
      {
        ...gamifConfig,
        functionName: 'getProtocolHealth',
      },
    ],
    query: {
      enabled: !!address && isConnected,
      staleTime: 45000,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  });

  // Parse quest rewards
  const questRewards = useMemo((): QuestRewardInfo[] => {
    const raw = multicallData?.[0]?.result;
    if (!raw || !Array.isArray(raw)) return [];

    try {
      return raw.map((q: Record<string, unknown>) => ({
        questId: Number(q.questId || 0),
        rewardAmount: formatSafe(q.rewardAmount as bigint),
        rewardAmountRaw: (q.rewardAmount as bigint) || 0n,
        isClaimed: Boolean(q.claimed),
        isExpired: Boolean(q.expired),
        expiresAt: q.expiresAt && Number(q.expiresAt) > 0
          ? new Date(Number(q.expiresAt) * 1000)
          : null,
      }));
    } catch {
      return [];
    }
  }, [multicallData]);

  // Parse achievement rewards
  const achievementRewards = useMemo((): AchievementRewardInfo[] => {
    const raw = multicallData?.[1]?.result;
    if (!raw || !Array.isArray(raw)) return [];

    try {
      return raw.map((a: Record<string, unknown>) => ({
        achievementId: Number(a.achievementId || 0),
        rewardAmount: formatSafe(a.rewardAmount as bigint),
        rewardAmountRaw: (a.rewardAmount as bigint) || 0n,
        isClaimed: Boolean(a.claimed),
        isExpired: Boolean(a.expired),
      }));
    } catch {
      return [];
    }
  }, [multicallData]);

  // Parse user XP info
  const userXP = useMemo((): UserXPInfo | null => {
    const raw = multicallData?.[2]?.result;
    if (!raw) return null;

    try {
      const data = raw as {
        currentXP: bigint;
        currentLevel: bigint;
        xpForNextLevel: bigint;
        totalXPEarned: bigint;
      };

      const currentXP = data.currentXP || 0n;
      const xpForNext = data.xpForNextLevel || 1000n;
      const progress = xpForNext > 0n
        ? Number((currentXP * 100n) / xpForNext)
        : 0;

      return {
        currentXP,
        currentLevel: Number(data.currentLevel || 0),
        xpForNextLevel: xpForNext,
        xpProgress: Math.min(100, progress),
        totalXPEarned: data.totalXPEarned || 0n,
      };
    } catch {
      return null;
    }
  }, [multicallData]);

  // Parse badges
  const badges = useMemo((): BadgeInfo[] => {
    const raw = multicallData?.[3]?.result;
    if (!raw || !Array.isArray(raw)) return [];

    try {
      return raw.map((b: Record<string, unknown>) => ({
        badgeId: Number(b.badgeId || 0),
        name: (b.name as string) || `Badge #${b.badgeId}`,
        earnedAt: new Date(Number(b.earnedAt || 0) * 1000),
      }));
    } catch {
      return [];
    }
  }, [multicallData]);

  // Badge count
  const badgeCount = useMemo(() => {
    const raw = multicallData?.[4]?.result;
    return raw ? Number(raw) : 0;
  }, [multicallData]);

  // Parse auto-compound config
  const autoCompoundConfig = useMemo((): AutoCompoundConfig | null => {
    const raw = multicallData?.[5]?.result;
    if (!raw) return null;

    try {
      const data = raw as {
        isEnabled: boolean;
        minAmount: bigint;
        frequency: bigint;
        lastExecution: bigint;
      };

      return {
        isEnabled: Boolean(data.isEnabled),
        minAmount: formatSafe(data.minAmount),
        minAmountRaw: data.minAmount || 0n,
        frequency: Number(data.frequency || 0),
        lastExecution: data.lastExecution && Number(data.lastExecution) > 0
          ? new Date(Number(data.lastExecution) * 1000)
          : null,
      };
    } catch {
      return null;
    }
  }, [multicallData]);

  // Parse protocol health
  const protocolHealth = useMemo((): ProtocolHealthInfo | null => {
    const raw = multicallData?.[6]?.result;
    if (!raw) return null;

    try {
      const data = raw as {
        status: number;
        contractBalance: bigint;
        totalPendingRewards: bigint;
      };

      const status = Number(data.status || 0);
      const { label, color } = getHealthLabel(status);

      return {
        status,
        statusLabel: label,
        statusColor: color,
        contractBalance: formatSafe(data.contractBalance),
        totalPendingRewards: formatSafe(data.totalPendingRewards),
        isHealthy: status >= 2,
      };
    } catch {
      return null;
    }
  }, [multicallData]);

  // Write functions - with error suppression
  const claimQuestReward = useCallback((questId: number) => {
    try {
      writeContract({
        address: GAMIFICATION_ADDRESS,
        abi: EnhancedSmartStakingGamificationABI.abi as Abi,
        functionName: 'claimQuestReward',
        args: [BigInt(questId)],
      });
    } catch (err) {
      // Error is handled by the hook's error state and toast notification
      console.log('[useQuestManagement] Claim quest error suppressed:', err);
    }
  }, [writeContract]);

  const claimAchievementReward = useCallback((achievementId: number) => {
    try {
      writeContract({
        address: GAMIFICATION_ADDRESS,
        abi: EnhancedSmartStakingGamificationABI.abi as Abi,
        functionName: 'claimAchievementReward',
        args: [BigInt(achievementId)],
      });
    } catch (err) {
      console.log('[useQuestManagement] Claim achievement error suppressed:', err);
    }
  }, [writeContract]);

  const enableAutoCompound = useCallback((minAmount: bigint) => {
    writeContract({
      address: GAMIFICATION_ADDRESS,
      abi: EnhancedSmartStakingGamificationABI.abi as Abi,
      functionName: 'enableAutoCompound',
      args: [minAmount],
    });
  }, [writeContract]);

  const disableAutoCompound = useCallback(() => {
    writeContract({
      address: GAMIFICATION_ADDRESS,
      abi: EnhancedSmartStakingGamificationABI.abi as Abi,
      functionName: 'disableAutoCompound',
    });
  }, [writeContract]);

  const refetchAll = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    questRewards,
    achievementRewards,
    userXP,
    badges,
    badgeCount,
    autoCompoundConfig,
    protocolHealth,
    claimQuestReward,
    claimAchievementReward,
    enableAutoCompound,
    disableAutoCompound,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    isLoading,
    refetch: refetchAll,
    error: writeError || waitError,
    reset: resetWrite,
  };
}

// ============================================
// HELPERS
// ============================================

function formatSafe(value: bigint | undefined | null): string {
  if (!value || value === 0n) return '0.00';
  return parseFloat(formatEther(value)).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  });
}

function getHealthLabel(status: number) {
  switch (status) {
    case 0: return { label: 'Critical', color: 'text-red-500' };
    case 1: return { label: 'Low', color: 'text-orange-500' };
    case 2: return { label: 'Moderate', color: 'text-yellow-500' };
    case 3: return { label: 'Excellent', color: 'text-emerald-500' };
    case 4: return { label: 'Exceptional', color: 'text-green-400' };
    default: return { label: 'Unknown', color: 'text-gray-500' };
  }
}

export default useQuestManagement;
