/**
 * Función de debug para el endpoint de streaming
 */

export default async function handler(req, res) {
  try {
    console.log('=== DEBUG STREAM START ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    // Verificar variables de entorno
    const geminiKey = process.env.GEMINI_API_KEY;
    const serverKey = process.env.SERVER_API_KEY;
    
    console.log('GEMINI_API_KEY exists:', !!geminiKey);
    console.log('SERVER_API_KEY exists:', !!serverKey);
    
    if (!geminiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY no está configurada',
        debug: true
      });
    }
    
    if (!serverKey) {
      return res.status(500).json({
        error: 'SERVER_API_KEY no está configurada',
        debug: true
      });
    }
    
    // Verificar autorización
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authorization header requerido',
        debug: true
      });
    }
    
    const token = authHeader.substring(7);
    if (token !== serverKey) {
      return res.status(403).json({
        error: 'Token de autorización inválido',
        debug: true,
        receivedToken: token.substring(0, 10) + '...',
        expectedToken: serverKey.substring(0, 10) + '...'
      });
    }
    
    // Verificar método
    if (req.method !== 'POST') {
      return res.status(405).json({
        error: 'Método no permitido',
        allowed: ['POST'],
        debug: true
      });
    }
    
    // Verificar body
    if (!req.body) {
      return res.status(400).json({
        error: 'Body requerido',
        debug: true
      });
    }
    
    // Intentar importar GoogleGenAI
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      
      console.log('GoogleGenAI importado correctamente');
      
      // Intentar generar contenido directamente
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: 'Test message'
      });
      console.log('Generación de contenido exitosa:', response.text);
      
      return res.json({
        message: 'Debug exitoso - Todo configurado correctamente',
        debug: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (importError) {
      console.error('Error importando GoogleGenAI:', importError);
      return res.status(500).json({
        error: 'Error importando GoogleGenAI',
        details: importError.message,
        debug: true
      });
    }
    
  } catch (error) {
    console.error('Error en debug-stream:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      details: error.message,
      stack: error.stack,
      debug: true
    });
  }
}