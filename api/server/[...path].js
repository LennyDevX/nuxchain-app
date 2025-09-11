// Vercel serverless function para manejar todas las rutas del servidor
import app from '../../src/server/index.js';

// Función handler para Vercel
export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Pasar la request a la aplicación Express
  return app(req, res);
}