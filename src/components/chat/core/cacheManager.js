export class EnhancedCacheManager {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 100;
    this.defaultTTL = options.defaultTTL || 1800000; // 30 minutes
    this.cache = new Map();
    this.accessTimes = new Map();
    this.cleanupInterval = setInterval(() => this.cleanup(), 300000); // 5 minutes
    this.compressionEnabled = options.compression !== false;
    this.compressionThreshold = options.compressionThreshold || 1000; // Compress if > 1KB
  }

  async set(key, value, ttl = this.defaultTTL) {
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    // Compress large values if compression is enabled
    let processedValue = value;
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
    const entry = {
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

  async get(key) {
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
    if (entry.isCompressed) {
      try {
        return await this.decompressData(entry.value);
      } catch (error) {
        console.warn('Decompression failed:', error);
        this.delete(key);
        return null;
      }
    }
    
    return entry.value;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key) {
    this.cache.delete(key);
    this.accessTimes.delete(key);
  }

  clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }

  // LRU eviction
  evictLRU() {
    let oldestKey = null;
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
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.delete(key));
  }

  calculateSize(value) {
    if (typeof value === 'string') {
      return value.length * 2; // Rough estimate for UTF-16
    }
    return JSON.stringify(value).length * 2;
  }

  getStats() {
    const now = Date.now();
    let totalSize = 0;
    let expiredCount = 0;

    for (const [key, entry] of this.cache) {
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

  calculateHitRate() {
    let totalAccess = 0;
    for (const entry of this.cache.values()) {
      totalAccess += entry.accessCount;
    }
    return totalAccess / Math.max(this.cache.size, 1);
  }

  estimateMemoryUsage() {
    let usage = 0;
    for (const entry of this.cache.values()) {
      usage += entry.size;
    }
    return usage;
  }

  // Preload popular responses
  preloadCache(popularQueries) {
    return Promise.all(
      popularQueries.map(async query => {
        if (!this.has(query.key)) {
          // Simulate preloading - in real app, fetch from API
          return new Promise(resolve => {
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
  async compressData(data) {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      return new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], []));
    }
    
    // Fallback: simple string compression using LZ-like algorithm
    return this.simpleCompress(data);
  }
  
  async decompressData(compressedData) {
    if (typeof DecompressionStream !== 'undefined' && compressedData instanceof Uint8Array) {
      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(compressedData);
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      return new TextDecoder().decode(new Uint8Array(chunks.reduce((acc, chunk) => [...acc, ...chunk], [])));
    }
    
    // Fallback: simple decompression
    return this.simpleDecompress(compressedData);
  }
  
  simpleCompress(str) {
    // Simple run-length encoding for repeated characters
    return str.replace(/(.)\1{2,}/g, (match, char) => `${char}${match.length}`);
  }
  
  simpleDecompress(str) {
    // Reverse simple run-length encoding
    return str.replace(/(.)([0-9]+)/g, (match, char, count) => char.repeat(parseInt(count)));
  }
  
  // Enhanced memory management
  optimizeMemory() {
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

  destroy() {
    clearInterval(this.cleanupInterval);
    this.clear();
  }
}

// Singleton instance
export const enhancedCache = new EnhancedCacheManager({
  maxSize: 150,
  defaultTTL: 3600000 // 1 hour
});
