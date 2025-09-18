import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import env from './config/environment.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import websocketHandler from './middlewares/websocket-handler.js';
import { initializeKnowledgeBaseOnStartup } from './services/embeddings-service.js';
import { getCorsConfig, applySecurityHeaders } from '../security/cors-policies.js';
import { setupSecurityMiddlewares } from '../security/security-middleware.js';
import { setupSecureWebSocketServer } from '../security/websocket-security.js';
import environmentConfig from '../security/environment-config.js';

// Crear la aplicación express
const app = express();
const port = env.port;

// CORS Configuration basada en el entorno
const corsOptions = getCorsConfig(env.nodeEnv);

// CORS ANTES de los middlewares de seguridad para manejar preflight
app.use(cors(corsOptions));

// Manejar solicitudes OPTIONS explícitamente para todas las rutas
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return cors(corsOptions)(req, res, next);
  }
  next();
});

// Configurar todos los middlewares de seguridad avanzados
setupSecurityMiddlewares(app);

// Cambia el límite de JSON a 2MB (ya configurado en security middleware)
app.use(express.json({ limit: '2mb' }));

// Rutas API - ajustado para Vercel
if (env.isVercel) {
  // En Vercel, las rutas ya están reescritas, no necesitamos el prefijo /server
  app.use('/', routes);
} else {
  // En desarrollo local, usar el prefijo /server
  app.use('/server', routes);
}

// Middleware de manejo de errores (debe estar al final)
app.use(errorHandler);

// Crear servidor HTTP para soportar WebSockets
const server = createServer(app);

// Función asíncrona para inicializar el servidor
async function startServer() {
  try {
    // Inicializar base de conocimientos antes de que el servidor esté listo
    console.log('🔄 Inicializando base de conocimientos...');
    await initializeKnowledgeBaseOnStartup();
    console.log('✅ Base de conocimientos lista para usar');
  } catch (error) {
    console.error('❌ Error en inicialización de base de conocimientos:', error);
    // Continuar con el servidor aunque falle la inicialización
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
  // En Vercel, inicializar la base de conocimientos inmediatamente
  console.log('Running on Vercel - Initializing knowledge base...');
  startServer().then(() => {
    console.log('✅ Vercel: Knowledge base initialized and ready');
  }).catch(error => {
    console.error('❌ Vercel: Error initializing knowledge base:', error);
  });
  console.log('Note: WebSocket functionality may be limited in serverless environment');
} else {
  // En desarrollo, inicializar primero y luego arrancar el servidor
  startServer().then(() => {
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`WebSocket server available at ws://localhost:${port}/ws/streaming`);
      console.log('Enhanced streaming features enabled:');
      console.log('  ✓ Semantic chunking');
      console.log('  ✓ Contextual pauses');
      console.log('  ✓ Variable speed streaming');
      console.log('  ✓ WebSocket support');
      console.log('  ✓ Syntax highlighting');
      console.log('  ✓ Progress indicators');
      console.log('  ✓ Typing indicators');
      console.log('  ✓ Adaptive compression');
    });
  }).catch(error => {
    console.error('❌ Error durante la inicialización:', error);
    // Arrancar el servidor de todas formas
    server.listen(port, () => {
      console.log(`Server running on http://localhost:${port} (with initialization errors)`);
    });
  });
  
  // Manejo de cierre graceful
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    websocketHandler.cleanup();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
  
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    websocketHandler.cleanup();
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

// Export the app for serverless environments
export default app;