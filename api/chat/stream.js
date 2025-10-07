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

REGLAS CRÍTICAS DE FORMATO (OBLIGATORIO):
• Usa **Markdown** para dar formato a tus respuestas
• Usa **negritas** (**texto**) para términos importantes
• Usa *cursivas* (*texto*) para énfasis
• Usa listas con viñetas (- item) para enumerar puntos
• Usa listas numeradas (1. item) para pasos secuenciales
• Usa ## para títulos de secciones cuando sea apropiado
• Usa \`código\` para términos técnicos o nombres de funciones
• Usa bloques de código con \`\`\` para código más largo
• Separa párrafos con doble salto de línea

EJEMPLOS DE FORMATO CORRECTO:

Pregunta: "¿Qué es Nuxchain?"
Respuesta CORRECTA:
"**Nuxchain** es una plataforma descentralizada integral que combina:

- **Staking**: Deposita tokens POL y gana recompensas automáticas
- **Marketplace de NFTs**: Compra, vende e intercambia NFTs
- **Airdrops**: Participa en distribuciones de tokens y NFTs exclusivos
- **Tokenización**: Herramientas para crear tus propios activos digitales

## Características Principales

La plataforma incluye contratos inteligentes de *Smart Staking* que permiten depositar tokens **POL** y ganar recompensas automáticas. También cuenta con un marketplace de NFTs donde puedes comprar, vender e intercambiar NFTs usando tokens POL.

Además, integra **Nuvim AI 1.0**, un chat potenciado por inteligencia artificial que te ayuda con todas las funciones de la plataforma.

### ¿Por qué Nuxchain es diferente?

Nuxchain se diferencia por no tener un token tradicional. En su lugar, se enfoca en **NFTs 2.0**, que son representaciones de arte digital con beneficios únicos y poderosos que gamifican la experiencia del usuario tanto dentro como fuera del ecosistema Nuxchain."

Pregunta: "¿Cuáles son los beneficios del staking?"
Respuesta CORRECTA:
"El **staking en Nuxchain** ofrece varios beneficios importantes:

## 1. Recompensas Automáticas

Puedes depositar tokens **POL** en el contrato \`SmartStaking\` para ganar recompensas automáticas calculadas en *tiempo real*. Las recompensas se basan en:
- El tiempo que mantienes tus tokens depositados
- El período de bloqueo que elijas

## 2. Flexibilidad de Períodos de Bloqueo

Tienes opciones flexibles de lockup:

| Período | APY Anual | Tasa por Hora |
|---------|-----------|---------------|
| Sin lockup | **87.6%** | 0.01% |
| 30 días | **105.1%** | 0.012% |
| 90 días | **140.2%** | 0.016% |
| 180 días | **175.2%** | 0.02% |
| 365 días | **262.8%** | 0.03% |

## 3. Compounding de Recompensas

Las recompensas se calculan **cada hora** y puedes:
- Reclamarlas después de que expire tu período de bloqueo
- Usar la función \`compound()\` para reinvertir automáticamente
- Maximizar tus ganancias a largo plazo

💡 **Tip**: Cuanto más largo sea tu período de lockup, mayores serán tus recompensas por hora."

REGLAS DE CONTENIDO:
• Usa ÚNICAMENTE información del contexto proporcionado
• Sé preciso con números, porcentajes y datos técnicos
• Si el contexto no tiene la información, di "No tengo información específica sobre eso"
• NO inventes datos que no están en el contexto
• Menciona términos técnicos cuando sea apropiado pero explícalos brevemente

ESTILO DE COMUNICACIÓN:
• Natural y conversacional
• Profesional pero amigable
• Usa emojis ocasionalmente para hacer las respuestas más visuales (💡, 📊, ✅, ⚠️)
• Estructura las respuestas para fácil escaneo visual
• No saludes en cada respuesta a menos que sea el primer mensaje
${relevantContext.context ? `

CONTEXTO DE LA BASE DE CONOCIMIENTOS (SCORE: ${relevantContext.score?.toFixed(3) || 'N/A'}):
${relevantContext.context}

INSTRUCCIÓN CRÍTICA: Usa este contexto como fuente única de verdad. No agregues información externa.
` : ''}

RECORDATORIO FINAL: Usa markdown rico con negritas, listas, tablas y emojis para hacer las respuestas visualmente atractivas y fáciles de leer.`;
    
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
      // ✅ FIX: chunk.text es una PROPIEDAD, no un método
      // Extraer el texto del chunk correctamente según la API de Gemini
      const chunkText = chunk.text || chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!chunkText) {
        console.warn('⚠️ Empty chunk received, skipping...');
        continue;
      }
      
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