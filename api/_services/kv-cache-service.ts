/**
 * Upstash KV Cache Service
 * Replaces in-memory caching with persistent Redis cache
 * Reduces RPC calls, database queries, and API requests
 */

import { kv } from '@vercel/kv';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string; // Optional namespace for keys
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class KVCacheService {
  private defaultTTL: number = 120; // 120 seconds default (increased from 60s)
  private enableLogging: boolean = process.env.NODE_ENV !== 'production';

  /**
   * Generate cache key with namespace
   */
  private getCacheKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Log cache operations (development only)
   */
  private log(message: string, data?: unknown): void {
    if (this.enableLogging) {
      console.log(`[KVCache] ${message}`, data || '');
    }
  }

  /**
   * Get cached value
   * @param key Cache key
   * @param options Cache options
   * @returns Cached value or null if not found/expired
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    try {
      const cacheKey = this.getCacheKey(key, options.namespace);
      const cached = await kv.get<CachedData<T>>(cacheKey);

      if (!cached) {
        this.log(`MISS - ${cacheKey}`);
        return null;
      }

      // Check if expired (redundant with KV TTL, but adds extra safety)
      if (cached.expiresAt && Date.now() > cached.expiresAt) {
        this.log(`EXPIRED - ${cacheKey}`);
        await this.delete(key, options);
        return null;
      }

      this.log(`HIT - ${cacheKey}`, { age: Date.now() - cached.timestamp });
      return cached.data;
    } catch (error) {
      console.error('[KVCache] Get error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Set cached value
   * @param key Cache key
   * @param value Value to cache
   * @param options Cache options
   */
  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key, options.namespace);
      const ttl = options.ttl || this.defaultTTL;
      const now = Date.now();

      const cachedData: CachedData<T> = {
        data: value,
        timestamp: now,
        expiresAt: now + (ttl * 1000)
      };

      // Set with EX (expiration in seconds)
      await kv.set(cacheKey, cachedData, { ex: ttl });
      
      this.log(`SET - ${cacheKey}`, { ttl });
      return true;
    } catch (error) {
      console.error('[KVCache] Set error:', error);
      return false;
    }
  }

  /**
   * Get or fetch pattern - returns cached value or executes fetcher
   * @param key Cache key
   * @param fetcher Function to fetch data if not cached
   * @param options Cache options
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    
    if (cached !== null) {
      return cached;
    }

    this.log(`FETCH - ${key}`);
    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  /**
   * Delete cached value
   */
  async delete(key: string, options: CacheOptions = {}): Promise<boolean> {
    try {
      const cacheKey = this.getCacheKey(key, options.namespace);
      await kv.del(cacheKey);
      this.log(`DELETE - ${cacheKey}`);
      return true;
    } catch (error) {
      console.error('[KVCache] Delete error:', error);
      return false;
    }
  }

  /**
   * Batch get multiple keys
   */
  async mget<T>(keys: string[], options: CacheOptions = {}): Promise<(T | null)[]> {
    try {
      const cacheKeys = keys.map(k => this.getCacheKey(k, options.namespace));
      const results = await kv.mget<CachedData<T>[]>(...cacheKeys);
      
      return results.map((cached, index) => {
        if (!cached || (cached.expiresAt && Date.now() > cached.expiresAt)) {
          this.log(`MISS - ${cacheKeys[index]}`);
          return null;
        }
        this.log(`HIT - ${cacheKeys[index]}`);
        return cached.data;
      });
    } catch (error) {
      console.error('[KVCache] Mget error:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Batch set multiple key-value pairs
   */
  async mset<T>(entries: Array<{ key: string; value: T }>, options: CacheOptions = {}): Promise<boolean> {
    try {
      const ttl = options.ttl || this.defaultTTL;
      const now = Date.now();

      const pipeline = kv.pipeline();
      
      for (const { key, value } of entries) {
        const cacheKey = this.getCacheKey(key, options.namespace);
        const cachedData: CachedData<T> = {
          data: value,
          timestamp: now,
          expiresAt: now + (ttl * 1000)
        };
        pipeline.set(cacheKey, cachedData, { ex: ttl });
      }

      await pipeline.exec();
      this.log(`MSET - ${entries.length} keys`, { ttl });
      return true;
    } catch (error) {
      console.error('[KVCache] Mset error:', error);
      return false;
    }
  }

  /**
   * Clear all keys in a namespace
   */
  async clearNamespace(namespace: string): Promise<number> {
    try {
      const pattern = `${namespace}:*`;
      const keys = await kv.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await kv.del(...keys);
      this.log(`CLEAR NAMESPACE - ${namespace}`, { count: keys.length });
      return keys.length;
    } catch (error) {
      console.error('[KVCache] Clear namespace error:', error);
      return 0;
    }
  }

  /**
   * Increment a counter with expiration
   */
  async increment(key: string, options: CacheOptions = {}): Promise<number> {
    try {
      const cacheKey = this.getCacheKey(key, options.namespace);
      const count = await kv.incr(cacheKey);
      
      // Set expiration on first increment
      if (count === 1 && options.ttl) {
        await kv.expire(cacheKey, options.ttl);
      }
      
      return count;
    } catch (error) {
      console.error('[KVCache] Increment error:', error);
      return 0;
    }
  }

  /**
   * Stale-While-Revalidate: returns stale cached data immediately,
   * then refreshes in background. Eliminates latency on cache hits.
   * @param key Cache key
   * @param fetcher Function to fetch fresh data
   * @param options Cache options (staleTTL = how long stale data is served)
   */
  async staleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions & { staleTTL?: number } = {}
  ): Promise<T> {
    const cacheKey = this.getCacheKey(key, options.namespace);
    try {
      const cached = await kv.get<CachedData<T>>(cacheKey);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        const ttlMs = (options.ttl || this.defaultTTL) * 1000;
        const staleTTLMs = (options.staleTTL ?? (options.ttl || this.defaultTTL) * 2) * 1000;
        // Serve stale data if within staleTTL window, refresh in background
        if (age < staleTTLMs) {
          if (age > ttlMs) {
            // Data is stale but within tolerance — refresh in background
            fetcher()
              .then(fresh => this.set(key, fresh, options))
              .catch(err => console.warn('[KVCache] Background refresh failed:', err));
          }
          this.log(`STALE-HIT - ${cacheKey}`, { ageMs: age });
          return cached.data;
        }
      }
    } catch (error) {
      console.warn('[KVCache] staleWhileRevalidate read error:', error);
    }
    // Full miss — fetch, store, and return
    const fresh = await fetcher();
    await this.set(key, fresh, options);
    return fresh;
  }
}

// Export singleton instance
export const kvCache = new KVCacheService();
export default kvCache;
