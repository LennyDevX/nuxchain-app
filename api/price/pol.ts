/**
 * API Endpoint: GET /api/price/pol
 * 
 * Proxy para CoinGecko API que:
 * - Evita problemas de CORS desde el navegador
 * - Permite caching server-side
 * - Distribuye rate limits del servidor en lugar del cliente
 * - Agrega headers CORS correctos
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cache para evitar llamadas repetidas en corto tiempo
interface CachedPrice {
  data: {
    price: number;
    change24h: number;
  };
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos - más corto que el cliente para propagación rápida
let priceCache: CachedPrice | null = null;

// Rate limiting básico
const requestLog = new Map<string, number[]>();
const RATE_LIMIT_REQUESTS = 30;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const clientRequests = requestLog.get(ip) || [];
  
  // Limpiar requests antiguos fuera de la ventana
  const recentRequests = clientRequests.filter(time => now - time < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
    return true;
  }
  
  // Guardar este nuevo request
  recentRequests.push(now);
  requestLog.set(ip, recentRequests);
  
  return false;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';

    // Verificar rate limiting
    if (isRateLimited(clientIp)) {
      return res.status(429).json({
        error: 'Rate limited',
        message: 'Too many requests, please try again later'
      });
    }

    // Verificar cache
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      // Retornar del cache con headers CORS
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      return res.status(200).json({
        polPrice: priceCache.data.price,
        priceChange24h: priceCache.data.change24h,
        cached: true,
        timestamp: priceCache.timestamp
      });
    }

    // Fetchar desde CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NuxChain-Backend/1.0'
        }
      }
    );

    if (response.status === 429) {
      // CoinGecko rate limited - retornar cache antiguo si existe
      if (priceCache) {
        console.warn('[POL Price] CoinGecko rate limited, returning stale cache');
        res.setHeader('X-Cache', 'stale');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json({
          polPrice: priceCache.data.price,
          priceChange24h: priceCache.data.change24h,
          cached: true,
          stale: true,
          timestamp: priceCache.timestamp
        });
      }
      
      return res.status(429).json({
        error: 'CoinGecko API rate limited',
        message: 'Please try again in a few moments'
      });
    }

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json() as Record<string, unknown>;
    const polData = data['polygon-ecosystem-token'] as Record<string, unknown> | undefined;

    if (polData && typeof polData === 'object' && 'usd' in polData) {
      const usd = polData.usd as number;
      const usd_24h_change = polData.usd_24h_change as number;

      // Guardar en cache
      priceCache = {
        data: {
          price: usd,
          change24h: usd_24h_change
        },
        timestamp: Date.now()
      };

      // Retornar con headers CORS y caching
      res.setHeader('Cache-Control', 'public, max-age=60');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('X-Cache', 'miss');

      return res.status(200).json({
        polPrice: usd,
        priceChange24h: usd_24h_change,
        cached: false,
        timestamp: Date.now()
      });
    } else {
      throw new Error('Invalid price data from CoinGecko');
    }
  } catch (error) {
    console.error('[POL Price API Error]:', error);

    // Retornar cache antiguo como fallback
    if (priceCache) {
      res.setHeader('X-Cache', 'stale-error');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json({
        polPrice: priceCache.data.price,
        priceChange24h: priceCache.data.change24h,
        cached: true,
        stale: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: priceCache.timestamp
      });
    }

    // Fallback price if no cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: 'Failed to fetch POL price',
      message: 'Using fallback price',
      polPrice: 0.45,
      priceChange24h: 0
    });
  }
}
