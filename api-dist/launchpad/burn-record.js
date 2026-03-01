/**
 * POST /api/launchpad/burn-record
 * Records a NUX token burn in Firestore
 *
 * GET /api/launchpad/burn-leaderboard
 * Returns top wallets by total NUX burned
 */
import { getDb } from '../_services/firebase-admin.js';
const COLLECTION = 'nuxBurnRecords';
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    // ─── POST: record a burn ───────────────────────────────────────────────────
    if (req.method === 'POST') {
        const { wallet, amount, txSignature } = req.body ?? {};
        if (!wallet || typeof wallet !== 'string' || wallet.length < 32) {
            return res.status(400).json({ error: 'Invalid wallet' });
        }
        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }
        if (!txSignature || typeof txSignature !== 'string') {
            return res.status(400).json({ error: 'Invalid txSignature' });
        }
        try {
            const db = getDb();
            // Deduplicate by txSignature
            const existing = await db.collection(COLLECTION)
                .where('txSignature', '==', txSignature)
                .limit(1)
                .get();
            if (!existing.empty) {
                return res.status(200).json({ success: true, duplicate: true });
            }
            await db.collection(COLLECTION).add({
                wallet: wallet.trim(),
                amount,
                txSignature,
                createdAt: new Date(),
            });
            console.log(`[burn-record] ✅ ${wallet.slice(0, 8)}... burned ${amount} NUX`);
            return res.status(200).json({ success: true });
        }
        catch (err) {
            console.error('[burn-record] Error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    // ─── GET: leaderboard ─────────────────────────────────────────────────────
    if (req.method === 'GET' && req.query.leaderboard === '1' || req.url?.includes('leaderboard')) {
        try {
            const db = getDb();
            const snap = await db.collection(COLLECTION).get();
            // Aggregate by wallet
            const map = new Map();
            snap.forEach(doc => {
                const d = doc.data();
                const existing = map.get(d.wallet);
                const burnDate = d.createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString();
                if (existing) {
                    existing.totalBurned += Number(d.amount);
                    existing.txCount += 1;
                    if (burnDate > existing.lastBurnAt)
                        existing.lastBurnAt = burnDate;
                }
                else {
                    map.set(d.wallet, { totalBurned: Number(d.amount), txCount: 1, lastBurnAt: burnDate });
                }
            });
            const entries = Array.from(map.entries())
                .map(([wallet, data]) => ({ wallet, ...data }))
                .sort((a, b) => b.totalBurned - a.totalBurned)
                .slice(0, 50);
            return res.status(200).json({ entries, total: snap.size });
        }
        catch (err) {
            console.error('[burn-leaderboard] Error:', err);
            return res.status(500).json({ entries: [], error: 'Internal server error' });
        }
    }
    return res.status(405).json({ error: 'Method not allowed' });
}
