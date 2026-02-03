/**
 * Hook unificado para datos de mercado
 * Funciona en local (localhost:3003) y producción (Vercel serverless)
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================
export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export interface PriceData {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

interface UseMarketDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// ============================================================================
// CONFIG
// ============================================================================
// Auto-detecta entorno: local usa localhost:3003, production usa /api
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3003/api' 
  : '/api';

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook para obtener datos completos del mercado (gainers + losers + trending)
 * Usa el endpoint unificado de Vercel
 */
export function useMarketOverview(limit = 6): UseMarketDataReturn<{
  gainers: CoinData[];
  losers: CoinData[];
  trending: CoinData[];
}> {
  const [data, setData] = useState<{
    gainers: CoinData[];
    losers: CoinData[];
    trending: CoinData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/market/prices?limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[useMarketOverview] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market overview');
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Actualizar cada 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener top gainers (mayores ganancias 24h)
 */
export function useTopGainers(limit = 10): UseMarketDataReturn<CoinData[]> {
  const [data, setData] = useState<CoinData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/market/prices?action=gainers&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[useTopGainers] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch gainers');
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener top losers (mayores pérdidas 24h)
 */
export function useTopLosers(limit = 10): UseMarketDataReturn<CoinData[]> {
  const [data, setData] = useState<CoinData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/market/prices?action=losers&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[useTopLosers] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch losers');
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener monedas con mayor volumen relativo
 */
export function useHighestVolume(limit = 10): UseMarketDataReturn<CoinData[]> {
  const [data, setData] = useState<CoinData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/market/prices?action=volume&limit=${limit}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[useHighestVolume] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch volume data');
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener precio de un símbolo específico
 */
export function useSymbolPrice(symbol: string): UseMarketDataReturn<PriceData> {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbol) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${API_BASE_URL}/market/prices?action=price&symbol=${symbol.toLowerCase()}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error(`[useSymbolPrice] Error for ${symbol}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

/**
 * Hook para obtener precios de múltiples símbolos
 */
export function useMultiplePrices(symbols: string[]): UseMarketDataReturn<PriceData> {
  const [data, setData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbols || symbols.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const symbolsParam = symbols.map(s => s.toLowerCase()).join(',');
      const response = await fetch(
        `${API_BASE_URL}/market/prices?action=prices&symbols=${symbolsParam}`
      );
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setLoading(false);
    } catch (err) {
      console.error('[useMultiplePrices] Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      setLoading(false);
    }
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
