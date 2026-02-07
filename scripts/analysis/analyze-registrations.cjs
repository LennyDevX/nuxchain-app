
/**
 * Airdrop Registration Analyzer & Cleanup Script
 * This script analyzes registrations in Firebase to identify bots.
 */

const path = require('path');
const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// CSV writer for detailed reporting
let csvWriter = null;
try {
  const { createObjectCsvWriter } = require('csv-writer');
  csvWriter = createObjectCsvWriter;
} catch (e) {
  console.warn('⚠️  csv-writer not installed. Install with: npm install csv-writer');
}

// ============================================================================
// CONFIGURATION
// ============================================================================

// 1. You need to download your serviceAccountKey.json from Firebase Console
// 2. Place it in the root directory
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../../serviceAccountKey.json');

// Solana RPC - using a public node
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';

// Analysis Thresholds
const MIN_SOL_BALANCE = 0.001; // Suspicious if less than this
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';

// ⚠️ SAFETY: Set to true to actually delete records
const DELETE_MODE = false;
const DRY_RUN = !DELETE_MODE;

// ============================================================================
// DATA VALIDATION & ANALYSIS CONFIG
// ============================================================================

const REQUIRED_FIELDS = [
    'name', 'email', 'wallet', 'fingerprint', 'ipAddress',
    'browserName', 'osName', 'timezone', 'language', 'status'
];

const TEMP_EMAIL_DOMAINS = [
    'tempmail.com', '10minutemail.com', 'guerrillamail.com',
    'mailinator.com', 'throwaway.email', 'temp-mail.org',
    'guerrillamail.info', 'mailnesia.com', 'yopmail.com'
];

const SUSPICIOUS_EMAIL_PATTERNS = [
    /^test/, /^demo/, /^bot/, /^user\d+/, /^admin/, /^aaa/,
    /^xxx/, /^fake/, /^spam/, /^noreply/
];

// ============================================================================
// RISK SCORING FUNCTION
// ============================================================================

function calculateRiskScore(user, metadata) {
    let score = 0;
    user.riskFactors = [];

    // 1. Balance Analysis (25 points max)
    if (user.balance !== undefined) {
        if (user.balance < 0.001) {
            score += 25;
            user.riskFactors.push('Zero/Low SOL balance');
        } else if (user.balance < 0.01) {
            score += 10;
            user.riskFactors.push('Minimal SOL balance');
        }
    }

    // 2. Data Completeness (20 points max)
    const missingFields = REQUIRED_FIELDS.filter(f => !user[f]).length;
    if (missingFields > 0) {
        score += missingFields * 5;
        user.riskFactors.push(`Missing ${missingFields} required fields`);
    }

    // 3. IP Farm Detection (30 points)
    if (user.ipAddress && metadata.ipCounts.get(user.ipAddress) > 3) {
        score += 30;
        user.riskFactors.push(`IP Farm: ${metadata.ipCounts.get(user.ipAddress)} wallets from IP`);
    }

    // 4. Device Farm Detection (35 points) - CRITICAL
    if (user.fingerprint && metadata.fingerprintCounts.get(user.fingerprint) > 1) {
        const count = metadata.fingerprintCounts.get(user.fingerprint);
        score += 35;
        user.riskFactors.push(`Device Farm: ${count} wallets from same device`);
    }

    // 5. Email Analysis (15 points max)
    const email = user.email?.toLowerCase() || '';
    const [localPart, domain] = email.split('@');
    
    if (TEMP_EMAIL_DOMAINS.includes(domain)) {
        score += 15;
        user.riskFactors.push(`Temporal email: ${domain}`);
    }
    
    if (SUSPICIOUS_EMAIL_PATTERNS.some(p => p.test(localPart))) {
        score += 10;
        user.riskFactors.push(`Suspicious email pattern`);
    }

    // 6. Time Cluster Detection (20 points)
    if (user.createdAt && user.createdAt !== 'unknown') {
        const date = new Date(user.createdAt);
        const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        if (metadata.timeClusters.get(minuteKey) > 15) {
            score += 20;
            user.riskFactors.push(`Time cluster: ${metadata.timeClusters.get(minuteKey)} regs/min`);
        }
    }

    // 7. EVM Address (40 points - instant red flag)
    if (user.wallet?.startsWith('0x')) {
        score += 40;
        user.riskFactors.push('EVM address on Solana airdrop');
    }

    // 8. Wrong Status (15 points)
    if (user.status && user.status !== 'registered') {
        score += 15;
        user.riskFactors.push(`Invalid status: ${user.status}`);
    }

    user.riskScore = Math.min(score, 100);
    return user.riskScore;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let db;
try {
    if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
        throw new Error(`Service account file not found at: ${SERVICE_ACCOUNT_PATH}`);
    }
    const serviceAccountRaw = fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8');
    const serviceAccount = JSON.parse(serviceAccountRaw);
    initializeApp({
        credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log('✅ Firebase Admin initialized');
} catch (error) {
    console.error('❌ Failed to initialize Firebase Admin.');
    console.error('Error:', error.message);
    console.error('Download serviceAccountKey.json from: Project Settings > Service Accounts > Generate new private key');
    process.exit(1);
}

const connection = new Connection(SOLANA_RPC, 'confirmed');

// ============================================================================
// CSV EXPORT FUNCTION
// ============================================================================

async function exportToCSV(records, csvWriterModule) {
    if (!csvWriterModule) {
        console.log('⚠️  CSV export skipped: csv-writer not installed');
        return;
    }

    try {
        const timestamp = new Date().toISOString().split('T')[0];
        const reportDir = path.join(__dirname, '../reports');
        
        // Create reports directory if it doesn't exist
        if (!fs.existsSync(reportDir)) {
            fs.mkdirSync(reportDir, { recursive: true });
        }

        const filePath = path.join(reportDir, `suspicious-registrations-${timestamp}.csv`);

        const writer = csvWriterModule({
            path: filePath,
            header: [
                { id: 'id', title: 'ID' },
                { id: 'name', title: 'Name' },
                { id: 'email', title: 'Email' },
                { id: 'wallet', title: 'Wallet' },
                { id: 'balance', title: 'SOL Balance' },
                { id: 'riskScore', title: 'Risk Score' },
                { id: 'riskFactors', title: 'Risk Factors' },
                { id: 'ipAddress', title: 'IP Address' },
                { id: 'fingerprint', title: 'Device Fingerprint' },
                { id: 'browserName', title: 'Browser' },
                { id: 'osName', title: 'Operating System' },
                { id: 'createdAt', title: 'Registered At' }
            ]
        });

        const recordsForCSV = records.map(r => ({
            ...r,
            riskFactors: r.riskFactors ? r.riskFactors.join('; ') : 'N/A'
        }));

        await writer.writeRecords(recordsForCSV);
        console.log(`\n✅ Report exported to: ${filePath}`);
        console.log(`📊 ${records.length} suspicious records exported for analysis`);
    } catch (error) {
        console.error('⚠️  Error exporting to CSV:', error.message);
    }
}

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

    // 3. Deep Pattern Recognition & Risk Scoring
    console.log('🕒 Performing deep pattern analysis...');
    const ipCounts = new Map();
    const fingerprintCounts = new Map();
    const emailDomains = new Map();
    const timeClusters = new Map();
    const reasonCounts = new Map();

    let allRecords = [...valid, ...suspicious];

    // Count patterns
    allRecords.forEach(user => {
        // IP Analysis
        if (user.ipAddress && user.ipAddress !== 'unknown') {
            ipCounts.set(user.ipAddress, (ipCounts.get(user.ipAddress) || 0) + 1);
        } else if (user.ip && user.ip !== 'unknown') {
            ipCounts.set(user.ip, (ipCounts.get(user.ip) || 0) + 1);
        }
        
        // Device Fingerprint Analysis (CRITICAL)
        if (user.fingerprint && user.fingerprint !== 'unknown') {
            fingerprintCounts.set(user.fingerprint, (fingerprintCounts.get(user.fingerprint) || 0) + 1);
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

    // Metadata for risk scoring
    const metadata = { ipCounts, fingerprintCounts, emailDomains, timeClusters, reasonCounts };

    // Calculate risk scores and identify bots
    valid = []; // Reset valid list
    suspicious = []; // Reset suspicious list
    
    allRecords.forEach(user => {
        const riskScore = calculateRiskScore(user, metadata);
        
        if (user.riskScore >= 50) {
            suspicious.push(user);
        } else {
            valid.push(user);
        }
        
        // Count factors
        if (user.riskFactors) {
            user.riskFactors.forEach(factor => {
                reasonCounts.set(factor, (reasonCounts.get(factor) || 0) + 1);
            });
        }
    });

    console.log('\n=== 📊 FINAL ANALYSIS REPORT ===');
    console.log(`✅ Valid Registrations: ${valid.length} (${(valid.length/total*100).toFixed(1)}%)`);
    console.log(`🚩 Total Suspicious/Bots Identified: ${suspicious.length} (${(suspicious.length/total*100).toFixed(1)}%)`);

    // Risk score distribution
    const riskScoreRanges = {
        '0-25': 0,
        '26-49': 0,
        '50-74': 0,
        '75-100': 0
    };
    
    allRecords.forEach(user => {
        if (user.riskScore < 26) riskScoreRanges['0-25']++;
        else if (user.riskScore < 50) riskScoreRanges['26-49']++;
        else if (user.riskScore < 75) riskScoreRanges['50-74']++;
        else riskScoreRanges['75-100']++;
    });

    console.log('\n--- RISK SCORE DISTRIBUTION ---');
    console.log(`Low Risk (0-25):       ${riskScoreRanges['0-25']} users`);
    console.log(`Medium Risk (26-49):   ${riskScoreRanges['26-49']} users`);
    console.log(`High Risk (50-74):     ${riskScoreRanges['50-74']} users`);
    console.log(`Critical Risk (75-100): ${riskScoreRanges['75-100']} users`);

    // Top risk factors
    console.log('\n--- TOP RISK FACTORS ---');
    Array.from(reasonCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([reason, count]) => {
            console.log(`  ${reason}: ${count} users`);
        });

    // Device farms (high priority)
    console.log('\n--- DEVICE FARMS DETECTED ---');
    const deviceFarms = Array.from(fingerprintCounts.entries())
        .filter(([_, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);
    
    if (deviceFarms.length > 0) {
        console.log(`Found ${deviceFarms.length} device fingerprints with multiple registrations:`);
        deviceFarms.slice(0, 10).forEach(([fp, count]) => {
            const users = suspicious.filter(u => u.fingerprint === fp).map(u => u.name).join(', ');
            console.log(`  Fingerprint: ${fp.substring(0, 16)}... | ${count} wallets | Users: ${users}`);
        });
    } else {
        console.log('✅ No device farms detected!');
    }

    // IP farms
    console.log('\n--- IP FARMS DETECTED ---');
    const ipFarms = Array.from(ipCounts.entries())
        .filter(([_, count]) => count > 3)
        .sort((a, b) => b[1] - a[1]);
    
    if (ipFarms.length > 0) {
        console.log(`Found ${ipFarms.length} IP addresses with multiple registrations:`);
        ipFarms.slice(0, 10).forEach(([ip, count]) => {
            const users = suspicious.filter(u => u.ipAddress === ip || u.ip === ip).map(u => u.name).join(', ');
            console.log(`  IP: ${ip} | ${count} wallets | Users: ${users.substring(0, 50)}...`);
        });
    } else {
        console.log('✅ No IP farms detected!');
    }

    // Export to CSV if csv-writer is available
    if (csvWriter && suspicious.length > 0) {
        await exportToCSV(suspicious, csvWriter);
    }

    if (suspicious.length > 0) {
        console.log('\n--- BOT SAMPLES (TOP 15) ---');
        suspicious.slice(0, 15).forEach(s => {
            const factors = s.riskFactors ? s.riskFactors.join(' | ') : 'N/A';
            console.log(`- ${s.name} | Wallet: ${s.wallet.substring(0, 20)}... | Risk: ${s.riskScore}/100 | ${factors}`);
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
            console.log(`>>> Edit line 28 of this script to: const DELETE_MODE = true;`);
        }
    }
}

analyzeRegistrations().catch(console.error);
