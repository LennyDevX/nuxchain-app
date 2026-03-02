import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { initializeApp, cert } from 'firebase-admin/app';
import path from 'path';
import fs from 'fs';
import env from './config/environment.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import websocketHandler from './middlewares/websocket-handler.js';
import { initializeKnowledgeBaseForVercel } from './services/embeddings-service.js';
import { getCorsConfig } from '../../security/cors-policies.js';
import { setupSecurityMiddlewares } from '../../security/security-middleware.js';
import { setupSecureWebSocketServer } from '../../security/websocket-security.js';
import environmentConfig from '../../security/environment-config.js';

// Crear la aplicación express
const app = express();
const port = env.port;

// Logear entorno para diagnóstico local
if (env.nodeEnv === 'development') {
  console.log(`\n📋 Environment: ${env.nodeEnv} | Vercel: ${env.isVercel} | Valid: ${env.isEnvironmentValid}\n`);
}

// CORS Configuration basada en el entorno
const corsOptions = getCorsConfig(env.nodeEnv);

// CORS ANTES de los middlewares de seguridad para manejar preflight
app.use(cors(corsOptions));

// Inicializar Firebase Admin SDK para entorno local
try {
  // Ruta canónica del service account (nunca se sube a git — está en .gitignore)
  const serviceAccountPaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json')
  ];

  let serviceAccount = null;
  let serviceAccountPath = null;

  for (const p of serviceAccountPaths) {
    if (fs.existsSync(p)) {
      serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
      serviceAccountPath = p;
      break;
    }
  }

  // Fallback: try FIREBASE_SERVICE_ACCOUNT env var (set by Vercel or .env.local)
  if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      let raw = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      // Strip outer quotes if present (common when stored via some tools)
      if (raw.startsWith('"') && raw.endsWith('"')) {
        raw = raw.slice(1, -1);
      }
      // Try parsing as-is first (compact JSON or already valid)
      let parsed = null;
      try {
        parsed = JSON.parse(raw);
      } catch (_) {
        // If direct parse fails, fix unescaped newlines inside JSON string values.
        // This happens when vercel env pull writes multiline values to .env.local and
        // dotenv preserves the actual newline characters (which are invalid inside JSON strings).
        // Walk the string char-by-char tracking string context and escape bare newlines.
        let inString = false, wasBackslash = false, fixed = '';
        for (const ch of raw) {
          if (wasBackslash) {
            fixed += ch;
            wasBackslash = false;
          } else if (ch === '\\' && inString) {
            fixed += ch;
            wasBackslash = true;
          } else if (ch === '"') {
            inString = !inString;
            fixed += ch;
          } else if (inString && ch === '\n') {
            fixed += '\\n'; // escape bare newline inside JSON string
          } else if (inString && ch === '\r') {
            // skip bare \r inside strings
          } else {
            fixed += ch;
          }
        }
        // Also normalise literal \\n sequences in private_key if needed
        parsed = JSON.parse(fixed);
      }
      serviceAccount = parsed;
      serviceAccountPath = 'FIREBASE_SERVICE_ACCOUNT (env)';
    } catch (e) {
      console.warn('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  if (serviceAccount) {
    initializeApp({
      credential: cert(serviceAccount)
    });
    console.log(`✅ Firebase Admin SDK inicializado correctamente (${path.basename ? path.basename(serviceAccountPath) : serviceAccountPath})`);
  } else {
    // Si no hay archivo, intentar inicialización por defecto (para entornos con GOOGLE_APPLICATION_CREDENTIALS)
    try {
      initializeApp();
      console.log('✅ Firebase Admin SDK inicializado por defecto');
    } catch (e) {
      console.warn('⚠️ No se encontró service account. Las funciones de airdrop local podrían fallar.');
    }
  }
} catch (error) {
  console.error('❌ Error inicializando Firebase Admin SDK:', error.message);
}

// Manejar solicitudes OPTIONS explícitamente para todas las rutas
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// Configurar todos los middlewares de seguridad avanzados
setupSecurityMiddlewares(app);

console.log('✅ Security middlewares configured');

app.use(express.json({ limit: '2mb' }));

// Rutas API - ajustado para Vercel
if (env.isVercel) {
  // En Vercel, las rutas ya están reescritas, no necesitamos el prefijo /server
  app.use('/', routes);
} else {
  // En desarrollo local, exponer ambas rutas para compatibilidad con distintas configuraciones del frontend
  app.use('/server', routes);
  app.use('/api', routes); // <-- COINCIDIR CON VERCEL /api/...
  app.use('/', routes); // <-- permite que el frontend que llame a /api/... o a /server/... funcione sin cambios
}

// Middleware de manejo de errores (debe estar al final)
app.use(errorHandler);

// Crear servidor HTTP para soportar WebSockets
const server = createServer(app);

// Función asíncrona para inicializar el servidor
async function startServer() {
  try {
    console.log('⏳ Initializing knowledge base...');
    const initResult = await initializeKnowledgeBaseForVercel(true);
    console.log('✅ Knowledge base initialized');

    if (initResult.precomputeStarted) {
      console.log('� Pre-computing embeddings in background...');
    }
  } catch (error) {
    console.error('❌ Knowledge base initialization failed:', error.message);
  }
}

// Inicializar WebSocket handler con seguridad avanzada
if (environmentConfig.isProduction) {
  // En producción, usar WebSocket seguro
  const wss = setupSecureWebSocketServer(server);
  websocketHandler.initialize(server, wss);
} else {
  // En desarrollo, usar configuración estándar
  websocketHandler.initialize(server);
}

// Verificar el entorno de ejecución
if (env.isVercel) {
  console.log('Running on Vercel - Initializing knowledge base...');
  startServer().then(() => {
    console.log('✅ Knowledge base ready');
  }).catch(error => {
    console.error('❌ Initialization error:', error.message);
  });
} else {
  // En desarrollo, inicializar primero y luego arrancar el servidor
  startServer().then(() => {
    server.listen(port, () => {
      console.log(`\n🚀 Server running on http://localhost:${port}`);
      console.log(`📡 WebSocket available at ws://localhost:${port}/ws/streaming\n`);
      console.log('✓ Semantic chunking');
      console.log('✓ Contextual pauses');
      console.log('✓ Variable speed streaming');
      console.log('✓ WebSocket support\n');
    });
  }).catch(error => {
    console.error('❌ Startup error:', error.message);
    process.exit(1);
  });

  // Manejo de cierre graceful
  process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received, shutting down...');
    websocketHandler.cleanup();
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received, shutting down...');
    websocketHandler.cleanup();
    server.close(() => {
      process.exit(0);
    });
  });
}

// Export the app for serverless environments
export default app;