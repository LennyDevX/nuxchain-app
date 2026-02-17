/**
 * Endpoint de inicialización: Precompute Embeddings Cache
 * Endpoint: GET /api/init-cache/embeddings
 * 
 * Ejecutar UNA VEZ después del primer deploy para cachear embeddings
 * del knowledge base (staking, NFT, marketplace, airdrop, gamification)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { embeddingsCache } from '../_services/embeddings-cache-service.js';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verificar authorization (opcional: agregar un secret key)
  const authKey = req.headers.authorization?.replace('Bearer ', '');
  const expectedKey = process.env.ADMIN_SECRET_KEY;

  if (expectedKey && authKey !== expectedKey) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Provide valid Authorization header with ADMIN_SECRET_KEY'
    });
  }

  try {
    console.log('[Init Cache] Starting embeddings precomputation...');
    
    const startTime = Date.now();
    
    // Precomputar knowledge base
    await embeddingsCache.precomputeKnowledgeBase();
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return res.status(200).json({
      success: true,
      message: 'Embeddings cache initialized successfully',
      duration: `${duration}s`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Init Cache] Error:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Failed to initialize embeddings cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
