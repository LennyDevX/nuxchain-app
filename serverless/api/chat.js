/**
 * Función Serverless para Chat - NuxChain App
 * Maneja todas las operaciones de chat y streaming
 */

import { withSecurity } from '../../src/security/serverless-security.js';
import { generateContent, functionCalling } from '../../src/server/controllers/gemini-controller.js';
import { streamingController } from '../../src/server/controllers/streaming-controller.js';



async function chatHandler(req, res) {
  
  const { method, body, query } = req;
  
  switch (method) {
    case 'POST':
      const { stream, useTools } = body;
      
      if (stream) {
        return await streamingController(req, res);
      } else if (useTools) {
        return await functionCalling(req, res);
      } else {
        return await generateContent(req, res);
      }
      
    case 'GET':
      return await generateContent(req, res);
      
    default:
      return res.status(405).json({ 
        error: 'Método no permitido',
        allowedMethods: ['GET', 'POST', 'OPTIONS']
      });
  }
}

export default withSecurity(chatHandler);