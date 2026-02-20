/**
 * useGamificationData - Consolidated hook for real on-chain gamification data
 * Sources: LevelingSystem, GameifiedMarketplaceQuests, CollaboratorBadgeRewards
 */

import { useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import GameifiedMarketplaceQuestsABI from '../../abi/Marketplace/GameifiedMarketplaceQuests.json';
import CollaboratorBadgeRewardsABI from '../../abi/Marketplace/CollaboratorBadgeRewards.json';
import LevelingSystemABI from '../../abi/Marketplace/LevelingSystem.json';
import GameifiedMarketplaceCoreABI from '../../abi/Marketplace/GameifiedMarketplaceCoreV1.json';
import { formatEther } from 'viem';

const MARKETPLACE_QUESTS_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_QUESTS as `0x${string}` | undefined;
const COLLABORATOR_BADGE_ADDRESS = import.meta.env.VITE_COLLABORATOR_BADGE_REWARDS as `0x${string}` | undefined;
const MARKETPLACE_PROXY_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY as `0x${string}` | undefined;

//  XP tier thresholds matching LevelingSystem contract -
// L1-10: 50 XP each, L11-20: 100 XP, L21-30: 150 XP, L31-40: 200 XP, L41-50: 250 XP
const MAX_LEVEL = 50;
const MAX_XP_TOTAL = 7500;

export function getXPRequiredForLevel(level: number): number {
  if (level <= 0 || level > MAX_LEVEL) return 0;
  if (level <= 10) return 50;
  if (level <= 20) return 100;
  if (level <= 30) return 150;
  if (level <= 40) return 200;
  return 250;
}

export function getLevelUpRewardPOL(level: number): number {
  return Math.min(5, 1 + Math.floor(level / 10));
}

//  Quest type labels 
export const QUEST_TYPE_LABELS: Record<number, string> = {
  0: 'Purchase', 1: 'Create', 2: 'Social', 3: 'Level Up', 4: 'Trading',
};
export const QUEST_TYPE_ICONS: Record<number, string> = {
  0: '', 1: '', 2: '', 3: '', 4: '',
};

//  Types -

export interface ActiveQuest {
  questId: number;
  questType: number;
  title: string;
  description: string;
  requirement: number;
  xpReward: number;
  currentProgress: number;
  progressPct: number;
  completed: boolean;
}

export interface CollaboratorQuest {
  questId: number;
  description: string;
  rewardAmount: string;
  endTime: number;
  active: boolean;
  completionCount: number;
  maxCompletions: number;
}

export interface GamificationData {
  totalXP: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number;
  nextLevelRewardPOL: number;
  nftsCreated: number;
  nftsOwned: number;
  nftsSold: number;
  nftsBought: number;
  socialActions: number;
  activeQuests: ActiveQuest[];
  completedQuestIds: number[];
  totalQuestsCompleted: number;
  totalQuestsInProgress: number;
  totalXPEarnedFromQuests: number;
  questCompletionRate: number;
  favoriteQuestType: number;
  pendingRewardsPOL: string;
  hasPendingRewards: boolean;
  collaboratorQuests: CollaboratorQuest[];
  badgeRewardsAvailable: boolean;
  engagementScore: number;
  isLoading: boolean;
}

//  Internal raw types 
interface RawQuest {
  questId: bigint;
  questType: number;
  title: string;
  description: string;
  requirement: bigint;
  xpReward: bigint;
  active: boolean;
  createdAt: bigint;
}

interface RawCollaboratorQuest {
  description: string;
  rewardAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  active: boolean;
  completionCount: bigint;
  maxCompletions: bigint;
}

export function useGamificationData(): GamificationData {
  const { address, isConnected } = useAccount();

  const enabled = !!address && isConnected;
  const questsEnabled = enabled && !!MARKETPLACE_QUESTS_ADDRESS;
  const badgeEnabled = enabled && !!COLLABORATOR_BADGE_ADDRESS;

  //  Step 1: Get LevelingSystem address from proxy 
  const { data: levelingAddress } = useReadContract({
    address: MARKETPLACE_PROXY_ADDRESS,
    abi: GameifiedMarketplaceCoreABI.abi,
    functionName: 'levelingSystemAddress',
    query: { enabled: !!MARKETPLACE_PROXY_ADDRESS, staleTime: Infinity },
  });

  const levelingEnabled = enabled && !!levelingAddress;

  //  Step 2: Parallel reads 
  const { data: profileDetailed, isLoading: loadingProfile } = useReadContract({
    address: levelingAddress as `0x${string}`,
    abi: LevelingSystemABI.abi,
    functionName: 'getUserProfileDetailed',
    args: [address],
    query: { enabled: levelingEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  const { data: questStatsData, isLoading: loadingQuestStats } = useReadContract({
    address: MARKETPLACE_QUESTS_ADDRESS,
    abi: GameifiedMarketplaceQuestsABI.abi,
    functionName: 'getUserQuestStats',
    args: [address],
    query: { enabled: questsEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  const { data: completedQuestIdsData } = useReadContract({
    address: MARKETPLACE_QUESTS_ADDRESS,
    abi: GameifiedMarketplaceQuestsABI.abi,
    functionName: 'getUserCompletedQuests',
    args: [address],
    query: { enabled: questsEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  const { data: socialActionsData } = useReadContract({
    address: MARKETPLACE_QUESTS_ADDRESS,
    abi: GameifiedMarketplaceQuestsABI.abi,
    functionName: 'getUserSocialActions',
    args: [address],
    query: { enabled: questsEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  // getUserIncompleteQuests returns [questIds[], Quest[], progressPercentages[]]
  const { data: incompleteQuestsData } = useReadContract({
    address: MARKETPLACE_QUESTS_ADDRESS,
    abi: GameifiedMarketplaceQuestsABI.abi,
    functionName: 'getUserIncompleteQuests',
    args: [address],
    query: { enabled: questsEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  // Collaborator Badge
  const { data: badgeRewardsSummary } = useReadContract({
    address: COLLABORATOR_BADGE_ADDRESS,
    abi: CollaboratorBadgeRewardsABI.abi,
    functionName: 'getBadgeHolderRewardsSummary',
    args: [address],
    query: { enabled: badgeEnabled, staleTime: 30000, refetchOnWindowFocus: false },
  });

  const { data: collaboratorActiveQuests } = useReadContract({
    address: COLLABORATOR_BADGE_ADDRESS,
    abi: CollaboratorBadgeRewardsABI.abi,
    functionName: 'getActiveQuests',
    query: { enabled: badgeEnabled, staleTime: 60000, refetchOnWindowFocus: false },
  });

  //  Step 3: Derive all data 
  return useMemo((): GamificationData => {
    const isLoading = loadingProfile || loadingQuestStats;

    //  XP & Level 
    let totalXP = 0, level = 0, nftsCreated = 0, nftsOwned = 0, nftsSold = 0, nftsBought = 0;
    let xpForCurrentLevelCumulative = 0, xpForNextLevelCumulative = 0;

    if (profileDetailed && Array.isArray(profileDetailed)) {
      totalXP = Number(profileDetailed[0] ?? 0n);
      level = Number(profileDetailed[1] ?? 0);
      nftsCreated = Number(profileDetailed[2] ?? 0n);
      nftsOwned = Number(profileDetailed[3] ?? 0n);
      nftsSold = Number(profileDetailed[4] ?? 0n);
      nftsBought = Number(profileDetailed[5] ?? 0n);
      xpForCurrentLevelCumulative = Number(profileDetailed[6] ?? 0n);
      xpForNextLevelCumulative = Number(profileDetailed[7] ?? 0n);
    }

    const xpInCurrentLevel = totalXP - xpForCurrentLevelCumulative;
    const xpNeededForNextLevel = xpForNextLevelCumulative - xpForCurrentLevelCumulative;
    const xpProgress = xpNeededForNextLevel > 0
      ? Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100))
      : (level >= MAX_LEVEL ? 100 : 0);
    const nextLevelRewardPOL = getLevelUpRewardPOL(level + 1);
    const socialActions = Number(socialActionsData ?? 0n);

    //  Quest stats 
    let totalQuestsCompleted = 0, totalQuestsInProgress = 0;
    let totalXPEarnedFromQuests = 0, questCompletionRate = 0, favoriteQuestType = 0;

    if (questStatsData && Array.isArray(questStatsData)) {
      totalQuestsCompleted = Number(questStatsData[0] ?? 0n);
      totalQuestsInProgress = Number(questStatsData[1] ?? 0n);
      totalXPEarnedFromQuests = Number(questStatsData[2] ?? 0n);
      questCompletionRate = Number(questStatsData[3] ?? 0n);
      favoriteQuestType = Number(questStatsData[4] ?? 0);
    }

    const completedQuestIds: number[] = Array.isArray(completedQuestIdsData)
      ? (completedQuestIdsData as bigint[]).map(Number)
      : [];

    //  Active quests with progress (getUserIncompleteQuests) 
    const activeQuests: ActiveQuest[] = (() => {
      if (!incompleteQuestsData || !Array.isArray(incompleteQuestsData)) return [];
      const rawTuple = incompleteQuestsData as [bigint[], RawQuest[], bigint[]];
      const [, questDataArr, progressPcts] = rawTuple;
      if (!questDataArr || !Array.isArray(questDataArr)) return [];
      return questDataArr.slice(0, 10).map((q: RawQuest, i: number) => {
        const requirement = Number(q.requirement);
        const progressPct = Number(progressPcts?.[i] ?? 0n);
        const currentProgress = Math.round((progressPct / 100) * requirement);
        const completed = completedQuestIds.includes(Number(q.questId));
        return {
          questId: Number(q.questId),
          questType: Number(q.questType),
          title: q.title,
          description: q.description,
          requirement,
          xpReward: Number(q.xpReward),
          currentProgress,
          progressPct,
          completed,
        };
      });
    })();

    //  Collaborator Badge 
    let pendingRewardsPOL = '0';
    let hasPendingRewards = false;
    const badgeRewardsAvailable = !!COLLABORATOR_BADGE_ADDRESS;

    if (badgeRewardsSummary && Array.isArray(badgeRewardsSummary)) {
      const pendingWei = BigInt(badgeRewardsSummary[0] ?? 0n);
      pendingRewardsPOL = parseFloat(formatEther(pendingWei)).toFixed(4);
      hasPendingRewards = pendingWei > 0n;
    }

    const collaboratorQuests: CollaboratorQuest[] = (() => {
      if (!collaboratorActiveQuests || !Array.isArray(collaboratorActiveQuests)) return [];
      const rawTuple = collaboratorActiveQuests as [bigint[], RawCollaboratorQuest[]];
      const [questIds, questData] = rawTuple;
      if (!questIds || !questData || !Array.isArray(questData)) return [];
      return questIds.slice(0, 5).map((id: bigint, i: number) => {
        const q = questData[i];
        return {
          questId: Number(id),
          description: q.description,
          rewardAmount: parseFloat(formatEther(q.rewardAmount)).toFixed(2),
          endTime: Number(q.endTime),
          active: q.active,
          completionCount: Number(q.completionCount),
          maxCompletions: Number(q.maxCompletions),
        };
      });
    })();

    //  Engagement score (0-100) 
    const xpScore = Math.min(30, Math.round((totalXP / MAX_XP_TOTAL) * 30));
    const questScore = Math.min(25, totalQuestsCompleted > 0
      ? Math.round((totalQuestsCompleted / Math.max(1, totalQuestsCompleted + totalQuestsInProgress)) * 25)
      : 0);
    const nftScore = Math.min(25, Math.round(Math.min(1, (nftsCreated + nftsSold + nftsBought) / 20) * 25));
    const socialScore = Math.min(20, Math.round(Math.min(1, socialActions / 50) * 20));
    const engagementScore = xpScore + questScore + nftScore + socialScore;

    return {
      totalXP, level, xpInCurrentLevel,
      xpForNextLevel: xpNeededForNextLevel || getXPRequiredForLevel(level + 1),
      xpProgress, nextLevelRewardPOL,
      nftsCreated, nftsOwned, nftsSold, nftsBought, socialActions,
      activeQuests, completedQuestIds,
      totalQuestsCompleted, totalQuestsInProgress,
      totalXPEarnedFromQuests, questCompletionRate, favoriteQuestType,
      pendingRewardsPOL, hasPendingRewards, collaboratorQuests, badgeRewardsAvailable,
      engagementScore,
      isLoading,
    };
  }, [
    profileDetailed, questStatsData, incompleteQuestsData, completedQuestIdsData,
    socialActionsData, badgeRewardsSummary, collaboratorActiveQuests,
    loadingProfile, loadingQuestStats,
  ]);
}
