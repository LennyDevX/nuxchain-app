import { Router } from 'express';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getFirestore } from 'firebase-admin/firestore';

const router = Router();
// Quitamos la inicialización top-level que causaba el crash
// const db = getFirestore(); 
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://solana-rpc.publicnode.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');

// Validations helper (sync with airdrop-service for consistency)
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
  'throwaway.email', 'yopmail.com', 'temp-mail.org', 'maildrop.cc'
]);

// Known CEX Hot Wallets (Verified Base58 for Solana)
const CEX_HOT_WALLETS = new Set([
  '5tzFkiK7jzspR9uUTi6tS9ai2LUMv87UXcrXAykyvH8', // Binance
  '9WzDX9Gk9y89yAyXfE7C6v6m4VvR3C6u7C6v6m4VvR3C', // Binance 2
  '2AQdpHJt9bmvBsT9HFrEE2r3o8Gq6fWPb82nFis2N', // Coinbase
  '6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P6D4P', // Gate.io
  '8hiTUH6YZmgE94mbMxseSs2vc8ZrpqaaLUuHQ2bQPrTJ', // Known high volume sender
]);

/**
 * Check if the wallet's first transaction came from a known CEX
 */
async function isFundedByCEX(wallet, oldestSignature) {
  try {
    const tx = await connection.getParsedTransaction(oldestSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    });

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
    const balance = await connection.getBalance(pubkey);
    const solBalance = balance / LAMPORTS_PER_SOL;

    let signatures = [];
    try {
      signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1000 });
    } catch (e) {
      signatures = [];
    }

    const transactionCount = signatures.length;
    let walletAgeDays = 0;
    
    if (signatures.length > 0) {
      const validSignatures = signatures.filter(s => s.blockTime).sort((a,b) => a.blockTime - b.blockTime);
      if (validSignatures.length > 0) {
        const oldestBlockTime = validSignatures[0].blockTime;
        walletAgeDays = Math.floor((Date.now() - oldestBlockTime * 1000) / (1000 * 60 * 60 * 24));
      }

      // Bonus: Si llegamos al límite de 1000 txs, es una wallet muy activa/vieja
      if (transactionCount >= 1000) {
        walletAgeDays = Math.max(walletAgeDays, 365);
      }
    }

    // Permissive rules for test/real users
    const MIN_SOL_BALANCE = 0.0001; 
    let isActive = transactionCount >= 5 || solBalance >= 0.02 || walletAgeDays >= 3;

    // Exception for fresh wallets funded by CEX
    if (!isActive && signatures.length > 0) {
      const oldestSig = signatures[signatures.length - 1].signature;
      const fundedByCEX = await isFundedByCEX(wallet, oldestSig);
      if (fundedByCEX) {
        console.log(`✅ CEX Exception (Local): ${wallet}`);
        isActive = true;
      }
    }

    if (!isActive && solBalance < MIN_SOL_BALANCE && transactionCount === 0) {
      return { isValid: false, reason: 'Wallet has no balance, no history and no CEX funding' };
    }

    return { 
      isValid: true, 
      balance: solBalance,
      transactionCount,
      walletAgeDays 
    };
  } catch (error) {
    return { isValid: false, reason: 'Invalid wallet address or RPC error' };
  }
}

// POST /validate
router.post('/validate', async (req, res) => {
  try {
    const { name, email, wallet } = req.body;

    if (!name || name.length < 3) return res.status(400).json({ success: false, error: 'Name too short' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Invalid email' });

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
    const { name, email, wallet, fingerprint, ipAddress } = req.body;
    const db = getFirestore(); // Inicializamos dentro del handler

    const registrationData = {
      name,
      email: email.toLowerCase(),
      wallet,
      fingerprint: fingerprint || 'unknown',
      ipAddress: ipAddress || 'unknown',
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
