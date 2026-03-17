/**
 * Local development subscriptions routes
 * Mirrors the Vercel API endpoint: GET /api/subscriptions/status?wallet=...
 * 
 * In development, fetches from Firestore to provide subscription tiers.
 * Falls back to free tier if any error occurs.
 */

import express from 'express';

const router = express.Router();

// Lazy-init Firestore
let _db = null;

async function getFirestoreDb() {
  if (_db) return _db;
  try {
    const { initializeApp, getApps, cert } = await import('firebase-admin/app');
    const { getFirestore } = await import('firebase-admin/firestore');
    
    if (getApps().length === 0) {
      const svcAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (svcAccount) {
        let parsed = null;
        let raw = svcAccount.trim();
        if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
          raw = raw.slice(1, -1);
        }
        try {
          parsed = JSON.parse(raw);
        } catch {
          let inString = false, wasBackslash = false, fixed = '';
          for (const ch of raw) {
            if (wasBackslash) { fixed += ch; wasBackslash = false; }
            else if (ch === '\\' && inString) { fixed += ch; wasBackslash = true; }
            else if (ch === '"') { inString = !inString; fixed += ch; }
            else if (inString && ch === '\n') { fixed += '\\n'; }
            else if (inString && ch === '\r') { /* skip */ }
            else { fixed += ch; }
          }
          parsed = JSON.parse(fixed);
        }
        initializeApp({ credential: cert(parsed) });
      } else {
        const { readFileSync, existsSync } = await import('fs');
        const { resolve } = await import('path');
        const candidates = [
          resolve(process.cwd(), 'serviceAccountKey.json'),
          resolve(process.cwd(), 'nuxchain1-firebase-adminsdk-fbsvc-23b890c5e2.json'),
        ];
        let key = null;
        for (const p of candidates) {
          if (existsSync(p)) { key = JSON.parse(readFileSync(p, 'utf8')); break; }
        }
        if (key) initializeApp({ credential: cert(key) });
        else return null; // No Firebase available
      }
    }
    _db = getFirestore();
    return _db;
  } catch (err) {
    console.warn('[subscriptions-routes] Firebase init failed:', err.message);
    return null;
  }
}

/**
 * GET /subscriptions/status?wallet=<solanaAddress>
 * Returns the current subscription status for a wallet.
 */
router.get('/status', async (req, res) => {
  console.log('[subscriptions-routes] GET /status called with wallet:', req.query.wallet);
  try {
    const wallet = req.query.wallet;

    // Return free tier for missing wallet
    if (!wallet || typeof wallet !== 'string' || wallet.length < 32) {
      return res.status(200).json({
        tier: 'free',
        isActive: false,
        expiryDate: null,
        activeSkills: [],
        addOns: [],
        daysRemaining: 0,
        isExpiringSoon: false,
        dailyLimit: 20, // FREE_DAILY_LIMIT from src/constants/subscription.ts
      });
    }

    // Fetch from Firestore
    const db = await getFirestoreDb();
    if (!db) {
      return res.status(200).json({
        tier: 'free',
        isActive: false,
        expiryDate: null,
        activeSkills: [],
        addOns: [],
        daysRemaining: 0,
        isExpiringSoon: false,
        dailyLimit: 20,
      });
    }

    const doc = await db.collection('subscriptions').doc(wallet).get();

    if (!doc.exists) {
      return res.status(200).json({
        tier: 'free',
        isActive: false,
        expiryDate: null,
        activeSkills: [],
        addOns: [],
        daysRemaining: 0,
        isExpiringSoon: false,
        dailyLimit: 20,
      });
    }

    // Parse subscription data
    const data = doc.data();
    const now = new Date();
    const expiryRaw = data.expiryDate;
    
    let expiry = new Date(0);
    if (expiryRaw instanceof Date) {
      expiry = expiryRaw;
    } else if (typeof expiryRaw === 'string') {
      expiry = new Date(expiryRaw);
    } else if (expiryRaw && typeof expiryRaw === 'object' && expiryRaw._seconds) {
      expiry = new Date(expiryRaw._seconds * 1000);
    } else if (expiryRaw?.toDate) {
      expiry = expiryRaw.toDate();
    }

    const isActive = expiry > now && data.status === 'active';
    const daysRemaining = isActive
      ? Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return res.status(200).json({
      tier: isActive ? (data.tier || 'free') : 'free',
      isActive,
      expiryDate: expiry.toISOString(),
      activeSkills: isActive ? (data.activeSkills || []) : [],
      addOns: isActive ? (data.addOns || []) : [],
      daysRemaining,
      isExpiringSoon: isActive && daysRemaining <= 3,
      dailyLimit: isActive ? -1 : 20, // -1 = unlimited for paid tiers
    });
  } catch (err) {
    console.error('[subscriptions/status] Error:', err);
    // Fail open — treat as free tier
    return res.status(200).json({
      tier: 'free',
      isActive: false,
      expiryDate: null,
      activeSkills: [],
      addOns: [],
      daysRemaining: 0,
      isExpiringSoon: false,
      dailyLimit: 20,
    });
  }
});

export default router;
