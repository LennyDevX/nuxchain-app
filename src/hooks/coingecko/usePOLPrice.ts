import { useState, useEffect, useRef } from 'react';

interface POLPriceData {
  usd: number;
  usd_24h_change: number;
}

interface CachedPriceData {
  price: number;
  change: number;
  timestamp: number;
}

interface UsePOLPriceReturn {
  polPrice: number | null;
  priceChange24h: number | null;
  loading: boolean;
  error: string | null;
  convertPOLToUSD: (polAmount: number) => string;
}

// Cache key for localStorage
const CACHE_KEY = 'pol_price_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const FALLBACK_PRICE = 0.45; // Fallback POL price if API fails

const usePOLPrice = (): UsePOLPriceReturn => {
  const [polPrice, setPOLPrice] = useState<number | null>(null);
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchAttempt = useRef<number>(0);
  const rateLimitBackoff = useRef<number>(0);

  // Load cached price from localStorage
  const loadCachedPrice = (): CachedPriceData | null => {
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
  };

  // Save price to localStorage cache
  const savePriceToCache = (price: number, change: number) => {
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
  };

  const fetchPOLPrice = async () => {
    const now = Date.now();
    
    // Implement exponential backoff for rate limiting
    if (rateLimitBackoff.current > 0 && now < rateLimitBackoff.current) {
      console.log('Rate limit backoff active, using cached/fallback price');
      return;
    }
    
    // Prevent too frequent requests (minimum 30 seconds between attempts)
    if (now - lastFetchAttempt.current < 30000) {
      return;
    }
    
    lastFetchAttempt.current = now;
    
    try {
      setLoading(true);
      setError(null);
      
      // Using CoinGecko's API with aggressive error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true',
        { 
          signal: controller.signal,
          mode: 'cors'
        }
      );
      
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        // Rate limited - set backoff for 5 minutes
        rateLimitBackoff.current = now + 5 * 60 * 1000;
        console.warn('CoinGecko rate limit reached, using cached/fallback price');
        
        // Try to use cached price or fallback
        const cached = loadCachedPrice();
        if (cached) {
          setPOLPrice(cached.price);
          setPriceChange24h(cached.change);
        } else {
          setPOLPrice(FALLBACK_PRICE);
          setPriceChange24h(0);
        }
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const polData: POLPriceData = data['polygon-ecosystem-token'];
      
      if (polData) {
        setPOLPrice(polData.usd);
        setPriceChange24h(polData.usd_24h_change);
        savePriceToCache(polData.usd, polData.usd_24h_change);
        rateLimitBackoff.current = 0; // Reset backoff on success
      } else {
        throw new Error('POL price data not found');
      }
    } catch (err) {
      // Silent error handling - don't spam console
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch POL price';
      
      // Only log if not a network/abort error
      if (!errorMessage.includes('aborted') && !errorMessage.includes('Failed to fetch')) {
        console.warn('Error fetching POL price:', errorMessage);
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
    }
  };

  const convertPOLToUSD = (polAmount: number): string => {
    if (!polPrice) return '$0.00';
    const usdValue = polAmount * polPrice;
    return `$${usdValue.toFixed(2)}`;
  };

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
    }, 10 * 60 * 1000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    polPrice,
    priceChange24h,
    loading,
    error,
    convertPOLToUSD
  };
};

export default usePOLPrice;