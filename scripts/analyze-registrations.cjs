
/**
 * Airdrop Registration Analyzer & Cleanup Script
 * This script analyzes registrations in Firebase to identify bots.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// ============================================================================
// CONFIGURATION
// ============================================================================

// 1. You need to download your serviceAccountKey.json from Firebase Console
// 2. Place it in this directory or update the path below.
const SERVICE_ACCOUNT_PATH = '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json';

// Solana RPC - using a public node
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

// Analysis Thresholds
const MIN_SOL_BALANCE = 0.001; // Suspicious if less than this
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';

// ⚠️ SAFETY: Set to true to actually delete records
const DELETE_MODE = false;
const DRY_RUN = !DELETE_MODE;

// ============================================================================
// INITIALIZATION
// ============================================================================

let db;
try {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    initializeApp({
        credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin. Please ensure serviceAccountKey.json is present.');
    console.error('Download it from: Project Settings > Service Accounts > Generate new private key');
    process.exit(1);
}

const connection = new Connection(SOLANA_RPC, 'confirmed');

// ============================================================================
// MAIN ANALYSIS LOOP
// ============================================================================

async function analyzeRegistrations() {
    console.log('🚀 Starting registration analysis...');

    const snapshot = await db.collection(COLLECTION_NAME).orderBy('createdAt', 'asc').get();
    const total = snapshot.size;
    console.log(`📊 Total registrations found: ${total}`);

    const suspicious = [];
    const valid = [];

    let processed = 0; // Initialize processed count

    // 1. Instant Filter: Handle EVM addresses first (no RPC needed)
    console.log('� Identifying EVM addresses...');
    const solanaDocs = [];
    snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.wallet?.startsWith('0x')) {
            suspicious.push({
                id: doc.id,
                name: data.name,
                email: data.email,
                wallet: data.wallet,
                balance: 0,
                createdAt: data.createdAt?.toDate?.() || 'unknown',
                ip: data.ipAddress || 'unknown',
                reasons: ['EVM Address Detected (0x)']
            });
            processed++;
        } else {
            solanaDocs.push(doc);
        }
    });

    if (processed > 0) console.log(`✨ Pre-filtered ${processed} EVM addresses instantly.`);

    // 2. Throttled RPC Analysis: Handle Solana addresses
    const CONCURRENCY = 4; // Lower concurrency to be safer with public RPCs
    const solanaChunks = [];
    for (let i = 0; i < solanaDocs.length; i += CONCURRENCY) {
        solanaChunks.push(solanaDocs.slice(i, i + CONCURRENCY));
    }

    console.log(`🚀 Starting throttled Solana analysis (${solanaDocs.length} wallets, 4 at a time)...`);

    let lastLogged = 0;

    for (let i = 0; i < solanaChunks.length; i++) {
        const chunk = solanaChunks[i];

        await Promise.all(chunk.map(async (doc) => {
            const data = doc.data();
            const id = doc.id;
            const wallet = data.wallet;

            if (!wallet) return;

            try {
                let solBalance = 0;
                let success = false;
                let retries = 0;

                while (!success && retries < 3) {
                    try {
                        const pubkey = new PublicKey(wallet);
                        const balance = await connection.getBalance(pubkey, 'confirmed');
                        solBalance = balance / LAMPORTS_PER_SOL;
                        success = true;
                    } catch (err) {
                        if (err.message.includes('429')) {
                            console.log(`⚠️ Rate limit (429) hit at ${processed}/${total}. Waiting to retry...`);
                            const delay = 6000 + (Math.random() * 3000);
                            await new Promise(r => setTimeout(r, delay));
                            retries++;
                        } else {
                            throw err;
                        }
                    }
                }

                const isLowBalance = solBalance < MIN_SOL_BALANCE;
                const record = {
                    id,
                    name: data.name,
                    email: data.email,
                    wallet: data.wallet,
                    balance: solBalance,
                    ip: data.ipAddress || 'unknown',
                    createdAt: data.createdAt?.toDate?.() || 'unknown',
                    reasons: []
                };

                if (isLowBalance) record.reasons.push(`Low Balance (${solBalance.toFixed(6)} SOL)`);

                if (record.reasons.length > 0) {
                    suspicious.push(record);
                } else {
                    valid.push(record);
                }
            } catch (err) {
                suspicious.push({ id, ...data, reasons: [`Format Error: ${err.message}`] });
            }
        }));

        processed += chunk.length;
        if (processed - lastLogged >= 20 || processed === total) {
            const progress = Math.round((processed / total) * 100);
            console.log(`...processed ${processed}/${total} (${progress}%) | ${valid.length} real, ${suspicious.length} bots`);
            lastLogged = processed;
        }

        // Delay between chunks
        await new Promise(r => setTimeout(r, 1200));
    }

    // 3. Pattern Recognition: IP and Email batches
    console.log('🕒 Performing deep pattern analysis...');
    const ipCounts = new Map();
    const emailDomains = new Map();
    const timeClusters = new Map();

    const allRecords = [...valid, ...suspicious];

    allRecords.forEach(user => {
        // IP Analysis
        if (user.ip && user.ip !== 'unknown') {
            ipCounts.set(user.ip, (ipCounts.get(user.ip) || 0) + 1);
        }
        // Email Domain Analysis
        const domain = user.email?.split('@')[1];
        if (domain) {
            emailDomains.set(domain, (emailDomains.get(domain) || 0) + 1);
        }
        // Time Clusters
        if (user.createdAt && user.createdAt !== 'unknown') {
            const date = new Date(user.createdAt);
            const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
            timeClusters.set(minuteKey, (timeClusters.get(minuteKey) || 0) + 1);
        }
    });

    // Mark high density patterns as suspicious
    allRecords.forEach(user => {
        if (!user.reasons) user.reasons = [];

        // IP Batch (e.g., > 3 registrations per IP)
        if (user.ip && ipCounts.get(user.ip) > 3) {
            user.reasons.push(`IP Farm Detected (${ipCounts.get(user.ip)} regs from ${user.ip})`);
        }

        // Rapid Clustering (> 15 per minute)
        if (user.createdAt && user.createdAt !== 'unknown') {
            const date = new Date(user.createdAt);
            const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
            if (timeClusters.get(minuteKey) > 15) {
                user.reasons.push(`Time Cluster Pattern (${timeClusters.get(minuteKey)} regs/min)`);
            }
        }

        // If newly flagged, move to suspicious
        if (user.reasons.length > 0 && !suspicious.find(s => s.id === user.id)) {
            suspicious.push(user);
            const vIndex = valid.findIndex(v => v.id === user.id);
            if (vIndex > -1) valid.splice(vIndex, 1);
        }
    });

    console.log('\n--- FINAL ANALYSIS REPORT ---');
    console.log(`✅ Valid Registrations: ${valid.length}`);
    console.log(`🚩 Total Suspicious/Bots Identified: ${suspicious.length}`);

    if (suspicious.length > 0) {
        console.log('\n--- BOT SAMPLES TO BE REMOVED ---');
        suspicious.slice(0, 15).forEach(s => {
            console.log(`- ${s.name} | Wallet: ${s.wallet} | Reasons: ${s.reasons.join(', ')}`);
        });

        if (DELETE_MODE) {
            console.log(`\n🚨 DELETE_MODE ACTIVE 🚨`);
            console.log(`Starting mass deletion of ${suspicious.length} records...`);
            let deletedCount = 0;
            const batchLimit = 400; // Safer batch limit

            for (let i = 0; i < suspicious.length; i += batchLimit) {
                const batch = db.batch();
                const chunk = suspicious.slice(i, i + batchLimit);

                chunk.forEach(record => {
                    batch.delete(db.collection(COLLECTION_NAME).doc(record.id));
                });

                await batch.commit();
                deletedCount += chunk.length;
                console.log(`...successfully deleted ${deletedCount}/${suspicious.length}`);
            }
            console.log(`\n✨ CLEANUP COMPLETE: ${deletedCount} bots removed from database.`);
        } else {
            console.log(`\nℹ️  DRY RUN: No records were deleted.`);
            console.log(`>>> TO PERMANENTLY DELETE THESE ${suspicious.length} ENTRIES:`);
            console.log(`>>> Edit lines 27-28 of this script to: const DELETE_MODE = true;`);
        }
    }
}

analyzeRegistrations().catch(console.error);
