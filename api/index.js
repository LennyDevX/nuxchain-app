// Función serverless unificada para todos los endpoints
// Esto reduce el número de funciones de 12+ a solo 1

import { GoogleGenerativeAI } from '@google/generative-ai';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

// Configuración de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-API-Key',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

// Función principal que maneja todos los endpoints
export default async function handler(req, res) {
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // Aplicar headers CORS
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  try {
    const { path } = req.query;
    const endpoint = path ? path[0] : 'health';

    switch (endpoint) {
      case 'health':
        return handleHealth(req, res);
      
      case 'chat':
        return handleChat(req, res);
      
      case 'gemini':
        return handleGemini(req, res);
      
      case 'gemini-v2':
        return handleGeminiV2(req, res);
      
      case 'scraper':
        return handleScraper(req, res);
      
      case 'embeddings':
        return handleEmbeddings(req, res);
      
      default:
        return res.status(404).json({ 
          error: 'Endpoint no encontrado',
          availableEndpoints: ['health', 'chat', 'gemini', 'gemini-v2', 'scraper', 'embeddings']
        });
    }
  } catch (error) {
    console.error('Error en función unificada:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
}

// Handler para health check
async function handleHealth(req, res) {
  return res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
}

// Handler para chat
async function handleChat(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { message, conversationHistory = [] } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construir el contexto de la conversación
    const context = conversationHistory.map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    const prompt = context ? `${context}\nuser: ${message}` : message;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      response: text,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en chat:', error);
    return res.status(500).json({ error: 'Error al procesar el chat' });
  }
}

// Handler para Gemini
async function handleGemini(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { prompt, model = 'gemini-1.5-flash' } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt requerido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ model });

    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      response: text,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en Gemini:', error);
    return res.status(500).json({ error: 'Error al procesar con Gemini' });
  }
}

// Handler para Gemini V2 (versión optimizada)
async function handleGeminiV2(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { 
    message, 
    conversationHistory = [], 
    model = 'gemini-1.5-flash',
    temperature = 0.7,
    maxTokens = 1000
  } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const geminiModel = genAI.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    // Construir historial de conversación
    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const chat = geminiModel.startChat({ history });
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({
      response: text,
      model,
      timestamp: new Date().toISOString(),
      tokensUsed: response.usageMetadata || null
    });
  } catch (error) {
    console.error('Error en Gemini V2:', error);
    return res.status(500).json({ error: 'Error al procesar con Gemini V2' });
  }
}

// Handler para scraper
async function handleScraper(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL requerida' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article) {
      return res.status(400).json({ error: 'No se pudo extraer contenido de la URL' });
    }

    return res.status(200).json({
      title: article.title,
      content: article.textContent,
      excerpt: article.excerpt,
      length: article.length,
      url,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en scraper:', error);
    return res.status(500).json({ error: 'Error al procesar la URL' });
  }
}

// Handler para embeddings
async function handleEmbeddings(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { text, model = 'text-embedding-004' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Texto requerido' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding;

    return res.status(200).json({
      embedding: embedding.values,
      dimensions: embedding.values.length,
      model,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error en embeddings:', error);
    return res.status(500).json({ error: 'Error al generar embeddings' });
  }
}