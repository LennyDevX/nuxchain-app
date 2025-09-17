/**
 * Función Serverless para Embeddings - NuxChain App
 * Maneja operaciones de vectores y búsqueda semántica
 */

import { withSecurity } from '../../src/security/serverless-security.js';
import embeddingsService from '../../src/server/services/embeddings-service.js';

async function embeddingsHandler(req, res) {
  
  try {
    const { method, body, query, url } = req;
    const path = new URL(url, `http://${req.headers.host}`).pathname;
    
    // Enrutar basado en el path
    if (path.includes('/search')) {
      return await handleSearchEmbeddings(req, res, body, query);
    } else if (path.includes('/upsert')) {
      return await handleUpsertEmbeddings(req, res, body);
    } else if (path.includes('/clear')) {
      return await handleClearEmbeddings(req, res);
    } else if (path.includes('/stats')) {
      return await handleGetEmbeddingsStats(req, res);
    } else if (path.includes('/health')) {
      return await handleHealthCheck(req, res);
    } else {
      res.status(404).json({
        error: 'Endpoint no encontrado',
        availableEndpoints: [
          '/api/embeddings/search',
          '/api/embeddings/upsert',
          '/api/embeddings/clear',
          '/api/embeddings/stats',
          '/api/embeddings/health'
        ]
      });
    }
  } catch (error) {
    console.error('Error en función serverless de embeddings:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
    });
  }
}

export default withSecurity(embeddingsHandler);

/**
 * Maneja búsqueda de embeddings
 */
async function handleSearchEmbeddings(req, res, body, query) {
  const searchQuery = req.method === 'POST' ? body.query : query.query;
  const limit = parseInt(req.method === 'POST' ? body.limit : query.limit) || 10;
  const threshold = parseFloat(req.method === 'POST' ? body.threshold : query.threshold) || 0.7;
  
  if (!searchQuery) {
    return res.status(400).json({
      error: 'Parámetro "query" requerido',
      example: { query: "búsqueda semántica", limit: 10, threshold: 0.7 }
    });
  }
  
  try {
    const results = await embeddingsService.searchSimilar(searchQuery, {
      limit,
      threshold
    });
    
    res.status(200).json({
      success: true,
      data: {
        query: searchQuery,
        results,
        count: results.length,
        limit,
        threshold
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error buscando embeddings:', error);
    res.status(500).json({
      error: 'Error buscando embeddings',
      message: error.message
    });
  }
}

/**
 * Maneja inserción/actualización de embeddings
 */
async function handleUpsertEmbeddings(req, res, body) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }
  
  const { texts, metadata = [], namespace = 'default' } = body;
  
  if (!texts || !Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({
      error: 'Parámetro "texts" requerido como array no vacío',
      example: { 
        texts: ["Texto 1", "Texto 2"], 
        metadata: [{ id: 1 }, { id: 2 }], 
        namespace: "default" 
      }
    });
  }
  
  try {
    const results = await embeddingsService.upsertTexts(texts, {
      metadata,
      namespace
    });
    
    res.status(200).json({
      success: true,
      data: {
        processed: results.length,
        namespace,
        results
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error insertando embeddings:', error);
    res.status(500).json({
      error: 'Error insertando embeddings',
      message: error.message
    });
  }
}

/**
 * Maneja limpieza de embeddings
 */
async function handleClearEmbeddings(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Use POST.' });
  }
  
  try {
    await embeddingsService.clearIndex();
    
    res.status(200).json({
      success: true,
      message: 'Índice de embeddings limpiado exitosamente',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error limpiando embeddings:', error);
    res.status(500).json({
      error: 'Error limpiando embeddings',
      message: error.message
    });
  }
}

/**
 * Obtiene estadísticas de embeddings
 */
async function handleGetEmbeddingsStats(req, res) {
  try {
    const stats = await embeddingsService.getStats();
    
    res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de embeddings:', error);
    res.status(500).json({
      error: 'Error obteniendo estadísticas',
      message: error.message
    });
  }
}

/**
 * Health check
 */
async function handleHealthCheck(req, res) {
  try {
    const isHealthy = await embeddingsService.healthCheck();
    
    res.status(200).json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      service: 'embeddings-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}