/**
 * Vercel Serverless Function: Submit Airdrop Registration
 * Endpoint: POST /api/airdrop/submit
 */

import { type VercelRequest, type VercelResponse } from '@vercel/node';
import { submitAirdropRegistration } from './validate-and-register.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Call the submission function
  return submitAirdropRegistration(req as any, res as any);
}
