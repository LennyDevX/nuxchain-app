/**
 * Función Serverless para Gemini - NuxChain App
 * Maneja todas las operaciones específicas de Gemini AI
 */

import { withSecurity } from '../src/security/serverless-security.js';
import { 
  generateContent,
  functionCalling,
  analyzeContent,
  compareContent,
  extractKeywords,
  summarizeContent,
  translateContent,
  generateCode,
  explainCode,
  optimizeCode,
  generateTests,
  reviewCode,
  generateDocumentation,
  processBatchGeneration,
  getModels,
  getModelInfo
} from '../src/server/controllers/gemini-controller.js';

async function geminiHandler(req, res) {
  const { method, body, query, url } = req;
  const path = new URL(url, `http://${req.headers.host}`).pathname;
  
  // Enrutar basado en el path y método
  try {
    if (path.includes('/function-calling')) {
      return await functionCalling(req, res);
    } else if (path.includes('/analyze')) {
      return await analyzeContent(req, res);
    } else if (path.includes('/compare')) {
      return await compareContent(req, res);
    } else if (path.includes('/extract-keywords')) {
      return await extractKeywords(req, res);
    } else if (path.includes('/summarize')) {
      return await summarizeContent(req, res);
    } else if (path.includes('/translate')) {
      return await translateContent(req, res);
    } else if (path.includes('/generate-code')) {
      return await generateCode(req, res);
    } else if (path.includes('/explain-code')) {
      return await explainCode(req, res);
    } else if (path.includes('/optimize-code')) {
      return await optimizeCode(req, res);
    } else if (path.includes('/generate-tests')) {
      return await generateTests(req, res);
    } else if (path.includes('/review-code')) {
      return await reviewCode(req, res);
    } else if (path.includes('/generate-docs')) {
      return await generateDocumentation(req, res);
    } else if (path.includes('/batch')) {
      return await processBatchGeneration(req, res);
    } else if (path.includes('/models')) {
      if (path.includes('/info')) {
        return await getModelInfo(req, res);
      } else {
        return await getModels(req, res);
      }
    } else if (path.includes('/stream')) {
      // Import the streaming function
      const { streamChatWithTools } = await import('../src/server/controllers/gemini-controller.js');
      return await streamChatWithTools(req, res);
    } else if (path.includes('/health')) {
      return res.status(200).json({
        status: 'healthy',
        service: 'gemini-api',
        timestamp: new Date().toISOString(),
        endpoints: [
          '/api/gemini/function-calling',
          '/api/gemini/analyze',
          '/api/gemini/compare',
          '/api/gemini/extract-keywords',
          '/api/gemini/summarize',
          '/api/gemini/translate',
          '/api/gemini/generate-code',
          '/api/gemini/explain-code',
          '/api/gemini/optimize-code',
          '/api/gemini/generate-tests',
          '/api/gemini/review-code',
          '/api/gemini/generate-docs',
          '/api/gemini/batch',
          '/api/gemini/models',
          '/api/gemini/models/info',
          '/api/gemini/stream',
          '/api/gemini/health'
        ]
      });
    } else {
      // Endpoint por defecto - generación de contenido
      return await generateContent(req, res);
    }
  } catch (error) {
    console.error('Error en función serverless de Gemini:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
    });
  }
}

export default withSecurity(geminiHandler);