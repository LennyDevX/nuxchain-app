/**
 * Vercel Serverless Function: Submit Airdrop Registration
 * Endpoint: POST /api/airdrop/submit
 */
import { submitAirdropRegistration } from './validate-and-register';
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    // Call the submission function
    return submitAirdropRegistration(req, res);
}
