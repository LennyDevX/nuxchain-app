/**
 * API Endpoint: GET /api/price/pol
 *
 * Proxy para CoinGecko API que:
 * - Evita problemas de CORS desde el navegador
 * - Permite caching server-side con Upstash KV
 * - Distribuye rate limits del servidor en lugar del cliente
 * - Agrega headers CORS correctos
 */
import { kvCache } from '../_services/kv-cache-service.js';
const CACHE_TTL = 60; // 60 seconds - optimized for balance between freshness and performance
export default async function handler(req, res) {
    try {
        // Solo permitir GET
        if (req.method !== 'GET') {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET');
            return res.status(405).json({ error: 'Method not allowed' });
        }
        // Check rate limit using KV
        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const ipString = Array.isArray(clientIp) ? clientIp[0] : clientIp.toString();
        const rateLimitKey = `rate:pol:${ipString}`;
        const requests = await kvCache.increment(rateLimitKey, { ttl: 60 });
        if (requests > 30) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(429).json({
                error: 'Rate limit exceeded',
                message: 'Maximum 30 requests per minute'
            });
        }
        // Try to get from cache using KV
        const cacheKey = 'pol-price';
        const cached = await kvCache.get(cacheKey, {
            namespace: 'prices',
            ttl: CACHE_TTL
        });
        if (cached) {
            res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('X-Cache', 'HIT');
            return res.status(200).json({
                polPrice: cached.price,
                priceChange24h: cached.change24h,
                cached: true,
                timestamp: Date.now()
            });
        }
        // Fetch from CoinGecko
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=polygon-ecosystem-token&vs_currencies=usd&include_24hr_change=true', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'NuxChain-Backend/1.0'
            },
            signal: AbortSignal.timeout(5000) // 5s timeout
        });
        if (response.status === 429) {
            // Try to get stale cache
            const staleCache = await kvCache.get(cacheKey, { namespace: 'prices' });
            if (staleCache) {
                console.warn('[POL Price] CoinGecko rate limited, returning stale cache');
                res.setHeader('X-Cache', 'STALE');
                res.setHeader('Access-Control-Allow-Origin', '*');
                return res.status(200).json({
                    polPrice: staleCache.price,
                    priceChange24h: staleCache.change24h,
                    cached: true,
                    stale: true,
                    timestamp: Date.now()
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
        const data = await response.json();
        const polData = data['polygon-ecosystem-token'];
        if (polData && typeof polData === 'object' && 'usd' in polData) {
            const priceData = {
                price: polData.usd,
                change24h: polData.usd_24h_change
            };
            // Save to KV cache
            await kvCache.set(cacheKey, priceData, {
                namespace: 'prices',
                ttl: CACHE_TTL
            });
            // Return with headers
            res.setHeader('Cache-Control', `public, max-age=${CACHE_TTL}`);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('X-Cache', 'MISS');
            return res.status(200).json({
                polPrice: priceData.price,
                priceChange24h: priceData.change24h,
                cached: false,
                timestamp: Date.now()
            });
        }
        else {
            throw new Error('Invalid price data from CoinGecko');
        }
    }
    catch (error) {
        console.error('[POL Price API Error]:', error);
        // Try to get stale cache as fallback
        const staleCache = await kvCache.get('pol-price', { namespace: 'prices' });
        if (staleCache) {
            res.setHeader('X-Cache', 'STALE-ERROR');
            res.setHeader('Access-Control-Allow-Origin', '*');
            return res.status(200).json({
                polPrice: staleCache.price,
                priceChange24h: staleCache.change24h,
                cached: true,
                stale: true,
                error: error instanceof Error ? error.message : 'Unknown error',
                timestamp: Date.now()
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
