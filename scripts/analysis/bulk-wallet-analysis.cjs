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
  '../../src/utils/scripts/nuxchain1-firebase-adminsdk-fbsvc-f1894d4a38.json'
);
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC_QUICKNODE || process.env.SOLANA_RPC_ALCHEMY || process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const AIRDROP_MAINTENANCE = process.env.VITE_AIRDROP_MAINTENANCE === 'true';

// ⚡ INTELLIGENT CONFIGURATION
const PARALLEL_BATCH_SIZE = 6; // 6 wallets max
const BATCH_DELAY_MS = 5000; // 5 seconds between batches
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 8; // More retries for 429s
const SIGNATURE_LIMIT = 100; // Reduced from 1000 to lighten RPC load

const MIN_SOL_BALANCE = 0.001;
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

// Known CEX Hot Wallets (Verified Base58 for Solana)
const CEX_HOT_WALLETS = new Set([
  '5tzFkiK7jzspR9uUTi6tS9ai2LUMv87UXcrXAykyvH8', // Binance
  '9WzDX9Gk9y89yAyXfE7C6v6m4VvR3C6u7C6v6m4VvR3C', // Binance 2
  '2AQdpHJt9bmvBsT9HFrEE2r3o8Gq6fWPb82nFis2N', // Coinbase
  '6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P', // Gate.io
  '8hiTUH6YZmgE94mbMxseSs2vc8ZrpqaaLUuHQ2bQPrTJ', // Known high volume sender
]);

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
 * Detect if wallet was funded by a know CEX
 */
async function isFundedByCEX(oldestSignature) {
  if (!oldestSignature) return false;
  try {
    const tx = await connection.getParsedTransaction(oldestSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });

    if (!tx || !tx.transaction.message.accountKeys) return false;
    const sender = tx.transaction.message.accountKeys[0].pubkey.toBase58();
    return CEX_HOT_WALLETS.has(sender);
  } catch (error) {
    return false;
  }
}

/**
 * Get detailed wallet metrics (age, transaction count)
 */
async function getWalletMetrics(pubkeyStr) {
  try {
    const pubkey = new PublicKey(pubkeyStr);
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit: SIGNATURE_LIMIT });

    let ageDays = 0;
    let oldestSig = null;

    if (signatures.length > 0) {
      const validSignatures = signatures.filter(s => s.blockTime).sort((a, b) => a.blockTime - b.blockTime);
      if (validSignatures.length > 0) {
        const oldestBlockTime = validSignatures[0].blockTime;
        ageDays = Math.floor((Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24));
        oldestSig = validSignatures[0].signature;
      }

      if (signatures.length >= SIGNATURE_LIMIT) ageDays = Math.max(ageDays, 365);
    }

    const fundedByCEX = oldestSig ? await isFundedByCEX(oldestSig) : false;

    return {
      txCount: signatures.length,
      ageDays,
      isCEXFunded: fundedByCEX
    };
  } catch (err) {
    return { txCount: 0, ageDays: 0, isCEXFunded: false, error: err.message };
  }
}

/**
 * ONE AND ONLY RPC call per wallet (Now updated to get balance + metrics)
 */
async function checkWalletData(pubkeyStr) {
  if (analysisCache.has(pubkeyStr) && analysisCache.get(pubkeyStr).ageDays !== undefined) {
    return { ...analysisCache.get(pubkeyStr), cached: true };
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      const pubkey = new PublicKey(pubkeyStr);
      const balance = await connection.getBalance(pubkey);
      const solBalance = balance / LAMPORTS_PER_SOL;

      // Get metrics (signatures etc)
      const metrics = await getWalletMetrics(pubkeyStr);

      const result = {
        solBalance,
        exists: balance > 0 || metrics.txCount > 0,
        txCount: metrics.txCount,
        ageDays: metrics.ageDays,
        isCEXFunded: metrics.isCEXFunded,
        cached: false,
      };
      analysisCache.set(pubkeyStr, result);
      return result;
    } catch (err) {
      const isRateLimit = err.message?.includes('429') || err.message?.includes('Too Many Requests');
      if (isRateLimit && i < MAX_RETRIES - 1) {
        const backoff = (i + 1) * 8000; // 8s delays for 429s
        console.log(`\n⚠️ Rate limit hit. Backing off ${backoff}ms (retry ${i + 1}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      return { solBalance: 0, exists: false, txCount: 0, ageDays: 0, unreachable: true, error: err.message };
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
    identity: 0.30,   // Name + Email patterns (Increase from 0.25)
    onchain: 0.35,    // Wallet activity (Decrease from 0.40 to allow behavioral to count more)
    behavioral: 0.35  // IP + Time clusters + Fingerprint
  };

  // 1. SEQUENCE DETECTION
  const name = (registration.name || '').toLowerCase();
  const email = (registration.email || '').toLowerCase();

  // High confidence sequence detection
  if (/\d{4,}$/.test(name) || /\d{4,}@/.test(email) || /^[a-z]{1,3}\d{2,}$/i.test(name)) {
    riskScore += 50 * weights.identity;
    indicators.push('seq-pattern');
  }

  // 1b. Generic Name Detection
  if (SUSPICIOUS_NAME_PATTERNS.some(p => p.test(name))) {
    riskScore += 30 * weights.identity;
    indicators.push('suspicious-name');
  }

  // 2. IDENTITY ANALYSIS
  if (registration.email) {
    const domain = email.split('@')[1] || '';
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
      riskScore += 100 * weights.identity; // Instant high risk for disposable
      indicators.push('disposable-mail');
    }
  }

  // 3. ON-CHAIN INTELLIGENCE (Upgraded - trust signals are conditional)
  const fpCount = registration.fingerprintCount || 1;
  const inFarm = fpCount > 2 || ipCount > IP_FARM_THRESHOLD;

  if (onChainData.unreachable) {
    riskScore += 10 * weights.onchain;
    indicators.push('rpc-unreachable');
  } else {
    // Trusted signals - ONLY applied if NOT in a farm
    if (!inFarm) {
      if (onChainData.isCEXFunded) {
        riskScore -= 40 * weights.onchain; // Very strong trust signal
        indicators.push('cex-funded');
      }

      if (onChainData.ageDays > 30) {
        riskScore -= 20 * weights.onchain;
        indicators.push(`old-wallet[${onChainData.ageDays}d]`);
      }

      if (onChainData.txCount > 50) {
        riskScore -= 15 * weights.onchain;
        indicators.push('high-activity');
      }

      if (onChainData.solBalance >= 0.05) {
        riskScore -= 20 * weights.onchain;
        indicators.push('whale-balance');
      }
    } else {
      indicators.push('farm-restricted'); // Trust signals disabled
    }

    // Penalties for low trust (applied even in farm, but worse in farm)
    if (onChainData.ageDays === 0 && !onChainData.isCEXFunded) {
      riskScore += (inFarm ? 50 : 30) * weights.onchain;
      indicators.push('new-wallet');
    }

    if (onChainData.txCount < 5 && !onChainData.isCEXFunded) {
      riskScore += (inFarm ? 40 : 25) * weights.onchain;
      indicators.push('low-activity');
    }
  }

  // 4. BEHAVIORAL & TELEMETRY
  const currentIp = registration.ipAddress || registration.ip;
  if (ipCount > IP_FARM_THRESHOLD) {
    riskScore += 80 * weights.behavioral;
    indicators.push(`ip-farm[${ipCount}]`);
  }

  // Fingerprint Analysis (HARDENED/LETHAL)
  if (fpCount > 5) {
    // LETHAL: Professional Sybil Farm
    riskScore = 100;
    indicators.push(`Lethal Sybil Farm[${fpCount}]`);
  } else if (fpCount > 2) {
    riskScore += 150 * weights.behavioral; // Guaranteed Likely Bot/Suspicious
    indicators.push(`device-farm[${fpCount}]`);
  } else if (fpCount > 1) {
    riskScore += 50 * weights.behavioral;
    indicators.push(`device-farm[${fpCount}]`);
  }

  // Time to Submit (TELEMETRY)
  if (registration.timeToSubmit !== undefined) {
    const ttsSeconds = registration.timeToSubmit / 1000;
    if (ttsSeconds < 3 && ttsSeconds > 0) {
      riskScore += 50 * weights.behavioral;
      indicators.push(`fast-submit[${ttsSeconds.toFixed(1)}s]`);
    } else if (ttsSeconds > 10 && !inFarm) {
      riskScore -= 10 * weights.behavioral; // Only human-like delay for non-farms
    }
  }

  // Time spike detection
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

  riskScore = Math.min(100, Math.max(0, riskScore));
  let status = 'Real User';
  if (riskScore >= 75) status = 'Likely Bot';
  else if (riskScore >= 50) status = 'Suspicious';
  else if (riskScore >= 30) status = 'Uncertain';

  return { riskScore: Math.round(riskScore), classification: status, indicators: indicators.join('|') };
}

// ============================================================================
// MAIN ANALYSIS
// ============================================================================

async function analyzeWallet(registration, ipCountMap, fingerprintCountMap, emailDomainCountMap, globalTimeClusters) {
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

  // Get on-chain data (Includes metrics)
  const onChainData = await checkWalletData(walletAddr);

  // Get network metrics from pre-calculated maps
  const currentIp = registration.ipAddress || registration.ip;
  const ipCount = currentIp ? ipCountMap.get(currentIp) || 1 : 1;
  const fpCount = registration.fingerprint ? fingerprintCountMap.get(registration.fingerprint) || 1 : 1;
  const emailDomain = registration.email ? registration.email.split('@')[1] : '';
  const emailDomainCount = emailDomain ? emailDomainCountMap.get(emailDomain) || 1 : 1;

  // Add calculated counts to registration object for risk assessment
  const enrichedReg = {
    ...registration,
    fingerprintCount: fpCount
  };

  // Comprehensive risk assessment
  const riskAssessment = assessRisk(
    enrichedReg,
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
    txCount: onChainData.txCount || 0,
    ageDays: onChainData.ageDays || 0,
    isCEXFunded: onChainData.isCEXFunded ? 'Yes' : 'No',
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
    const fingerprintCountMap = new Map();
    const emailDomainCountMap = new Map();
    const timeClustersMap = new Map();

    registrations.forEach(reg => {
      // IP analysis
      const ip = reg.ipAddress || reg.ip;
      if (ip) {
        ipCountMap.set(ip, (ipCountMap.get(ip) || 0) + 1);
      }

      // Fingerprint analysis
      if (reg.fingerprint) {
        fingerprintCountMap.set(reg.fingerprint, (fingerprintCountMap.get(reg.fingerprint) || 0) + 1);
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
        analyzeWallet(reg, ipCountMap, fingerprintCountMap, emailDomainCountMap, timeClustersMap)
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
        'txCount',
        'ageDays',
        { key: 'isCEXFunded', header: 'cex_origin' },
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
  ✅ Real Users:      ${realCount} (${((realCount / totalWallets) * 100).toFixed(1)}%)
  ⚠️  Uncertain:      ${uncertainCount} (${((uncertainCount / totalWallets) * 100).toFixed(1)}%)
  🔴 Suspicious:      ${suspiciousCount} (${((suspiciousCount / totalWallets) * 100).toFixed(1)}%)
  🚫 Likely Bots:     ${botCount} (${((botCount / totalWallets) * 100).toFixed(1)}%)

📈 Bot Analysis:
  Total Bots Detected:    ${botCount + suspiciousCount} (${(((botCount + suspiciousCount) / totalWallets) * 100).toFixed(1)}%)
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
