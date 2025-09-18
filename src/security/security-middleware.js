/**
 * Middlewares de Seguridad Avanzados - NuxChain App
 * Protección integral para producción
 */

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { getCorsConfig, rateLimitConfig, blockedIPs } from './cors-policies.js';
import environmentConfig from './environment-config.js';

/**
 * Rate Limiting Avanzado
 */
export const createRateLimit = (options = {}) => {
  const config = {
    ...rateLimitConfig,
    ...options
  };
  
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: config.message,
    standardHeaders: config.standardHeaders,
    legacyHeaders: config.legacyHeaders,
    keyGenerator: ipKeyGenerator, // Use ipKeyGenerator for IPv6 compatibility
    handler: config.handler,
    // Configuración adicional para producción
    store: options.store, // Para usar Redis en producción
    skip: (req) => {
      // Saltar rate limiting para health checks
      if (req.path === '/api/health') return true;
      
      // Saltar para IPs de confianza (si están configuradas)
      const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
      return trustedIPs.includes(req.ip);
    }
  });
};

/**
 * Slow Down - Ralentiza requests cuando se acerca al límite
 */
export const createSlowDown = (options = {}) => {
  const config = {
    ...rateLimitConfig,
    ...options
  };
  return slowDown({
    windowMs: config.windowMs,
    delayAfter: config.delayAfter,
    delayMs: () => 500, // New behavior for express-slow-down v2
    // max: config.max, // Removed as it's not supported by express-slow-down
    message: config.message,
    headers: config.headers,
    skip: config.skip,
    validate: { delayMs: false }, // Disable warning for delayMs
    keyGenerator: ipKeyGenerator, // Use ipKeyGenerator for IPv6 compatibility
  });
};

/**
 * Middleware de Autenticación API Key
 */
export const apiKeyAuth = (req, res, next) => {
  // Permitir todas las solicitudes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = environmentConfig.serverApiKey;
  
  // Permitir acceso sin API key a endpoints públicos
  const publicEndpoints = [
    '/api/health', 
    '/api/gemini/models',
    '/api/chat/stream',
    '/api/gemini/stream',
    '/hello',
    '/server/hello',
    '/server/gemini/health',
    '/server/gemini/hello',
    '/server/gemini/stream',
    '/server/gemini/stream-with-tools',
    '/server/gemini/chat-with-tools',
    '/server/gemini/url-context',
    '/server/gemini',
    '/server/chat',
    '/server/embeddings'
  ];
  
  // Verificar si la ruta coincide con algún endpoint público
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.path === endpoint || req.path.startsWith(endpoint)
  );
  
  if (isPublicEndpoint) {
    return next();
  }
  
  // Si no hay API key configurada en el servidor, permitir acceso (modo desarrollo)
  if (!validApiKey || validApiKey === 'your-secret-api-key-here') {
    console.warn('⚠️  API Key no configurada - permitiendo acceso en modo desarrollo');
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API Key requerida',
      message: 'Proporciona una API key válida en el header X-API-Key'
    });
  }
  
  if (apiKey !== validApiKey) {
    console.warn(`Intento de acceso con API key inválida desde IP: ${req.ip}`);
    return res.status(403).json({
      error: 'API Key inválida',
      message: 'La API key proporcionada no es válida'
    });
  }
  
  next();
};

/**
 * Middleware de Validación de Input
 */
export const inputValidation = (req, res, next) => {
  // Validar tamaño del body
  const maxBodySize = 2 * 1024 * 1024; // 2MB
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxBodySize) {
    return res.status(413).json({
      error: 'Payload demasiado grande',
      message: 'El tamaño máximo permitido es 2MB'
    });
  }
  
  // Sanitizar headers peligrosos
  const dangerousHeaders = ['x-forwarded-host', 'x-forwarded-server'];
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });
  
  // Validar User-Agent
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length > 500) {
    console.warn(`User-Agent sospechoso desde IP: ${req.ip}`);
  }
  
  next();
};

/**
 * Middleware de Detección de Ataques
 */
export const attackDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi, // XSS básico
    /(union|select|insert|delete|update|drop|create|alter)/gi, // SQL Injection
    /(\.\.\/|\.\.\\)/g, // Path Traversal
    /(\${|<%|%>)/g, // Template Injection
    /(eval\(|exec\(|system\()/gi // Code Injection
  ];
  
  const checkString = JSON.stringify(req.body) + req.url + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      console.error(`Ataque detectado desde IP: ${req.ip}, Pattern: ${pattern}, URL: ${req.url}`);
      return res.status(400).json({
        error: 'Solicitud maliciosa detectada',
        message: 'Tu solicitud contiene patrones sospechosos'
      });
    }
  }
  
  next();
};

/**
 * Middleware de Logging de Seguridad
 */
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log de información de la request
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
    referer: req.headers.referer,
    origin: req.headers.origin
  };
  
  // Interceptar la respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log solo errores y requests sospechosas en producción
    if (environmentConfig.isProduction) {
      if (res.statusCode >= 400 || responseTime > 5000) {
        console.log(JSON.stringify({
          ...logData,
          statusCode: res.statusCode,
          responseTime,
          responseSize: data ? data.length : 0
        }));
      }
    } else {
      // Log todo en desarrollo
      console.log(`${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware de Bloqueo de IPs
 */
export const ipBlocking = (req, res, next) => {
  const clientIP = req.ip;
  
  if (blockedIPs.has(clientIP)) {
    console.warn(`IP bloqueada intentó acceder: ${clientIP}`);
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Tu IP ha sido bloqueada'
    });
  }
  
  next();
};

/**
 * Middleware de Headers de Seguridad con Helmet
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https:"],
      connectSrc: ["'self'", "https:", "wss:", "ws:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      manifestSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Deshabilitado para compatibilidad
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true
});

/**
 * Middleware de Timeout de Request
 */
export const requestTimeout = (timeout = 30000) => {
  return (req, res, next) => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'La solicitud tardó demasiado en procesarse'
        });
      }
    }, timeout);
    
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));
    
    next();
  };
};

/**
 * Middleware de Validación de Content-Type
 */
export const contentTypeValidation = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return res.status(400).json({
        error: 'Content-Type requerido',
        message: 'Especifica el Content-Type en el header'
      });
    }
    
    const allowedTypes = [
      'application/json',
      'application/x-www-form-urlencoded',
      'multipart/form-data',
      'text/plain'
    ];
    
    const isAllowed = allowedTypes.some(type => contentType.includes(type));
    
    if (!isAllowed) {
      return res.status(415).json({
        error: 'Content-Type no soportado',
        message: 'Tipos permitidos: ' + allowedTypes.join(', ')
      });
    }
  }
  
  next();
};

/**
 * Configuración completa de middlewares de seguridad
 */
export const setupSecurityMiddlewares = (app) => {
  // Headers de seguridad
  app.use(securityHeaders);
  
  // Logging de seguridad
  app.use(securityLogger);
  
  // Bloqueo de IPs
  app.use(ipBlocking);
  
  // Validación de input
  app.use(inputValidation);
  
  // Validación de Content-Type
  app.use(contentTypeValidation);
  
  // Detección de ataques
  app.use(attackDetection);
  
  // Timeout de requests
  app.use(requestTimeout(30000));
  
  // Slow down
  app.use(createSlowDown());
  
  // Rate limiting
  app.use(createRateLimit());
  
  // Autenticación API Key (aplicar después de rate limiting)
  app.use(apiKeyAuth);
  
  console.log('✅ Middlewares de seguridad configurados');
};

export default {
  createRateLimit,
  createSlowDown,
  apiKeyAuth,
  inputValidation,
  attackDetection,
  securityLogger,
  ipBlocking,
  securityHeaders,
  requestTimeout,
  contentTypeValidation,
  setupSecurityMiddlewares
};