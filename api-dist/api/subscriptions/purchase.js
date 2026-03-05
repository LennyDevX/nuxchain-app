/**
 * POST /api/subscriptions/purchase
 *
 * Verifies a Solana transaction (SOL or NUX SPL) on-chain and activates a
 * NuxBee AI subscription in Firestore.
 *
 * Body: {
 *   wallet:       string  — Solana address of the subscriber
 *   txSignature:  string  — transaction signature
 *   tier:         'pro' | 'premium'
 *   paidWith:     'SOL' | 'NUX'
 * }
 *
 * Flow:
 * 1. Validate inputs
 * 2. Check for duplicate txSignature
 * 3. Verify tx on-chain (amount >= expected minimum)
 * 4. Write/update Firestore `subscriptions/{wallet}`
 * 5. Invalidate KV cache for this wallet
 */
import { Connection, PublicKey, LAMPORTS_PER_SOL, } from '@solana/web3.js';
import { getDb } from '../_services/firebase-admin.js';
import { kv } from '@vercel/kv';
import { SUBSCRIPTION_PRICES, TIER_SKILLS, SUBSCRIPTION_COLLECTION, } from '../../src/constants/subscription.js';
// NUX SPL mint address
const NUX_MINT = process.env.VITE_NUX_MINT_ADDRESS || 'AV9fNPXeLhyqGangnEdBkL355mqDbAi3gWU4AfzDcPZK';
const TREASURY_WALLET = process.env.VITE_DEPLOYER_NUX || 'GcfKd6DzFUANkRWkSwVp5YspaoRvS5j5GgRRvA8oBPXm';
const RPC_ENDPOINTS = [
    process.env.SOLANA_RPC_QUICKNODE,
    'https://solana-rpc.publicnode.com',
    'https://api.mainnet-beta.solana.com',
].filter(Boolean);
function getConnection() {
    return new Connection(RPC_ENDPOINTS[0], 'confirmed');
}
export default async function handler(req, res) {
    if (req.method === 'OPTIONS')
        return res.status(200).end();
    if (req.method !== 'POST')
        return res.status(405).json({ error: 'Method not allowed' });
    const { wallet, txSignature, tier, paidWith } = req.body;
    // ── 1. Validate inputs ──────────────────────────────────────────────────
    if (!wallet || !txSignature || !tier || !paidWith) {
        return res.status(400).json({ error: 'Missing required fields: wallet, txSignature, tier, paidWith' });
    }
    if (!['pro', 'premium'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Must be "pro" or "premium".' });
    }
    if (!['SOL', 'NUX'].includes(paidWith)) {
        return res.status(400).json({ error: 'Invalid paidWith. Must be "SOL" or "NUX".' });
    }
    try {
        new PublicKey(wallet);
    }
    catch {
        return res.status(400).json({ error: 'Invalid Solana wallet address.' });
    }
    const tierConfig = SUBSCRIPTION_PRICES[tier];
    try {
        const db = getDb();
        // ── 2. Duplicate check ──────────────────────────────────────────────────
        const dupSnap = await db
            .collection(SUBSCRIPTION_COLLECTION)
            .where('lastTxSignature', '==', txSignature)
            .limit(1)
            .get();
        if (!dupSnap.empty) {
            return res.status(409).json({ error: 'Transaction already registered' });
        }
        // ── 3. Verify on-chain ──────────────────────────────────────────────────
        const connection = getConnection();
        let txInfo;
        try {
            txInfo = await connection.getParsedTransaction(txSignature, {
                maxSupportedTransactionVersion: 0,
                commitment: 'confirmed',
            });
        }
        catch {
            return res.status(400).json({ error: 'Could not fetch transaction. Please try again.' });
        }
        if (!txInfo || txInfo.meta?.err) {
            return res.status(400).json({ error: 'Transaction failed or not found on-chain.' });
        }
        const instructions = txInfo.transaction.message.instructions;
        let verified = false;
        let amountPaid = 0;
        if (paidWith === 'SOL') {
            // Look for a SOL transfer to treasury with >= minimum amount
            for (const ix of instructions) {
                if ('parsed' in ix && ix.parsed?.type === 'transfer') {
                    const info = ix.parsed.info;
                    if (info.destination === TREASURY_WALLET && info.source === wallet) {
                        const solSent = Number(info.lamports) / LAMPORTS_PER_SOL;
                        if (solSent >= tierConfig.minSol * 0.95) { // 5% slippage tolerance
                            verified = true;
                            amountPaid = solSent;
                            break;
                        }
                    }
                }
            }
            if (!verified) {
                return res.status(400).json({
                    error: `No valid SOL transfer found. Expected ≥ ${tierConfig.minSol} SOL to treasury.`,
                });
            }
        }
        else {
            // NUX SPL token transfer
            const innerInstructions = txInfo.meta?.innerInstructions || [];
            for (const inner of innerInstructions) {
                for (const ix of inner.instructions) {
                    if ('parsed' in ix && (ix.parsed?.type === 'transfer' || ix.parsed?.type === 'transferChecked')) {
                        const info = ix.parsed.info;
                        const mint = info.mint;
                        if (mint === NUX_MINT) {
                            const tokenAmount = info.tokenAmount?.uiAmount || 0;
                            if (tokenAmount >= tierConfig.nux * 0.95) {
                                verified = true;
                                amountPaid = tokenAmount;
                                break;
                            }
                        }
                    }
                }
                if (verified)
                    break;
            }
            if (!verified) {
                return res.status(400).json({
                    error: `No valid NUX transfer found. Expected ≥ ${tierConfig.nux.toLocaleString()} NUX.`,
                });
            }
        }
        // ── 4. Write subscription to Firestore ──────────────────────────────────
        const now = new Date();
        const expiryDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
        const existingSnap = await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).get();
        const prevExpiry = existingSnap.exists
            ? (existingSnap.data()?.expiryDate?.toDate?.() || new Date(0))
            : new Date(0);
        // If current subscription still active, extend from current expiry date
        const baseDate = prevExpiry > now ? prevExpiry : now;
        const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
        await db.collection(SUBSCRIPTION_COLLECTION).doc(wallet).set({
            wallet,
            tier,
            paidWith,
            amountPaid,
            lastTxSignature: txSignature,
            startDate: existingSnap.exists ? existingSnap.data()?.startDate : now,
            expiryDate: newExpiry,
            activeSkills: TIER_SKILLS[tier],
            addOns: existingSnap.exists ? (existingSnap.data()?.addOns || []) : [],
            status: 'active',
            renewCount: (existingSnap.data()?.renewCount || 0) + 1,
            updatedAt: now,
        }, { merge: true });
        // ── 5. Invalidate KV cache ──────────────────────────────────────────────
        try {
            await kv.del(`sub:${wallet}`);
        }
        catch { /* non-fatal */ }
        console.log(`[subscription/purchase] ✅ ${wallet} → ${tier} (${paidWith}) until ${newExpiry.toISOString()}`);
        return res.status(200).json({
            success: true,
            tier,
            expiryDate: newExpiry.toISOString(),
            activeSkills: TIER_SKILLS[tier],
        });
    }
    catch (err) {
        console.error('[subscription/purchase] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
