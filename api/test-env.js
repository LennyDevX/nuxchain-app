/**
 * Función de prueba para verificar variables de entorno en Vercel
 */

export default function handler(req, res) {
  // Verificar variables de entorno
  const geminiKey = process.env.GEMINI_API_KEY;
  const serverKey = process.env.SERVER_API_KEY;
  
  res.json({
    message: 'Test de variables de entorno',
    hasGeminiKey: !!geminiKey,
    hasServerKey: !!serverKey,
    geminiKeyLength: geminiKey ? geminiKey.length : 0,
    serverKeyLength: serverKey ? serverKey.length : 0,
    geminiKeyPrefix: geminiKey ? geminiKey.substring(0, 10) + '...' : 'No encontrada',
    serverKeyPrefix: serverKey ? serverKey.substring(0, 10) + '...' : 'No encontrada',
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString()
  });
}