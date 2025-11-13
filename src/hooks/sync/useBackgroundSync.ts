/**
 * 🔄 useBackgroundSync Hook
 * 
 * React hook for queueing transactions with background sync
 * Automatically retries failed transactions when connection is restored
 * 
 * Usage:
 * ```tsx
 * const { queueTx, pendingCount, isPending } = useBackgroundSync();
 * 
 * // Queue a transaction
 * try {
 *   await queueTx({
 *     type: 'staking',
 *     url: '/api/stake',
 *     method: 'POST',
 *     body: { amount: '100' },
 *     metadata: { userAddress: address }
 *   });
 * } catch (error) {
 *   // Transaction will be retried automatically
 * }
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import {
  queueTransaction,
  getPendingTransactions,
  getTransactionCountByType,
  isIndexedDBAvailable,
  type PendingTransaction,
} from '../../utils/indexedDB/transactionQueue';

export interface UseBackgroundSyncReturn {
  /** Queue a transaction for background sync */
  queueTx: (tx: Omit<PendingTransaction, 'id' | 'timestamp' | 'retries'>) => Promise<string>;
  /** Total number of pending transactions */
  pendingCount: number;
  /** Pending count by transaction type */
  pendingByType: Record<string, number>;
  /** All pending transactions */
  pendingTransactions: PendingTransaction[];
  /** Whether there are pending transactions */
  isPending: boolean;
  /** Whether background sync is supported */
  isSupported: boolean;
  /** Refresh pending transactions list */
  refresh: () => Promise<void>;
}

export function useBackgroundSync(): UseBackgroundSyncReturn {
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingByType, setPendingByType] = useState<Record<string, number>>({});
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isSupported] = useState(() => {
    return isIndexedDBAvailable() && 'serviceWorker' in navigator && 'SyncManager' in window;
  });

  /**
   * Refresh pending transactions from IndexedDB
   */
  const refresh = useCallback(async () => {
    if (!isSupported) return;

    try {
      const [transactions, countByType] = await Promise.all([
        getPendingTransactions(),
        getTransactionCountByType(),
      ]);

      setPendingTransactions(transactions);
      setPendingCount(transactions.length);
      setPendingByType(countByType);
    } catch (error) {
      console.error('❌ [useBackgroundSync] Failed to refresh:', error);
    }
  }, [isSupported]);

  /**
   * Queue transaction and request background sync
   */
  const queueTx = useCallback(
    async (tx: Omit<PendingTransaction, 'id' | 'timestamp' | 'retries'>): Promise<string> => {
      if (!isSupported) {
        throw new Error('Background sync not supported in this browser');
      }

      try {
        // Add to IndexedDB
        const txId = await queueTransaction(tx);

        // Request background sync from Service Worker
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          const registration = await navigator.serviceWorker.ready;
          
          if ('sync' in registration) {
            try {
              // Type assertion for SyncManager
              const syncManager = (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync;
              await syncManager.register('sync-transactions');
              console.log('✅ [useBackgroundSync] Background sync registered');
            } catch (syncError) {
              console.warn('⚠️ [useBackgroundSync] Sync registration failed:', syncError);
              // Not critical - transaction is still queued
            }
          }
        }

        // Refresh pending list
        await refresh();

        return txId;
      } catch (error) {
        console.error('❌ [useBackgroundSync] Failed to queue transaction:', error);
        throw error;
      }
    },
    [isSupported, refresh]
  );

  /**
   * Listen for sync messages from Service Worker
   */
  useEffect(() => {
    if (!isSupported || !navigator.serviceWorker) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        console.log('✅ [useBackgroundSync] Sync completed by SW');
        refresh();
      } else if (event.data?.type === 'SYNC_FAILED') {
        console.warn('⚠️ [useBackgroundSync] Sync failed:', event.data.error);
        refresh();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [isSupported, refresh]);

  /**
   * Refresh on mount and when online/offline changes
   */
  useEffect(() => {
    if (!isSupported) return;

    const handleOnline = () => {
      console.log('🌐 [useBackgroundSync] Online - checking pending transactions');
      // Use timeout to avoid synchronous setState
      setTimeout(refresh, 0);
    };

    const handleOffline = () => {
      console.log('📴 [useBackgroundSync] Offline');
    };

    // Initial load with delay
    const initTimer = setTimeout(refresh, 100);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSupported, refresh]);

  return {
    queueTx,
    pendingCount,
    pendingByType,
    pendingTransactions,
    isPending: pendingCount > 0,
    isSupported,
    refresh,
  };
}
