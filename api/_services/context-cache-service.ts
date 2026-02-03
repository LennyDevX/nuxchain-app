/**
 * ✅ TypeScript Migration - Phase 3
 * Context Cache Service adaptado para Vercel Serverless
 * 
 * Limitaciones en Vercel:
 * - Las funciones serverless son stateless
 * - No hay memoria persistente entre invocaciones
 * - Cache solo vive durante la ejecución de la función
 * 
 * Solución:
 * - Cache en memoria durante la vida de la función (~warm functions)
 * - Expira automáticamente cuando la función termina
 * - Útil para requests múltiples en la misma invocación
 */

import type { CacheEntry, CacheStats } from '../types/index.js';

class ContextCacheService {
  private cache: Map<string, CacheEntry<unknown>>;
  private maxSize: number;
  private defaultTTL: number;

  constructor() {
    // Cache simple en memoria para la duración de la función
    this.cache = new Map();
    this.maxSize = 10; // Máximo 10 items en cache
    this.defaultTTL = 300000; // 5 minutos por defecto
    
    console.log('✅ Context Cache Service inicializado (Vercel mode)');
  }

  /**
   * Guardar en cache con TTL
   */
  set<T = unknown>(key: string, value: T, ttl: number = this.defaultTTL): boolean {
    try {
      // Si el cache está lleno, eliminar el más antiguo
      if (this.cache.size >= this.maxSize) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
        console.log('🗑️ Cache lleno, eliminando entrada más antigua');
      }

      const expiresAt = Date.now() + ttl;
      
      this.cache.set(key, {
        value,
        expiresAt,
        createdAt: Date.now()
      });

      console.log(`💾 Cache SET: ${key} (TTL: ${ttl}ms)`);
      return true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error en cache SET:', message);
      return false;
    }
  }

  /**
   * Obtener del cache (con validación de expiración)
   */
  get<T = unknown>(key: string): T | null {
    try {
      const entry = this.cache.get(key) as CacheEntry<T> | undefined;
      
      if (!entry) {
        console.log(`❌ Cache MISS: ${key}`);
        return null;
      }

      // Verificar si ha expirado
      if (Date.now() > entry.expiresAt) {
        console.log(`⏰ Cache EXPIRED: ${key}`);
        this.cache.delete(key);
        return null;
      }

      console.log(`✅ Cache HIT: ${key}`);
      return entry.value;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Error en cache GET:', message);
      return null;
    }
  }

  /**
   * Verificar si existe en cache (sin devolverlo)
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Verificar expiración
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  /**
   * Eliminar entrada específica
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`🗑️ Cache DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Limpiar todo el cache
   */
  clear(): number {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🧹 Cache CLEAR: ${size} entradas eliminadas`);
    return size;
  }

  /**
   * Obtener estadísticas del cache
   */
  stats(): CacheStats {
    let validEntries = 0;
    let expiredEntries = 0;
    const now = Date.now();

    for (const [, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      maxSize: this.maxSize
    };
  }

  /**
   * Limpiar entradas expiradas
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache CLEANUP: ${cleaned} entradas expiradas eliminadas`);
    }

    return cleaned;
  }

  /**
   * Obtener o crear (lazy loading)
   * Útil para evitar llamadas duplicadas en la misma función
   */
  async getOrSet<T = unknown>(key: string, fetchFn: () => Promise<T>, ttl: number = this.defaultTTL): Promise<T> {
    // Intentar obtener del cache
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    try {
      // Si no está en cache, ejecutar función
      console.log(`🔄 Cache FETCH: ${key}`);
      const value = await fetchFn();
      
      // Guardar en cache
      this.set(key, value, ttl);
      
      return value;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error en getOrSet para ${key}:`, message);
      throw error;
    }
  }
}

// Exportar instancia singleton (se recrea en cada función serverless)
const contextCacheService = new ContextCacheService();

// Exportar para uso en ES modules
export default contextCacheService;

// Exportar también para CommonJS (compatibilidad)
export { contextCacheService };
