import type { NFT } from '../../types/nft';
import type { MarketplaceNFT } from '../../hooks/nfts/useMarketplace';

type CacheableNFT = NFT | MarketplaceNFT;

interface CacheEntry {
  nfts: CacheableNFT[];
  timestamp: number;
  address: string;
  tags?: string[];
  ttl?: number;
}

class NFTCollectionCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50; // Maximum number of cached addresses
  private readonly MARKETPLACE_TTL = 2 * 60 * 1000; // 2 minutes for marketplace data
  private readonly USER_COLLECTION_TTL = 10 * 60 * 1000; // 10 minutes for user collections

  // Generate cache key for an address
  private getCacheKey(address: string): string {
    return address.toLowerCase();
  }

  // Check if cache entry is valid (not expired)
  private isValidEntry(entry: CacheEntry): boolean {
    const ttl = entry.ttl || this.CACHE_DURATION;
    return Date.now() - entry.timestamp < ttl;
  }

  // Set NFTs for an address in cache
  set(address: string, nfts: CacheableNFT[], options?: { tags?: string[]; ttl?: number; isMarketplace?: boolean }): void {
    const key = this.getCacheKey(address);
    
    // If cache is at max size, remove oldest entry
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    // Determine TTL based on context
    let ttl = options?.ttl;
    if (!ttl) {
      ttl = options?.isMarketplace ? this.MARKETPLACE_TTL : this.USER_COLLECTION_TTL;
    }

    this.cache.set(key, {
      nfts: [...nfts], // Create a copy to avoid mutations
      timestamp: Date.now(),
      address,
      tags: options?.tags,
      ttl
    });
  }

  // Get NFTs for an address from cache
  get(address: string): CacheableNFT[] | null {
    const key = this.getCacheKey(address);
    const entry = this.cache.get(key);

    if (!entry || !this.isValidEntry(entry)) {
      if (entry) {
        this.cache.delete(key); // Remove expired entry
      }
      return null;
    }

    return [...entry.nfts]; // Return a copy to avoid mutations
  }

  // Check if address has valid cached data
  has(address: string): boolean {
    const key = this.getCacheKey(address);
    const entry = this.cache.get(key);
    
    if (!entry || !this.isValidEntry(entry)) {
      if (entry) {
        this.cache.delete(key); // Remove expired entry
      }
      return false;
    }

    return true;
  }

  // Remove cache entry for an address
  delete(address: string): boolean {
    const key = this.getCacheKey(address);
    return this.cache.delete(key);
  }

  // Clear all cache entries
  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      const ttl = entry.ttl || this.CACHE_DURATION;
      if (now - entry.timestamp >= ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Invalidate cache entries by tag
  invalidateByTag(tag: string): number {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags && entry.tags.includes(tag)) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    return invalidatedCount;
  }

  // Invalidate marketplace data (shorter TTL items)
  invalidateMarketplaceData(): number {
    let invalidatedCount = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (entry.ttl === this.MARKETPLACE_TTL || (entry.tags && entry.tags.includes('marketplace'))) {
        this.cache.delete(key);
        invalidatedCount++;
      }
    }
    return invalidatedCount;
  }

  // Prefetch data for an address (useful for anticipated navigation)
  async prefetch(address: string, fetchFunction: () => Promise<CacheableNFT[]>, options?: { tags?: string[]; isMarketplace?: boolean }): Promise<void> {
    // Only prefetch if not already cached
    if (!this.has(address)) {
      try {
        const nfts = await fetchFunction();
        this.set(address, nfts, options);
      } catch (error) {
        console.warn(`Failed to prefetch NFTs for address ${address}:`, error);
      }
    }
  }

  // Get cache statistics
  getStats(): {
    size: number;
    addresses: string[];
    totalNFTs: number;
    oldestEntry?: number;
    newestEntry?: number;
  } {
    let totalNFTs = 0;
    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;

    for (const entry of this.cache.values()) {
      totalNFTs += entry.nfts.length;
      oldestTimestamp = Math.min(oldestTimestamp, entry.timestamp);
      newestTimestamp = Math.max(newestTimestamp, entry.timestamp);
    }

    return {
      size: this.cache.size,
      addresses: Array.from(this.cache.values()).map(entry => entry.address),
      totalNFTs,
      oldestEntry: oldestTimestamp === Infinity ? undefined : oldestTimestamp,
      newestEntry: newestTimestamp === 0 ? undefined : newestTimestamp
    };
  }

  // Update a specific NFT in cache (useful for price updates, etc.)
  updateNFT(address: string, tokenId: string, updatedNFT: Partial<CacheableNFT>): boolean {
    const key = this.getCacheKey(address);
    const entry = this.cache.get(key);

    if (!entry || !this.isValidEntry(entry)) {
      return false;
    }

    const nftIndex = entry.nfts.findIndex(nft => nft.tokenId === tokenId);
    if (nftIndex === -1) {
      return false;
    }

    // Update the NFT with new data
entry.nfts[nftIndex] = { ...entry.nfts[nftIndex], ...updatedNFT } as CacheableNFT;
    
    // Update timestamp to keep cache fresh
    entry.timestamp = Date.now();
    
    return true;
  }

  // Add a new NFT to cache (useful when minting)
  addNFT(address: string, nft: CacheableNFT): boolean {
    const key = this.getCacheKey(address);
    const entry = this.cache.get(key);

    if (!entry || !this.isValidEntry(entry)) {
      return false;
    }

    // Check if NFT already exists
    const existingIndex = entry.nfts.findIndex(existingNFT => existingNFT.tokenId === nft.tokenId);
    if (existingIndex !== -1) {
      // Update existing NFT
      entry.nfts[existingIndex] = nft;
    } else {
      // Add new NFT
      entry.nfts.push(nft);
    }

    // Update timestamp
    entry.timestamp = Date.now();
    
    return true;
  }

  // Remove an NFT from cache (useful when burning or transferring)
  removeNFT(address: string, tokenId: string): boolean {
    const key = this.getCacheKey(address);
    const entry = this.cache.get(key);

    if (!entry || !this.isValidEntry(entry)) {
      return false;
    }

    const nftIndex = entry.nfts.findIndex(nft => nft.tokenId === tokenId);
    if (nftIndex === -1) {
      return false;
    }

    entry.nfts.splice(nftIndex, 1);
    entry.timestamp = Date.now();
    
    return true;
  }
}

// Export singleton instance
export const nftCollectionCache = new NFTCollectionCache();

// Auto cleanup every 10 minutes
setInterval(() => {
  nftCollectionCache.cleanup();
}, 10 * 60 * 1000);