/**
 * Seguridad para Funciones Serverless - NuxChain App
 * Configuración específica para entorno serverless/Vercel
 */

import { getCorsConfig } from './cors-policies.js';
import environmentConfig from './environment-config.js';

/**
 * Middleware de seguridad ligero para serverless
 */
export const serverlessSecurityMiddleware = (req, res, next) => {
  // Headers de seguridad básicos
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Validación básica de input
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentLength = parseInt(req.headers['content-length'] || '0');
    if (contentLength > 2 * 1024 * 1024) { // 2MB máximo
      return res.status(413).json({
        error: 'Payload demasiado grande',
        message: 'El tamaño máximo permitido es 2MB'
      });
    }
  }
  
  // Validación de User-Agent
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length > 500) {
    console.warn(`User-Agent sospechoso: ${userAgent?.substring(0, 100)}`);
  }
  
  next();
};

/**
 * Validación de API Key para serverless
 */
export const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  const validApiKey = environmentConfig.serverApiKey;
  
  // Endpoints públicos que no requieren API key
  const publicEndpoints = [
    '/api/health',
    '/api/gemini',
    '/api/server/gemini',
    '/api/chat',
    '/api/embeddings',
    '/api/scraper'
  ];
  
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    req.url?.includes(endpoint)
  );
  
  if (isPublicEndpoint) {
    return next();
  }
  
  // Permitir requests sin API key si no hay una configurada (desarrollo)
  if (!validApiKey || validApiKey === 'dev-api-key-nuxchain-2024') {
    return next();
  }
  
  if (!apiKey) {
    return res.status(401).json({
      error: 'API Key requerida',
      message: 'Proporciona una API key válida en el header X-API-Key'
    });
  }
  
  if (apiKey !== validApiKey) {
    console.warn(`API key inválida desde IP: ${req.headers['x-forwarded-for'] || 'unknown'}`);
    return res.status(403).json({
      error: 'API Key inválida',
      message: 'La API key proporcionada no es válida'
    });
  }
  
  next();
};

/**
 * Rate limiting simple para serverless (usando headers)
 */
export const serverlessRateLimit = (options = {}) => {
  const maxRequests = options.maxRequests || 100;
  const windowMs = options.windowMs || 60000; // 1 minuto
  
  return (req, res, next) => {
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection?.remoteAddress || 
                    'unknown';
    
    // En serverless, usamos headers para tracking básico
    const now = Date.now();
    const resetTime = now + windowMs;
    
    // Headers de rate limiting
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
    
    // Log para monitoreo
    console.log(`Request from IP: ${clientIP}, URL: ${req.url}, Method: ${req.method}`);
    
    next();
  };
};

/**
 * Detección básica de ataques para serverless
 */
export const basicAttackDetection = (req, res, next) => {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi,
    /(union|select|insert|delete|update|drop)/gi,
    /(\.\.\/|\.\.\\)/g,
    /(\${|<%|%>)/g
  ];
  
  const checkString = JSON.stringify(req.body || {}) + 
                     (req.url || '') + 
                     JSON.stringify(req.query || {});
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      const clientIP = req.headers['x-forwarded-for'] || 'unknown';
      console.error(`Ataque detectado desde IP: ${clientIP}, Pattern: ${pattern}`);
      
      return res.status(400).json({
        error: 'Solicitud maliciosa detectada',
        message: 'Tu solicitud contiene patrones sospechosos'
      });
    }
  }
  
  next();
};

/**
 * Configuración CORS para serverless
 */
export const serverlessCors = (req, res, next) => {
  const corsConfig = getCorsConfig();
  
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsConfig.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas
    return res.status(200).end();
  }
  
  // Headers CORS para requests normales
  res.setHeader('Access-Control-Allow-Origin', corsConfig.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  next();
};

/**
 * Middleware de timeout para serverless
 */
export const serverlessTimeout = (timeoutMs = 25000) => {
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request Timeout',
          message: 'La función tardó demasiado en responder'
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};

/**
 * Logging específico para serverless
 */
export const serverlessLogger = (req, res, next) => {
  const startTime = Date.now();
  const clientIP = req.headers['x-forwarded-for'] || 'unknown';
  
  // Log de request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - IP: ${clientIP}`);
  
  // Interceptar respuesta para logging
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    
    // Log de respuesta
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
    
    // Log errores en detalle
    if (res.statusCode >= 400) {
      console.error(`Error ${res.statusCode}: ${req.method} ${req.url}`, {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        responseTime,
        body: req.body
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

/**
 * Configuración completa para funciones serverless
 */
export const setupServerlessSecurity = (req, res, next) => {
  // Aplicar middlewares en orden
  serverlessLogger(req, res, () => {
    serverlessCors(req, res, () => {
      serverlessSecurityMiddleware(req, res, () => {
        basicAttackDetection(req, res, () => {
          serverlessRateLimit()(req, res, () => {
            serverlessTimeout()(req, res, () => {
              validateApiKey(req, res, next);
            });
          });
        });
      });
    });
  });
};

/**
 * Wrapper para funciones serverless con seguridad
 */
export const withSecurity = (handler) => {
  return async (req, res) => {
    try {
      // Aplicar seguridad
      await new Promise((resolve, reject) => {
        setupServerlessSecurity(req, res, (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
      
      // Ejecutar handler original
      return await handler(req, res);
      
    } catch (error) {
      console.error('Error en función serverless:', error);
      
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Error interno del servidor',
          message: environmentConfig.isDevelopment ? error.message : 'Error interno'
        });
      }
    }
  };
};

export default {
  serverlessSecurityMiddleware,
  validateApiKey,
  serverlessRateLimit,
  basicAttackDetection,
  serverlessCors,
  serverlessTimeout,
  serverlessLogger,
  setupServerlessSecurity,
  withSecurity
};