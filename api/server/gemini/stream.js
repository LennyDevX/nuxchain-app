// Función serverless específica para el endpoint de streaming
import app from '../../../src/server/index.js';

// Función handler para el endpoint de streaming
export default async function handler(req, res) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Solo permitir POST para streaming
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }
  
  // Modificar la URL para que coincida con la ruta interna
  req.url = '/gemini/stream';
  
  // Pasar la request a la aplicación Express
  return app(req, res);
}