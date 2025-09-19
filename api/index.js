// Función serverless unificada para todos los endpoints
// Esto reduce el número de funciones de 12+ a solo 1

import { GoogleGenAI } from '@google/genai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { CONTEXT_CONFIG, ContextUtils } from './context-config.js';

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-API-Key',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Almacenamiento temporal de sesiones (en producción usar Redis)
const sessionStore = new Map();

// Función principal que maneja todos los endpoints
export default async function handler(req, res) {
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Aplicar headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    // Correctly handle path parameter whether it's a string or array
    const pathParam = req.query.path;
    const endpoint = Array.isArray(pathParam) ? pathParam[0] : (pathParam || 'health');

    switch (endpoint) {
      case 'health':
        return handleHealth(req, res);
      
      case 'chat':
        return handleChat(req, res);
      
      case 'gemini':
        return handleGemini(req, res);
      
      case 'gemini-v2':
        return handleGeminiV2(req, res);
      
      case 'scraper':
        return handleScraper(req, res);
      
      case 'embeddings':
        return handleEmbeddings(req, res);
      
      case 'context-stats':
        return handleContextStats(req, res);
      
      case 'chat-v2':
        return handleChatV2(req, res);
      
      case 'context-cleanup':
        return handleContextCleanup(req, res);
      
      default:
        return res.status(404).json({ 
          error: 'Endpoint no encontrado',
          availableEndpoints: ['health', 'chat', 'chat-v2', 'gemini', 'gemini-v2', 'scraper', 'embeddings', 'context-stats', 'context-cleanup']
        });
    }
  } catch (error) {
    console.error('Error en función unificada:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

// Handler para health check mejorado
async function handleHealth(req, res) {
  const stats = getSessionStats();
  
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    context: {
      activeSessions: stats.activeSessions,
      totalMessages: stats.totalMessages,
      averageSessionLength: stats.averageLength,
      memoryUsage: process.memoryUsage()
    }
  });
}

// Handler para chat con gestión mejorada de sesiones
async function handleChat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { 
    message, 
    messages,
    conversationHistory = [], 
    model = 'gemini-2.5-flash-lite',
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
    sessionId = null,
    userId = null
  } = req.body;

  // Determinar el contenido del mensaje
  let userMessage = message;
  let history = conversationHistory;

  // Si se envían messages (formato del frontend), procesarlos
  if (messages && Array.isArray(messages)) {
    history = messages.slice(0, -1); // Todos excepto el último
    const lastMessage = messages[messages.length - 1];
    userMessage = lastMessage.content || lastMessage.parts?.[0]?.text || '';
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // Obtener o crear sesión
    const session = getOrCreateSession(sessionId);
    
    // Agregar mensaje actual al historial
    session.messages.push({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      importance: ContextUtils.calculateImportance({ content: userMessage, role: 'user' }, session.messages)
    });

    // Optimizar historial si es necesario
    const optimizedHistory = optimizeConversationHistory(session.messages);
    
    // Construir contexto
    const context = buildContext(optimizedHistory);
    const prompt = `${CONTEXT_CONFIG.systemInstructions.CONTEXT_PRESERVATION}\n\n${context}\nuser: ${userMessage}`;
    
    // Generar respuesta
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt,
      systemInstruction: CONTEXT_CONFIG.systemInstructions.CONTEXT_PRESERVATION
    });
    const text = result.text;

    // Agregar respuesta a la sesión
    session.messages.push({
      role: 'assistant',
      content: text,
      timestamp: new Date().toISOString()
    });

    // Actualizar estadísticas
    updateSessionStats(session);

    return res.status(200).json({
      response: text,
      sessionId: session.id,
      contextInfo: {
        messageCount: session.messages.length,
        estimatedTokens: ContextUtils.estimateTokens(context + text),
        summaryGenerated: session.hasSummary || false
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en chat:', error);
    return res.status(500).json({ error: 'Error al procesar el chat' });
  }
}

// Handler para Gemini
async function handleGemini(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt, model = 'gemini-2.5-flash-lite' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requerido' });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = await genAI.models.generateContent({
      model: model,
      contents: prompt
    });
    const text = result.text;

    return res.status(200).json({
      response: text,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en Gemini:', error);
    return res.status(500).json({ error: 'Error al procesar con Gemini' });
  }
}

// Base de conocimientos simplificada
const knowledgeBase = [
  {
    content: "Nuxchain es una plataforma de tokenización basada en Polygon que permite a los usuarios crear, stakear y vender NFTs. Ofrece características como staking con recompensas horarias, marketplace de NFTs, airdrops y tokenización de activos. La moneda nativa es POL (Polygon) para transacciones y gas fees.",
    metadata: { type: "faq", category: "general", topic: "introduction" }
  },
  {
    content: "El staking en Nuxchain ofrece un ROI del 0.01% por hora, con un multiplicador máximo de 1.25x para stakings prolongados. Los usuarios pueden hacer staking de POL o NFTs especiales para ganar recompensas automáticamente cada hora. Se recomienda usar la función compound para reinvertir recompensas y maximizar ganancias.",
    metadata: { type: "faq", category: "staking", topic: "rewards" }
  },
  {
    content: "¿Cómo comprar y vender NFTs en Nuxchain marketplace? Para comprar: 1) Navega el marketplace o usa filtros, 2) Haz clic en el NFT deseado, 3) Revisa detalles y precio, 4) Haz clic en 'Buy Now' y confirma la transacción. Para vender: 1) Ve a tu perfil/sección de NFTs, 2) Selecciona NFT para listar, 3) Establece precio en POL, 4) Confirma transacción de listado.",
    metadata: { type: "faq", category: "tutorial", topic: "nft-trading" }
  },
  {
    content: "What if my transaction fails in Nuxchain? Check: sufficient POL for gas, wallet connected, limits not exceeded, contract not paused. Try increasing gas limit. Common errors include 'insufficient funds', 'execution reverted', or 'user rejected transaction'.",
    metadata: { type: "faq", category: "troubleshooting", topic: "transactions" }
  },
  {
    content: "How to maximize staking rewards in Nuxchain? 1) Stake larger amounts for better compound effects, 2) Use compound function regularly to reinvest rewards, 3) Keep funds staked longer for maximum ROI multiplier (up to 1.25x), 4) Monitor gas fees and compound during low-cost periods.",
    metadata: { type: "faq", category: "optimization", topic: "staking-rewards" }
  }
];

// Función de búsqueda mejorada para la base de conocimientos
function searchKnowledgeBase(query) {
  const queryLower = query.toLowerCase();
  const results = [];
  
  // Expandir palabras clave con términos más relevantes
  const importantKeywords = ['nuxchain', 'nuvim', 'polygon', 'staking', 'nft', 'marketplace', 
                            'airdrop', 'tokenization', 'gemini', 'ai', 'chat', 'protocol', 
                            'smart', 'contract', 'rewards', 'pol', 'wallet', 'transaction'];
  
  for (const doc of knowledgeBase) {
    const content = doc.content.toLowerCase();
    let score = 0;
    
    // Búsqueda por palabras clave importantes (mayor puntuación)
    for (const keyword of importantKeywords) {
      if (queryLower.includes(keyword) && content.includes(keyword)) {
        score += 0.2; // Mayor puntuación para palabras clave
      }
    }
    
    // Búsqueda por coincidencias de texto (todas las palabras >2 caracteres)
    const queryWords = queryLower.split(' ').filter(word => word.length > 2);
    for (const word of queryWords) {
      if (content.includes(word)) {
        score += 0.08;
      }
    }
    
    // Búsqueda por metadatos (categorías y temas)
    const metadataLower = JSON.stringify(doc.metadata).toLowerCase();
    for (const word of queryWords) {
      if (metadataLower.includes(word)) {
        score += 0.15; // Puntuación más alta para coincidencias en metadatos
      }
    }
    
    // Búsqueda por frases completas (palabras consecutivas)
    const queryPhrases = queryLower.match(/\b\w+\s+\w+\b/g) || [];
    for (const phrase of queryPhrases) {
      if (content.includes(phrase)) {
        score += 0.3; // Puntuación más alta para frases completas
      }
    }
    
    // Aumentar puntuación para respuestas en el idioma correcto
    const isSpanishQuery = /[áéíóúñ]/.test(queryLower);
    const hasSpanishContent = /[áéíóúñ]/.test(content);
    if (isSpanishQuery && hasSpanishContent) {
      score += 0.1; // Mejor coincidencia para consultas en español
    }
    
    if (score > 0.4) { // Umbral más alto para evitar resultados irrelevantes
      results.push({ ...doc, score });
    }
  }
  
  // Ordenar por score y limitar a los 5 mejores resultados
  return results.sort((a, b) => b.score - a.score).slice(0, 5);
}

// Handler para Gemini V2 (versión optimizada con streaming)
async function handleGeminiV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { 
    message, 
    messages,
    conversationHistory = [], 
    model = 'gemini-2.5-flash-lite',
    temperature = 0.7,
    maxTokens = 1000, // Aumentado de 700 a 1000 para permitir respuestas más detalladas
    stream = false
  } = req.body;

  // Determinar el contenido del mensaje
  let userMessage = message;
  let history = conversationHistory;

  // Si se envían messages (formato del frontend), procesarlos
  if (messages && Array.isArray(messages)) {
    history = messages.slice(0, -1); // Todos excepto el último
    const lastMessage = messages[messages.length - 1];
    userMessage = lastMessage.content || lastMessage.parts?.[0]?.text || '';
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    // Inicializar cliente con la nueva API
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // === FUNCIONES DE OPTIMIZACIÓN DE CONTEXTO ===
    
    // Función para estimar tokens de un mensaje
    function estimateTokens(text) {
      return Math.ceil(text.length / 4); // Estimación aproximada
    }
    
    // Función para detectar cambio de tema
    function detectTopicShift(currentMessage, previousMessages, threshold = 0.7) {
      if (previousMessages.length === 0) return false;
      
      const keywords = currentMessage.toLowerCase().split(/\s+/);
      const previousKeywords = previousMessages.slice(-3).join(' ').toLowerCase().split(/\s+/);
      
      const overlap = keywords.filter(keyword => 
        previousKeywords.includes(keyword) && keyword.length > 3
      ).length;
      
      const similarity = overlap / Math.max(keywords.length, 1);
      return similarity < threshold;
    }
    
    // Función para calcular importancia de un mensaje
    function calculateImportance(message, index, totalMessages) {
      let score = 0.5; // Puntuación base
      
      // Recencia (mensajes más recientes tienen más peso)
      score += (index / totalMessages) * 0.3;
      
      // Mensajes del usuario tienen más peso
      if (message.role === 'user') score += 0.2;
      
      // Mensajes con preguntas o comandos técnicos
      const content = message.content || message.parts?.[0]?.text || '';
      if (content.includes('?')) score += 0.1;
      if (content.includes('cómo') || content.includes('qué es') || content.includes('ayuda')) score += 0.15;
      
      return Math.min(score, 1.0);
    }
    
    // Función para optimizar mensajes
    function optimizeMessages(messages, config) {
      if (!messages || messages.length === 0) return [];
      
      const totalTokens = messages.reduce((sum, msg) => 
        sum + estimateTokens(msg.content || msg.parts?.[0]?.text || ''), 0);
      
      // Si los mensajes caben en el límite, devolver todos
      if (totalTokens <= config.maxContextTokens && messages.length <= config.maxContextMessages) {
        return messages;
      }
      
      // Detectar cambio de tema
      const topicShift = detectTopicShift(
        messages[messages.length - 1]?.content || '',
        messages.slice(0, -1)
      );
      
      if (topicShift) {
        // Si hay cambio de tema, priorizar mensajes recientes
        return messages.slice(-Math.min(config.maxContextMessages, 10));
      }
      
      // Calcular importancia de cada mensaje
      const messagesWithImportance = messages.map((msg, index) => ({
        ...msg,
        importance: calculateImportance(msg, index, messages.length),
        tokens: estimateTokens(msg.content || msg.parts?.[0]?.text || '')
      }));
      
      // Mantener mensajes iniciales (contexto base)
      const initialMessages = messagesWithImportance.slice(0, 2);
      const remainingMessages = messagesWithImportance.slice(2);
      
      // Ordenar por importancia y tomar los más importantes
      const importantMessages = remainingMessages
        .sort((a, b) => b.importance - a.importance)
        .slice(0, config.maxContextMessages - 2);
      
      // Combinar y ordenar por tiempo
      const optimizedMessages = [...initialMessages, ...importantMessages]
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      // Si hay muchos mensajes omitidos, agregar resumen
      const omittedCount = messages.length - optimizedMessages.length;
      if (omittedCount > config.minMessagesForSummary) {
        const summaryMessage = {
          role: 'user',
          content: `[RESUMEN DE CONTEXTO] ${omittedCount} mensajes anteriores han sido omitidos para mantener la coherencia de la conversación. El contexto principal se ha preservado.`,
          timestamp: new Date().toISOString()
        };
        optimizedMessages.splice(2, 0, summaryMessage);
      }
      
      return optimizedMessages;
    }
    
    // Función para crear resumen semántico
    async function createSemanticSummary(messages) {
      if (messages.length < 3) return null;
      
      const recentMessages = messages.slice(-6);
      const summaryPrompt = `Resume los temas principales y el contexto importante de esta conversación en 2-3 oraciones concisas:\n\n${
        recentMessages.map(msg => `${msg.role}: ${msg.content || msg.parts?.[0]?.text || ''}`).join('\n')
      }`;
      
      try {
        const summaryResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 150 }
        });
        
        return summaryResponse.text;
      } catch (error) {
        console.warn('⚠️ Error al crear resumen semántico:', error.message);
        return null;
      }
    }
    
    // Aplicar optimización de contexto
    const optimizedHistory = optimizeMessages(history, CONTEXT_CONFIG);
    
    // Crear resumen semántico si es necesario
    let semanticSummary = null;
    if (optimizedHistory.length >= CONTEXT_CONFIG.minMessagesForSummary) {
      semanticSummary = await createSemanticSummary(optimizedHistory);
    }
    
    // Construir historial de conversación con el formato actualizado
    // Convertir roles para asegurar compatibilidad con Gemini API
    const contents = [];
    
    // Agregar resumen semántico si existe
    if (semanticSummary) {
      contents.push({
        role: 'user',
        parts: [{ text: `[CONTEXTO PREVIO] ${semanticSummary}` }]
      });
      contents.push({
        role: 'model',
        parts: [{ text: 'Gracias por el contexto. Continuaré con la conversación teniendo esto en cuenta.' }]
      });
    }
    
    // Mapear mensajes del historial optimizado con roles válidos (user o model)
    for (const msg of optimizedHistory) {
      let role = 'user';
      if (msg.role === 'assistant' || msg.role === 'model' || msg.role === 'bot') {
        role = 'model';
      }
      
      contents.push({
        role,
        parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
      });
    }
    
    // Detectar si la consulta contiene URLs
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const hasUrls = urlRegex.test(userMessage);
    
    // Detectar cambio de tema
    const topicShift = detectTopicShift(userMessage, optimizedHistory);
    
    // Log para debug con información mejorada
    console.log(`🔄 Vercel Debug - Procesando consulta: "${userMessage.substring(0, 50)}${userMessage.length > 50 ? '...' : ''}"`);
    console.log(`📝 Vercel Debug - Historial optimizado: ${optimizedHistory.length}/${history.length} mensajes`);
    console.log(`🔄 Vercel Debug - Cambio de tema detectado: ${topicShift}`);
    console.log(`📝 Vercel Debug - Resumen semántico: ${semanticSummary ? 'Sí' : 'No'}`);
    console.log(`📝 Vercel Debug - Sesión: ${currentSessionId}`);
    
    // Si no hay URLs, agregar contexto de la base de conocimientos
    if (!hasUrls) {
      console.log('🔍 Vercel: Buscando en base de conocimientos');
      
      // Search knowledge base con configuración mejorada
      const knowledgeResults = searchKnowledgeBase(userMessage);
      console.log('📚 Vercel: Encontrados', knowledgeResults.length, 'documentos relevantes');
      
      // Filtrar por puntuación mínima y ordenar por relevancia
      const filteredResults = knowledgeResults
        .filter(doc => doc.score >= CONTEXT_CONFIG.knowledgeBaseConfig.minScore)
        .sort((a, b) => b.score - a.score);
      
      // Log de scores para depuración
      if (filteredResults.length > 0) {
        console.log('🎯 Vercel: Scores filtrados:', filteredResults.map(r => r.score.toFixed(2)).join(', '));
        
        // Usar hasta 5 mejores resultados con límite de caracteres configurado
        const limitedResults = filteredResults
          .slice(0, CONTEXT_CONFIG.knowledgeBaseConfig.maxResults)
          .map(doc => {
            const truncatedContent = doc.content.length > CONTEXT_CONFIG.knowledgeBaseConfig.maxContentLength ? 
              doc.content.substring(0, CONTEXT_CONFIG.knowledgeBaseConfig.maxContentLength) + '... (contenido truncado)' : 
              doc.content;
            return `📋 [Score: ${doc.score.toFixed(2)}] ${truncatedContent}`;
          }).join('\n\n');
        
        // Agregar contexto de Nuxchain al inicio
        contents.unshift({
          role: 'user',
          parts: [{ text: `${CONTEXT_CONFIG.systemInstruction}\n\n${limitedResults}\n\nProporciona una respuesta detallada y completa basada en esta información de Nuxchain.` }]
        });
        
        // Agregar respuesta de modelo vacía para mantener el patrón de conversación correcto
        contents.push({
          role: 'model',
          parts: [{ text: 'Entendido. Usaré esta información específica de Nuxchain para proporcionar una respuesta detallada y precisa.' }]
        });
      } else {
        console.log('⚠️ Vercel: No se encontraron documentos relevantes en la base de conocimientos');
        
        // Si no hay resultados relevantes, agregar instrucción general
        contents.unshift({
          role: 'user',
          parts: [{ text: `${CONTEXT_CONFIG.systemInstruction}\n\nProporciona una respuesta útil y precisa.` }]
        });
        
        contents.push({
          role: 'model',
          parts: [{ text: 'Entendido. Proporcionaré una respuesta útil basada en mi conocimiento general.' }]
        });
      }
    } else {
      console.log(`🔍 Vercel: Saltando contexto de Nuxchain - URLs detectadas`);
      
      // Aún así agregar instrucción del sistema básica
      contents.unshift({
        role: 'user',
        parts: [{ text: `${CONTEXT_CONFIG.systemInstruction}\n\nProporciona una respuesta útil sobre el contenido de las URLs proporcionadas.` }]
      });
      
      contents.push({
        role: 'model',
        parts: [{ text: 'Entendido. Analizaré el contenido de las URLs proporcionadas.' }]
      });
    }
    
    // Agregar el mensaje del usuario al final
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    // Configuración de generación
    const generationConfig = {
      temperature,
      maxOutputTokens: maxTokens,
    };

    // Si se solicita streaming
    if (stream) {
      console.log('🔄 Iniciando streaming para:', userMessage.substring(0, 50) + '...');
      
      try {
        // Usar el objeto response nativo para evitar middlewares de Express
        const rawRes = res.raw || res;
        
        // Configurar headers directamente en el response nativo
        rawRes.writeHead(200, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-API-Key'
        });
        
        // Usar la nueva API para streaming
        const streamResponse = await ai.models.generateContentStream({
          model,
          contents,
          generationConfig
        });
        
        // Procesar el stream
        for await (const chunk of streamResponse) {
          if (chunk.text) {
            rawRes.write(chunk.text);
          }
        }
        
        rawRes.end();
        return;
      } catch (streamError) {
        console.error('❌ Error en streaming:', streamError);
        
        // Si ya se enviaron headers, solo cerrar la conexión
        if (res.headersSent) {
          res.end();
          return;
        }
        
        // Si no se enviaron headers, enviar error JSON
        res.status(500).json({ 
          error: 'Error en streaming', 
          message: streamError.message 
        });
        return;
      }
    }

    // Respuesta no-streaming (modo normal)
    const response = await ai.models.generateContent({
      model,
      contents,
      generationConfig
    });
    
    // Extraer texto de la respuesta
    const text = response.text;

    return res.status(200).json({
      response: text,
      model,
      timestamp: new Date().toISOString(),
      tokensUsed: response.usageMetadata || null,
      contextInfo: {
        sessionId: currentSessionId,
        originalMessages: history.length,
        optimizedMessages: optimizedHistory.length,
        topicShiftDetected: topicShift,
        semanticSummary: !!semanticSummary,
        knowledgeBaseResults: hasUrls ? 0 : filteredResults?.length || 0
      }
    });
  } catch (error) {
    console.error('Error en Gemini V2:', error);
    
    // Si es streaming y hay error, enviar error como texto plano
    if (stream && !res.headersSent) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.status(500).end(`Error: ${error.message}`);
      return;
    }
    
    return res.status(500).json({ error: 'Error al procesar con Gemini V2', details: error.message });
  }
}

// Handler para scraper
async function handleScraper(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL requerida' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(400).json({ error: 'No se pudo extraer contenido de la URL' });
    }

    return res.status(200).json({
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      length: article.length,
      url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en scraper:', error);
    return res.status(500).json({ error: 'Error al procesar la URL' });
  }
}

// Handler para embeddings
async function handleEmbeddings(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { text, model = 'text-embedding-004' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Texto requerido' });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const result = await genAI.models.embedContent({
      model: 'text-embedding-004',
      content: text
    });
    const embedding = result.embedding;

    return res.status(200).json({
      embedding: embedding.values,
      dimensions: embedding.values.length,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en embeddings:', error);
    return res.status(500).json({ error: 'Error al generar embeddings' });
  }
}

// Handler para estadísticas de contexto
async function handleContextStats(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener parámetros de consulta
    const sessionId = req.query.sessionId;
    const userId = req.query.userId;
    
    // Información de configuración actual
    const config = {
      maxContextMessages: 50,
      maxContextTokens: 12000,
      minMessagesForSummary: 6,
      summaryThreshold: 8000,
      topicShiftThreshold: 0.7,
      importanceThreshold: 0.3,
      knowledgeBaseMinScore: 0.6,
      maxKnowledgeResults: 5
    };

    // Métricas generales (simuladas - en producción vendrían de Redis o base de datos)
    const stats = {
      timestamp: new Date().toISOString(),
      config,
      sessions: {
        active: sessionId ? 1 : 0,
        total: 0 // En producción: contador real de sesiones
      },
      optimizations: {
        contextReductions: 0, // En producción: contador real
        semanticSummaries: 0,  // En producción: contador real
        topicShifts: 0        // En producción: contador real
      },
      performance: {
        averageResponseTime: 0, // En producción: métrica real
        cacheHitRate: 0,       // En producción: métrica real
        tokenSavings: 0        // En producción: métrica real
      }
    };

    // Si hay sessionId, agregar información específica de la sesión
    if (sessionId) {
      stats.sessionInfo = {
        sessionId,
        userId: userId || 'anonymous',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0, // En producción: contador real
        contextOptimizations: {
          reductions: 0,
          summaries: 0,
          topicShifts: 0
        }
      };
    }

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas de contexto:', error);
    return res.status(500).json({ error: 'Error al obtener estadísticas de contexto' });
  }
}
