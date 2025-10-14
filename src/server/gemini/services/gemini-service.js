
import ai, { DEFAULT_MODEL, defaultFunctionDeclaration, urlContextFunctionDeclaration, allFunctionDeclarations } from '../config/ai-config.js';
import { incrementTokenCount, logError, logInfo } from '../middlewares/logger.js';
import env from '../config/environment.js';
import contextCacheService from './context-cache-service.js';
import { GoogleGenAI } from '@google/genai';
import { getModelInfo, getSafeModel } from '../config/ai-config.js';
import embeddingsService from './embeddings-service.js';
import urlContextService from './url-context-service.js';
import semanticStreamingService from './semantic-streaming-service.js';
import { buildSystemInstructionWithContext } from '../../../../api/config/system-instruction.js';


/**
 * Utilidad para timeout y reintentos
 * @param {Function} fn - Función a ejecutar con timeout y reintentos
 * @param {Object} options - Opciones de timeout y reintentos
 * @param {Number} options.timeoutMs - Tiempo máximo de espera en milisegundos
 * @param {Number} options.maxRetries - Número máximo de reintentos
 * @param {Number} options.backoffMs - Tiempo de espera entre reintentos en milisegundos
 * @returns {Promise<any>} - Resultado de la función
 */
async function withTimeoutAndRetry(fn, { timeoutMs = 15000, maxRetries = 3, backoffMs = 1000 } = {}) {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout esperando respuesta de Gemini')), timeoutMs))
      ]);
    } catch (err) {
      // Log inicial
      logError('Error en withTimeoutAndRetry', err, { attempt, maxRetries });

      const msg = String(err?.message || '').toLowerCase();

      // Detectar error de red específico del SDK (@google/genai)
      const isFetchFailed = msg.includes('fetch failed') || msg.includes('failed to fetch');

      // Si es fetch failed y estamos en último intento, lanzar error enriquecido
      if (isFetchFailed && attempt >= maxRetries) {
        const enhanced = new Error('NETWORK_ERROR: Failed to reach Gemini API. Check network, proxy, firewall, or GEMINI_API_KEY.');
        enhanced.code = 'NETWORK_ERROR';
        enhanced.original = err;
        console.error('🔴 [Gemini Service] Network error detected (final attempt):', {
          message: err.message,
          shortStack: (err.stack || '').split('\n')[0],
          geminiApiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
          nodeEnv: process.env.NODE_ENV
        });
        throw enhanced;
      }

      // Decidir si debe reintentar
      const shouldRetry = msg.includes('timeout') ||
                          msg.includes('network') ||
                          msg.includes('overloaded') ||
                          msg.includes('unavailable') ||
                          isFetchFailed ||
                          err?.status === 503 ||
                          err?.status === 429 ||
                          err?.status === 500;

      if (!shouldRetry || attempt >= maxRetries) {
        // Si es fetch failed pero no hay más intentos, enviar enhanced error
        if (isFetchFailed) {
          const enhanced = new Error('NETWORK_ERROR: Failed to reach Gemini API. Check network, proxy, firewall, or GEMINI_API_KEY.');
          enhanced.code = 'NETWORK_ERROR';
          enhanced.original = err;
          console.error('🔴 [Gemini Service] Network error detected (no retry):', {
            message: err.message,
            shortStack: (err.stack || '').split('\n')[0],
            geminiApiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
            nodeEnv: process.env.NODE_ENV
          });
          throw enhanced;
        }
        throw err;
      }

      // Esperar antes de reintentar (backoff + jitter)
      const delay = backoffMs * Math.pow(2, attempt) + Math.floor(Math.random() * 1000);
      console.log(`Reintentando en ${delay}ms (intento ${attempt + 1}/${maxRetries + 1})`);
      await new Promise(r => setTimeout(r, delay));
      attempt++;
    }
  }
}

// Sistema de caché mejorado con TTL
class ResponseCache {
  constructor(maxSize = 100, ttlMs = 300000) { // 5 minutos TTL
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
  }
  
  generateKey(contents, model, params) {
    return JSON.stringify({ contents, model, params });
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  clear() {
    this.cache.clear();
  }
}

const responseCache = new ResponseCache();

/**
 * ✅ NUEVO: Analizar complejidad de la query para determinar límite óptimo
 */
function analyzeQueryComplexity(query) {
  const queryLower = query.toLowerCase();
  const wordCount = query.split(/\s+/).length;
  
  // Patrones de alta complejidad (requieren 8 documentos)
  const highComplexityPatterns = [
    /roadmap|timeline|phase|milestone|plan.*futur|complete.*overview/i,
    /(2024|2025|2026|2027).*(?:2024|2025|2026|2027)/i,
    /(staking|nft|marketplace|airdrop|tokenization).*(?:staking|nft|marketplace|airdrop|tokenization)/i,
    /(?:compar|diferenc|versus|vs|diferent).*(?:entre|between)/i,
    wordCount > 15 ? /.*/ : /(?!)/
  ];
  
  // Patrones de complejidad media (requieren 6 documentos)
  const mediumComplexityPatterns = [
    /(?:how|como|cómo|what|que|qué).*(?:work|funciona|detail|detalle)/i,
    /characteristic|feature|funcionalidad|capacidad/i,
    /process|proceso|step|paso|guide|guía/i,
    wordCount >= 8 && wordCount <= 15 ? /.*/ : /(?!)/
  ];
  
  if (highComplexityPatterns.some(pattern => pattern.test(queryLower))) {
    return 'high';
  }
  
  if (mediumComplexityPatterns.some(pattern => pattern.test(queryLower))) {
    return 'medium';
  }
  
  return 'simple';
}

/**
 * Enriquece el contexto con información relevante de la base de conocimientos
 * @param {String} query - Consulta del usuario
 * @param {Object} options - Opciones de enriquecimiento
 * @param {Boolean} options.skipNuxchainContext - Si true, no agrega contexto de Nuxchain
 * @returns {Promise<String>} - Contexto enriquecido
 */
export async function enrichContextWithKnowledgeBase(query, options = {}) {
  try {
    // Detectar si la consulta contiene URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const hasUrls = urlRegex.test(query);
    
    // Si hay URLs o se especifica skipNuxchainContext, no agregar contexto de Nuxchain
    if (hasUrls || options.skipNuxchainContext) {
      console.log(`🔍 Saltando contexto de Nuxchain - URLs detectadas: ${hasUrls}, skipNuxchainContext: ${options.skipNuxchainContext}`);
      return '';
    }
    
    console.log(`🔍 Buscando en base de conocimientos: "${query}"`);
    
    // ✅ USAR getRelevantContext que maneja todo internamente (BM25 + embeddings)
    const rawContext = await embeddingsService.getRelevantContext(query, {
      threshold: 0.25 // Threshold optimizado
    });
    
    // Normalizar: aceptar string u objeto { context, score }
    let relevantContext = { context: '', score: 0 };
    if (typeof rawContext === 'string') {
      relevantContext.context = rawContext;
    } else if (rawContext && typeof rawContext === 'object') {
      relevantContext.context = rawContext.context || rawContext.text || '';
      relevantContext.score = Number(rawContext.score) || 0;
    }
    
    if (relevantContext.context) {
      console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
      return `Información relevante de Nuxchain:\n${relevantContext.context}\n\nBasándote en esta información específica de Nuxchain, responde a la siguiente consulta de manera precisa y detallada:`;
    }
    
    console.log(`⚠️ No se encontró información relevante para: "${query}"`);
    return '';
  } catch (error) {
    console.error('❌ Error al consultar base de conocimientos:', error.message);
    console.error(error.stack);
    return '';
  }
}

/**
 * Procesa una solicitud a la API de Gemini
 * @param {Object|String} contents - Contenido del prompt o historial de mensajes
 * @param {String} model - Modelo de Gemini a utilizar
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<Object>} - Respuesta de Gemini
 */
export async function processGeminiRequest(contents, model = DEFAULT_MODEL, params = {}) {
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!contents) {
    throw new Error('Se requiere un prompt o historial de mensajes');
  }

  const cacheKey = responseCache.generateKey(contents, model, params);
  const cachedResponse = responseCache.get(cacheKey);
  if (cachedResponse) {
    logInfo('Respuesta de Gemini obtenida de la caché.', { cacheKey });
    return cachedResponse;
  }

  // ✅ NUEVO: Obtener contexto de KB y construir systemInstruction
  let knowledgeContext = '';
  let contextScore = 0;
  
  // Extraer query del contenido
  let userQuery = '';
  if (typeof contents === 'string') {
    userQuery = contents;
  } else if (Array.isArray(contents) && contents.length > 0) {
    const lastMessage = contents[contents.length - 1];
    if (lastMessage.role === 'user' && lastMessage.parts && lastMessage.parts[0]) {
      userQuery = lastMessage.parts[0].text;
    }
  }
  
  // Obtener contexto relevante de KB
  if (userQuery) {
    const rawContext = await embeddingsService.getRelevantContext(userQuery, {
      threshold: 0.25
    });
    
    // Normalizar contexto
    if (typeof rawContext === 'string') {
      knowledgeContext = rawContext;
    } else if (rawContext && typeof rawContext === 'object') {
      knowledgeContext = rawContext.context || rawContext.text || '';
      contextScore = Number(rawContext.score) || 0;
    }
    
    if (knowledgeContext) {
      console.log(`✅ KB found: ${knowledgeContext.length} chars, score: ${contextScore.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
    }
  }
  
  // Construir systemInstruction con contexto
  const systemInstruction = buildSystemInstructionWithContext(knowledgeContext, contextScore);
  
  // ✅ DEBUG: Verificar que systemInstruction tenga el formato correcto
  console.log('🔧 [DEBUG] SystemInstruction format:', {
    isObject: typeof systemInstruction === 'object',
    hasParts: systemInstruction?.parts ? 'YES' : 'NO',
    partsLength: systemInstruction?.parts?.length || 0,
    firstPartLength: systemInstruction?.parts?.[0]?.text?.length || 0,
    contextIncluded: systemInstruction?.parts?.[0]?.text?.includes('TEXT TO USE FOR ANSWERING') ? 'YES' : 'NO'
  });
  
  // Preparar contents (sin modificar el mensaje del usuario)
  let enrichedContents = contents;
  if (typeof contents === 'string') {
    enrichedContents = [{ role: 'user', parts: [{ text: contents }] }];
  }

  // Detectar multimodalidad: si contents es array y contiene inlineData
  if (Array.isArray(enrichedContents)) {
    // Si algún part tiene inlineData, es multimodal
    const hasImage = enrichedContents.some(msg =>
      Array.isArray(msg.parts) && msg.parts.some(part => part.inlineData)
    );
    if (hasImage) {
      // No modificar el contenido, solo pasarlo al modelo
      patchedContents = contents;
    }
  }

  const safeModelName = getSafeModel(model);
  const modelInfo = getModelInfo(model); // Use original model name for info lookup

  const requestOptions = {
    timeout: 60000, // 60 segundos de timeout para la solicitud a Gemini
  };

  try {
    // Preparar contenido para la nueva API
    let contents;
    if (Array.isArray(patchedContents)) {
      contents = patchedContents;
    } else {
      contents = [{ role: 'user', parts: [{ text: patchedContents }] }];
    }

    // Usar la nueva API del SDK
    const result = await withTimeoutAndRetry(() => ai.models.generateContent({
      model: safeModelName,
      contents: contents,
      generationConfig: {
        temperature: params.temperature || 0.3, // ✅ Reducido para ser más determinista
        maxOutputTokens: Math.min(params.maxTokens || 1024, modelInfo?.maxOutputTokens || 1024), // ✅ Reducido para brevedad
        topP: params.topP || 0.85, // ✅ Reducido para ser más enfocado
        topK: params.topK || 20, // ✅ Reducido para ser más conservador
      }
    }), { timeoutMs: requestOptions.timeout });

    const text = result.text;

    // Contar tokens usando la nueva API
    try {
      const tokenResult = await ai.models.countTokens({
        model: safeModelName,
        contents: contents
      });
      incrementTokenCount(tokenResult.totalTokens || 0);
    } catch (tokenError) {
      console.warn('Error counting tokens:', tokenError);
    }

    responseCache.set(cacheKey, text);
    return text;
  } catch (error) {
    logError('Error al procesar solicitud a Gemini', error, { contents, model, params });
    throw error;
  }
}

// Función para limpiar caché manualmente
export function clearCache() {
  responseCache.clear();
}

/**
 * Función para acceder a funcionalidades de gestión de caché
 * @returns {Object} - Objeto con métodos de gestión de caché
 */
export function getManagedResponseCache() {
  return {
    clear: () => responseCache.clear(),
    size: () => responseCache.cache.size,
    has: (key) => responseCache.cache.has(key),
    delete: (key) => responseCache.cache.delete(key),
    getStats: () => ({
      size: responseCache.cache.size,
      maxSize: responseCache.maxSize,
      ttlMs: responseCache.ttlMs
    })
  };
}

/**
 * Ejecuta una función específica basada en el function call
 * @param {Object} functionCall - Llamada a función de Gemini
 * @returns {Promise<Object>} - Resultado de la función
 */
export async function executeFunctionCall(functionCall) {
  const { name, args } = functionCall;
  
  console.log('🔧 [EXEC] Ejecutando función:', name);
  console.log('🔧 [EXEC] Argumentos recibidos:', JSON.stringify(args, null, 2));
  
  try {
    let result;
    switch (name) {
      case 'urlContext':
        console.log('🔧 [EXEC] Llamando executeUrlContext con argumentos:', JSON.stringify(args, null, 2));
        result = await executeUrlContext(args);
        console.log('🔧 [EXEC] Resultado de urlContext:', JSON.stringify(result, null, 2));
        return result;

      case 'controlLight':
        console.log('🔧 [EXEC] Llamando executeControlLight con argumentos:', JSON.stringify(args, null, 2));
        result = await executeControlLight(args);
        console.log('🔧 [EXEC] Resultado de controlLight:', JSON.stringify(result, null, 2));
        return result;
      default:
        throw new Error(`Función no reconocida: ${name}`);
    }
  } catch (error) {
    console.error(`🔧 [EXEC] Error ejecutando función ${name}:`, error);
    const errorResult = {
      error: true,
      message: error.message
    };
    console.log('🔧 [EXEC] Resultado de error:', JSON.stringify(errorResult, null, 2));
    return errorResult;
  }
}

/**
 * Ejecuta la función de URL Context
 * @param {Object} args - Argumentos de la función
 * @returns {Promise<Object>} - Resultado del contexto de URL
 */
async function executeUrlContext(args) {
  try {
    // Verificar que la API key esté configurada
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY no está configurada. En producción, asegúrate de configurar esta variable de entorno en tu plataforma de hosting.');
    }
    
    const { url, includeImages = false } = args;
    
    console.log('🔧 [URL_CONTEXT] Procesando URL:', url);
    console.log('🔧 [URL_CONTEXT] Incluir imágenes:', includeImages);
    
    const contextData = await urlContextService.fetchUrlContext(url, { includeImages });
    
    console.log('🔧 [URL_CONTEXT] Contexto obtenido exitosamente');
    
    return {
      success: true,
      data: contextData,
      message: `URL context retrieved successfully from ${url}`
    };
    
  } catch (error) {
    console.error('🔧 [URL_CONTEXT] Error en executeUrlContext:', error.message);
    return {
      success: false,
      error: error.message,
      message: `Error al obtener contenido de la URL: ${error.message}`
    };
  }
}



/**
 * Ejecuta la función de control de luz (función original)
 * @param {Object} args - Argumentos de la función
 * @returns {Promise<Object>} - Resultado del control
 */
async function executeControlLight(args) {
  try {
    const { brightness, colorTemperature } = args;
    
    // Simular control de luz
    return {
      success: true,
      data: { brightness, colorTemperature },
      message: `Luz configurada: brillo ${brightness}%, temperatura ${colorTemperature}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: `Error al controlar la luz: ${error.message}`
    };
  }
}

/**
 * Procesa una solicitud a Gemini con herramientas habilitadas
 * @param {Object|String} contents - Contenido del prompt
 * @param {String} model - Modelo a utilizar
 * @param {Object} params - Parámetros adicionales
 * @param {Array} enabledTools - Herramientas habilitadas
 * @returns {Promise<Object>} - Respuesta con posibles function calls ejecutados
 */
export async function processGeminiRequestWithTools(contents, model = DEFAULT_MODEL, params = {}, enabledTools = []) {
  console.log('🔧 [TOOLS] Iniciando processGeminiRequestWithTools');
  console.log('🔧 [TOOLS] Herramientas habilitadas:', enabledTools);
  console.log('🔧 [TOOLS] Parámetros:', JSON.stringify(params, null, 2));
  
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!contents) {
    throw new Error('Se requiere un prompt o historial de mensajes');
  }

  // Si se solicita streaming, verificar si hay herramientas habilitadas
  if (params.stream) {
    console.log('🔧 [TOOLS] Modo streaming detectado, redirigiendo a processGeminiStreamRequestWithTools');
    if (enabledTools && enabledTools.length > 0) {
      return await processGeminiStreamRequestWithTools(contents, model, params, enabledTools);
    } else {
      // Sin herramientas, usar la función original
      console.log('🔧 [TOOLS] Sin herramientas en streaming, usando función original');
      return await processGeminiStreamRequest(contents, model, params);
    }
  }

  // Configurar herramientas basadas en enabledTools
  const tools = [];
  const allowedFunctionNames = [];
  const hasUrlContext = enabledTools.includes('urlContext');
  
  if (hasUrlContext) {
    console.log('🔧 [TOOLS] Agregando herramienta urlContext');
    tools.push(urlContextFunctionDeclaration);
    allowedFunctionNames.push('urlContext');
  }
  
  // googleSearch tool removed
  
  if (enabledTools.includes('controlLight')) {
    console.log('🔧 [TOOLS] Agregando herramienta controlLight');
    tools.push(defaultFunctionDeclaration);
    allowedFunctionNames.push('controlLight');
  }
  
  // Enriquecer contexto con base de conocimientos para consultas relevantes
  if (typeof contents === 'string') {
    const knowledgeContext = await enrichContextWithKnowledgeBase(contents, {
      skipNuxchainContext: hasUrlContext
    });
    if (knowledgeContext) {
      contents = `${knowledgeContext}\n\n${contents}`;
    }
  } else if (Array.isArray(contents) && contents.length > 0) {
    // Para conversaciones, enriquecer solo el último mensaje del usuario
    const lastMessage = contents[contents.length - 1];
    if (lastMessage.role === 'user' && lastMessage.parts && lastMessage.parts[0] && lastMessage.parts[0].text) {
      const knowledgeContext = await enrichContextWithKnowledgeBase(lastMessage.parts[0].text, {
        skipNuxchainContext: hasUrlContext
      });
      if (knowledgeContext) {
        // Crear una copia del último mensaje con contexto enriquecido
        const enrichedLastMessage = {
          ...lastMessage,
          parts: [{
            text: `${knowledgeContext}\n\n${lastMessage.parts[0].text}`
          }]
        };
        contents = [...contents.slice(0, -1), enrichedLastMessage];
      }
    }
  }

  console.log('🔧 [TOOLS] Herramientas configuradas:', allowedFunctionNames);
  console.log('🔧 [TOOLS] Total de declaraciones de funciones:', tools.length);

  // Si no hay herramientas habilitadas, usar procesamiento normal
  if (tools.length === 0) {
    console.log('🔧 [TOOLS] Sin herramientas configuradas, usando procesamiento normal');
    return await processGeminiRequest(contents, model, params);
  }

  const safeModel = getSafeModel(model);
  const modelInfo = getModelInfo(model); // Use original model name for info lookup

  const maxTokens = Math.min(
    params.maxOutputTokens || 1024, // ✅ Reducido para brevedad
    modelInfo?.maxTokens || 1024
  );
  
  const generationConfig = {
    temperature: params.temperature || 0.7, // ✅ Igualado con API
    topK: params.topK || 40,
    topP: params.topP || 0.95,
    maxOutputTokens: maxTokens,
    responseMimeType: 'text/plain',
  };

  const toolConfig = {
    functionCallingConfig: {
      mode: 'NONE'
    }
  };
  
  // Para consultas sobre precios actuales o información en tiempo real, forzar el uso de herramientas
  let isRealTimeQuery = false;
  
  // Manejar tanto strings como arrays
  const contentsArray = Array.isArray(contents) ? contents : [{ parts: [{ text: contents }] }];
  
  isRealTimeQuery = contentsArray.some(content => {
    const text = content.parts?.[0]?.text?.toLowerCase() || '';
    console.log('🔧 [DEBUG] Texto analizado:', text);
    
    const hasPrecio = text.includes('precio') || text.includes('preico');
    const hasBitcoin = text.includes('bitcoin') || text.includes('btc');
    const hasTimeIndicator = text.includes('actual') || text.includes('hoy') || text.includes('ahora') || 
                            text.includes('últimas') || text.includes('tiempo real');
    const hasDatePattern = /\b\d{1,2}\b.*\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\b.*\b\d{4}\b/.test(text) ||
                            /\d{4}-\d{2}-\d{2}/.test(text) ||
                            /\d{1,2}\/\d{1,2}\/\d{4}/.test(text) ||
                            /\b(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+\d{1,2},?\s+\d{4}\b/.test(text);
    
    console.log('🔧 [DEBUG] Condiciones:', { hasPrecio, hasBitcoin, hasTimeIndicator, hasDatePattern });
    
    const shouldUseTools = hasPrecio && hasBitcoin && (hasTimeIndicator || hasDatePattern);
    console.log('🔧 [DEBUG] Debería usar herramientas:', shouldUseTools);
    
    return shouldUseTools;
  });
  
  console.log('🔧 [DEBUG] isRealTimeQuery:', isRealTimeQuery);
  console.log('🔧 [DEBUG] allowedFunctionNames:', allowedFunctionNames);
  
  if (isRealTimeQuery && allowedFunctionNames.includes('googleSearch')) {
    console.log('🔧 [DEBUG] Configurando modo ANY para usar herramientas');
    toolConfig.functionCallingConfig.mode = 'ANY';
    toolConfig.functionCallingConfig.allowedFunctionNames = allowedFunctionNames;
  }

  try {
    console.log('🔧 [TOOLS] Realizando primera llamada a Gemini con herramientas');
    console.log('🔧 [TOOLS] Configuración de herramientas:', JSON.stringify(toolConfig, null, 2));
    
    // Primera llamada a Gemini con herramientas
    const response = await withTimeoutAndRetry(() => ai.models.generateContent({
      model: safeModel,
      contents: contents,
      generationConfig,
      tools: [{ functionDeclarations: tools }],
      toolConfig,
      ...params
    }), { timeoutMs: 15000, maxRetries: 1, backoffMs: 1000 });

    console.log('🔧 [TOOLS] Respuesta de Gemini recibida');
    console.log('🔧 [TOOLS] Texto de respuesta:', response.text || 'Sin texto');
    console.log('🔧 [TOOLS] Function calls detectados:', response.functionCalls?.length || 0);
    
    if (response.functionCalls) {
      console.log('🔧 [TOOLS] Function calls:', JSON.stringify(response.functionCalls, null, 2));
    }

    // Verificar si hay function calls
    if (response.functionCalls && response.functionCalls.length > 0) {
      console.log('🔧 [TOOLS] Ejecutando', response.functionCalls.length, 'function calls');
      const functionResults = [];
      
      // Ejecutar cada function call
      for (const functionCall of response.functionCalls) {
        console.log('🔧 [TOOLS] Ejecutando función:', functionCall.name, 'con argumentos:', JSON.stringify(functionCall.args, null, 2));
        const result = await executeFunctionCall(functionCall);
        console.log('🔧 [TOOLS] Resultado de función:', functionCall.name, ':', JSON.stringify(result, null, 2));
        functionResults.push({
          functionCall,
          result
        });
      }

      // Crear contenido enriquecido con los resultados de las funciones
      const enrichedContents = [
        ...Array.isArray(contents) ? contents : [{ role: 'user', parts: [{ text: contents }] }],
        {
          role: 'model',
          parts: [{ text: response.text || 'Ejecutando herramientas...' }]
        },
        {
          role: 'user',
          parts: [{
            text: `Resultados de las herramientas:\n${functionResults.map(fr => 
              `${fr.functionCall.name}: ${JSON.stringify(fr.result, null, 2)}`
            ).join('\n\n')}\n\nPor favor, proporciona una respuesta basada en esta información.`
          }]
        }
      ];

      // Segunda llamada para generar respuesta final
      const finalResponse = await withTimeoutAndRetry(() => ai.models.generateContent({
        model: safeModel,
        contents: enrichedContents,
        generationConfig,
        ...params
      }), { timeoutMs: 15000, maxRetries: 1, backoffMs: 1000 });

      return {
        text: finalResponse.text,
        functionCalls: response.functionCalls,
        functionResults: functionResults,
        usage: finalResponse.usage
      };
    }

    // Si no hay function calls, devolver respuesta normal
    return response;
  } catch (error) {
    throw error;
  }
}

/**
 * Procesa una solicitud de function calling a la API de Gemini
 * @param {Object} options - Opciones de la solicitud
 * @returns {Promise<Object>} - Respuesta con function calls
 */
export async function processFunctionCallingRequest({
  prompt,
  model = DEFAULT_MODEL,
  functionDeclarations = [defaultFunctionDeclaration],
  functionCallingMode = 'ANY',
  allowedFunctionNames = ['controlLight']
}) {
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!prompt) {
    throw new Error('Se requiere un prompt');
  }
  
  const tools = [{ functionDeclarations }];
  
  const config = {
    toolConfig: {
      functionCallingConfig: {
        mode: functionCallingMode,
        allowedFunctionNames: allowedFunctionNames
      }
    },
    tools
  };
  
  // Llama al modelo Gemini con timeout y reintentos
  const response = await withTimeoutAndRetry(() => ai.models.generateContent({
    model,
    contents: prompt,
    config
  }), { timeoutMs: 15000, maxRetries: 1, backoffMs: 1000 });
  
  return {
    text: response.text,
    functionCalls: response.functionCalls || null
  };
}

/**
 * Procesa una solicitud de streaming nativo a la API de Gemini
 * @param {Object|String} contents - Contenido del prompt o historial de mensajes
 * @param {String} model - Modelo de Gemini a utilizar
 * @param {Object} params - Parámetros adicionales
 * @returns {Promise<ReadableStream>} - Stream nativo de Gemini
 */
export async function processGeminiStreamRequest(contents, model = DEFAULT_MODEL, params = {}) {
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!contents) {
    throw new Error('Se requiere un prompt o historial de mensajes');
  }
  
  // ✅ NUEVO: Obtener contexto de KB y construir systemInstruction
  let knowledgeContext = '';
  let contextScore = 0;
  
  // Extraer query del contenido
  let userQuery = '';
  if (typeof contents === 'string') {
    userQuery = contents;
  } else if (Array.isArray(contents) && contents.length > 0) {
    const lastMessage = contents[contents.length - 1];
    if (lastMessage.role === 'user' && lastMessage.parts && lastMessage.parts[0]) {
      userQuery = lastMessage.parts[0].text;
    }
  }
  
  // Obtener contexto relevante de KB
  if (userQuery) {
    const rawContext = await embeddingsService.getRelevantContext(userQuery, {
      threshold: 0.25
    });
    
    // Normalizar contexto
    if (typeof rawContext === 'string') {
      knowledgeContext = rawContext;
    } else if (rawContext && typeof rawContext === 'object') {
      knowledgeContext = rawContext.context || rawContext.text || '';
      contextScore = Number(rawContext.score) || 0;
    }
    
    if (knowledgeContext) {
      console.log(`✅ KB found: ${knowledgeContext.length} chars, score: ${contextScore.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
    }
  }
  
  // Construir systemInstruction con contexto
  const systemInstruction = buildSystemInstructionWithContext(knowledgeContext, contextScore);
  
  // ✅ DEBUG: Verificar que systemInstruction tenga el formato correcto
  console.log('🔧 [DEBUG] SystemInstruction format (stream):', {
    isObject: typeof systemInstruction === 'object',
    hasParts: systemInstruction?.parts ? 'YES' : 'NO',
    partsLength: systemInstruction?.parts?.length || 0,
    firstPartLength: systemInstruction?.parts?.[0]?.text?.length || 0,
    contextIncluded: systemInstruction?.parts?.[0]?.text?.includes('TEXT TO USE FOR ANSWERING') ? 'YES' : 'NO'
  });
  
  // Preparar contents (sin modificar el mensaje del usuario)
  let enrichedContents = contents;
  if (typeof contents === 'string') {
    enrichedContents = [{ role: 'user', parts: [{ text: contents }] }];
  }
  
  // Validate and get safe model
  const safeModel = getSafeModel(model);
  const modelInfo = getModelInfo(model); // Use original model name for info lookup

  // Check if model supports streaming
  if (modelInfo && !modelInfo.supportsStreaming) {
    console.warn(`Model ${safeModel} may not support streaming, using fallback`);
  }
  
  // Configuración optimizada para streaming
  const maxTokens = Math.min(
    params.maxOutputTokens || 1024, // ✅ Reducido para respuestas concisas (2-3 párrafos)
    modelInfo?.maxTokens || 1024
  );
  
  try {
    // ✅ CORRECTO según @google/genai SDK oficial: TODO en 'config'
    const response = await withTimeoutAndRetry(() => 
      ai.models.generateContentStream({
        model: safeModel,
        contents: enrichedContents,
        config: {
          systemInstruction, // ✅ systemInstruction dentro de config
          temperature: params.temperature || 0.3,
          topK: params.topK || 20,
          topP: params.topP || 0.85,
          maxOutputTokens: maxTokens,
          responseMimeType: 'text/plain',
        }
      }), 
      { timeoutMs: 20000, maxRetries: 3, backoffMs: 2000 }
    );
    
    return response;
  } catch (error) {
    console.error(`Error en streaming con modelo ${safeModel}:`, error.message);
    
    // Handle various API errors
    if (error.message?.includes('streaming not supported') || 
        error.message?.includes('model not found') ||
        error.message?.includes('overloaded') ||
        error.message?.includes('UNAVAILABLE') ||
        error.status === 503) {
      
      console.warn(`Streaming failed for ${safeModel}, trying fallback strategies`);
      
      // Strategy 1: Try with reduced parameters
      try {
        const reducedConfig = {
          ...generationConfig,
          maxOutputTokens: Math.min(generationConfig.maxOutputTokens, 1024),
          temperature: 0.7
        };
        
        console.log('Intentando con configuración reducida...');
        const fallbackResponse = await withTimeoutAndRetry(() => 
          ai.models.generateContentStream({
            model: safeModel,
            contents: enrichedContents,
            generationConfig: reducedConfig
          }), 
          { timeoutMs: 15000, maxRetries: 2, backoffMs: 3000 }
        );
        
        return fallbackResponse;
      } catch (fallbackError) {
        console.warn('Fallback con configuración reducida falló, intentando modelo por defecto...');
        
        // Strategy 2: Try with default model
        try {
          const defaultResponse = await withTimeoutAndRetry(() => 
            ai.models.generateContentStream({
              model: DEFAULT_MODEL,
              contents: enrichedContents,
              generationConfig: {
                ...generationConfig,
                maxOutputTokens: 1024,
                temperature: 0.7
              }
            }), 
            { timeoutMs: 15000, maxRetries: 2, backoffMs: 3000 }
          );
          
          return defaultResponse;
        } catch (defaultError) {
          console.error('Todos los fallbacks fallaron:', defaultError.message);
          const retryAfter = 30; // Tiempo recomendado de espera en segundos
          const error = new Error(`Servicio temporalmente no disponible. El modelo está sobrecargado. Por favor, inténtalo de nuevo en unos momentos.`);
          error.status = 503;
          error.retryAfter = retryAfter;
          error.isOverload = true;
          throw error;
        }
      }
    }
    
    throw error;
  }
}

/**
 * Convierte el stream de Gemini a un ReadableStream estándar con mejoras
 */
export function createOptimizedGeminiStream(geminiStream, options = {}) {
  const {
    enableCompression = true,
    bufferSize = 1024,
    flushInterval = 50
  } = options;
  
  let buffer = '';
  let lastFlush = Date.now();
  
  return new ReadableStream({
    async start(controller) {
      try {
        // Handle the new API stream format - iterate directly over the response
        for await (const chunk of geminiStream) {
          // Extract text from the response chunk using the new API format
          const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || chunk.text || '';
          
          if (enableCompression && text) {
            buffer += text;
            
            // Flush buffer basado en tamaño o tiempo
            const now = Date.now();
            const shouldFlush = 
              buffer.length >= bufferSize || 
              (now - lastFlush) >= flushInterval ||
              text.includes('\n') || // Flush en nuevas líneas
              text.includes('.') ||  // Flush en fin de oración
              text.includes('?') ||
              text.includes('!');
            
            if (shouldFlush) {
              controller.enqueue(new TextEncoder().encode(buffer));
              buffer = '';
              lastFlush = now;
            }
          } else if (text) {
            // Sin compresión, enviar directamente
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        
        // Flush buffer final
        if (buffer) {
          controller.enqueue(new TextEncoder().encode(buffer));
        }
        
        controller.close();
      } catch (error) {
        console.error('Error in Gemini stream:', error);
        controller.error(error);
      }
    },
    
    cancel() {
      // Cleanup si es necesario
      buffer = '';
    }
  });
}

/**
 * Crea un stream simulado para respuestas que no requieren streaming real
 * @param {string} text - Texto a transmitir
 * @param {Object} options - Opciones de configuración
 * @returns {ReadableStream} - Stream simulado
 */
function createSimulatedStream(text, options = {}) {
  const { chunkSize = 10, delayMs = 50 } = options;
  
  return new ReadableStream({
    start(controller) {
      let index = 0;
      
      function pushChunk() {
        if (index >= text.length) {
          controller.close();
          return;
        }
        
        const chunk = text.slice(index, index + chunkSize);
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(chunk));
        
        index += chunkSize;
        
        if (index < text.length) {
          setTimeout(pushChunk, delayMs);
        } else {
          controller.close();
        }
      }
      
      // Iniciar el streaming
      setTimeout(pushChunk, delayMs);
    }
  });
}

/**
 * Procesa una solicitud de streaming a Gemini con herramientas habilitadas
 * @param {Object|String} contents - Contenido del prompt
 * @param {String} model - Modelo a utilizar
 * @param {Object} params - Parámetros adicionales
 * @param {Array} enabledTools - Herramientas habilitadas
 * @returns {Promise<AsyncIterable>} - Stream de respuesta
 */
export async function processGeminiStreamRequestWithTools(contents, model = DEFAULT_MODEL, params = {}, enabledTools = ['urlContext', 'googleSearch', 'controlLight']) {
  console.log('🔧 [STREAM-TOOLS] Iniciando con herramientas:', enabledTools);
  
  if (!env.geminiApiKey) {
    throw new Error('API key no configurada');
  }
  
  if (!contents) {
    throw new Error('Se requiere un prompt o historial de mensajes');
  }

  try {
    // Primero procesamos con herramientas (no streaming)
    console.log('🔧 [STREAM-TOOLS] Procesando con herramientas habilitadas');
    
    const result = await processGeminiRequestWithTools(contents, model, params, enabledTools);
    
    // Si hay function calls, devolvemos la respuesta completa como stream simulado
    if (result.functionCalls && result.functionCalls.length > 0) {
      console.log('🔧 [STREAM-TOOLS] Function calls detectados, devolviendo respuesta completa');
      return createSimulatedStream(result.text || 'Procesando información...');
    }
    
    // Si no hay function calls, usar streaming normal
    console.log('🔧 [STREAM-TOOLS] No hay function calls, usando streaming normal');
    return await processGeminiStreamRequest(contents, model, params);
    
  } catch (error) {
    console.error('Error in processGeminiStreamRequestWithTools:', error);
    
    // Fallback: intentar streaming normal
    try {
      console.log('🔧 [STREAM-TOOLS] Fallback a streaming normal');
      return await processGeminiStreamRequest(contents, model, params);
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
      const errorMessage = `Lo siento, ocurrió un error al procesar tu solicitud: ${error.message}`;
      return createSimulatedStream(errorMessage);
    }
  }
}
