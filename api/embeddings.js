import { GoogleGenAI } from '@google/genai';

// Configuración CORS para Vercel
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400',
};

// Lista de endpoints públicos que no requieren API key
const publicEndpoints = [
  '/api/chat/stream',
  '/api/chat/stream-with-tools',
  '/api/embeddings'
];

// Middleware de seguridad
function checkSecurity(req) {
  const path = req.url;
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    path === endpoint || path.startsWith(endpoint)
  );
  
  if (!isPublicEndpoint) {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return { error: 'API Key requerida', status: 401 };
    }
  }
  
  return null;
}

export default async function handler(req, res) {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Aplicar headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  // Verificar seguridad
  const securityCheck = checkSecurity(req);
  if (securityCheck) {
    return res.status(securityCheck.status).json({ error: securityCheck.error });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { text, model = 'text-embedding-004' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Texto requerido para generar embeddings' });
    }

    // Verificar que la API key de Gemini esté configurada
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'API key de Gemini no configurada' });
    }

    // Inicializar Gemini
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const embeddingModel = genAI.getGenerativeModel({ model: model });

    // Generar embeddings
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;

    return res.status(200).json({
      success: true,
      embedding: embedding.values,
      dimensions: embedding.values.length,
      model: model
    });

  } catch (error) {
    console.error('Error en embeddings:', error);
    
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}