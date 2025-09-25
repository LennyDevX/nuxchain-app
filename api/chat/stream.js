import { GoogleGenAI } from '@google/genai';
import { getRelevantContext } from '../services/knowledge-base.js';
import { initializeKnowledgeBaseForVercel } from '../services/embeddings-service.js';

// Configuración CORS para Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

// Lista de endpoints públicos que no requieren API key
const publicEndpoints = [
  '/api/chat/stream',
  '/api/chat/stream-with-tools',
  '/api/embeddings'
];

// Middleware de seguridad
function checkSecurity(req) {
  const path = req.url;
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    path === endpoint || path.startsWith(endpoint)
  );
  
  if (!isPublicEndpoint) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return { error: 'API Key requerida', status: 401 };
    }
  }
  
  return null;
}

// Cache simple en memoria para contexto relevante
const contextCache = new Map();
const CONTEXT_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCachedContext(key) {
  const item = contextCache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CONTEXT_CACHE_TTL) {
    contextCache.delete(key);
    return null;
  }
  return item.value;
}

function setCachedContext(key, value) {
  contextCache.set(key, { value, timestamp: Date.now() });
}

export default async function handler(req, res) {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Aplicar headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Verificar seguridad
  const securityCheck = checkSecurity(req);
  if (securityCheck) {
    return res.status(securityCheck.status).json({ error: securityCheck.error });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { message, conversationHistory = [], messages = [] } = req.body;

    // Limitar historial a los últimos 5 mensajes
    let finalMessage;
    let finalHistory;
    if (messages && messages.length > 0) {
      finalHistory = messages.slice(-5); // Solo los últimos 5
      const lastMessage = messages[messages.length - 1];
      finalMessage = lastMessage.content || lastMessage.parts?.[0]?.text || lastMessage.text;
    } else {
      finalMessage = message;
      finalHistory = conversationHistory.slice(-5); // Solo los últimos 5
    }

    if (!finalMessage) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Verificar que la API key de Gemini esté configurada
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key de Gemini no configurada' });
    }

    // Inicializar Gemini con modelo optimizado
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    // Preprocesar: saltar embeddings si el mensaje es muy corto
    let relevantContext = '';
    let searchMethod = 'skipped';
    const cacheKey = finalMessage.trim().toLowerCase();

    if (finalMessage.length < 15) {
      // Mensaje corto, usar solo contexto base
      relevantContext = '';
      searchMethod = 'short_message';
    } else {
      // Buscar en cache primero
      const cached = getCachedContext(cacheKey);
      if (cached) {
        relevantContext = cached;
        searchMethod = 'cache';
      } else {
        try {
          const embeddingsService = await initializeKnowledgeBaseForVercel();
          // Limitar topK y threshold para acelerar
          const searchResults = await embeddingsService.search('knowledge_base', finalMessage, 2, {
            threshold: 0.25
          });
          // Filtrar solo inglés
          const englishResults = searchResults.filter(r =>
            (r.meta?.language || '').toLowerCase() === 'en' ||
            /^[a-zA-Z0-9\s.,;:'"?!\-()]+$/.test(r.content)
          );
          if (englishResults && englishResults.length > 0) {
            relevantContext = englishResults.map(result => result.content).join('\n\n');
            setCachedContext(cacheKey, relevantContext);
            searchMethod = 'embeddings';
          } else {
            // Fallback final a búsqueda simple si no se encuentra nada
            const fallbackContext = getRelevantContext(finalMessage);
            relevantContext = Array.isArray(fallbackContext)
              ? fallbackContext.filter(doc =>
                  (doc.metadata?.language || '').toLowerCase() === 'en' ||
                  /^[a-zA-Z0-9\s.,;:'"?!\-()]+$/.test(doc.content)
                ).map(doc => doc.content).join('\n\n')
              : fallbackContext;
            setCachedContext(cacheKey, relevantContext);
            searchMethod = 'simple_search';
          }
        } catch (error) {
          // Log solo para errores críticos
          console.error('❌ Error crítico con embeddings:', error.message);
          const fallbackContext = getRelevantContext(finalMessage);
          relevantContext = Array.isArray(fallbackContext)
            ? fallbackContext.filter(doc =>
                (doc.metadata?.language || '').toLowerCase() === 'en' ||
                /^[a-zA-Z0-9\s.,;:'"?!\-()]+$/.test(doc.content)
              ).map(doc => doc.content).join('\n\n')
            : fallbackContext;
          setCachedContext(cacheKey, relevantContext);
          searchMethod = 'error_fallback';
        }
      }
    }

    // Fallback si no hay contexto relevante
    const contextToUse = relevantContext || `Nuxchain es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización. Es un ecosistema completo para la gestión de activos digitales y generación de ingresos pasivos. La plataforma incluye contratos Smart Staking, marketplace de NFTs, chat con IA (Nuvim AI 1.0), y herramientas de tokenización.`;

    // Crear prompt con contexto de Nuxchain
    const systemPrompt = `Eres Nuvim AI 1.0, el asistente inteligente oficial de Nuxchain. Tu misión es ayudar a los usuarios con información precisa y actualizada sobre el ecosistema Nuxchain.

CONTEXTO RELEVANTE DE NUXCHAIN:
${contextToUse}

INSTRUCCIONES:
- Responde siempre en el mismo idioma que el usuario
- Usa la información del contexto cuando sea relevante
- Si no tienes información específica sobre algo de Nuxchain, indícalo claramente
- Sé amigable, profesional y útil
- Puedes usar emojis ocasionalmente para hacer la conversación más amena
- Si el usuario pregunta sobre temas no relacionados con Nuxchain, puedes ayudar pero siempre menciona que eres el asistente de Nuxchain`;

    // Preparar el contenido con historial y contexto
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: '¡Hola! Soy Nuvim AI 1.0, tu asistente inteligente de Nuxchain. Estoy aquí para ayudarte con cualquier pregunta sobre nuestro ecosistema blockchain. ¿En qué puedo asistirte hoy? 😊' }]
      },
      ...finalHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.parts?.[0]?.text || msg.text }]
      })),
      {
        role: 'user',
        parts: [{ text: finalMessage }]
      }
    ];

    try {
      // Configurar headers para streaming
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Streaming optimizado: usar modelo rápido y chunks grandes
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        contents: contents,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048, // Chunks más grandes
        },
      });

      let buffer = '';
      const BUFFER_SIZE = 1000; // Enviar chunks más grandes

      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          buffer += chunkText;
          if (buffer.length >= BUFFER_SIZE) {
            res.write(buffer);
            buffer = '';
          }
        }
      }
      if (buffer) res.write(buffer);
      res.end();
    } catch (streamError) {
      // Log solo para errores críticos
      console.error('Error en streaming:', streamError);
      return res.status(500).json({ 
        error: 'Error en el streaming de respuesta',
        details: streamError.message
      });
    }

  } catch (error) {
    // Log solo para errores críticos
    console.error('Error en chat/stream:', error);
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}