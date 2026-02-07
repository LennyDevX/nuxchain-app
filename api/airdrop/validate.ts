/**
 * Vercel Serverless Function: Validate Airdrop Registration
 * Endpoint: POST /api/airdrop/validate
 */

import { type VercelRequest, type VercelResponse } from '@vercel/node';
import { validateAirdropRegistration } from './validate-and-register.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed' 
    });
  }

  // Call the validation function
  return validateAirdropRegistration(req as any, res as any);
}
