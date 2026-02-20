import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import EnhancedSmartStakingSkillsABI from '../../abi/SmartStaking/EnhancedSmartStakingSkills.json';
import EnhancedSmartStakingViewABI from '../../abi/SmartStaking/EnhancedSmartStakingView.json';
import type { SkillType, UserSkillProfile, NFTSkill } from '../../types/contracts';

// ✅ Add BigInt serialization support for React DevTools
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;

// ✅ Add BigInt serialization support for React DevTools
if (typeof BigInt.prototype.toJSON === 'undefined') {
  BigInt.prototype.toJSON = function() {
    return this.toString();
  };
}

interface UseSkillNFTsReturn {
  userSkillProfile: UserSkillProfile | null;
  activeSkills: bigint[];
  isLoading: boolean;
  error: Error | null;
  hasAutoCompound: boolean;
  totalBoost: number;
}

/**
 * Hook para gestionar NFT Skills en el Enhanced Smart Staking
 * Obtiene el perfil de skills del usuario y sus NFTs activos
 */
export function useSkillNFTs(): UseSkillNFTsReturn {
  const { address, isConnected } = useAccount();

  // ✅ Memoize contract config for View module
  const viewConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingViewABI.abi,
  }), []);

  // ✅ Get user skill profile from View module
  const { data: profileData, isLoading: profileLoading, error: profileError } = useReadContract({
    ...viewConfig,
    functionName: 'getUserSkillProfile',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds - data is fresh
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache much longer
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on component mount if data exists
    }
  });

  // ✅ Get active skills from View module
  const { data: activeSkillsData, isLoading: skillsLoading } = useReadContract({
    ...viewConfig,
    functionName: 'getActiveSkillsWithDetails',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  });

  const userSkillProfile = useMemo(() => {
    if (!profileData || !Array.isArray(profileData)) return null;

    return {
      activeSkillsCount: Number(profileData[0] || 0),
      totalSkillBoost: Number(profileData[1] || 0),
      autoCompoundEnabled: Boolean(profileData[2]),
      lockupReduction: Number(profileData[3] || 0),
      rewardMultiplier: Number(profileData[4] || 0),
      lastSkillUpdate: BigInt(profileData[5] || 0),
    } as UserSkillProfile;
  }, [profileData]);

  const activeSkills = useMemo(() => {
    if (!activeSkillsData || !Array.isArray(activeSkillsData)) return [];
    return activeSkillsData as bigint[];
  }, [activeSkillsData]);

  const hasAutoCompound = useMemo(() => {
    return userSkillProfile?.autoCompoundEnabled || false;
  }, [userSkillProfile]);

  const totalBoost = useMemo(() => {
    return userSkillProfile?.totalSkillBoost || 0;
  }, [userSkillProfile]);

  return {
    userSkillProfile,
    activeSkills,
    isLoading: profileLoading || skillsLoading,
    error: profileError as Error | null,
    hasAutoCompound,
    totalBoost,
  };
}

/**
 * Hook para obtener detalles de un NFT skill específico
 */
export function useNFTSkillDetails(tokenId: bigint | null) {
  // ✅ Memoize contract config - use Skills module
  const skillsConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingSkillsABI.abi,
  }), []);

  const { data: skillData, isLoading } = useReadContract({
    ...skillsConfig,
    functionName: 'getNFTSkill',
    args: [tokenId],
    query: { 
      enabled: !!tokenId,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  });

  const nftSkill = useMemo(() => {
    if (!skillData || !Array.isArray(skillData)) return null;

    return {
      skillType: Number(skillData[0]) as SkillType,
      effectValue: Number(skillData[1]),
      isActive: Boolean(skillData[2]),
      appliedAt: BigInt(skillData[3] || 0),
      expiresAt: BigInt(skillData[4] || 0),
      level: Number(skillData[5] || 1),
    } as NFTSkill;
  }, [skillData]);

  return {
    nftSkill,
    isLoading,
  };
}
