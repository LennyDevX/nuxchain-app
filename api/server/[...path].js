// Vercel serverless function para manejar todas las rutas del servidor
import app from '../../src/server/index.js';
import { getCorsConfig, validateOrigin, applySecurityHeaders } from '../../src/security/cors-policies.js';

// Función handler para Vercel
export default async function handler(req, res) {
  // Obtener la configuración CORS para el entorno actual (asumiendo desarrollo para Vercel)
  const corsConfig = getCorsConfig(process.env.NODE_ENV || 'development');

  // Aplicar headers de seguridad
  applySecurityHeaders(req, res, () => {}); // applySecurityHeaders espera un next, pero no es necesario aquí

  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', corsConfig.origin.join(', '));
  res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders);
  res.setHeader('Access-Control-Allow-Credentials', String(corsConfig.credentials));
  res.setHeader('Access-Control-Max-Age', String(corsConfig.maxAge));

  // Validar el origen de la petición
  let isOriginAllowed = false;
  await new Promise(resolve => {
    validateOrigin(req.headers.origin, (err, allowed) => {
      if (!err && allowed) {
        isOriginAllowed = true;
      }
      resolve();
    });
  });

  if (!isOriginAllowed) {
    res.status(403).json({ error: 'Forbidden', message: 'Origin not allowed by CORS policy' });
    return;
  }

  // Headers adicionales para streaming
  if (req.url && req.url.includes('/stream')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
  }
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    // Pasar la request a la aplicación Express
    return app(req, res);
  } catch (error) {
    console.error('Error in serverless function:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}