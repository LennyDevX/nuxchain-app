// Configuración de API para diferentes entornos

// Detectar el entorno actual
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
const isProduction = import.meta.env.PROD || import.meta.env.VITE_NODE_ENV === 'production' || import.meta.env.NODE_ENV === 'production';

// Forzar producción si estamos en el dominio de producción
const isProductionDomain = typeof window !== 'undefined' && 
  (window.location.hostname === 'www.nuxchain.com' || 
   window.location.hostname === 'nuxchain.com' ||
   window.location.hostname.includes('vercel.app'));

const shouldUseProduction = isProduction || isProductionDomain;

// URLs del servidor según el entorno
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
    serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3002/server'
  },
  production: {
    // En producción, usar las variables de entorno específicas de producción
    baseURL: import.meta.env.VITE_PROD_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || window.location.origin,
    serverURL: import.meta.env.VITE_PROD_SERVER_URL || import.meta.env.VITE_SERVER_URL || `${window.location.origin}/server`
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
    stream: `${apiConfig.serverURL}/gemini/stream`,
    chat: `${apiConfig.serverURL}/gemini`,
    health: `${apiConfig.serverURL}/gemini/health`
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