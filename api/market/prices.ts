/**
 * Market Prices API - Vercel Serverless Function
 * Endpoint: GET /api/market/prices
 * 
 * Proxy para CoinGecko API que proporciona datos de mercado:
 * - Top Gainers (mayores ganancias 24h)
 * - Top Losers (mayores pérdidas 24h)
 * - Trending (mayor volumen relativo)
 * - Precios individuales y múltiples
 * 
 * Ventajas:
 * - Evita problemas de CORS desde el navegador
 * - Permite caching server-side para mejor rendimiento
 * - Distribuye rate limits del servidor
 * - Agrega headers CORS correctos
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';
const CACHE_DURATION = 60 * 1000; // 60 segundos - actualización rápida para datos de mercado

// Tipos
interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

interface PriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
    usd_market_cap?: number;
    usd_24h_vol?: number;
  };
}

interface CacheEntry<T = unknown> {
  data: T;
  timestamp: number;
}

// Cache en memoria (se resetea en cada cold start de Vercel)
const cache = new Map<string, CacheEntry<unknown>>();

// Rate limiting básico
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_REQUESTS = 60; // 60 requests por minuto por IP
const RATE_LIMIT_WINDOW = 60 * 1000;

/**
 * Verifica si una IP está rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientRequests = requestLog.get(ip) || [];
  
  // Limpiar requests antiguos
  const recentRequests = clientRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
    return true;
  }
  
  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  
  return false;
}

/**
 * Obtiene datos del cache si están disponibles y no han expirado
 */
function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  
  if (!cached) {
    return null;
  }
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

/**
 * Guarda datos en el cache
 */
function setCache<T>(key: string, data: T): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
}

/**
 * Obtiene los top 100 coins por market cap desde CoinGecko
 */
async function fetchMarketData(): Promise<CoinData[]> {
  const cacheKey = 'market_top_100';
  const cached = getFromCache<CoinData[]>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(
    `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as CoinData[];
  setCache<CoinData[]>(cacheKey, data);
  
  return data;
}

/**
 * Obtiene precio de un símbolo específico
 */
async function getSymbolPrice(symbol: string): Promise<PriceResponse> {
  const cacheKey = `price_${symbol.toLowerCase()}`;
  const cached = getFromCache<PriceResponse>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(
    `${COINGECKO_API_BASE}/simple/price?ids=${symbol.toLowerCase()}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json() as PriceResponse;
  setCache<PriceResponse>(cacheKey, data);
  
  return data;
}

/**
 * Obtiene precios de múltiples símbolos
 */
async function getMultiplePrices(symbols: string[]): Promise<PriceResponse> {
  const ids = symbols.map(s => s.toLowerCase()).join(',');
  const cacheKey = `prices_${ids}`;
  const cached = getFromCache<PriceResponse>(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const response = await fetch(
    `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`CoinGecko API error: ${response.status}`);
  }
  
  const data = await response.json() as PriceResponse;
  setCache<PriceResponse>(cacheKey, data);
  
  return data;
}

/**
 * Handler principal de la serverless function
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Only allow GET
  if (req.method !== 'GET') {
    res.status(405).json({ 
      error: 'Method not allowed',
      allowed: ['GET', 'OPTIONS']
    });
    return;
  }
  
  try {
    // Rate limiting por IP
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               (req.headers['x-real-ip'] as string) || 
               'unknown';
    
    if (isRateLimited(ip)) {
      res.status(429).json({ 
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }
    
    const { action, symbol, symbols, limit = '10' } = req.query;
    const limitNum = parseInt(limit as string, 10);
    
    // Si no hay acción, retornar market data completo
    if (!action) {
      const marketData = await fetchMarketData();
      
      // Separar en gainers, losers, y trending
      const gainers = [...marketData]
        .filter(coin => coin.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, limitNum);
      
      const losers = [...marketData]
        .filter(coin => coin.price_change_percentage_24h < 0)
        .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
        .slice(0, limitNum);
      
      const trending = [...marketData]
        .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
        .slice(0, limitNum);
      
      res.status(200).json({
        success: true,
        timestamp: Date.now(),
        data: {
          gainers,
          losers,
          trending,
          total: marketData.length
        }
      });
      return;
    }
    
    // Manejo de acciones específicas
    switch (action) {
      case 'gainers': {
        const marketData = await fetchMarketData();
        const gainers = marketData
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, limitNum);
        
        res.status(200).json({
          success: true,
          timestamp: Date.now(),
          data: gainers
        });
        break;
      }
      
      case 'losers': {
        const marketData = await fetchMarketData();
        const losers = marketData
          .filter(coin => coin.price_change_percentage_24h < 0)
          .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
          .slice(0, limitNum);
        
        res.status(200).json({
          success: true,
          timestamp: Date.now(),
          data: losers
        });
        break;
      }
      
      case 'volume': {
        const marketData = await fetchMarketData();
        const highVolume = marketData
          .sort((a, b) => (b.total_volume / b.market_cap) - (a.total_volume / a.market_cap))
          .slice(0, limitNum);
        
        res.status(200).json({
          success: true,
          timestamp: Date.now(),
          data: highVolume
        });
        break;
      }
      
      case 'price': {
        if (!symbol) {
          res.status(400).json({ 
            error: 'Bad request',
            message: 'Symbol parameter is required for price action'
          });
          return;
        }
        
        const priceData = await getSymbolPrice(symbol as string);
        
        res.status(200).json({
          success: true,
          timestamp: Date.now(),
          data: priceData
        });
        break;
      }
      
      case 'prices': {
        if (!symbols) {
          res.status(400).json({ 
            error: 'Bad request',
            message: 'Symbols parameter is required for prices action'
          });
          return;
        }
        
        const symbolsArray = (symbols as string).split(',');
        const pricesData = await getMultiplePrices(symbolsArray);
        
        res.status(200).json({
          success: true,
          timestamp: Date.now(),
          data: pricesData
        });
        break;
      }
      
      default:
        res.status(400).json({ 
          error: 'Bad request',
          message: `Unknown action: ${action}. Available actions: gainers, losers, volume, price, prices`
        });
    }
    
  } catch (error) {
    console.error('[Market API Error]', error);
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: Date.now()
    });
  }
}
