import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('DEBUG: GEMINI_API_KEY en environment.js:', process.env.GEMINI_API_KEY);

// Validar variables de entorno críticas
function validateEnvironment() {
  const requiredVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
  };
  
  const missing = [];
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    const errorMsg = `Variables de entorno faltantes: ${missing.join(', ')}`;
    if (isProduction) {
      console.error(`❌ ERROR DE CONFIGURACIÓN: ${errorMsg}`);
      console.error('En producción (Vercel), configura estas variables en el dashboard de tu plataforma.');
    } else {
      console.warn(`⚠️  ADVERTENCIA: ${errorMsg}`);
      console.warn('Asegúrate de tener un archivo .env con estas variables configuradas.');
    }
  }
  
  return missing.length === 0;
}

// Ejecutar validación
const isValid = validateEnvironment();

export default {
  port: process.env.PORT || 3002,
  geminiApiKey: process.env.GEMINI_API_KEY,
  serverApiKey: process.env.SERVER_API_KEY,
  isVercel: process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.VERCEL_URL !== undefined,
  nodeEnv: process.env.NODE_ENV || 'development',
  isEnvironmentValid: isValid,
  
  // Google Service Account Configuration
  googleServiceAccount: {
    projectId: process.env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID,
    privateKeyId: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL,
    clientId: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID,
    authUri: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI,
    tokenUri: process.env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI,
    authProviderX509CertUrl: process.env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    clientX509CertUrl: process.env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universeDomain: process.env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN
  },
  

};
