// Configuración de API para diferentes entornos

// Detectar el entorno actual
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_NODE_ENV === 'development';
// Remove unused isProduction variable since it's not referenced anywhere

// URLs del servidor según el entorno
const API_CONFIG = {
  development: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
    serverURL: import.meta.env.VITE_SERVER_URL || 'http://localhost:3002/server'
  },
  production: {
    // En producción, usar la URL actual del dominio o variables de entorno
    baseURL: import.meta.env.VITE_API_BASE_URL || window.location.origin,
    serverURL: import.meta.env.VITE_SERVER_URL || `${window.location.origin}/server`
  }
};

// Obtener la configuración actual
const getCurrentConfig = () => {
  if (isDevelopment) {
    return API_CONFIG.development;
  }
  return API_CONFIG.production;
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

// Log de configuración (solo en desarrollo)
if (isDevelopment) {
  console.log('🔧 API Configuration:', {
    environment: isDevelopment ? 'development' : 'production',
    baseURL: apiConfig.baseURL,
    serverURL: apiConfig.serverURL
  });
}