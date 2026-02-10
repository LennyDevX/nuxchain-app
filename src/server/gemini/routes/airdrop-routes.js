import { Router } from 'express';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();
// Quitamos la inicialización top-level que causaba el crash
// const db = getFirestore(); 
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC_QUICKNODE || process.env.SOLANA_RPC || 'https://solana-rpc.publicnode.com';
// El objeto connection se declara más abajo junto con la lógica de rotación de RPC

// Validations helper (sync with airdrop-service for consistency)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', '10minutesemail.com',
  'guerrillamail.com', 'mailinator.com', 'throwaway.email',
  'yopmail.com', 'maildrop.cc', 'mintemail.com',
  'sharklasers.com', 'trashmail.com', 'tempmail.de',
  'nada.email', 'fakeinbox.com', 'spam4.me', 'mytrashmail.com',
  'email.it', 'grr.la', 'pokemail.net', 'mailnesia.com',
  'temp-mail.com', '33mail.com', 'tempmail.io', 'tormail.org',
  'temp-mail.org', 'tempmail.ninja', 'guerrilla.email',
  'mail.tm', 'maildrop.cc', 'mintemail.com', 'mytempmail.com',
  'temp-mail.io', 'tempemail.com', 'temporaryemail.com',
  'trashmail.ws', 'trashmail.de', 'throwawaymail.com',
  'bot-email.com', 'bot-mail.com', 'bot.email', 'automation-mail.co',
]);

// Known CEX Hot Wallets (Verified Base58 for Solana)
const CEX_HOT_WALLETS = new Set([
  '5tzFkiKntRKvwdsPh4JnqUjqafNvJPvLHKZJuGxfCeKN',
  'H8sMJSCQxfKiFTCfDR3DUMLPwcRbM61LGFJ8N4dK3WjS',
  'HLwEJQUAZfEHNFZ48YrJeHcNqhQTTvVBdQV3RLGTpump',
  '2AQdpHJ6AU6c7mNHUkk7FQKL9dGMPUtQdS6jx9fYZS8X',
  '9WzDXz7eHQRrMCQk2bZ8bQoJvBT8kkKjZjQvXpJGpump',
  'H8UekPGwePSmQ3ttuYGPU1szyFfjZR4N53rymSFwpLPm',
  '2ojv9BAiHUrvsm9gxDe7fJSzbNZSJcxZvf8dqmWGHG8S',
  'GJRs4FwHtemZ5ZE9x3FNvJ8TMwitKTh21yxdRPqn7npE',
  '5VCwKtCXgCJ6kit5FybXjvriW3xELsFDhYrPSqtJNmcD',
  'AC5RDfQFmDS1deWZos921JfqscXdByf8BKHs5ACWjtW2',
  'DtDZCnXEN69n5W6rN5Bvmk3k5h5dGGJmJY8JxH1xDFnL',
]);

// Multiple RPC endpoints for redundancy (match frontend strategy)
const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_QUICKNODE,
  process.env.SOLANA_RPC,
  'https://solana-rpc.publicnode.com',
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana'
].filter(Boolean);

let currentRpcIndex = 0;
let connection = new Connection(RPC_ENDPOINTS[currentRpcIndex] || 'https://api.mainnet-beta.solana.com', 'confirmed');

/**
 * 🔄 Rotate to next RPC endpoint
 */
function rotateRpc() {
  currentRpcIndex = (currentRpcIndex + 1) % RPC_ENDPOINTS.length;
  connection = new Connection(RPC_ENDPOINTS[currentRpcIndex], 'confirmed');
  console.log(`🔄 [Local] Rotated to RPC: ${RPC_ENDPOINTS[currentRpcIndex]} (Index: ${currentRpcIndex})`);
  return connection;
}

/**
 * 🔄 Helper for RPC retries with rotation
 */
async function withRetry(fn, retries = 3, delay = 500) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn(connection);
    } catch (error) {
      lastError = error;
      const isRateLimited = error?.message?.includes('429') || error?.status === 429;

      if (isRateLimited || i > 0) {
        rotateRpc();
      }

      if (i < retries - 1) {
        console.warn(`⚠️ [API-Local] RPC attempt ${i + 1} failed, retrying in ${delay}ms... (Node: ${RPC_ENDPOINTS[currentRpcIndex]})`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  throw lastError;
}

/**
 * Check if the wallet's first transaction came from a known CEX
 */
async function isFundedByCEX(wallet, oldestSignature) {
  try {
    const tx = await withRetry((conn) => conn.getParsedTransaction(oldestSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    }));

    if (!tx || !tx.transaction.message.accountKeys) return false;

    // accountKeys is an array of objects in parsed transactions
    const sender = tx.transaction.message.accountKeys[0].pubkey.toBase58();

    if (CEX_HOT_WALLETS.has(sender)) {
      console.log(`📡 [CEX Check Local] Wallet ${wallet} funded by CEX (${sender})`);
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Helper to validate wallet on-chain
async function validateWalletOnChain(wallet) {
  try {
    const pubkey = new PublicKey(wallet);
    const balance = await withRetry((conn) => conn.getBalance(pubkey));
    const solBalance = balance / LAMPORTS_PER_SOL;

    // Reliable history check via signatures
    let signatures = [];
    let rpcError = false;

    try {
      // Pass 1: Get signatures for detailed analysis (age, specific activities)
      // On Solana, this is the standard way to verify account "activity"
      signatures = await withRetry((conn) => conn.getSignaturesForAddress(pubkey, { limit: 1000 }));
    } catch (e) {
      console.error(`❌ [API-Local] RPC failed to fetch signatures for ${wallet}:`, e.message);
      rpcError = true;
    }

    let transactionCount = signatures.length;
    let walletAgeDays = 0;

    // Calculate wallet age from oldest transaction in sample
    if (signatures.length > 0) {
      // Signatures are returned in descending order (newest first)
      const validSignatures = signatures.filter(s => s.blockTime).sort((a, b) => (a.blockTime || 0) - (b.blockTime || 0));

      if (validSignatures.length > 0 && validSignatures[0].blockTime) {
        walletAgeDays = Math.floor((Date.now() - validSignatures[0].blockTime * 1000) / (1000 * 60 * 60 * 24));
      }

      // Bonus: Si llegamos al límite de 1,000 txs, es una wallet muy activa/vieja
      if (signatures.length >= 1000) {
        walletAgeDays = Math.max(walletAgeDays, 90);
      }
    }

    // ============================================================================
    // SYNCED RULES (Feb 2026)
    // ============================================================================
    const MIN_SOL_BALANCE = 0.01;
    const LEGACY_WALLET_AGE = 90;
    const ACTIVE_WALLET_TX_THRESHOLD = 2;
    const ACTIVE_WALLET_BALANCE_THRESHOLD = 0.02;
    const HIGH_BALANCE_THRESHOLD = 0.1;

    // KEY: Any confirmed transaction history is LEGIT
    const hasHistory = transactionCount > 0;

    if (hasHistory) {
      return {
        isValid: true,
        balance: solBalance,
        transactionCount,
        walletAgeDays
      };
    }

    // IF RPC COMPLETELY FAILED AND NO HISTORY FOUND
    // We don't want to reject someone just because the RPC is down
    if (rpcError && transactionCount === 0) {
      if (solBalance > 0.001) {
        console.log(`⚠️ [API-Local] Verification unavailable for ${wallet} (Bal: ${solBalance}), but allowing due to non-zero balance`);
        return {
          isValid: true,
          balance: solBalance,
          transactionCount: 0,
          walletAgeDays: 0,
          rpcVerified: false
        };
      }
      return {
        isValid: false,
        reason: 'Service Connectivity Error: Could not verify wallet history. Please try again with a slightly higher balance or wait 5 minutes.',
        isRpcError: true
      };
    }

    // Strict validation for wallets with NO history
    const effectiveMinBalance = walletAgeDays >= LEGACY_WALLET_AGE ? 0.001 : MIN_SOL_BALANCE;

    if (solBalance < effectiveMinBalance) {
      return { isValid: false, reason: `Balance too low (${solBalance.toFixed(4)} < ${effectiveMinBalance} SOL)` };
    }

    // Active/High balance exceptions for new wallets (though they'd have history if active)
    if (solBalance >= HIGH_BALANCE_THRESHOLD || (transactionCount >= ACTIVE_WALLET_TX_THRESHOLD && solBalance >= ACTIVE_WALLET_BALANCE_THRESHOLD)) {
      return { isValid: true, balance: solBalance, transactionCount, walletAgeDays };
    }

    // CEX Funding check fallback
    if (signatures.length > 0) {
      const oldestSig = signatures[signatures.length - 1].signature;
      const fundedByCEX = await isFundedByCEX(wallet, oldestSig);
      if (fundedByCEX) return { isValid: true, balance: solBalance, transactionCount, walletAgeDays };
    }

    return { isValid: false, reason: 'New wallet with insufficient balance and no transaction history' };
  } catch (error) {
    return { isValid: false, reason: 'Invalid wallet address or RPC error' };
  }
}

// POST /validate
router.post('/validate', async (req, res) => {
  try {
    const { name, email, wallet } = req.body;

    if (!name || name.length < 3) return res.status(400).json({ success: false, error: 'Name must be at least 3 characters long' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Invalid email format' });

    // Check Disposable Email
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.has(emailDomain)) {
      return res.status(403).json({
        success: false,
        error: 'Disposable email addresses are not allowed. Please use a personal email.'
      });
    }

    const db = getFirestore(); // Inicializamos dentro del handler

    // Check for duplicates
    const emailCheck = await db.collection(COLLECTION_NAME).where('email', '==', email.toLowerCase()).get();
    if (!emailCheck.empty) return res.status(409).json({ success: false, error: 'Email already registered' });

    const walletCheck = await db.collection(COLLECTION_NAME).where('wallet', '==', wallet).get();
    if (!walletCheck.empty) return res.status(409).json({ success: false, error: 'Wallet already registered' });

    // Chain validation
    const walletValidation = await validateWalletOnChain(wallet);
    if (!walletValidation.isValid) {
      return res.status(400).json({ success: false, error: walletValidation.reason });
    }

    res.json({ success: true, details: walletValidation });
  } catch (error) {
    console.error('Error in /validate:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /submit
router.post('/submit', async (req, res) => {
  try {
    const { name, email, wallet, fingerprint, ipAddress, userAgent, browserInfo, timeToSubmit } = req.body;
    const db = getFirestore(); // Inicializamos dentro del handler

    const registrationData = {
      name,
      email: email.toLowerCase(),
      wallet,
      fingerprint: fingerprint || 'unknown',
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown',
      browserInfo: browserInfo || {},
      timeToSubmit: timeToSubmit || 0,
      createdAt: new Date(),
      status: 'pending'
    };

    const docRef = await db.collection(COLLECTION_NAME).add(registrationData);
    res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Error in /submit:', error);
    res.status(500).json({ success: false, error: 'Failed to save registration' });
  }
});

export default router;
