import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const { prompt, messages, model = 'gemini-2.5-flash-lite', stream = true } = req.body;

    // Handle both prompt and messages format
    let contents;
    if (messages && Array.isArray(messages)) {
      // Convert messages to Gemini format
      contents = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content || msg.parts?.[0]?.text || '' }]
      }));
    } else if (prompt) {
      contents = prompt;
    } else {
      return res.status(400).json({ error: 'Either prompt or messages is required' });
    }

    // Set streaming headers
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    console.log('Starting stream with model:', model);
    
    // Generate streaming content
    const streamResponse = await ai.models.generateContentStream({
      model: model,
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    });

    console.log('Stream response received');

    // Process the stream
    for await (const chunk of streamResponse) {
      const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text || chunk.text || '';
      if (text) {
        console.log('Streaming chunk:', text.substring(0, 50) + '...');
        res.write(text);
      }
    }

    res.end();

  } catch (error) {
    console.error('Error in streaming:', error);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Streaming failed',
        message: error.message,
        model: req.body.model || 'gemini-2.5-flash-lite'
      });
    } else {
      res.end('\n\nError: ' + error.message);
    }
  }
}