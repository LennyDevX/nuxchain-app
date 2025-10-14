/**
 * Seguridad para Funciones Serverless - NuxChain App (Vercel Compatible)
 * Versión ligera optimizada para api/ serverless
 */

// ============================================================================
// CORS CONFIGURATION
// ============================================================================
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// ============================================================================
// SECURITY HEADERS
// ============================================================================
function applySecurityHeaders(res) {
  // CORS
  Object.entries(CORS_HEADERS).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
}

// ============================================================================
// RATE LIMITING (Simple in-memory)
// ============================================================================
const rateLimitStore = new Map();

function checkRateLimit(req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 
             req.headers['x-real-ip'] || 
             'unknown';
  
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 100; // 100 requests por minuto
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const record = rateLimitStore.get(ip);
  
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  if (record.count >= maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000) 
    };
  }
  
  record.count++;
  return { allowed: true, remaining: maxRequests - record.count };
}

// Cleanup viejo cada 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(ip);
    }
  }
}, 300000);

// ============================================================================
// ATTACK DETECTION
// ============================================================================
function detectAttack(req) {
  const suspiciousPatterns = [
    /(\<script\>|\<\/script\>)/gi,
    /(union|select|insert|delete|update|drop|create|alter)/gi,
    /(\.\.\/|\.\.\\)/g,
    /(\${|<%|%>)/g,
    /(eval\(|exec\(|system\()/gi
  ];
  
  const checkString = JSON.stringify(req.body || {}) + 
                     (req.url || '') + 
                     JSON.stringify(req.query || {});
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      return {
        detected: true,
        pattern: pattern.toString()
      };
    }
  }
  
  return { detected: false };
}

// ============================================================================
// INPUT VALIDATION
// ============================================================================
function validateInput(req) {
  // Validar tamaño del body
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 2 * 1024 * 1024) { // 2MB
    return {
      valid: false,
      error: 'Payload demasiado grande (máximo 2MB)'
    };
  }
  
  // Validar User-Agent
  const userAgent = req.headers['user-agent'];
  if (!userAgent || userAgent.length > 500) {
    return {
      valid: false,
      error: 'User-Agent inválido'
    };
  }
  
  return { valid: true };
}

// ============================================================================
// WRAPPER PRINCIPAL
// ============================================================================
export function withSecurity(handler) {
  return async (req, res) => {
    try {
      // 1. Aplicar headers de seguridad
      applySecurityHeaders(res);
      
      // 2. Manejar preflight OPTIONS
      if (req.method === 'OPTIONS') {
        return res.status(200).end();
      }
      
      // 3. Rate limiting
      const rateLimitResult = checkRateLimit(req);
      if (!rateLimitResult.allowed) {
        res.setHeader('Retry-After', rateLimitResult.retryAfter);
        return res.status(429).json({
          error: 'Demasiadas solicitudes',
          retryAfter: rateLimitResult.retryAfter
        });
      }
      
      // Agregar headers de rate limit
      res.setHeader('X-RateLimit-Remaining', rateLimitResult.remaining);
      
      // 4. Validación de input
      const inputValidation = validateInput(req);
      if (!inputValidation.valid) {
        return res.status(400).json({
          error: 'Validación fallida',
          message: inputValidation.error
        });
      }
      
      // 5. Detección de ataques
      const attackDetection = detectAttack(req);
      if (attackDetection.detected) {
        console.error(`⚠️ Ataque detectado: ${attackDetection.pattern}`);
        return res.status(400).json({
          error: 'Solicitud maliciosa detectada',
          message: 'Tu solicitud contiene patrones sospechosos'
        });
      }
      
      // 6. Timeout de 25 segundos (Vercel límite: 30s)
      const timeoutId = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request Timeout',
            message: 'La solicitud tardó demasiado en procesarse'
          });
        }
      }, 25000);
      
      // 7. Ejecutar handler original
      const result = await handler(req, res);
      
      clearTimeout(timeoutId);
      return result;
      
    } catch (error) {
      console.error('❌ Error en withSecurity:', error);
      
      if (!res.headersSent) {
        const isDev = process.env.NODE_ENV === 'development';
        res.status(500).json({
          error: 'Error interno del servidor',
          message: isDev ? error.message : 'Error interno',
          ...(isDev && { stack: error.stack })
        });
      }
    }
  };
}

// ============================================================================
// EXPORTS
// ============================================================================
export default {
  withSecurity,
  applySecurityHeaders,
  checkRateLimit,
  detectAttack,
  validateInput
};
