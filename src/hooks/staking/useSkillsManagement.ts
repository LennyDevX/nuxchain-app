/**
 * useSkillsManagement - Hook for managing skill NFT activation/deactivation
 * Exposes activate/deactivate write functions + detailed skill data from View contract
 */

import { useMemo, useCallback } from 'react';
import { useAccount, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import type { Abi } from 'viem';
import {
  EnhancedSmartStakingCoreV2ABI as EnhancedSmartStakingABI,
  EnhancedSmartStakingViewABI,
} from '../../lib/export/abis/legacy';
import { SKILL_TYPE_NAMES, RARITY_NAMES, RARITY_COLORS } from '../../types/contracts';
import type { SkillType, Rarity } from '../../types/contracts';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS as `0x${string}`;
const STAKING_VIEW_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS as `0x${string}`;

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface ActiveSkillDetail {
  tokenId: bigint;
  skillType: SkillType;
  skillName: string;
  effectValue: number;
  isActive: boolean;
  appliedAt: Date;
  expiresAt: Date | null;
  level: number;
  rarity: Rarity;
  rarityName: string;
  rarityColor: string;
  daysRemaining: number;
  isExpired: boolean;
}

export interface SkillEffectivenessData {
  baseRewards: string;
  boostedRewards: string;
  boostPercentage: number;
  feeDiscount: number;
}

export interface AvailableSkillConfig {
  skillType: number;
  skillName: string;
  defaultEffect: number;
  isEnabled: boolean;
}

export interface SkillsManagementReturn {
  // Read data
  activeSkills: ActiveSkillDetail[];
  skillEffectiveness: SkillEffectivenessData | null;
  availableSkills: AvailableSkillConfig[];
  totalBoost: number;
  activeCount: number;
  maxSlots: number;
  hasAutoCompound: boolean;

  // Write functions
  activateSkill: (tokenId: bigint) => void;
  deactivateSkill: (tokenId: bigint) => void;

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

export function useSkillsManagement(): SkillsManagementReturn {
  const { address, chain, isConnected } = useAccount();

  const viewConfig = useMemo(() => ({
    address: STAKING_VIEW_ADDRESS,
    abi: EnhancedSmartStakingViewABI.abi as Abi,
    chainId: chain?.id,
  }), [chain?.id]);

  // Write contract setup
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Multicall: Fetch all skills data in one batch
  const { data: multicallData, isLoading, refetch } = useReadContracts({
    contracts: [
      {
        ...viewConfig,
        functionName: 'getActiveSkillsWithDetails',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getSkillEffectiveness',
        args: [address],
      },
      {
        ...viewConfig,
        functionName: 'getAvailableSkillsConfiguration',
      },
      {
        ...viewConfig,
        functionName: 'getUserDetailedStats',
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

  // Parse active skills with details
  const activeSkills = useMemo((): ActiveSkillDetail[] => {
    const raw = multicallData?.[0]?.result;
    if (!raw || !Array.isArray(raw)) return [];

    const now = Date.now();

    try {
      // The view returns arrays of skill data
      return raw.map((skill: Record<string, unknown>) => {
        const tokenId = skill.tokenId as bigint || 0n;
        const skillType = Number(skill.skillType || 0) as SkillType;
        const effectValue = Number(skill.effectValue || 0);
        const isActive = Boolean(skill.isActive);
        const appliedAt = Number(skill.appliedAt || 0);
        const expiresAt = Number(skill.expiresAt || 0);
        const level = Number(skill.level || 1);
        const rarity = Number(skill.rarity || 0) as Rarity;

        const expiresDate = expiresAt > 0 ? new Date(expiresAt * 1000) : null;
        const daysRemaining = expiresDate
          ? Math.max(0, Math.ceil((expiresDate.getTime() - now) / 86400000))
          : 999;
        const isExpired = expiresDate ? expiresDate.getTime() < now : false;

        return {
          tokenId,
          skillType,
          skillName: SKILL_TYPE_NAMES[skillType] || `Skill #${skillType}`,
          effectValue,
          isActive,
          appliedAt: new Date(appliedAt * 1000),
          expiresAt: expiresDate,
          level,
          rarity,
          rarityName: RARITY_NAMES[rarity] || 'Unknown',
          rarityColor: RARITY_COLORS[rarity] || 'text-gray-400',
          daysRemaining,
          isExpired,
        };
      });
    } catch {
      return [];
    }
  }, [multicallData]);

  // Parse skill effectiveness
  const skillEffectiveness = useMemo((): SkillEffectivenessData | null => {
    const raw = multicallData?.[1]?.result;
    if (!raw) return null;

    try {
      const data = raw as {
        baseEstimate: bigint;
        boostedEstimate: bigint;
        totalBoostBps: bigint;
        totalFeeDiscountBps: bigint;
      };

      const baseVal = parseFloat(formatEther(data.baseEstimate || 0n));
      const boostedVal = parseFloat(formatEther(data.boostedEstimate || 0n));
      const boostPct = Number(data.totalBoostBps || 0) / 100;
      const feePct = Number(data.totalFeeDiscountBps || 0) / 100;

      return {
        baseRewards: baseVal.toFixed(6),
        boostedRewards: boostedVal.toFixed(6),
        boostPercentage: boostPct,
        feeDiscount: feePct,
      };
    } catch {
      return null;
    }
  }, [multicallData]);

  // Parse available skills configuration
  const availableSkills = useMemo((): AvailableSkillConfig[] => {
    const raw = multicallData?.[2]?.result;
    if (!raw || !Array.isArray(raw)) return [];

    try {
      return raw.map((config: Record<string, unknown>) => ({
        skillType: Number(config.skillType || 0),
        skillName: SKILL_TYPE_NAMES[Number(config.skillType || 0) as SkillType] || `Skill #${config.skillType}`,
        defaultEffect: Number(config.defaultEffect || 0),
        isEnabled: Boolean(config.isEnabled),
      }));
    } catch {
      return [];
    }
  }, [multicallData]);

  // Parse user stats for skill slots info
  const userStatsForSkills = useMemo(() => {
    const raw = multicallData?.[3]?.result;
    if (!raw) return null;

    const s = raw as {
      maxActiveSkills: number;
      activeSkillsCount: number;
      stakingBoostTotal: number;
      hasAutoCompound: boolean;
    };

    return {
      maxSlots: Number(s.maxActiveSkills || 0),
      activeCount: Number(s.activeSkillsCount || 0),
      totalBoost: Number(s.stakingBoostTotal || 0),
      hasAutoCompound: Boolean(s.hasAutoCompound),
    };
  }, [multicallData]);

  // Write functions
  const activateSkill = useCallback((tokenId: bigint) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: EnhancedSmartStakingABI.abi as Abi,
      functionName: 'notifySkillActivation',
      args: [address, tokenId],
    });
  }, [writeContract, address]);

  const deactivateSkill = useCallback((tokenId: bigint) => {
    writeContract({
      address: STAKING_CONTRACT_ADDRESS,
      abi: EnhancedSmartStakingABI.abi as Abi,
      functionName: 'notifySkillDeactivation',
      args: [address, tokenId],
    });
  }, [writeContract, address]);

  const refetchAll = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    activeSkills,
    skillEffectiveness,
    availableSkills,
    totalBoost: userStatsForSkills?.totalBoost || 0,
    activeCount: userStatsForSkills?.activeCount || 0,
    maxSlots: userStatsForSkills?.maxSlots || 3,
    hasAutoCompound: userStatsForSkills?.hasAutoCompound || false,
    activateSkill,
    deactivateSkill,
    isPending,
    isConfirming,
    isConfirmed,
    txHash,
    isLoading,
    refetch: refetchAll,
  };
}

export default useSkillsManagement;
