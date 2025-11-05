import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import EnhancedSmartStakingABI from '../../abi/EnhancedSmartStaking.json';
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

  // ✅ Memoize contract config to prevent recreating on every render
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
  }), []);

  // ✅ Get user skill profile with optimized cache strategy
  const { data: profileData, isLoading: profileLoading, error: profileError } = useReadContract({
    ...contractConfig,
    functionName: 'userSkillProfiles',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds - data is fresh
      gcTime: 5 * 60 * 1000, // 5 minutes - keep in cache much longer
      refetchInterval: false, // ✅ CRITICAL: Don't auto-refetch, only refetch on window focus
      refetchOnWindowFocus: true, // Refetch when user returns to window
      refetchOnMount: false, // Don't refetch on component mount if data exists
    }
  });

  // ✅ Get active skills count with same optimized strategy
  const { data: activeSkillsData, isLoading: skillsLoading } = useReadContract({
    ...contractConfig,
    functionName: 'getUserActiveSkills',
    args: [address],
    query: { 
      enabled: !!address && isConnected,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false, // ✅ CRITICAL: Disable auto-refetch
      refetchOnWindowFocus: true,
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
  // ✅ Memoize contract config
  const contractConfig = useMemo(() => ({
    address: STAKING_CONTRACT_ADDRESS as `0x${string}`,
    abi: EnhancedSmartStakingABI.abi,
  }), []);

  const { data: skillData, isLoading } = useReadContract({
    ...contractConfig,
    functionName: 'nftSkills',
    args: [tokenId],
    query: { 
      enabled: !!tokenId,
      staleTime: 60000, // 60 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes cache
      refetchInterval: false, // ✅ Disable auto-refetch
      refetchOnWindowFocus: true,
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
