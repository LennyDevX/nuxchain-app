import { useState, useEffect, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../abi/contracts.config';
import { formatEther } from 'viem';

const COLLABORATOR_BADGE_REWARDS_ADDRESS = CONTRACT_ADDRESSES.CollaboratorBadgeRewards;
const COLLABORATOR_BADGE_REWARDS_ABI = CONTRACT_ABIS.CollaboratorBadgeRewards;

export interface CollaboratorQuest {
  description: string;
  rewardAmount: bigint;
  startTime: bigint;
  endTime: bigint;
  active: boolean;
  completionCount: bigint;
  maxCompletions: bigint;
}

export interface RewardSummary {
  pending: bigint;
  poolBalance: bigint;
  totalCommission: bigint;
  totalTreasury: bigint;
}

export interface ContractStats {
  balance: bigint;
  pendingDebt: bigint;
  commission: bigint;
  treasury: bigint;
  paid: bigint;
  holders: bigint;
  questCount: bigint;
}

export interface ContractHealth {
  solvencyRatio: bigint;
  isHealthy: boolean;
  deficit: bigint;
}

export interface CommissionTier {
  threshold: bigint;
  rate: bigint;
}

export function useCollaboratorBadgeRewards() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read user's reward summary
  const { data: rewardSummary, refetch: refetchRewardSummary } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getBadgeHolderRewardsSummary',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Read contract stats
  const { data: contractStats } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getStats',
    query: {
      enabled: isConnected,
    }
  });

  // Read contract health
  const { data: contractHealth } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getContractHealth',
    query: {
      enabled: isConnected,
    }
  });

  // Read active quests
  const { data: activeQuestsData } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getActiveQuests',
    query: {
      enabled: isConnected,
    }
  });

  // Read user's completed quests
  const { data: userContributionVolume } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getUserContributionVolume',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Read claim fee for user
  const { data: userClaimFee } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getClaimFeeForUser',
    args: address ? [address] : undefined,
    query: {
      enabled: isConnected && !!address,
    }
  });

  // Read commission tiers
  const { data: commissionTiersData } = useReadContract({
    address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
    abi: COLLABORATOR_BADGE_REWARDS_ABI,
    functionName: 'getAllCommissionTiers',
    query: {
      enabled: isConnected,
    }
  });

  // Write: Claim Rewards
  const { writeContract: writeClaimRewards, data: claimHash, isPending: isClaiming } = useWriteContract();
  const { isLoading: isWaitingForClaim, isSuccess: claimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  // Check if user has completed a specific quest
  const hasCompletedQuest = useCallback(async (questId: bigint): Promise<boolean> => {
    if (!address || !isConnected) return false;
    
     
    void questId;
    
    try {
      // This would need to be implemented with a direct contract call
      // For now, returning false as placeholder
      return false;
    } catch (err) {
      console.error('Error checking quest completion:', err);
      return false;
    }
  }, [address, isConnected]);

  // Claim rewards function
  const claimRewards = useCallback(async () => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await writeClaimRewards({
        address: COLLABORATOR_BADGE_REWARDS_ADDRESS as `0x${string}`,
        abi: COLLABORATOR_BADGE_REWARDS_ABI,
        functionName: 'claimRewards',
      });
    } catch (err) {
      console.error('Error claiming rewards:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim rewards');
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, writeClaimRewards]);

  // Parse reward summary data
  const parsedRewardSummary: RewardSummary | null = rewardSummary ? {
    pending: (rewardSummary as bigint[])[0],
    poolBalance: (rewardSummary as bigint[])[1],
    totalCommission: (rewardSummary as bigint[])[2],
    totalTreasury: (rewardSummary as bigint[])[3],
  } : null;

  // Parse contract stats
  const parsedContractStats: ContractStats | null = contractStats ? {
    balance: (contractStats as bigint[])[0],
    pendingDebt: (contractStats as bigint[])[1],
    commission: (contractStats as bigint[])[2],
    treasury: (contractStats as bigint[])[3],
    paid: (contractStats as bigint[])[4],
    holders: (contractStats as bigint[])[5],
    questCount: (contractStats as bigint[])[6],
  } : null;

  // Parse contract health
  const parsedContractHealth: ContractHealth | null = contractHealth ? {
    solvencyRatio: (contractHealth as bigint[])[0],
    isHealthy: (contractHealth as boolean[])[1],
    deficit: (contractHealth as bigint[])[2],
  } : null;

  // Parse active quests
  const parsedActiveQuests: CollaboratorQuest[] = activeQuestsData ? 
    (activeQuestsData as { questData: CollaboratorQuest[] }).questData || []
  : [];

  // Parse commission tiers
  const parsedCommissionTiers: CommissionTier[] = commissionTiersData ? 
    ((commissionTiersData as { thresholds: bigint[], rates: bigint[] }).thresholds || []).map((threshold, index) => ({
      threshold,
      rate: (commissionTiersData as { rates: bigint[] }).rates[index] || 0n,
    }))
  : [];

  // Calculate net reward after fees
  const calculateNetReward = useCallback((grossAmount: bigint): bigint => {
    if (!userClaimFee) return grossAmount;
    const fee = (grossAmount * (userClaimFee as bigint)) / 10000n;
    return grossAmount - fee;
  }, [userClaimFee]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await refetchRewardSummary();
  }, [refetchRewardSummary]);

  // Auto-refresh after successful claim
  useEffect(() => {
    if (claimSuccess) {
      refreshData();
    }
  }, [claimSuccess, refreshData]);

  return {
    // Data
    rewardSummary: parsedRewardSummary,
    contractStats: parsedContractStats,
    contractHealth: parsedContractHealth,
    activeQuests: parsedActiveQuests,
    userContributionVolume: userContributionVolume as bigint | undefined,
    userClaimFee: userClaimFee as bigint | undefined,
    commissionTiers: parsedCommissionTiers,
    
    // Calculated values
    pendingRewardsFormatted: parsedRewardSummary?.pending ? formatEther(parsedRewardSummary.pending) : '0',
    netRewardFormatted: parsedRewardSummary?.pending ? formatEther(calculateNetReward(parsedRewardSummary.pending)) : '0',
    claimFeePercent: userClaimFee ? Number(userClaimFee) / 100 : 2, // Default 2%
    
    // Actions
    claimRewards,
    hasCompletedQuest,
    refreshData,
    
    // Transaction states
    isClaiming: isClaiming || isWaitingForClaim,
    claimSuccess,
    claimHash,
    
    // General states
    isLoading,
    error,
    isConnected,
    address,
  };
}

export default useCollaboratorBadgeRewards;
