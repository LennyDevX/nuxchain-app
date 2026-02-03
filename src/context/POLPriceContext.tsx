import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { POLPriceContext, type POLPriceContextType } from './POLPriceContextDef';

interface POLPriceData {
  usd: number;
  usd_24h_change: number;
}

interface CachedPriceData {
  price: number;
  change: number;
  timestamp: number;
}

// Constants
const CACHE_KEY = 'pol_price_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const MIN_FETCH_INTERVAL = 30000; // 30 seconds between attempts
const FALLBACK_PRICE = 0.45;
const RATE_LIMIT_BACKOFF = 5 * 60 * 1000; // 5 minutes

/**
 * Provider para POL Price - Centraliza las llamadas a CoinGecko
 * Evita múltiples requests concurrentes desde diferentes componentes
 */
export function POLPriceProvider({ children }: { children: ReactNode }) {
  const [polPrice, setPOLPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lastFetchAttempt = useRef<number>(0);
  const rateLimitBackoff = useRef<number>(0);
  const fetchPromise = useRef<Promise<void> | null>(null); // ✅ Deduplicación de requests

  /**
   * Load cached price from localStorage
   */
  const loadCachedPrice = useCallback((): CachedPriceData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: CachedPriceData = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp < CACHE_DURATION) {
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Save price to localStorage cache
   */
  const savePriceToCache = useCallback((price: number, change: number) => {
    try {
      const data: CachedPriceData = {
        price,
        change,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {
      // Ignore cache errors
    }
  }, []);

  /**
   * Fetch POL price from CoinGecko API
   * ✅ Implementa deduplicación: si hay una request en vuelo, retorna la misma promesa
   * ✅ Intenta usar el proxy backend primero, luego fallback directo a CoinGecko
   */
  const fetchPOLPrice = useCallback(async (): Promise<void> => {
    const now = Date.now();

    // ✅ DEDUPLICACIÓN: Si ya hay una request en vuelo, espera a que termine
    if (fetchPromise.current) {
      return fetchPromise.current;
    }

    // Rate limit backoff check
    if (rateLimitBackoff.current > 0 && now < rateLimitBackoff.current) {
      console.debug('Rate limit backoff active, waiting before retry');
      return;
    }

    // Prevent too frequent requests (minimum 30 seconds between attempts)
    if (now - lastFetchAttempt.current < MIN_FETCH_INTERVAL) {
      return;
    }

    lastFetchAttempt.current = now;

    // ✅ Crear promesa que se ejecutará una sola vez
    const promise = (async () => {
      try {
        setLoading(true);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        let response: Response | null = null;
        let useBackendProxy = false;

        // ✅ En producción (Vercel): usar proxy backend
        // En desarrollo: usar CoinGecko directo (el proxy requiere servidor local)
        const isProduction = import.meta.env.PROD;

        if (isProduction) {
          // Intentar usar el proxy backend primero (en Vercel)
          try {
            response = await fetch('/api/price/pol', {
              signal: controller.signal,
              mode: 'cors',
              headers: { 'Accept': 'application/json' }
            });
            useBackendProxy = true;
          } catch {
            // Si el proxy falla, usar CoinGecko directo
            console.debug('Backend proxy failed, falling back to CoinGecko direct');
            response = await fetch(
              'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true',
              {
                signal: controller.signal,
                mode: 'cors'
              }
            );
          }
        } else {
          // En desarrollo: usar CoinGecko directo
          response = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true',
            {
              signal: controller.signal,
              mode: 'cors'
            }
          );
        }

        clearTimeout(timeoutId);

        if (response.status === 429) {
          // Rate limited - set backoff for 5 minutes
          rateLimitBackoff.current = now + RATE_LIMIT_BACKOFF;
          console.warn('CoinGecko rate limit reached (429), retrying in 5 minutes');

          // Try to use cached price or fallback
          const cached = loadCachedPrice();
          if (cached) {
            setPOLPrice(cached.price);
            setPriceChange24h(cached.change);
          } else {
            setPOLPrice(FALLBACK_PRICE);
            setPriceChange24h(0);
          }
          setError('Rate limited by CoinGecko');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Parse response desde proxy o directo de CoinGecko
        let polData: POLPriceData;
        if (useBackendProxy) {
          polData = {
            usd: data.polPrice,
            usd_24h_change: data.priceChange24h
          };
        } else {
          polData = data['polygon-ecosystem-token'];
        }

        if (polData && polData.usd) {
          setPOLPrice(polData.usd);
          setPriceChange24h(polData.usd_24h_change);
          savePriceToCache(polData.usd, polData.usd_24h_change);
          rateLimitBackoff.current = 0; // Reset backoff on success
          setError(null);
        } else {
          throw new Error('POL price data not found');
        }
      } catch (err) {
        // Silent error handling - don't spam console
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch POL price';

        // Only log if not a network/abort error
        if (!errorMessage.includes('aborted') && !errorMessage.includes('Failed to fetch')) {
          console.debug('Error fetching POL price:', errorMessage);
        }

        setError(errorMessage);

        // Try to use cached price or fallback
        const cached = loadCachedPrice();
        if (cached) {
          setPOLPrice(cached.price);
          setPriceChange24h(cached.change);
        } else {
          setPOLPrice(FALLBACK_PRICE);
          setPriceChange24h(0);
        }
      } finally {
        setLoading(false);
        fetchPromise.current = null; // Clear promise reference after completion
      }
    })();

    fetchPromise.current = promise;
    return promise;
  }, [loadCachedPrice, savePriceToCache]);

  const convertPOLToUSD = useCallback((polAmount: number): string => {
    if (!polPrice) return '$0.00';
    const usdValue = polAmount * polPrice;
    return `$${usdValue.toFixed(2)}`;
  }, [polPrice]);

  /**
   * Initialize: Load cached price and start fetching
   */
  useEffect(() => {
    // Try to load cached price first
    const cached = loadCachedPrice();
    if (cached) {
      setPOLPrice(cached.price);
      setPriceChange24h(cached.change);
      setLoading(false);
    }

    // Fetch fresh price
    fetchPOLPrice();

    // Refresh price every 10 minutes to respect rate limits
    const interval = setInterval(() => {
      fetchPOLPrice();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchPOLPrice, loadCachedPrice]);

  const value: POLPriceContextType = {
    polPrice,
    priceChange24h,
    loading,
    error,
    convertPOLToUSD,
    refreshPrice: fetchPOLPrice
  };

  return (
    <POLPriceContext.Provider value={value}>
      {children}
    </POLPriceContext.Provider>
  );
}
