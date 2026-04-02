import { useAccount, useReadContract } from 'wagmi';
import { useMemo } from 'react';
import { GameifiedMarketplaceQuestsABI } from '../../lib/export/abis/legacy';
import { CONTRACT_ADDRESSES } from '../../lib/export/config/legacy';
import type { Quest } from '../../types/contracts';

const MARKETPLACE_CONTRACT_ADDRESS = CONTRACT_ADDRESSES.GameifiedMarketplaceQuests as `0x${string}`;

interface UseQuestsReturn {
  activeQuests: Quest[];
  completedQuests: bigint[];
  isLoading: boolean;
  error: Error | null;
  totalActiveQuests: number;
}

/**
 * Hook para gestionar quests (misiones) en el marketplace gamificado
 * Permite ver quests activas y el progreso del usuario
 */
export function useQuests(): UseQuestsReturn {
  // TODO: Implementar lógica para obtener todas las quests activas
  // Actualmente retorna datos de ejemplo
  // Será necesario integrar con el contrato cuando esté disponible

  const activeQuests = useMemo(() => {
    // Aquí deberías hacer múltiples llamadas para obtener cada quest
    // o implementar una función en el contrato que devuelva todas las quests
    return [] as Quest[];
  }, []);

  const completedQuests = useMemo(() => {
    // Retornar IDs de quests completadas por el usuario
    return [] as bigint[];
  }, []);

  const totalActiveQuests = useMemo(() => {
    return activeQuests.filter(q => q.isActive).length;
  }, [activeQuests]);

  return {
    activeQuests,
    completedQuests,
    isLoading: false,
    error: null,
    totalActiveQuests,
  };
}

/**
 * Hook para obtener detalles de una quest específica
 */
export function useQuestDetails(questId: bigint | null) {
  const { address, isConnected } = useAccount();

  const contractConfig = {
    address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
    abi: GameifiedMarketplaceQuestsABI.abi,
  };

  const { data: questData, isLoading } = useReadContract({
    ...contractConfig,
    functionName: 'getQuest',
    args: [questId],
    query: { 
      enabled: !!questId && !!address && isConnected,
      staleTime: 60000,
    }
  });

  const { data: questProgress } = useReadContract({
    ...contractConfig,
    functionName: 'getUserQuestProgress',
    args: [address, questId],
    query: { 
      enabled: !!questId && !!address && isConnected,
      staleTime: 30000,
    }
  });

  const quest = useMemo(() => {
    if (!questData || !Array.isArray(questData)) return null;

    return {
      id: BigInt(questData[0] || 0),
      name: questData[3] as string,
      description: questData[4] as string,
      xpReward: BigInt(questData[6] || 0),
      tokenReward: BigInt(questData[7] || 0),
      requirement: BigInt(questData[5] || 0),
      questType: Number(questData[2]),
      deadline: BigInt(questData[10] || 0),
      isActive: Boolean(questData[8]),
    } as Quest;
  }, [questData]);

  const isCompleted = useMemo(() => {
    if (!questProgress || !Array.isArray(questProgress)) return false;
    return Boolean(questProgress[2]);
  }, [questProgress]);

  return {
    quest,
    isCompleted,
    isLoading,
  };
}
