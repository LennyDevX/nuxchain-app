import { GoogleGenAI } from '@google/genai';
import { getRelevantContext } from '../services/knowledge-base.js';
import { initializeKnowledgeBaseForVercel } from '../services/embeddings-service.js';
import urlContextService from '../services/url-context-service.js';

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

// Herramientas disponibles para el modelo
const tools = [
  {
    name: 'url_context_tool',
    description: 'Extrae y analiza contenido de URLs para proporcionar contexto adicional',
    parameters: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'La URL de la cual extraer contenido'
        },
        analysis_type: {
          type: 'string',
          enum: ['summary', 'detailed', 'technical'],
          description: 'Tipo de análisis a realizar en el contenido'
        }
      },
      required: ['url']
    }
  },
  {
    name: 'nuxchain_search',
    description: 'Busca información específica en la base de conocimientos de Nuxchain',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Consulta de búsqueda en la base de conocimientos'
        },
        category: {
          type: 'string',
          enum: ['staking', 'nfts', 'airdrops', 'tokenization', 'general'],
          description: 'Categoría específica para buscar'
        }
      },
      required: ['query']
    }
  }
];

// Función para ejecutar herramientas
async function executeTool(toolName, parameters) {
  try {
    switch (toolName) {
      case 'url_context_tool':
        return await executeUrlContextTool(parameters);
      case 'nuxchain_search':
        return await executeNuxchainSearch(parameters);
      default:
        return { error: `Herramienta desconocida: ${toolName}` };
    }
  } catch (error) {
    console.error(`Error ejecutando herramienta ${toolName}:`, error);
    return { error: `Error ejecutando ${toolName}: ${error.message}` };
  }
}

// Implementación de la herramienta de contexto de URL usando el servicio existente
async function executeUrlContextTool(parameters) {
  const { url, analysis_type = 'summary' } = parameters;
  
  try {
    console.log(`🔍 [PRODUCTION] Procesando URL con servicio: ${url}`);
    
    // Usar el servicio existente que ya tiene manejo de cache y timeouts optimizados
    const result = await urlContextService.fetchUrlContext(url, {
      analysis_type,
      maxContentLength: 3000 // Limitar para Vercel
    });
    
    console.log(`✅ [PRODUCTION] URL procesada exitosamente: ${result.content?.length || 0} caracteres`);
    
    return {
      success: true,
      url: result.url,
      content: result.content,
      analysis_type,
      content_length: result.content?.length || 0,
      extracted_at: result.metadata?.extractedAt || new Date().toISOString(),
      title: result.title,
      summary: result.summary
    };
    
  } catch (error) {
    console.error(`❌ [PRODUCTION] Error en url_context_tool para ${url}:`, error.message);
    
    return {
      error: `Error procesando URL: ${error.message}`,
      url,
      error_type: error.name || 'UnknownError'
    };
  }
}

// Implementación de búsqueda en Nuxchain
async function executeNuxchainSearch(parameters) {
  const { query, category } = parameters;
  
  try {
    // Usar el sistema de embeddings existente
    const embeddingsService = await initializeKnowledgeBaseForVercel();
    
    const searchResults = await embeddingsService.search('knowledge_base', query, 5, {
      threshold: 0.2,
      category: category
    });
    
    if (searchResults && searchResults.length > 0) {
      return {
        query,
        category,
        results: searchResults.map(result => ({
          content: result.content,
          score: result.score,
          metadata: result.metadata
        })),
        found: searchResults.length
      };
    } else {
      // Fallback a búsqueda simple
      const fallbackResult = getRelevantContext(query);
      return {
        query,
        category,
        results: [{ content: fallbackResult, score: 0.5, source: 'fallback' }],
        found: 1,
        method: 'fallback'
      };
    }
  } catch (error) {
    return { error: `Error en búsqueda: ${error.message}` };
  }
}

export default async function handler(req, res) {
  console.log('🚀 [PRODUCTION] Handler iniciado');
  
  // Timeout global para Vercel (50 segundos - ajustado según vercel.json)
  let globalTimeout;
  
  try {
    globalTimeout = setTimeout(() => {
      console.error('⏰ [PRODUCTION] Timeout global de Vercel alcanzado');
      if (!res.headersSent) {
        res.status(408).json({ error: 'Timeout del servidor' });
      }
    }, 50000);

    console.log('⏰ [PRODUCTION] Timeout global configurado');
    
    // Manejar preflight CORS
    if (req.method === 'OPTIONS') {
      console.log('🔄 [PRODUCTION] Manejando preflight CORS');
      Object.entries(corsHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      if (globalTimeout) clearTimeout(globalTimeout);
      return res.status(200).json({});
    }

    console.log('🔧 [PRODUCTION] Aplicando headers CORS');
    // Aplicar headers CORS
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    console.log('🔒 [PRODUCTION] Verificando seguridad');
    // Verificar seguridad
    const securityCheck = checkSecurity(req);
    if (securityCheck) {
      console.log('❌ [PRODUCTION] Fallo de seguridad:', securityCheck.error);
      if (globalTimeout) clearTimeout(globalTimeout);
      return res.status(securityCheck.status).json({ error: securityCheck.error });
    }

    if (req.method !== 'POST') {
      console.log('❌ [PRODUCTION] Método no permitido:', req.method);
      if (globalTimeout) clearTimeout(globalTimeout);
      return res.status(405).json({ error: 'Método no permitido' });
    }
    
    console.log('✅ [PRODUCTION] Validaciones iniciales completadas');
    const { message, conversationHistory = [], messages = [], useTools = true } = req.body;
    
    console.log(`📥 [PRODUCTION] Request body recibido:`, {
      hasMessage: !!message,
      hasConversationHistory: conversationHistory.length,
      hasMessages: messages.length,
      useTools
    });

    // Manejar tanto el formato antiguo como el nuevo
    let finalMessage;
    let finalHistory;
    
    if (messages && messages.length > 0) {
      // Formato nuevo del frontend: array de messages
      console.log(`📥 [PRODUCTION] Procesando formato de messages del frontend`);
      
      finalHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content || msg.parts?.[0]?.text || msg.text
      }));
      
      const lastMessage = messages[messages.length - 1];
      finalMessage = lastMessage.content || lastMessage.parts?.[0]?.text || lastMessage.text;
      
      console.log(`📥 [PRODUCTION] Mensaje final extraído: ${finalMessage?.substring(0, 100)}...`);
      console.log(`📥 [PRODUCTION] Historia de conversación: ${finalHistory.length} mensajes`);
    } else {
      // Formato antiguo: message + conversationHistory
      finalMessage = message;
      finalHistory = conversationHistory;
    }

    if (!finalMessage) {
      return res.status(400).json({ error: 'Mensaje requerido' });
    }

    // Verificar API key de Gemini
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key de Gemini no configurada' });
    }

    // Inicializar Gemini
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

    // Obtener contexto relevante
    let relevantContext = '';
    try {
      const embeddingsService = await initializeKnowledgeBaseForVercel();
      const searchResults = await embeddingsService.search('knowledge_base', finalMessage, 3, {
        threshold: 0.3
      });
      
      if (searchResults && searchResults.length > 0) {
        relevantContext = searchResults.map(result => result.content).join('\n\n');
      } else {
        relevantContext = getRelevantContext(finalMessage);
      }
    } catch (error) {
      console.error('Error con embeddings:', error);
      relevantContext = getRelevantContext(finalMessage);
    }

    const contextToUse = relevantContext || `Nuxchain es una plataforma descentralizada integral que combina staking, marketplace de NFTs, airdrops y tokenización.`;

    // Detectar URLs en el mensaje automáticamente (regex mejorado)
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
    const detectedUrls = finalMessage.match(urlRegex) || [];
    
    // También detectar URLs sin protocolo
    const urlWithoutProtocolRegex = /(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{2,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/=]*)/g;
    const urlsWithoutProtocol = finalMessage.match(urlWithoutProtocolRegex) || [];
    
    // Filtrar URLs válidas sin protocolo (que no sean solo dominios comunes)
    const validUrlsWithoutProtocol = urlsWithoutProtocol.filter(url => 
      !url.startsWith('www.') || url.includes('/') || url.includes('?') || url.includes('#')
    );
    
    // Combinar resultados crudos
    const allDetectedRawUrls = [...detectedUrls, ...validUrlsWithoutProtocol];

    // Normalizar y desduplicar URLs para evitar dobles conteos (por ejemplo, con y sin protocolo)
    const normalizeUrlForComparison = (raw) => {
      if (!raw) return null;
      let s = String(raw).trim();
      // Eliminar envolturas o puntuación alrededor (backticks, comillas, paréntesis) y al final
      s = s.replace(/^[`'"\(\[]+/, '').replace(/[`'"\)\]\.,;:!?]+$/, '');
      // Añadir protocolo si falta
      if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
      try {
        const u = new URL(s);
        // No comparar el hash y quitar el slash final cuando aplique
        u.hash = '';
        if (u.pathname !== '/') {
          u.pathname = u.pathname.replace(/\/+$/, '');
        }
        return u.toString();
      } catch {
        return null;
      }
    };

    const allDetectedUrls = [];
    const seenUrls = new Set();
    for (const raw of allDetectedRawUrls) {
      const norm = normalizeUrlForComparison(raw);
      if (!norm) continue;
      if (!seenUrls.has(norm)) {
        seenUrls.add(norm);
        allDetectedUrls.push(norm);
      }
    }

    // Configurar headers para streaming lo antes posible
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    
    // Bloque de análisis previo de URLs para evitar bloqueos por function-calling
    let preFetchedUrlContextBlock = '';
    let toolsEnabled = useTools; // habilitamos herramientas solo si no hay URLs prefetch

    if (allDetectedUrls.length > 0) {
      try {
        // Informar progreso al cliente inmediatamente
        res.write(`🔎 Analizando ${allDetectedUrls.length} ${allDetectedUrls.length === 1 ? 'URL' : 'URLs'}...\n`);

        // Limitar número de URLs para cumplir límites de tiempo
        const urlsToProcess = allDetectedUrls.slice(0, 3);

        const results = await Promise.allSettled(
          urlsToProcess.map(url => urlContextService.fetchUrlContext(url, { maxContentLength: 3000 }))
        );

        const successful = results
          .map((r, i) => ({ r, url: urlsToProcess[i] }))
          .filter(x => x.r.status === 'fulfilled' && x.r.value && x.r.value.content);

        if (successful.length > 0) {
          preFetchedUrlContextBlock = successful.map(({ r }) => {
            const v = r.value;
            const preview = (v.content || '').slice(0, 1200);
            return `URL: ${v.url}\nTítulo: ${v.title}\nResumen: ${v.summary}\nContenido (extracto):\n${preview}`;
          }).join('\n\n---\n\n');

          // Añadir instrucción explícita de resumen
          preFetchedUrlContextBlock = `\n\nDATOS EXTRAÍDOS DE LAS URLS (usar para tu respuesta):\n${preFetchedUrlContextBlock}\n\n`;

          // Avisar al cliente
          res.write(`✅ Análisis ${allDetectedUrls.length === 1 ? 'de la URL' : 'de las URLs'} completado. Preparando resumen...\n`);
        } else {
          res.write('⚠️ No fue posible extraer contenido de las URL(s). Continuaré con una respuesta general.\n');
        }

        // Deshabilitar tools para evitar que el modelo vuelva a pedir function-calls
        toolsEnabled = false;
      } catch (prefetchErr) {
        console.error('❌ Error preprocesando URLs:', prefetchErr);
        res.write('⚠️ Ocurrió un problema al analizar las URL(s). Continuaré con una respuesta general.\n');
        toolsEnabled = false;
      }
    }
    
    // Crear prompt del sistema
    let systemPrompt = `Eres Nuvim AI 1.0, un asistente inteligente avanzado con herramientas especializadas. Puedes ayudar con análisis de URLs, búsquedas en bases de conocimiento y consultas generales.

CONTEXTO RELEVANTE DE NUXCHAIN (cuando sea aplicable):
${contextToUse}

HERRAMIENTAS DISPONIBLES:
- url_context_tool: Para extraer y analizar contenido de URLs (OBLIGATORIO para cualquier URL detectada)
- nuxchain_search: Para buscar información específica en la base de conocimientos de Nuxchain`;

    // Si se detectan URLs, reforzar instrucciones de resumen
    if (allDetectedUrls.length > 0) {
      systemPrompt += `

🚨 ALERTA CRÍTICA: Se detectaron ${allDetectedUrls.length} URL(s) en el mensaje del usuario: ${allDetectedUrls.join(', ')}

⚠️ ACCIÓN OBLIGATORIA INMEDIATA:
- Si ya recibiste datos extraídos de las URL(s) en este mismo mensaje, úsalo directamente para responder.
- Si no hay datos extraídos, usa url_context_tool para cada URL y luego responde con un resumen.
- La respuesta debe incluir un bloque por URL siguiendo este formato conciso:
  • Título
  • Enlace
  • De qué trata (2–3 líneas, sin repetir el título)
  • Puntos clave (3–5 bullets, concretos)
  • Recomendaciones/Próximos pasos (opcional)
- No declares cuántas URL(s) detectaste; enfócate en explicar el contenido y en aportar valor práctico.`;
    }
    
    systemPrompt += `

INSTRUCCIONES GENERALES:
- Responde siempre en el mismo idioma que el usuario
- Sé amigable, profesional y útil
- Proporciona análisis detallados y extensos cuando sea apropiado
- No uses backticks ni formato de código para URLs o títulos
- No repitas el título dentro de la descripción; evita redundancias
- Usa frases cortas y bullets claros; prioriza la claridad
- Evita emojis salvo que el usuario los utilice primero`;

    // Preparar contenido con historial y posible bloque de contexto de URL
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      {
        role: 'model',
        parts: [{ text: '¡Hola! Soy Nuvim AI 1.0, tu asistente inteligente de Nuxchain con herramientas especializadas. ¿En qué puedo ayudarte hoy? 😊' }]
      },
      ...finalHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content || msg.parts?.[0]?.text || msg.text }]
      })),
    ];

    if (preFetchedUrlContextBlock) {
      contents.push({ role: 'user', parts: [{ text: preFetchedUrlContextBlock }] });
      contents.push({ role: 'user', parts: [{ text: 'Por favor, genera un resumen claro y organizado basado en los datos de las URL(s) anteriores.' }] });
    }

    contents.push({
      role: 'user',
      parts: [{ text: finalMessage }]
    });
    
    console.log(`📤 [PRODUCTION] Contenidos preparados para Gemini: ${contents.length} elementos`);

    // Configuración del modelo con o sin herramientas (deshabilitadas cuando ya preprocesamos URLs)
    const modelConfig = {
      model: 'gemini-2.0-flash-001',
      contents: contents,
      generationConfig: {
        temperature: 0.8,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    if (toolsEnabled) {
      modelConfig.tools = [{ functionDeclarations: tools }];
      console.log(`🔧 [PRODUCTION] Herramientas habilitadas: ${tools.map(t => t.name).join(', ')}`);
    } else {
      console.log('🔧 [PRODUCTION] Herramientas deshabilitadas (usando datos preextraídos si aplica)');
    }

    console.log(`🤖 [PRODUCTION] Iniciando generación de contenido con modelo: ${modelConfig.model}`);

    const response = await ai.models.generateContentStream(modelConfig);

    let toolCallsDetected = false;
    let toolResults = [];
    
    for await (const chunk of response) {
      // Manejar llamadas a herramientas solo si están habilitadas
      if (toolsEnabled && chunk.functionCalls) {
        toolCallsDetected = true;
        console.log(`🔧 [PRODUCTION] Detectadas ${chunk.functionCalls.length} llamadas a herramientas`);
        
        for (const functionCall of chunk.functionCalls) {
          console.log(`🔧 [PRODUCTION] Ejecutando herramienta: ${functionCall.name} con args:`, functionCall.args);
          
          try {
            const toolResult = await executeTool(functionCall.name, functionCall.args);
            
            toolResults.push({
              name: functionCall.name,
              args: functionCall.args,
              result: toolResult
            });
            
            console.log(`✅ [PRODUCTION] Herramienta ${functionCall.name} ejecutada exitosamente`);
          } catch (toolError) {
            console.error(`❌ [PRODUCTION] Error ejecutando herramienta ${functionCall.name}:`, toolError);
            toolResults.push({
              name: functionCall.name,
              args: functionCall.args,
              result: { error: `Error ejecutando herramienta: ${toolError.message}` }
            });
          }
        }
      }
      
      // Enviar texto normal
      const chunkText = chunk.text;
      if (chunkText) {
        res.write(chunkText);
      }
    }
    
    // Si se detectaron llamadas a herramientas, generar respuesta natural con Gemini
    if (toolsEnabled && toolCallsDetected && toolResults.length > 0) {
      console.log(`🔄 [PRODUCTION] Generando respuesta natural con resultados de ${toolResults.length} herramientas`);
      
      // Formatear resultados para el contexto de Gemini
      const toolResultsContext = toolResults.map(tool => {
        if (tool.name === 'url_context_tool') {
          if (tool.result.error) {
            return `Error al analizar la URL ${tool.args.url}: ${tool.result.error}`;
          } else {
            return `Contenido de ${tool.args.url}:\n${tool.result.content}`;
          }
        } else if (tool.name === 'nuxchain_search') {
          if (tool.result.error) {
            return `Error en búsqueda: ${tool.result.error}`;
          } else {
            const results = tool.result.results.map(r => r.content).join('\n\n');
            return `Resultados de búsqueda para "${tool.result.query}":\n${results}`;
          }
        }
        return `Resultado de ${tool.name}: ${JSON.stringify(tool.result, null, 2)}`;
      }).join('\n\n');
      
      // Crear nueva conversación con los resultados de las herramientas
      const contentsWithToolResults = [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        },
        {
          role: 'model',
          parts: [{ text: 'He ejecutado las herramientas necesarias y obtenido la siguiente información.' }]
        },
        ...finalHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content || msg.parts?.[0]?.text || msg.text }]
        })),
        {
          role: 'user',
          parts: [{ text: finalMessage }]
        },
        {
          role: 'model',
          parts: [{ text: `Información obtenida:\n\n${toolResultsContext}\n\nAhora proporciona un análisis completo y útil basado en esta información.` }]
        }
      ];
      
      const naturalResponse = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash-lite',
        contents: contentsWithToolResults,
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });
      
      // Enviar la respuesta natural
      for await (const chunk of naturalResponse) {
        const chunkText = chunk.text;
        if (chunkText) {
          res.write(chunkText);
        }
      }
    }
    
    // Limpiar timeout y finalizar respuesta
    clearTimeout(globalTimeout);
    res.end();
    console.log(`✅ [PRODUCTION] Streaming completado exitosamente`);

  } catch (error) {
    console.error('❌ [PRODUCTION] Error en chat/stream-with-tools:', error.message);
    
    // Limpiar timeout en caso de error
    if (globalTimeout) {
      clearTimeout(globalTimeout);
    }
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: 'Error interno del servidor',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    } else {
      // Si ya se enviaron headers, intentar terminar el stream gracefully
      try {
        res.write('\n\n❌ Error interno del servidor');
        res.end();
      } catch (endError) {
        console.error('❌ [PRODUCTION] Error terminando stream:', endError.message);
      }
    }
  }
}