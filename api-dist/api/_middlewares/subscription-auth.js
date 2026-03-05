/**
 * Subscription Auth Middleware for Skills Endpoints
 *
 * Checks that the requesting wallet has an active subscription that
 * includes the requested skill (or the skill appears in their addOns).
 *
 * Usage:
 *   const sub = await checkSkillAccess(req, res, 'nft-listing');
 *   if (!sub) return; // response already sent
 *   // sub.tier, sub.activeSkills available
 */
import { getDb } from '../_services/firebase-admin.js';
import { kv } from '@vercel/kv';
import { SUBSCRIPTION_COLLECTION } from '../../src/constants/subscription.js';
const KV_TTL = 300; // 5 min cache
/**
 * Verifies that the wallet in `X-Wallet-Address` header has access to `skillId`.
 * Returns the subscription status object on success, or sends 401/402/403 and returns null.
 */
export async function checkSkillAccess(req, res, skillId) {
    const wallet = req.headers['x-wallet-address'];
    if (!wallet || wallet.length < 32) {
        res.status(401).json({
            error: 'WALLET_REQUIRED',
            message: 'Provide X-Wallet-Address header with your Solana wallet.',
        });
        return null;
    }
    // ── Check KV cache ────────────────────────────────────────────────────────
    const cacheKey = `sub:${wallet}`;
    let subData = null;
    try {
        subData = await kv.get(cacheKey);
    }
    catch { /* fail open */ }
    if (!subData) {
        // ── Fetch from Firestore ────────────────────────────────────────────────
        try {
            const db = getDb();
            const doc = await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).get();
            if (!doc.exists) {
                res.status(402).json({
                    error: 'NO_SUBSCRIPTION',
                    message: 'This skill requires an active Pro or Premium subscription.',
                    upgradeUrl: '/upgrade',
                });
                return null;
            }
            subData = doc.data();
            // Cache it
            try {
                await kv.set(cacheKey, subData, { ex: KV_TTL });
            }
            catch { /* ok */ }
        }
        catch (err) {
            console.error('[subscriptionAuth] Firestore error:', err);
            res.status(500).json({ error: 'Internal server error' });
            return null;
        }
    }
    // ── Check active ─────────────────────────────────────────────────────────
    const expiryRaw = subData.expiryDate;
    let expiry;
    if (expiryRaw instanceof Date) {
        expiry = expiryRaw;
    }
    else if (typeof expiryRaw === 'string') {
        expiry = new Date(expiryRaw);
    }
    else if (expiryRaw && typeof expiryRaw === 'object' && '_seconds' in expiryRaw) {
        expiry = new Date(expiryRaw._seconds * 1000);
    }
    else {
        expiry = new Date(0);
    }
    const isActive = expiry > new Date() && subData.status === 'active';
    if (!isActive) {
        res.status(402).json({
            error: 'SUBSCRIPTION_EXPIRED',
            message: 'Your subscription has expired. Renew to continue using skills.',
            upgradeUrl: '/upgrade',
        });
        return null;
    }
    // ── Check skill access ───────────────────────────────────────────────────
    const activeSkills = subData.activeSkills || [];
    const addOns = subData.addOns || [];
    const hasAccess = activeSkills.includes(skillId) || addOns.includes(skillId);
    if (!hasAccess) {
        res.status(403).json({
            error: 'SKILL_NOT_ACTIVE',
            message: `Skill "${skillId}" is not included in your ${subData.tier} plan.`,
            upgradeUrl: '/upgrade',
            availableIn: skillId,
        });
        return null;
    }
    return {
        tier: subData.tier,
        activeSkills,
        addOns,
        expiryDate: expiry,
    };
}
/**
 * Rate limit for skills: 60/hour (pro), 200/hour (premium)
 * Returns true if ok, false if rate limited (response already sent).
 */
export async function skillsRateLimit(req, res, wallet, tier) {
    const limit = tier === 'premium' ? 200 : 60;
    const windowHour = Math.floor(Date.now() / 1000 / 3600) * 3600;
    const key = `skillsrl:${wallet}:${windowHour}`;
    try {
        const count = await kv.incr(key);
        if (count === 1)
            await kv.expire(key, 3600);
        if (count > limit) {
            res.status(429).json({
                error: 'SKILLS_RATE_LIMIT',
                message: `Skills rate limit: ${limit} requests/hour for ${tier}.`,
                retryAfter: 3600 - (Math.floor(Date.now() / 1000) - windowHour),
            });
            return false;
        }
        return true;
    }
    catch {
        return true; // fail open
    }
}
