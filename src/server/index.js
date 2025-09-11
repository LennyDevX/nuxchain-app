import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import env from './config/environment.js';
import routes from './routes/index.js';
import errorHandler from './middlewares/error-handler.js';
import websocketHandler from './middlewares/websocket-handler.js';
import { initializeKnowledgeBaseOnStartup } from './services/embeddings-service.js';
import { getCorsConfig, applySecurityHeaders } from '../security/cors-policies.js';

// Crear la aplicación express
const app = express();
const port = env.port;

// CORS Configuration basada en el entorno
const corsOptions = getCorsConfig(env.nodeEnv);

// Middleware de seguridad
app.use(applySecurityHeaders);
app.use(cors(corsOptions));
// Cambia el límite de JSON a 2MB
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

// Inicializar base de conocimientos automáticamente
initializeKnowledgeBaseOnStartup();

// Crear servidor HTTP para soportar WebSockets
const server = createServer(app);

// Inicializar WebSocket handler
websocketHandler.initialize(server);

// Verificar el entorno de ejecución
if (env.isVercel) {
  // En Vercel, exportamos la aplicación como un módulo
  console.log('Running on Vercel - Knowledge base will be initialized automatically');
  console.log('Note: WebSocket functionality may be limited in serverless environment');
} else {
  // En desarrollo, iniciamos el servidor
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`WebSocket server available at ws://localhost:${port}/ws/streaming`);
    console.log('Knowledge base initialization started...');
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