#!/usr/bin/env node

/**
 * Bulk Wallet Analysis & Report Generation
 * Analyzes all registered wallets and generates comprehensive CSV report
 * Perfect for identifying bot networks and validating user base quality
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const path = require('path');
const fs = require('fs');
const csv = require('csv-stringify/sync');

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'
);
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
// ⚡ Use environment variable for Solana RPC to protect API key
const SOLANA_RPC = process.env.SOLANA_RPC_ALCHEMY || 'https://solana-mainnet.g.alchemy.com/v2/SkJXCcWzsabifZ1ZiCzoe';
const MIN_SOL_BALANCE = 0.01;
const MIN_WALLET_AGE_DAYS = 90;
const SIGNATURES_PAGE_LIMIT = 50; // Performance boost
const MAX_SIGNATURE_PAGES = 1; 
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const BATCH_SIZE = 6; // ⚡ ULTRA-CONSERVATIVE: 6 wallets per batch to avoid 429
const BATCH_DELAY_MS = 4500; // ⚡ 4.5 seconds between batches
const DEEP_DIVE_DELAY_MS = 1500; // ⚡ 1.5 seconds between wallet dives

/**
 * Utility to retry RPC calls with backoff on 429 errors
 */
async function withRetry(fn, maxRetries = 10) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isRateLimit = err.message?.includes('429') || 
                         err.message?.includes('Too Many Requests') || 
                         err.message?.includes('Limit Exceeded') ||
                         err.message?.includes('413');
      if (isRateLimit && i < maxRetries - 1) {
        // ⚡ More aggressive backoff: starts at 2s, goes up to 30s max
        const wait = Math.min(Math.pow(2, i) * 2000 + (Math.random() * 2000), 30000);
        console.log(`  ⏱️ 429 Rate Limit (attempt ${i+1}/${maxRetries}). Waiting ${Math.round(wait/1000)}s...`);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
  return null; 
}

async function getDetailedOnChainData(pubkey, initialBalance) {
  let transactionCount = 0;
  let walletAgeDays = 0;
  let lastTxAgeDays = 0;
  let tokenAccountCount = 0;
  let tokenMintsSample = '';

  // Only dive deep if there is some SOL or account exists
  // This saves 80% of RPC calls for fresh bot wallets
  try {
    const signatures = await withRetry(() => 
      connection.getSignaturesForAddress(pubkey, { limit: SIGNATURES_PAGE_LIMIT })
    );

    if (signatures && signatures.length > 0) {
      transactionCount = signatures.length;
      const newestBlockTime = signatures[0].blockTime;
      const oldestBlockTime = signatures[signatures.length - 1].blockTime;

      if (oldestBlockTime) {
        walletAgeDays = Math.floor((Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24));
      }
      if (newestBlockTime) {
        lastTxAgeDays = Math.floor((Date.now() - newestBlockTime * 1000) / (1000 * 60 * 60 * 24));
      }
    }
  } catch (e) {}

  try {
    const tokenAccounts = await withRetry(() => 
      connection.getParsedTokenAccountsByOwner(pubkey, { programId: TOKEN_PROGRAM_ID })
    );
    if (tokenAccounts) {
      tokenAccountCount = tokenAccounts.value.length;
      tokenMintsSample = tokenAccounts.value
        .slice(0, 3)
        .map(acc => acc.account.data.parsed?.info?.mint)
        .join('|');
    }
  } catch (e) {}

  return { transactionCount, walletAgeDays, lastTxAgeDays, tokenAccountCount, tokenMintsSample };
}

// Disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'yopmail.com',
  'temp-mail.org',
  'maildrop.cc',
  'mintemail.com',
  'sharklasers.com',
  'sneakemail.com',
  'trashmail.com',
  'tempmail.de',
  'nada.email',
  'fakeinbox.com',
  'spam4.me',
  'mytrashmail.com',
  'email.it',
  '10minutesemail.com',
  'grr.la',
  'welcomer.ws',
  'xmoxy.com',
  'pokemail.net',
  'tempmail.net',
  'maildance.com',
  'fakeemail.net',
  'thrashtalk.com',
  'trollbin.com',
  'wasteland.email',
  'mailnesia.com',
]);

const SUSPICIOUS_NAME_PATTERNS = [
  /^(user|test|admin|bot|fake|temp|test\d+)/i,
  /^[a-z]{1,3}(\d{5,})?$/i,
  /^(123|000|999|666|111|222|333|444|555|777|888)/,
];

const SUSPICIOUS_EMAIL_PATTERNS = [
  /(\d{5,})/g,
  /(spam|test|bot|fake|temp|admin)/i,
];

// ============================================================================
// INITIALIZATION
// ============================================================================

let db;
let connection;
const reportData = [];
let processedCount = 0;
let totalCount = 0;

try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore();
  connection = new Connection(SOLANA_RPC, 'confirmed');
  console.log('✅ Firebase & Solana RPC initialized\n');
  console.log(`📡 Using RPC: ${SOLANA_RPC}\n`);
} catch (error) {
  console.error('❌ Failed to initialize:', error.message);
  process.exit(1);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

function calculateEmailRiskScore(email) {
  let riskScore = 0;
  if (isDisposableEmail(email)) riskScore += 30;
  if (SUSPICIOUS_EMAIL_PATTERNS.some(p => p.test(email))) riskScore += 20;
  const localPart = email.split('@')[0];
  if (/^\d+$/.test(localPart)) riskScore += 25;
  return Math.min(riskScore, 100);
}

function calculateNameRiskScore(name) {
  let riskScore = 0;
  if (SUSPICIOUS_NAME_PATTERNS.some(p => p.test(name))) riskScore += 35;
  const uppercaseRatio = (name.match(/[A-Z]/g) || []).length / name.length;
  if (uppercaseRatio > 0.7) riskScore += 15;
  if (name.length < 5) riskScore += 20;
  return Math.min(riskScore, 100);
}

function calculateOverallRiskScore(userData, onChainData, emailRisk, nameRisk, flags) {
  const scores = [];

  // Email (20%)
  scores.push({ weight: 0.2, score: emailRisk });

  // Name (15%)
  scores.push({ weight: 0.15, score: nameRisk });

  // On-chain (45%) - INCREASED WEIGHT FOR BETTER DETECTION
  let walletScore = 0;
  if (!onChainData.exists) {
    walletScore = 100;
  } else {
    // Zero balance = STRONG bot indicator
    if (onChainData.solBalance === 0) walletScore += 40;
    else if (onChainData.solBalance < MIN_SOL_BALANCE) walletScore += 25;
    
    // No transactions = STRONG bot indicator
    if (onChainData.transactionCount === 0) walletScore += 35;
    
    // New wallet
    if (onChainData.walletAgeDays < MIN_WALLET_AGE_DAYS && onChainData.walletAgeDays > 0)
      walletScore += 25;
    
    // Zero token accounts = STRONG bot indicator
    if (onChainData.tokenAccountCount === 0) walletScore += 30;
    
    // Inactive wallet
    if (onChainData.lastTxAgeDays > 180) walletScore += 15;
  }
  scores.push({ weight: 0.45, score: Math.min(walletScore, 100) });

  // Network/Behavioral (20%)
  let deviceScore = 0;
  if (userData.browserName === 'Unknown') deviceScore += 15;
  if (userData.deviceType === 'mobile') deviceScore += 8;
  if (userData.timeToSubmit < 3000) deviceScore += 20;
  else if (userData.timeToSubmit < 5000) deviceScore += 12;
  if (flags?.ipFarm) deviceScore += 25;
  if (flags?.timeCluster) deviceScore += 20;
  scores.push({ weight: 0.2, score: Math.min(deviceScore, 100) });

  const totalScore = scores.reduce((sum, item) => sum + item.weight * item.score, 0);
  return Math.round(totalScore);
}

function getClassification(riskScore) {
  if (riskScore >= 65) return 'SUSPICIOUS/BOT';
  if (riskScore >= 45) return 'LIKELY BOT';
  if (riskScore >= 25) return 'UNCERTAIN';
  return 'REAL USER';
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function analyzeAllWallets() {
  console.log('📊 Starting bulk wallet analysis...\n');

  try {
    const snapshot = await db.collection(COLLECTION_NAME).get();
    totalCount = snapshot.size;
    console.log(`📈 Total registrations found: ${totalCount}\n`);

    if (totalCount === 0) {
      console.log('⚠️ No registrations found.');
      return;
    }

    // IP and time cluster maps for batch processing
    const ipCountMap = new Map();
    const timeClusterMap = new Map();
    const emailDomainMap = new Map();
    snapshot.docs.forEach(doc => {
      const ip = doc.data().ipAddress || 'unknown';
      ipCountMap.set(ip, (ipCountMap.get(ip) || 0) + 1);

      const email = doc.data().email || '';
      const domain = email.split('@')[1]?.toLowerCase();
      if (domain) {
        emailDomainMap.set(domain, (emailDomainMap.get(domain) || 0) + 1);
      }

      const createdAt = doc.data().createdAt?.toDate?.();
      if (createdAt) {
        const minuteKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}-${createdAt.getDate()} ${createdAt.getHours()}:${createdAt.getMinutes()}`;
        timeClusterMap.set(minuteKey, (timeClusterMap.get(minuteKey) || 0) + 1);
      }
    });

    // Process in batches
    const batchCount = Math.ceil(totalCount / BATCH_SIZE);

    for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
      const batch = snapshot.docs.slice(i, Math.min(i + BATCH_SIZE, snapshot.docs.length));
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;

      console.log(
        `⏳ Processing batch ${batchNum}/${batchCount} (${Math.min(
          i + BATCH_SIZE,
          totalCount
        )}/${totalCount})...`
      );

      // PHASE 1: GMA Optimization - Fetch balances in batch
      const solanaWallets = batch
        .map(doc => doc.data().wallet)
        .filter(w => w && !w.startsWith('0x'));
      
      const accountMap = new Map();
      if (solanaWallets.length > 0) {
        try {
          const pubkeys = solanaWallets.map(w => new PublicKey(w));
          const accountInfos = await withRetry(() => connection.getMultipleAccountsInfo(pubkeys)) || [];
          
          // Map results back to wallets
          solanaWallets.forEach((wallet, index) => {
            if (accountInfos[index]) {
              accountMap.set(wallet, accountInfos[index]);
            }
          });
        } catch (err) {
          console.error('  ⚠️ Batch GMA error:', err.message);
        }
      }

      // PHASE 2: Process batch sequentially to avoid hitting RPS limits
      for (let docIdx = 0; docIdx < batch.length; docIdx++) {
        const doc = batch[docIdx];
        const userData = doc.data();
        const docId = doc.id;
        const wallet = userData.wallet;

        try {
          // Skip EVM addresses
          if (wallet?.startsWith('0x')) {
            reportData.push({
              docId,
              name: userData.name || 'N/A',
              email: userData.email || 'N/A',
              wallet,
              walletExists: 'No (EVM)',
              riskScore: 100,
              classification: 'SUSPICIOUS/BOT',
              riskReasons: 'EVM address (Solana only)',
              ipAddress: userData.ipAddress || 'unknown',
              createdAt: userData.createdAt?.toDate?.()?.toISOString?.() || 'N/A',
              browser: 'N/A',
              osName: 'N/A',
              deviceType: 'N/A',
              timeToSubmit: 0,
              solBalance: '0',
              transactionCount: 0,
              walletAgeDays: 0,
              lastTxAgeDays: 0,
              tokenAccountCount: 0,
              tokenMintsSample: '',
              ipRegistrationCount: ipCountMap.get(userData.ipAddress || 'unknown') || 1,
              timeClusterCount: 0,
              emailDomainCount: 0,
              emailRiskScore: 100,
              nameRiskScore: 100,
            });
            processedCount++;
            continue;
          }

          // Get pre-fetched account info
          const accountInfo = accountMap.get(wallet);
          const solBalance = accountInfo ? accountInfo.lamports / LAMPORTS_PER_SOL : 0;
          
          let onChainData = {
            exists: !!accountInfo,
            solBalance,
            transactionCount: 0,
            walletAgeDays: 0,
            lastTxAgeDays: 0,
            tokenAccountCount: 0,
            tokenMintsSample: '',
          };

          // Deep dive only for accounts that exist
          if (accountInfo) {
            const details = await getDetailedOnChainData(new PublicKey(wallet), solBalance);
            onChainData = { ...onChainData, ...details };
            
            // Add delay between individual wallet deep dives to avoid rate limits
            if (docIdx < batch.length - 1) {
              await new Promise(r => setTimeout(r, DEEP_DIVE_DELAY_MS));
            }
          }

          // Calculate risk scores
          const emailRisk = calculateEmailRiskScore(userData.email || '');
          const nameRisk = calculateNameRiskScore(userData.name || '');
          const ipCount = ipCountMap.get(userData.ipAddress || 'unknown') || 1;
          const createdAtDateTime = userData.createdAt?.toDate?.();
          const minuteKey = createdAtDateTime
            ? `${createdAtDateTime.getFullYear()}-${createdAtDateTime.getMonth()}-${createdAtDateTime.getDate()} ${createdAtDateTime.getHours()}:${createdAtDateTime.getMinutes()}`
            : null;
          const timeClusterCount = minuteKey ? timeClusterMap.get(minuteKey) || 0 : 0;
          const emailDomainStr = (userData.email || '').split('@')[1]?.toLowerCase();
          const emailDomainCount = emailDomainStr ? emailDomainMap.get(emailDomainStr) || 0 : 0;

          const flags = {
            ipFarm: ipCount > 1,
            timeCluster: timeClusterCount > 8,
          };

          const totalRisk = calculateOverallRiskScore(userData, onChainData, emailRisk, nameRisk, flags);
          const riskReasons = [];
            if (!onChainData.exists) riskReasons.push('❌ Wallet does not exist');
            if (onChainData.solBalance === 0) riskReasons.push('💰 Zero SOL balance');
            else if (onChainData.solBalance < MIN_SOL_BALANCE) riskReasons.push('Low SOL balance');
            if (onChainData.transactionCount === 0) riskReasons.push('📊 No transactions');
            if (onChainData.walletAgeDays > 0 && onChainData.walletAgeDays < MIN_WALLET_AGE_DAYS) {
              riskReasons.push(`🕐 New wallet (${onChainData.walletAgeDays}d)`);
            }
            if (onChainData.tokenAccountCount === 0) riskReasons.push('🪙 No SPL tokens');
            if (onChainData.lastTxAgeDays > 180) riskReasons.push('Inactive (>180d)');
            if (flags.ipFarm) riskReasons.push(`🚨 IP farm (${ipCount} regs)`);
            if (flags.timeCluster) riskReasons.push(`⏰ Time cluster (${timeClusterCount}/min)`);
            if (isDisposableEmail(userData.email || '')) riskReasons.push('📧 Disposable email');
            if (userData.browserName === 'Unknown') riskReasons.push('🤖 Unknown browser');
            if (userData.timeToSubmit < 3000) riskReasons.push(`⚡ Ultra-fast (${userData.timeToSubmit}ms)`);
          reportData.push({
            docId,
            name: userData.name || 'N/A',
            email: userData.email || 'N/A',
            wallet: userData.wallet,
            ipAddress: userData.ipAddress || 'unknown',
            createdAt: userData.createdAt?.toDate?.()?.toISOString?.() || 'N/A',
            browser: `${userData.browserName || 'Unknown'} ${userData.browserVersion || ''}`.trim(),
            osName: userData.osName || 'Unknown',
            deviceType: userData.deviceType || 'Unknown',
            timeToSubmit: userData.timeToSubmit || 0,
            solBalance: onChainData.solBalance?.toFixed(6) || '0',
            transactionCount: onChainData.transactionCount || 0,
            walletAgeDays: onChainData.walletAgeDays || 0,
            lastTxAgeDays: onChainData.lastTxAgeDays || 0,
            tokenAccountCount: onChainData.tokenAccountCount || 0,
            tokenMintsSample: onChainData.tokenMintsSample || '',
            walletExists: onChainData.exists ? 'Yes' : 'No',
            ipRegistrationCount: ipCount,
            timeClusterCount,
            emailDomainCount,
            emailRiskScore: emailRisk,
            nameRiskScore: nameRisk,
            riskScore: totalRisk,
            classification: getClassification(totalRisk),
            riskReasons: riskReasons.join(' | '),
          });
          processedCount++;
        } catch (error) {
          console.error(`Error processing wallet ${userData.wallet}:`, error.message);
          processedCount++;
        }
      }

      // Extra safety delay before next batch
      if (batchNum < batchCount) {
        const extraDelay = Math.random() * 2000;
        await new Promise(r => setTimeout(r, extraDelay));
      }

      // Delay between batches
      if (batchNum < batchCount) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    // Sort by risk score descending
    reportData.sort((a, b) => b.riskScore - a.riskScore);

    // Export to CSV
    exportReport();
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  }
}

function exportReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const filename = path.join(__dirname, `all-wallets-analysis-${timestamp}.csv`);

  try {
    const csvContent = csv.stringify(reportData, {
      header: true,
      columns: [
        'docId',
        'name',
        'email',
        'wallet',
        'ipAddress',
        'createdAt',
        'browser',
        'osName',
        'deviceType',
        'timeToSubmit',
        'solBalance',
        'transactionCount',
        'walletAgeDays',
        'lastTxAgeDays',
        'tokenAccountCount',
        'tokenMintsSample',
        'walletExists',
        'ipRegistrationCount',
        'timeClusterCount',
        'emailDomainCount',
        'emailRiskScore',
        'nameRiskScore',
        'riskScore',
        'classification',
        'riskReasons',
      ],
    });

    fs.writeFileSync(filename, csvContent);

    // Calculate statistics
    const avgRisk = Math.round(reportData.reduce((sum, r) => sum + r.riskScore, 0) / reportData.length);
    const suspiciousCount = reportData.filter(r => r.riskScore >= 70).length;
    const likelyBotCount = reportData.filter(r => r.riskScore >= 50 && r.riskScore < 70).length;
    const uncertainCount = reportData.filter(r => r.riskScore >= 30 && r.riskScore < 50).length;
    const realUserCount = reportData.filter(r => r.riskScore < 30).length;
    const avgBalance = (
      reportData.reduce((sum, r) => sum + parseFloat(r.solBalance), 0) / reportData.length
    ).toFixed(6);
    const avgWalletAge = Math.round(reportData.reduce((sum, r) => sum + r.walletAgeDays, 0) / reportData.length);
    const zeroTransactionCount = reportData.filter(r => r.transactionCount === 0).length;
    const walletExistsCount = reportData.filter(r => r.walletExists === 'Yes').length;
    const zeroTokenAccounts = reportData.filter(r => r.tokenAccountCount === 0).length;

    console.log('\n✅ Report exported successfully!');
    console.log(`📄 File: ${filename}\n`);

    console.log('═'.repeat(70));
    console.log('📊 COMPREHENSIVE ANALYSIS REPORT');
    console.log('═'.repeat(70));

    console.log(`\n📈 REGISTRATION STATISTICS:`);
    console.log(`  Total Registrations:     ${totalCount}`);
    console.log(`  Processed Successfully:  ${processedCount}`);
    console.log(`  Wallets Existing On-Chain: ${walletExistsCount}/${totalCount}`);

    console.log(`\n🚩 RISK CLASSIFICATION:`);
    console.log(`  ✅ Real Users:           ${realUserCount} (${((realUserCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  ❓ Uncertain:            ${uncertainCount} (${((uncertainCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  ⚠️  Likely Bot:           ${likelyBotCount} (${((likelyBotCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  🚩 Suspicious/Bot:      ${suspiciousCount} (${((suspiciousCount / totalCount) * 100).toFixed(1)}%)`);

    console.log(`\n💰 WALLET STATISTICS:`);
    console.log(`  Average Balance:         ${avgBalance} SOL`);
    console.log(`  Average Wallet Age:      ${avgWalletAge} days`);
    console.log(`  Zero Transaction Count:  ${zeroTransactionCount} (${((zeroTransactionCount / totalCount) * 100).toFixed(1)}%)`);
    console.log(`  Zero Token Accounts:     ${zeroTokenAccounts} (${((zeroTokenAccounts / totalCount) * 100).toFixed(1)}%)`);

    console.log(`\n🎯 OVERALL METRICS:`);
    console.log(`  Average Risk Score:      ${avgRisk}/100`);
    console.log(`  Highest Risk Score:      ${reportData[0].riskScore}/100 (${reportData[0].name})`);
    console.log(`  Lowest Risk Score:       ${reportData[reportData.length - 1].riskScore}/100`);

    // Find top suspicious wallets
    console.log(`\n🔴 TOP 10 SUSPICIOUS WALLETS:`);
    console.log('─'.repeat(70));
    reportData.slice(0, 10).forEach((r, idx) => {
      console.log(
        `  ${idx + 1}. ${r.name.padEnd(20)} | Risk: ${r.riskScore.toString().padEnd(3)} | ${r.email}`
      );
    });

    // IP farm analysis
    const ipCounts = new Map();
    reportData.forEach(r => {
      const ip = r.ipAddress;
      ipCounts.set(ip, (ipCounts.get(ip) || 0) + 1);
    });

    const suspiciousIPs = Array.from(ipCounts.entries())
      .filter(([_, count]) => count > 3)
      .sort((a, b) => b[1] - a[1]);

    if (suspiciousIPs.length > 0) {
      console.log(`\n🌐 IP FARM DETECTION:`);
      console.log('─'.repeat(70));
      suspiciousIPs.slice(0, 10).forEach(([ip, count]) => {
        console.log(`  IP ${ip}: ${count} registrations`);
      });
    }

    console.log('\n' + '═'.repeat(70));
    console.log('✨ Analysis complete!\n');
  } catch (error) {
    console.error('❌ Error exporting report:', error);
  }
}

// Run analysis
analyzeAllWallets().catch(console.error);
