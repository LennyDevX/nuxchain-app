/**
 * GET /api/price/solana
 * Proxy para obtener precio de SOL desde CoinGecko con caché
 * Evita CORS y rate limiting en el frontend
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { kvCache } from '../_services/kv-cache-service.js';

interface PriceData {
  price: number;
}

const CACHE_TTL = 60; // 60 seconds

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Solo permitir GET
    if (req.method !== 'GET') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Try to get from cache
    const cacheKey = 'sol-price';
    const cached = await kvCache.get<PriceData>(cacheKey, { 
      namespace: 'prices',
      ttl: CACHE_TTL 
    });

    if (cached) {
      res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json({
        success: true,
        solana: { usd: cached.price },
        source: 'cache',
        timestamp: Date.now(),
      });
    }

    // Fetch from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'NuxChain-Backend/1.0'
        },
        signal: AbortSignal.timeout(5000) // 5s timeout
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko returned ${response.status}`);
    }

    const data = await response.json() as { solana: { usd: number } };
    const solPrice = data.solana.usd;

    // Store in cache
    await kvCache.set(cacheKey, { price: solPrice }, { 
      namespace: 'prices',
      ttl: CACHE_TTL 
    });

    res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json({
      success: true,
      solana: { usd: solPrice },
      source: 'coingecko',
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error('[/api/price/solana] Error:', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch SOL price',
      timestamp: Date.now(),
    });
  }
}
