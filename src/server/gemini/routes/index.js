import express from 'express';
import geminiRoutes from './gemini-routes.js';
import enhancedStreamingRoutes from './enhanced-streaming-routes.js';
import errorHandler from '../middlewares/error-handler.js';
import costTrackingService from '../services/cost-tracking-service.js';
import tokenCountingService from '../services/token-counting-service.js';
import contextCacheService from '../services/context-cache-service.js';

const router = express.Router();

// General test route to verify that the server is working
router.get('/hello', (_, res) => {
  res.json({
    message: 'Hello from the Nuxchain-App server!',
    timestamp: new Date().toISOString()
  });
});

// 🆕 METRICS ENDPOINT: Get cost tracking and token usage stats
router.get('/metrics', async (_, res) => {
  try {
    const costStats = costTrackingService.getStats();
    const tokenStats = tokenCountingService.getStats();
    const cacheStats = contextCacheService.getStats();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      costs: costStats,
      tokens: tokenStats,
      cache: cacheStats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

// 🆕 METRICS SUMMARY: Get formatted summary for logging
router.get('/metrics/summary', (_, res) => {
  try {
    const summary = costTrackingService.getSummary();
    res.type('text/plain').send(summary);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate summary',
      message: error.message
    });
  }
});

// 🆕 CACHE LIST: List active Gemini caches
router.get('/cache/list', async (_, res) => {
  try {
    const activeCaches = await contextCacheService.listActiveCaches();
    const localStats = contextCacheService.getStats();
    
    res.json({
      status: 'ok',
      activeCaches,
      localStats
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list caches',
      message: error.message
    });
  }
});

// Usar el router de Gemini
router.use('/gemini', geminiRoutes);

// Agregar rutas de chat que mapean a Gemini
router.use('/chat', geminiRoutes);

// Usar el router de streaming mejorado
router.use('/streaming', enhancedStreamingRoutes);

// Remove inline error handler and use shared one
router.use(errorHandler);

export default router;
