class ImageCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadingPromises: Map<string, Promise<HTMLImageElement>> = new Map();
  private maxCacheSize: number = 100; // Maximum number of cached images
  private accessOrder: string[] = []; // Track access order for LRU eviction

  /**
   * Preload an image and store it in cache
   */
  async preloadImage(url: string): Promise<HTMLImageElement> {
    // Return cached image if available
    if (this.cache.has(url)) {
      this.updateAccessOrder(url);
      return this.cache.get(url)!;
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
      this.updateAccessOrder(url);
      return this.cache.get(url)!;
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
   * Add image to cache with LRU eviction
   */
  private addToCache(url: string, img: HTMLImageElement): void {
    // Remove from cache if already exists (to update position)
    if (this.cache.has(url)) {
      this.cache.delete(url);
      this.removeFromAccessOrder(url);
    }

    // Evict least recently used items if cache is full
    while (this.cache.size >= this.maxCacheSize && this.accessOrder.length > 0) {
      const lruUrl = this.accessOrder.shift()!;
      this.cache.delete(lruUrl);
    }

    // Add new image to cache
    this.cache.set(url, img);
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
   * Clear all cached images
   */
  clear(): void {
    this.cache.clear();
    this.loadingPromises.clear();
    this.accessOrder = [];
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; loadingCount: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      loadingCount: this.loadingPromises.size
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