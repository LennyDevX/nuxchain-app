/**
 * GET /api/subscriptions/status?wallet={solanaAddress}
 *
 * Returns the current subscription status for a given wallet.
 * Cached in KV for 5 minutes to minimize Firestore reads.
 *
 * Response:
 * {
 *   tier: 'free' | 'pro' | 'premium'
 *   isActive: boolean
 *   expiryDate: string | null
 *   activeSkills: string[]
 *   daysRemaining: number
 *   isExpiringSoon: boolean  // true if < 3 days
 * }
 */

import { Request, Response } from 'express';
import { getDb } from '../_services/firebase-admin.js';
import { kv } from '@vercel/kv';
import { SUBSCRIPTION_COLLECTION, FREE_DAILY_LIMIT } from '../../src/constants/subscription.js';

const KV_TTL = 300; // 5 minutes cache

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const wallet = req.query.wallet as string;

  if (!wallet || wallet.length < 32) {
    // Return free tier for unauthenticated / missing wallet
    return res.status(200).json({
      tier: 'free',
      isActive: false,
      expiryDate: null,
      activeSkills: [],
      daysRemaining: 0,
      isExpiringSoon: false,
      dailyLimit: FREE_DAILY_LIMIT,
    });
  }

  // ── Check KV cache first ────────────────────────────────────────────────
  const cacheKey = `sub:${wallet}`;
  try {
    const cached = await kv.get<object>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }
  } catch { /* fail open */ }

  // ── Fetch from Firestore ────────────────────────────────────────────────
  try {
    const db = getDb();
    const doc = await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).get();

    let result;

    if (!doc.exists) {
      result = {
        tier: 'free',
        isActive: false,
        expiryDate: null,
        activeSkills: [],
        daysRemaining: 0,
        isExpiringSoon: false,
        dailyLimit: FREE_DAILY_LIMIT,
      };
    } else {
      const data = doc.data()!;
      const now = new Date();
      const expiry = data.expiryDate?.toDate?.() || new Date(0);
      const isActive = expiry > now && data.status === 'active';
      const daysRemaining = isActive
        ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      result = {
        tier: isActive ? data.tier : 'free',
        isActive,
        expiryDate: expiry.toISOString(),
        activeSkills: isActive ? (data.activeSkills || []) : [],
        addOns: isActive ? (data.addOns || []) : [],
        daysRemaining,
        isExpiringSoon: isActive && daysRemaining <= 3,
        dailyLimit: isActive ? -1 : FREE_DAILY_LIMIT, // -1 = unlimited
      };
    }

    // Cache in KV
    try {
      await kv.set(cacheKey, result, { ex: KV_TTL });
    } catch { /* non-fatal */ }

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(result);

  } catch (err) {
    console.error('[subscription/status] Error:', err);
    // Fail open → treat as free tier
    return res.status(200).json({
      tier: 'free',
      isActive: false,
      expiryDate: null,
      activeSkills: [],
      daysRemaining: 0,
      isExpiringSoon: false,
      dailyLimit: FREE_DAILY_LIMIT,
    });
  }
}
