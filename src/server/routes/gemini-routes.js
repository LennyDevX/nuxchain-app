import express from 'express';
import { check, validationResult } from 'express-validator';
import * as geminiController from '../controllers/gemini-controller.js';
import rateLimiter from '../middlewares/rate-limiter.js';
import auth from '../middlewares/auth.js';
import requestLogger from '../middlewares/logger.js';
import enhancedStreamingRoutes from './enhanced-streaming-routes.js';
import errorHandler from '../middlewares/error-handler.js';

const router = express.Router();

// Middleware de validación para la generación de contenido
const validateGenerateContent = [
  check('prompt')
    .optional()
    .isString().withMessage('El prompt debe ser una cadena de texto.')
    .notEmpty().withMessage('El prompt no puede estar vacío si se proporciona.'),
  check('messages')
    .optional()
    .isArray().withMessage('Messages debe ser un array.')
    .notEmpty().withMessage('Messages no puede estar vacío si se proporciona.'),
  check('temperature')
    .optional()
    .isFloat({ min: 0, max: 2 }).withMessage('La temperatura debe ser un número entre 0 y 2.'),
  check('maxTokens')
    .optional()
    .isInt({ min: 1, max: 8192 }).withMessage('maxTokens debe ser un entero entre 1 y 8192.'),
  check('image')
    .optional()
    .isString().withMessage('La imagen debe ser una cadena en formato base64.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Aplicar middleware en todas las rutas de Gemini
router.use(requestLogger);
router.use(rateLimiter);
router.use(auth);

// Endpoints de salud y prueba
router.get('/health', geminiController.getHealthStatus);
router.get('/hello', geminiController.helloCheck);
router.get('/check-api', geminiController.checkApiConnection);

// Endpoints principales
router.post('/', validateGenerateContent, geminiController.generateContent);
router.get('/', validateGenerateContent, geminiController.generateContentGet);
router.post('/stream', validateGenerateContent, geminiController.generateContent); // Endpoint de streaming
router.post('/function-calling', geminiController.functionCalling);

// Endpoints de análisis expandidos
router.post('/analyze', geminiController.analyzeText);
router.post('/compare', geminiController.compareTexts); // Nueva función

// Endpoint para procesar URLs
router.post('/extract-url', geminiController.extractUrlContent);
router.post('/extract-multiple-urls', geminiController.extractMultipleUrls);
router.post('/validate-url', geminiController.validateUrl);

// Embeddings API
router.post('/embeddings/index', geminiController.upsertEmbeddingsIndex);
router.post('/embeddings/search', geminiController.searchEmbeddings);
router.delete('/embeddings/index/:name', geminiController.clearEmbeddingsIndex);

// Context cache stats
router.get('/context-cache/stats', geminiController.getContextCacheStats);

// === NUEVAS RUTAS: BATCH PROCESSING ===
// Procesamiento en lotes
router.post('/batch/generate', geminiController.processBatchGeneration);
router.post('/batch/embeddings', geminiController.processBatchEmbeddings);
router.post('/batch/analyze', geminiController.processBatchAnalysis);

// Gestión de batch jobs
router.get('/batch/status/:batchId', geminiController.getBatchStatus);
router.get('/batch/active', geminiController.getActiveBatches);
router.delete('/batch/:batchId', geminiController.cancelBatch);
router.get('/batch/stats', geminiController.getBatchStats);

// === NUEVAS RUTAS: ANALYTICS AVANZADAS ===
// Métricas y monitoreo
router.get('/analytics/metrics', geminiController.getAdvancedMetrics);
router.get('/analytics/realtime', geminiController.getRealTimeMetrics);
router.get('/analytics/insights', geminiController.getSystemInsights);
router.get('/analytics/stream', geminiController.streamMetrics);

// Gestión de métricas
router.post('/analytics/export', geminiController.exportMetrics);
router.post('/analytics/reset', geminiController.resetMetrics);

// === NUEVAS RUTAS: URL CONTEXT ===
// URL Context processing
router.post('/url-context', geminiController.processUrlContext);

// Chat con herramientas habilitadas
router.post('/chat-with-tools', geminiController.processChatWithTools);
router.post('/stream-with-tools', geminiController.streamChatWithTools);

// Endpoints existentes
router.delete('/cache', geminiController.clearCache);
router.get('/models', geminiController.getAvailableModels);
router.get('/stats', geminiController.getUsageStats);

// Usar el router de streaming mejorado
router.use('/streaming', enhancedStreamingRoutes);

// Remove inline error handler and use shared one
router.use(errorHandler);

export default router;
