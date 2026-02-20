/**
 * Hook para obtener precios de tokens via Uniswap Price Feed API
 * Endpoint: GET /api/uniswap/prices
 * Polling cada 30 segundos
 */

import { useState, useEffect, useCallback } from 'react';

export interface TokenPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  color: string;
  source: 'uniswap' | 'coingecko' | 'fallback';
}

interface UseUniswapPricesReturn {
  data: TokenPrice[] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: number | null;
}

const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3003/api'
  : '/api';

export function useUniswapPrices(): UseUniswapPricesReturn {
  const [data, setData] = useState<TokenPrice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setError(null);

      const response = await fetch(`${API_BASE_URL}/uniswap/prices`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json() as {
        success: boolean;
        data: TokenPrice[];
        timestamp: number;
        error?: string;
      };

      setData(result.data);
      setLastUpdated(result.timestamp);
      setLoading(false);
    } catch (err) {
      console.error('[useUniswapPrices] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { data, loading, error, refetch: fetchPrices, lastUpdated };
}
