#!/usr/bin/env node

/**
 * Advanced Wallet Search & Verification Script
 * Validates wallets with on-chain data, email intelligence, and device fingerprinting
 * Generates comprehensive CSV report of all findings
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const readline = require('readline');
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
const SOLANA_RPC = 'https://api.mainnet-beta.solana.com';
const MIN_SOL_BALANCE = 0.001;
const MIN_WALLET_AGE_DAYS = 30; // Consider wallets younger than 30 days suspicious

// Disposable email domains list (local validation)
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

// Suspicious patterns
const SUSPICIOUS_NAME_PATTERNS = [
  /^(user|test|admin|bot|fake|temp|test\d+)/i,
  /^[a-z]{1,3}(\d{5,})?$/i, // Short names with many numbers
  /^(123|000|999|666|111|222|333|444|555|777|888)/,
];

const SUSPICIOUS_EMAIL_PATTERNS = [
  /(\d{5,})/g, // Many consecutive numbers
  /(spam|test|bot|fake|temp|admin)/i,
];

// ============================================================================
// INITIALIZATION
// ============================================================================

let db;
let connection;
const reportData = [];

try {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  initializeApp({
    credential: cert(serviceAccount),
  });
  db = getFirestore();
  connection = new Connection(SOLANA_RPC, 'confirmed');
  console.log('✅ Firebase Admin & Solana RPC initialized');
} catch (error) {
  console.error('❌ Failed to initialize services.');
  console.error(`Firebase path: ${SERVICE_ACCOUNT_PATH}`);
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if email domain is disposable
 */
function isDisposableEmail(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_EMAIL_DOMAINS.has(domain) : false;
}

/**
 * Calculate email risk score
 */
function calculateEmailRiskScore(email) {
  let riskScore = 0;
  const reasons = [];

  // Check if disposable
  if (isDisposableEmail(email)) {
    riskScore += 30;
    reasons.push('Disposable email domain');
  }

  // Check suspicious patterns
  if (SUSPICIOUS_EMAIL_PATTERNS.some(pattern => pattern.test(email))) {
    riskScore += 20;
    reasons.push('Suspicious email pattern');
  }

  // Check for numbers only after @
  const localPart = email.split('@')[0];
  if (/^\d+$/.test(localPart)) {
    riskScore += 25;
    reasons.push('Email local part is numbers only');
  }

  return { riskScore: Math.min(riskScore, 100), reasons };
}

/**
 * Calculate name risk score
 */
function calculateNameRiskScore(name) {
  let riskScore = 0;
  const reasons = [];

  if (SUSPICIOUS_NAME_PATTERNS.some(pattern => pattern.test(name))) {
    riskScore += 35;
    reasons.push('Suspicious name pattern');
  }

  // Check for excessive uppercase
  const uppercaseRatio = (name.match(/[A-Z]/g) || []).length / name.length;
  if (uppercaseRatio > 0.7) {
    riskScore += 15;
    reasons.push('Excessive uppercase letters');
  }

  // Check length
  if (name.length < 5) {
    riskScore += 20;
    reasons.push('Name too short');
  }

  return { riskScore: Math.min(riskScore, 100), reasons };
}

/**
 * Get transaction count and wallet age from Solana
 */
async function getWalletOnChainData(walletAddress) {
  try {
    const pubkey = new PublicKey(walletAddress);

    // Get wallet info
    const accountInfo = await connection.getAccountInfo(pubkey);
    if (!accountInfo) {
      return {
        exists: false,
        transactionCount: 0,
        walletAge: 0,
        lamports: 0,
        error: 'Wallet does not exist on-chain',
      };
    }

    // Get balance
    const lamports = accountInfo.lamports;

    // Try to get transaction signatures
    let transactionCount = 0;
    try {
      const signatures = await connection.getSignaturesForAddress(pubkey, {
        limit: 1,
      });
      transactionCount = signatures.length;

      // Estimate wallet age if it has transactions
      let walletAge = 0;
      if (signatures.length > 0) {
        const lastTx = signatures[0];
        if (lastTx.blockTime) {
          const ageInMs = Date.now() - lastTx.blockTime * 1000;
          walletAge = Math.floor(ageInMs / (1000 * 60 * 60 * 24)); // Convert to days
        }
      }

      return {
        exists: true,
        transactionCount,
        walletAge,
        lamports,
        solBalance: lamports / LAMPORTS_PER_SOL,
      };
    } catch (sigError) {
      console.warn(`⚠️ Could not fetch transaction history for ${walletAddress}`);
      return {
        exists: true,
        transactionCount: 0,
        walletAge: 0,
        lamports,
        solBalance: lamports / LAMPORTS_PER_SOL,
        error: 'Transaction history unavailable',
      };
    }
  } catch (error) {
    return {
      exists: false,
      transactionCount: 0,
      walletAge: 0,
      lamports: 0,
      error: error.message,
    };
  }
}

/**
 * Calculate overall risk score based on all factors
 */
function calculateOverallRiskScore(userData, onChainData, emailRisk, nameRisk) {
  const scores = [];

  // Email risk (25% weight)
  scores.push({ weight: 0.25, score: emailRisk.riskScore });

  // Name risk (15% weight)
  scores.push({ weight: 0.15, score: nameRisk.riskScore });

  // Wallet on-chain factors (40% weight)
  let walletScore = 0;
  const walletReasons = [];

  if (!onChainData.exists) {
    walletScore = 100;
    walletReasons.push('Wallet does not exist on-chain');
  } else {
    // Balance check
    if (onChainData.solBalance < MIN_SOL_BALANCE) {
      walletScore += 25;
      walletReasons.push(`Low balance (${onChainData.solBalance.toFixed(6)} SOL)`);
    }

    // No transaction history
    if (onChainData.transactionCount === 0) {
      walletScore += 30;
      walletReasons.push('No transaction history');
    }

    // Very new wallet
    if (onChainData.walletAge < MIN_WALLET_AGE_DAYS && onChainData.walletAge > 0) {
      walletScore += 20;
      walletReasons.push(`Wallet very new (${onChainData.walletAge} days old)`);
    }
  }

  scores.push({ weight: 0.4, score: Math.min(walletScore, 100) });

  // Device/Browser factors (20% weight)
  let deviceScore = 0;
  const deviceReasons = [];

  // Check for suspicious browser patterns
  if (userData.browserName === 'Unknown') {
    deviceScore += 10;
    deviceReasons.push('Unknown browser');
  }

  // Check mobile vs desktop consistency
  if (userData.deviceType === 'mobile') {
    deviceScore += 5;
    deviceReasons.push('Mobile registration (less common for airdrop)');
  }

  // Check time to submit
  if (userData.timeToSubmit < 5000) {
    deviceScore += 15;
    deviceReasons.push('Very fast form submission');
  }

  scores.push({ weight: 0.2, score: Math.min(deviceScore, 100) });

  // Calculate weighted average
  const totalScore = scores.reduce((sum, item) => sum + item.weight * item.score, 0);

  return {
    totalScore: Math.round(totalScore),
    categoryBreakdown: {
      email: emailRisk.riskScore,
      name: nameRisk.riskScore,
      onChain: scores[2].score,
      device: scores[3].score,
    },
    allReasons: [
      ...emailRisk.reasons.map(r => `Email: ${r}`),
      ...nameRisk.reasons.map(r => `Name: ${r}`),
      ...walletReasons.map(r => `Wallet: ${r}`),
      ...deviceReasons.map(r => `Device: ${r}`),
    ],
  };
}

/**
 * Determine if user is real or bot based on risk score
 */
function classifyUser(riskScore) {
  if (riskScore >= 70) return { status: '🚩 SUSPICIOUS/BOT', confidence: 'HIGH' };
  if (riskScore >= 50) return { status: '⚠️ LIKELY BOT', confidence: 'MEDIUM' };
  if (riskScore >= 30) return { status: '❓ UNCERTAIN', confidence: 'LOW' };
  return { status: '✅ REAL USER', confidence: 'HIGH' };
}

/**
 * Main search function
 */
async function searchAndAnalyzeWallet(walletAddress) {
  console.log(`\n🔍 Searching for wallet: ${walletAddress}...`);

  const snapshot = await db
    .collection(COLLECTION_NAME)
    .where('wallet', '==', walletAddress)
    .get();

  if (snapshot.empty) {
    console.log('❌ No registration found for this wallet address.');
    return null;
  }

  const userData = snapshot.docs[0].data();
  const docId = snapshot.docs[0].id;

  console.log('\n📝 REGISTRATION DETAILS');
  console.log('─'.repeat(60));
  console.log(`Document ID:    ${docId}`);
  console.log(`Name:           ${userData.name || 'N/A'}`);
  console.log(`Email:          ${userData.email || 'N/A'}`);
  console.log(`Wallet:         ${userData.wallet}`);
  console.log(`IP Address:     ${userData.ipAddress || 'unknown'}`);
  console.log(`Created:        ${userData.createdAt ? userData.createdAt.toDate().toLocaleString() : 'N/A'}`);
  console.log(
    `Time to Submit: ${userData.timeToSubmit ? `${(userData.timeToSubmit / 1000).toFixed(1)}s` : 'N/A'}`
  );

  // 🔍 EMAIL INTELLIGENCE
  console.log('\n📧 EMAIL ANALYSIS');
  console.log('─'.repeat(60));
  const emailRisk = calculateEmailRiskScore(userData.email || '');
  console.log(`Risk Score: ${emailRisk.riskScore}/100`);
  if (emailRisk.reasons.length > 0) {
    console.log('Reasons:');
    emailRisk.reasons.forEach(r => console.log(`  • ${r}`));
  }

  // 👤 NAME ANALYSIS
  console.log('\n👤 NAME ANALYSIS');
  console.log('─'.repeat(60));
  const nameRisk = calculateNameRiskScore(userData.name || '');
  console.log(`Risk Score: ${nameRisk.riskScore}/100`);
  if (nameRisk.reasons.length > 0) {
    console.log('Reasons:');
    nameRisk.reasons.forEach(r => console.log(`  • ${r}`));
  }

  // 🔗 ON-CHAIN DATA
  console.log('\n🔗 ON-CHAIN DATA ANALYSIS');
  console.log('─'.repeat(60));
  const onChainData = await getWalletOnChainData(walletAddress);

  if (onChainData.error) {
    console.log(`⚠️ ${onChainData.error}`);
  } else {
    console.log(`Exists on-chain: ${onChainData.exists ? '✅ Yes' : '❌ No'}`);
    console.log(`Balance:         ${onChainData.solBalance.toFixed(6)} SOL`);
    console.log(
      `Transactions:    ${
        onChainData.transactionCount > 0
          ? `${onChainData.transactionCount} transaction(s)`
          : 'None'
      }`
    );
    console.log(
      `Wallet Age:      ${
        onChainData.walletAge > 0
          ? `${onChainData.walletAge} days old`
          : 'Unable to determine'
      }`
    );
  }

  // 🖥️ DEVICE & BROWSER INFO
  console.log('\n🖥️ DEVICE & BROWSER INFORMATION');
  console.log('─'.repeat(60));
  console.log(`Browser:        ${userData.browserName || 'Unknown'} ${userData.browserVersion || ''}`);
  console.log(`OS:             ${userData.osName || 'Unknown'}`);
  console.log(`Device Type:    ${userData.deviceType || 'Unknown'}`);
  console.log(`Resolution:     ${userData.screenResolution || 'Unknown'}`);
  console.log(`Timezone:       ${userData.timezone || 'Unknown'}`);
  console.log(`Language:       ${userData.language || 'Unknown'}`);

  // IP FARM CHECK
  console.log('\n🌐 IP FARM DETECTION');
  console.log('─'.repeat(60));
  const ipSnapshot = await db
    .collection(COLLECTION_NAME)
    .where('ipAddress', '==', userData.ipAddress)
    .get();
  const ipCount = ipSnapshot.size;
  console.log(`Registrations from IP: ${ipCount}`);
  if (ipCount > 3) {
    console.log(`⚠️ WARNING: ${ipCount} registrations from this IP (potential bot farm)`);
  }

  // 📊 OVERALL RISK ASSESSMENT
  console.log('\n📊 OVERALL RISK ASSESSMENT');
  console.log('─'.repeat(60));
  const riskAssessment = calculateOverallRiskScore(userData, onChainData, emailRisk, nameRisk);

  console.log(`Total Risk Score: ${riskAssessment.totalScore}/100`);
  console.log(`Category Breakdown:`);
  console.log(`  Email:     ${riskAssessment.categoryBreakdown.email}/100`);
  console.log(`  Name:      ${riskAssessment.categoryBreakdown.name}/100`);
  console.log(`  On-Chain:  ${riskAssessment.categoryBreakdown.onChain}/100`);
  console.log(`  Device:    ${riskAssessment.categoryBreakdown.device}/100`);

  const classification = classifyUser(riskAssessment.totalScore);
  console.log(`\n${classification.status}`);
  console.log(`Confidence: ${classification.confidence}`);

  if (riskAssessment.allReasons.length > 0) {
    console.log('\nRed Flags:');
    riskAssessment.allReasons.forEach(r => console.log(`  🚩 ${r}`));
  } else {
    console.log('\n✅ No major red flags detected');
  }

  // Store in report
  reportData.push({
    docId,
    name: userData.name || 'N/A',
    email: userData.email || 'N/A',
    wallet: userData.wallet,
    ipAddress: userData.ipAddress || 'unknown',
    createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : 'N/A',
    timeToSubmit: userData.timeToSubmit || 0,
    browser: `${userData.browserName || 'Unknown'} ${userData.browserVersion || ''}`,
    osName: userData.osName || 'Unknown',
    deviceType: userData.deviceType || 'Unknown',
    solBalance: onChainData.solBalance?.toFixed(6) || '0',
    transactionCount: onChainData.transactionCount || 0,
    walletAge: onChainData.walletAge || 0,
    walletExists: onChainData.exists ? 'Yes' : 'No',
    ipRegistrationCount: ipCount,
    riskScore: riskAssessment.totalScore,
    classification: classification.status.replace(/[^\w\s]/g, '').trim(),
    emailRiskScore: emailRisk.riskScore,
    nameRiskScore: nameRisk.riskScore,
    onChainRiskScore: riskAssessment.categoryBreakdown.onChain,
    deviceRiskScore: riskAssessment.categoryBreakdown.device,
  });

  return riskAssessment;
}

/**
 * Export report to CSV
 */
function exportReport() {
  if (reportData.length === 0) {
    console.log('\n⚠️ No data to export.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.join(__dirname, `wallet-analysis-report-${timestamp}.csv`);

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
        'timeToSubmit',
        'browser',
        'osName',
        'deviceType',
        'solBalance',
        'transactionCount',
        'walletAge',
        'walletExists',
        'ipRegistrationCount',
        'riskScore',
        'classification',
        'emailRiskScore',
        'nameRiskScore',
        'onChainRiskScore',
        'deviceRiskScore',
      ],
    });

    fs.writeFileSync(filename, csvContent);
    console.log(`\n✅ Report exported successfully!`);
    console.log(`📄 File: ${filename}`);
    console.log(`📊 Total records: ${reportData.length}`);

    // Calculate statistics
    const avgRisk = Math.round(reportData.reduce((sum, r) => sum + r.riskScore, 0) / reportData.length);
    const suspiciousCount = reportData.filter(r => r.riskScore >= 70).length;
    const realUserCount = reportData.filter(r => r.riskScore < 30).length;

    console.log(`\n📈 STATISTICS`);
    console.log(`─`.repeat(60));
    console.log(`Average Risk Score: ${avgRisk}/100`);
    console.log(`🚩 Suspicious/Bot: ${suspiciousCount} (${Math.round((suspiciousCount / reportData.length) * 100)}%)`);
    console.log(`✅ Real Users: ${realUserCount} (${Math.round((realUserCount / reportData.length) * 100)}%)`);
  } catch (error) {
    console.error('❌ Error exporting report:', error);
  }
}

/**
 * Interactive search loop
 */
function ask() {
  rl.question(
    '\n📍 Enter wallet address to search (or type "export" to save CSV report, "exit" to quit): ',
    async answer => {
      if (answer.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (answer.toLowerCase() === 'export') {
        exportReport();
        return ask();
      }

      if (!answer.trim()) {
        console.log('⚠️ Please enter a valid wallet address.');
        return ask();
      }

      try {
        await searchAndAnalyzeWallet(answer.trim());
      } catch (error) {
        console.error('❌ Error during search:', error.message);
      }

      ask();
    }
  );
}

console.log('═'.repeat(60));
console.log('🔍 ADVANCED WALLET ANALYSIS TOOL');
console.log('═'.repeat(60));
console.log('Features: On-chain data, Email validation, Device fingerprinting');
console.log('Export: CSV report with risk scores and classifications\n');
ask();
