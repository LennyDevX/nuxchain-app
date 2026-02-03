#!/usr/bin/env node

/**
 * ⚡ HYBRID Wallet Analysis - BEST PRECISION + SPEED
 * 
 * Combines strengths of all approaches:
 * - 1 RPC call per wallet (like fast) = speed
 * - Comprehensive scoring (like original) = accuracy
 * - IP farm + pattern detection (like analyze) = bot network detection
 * - 4-5 parallel wallets = safe, no 429s
 * 
 * Expected runtime: 2-3 hours for 4,411 wallets
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const path = require('path');
const fs = require('fs');
const csv = require('csv-stringify/sync');
require('dotenv').config();

// ============================================================================
// CONFIGURATION
// ============================================================================

const SERVICE_ACCOUNT_PATH = path.join(
  __dirname,
  '../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'
);
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC_ALCHEMY || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const AIRDROP_MAINTENANCE = process.env.VITE_AIRDROP_MAINTENANCE === 'true';

// ⚡ INTELLIGENT CONFIGURATION
const PARALLEL_BATCH_SIZE = 8; // 8 wallets in parallel (safe)
const BATCH_DELAY_MS = 1500; // Faster with Alchemy
const REQUEST_TIMEOUT = 12000;
const MAX_RETRIES = 3;

const MIN_SOL_BALANCE = 0.01;
const MIN_WALLET_AGE_DAYS = 90;
const CACHE_FILE = path.join(__dirname, '../.wallet-analysis-hybrid-cache.json');

let processedCount = 0;
let botCount = 0;
let realCount = 0;
let uncertainCount = 0;
let suspiciousCount = 0;
let totalWallets = 0;
let startTime = Date.now();

const analysisCache = new Map();

// ============================================================================
// SUSPICIOUS PATTERNS DATABASE
// ============================================================================

const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
  'throwaway.email', 'yopmail.com', 'temp-mail.org', 'maildrop.cc',
  'mintemail.com', 'sharklasers.com', 'trashmail.com', 'tempmail.de',
  'nada.email', 'fakeinbox.com', 'spam4.me', 'mytrashmail.com',
  'email.it', '10minutesemail.com', 'grr.la', 'pokemail.net', 'mailnesia.com',
]);

const SUSPICIOUS_NAME_PATTERNS = [
  /^user\d+/i,
  /^test\d+/i,
  /^admin/i,
  /^bot/i,
  /^fake/i,
  /^\d{5,}$/,
  /^[a-z]{1,3}$/i,
  /^(spam|scam|hack|fake)/i,
];

// IP farm detection threshold
const IP_FARM_THRESHOLD = 4; // More than 4 registrations from same IP = suspicious

// ============================================================================
// INITIALIZATION
// ============================================================================

let serviceAccount, db, connection;

async function initializeServices() {
  serviceAccount = require(SERVICE_ACCOUNT_PATH);
  initializeApp({ credential: cert(serviceAccount) });
  db = getFirestore();
  
  connection = new Connection(SOLANA_RPC, {
    commitment: 'confirmed',
    httpHeaders: { 'solana-client': 'hybrid-analyzer/3.0' },
  });
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      Object.entries(data).forEach(([key, val]) => {
        analysisCache.set(key, val);
      });
      console.log(`📦 Loaded ${analysisCache.size} cached results`);
    }
  } catch (err) {
    console.log('⚠️  Starting with empty cache');
  }
}

function saveCache() {
  try {
    const cacheObj = Object.fromEntries(analysisCache);
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheObj, null, 0));
  } catch (err) {
    console.error('Cache save error:', err.message);
  }
}

// ============================================================================
// RPC OPERATIONS (MINIMAL)
// ============================================================================

/**
 * ONE AND ONLY RPC call per wallet
 * Returns: balance, exists status
 */
async function checkWalletBalance(pubkeyStr) {
  if (analysisCache.has(pubkeyStr)) {
    return { ...analysisCache.get(pubkeyStr), cached: true };
  }

  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const pubkey = new PublicKey(pubkeyStr);
      const balance = await connection.getBalance(pubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      const result = {
        solBalance,
        exists: balance > 0,
        cached: false,
      };
      analysisCache.set(pubkeyStr, result);
      return result;
    } catch (err) {
      const isRateLimit = 
        err.message?.includes('429') ||
        err.message?.includes('Too Many Requests') ||
        err.message?.includes('overloaded');
      
      if (isRateLimit && i < MAX_RETRIES - 1) {
        const wait = Math.min(Math.pow(2, i) * 2000, 15000);
        await new Promise(r => setTimeout(r, wait));
        continue;
      }

      return {
        solBalance: 0,
        exists: false,
        unreachable: true,
        error: err.message,
      };
    }
  }

  return { solBalance: 0, exists: false, error: 'Max retries exceeded' };
}

// ============================================================================
// HYBRID RISK SCORING (INTELLIGENT REWRITE)
// ============================================================================

/**
 * Comprehensive risk scoring algorithm
 * Combines: Email patterns, Name patterns, On-chain metrics, Behavioral signals
 */
function assessRisk(registration, onChainData, ipCount, globalTimeClusters, emailDomainCount) {
  let riskScore = 0;
  let indicators = [];
  
  // Weights (Total = 1.0)
  const weights = {
    identity: 0.30,   // Name + Email patterns
    onchain: 0.35,    // Wallet activity
    behavioral: 0.35  // IP + Time clusters + sequencing
  };

  // 1. SEQUENCE DETECTION (Intelligent pattern matching)
  const name = (registration.name || '').toLowerCase();
  const email = (registration.email || '').toLowerCase();
  
  if (/\d{4,}$/.test(name) || /\d{4,}@/.test(email)) {
    riskScore += 40 * weights.identity;
    indicators.push('seq-pattern');
  }

  // 2. IDENTITY ANALYSIS
  if (registration.email) {
    const domain = email.split('@')[1] || '';
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      riskScore += 80 * weights.identity;
      indicators.push('disposable-mail');
    }
  }

  // 3. ON-CHAIN INTELLIGENCE (Sanitized to avoid 100% false positives)
  if (onChainData.unreachable) {
    riskScore += 15 * weights.onchain; // Minimal penalty for RPC issues
    indicators.push('rpc-unreachable');
  } else if (!onChainData.exists) {
    // A brand new wallet is common. Only suspicious if other patterns exist.
    riskScore += 30 * weights.onchain; 
    indicators.push('new-wallet');
  } else {
    // Check balance for "real" status
    if (onChainData.solBalance >= 0.02) {
      riskScore -= 25 * weights.onchain; // Strong trust signal
      indicators.push('active-user');
    } else if (onChainData.solBalance > 0) {
      riskScore -= 10 * weights.onchain; // Small trust signal
      indicators.push('dust-balance');
    }
  }

  // 4. BEHAVIORAL CLUSTERING
  if (ipCount > IP_FARM_THRESHOLD) {
    riskScore += 70 * weights.behavioral;
    indicators.push(`ip-farm[${ipCount}]`);
  }

  // Time spike detection (registrations in the same hour)
  if (registration.createdAt) {
    const date = registration.createdAt.toDate ? registration.createdAt.toDate() : new Date(registration.createdAt);
    if (!isNaN(date.getTime())) {
      const timeKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
      const spikeSize = globalTimeClusters.get(timeKey) || 0;
      if (spikeSize > 50) {
        riskScore += 30 * weights.behavioral;
        indicators.push(`time-spike[${spikeSize}/h]`);
      }
    }
  }

  // Classification Thresholds (Slightly more lenient to protect real users)
  riskScore = Math.min(100, Math.max(0, riskScore));
  let status = 'Real User';
  if (riskScore >= 85) status = 'Likely Bot';
  else if (riskScore >= 65) status = 'Suspicious';
  else if (riskScore >= 45) status = 'Uncertain';

  return { riskScore: Math.round(riskScore), classification: status, indicators: indicators.join('|') };
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function analyzeWallet(registration, ipCountMap, emailDomainCountMap, globalTimeClusters) {
  const walletAddr = registration.wallet || registration.walletAddress || '';
  
  if (!walletAddr || walletAddr.trim().length === 0) {
    return {
      walletAddress: 'INVALID',
      email: registration.email || 'N/A',
      name: registration.name || 'N/A',
      riskScore: 100,
      classification: 'Likely Bot',
      indicators: 'invalid-wallet',
      solBalance: '0',
    };
  }

  // Get on-chain data (1 RPC call)
  const onChainData = await checkWalletBalance(walletAddr);
  
  // Get network metrics from pre-calculated maps
  const ipCount = registration.ipAddress ? ipCountMap.get(registration.ipAddress) || 1 : 1;
  const emailDomain = registration.email ? registration.email.split('@')[1] : '';
  const emailDomainCount = emailDomain ? emailDomainCountMap.get(emailDomain) || 1 : 1;
  
  // Comprehensive risk assessment
  const riskAssessment = assessRisk(
    registration,
    onChainData,
    ipCount,
    globalTimeClusters,
    emailDomainCount
  );

  return {
    walletAddress: walletAddr,
    email: registration.email || 'N/A',
    name: registration.name || 'N/A',
    ipAddress: registration.ipAddress || 'N/A',
    riskScore: riskAssessment.riskScore,
    classification: riskAssessment.classification,
    indicators: riskAssessment.indicators,
    solBalance: onChainData.solBalance?.toFixed(6) || '0',
    exists: onChainData.exists ? 'Yes' : 'No',
  };
}

function getElapsedTime() {
  const elapsed = Date.now() - startTime;
  const hours = Math.floor(elapsed / 3600000);
  const minutes = Math.floor((elapsed % 3600000) / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

function getETA() {
  if (processedCount === 0) return 'calculating...';
  
  const elapsed = Date.now() - startTime;
  const avgPerWallet = elapsed / processedCount;
  const remaining = totalWallets - processedCount;
  const remainingMs = remaining * avgPerWallet;
  
  const hours = Math.floor(remainingMs / 3600000);
  const minutes = Math.floor((remainingMs % 3600000) / 60000);
  
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

async function main() {
  try {
    console.clear();
    console.log('🔍 HYBRID Wallet Analysis - BEST PRECISION');
    if (AIRDROP_MAINTENANCE) console.log('🚧 MAINTENANCE MODE: ACTIVE');
    console.log('═'.repeat(70));
    console.log('Strategy: 1 RPC call + comprehensive Firebase analysis + IP detection');
    console.log('═'.repeat(70));

    await initializeServices();
    loadCache();

    // Load all registrations
    console.log('\n📥 Loading registrations...');
    const snapshot = await db.collection(COLLECTION_NAME).get();
    const registrations = [];
    
    snapshot.forEach(doc => {
      registrations.push(doc.data());
    });

    totalWallets = registrations.length;
    console.log(`✅ Loaded ${totalWallets} registrations\n`);

    // Pre-calculate network metrics (O(n) scan)
    console.log('🔍 Pre-analyzing network patterns...');
    const ipCountMap = new Map();
    const emailDomainCountMap = new Map();
    const timeClustersMap = new Map();

    registrations.forEach(reg => {
      // IP analysis
      if (reg.ipAddress) {
        ipCountMap.set(reg.ipAddress, (ipCountMap.get(reg.ipAddress) || 0) + 1);
      }
      
      // Email domain analysis
      const domain = reg.email?.split('@')[1];
      if (domain) {
        emailDomainCountMap.set(domain, (emailDomainCountMap.get(domain) || 0) + 1);
      }
      
      // Time clustering
      if (reg.createdAt) {
        const date = reg.createdAt.toDate ? reg.createdAt.toDate() : new Date(reg.createdAt);
        if (!isNaN(date.getTime())) {
          const timeKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}`;
          timeClustersMap.set(timeKey, (timeClustersMap.get(timeKey) || 0) + 1);
        }
      }
    });

    const ipFarms = Array.from(ipCountMap.entries()).filter(([_, count]) => count > IP_FARM_THRESHOLD).length;
    console.log(`📊 Found ${ipFarms} IP farms detected\n`);

    // Process in parallel batches
    const results = [];
    const numBatches = Math.ceil(totalWallets / PARALLEL_BATCH_SIZE);

    for (let batchIdx = 0; batchIdx < numBatches; batchIdx++) {
      const start = batchIdx * PARALLEL_BATCH_SIZE;
      const end = Math.min(start + PARALLEL_BATCH_SIZE, totalWallets);
      const batchRegistrations = registrations.slice(start, end);

      // Process this batch in parallel
      const batchPromises = batchRegistrations.map(reg => 
        analyzeWallet(reg, ipCountMap, emailDomainCountMap, timeClustersMap)
      );
      const batchResults = await Promise.allSettled(batchPromises);

      // Collect results
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
          
          processedCount++;
          const classification = result.value.classification;
          if (classification === 'Likely Bot') botCount++;
          else if (classification === 'Real User') realCount++;
          else if (classification === 'Uncertain') uncertainCount++;
          else if (classification === 'Suspicious') suspiciousCount++;
        }
      });

      // Progress
      const progress = ((processedCount / totalWallets) * 100).toFixed(1);
      const elapsed = getElapsedTime();
      const eta = getETA();
      const throughput = (processedCount / ((Date.now() - startTime) / 1000)).toFixed(1);
      
      process.stdout.write(
        `\r[${progress}%] ${processedCount}/${totalWallets} | ` +
        `⏱️ ${elapsed} | ⏳ ETA: ${eta} | 🚀 ${throughput} w/s`
      );

      if (batchIdx < numBatches - 1) {
        await new Promise(r => setTimeout(r, BATCH_DELAY_MS));
      }
    }

    console.log('\n');
    saveCache();

    // Generate report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `airdrop-analysis-hybrid-${timestamp}.csv`;
    const filepath = path.join(__dirname, '../', filename);

    const csvData = csv.stringify(results, {
      header: true,
      columns: [
        { key: 'walletAddress', header: 'wallet' },
        'email',
        'name',
        'ipAddress',
        'solBalance',
        'riskScore',
        'classification',
        'indicators',
        'exists',
      ],
    });

    fs.writeFileSync(filepath, csvData);

    // Final report
    const totalElapsed = getElapsedTime();
    const avgWalletTime = ((Date.now() - startTime) / processedCount).toFixed(2);
    
    console.log('═'.repeat(70));
    console.log('✅ ANALYSIS COMPLETE - HYBRID METHOD');
    console.log('═'.repeat(70));
    console.log(`
📊 Classification Results:
  ✅ Real Users:      ${realCount} (${((realCount/totalWallets)*100).toFixed(1)}%)
  ⚠️  Uncertain:      ${uncertainCount} (${((uncertainCount/totalWallets)*100).toFixed(1)}%)
  🔴 Suspicious:      ${suspiciousCount} (${((suspiciousCount/totalWallets)*100).toFixed(1)}%)
  🚫 Likely Bots:     ${botCount} (${((botCount/totalWallets)*100).toFixed(1)}%)

📈 Bot Analysis:
  Total Bots Detected:    ${botCount + suspiciousCount} (${(((botCount + suspiciousCount)/totalWallets)*100).toFixed(1)}%)
  IP Farms Found:         ${ipFarms}
  
⏱️  Performance:
  Total Runtime:          ${totalElapsed}
  Avg per wallet:         ${avgWalletTime}ms
  Cached from previous:   ${analysisCache.size}

📁 Report: ${filename}
    `);
    console.log('═'.repeat(70));

  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

main();
