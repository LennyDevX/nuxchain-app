/**
 * Rutas Optimizadas - API Gemini
 * Configuración centralizada de endpoints con middleware integrado
 */

import { chatHandler } from './handlers/chat.js';
import { analysisHandler, batchAnalysisHandler, analysisInfoHandler } from './handlers/analysis.js';
import { validateRequest } from './middleware/validation.js';
import { cacheMiddleware } from './middleware/cache.js';
import { fullSecurityMiddleware } from './middleware/security.js';
import { withSecurity } from '../../src/security/serverless-security.js';

// === CONFIGURACIÓN DE RUTAS ===

const routeConfig = {
  basePath: '/api/gemini',
  version: '2.0.0',
  enableMetrics: true,
  enableLogging: true,
  defaultTimeout: 30000
};

// === MIDDLEWARE COMÚN ===

/**
 * Middleware de métricas para todas las rutas
 */
function metricsMiddleware() {
  return (req, res, next) => {
    const startTime = Date.now();
    req.startTime = startTime;
    
    // Interceptar respuesta para métricas
    const originalJson = res.json;
    res.json = function(data) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Log métricas
      if (routeConfig.enableMetrics) {
        console.log(`[METRICS] ${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`);
      }
      
      // Agregar headers de métricas
      res.set({
        'X-Response-Time': `${responseTime}ms`,
        'X-API-Version': routeConfig.version
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
}

/**
 * Middleware de logging personalizado
 */
function loggingMiddleware() {
  return (req, res, next) => {
    if (routeConfig.enableLogging) {
      console.log(`[API] ${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  };
}

/**
 * Middleware de manejo de errores global
 */
function errorHandlerMiddleware() {
  return (error, req, res, next) => {
    console.error('Error en API Gemini:', error);
    
    if (res.headersSent) {
      return next(error);
    }
    
    const statusCode = error.statusCode || 500;
    const errorResponse = {
      error: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      requestId: req.requestId || 'unknown',
      path: req.url
    };
    
    // Agregar detalles en desarrollo
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
      errorResponse.details = error.details;
    }
    
    res.status(statusCode).json(errorResponse);
  };
}

// === CONFIGURACIÓN DE ENDPOINTS ===

/**
 * Configuración de endpoints con middleware específico
 */
const endpoints = {
  // Chat endpoints
  chat: {
    path: '/chat',
    methods: ['GET', 'POST', 'OPTIONS'],
    handler: chatHandler,
    middleware: [
      ...fullSecurityMiddleware(),
      metricsMiddleware(),
      loggingMiddleware(),
      validateRequest('chatRequest'),
      cacheMiddleware('chat')
    ],
    description: 'Endpoint principal para chat con Gemini',
    examples: {
      normal: {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'Hola, ¿cómo estás?' }],
          model: 'gemini-2.5-flash'
        }
      },
      streaming: {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'Cuenta una historia' }],
          stream: true
        }
      },
      tools: {
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'Busca información sobre IA' }],
          useTools: true,
          enabledTools: ['search']
        }
      }
    }
  },
  
  // Analysis endpoints
  analysis: {
    path: '/analysis',
    methods: ['GET', 'POST', 'OPTIONS'],
    handler: (req, res) => {
      if (req.method === 'GET') {
        return analysisInfoHandler(req, res);
      }
      return analysisHandler(req, res);
    },
    middleware: [
      ...fullSecurityMiddleware(),
      metricsMiddleware(),
      loggingMiddleware(),
      validateRequest('analysisRequest'),
      cacheMiddleware('analysis')
    ],
    description: 'Análisis de texto (sentimientos, resúmenes, etc.)',
    examples: {
      sentiment: {
        method: 'POST',
        body: {
          text: 'Me encanta este producto!',
          analysisType: 'sentiment',
          targetLanguage: 'es'
        }
      },
      summary: {
        method: 'POST',
        body: {
          text: 'Texto largo para resumir...',
          analysisType: 'summary'
        }
      }
    }
  },
  
  // Batch analysis
  batchAnalysis: {
    path: '/analysis/batch',
    methods: ['POST', 'OPTIONS'],
    handler: batchAnalysisHandler,
    middleware: [
      ...fullSecurityMiddleware(),
      metricsMiddleware(),
      loggingMiddleware(),
      validateRequest('batchRequest')
      // No cache para batch por defecto
    ],
    description: 'Análisis de múltiples textos en paralelo',
    examples: {
      batch: {
        method: 'POST',
        body: {
          requests: [
            {
              id: 'req1',
              text: 'Texto 1',
              analysisType: 'sentiment'
            },
            {
              id: 'req2',
              text: 'Texto 2',
              analysisType: 'summary'
            }
          ]
        }
      }
    }
  },
  
  // Health check
  health: {
    path: '/health',
    methods: ['GET', 'OPTIONS'],
    handler: (req, res) => {
      res.json({
        status: 'healthy',
        version: routeConfig.version,
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        endpoints: Object.keys(endpoints).map(key => ({
          name: key,
          path: routeConfig.basePath + endpoints[key].path,
          methods: endpoints[key].methods
        }))
      });
    },
    middleware: [
      metricsMiddleware(),
      loggingMiddleware()
    ],
    description: 'Estado de salud de la API'
  },
  
  // Metrics endpoint
  metrics: {
    path: '/metrics',
    methods: ['GET', 'OPTIONS'],
    handler: async (req, res) => {
      const { getCacheStats } = await import('./middleware/cache.js');
      
      res.json({
        api: {
          version: routeConfig.version,
          uptime: process.uptime(),
          timestamp: new Date().toISOString()
        },
        cache: getCacheStats(),
        memory: {
          used: process.memoryUsage().heapUsed,
          total: process.memoryUsage().heapTotal,
          external: process.memoryUsage().external
        },
        endpoints: Object.keys(endpoints).length
      });
    },
    middleware: [
      metricsMiddleware(),
      loggingMiddleware()
    ],
    description: 'Métricas de rendimiento de la API'
  }
};

// === FUNCIONES DE CONFIGURACIÓN ===

/**
 * Aplica middleware a un handler
 */
function applyMiddleware(handler, middlewares = []) {
  return middlewares.reduceRight((next, middleware) => {
    return (req, res) => {
      try {
        return middleware()(req, res, () => next(req, res));
      } catch (error) {
        return errorHandlerMiddleware()(error, req, res, () => {});
      }
    };
  }, handler);
}

/**
 * Crea un handler serverless con middleware aplicado
 */
function createServerlessHandler(endpoint) {
  const handlerWithMiddleware = applyMiddleware(endpoint.handler, endpoint.middleware);
  
  return withSecurity(async (req, res) => {
    try {
      // Verificar método permitido
      if (!endpoint.methods.includes(req.method)) {
        return res.status(405).json({
          error: 'Método no permitido',
          allowedMethods: endpoint.methods,
          received: req.method
        });
      }
      
      // Ejecutar handler
      return await handlerWithMiddleware(req, res);
      
    } catch (error) {
      return errorHandlerMiddleware()(error, req, res, () => {});
    }
  });
}

// === EXPORTACIONES DE HANDLERS ===

/**
 * Handlers individuales para cada endpoint
 */
export const chatEndpoint = createServerlessHandler(endpoints.chat);
export const analysisEndpoint = createServerlessHandler(endpoints.analysis);
export const batchAnalysisEndpoint = createServerlessHandler(endpoints.batchAnalysis);
export const healthEndpoint = createServerlessHandler(endpoints.health);
export const metricsEndpoint = createServerlessHandler(endpoints.metrics);

// === CONFIGURACIÓN DE RUTAS PARA EXPRESS ===

/**
 * Configura todas las rutas en una aplicación Express
 */
export function configureRoutes(app) {
  // Middleware global para la API
  app.use(routeConfig.basePath, [
    ...fullSecurityMiddleware(),
    metricsMiddleware(),
    loggingMiddleware()
  ]);
  
  // Configurar cada endpoint
  for (const [name, endpoint] of Object.entries(endpoints)) {
    const fullPath = routeConfig.basePath + endpoint.path;
    const handler = createServerlessHandler(endpoint);
    
    // Registrar rutas para cada método
    for (const method of endpoint.methods) {
      switch (method.toLowerCase()) {
        case 'get':
          app.get(fullPath, handler);
          break;
        case 'post':
          app.post(fullPath, handler);
          break;
        case 'put':
          app.put(fullPath, handler);
          break;
        case 'delete':
          app.delete(fullPath, handler);
          break;
        case 'options':
          app.options(fullPath, handler);
          break;
      }
    }
    
    console.log(`[ROUTES] Configurado ${name}: ${method} ${fullPath}`);
  }
  
  // Middleware de manejo de errores al final
  app.use(routeConfig.basePath, errorHandlerMiddleware());
  
  console.log(`[ROUTES] API Gemini v${routeConfig.version} configurada en ${routeConfig.basePath}`);
}

// === DOCUMENTACIÓN DE LA API ===

/**
 * Genera documentación de la API
 */
export function getApiDocumentation() {
  return {
    title: 'API Gemini Optimizada',
    version: routeConfig.version,
    basePath: routeConfig.basePath,
    description: 'API optimizada para interacciones con Gemini AI',
    endpoints: Object.entries(endpoints).map(([name, endpoint]) => ({
      name,
      path: routeConfig.basePath + endpoint.path,
      methods: endpoint.methods,
      description: endpoint.description,
      examples: endpoint.examples || {}
    })),
    middleware: [
      'Seguridad (CORS, Rate Limiting, Headers)',
      'Validación de entrada',
      'Cache inteligente',
      'Métricas y logging',
      'Manejo de errores'
    ]
  };
}

// === EXPORTACIÓN POR DEFECTO ===

export default {
  // Handlers individuales
  chatEndpoint,
  analysisEndpoint,
  batchAnalysisEndpoint,
  healthEndpoint,
  metricsEndpoint,
  
  // Configuración
  configureRoutes,
  getApiDocumentation,
  routeConfig,
  endpoints
};