/**
 * Middleware de Seguridad y CORS - API Gemini Optimizada
 * Implementa medidas de seguridad, CORS y rate limiting
 */

// === CONFIGURACIÓN DE SEGURIDAD ===

const securityConfig = {
  cors: {
    origins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'https://nuxchain.app',
      'https://*.nuxchain.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-API-Key',
      'X-Request-ID',
      'X-Client-Version'
    ],
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  rateLimit: {
    windowMs: 60000, // 1 minuto
    maxRequests: 100, // máximo 100 requests por minuto
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    keyGenerator: (req) => req.ip || 'unknown'
  },
  
  security: {
    maxRequestSize: '10mb',
    enableHelmet: true,
    enableXSS: true,
    enableCSP: true,
    trustProxy: true
  }
};

// === ALMACÉN DE RATE LIMITING ===

class RateLimitStore {
  constructor() {
    this.store = new Map();
    this.cleanup();
  }
  
  /**
   * Incrementa el contador para una clave
   */
  increment(key) {
    const now = Date.now();
    const windowStart = now - securityConfig.rateLimit.windowMs;
    
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }
    
    const requests = this.store.get(key);
    
    // Filtrar requests dentro de la ventana
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    validRequests.push(now);
    
    this.store.set(key, validRequests);
    
    return {
      count: validRequests.length,
      resetTime: now + securityConfig.rateLimit.windowMs
    };
  }
  
  /**
   * Obtiene el conteo actual para una clave
   */
  get(key) {
    const now = Date.now();
    const windowStart = now - securityConfig.rateLimit.windowMs;
    
    if (!this.store.has(key)) {
      return { count: 0, resetTime: now + securityConfig.rateLimit.windowMs };
    }
    
    const requests = this.store.get(key);
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    
    return {
      count: validRequests.length,
      resetTime: now + securityConfig.rateLimit.windowMs
    };
  }
  
  /**
   * Limpia entradas expiradas
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const windowStart = now - securityConfig.rateLimit.windowMs;
      
      for (const [key, requests] of this.store.entries()) {
        const validRequests = requests.filter(timestamp => timestamp > windowStart);
        
        if (validRequests.length === 0) {
          this.store.delete(key);
        } else {
          this.store.set(key, validRequests);
        }
      }
    }, securityConfig.rateLimit.windowMs);
  }
}

const rateLimitStore = new RateLimitStore();

// === MIDDLEWARE DE CORS ===

/**
 * Middleware de CORS personalizado
 */
export function corsMiddleware(options = {}) {
  const config = { ...securityConfig.cors, ...options };
  
  return (req, res, next) => {
    const origin = req.headers.origin;
    
    // Verificar origen
    if (origin && isOriginAllowed(origin, config.origins)) {
      res.header('Access-Control-Allow-Origin', origin);
    } else if (!origin) {
      // Permitir requests sin origen (ej: Postman, curl)
      res.header('Access-Control-Allow-Origin', '*');
    }
    
    // Configurar headers CORS
    res.header('Access-Control-Allow-Methods', config.methods.join(', '));
    res.header('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', config.credentials);
    res.header('Access-Control-Max-Age', config.maxAge);
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };
}

/**
 * Verifica si un origen está permitido
 */
function isOriginAllowed(origin, allowedOrigins) {
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed === origin) return true;
    if (allowed.includes('*')) {
      const pattern = allowed.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(origin);
    }
    return false;
  });
}

// === MIDDLEWARE DE RATE LIMITING ===

/**
 * Middleware de rate limiting
 */
export function rateLimitMiddleware(options = {}) {
  const config = { ...securityConfig.rateLimit, ...options };
  
  return (req, res, next) => {
    try {
      const key = config.keyGenerator(req);
      const result = rateLimitStore.increment(key);
      
      // Agregar headers informativos
      res.set({
        'X-RateLimit-Limit': config.maxRequests,
        'X-RateLimit-Remaining': Math.max(0, config.maxRequests - result.count),
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
      });
      
      // Verificar límite
      if (result.count > config.maxRequests) {
        return res.status(429).json({
          error: 'Demasiadas solicitudes',
          message: `Límite de ${config.maxRequests} requests por minuto excedido`,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }
      
      next();
    } catch (error) {
      console.error('Error en rate limiting:', error);
      next(); // Continuar en caso de error
    }
  };
}

// === MIDDLEWARE DE SEGURIDAD ===

/**
 * Middleware de headers de seguridad
 */
export function securityHeaders() {
  return (req, res, next) => {
    // Headers de seguridad básicos
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });
    
    // CSP básico para APIs
    if (securityConfig.security.enableCSP) {
      res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
    }
    
    next();
  };
}

/**
 * Middleware de validación de API Key
 */
export function apiKeyValidation(required = false) {
  return (req, res, next) => {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    
    if (required && !apiKey) {
      return res.status(401).json({
        error: 'API Key requerida',
        message: 'Proporciona una API Key válida en el header X-API-Key'
      });
    }
    
    if (apiKey) {
      // Validar formato de API Key (ejemplo básico)
      if (!/^[a-zA-Z0-9_-]{32,}$/.test(apiKey)) {
        return res.status(401).json({
          error: 'API Key inválida',
          message: 'Formato de API Key incorrecto'
        });
      }
      
      req.apiKey = apiKey;
    }
    
    next();
  };
}

/**
 * Middleware de validación de tamaño de request
 */
export function requestSizeLimit(maxSize = securityConfig.security.maxRequestSize) {
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeInMB = parseFloat(maxSize.replace('mb', ''));
      
      if (sizeInMB > maxSizeInMB) {
        return res.status(413).json({
          error: 'Request demasiado grande',
          message: `Tamaño máximo permitido: ${maxSize}`,
          received: `${sizeInMB.toFixed(2)}mb`
        });
      }
    }
    
    next();
  };
}

// === MIDDLEWARE DE LOGGING DE SEGURIDAD ===

/**
 * Middleware de logging de eventos de seguridad
 */
export function securityLogger() {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Capturar información de la request
    const requestInfo = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      origin: req.headers.origin,
      apiKey: req.headers['x-api-key'] ? 'present' : 'absent'
    };
    
    // Interceptar la respuesta
    const originalSend = res.send;
    res.send = function(data) {
      const responseTime = Date.now() - startTime;
      
      // Log eventos sospechosos
      if (res.statusCode === 429) {
        console.warn('Rate limit exceeded:', requestInfo);
      } else if (res.statusCode === 401 || res.statusCode === 403) {
        console.warn('Unauthorized access attempt:', requestInfo);
      } else if (res.statusCode >= 500) {
        console.error('Server error:', { ...requestInfo, statusCode: res.statusCode });
      }
      
      // Log normal para requests exitosas (opcional)
      if (process.env.NODE_ENV === 'development') {
        console.log(`${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
}

// === UTILIDADES DE SEGURIDAD ===

/**
 * Sanitiza input para prevenir inyecciones
 */
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/[<>]/g, '') // Remover < y >
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+=/gi, '') // Remover event handlers
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * Genera un ID de request único
 */
export function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Middleware para agregar ID de request
 */
export function requestIdMiddleware() {
  return (req, res, next) => {
    req.requestId = req.headers['x-request-id'] || generateRequestId();
    res.set('X-Request-ID', req.requestId);
    next();
  };
}

// === CONFIGURACIÓN COMBINADA ===

/**
 * Middleware de seguridad completo
 */
export function fullSecurityMiddleware(options = {}) {
  return [
    requestIdMiddleware(),
    corsMiddleware(options.cors),
    securityHeaders(),
    rateLimitMiddleware(options.rateLimit),
    requestSizeLimit(options.maxSize),
    securityLogger()
  ];
}

// === EXPORTACIONES ===

export default {
  corsMiddleware,
  rateLimitMiddleware,
  securityHeaders,
  apiKeyValidation,
  requestSizeLimit,
  securityLogger,
  requestIdMiddleware,
  fullSecurityMiddleware,
  sanitizeInput,
  generateRequestId
};