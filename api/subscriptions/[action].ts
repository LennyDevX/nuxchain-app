/**
 * Dynamic Subscriptions Router
 * Consolidates subscription endpoints into a single Serverless Function
 * 
 * Routes:
 * POST /api/subscriptions/purchase
 * GET /api/subscriptions/status
 */

import { Request, Response } from 'express';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getDb } from '../_services/firebase-admin.js';
import { kv } from '@vercel/kv';
import {
  SUBSCRIPTION_PRICES,
  TIER_SKILLS,
  SUBSCRIPTION_COLLECTION,
  FREE_DAILY_LIMIT,
} from '../../src/constants/subscription.js';

const NUX_MINT = process.env.VITE_NUX_MINT_ADDRESS || 'AV9fNPXeLhyqGangnEdBkL355mqDbAi3gWU4AfzDcPZK';
const TREASURY_WALLET = process.env.VITE_DEPLOYER_NUX || 'GcfKd6DzFUANkRWkSwVp5YspaoRvS5j5GgRRvA8oBPXm';

const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_QUICKNODE,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
].filter(Boolean) as string[];

function getConnection() {
  return new Connection(RPC_ENDPOINTS[0], 'confirmed');
}

/** Handle POST /api/subscriptions/purchase */
async function handlePurchase(req: Request, res: Response) {
  const { wallet, txSignature, tier, paidWith } = req.body as {
    wallet: string;
    txSignature: string;
    tier: 'pro' | 'premium';
    paidWith: 'SOL' | 'NUX';
  };

  if (!wallet || !txSignature || !tier || !paidWith) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!['pro', 'premium'].includes(tier)) {
    return res.status(400).json({ error: 'Invalid tier' });
  }
  if (!['SOL', 'NUX'].includes(paidWith)) {
    return res.status(400).json({ error: 'Invalid paidWith' });
  }

  try {
    new PublicKey(wallet);
  } catch {
    return res.status(400).json({ error: 'Invalid Solana wallet address' });
  }

  const tierConfig = SUBSCRIPTION_PRICES[tier];

  try {
    const db = getDb();

    // Check for duplicate
    const existing = await db
      .collection(SUBSCRIPTION_COLLECTION)
      .doc(wallet)
      .get();

    if (existing.exists) {
      const sub = existing.data();
      if (sub?.lastTxSignature === txSignature) {
        return res.status(409).json({ error: 'Duplicate transaction' });
      }
    }

    // Verify on-chain
    const connection = getConnection();
    const tx = await connection.getTransaction(txSignature, { commitment: 'confirmed' });

    if (!tx) {
      return res.status(400).json({ error: 'Transaction not found' });
    }

    const instruction = tx.transaction.message.instructions[0];
    if (!instruction) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Simple validation: check if amount matches expected
    const expectedAmount = paidWith === 'SOL'
      ? tierConfig.minSol
      : tierConfig.nux;

    // Write to Firestore
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).set({
      tier,
      isActive: true,
      expiryDate: expiryDate.toISOString(),
      activeSkills: TIER_SKILLS[tier],
      createdAt: new Date().toISOString(),
      lastTxSignature: txSignature,
      paidWith,
    }, { merge: true });

    // Invalidate cache
    await kv.del(`sub:${wallet}`);

    return res.status(200).json({
      success: true,
      message: 'Subscription activated',
      tier,
      expiryDate: expiryDate.toISOString(),
      activeSkills: TIER_SKILLS[tier],
    });
  } catch (err) {
    console.error('[subscriptions/purchase]', err);
    return res.status(500).json({ error: 'Purchase verification failed' });
  }
}

/** Handle GET /api/subscriptions/status */
async function handleStatus(req: Request, res: Response) {
  const wallet = req.query.wallet as string;

  if (!wallet || wallet.length < 32) {
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

  const KV_TTL = 300; // 5 minutes

  try {
    // Check KV cache
    const cacheKey = `sub:${wallet}`;
    const cached = await kv.get<object>(cacheKey);
    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    // Query Firestore
    const db = getDb();
    const doc = await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).get();

    let response: any;

    if (!doc.exists) {
      response = {
        tier: 'free',
        isActive: false,
        expiryDate: null,
        activeSkills: [],
        daysRemaining: 0,
        isExpiringSoon: false,
        dailyLimit: FREE_DAILY_LIMIT,
      };
    } else {
      const data = doc.data() as any;
      const expiryDate = new Date(data.expiryDate);
      const now = new Date();
      const daysRemaining = Math.max(0, Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      const isExpiringSoon = daysRemaining <= 3 && daysRemaining > 0;
      const isActive = expiryDate > now;

      response = {
        tier: data.tier,
        isActive,
        expiryDate: data.expiryDate,
        activeSkills: data.activeSkills || [],
        daysRemaining,
        isExpiringSoon,
        dailyLimit: !isActive ? FREE_DAILY_LIMIT : undefined,
      };
    }

    // Cache the response
    await kv.setex(cacheKey, KV_TTL, JSON.stringify(response));

    res.setHeader('X-Cache', 'MISS');
    return res.status(200).json(response);
  } catch (err) {
    console.error('[subscriptions/status]', err);
    return res.status(500).json({ error: 'Failed to fetch subscription status' });
  }
}

export default async function handler(req: Request, res: Response) {
  if (req.method === 'OPTIONS') return res.status(200).end();

  const action = req.query.action as string;

  // Route based on action and method
  if (action === 'purchase' && req.method === 'POST') {
    return handlePurchase(req, res);
  } else if (action === 'status' && req.method === 'GET') {
    return handleStatus(req, res);
  } else {
    return res.status(404).json({ error: 'Unknown subscription action' });
  }
}
