import { GoogleGenAI } from '@google/genai';
import { getRelevantContext } from './knowledge-base.js';
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

    // Manejar tanto el formato antiguo (message + conversationHistory) como el nuevo (messages)
    let finalMessage;
    let finalHistory;
    
    if (messages && messages.length > 0) {
      // Formato nuevo: usar el array de messages
      finalHistory = messages.slice(0, -1); // Todos excepto el último
      const lastMessage = messages[messages.length - 1];
      finalMessage = lastMessage.content || lastMessage.parts?.[0]?.text || lastMessage.text;
    } else {
      // Formato antiguo: usar message + conversationHistory
      finalMessage = message;
      finalHistory = conversationHistory;
    }

    if (!finalMessage) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Verificar que la API key de Gemini esté configurada
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key de Gemini no configurada' });
    }

    // Inicializar Gemini
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    // Inicializar y obtener contexto relevante usando embeddings con sistema de fallback mejorado
    let relevantContext = '';
    let searchMethod = 'unknown';
    
    try {
      const embeddingsService = await initializeKnowledgeBaseForVercel();
      
      // Verificar si el servicio está en modo fallback
      if (embeddingsService.fallbackMode) {
        console.log('⚠️ Servicio de embeddings en modo fallback:', embeddingsService.fallbackReason);
        console.log('🕒 Timestamp del fallback:', embeddingsService.fallbackTimestamp);
        searchMethod = 'fallback_embeddings';
      } else {
        searchMethod = 'normal_embeddings';
      }
      
      // Buscar contexto usando embeddings (normal o fallback)
      const searchResults = await embeddingsService.search('knowledge_base', finalMessage, 3, {
        threshold: 0.3 // Umbral de similitud mínimo
      });
      
      if (searchResults && searchResults.length > 0) {
        relevantContext = searchResults.map(result => result.content).join('\n\n');
        console.log(`✅ Contexto encontrado con ${searchMethod}:`, searchResults.length, 'resultados');
        console.log('📊 Scores de similitud:', searchResults.map(r => r.score.toFixed(3)).join(', '));
        
        // Log adicional para modo fallback
        if (embeddingsService.fallbackMode) {
          console.log('🔄 Búsqueda realizada con sistema de fallback mejorado');
        }
      } else {
        // Fallback final a búsqueda simple si no se encuentra nada
        relevantContext = getRelevantContext(finalMessage);
        searchMethod = 'simple_search';
        console.log('⚠️ Usando fallback de búsqueda simple (último recurso)');
      }
    } catch (error) {
      console.error('❌ Error crítico con embeddings, usando fallback simple:', error.message);
      console.error('📍 Stack trace:', error.stack);
      relevantContext = getRelevantContext(finalMessage);
      searchMethod = 'error_fallback';
      
      // Log adicional para debugging en producción
      if (error.message.includes('API key')) {
        console.error('🔑 Error de API key detectado en stream.js');
      }
    }
    
    // Debug: Log para verificar el contexto en producción
    console.log('Mensaje del usuario:', finalMessage);
    console.log('Contexto relevante encontrado:', relevantContext ? 'SÍ' : 'NO');
    console.log('Longitud del contexto:', relevantContext?.length || 0);
    console.log('Método de búsqueda utilizado:', searchMethod);
    
    // Métricas adicionales para monitoreo
    console.log('📊 Métricas de búsqueda:', {
      method: searchMethod,
      hasContext: !!relevantContext,
      contextLength: relevantContext?.length || 0,
      timestamp: new Date().toISOString()
    });
    
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
      
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.0-flash-001',
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      for await (const chunk of response) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(chunkText);
        }
      }
      
      res.end();
    } catch (streamError) {
      console.error('Error en streaming:', streamError);
      return res.status(500).json({ 
        error: 'Error en el streaming de respuesta',
        details: streamError.message
      });
    }

  } catch (error) {
    console.error('Error en chat/stream:', error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}