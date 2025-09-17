/**
 * Función Serverless para Gemini Server Routes - NuxChain App
 * Maneja el endpoint /api/server/gemini
 */

import { withSecurity } from '../../src/security/serverless-security.js';
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
  getModelInfo,
  streamChatWithTools,
  processChatWithTools,
  processUrlContext,
  getHealthStatus
} from '../../src/server/controllers/gemini-controller.js';

async function serverGeminiHandler(req, res) {
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
    } else if (path.includes('/stream-with-tools')) {
      return await streamChatWithTools(req, res);
    } else if (path.includes('/chat-with-tools')) {
      return await processChatWithTools(req, res);
    } else if (path.includes('/url-context')) {
      return await processUrlContext(req, res);
    } else if (path.includes('/health')) {
      return await getHealthStatus(req, res);
    } else {
      // Endpoint por defecto - generación de contenido
      return await generateContent(req, res);
    }
  } catch (error) {
    console.error('Error en función serverless de Gemini Server:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
    });
  }
}

export default withSecurity(serverGeminiHandler);