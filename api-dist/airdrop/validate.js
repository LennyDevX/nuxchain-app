/**
 * Vercel Serverless Function: Validate Airdrop Registration
 * Endpoint: POST /api/airdrop/validate
 */
import { validateAirdropRegistration } from './validate-and-register';
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }
    // Call the validation function
    return validateAirdropRegistration(req, res);
}
