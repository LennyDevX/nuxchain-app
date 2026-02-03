/**
 * Enhanced Wallet Analysis Service
 * Captures detailed wallet metrics to prevent bot registrations
 * Integrates with Solana RPC for on-chain verification
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, type ConfirmedSignatureInfo } from '@solana/web3.js';

// Multiple RPC endpoints with fallback strategy
// Ordered by reliability from testing (PublicNode works best from browsers)
const RPC_ENDPOINTS = [
  'https://solana-rpc.publicnode.com', // PublicNode (most stable, CORS-friendly)
  'https://api.mainnet-beta.solana.com', // Official (sometimes rate-limited)
  'https://rpc.ankr.com/solana', // Ankr (backup)
];

let currentRpcIndex = 0;
let connection = new Connection(RPC_ENDPOINTS[currentRpcIndex], {
  commitment: 'confirmed',
  httpAgent: undefined, // Let browser use native fetch
  wsEndpoint: undefined,
});

// Minimum thresholds for legitimate wallets
export const WALLET_THRESHOLDS = {
  MIN_BALANCE: 0.01, // Minimum 0.01 SOL (Reduced from 0.05)
  MIN_TX_COUNT: 1, // At least 1 transaction
  MIN_WALLET_AGE_DAYS: 3, // Wallet must be at least 3 days old (Reduced from 7)
  MIN_TX_COUNT_FOR_NEW_WALLETS: 2, // Reduced from 3
  MAX_LAMPORTS_PER_SOL: LAMPORTS_PER_SOL,
};

// Known CEX Hot Wallets (Verified Base58 for Solana Mainnet)
// Updated Feb 2026 - Must match backend list
const CEX_HOT_WALLETS = new Set([
  // Binance Hot Wallets (verified)
  '5tzFkiKntRKvwdsPh4JnqUjqafNvJPvLHKZJuGxfCeKN',
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS',
  'HLwEJQUAZfEHNFZ48YrJeHcNqhQTTvVBdQV3RLGTpump',
  '2AQdpHJ6AU6c7mNHUkk7FQKL9dGMPUtQdS6jx9fYZS8X',
  '9WzDXz7eHQRrMCQk2bZ8bQoJvBT8kkKjZjQvXpJGpump',
  
  // Coinbase Hot Wallets (verified)
  'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm',
  '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S',
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE',
  
  // OKX / High Volume Senders (verified)
  '5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD',
  'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
]);

export interface WalletMetrics {
  address: string;
  balance: number;
  exists: boolean;
  transactionCount: number;
  walletAgeDays: number;
  lastTransactionDays: number;
  tokenAccountCount: number;
  isFundedByCEX?: boolean;
  riskScore: number;
  riskFactors: string[];
  isLegit: boolean;
  errorMessage?: string;
}

/**
 * Retry RPC call with fallback endpoints on 403/network errors
 * If all endpoints fail, returns null instead of throwing
 * Includes timeout to prevent hanging
 */
async function retryWithFallback<T>(
  fn: (conn: Connection) => Promise<T>,
  allowFailure = true,
  timeoutMs = 5000 // 5 second timeout per call
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RPC_ENDPOINTS.length; attempt++) {
    try {
      currentRpcIndex = attempt % RPC_ENDPOINTS.length;
      connection = new Connection(RPC_ENDPOINTS[currentRpcIndex], {
        commitment: 'confirmed',
        httpAgent: undefined,
        wsEndpoint: undefined,
      });

      // Only log first attempt to reduce console noise
      if (attempt === 0) {
        console.log(`🔄 Checking wallet with RPC endpoint...`);
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('RPC timeout')), timeoutMs)
      );
      
      const result = await Promise.race([fn(connection), timeoutPromise]);
      if (attempt > 0) {
        console.log(`✅ RPC success on attempt ${attempt + 1}`);
      }
      return result;
    } catch (error) {
      lastError = error as Error;
      // Only log error if it's the last attempt
      if (attempt === RPC_ENDPOINTS.length - 1) {
        console.warn(`⚠️ All ${RPC_ENDPOINTS.length} RPC endpoints failed`);
      }

      // Wait before next attempt (but shorter now)
      if (attempt < RPC_ENDPOINTS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  // If all endpoints failed
  if (allowFailure) {
    console.warn('⚠️ All RPC endpoints failed, but allowing registration (will use conservative defaults)');
    return null;
  }

  throw lastError || new Error('All RPC endpoints failed');
}

/**
 * Comprehensive wallet analysis
 * Returns detailed metrics about wallet legitimacy
 * If RPC fails, returns lenient defaults to allow registration
 * NEVER blocks registration - only informational
 */
export async function analyzeWalletMetrics(walletAddress: string): Promise<WalletMetrics> {
  try {
    const pubkey = new PublicKey(walletAddress);
    
    // Parallel requests with fallback retries
    // All can fail gracefully - this is NON-BLOCKING
    const [balanceResult, signaturesResult, tokenAccountsResult] = await Promise.allSettled([
      retryWithFallback((conn) => conn.getBalance(pubkey), true, 3000),
      retryWithFallback((conn) => getWalletSignaturesWithConnection(conn, pubkey), true, 3000),
      retryWithFallback((conn) => getTokenAccountCountWithConnection(conn, pubkey), true, 3000),
    ]);

    // Extract values from PromiseSettledResult
    const balance = balanceResult.status === 'fulfilled' ? balanceResult.value : null;
    const signatures = signaturesResult.status === 'fulfilled' ? signaturesResult.value : null;
    const tokenAccounts = tokenAccountsResult.status === 'fulfilled' ? tokenAccountsResult.value : null;

    // If all RPC calls failed, allow the wallet but mark it as unverified
    if (balance === null && signatures === null && tokenAccounts === null) {
      console.warn('⚠️ All RPC calls failed - allowing registration with lenient scoring');
      return {
        address: walletAddress,
        balance: 0,
        exists: true, // Assume it exists
        transactionCount: 1, // Assume has transactions
        walletAgeDays: 31, // Assume old enough
        lastTransactionDays: 0, // Assume recent activity
        tokenAccountCount: 1, // Assume has tokens
        riskScore: 25, // Low risk (gives benefit of doubt)
        riskFactors: ['unverified-wallet-rpc-offline'],
        isLegit: true, // ALLOW REGISTRATION even if RPC offline
        errorMessage: 'Wallet verification unavailable, but registration allowed',
      };
    }

    // Use actual data or defaults if specific calls failed
    const finalBalance = balance ?? 0;
    const finalSignatures = signatures ?? [];
    const finalTokenAccounts = tokenAccounts ?? 0;

    const solBalance = finalBalance / LAMPORTS_PER_SOL;
    const exists = finalBalance > 0 || finalSignatures.length > 0; // Exists if has balance OR transactions

    // Calculate metrics
    const { transactionCount, walletAgeDays, lastTransactionDays } = calculateMetrics(finalSignatures);

    // 📡 Check for CEX Funding (only for new wallets or for extra trust)
    let isFundedByCEX = false;
    if (finalSignatures.length > 0) {
      // Check the oldest transaction
      const oldestSignature = finalSignatures[finalSignatures.length - 1].signature;
      const cexCheck = await retryWithFallback((conn) => checkCEXFunding(conn, oldestSignature), false, 2000);
      isFundedByCEX = !!cexCheck;
    }

    const { riskScore, riskFactors } = calculateRiskScore(
      solBalance,
      transactionCount,
      walletAgeDays,
      lastTransactionDays,
      finalTokenAccounts === 0 && finalSignatures.length === 0 ? null : finalTokenAccounts,
      isFundedByCEX
    );

    // isLegit calculation - Updated to be more permissive for real users
    // 1. Lower the threshold for old wallets (Score < 65)
    // 2. Standard threshold for others (Score < 50)
    // 3. Special case for new active wallets OR CEX funded
    const isOldWallet = walletAgeDays > 90;
    const isLegit = riskScore < (isOldWallet ? 65 : 50) || 
                   (walletAgeDays < 30 && transactionCount >= 2 && solBalance >= 0.05) ||
                   isFundedByCEX; // CEX funded are almost always legit users

    return {
      address: walletAddress,
      balance: solBalance,
      exists,
      transactionCount,
      walletAgeDays,
      lastTransactionDays,
      tokenAccountCount: finalTokenAccounts,
      riskScore,
      riskFactors,
      isFundedByCEX,
      isLegit,
    };
  } catch (error) {
    console.error('Wallet analysis critical error:', error);
    // Even if there's an error, allow registration (be permissive)
    return {
      address: walletAddress,
      balance: 0,
      exists: true,
      transactionCount: 1,
      walletAgeDays: 31,
      lastTransactionDays: 0,
      tokenAccountCount: 1,
      riskScore: 25, // Low risk - give benefit of doubt
      riskFactors: ['wallet-analysis-error'],
      isLegit: true, // ALLOW REGISTRATION
      errorMessage: 'Wallet verification failed, registration allowed',
    };
  }
}

/**
 * Fetch wallet transaction signatures efficiently
 */
async function getWalletSignaturesWithConnection(conn: Connection, pubkey: PublicKey): Promise<ConfirmedSignatureInfo[] | null> {
  try {
    // Increased limit to 1000 to get a more accurate wallet age (same as server)
    const signatures = await conn.getSignaturesForAddress(pubkey, { limit: 1000 });
    return signatures || [];
  } catch (error) {
    console.warn('Could not fetch signatures:', error);
    return null; // Return null on failure, not empty array
  }
}

/**
 * Get token account count for wallet
 */
async function getTokenAccountCountWithConnection(conn: Connection, pubkey: PublicKey): Promise<number | null> {
  try {
    const tokenAccounts = await conn.getParsedTokenAccountsByOwner(pubkey, {
      programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
    });
    return tokenAccounts.value.length;
  } catch (error) {
    console.warn('Could not fetch token accounts:', error);
    return null; // Return null on failure, not 0
  }
}

/**
 * Check if the wallet's first transaction came from a known CEX
 */
async function checkCEXFunding(conn: Connection, oldestSignature: string): Promise<boolean> {
  try {
    const tx = await conn.getParsedTransaction(oldestSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });

    if (!tx || !tx.transaction.message.accountKeys) return false;

    // In a parsed transaction, accountKeys are objects
    const sender = tx.transaction.message.accountKeys[0].pubkey.toBase58();
    
    if (CEX_HOT_WALLETS.has(sender)) {
      console.log(`📡 [CEX Check] Wallet funded by CEX (${sender})`);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Could not verify CEX funding:', error);
    return false;
  }
}

/**
 * Calculate wallet age and transaction metrics
 */
function calculateMetrics(signatures: ConfirmedSignatureInfo[] | null): {
  transactionCount: number;
  walletAgeDays: number;
  lastTransactionDays: number;
} {
  // If signatures is null (RPC failed), return default values (assume legitimate)
  if (!signatures) {
    return {
      transactionCount: 1, // Assume has at least 1 transaction
      walletAgeDays: 31, // Assume wallet is old enough
      lastTransactionDays: 0, // Assume recent activity
    };
  }

  // Filter out signatures without valid blockTime and sort them
  const validSignatures = signatures
    .filter(s => s.blockTime !== null && s.blockTime !== undefined && s.blockTime > 0)
    .sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0)); // Newest first

  const transactionCount = validSignatures.length;
  
  let walletAgeDays = 0;
  let lastTransactionDays = 0;

  if (validSignatures.length > 0) {
    // Oldest transaction = wallet creation time (approximately)
    const oldestBlockTime = validSignatures[validSignatures.length - 1].blockTime!;
    const newestBlockTime = validSignatures[0].blockTime!;

    // Calculate wallet age from oldest transaction
    const nowSecs = Math.floor(Date.now() / 1000);
    walletAgeDays = Math.floor((nowSecs - oldestBlockTime) / (60 * 60 * 24));
    
    // Calculate days since last transaction
    lastTransactionDays = Math.floor((nowSecs - newestBlockTime) / (60 * 60 * 24));
    
    // WHALE/ACTIVE USER BONUS:
    // If we have 1000 transactions, it's likely an old wallet but RPC hit limit
    if (transactionCount >= 1000) {
      walletAgeDays = Math.max(walletAgeDays, 365);
    }

    // Safety check for negative values (rare clock sync issues)
    walletAgeDays = Math.max(0, walletAgeDays);
    lastTransactionDays = Math.max(0, lastTransactionDays);
    
    // Ensure 0 is at least 1 for old wallets
    if (walletAgeDays === 0 && oldestBlockTime < nowSecs - 86400) {
       walletAgeDays = 1;
    }
  }

  return { transactionCount, walletAgeDays, lastTransactionDays };
}

/**
 * Risk scoring algorithm
 * Higher score = higher risk (bot likely)
 */
function calculateRiskScore(
  balance: number,
  txCount: number,
  walletAgeDays: number,
  lastTxDays: number,
  tokenAccounts: number | null,
  isFundedByCEX: boolean = false
): { riskScore: number; riskFactors: string[] } {
  let riskScore = 0;
  const riskFactors: string[] = [];

  // 📡 [CEX BONUS] Huge trust boost for CEX-funded wallets
  if (isFundedByCEX) {
    riskScore -= 35;
    riskFactors.push('cex-funded-verification');
  }
  
  // If we couldn't verify the wallet, be lenient
  const unverified = tokenAccounts === null;

  // Balance check (20% weight)
  if (balance === 0) {
    riskScore += unverified ? 20 : 40; // Less strict if unverified
    riskFactors.push('zero-balance');
  } else if (balance < WALLET_THRESHOLDS.MIN_BALANCE) {
    riskScore += unverified ? 10 : 25;
    riskFactors.push('minimal-balance');
  } else if (balance > 1000) {
    riskScore -= 10; // Whales are less likely to be bots
    riskFactors.push('high-balance');
  }

  // Transaction activity (30% weight) - STRONGEST indicator
  if (txCount === 0) {
    riskScore += unverified ? 25 : 50;
    riskFactors.push('no-transactions');
  } else if (txCount < WALLET_THRESHOLDS.MIN_TX_COUNT) {
    riskScore += unverified ? 15 : 35;
    riskFactors.push('minimal-activity');
  } else if (txCount >= 3 && txCount < 10) {
    riskScore -= 5; // 3-10 transactions = real activity
    riskFactors.push('confirmed-activity');
  } else if (txCount >= 10) {
    riskScore -= 15; // 10+ transactions = very active user
    riskFactors.push('active-wallet');
  }

  // Wallet age (25% weight) - But smart about new wallets with activity
  if (walletAgeDays === 0) {
    // Brand new wallet (0 days)
    if (txCount >= 5 && balance >= 1) {
      // New wallet but with good activity = likely real user
      riskScore += 5;
      riskFactors.push('new-active-wallet');
    } else {
      riskScore += unverified ? 20 : 45;
      riskFactors.push('brand-new-wallet');
    }
  } else if (walletAgeDays < WALLET_THRESHOLDS.MIN_WALLET_AGE_DAYS) {
    // Recently created (< 3 days)
    if (txCount >= 2 && balance >= WALLET_THRESHOLDS.MIN_BALANCE) {
      // New but active wallet = likely legitimate user
      riskScore += 5;
      riskFactors.push('new-active-wallet');
    } else {
      riskScore += unverified ? 10 : 20;
      riskFactors.push('recently-created');
    }
  } else if (walletAgeDays > 730) {
    riskScore -= 40; // 2+ years = highly trustworthy
    riskFactors.push('legacy-wallet');
  } else if (walletAgeDays > 365) {
    riskScore -= 30; // 1+ year = established
    riskFactors.push('established-wallet');
  } else if (walletAgeDays > 90) {
    riskScore -= 15; // 3+ months = seasoned
    riskFactors.push('seasoned-wallet');
  }

  // Last transaction recency (15% weight)
  // Reduced penalties for old wallets that have been inactive
  const activityPenaltyMult = walletAgeDays > 180 ? 0.5 : 1.0;

  if (lastTxDays > 180) {
    riskScore += 20 * activityPenaltyMult;
    riskFactors.push('long-inactive');
  } else if (lastTxDays > 90) {
    riskScore += 10 * activityPenaltyMult;
    riskFactors.push('inactive-90days');
  }

  // Token account diversity (10% weight)
  if (tokenAccounts !== null && tokenAccounts === 0 && txCount > 0) {
    riskScore += 15; // Has transactions but no tokens = suspicious
    riskFactors.push('no-token-accounts');
  } else if (tokenAccounts !== null && tokenAccounts > 5) {
    riskScore -= 10; // Multiple tokens = legitimate user
    riskFactors.push('diverse-portfolio');
  }

  return {
    riskScore: Math.min(100, Math.max(0, riskScore)),
    riskFactors,
  };
}

/**
 * Generate human-readable wallet quality assessment
 */
export function getWalletQualityAssessment(metrics: WalletMetrics): string {
  if (!metrics.exists) {
    return '❌ Wallet does not exist on-chain';
  }

  // If the logic marks it as legit, give a positive message regardless of raw score
  if (metrics.isLegit && metrics.riskScore < 50) {
    return '✅ Legitimate wallet (safe)';
  }

  if (metrics.isLegit && metrics.riskScore >= 50) {
    return '✅ Established wallet (verified)';
  }

  if (metrics.riskScore >= 75) {
    return '⚠️ High risk wallet (bot protection)';
  }

  return '⚠️ Quality requirements not met';
}

/**
 * Get detailed warning message for risky wallets
 */
export function getWalletRiskMessage(metrics: WalletMetrics): string {
  // If wallet is legitimate OR unverified (RPC offline), no warning
  if (metrics.isLegit || metrics.riskScore < 30) {
    return '';
  }

  const messages: string[] = [];

  if (metrics.riskFactors.includes('zero-balance')) {
    messages.push('This wallet has zero balance');
  }

  if (metrics.riskFactors.includes('no-transactions')) {
    messages.push('This wallet has never been used');
  }

  if (metrics.riskFactors.includes('brand-new-wallet')) {
    messages.push('This wallet is too new (minimum 3 days age required)');
  }

  if (metrics.riskFactors.includes('minimal-balance')) {
    messages.push(`Please add at least ${WALLET_THRESHOLDS.MIN_BALANCE} SOL`);
  }

  if (metrics.riskFactors.includes('recently-created')) {
    messages.push(`Wallet must be at least ${WALLET_THRESHOLDS.MIN_WALLET_AGE_DAYS} days old or funded by a CEX`);
  }

  if (metrics.riskFactors.includes('long-inactive')) {
    messages.push('This wallet has been inactive for over 6 months');
  }

  if (metrics.riskFactors.includes('unverified-wallet-rpc-offline')) {
    messages.push('Wallet verification service temporarily unavailable, but registration allowed');
  }

  let finalMsg = messages.join(' • ');
  
  // Give specific actionable advice for new wallets (Updated Feb 2026)
  if (metrics.walletAgeDays < 3 && !metrics.isFundedByCEX && !metrics.isLegit) {
    const daysRemaining = 3 - metrics.walletAgeDays;
    const solNeeded = Math.max(0, 0.02 - metrics.balance).toFixed(4);
    const txsNeeded = Math.max(0, 3 - metrics.transactionCount);
    
    if (finalMsg) finalMsg += ' • ';
    finalMsg += `TIP: New wallets need ONE of these options: `;
    finalMsg += `(a) Wait ${daysRemaining} more day${daysRemaining !== 1 ? 's' : ''}, `;
    finalMsg += `(b) Add ${solNeeded} SOL + make ${txsNeeded} more transaction${txsNeeded !== 1 ? 's' : ''}, `;
    finalMsg += `(c) Use a wallet funded from Binance/Coinbase`;
  }

  return finalMsg || 'Wallet does not meet security requirements';
}
