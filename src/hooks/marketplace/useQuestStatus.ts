/**
 * useQuestStatus - Hook to fetch quest completion statistics
 * Returns quest stats including completed, in progress, and total quests
 */

import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import GameifiedMarketplaceQuestsABI from '../../abi/Marketplace/GameifiedMarketplaceQuests.json';

const MARKETPLACE_QUESTS_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS;

export interface QuestStats {
  totalCompleted: number;
  totalInProgress: number;
  totalXPEarned: bigint;
  completionRate: number;
  favoriteType: number;
}

export interface UseQuestStatusReturn {
  questStats: QuestStats | null;
  completedQuests: number;
  activeQuests: number;
  totalQuests: number;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to get quest completion statistics for a user
 * Uses getUserQuestStats from GameifiedMarketplaceQuests contract
 */
export function useQuestStatus(): UseQuestStatusReturn {
  const { address, isConnected } = useAccount();

  // Memoize contract config
  const contractConfig = useMemo(() => ({
    address: MARKETPLACE_QUESTS_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceQuestsABI.abi,
  }), []);

  // Get user quest statistics
  const { data: questStatsData, isLoading, error } = useReadContract({
    ...contractConfig,
    functionName: 'getUserQuestStats',
    args: [address],
    query: { 
      enabled: !!address && isConnected && !!MARKETPLACE_QUESTS_ADDRESS,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  });

  // Parse quest stats
  const questStats = useMemo((): QuestStats | null => {
    if (!questStatsData || !Array.isArray(questStatsData)) return null;

    // getUserQuestStats returns: [totalCompleted, totalInProgress, totalXPEarned, completionRate, favoriteType]
    return {
      totalCompleted: Number(questStatsData[0] || 0n),
      totalInProgress: Number(questStatsData[1] || 0n),
      totalXPEarned: BigInt(questStatsData[2] || 0n),
      completionRate: Number(questStatsData[3] || 0n),
      favoriteType: Number(questStatsData[4] || 0),
    };
  }, [questStatsData]);

  // Calculate derived values
  const completedQuests = questStats?.totalCompleted || 0;
  const activeQuests = questStats?.totalInProgress || 0;
  const totalQuests = completedQuests + activeQuests;

  return {
    questStats,
    completedQuests,
    activeQuests,
    totalQuests,
    isLoading,
    error: error?.message || null,
  };
}
