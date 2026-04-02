import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import {
  CONTRACT_ADDRESSES,
  QUEST_TYPE_NAMES,
  QuestCategory,
  QuestType,
} from '../../lib/export/config/legacy';
import { GameifiedMarketplaceQuestsABI } from '../../lib/export/abis/legacy';

const ADDRESS = CONTRACT_ADDRESSES.GameifiedMarketplaceQuests as `0x${string}`;
const ABI = GameifiedMarketplaceQuestsABI;

export { QuestType, QUEST_TYPE_NAMES };

export interface MarketplaceQuest {
  questId: bigint;
  questType: number;
  title: string;
  description: string;
  requirement: bigint;
  xpReward: bigint;
  active: boolean;
  createdAt: bigint;
}

export function useMarketplaceQuestAdmin() {
  const { address, isConnected } = useAccount();
  const [error, setError] = useState<string | null>(null);

  // ── Reads ──────────────────────────────────────────────────────────────────
  const {
    data: activeQuestsRaw,
    refetch: refetchQuests,
    isLoading: questsLoading,
  } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'getAllActiveQuests',
    query: { enabled: isConnected },
  });

  const { data: questSystemStats } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'getQuestSystemStats',
    query: { enabled: isConnected },
  });

  // ── Write: createQuest ─────────────────────────────────────────────────────
  const {
    writeContract: writeCreate,
    data: createHash,
    isPending: createPending,
    reset: resetCreate,
  } = useWriteContract();

  const { isLoading: createConfirming, isSuccess: createSuccess } =
    useWaitForTransactionReceipt({ hash: createHash });

  // ── Write: deactivateQuest ─────────────────────────────────────────────────
  const {
    writeContract: writeDeactivate,
    data: deactivateHash,
    isPending: deactivatePending,
    reset: resetDeactivate,
  } = useWriteContract();

  const { isLoading: deactivateConfirming, isSuccess: deactivateSuccess } =
    useWaitForTransactionReceipt({ hash: deactivateHash });

  // ── Write: updateQuestProgress ─────────────────────────────────────────────
  const {
    writeContract: writeUpdateProgress,
    data: updateProgressHash,
    isPending: updateProgressPending,
  } = useWriteContract();

  const { isLoading: updateProgressConfirming, isSuccess: updateProgressSuccess } =
    useWaitForTransactionReceipt({ hash: updateProgressHash });

  // ── Actions ────────────────────────────────────────────────────────────────
  const createQuest = useCallback(
    async (params: {
      questType: number;   // QuestType enum value (0–4)
      title: string;
      description: string;
      requirement: number; // target value e.g. buy 5 NFTs
      xpReward: number;
      polReward?: number;
      startTime?: number;
      deadline?: number;
      completionLimit?: number;
    }) => {
      if (!isConnected || !address) {
        setError('Wallet not connected');
        return;
      }
      setError(null);
      try {
        resetCreate();
        writeCreate({
          address: ADDRESS,
          abi: ABI,
          functionName: 'createQuest',
          args: [
            {
              category: QuestCategory.MARKETPLACE,
              questType: params.questType,
              title: params.title,
              description: params.description,
              requirement: BigInt(params.requirement),
              xpReward: BigInt(params.xpReward),
              polReward: BigInt(params.polReward ?? 0),
              startTime: BigInt(params.startTime ?? Math.floor(Date.now() / 1000)),
              deadline: BigInt(
                params.deadline ?? Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60
              ),
              completionLimit: BigInt(params.completionLimit ?? 0),
            },
          ],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create quest');
      }
    },
    [isConnected, address, writeCreate, resetCreate]
  );

  const deactivateQuest = useCallback(
    async (questId: bigint) => {
      if (!isConnected) { setError('Wallet not connected'); return; }
      setError(null);
      try {
        resetDeactivate();
        writeDeactivate({
          address: ADDRESS,
          abi: ABI,
          functionName: 'deactivateQuest',
          args: [questId],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to deactivate quest');
      }
    },
    [isConnected, writeDeactivate, resetDeactivate]
  );

  const updateQuestProgress = useCallback(
    async (user: `0x${string}`, questId: bigint) => {
      if (!isConnected) { setError('Wallet not connected'); return; }
      setError(null);
      try {
        writeUpdateProgress({
          address: ADDRESS,
          abi: ABI,
          functionName: 'updateQuestProgress',
          args: [user, questId],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update quest progress');
      }
    },
    [isConnected, writeUpdateProgress]
  );

  const refresh = useCallback(() => refetchQuests(), [refetchQuests]);

  // ── Parsed data ────────────────────────────────────────────────────────────
  const activeQuests: MarketplaceQuest[] = (() => {
    if (!activeQuestsRaw) return [];
    // getAllActiveQuests returns Quest[] array directly
    const raw = activeQuestsRaw as MarketplaceQuest[];
    if (!Array.isArray(raw)) return [];
    return raw;
  })();

  const systemStats = questSystemStats as {
    totalQuests: bigint;
    activeQuests: bigint;
    totalCompletions: bigint;
  } | undefined;

  return {
    // Data
    activeQuests,
    systemStats,
    questsLoading,

    // Actions
    createQuest,
    deactivateQuest,
    updateQuestProgress,
    refresh,

    // Create tx state
    createHash,
    createLoading: createPending || createConfirming,
    createSuccess,

    // Deactivate tx state
    deactivateHash,
    deactivateLoading: deactivatePending || deactivateConfirming,
    deactivateSuccess,

    // Update progress state
    updateProgressHash,
    updateProgressLoading: updateProgressPending || updateProgressConfirming,
    updateProgressSuccess,

    // General
    error,
    isConnected,
    address,
  };
}

export default useMarketplaceQuestAdmin;
