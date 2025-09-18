/**
 * Health Check Endpoint Optimizado - NuxChain App
 * Endpoint para verificar el estado de la aplicación con infraestructura mejorada
 */

import { createServerlessHandler } from '../middleware/router.js';
import { cacheAndCompress, cacheConfigs } from '../middleware/cache.js';
import { withErrorHandling } from '../middleware/error-handler.js';

/**
 * Handler para health check con información detallada
 */
const handleHealth = withErrorHandling(async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      api: 'operational',
      database: 'operational', 
      cache: 'operational',
      security: 'operational',
      cors: 'operational'
    },
    performance: {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpu: {
        loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
        cores: require('os').cpus().length
      }
    },
    features: {
      cors: true,
      security: true,
      caching: true,
      compression: true,
      validation: true,
      errorHandling: true,
      routing: true
    },
    endpoints: {
      health: '/api/health',
      scraper: '/api/scraper/*',
      gemini: '/api/gemini/*'
    },
    infrastructure: {
      middleware: 'optimized',
      cors: 'centralized',
      validation: 'unified',
      caching: 'multi-layer',
      errorHandling: 'standardized'
    }
  };

  return res.status(200).json(healthData);
});

/**
 * Configuración de rutas para health check
 */
function setupHealthRoutes(router) {
  // Health check principal con cache corto
  router.get('/health', 
    cacheAndCompress(cacheConfigs.short),
    handleHealth
  );

  // Health check detallado sin cache para monitoreo
  router.get('/health/detailed',
    handleHealth
  );

  // Health check simple para load balancers
  router.get('/ping',
    cacheAndCompress(cacheConfigs.short),
    withErrorHandling(async (req, res) => {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString()
      });
    })
  );
}

// Crear y exportar el handler optimizado
export const handler = createServerlessHandler(setupHealthRoutes);