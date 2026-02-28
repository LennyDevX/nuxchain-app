/**
 * GET /api/launchpad/verify-whitelist?wallet=<pubkey>
 * Checks if a Solana wallet is registered in the airdrop and eligible for Tier 1 whitelist.
 */
import { Request, Response } from 'express';
import { getDb } from '../_services/firebase-admin.js';

const AIRDROP_COLLECTION = 'nuxchainAirdropRegistrations';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { wallet } = req.query;

  if (!wallet || typeof wallet !== 'string' || wallet.trim().length < 32) {
    return res.status(400).json({ eligible: false, error: 'Invalid wallet address' });
  }

  try {
    const db = getDb();
    const snap = await db
      .collection(AIRDROP_COLLECTION)
      .where('wallet', '==', wallet.trim())
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(200).json({ eligible: false, reason: 'Wallet not registered in Airdrop' });
    }

    const doc = snap.docs[0].data();

    return res.status(200).json({
      eligible: true,
      tier: 1,
      name: doc.name || '',
      registeredAt: doc.createdAt?.toDate?.()?.toISOString() || null,
    });
  } catch (err) {
    console.error('[verify-whitelist] Error:', err);
    return res.status(500).json({ eligible: false, error: 'Internal server error' });
  }
}
