// Test file to verify Google Gemini API connection

import { GoogleGenAI } from '@google/genai';

// Test handler
async function testGeminiHandler(req, res) {
  try {
    // Set CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    };
    
    Object.entries(corsHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Log environment variable status
    console.log('Testing Google Gemini API');
    console.log('GEMINI_API_KEY available:', !!process.env.GEMINI_API_KEY);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Try to initialize GoogleGenAI
    let ai = null;
    try {
      ai = new GoogleGenAI(process.env.GEMINI_API_KEY || 'test-key');
      console.log('GoogleGenAI initialized successfully');
    } catch (initError) {
      console.error('Error initializing GoogleGenAI:', initError.message);
    }

    // Try to list available models (will fail if key is invalid)
    let models = [];
    if (ai && process.env.GEMINI_API_KEY) {
      try {
        const modelList = await ai.listModels();
        models = modelList.models.slice(0, 5).map(m => m.name);
        console.log('Successfully listed models');
      } catch (modelError) {
        console.error('Error listing models:', modelError.message);
        // Continue with test despite model listing failure
      }
    }

    // Send response
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      success: true,
      geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY,
      aiInitialized: !!ai,
      availableModels: models.length > 0 ? models : ['Model listing failed or API key not valid'],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fatal error in test-gemini:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
      geminiApiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
  }
}

export default testGeminiHandler;