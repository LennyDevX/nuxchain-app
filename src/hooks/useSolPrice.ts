/**
 * useSolPrice — Live SOL/USD price from backend proxy
 *
 * Calls `/api/price/solana` which proxies CoinGecko with caching.
 * This avoids CORS issues and rate limiting in the browser.
 *
 * Refreshes every 60 seconds and provides `getSolAmount(usd)` to calculate
 * how much SOL equals a given USD amount.
 *
 * Falls back to a conservative estimate if the API fails.
 */

import { useState, useEffect, useCallback } from 'react';

// Conservative fallback — updated 2026-03 (~$90)
const SOL_FALLBACK_PRICE = 90;

interface UseSolPriceReturn {
  solPrice: number | null;
  loading: boolean;
  error: boolean;
  /** Returns the SOL amount needed to equal usdAmount at current price, rounded up to 4 decimals */
  getSolAmount: (usdAmount: number) => number;
  refetch: () => Promise<void>;
}

export function useSolPrice(): UseSolPriceReturn {
  const [solPrice, setSolPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchPrice = useCallback(async () => {
    // In local dev, skip the API call entirely — avoid auth errors from the Gemini server.
    // The fallback price ($90) is good enough for development.
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setSolPrice(SOL_FALLBACK_PRICE);
      setLoading(false);
      return;
    }
    try {
      setError(false);
      const res = await fetch('/api/price/solana', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { success: boolean; solana: { usd: number } };
      if (data?.success && data?.solana?.usd) {
        setSolPrice(data.solana.usd);
      }
    } catch (err) {
      console.warn('[useSolPrice] fetch failed:', err);
      setError(true);
      // Keep previous price if available, else use fallback
      setSolPrice(prev => prev ?? SOL_FALLBACK_PRICE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000); // refresh every minute
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const getSolAmount = useCallback(
    (usdAmount: number): number => {
      const price = solPrice ?? SOL_FALLBACK_PRICE;
      if (price <= 0) return usdAmount / SOL_FALLBACK_PRICE;
      // Round up to 4 decimal places
      return Math.ceil((usdAmount / price) * 10_000) / 10_000;
    },
    [solPrice]
  );

  return { solPrice, loading, error, getSolAmount, refetch: fetchPrice };
}
