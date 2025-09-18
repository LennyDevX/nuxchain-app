/**
 * Función Serverless para Web Scraping - NuxChain App
 * Extracción de contenido web con validación y seguridad optimizada
 */

import { createServerlessHandler } from '../middleware/router.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { cacheAndCompress, cacheConfigs } from '../middleware/cache.js';
import { withErrorHandling, NotFoundError, ValidationError } from '../middleware/error-handler.js';
import { WebScraperService } from '../../src/server/services/web-scraper.js';

// Instancia del servicio
const webScraperService = new WebScraperService();

/**
 * Configurar rutas del scraper
 */
const setupScraperRoutes = (router) => {
  // Health check con cache corto
  router.get('/api/scraper/health', 
    cacheAndCompress(cacheConfigs.short),
    handleHealth
  );

  // Extracción de contenido con validación y cache medio
  router.post('/api/scraper/extract',
    validateRequest(commonSchemas.scrapeUrl, 'body'),
    cacheAndCompress(cacheConfigs.medium),
    handleExtract
  );

  // Endpoint para limpiar cache (solo desarrollo)
  if (process.env.NODE_ENV === 'development') {
    router.post('/api/scraper/clear-cache', handleClearCache);
  }
};

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
 * Valida URL
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Función principal del handler
 */
async function scraperHandler(req, res) {
  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    if (!handleCors(req, res)) return;
    res.status(200).end();
    return;
  }
  
  // Verificar CORS para otras solicitudes
  if (!handleCors(req, res)) return;
  
  try {
    const { method, body, query, url } = req;
    const path = new URL(url, `http://${req.headers.host}`).pathname;
    
    // Enrutar basado en el path
    if (path.includes('/extract')) {
      return await handleExtractUrl(req, res, body, query);
    } else if (path.includes('/extract-multiple')) {
      return await handleExtractMultipleUrls(req, res, body);
    } else if (path.includes('/validate')) {
      return await handleValidateUrl(req, res, body, query);
    } else if (path.includes('/context')) {
      return await handleProcessUrlContext(req, res, body, query);
    } else if (path.includes('/health')) {
      return await handleHealthCheck(req, res);
    } else {
      res.status(404).json({
        error: 'Endpoint no encontrado',
        availableEndpoints: [
          '/api/scraper/extract',
          '/api/scraper/extract-multiple',
          '/api/scraper/validate',
          '/api/scraper/context',
          '/api/scraper/health'
        ]
      });
    }
  } catch (error) {
    console.error('Error en función serverless de scraper:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
    });
  }
}

// Crear y exportar el handler optimizado
const scraperHandler = createServerlessHandler(setupScraperRoutes, {
  cors: true,
  security: true
});

export default scraperHandler;

/**
 * Handler para extracción de contenido
 */
const handleExtract = withErrorHandling(async (req, res) => {
  const { url, options = {} } = req.validated.body;

  try {
    console.log(`🔍 Iniciando scraping de: ${url}`);
    
    const result = await webScraperService.scrapeUrl(url, {
      timeout: options.timeout || 30000,
      waitFor: options.waitFor,
      extractImages: options.extractImages || false
    });

    console.log(`✅ Scraping completado para: ${url}`);
    
    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        url,
        timestamp: new Date().toISOString(),
        processingTime: result.processingTime || null
      }
    });

  } catch (error) {
    console.error(`❌ Error en scraping de ${url}:`, error);
    throw new ValidationError(`Error en extracción de ${url}: ${error.message}`);
  }
});

/**
 * Maneja extracción de contenido de una URL
 */
async function handleExtractUrl(req, res, body, query) {
  const url = req.method === 'POST' ? body.url : query.url;
  const options = req.method === 'POST' ? body.options : {};
  
  if (!url) {
    return res.status(400).json({
      error: 'Parámetro "url" requerido',
      example: { url: "https://example.com", options: { timeout: 10000 } }
    });
  }
  
  if (!isValidUrl(url)) {
    return res.status(400).json({
      error: 'URL inválida',
      provided: url
    });
  }
  
  try {
    const extractedContent = await webScraperService.extractContent(url, options);
    
    if (extractedContent.success) {
      res.status(200).json({
        success: true,
        data: {
          url,
          content: extractedContent.content,
          title: extractedContent.title,
          extractedAt: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({
        success: false,
        error: extractedContent.error || 'Error al extraer contenido',
        url
      });
    }
  } catch (error) {
    console.error('Error extrayendo contenido:', error);
    res.status(500).json({
      error: 'Error extrayendo contenido',
      message: error.message,
      url
    });
  }
}

/**
 * Maneja extracción de múltiples URLs
 */
async function handleExtractMultipleUrls(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }
  
  const { urls, options = {} } = body;
  
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({
      error: 'Parámetro "urls" requerido como array no vacío',
      example: { urls: ["https://example1.com", "https://example2.com"] }
    });
  }
  
  // Validar todas las URLs
  const invalidUrls = urls.filter(url => !isValidUrl(url));
  if (invalidUrls.length > 0) {
    return res.status(400).json({
      error: 'URLs inválidas encontradas',
      invalidUrls
    });
  }
  
  // Limitar número de URLs para evitar timeouts
  if (urls.length > 10) {
    return res.status(400).json({
      error: 'Máximo 10 URLs permitidas por solicitud',
      provided: urls.length
    });
  }
  
  try {
    const results = await Promise.allSettled(
      urls.map(async (url) => {
        try {
          const extractedContent = await webScraperService.extractContent(url, options);
          if (extractedContent.success) {
            return { 
              url, 
              content: extractedContent.content,
              title: extractedContent.title,
              status: 'success' 
            };
          } else {
            return { 
              url, 
              error: extractedContent.error || 'Error al extraer contenido', 
              status: 'error' 
            };
          }
        } catch (error) {
          return { url, error: error.message, status: 'error' };
        }
      })
    );
    
    const successful = results.filter(r => r.value?.status === 'success').map(r => r.value);
    const failed = results.filter(r => r.value?.status === 'error').map(r => r.value);
    
    res.status(200).json({
      success: true,
      data: {
        successful,
        failed,
        summary: {
          total: urls.length,
          successful: successful.length,
          failed: failed.length
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error extrayendo múltiples URLs:', error);
    res.status(500).json({
      error: 'Error extrayendo múltiples URLs',
      message: error.message
    });
  }
}

/**
 * Maneja validación de URL
 */
async function handleValidateUrl(req, res, body, query) {
  const url = req.method === 'POST' ? body.url : query.url;
  
  if (!url) {
    return res.status(400).json({
      error: 'Parámetro "url" requerido',
      example: { url: "https://example.com" }
    });
  }
  
  try {
    const isValid = isValidUrl(url);
    let accessibility = null;
    
    if (isValid) {
      try {
        // Verificar accesibilidad básica
        const response = await fetch(url, { 
          method: 'HEAD', 
          timeout: 5000,
          headers: {
            'User-Agent': 'NuxChain-Bot/1.0'
          }
        });
        accessibility = {
          accessible: response.ok,
          status: response.status,
          statusText: response.statusText
        };
      } catch (error) {
        accessibility = {
          accessible: false,
          error: error.message
        };
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        url,
        isValid,
        accessibility,
        validatedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error validando URL:', error);
    res.status(500).json({
      error: 'Error validando URL',
      message: error.message,
      url
    });
  }
}

/**
 * Maneja procesamiento de contexto de URL
 */
async function handleProcessUrlContext(req, res, body, query) {
  const url = req.method === 'POST' ? body.url : query.url;
  const contextType = req.method === 'POST' ? body.contextType : query.contextType || 'summary';
  
  if (!url) {
    return res.status(400).json({
      error: 'Parámetro "url" requerido',
      example: { url: "https://example.com", contextType: "summary" }
    });
  }
  
  if (!isValidUrl(url)) {
    return res.status(400).json({
      error: 'URL inválida',
      provided: url
    });
  }
  
  try {
    const context = await urlContextService.processUrl(url, { contextType });
    
    res.status(200).json({
      success: true,
      data: {
        url,
        contextType,
        context,
        processedAt: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error procesando contexto de URL:', error);
    res.status(500).json({
      error: 'Error procesando contexto de URL',
      message: error.message,
      url
    });
  }
}

/**
 * Handler para health check
 */
const handleHealth = withErrorHandling(async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'web-scraper',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      caching: true,
      compression: true,
      validation: true,
      errorHandling: true
    }
  };

  return res.status(200).json(health);
});

/**
 * Handler para limpiar cache (solo desarrollo)
 */
const handleClearCache = withErrorHandling(async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    throw new NotFoundError('Endpoint no disponible en producción');
  }

  const { clearCache, getCacheStats } = await import('../middleware/cache.js');
  
  const statsBefore = getCacheStats();
  clearCache();
  const statsAfter = getCacheStats();

  return res.status(200).json({
    success: true,
    message: 'Cache limpiado exitosamente',
    stats: {
      before: statsBefore,
      after: statsAfter
    },
    timestamp: new Date().toISOString()
  });
});