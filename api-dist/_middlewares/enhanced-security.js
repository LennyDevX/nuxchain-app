/**
 * ✅ Enhanced Security Middleware - NuxChain App
 * Production-ready security with proper CORS, rate limiting, and attack detection
 */
// ============================================================================
// CONFIGURATION
// ============================================================================
const securityConfig = {
    enableRateLimit: true,
    enableApiKeyValidation: process.env.NODE_ENV === 'production',
    enableCors: true,
    strictMode: process.env.NODE_ENV === 'production'
};
// In-memory rate limit store (use Vercel KV in production for better performance)
const rateLimitStore = new Map();
// ============================================================================
// CORS CONFIGURATION
// ============================================================================
function getAllowedOrigins() {
    if (process.env.NODE_ENV === 'production') {
        const envOrigins = process.env.ALLOWED_ORIGINS;
        if (envOrigins) {
            return envOrigins.split(',').map(o => o.trim());
        }
        return [
            'https://nuxchain-app.vercel.app',
            'https://nuxchain.com',
            'https://www.nuxchain.com'
        ];
    }
    return [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:4173',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
    ];
}
function getCorsHeaders(origin) {
    const allowedOrigins = getAllowedOrigins();
    // In production, validate origin
    let allowOrigin;
    if (process.env.NODE_ENV === 'production') {
        allowOrigin = origin && allowedOrigins.includes(origin)
            ? origin
            : allowedOrigins[0];
    }
    else {
        // In development, allow all
        allowOrigin = origin || '*';
    }
    return {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-Requested-With, X-Client-Version',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin'
    };
}
// ============================================================================
// SECURITY HEADERS
// ============================================================================
function getSecurityHeaders() {
    const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    };
    // Add HSTS only in production
    if (process.env.NODE_ENV === 'production') {
        headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
    }
    return headers;
}
// ============================================================================
// RATE LIMITING
// ============================================================================
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    return ((typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : '') ||
        (typeof realIP === 'string' ? realIP : '') ||
        req.socket?.remoteAddress ||
        'unknown');
}
function checkRateLimit(req) {
    if (!securityConfig.enableRateLimit) {
        return { allowed: true, remaining: 999 };
    }
    const ip = getClientIP(req);
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100; // 100 requests per minute
    // Clean up old entries
    if (rateLimitStore.size > 10000) {
        const cutoff = now - windowMs * 2;
        for (const [key, record] of rateLimitStore.entries()) {
            if (record.resetTime < cutoff) {
                rateLimitStore.delete(key);
            }
        }
    }
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
            resetAt: record.resetTime
        };
    }
    record.count++;
    return {
        allowed: true,
        remaining: maxRequests - record.count
    };
}
// ============================================================================
// ATTACK DETECTION
// ============================================================================
function detectAttack(req) {
    // Enhanced attack patterns
    const suspiciousPatterns = [
        // XSS Protection
        /<script[\s\S]*?>/gi,
        /javascript:/gi,
        /on\w+\s*=\s*["'][^"']*["']/gi,
        /<iframe[\s\S]*?>/gi,
        // SQL Injection
        /(\bUNION\s+(ALL\s+)?SELECT\b)/gi,
        /(\bSELECT\s+.+\s+FROM\b)/gi,
        /(\bINSERT\s+INTO\b)/gi,
        /(\bDELETE\s+FROM\b)/gi,
        /(\bDROP\s+(TABLE|DATABASE)\b)/gi,
        /(\bEXEC(\s+|\())/gi,
        /(;|--|\*\/)/g,
        // Path Traversal
        /(\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e\/|\.\.%2f)/gi,
        // Command Injection
        /(\||;|`|\$\()/g,
        /(eval\(|exec\(|system\(|passthru\(|shell_exec\()/gi,
        // NoSQL Injection
        /(\$ne\b|\$gt\b|\$lt\b|\$regex\b|\$where\b)/gi,
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
    // Validate payload size
    const contentLengthHeader = req.headers['content-length'];
    const contentLength = parseInt(typeof contentLengthHeader === 'string' ? contentLengthHeader : '0');
    if (contentLength > 2 * 1024 * 1024) { // 2MB
        return {
            valid: false,
            error: 'Payload too large (max 2MB)'
        };
    }
    // Validate User-Agent
    const userAgentHeader = req.headers['user-agent'];
    const userAgent = typeof userAgentHeader === 'string' ? userAgentHeader : '';
    if (!userAgent || userAgent.length > 500) {
        return {
            valid: false,
            error: 'Invalid User-Agent'
        };
    }
    // Validate Content-Type for POST/PUT requests
    if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
        const contentType = req.headers['content-type'];
        if (contentType) {
            const allowedTypes = [
                'application/json',
                'application/x-www-form-urlencoded',
                'multipart/form-data',
                'text/plain'
            ];
            const isAllowed = allowedTypes.some(type => typeof contentType === 'string' && contentType.includes(type));
            if (!isAllowed) {
                return {
                    valid: false,
                    error: 'Unsupported Content-Type'
                };
            }
        }
    }
    return { valid: true };
}
// ============================================================================
// API KEY VALIDATION
// ============================================================================
function isPublicRoute(url) {
    const publicRoutes = [
        '/api/health',
        '/api/status',
    ];
    return publicRoutes.some(route => url.includes(route));
}
function validateApiKey(req) {
    const apiKey = req.headers['x-api-key'];
    const validKey = process.env.SERVER_API_KEY;
    if (!validKey || validKey === 'dev-api-key-nuxchain-2024') {
        // Development mode or no key configured
        return true;
    }
    if (!apiKey || typeof apiKey !== 'string') {
        return false;
    }
    // Simple comparison (use crypto.timingSafeEqual in production for timing attack protection)
    return apiKey === validKey;
}
// ============================================================================
// MAIN SECURITY WRAPPER
// ============================================================================
export function withEnhancedSecurity(handler) {
    return async (req, res) => {
        try {
            // 1. Apply headers
            const origin = typeof req.headers.origin === 'string' ? req.headers.origin : undefined;
            const corsHeaders = getCorsHeaders(origin);
            const securityHeaders = getSecurityHeaders();
            Object.entries({ ...corsHeaders, ...securityHeaders }).forEach(([key, value]) => {
                res.setHeader(key, value);
            });
            // 2. Handle preflight OPTIONS
            if (req.method === 'OPTIONS') {
                return res.status(204).end();
            }
            // 3. Rate limiting
            const rateLimit = checkRateLimit(req);
            res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
            if (!rateLimit.allowed && rateLimit.resetAt) {
                const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
                res.setHeader('Retry-After', String(retryAfter));
                return res.status(429).json({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    retryAfter
                });
            }
            // 4. Input validation
            const inputValidation = validateInput(req);
            if (!inputValidation.valid) {
                return res.status(400).json({
                    error: 'Bad Request',
                    message: inputValidation.error
                });
            }
            // 5. Attack detection
            if (securityConfig.strictMode) {
                const attackDetection = detectAttack(req);
                if (attackDetection.detected) {
                    console.warn(`⚠️ Attack detected from ${getClientIP(req)}: ${attackDetection.pattern}`);
                    return res.status(400).json({
                        error: 'Bad Request',
                        message: 'Invalid request content detected'
                    });
                }
            }
            // 6. API Key validation (if enabled and not public route)
            if (securityConfig.enableApiKeyValidation) {
                const isPublic = isPublicRoute(req.url || '');
                if (!isPublic && !validateApiKey(req)) {
                    return res.status(401).json({
                        error: 'Unauthorized',
                        message: 'Valid API key required'
                    });
                }
            }
            // 7. Execute handler with timeout
            const timeout = setTimeout(() => {
                if (!res.headersSent) {
                    res.status(408).json({
                        error: 'Request Timeout',
                        message: 'The request took too long to process'
                    });
                }
            }, 25000); // 25 seconds (Vercel limit is 30s)
            const result = await handler(req, res);
            clearTimeout(timeout);
            return result;
        }
        catch (error) {
            console.error('❌ Security middleware error:', error);
            if (!res.headersSent) {
                const isDev = process.env.NODE_ENV === 'development';
                return res.status(500).json({
                    error: 'Internal Server Error',
                    ...(isDev && error instanceof Error && { message: error.message })
                });
            }
        }
    };
}
// ============================================================================
// EXPORTS
// ============================================================================
export default {
    withEnhancedSecurity,
    getCorsHeaders,
    getSecurityHeaders,
    checkRateLimit,
    detectAttack,
    validateInput,
    validateApiKey
};
