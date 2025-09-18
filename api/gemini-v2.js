/**
 * API Gemini Optimizada - Punto de Entrada Principal
 * Integra todos los componentes de la nueva arquitectura modular
 */

import { 
  chatEndpoint, 
  analysisEndpoint, 
  batchAnalysisEndpoint, 
  healthEndpoint, 
  metricsEndpoint,
  getApiDocumentation 
} from './gemini/routes.js';

// === CONFIGURACIÓN PRINCIPAL ===

const apiConfig = {
  name: 'Gemini API Optimizada',
  version: '2.0.0',
  description: 'API modular y optimizada para interacciones con Gemini AI',
  author: 'NuxChain Team',
  created: new Date().toISOString(),
  features: [
    'Arquitectura modular',
    'Middleware centralizado',
    'Cache inteligente',
    'Validación robusta',
    'Métricas en tiempo real',
    'Manejo de errores mejorado',
    'Seguridad integrada'
  ]
};

// === HANDLER PRINCIPAL ===

/**
 * Handler principal que enruta las requests a los endpoints específicos
 */
async function geminiOptimizedHandler(req, res) {
  try {
    const { url, method } = req;
    
    // Extraer el path después de /api/gemini
    const pathMatch = url.match(/\/api\/gemini(\/.*)?$/);
    const path = pathMatch ? pathMatch[1] || '/' : '/';
    
    // Log de la request
    console.log(`[GEMINI-API] ${method} ${path} - ${new Date().toISOString()}`);
    
    // Enrutamiento basado en el path
    switch (path) {
      case '/':
      case '/info':
        return await handleApiInfo(req, res);
        
      case '/chat':
        return await chatEndpoint(req, res);
        
      case '/analysis':
        return await analysisEndpoint(req, res);
        
      case '/analysis/batch':
        return await batchAnalysisEndpoint(req, res);
        
      case '/health':
        return await healthEndpoint(req, res);
        
      case '/metrics':
        return await metricsEndpoint(req, res);
        
      case '/docs':
        return await handleDocumentation(req, res);
        
      default:
        return res.status(404).json({
          error: 'Endpoint no encontrado',
          path,
          availableEndpoints: [
            '/api/gemini/chat',
            '/api/gemini/analysis',
            '/api/gemini/analysis/batch',
            '/api/gemini/health',
            '/api/gemini/metrics',
            '/api/gemini/docs'
          ],
          suggestion: 'Verifica la URL y consulta /api/gemini/docs para documentación'
        });
    }
    
  } catch (error) {
    console.error('Error en geminiOptimizedHandler:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: req.requestId || 'unknown'
      });
    }
  }
}

// === HANDLERS AUXILIARES ===

/**
 * Handler para información general de la API
 */
async function handleApiInfo(req, res) {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  return res.json({
    ...apiConfig,
    status: 'active',
    uptime: {
      seconds: Math.floor(uptime),
      formatted: formatUptime(uptime)
    },
    memory: {
      used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
      total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`
    },
    endpoints: {
      chat: {
        path: '/api/gemini/chat',
        description: 'Chat con Gemini AI (normal, streaming, tools)',
        methods: ['GET', 'POST']
      },
      analysis: {
        path: '/api/gemini/analysis',
        description: 'Análisis de texto (sentimientos, resúmenes, etc.)',
        methods: ['GET', 'POST']
      },
      batch: {
        path: '/api/gemini/analysis/batch',
        description: 'Análisis de múltiples textos en paralelo',
        methods: ['POST']
      },
      health: {
        path: '/api/gemini/health',
        description: 'Estado de salud de la API',
        methods: ['GET']
      },
      metrics: {
        path: '/api/gemini/metrics',
        description: 'Métricas de rendimiento',
        methods: ['GET']
      },
      docs: {
        path: '/api/gemini/docs',
        description: 'Documentación completa de la API',
        methods: ['GET']
      }
    },
    quickStart: {
      chat: {
        url: '/api/gemini/chat',
        method: 'POST',
        body: {
          messages: [{ role: 'user', content: 'Hola!' }]
        }
      },
      analysis: {
        url: '/api/gemini/analysis',
        method: 'POST',
        body: {
          text: 'Texto a analizar',
          analysisType: 'sentiment'
        }
      }
    }
  });
}

/**
 * Handler para documentación completa
 */
async function handleDocumentation(req, res) {
  const documentation = getApiDocumentation();
  
  return res.json({
    ...documentation,
    migration: {
      from: 'API Gemini v1.0',
      to: 'API Gemini v2.0 Optimizada',
      changes: [
        'Arquitectura modular con handlers separados',
        'Middleware centralizado para validación y cache',
        'Mejores métricas y logging',
        'Manejo de errores más robusto',
        'Endpoints más específicos y organizados'
      ],
      compatibility: {
        breaking: [
          'Estructura de respuesta ligeramente modificada',
          'Algunos parámetros renombrados para consistencia'
        ],
        maintained: [
          'Funcionalidad principal de chat',
          'Streaming y function calling',
          'Autenticación y seguridad'
        ]
      }
    },
    examples: {
      chat: {
        normal: {
          request: {
            method: 'POST',
            url: '/api/gemini/chat',
            headers: { 'Content-Type': 'application/json' },
            body: {
              messages: [
                { role: 'user', content: '¿Cuál es la capital de España?' }
              ],
              model: 'gemini-2.5-flash'
            }
          },
          response: {
            content: 'La capital de España es Madrid.',
            metadata: {
              model: 'gemini-2.5-flash',
              responseTime: 1250,
              cached: false,
              requestId: 'req_abc123'
            }
          }
        },
        streaming: {
          request: {
            method: 'POST',
            url: '/api/gemini/chat',
            headers: { 'Content-Type': 'application/json' },
            body: {
              messages: [
                { role: 'user', content: 'Cuenta una historia corta' }
              ],
              stream: true
            }
          },
          response: 'Server-Sent Events stream'
        }
      },
      analysis: {
        sentiment: {
          request: {
            method: 'POST',
            url: '/api/gemini/analysis',
            body: {
              text: 'Me encanta este producto, es fantástico!',
              analysisType: 'sentiment',
              targetLanguage: 'es'
            }
          },
          response: {
            success: true,
            analysisType: 'sentiment',
            data: {
              sentiment: 'positive',
              confidence: 0.95,
              emotions: ['joy', 'excitement']
            }
          }
        }
      }
    }
  });
}

// === UTILIDADES ===

/**
 * Formatea el uptime en formato legible
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

// === MIDDLEWARE DE MIGRACIÓN ===

/**
 * Middleware para manejar compatibilidad con la API anterior
 */
function migrationMiddleware(req, res, next) {
  // Mapear rutas antiguas a nuevas
  const urlMappings = {
    '/api/chat': '/api/gemini/chat'
    // '/api/gemini.js': '/api/gemini/chat' // Legacy file removed
  };
  
  if (urlMappings[req.url]) {
    console.log(`[MIGRATION] Redirigiendo ${req.url} -> ${urlMappings[req.url]}`);
    req.url = urlMappings[req.url];
  }
  
  // Agregar headers de migración
  res.set({
    'X-API-Migration': 'v1-to-v2',
    'X-API-Version': apiConfig.version,
    'X-Migration-Guide': '/api/gemini/docs'
  });
  
  next();
}

// === EXPORTACIONES ===

/**
 * Handler principal con middleware de migración aplicado
 */
export default function(req, res) {
  // Aplicar middleware de migración
  migrationMiddleware(req, res, () => {
    return geminiOptimizedHandler(req, res);
  });
}

// Exportaciones individuales para uso directo
export {
  chatEndpoint,
  analysisEndpoint,
  batchAnalysisEndpoint,
  healthEndpoint,
  metricsEndpoint,
  apiConfig,
  handleApiInfo,
  handleDocumentation
};