import { useState, useCallback } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '../../abi/contracts.config';
import type { CollaboratorQuest } from './useCollaboratorBadgeRewards';

const ADDRESS = CONTRACT_ADDRESSES.CollaboratorBadgeRewards as `0x${string}`;
const ABI = CONTRACT_ABIS.CollaboratorBadgeRewards;

export interface CollaboratorQuestWithId extends CollaboratorQuest {
  id: bigint;
}

export function useCollaboratorQuestAdmin() {
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
    functionName: 'getActiveQuests',
    query: { enabled: isConnected },
  });

  const { data: statsRaw } = useReadContract({
    address: ADDRESS,
    abi: ABI,
    functionName: 'getStats',
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

  // ── Write: updateQuestReward ───────────────────────────────────────────────
  const {
    writeContract: writeUpdateReward,
    data: updateRewardHash,
    isPending: updateRewardPending,
    reset: resetUpdateReward,
  } = useWriteContract();

  const { isLoading: updateRewardConfirming, isSuccess: updateRewardSuccess } =
    useWaitForTransactionReceipt({ hash: updateRewardHash });

  // ── Write: batchCompleteQuest ──────────────────────────────────────────────
  const {
    writeContract: writeBatch,
    data: batchHash,
    isPending: batchPending,
    reset: resetBatch,
  } = useWriteContract();

  const { isLoading: batchConfirming, isSuccess: batchSuccess } =
    useWaitForTransactionReceipt({ hash: batchHash });

  // ── Write: completeQuestForUser ────────────────────────────────────────────
  const {
    writeContract: writeSingleComplete,
    data: singleCompleteHash,
    isPending: singleCompletePending,
  } = useWriteContract();

  const { isLoading: singleCompleteConfirming, isSuccess: singleCompleteSuccess } =
    useWaitForTransactionReceipt({ hash: singleCompleteHash });

  // ── Actions ────────────────────────────────────────────────────────────────
  const createQuest = useCallback(
    async (params: {
      description: string;
      rewardAmountEther: string; // human-readable POL e.g. "10.5"
      startTime: number;         // Unix timestamp
      endTime: number;           // Unix timestamp
      maxCompletions: number;
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
            params.description,
            parseEther(params.rewardAmountEther),
            BigInt(params.startTime),
            BigInt(params.endTime),
            BigInt(params.maxCompletions),
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

  const updateQuestReward = useCallback(
    async (questId: bigint, newRewardEther: string) => {
      if (!isConnected) { setError('Wallet not connected'); return; }
      setError(null);
      try {
        resetUpdateReward();
        writeUpdateReward({
          address: ADDRESS,
          abi: ABI,
          functionName: 'updateQuestReward',
          args: [questId, parseEther(newRewardEther)],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update quest reward');
      }
    },
    [isConnected, writeUpdateReward, resetUpdateReward]
  );

  const batchCompleteQuest = useCallback(
    async (users: `0x${string}`[], questId: bigint) => {
      if (!isConnected) { setError('Wallet not connected'); return; }
      setError(null);
      try {
        resetBatch();
        writeBatch({
          address: ADDRESS,
          abi: ABI,
          functionName: 'batchCompleteQuest',
          args: [users, questId],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to batch complete quest');
      }
    },
    [isConnected, writeBatch, resetBatch]
  );

  const completeQuestForUser = useCallback(
    async (user: `0x${string}`, questId: bigint) => {
      if (!isConnected) { setError('Wallet not connected'); return; }
      setError(null);
      try {
        writeSingleComplete({
          address: ADDRESS,
          abi: ABI,
          functionName: 'completeQuestForUser',
          args: [user, questId],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to complete quest for user');
      }
    },
    [isConnected, writeSingleComplete]
  );

  const refresh = useCallback(() => refetchQuests(), [refetchQuests]);

  // ── Parsed data ────────────────────────────────────────────────────────────
  // getActiveQuests returns (uint256[] ids, CollaboratorQuest[] questData)
  const activeQuests: CollaboratorQuestWithId[] = (() => {
    if (!activeQuestsRaw) return [];
    const raw = activeQuestsRaw as { ids?: bigint[]; questData?: CollaboratorQuest[] };
    const ids = raw.ids ?? [];
    const quests = raw.questData ?? [];
    return quests.map((q, i) => ({ ...q, id: ids[i] ?? BigInt(i) }));
  })();

  const totalQuestCount: number = statsRaw
    ? Number((statsRaw as bigint[])[6] ?? 0n)
    : 0;

  return {
    // Data
    activeQuests,
    totalQuestCount,
    questsLoading,

    // Actions
    createQuest,
    deactivateQuest,
    updateQuestReward,
    batchCompleteQuest,
    completeQuestForUser,
    refresh,

    // Create tx state
    createHash,
    createLoading: createPending || createConfirming,
    createSuccess,

    // Deactivate tx state
    deactivateHash,
    deactivateLoading: deactivatePending || deactivateConfirming,
    deactivateSuccess,

    // Update reward tx state
    updateRewardHash,
    updateRewardLoading: updateRewardPending || updateRewardConfirming,
    updateRewardSuccess,

    // Batch tx state
    batchHash,
    batchLoading: batchPending || batchConfirming,
    batchSuccess,

    // Single complete state
    singleCompleteHash,
    singleCompleteLoading: singleCompletePending || singleCompleteConfirming,
    singleCompleteSuccess,

    // General
    error,
    isConnected,
    address,
  };
}

export default useCollaboratorQuestAdmin;
