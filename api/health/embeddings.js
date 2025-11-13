import { getRelevantContext } from '../_services/knowledge-base.ts';
import { initializeKnowledgeBaseForVercel } from '../_services/embeddings-service.ts';
import { withSecurity } from '../_middlewares/serverless-security.js';

/**
 * Endpoint de salud para el servicio de embeddings
 * GET /api/health/embeddings
 * Proporciona información sobre el estado del servicio de embeddings y su funcionamiento.
 */
async function embeddingsHealthHandler(req, res) {
  // Solo GET permitido
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const healthCheck = {
    timestamp: new Date().toISOString(),
    service: 'embeddings',
    status: 'unknown',
    checks: {},
    fallbackStatus: 'unknown',
    recommendations: []
  };

  try {
    // 1. Verificar configuración de API key
    healthCheck.checks.apiKey = {
      status: process.env.GEMINI_API_KEY ? 'ok' : 'error',
      message: process.env.GEMINI_API_KEY ? 'API key configurada' : 'API key no configurada'
    };

    // 2. Verificar inicialización del servicio de embeddings
    let embeddingsService;
    try {
      embeddingsService = await initializeKnowledgeBaseForVercel();
      healthCheck.checks.serviceInit = {
        status: 'ok',
        message: `Servicio inicializado ${embeddingsService.hasApiKey ? 'con gemini-embedding-001' : 'en modo fallback (BM25)'}`,
        model: 'gemini-embedding-001',
        embeddingsEnabled: embeddingsService.hasApiKey,
        fallbackMode: embeddingsService.fallbackMode || false,
        fallbackReason: embeddingsService.fallbackReason || null,
        fallbackTimestamp: embeddingsService.fallbackTimestamp || null
      };
    } catch (error) {
      healthCheck.checks.serviceInit = {
        status: 'error',
        message: `Error inicializando servicio: ${error.message}`,
        error: error.message
      };
    }

    // 3. Probar búsqueda con embeddings
    if (embeddingsService) {
      try {
        const testQuery = 'Nuxchain staking';
        const searchResults = await embeddingsService.search('knowledge_base', testQuery, 2, {
          threshold: 0.3
        });
        // Filtrar solo inglés
        const englishResults = searchResults.filter(r =>
          (r.meta?.language || '').toLowerCase() === 'en' ||
          /^[a-zA-Z0-9\s.,;:'"?!\-()]+$/.test(r.content)
        );
        healthCheck.checks.embeddingsSearch = {
          status: englishResults && englishResults.length > 0 ? 'ok' : 'warning',
          message: `Búsqueda de prueba (solo inglés): ${englishResults?.length || 0} resultados`,
          resultsCount: englishResults?.length || 0,
          testQuery,
          fallbackUsed: embeddingsService.fallbackMode || false
        };
      } catch (error) {
        healthCheck.checks.embeddingsSearch = {
          status: 'error',
          message: `Error en búsqueda de embeddings: ${error.message}`,
          error: error.message
        };
      }
    }
    // 4. Probar sistema de fallback
    try {
      const fallbackResults = getRelevantContext('Nuxchain staking');
      // Filtrar solo inglés
      const englishFallback = Array.isArray(fallbackResults)
        ? fallbackResults.filter(doc =>
            (doc.metadata?.language || '').toLowerCase() === 'en' ||
            /^[a-zA-Z0-9\s.,;:'"?!\-()]+$/.test(doc.content)
          )
        : fallbackResults;
      healthCheck.checks.fallbackSystem = {
        status: englishFallback && englishFallback.length > 0 ? 'ok' : 'warning',
        message: englishFallback ? 'Sistema de fallback funcional (solo inglés)' : 'Sistema de fallback sin resultados',
        hasResults: !!englishFallback,
        contextLength: englishFallback?.length || 0
      };
    } catch (error) {
      healthCheck.checks.fallbackSystem = {
        status: 'error',
        message: `Error en sistema de fallback: ${error.message}`,
        error: error.message
      };
    }

    // 5. Determinar estado general
    const checkStatuses = Object.values(healthCheck.checks).map(check => check.status);
    const hasErrors = checkStatuses.includes('error');
    const hasWarnings = checkStatuses.includes('warning');
    
    if (hasErrors) {
      healthCheck.status = 'error';
      healthCheck.recommendations.push('Revisar logs de errores y configuración de API keys');
    } else if (hasWarnings) {
      healthCheck.status = 'warning';
      healthCheck.recommendations.push('Algunos componentes presentan advertencias');
    } else {
      healthCheck.status = 'healthy';
    }

    // 6. Determinar estado del fallback
    if (embeddingsService?.fallbackMode) {
      healthCheck.fallbackStatus = 'active';
      healthCheck.recommendations.push('Sistema funcionando en modo fallback - verificar configuración de embeddings');
    } else if (healthCheck.checks.fallbackSystem?.status === 'ok') {
      healthCheck.fallbackStatus = 'ready';
    } else {
      healthCheck.fallbackStatus = 'unavailable';
      healthCheck.recommendations.push('Sistema de fallback no disponible');
    }

    // 7. Recomendaciones adicionales
    if (!process.env.GEMINI_API_KEY) {
      healthCheck.recommendations.push('Configurar GEMINI_API_KEY en variables de entorno');
    }
    
    if (healthCheck.checks.embeddingsSearch?.resultsCount === 0) {
      healthCheck.recommendations.push('Base de conocimientos podría estar vacía o mal configurada');
    }

    // Determinar código de respuesta HTTP
    const statusCode = healthCheck.status === 'error' ? 503 : 
                      healthCheck.status === 'warning' ? 200 : 200;

    return res.status(statusCode).json(healthCheck);

  } catch (error) {
    // Log detallado del error
    console.error('Error en health check de embeddings:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'Oculto en producción'
    });
    
    healthCheck.status = 'error';
    healthCheck.checks.general = {
      status: 'error',
      message: `Error crítico en health check: ${process.env.NODE_ENV === 'development' ? error.message : 'Error interno'}`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
    healthCheck.recommendations.push('Error crítico - revisar logs del servidor');

    return res.status(503).json(healthCheck);
  }
}

// ============================================================================
// EXPORT CON SEGURIDAD CENTRALIZADA
// ============================================================================
// El wrapper withSecurity aplica automáticamente:
// - CORS headers
// - Security headers
// - Rate limiting (soft para health checks)
// - Attack detection
// - Timeout protection
// - Error handling
export default withSecurity(embeddingsHealthHandler);