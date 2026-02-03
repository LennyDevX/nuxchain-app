/**
 * 🗑️ NFT Cache Manager
 * 
 * Utilidades para gestionar la caché de NFTs en localStorage
 * Útil durante desarrollo y para troubleshooting de rate limiting
 */

interface CachedNFTData {
  items: unknown[];
  timestamp: number;
}

export class NFTCacheManager {
  private static readonly CACHE_PREFIX = 'nft_cache_';
  private static readonly MAX_CACHE_AGE = 24 * 60 * 60 * 1000; // 24 horas

  /**
   * Limpia TODA la caché de NFTs
   */
  static clearAll(): void {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log(`🗑️ [NFTCache] Cleared ${cleared} cache entries`);
  }

  /**
   * Limpia caché expirada (>24 horas)
   */
  static clearExpired(): void {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as CachedNFTData;
          const age = now - data.timestamp;
          
          if (age > this.MAX_CACHE_AGE) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch {
          // Caché corrupta, eliminar
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });
    
    console.log(`🗑️ [NFTCache] Cleared ${cleared} expired entries`);
  }

  /**
   * Obtiene estadísticas de la caché
   */
  static getStats(): { total: number; oldestAge: number; newestAge: number; totalSize: number } {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let total = 0;
    let oldestAge = 0;
    let newestAge = Infinity;
    let totalSize = 0;
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        total++;
        try {
          const value = localStorage.getItem(key) || '';
          totalSize += value.length;
          
          const data = JSON.parse(value) as CachedNFTData;
          const age = now - data.timestamp;
          
          if (age > oldestAge) oldestAge = age;
          if (age < newestAge) newestAge = age;
        } catch {
          // Skip corrupted cache
        }
      }
    });
    
    return {
      total,
      oldestAge: Math.floor(oldestAge / 1000), // seconds
      newestAge: newestAge === Infinity ? 0 : Math.floor(newestAge / 1000),
      totalSize: Math.floor(totalSize / 1024) // KB
    };
  }

  /**
   * Lista todas las cachés disponibles
   */
  static list(): Array<{ key: string; age: number; items: number }> {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    const caches: Array<{ key: string; age: number; items: number }> = [];
    
    keys.forEach(key => {
      if (key.startsWith(this.CACHE_PREFIX)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}') as CachedNFTData;
          caches.push({
            key: key.replace(this.CACHE_PREFIX, ''),
            age: Math.floor((now - data.timestamp) / 1000), // seconds
            items: data.items?.length || 0
          });
        } catch {
          // Skip corrupted cache
        }
      }
    });
    
    return caches.sort((a, b) => a.age - b.age);
  }
}

// Exponer en window para uso en DevTools
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).NFTCacheManager = NFTCacheManager;
}

/**
 * COMANDOS ÚTILES PARA DEVTOOLS CONSOLE:
 * 
 * Ver estadísticas:
 *   NFTCacheManager.getStats()
 * 
 * Listar cachés:
 *   NFTCacheManager.list()
 * 
 * Limpiar todo:
 *   NFTCacheManager.clearAll()
 * 
 * Limpiar solo expirado:
 *   NFTCacheManager.clearExpired()
 */
