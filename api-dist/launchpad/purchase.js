import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getDb } from '../_services/firebase-admin.js';
const COLLECTION = 'launchpadPurchases';
const AIRDROP_COLLECTION = 'nuxchainAirdropRegistrations';
const TIER_PRICES = {
    1: 0.000015,
    2: 0.000025,
};
const TIER_CAPS = {
    1: 8_000_000, // 8% of supply — Whitelist phase
    2: 7_000_000, // 7% of supply — Public presale
};
const MIN_BUY = {
    1: 5_000,
    2: 1_000,
};
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
    const { wallet, txSignature, tier } = req.body;
    // --- 1. Input validation ---
    if (!wallet || !txSignature || !tier) {
        return res.status(400).json({ error: 'Missing required fields: wallet, txSignature, tier' });
    }
    if (![1, 2].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Must be 1 or 2.' });
    }
    const treasuryWallet = process.env.VITE_DEPLOYER_NUX;
    if (!treasuryWallet) {
        console.error('[purchase] VITE_DEPLOYER_NUX not set in environment');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    try {
        const db = getDb();
        // --- 2. Check duplicate tx ---
        const dupSnap = await db.collection(COLLECTION).where('txSignature', '==', txSignature).limit(1).get();
        if (!dupSnap.empty) {
            return res.status(409).json({ error: 'Transaction already registered' });
        }
        // --- 3. Verify on-chain ---
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
            return res.status(400).json({ error: 'Transaction failed or not found on-chain' });
        }
        // Find the SOL transfer to treasury
        const instructions = txInfo.transaction.message.instructions;
        let solReceived = 0;
        for (const ix of instructions) {
            if ('parsed' in ix && ix.parsed?.type === 'transfer') {
                const info = ix.parsed.info;
                if (info.destination === treasuryWallet && info.source === wallet) {
                    solReceived = Number(info.lamports) / LAMPORTS_PER_SOL;
                    break;
                }
            }
        }
        if (solReceived <= 0) {
            return res.status(400).json({ error: 'No valid SOL transfer to treasury found in transaction' });
        }
        // --- 4. Calculate NUX amount ---
        const price = TIER_PRICES[tier];
        const nuxAmount = Math.floor(solReceived / price);
        if (nuxAmount < MIN_BUY[tier]) {
            return res.status(400).json({
                error: `Minimum purchase is ${MIN_BUY[tier].toLocaleString()} NUX for Tier ${tier}`,
            });
        }
        // --- 5. Check tier cap not exceeded ---
        const tierSnap = await db
            .collection(COLLECTION)
            .where('tier', '==', tier)
            .where('status', 'in', ['confirmed', 'distributed'])
            .get();
        let totalSold = 0;
        tierSnap.docs.forEach((d) => { totalSold += Number(d.data().nuxAmount) || 0; });
        if (totalSold + nuxAmount > TIER_CAPS[tier]) {
            return res.status(400).json({ error: `Tier ${tier} is sold out` });
        }
        // --- 6. Get user name from airdrop if exists ---
        let userName = '';
        const airdropSnap = await db
            .collection(AIRDROP_COLLECTION)
            .where('wallet', '==', wallet)
            .limit(1)
            .get();
        if (!airdropSnap.empty) {
            userName = airdropSnap.docs[0].data().name || '';
        }
        // --- 7. Register purchase ---
        await db.collection(COLLECTION).add({
            wallet,
            txSignature,
            tier,
            solAmount: solReceived,
            nuxAmount,
            price,
            name: userName,
            status: 'confirmed',
            createdAt: new Date(),
        });
        return res.status(200).json({
            success: true,
            nuxAmount,
            solAmount: solReceived,
            tier,
        });
    }
    catch (err) {
        console.error('[purchase] Error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
