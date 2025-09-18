/**
 * Handlers Optimizados para Gemini AI - NuxChain App
 * Implementaciones específicas con manejo de errores y validación
 */

import { withErrorHandling, ExternalServiceError, ValidationError } from '../middleware/error-handler.js';
import { 
  processGeminiRequest,
  generateContent,
  generateContentWithTools,
  executeFunction
} from '../../src/server/controllers/gemini-controller.js';

/**
 * Handler para health check
 */
export const handleHealth = withErrorHandling(async (req, res) => {
  const health = {
    status: 'healthy',
    service: 'gemini-ai',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      caching: true,
      compression: true,
      validation: true,
      errorHandling: true,
      functionCalling: true,
      streaming: true
    },
    endpoints: [
      '/api/gemini/generate',
      '/api/gemini/function-calling',
      '/api/gemini/analyze',
      '/api/gemini/compare',
      '/api/gemini/extract-keywords',
      '/api/gemini/summarize',
      '/api/gemini/translate',
      '/api/gemini/code/*',
      '/api/gemini/batch',
      '/api/gemini/models'
    ]
  };

  return res.status(200).json(health);
});

/**
 * Handler para generación de contenido
 */
export const handleGenerate = withErrorHandling(async (req, res) => {
  const { prompt, model, temperature, maxTokens } = req.validated.body;

  try {
    const result = await generateContent(req, res);
    
    // Si el controlador ya envió la respuesta, no hacer nada más
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error generando contenido: ${error.message}`);
  }
});

/**
 * Handler para function calling
 */
export const handleFunctionCalling = withErrorHandling(async (req, res) => {
  const { prompt, model } = req.validated.body;

  try {
    const result = await generateContentWithTools(req, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error en function calling: ${error.message}`);
  }
});

/**
 * Handler para análisis de contenido
 */
export const handleAnalyze = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  if (!prompt.includes('analizar') && !prompt.includes('analyze')) {
    throw new ValidationError('El prompt debe incluir instrucciones de análisis');
  }

  try {
    // Usar el controlador existente pero con validación adicional
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Analiza detalladamente el siguiente contenido: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error analizando contenido: ${error.message}`);
  }
});

/**
 * Handler para comparación de contenido
 */
export const handleCompare = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Compara y contrasta los siguientes elementos: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error comparando contenido: ${error.message}`);
  }
});

/**
 * Handler para extracción de palabras clave
 */
export const handleExtractKeywords = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Extrae las palabras clave más importantes del siguiente texto y organízalas por relevancia: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error extrayendo palabras clave: ${error.message}`);
  }
});

/**
 * Handler para resumen de contenido
 */
export const handleSummarize = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Crea un resumen conciso y completo del siguiente contenido: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error resumiendo contenido: ${error.message}`);
  }
});

/**
 * Handler para traducción
 */
export const handleTranslate = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Traduce el siguiente texto manteniendo el contexto y significado original: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error traduciendo contenido: ${error.message}`);
  }
});

/**
 * Handler para generación de código
 */
export const handleGenerateCode = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Genera código limpio, bien documentado y siguiendo las mejores prácticas para: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error generando código: ${error.message}`);
  }
});

/**
 * Handler para explicación de código
 */
export const handleExplainCode = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Explica detalladamente el siguiente código, incluyendo su propósito, funcionamiento y mejores prácticas: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error explicando código: ${error.message}`);
  }
});

/**
 * Handler para optimización de código
 */
export const handleOptimizeCode = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Optimiza el siguiente código mejorando rendimiento, legibilidad y mantenibilidad: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error optimizando código: ${error.message}`);
  }
});

/**
 * Handler para generación de tests
 */
export const handleGenerateTests = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Genera tests completos y exhaustivos para el siguiente código: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error generando tests: ${error.message}`);
  }
});

/**
 * Handler para revisión de código
 */
export const handleReviewCode = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Realiza una revisión exhaustiva del siguiente código, identificando problemas, mejoras y sugerencias: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error revisando código: ${error.message}`);
  }
});

/**
 * Handler para generación de documentación
 */
export const handleGenerateDocumentation = withErrorHandling(async (req, res) => {
  const { prompt } = req.validated.body;

  try {
    const enhancedReq = {
      ...req,
      body: {
        ...req.body,
        prompt: `Genera documentación completa y profesional para el siguiente código: ${prompt}`
      }
    };

    const result = await generateContent(enhancedReq, res);
    
    if (res.headersSent) {
      return;
    }

    return result;
  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error generando documentación: ${error.message}`);
  }
});

/**
 * Handler para procesamiento por lotes
 */
export const handleBatchGeneration = withErrorHandling(async (req, res) => {
  const { requests } = req.validated.body;

  try {
    const results = [];
    const errors = [];

    for (let i = 0; i < requests.length; i++) {
      try {
        const mockReq = {
          ...req,
          body: requests[i]
        };
        
        const mockRes = {
          status: () => mockRes,
          json: (data) => data,
          headersSent: false
        };

        const result = await generateContent(mockReq, mockRes);
        results.push({
          index: i,
          success: true,
          data: result
        });
      } catch (error) {
        errors.push({
          index: i,
          success: false,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      processed: requests.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    throw new ExternalServiceError('Gemini AI', `Error en procesamiento por lotes: ${error.message}`);
  }
});

/**
 * Handler para obtener modelos disponibles
 */
export const handleGetModels = withErrorHandling(async (req, res) => {
  const models = [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Modelo más avanzado para tareas complejas',
      maxTokens: 2097152,
      features: ['text', 'images', 'code', 'function-calling']
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'Modelo rápido para tareas generales',
      maxTokens: 1048576,
      features: ['text', 'images', 'code']
    }
  ];

  return res.status(200).json({
    success: true,
    models,
    count: models.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Handler para información detallada de modelos
 */
export const handleGetModelInfo = withErrorHandling(async (req, res) => {
  const { model } = req.query;

  const modelInfo = {
    'gemini-1.5-pro': {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      version: '1.5',
      description: 'Modelo más avanzado de Google para tareas complejas de IA',
      capabilities: {
        textGeneration: true,
        imageAnalysis: true,
        codeGeneration: true,
        functionCalling: true,
        multimodal: true
      },
      limits: {
        maxTokens: 2097152,
        maxImages: 16,
        maxVideoDuration: '1 hour'
      },
      pricing: {
        inputTokens: '$0.00125 per 1K tokens',
        outputTokens: '$0.00375 per 1K tokens'
      }
    },
    'gemini-1.5-flash': {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      version: '1.5',
      description: 'Modelo optimizado para velocidad y eficiencia',
      capabilities: {
        textGeneration: true,
        imageAnalysis: true,
        codeGeneration: true,
        functionCalling: false,
        multimodal: true
      },
      limits: {
        maxTokens: 1048576,
        maxImages: 16,
        maxVideoDuration: '30 minutes'
      },
      pricing: {
        inputTokens: '$0.000075 per 1K tokens',
        outputTokens: '$0.0003 per 1K tokens'
      }
    }
  };

  if (model && modelInfo[model]) {
    return res.status(200).json({
      success: true,
      model: modelInfo[model],
      timestamp: new Date().toISOString()
    });
  }

  return res.status(200).json({
    success: true,
    models: modelInfo,
    timestamp: new Date().toISOString()
  });
});

export default {
  handleHealth,
  handleGenerate,
  handleFunctionCalling,
  handleAnalyze,
  handleCompare,
  handleExtractKeywords,
  handleSummarize,
  handleTranslate,
  handleGenerateCode,
  handleExplainCode,
  handleOptimizeCode,
  handleGenerateTests,
  handleReviewCode,
  handleGenerateDocumentation,
  handleBatchGeneration,
  handleGetModels,
  handleGetModelInfo
};