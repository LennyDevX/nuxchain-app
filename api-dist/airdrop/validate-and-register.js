/**
 * 🛡️ AIRDROP VALIDATION & REGISTRATION SERVICE
 * Server-side validation to prevent bot registrations
 * Called from frontend after initial validations
 *
 * SECURITY ENHANCEMENTS (Feb 2026):
 * - Distributed rate limiting with Firestore
 * - Email normalization to prevent alias abuse
 * - Audit logging for fraud detection
 * - Generic error messages to prevent enumeration
 * - Centralized CEX wallet list
 */
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getDb } from '../_services/firebase-admin.js';
import { checkDistributedRateLimit } from '../_services/distributed-rate-limiter.js';
import { normalizeEmail } from '../_services/email-normalizer.js';
import { logAuditEvent, logRegistrationAttempt, logSecurityViolation, LogLevel, EventType } from '../_services/audit-logger.js';
// ============================================================================
// CONFIGURATION
// ============================================================================
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://solana-rpc.publicnode.com';
const connection = new Connection(SOLANA_RPC, 'confirmed');
// CEX wallets are now fetched from centralized endpoint
let CEX_HOT_WALLETS = null;
let cexWalletsLastFetch = 0;
const CEX_CACHE_TTL = 3600000; // 1 hour
/**
 * Fetch CEX wallets from centralized endpoint (cached)
 */
async function getCEXWallets() {
    const now = Date.now();
    // Return cached version if still valid
    if (CEX_HOT_WALLETS && (now - cexWalletsLastFetch) < CEX_CACHE_TTL) {
        return CEX_HOT_WALLETS;
    }
    try {
        // Fetch from local endpoint (same deployment)
        const baseUrl = process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/airdrop/cex-wallets`);
        const data = (await response.json());
        if (data.success && data.wallets && Array.isArray(data.wallets)) {
            CEX_HOT_WALLETS = new Set(data.wallets);
            cexWalletsLastFetch = now;
            console.log(`✅ Loaded ${CEX_HOT_WALLETS.size} CEX wallets from centralized endpoint`);
        }
    }
    catch (error) {
        console.warn('⚠️ Failed to fetch CEX wallets, using fallback list:', error);
        // Fallback to hardcoded list
        CEX_HOT_WALLETS = new Set([
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
        ]);
    }
    return CEX_HOT_WALLETS || new Set();
}
/**
 * Disposable email domains list - ONLY includes TRULY temporary email services
 * Legitimate privacy services (ProtonMail, Tutanota, etc) are NOT blocked
 * Last updated: February 2026
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
    // 1-minute email services
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
    // Bot farm indicators
    'bot-email.com', 'bot-mail.com', 'bot.email', 'automation-mail.co',
]);
/**
 * LEGITIMATE email services that should NOT be blocked
 * These are privacy-focused or mainstream services used by real users
 */
const LEGITIMATE_EMAIL_PROVIDERS = new Set([
    // Privacy services
    'proton.me', 'protonmail.com', 'protonmail.ch',
    'tutanota.com', 'tutanota.de', 'tuta.io',
    'mailfence.com', 'systemli.org', 'riseup.net',
    // Mainstream providers
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'aol.com', 'mail.com', 'icloud.com', 'apple.com',
    'livemail.com', 'msn.com', 'bellsouth.net', 'comcast.net',
    'verizon.net', 'att.net', 'gmx.com', 'gmx.de', 'gmx.net',
    'web.de', 'mail.ru', 'yandex.com', 'yandex.ru',
    'naver.com', 'kakao.com', 'daum.net', 'qq.com', 'sina.com',
    '163.com', '126.com', 'outlook.jp', 'yahoo.jp', 'docomo.ne.jp',
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
// CEX wallets moved to centralized endpoint /api/airdrop/cex-wallets
// This prevents desynchronization between frontend and backend
// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================
function isDisposableEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase() || '';
    // If it's a known LEGITIMATE provider, always allow it
    if (LEGITIMATE_EMAIL_PROVIDERS.has(domain)) {
        return false;
    }
    // If it's a known DISPOSABLE service, always block it
    if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
        return true;
    }
    // For unknown domains, check for suspicious patterns
    // Disposable email services often use patterns like:
    // - Contains "temp", "trash", "fake", "throw" (but not in legitimate service names)
    // - Very short domains (< 4 chars)
    // - Numeric-heavy domains
    const suspiciousPatterns = [
        /^temp/i, // tempmail variations
        /trash/i, // trashmail variations
        /fake/i, // fakeinbox variations
        /throw/i, // throwaway variations
        /spam/i, // spam-related
        /10min/i, // 10minute variations
        /bot/i, // bot email
    ];
    // Check suspicious patterns
    if (suspiciousPatterns.some(pattern => pattern.test(domain))) {
        return true;
    }
    // Allow everything else (real domains)
    return false;
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
        const cexWallets = await getCEXWallets();
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
        if (cexWallets.has(sender)) {
            await logAuditEvent({
                level: LogLevel.INFO,
                eventType: EventType.CEX_WALLET_APPROVED,
                message: `Wallet ${wallet} approved - funded by CEX ${sender}`,
                wallet,
                metadata: { cexWallet: sender },
            });
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
        const snapshot = await getDb().collection(COLLECTION_NAME)
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
// Rate limiting moved to distributed service (Firestore-based)
// This ensures consistency across multiple Vercel instances
async function checkDuplicates(email, wallet) {
    try {
        // Normalize email to prevent alias abuse (test+1@gmail.com = test@gmail.com)
        const normalizedEmail = normalizeEmail(email);
        // Check normalized email
        const emailSnapshot = await getDb().collection(COLLECTION_NAME)
            .where('normalizedEmail', '==', normalizedEmail)
            .get();
        if (!emailSnapshot.empty) {
            await logSecurityViolation(EventType.DUPLICATE_DETECTED, `Duplicate email attempt: ${email} (normalized: ${normalizedEmail})`, 'unknown', email, wallet);
            return {
                hasDuplicate: true,
                field: 'email',
                reason: 'This email is already registered',
            };
        }
        // Check wallet
        const walletSnapshot = await getDb().collection(COLLECTION_NAME)
            .where('wallet', '==', wallet)
            .get();
        if (!walletSnapshot.empty) {
            await logSecurityViolation(EventType.DUPLICATE_DETECTED, `Duplicate wallet attempt: ${wallet}`, 'unknown', email, wallet);
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
        const ACTIVE_WALLET_TX_THRESHOLD = 2; // Reduced from 3 - Real users often have 2+ txs
        const ACTIVE_WALLET_BALANCE_THRESHOLD = 0.02; // Reduced from 0.05 - More reasonable for new users
        // High balance threshold - users with significant SOL are clearly legitimate
        const HIGH_BALANCE_THRESHOLD = 0.1; // 0.1 SOL = ~$15-20 USD - real user investment
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
            // Exception 1: High balance wallets (users who invested real money)
            // If someone put $15-20+ USD into a wallet, they're clearly a real user
            if (solBalance >= HIGH_BALANCE_THRESHOLD && transactionCount >= MIN_TRANSACTIONS) {
                console.log(`✅ High balance exception: ${wallet} (${solBalance.toFixed(4)} SOL, ${transactionCount} txs, ${walletAgeDays} days old)`);
                return {
                    isValid: true,
                    exists: true,
                    balance: solBalance,
                    transactionCount,
                    walletAgeDays,
                };
            }
            // Exception 2: Allow "new but active" wallets
            // These are likely real users actively using Solana
            // Updated Feb 2026: More lenient thresholds (2 txs + 0.02 SOL)
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
            // Exception 3: Allow fresh wallets funded by a CEX
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
                reason: `Wallet is too new (${walletAgeDays} days old). Please use ONE of these options: (a) Wait ${MIN_WALLET_AGE - walletAgeDays} more days, OR (b) Make ${Math.max(0, ACTIVE_WALLET_TX_THRESHOLD - transactionCount)} more transaction(s) + add ${Math.max(0, ACTIVE_WALLET_BALANCE_THRESHOLD - solBalance).toFixed(4)} SOL to reach 0.02 SOL, OR (c) Add ${Math.max(0, HIGH_BALANCE_THRESHOLD - solBalance).toFixed(4)} SOL to reach 0.1 SOL (high balance pass), OR (d) Use a wallet funded from Binance/Coinbase/Kraken`,
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
        const snapshot = await getDb().collection(COLLECTION_NAME)
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
    const startTime = Date.now();
    try {
        const { name, email, wallet, fingerprint, ipAddress, } = req.body;
        // Log validation attempt
        await logAuditEvent({
            level: LogLevel.INFO,
            eventType: EventType.REGISTRATION_ATTEMPT,
            message: 'Validation started',
            email,
            wallet,
            ipAddress,
            fingerprint,
            userAgent: req.headers['user-agent'],
        });
        // ========================================
        // 0. DISTRIBUTED RATE LIMITING (FIRST LINE OF DEFENSE)
        // ========================================
        const rateLimitResult = await checkDistributedRateLimit(req, {
            windowMs: 60000, // 1 minute
            maxRequests: 3, // 3 attempts per minute
        });
        if (!rateLimitResult.allowed) {
            await logSecurityViolation(EventType.RATE_LIMIT_EXCEEDED, `Rate limit exceeded: ${rateLimitResult.retryAfter}s remaining`, ipAddress, email, wallet, { retryAfter: rateLimitResult.retryAfter });
            return res.status(429).json({
                success: false,
                error: 'Too many attempts. Please wait a moment before trying again.',
                retryAfter: rateLimitResult.retryAfter,
            });
        }
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
            await logSecurityViolation(EventType.BOT_DETECTED, `Disposable email blocked: ${email}`, ipAddress, email, wallet);
            return res.status(403).json({
                success: false,
                error: 'Disposable email addresses are not allowed. Please use a personal email.',
            });
        }
        // Check duplicate email (with normalization)
        const duplicateCheck = await checkDuplicates(email, wallet);
        if (duplicateCheck.hasDuplicate) {
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
            // SECURITY: Generic error message to prevent wallet enumeration
            await logAuditEvent({
                level: LogLevel.WARN,
                eventType: EventType.WALLET_TOO_NEW,
                message: 'Wallet validation failed',
                wallet,
                ipAddress,
                email,
                metadata: {
                    reason: walletValidation.reason, // Keep detailed reason in logs only
                    balance: walletValidation.balance,
                    transactionCount: walletValidation.transactionCount,
                    walletAgeDays: walletValidation.walletAgeDays,
                },
            });
            return res.status(400).json({
                success: false,
                // Generic message - don't expose exact validation logic
                error: 'Wallet does not meet registration requirements. Please ensure your wallet has sufficient activity and balance.',
            });
        }
        // ========================================
        // 4. IP-BASED SECURITY CHECKS
        // ========================================
        // Check if data center IP
        if (isDataCenterIP(ipAddress)) {
            await logSecurityViolation(EventType.BOT_DETECTED, `Data center IP blocked: ${ipAddress}`, ipAddress, email, wallet);
            return res.status(403).json({
                success: false,
                error: 'Registration from data centers or proxies is not allowed.',
            });
        }
        // Check IP farm
        const ipFarmCheck = await checkIPFarm(ipAddress);
        if (ipFarmCheck.isRisky) {
            await logSecurityViolation(EventType.IP_FARM_DETECTED, `IP farm detected: ${ipFarmCheck.count} registrations from ${ipAddress}`, ipAddress, email, wallet, { count: ipFarmCheck.count });
            return res.status(429).json({
                success: false,
                error: 'Too many registrations detected from this location.',
            });
        }
        // ========================================
        // 5. DEVICE FINGERPRINT VALIDATION
        // ========================================
        if (fingerprint && fingerprint !== 'unknown') {
            const fpCheck = await checkDeviceFingerprint(fingerprint);
            if (fpCheck.isDuplicate) {
                await logSecurityViolation(EventType.DUPLICATE_DETECTED, `Duplicate device fingerprint: ${fingerprint}`, ipAddress, email, wallet, { fingerprintCount: fpCheck.count });
                return res.status(409).json({
                    success: false,
                    error: 'This device has already been used for registration.',
                });
            }
        }
        // ========================================
        // ALL VALIDATIONS PASSED
        // ========================================
        const duration = Date.now() - startTime;
        await logAuditEvent({
            level: LogLevel.INFO,
            eventType: EventType.REGISTRATION_SUCCESS,
            message: `Validation successful (${duration}ms)`,
            email,
            wallet,
            ipAddress,
            metadata: {
                walletBalance: walletValidation.balance,
                walletAge: walletValidation.walletAgeDays,
                transactionCount: walletValidation.transactionCount,
                duration,
            },
        });
        return res.status(200).json({
            success: true,
            message: 'Validation successful. You may proceed with registration.',
            data: {
                email: normalizeEmail(email),
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Validation error:', error);
        try {
            await logAuditEvent({
                level: LogLevel.ERROR,
                eventType: EventType.VALIDATION_FAILED,
                message: `Validation error: ${errorMessage}`,
                ipAddress: req.body?.ipAddress,
                email: req.body?.email,
                wallet: req.body?.wallet,
            });
        }
        catch (logError) {
            console.error('❌ Failed to log error:', logError);
        }
        // Always return JSON to prevent parsing errors
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error during validation',
                message: errorMessage,
            });
        }
    }
}
// ============================================================================
// MAIN ENDPOINT: SUBMIT REGISTRATION (After validation passes)
// ============================================================================
export async function submitAirdropRegistration(req, res) {
    try {
        const { name, email, wallet, fingerprint, ipAddress, userAgent, browserInfo, timeToSubmit, } = req.body;
        // Normalize email to prevent alias abuse
        const normalizedEmail = normalizeEmail(email);
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
            await logSecurityViolation(EventType.DUPLICATE_DETECTED, `Duplicate at submission: ${duplicates.field}`, ipAddress, email, wallet);
            return res.status(409).json({
                success: false,
                error: 'This registration already exists',
            });
        }
        // Save to Firestore
        try {
            const docRef = await getDb().collection(COLLECTION_NAME).add({
                name: name.trim(),
                email: email.toLowerCase(),
                normalizedEmail, // Store normalized version for duplicate detection
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
            // Log successful registration
            await logRegistrationAttempt(email, wallet, ipAddress, true, undefined, {
                docId: docRef.id,
                timeToSubmit,
                browserInfo,
            });
            return res.status(201).json({
                success: true,
                message: 'Registration successful! You will receive 6000 NUX tokens.',
                docId: docRef.id,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Database error';
            await logAuditEvent({
                level: LogLevel.ERROR,
                eventType: EventType.REGISTRATION_FAILED,
                message: `Failed to save registration: ${errorMessage}`,
                email,
                wallet,
                ipAddress,
            });
            if (!res.headersSent) {
                return res.status(500).json({
                    success: false,
                    error: 'Failed to save registration',
                    message: errorMessage,
                });
            }
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Submission error:', error);
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                error: 'Internal server error during submission',
                message: errorMessage,
            });
        }
    }
}
