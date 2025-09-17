/**
 * Políticas de seguridad CORS para NuxChain App
 * Configuración optimizada para producción en Vercel
 */

// Dominios permitidos para producción
const PRODUCTION_DOMAINS = [
  'https://nuxchain-app.vercel.app',
  'https://nuxchain.com',
  'https://www.nuxchain.com',
  // Agregar aquí otros dominios de producción
];

// Dominios permitidos para desarrollo
const DEVELOPMENT_DOMAINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

/**
 * Obtiene la configuración CORS basada en el entorno
 * @param {string} environment - El entorno actual (development, production, test)
 * @returns {Object} Configuración CORS
 */
export function getCorsConfig(environment = 'development') {
  const baseConfig = {
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control',
      'X-API-Key',
      'X-Client-Version',
      'X-Request-ID'
    ],
    exposedHeaders: [
      'X-Total-Count',
      'X-Rate-Limit-Remaining',
      'X-Rate-Limit-Reset',
      'X-Request-ID'
    ],
    maxAge: 86400, // 24 horas
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        origin: (origin, callback) => {
          // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
          if (!origin) return callback(null, true);
          
          if (PRODUCTION_DOMAINS.includes(origin)) {
            return callback(null, true);
          }
          
          // Log de intentos de acceso no autorizados
          console.warn(`CORS: Origen no autorizado intentó acceder: ${origin}`);
          return callback(new Error('No permitido por política CORS'), false);
        },
        preflightContinue: false,
      };

    case 'development':
      return {
        ...baseConfig,
        origin: (origin, callback) => {
          // En desarrollo, ser más permisivo pero aún seguro
          if (!origin) return callback(null, true);
          
          if (DEVELOPMENT_DOMAINS.includes(origin) || 
              origin.startsWith('http://localhost:') ||
              origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
          }
          
          console.warn(`CORS Dev: Origen no autorizado: ${origin}`);
          return callback(new Error('No permitido por política CORS en desarrollo'), false);
        },
      };

    case 'test':
      return {
        ...baseConfig,
        origin: true, // Permitir todos los orígenes en tests
      };

    default:
      return {
        ...baseConfig,
        origin: false, // Bloquear todos por defecto
      };
  }
}

/**
 * Middleware de headers de seguridad adicionales
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export function applySecurityHeaders(req, res, next) {
  // Prevenir ataques XSS
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Política de referrer estricta
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy para APIs
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https: wss: ws:; " +
    "frame-ancestors 'none';"
  );
  
  // Strict Transport Security (solo en HTTPS)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
  );
  
  // Rate limiting headers (se configurarán en el middleware de rate limiting)
  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Window', '900'); // 15 minutos
  
  next();
}

/**
 * Middleware específico para WebSocket CORS
 * @param {Object} origin - Origen de la conexión WebSocket
 * @param {Function} callback - Callback function
 */
export function websocketCorsCheck(origin, callback) {
  const environment = process.env.NODE_ENV || 'development';
  
  if (environment === 'production') {
    if (!origin || !PRODUCTION_DOMAINS.includes(origin)) {
      console.warn(`WebSocket CORS: Origen no autorizado: ${origin}`);
      return callback(new Error('No autorizado'), false);
    }
  } else if (environment === 'development') {
    if (origin && !DEVELOPMENT_DOMAINS.includes(origin) && 
        !origin.startsWith('http://localhost:') &&
        !origin.startsWith('http://127.0.0.1:')) {
      console.warn(`WebSocket CORS Dev: Origen no autorizado: ${origin}`);
      return callback(new Error('No autorizado'), false);
    }
  }
  
  callback(null, true);
}

/**
 * Configuración de rate limiting por IP
 */
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana de tiempo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    retryAfter: '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Función personalizada para generar la clave de rate limiting
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
  // Función para manejar cuando se excede el límite
  handler: (req, res) => {
    console.warn(`Rate limit excedido para IP: ${req.ip}`);
    res.status(429).json({
      error: 'Demasiadas solicitudes',
      message: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
      retryAfter: Math.ceil(rateLimitConfig.windowMs / 1000)
    });
  }
};

/**
 * Lista de IPs bloqueadas (se puede expandir con una base de datos)
 */
export const blockedIPs = new Set([
  // Agregar IPs problemáticas aquí
]);

/**
 * Middleware para bloquear IPs específicas
 */
export function ipBlockingMiddleware(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  if (blockedIPs.has(clientIP)) {
    console.warn(`IP bloqueada intentó acceder: ${clientIP}`);
    return res.status(403).json({
      error: 'Acceso denegado',
      message: 'Tu IP ha sido bloqueada debido a actividad sospechosa.'
    });
  }
  
  next();
}

export default {
  getCorsConfig,
  applySecurityHeaders,
  websocketCorsCheck,
  rateLimitConfig,
  ipBlockingMiddleware
};