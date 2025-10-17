import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { getRelevantContext } from '../_services/embeddings-service.js';
import { formatResponseForMarkdown } from '../_services/markdown-formatter.js';
import semanticStreamingService from '../_services/semantic-streaming-service.js';
import { buildSystemInstructionWithContext } from '../_config/system-instruction.js';
import { needsKnowledgeBase } from '../_services/query-classifier.js';
import { withSecurity } from '../_middlewares/serverless-security.js';

// ============================================================================
// MÉTRICAS Y VALIDACIÓN
// ============================================================================
const metrics = {
  total: 0,
  success: 0,
  errors: 0,
  avgResponseTime: 0
};

/**
 * Valida la estructura y contenido del mensaje
 */
function validateRequest(body) {
  const errors = [];
  
  if (!body || typeof body !== 'object') {
    errors.push('Invalid request body');
    return errors;
  }
  
  let messageContent = '';
  
  if (body.messages && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1];
    messageContent = lastMessage?.parts?.[0]?.text || '';
  } else if (body.message) {
    messageContent = body.message;
  } else if (Array.isArray(body)) {
    messageContent = body[body.length - 1]?.content || '';
  } else if (typeof body === 'string') {
    messageContent = body;
  }
  
  if (!messageContent || typeof messageContent !== 'string') {
    errors.push('Message content is required');
  }
  
  if (messageContent.length > 10000) {
    errors.push('Message exceeds maximum length (10000 chars)');
  }
  
  return errors;
}

// ============================================================================
// HANDLER PRINCIPAL (SIN SEGURIDAD MANUAL)
// ============================================================================
async function streamHandler(req, res) {
  const startTime = Date.now();
  metrics.total++;
  
  // Solo POST permitido
  if (req.method !== 'POST') {
    metrics.errors++;
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const headers = req.headers || {};
    const clientIp = headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     headers['x-real-ip'] || 
                     'unknown';
    
    console.log(`🚀 Chat stream request from ${clientIp}`);
    
    // Validación de mensaje
    const validationErrors = validateRequest(req.body);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      metrics.errors++;
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not configured');
      console.error('💡 Expected GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY in environment');
      metrics.errors++;
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    // Extraer mensaje
    let messageContent = '';
    
    if (req.body.messages && Array.isArray(req.body.messages)) {
      const lastMessage = req.body.messages[req.body.messages.length - 1];
      messageContent = lastMessage?.parts?.[0]?.text || '';
    } else if (req.body.message) {
      messageContent = req.body.message;
    } else if (Array.isArray(req.body)) {
      messageContent = req.body[req.body.length - 1]?.content || '';
    } else if (typeof req.body === 'string') {
      messageContent = req.body;
    }
    
    console.log(`📝 Message: ${messageContent.substring(0, 50)}...`);
    
    // Determinar si la query necesita buscar en la base de conocimientos
    const shouldSearchKB = needsKnowledgeBase(messageContent);
    
    let relevantContext = { context: '', score: 0 };
    
    if (shouldSearchKB) {
      // Obtener contexto relevante de la base de conocimientos
      console.log('🔍 Searching knowledge base...');
      const rawContext = await getRelevantContext(messageContent, { 
        threshold: 0.25,
      });
      
      // Normalizar contexto
      if (typeof rawContext === 'string') {
        relevantContext.context = rawContext;
      } else if (rawContext && typeof rawContext === 'object') {
        relevantContext.context = rawContext.context || rawContext.text || '';
        relevantContext.score = Number(rawContext.score) || 0;
      }
      
      // Truncar contexto para evitar límites de tokens
      const MAX_CONTEXT_LENGTH = 8000;
      if (relevantContext.context && relevantContext.context.length > MAX_CONTEXT_LENGTH) {
        relevantContext.context = relevantContext.context.substring(0, MAX_CONTEXT_LENGTH) + '...';
        console.log(`⚠️ Context truncated to ${MAX_CONTEXT_LENGTH} chars`);
      }
      
      if (relevantContext.context) {
        console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
      } else {
        console.log('⚠️ No KB context found');
      }
    } else {
      console.log('⏭️ Skipping KB search - generic/general question');
    }
    
    // Construir system instruction con contexto
    const systemInstruction = buildSystemInstructionWithContext(
      relevantContext.context || '',
      relevantContext.score || 0
    );
    
    // Inicializar Gemini
    const client = new GoogleGenAI({ apiKey });
    
    console.log('🤖 Generating response...');
    
    // Generar stream
    const streamResponse = await client.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: messageContent,
      config: {
        systemInstruction,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        temperature: 0.3,
        topK: 20,
        topP: 0.85,
        maxOutputTokens: 1024,
      }
    });
    
    // Timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error('⏱️ Request timeout');
        metrics.errors++;
        res.status(504).json({ error: 'Request timeout' });
      }
    }, 25000); // 25s para serverless (Vercel límite: 30s)
    
    res.status(200);
    
    let chunks = 0;
    let totalChars = 0;
    let fullResponse = '';
    
    // Recolectar respuesta completa del stream
    console.log('📥 Collecting response from Gemini...');
    for await (const chunk of streamResponse) {
      const chunkText = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!chunkText) {
        console.warn('⚠️ Empty chunk received, skipping...');
        continue;
      }
      
      fullResponse += chunkText;
      totalChars += chunkText.length;
      chunks++;
    }
    
    console.log(`✅ Collected ${chunks} chunks (${totalChars} chars) from Gemini`);
    
    // ✅ APPLY MARKDOWN FORMATTING: Ensure consistent formatting across all environments
    // This guarantees that both local dev and production responses have proper markdown structure
    const formattedResponse = formatResponseForMarkdown(fullResponse);
    
    if (formattedResponse !== fullResponse) {
      console.log(`📝 Markdown formatting applied: ${fullResponse.length} → ${formattedResponse.length} chars`);
    }
    
    // Streaming semántico: procesar la respuesta completa
    console.log('🎯 Starting semantic streaming...');
    await semanticStreamingService.streamSemanticContent(res, formattedResponse, {
      enableSemanticChunking: true,
      enableContextualPauses: true,
      enableVariableSpeed: true,
      clientInfo: {
        ip: clientIp,
        userAgent: headers['user-agent']
      }
    });
    
    clearTimeout(timeoutId);
    
    const duration = Date.now() - startTime;
    metrics.success++;
    metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.success - 1) + duration) / metrics.success;
    
    console.log(`✅ Stream completed: ${chunks} chunks, ${totalChars} chars, ${duration}ms`);
    
    // Log de métricas cada 50 requests
    if (metrics.total % 50 === 0) {
      console.log(`📊 [METRICS] Total: ${metrics.total}, Success: ${metrics.success}, Errors: ${metrics.errors}, Avg: ${Math.round(metrics.avgResponseTime)}ms`);
    }
    
  } catch (error) {
    metrics.errors++;
    const duration = Date.now() - startTime;
    
    console.error('❌ Stream error:', error.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', error.stack);
    }
    
    if (!res.headersSent) {
      if (error.message?.includes('API key')) {
        return res.status(500).json({ error: 'API configuration error' });
      }
      if (error.message?.includes('quota') || error.message?.includes('rate')) {
        return res.status(429).json({ error: 'Service temporarily unavailable' });
      }
      
      const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.error(`🆔 Error ID: ${errorId}`);
      
      res.status(500).json({
        error: 'Internal server error',
        errorId,
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
    
    console.log(`❌ Request failed after ${duration}ms`);
  }
}

// ============================================================================
// EXPORT CON SEGURIDAD CENTRALIZADA
// ============================================================================
// El wrapper withSecurity aplica automáticamente:
// - CORS headers
// - Security headers (CSP, X-Frame-Options, etc.)
// - Rate limiting
// - Attack detection (XSS, SQL Injection, etc.)
// - API Key validation (si se configura)
// - Timeout protection
// - Error handling
export default withSecurity(streamHandler);

// Configuración de Vercel
export const config = {
  maxDuration: 60
};
