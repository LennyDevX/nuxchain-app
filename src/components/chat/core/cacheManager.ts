interface CacheEntry<T = unknown> {
  value: T;
  isCompressed: boolean;
  expiresAt: number;
  size: number;
  accessCount: number;
  createdAt: number;
}

interface CacheOptions {
  maxSize?: number;
  defaultTTL?: number;
  compression?: boolean;
  compressionThreshold?: number;
}

interface CacheStats {
  size: number;
  maxSize: number;
  totalSize: number;
  expiredCount: number;
  hitRate: number;
  memoryUsage: number;
}

interface PopularQuery {
  key: string;
  response: string;
  ttl?: number;
}

export class EnhancedCacheManager {
  private maxSize: number;
  private defaultTTL: number;
  private cache: Map<string, CacheEntry>;
  private accessTimes: Map<string, number>;
  private cleanupInterval: NodeJS.Timeout;
  private compressionEnabled: boolean;
  private compressionThreshold: number;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 1800000; // 30 minutes
    this.cache = new Map();
    this.accessTimes = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
    this.compressionEnabled = options.compression !== false;
    this.compressionThreshold = options.compressionThreshold || 1000; // Compress if > 1KB
  }

  async set(key: string, value: string, ttl: number = this.defaultTTL): Promise<boolean> {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Compress large values if compression is enabled
    let processedValue: string | Uint8Array = value;
    let isCompressed = false;
    
    if (this.compressionEnabled && typeof value === 'string' && value.length > this.compressionThreshold) {
      try {
        processedValue = await this.compressData(value);
        isCompressed = true;
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
        processedValue = value;
      }
    }

    const expiresAt = Date.now() + ttl;
    const entry: CacheEntry<string | Uint8Array> = {
      value: processedValue,
      isCompressed,
      expiresAt,
      size: this.calculateSize(processedValue),
      accessCount: 0,
      createdAt: Date.now()
    };

    this.cache.set(key, entry);
    this.accessTimes.set(key, Date.now());
    
    return true;
  }

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    // Update access metadata
    entry.accessCount++;
    this.accessTimes.set(key, Date.now());
    
    // Decompress if needed
    if (entry.isCompressed && entry.value instanceof Uint8Array) {
      try {
        return await this.decompressData(entry.value);
      } catch (error) {
        console.warn('Decompression failed:', error);
        this.delete(key);
        return null;
      }
    }
    
    return entry.value as string;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessTimes.clear();
  }

  // LRU eviction
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, time] of this.accessTimes) {
      if (time < oldestTime) {
        oldestTime = time;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  // Cleanup expired entries
  cleanup(force = false): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt || force) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  private calculateSize(value: string | Uint8Array): number {
    if (typeof value === 'string') {
      return value.length * 2; // Rough estimate for UTF-16
    }
    if (value instanceof Uint8Array) {
      return value.length;
    }
    return JSON.stringify(value).length * 2;
  }

  getStats(): CacheStats {
    const now = Date.now();
    let totalSize = 0;
    let expiredCount = 0;

    for (const [, entry] of this.cache) {
      totalSize += entry.size;
      if (now > entry.expiresAt) {
        expiredCount++;
      }
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalSize,
      expiredCount,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRate(): number {
    let totalAccess = 0;
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }
    return totalAccess / Math.max(this.cache.size, 1);
  }

  private estimateMemoryUsage(): number {
    let usage = 0;
    for (const entry of this.cache.values()) {
      usage += entry.size;
    }
    return usage;
  }

  // Preload popular responses
  async preloadCache(popularQueries: PopularQuery[]): Promise<void> {
    await Promise.all(
      popularQueries.map(async query => {
        if (!this.has(query.key)) {
          // Simulate preloading - in real app, fetch from API
          return new Promise<void>(resolve => {
            setTimeout(() => {
              this.set(query.key, query.response, query.ttl || this.defaultTTL);
              resolve();
            }, 10);
          });
        }
      })
    );
  }

  // Simple compression using built-in compression
  private async compressData(data: string): Promise<Uint8Array | string> {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return result;
    }
    
    // Fallback: simple string compression using LZ-like algorithm
    return this.simpleCompress(data);
  }
  
  private async decompressData(compressedData: Uint8Array): Promise<string> {
    if (typeof DecompressionStream !== 'undefined' && compressedData instanceof Uint8Array) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new Uint8Array(compressedData.buffer as ArrayBuffer));
      writer.close();
      
      const chunks: Uint8Array[] = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const result = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        result.set(chunk, offset);
        offset += chunk.length;
      }
      
      return new TextDecoder().decode(result);
    }
    
    // Fallback: simple decompression
    return this.simpleDecompress(new TextDecoder().decode(compressedData));
  }
  
  private simpleCompress(str: string): string {
    // Simple run-length encoding for repeated characters
    return str.replace(/(.)\1{2,}/g, (match, char) => `${char}${match.length}`);
  }
  
  private simpleDecompress(str: string): string {
    // Reverse simple run-length encoding
    return str.replace(/(.)([0-9]+)/g, (_match, char, count) => char.repeat(parseInt(count)));
  }
  
  // Enhanced memory management
  optimizeMemory(): void {
    const stats = this.getStats();
    
    // If memory usage is high, be more aggressive with cleanup
    if (stats.totalSize > this.maxSize * 1000) { // Assuming 1KB average per entry
      this.cleanup(true); // Force cleanup
      
      // Reduce cache size temporarily
      const targetSize = Math.floor(this.maxSize * 0.7);
      while (this.cache.size > targetSize) {
        this.evictLRU();
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton instance
export const enhancedCache = new EnhancedCacheManager({
  maxSize: 150,
  defaultTTL: 3600000 // 1 hour
});
