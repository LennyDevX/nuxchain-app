import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { getRelevantContext } from '../_services/embeddings-service.js';
import { formatResponseForMarkdown } from '../_services/markdown-formatter.js';
import semanticStreamingService from '../_services/semantic-streaming-service.js';
import { buildSystemInstructionWithContext } from '../_config/system-instruction.js';
import { needsKnowledgeBase, updateConversationContext } from '../_services/query-classifier.js';
import { withSecurity } from '../_middlewares/serverless-security.js';
import type { 
  ChatMessage, 
  KnowledgeBaseContext 
} from '../types/index.js';

// ============================================================================
// TIPOS
// ============================================================================
interface RequestMetrics {
  total: number;
  success: number;
  errors: number;
  avgResponseTime: number;
}

interface ClassificationResult {
  needsKB: boolean;
  score: number;
  reason?: string;
}

interface StreamConfig {
  enableSemanticChunking?: boolean;
  enableContextualPauses?: boolean;
  enableVariableSpeed?: boolean;
  clientInfo?: {
    ip: string;
    userAgent?: string;
  };
}

// Tipo para el body que puede venir en diferentes formatos
type ChatRequestBody = 
  | { messages: ChatMessage[]; message?: never }
  | { message: string; messages?: never }
  | ChatMessage[]
  | string;

// ============================================================================
// MÉTRICAS Y VALIDACIÓN
// ============================================================================
const metrics: RequestMetrics = {
  total: 0,
  success: 0,
  errors: 0,
  avgResponseTime: 0
};

/**
 * Valida la estructura y contenido del mensaje
 */
function validateRequest(body: unknown): string[] {
  const errors: string[] = [];
  
  if (!body) {
    errors.push('Invalid request body');
    return errors;
  }
  
  let messageContent = '';
  
  if (typeof body === 'string') {
    messageContent = body;
  } else if (typeof body === 'object') {
    const typedBody = body as ChatRequestBody;
    messageContent = extractMessage(typedBody);
  }
  
  if (!messageContent || typeof messageContent !== 'string') {
    errors.push('Message content is required');
  }
  
  if (messageContent.length > 10000) {
    errors.push('Message exceeds maximum length (10000 chars)');
  }
  
  return errors;
}

/**
 * Extrae el mensaje del request body que puede venir en diferentes formatos
 */
function extractMessage(body: ChatRequestBody): string {
  if (typeof body === 'string') {
    return body;
  }
  
  if (Array.isArray(body)) {
    const lastMessage = body[body.length - 1];
    return (lastMessage as ChatMessage)?.content || '';
  }
  
  if ('messages' in body && Array.isArray(body.messages)) {
    const lastMessage = body.messages[body.messages.length - 1];
    return lastMessage?.parts?.[0]?.text || lastMessage?.content || '';
  }
  
  if ('message' in body && typeof body.message === 'string') {
    return body.message;
  }
  
  return '';
}

/**
 * Obtiene la IP del cliente desde los headers
 */
function getClientIp(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  
  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  
  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(',')[0]?.trim() || 'unknown';
  }
  
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp;
  }
  
  return 'unknown';
}

// ============================================================================
// HANDLER PRINCIPAL (SIN SEGURIDAD MANUAL)
// ============================================================================
async function streamHandler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const startTime = Date.now();
  metrics.total++;
  
  // Solo POST permitido
  if (req.method !== 'POST') {
    metrics.errors++;
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  
  try {
    const headers = req.headers || {};
    const clientIp = getClientIp(req);
    
    console.log(`🚀 Chat stream request from ${clientIp}`);
    
    // Validación de mensaje
    const validationErrors = validateRequest(req.body);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation errors:', validationErrors);
      metrics.errors++;
      res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
      return;
    }
    
    // API Key
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error('❌ API key not configured');
      console.error('💡 Expected GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY in environment');
      metrics.errors++;
      res.status(500).json({ error: 'API key not configured' });
      return;
    }
    
    // Extraer mensaje
    const messageContent = extractMessage(req.body as ChatRequestBody);
    
    console.log(`📝 Message: ${messageContent.substring(0, 50)}...`);
    
    // Determinar si la query necesita buscar en la base de conocimientos (CON DEBUG LOGS)
    const classificationResult = needsKnowledgeBase(messageContent, { 
      includeContext: true, 
      debugMode: true 
    }) as ClassificationResult;
    
    let relevantContext: KnowledgeBaseContext = { context: '', score: 0 };
    
    if (classificationResult.needsKB) {
      console.log(`✅ KB Classification approved | Score: ${classificationResult.score.toFixed(2)}`);
      
      // Obtener contexto relevante de la base de conocimientos
      console.log('🔍 Searching knowledge base...');
      const rawContext = await getRelevantContext(messageContent, { 
        threshold: 0.15,
      });
      
      // Normalizar contexto
      if (typeof rawContext === 'string') {
        relevantContext = { context: rawContext, score: 0 };
      } else if (rawContext && typeof rawContext === 'object') {
        const typedContext = rawContext as KnowledgeBaseContext;
        const ctx = typedContext.context || '';
        const score = Number(typedContext.score) || 0;
        relevantContext = { context: ctx, score };
      }
      
      // Actualizar contexto de conversación
      updateConversationContext(true, ['nuxchain', 'platform']);
    } else {
      console.log(`⏭️ Skipping KB - Reason: ${classificationResult.reason || 'unknown'}`);
    }
    
    // Truncar contexto para evitar límites de tokens
    const MAX_CONTEXT_LENGTH = 8000;
    if (relevantContext.context && relevantContext.context.length > MAX_CONTEXT_LENGTH) {
      relevantContext = {
        ...relevantContext,
        context: relevantContext.context.substring(0, MAX_CONTEXT_LENGTH) + '...'
      };
      console.log(`⚠️ Context truncated to ${MAX_CONTEXT_LENGTH} chars`);
    }
    
    if (relevantContext.context) {
      console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
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
    
    const streamConfig: StreamConfig = {
      enableSemanticChunking: true,
      enableContextualPauses: true,
      enableVariableSpeed: true,
      clientInfo: {
        ip: clientIp,
        userAgent: headers['user-agent'] as string | undefined
      }
    };
    
    await semanticStreamingService.streamSemanticContent(res, formattedResponse, streamConfig);
    
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
    
    const err = error as Error;
    console.error('❌ Stream error:', err.message);
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', err.stack);
    }
    
    if (!res.headersSent) {
      if (err.message?.includes('API key')) {
        res.status(500).json({ error: 'API configuration error' });
        return;
      }
      if (err.message?.includes('quota') || err.message?.includes('rate')) {
        res.status(429).json({ error: 'Service temporarily unavailable' });
        return;
      }
      
      const errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.error(`🆔 Error ID: ${errorId}`);
      
      res.status(500).json({
        error: 'Internal server error',
        errorId,
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
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
