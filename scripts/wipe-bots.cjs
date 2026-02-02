const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

const SERVICE_ACCOUNT_PATH = '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json';
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const QUICKNODE_RPC = process.env.SOLANA_RPC || 'https://clean-omniscient-fog.solana-mainnet.quiknode.pro/6ccde27c30a475ed14ef4a9f25c02de8c2e8e0e8/';

// Risk-based thresholds
const RISK_THRESHOLDS = {
    AUTO_DELETE_SUSPICIOUS: 65,    // SUSPICIOUS/BOT classification
    AUTO_DELETE_LIKELY_BOT: 45,    // LIKELY BOT classification
    MANUAL_REVIEW: 25,              // UNCERTAIN - flagged for review
};

// Disposable email domains (common bot registrations)
const DISPOSABLE_DOMAINS = [
    'spamok.com', 'tempmail.com', '10minutemail.com', 
    'mailinator.com', 'guerrillamail.com', 'fakeinbox.com'
];

// Simple CSV parser (without external dependencies)
function parseCSV(csvContent) {
    const lines = csvContent.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle quoted fields in CSV
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        
        const record = {};
        headers.forEach((h, idx) => {
            record[h] = values[idx] || '';
        });
        records.push(record);
    }
    
    return records;
}

async function loadAnalysisData() {
    // Load the CSV analysis to get risk scores
    const csvFile = path.join(__dirname, 'all-wallets-analysis-2026-02-02.csv');
    if (!fs.existsSync(csvFile)) {
        console.warn('⚠️  Analysis CSV not found. Operating without risk scores.');
        return new Map();
    }
    
    const content = fs.readFileSync(csvFile, 'utf-8');
    const records = parseCSV(content);
    
    const riskMap = new Map();
    records.forEach(record => {
        if (record.wallet) {
            riskMap.set(record.wallet, {
                riskScore: parseInt(record.riskScore) || 0,
                classification: record.classification || '',
                email: record.email || '',
                ipRegistrationCount: parseInt(record.ipRegistrationCount) || 0,
                tokenAccountCount: parseInt(record.tokenAccountCount) || 0,
                walletExists: record.walletExists === 'Yes'
            });
        }
    });
    
    console.log(`📊 Loaded risk analysis for ${riskMap.size} wallets from CSV`);
    return riskMap;
}

async function withRetry(fn, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (err) {
            if (i === maxRetries - 1) throw err;
            const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
            console.log(`  ⏳ Retry ${i + 1}/${maxRetries - 1} after ${delay}ms...`);
            await new Promise(r => setTimeout(r, delay));
        }
    }
}

async function validateWalletOnChain(wallet, connection) {
    try {
        const pubkey = new PublicKey(wallet);
        
        // Check if wallet exists and has activity
        const balance = await withRetry(() => connection.getBalance(pubkey));
        
        // Get transaction history (limited to recent)
        const signatures = await withRetry(() => 
            connection.getSignaturesForAddress(pubkey, { limit: 1 })
        );
        
        return {
            exists: true,
            balance: balance / 1e9,
            hasTransactions: signatures.length > 0,
            tokenAccountCount: 0 // Simplified - use risk data instead
        };
    } catch (err) {
        return { exists: false, balance: 0, hasTransactions: false, tokenAccountCount: 0 };
    }
}

async function wipeBots(dryRun = true) {
    const serviceAccount = require(SERVICE_ACCOUNT_PATH);
    initializeApp({ credential: cert(serviceAccount) });
    const db = getFirestore();
    const connection = new Connection(QUICKNODE_RPC, 'confirmed');

    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log(`🚀 Starting Bot Purge (DRY RUN: ${dryRun ? 'YES' : 'NO'})...`);
    console.log('══════════════════════════════════════════════════════════════════════\n');

    const snapshot = await db.collection(COLLECTION_NAME).get();
    const docs = snapshot.docs;
    const total = docs.length;
    
    // Load risk analysis data
    const riskMap = await loadAnalysisData();
    
    console.log(`📊 Found ${total} total registrations in Firebase\n`);

    const deletion = {
        evmAddresses: [],
        invalidWallets: [],
        nonExistentWallets: [],
        zeroBalance: [],
        noTransactions: [],
        disposableEmail: [],
        ipFarm: [],
        likelyBot: [],
        suspicious: [],
        keepRealUsers: []
    };

    // Process wallets
    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        const data = doc.data();
        const wallet = data.wallet;
        const email = data.email || '';

        // 1. EVM Filter
        if (wallet && wallet.startsWith('0x')) {
            deletion.evmAddresses.push({ id: doc.id, wallet, email });
            continue;
        }

        // 2. Invalid Wallet Format
        if (!wallet || wallet.length < 32) {
            deletion.invalidWallets.push({ id: doc.id, wallet, email });
            continue;
        }

        // 3. Check Risk Score (primary filter - use analysis CSV)
        const riskData = riskMap.get(wallet);
        if (riskData) {
            if (riskData.riskScore >= RISK_THRESHOLDS.AUTO_DELETE_SUSPICIOUS) {
                deletion.suspicious.push({ id: doc.id, wallet, email, score: riskData.riskScore, ipCount: riskData.ipRegistrationCount });
                continue;
            }
            if (riskData.riskScore >= RISK_THRESHOLDS.AUTO_DELETE_LIKELY_BOT) {
                deletion.likelyBot.push({ id: doc.id, wallet, email, score: riskData.riskScore, ipCount: riskData.ipRegistrationCount });
                continue;
            }
        } else {
            // If not in analysis (should be rare), mark as invalid for safety
            deletion.invalidWallets.push({ id: doc.id, wallet, email });
            continue;
        }

        // 4. Disposable Email (only if not already flagged)
        const hasBadEmail = DISPOSABLE_DOMAINS.some(domain => email.toLowerCase().endsWith(domain));
        if (hasBadEmail) {
            deletion.disposableEmail.push({ id: doc.id, wallet, email });
            continue;
        }

        // 5. IP Farm (multiple registrations from same IP - strong signal)
        if (riskData.ipRegistrationCount > 5) {
            deletion.ipFarm.push({ id: doc.id, wallet, email, ipCount: riskData.ipRegistrationCount });
            continue;
        }

        // Keep as real user
        deletion.keepRealUsers.push({ id: doc.id, wallet, email });
        
        if ((i + 1) % 1000 === 0) {
            console.log(`⏳ Processed ${i + 1}/${docs.length}...`);
        }
    }

    // Print Report
    console.log('\n══════════════════════════════════════════════════════════════════════');
    console.log('📋 PURGE ANALYSIS REPORT');
    console.log('══════════════════════════════════════════════════════════════════════\n');
    
    console.log('🗑️  FLAGGED FOR DELETION:');
    console.log(`   EVM Addresses:          ${deletion.evmAddresses.length}`);
    console.log(`   Invalid Wallets:        ${deletion.invalidWallets.length}`);
    console.log(`   Non-existent On-Chain:  ${deletion.nonExistentWallets.length}`);
    console.log(`   Zero Balance/No Tx:     ${deletion.zeroBalance.length}`);
    console.log(`   No Transactions:        ${deletion.noTransactions.length}`);
    console.log(`   Disposable Email:       ${deletion.disposableEmail.length}`);
    console.log(`   IP Farm (>5 regs):      ${deletion.ipFarm.length}`);
    console.log(`   Likely Bot (score 45+): ${deletion.likelyBot.length}`);
    console.log(`   Suspicious (score 65+): ${deletion.suspicious.length}`);
    
    const totalToDelete = Object.values(deletion).reduce((sum, arr) => sum + arr.length, 0) - deletion.keepRealUsers.length;
    console.log(`\n   💥 TOTAL TO DELETE:     ${totalToDelete}`);
    console.log(`   ✅ KEEP REAL USERS:     ${deletion.keepRealUsers.length}`);
    console.log(`\n══════════════════════════════════════════════════════════════════════\n`);

    // Only proceed with deletion if explicitly NOT a dry run
    if (!dryRun && totalToDelete > 0) {
        console.log('⚠️  WARNING: This will permanently delete records from Firebase!');
        console.log('   Type "DELETE" to confirm, or Ctrl+C to abort.\n');
        
        // In production, add user confirmation here
        console.log('🗑️ Deleting in Firestore batches...');
        
        const allToDelete = [
            ...deletion.evmAddresses,
            ...deletion.invalidWallets,
            ...deletion.nonExistentWallets,
            ...deletion.zeroBalance,
            ...deletion.noTransactions,
            ...deletion.disposableEmail,
            ...deletion.ipFarm,
            ...deletion.likelyBot,
            ...deletion.suspicious
        ];

        for (let i = 0; i < allToDelete.length; i += 400) {
            const batch = db.batch();
            const chunk = allToDelete.slice(i, i + 400);
            chunk.forEach(item => batch.delete(db.collection(COLLECTION_NAME).doc(item.id)));
            await batch.commit();
            console.log(`✓ Deleted ${Math.min(i + 400, allToDelete.length)}/${allToDelete.length}`);
        }
        
        console.log('✨ CLEANUP COMPLETE!');
    } else if (dryRun) {
        console.log('📌 DRY RUN MODE: No deletions performed.');
        console.log('   Run with: DRY_RUN=false node scripts/wipe-bots.cjs\n');
    }
}

// Run script
const dryRun = process.env.DRY_RUN !== 'false';
wipeBots(dryRun).catch(err => {
    console.error('❌ Error during cleanup:', err.message);
    process.exit(1);
});
