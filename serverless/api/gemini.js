/**
 * Función Serverless para Gemini AI - NuxChain App
 * Procesamiento optimizado de solicitudes de IA con Gemini
 */

import { createServerlessHandler } from '../middleware/router.js';
import { validateRequest, commonSchemas } from '../middleware/validation.js';
import { cacheAndCompress, cacheConfigs } from '../middleware/cache.js';
import { withErrorHandling, ValidationError, ExternalServiceError } from '../middleware/error-handler.js';
import handlers from '../handlers/gemini-handlers.js';

/**
 * Configuración de rutas para Gemini AI
 */
function setupGeminiRoutes(router) {
  // Health check con cache corto
  router.get('/health', 
    cacheAndCompress(cacheConfigs.short),
    handlers.handleHealth
  );

  // Generación de contenido con validación y cache
  router.post('/generate',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.medium),
    handlers.handleGenerate
  );

  // Function calling con validación
  router.post('/function-calling',
    validateRequest(schemas.geminiGenerate),
    handlers.handleFunctionCalling
  );

  // Rutas especializadas con cache
  router.post('/analyze',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.medium),
    handlers.handleAnalyze
  );

  router.post('/compare',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.medium),
    handlers.handleCompare
  );

  router.post('/extract-keywords',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleExtractKeywords
  );

  router.post('/summarize',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.medium),
    handlers.handleSummarize
  );

  router.post('/translate',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleTranslate
  );

  // Rutas de código con cache largo
  router.post('/code/generate',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleGenerateCode
  );

  router.post('/code/explain',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleExplainCode
  );

  router.post('/code/optimize',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleOptimizeCode
  );

  router.post('/code/test',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleGenerateTests
  );

  router.post('/code/review',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleReviewCode
  );

  router.post('/code/document',
    validateRequest(schemas.geminiGenerate),
    cacheAndCompress(cacheConfigs.long),
    handlers.handleGenerateDocumentation
  );

  // Procesamiento por lotes
  router.post('/batch',
    validateRequest(schemas.geminiBatch),
    handlers.handleBatchGeneration
  );

  // Información de modelos
  router.get('/models',
    cacheAndCompress(cacheConfigs.long),
    handlers.handleGetModels
  );

  router.get('/models/:model',
    cacheAndCompress(cacheConfigs.long),
    handlers.handleGetModelInfo
  );
}

const geminiHandler = createServerlessHandler(setupGeminiRoutes)

export default withErrorHandling(geminiHandler);