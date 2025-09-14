// Configuración de API para diferentes entornos

// Detectar el entorno actual
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production' || import.meta.env.NODE_ENV === 'production';

// Detectar si estamos en localhost (siempre desarrollo)
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname === '0.0.0.0');

// Forzar producción si estamos en el dominio de producción
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'www.nuxchain.com' || 
   window.location.hostname === 'nuxchain.com' ||
   window.location.hostname.includes('vercel.app'));

// Lógica de detección: localhost siempre desarrollo, dominios de producción siempre producción
const shouldUseProduction = !isLocalhost && (isProduction || isProductionDomain);

// URLs del servidor según el entorno
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
    serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3002/server'
  },
  production: {
    // En producción, usar las variables de entorno específicas de producción
    baseURL: import.meta.env.VITE_PROD_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'https://www.nuxchain.com',
    serverURL: import.meta.env.VITE_PROD_SERVER_URL || import.meta.env.VITE_SERVER_URL || 'https://www.nuxchain.com/server'
  }
};

// Obtener la configuración actual
const getCurrentConfig = () => {
  if (shouldUseProduction) {
    return API_CONFIG.production;
  }
  return API_CONFIG.development;
};

// Exportar la configuración
export const apiConfig = getCurrentConfig();

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  gemini: {
    generate: `${apiConfig.serverURL}/gemini`,
    stream: `${apiConfig.serverURL}/gemini/stream`,
    analyze: `${apiConfig.serverURL}/gemini/analyze`,
    compare: `${apiConfig.serverURL}/gemini/compare`,
    functionCalling: `${apiConfig.serverURL}/gemini/function-calling`,
    extractUrl: `${apiConfig.serverURL}/gemini/extract-url`,
    extractMultipleUrls: `${apiConfig.serverURL}/gemini/extract-multiple-urls`,
    validateUrl: `${apiConfig.serverURL}/gemini/validate-url`,
    // New endpoints for URL Context
    urlContext: `${apiConfig.serverURL}/gemini/url-context`,
    chatWithTools: `${apiConfig.serverURL}/gemini/chat-with-tools`,
    streamWithTools: `${apiConfig.serverURL}/gemini/stream-with-tools`,
    embeddings: {
      index: `${apiConfig.serverURL}/gemini/embeddings/index`,
      search: `${apiConfig.serverURL}/gemini/embeddings/search`,
      clear: `${apiConfig.serverURL}/gemini/embeddings/index`
    },
    batch: {
      generate: `${apiConfig.serverURL}/gemini/batch/generate`,
      embeddings: `${apiConfig.serverURL}/gemini/batch/embeddings`,
      analyze: `${apiConfig.serverURL}/gemini/batch/analyze`,
      status: `${apiConfig.serverURL}/gemini/batch/status`,
      active: `${apiConfig.serverURL}/gemini/batch/active`,
      cancel: `${apiConfig.serverURL}/gemini/batch`,
      stats: `${apiConfig.serverURL}/gemini/batch/stats`
    },
    analytics: {
      metrics: `${apiConfig.serverURL}/gemini/analytics/metrics`,
      realtime: `${apiConfig.serverURL}/gemini/analytics/realtime`,
      insights: `${apiConfig.serverURL}/gemini/analytics/insights`,
      stream: `${apiConfig.serverURL}/gemini/analytics/stream`,
      export: `${apiConfig.serverURL}/gemini/analytics/export`,
      reset: `${apiConfig.serverURL}/gemini/analytics/reset`
    },
    cache: `${apiConfig.serverURL}/gemini/cache`,
    models: `${apiConfig.serverURL}/gemini/models`,
    stats: `${apiConfig.serverURL}/gemini/stats`,
    contextCache: `${apiConfig.serverURL}/gemini/context-cache/stats`
  }
};

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint: string) => {
  return `${apiConfig.serverURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Log de configuración (temporal para debug en producción)
console.log('🔧 API Configuration:', {
  environment: shouldUseProduction ? 'production' : 'development',
  baseURL: apiConfig.baseURL,
  serverURL: apiConfig.serverURL,
  detection: {
    isDevelopment,
    isProduction,
    isLocalhost,
    isProductionDomain,
    shouldUseProduction,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side'
  },
  envVars: {
    VITE_PROD_API_BASE_URL: import.meta.env.VITE_PROD_API_BASE_URL,
    VITE_PROD_SERVER_URL: import.meta.env.VITE_PROD_SERVER_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_SERVER_URL: import.meta.env.VITE_SERVER_URL,
    VITE_NODE_ENV: import.meta.env.VITE_NODE_ENV,
    NODE_ENV: import.meta.env.NODE_ENV,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  }
});