// Log cache utilities for NFT operations

export const LOG_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface LogCacheEntry {
  timestamp: number;
  data: any;
  key: string;
}

class LogCache {
  private cache: Map<string, LogCacheEntry> = new Map();
  private readonly duration: number;

  constructor(duration: number = LOG_CACHE_DURATION) {
    this.duration = duration;
  }

  set(key: string, data: any): void {
    this.cache.set(key, {
      timestamp: Date.now(),
      data,
      key
    });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.duration) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.duration) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.duration) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const logFetchCache = new LogCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  logFetchCache.cleanup();
}, 10 * 60 * 1000);