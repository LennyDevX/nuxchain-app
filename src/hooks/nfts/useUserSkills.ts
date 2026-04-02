import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import { GameifiedMarketplaceSkillsNftABI as GameifiedMarketplaceSkillsABI } from '../../lib/export/abis/legacy';

const SKILLS_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_SKILLS;
const MAX_ACTIVE_SKILLS = 3; // NEW: Security limit

interface UseUserSkillsReturn {
  userSkills: number[]; // Array of skill IDs the user has (0-5)
  activeSkillCount: number; // Number of currently active (non-expired) skills
  isLoading: boolean;
  error: Error | null;
  hasSkills: boolean;
  isFirstSkill: boolean; // True if user has no skills yet
  availableSkills: number[]; // Skills not yet owned by user
  canAddMoreSkills: boolean; // True if user hasn't reached max 3 active skills
  skillsUntilLimit: number; // How many more skills user can add
}

/**
 * Hook para obtener los skills que ya posee el usuario
 * Valida qué skills están disponibles para comprar
 * ✅ NUEVO: Considera el límite de 3 skills activos simultáneamente
 */
export function useUserSkills(): UseUserSkillsReturn {
  const { address, isConnected } = useAccount();

  const contractConfig = {
    address: SKILLS_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceSkillsABI.abi,
  };

  // Get active skills for the user (not expired)
  const { data: activeSkillsData, isLoading, error } = useReadContract({
    ...contractConfig,
    functionName: 'getActiveSkillsForUser',
    args: [address],
    query: {
      enabled: !!address && isConnected,
      staleTime: 30000,
      refetchInterval: 60000
    }
  });

  const activeSkillCount = useMemo(() => {
    if (!activeSkillsData || !Array.isArray(activeSkillsData)) return 0;
    return activeSkillsData.length;
  }, [activeSkillsData]);

  // Get all skills (including expired) owned by user
  const { data: userSkillsData } = useReadContract({
    ...contractConfig,
    functionName: 'getUserSkills',
    args: [address],
    query: {
      enabled: !!address && isConnected,
      staleTime: 30000,
      refetchInterval: 60000
    }
  });

  const userSkills = useMemo(() => {
    if (!userSkillsData || !Array.isArray(userSkillsData)) return [];
    // Convert to array of skill type IDs (0-5)
    return userSkillsData.map(skill => {
      if (typeof skill === 'bigint') return Number(skill);
      if (typeof skill === 'number') return skill;
      // If it's an object, try to extract skillType
      if (typeof skill === 'object' && skill !== null) {
        const skillObj = skill as Record<string, unknown>;
        return Number(skillObj.skillType || 0);
      }
      return 0;
    });
  }, [userSkillsData]);

  // Calculate available skills (0-5 that user doesn't have)
  const availableSkills = useMemo(() => {
    const allSkillIds = [0, 1, 2, 3, 4, 5]; // CODING to WRITING
    return allSkillIds.filter(id => !userSkills.includes(id));
  }, [userSkills]);

  // NEW: Calculate if user can add more skills (max 3 active)
  const canAddMoreSkills = activeSkillCount < MAX_ACTIVE_SKILLS;
  const skillsUntilLimit = Math.max(0, MAX_ACTIVE_SKILLS - activeSkillCount);

  const hasSkills = userSkills.length > 0;
  const isFirstSkill = userSkills.length === 0;

  return {
    userSkills,
    activeSkillCount,
    isLoading,
    error: error as Error | null,
    hasSkills,
    isFirstSkill,
    availableSkills,
    canAddMoreSkills,
    skillsUntilLimit
  };
}
