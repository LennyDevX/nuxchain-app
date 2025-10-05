import { GoogleGenAI, HarmBlockThreshold, HarmCategory } from "@google/genai";
import { getRelevantContext } from '../services/embeddings-service.js';

// ============================================================================
// RATE LIMITING
// ============================================================================
const rateLimitStore = new Map();
const RATE_LIMIT = {
  windowMs: 60000,
  maxRequests: 30,
  blockDurationMs: 300000
};

const metrics = {
  total: 0,
  success: 0,
  errors: 0,
  avgResponseTime: 0
};

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
    errors.push('Message exceeds maximum length');
  }
  
  if (/<script|javascript:|onerror=/i.test(messageContent)) {
    errors.push('Potentially malicious content detected');
  }
  
  return errors;
}

function checkRateLimit(ip) {
  const now = Date.now();
  const userLimit = rateLimitStore.get(ip);
  
  if (!userLimit) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
      blocked: false
    });
    return { allowed: true };
  }
  
  if (userLimit.blocked && now < userLimit.resetTime) {
    return {
      allowed: false,
      retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
    };
  }
  
  if (now > userLimit.resetTime) {
    userLimit.count = 1;
    userLimit.resetTime = now + RATE_LIMIT.windowMs;
    userLimit.blocked = false;
    return { allowed: true };
  }
  
  userLimit.count++;
  
  if (userLimit.count > RATE_LIMIT.maxRequests) {
    userLimit.blocked = true;
    userLimit.resetTime = now + RATE_LIMIT.blockDurationMs;
    return {
      allowed: false,
      retryAfter: Math.ceil(RATE_LIMIT.blockDurationMs / 1000)
    };
  }
  
  return { allowed: true };
}

// Cleanup
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitStore.entries()) {
    if (now > data.resetTime && !data.blocked) {
      rateLimitStore.delete(ip);
    }
  }
}, 60000);

// ============================================================================
// HANDLER PRINCIPAL
// ============================================================================
export default async function handler(req, res) {
  const startTime = Date.now();
  metrics.total++;
  
  // Headers de seguridad
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    metrics.errors++;
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // ✅ FIX: Headers seguros con fallback
    const headers = req.headers || {};
    const clientIp = headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     headers['x-real-ip'] || 
                     'test-client';
    
    const rateLimitCheck = checkRateLimit(clientIp);
    
    if (!rateLimitCheck.allowed) {
      console.warn(`⚠️ Rate limit: ${clientIp}`);
      metrics.errors++;
      res.setHeader('Retry-After', rateLimitCheck.retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: rateLimitCheck.retryAfter
      });
    }
    
    console.log(`🚀 Request from ${clientIp}`);
    
    // Validación
    const validationErrors = validateRequest(req.body);
    
    if (validationErrors.length > 0) {
      console.error('❌ Validation:', validationErrors);
      metrics.errors++;
      return res.status(400).json({
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    // API Key - ✅ FIX: Soportar ambas variables
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
    
    // Obtener contexto relevante de la base de conocimientos
    console.log('🔍 Searching KB with gemini-embedding-001...');
    const rawContext = await getRelevantContext(messageContent, { 
      threshold: 0.3, // Threshold optimizado para embeddings (más bajo que BM25)
      limit: 5 
    });
    
    // ✅ Normalizar: aceptar string u objeto { context, score }
    let relevantContext = { context: '', score: 0 };
    if (typeof rawContext === 'string') {
      relevantContext.context = rawContext;
    } else if (rawContext && typeof rawContext === 'object') {
      relevantContext.context = rawContext.context || rawContext.text || '';
      relevantContext.score = Number(rawContext.score) || 0;
    }
    
    // ✅ Truncar contexto para evitar límites de tokens (max ~3000 chars)
    const MAX_CONTEXT_LENGTH = 3000;
    if (relevantContext.context && relevantContext.context.length > MAX_CONTEXT_LENGTH) {
      relevantContext.context = relevantContext.context.substring(0, MAX_CONTEXT_LENGTH) + '...';
      console.log(`⚠️ Context truncated to ${MAX_CONTEXT_LENGTH} chars`);
    }
    
    // Log conciso para producción
    if (relevantContext.context) {
      console.log(`✅ KB found: ${relevantContext.context.length} chars, score: ${relevantContext.score.toFixed(3)}`);
    } else {
      console.log('⚠️ No KB context found');
    }
    
    // Construir system instruction con contexto
    const systemInstruction = `Eres Nuvim AI 1.0, el asistente oficial de Nuxchain.

FORMATO DE RESPUESTA OBLIGATORIO (PRODUCCIÓN):
• Escribe ÚNICAMENTE en texto plano narrativo
• PROHIBIDO usar asteriscos (*) en cualquier contexto
• PROHIBIDO usar markdown (**, *, ##, ###, -, +, >)
• PROHIBIDO hacer listas con viñetas, guiones o símbolos
• Escribe TODO en párrafos narrativos fluidos y naturales
• Separa ideas diferentes con saltos de línea dobles entre párrafos
• Usa puntos y comas para estructurar las ideas dentro del párrafo

EJEMPLO CORRECTO DE RESPUESTA:
"Nuxchain ofrece varias características importantes para la experiencia del usuario. La plataforma destaca por su alta escalabilidad, permitiendo procesar miles de transacciones por segundo sin comprometer el rendimiento. También implementa seguridad avanzada mediante protocolos criptográficos robustos que protegen cada operación.

La eficiencia energética es otro punto clave, con un consumo optimizado comparado con otras blockchains tradicionales. Además, la plataforma facilita la interoperabilidad entre diferentes redes, permitiendo transferencias fluidas de activos digitales."

EJEMPLO INCORRECTO (NUNCA HAGAS ESTO):
"Nuxchain ofrece:
* Escalabilidad
* Seguridad avanzada  
* Eficiencia energética"

REGLAS DE CONTENIDO OBLIGATORIAS:
• USA EXCLUSIVAMENTE la información del contexto proporcionado abajo
• Si el contexto contiene la respuesta, úsala de forma directa y precisa
• NO inventes información que no está en el contexto
• NO agregues detalles o datos que no aparecen en el contexto
• Si el contexto no cubre la pregunta completamente, indícalo brevemente
• Menciona datos específicos del contexto (números, porcentajes, nombres)

REGLAS ADICIONALES DE PRODUCCIÓN:
• NO saludes en cada respuesta, solo si es el primer mensaje
• Ve directo al punto principal de la pregunta
• Usa lenguaje natural, profesional pero conversacional
• Mantén párrafos cortos (máximo 2-3 oraciones por párrafo)
• Si necesitas enumerar, hazlo en línea: "primero... segundo... tercero..."
• Usa términos técnicos cuando sea apropiado, pero explícalos brevemente
${relevantContext.context ? `

CONTEXTO DE LA BASE DE CONOCIMIENTOS (SCORE: ${relevantContext.score?.toFixed(3) || 'N/A'}):
${relevantContext.context}

INSTRUCCIÓN CRÍTICA: Usa ÚNICAMENTE este contexto oficial de Nuxchain para respuestas precisas. No agregues información externa. Si el contexto no cubre la pregunta, sé honesto y di "No tengo información específica sobre eso en mi base de conocimientos actual".
` : ''}

RECORDATORIO FINAL: CERO asteriscos (*), CERO markdown (**, ##, -), SOLO texto plano narrativo profesional basado en el contexto proporcionado.`;
    
    // Inicializar Gemini - ✅ FIX: Usar GoogleGenAI correctamente según documentación oficial
    const client = new GoogleGenAI({ apiKey });
    
    console.log('🤖 Generating...');
    
    // Generar stream - IMPORTANTE: generateContentStream retorna una Promise<AsyncGenerator>
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
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    
    // Timeout
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        console.error('⏱️ Timeout');
        metrics.errors++;
        res.status(504).json({ error: 'Timeout' });
      }
    }, 30000);
    
    // Headers de streaming - TEXTO PLANO (sin SSE)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.status(200);
    
    let chunks = 0;
    let totalChars = 0;
    
    // ✅ STREAMING DIRECTO: Sin formato SSE, solo texto plano
    for await (const chunk of streamResponse) {
      // Extraer el texto del chunk - ES UNA PROPIEDAD, NO UN MÉTODO
      const chunkText = chunk.text;
      if (!chunkText) continue;
      
      totalChars += chunkText.length;
      chunks++;
      
      // Enviar texto plano directamente (sin JSON, sin "data:")
      res.write(chunkText);
    }
    
    clearTimeout(timeoutId);
    res.end();
    
    const duration = Date.now() - startTime;
    metrics.success++;
    metrics.avgResponseTime = (metrics.avgResponseTime * (metrics.success - 1) + duration) / metrics.success;
    
    console.log(`✅ Done: ${chunks} chunks, ${totalChars} chars, ${duration}ms`);
    
    if (metrics.total % 50 === 0) {
      console.log(`📊 [METRICS] Total: ${metrics.total}, Success: ${metrics.success}, Errors: ${metrics.errors}, Avg: ${Math.round(metrics.avgResponseTime)}ms`);
    }
    
  } catch (error) {
    metrics.errors++;
    const duration = Date.now() - startTime;
    
    console.error('❌ Error:', error.message);
    // Solo mostrar stack en desarrollo
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
        errorId
      });
    }
    
    console.log(`❌ Failed after ${duration}ms`);
  }
}

// Export config for Vercel
export const config = {
  maxDuration: 60
};