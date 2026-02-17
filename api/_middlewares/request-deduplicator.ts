/**
 * Request Deduplication Middleware
 * Prevents duplicate processing of identical in-flight requests
 * Uses SWR (stale-while-revalidate) pattern for efficiency
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { kvCache } from '../_services/kv-cache-service';

interface PendingRequest {
  promise: Promise<unknown>;
  timestamp: number;
  subscribers: Array<(data: unknown) => void>;
}

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private readonly DEDUP_WINDOW = 5000; // 5 seconds window for deduplication

  /**
   * Generate unique key for request
   */
  private generateRequestKey(req: VercelRequest): string {
    const method = req.method || 'GET';
    const url = req.url || '';
    const bodyHash = req.body ? JSON.stringify(req.body) : '';
    
    // Simple hash function
    let hash = 0;
    const str = `${method}:${url}:${bodyHash}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    return `req:${Math.abs(hash)}`;
  }

  /**
   * Clean up expired pending requests
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, pending] of this.pendingRequests.entries()) {
      if (now - pending.timestamp > this.DEDUP_WINDOW) {
        this.pendingRequests.delete(key);
      }
    }
  }

  /**
   * Deduplicate middleware - prevents duplicate processing
   */
  deduplicate = () => {
    return async (
      req: VercelRequest,
      res: VercelResponse,
      handler: () => Promise<unknown>
    ): Promise<void> => {
      // Only deduplicate GET and POST requests
      if (!['GET', 'POST'].includes(req.method || '')) {
        await handler();
        return;
      }

      const requestKey = this.generateRequestKey(req);
      
      // Cleanup old requests
      this.cleanup();

      // Check if identical request is already in-flight
      const pending = this.pendingRequests.get(requestKey);
      
      if (pending) {
        console.log(`[RequestDedup] Duplicate detected: ${requestKey}`);
        
        // Wait for the original request to complete
        try {
          const result = await pending.promise;
          
          // Send same response
          if (!res.headersSent) {
            res.status(200).json(result);
          }
          return;
        } catch (err) {
          // Original request failed, execute this one
          console.log(`[RequestDedup] Original failed (${err instanceof Error ? err.message : 'unknown'}), executing new: ${requestKey}`);
        }
      }

      // Execute handler and store as pending
      const promise = handler();
      
      this.pendingRequests.set(requestKey, {
        promise,
        timestamp: Date.now(),
        subscribers: []
      });

      try {
        await promise;
      } finally {
        // Remove from pending after execution
        this.pendingRequests.delete(requestKey);
      }
    };
  };

  /**
   * Cache-first middleware - serves from cache, updates in background
   */
  cacheFirst = (options: { ttl?: number; namespace?: string } = {}) => {
    return async (
      req: VercelRequest,
      res: VercelResponse,
      handler: () => Promise<unknown>
    ): Promise<void> => {
      const requestKey = this.generateRequestKey(req);
      const cacheKey = `cache:${requestKey}`;

      // Try to get from cache first
      const cached = await kvCache.get(cacheKey, {
        namespace: options.namespace || 'request',
        ttl: options.ttl || 30
      });

      if (cached) {
        console.log(`[CacheFirst] Serving from cache: ${requestKey}`);
        
        if (!res.headersSent) {
          res.setHeader('X-Cache', 'HIT');
          res.status(200).json(cached);
        }

        // Optionally refresh cache in background (SWR pattern)
        // Uncomment to enable stale-while-revalidate
        /*
        handler().then(fresh => {
          kvCache.set(cacheKey, fresh, {
            namespace: options.namespace || 'request',
            ttl: options.ttl || 30
          });
        }).catch(() => {});
        */

        return;
      }

      // Cache miss - execute handler
      console.log(`[CacheFirst] Cache miss: ${requestKey}`);
      
      const result = await handler();
      
      // Store in cache
      await kvCache.set(cacheKey, result, {
        namespace: options.namespace || 'request',
        ttl: options.ttl || 30
      });

      if (!res.headersSent) {
        res.setHeader('X-Cache', 'MISS');
        res.status(200).json(result);
      }
    };
  };
}

// Export singleton
export const requestDeduplicator = new RequestDeduplicator();
export default requestDeduplicator;
