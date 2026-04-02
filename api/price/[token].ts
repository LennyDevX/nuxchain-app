/**
 * Dynamic Price Router
 * Consolidates price endpoints into a single Serverless Function
 * 
 * Routes:
 * GET /api/price/pol
 * GET /api/price/solana
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvCache } from '../_services/kv-cache-service.js';

interface PriceData {
  price: number;
  change24h?: number;
}

const COINGECKO_MAP: Record<string, string> = {
  pol: 'polygon-ecosystem-token',
  polygon: 'polygon-ecosystem-token',
  solana: 'solana',
  sol: 'solana',
};

const CACHE_TTL = 60; // 60 seconds

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const token = (req.query.token as string)?.toLowerCase();
    if (!token || !COINGECKO_MAP[token]) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(400).json({ error: `Unknown token: ${token}` });
    }

    // Rate limiting by IP
    const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
    const ipString = Array.isArray(clientIp) ? clientIp[0] : clientIp.toString();
    const rateLimitKey = `rate:price:${ipString}`;
    
    const requests = await kvCache.increment(rateLimitKey, { ttl: 60 });
    if (requests > 60) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Maximum 60 requests per minute'
      });
    }

    // Try cache
    const cacheKey = `${token}-price`;
    const cached = await kvCache.get<PriceData>(cacheKey, { 
      namespace: 'prices',
      ttl: CACHE_TTL 
    });

    if (cached) {
      res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Cache', 'HIT');
      
      // Return in both formats for compatibility
      if (token === 'pol' || token === 'polygon') {
        return res.status(200).json({
          polPrice: cached.price,
          priceChange24h: cached.change24h,
          cached: true,
          timestamp: Date.now()
        });
      } else {
        return res.status(200).json({
          success: true,
          [token]: { usd: cached.price },
          source: 'cache',
          timestamp: Date.now(),
        });
      }
    }

    // Fetch from CoinGecko
    const geckoId = COINGECKO_MAP[token];
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd&include_24hr_change=true`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'NuxChain-Backend/1.0'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (response.status === 429) {
      // Return stale cache if available
      const stale = await kvCache.get<PriceData>(cacheKey, { 
        namespace: 'prices',
        ttl: CACHE_TTL * 3  // 3 minutes stale
      });
      
      if (stale) {
        res.setHeader('X-Cache', 'STALE');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (token === 'pol' || token === 'polygon') {
          return res.status(200).json({
            polPrice: stale.price,
            priceChange24h: stale.change24h,
            cached: true,
            stale: true,
            timestamp: Date.now()
          });
        } else {
          return res.status(200).json({
            success: true,
            [token]: { usd: stale.price },
            source: 'stale-cache',
            timestamp: Date.now(),
          });
        }
      }
      
      return res.status(503).json({ error: 'Service temporarily unavailable' });
    }

    if (!response.ok) {
      throw new Error(`CoinGecko error: ${response.status}`);
    }

    const data = await response.json();
    const priceData: PriceData = {
      price: data[geckoId]?.usd || 0,
      change24h: data[geckoId]?.[`usd_24h_change`] || 0,
    };

    // Cache the result
    await kvCache.set(cacheKey, priceData, { 
      namespace: 'prices',
      ttl: CACHE_TTL 
    });

    res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Cache', 'MISS');

    if (token === 'pol' || token === 'polygon') {
      return res.status(200).json({
        polPrice: priceData.price,
        priceChange24h: priceData.change24h,
        cached: false,
        timestamp: Date.now()
      });
    } else {
      return res.status(200).json({
        success: true,
        [token]: { usd: priceData.price },
        source: 'coingecko',
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.error('[price/[token]]', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: 'Failed to fetch price' });
  }
}
