import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export default {
  port: process.env.PORT || 3002,
  geminiApiKey: process.env.GEMINI_API_KEY,
  serverApiKey: process.env.SERVER_API_KEY,
  isVercel: process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined || process.env.VERCEL_URL !== undefined,
  nodeEnv: process.env.NODE_ENV || 'development',
  
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
