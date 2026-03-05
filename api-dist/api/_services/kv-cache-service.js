/**
 * Upstash KV Cache Service
 * Replaces in-memory caching with persistent Redis cache
 * Reduces RPC calls, database queries, and API requests
 */
import { kv } from '@vercel/kv';
class KVCacheService {
    defaultTTL = 60; // 60 seconds default
    enableLogging = process.env.NODE_ENV !== 'production';
    /**
     * Generate cache key with namespace
     */
    getCacheKey(key, namespace) {
        return namespace ? `${namespace}:${key}` : key;
    }
    /**
     * Log cache operations (development only)
     */
    log(message, data) {
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
    async get(key, options = {}) {
        try {
            const cacheKey = this.getCacheKey(key, options.namespace);
            const cached = await kv.get(cacheKey);
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
        }
        catch (error) {
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
    async set(key, value, options = {}) {
        try {
            const cacheKey = this.getCacheKey(key, options.namespace);
            const ttl = options.ttl || this.defaultTTL;
            const now = Date.now();
            const cachedData = {
                data: value,
                timestamp: now,
                expiresAt: now + (ttl * 1000)
            };
            // Set with EX (expiration in seconds)
            await kv.set(cacheKey, cachedData, { ex: ttl });
            this.log(`SET - ${cacheKey}`, { ttl });
            return true;
        }
        catch (error) {
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
    async getOrFetch(key, fetcher, options = {}) {
        const cached = await this.get(key, options);
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
    async delete(key, options = {}) {
        try {
            const cacheKey = this.getCacheKey(key, options.namespace);
            await kv.del(cacheKey);
            this.log(`DELETE - ${cacheKey}`);
            return true;
        }
        catch (error) {
            console.error('[KVCache] Delete error:', error);
            return false;
        }
    }
    /**
     * Batch get multiple keys
     */
    async mget(keys, options = {}) {
        try {
            const cacheKeys = keys.map(k => this.getCacheKey(k, options.namespace));
            const results = await kv.mget(...cacheKeys);
            return results.map((cached, index) => {
                if (!cached || (cached.expiresAt && Date.now() > cached.expiresAt)) {
                    this.log(`MISS - ${cacheKeys[index]}`);
                    return null;
                }
                this.log(`HIT - ${cacheKeys[index]}`);
                return cached.data;
            });
        }
        catch (error) {
            console.error('[KVCache] Mget error:', error);
            return keys.map(() => null);
        }
    }
    /**
     * Batch set multiple key-value pairs
     */
    async mset(entries, options = {}) {
        try {
            const ttl = options.ttl || this.defaultTTL;
            const now = Date.now();
            const pipeline = kv.pipeline();
            for (const { key, value } of entries) {
                const cacheKey = this.getCacheKey(key, options.namespace);
                const cachedData = {
                    data: value,
                    timestamp: now,
                    expiresAt: now + (ttl * 1000)
                };
                pipeline.set(cacheKey, cachedData, { ex: ttl });
            }
            await pipeline.exec();
            this.log(`MSET - ${entries.length} keys`, { ttl });
            return true;
        }
        catch (error) {
            console.error('[KVCache] Mset error:', error);
            return false;
        }
    }
    /**
     * Clear all keys in a namespace
     */
    async clearNamespace(namespace) {
        try {
            const pattern = `${namespace}:*`;
            const keys = await kv.keys(pattern);
            if (keys.length === 0) {
                return 0;
            }
            await kv.del(...keys);
            this.log(`CLEAR NAMESPACE - ${namespace}`, { count: keys.length });
            return keys.length;
        }
        catch (error) {
            console.error('[KVCache] Clear namespace error:', error);
            return 0;
        }
    }
    /**
     * Increment a counter with expiration
     */
    async increment(key, options = {}) {
        try {
            const cacheKey = this.getCacheKey(key, options.namespace);
            const count = await kv.incr(cacheKey);
            // Set expiration on first increment
            if (count === 1 && options.ttl) {
                await kv.expire(cacheKey, options.ttl);
            }
            return count;
        }
        catch (error) {
            console.error('[KVCache] Increment error:', error);
            return 0;
        }
    }
}
// Export singleton instance
export const kvCache = new KVCacheService();
export default kvCache;
