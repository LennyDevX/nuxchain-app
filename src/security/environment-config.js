/**
 * Configuración de Environment Segura - NuxChain App
 * Validaciones y configuraciones de seguridad para producción
 */

import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Valida que las variables de entorno requeridas estén presentes
 */
function validateRequiredEnvVars() {
  const required = [
    'GEMINI_API_KEY',
    'SERVER_API_KEY'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Variables de entorno requeridas faltantes: ${missing.join(', ')}`);
  }
}

/**
 * Valida la configuración de Google Service Account
 */
function validateGoogleServiceAccount() {
  const requiredGoogleVars = [
    'GOOGLE_SERVICE_ACCOUNT_PROJECT_ID',
    'GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY',
    'GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL'
  ];
  
  const missingGoogle = requiredGoogleVars.filter(key => !process.env[key]);
  
  if (missingGoogle.length > 0) {
    console.warn(`Variables de Google Service Account faltantes: ${missingGoogle.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Sanitiza y valida las variables de entorno
 */
function sanitizeEnvVar(value, type = 'string') {
  if (!value) return null;
  
  switch (type) {
    case 'number':
      const num = parseInt(value);
      return isNaN(num) ? null : num;
    case 'boolean':
      return value.toLowerCase() === 'true';
    case 'url':
      try {
        new URL(value);
        return value;
      } catch {
        return null;
      }
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? value : null;
    default:
      return value.trim();
  }
}

/**
 * Configuración de seguridad por entorno
 */
const securityConfig = {
  development: {
    allowInsecureConnections: true,
    logLevel: 'debug',
    enableDetailedErrors: true,
    rateLimitStrict: false,
    corsStrict: false
  },
  production: {
    allowInsecureConnections: false,
    logLevel: 'error',
    enableDetailedErrors: false,
    rateLimitStrict: true,
    corsStrict: true,
    requireHttps: true,
    enableSecurityHeaders: true
  },
  test: {
    allowInsecureConnections: true,
    logLevel: 'silent',
    enableDetailedErrors: true,
    rateLimitStrict: false,
    corsStrict: false
  }
};

/**
 * Configuración de rate limiting por entorno
 */
const rateLimitConfig = {
  development: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 1000, // Más permisivo en desarrollo
    skipSuccessfulRequests: true
  },
  production: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Más estricto en producción
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  },
  test: {
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 10000, // Muy permisivo para tests
    skipSuccessfulRequests: true
  }
};

/**
 * Configuración principal
 */
class EnvironmentConfig {
  constructor() {
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.isProduction = this.nodeEnv === 'production';
    this.isDevelopment = this.nodeEnv === 'development';
    this.isTest = this.nodeEnv === 'test';
    
    // Validar variables requeridas en producción
    if (this.isProduction) {
      validateRequiredEnvVars();
    }
    
    this.initializeConfig();
  }
  
  initializeConfig() {
    // Configuración básica
    this.port = sanitizeEnvVar(process.env.PORT, 'number') || 3002;
    this.host = sanitizeEnvVar(process.env.HOST) || '0.0.0.0';
    
    // APIs y servicios
    this.geminiApiKey = sanitizeEnvVar(process.env.GEMINI_API_KEY);
    this.serverApiKey = sanitizeEnvVar(process.env.SERVER_API_KEY);
    
    // Vercel detection
    this.isVercel = process.env.VERCEL === '1' || 
                   process.env.VERCEL_ENV !== undefined || 
                   process.env.VERCEL_URL !== undefined;
    
    // URLs y dominios
    this.frontendUrl = sanitizeEnvVar(process.env.FRONTEND_URL, 'url') || 
                      (this.isProduction ? 'https://nuxchain-app.vercel.app' : 'http://localhost:5173');
    
    this.apiUrl = sanitizeEnvVar(process.env.API_URL, 'url') || 
                 (this.isProduction ? 'https://nuxchain-app.vercel.app/api' : 'http://localhost:3002/server');
    
    // Google Service Account
    this.googleServiceAccount = this.initializeGoogleConfig();
    
    // Configuración de seguridad
    this.security = securityConfig[this.nodeEnv] || securityConfig.development;
    
    // Rate limiting
    this.rateLimit = rateLimitConfig[this.nodeEnv] || rateLimitConfig.development;
    
    // Configuración de base de datos (si aplica)
    this.database = this.initializeDatabaseConfig();
    
    // Configuración de logging
    this.logging = this.initializeLoggingConfig();
    
    // Configuración de caché
    this.cache = this.initializeCacheConfig();
    
    // Configuración de WebSocket
    this.websocket = this.initializeWebSocketConfig();
  }
  
  initializeGoogleConfig() {
    const hasValidConfig = validateGoogleServiceAccount();
    
    if (!hasValidConfig) {
      return null;
    }
    
    return {
      projectId: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID),
      privateKeyId: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID),
      privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL, 'email'),
      clientId: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID),
      authUri: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI, 'url'),
      tokenUri: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI, 'url'),
      authProviderX509CertUrl: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL, 'url'),
      clientX509CertUrl: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL, 'url'),
      universeDomain: sanitizeEnvVar(process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN) || 'googleapis.com'
    };
  }
  
  initializeDatabaseConfig() {
    return {
      url: sanitizeEnvVar(process.env.DATABASE_URL, 'url'),
      maxConnections: sanitizeEnvVar(process.env.DB_MAX_CONNECTIONS, 'number') || 10,
      timeout: sanitizeEnvVar(process.env.DB_TIMEOUT, 'number') || 30000,
      ssl: this.isProduction ? true : sanitizeEnvVar(process.env.DB_SSL, 'boolean')
    };
  }
  
  initializeLoggingConfig() {
    return {
      level: this.security.logLevel,
      enableConsole: sanitizeEnvVar(process.env.LOG_CONSOLE, 'boolean') ?? true,
      enableFile: sanitizeEnvVar(process.env.LOG_FILE, 'boolean') ?? this.isProduction,
      maxFileSize: sanitizeEnvVar(process.env.LOG_MAX_SIZE, 'number') || 10485760, // 10MB
      maxFiles: sanitizeEnvVar(process.env.LOG_MAX_FILES, 'number') || 5
    };
  }
  
  initializeCacheConfig() {
    return {
      enabled: sanitizeEnvVar(process.env.CACHE_ENABLED, 'boolean') ?? true,
      ttl: sanitizeEnvVar(process.env.CACHE_TTL, 'number') || 3600, // 1 hora
      maxSize: sanitizeEnvVar(process.env.CACHE_MAX_SIZE, 'number') || 100, // 100 items
      redisUrl: sanitizeEnvVar(process.env.REDIS_URL, 'url')
    };
  }
  
  initializeWebSocketConfig() {
    return {
      enabled: sanitizeEnvVar(process.env.WEBSOCKET_ENABLED, 'boolean') ?? !this.isVercel,
      port: sanitizeEnvVar(process.env.WEBSOCKET_PORT, 'number') || (this.port + 1),
      maxConnections: sanitizeEnvVar(process.env.WEBSOCKET_MAX_CONNECTIONS, 'number') || 100,
      heartbeatInterval: sanitizeEnvVar(process.env.WEBSOCKET_HEARTBEAT, 'number') || 30000
    };
  }
  
  /**
   * Valida la configuración completa
   */
  validate() {
    const errors = [];
    
    if (!this.geminiApiKey) {
      errors.push('GEMINI_API_KEY es requerida');
    }
    
    if (!this.serverApiKey) {
      errors.push('SERVER_API_KEY es requerida');
    }
    
    if (this.isProduction && !this.frontendUrl.startsWith('https://')) {
      errors.push('FRONTEND_URL debe usar HTTPS en producción');
    }
    
    if (this.isProduction && !this.apiUrl.startsWith('https://')) {
      errors.push('API_URL debe usar HTTPS en producción');
    }
    
    if (errors.length > 0) {
      throw new Error(`Errores de configuración: ${errors.join(', ')}`);
    }
    
    return true;
  }
  
  /**
   * Obtiene información de configuración para logging (sin secretos)
   */
  getPublicConfig() {
    return {
      nodeEnv: this.nodeEnv,
      isProduction: this.isProduction,
      isDevelopment: this.isDevelopment,
      isVercel: this.isVercel,
      port: this.port,
      host: this.host,
      frontendUrl: this.frontendUrl,
      apiUrl: this.apiUrl,
      security: this.security,
      rateLimit: {
        ...this.rateLimit,
        windowMs: `${this.rateLimit.windowMs / 1000}s`
      },
      websocket: {
        enabled: this.websocket.enabled,
        maxConnections: this.websocket.maxConnections
      },
      cache: {
        enabled: this.cache.enabled,
        ttl: `${this.cache.ttl}s`
      }
    };
  }
}

// Crear instancia singleton
const environmentConfig = new EnvironmentConfig();

// Validar configuración al inicializar
try {
  environmentConfig.validate();
  console.log('✅ Configuración de environment validada correctamente');
} catch (error) {
  console.error('❌ Error en configuración de environment:', error.message);
  if (environmentConfig.isProduction) {
    process.exit(1);
  }
}

export default environmentConfig;