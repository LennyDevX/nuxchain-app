/**
 * Wallet Search & Verification Script
 * Searches for a wallet in Firebase and analyzes if it's a real user or a bot.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const readline = require('readline');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json');
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const MIN_SOL_BALANCE = 0.001;

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
    console.error('❌ Failed to initialize Firebase Admin.');
    console.error(`Please ensure the service account key exists at: ${SERVICE_ACCOUNT_PATH}`);
    process.exit(1);
}

const connection = new Connection(SOLANA_RPC, 'confirmed');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ============================================================================
// CORE LOGIC
// ============================================================================

async function checkSolanaBalance(wallet) {
    try {
        const pubkey = new PublicKey(wallet);
        const balance = await connection.getBalance(pubkey);
        return balance / LAMPORTS_PER_SOL;
    } catch (err) {
        return null;
    }
}

async function getIPRegistrationCount(ip) {
    if (!ip || ip === 'unknown') return 0;
    const snapshot = await db.collection(COLLECTION_NAME).where('ipAddress', '==', ip).get();
    return snapshot.size;
}

async function searchWallet(walletAddress) {
    console.log(`\n🔍 Searching for: ${walletAddress}...`);

    // Search for the wallet in Firestore
    const snapshot = await db.collection(COLLECTION_NAME).where('wallet', '==', walletAddress).get();

    if (snapshot.empty) {
        console.log('❌ No registration found for this wallet address.');
        return;
    }

    const userData = snapshot.docs[0].data();
    const docId = snapshot.docs[0].id;
    
    console.log('\n--- 📝 REGISTRATION DETAILS ---');
    console.log(`Document ID: ${docId}`);
    console.log(`Name:        ${userData.name || 'N/A'}`);
    console.log(`Email:       ${userData.email || 'N/A'}`);
    console.log(`Wallet:      ${userData.wallet}`);
    console.log(`IP Address:  ${userData.ipAddress || 'unknown'}`);
    console.log(`Created At:  ${userData.createdAt ? userData.createdAt.toDate().toLocaleString() : 'N/A'}`);

    console.log('\n--- 🛡️ INTEGRITY ANALYSIS ---');
    
    const reasons = [];
    let isSuspicious = false;

    // 1. EVM Check
    if (userData.wallet.startsWith('0x')) {
        isSuspicious = true;
        reasons.push('EVM Address (Only Solana addresses allowed)');
    }

    // 2. Solana Balance Check
    if (!userData.wallet.startsWith('0x')) {
        const balance = await checkSolanaBalance(userData.wallet);
        if (balance === null) {
            isSuspicious = true;
            reasons.push('Invalid Solana Public Key format');
        } else {
            console.log(`SOL Balance: ${balance.toFixed(6)} SOL`);
            if (balance < MIN_SOL_BALANCE) {
                isSuspicious = true;
                reasons.push(`Low Balance (${balance.toFixed(6)} SOL < ${MIN_SOL_BALANCE} threshold)`);
            }
        }
    }

    // 3. IP Farm Check
    const ipCount = await getIPRegistrationCount(userData.ipAddress);
    console.log(`Registrations from this IP: ${ipCount}`);
    if (ipCount > 3) {
        isSuspicious = true;
        reasons.push(`IP Farm Detected (${ipCount} registrations from the same IP)`);
    }

    // 4. Pattern check (Time Clustering - harder to do for a single user without context but can check if they registered at a peak time)
    // For now, we'll stick to the core ones.

    if (isSuspicious) {
        console.log('\n🚩 STATUS: SUSPICIOUS / BOT');
        console.log('Reasons:');
        reasons.forEach(r => console.log(`  - ${r}`));
    } else {
        console.log('\n✅ STATUS: REAL USER');
        console.log('All automated checks passed.');
    }
}

function ask() {
    rl.question('\nInput wallet address to search (or type "exit" to quit): ', async (answer) => {
        if (answer.toLowerCase() === 'exit') {
            rl.close();
            process.exit(0);
        }

        if (!answer.trim()) {
            console.log('Please enter a valid wallet address.');
            return ask();
        }

        try {
            await searchWallet(answer.trim());
        } catch (error) {
            console.error('An error occurred during search:', error);
        }
        
        ask();
    });
}

console.log('--- NUXCHAIN WALLET SEARCH TOOL ---');
ask();
