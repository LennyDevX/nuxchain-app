interface CacheEntry {
  image: HTMLImageElement;
  timestamp: number;
  size: number;
}

class ImageCache {
  private cache: Map<string, CacheEntry> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private maxCacheSize: number = 100; // Maximum number of cached images
  private maxMemoryBytes: number = 52428800; // 50MB in bytes
  private currentMemoryUsage: number = 0;
  private accessOrder: string[] = []; // Track access order for LRU eviction
  private ttlMs: number = 60 * 60 * 1000; // 1 hour TTL
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 10 minutes
    this.cleanupInterval = setInterval(() => this.cleanupExpired(), 10 * 60 * 1000);
  }

  /**
   * Preload an image and store it in cache
   */
  async preloadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(url)) {
      const entry = this.cache.get(url)!;
      this.updateAccessOrder(url);
      return entry.image;
    }

    // Return existing loading promise if image is already being loaded
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const loadingPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.addToCache(url, img);
        this.loadingPromises.delete(url);
        resolve(img);
      };
      
      img.onerror = () => {
        this.loadingPromises.delete(url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      
      // Set crossOrigin to handle CORS issues with IPFS images
      img.crossOrigin = 'anonymous';
      img.src = url;
    });

    this.loadingPromises.set(url, loadingPromise);
    return loadingPromise;
  }

  /**
   * Get cached image if available
   */
  getCachedImage(url: string): HTMLImageElement | null {
    if (this.cache.has(url)) {
      const entry = this.cache.get(url)!;
      // Check if entry has expired
      if (Date.now() - entry.timestamp > this.ttlMs) {
        this.cache.delete(url);
        this.removeFromAccessOrder(url);
        this.currentMemoryUsage -= entry.size;
        return null;
      }
      this.updateAccessOrder(url);
      return entry.image;
    }
    return null;
  }

  /**
   * Check if image is cached
   */
  isCached(url: string): boolean {
    return this.cache.has(url);
  }

  /**
   * Check if image is currently loading
   */
  isLoading(url: string): boolean {
    return this.loadingPromises.has(url);
  }

  /**
   * Add image to cache with LRU eviction and memory limits
   */
  private addToCache(url: string, img: HTMLImageElement): void {
    // Estimate image size (roughly: width * height * 4 bytes for RGBA)
    const estimatedSize = Math.max(
      img.width * img.height * 4,
      100 * 1024 // At least 100KB
    );

    // Remove from cache if already exists
    if (this.cache.has(url)) {
      const oldEntry = this.cache.get(url)!;
      this.currentMemoryUsage -= oldEntry.size;
      this.cache.delete(url);
      this.removeFromAccessOrder(url);
    }

    // Evict entries if memory limit exceeded
    while (this.currentMemoryUsage + estimatedSize > this.maxMemoryBytes && this.cache.size > 0) {
      const lruUrl = this.accessOrder.shift()!;
      const lruEntry = this.cache.get(lruUrl)!;
      this.currentMemoryUsage -= lruEntry.size;
      this.cache.delete(lruUrl);
    }

    // Evict by count if still too many entries
    while (this.cache.size >= this.maxCacheSize && this.cache.size > 0) {
      const lruUrl = this.accessOrder.shift()!;
      const lruEntry = this.cache.get(lruUrl)!;
      this.currentMemoryUsage -= lruEntry.size;
      this.cache.delete(lruUrl);
    }

    // Add new image to cache
    const entry: CacheEntry = {
      image: img,
      timestamp: Date.now(),
      size: estimatedSize
    };
    this.cache.set(url, entry);
    this.currentMemoryUsage += estimatedSize;
    this.accessOrder.push(url);
  }

  /**
   * Update access order for LRU tracking
   */
  private updateAccessOrder(url: string): void {
    this.removeFromAccessOrder(url);
    this.accessOrder.push(url);
  }

  /**
   * Remove URL from access order array
   */
  private removeFromAccessOrder(url: string): void {
    const index = this.accessOrder.indexOf(url);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  /**
   * Clear all cached images and cleanup interval
   */
  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    this.accessOrder = [];
    this.currentMemoryUsage = 0;
  }

  /**
   * Cleanup expired entries
   */
  private cleanupExpired(): void {
    const now = Date.now();
    const expiredUrls: string[] = [];

    for (const [url, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttlMs) {
        expiredUrls.push(url);
      }
    }

    for (const url of expiredUrls) {
      const entry = this.cache.get(url)!;
      this.currentMemoryUsage -= entry.size;
      this.cache.delete(url);
      this.removeFromAccessOrder(url);
    }

    if (expiredUrls.length > 0) {
      console.log(`[ImageCache] Cleaned up ${expiredUrls.length} expired entries`);
    }
  }

  /**
   * Destroy cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { 
    size: number;
    maxSize: number;
    loadingCount: number;
    memoryUsage: number;
    maxMemory: number;
    memoryPercent: number;
    ttlMs: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadingCount: this.loadingPromises.size,
      memoryUsage: this.currentMemoryUsage,
      maxMemory: this.maxMemoryBytes,
      memoryPercent: (this.currentMemoryUsage / this.maxMemoryBytes) * 100,
      ttlMs: this.ttlMs
    };
  }

  /**
   * Preload multiple images in batches
   */
  async preloadBatch(urls: string[], batchSize: number = 5): Promise<void> {
    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.allSettled(batch.map(url => this.preloadImage(url)));
      
      // Small delay between batches to prevent overwhelming the browser
      if (i + batchSize < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}

// Export singleton instance
export const imageCache = new ImageCache();
export default imageCache;