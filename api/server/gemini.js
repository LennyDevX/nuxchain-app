// NuxChain AI - Gemini Server API with Tools Support
import { streamChatWithTools } from '../../src/server/controllers/gemini-controller.js';

export default async function handler(req, res) {
  console.log('🚀 NuxChain AI Handler iniciado');
  console.log('📍 URL:', req.url);
  console.log('🔧 Method:', req.method);
  
  const url = req.url || '';
  const path = req.query?.path || '';
  
  // Stream with tools endpoint - Main AI functionality
  if (url.includes('/stream-with-tools') || path === 'stream-with-tools') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      // Usar el controlador real de Gemini con herramientas
      return await streamChatWithTools(req, res);
    } catch (error) {
      console.error('❌ Error en stream-with-tools:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
      });
    }
    res.end();
    
    console.log('✅ Respuesta enviada exitosamente');
    return;
  }
  
  // Health check endpoint - Service status
  if (url.includes('/health') || path === 'health') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.json({
      status: '✅ Healthy',
      service: 'NuxChain AI - Gemini Server',
      version: '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /stream-with-tools': 'AI chat with tools support',
        'GET /health': 'Service health check'
      }
    });
    
    console.log('🏥 Health check solicitado');
    return;
  }
  
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(200).end();
    return;
  }
  
  // Default response - API documentation
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  res.json({
    message: '🚀 NuxChain AI - Gemini Server API',
    description: 'Servidor de IA con soporte para herramientas y streaming',
    version: '1.0.0',
    status: '✅ Operativo',
    endpoints: {
      'POST /stream-with-tools': {
        description: 'Chat con IA usando herramientas',
        parameters: {
          messages: 'Array de mensajes (requerido)',
          model: 'Modelo de IA (opcional, default: gemini-1.5-flash)',
          enabledTools: 'Array de herramientas habilitadas (opcional)'
        }
      },
      'GET /health': {
        description: 'Verificación de estado del servicio'
      }
    },
    timestamp: new Date().toISOString(),
    documentation: 'https://nuxchain.com/docs'
  });
  
  console.log('📚 Documentación de API solicitada');
}