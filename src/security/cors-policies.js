// CORS Security Policies for Nuxchain Application
// Este archivo define las políticas de seguridad CORS para diferentes entornos

/**
 * Configuración de CORS para producción
 * Incluye dominios autorizados y headers permitidos
 */
export const productionCorsConfig = {
  origin: [
    'https://www.nuxchain.com',
    'https://nuxchain.com',
    'https://nuxchain-app.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-API-Key'
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Rate-Limit-Remaining'
  ],
  maxAge: 86400, // 24 horas
  optionsSuccessStatus: 200
};

/**
 * Configuración de CORS para desarrollo
 * Más permisiva para facilitar el desarrollo local
 */
export const developmentCorsConfig = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: '*',
  optionsSuccessStatus: 200
};

/**
 * Función para obtener la configuración CORS según el entorno
 * @param {string} environment - El entorno actual ('development' | 'production')
 * @returns {Object} Configuración CORS apropiada
 */
export const getCorsConfig = (environment = 'development') => {
  if (environment === 'production') {
    return productionCorsConfig;
  }
  return developmentCorsConfig;
};

/**
 * Middleware personalizado para validar origen
 * @param {string} origin - El origen de la petición
 * @param {Function} callback - Callback para continuar
 */
export const validateOrigin = (origin, callback) => {
  const allowedOrigins = [
    'https://www.nuxchain.com',
    'https://nuxchain.com',
    'https://nuxchain-app.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ];

  // Permitir requests sin origen (ej: aplicaciones móviles, Postman)
  if (!origin) return callback(null, true);

  if (allowedOrigins.includes(origin)) {
    callback(null, true);
  } else {
    console.warn(`CORS: Origen no autorizado: ${origin}`);
    callback(new Error('No autorizado por política CORS'), false);
  }
};

/**
 * Headers de seguridad adicionales
 */
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

/**
 * Middleware para aplicar headers de seguridad
 */
export const applySecurityHeaders = (req, res, next) => {
  Object.entries(securityHeaders).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
};