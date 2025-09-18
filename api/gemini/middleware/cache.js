/**
 * Middleware de Caché Inteligente - API Gemini Optimizada
 * Implementa estrategias de caché adaptativas para mejorar rendimiento
 */

import crypto from 'crypto';

// === CONFIGURACIÓN DE CACHÉ ===

const cacheConfig = {
  // Configuración por tipo de contenido
  strategies: {
    chat: {
      enabled: true,
      ttl: 300, // 5 minutos
      maxSize: 100, // máximo 100 entradas
      compression: true,
      keyFactors: ['messages', 'model', 'temperature']
    },
    analysis: {
      enabled: true,
      ttl: 1800, // 30 minutos
      maxSize: 200,
      compression: true,
      keyFactors: ['text', 'analysisType', 'model']
    },
    tools: {
      enabled: true,
      ttl: 600, // 10 minutos
      maxSize: 50,
      compression: false,
      keyFactors: ['prompt', 'tools', 'model']
    },
    batch: {
      enabled: false, // No cachear batch por defecto
      ttl: 0,
      maxSize: 0,
      compression: false,
      keyFactors: []
    }
  },
  
  // Configuración global
  global: {
    maxMemoryMB: 50, // Máximo 50MB en memoria
    cleanupInterval: 300000, // Limpiar cada 5 minutos
    compressionThreshold: 1024, // Comprimir si > 1KB
    enableMetrics: true
  }
};

// === ALMACÉN DE CACHÉ ===

class CacheStore {
  constructor() {
    this.store = new Map();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0,
      compressionRatio: 0
    };
    
    // Iniciar limpieza automática
    this.startCleanupTimer();
  }
  
  /**
   * Genera una clave de caché basada en los factores especificados
   */
  generateKey(data, keyFactors) {
    const relevantData = {};
    
    for (const factor of keyFactors) {
      if (factor in data) {
        relevantData[factor] = data[factor];
      }
    }
    
    const dataString = JSON.stringify(relevantData, Object.keys(relevantData).sort());
    return crypto.createHash('sha256').update(dataString).digest('hex').substring(0, 16);
  }
  
  /**
   * Comprime datos si es necesario
   */
  compressData(data) {
    const jsonString = JSON.stringify(data);
    
    if (jsonString.length > cacheConfig.global.compressionThreshold) {
      // Simulación de compresión (en producción usar zlib)
      const compressed = Buffer.from(jsonString).toString('base64');
      return {
        data: compressed,
        compressed: true,
        originalSize: jsonString.length,
        compressedSize: compressed.length
      };
    }
    
    return {
      data: jsonString,
      compressed: false,
      originalSize: jsonString.length,
      compressedSize: jsonString.length
    };
  }
  
  /**
   * Descomprime datos si es necesario
   */
  decompressData(cacheEntry) {
    if (cacheEntry.compressed) {
      const decompressed = Buffer.from(cacheEntry.data, 'base64').toString();
      return JSON.parse(decompressed);
    }
    
    return JSON.parse(cacheEntry.data);
  }
  
  /**
   * Almacena un valor en caché
   */
  set(key, value, strategy) {
    try {
      const config = cacheConfig.strategies[strategy];
      if (!config || !config.enabled) return false;
      
      // Verificar límite de tamaño
      if (this.store.size >= config.maxSize) {
        this.evictOldest(strategy);
      }
      
      // Comprimir si está habilitado
      const processedData = config.compression 
        ? this.compressData(value)
        : { data: JSON.stringify(value), compressed: false };
      
      const entry = {
        value: processedData,
        timestamp: Date.now(),
        ttl: config.ttl * 1000, // Convertir a ms
        strategy,
        accessCount: 0,
        lastAccess: Date.now()
      };
      
      this.store.set(key, entry);
      this.metrics.sets++;
      this.updateMemoryUsage();
      
      return true;
    } catch (error) {
      console.error('Error al almacenar en caché:', error);
      return false;
    }
  }
  
  /**
   * Recupera un valor del caché
   */
  get(key) {
    try {
      const entry = this.store.get(key);
      
      if (!entry) {
        this.metrics.misses++;
        return null;
      }
      
      // Verificar expiración
      if (Date.now() - entry.timestamp > entry.ttl) {
        this.store.delete(key);
        this.metrics.misses++;
        this.updateMemoryUsage();
        return null;
      }
      
      // Actualizar estadísticas de acceso
      entry.accessCount++;
      entry.lastAccess = Date.now();
      
      this.metrics.hits++;
      
      // Descomprimir y retornar
      return this.decompressData(entry.value);
    } catch (error) {
      console.error('Error al recuperar del caché:', error);
      this.metrics.misses++;
      return null;
    }
  }
  
  /**
   * Elimina entradas expiradas
   */
  cleanup() {
    const now = Date.now();
    let deletedCount = 0;
    
    for (const [key, entry] of this.store.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    
    this.metrics.deletes += deletedCount;
    this.updateMemoryUsage();
    
    console.log(`Caché limpiado: ${deletedCount} entradas eliminadas`);
  }
  
  /**
   * Elimina la entrada más antigua de una estrategia
   */
  evictOldest(strategy) {
    let oldestKey = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (entry.strategy === strategy && entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.store.delete(oldestKey);
      this.metrics.deletes++;
      this.updateMemoryUsage();
    }
  }
  
  /**
   * Actualiza métricas de uso de memoria
   */
  updateMemoryUsage() {
    let totalSize = 0;
    let totalCompressed = 0;
    let totalOriginal = 0;
    
    for (const entry of this.store.values()) {
      totalSize += JSON.stringify(entry).length;
      if (entry.value.compressed) {
        totalCompressed += entry.value.compressedSize;
        totalOriginal += entry.value.originalSize;
      }
    }
    
    this.metrics.memoryUsage = totalSize;
    this.metrics.compressionRatio = totalOriginal > 0 
      ? ((totalOriginal - totalCompressed) / totalOriginal * 100).toFixed(2)
      : 0;
  }
  
  /**
   * Inicia el timer de limpieza automática
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanup();
    }, cacheConfig.global.cleanupInterval);
  }
  
  /**
   * Obtiene estadísticas del caché
   */
  getStats() {
    const hitRate = this.metrics.hits + this.metrics.misses > 0
      ? ((this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100).toFixed(2)
      : 0;
    
    return {
      ...this.metrics,
      hitRate: `${hitRate}%`,
      totalEntries: this.store.size,
      memoryUsageMB: (this.metrics.memoryUsage / 1024 / 1024).toFixed(2)
    };
  }
  
  /**
   * Limpia todo el caché
   */
  clear() {
    this.store.clear();
    this.metrics = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      memoryUsage: 0,
      compressionRatio: 0
    };
  }
}

// Instancia global del caché
const cacheStore = new CacheStore();

// === MIDDLEWARE DE CACHÉ ===

/**
 * Middleware de caché para endpoints específicos
 */
export function cacheMiddleware(strategy = 'chat') {
  return (req, res, next) => {
    try {
      const config = cacheConfig.strategies[strategy];
      
      if (!config || !config.enabled) {
        return next();
      }
      
      // Generar clave de caché
      const cacheKey = cacheStore.generateKey(req.validatedBody || req.body, config.keyFactors);
      
      // Intentar recuperar del caché
      const cachedResult = cacheStore.get(cacheKey);
      
      if (cachedResult) {
        // Cache hit - retornar resultado cacheado
        return res.json({
          ...cachedResult,
          cached: true,
          cacheKey: cacheKey.substring(0, 8) // Solo mostrar parte de la clave
        });
      }
      
      // Cache miss - continuar con el procesamiento
      req.cacheKey = cacheKey;
      req.cacheStrategy = strategy;
      
      // Interceptar la respuesta para cachear el resultado
      const originalJson = res.json;
      res.json = function(data) {
        // Solo cachear respuestas exitosas
        if (res.statusCode === 200 && data && !data.error) {
          cacheStore.set(cacheKey, data, strategy);
        }
        
        // Llamar al método original
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Error en middleware de caché:', error);
      next(); // Continuar sin caché en caso de error
    }
  };
}

/**
 * Middleware para invalidar caché basado en patrones
 */
export function invalidateCache(patterns = []) {
  return (req, res, next) => {
    try {
      if (patterns.length === 0) {
        return next();
      }
      
      let invalidatedCount = 0;
      
      for (const [key, entry] of cacheStore.store.entries()) {
        for (const pattern of patterns) {
          if (key.includes(pattern) || entry.strategy === pattern) {
            cacheStore.store.delete(key);
            invalidatedCount++;
            break;
          }
        }
      }
      
      if (invalidatedCount > 0) {
        console.log(`Caché invalidado: ${invalidatedCount} entradas eliminadas`);
        cacheStore.updateMemoryUsage();
      }
      
      next();
    } catch (error) {
      console.error('Error al invalidar caché:', error);
      next();
    }
  };
}

/**
 * Middleware para configurar headers de caché HTTP
 */
export function setCacheHeaders(maxAge = 300) {
  return (req, res, next) => {
    // Configurar headers de caché HTTP
    res.set({
      'Cache-Control': `public, max-age=${maxAge}`,
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });
    
    next();
  };
}

// === UTILIDADES DE CACHÉ ===

/**
 * Obtiene estadísticas del caché
 */
export function getCacheStats() {
  return cacheStore.getStats();
}

/**
 * Limpia el caché manualmente
 */
export function clearCache() {
  cacheStore.clear();
  return { message: 'Caché limpiado exitosamente' };
}

/**
 * Configura estrategias de caché dinámicamente
 */
export function configureCacheStrategy(strategy, config) {
  if (cacheConfig.strategies[strategy]) {
    cacheConfig.strategies[strategy] = { ...cacheConfig.strategies[strategy], ...config };
    return { message: `Estrategia ${strategy} actualizada` };
  }
  
  return { error: `Estrategia ${strategy} no encontrada` };
}

/**
 * Precarga datos en caché
 */
export function preloadCache(data, strategy = 'chat') {
  const config = cacheConfig.strategies[strategy];
  if (!config) return false;
  
  const key = cacheStore.generateKey(data, config.keyFactors);
  return cacheStore.set(key, data, strategy);
}

// === EXPORTACIONES ===

export default {
  cacheMiddleware,
  invalidateCache,
  setCacheHeaders,
  getCacheStats,
  clearCache,
  configureCacheStrategy,
  preloadCache,
  cacheStore
};