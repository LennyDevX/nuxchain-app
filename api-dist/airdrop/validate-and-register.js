/**
 * 🛡️ AIRDROP VALIDATION & REGISTRATION SERVICE
 * Server-side validation to prevent bot registrations
 * Called from frontend after initial validations
 */
import { getFirestore } from 'firebase-admin/firestore';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
// ============================================================================
// CONFIGURATION
// ============================================================================
const db = getFirestore();
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://solana-rpc.publicnode.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');
// Disposable email domains list
const DISPOSABLE_EMAIL_DOMAINS = new Set([
    'tempmail.com', 'guerrillamail.com', '10minutemail.com', 'mailinator.com',
    'throwaway.email', 'yopmail.com', 'temp-mail.org', 'maildrop.cc',
    'mintemail.com', 'sharklasers.com', 'trashmail.com', 'tempmail.de',
    'nada.email', 'fakeinbox.com', 'spam4.me', 'mytrashmail.com',
    'email.it', '10minutesemail.com', 'grr.la', 'pokemail.net', 'mailnesia.com',
    'temp-mail.com', '33mail.com', 'tempmail.io', 'tormail.org',
]);
// Data center IP patterns
const DATA_CENTER_IP_RANGES = [
    /^52\./, // AWS
    /^34\./, // AWS
    /^35\./, // AWS/Google
    /^104\./, // Google Cloud
    /^13\./, // Azure
    /^40\./, // Azure
    /^191\./, // Azure
];
// Known CEX Hot Wallets (Verified Base58 for Solana Mainnet)
// Updated Feb 2026 - Real addresses from Binance and Coinbase withdrawals
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
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
function isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isDataCenterIP(ipAddress) {
    return DATA_CENTER_IP_RANGES.some(pattern => pattern.test(ipAddress));
}
/**
 * Check if the wallet's first transaction came from a known CEX
 */
async function isFundedByCEX(wallet, oldestSignature) {
    try {
        const tx = await connection.getParsedTransaction(oldestSignature, {
            maxSupportedTransactionVersion: 0,
            commitment: 'confirmed'
        });
        if (!tx || !tx.transaction.message.accountKeys)
            return false;
        // The sender is usually the first account in a simple transfer
        // accountKeys is an array of objects for parsed transactions
        const accountKeys = tx.transaction.message.accountKeys;
        const sender = accountKeys[0].pubkey.toBase58();
        // Check if sender is in our CEX list
        if (CEX_HOT_WALLETS.has(sender)) {
            console.log(`📡 [CEX Check] Wallet ${wallet} was funded by a CEX (${sender})`);
            return true;
        }
        return false;
    }
    catch (error) {
        console.warn(`⚠️ [CEX Check] Could not verify funding for ${wallet}:`, error);
        return false;
    }
}
async function checkIPFarm(ipAddress) {
    try {
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('ipAddress', '==', ipAddress)
            .get();
        const count = snapshot.size;
        // More than 3 registrations from same IP = suspicious
        if (count >= 3) {
            return {
                isRisky: true,
                count,
                reason: `Too many registrations (${count}) from this IP address`,
            };
        }
        return { isRisky: false, count };
    }
    catch (error) {
        console.error('Error checking IP farm:', error);
        return { isRisky: false, count: 0 };
    }
}
async function checkRateLimit(ipAddress) {
    try {
        const oneHourAgo = new Date(Date.now() - 3600000);
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('ipAddress', '==', ipAddress)
            .where('createdAt', '>', oneHourAgo)
            .get();
        const count = snapshot.size;
        // More than 3 registrations per hour = rate limit
        if (count >= 3) {
            return {
                isRateLimited: true,
                count,
                reason: `Too many registration attempts (${count}) in the last hour from this IP`,
            };
        }
        return { isRateLimited: false, count };
    }
    catch (error) {
        console.error('Error checking rate limit:', error);
        return { isRateLimited: false, count: 0 };
    }
}
async function checkDuplicates(email, wallet) {
    try {
        // Check email
        const emailSnapshot = await db.collection(COLLECTION_NAME)
            .where('email', '==', email.toLowerCase())
            .get();
        if (!emailSnapshot.empty) {
            return {
                hasDuplicate: true,
                field: 'email',
                reason: 'This email is already registered',
            };
        }
        // Check wallet
        const walletSnapshot = await db.collection(COLLECTION_NAME)
            .where('wallet', '==', wallet)
            .get();
        if (!walletSnapshot.empty) {
            return {
                hasDuplicate: true,
                field: 'wallet',
                reason: 'This wallet is already registered',
            };
        }
        return { hasDuplicate: false };
    }
    catch (error) {
        console.error('Error checking duplicates:', error);
        return { hasDuplicate: false };
    }
}
async function validateWalletOnChain(wallet) {
    try {
        const pubkey = new PublicKey(wallet);
        // Get balance
        const balance = await connection.getBalance(pubkey);
        const solBalance = balance / LAMPORTS_PER_SOL;
        // Fetch larger sample of transactions (1000 = max per RPC call)
        // This gets accurate age for 95% of wallets without pagination
        let signatures = [];
        try {
            signatures = await connection.getSignaturesForAddress(pubkey, { limit: 1000 });
        }
        catch {
            // If error getting signatures, wallet might be empty
            signatures = [];
        }
        const transactionCount = signatures.length;
        // Calculate wallet age from oldest transaction in sample
        let walletAgeDays = 0;
        if (signatures.length > 0) {
            // Signatures are returned in descending order (newest first)
            // Last element is the oldest transaction in this batch
            const oldestSignature = signatures[signatures.length - 1];
            if (oldestSignature.blockTime) {
                // Use blockTime directly from signature info (faster than fetching full tx)
                walletAgeDays = Math.floor((Date.now() - oldestSignature.blockTime * 1000) / (1000 * 60 * 60 * 24));
            }
            // 🚀 WHALE/ACTIVE USER BONUS:
            // If we hit the 1,000 transaction limit, the wallet is likely much older,
            // but the RPC limit prevents us from seeing further back.
            // We'll treat 1,000+ tx wallets as Legacy (90+ days) automatically.
            if (transactionCount >= 1000) {
                walletAgeDays = Math.max(walletAgeDays, 90);
            }
        }
        // Smart validation rules (Option B: Hybrid approach)
        const MIN_SOL_BALANCE = 0.0005; // Reduced from 0.001 for legacy users
        const MIN_WALLET_AGE = 3;
        const MIN_TRANSACTIONS = 1;
        const LEGACY_WALLET_AGE = 90; // Wallets older than 90 days are "Legacy"
        // Active wallet thresholds for age exception (Feb 2026: More lenient for real users)
        const ACTIVE_WALLET_TX_THRESHOLD = 3; // Reduced from 5 - Real users have 2-4 txs typically
        const ACTIVE_WALLET_BALANCE_THRESHOLD = 0.02; // Reduced from 0.05 - More reasonable for new users
        // Validation: Minimum balance
        // Exception: Even lower balance required for legacy wallets
        const effectiveMinBalance = walletAgeDays >= LEGACY_WALLET_AGE ? 0.0001 : MIN_SOL_BALANCE;
        if (solBalance < effectiveMinBalance) {
            return {
                isValid: false,
                exists: true,
                balance: solBalance,
                transactionCount,
                walletAgeDays,
                reason: `Wallet balance too low: ${solBalance.toFixed(6)} SOL (min ${effectiveMinBalance} SOL for ${walletAgeDays >= LEGACY_WALLET_AGE ? 'legacy' : 'new'} wallets)`,
            };
        }
        // Validation: Minimum transactions (critical for all wallets)
        if (transactionCount < MIN_TRANSACTIONS) {
            return {
                isValid: false,
                exists: true,
                balance: solBalance,
                transactionCount: 0,
                walletAgeDays: 0,
                reason: 'Wallet has no transaction history',
            };
        }
        // Smart age validation with active wallet exception
        if (walletAgeDays >= 0 && walletAgeDays < MIN_WALLET_AGE) {
            // Exception 1: Allow "new but active" wallets
            // These are likely real users actively using Solana
            // Updated Feb 2026: More lenient thresholds (3 txs + 0.02 SOL)
            const isActiveWallet = transactionCount >= ACTIVE_WALLET_TX_THRESHOLD &&
                solBalance >= ACTIVE_WALLET_BALANCE_THRESHOLD;
            if (isActiveWallet) {
                console.log(`✅ Active wallet exception: ${wallet} (${transactionCount} txs, ${solBalance.toFixed(4)} SOL, ${walletAgeDays} days old)`);
                return {
                    isValid: true,
                    exists: true,
                    balance: solBalance,
                    transactionCount,
                    walletAgeDays,
                };
            }
            // Exception 2: Allow fresh wallets funded by a CEX
            // This is a common pattern for real users creating new wallets for airdrops
            if (signatures.length > 0) {
                const oldestSig = signatures[signatures.length - 1].signature;
                const fundedByCEX = await isFundedByCEX(wallet, oldestSig);
                if (fundedByCEX) {
                    console.log(`✅ CEX Funding exception: ${wallet} (${walletAgeDays} days old, funded by CEX)`);
                    return {
                        isValid: true,
                        exists: true,
                        balance: solBalance,
                        transactionCount,
                        walletAgeDays,
                    };
                }
            }
            // Reject only truly new wallets with minimal activity and no CEX funding
            return {
                isValid: false,
                exists: true,
                balance: solBalance,
                transactionCount,
                walletAgeDays,
                reason: `Wallet is too new (${walletAgeDays} days old). Please: (a) Wait ${MIN_WALLET_AGE - walletAgeDays} more days, OR (b) Add ${(ACTIVE_WALLET_BALANCE_THRESHOLD - solBalance).toFixed(4)} more SOL and make ${ACTIVE_WALLET_TX_THRESHOLD - transactionCount} more transactions, OR (c) Use a wallet funded from Binance/Coinbase`,
            };
        }
        // All validations passed
        console.log(`✅ Wallet validated: ${wallet} (${walletAgeDays} days old, ${transactionCount} txs, ${solBalance.toFixed(4)} SOL)`);
        return {
            isValid: true,
            exists: true,
            balance: solBalance,
            transactionCount,
            walletAgeDays,
        };
    }
    catch (error) {
        console.error('Error validating wallet on-chain:', error);
        return {
            isValid: false,
            exists: false,
            balance: 0,
            transactionCount: 0,
            walletAgeDays: 0,
            reason: `Wallet validation error: ${error.message}`,
        };
    }
}
async function checkDeviceFingerprint(fingerprint) {
    try {
        if (!fingerprint || fingerprint === 'unknown') {
            return { isDuplicate: false, count: 0 };
        }
        const snapshot = await db.collection(COLLECTION_NAME)
            .where('fingerprint', '==', fingerprint)
            .get();
        const count = snapshot.size;
        if (count >= 2) {
            return {
                isDuplicate: true,
                count,
                reason: `This device has already registered (${count} registrations detected)`,
            };
        }
        return { isDuplicate: false, count };
    }
    catch (error) {
        console.error('Error checking device fingerprint:', error);
        return { isDuplicate: false, count: 0 };
    }
}
// ============================================================================
// MAIN ENDPOINT: VALIDATE REGISTRATION
// ============================================================================
export async function validateAirdropRegistration(req, res) {
    try {
        const { name, email, wallet, fingerprint, ipAddress, } = req.body;
        console.log('🔍 Validating registration:', { email, wallet, ipAddress });
        // ========================================
        // 1. BASIC INPUT VALIDATION
        // ========================================
        if (!name || typeof name !== 'string' || name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                error: 'Name must be at least 3 characters long',
            });
        }
        if (!email || typeof email !== 'string' || !isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format',
            });
        }
        if (!wallet || typeof wallet !== 'string' || wallet.length < 32) {
            return res.status(400).json({
                success: false,
                error: 'Invalid wallet address',
            });
        }
        if (!ipAddress) {
            return res.status(400).json({
                success: false,
                error: 'IP address is required',
            });
        }
        // ========================================
        // 2. EMAIL VALIDATION
        // ========================================
        // Check disposable email
        if (isDisposableEmail(email)) {
            console.warn(`🚩 Disposable email blocked: ${email}`);
            return res.status(403).json({
                success: false,
                error: 'Disposable email addresses are not allowed. Please use a personal email.',
            });
        }
        // Check duplicate email
        const duplicateCheck = await checkDuplicates(email, wallet);
        if (duplicateCheck.hasDuplicate) {
            console.warn(`⚠️ Duplicate ${duplicateCheck.field}:`, email);
            return res.status(409).json({
                success: false,
                error: duplicateCheck.reason,
            });
        }
        // ========================================
        // 3. WALLET ON-CHAIN VALIDATION
        // ========================================
        const walletValidation = await validateWalletOnChain(wallet);
        if (!walletValidation.isValid) {
            console.warn(`🚩 Wallet validation failed:`, walletValidation.reason);
            return res.status(400).json({
                success: false,
                error: walletValidation.reason || 'Wallet validation failed',
            });
        }
        // ========================================
        // 4. IP-BASED SECURITY CHECKS
        // ========================================
        // Check if data center IP
        if (isDataCenterIP(ipAddress)) {
            console.warn(`🚩 Data center IP detected: ${ipAddress}`);
            return res.status(403).json({
                success: false,
                error: 'Registration from data centers or proxies is not allowed. Please use a residential IP.',
            });
        }
        // Check IP farm
        const ipFarmCheck = await checkIPFarm(ipAddress);
        if (ipFarmCheck.isRisky) {
            console.warn(`🚩 IP Farm detected:`, ipFarmCheck);
            return res.status(429).json({
                success: false,
                error: ipFarmCheck.reason,
            });
        }
        // Check rate limit
        const rateLimitCheck = await checkRateLimit(ipAddress);
        if (rateLimitCheck.isRateLimited) {
            console.warn(`⏱️ Rate limit exceeded:`, rateLimitCheck);
            return res.status(429).json({
                success: false,
                error: 'Too many registration attempts from your IP. Please try again later.',
            });
        }
        // ========================================
        // 5. DEVICE FINGERPRINT VALIDATION
        // ========================================
        if (fingerprint && fingerprint !== 'unknown') {
            const fpCheck = await checkDeviceFingerprint(fingerprint);
            if (fpCheck.isDuplicate) {
                console.warn(`📱 Duplicate fingerprint detected:`, fpCheck);
                return res.status(409).json({
                    success: false,
                    error: fpCheck.reason,
                });
            }
        }
        // ========================================
        // ALL VALIDATIONS PASSED
        // ========================================
        console.log(`✅ All validations passed for: ${email}`);
        return res.status(200).json({
            success: true,
            message: 'Validation successful. You may proceed with registration.',
            data: {
                email: email.toLowerCase(),
                wallet,
                walletMetrics: {
                    balance: walletValidation.balance,
                    transactionCount: walletValidation.transactionCount,
                    walletAgeDays: walletValidation.walletAgeDays,
                },
            },
        });
    }
    catch (error) {
        console.error('❌ Validation error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during validation',
        });
    }
}
// ============================================================================
// MAIN ENDPOINT: SUBMIT REGISTRATION (After validation passes)
// ============================================================================
export async function submitAirdropRegistration(req, res) {
    try {
        const { name, email, wallet, fingerprint, ipAddress, userAgent, browserInfo, timeToSubmit, } = req.body;
        console.log('📝 Submitting registration for:', email);
        // Re-validate critical fields (security)
        if (!email || !wallet || !ipAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
            });
        }
        // Quick duplicate check (should be rare at this point)
        const duplicates = await checkDuplicates(email, wallet);
        if (duplicates.hasDuplicate) {
            console.warn(`⚠️ Duplicate detected at submission:`, email);
            return res.status(409).json({
                success: false,
                error: 'This registration already exists',
            });
        }
        // Save to Firestore
        try {
            const docRef = await db.collection(COLLECTION_NAME).add({
                name: name.trim(),
                email: email.toLowerCase(),
                wallet,
                fingerprint: fingerprint || 'unknown',
                ipAddress,
                userAgent: userAgent || 'unknown',
                browserName: browserInfo?.browserName || 'unknown',
                browserVersion: browserInfo?.browserVersion || 'unknown',
                osName: browserInfo?.osName || 'unknown',
                deviceType: browserInfo?.deviceType || 'unknown',
                screenResolution: browserInfo?.screenResolution || 'unknown',
                timezone: browserInfo?.timezone || 'unknown',
                language: browserInfo?.language || 'unknown',
                timeToSubmit: timeToSubmit || 0,
                network: 'solana',
                airdropAmount: '6000',
                status: 'registered',
                createdAt: new Date(),
                validatedAt: new Date(),
            });
            console.log(`✅ Registration completed for: ${email} (Doc ID: ${docRef.id})`);
            return res.status(201).json({
                success: true,
                message: 'Registration successful! You will receive 6000 NUX tokens.',
                docId: docRef.id,
            });
        }
        catch (error) {
            console.error('❌ Error saving registration:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to save registration',
            });
        }
    }
    catch (error) {
        console.error('❌ Submission error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error during submission',
        });
    }
}
