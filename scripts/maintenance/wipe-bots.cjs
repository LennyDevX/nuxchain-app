const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// serviceAccountKey.json está en la raíz del proyecto y está en .gitignore (nunca se sube a git)
const SERVICE_ACCOUNT_PATH = path.resolve(__dirname, '../../serviceAccountKey.json');
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';

require('dotenv').config();

// ⚡ Risk-based deletion thresholds (Based on CSV analysis)
const DELETE_RULES = {
    AUTO_DELETE_BOT: 75,           // Likely Bot (score >= 75)
    AUTO_DELETE_SUSPICIOUS: 65,    // Suspicious (score >= 65)
    KEEP_UNCERTAIN: 30,            // Uncertain: Keep for manual review (30-50)
    KEEP_REAL: 0,                  // Real User (0-30): Always keep
};

// 🛡️ Protection rules - NEVER delete these regardless of other signals
const PROTECTION_RULES = {
    CERTIFIED_HUMAN_MAX_SCORE: 15,  // 0-15 score = Certified Human, always protected
    TRUST_INDICATOR_THRESHOLD: 40,  // Must have +40 trust score (e.g., veteran + cex)
    VETERAN_WALLET_MIN_DAYS: 180,   // 6+ months old wallets are protected
    CEX_FUNDED_BONUS: true,         // CEX funded wallets get extra protection
};

// Indicators that indicate a REAL user (positive signals with + prefix)
const TRUST_INDICATORS = [
    '+veteran-wallet',    // 6+ months old
    '+established-wallet', // 3+ months old
    '+cex-funded',        // Funded by known CEX
    '+power-user',        // 100+ transactions
    '+whale',             // 1+ SOL balance
];

// ============================================================================
// CSV PARSING & ANALYSIS LOADING
// ============================================================================

/**
 * Robust CSV parser that handles quoted fields and edge cases
 */
function parseCSV(csvContent) {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

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

/**
 * Load latest analysis report from CSV
 * Returns Map of wallet -> {riskScore, classification, email, indicators}
 */
async function loadAnalysisReport() {
    const reportsDir = path.join(__dirname, '../reports/');
    const files = fs.readdirSync(reportsDir)
        .filter(f => f.startsWith('airdrop-analysis-hybrid-') && f.endsWith('.csv'))
        .sort()
        .reverse();

    if (files.length === 0) {
        console.warn('⚠️  No analysis report found (airdrop-analysis-hybrid-*.csv)');
        console.warn('⚠️  Cannot proceed without analysis data.\n');
        return null;
    }

    const latestFile = path.join(reportsDir, files[0]);
    console.log(`📂 Using analysis report: ${files[0]}\n`);

    const content = fs.readFileSync(latestFile, 'utf-8');
    const records = parseCSV(content);

    const riskMap = new Map();
    records.forEach(record => {
        const wallet = record.wallet || record.walletAddress || '';
        if (wallet.trim()) {
            riskMap.set(wallet.trim(), {
                riskScore: parseInt(record.riskScore) || 0,
                classification: record.classification || 'Unknown',
                email: record.email || 'N/A',
                indicators: record.indicators || '',
                txCount: parseInt(record.txCount) || 0,
                ageDays: parseInt(record.ageDays) || 0,
            });
        }
    });

    console.log(`📊 Loaded analysis for ${riskMap.size} wallets from CSV`);
    return riskMap;
}

// ============================================================================
// BOT PURGE ENGINE
// ============================================================================

async function wipeBots(dryRun = true) {
    try {
        const serviceAccount = require(SERVICE_ACCOUNT_PATH);
        initializeApp({ credential: cert(serviceAccount) });
        const db = getFirestore();

        console.log('\n' + '═'.repeat(70));
        console.log(`🚀 Bot Purge Engine - DRY RUN: ${dryRun ? 'YES ✓' : 'NO ⚠️'}`);
        console.log('═'.repeat(70) + '\n');

        // ====== STEP 1: Load Analysis Report ======
        const riskMap = await loadAnalysisReport();
        if (!riskMap || riskMap.size === 0) {
            console.error('❌ No analysis data available. Aborting purge.\n');
            process.exit(1);
        }

        // ====== STEP 2: Load Firebase Registrations ======
        console.log('📥 Loading Firebase registrations...');
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const docs = snapshot.docs;
        console.log(`✅ Found ${docs.length} total registrations\n`);

        // ====== STEP 3: Classify Wallets for Deletion ======
        const classification = {
            toDelete: [],           // Bots & Suspicious
            toKeep: [],             // Real users & Uncertain (for review)
            certifiedHumans: [],    // 🏆 NEVER DELETE - Best users (0-15 score)
            protectedVeterans: [],  // 🛡️ Protected: 6+ months old or CEX funded
            noAnalysis: [],         // Not in analysis report
            invalidFormat: []       // EVM or malformed
        };

        console.log('🔍 Classifying wallets...');
        let processedCount = 0;

        for (const doc of docs) {
            const data = doc.data();
            const wallet = data.wallet?.trim() || '';

            // 1. Invalid Format Check
            if (!wallet || wallet.length < 32) {
                classification.invalidFormat.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    reason: wallet?.startsWith('0x') ? 'EVM Address' : 'Invalid Format'
                });
                processedCount++;
                continue;
            }

            // 2. Get Risk Analysis
            const riskData = riskMap.get(wallet);

            if (!riskData) {
                // NOT IN ANALYSIS REPORT (Safety-first: Keep)
                classification.noAnalysis.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A'
                });
                processedCount++;
                continue;
            }

            // 3. Risk-based Classification with Protection Logic
            const { riskScore, classification: status, indicators } = riskData;

            // 🛡️ PROTECTION CHECKS - Never delete these users
            const hasTrustIndicators = indicators && TRUST_INDICATORS.some(ti => indicators.includes(ti));
            const isCertifiedHuman = status === 'Certified Human' || riskScore <= PROTECTION_RULES.CERTIFIED_HUMAN_MAX_SCORE;
            const isVeteranWallet = indicators && indicators.includes('+veteran-wallet');
            const isCEXFunded = indicators && indicators.includes('+cex-funded');
            const isProtected = isCertifiedHuman || (isVeteranWallet && isCEXFunded) || (isVeteranWallet && hasTrustIndicators);

            // 🏆 CERTIFIED HUMANS - Never delete
            if (isCertifiedHuman) {
                classification.certifiedHumans.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    status,
                    riskScore,
                    indicators
                });
            }
            // 🛡️ PROTECTED VETERANS - Never delete (veteran + trust signals)
            else if (isProtected) {
                classification.protectedVeterans.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    status,
                    riskScore,
                    reason: `Protected: ${isVeteranWallet ? 'veteran' : ''} ${isCEXFunded ? 'cex-funded' : ''} ${hasTrustIndicators ? 'trust-indicators' : ''}`.trim()
                });
            }
            // 🗑️ LIKELY BOTS - Delete
            else if (status === 'Likely Bot' || riskScore >= DELETE_RULES.AUTO_DELETE_BOT) {
                classification.toDelete.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    reason: `Likely Bot (${riskScore}/100)`,
                    riskScore,
                    status
                });
            }
            // 🗑️ SUSPICIOUS - Delete
            else if (status === 'Suspicious' || riskScore >= DELETE_RULES.AUTO_DELETE_SUSPICIOUS) {
                classification.toDelete.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    reason: `Suspicious (${riskScore}/100)`,
                    riskScore,
                    status
                });
            }
            // ✅ REAL USERS & UNCERTAIN - Keep
            else {
                classification.toKeep.push({
                    id: doc.id,
                    wallet,
                    email: data.email || 'N/A',
                    status,
                    riskScore
                });
            }

            processedCount++;
            if (processedCount % 500 === 0) {
                console.log(`  ⏳ Processed ${processedCount}/${docs.length}...`);
            }
        }

        // ====== STEP 4: Generate Report ======
        console.log('\n' + '═'.repeat(70));
        console.log('📊 PURGE ANALYSIS REPORT');
        console.log('═'.repeat(70) + '\n');

        const totalToDelete = classification.toDelete.length;
        const totalToKeep = classification.toKeep.length;
        const certifiedHumans = classification.certifiedHumans.length;
        const protectedVeterans = classification.protectedVeterans.length;
        const totalProtected = certifiedHumans + protectedVeterans + totalToKeep;

        console.log('�️  PROTECTED (Will NEVER be deleted):');
        console.log(`   ${certifiedHumans.toString().padStart(4)} 🏆 Certified Humans (0-15 score)`);
        console.log(`   ${protectedVeterans.toString().padStart(4)} 🛡️  Protected Veterans (6mo+ & trust signals)`);
        console.log(`   ${totalToKeep.toString().padStart(4)} ✅ Real Users & Uncertain`);
        console.log(`   ${classification.noAnalysis.length.toString().padStart(4)} 📋 No analysis data (safety: keep)`);
        console.log(`   ${totalProtected.toString().padStart(4)} TOTAL PROTECTED\n`);

        console.log('🗑️  FOR DELETION:');
        console.log(`   ${classification.invalidFormat.length.toString().padStart(4)} EVM/Invalid Wallets`);
        console.log(`   ${totalToDelete.toString().padStart(4)} Bots & Suspicious (from analysis)`);
        console.log(`   ${(classification.invalidFormat.length + totalToDelete).toString().padStart(4)} TOTAL DELETE\n`);

        console.log(`📈 Efficiency: ${((totalToDelete / docs.length) * 100).toFixed(1)}% of DB will be cleaned`);
        console.log(`🛡️  Protection Rate: ${((totalProtected / docs.length) * 100).toFixed(1)}% of DB is protected\n`);

        // ====== STEP 5: Detailed Breakdown (if not dry-run) ======
        if (!dryRun && totalToDelete > 0) {
            console.log('🔴 TOP BOTS FOR DELETION:');
            classification.toDelete
                .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))
                .slice(0, 10)
                .forEach((item, idx) => {
                    console.log(`   ${idx + 1}. ${item.wallet.substring(0, 8)}... (${item.email}) - Score: ${item.riskScore} [${item.status}]`);
                });
            console.log('');
        }

        if (certifiedHumans > 0) {
            console.log('🏆 CERTIFIED HUMANS PROTECTED:');
            classification.certifiedHumans
                .slice(0, 5)
                .forEach((item, idx) => {
                    console.log(`   ${idx + 1}. ${item.wallet.substring(0, 8)}... (${item.email}) - Score: ${item.riskScore}`);
                });
            if (certifiedHumans > 5) console.log(`   ... and ${certifiedHumans - 5} more`);
            console.log('');
        }

        // ====== STEP 6: Execute Deletion ======
        if (!dryRun && totalToDelete > 0) {
            console.log('⚠️  WARNING: Permanent deletion in progress...\n');

            const allToDelete = [
                ...classification.invalidFormat,
                ...classification.toDelete
            ];

            let deletedCount = 0;
            const batchSize = 500;

            for (let i = 0; i < allToDelete.length; i += batchSize) {
                const batch = db.batch();
                const chunk = allToDelete.slice(i, i + batchSize);

                chunk.forEach(item => {
                    batch.delete(db.collection(COLLECTION_NAME).doc(item.id));
                });

                await batch.commit();
                deletedCount += chunk.length;

                const percent = ((deletedCount / allToDelete.length) * 100).toFixed(1);
                console.log(
                    `   ✓ Deleted ${deletedCount}/${allToDelete.length} (${percent}%)`
                );
            }

            console.log(`\n✨ PURGE COMPLETE! Removed ${deletedCount} malicious registrations.\n`);
        } else if (dryRun) {
            console.log('📌 DRY RUN MODE: No actual deletions performed.');
            console.log('   To execute: DRY_RUN=false node scripts/maintenance/wipe-bots.cjs\n');
        } else if (totalToDelete === 0) {
            console.log('✨ Database is clean! No bots detected.\n');
        }

        console.log('═'.repeat(70));

    } catch (err) {
        console.error('\n❌ Fatal error:', err.message);
        console.error(err.stack);
        process.exit(1);
    }
}

// ============================================================================
// ENTRY POINT
// ============================================================================

const dryRun = process.env.DRY_RUN !== 'false';
wipeBots(dryRun).catch(err => {
    console.error('\n❌ Unhandled error:', err.message);
    process.exit(1);
});
