/**
 * Handler de Análisis de Texto - API Gemini Optimizada
 * Maneja análisis de sentimientos, resúmenes, traducciones y clasificación
 */

import { generateContent } from '../../../src/server/controllers/gemini-controller.js';

// === CONFIGURACIÓN DEL ANÁLISIS ===

const analysisConfig = {
  supportedTypes: [
    'sentiment',
    'summary', 
    'keywords',
    'translation',
    'classification',
    'entities',
    'topics'
  ],
  
  supportedLanguages: [
    'es', 'en', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh'
  ],
  
  limits: {
    maxTextLength: 20000,
    minTextLength: 10,
    maxBatchSize: 10,
    timeout: 45000
  },
  
  defaultModel: 'gemini-2.5-flash'
};

// === PROMPTS DE ANÁLISIS ===

const analysisPrompts = {
  sentiment: (text, language = 'es') => `
Analiza el sentimiento del siguiente texto en ${language}. 
Responde SOLO con un JSON válido con esta estructura:
{
  "sentiment": "positive|negative|neutral",
  "confidence": 0.95,
  "emotions": ["joy", "excitement"],
  "summary": "Breve explicación del sentimiento detectado"
}

Texto a analizar:
${text}
`,

  summary: (text, language = 'es') => `
Crea un resumen conciso del siguiente texto en ${language}.
Responde SOLO con un JSON válido con esta estructura:
{
  "summary": "Resumen del texto en 2-3 oraciones",
  "keyPoints": ["punto 1", "punto 2", "punto 3"],
  "wordCount": {
    "original": 150,
    "summary": 45
  }
}

Texto a resumir:
${text}
`,

  keywords: (text, language = 'es') => `
Extrae las palabras clave más importantes del siguiente texto en ${language}.
Responde SOLO con un JSON válido con esta estructura:
{
  "keywords": ["palabra1", "palabra2", "palabra3"],
  "phrases": ["frase importante 1", "frase importante 2"],
  "topics": ["tema1", "tema2"],
  "relevanceScore": 0.85
}

Texto a analizar:
${text}
`,

  translation: (text, targetLanguage = 'en', sourceLanguage = 'auto') => `
Traduce el siguiente texto al ${targetLanguage}. 
Responde SOLO con un JSON válido con esta estructura:
{
  "translation": "Texto traducido aquí",
  "sourceLanguage": "${sourceLanguage}",
  "targetLanguage": "${targetLanguage}",
  "confidence": 0.95
}

Texto a traducir:
${text}
`,

  classification: (text, categories = [], language = 'es') => `
Clasifica el siguiente texto en ${language} en una de estas categorías: ${categories.join(', ')}.
Si no se proporcionan categorías, usa categorías generales como: tecnología, negocios, entretenimiento, deportes, política, ciencia.
Responde SOLO con un JSON válido con esta estructura:
{
  "category": "categoría principal",
  "confidence": 0.90,
  "subcategories": ["subcategoría1", "subcategoría2"],
  "reasoning": "Breve explicación de por qué se clasificó así"
}

Texto a clasificar:
${text}
`,

  entities: (text, language = 'es') => `
Identifica las entidades nombradas en el siguiente texto en ${language}.
Responde SOLO con un JSON válido con esta estructura:
{
  "entities": [
    {"text": "Madrid", "type": "LOCATION", "confidence": 0.95},
    {"text": "Juan Pérez", "type": "PERSON", "confidence": 0.90}
  ],
  "summary": "Resumen de las entidades encontradas"
}

Texto a analizar:
${text}
`,

  topics: (text, language = 'es') => `
Identifica los temas principales del siguiente texto en ${language}.
Responde SOLO con un JSON válido con esta estructura:
{
  "topics": [
    {"topic": "Inteligencia Artificial", "relevance": 0.95},
    {"topic": "Tecnología", "relevance": 0.80}
  ],
  "mainTopic": "Inteligencia Artificial",
  "summary": "Breve descripción de los temas tratados"
}

Texto a analizar:
${text}
`
};

// === FUNCIONES DE VALIDACIÓN ===

/**
 * Valida los parámetros de análisis
 */
function validateAnalysisParams(body) {
  const errors = [];
  
  if (!body.text || typeof body.text !== 'string') {
    errors.push('Campo "text" es requerido y debe ser string');
  } else {
    if (body.text.length < analysisConfig.limits.minTextLength) {
      errors.push(`Texto debe tener al menos ${analysisConfig.limits.minTextLength} caracteres`);
    }
    if (body.text.length > analysisConfig.limits.maxTextLength) {
      errors.push(`Texto no puede exceder ${analysisConfig.limits.maxTextLength} caracteres`);
    }
  }
  
  if (!body.analysisType || !analysisConfig.supportedTypes.includes(body.analysisType)) {
    errors.push(`analysisType debe ser uno de: ${analysisConfig.supportedTypes.join(', ')}`);
  }
  
  if (body.targetLanguage && !analysisConfig.supportedLanguages.includes(body.targetLanguage)) {
    errors.push(`targetLanguage debe ser uno de: ${analysisConfig.supportedLanguages.join(', ')}`);
  }
  
  return errors;
}

/**
 * Valida parámetros de análisis batch
 */
function validateBatchParams(body) {
  const errors = [];
  
  if (!body.requests || !Array.isArray(body.requests)) {
    errors.push('Campo "requests" es requerido y debe ser un array');
  } else {
    if (body.requests.length === 0) {
      errors.push('Debe proporcionar al menos una request');
    }
    if (body.requests.length > analysisConfig.limits.maxBatchSize) {
      errors.push(`Máximo ${analysisConfig.limits.maxBatchSize} requests por batch`);
    }
    
    body.requests.forEach((req, index) => {
      if (!req.id) {
        errors.push(`Request ${index}: campo "id" es requerido`);
      }
      if (!req.text) {
        errors.push(`Request ${index}: campo "text" es requerido`);
      }
      if (!req.analysisType || !analysisConfig.supportedTypes.includes(req.analysisType)) {
        errors.push(`Request ${index}: analysisType inválido`);
      }
    });
  }
  
  return errors;
}

// === HANDLERS DE ANÁLISIS ===

/**
 * Procesa un análisis individual
 */
async function processAnalysis(text, analysisType, options = {}) {
  try {
    const {
      targetLanguage = 'es',
      sourceLanguage = 'auto',
      categories = [],
      model = analysisConfig.defaultModel
    } = options;
    
    // Obtener prompt específico
    let prompt;
    switch (analysisType) {
      case 'sentiment':
        prompt = analysisPrompts.sentiment(text, targetLanguage);
        break;
      case 'summary':
        prompt = analysisPrompts.summary(text, targetLanguage);
        break;
      case 'keywords':
        prompt = analysisPrompts.keywords(text, targetLanguage);
        break;
      case 'translation':
        prompt = analysisPrompts.translation(text, targetLanguage, sourceLanguage);
        break;
      case 'classification':
        prompt = analysisPrompts.classification(text, categories, targetLanguage);
        break;
      case 'entities':
        prompt = analysisPrompts.entities(text, targetLanguage);
        break;
      case 'topics':
        prompt = analysisPrompts.topics(text, targetLanguage);
        break;
      default:
        throw new Error(`Tipo de análisis no soportado: ${analysisType}`);
    }
    
    // Crear request para Gemini
    const geminiRequest = {
      body: {
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        model,
        temperature: 0.1, // Baja temperatura para análisis consistente
        maxTokens: 1024
      }
    };
    
    // Simular respuesta (en implementación real, llamar a generateContent)
    const mockResponse = {
      json: (data) => data
    };
    
    const result = await generateContent(geminiRequest, mockResponse);
    
    // Intentar parsear JSON de la respuesta
    let parsedResult;
    try {
      const content = result.content || result.message || result.text || '';
      parsedResult = JSON.parse(content);
    } catch (parseError) {
      // Si no es JSON válido, crear estructura básica
      parsedResult = {
        result: result.content || result.message || result.text || '',
        analysisType,
        warning: 'Respuesta no está en formato JSON esperado'
      };
    }
    
    return {
      success: true,
      analysisType,
      data: parsedResult,
      metadata: {
        textLength: text.length,
        model,
        processingTime: Date.now()
      }
    };
    
  } catch (error) {
    console.error(`Error en análisis ${analysisType}:`, error);
    return {
      success: false,
      analysisType,
      error: error.message,
      metadata: {
        textLength: text.length,
        processingTime: Date.now()
      }
    };
  }
}

/**
 * Handler para análisis individual
 */
export async function analysisHandler(req, res) {
  try {
    const startTime = Date.now();
    
    // Validar parámetros
    const errors = validateAnalysisParams(req.validatedBody || req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Parámetros inválidos',
        details: errors
      });
    }
    
    const {
      text,
      analysisType,
      targetLanguage = 'es',
      sourceLanguage = 'auto',
      categories = [],
      model = analysisConfig.defaultModel
    } = req.validatedBody || req.body;
    
    // Procesar análisis
    const result = await processAnalysis(text, analysisType, {
      targetLanguage,
      sourceLanguage,
      categories,
      model
    });
    
    const responseTime = Date.now() - startTime;
    
    if (result.success) {
      return res.json({
        ...result,
        metadata: {
          ...result.metadata,
          responseTime,
          requestId: req.requestId
        }
      });
    } else {
      return res.status(500).json({
        error: 'Error en análisis',
        details: result.error,
        analysisType: result.analysisType,
        requestId: req.requestId
      });
    }
    
  } catch (error) {
    console.error('Error en analysisHandler:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      requestId: req.requestId
    });
  }
}

/**
 * Handler para análisis batch
 */
export async function batchAnalysisHandler(req, res) {
  try {
    const startTime = Date.now();
    
    // Validar parámetros
    const errors = validateBatchParams(req.validatedBody || req.body);
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Parámetros de batch inválidos',
        details: errors
      });
    }
    
    const { requests, priority = 'normal' } = req.validatedBody || req.body;
    
    // Procesar requests en paralelo (con límite)
    const batchPromises = requests.map(async (request) => {
      const result = await processAnalysis(
        request.text,
        request.analysisType,
        {
          targetLanguage: request.targetLanguage,
          sourceLanguage: request.sourceLanguage,
          categories: request.categories,
          model: request.model
        }
      );
      
      return {
        id: request.id,
        ...result
      };
    });
    
    // Ejecutar con timeout
    const results = await Promise.allSettled(batchPromises);
    
    const responseTime = Date.now() - startTime;
    
    // Procesar resultados
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: requests[index].id,
          success: false,
          error: result.reason.message,
          analysisType: requests[index].analysisType
        };
      }
    });
    
    const successCount = processedResults.filter(r => r.success).length;
    const errorCount = processedResults.length - successCount;
    
    return res.json({
      success: true,
      results: processedResults,
      summary: {
        total: processedResults.length,
        successful: successCount,
        failed: errorCount,
        responseTime,
        priority
      },
      requestId: req.requestId
    });
    
  } catch (error) {
    console.error('Error en batchAnalysisHandler:', error);
    return res.status(500).json({
      error: 'Error en análisis batch',
      message: error.message,
      requestId: req.requestId
    });
  }
}

/**
 * Handler para información del servicio de análisis
 */
export async function analysisInfoHandler(req, res) {
  return res.json({
    service: 'Gemini Analysis API',
    version: '2.0.0',
    supportedTypes: analysisConfig.supportedTypes,
    supportedLanguages: analysisConfig.supportedLanguages,
    limits: analysisConfig.limits,
    endpoints: {
      analysis: 'POST /api/gemini/analysis',
      batch: 'POST /api/gemini/analysis/batch',
      info: 'GET /api/gemini/analysis'
    },
    examples: {
      sentiment: {
        text: "Me encanta este producto, es fantástico!",
        analysisType: "sentiment",
        targetLanguage: "es"
      },
      summary: {
        text: "Texto largo para resumir...",
        analysisType: "summary",
        targetLanguage: "es"
      }
    }
  });
}

// === EXPORTACIONES ===

export const analysisUtils = {
  validateAnalysisParams,
  validateBatchParams,
  processAnalysis
};

export { analysisConfig };

export default {
  analysisHandler,
  batchAnalysisHandler,
  analysisInfoHandler,
  analysisUtils,
  analysisConfig
};