import { useEffect, useCallback } from 'react';
import { clearSubgraphCache } from '../../lib/apollo-client';

/**
 * ✅ Hook to listen for blockchain transaction events and auto-refresh subgraph data
 * 
 * Usage:
 * - Dispatches custom events after successful transactions
 * - Other components listen to these events to refresh their data
 * - Automatically clears Apollo cache to force fresh queries
 * 
 * Supported events:
 * - transactionSuccess: Generic transaction completed
 * - stakingDeposit: Staking deposit completed
 * - stakingWithdraw: Staking withdrawal completed
 * - stakingCompound: Compound rewards completed
 * - skillPurchased: Skill purchased
 * - nftMinted: NFT minted
 * - nftSold: NFT sold
 * - nftPurchased: NFT purchased
 */

export interface TransactionEventDetail {
  txHash: string;
  type: 'deposit' | 'withdraw' | 'compound' | 'skill_purchase' | 'nft_mint' | 'nft_sale' | 'nft_purchase';
  timestamp: number;
}

/**
 * Dispatch transaction event for listeners
 */
export function dispatchTransactionEvent(eventName: string, detail: TransactionEventDetail) {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
  
  console.log(
    `%c🎯 Transaction Event Dispatched%c\n` +
    `├─ Event: ${eventName}\n` +
    `├─ Type: ${detail.type}\n` +
    `├─ TxHash: ${detail.txHash}\n` +
    `└─ Timestamp: ${new Date(detail.timestamp).toLocaleString()}`,
    'color: #ff69b4; font-weight: bold;',
    'color: #ffffff;'
  );
}

/**
 * Hook to listen for transaction events and auto-refresh activities
 * 
 * @param onRefresh - Callback function to execute when transaction is detected
 * @param options - Configuration options
 */
export function useTransactionWatcher(
  onRefresh: () => Promise<void> | void,
  options: {
    clearCache?: boolean;
    delay?: number; // Delay in milliseconds before refreshing (to wait for subgraph indexing)
  } = {}
) {
  const { clearCache = true, delay = 3000 } = options;

  const handleTransactionSuccess = useCallback(async (event: Event) => {
    if (event instanceof CustomEvent) {
      const detail = event.detail as TransactionEventDetail;
      
      console.log(
        `%c🔄 Auto-Refreshing After Transaction%c\n` +
        `├─ Type: ${detail.type}\n` +
        `├─ Delay: ${delay}ms (waiting for subgraph indexing)\n` +
        `└─ Clear Cache: ${clearCache}`,
        'color: #32cd32; font-weight: bold;',
        'color: #ffffff;'
      );

      // Wait for subgraph to index the transaction
      await new Promise(resolve => setTimeout(resolve, delay));

      // Clear cache if enabled
      if (clearCache) {
        await clearSubgraphCache();
      }

      // Execute refresh callback
      await onRefresh();

      console.log('✅ [Auto-Refresh] Data refreshed successfully');
    }
  }, [onRefresh, clearCache, delay]);

  useEffect(() => {
    // Listen for all transaction events
    const events = [
      'transactionSuccess',
      'stakingDeposit',
      'stakingWithdraw',
      'stakingCompound',
      'skillPurchased',
      'nftMinted',
      'nftSold',
      'nftPurchased',
    ];

    events.forEach(eventName => {
      window.addEventListener(eventName, handleTransactionSuccess);
    });

    return () => {
      events.forEach(eventName => {
        window.removeEventListener(eventName, handleTransactionSuccess);
      });
    };
  }, [handleTransactionSuccess]);
}
