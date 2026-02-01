const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey } = require('@solana/web3.js');

const SERVICE_ACCOUNT_PATH = '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json';
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

async function wipeBots() {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore();
    const connection = new Connection(SOLANA_RPC, 'confirmed');

    console.log('🚀 Starting deep clean...');
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const docs = snapshot.docs;
    const total = docs.length;
    console.log(`📊 Found ${total} total records.`);

    const toDelete = [];
    const MIN_SOL_BALANCE = 0.001;

    // 1. Instant Filter: EVM
    const solanaDocs = [];
    docs.forEach(doc => {
        const wallet = doc.data().wallet;
        if (wallet && wallet.startsWith('0x')) {
            toDelete.push(doc.id);
        } else {
            solanaDocs.push(doc);
        }
    });
    console.log(`✨ Pre-filtered ${toDelete.length} EVM addresses instantly.`);

    // 2. Throttled Solana Analysis
    const CONCURRENCY = 5;
    const delayBetweenBatches = 2000;

    console.log(`🔍 Checking balances for ${solanaDocs.length} Solana wallets (5 at a time)...`);

    for (let i = 0; i < solanaDocs.length; i += CONCURRENCY) {
        const batch = solanaDocs.slice(i, i + CONCURRENCY);

        await Promise.all(batch.map(async (doc) => {
            const wallet = doc.data().wallet;
            try {
                const pubkey = new PublicKey(wallet);
                const balance = await connection.getBalance(pubkey);
                if (balance / 1e9 < MIN_SOL_BALANCE) {
                    toDelete.push(doc.id);
                }
            } catch (err) {
                // If invalid or RPC error, mark for deletion to be safe (bots often use junk strings)
                toDelete.push(doc.id);
            }
        }));

        if (i % 50 === 0) {
            console.log(`Analyzed ${i + batch.length}/${solanaDocs.length} Solana wallets... Total flagged: ${toDelete.length}`);
        }

        // Wait between batches to respect public RPC limits
        await new Promise(r => setTimeout(r, delayBetweenBatches));
    }

    console.log(`🚩 Final Count: ${toDelete.length} bots out of ${total} records.`);

    if (toDelete.length > 0) {
        console.log(`🗑️ Deleting ${toDelete.length} records in Firestore batches...`);
        for (let i = 0; i < toDelete.length; i += 400) {
            const batch = db.batch();
            const chunk = toDelete.slice(i, i + 400);
            chunk.forEach(id => batch.delete(db.collection(COLLECTION_NAME).doc(id)));
            await batch.commit();
            console.log(`Deleted ${Math.min(i + 400, toDelete.length)}/${toDelete.length}`);
        }
    }
    console.log('✨ CLEANUP COMPLETE. Your database is now purified.');
}

wipeBots().catch(console.error);
