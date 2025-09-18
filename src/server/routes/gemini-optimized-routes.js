/**
 * Rutas para la API Gemini Optimizada v2.0
 * Integración con la nueva arquitectura modular
 */

import express from 'express';
import geminiOptimizedHandler from '../../../api/gemini-v2.js';

const router = express.Router();

// === MIDDLEWARE DE LOGGING ===

router.use((req, res, next) => {
  console.log(`[GEMINI-OPTIMIZED] ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// === RUTAS PRINCIPALES ===

// Ruta principal de información de la API
router.get('/', geminiOptimizedHandler);
router.get('/info', geminiOptimizedHandler);

// Endpoint de chat optimizado
router.all('/chat', geminiOptimizedHandler);

// Endpoints de análisis
router.all('/analysis', geminiOptimizedHandler);
router.all('/analysis/batch', geminiOptimizedHandler);

// Endpoints de monitoreo
router.get('/health', geminiOptimizedHandler);
router.get('/metrics', geminiOptimizedHandler);

// Documentación
router.get('/docs', geminiOptimizedHandler);

// === MIDDLEWARE DE COMPATIBILIDAD ===

// Redirigir rutas antiguas a las nuevas
router.use('/chat', (req, res, next) => {
  // Agregar headers de migración
  res.set({
    'X-API-Migration': 'v1-to-v2-optimized',
    'X-Migration-Status': 'active',
    'X-Original-Endpoint': '/server/gemini/chat',
    'X-New-Endpoint': '/server/gemini-optimized/chat'
  });
  next();
});

// === MANEJO DE ERRORES ===

router.use((error, req, res, next) => {
  console.error('[GEMINI-OPTIMIZED-ERROR]:', error);
  
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Error en API Gemini Optimizada',
      message: error.message,
      timestamp: new Date().toISOString(),
      endpoint: req.path,
      method: req.method,
      requestId: req.requestId || 'unknown'
    });
  }
});

export default router;