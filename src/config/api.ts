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
   window.location.hostname.includes('vercel.app') ||
   window.location.hostname.includes('nuxchain.com'));

// Detectar si estamos en un deployment de Vercel
// Removing unused variable declaration
  window.location.hostname.includes('vercel.app');

// Forzar desarrollo si estamos accediendo desde cualquier dominio pero hay un servidor local
// Esto permite que la app funcione en desarrollo incluso cuando se accede desde dominios de producción
const forceDevMode = import.meta.env.VITE_FORCE_DEV === 'true';

// Lógica de detección: usar desarrollo si estamos en localhost, en modo forzado, o si no es explícitamente producción
const shouldUseProduction = !forceDevMode && !isLocalhost && (isProduction || isProductionDomain);

// URLs del servidor según el entorno
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
    serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3002/server'
  },
  production: {
    // En producción, usar rutas absolutas para serverless functions
    baseURL: import.meta.env.VITE_PROD_API_BASE_URL || '/api',
    serverURL: import.meta.env.VITE_PROD_SERVER_URL || '/api/server/gemini.js'
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

// Función helper para construir URLs de API
export const buildApiUrl = (endpoint: string) => {
  if (shouldUseProduction) {
    // En producción (Vercel), usar rutas directas que coincidan con los rewrites
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `/server${path}`;
  }
  // En desarrollo, usar la URL normal
  return `${apiConfig.serverURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// URLs específicas para diferentes servicios
export const API_ENDPOINTS = {
  gemini: {
    generate: buildApiUrl('/gemini'),
    stream: buildApiUrl('/gemini/stream'),
    analyze: buildApiUrl('/gemini/analyze'),
    compare: buildApiUrl('/gemini/compare'),
    functionCalling: buildApiUrl('/gemini/function-calling'),
    extractUrl: buildApiUrl('/gemini/extract-url'),
    extractMultipleUrls: buildApiUrl('/gemini/extract-multiple-urls'),
    validateUrl: buildApiUrl('/gemini/validate-url'),
    // New endpoints for URL Context
    urlContext: buildApiUrl('/gemini/url-context'),
    chatWithTools: buildApiUrl('/gemini/chat-with-tools'),
    streamWithTools: buildApiUrl('/gemini/stream-with-tools'),
    embeddings: {
      index: buildApiUrl('/gemini/embeddings/index'),
      search: buildApiUrl('/gemini/embeddings/search'),
      clear: buildApiUrl('/gemini/embeddings/index')
    },
    batch: {
      generate: buildApiUrl('/gemini/batch/generate'),
      embeddings: buildApiUrl('/gemini/batch/embeddings'),
      analyze: buildApiUrl('/gemini/batch/analyze'),
      status: buildApiUrl('/gemini/batch/status'),
      active: buildApiUrl('/gemini/batch/active'),
      cancel: buildApiUrl('/gemini/batch'),
      stats: buildApiUrl('/gemini/batch/stats')
    },
    analytics: {
      metrics: buildApiUrl('/gemini/analytics/metrics'),
      realtime: buildApiUrl('/gemini/analytics/realtime'),
      insights: buildApiUrl('/gemini/analytics/insights'),
      stream: buildApiUrl('/gemini/analytics/stream'),
      export: buildApiUrl('/gemini/analytics/export'),
      reset: buildApiUrl('/gemini/analytics/reset')
    },
    cache: buildApiUrl('/gemini/cache'),
    models: buildApiUrl('/gemini/models'),
    stats: buildApiUrl('/gemini/stats'),
    contextCache: buildApiUrl('/gemini/context-cache/stats')
  }
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