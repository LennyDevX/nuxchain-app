/**
 * 🔐 Subscription Check Middleware — Local Dev Server
 * ====================================================
 * Checks daily message limits based on wallet subscription tier.
 * Mirrors production logic from api/_middlewares/subscription-auth.ts
 * but uses in-memory counters instead of Vercel KV.
 *
 * Tiers:
 *   free    — 10 messages/day  (default when no wallet or no Firestore doc)
 *   pro     — 100 messages/day
 *   premium — unlimited
 *
 * @module subscription-check
 */

// ── In-memory daily counter ───────────────────────────────────────────────────
// Key: `${wallet}:${YYYY-MM-DD}`, Value: number
const dailyCounters = new Map();

const DAILY_LIMITS = {
  free: 10,
  pro: 100,
  premium: Infinity,
};

// Cleanup old counter entries every hour to avoid memory leaks
setInterval(() => {
  const today = getTodayKey();
  for (const [key] of dailyCounters) {
    const date = key.split(':').pop();
    if (date !== today) dailyCounters.delete(key);
  }
}, 60 * 60 * 1000);

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function getCounterKey(wallet) {
  return `${wallet.toLowerCase()}:${getTodayKey()}`;
}

// ── Firestore lazy init (reuses same pattern as api-server.js) ─────────────────
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
        else return null; // No Firebase available — run without Firestore
      }
    }
    _db = getFirestore();
    return _db;
  } catch (err) {
    console.warn('[subscription-check] Firebase init failed (continuing without tier check):', err.message);
    return null;
  }
}

// ── Tier lookup ───────────────────────────────────────────────────────────────
const tierCache = new Map(); // wallet -> { tier, expiresAt }
const TIER_CACHE_TTL = 5 * 60 * 1000; // 5 min

async function getTier(wallet) {
  if (!wallet) return 'free';

  // Check local tier cache
  const cached = tierCache.get(wallet.toLowerCase());
  if (cached && Date.now() < cached.expiresAt) return cached.tier;

  // Fetch from Firestore
  try {
    const db = await getFirestoreDb();
    if (!db) return 'free';

    const doc = await db.collection('subscriptions').doc(wallet.toLowerCase()).get();
    if (!doc.exists) {
      tierCache.set(wallet.toLowerCase(), { tier: 'free', expiresAt: Date.now() + TIER_CACHE_TTL });
      return 'free';
    }

    const data = doc.data();
    // Check expiry
    let expiry = new Date(0);
    if (data.expiryDate?._seconds) expiry = new Date(data.expiryDate._seconds * 1000);
    else if (typeof data.expiryDate === 'string') expiry = new Date(data.expiryDate);
    else if (data.expiryDate instanceof Date) expiry = data.expiryDate;

    const isActive = expiry > new Date() && data.status === 'active';
    const tier = isActive ? (data.tier || 'free') : 'free';

    tierCache.set(wallet.toLowerCase(), { tier, expiresAt: Date.now() + TIER_CACHE_TTL });
    return tier;
  } catch (err) {
    console.warn('[subscription-check] Firestore lookup failed, defaulting to free:', err.message);
    return 'free';
  }
}

// ── Middleware ────────────────────────────────────────────────────────────────

/**
 * Express middleware that enforces daily message limits per wallet.
 * Attaches `req.subscriptionTier` and `req.walletAddress` for downstream handlers.
 *
 * Usage in route files:
 *   import subscriptionCheck from '../middlewares/subscription-check.js';
 *   router.post('/stream', subscriptionCheck, ...);
 */
export default async function subscriptionCheck(req, res, next) {
  const wallet = req.headers['x-wallet-address'] || req.body?.walletAddress || null;
  const tier = await getTier(wallet);

  req.walletAddress = wallet;
  req.subscriptionTier = tier;

  // Unlimited — no counter needed
  if (tier === 'premium') return next();

  // For wallets that haven't authenticated, still apply free limit (per IP as fallback)
  const counterKey = wallet
    ? getCounterKey(wallet)
    : `ip:${req.ip}:${getTodayKey()}`;

  const current = dailyCounters.get(counterKey) || 0;
  const limit = DAILY_LIMITS[tier] ?? DAILY_LIMITS.free;

  if (current >= limit) {
    console.warn(`[subscription-check] Daily limit reached for ${wallet || req.ip} (tier=${tier}, count=${current}/${limit})`);
    return res.status(429).json({
      error: 'DAILY_LIMIT_REACHED',
      message: `Daily message limit reached for ${tier} tier (${limit} messages/day). Resets at midnight UTC.`,
      tier,
      limit,
      used: current,
      upgradeUrl: '/upgrade',
    });
  }

  dailyCounters.set(counterKey, current + 1);
  res.setHeader('X-Daily-Limit', limit);
  res.setHeader('X-Daily-Used', current + 1);
  res.setHeader('X-Subscription-Tier', tier);

  next();
}
