/**
 * Sistema de Cache y Compresión para Serverless - NuxChain App
 * Optimización de rendimiento y reducción de latencia
 */

import { createHash } from 'crypto';
import { gzip, deflate } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const deflateAsync = promisify(deflate);

/**
 * Cache en memoria simple (para funciones serverless)
 */
class MemoryCache {
  constructor(maxSize = 100, ttl = 300000) { // 5 minutos por defecto
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Generar clave de cache
   * @param {string} key - Base key
   * @param {Object} params - Parameters to include in key
   * @returns {string} Cache key
   */
  generateKey(key, params = {}) {
    const paramString = JSON.stringify(params);
    return createHash('md5').update(`${key}:${paramString}`).digest('hex');
  }

  /**
   * Obtener valor del cache
   * @param {string} key - Cache key
   * @returns {any} Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Verificar TTL
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    // Actualizar último acceso
    item.lastAccess = Date.now();
    return item.value;
  }

  /**
   * Guardar valor en cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} customTtl - Custom TTL in milliseconds
   */
  set(key, value, customTtl = null) {
    const ttl = customTtl || this.ttl;
    const expires = Date.now() + ttl;
    
    // Limpiar cache si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    this.cache.set(key, {
      value,
      expires,
      lastAccess: Date.now(),
      size: JSON.stringify(value).length
    });
  }

  /**
   * Limpiar entradas expiradas y menos usadas
   */
  cleanup() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Eliminar entradas expiradas
    entries.forEach(([key, item]) => {
      if (now > item.expires) {
        this.cache.delete(key);
      }
    });
    
    // Si aún está lleno, eliminar las menos usadas
    if (this.cache.size >= this.maxSize) {
      const sortedEntries = entries
        .filter(([key]) => this.cache.has(key))
        .sort((a, b) => a[1].lastAccess - b[1].lastAccess);
      
      const toDelete = Math.floor(this.maxSize * 0.2); // Eliminar 20%
      for (let i = 0; i < toDelete && i < sortedEntries.length; i++) {
        this.cache.delete(sortedEntries[i][0]);
      }
    }
  }

  /**
   * Limpiar todo el cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalSize = entries.reduce((sum, item) => sum + item.size, 0);
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      totalMemory: totalSize,
      averageSize: entries.length > 0 ? totalSize / entries.length : 0
    };
  }
}

// Instancia global del cache
const globalCache = new MemoryCache();

/**
 * Middleware de cache para responses
 * @param {Object} options - Cache options
 * @returns {Function} Middleware function
 */
export const cacheMiddleware = (options = {}) => {
  const {
    ttl = 300000, // 5 minutos
    keyGenerator = null,
    condition = () => true,
    vary = ['Accept-Encoding']
  } = options;

  return (req, res, next) => {
    // Solo cachear GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Verificar condición
    if (!condition(req)) {
      return next();
    }

    // Generar clave de cache
    const cacheKey = keyGenerator 
      ? keyGenerator(req)
      : globalCache.generateKey(req.url, {
          method: req.method,
          query: req.query,
          headers: vary.reduce((acc, header) => {
            acc[header] = req.headers[header.toLowerCase()];
            return acc;
          }, {})
        });

    // Intentar obtener del cache
    const cached = globalCache.get(cacheKey);
    if (cached) {
      // Configurar headers de cache
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
      
      // Enviar respuesta cacheada
      return res.status(cached.statusCode).json(cached.data);
    }

    // Interceptar response
    const originalJson = res.json;
    res.json = function(data) {
      // Cachear solo respuestas exitosas
      if (res.statusCode >= 200 && res.statusCode < 300) {
        globalCache.set(cacheKey, {
          statusCode: res.statusCode,
          data
        }, ttl);
      }
      
      // Configurar headers
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${Math.floor(ttl / 1000)}`);
      
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Middleware de compresión
 * @param {Object} options - Compression options
 * @returns {Function} Middleware function
 */
export const compressionMiddleware = (options = {}) => {
  const {
    threshold = 1024, // Comprimir solo si es mayor a 1KB
    level = 6, // Nivel de compresión (1-9)
    types = [
      'application/json',
      'text/plain',
      'text/html',
      'text/css',
      'application/javascript'
    ]
  } = options;

  return async (req, res, next) => {
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Verificar si el cliente soporta compresión
    const supportsGzip = acceptEncoding.includes('gzip');
    const supportsDeflate = acceptEncoding.includes('deflate');
    
    if (!supportsGzip && !supportsDeflate) {
      return next();
    }

    // Interceptar response
    const originalJson = res.json;
    const originalSend = res.send;

    const compressResponse = async (data, isJson = false) => {
      try {
        let content = isJson ? JSON.stringify(data) : data;
        const contentType = res.getHeader('content-type') || '';
        
        // Verificar si debe comprimirse
        const shouldCompress = 
          content.length >= threshold &&
          types.some(type => contentType.includes(type));
        
        if (!shouldCompress) {
          return isJson ? originalJson.call(res, data) : originalSend.call(res, data);
        }

        // Comprimir contenido
        let compressed;
        let encoding;
        
        if (supportsGzip) {
          compressed = await gzipAsync(Buffer.from(content));
          encoding = 'gzip';
        } else if (supportsDeflate) {
          compressed = await deflateAsync(Buffer.from(content));
          encoding = 'deflate';
        }

        // Configurar headers
        res.setHeader('Content-Encoding', encoding);
        res.setHeader('Content-Length', compressed.length);
        res.setHeader('Vary', 'Accept-Encoding');
        
        // Calcular ratio de compresión
        const ratio = ((content.length - compressed.length) / content.length * 100).toFixed(1);
        res.setHeader('X-Compression-Ratio', `${ratio}%`);
        
        return res.end(compressed);
        
      } catch (error) {
        console.error('Error en compresión:', error);
        return isJson ? originalJson.call(res, data) : originalSend.call(res, data);
      }
    };

    // Reemplazar métodos
    res.json = function(data) {
      res.setHeader('Content-Type', 'application/json');
      return compressResponse(data, true);
    };

    res.send = function(data) {
      return compressResponse(data, false);
    };

    next();
  };
};

/**
 * Middleware combinado de cache y compresión
 * @param {Object} cacheOptions - Cache options
 * @param {Object} compressionOptions - Compression options
 * @returns {Function} Combined middleware
 */
export const cacheAndCompress = (cacheOptions = {}, compressionOptions = {}) => {
  const cache = cacheMiddleware(cacheOptions);
  const compress = compressionMiddleware(compressionOptions);
  
  return (req, res, next) => {
    cache(req, res, (err) => {
      if (err) return next(err);
      compress(req, res, next);
    });
  };
};

/**
 * Limpiar cache manualmente
 */
export const clearCache = () => {
  globalCache.clear();
};

/**
 * Obtener estadísticas del cache
 */
export const getCacheStats = () => {
  return globalCache.getStats();
};

/**
 * Configuraciones predefinidas
 */
export const cacheConfigs = {
  // Cache corto para datos dinámicos
  short: {
    ttl: 60000, // 1 minuto
    condition: (req) => req.method === 'GET'
  },
  
  // Cache medio para datos semi-estáticos
  medium: {
    ttl: 300000, // 5 minutos
    condition: (req) => req.method === 'GET'
  },
  
  // Cache largo para datos estáticos
  long: {
    ttl: 3600000, // 1 hora
    condition: (req) => req.method === 'GET'
  },
  
  // Cache para APIs externas
  external: {
    ttl: 600000, // 10 minutos
    condition: (req) => req.method === 'GET',
    keyGenerator: (req) => globalCache.generateKey('external', {
      url: req.url,
      query: req.query
    })
  }
};

export default {
  MemoryCache,
  cacheMiddleware,
  compressionMiddleware,
  cacheAndCompress,
  clearCache,
  getCacheStats,
  cacheConfigs
};