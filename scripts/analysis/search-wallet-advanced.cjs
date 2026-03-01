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

// serviceAccountKey.json está en la raíz del proyecto y está en .gitignore (nunca se sube a git)
const SERVICE_ACCOUNT_PATH = path.resolve(process.cwd(), 'serviceAccountKey.json');
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

// New wallet validation thresholds (UPDATED - matching wallet-analysis-service.ts)
const WALLET_VALIDATION_RULES = {
  MIN_WALLET_AGE_DAYS: 7, // Reduced from 30
  MIN_BALANCE: 0.05,
  MIN_TX_COUNT: 1,
  MIN_TX_COUNT_FOR_NEW_WALLETS: 3, // New wallets need 3+ txs
  NEW_WALLET_MAX_AGE: 14, // Days - threshold for new wallet
  NEW_WALLET_MIN_BALANCE: 0.1, // Balance for new wallets to pass
};

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
 * Calculate wallet risk score using intelligent new wallet detection
 * Matches the logic in wallet-analysis-service.ts
 */
function calculateWalletRiskScore(onChainData, transactionCount, walletAgeDays) {
  let riskScore = 0;
  const riskFactors = [];
  const isNewWallet = walletAgeDays < WALLET_VALIDATION_RULES.NEW_WALLET_MAX_AGE && walletAgeDays > 0;

  // Balance check
  if (onChainData.solBalance < WALLET_VALIDATION_RULES.MIN_BALANCE) {
    riskScore += 25;
    riskFactors.push('Low balance');
  } else if (onChainData.solBalance > 1) {
    riskScore -= 5;
    riskFactors.push('Healthy balance');
  }

  // Transaction activity - SMART DETECTION
  if (transactionCount === 0) {
    riskScore += 50;
    riskFactors.push('No transactions');
  } else if (transactionCount >= 3 && transactionCount < 10) {
    riskScore -= 5; // Real activity
    riskFactors.push('Confirmed activity (3-10 txs)');
  } else if (transactionCount >= 10) {
    riskScore -= 15;
    riskFactors.push('Active wallet (10+ txs)');
  }

  // Wallet age - SMART NEW WALLET DETECTION
  if (walletAgeDays === 0) {
    riskScore += 45;
    riskFactors.push('Brand new wallet');
  } else if (isNewWallet) {
    // New wallet (< 14 days) - check if it has legitimate activity
    if (transactionCount >= 3 && onChainData.solBalance >= WALLET_VALIDATION_RULES.NEW_WALLET_MIN_BALANCE) {
      riskScore += 5; // Low penalty for active new wallet
      riskFactors.push('🟢 New active wallet (REAL USER INDICATOR)');
    } else {
      riskScore += 20;
      riskFactors.push('Recently created');
    }
  } else if (walletAgeDays > 365) {
    riskScore -= 20;
    riskFactors.push('Established wallet (1+ year)');
  }

  return { riskScore: Math.min(100, Math.max(0, riskScore)), riskFactors };
}

/**
 * Determine if wallet is REAL or BOT based on intelligent rules
 */
function isRealWallet(walletData, emailRisk, nameRisk) {
  const { riskScore: walletRisk, riskFactors } = walletData.riskAnalysis;
  
  // NEW SMART LOGIC: Allow new wallets with legitimate activity
  const isNewWalletWithActivity = 
    walletData.walletAge > 0 && 
    walletData.walletAge < WALLET_VALIDATION_RULES.NEW_WALLET_MAX_AGE &&
    walletData.transactionCount >= 3 &&
    walletData.solBalance >= WALLET_VALIDATION_RULES.NEW_WALLET_MIN_BALANCE;

  // Overall legitimacy check
  const isLegit = walletRisk < 50 || isNewWalletWithActivity;

  const finalScore = Math.round((walletRisk * 0.4 + emailRisk.riskScore * 0.25 + nameRisk.riskScore * 0.15) * 1.05);

  if (!walletData.exists) {
    return { status: '❌ INVALID', verdict: 'Wallet does not exist on-chain', confidence: 'CRITICAL', finalScore };
  }

  if (finalScore >= 70) {
    return { status: '🚩 SUSPICIOUS/BOT', verdict: 'High risk of being a bot account', confidence: 'HIGH', finalScore };
  }

  if (finalScore >= 50 && !isLegit) {
    return { status: '⚠️ LIKELY BOT', verdict: 'Multiple warning signs detected', confidence: 'MEDIUM', finalScore };
  }

  if (isNewWalletWithActivity) {
    return { status: '✅ REAL USER (NEW)', verdict: 'New wallet with legitimate activity detected', confidence: 'HIGH', finalScore };
  }

  if (isLegit) {
    return { status: '✅ REAL USER', verdict: 'Appears to be legitimate user', confidence: 'HIGH', finalScore };
  }

  return { status: '❓ UNCERTAIN', verdict: 'Could not determine legitimacy', confidence: 'LOW', finalScore };
}

/**
 * Main search function - searches in Firebase database
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

    // NEW: Show if wallet would be accepted under new rules
    if (onChainData.walletAge > 0 && onChainData.walletAge < 14 && onChainData.transactionCount >= 3) {
      console.log(`\n🟢 NEW WALLET ACTIVITY PATTERN DETECTED`);
      console.log(`   This appears to be a new user with legitimate activity`);
      console.log(`   Status: Would be APPROVED ✅`);
    }
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

  // NEW: Calculate wallet-specific risk using intelligent rules
  const walletRiskAnalysis = calculateWalletRiskScore(onChainData, onChainData.transactionCount, onChainData.walletAge);
  const walletDataForAnalysis = {
    exists: onChainData.exists,
    solBalance: onChainData.solBalance,
    transactionCount: onChainData.transactionCount,
    walletAge: onChainData.walletAge,
    riskAnalysis: walletRiskAnalysis,
  };

  console.log(`Total Risk Score: ${riskAssessment.totalScore}/100`);
  console.log(`Category Breakdown:`);
  console.log(`  Email:     ${riskAssessment.categoryBreakdown.email}/100`);
  console.log(`  Name:      ${riskAssessment.categoryBreakdown.name}/100`);
  console.log(`  On-Chain:  ${riskAssessment.categoryBreakdown.onChain}/100`);
  console.log(`  Device:    ${riskAssessment.categoryBreakdown.device}/100`);

  // NEW: Intelligent wallet classification
  const walletClassification = isRealWallet(walletDataForAnalysis, emailRisk, nameRisk);
  console.log(`\n${walletClassification.status}`);
  console.log(`Verdict:   ${walletClassification.verdict}`);
  console.log(`Confidence: ${walletClassification.confidence}`);
  console.log(`Final Score: ${walletClassification.finalScore}/100`);

  // Show wallet-specific factors
  console.log('\n📋 On-Chain Analysis Details:');
  console.log(`Wallet Risk Score: ${walletRiskAnalysis.riskScore}/100`);
  if (walletRiskAnalysis.riskFactors.length > 0) {
    walletRiskAnalysis.riskFactors.forEach(r => console.log(`  ${r}`));
  }

  if (riskAssessment.allReasons.length > 0) {
    console.log('\n🚩 Additional Red Flags:');
    riskAssessment.allReasons.forEach(r => console.log(`  ${r}`));
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
    classification: walletClassification.status.replace(/[^\w\s]/g, '').trim(),
    verdict: walletClassification.verdict,
    finalScore: walletClassification.finalScore,
    walletRiskScore: walletRiskAnalysis.riskScore,
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
        'verdict',
        'finalScore',
        'walletRiskScore',
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
    const suspiciousCount = reportData.filter(r => r.finalScore >= 70).length;
    const realUserCount = reportData.filter(r => r.finalScore < 50).length;
    const newUsersApproved = reportData.filter(r => r.classification.includes('REAL USER (NEW)')).length;

    console.log(`\n📈 STATISTICS`);
    console.log(`─`.repeat(60));
    console.log(`Average Risk Score: ${avgRisk}/100`);
    console.log(`🚩 Suspicious/Bot: ${suspiciousCount} (${Math.round((suspiciousCount / reportData.length) * 100)}%)`);
    console.log(`✅ Real Users: ${realUserCount} (${Math.round((realUserCount / reportData.length) * 100)}%)`);
    console.log(`🟢 New Users Approved: ${newUsersApproved} (${Math.round((newUsersApproved / reportData.length) * 100)}%)`);
  } catch (error) {
    console.error('❌ Error exporting report:', error);
  }
}

/**
 * Interactive search loop with menu
 */
function showMainMenu() {
  rl.question(
    '\n' +
    '═'.repeat(60) + '\n' +
    '🔍 WALLET ANALYSIS TOOL - MAIN MENU\n' +
    '═'.repeat(60) + '\n' +
    '1️⃣  Search registered wallet (from airdrop database)\n' +
    '2️⃣  Analyze wallet directly (not in database)\n' +
    '3️⃣  Export CSV report\n' +
    '4️⃣  Exit\n' +
    '─'.repeat(60) + '\n' +
    'Select option (1-4): ',
    async answer => {
      const option = answer.trim();

      switch (option) {
        case '1':
          askForRegisteredWallet();
          break;
        case '2':
          askForDirectAnalysis();
          break;
        case '3':
          exportReport();
          showMainMenu();
          break;
        case '4':
          console.log('\n👋 Goodbye!');
          rl.close();
          process.exit(0);
          break;
        default:
          console.log('❌ Invalid option. Please select 1-4.');
          showMainMenu();
      }
    }
  );
}

/**
 * Analyze wallet directly without database lookup
 */
async function analyzeWalletDirect(walletAddress) {
  try {
    console.log(`\n🔍 Direct Wallet Analysis: ${walletAddress}`);
    console.log('═'.repeat(60));

    // Get on-chain data
    const onChainData = await getWalletOnChainData(walletAddress);

    // Display on-chain info
    console.log('\n🔗 ON-CHAIN DATA');
    console.log('─'.repeat(60));
    
    if (onChainData.error) {
      console.log(`⚠️ ${onChainData.error}`);
      return;
    }

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

    // Calculate wallet risk using intelligent rules
    const walletRiskAnalysis = calculateWalletRiskScore(
      onChainData,
      onChainData.transactionCount,
      onChainData.walletAge
    );

    console.log('\n📊 WALLET RISK ANALYSIS');
    console.log('─'.repeat(60));
    console.log(`Risk Score: ${walletRiskAnalysis.riskScore}/100`);
    
    if (walletRiskAnalysis.riskFactors.length > 0) {
      console.log('Risk Factors:');
      walletRiskAnalysis.riskFactors.forEach(f => console.log(`  ${f}`));
    }

    // Determine eligibility (wallet metrics only, no email/name/device)
    const eligibilityScore = walletRiskAnalysis.riskScore;
    const isNewActiveWallet =
      onChainData.walletAge > 0 &&
      onChainData.walletAge < 14 &&
      onChainData.transactionCount >= 3 &&
      onChainData.solBalance >= 0.1;

    let verdict = 'UNKNOWN';
    let status = '❓ NEEDS MORE DATA';
    let confidence = 'Low';

    if (!onChainData.exists) {
      verdict = 'INVALID';
      status = '❌ WALLET DOES NOT EXIST';
      confidence = 'High';
    } else if (eligibilityScore < 50 || isNewActiveWallet) {
      verdict = 'ELIGIBLE';
      status = '✅ ELIGIBLE FOR AIRDROP';
      confidence = isNewActiveWallet ? 'High (New Active Wallet Pattern)' : 'High';
    } else {
      verdict = 'SUSPICIOUS';
      status = '⚠️ WALLET APPEARS SUSPICIOUS';
      confidence = 'Medium-High';
    }

    console.log(`\n${status}`);
    console.log(`Verdict:   ${verdict}`);
    console.log(`Confidence: ${confidence}`);
    console.log(`Final Score: ${100 - eligibilityScore}/100`);

    // Show pattern detection
    if (isNewActiveWallet) {
      console.log('\n🟢 NEW WALLET ACTIVITY PATTERN DETECTED');
      console.log('   • Wallet age: < 14 days');
      console.log('   • Transaction count: ≥ 3');
      console.log('   • Balance: ≥ 0.1 SOL');
      console.log('   → This pattern indicates legitimate new user activity');
    }

    // Store in report
    reportData.push({
      docId: 'DIRECT_ANALYSIS',
      name: 'N/A',
      email: 'N/A',
      wallet: walletAddress,
      ipAddress: 'N/A',
      createdAt: new Date().toISOString(),
      timeToSubmit: 0,
      browser: 'N/A',
      osName: 'N/A',
      deviceType: 'N/A',
      solBalance: onChainData.solBalance?.toFixed(6) || '0',
      transactionCount: onChainData.transactionCount || 0,
      walletAge: onChainData.walletAge || 0,
      walletExists: onChainData.exists ? 'Yes' : 'No',
      ipRegistrationCount: 0,
      riskScore: eligibilityScore,
      classification: verdict,
      verdict: verdict,
      finalScore: 100 - eligibilityScore,
      walletRiskScore: walletRiskAnalysis.riskScore,
      emailRiskScore: 0,
      nameRiskScore: 0,
      onChainRiskScore: walletRiskAnalysis.riskScore,
      deviceRiskScore: 0,
    });
  } catch (error) {
    console.error('❌ Error analyzing wallet:', error.message);
  }
}

/**
 * Ask user for wallet address to search in database
 */
function askForRegisteredWallet() {
  rl.question('\n📍 Enter wallet address to search (from registrations): ', async answer => {
    if (!answer.trim()) {
      console.log('⚠️ Please enter a valid wallet address.');
      return askForRegisteredWallet();
    }

    try {
      const result = await searchAndAnalyzeWallet(answer.trim());
      if (!result) {
        console.log('\n⚠️ Wallet not found in airdrop registrations.');
        console.log('💡 Try option 2 to analyze this wallet directly.\n');
      }
    } catch (error) {
      console.error('❌ Error during search:', error.message);
    }

    showMainMenu();
  });
}

/**
 * Ask user for wallet address to analyze directly (not from database)
 */
function askForDirectAnalysis() {
  rl.question('\n📍 Enter wallet address to analyze (direct validation): ', async answer => {
    if (!answer.trim()) {
      console.log('⚠️ Please enter a valid wallet address.');
      return askForDirectAnalysis();
    }

    try {
      await analyzeWalletDirect(answer.trim());
    } catch (error) {
      console.error('❌ Error during analysis:', error.message);
    }

    showMainMenu();
  });
}

console.log('═'.repeat(60));
console.log('🔍 ADVANCED WALLET ANALYSIS TOOL');
console.log('═'.repeat(60));
console.log('Features: On-chain data, Email validation, Device fingerprinting');
console.log('Export: CSV report with risk scores and classifications\n');
showMainMenu();
