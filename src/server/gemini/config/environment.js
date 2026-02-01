import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../../../../');

// Load .env.local first (higher priority), then .env
dotenv.config({ path: join(rootDir, '.env.local') });
dotenv.config({ path: join(rootDir, '.env') });

console.log('[Environment] 🔧 Loading environment variables...');
console.log('[Environment] 📁 Root directory:', rootDir);
console.log('[Environment] ✅ ALCHEMY_API_KEY present:', !!process.env.ALCHEMY_API_KEY);
console.log('[Environment] ✅ GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);

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
  alchemyKey: process.env.ALCHEMY_API_KEY || process.env.VITE_ALCHEMY,
  polygonScanKey: process.env.POLYGONSCAN_API_KEY,
  isVercel: Boolean(detectedVercel),
  nodeEnv: process.env.NODE_ENV || 'development',
  isEnvironmentValid: isValid,
  embeddingModel: process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001',
};