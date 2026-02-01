/**
 * RPC Request Cache & Rate Limiter
 * Reduces Alchemy 429 errors by caching responses and throttling requests
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface RateLimiterConfig {
  maxRequestsPerSecond: number;
  maxConcurrent: number;
}

class RPCCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private requestQueue: Array<() => Promise<unknown>> = [];
  private activeRequests = 0;
  private lastRequestTime = 0;
  private config: RateLimiterConfig = {
    maxRequestsPerSecond: 10, // Conservative limit
    maxConcurrent: 3
  };

  /**
   * Get cached data or execute function with rate limiting
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 30000 // 30 seconds default
  ): Promise<T> {
    // Check cache first
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`[RPC Cache] Hit: ${key}`);
      return cached.data as T;
    }

    // Execute with rate limiting
    console.log(`[RPC Cache] Miss: ${key}`);
    const data = await this.executeWithRateLimit(fetcher);

    // Store in cache
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Clean old entries
    this.cleanCache();

    return data;
  }

  /**
   * Execute function with rate limiting and concurrency control
   */
  private async executeWithRateLimit<T>(fn: () => Promise<T>): Promise<T> {
    // Wait if too many concurrent requests
    while (this.activeRequests >= this.config.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Rate limiting: ensure minimum time between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minInterval = 1000 / this.config.maxRequestsPerSecond;

    if (timeSinceLastRequest < minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, minInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    this.activeRequests++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.activeRequests--;
    }
  }

  /**
   * Clean expired cache entries
   */
  private cleanCache() {
    if (this.cache.size < 100) return; // Only clean if cache is large

    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));
    
    if (toDelete.length > 0) {
      console.log(`[RPC Cache] Cleaned ${toDelete.length} expired entries`);
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    console.log('[RPC Cache] Cleared all entries');
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      activeRequests: this.activeRequests,
      queuedRequests: this.requestQueue.length
    };
  }
}

// Singleton instance
export const rpcCache = new RPCCache();

/**
 * Wrapper for wagmi http transport with caching
 */
export function cachedHttp(url: string | undefined, options?: Record<string, unknown>) {
  if (!url) {
    // If no URL, return original http transport
    return undefined;
  }

  return {
    ...options,
    // Add retry logic for 429 errors
    retryCount: 5,
    retryDelay: ({ count, error }: { count: number; error: Error }) => {
      // Exponential backoff for rate limit errors
      if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        return Math.min(1000 * Math.pow(2, count), 30000); // Max 30s
      }
      return 1000 * count; // Linear backoff for other errors
    },
  };
}

export default rpcCache;
