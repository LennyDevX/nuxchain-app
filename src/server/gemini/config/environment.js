import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno críticas
function validateEnvironment() {
  const requiredVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY
  };
  
  const missing = [];
  const isProduction = process.env.NODE_ENV === 'production';
  
  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}`;
    if (isProduction) {
      console.error(`❌ ${errorMsg}`);
    }
  }
  
  return missing.length === 0;
}

// Ejecutar validación
const isValid = validateEnvironment();

// Detección de Vercel
const detectedVercel = (
  process.env.VERCEL === '1' ||
  process.env.VERCEL_ENV === 'production' ||
  (process.env.VERCEL_URL && process.env.NODE_ENV === 'production')
);

export default {
  port: process.env.PORT || 3002,
  geminiApiKey: process.env.GEMINI_API_KEY,
  serverApiKey: process.env.SERVER_API_KEY,
  isVercel: Boolean(detectedVercel),
  nodeEnv: process.env.NODE_ENV || 'development',
  isEnvironmentValid: isValid,
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
};