/**
 * Giveaway Tracker Hook
 * Automatically tracks P2P market trades for the connected user wallet
 * Stores completed trades in localStorage (indexed by tx signature to avoid duplicates)
 * No manual entry needed — automated via event emissions from P2P Market
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface TradeRecord {
  txSignature: string;
  timestamp: number;
  type: 'sell' | 'buy'; // 'sell' = user created ad, 'buy' = user fulfilled ad
  amount: number; // NUX amount traded
}

const GIVEAWAY_STORAGE_KEY = 'nux_giveaway_trades_v1';
const GIVEAWAY_EVENT_NAME = 'nuxP2PTradeCompleted';

export function useGiveawayTracker() {
  const { publicKey } = useWallet();
  const [tradeCount, setTradeCount] = useState(0);
  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Load trades from localStorage on mount
  useEffect(() => {
    if (!publicKey) {
      setTradeCount(0);
      setTrades([]);
      return;
    }

    const stored = localStorage.getItem(GIVEAWAY_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Filter to only trades from the current wallet
        const walletTrades = parsed.filter(
          (t: TradeRecord) => t.txSignature.includes(publicKey.toBase58().slice(0, 8))
        );
        setTrades(walletTrades);
        setTradeCount(walletTrades.length);
      } catch (e) {
        console.error('Failed to parse stored trades:', e);
        setTrades([]);
        setTradeCount(0);
      }
    } else {
      setTrades([]);
      setTradeCount(0);
    }
  }, [publicKey]);

  // Listen for P2P trade completion events
  useEffect(() => {
    const handleTradeEvent = (event: Event) => {
      if (!(event instanceof CustomEvent)) return;

      const { txSignature, type, amount } = event.detail;
      if (!txSignature || !type || !publicKey) return;

      // Check if trade already recorded
      setTrades(prev => {
        const alreadyExists = prev.some(t => t.txSignature === txSignature);
        if (alreadyExists) return prev;

        const newTrade: TradeRecord = {
          txSignature,
          timestamp: Date.now(),
          type,
          amount,
        };

        const updated = [...prev, newTrade];
        localStorage.setItem(GIVEAWAY_STORAGE_KEY, JSON.stringify(updated));
        setTradeCount(updated.length);
        return updated;
      });
    };

    window.addEventListener(GIVEAWAY_EVENT_NAME, handleTradeEvent);
    return () => window.removeEventListener(GIVEAWAY_EVENT_NAME, handleTradeEvent);
  }, [publicKey]);

  // **Backward compatibility**: Emit trade event manually (for testing)
  // Used when P2P market integration isn't ready
  const addTradeManually = useCallback((txSignature: string, type: 'sell' | 'buy', amount: number) => {
    if (!publicKey) {
      console.warn('No wallet connected');
      return;
    }

    const event = new CustomEvent(GIVEAWAY_EVENT_NAME, {
      detail: { txSignature, type, amount },
    });
    window.dispatchEvent(event);
  }, [publicKey]);

  // Emit event from P2P market after successful trade
  // Usage in P2PMarketplace/AdCard after fulfillAd succeeds:
  // window.dispatchEvent(new CustomEvent('nuxP2PTradeCompleted', {
  //   detail: { txSignature: sig, type: 'buy', amount: adAmount }
  // }))
  const emitTradeEvent = useCallback((txSignature: string, type: 'sell' | 'buy', amount: number) => {
    const event = new CustomEvent(GIVEAWAY_EVENT_NAME, {
      detail: { txSignature, type, amount },
    });
    window.dispatchEvent(event);
  }, []);

  // Calculate tier based on trade count
  const getTier = () => {
    if (tradeCount <= 0) return null;
    if (tradeCount <= 4) return { level: 1, name: 'Trader', color: 'bg-slate-600' };
    if (tradeCount <= 14) return { level: 2, name: 'Active Trader', color: 'bg-blue-600' };
    if (tradeCount <= 29) return { level: 3, name: 'Power Trader', color: 'bg-purple-600' };
    return { level: 4, name: 'Elite Trader', color: 'bg-amber-600' };
  };

  return {
    tradeCount,
    trades,
    tier: getTier(),
    addTradeManually,
    emitTradeEvent,
  };
}

/**
 * HOW TO INTEGRATE WITH P2P MARKET:
 * 
 * In src/pages/P2PMarketplace.tsx or src/components/p2p/AdCard.tsx,
 * after a successful trade (fulfillAd), emit the event:
 * 
 * async function handleBuyAd(adId: string, nuxAmount: bigint) {
 *   try {
 *     const txSig = await fulfillAd(adId);
 *     // ✅ Emit giveaway event
 *     window.dispatchEvent(new CustomEvent('nuxP2PTradeCompleted', {
 *       detail: {
 *         txSignature: txSig,
 *         type: 'buy',
 *         amount: Number(nuxAmount),
 *       }
 *     }));
 *     toast.success('Trade completed! +1 entry to giveaway');
 *   } catch (e) { ... }
 * }
 */
