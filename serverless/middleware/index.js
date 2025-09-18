/**
 * Middleware Central - NuxChain App
 * Exportaciones centralizadas de todos los middlewares optimizados
 */

// Middleware de CORS
export { corsMiddleware, withCors } from './cors.js';

// Router y manejo de rutas
export { ServerlessRouter, createRouter, createServerlessHandler } from './router.js';

// Sistema de validación
export { 
  validateRequest, 
  schemas, 
  commonSchemas,
  validateApiKey,
  validateRateLimit 
} from './validation.js';

// Manejo de errores
export { 
  withErrorHandling,
  asyncHandler,
  notFoundHandler,
  normalizeError,
  logError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  ExternalServiceError,
  RateLimitError,
  CacheError
} from './error-handler.js';

// Cache y compresión
export { 
  MemoryCache,
  cacheMiddleware,
  compressionMiddleware,
  cacheAndCompress,
  cacheConfigs
} from './cache.js';

/**
 * Configuración de middleware por defecto para diferentes tipos de endpoints
 */
export const middlewarePresets = {
  // Para endpoints públicos con cache
  public: (cacheConfig = 'medium') => [
    'cors',
    'security',
    `cache:${cacheConfig}`,
    'compression',
    'errorHandling'
  ],

  // Para endpoints de API con validación
  api: (validationSchema, cacheConfig = 'short') => [
    'cors',
    'security',
    `validation:${validationSchema}`,
    `cache:${cacheConfig}`,
    'compression',
    'errorHandling'
  ],

  // Para endpoints protegidos
  protected: (validationSchema, cacheConfig = 'none') => [
    'cors',
    'security',
    'authentication',
    `validation:${validationSchema}`,
    `cache:${cacheConfig}`,
    'compression',
    'errorHandling'
  ],

  // Para endpoints de health check
  health: () => [
    'cors',
    'cache:short',
    'compression',
    'errorHandling'
  ],

  // Para endpoints de desarrollo
  development: () => [
    'cors',
    'errorHandling'
  ]
};

/**
 * Aplicar preset de middleware a un router
 */
export function applyMiddlewarePreset(router, preset, ...args) {
  const middlewares = middlewarePresets[preset](...args);
  
  middlewares.forEach(middleware => {
    if (middleware.startsWith('cache:')) {
      const cacheType = middleware.split(':')[1];
      router.use(cacheAndCompress(cacheConfigs[cacheType]));
    } else if (middleware.startsWith('validation:')) {
      const schema = middleware.split(':')[1];
      router.use(validateRequest(schemas[schema]));
    } else {
      switch (middleware) {
        case 'cors':
          router.use(corsMiddleware);
          break;
        case 'errorHandling':
          router.use(withErrorHandling);
          break;
        case 'compression':
          router.use(compressionMiddleware);
          break;
        // Agregar más casos según sea necesario
      }
    }
  });
}

/**
 * Crear handler con preset de middleware
 */
export function createHandlerWithPreset(setupRoutes, preset = 'api', ...presetArgs) {
  return createServerlessHandler((router) => {
    applyMiddlewarePreset(router, preset, ...presetArgs);
    setupRoutes(router);
  });
}

/**
 * Configuración global de middleware
 */
export const middlewareConfig = {
  cors: {
    enabled: true,
    credentials: true,
    maxAge: 86400 // 24 horas
  },
  
  cache: {
    enabled: true,
    defaultTTL: 300, // 5 minutos
    maxSize: 100 // 100 entradas
  },
  
  compression: {
    enabled: true,
    threshold: 1024, // 1KB
    level: 6
  },
  
  validation: {
    enabled: true,
    stripUnknown: true,
    abortEarly: false
  },
  
  errorHandling: {
    enabled: true,
    logErrors: true,
    includeStack: process.env.NODE_ENV === 'development'
  },
  
  security: {
    enabled: true,
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 100
    }
  }
};

export default {
  corsMiddleware,
  withCors,
  ServerlessRouter,
  createRouter,
  createServerlessHandler,
  validateRequest,
  schemas,
  withErrorHandling,
  cacheAndCompress,
  cacheConfigs,
  middlewarePresets,
  applyMiddlewarePreset,
  createHandlerWithPreset,
  middlewareConfig
};