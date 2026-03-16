import express from 'express';
import geminiRoutes from './gemini-routes.js';
import enhancedStreamingRoutes from './enhanced-streaming-routes.js';
import airdropRoutes from './airdrop-routes.js';
import skillsRoutes from './skills-routes.js';
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

// Rutas de Airdrop
router.use('/airdrop', airdropRoutes);

// 🧠 AI Skills routes (all 9 skill endpoints, no tier gating in local dev)
router.use('/skills', skillsRoutes);

// 🌐 PUBLIC: Price proxy - no auth required
router.get('/price/solana', async (_, res) => {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      {
        headers: { Accept: 'application/json', 'User-Agent': 'NuxChain-Backend/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!response.ok) throw new Error(`CoinGecko ${response.status}`);
    const data = await response.json();
    return res.json({ success: true, solana: { usd: data.solana.usd }, source: 'coingecko', timestamp: Date.now() });
  } catch (err) {
    // Fallback value so the UI still shows a reasonable price
    return res.json({ success: true, solana: { usd: 90 }, source: 'fallback', timestamp: Date.now() });
  }
});

// Remove inline error handler and use shared one
router.use(errorHandler);

export default router;
