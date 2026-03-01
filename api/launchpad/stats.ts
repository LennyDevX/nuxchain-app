/**
 * GET /api/launchpad/stats
 * Returns aggregated presale stats: tokens sold per tier, SOL raised, participants.
 * Used to feed progress bars in the Launchpad UI.
 * Cached for 30 seconds via Vercel edge.
 */
import { Request, Response } from 'express';
import { getDb } from '../_services/firebase-admin.js';

const COLLECTION = 'launchpadPurchases';

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();
    const snap = await db
      .collection(COLLECTION)
      .where('status', 'in', ['confirmed', 'distributed'])
      .get();

    const stats = {
      tier1: { nuxSold: 0, solRaised: 0, participants: 0 },
      tier2: { nuxSold: 0, solRaised: 0, participants: 0 },
      total: { nuxSold: 0, solRaised: 0, participants: 0 },
    };

    const walletsTier1 = new Set<string>();
    const walletsTier2 = new Set<string>();

    snap.docs.forEach((doc) => {
      const d = doc.data();
      const nux = Number(d.nuxAmount) || 0;
      const sol = Number(d.solAmount) || 0;

      if (d.tier === 1) {
        stats.tier1.nuxSold += nux;
        stats.tier1.solRaised += sol;
        walletsTier1.add(d.wallet);
      } else if (d.tier === 2) {
        stats.tier2.nuxSold += nux;
        stats.tier2.solRaised += sol;
        walletsTier2.add(d.wallet);
      }
    });

    stats.tier1.participants = walletsTier1.size;
    stats.tier2.participants = walletsTier2.size;
    stats.total.nuxSold = stats.tier1.nuxSold + stats.tier2.nuxSold;
    stats.total.solRaised = stats.tier1.solRaised + stats.tier2.solRaised;
    stats.total.participants = new Set([...walletsTier1, ...walletsTier2]).size;

    // Cache: 30 seconds
    res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(stats);
  } catch (err) {
    console.error('[launchpad/stats] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
