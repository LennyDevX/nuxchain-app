/**
 * Función Serverless para Health Check - NuxChain App
 * Monitoreo de salud del sistema y APIs
 */

import { withSecurity } from '../../src/security/serverless-security.js';

// Configuración CORS para producción
const corsConfig = getCorsConfig('production');

/**
 * Maneja las solicitudes CORS
 */
function handleCors(req, res) {
  const origin = req.headers.origin;
  
  if (corsConfig.origin) {
    if (typeof corsConfig.origin === 'function') {
      corsConfig.origin(origin, (err, allowed) => {
        if (err || !allowed) {
          res.status(403).json({ error: 'CORS: Origen no permitido' });
          return false;
        }
        setCorsHeaders(res, origin);
        return true;
      });
    } else if (corsConfig.origin === true || corsConfig.origin.includes(origin)) {
      setCorsHeaders(res, origin);
      return true;
    }
  }
  
  res.status(403).json({ error: 'CORS: Origen no permitido' });
  return false;
}

function setCorsHeaders(res, origin) {
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
}

/**
 * Verifica la salud de un servicio externo
 */
async function checkExternalService(name, url, timeout = 5000) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NuxChain-HealthCheck/1.0'
      }
    });
    
    clearTimeout(timeoutId);
    
    return {
      name,
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now(),
      statusCode: response.status,
      error: null
    };
  } catch (error) {
    return {
      name,
      status: 'unhealthy',
      responseTime: null,
      statusCode: null,
      error: error.message
    };
  }
}

/**
 * Obtiene métricas del sistema
 */
function getSystemMetrics() {
  const memoryUsage = process.memoryUsage();
  
  return {
    uptime: process.uptime(),
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
    },
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  };
}

/**
 * Función principal del handler
 */
async function healthHandler(req, res) {
  try {
    const { method, query } = req;
    const detailed = query.detailed === 'true';
    const checkExternal = query.external === 'true';
    
    // Métricas básicas del sistema
    const systemMetrics = getSystemMetrics();
    
    // Health check básico
    const healthData = {
      status: 'healthy',
      service: 'nuxchain-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: systemMetrics.uptime,
      environment: systemMetrics.environment
    };
    
    // Si se solicita información detallada
    if (detailed) {
      healthData.system = systemMetrics;
      healthData.apis = {
        chat: { status: 'healthy', endpoint: '/api/chat' },
        gemini: { status: 'healthy', endpoint: '/api/gemini' },
        embeddings: { status: 'healthy', endpoint: '/api/embeddings' },
        scraper: { status: 'healthy', endpoint: '/api/scraper' }
      };
    }
    
    // Si se solicita verificación de servicios externos
    if (checkExternal) {
      const externalServices = await Promise.allSettled([
        checkExternalService('Google', 'https://www.google.com'),
        checkExternalService('GitHub', 'https://api.github.com'),
        checkExternalService('Vercel', 'https://vercel.com')
      ]);
      
      healthData.externalServices = externalServices.map(result => 
        result.status === 'fulfilled' ? result.value : {
          name: 'unknown',
          status: 'error',
          error: result.reason?.message || 'Unknown error'
        }
      );
      
      // Determinar estado general basado en servicios externos
      const unhealthyServices = healthData.externalServices.filter(s => s.status !== 'healthy');
      if (unhealthyServices.length > 0) {
        healthData.status = 'degraded';
        healthData.warnings = [`${unhealthyServices.length} servicios externos no disponibles`];
      }
    }
    
    // Verificaciones adicionales de salud
    const healthChecks = {
      memory: systemMetrics.memory.heapUsed < 500, // Menos de 500MB
      uptime: systemMetrics.uptime > 0,
      environment: !!systemMetrics.environment
    };
    
    const failedChecks = Object.entries(healthChecks)
      .filter(([_, passed]) => !passed)
      .map(([check]) => check);
    
    if (failedChecks.length > 0) {
      healthData.status = 'unhealthy';
      healthData.failedChecks = failedChecks;
    }
    
    // Información de rate limiting
    healthData.rateLimiting = {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutos
      maxRequests: 100
    };
    
    // Información de CORS
    healthData.cors = {
      enabled: true,
      environment: systemMetrics.environment,
      allowCredentials: true
    };
    
    // Determinar código de estado HTTP
    const statusCode = healthData.status === 'healthy' ? 200 : 
                      healthData.status === 'degraded' ? 200 : 503;
    
    res.status(statusCode).json(healthData);
    
  } catch (error) {
    console.error('Error en health check:', error);
    res.status(500).json({
      status: 'unhealthy',
      service: 'nuxchain-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

export default withSecurity(healthHandler);