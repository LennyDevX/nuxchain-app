/**
 * ✅ TypeScript Migration: Serverless Security Middleware
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
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];
    const ip = (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0]?.trim() : '') ||
        (typeof realIp === 'string' ? realIp : '') ||
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
// ============================================================================
// ATTACK DETECTION
// ============================================================================
function detectAttack(req) {
    // Patrones más específicos para evitar falsos positivos
    const suspiciousPatterns = [
        /(<script>|<\/script>)/gi, // Script tags
        /(\bUNION\s+SELECT\b|\bSELECT\s+.*\s+FROM\b|\bINSERT\s+INTO\b|\bDELETE\s+FROM\b|\bDROP\s+TABLE\b)/gi, // SQL injection específicos
        /(\.\.\/|\.\.\\)/g, // Path traversal
        /(\$\{|<%|%>)/g, // Template injection
        /(eval\(|exec\(|system\(|passthru\()/gi // Code execution
    ];
    // SOLUCIÓN Falsos Positivos: No pasar campos gigantes como fingerprint o base64 por los patrones
    // Extraemos solo los campos de texto normales para validación de inyección
    const body = req.body || {};
    const textFieldsToCheck = {
        name: body.name,
        email: body.email,
        wallet: body.wallet,
        message: body.message,
        subject: body.subject
    };
    const checkString = JSON.stringify(textFieldsToCheck) +
        (req.url || '') +
        JSON.stringify(req.query || {});
    for (const pattern of suspiciousPatterns) {
        if (pattern.test(checkString)) {
            console.warn(`⚠️ Pattern detected: ${pattern.toString()}`);
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
    const contentLengthHeader = req.headers['content-length'];
    const contentLength = parseInt(typeof contentLengthHeader === 'string' ? contentLengthHeader : '0');
    if (contentLength > 2 * 1024 * 1024) { // 2MB
        return {
            valid: false,
            error: 'Payload demasiado grande (máximo 2MB)'
        };
    }
    // Validar User-Agent
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = typeof userAgentHeader === 'string' ? userAgentHeader : '';
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
                res.setHeader('Retry-After', String(rateLimitResult.retryAfter));
                return res.status(429).json({
                    error: 'Demasiadas solicitudes',
                    retryAfter: rateLimitResult.retryAfter
                });
            }
            // Agregar headers de rate limit
            res.setHeader('X-RateLimit-Remaining', String(rateLimitResult.remaining));
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
        }
        catch (error) {
            console.error('❌ Error en withSecurity:', error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            const errorStack = error instanceof Error ? error.stack : undefined;
            if (!res.headersSent) {
                const isDev = process.env.NODE_ENV === 'development';
                res.status(500).json({
                    error: 'Error interno del servidor',
                    message: isDev ? errorMessage : 'Error interno',
                    ...(isDev && errorStack && { stack: errorStack })
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
