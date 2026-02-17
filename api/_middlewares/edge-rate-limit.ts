/**
 * Edge Rate Limiter for Vercel Edge Functions
 * Works with Vite/React apps (no Next.js required)
 * 
 * Usage: Add this as middleware in Vercel config
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { kv } from '@vercel/kv';

// Rate limit tiers
const RATE_LIMITS = {
  strict: { requests: 15, window: 60 },  // 15 req/min
  normal: { requests: 30, window: 60 },  // 30 req/min  
  soft: { requests: 60, window: 60 }     // 60 req/min
};

interface RateLimitConfig {
  requests: number;
  window: number;
}

/**
 * Get rate limit tier based on pathname
 */
function getRateLimitTier(pathname: string): RateLimitConfig {
  if (pathname.includes('/airdrop/submit') || 
      pathname.includes('/airdrop/validate') ||
      pathname.includes('/chat/stream')) {
    return RATE_LIMITS.strict;
  }
  
  if (pathname.startsWith('/api/')) {
    return RATE_LIMITS.normal;
  }
  
  return RATE_LIMITS.soft;
}

/**
 * Get client identifier
 */
function getClientId(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || 
             req.socket?.remoteAddress || 
             'unknown';
  
  const ua = req.headers['user-agent'] || 'unknown';
  let hash = 0;
  for (let i = 0; i < ua.length; i++) {
    hash = ((hash << 5) - hash) + ua.charCodeAt(i);
    hash = hash & hash;
  }
  
  return `${ip}:${Math.abs(hash).toString(36)}`;
}

/**
 * Edge rate limiter middleware
 * Use this in your API routes
 */
export async function edgeRateLimit(req: VercelRequest, res: VercelResponse): Promise<boolean> {
  const pathname = req.url || '/';
  const config = getRateLimitTier(pathname);
  const clientId = getClientId(req);
  
  const now = Date.now();
  const windowStart = Math.floor(now / 1000 / config.window) * config.window;
  const key = `ratelimit:${clientId}:${windowStart}`;

  try {
    const count = await kv.incr(key);
    
    if (count === 1) {
      await kv.expire(key, config.window);
    }

    const remaining = Math.max(0, config.requests - count);
    const resetAt = (windowStart + config.window) * 1000;

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', config.requests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', resetAt.toString());

    if (count > config.requests) {
      res.setHeader('Retry-After', Math.ceil((resetAt - now) / 1000).toString());
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again after ${new Date(resetAt).toISOString()}`,
        retryAfter: Math.ceil((resetAt - now) / 1000)
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('[EdgeRateLimit] KV error:', error);
    // Fail open on errors
    return true;
  }
}

export default edgeRateLimit;
