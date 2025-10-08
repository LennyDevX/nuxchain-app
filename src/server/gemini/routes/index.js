import express from 'express';
import geminiRoutes from './gemini-routes.js';
import enhancedStreamingRoutes from './enhanced-streaming-routes.js';
import errorHandler from '../middlewares/error-handler.js'; // Add import

const router = express.Router();

// General test route to verify that the server is working
router.get('/hello', (_, res) => {
  res.json({
    message: 'Hello from the Nuxchain-App server!',
    timestamp: new Date().toISOString()
  });
});

// Usar el router de Gemini
router.use('/gemini', geminiRoutes);

// Agregar rutas de chat que mapean a Gemini
router.use('/chat', geminiRoutes);

// Usar el router de streaming mejorado
router.use('/streaming', enhancedStreamingRoutes);

// Remove inline error handler and use shared one
router.use(errorHandler);

export default router;
