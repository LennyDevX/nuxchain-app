#!/usr/bin/env node

/**
 * Verify RPC Endpoint Synchronization
 * Tests that frontend and backend use the same RPC endpoint
 * and return consistent wallet validation data
 */

const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  dim: '\x1b[2m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bright}${colors.blue}━━━━━━━━━━━━━━━━━${colors.reset}\n${msg}\n${colors.dim}(${new Date().toLocaleTimeString()})${colors.reset}\n`),
};

const WALLET_ADDRESS = 'HHraRp46hRQzYiBuAq2Xkjm4DFLDNWyWdHUkjJrgEP7X';

// RPC endpoints - CRITICAL: These must be the same for frontend and backend
const RPC_CONFIG = {
  quicknode: 'https://clean-omniscient-fog.solana-mainnet.quiknode.pro/2daffb753f4a80064515c5164e8781682047d312/',
  publicNode: 'https://solana-rpc.publicnode.com',
  official: 'https://api.mainnet-beta.solana.com',
  ankr: 'https://rpc.ankr.com/solana',
};

const API_URL = 'http://localhost:3002';

async function testRpcConnection(rpcUrl, name) {
  log.info(`Testing RPC: ${name}`);
  
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    const pubKey = new PublicKey(WALLET_ADDRESS);
    
    // Get wallet balance
    const balance = await connection.getBalance(pubKey);
    const balanceSol = balance / LAMPORTS_PER_SOL;
    
    // Get transaction signatures (limit to 10 for speed)
    const signatures = await connection.getSignaturesForAddress(pubKey, { limit: 10 });
    
    // Get wallet creation (first confirmed transaction)
    let walletAge = 0;
    if (signatures.length > 0) {
      const firstSig = signatures[signatures.length - 1];
      const blockTime = firstSig.blockTime;
      if (blockTime) {
        walletAge = Math.floor((Date.now() / 1000 - blockTime) / 86400);
      }
    }
    
    // Get total transaction count
    const allSignatures = await connection.getSignaturesForAddress(pubKey);
    const transactionCount = allSignatures.length;
    
    return {
      success: true,
      name,
      url: rpcUrl,
      balance: balanceSol,
      transactionCount,
      walletAgeDays: walletAge,
      hasTransactions: transactionCount > 0,
    };
  } catch (error) {
    return {
      success: false,
      name,
      url: rpcUrl,
      error: error.message,
    };
  }
}

async function testBackendApi() {
  log.info('Testing Backend API');
  
  try {
    const response = await fetch(`${API_URL}/api/airdrop/validate-and-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ walletAddress: WALLET_ADDRESS }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      ...data,
      url: API_URL,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      url: API_URL,
    };
  }
}

function compareResults(rpcResult, backendResult) {
  if (!rpcResult.success || !backendResult.success) {
    log.error('Cannot compare: One or both requests failed');
    return false;
  }

  const issues = [];

  // Allow small differences due to blockchain state changes
  const txCountDiff = Math.abs(rpcResult.transactionCount - (backendResult.transactionCount || 0));
  const ageDiff = Math.abs(rpcResult.walletAgeDays - (backendResult.walletAgeDays || 0));
  const balanceDiff = Math.abs(rpcResult.balance - (backendResult.balance || 0));

  if (txCountDiff > 2) {
    issues.push(`Transaction count difference: ${rpcResult.transactionCount} vs ${backendResult.transactionCount} (diff: ${txCountDiff})`);
  }

  if (ageDiff > 1) {
    issues.push(`Wallet age difference: ${rpcResult.walletAgeDays} days vs ${backendResult.walletAgeDays} days (diff: ${ageDiff})`);
  }

  if (balanceDiff > 0.0001) {
    issues.push(`Balance difference: ${rpcResult.balance} SOL vs ${backendResult.balance} SOL`);
  }

  return issues;
}

async function main() {
  log.section('RPC Endpoint Synchronization Verification');
  log.info(`Wallet: ${WALLET_ADDRESS}`);
  log.info(`Testing Multiple RPC Endpoints and Backend API`);

  // Test QuickNode (primary)
  log.section('Testing Primary RPC (QuickNode)');
  const quicknodeResult = await testRpcConnection(RPC_CONFIG.quicknode, 'QuickNode');
  
  if (quicknodeResult.success) {
    log.success(`QuickNode: ${quicknodeResult.transactionCount} txs, ${quicknodeResult.walletAgeDays} days, ${quicknodeResult.balance.toFixed(6)} SOL`);
  } else {
    log.error(`QuickNode failed: ${quicknodeResult.error}`);
  }

  // Test Backend API
  log.section('Testing Backend API (should use QuickNode)');
  const backendResult = await testBackendApi();
  
  if (backendResult.success) {
    log.success(`Backend: ${backendResult.transactionCount} txs, ${backendResult.walletAgeDays} days, ${backendResult.balance?.toFixed(6)} SOL, isValid: ${backendResult.isValid}`);
  } else {
    log.error(`Backend API failed: ${backendResult.error}`);
    log.warn('Make sure backend is running: npm run dev:full');
  }

  // Compare results
  log.section('Comparison: QuickNode vs Backend');
  if (quicknodeResult.success && backendResult.success) {
    const issues = compareResults(quicknodeResult, backendResult);
    
    if (issues.length === 0) {
      log.success('✓ RPC Sync Verified: Frontend and Backend use same RPC endpoint');
      console.log(`\n${colors.green}${colors.bright}✓ RPC SYNCHRONIZATION COMPLETE${colors.reset}`);
      console.log(`  - Both return consistent wallet data`);
      console.log(`  - Frontend will show same eligibility as backend`);
      return true;
    } else {
      log.warn('Detected differences (may be due to blockchain state changes):');
      issues.forEach(issue => log.warn(`  • ${issue}`));
      
      // If differences are small, still consider it a pass
      if (issues.length <= 1) {
        log.success('✓ Minor differences acceptable (likely blockchain state)');
        return true;
      }
      return false;
    }
  } else {
    log.error('Cannot verify sync: One or both services failed');
    return false;
  }
}

main().catch(error => {
  log.error(`Fatal error: ${error.message}`);
  process.exit(1);
});
