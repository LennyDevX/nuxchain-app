// NuxChain AI - Gemini Server API with Tools Support
import { streamChatWithTools, generateContent } from '../../src/server/controllers/gemini-controller.js';

export default async function handler(req, res) {
  // Configurar headers CORS para todas las respuestas
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-API-Key');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  console.log('🚀 NuxChain AI Handler iniciado');
  console.log('📍 URL:', req.url);
  console.log('🔧 Method:', req.method);
  console.log('🔧 Query:', req.query);
  
  const url = req.url || '';
  const path = req.query?.path || '';
  
  console.log('🔧 Parsed path:', path);
  console.log('🔧 Full URL:', url);
  
  // Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Stream with tools endpoint - Main AI functionality
  if (url.includes('/stream-with-tools') || path === 'stream-with-tools' || path === 'gemini/stream-with-tools') {
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
        'POST /stream': 'AI chat streaming',
        'POST /stream-with-tools': 'AI chat with tools support',
        'GET /health': 'Service health check'
      }
    });
    
    console.log('🏥 Health check solicitado');
    return;
  }
  
  // Stream endpoint - Regular streaming without tools
  console.log('🔍 Checking stream endpoint conditions:');
  console.log('  - url.includes("/stream") && !url.includes("/stream-with-tools"):', url.includes('/stream') && !url.includes('/stream-with-tools'));
  console.log('  - path === "stream":', path === 'stream');
  console.log('  - path === "gemini/stream":', path === 'gemini/stream');
  
  if ((url.includes('/stream') && !url.includes('/stream-with-tools')) || path === 'stream' || path === 'gemini/stream') {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
      // Usar el controlador de streaming regular
      return await generateContent(req, res);
    } catch (error) {
      console.error('❌ Error en stream:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Error procesando solicitud'
      });
    }
  }

  // Default response - API documentation
  console.log('⚠️ No endpoint matched, returning API documentation');
  console.log('Final URL:', url);
  console.log('Final path:', path);
  
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: '🚀 NuxChain AI - Gemini Server API',
    description: 'Servidor de IA con soporte para herramientas y streaming',
    version: '1.0.0',
    status: '✅ Operativo',
    endpoints: {
      'POST /stream': {
        description: 'Chat con IA con streaming',
        parameters: {
          messages: 'Array de mensajes (requerido)',
          model: 'Modelo de IA (opcional, default: gemini-2.5-flash-lite)',
          stream: 'Habilitar streaming (opcional, default: true)'
        }
      },
      'POST /stream-with-tools': {
        description: 'Chat con IA usando herramientas',
        parameters: {
          messages: 'Array de mensajes (requerido)',
          model: 'Modelo de IA (opcional, default: gemini-2.5-flash-lite)',
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