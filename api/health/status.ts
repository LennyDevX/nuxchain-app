import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY);
    
    // Check if @google/genai can be imported
    let genaiImportOk = false;
    try {
      await import('@google/genai');
      genaiImportOk = true;
    } catch (e) {
      console.error('Failed to import @google/genai:', e);
    }
    
    const status = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion: process.version,
        nodeEnv: process.env.NODE_ENV,
        hasGeminiKey,
        genaiImportOk
      },
      region: process.env.VERCEL_REGION || 'unknown'
    };
    
    res.status(200).json(status);
  } catch (error) {
    const err = error as Error;
    res.status(500).json({
      status: 'error',
      message: err.message,
      stack: err.stack
    });
  }
}
