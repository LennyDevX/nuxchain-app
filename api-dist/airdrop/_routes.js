/**
 * Airdrop API Routes
 * Handles registration validation and submission
 */
import { Router } from 'express';
import { validateAirdropRegistration, submitAirdropRegistration, } from './validate-and-register.js';
const router = Router();
// POST /api/airdrop/validate - Validate registration
router.post('/validate', validateAirdropRegistration);
// POST /api/airdrop/submit - Submit registration (after validation passes)
router.post('/submit', submitAirdropRegistration);
export default router;
