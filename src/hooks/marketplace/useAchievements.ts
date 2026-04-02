import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import { GameifiedMarketplaceCoreV1ABI as GameifiedMarketplaceCoreABI } from '../../lib/export/abis/legacy';
import type { Achievement } from '../../types/contracts';

const MARKETPLACE_CONTRACT_ADDRESS = import.meta.env.VITE_GAMEIFIED_MARKETPLACE_PROXY;

interface UseAchievementsReturn {
  achievements: Achievement[];
  unlockedAchievements: bigint[];
  isLoading: boolean;
  error: Error | null;
  totalUnlocked: number;
  completionPercentage: number;
}

/**
 * Hook para gestionar achievements (logros) en el marketplace gamificado
 * Permite ver achievements disponibles y desbloqueados por el usuario
 */
export function useAchievements(): UseAchievementsReturn {
  // TODO: Implementar lógica para obtener todos los achievements
  // Actualmente retorna datos de ejemplo
  // Será necesario integrar con el contrato cuando esté disponible

  const achievements = useMemo(() => {
    return [] as Achievement[];
  }, []);

  const unlockedAchievements = useMemo(() => {
    return [] as bigint[];
  }, []);

  const totalUnlocked = useMemo(() => {
    return unlockedAchievements.length;
  }, [unlockedAchievements]);

  const completionPercentage = useMemo(() => {
    if (achievements.length === 0) return 0;
    return (totalUnlocked / achievements.length) * 100;
  }, [achievements.length, totalUnlocked]);

  return {
    achievements,
    unlockedAchievements,
    isLoading: false,
    error: null,
    totalUnlocked,
    completionPercentage,
  };
}

/**
 * Hook para obtener detalles de un achievement específico
 */
export function useAchievementDetails(achievementId: bigint | null) {
  const { address, isConnected } = useAccount();

  const contractConfig = {
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceCoreABI.abi,
  };

  const { data: achievementData, isLoading } = useReadContract({
    ...contractConfig,
    functionName: 'achievements',
    args: [achievementId],
    query: { 
      enabled: !!achievementId && !!address && isConnected,
      staleTime: 60000,
    }
  });

  const { data: isUnlocked } = useReadContract({
    ...contractConfig,
    functionName: 'userAchievements',
    args: [address, achievementId],
    query: { 
      enabled: !!achievementId && !!address && isConnected,
      staleTime: 30000,
    }
  });

  const achievement = useMemo(() => {
    if (!achievementData || !Array.isArray(achievementData)) return null;

    return {
      id: BigInt(achievementData[0] || 0),
      name: achievementData[1] as string,
      description: achievementData[2] as string,
      xpReward: BigInt(achievementData[3] || 0),
      requirement: BigInt(achievementData[4] || 0),
      achievementType: Number(achievementData[5]),
      isActive: Boolean(achievementData[6]),
    } as Achievement;
  }, [achievementData]);

  return {
    achievement,
    isUnlocked: Boolean(isUnlocked),
    isLoading,
  };
}
