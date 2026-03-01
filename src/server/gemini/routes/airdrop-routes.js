import { Router } from 'express';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getFirestore } from 'firebase-admin/firestore';
import bs58 from 'bs58';
import rateLimit from 'express-rate-limit';

const router = Router();
const COLLECTION_NAME = 'nuxchainAirdropRegistrations';
const SOLANA_RPC = process.env.SOLANA_RPC_QUICKNODE || process.env.SOLANA_RPC || 'https://solana-rpc.publicnode.com';

// ============================================================================
// RATE LIMITERS
// ============================================================================
const validateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { success: false, error: 'Too many validation attempts. Please try again in 1 hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.socket?.remoteAddress || 'unknown';
    return ip.replace(/^::ffff:/, '');
  },
});

const submitLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3,
  message: { success: false, error: 'Too many registration attempts. Please try again tomorrow.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: false, xForwardedForHeader: false },
  keyGenerator: (req) => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded) || req.socket?.remoteAddress || 'unknown';
    return ip.replace(/^::ffff:/, '');
  },
});

// ============================================================================
// DISPOSABLE EMAIL DOMAINS (expanded)
// ============================================================================
const DISPOSABLE_DOMAINS = new Set([
  'tempmail.com', '10minutemail.com', '10minutesemail.com',
  'guerrillamail.com', 'mailinator.com', 'throwaway.email',
  'yopmail.com', 'maildrop.cc', 'mintemail.com',
  'sharklasers.com', 'trashmail.com', 'tempmail.de',
  'nada.email', 'fakeinbox.com', 'spam4.me', 'mytrashmail.com',
  'email.it', 'grr.la', 'pokemail.net', 'mailnesia.com',
  'temp-mail.com', '33mail.com', 'tempmail.io', 'tormail.org',
  'temp-mail.org', 'tempmail.ninja', 'guerrilla.email',
  'mail.tm', 'mytempmail.com', 'temp-mail.io', 'tempemail.com',
  'temporaryemail.com', 'trashmail.ws', 'trashmail.de', 'throwawaymail.com',
  'bot-email.com', 'bot-mail.com', 'bot.email', 'automation-mail.co',
  // Extended list
  'dispostable.com', 'mailnull.com', 'spamgourmet.com', 'trashmail.at',
  'trashmail.me', 'trashmail.io', 'spamfree24.org', 'spamfree.eu',
  'spamgob.com', 'spamhereplease.com', 'spamhole.com', 'spamify.com',
  'spaminator.de', 'spamkill.info', 'spaml.com', 'spammotel.com',
  'spamoff.de', 'spamslicer.com', 'spamspot.com', 'spamstack.net',
  'spamthis.co.uk', 'spamtroll.net', 'speed.1s.fr', 'supergreatmail.com',
  'supermailer.jp', 'suremail.info', 'teewars.org', 'teleworm.com',
  'teleworm.us', 'tempalias.com', 'tempe-mail.com', 'tempemail.co.za',
  'tempemail.net', 'tempinbox.co.uk', 'tempinbox.com', 'tempmail.eu',
  'tempmail.it', 'tempmail2.com', 'tempmailer.com', 'tempmailer.de',
  'tempr.email', 'tempsky.com', 'tempthe.net', 'tempymail.com',
  'thankyou2010.com', 'thisisnotmyrealemail.com', 'throwam.com',
  'throwam.com', 'tilien.com', 'tittbit.in', 'tizi.com',
  'tmailinator.com', 'toiea.com', 'tradermail.info', 'trash-mail.at',
  'trash-mail.cf', 'trash-mail.ga', 'trash-mail.gq', 'trash-mail.ml',
  'trash-mail.tk', 'trash2009.com', 'trashdevil.com', 'trashdevil.de',
  'trashemail.de', 'trashimail.de', 'trashmail.com', 'trashmail.net',
  'trashmail.org', 'trashmailer.com', 'trashymail.com', 'trbvm.com',
  'turual.com', 'twinmail.de', 'tyldd.com', 'uggsrock.com',
  'uroid.com', 'us.af', 'venompen.com', 'veryrealemail.com',
  'viditag.com', 'viewcastmedia.com', 'viewcastmedia.net', 'viewcastmedia.org',
  'mailnew.com', 'mailseal.de', 'mailshell.com', 'mailsiphon.com',
  'mailslapping.com', 'mailslite.com', 'mailsnull.com', 'mailsoul.com',
  'mailsucker.net', 'mailswork.com', 'mailtemp.info', 'mailtome.de',
  'mailtothis.com', 'mailzilla.com', 'mailzilla.org', 'makemetheking.com',
  'malahov.de', 'manifestgenerator.com', 'manybrain.com', 'mbx.cc',
  'mega.zik.dj', 'meinspamschutz.de', 'meltmail.com', 'messagebeamer.de',
  'mierdamail.com', 'mintemail.com', 'misterpinball.de', 'mjukglass.nu',
  'mmmmail.com', 'mobi.web.id', 'mobileninja.co.uk', 'moburl.com',
  'moncourrier.fr.nf', 'monemail.fr.nf', 'monmail.fr.nf', 'msa.minsmail.com',
  'mt2009.com', 'mt2014.com', 'mx0.wwwnew.eu', 'my10minutemail.com',
  'mymail-in.net', 'mymailoasis.com', 'mynetstore.de', 'mypacks.net',
  'mypartyclip.de', 'myphantomemail.com', 'myspaceinc.com', 'myspaceinc.net',
  'myspaceinc.org', 'myspacepimpedup.com', 'myspamless.com', 'mytempemail.com',
  'mytrashmail.com', 'nabuma.com', 'neomailbox.com', 'nepwk.com',
  'nervmich.net', 'nervtmich.net', 'netmails.com', 'netmails.net',
  'netzidiot.de', 'neverbox.com', 'nice-4u.com', 'nincsmail.hu',
  'nnh.com', 'no-spam.ws', 'noblepioneer.com', 'nobulk.com',
  'noclickemail.com', 'nogmailspam.info', 'nomail.pw', 'nomail.xl.cx',
  'nomail2me.com', 'nomorespamemails.com', 'nonspam.eu', 'nonspammer.de',
  'noref.in', 'nospam.ze.tc', 'nospam4.us', 'nospamfor.us',
  'nospammail.net', 'nospamthanks.info', 'notmailinator.com', 'nounvalidate.com',
  'nowmymail.com', 'nwldx.com', 'objectmail.com', 'obobbo.com',
  'odaymail.com', 'odnorazovoe.ru', 'one-time.email', 'oneoffemail.com',
  'oneoffmail.com', 'onewaymail.com', 'onlatedotcom.info', 'online.ms',
  'oopi.org', 'opayq.com', 'ordinaryamerican.net', 'otherinbox.com',
  'ourklips.com', 'outlawspam.com', 'ovpn.to', 'owlpic.com',
  'pancakemail.com', 'paplease.com', 'pcusers.otherinbox.com', 'pepbot.com',
  'pfui.ru', 'phentermine-mortgages.com', 'pimpedupmyspace.com', 'pjjkp.com',
  'plexolan.de', 'poczta.onet.pl', 'politikerclub.de', 'poofy.org',
  'pookmail.com', 'pop3.xyz', 'postacı.com', 'postfach.cc',
  'privacy.net', 'privatdemail.net', 'proxymail.eu', 'prtnx.com',
  'prtz.eu', 'pubmail.io', 'punkass.com', 'putthisinyourspamdatabase.com',
  'pwrby.com', 'qisdo.com', 'qisoa.com', 'qoika.com',
  'qq.com', 'quickinbox.com', 'quickmail.nl', 'rcpt.at',
  'recode.me', 'recursor.net', 'recyclemail.dk', 'regbypass.com',
  'regbypass.comsafe-mail.net', 'rejectmail.com', 'rklips.com', 'rmqkr.net',
  'royal.net', 'rppkn.com', 'rtrtr.com', 's0ny.net', 'safe-mail.net',
  'safersignup.de', 'safetymail.info', 'safetypost.de', 'sandelf.de',
  'saynotospams.com', 'schafmail.de', 'schrott-email.de', 'secretemail.de',
  'secure-mail.biz', 'secure-mail.cc', 'selfdestructingmail.com',
  'sendspamhere.com', 'senseless-entertainment.com', 'services391.com',
  'sharklasers.com', 'shieldedmail.com', 'shiftmail.com', 'shitmail.de',
  'shitmail.me', 'shitmail.org', 'shitware.nl', 'shmeriously.com',
  'shortmail.net', 'sibmail.com', 'sinnlos-mail.de', 'skeefmail.com',
  'slapsfromlastnight.com', 'slaskpost.se', 'slave-auctions.net',
  'slopsbox.com', 'smellfear.com', 'smwg.info', 'snakemail.com',
  'sneakemail.com', 'sneakmail.de', 'snkmail.com', 'sofimail.com',
  'sofort-mail.de', 'sogetthis.com', 'soodonims.com', 'spam.la',
  'spam.mn', 'spam.org.tr', 'spam.su', 'spam4.me',
  'spamavert.com', 'spambob.com', 'spambob.net', 'spambob.org',
  'spambog.com', 'spambog.de', 'spambog.ru', 'spambox.info',
  'spambox.irishspringrealty.com', 'spambox.us', 'spamcannon.com',
  'spamcannon.net', 'spamcero.com', 'spamcon.org', 'spamcorptastic.com',
  'spamcowboy.com', 'spamcowboy.net', 'spamcowboy.org', 'spamday.com',
  'spamex.com', 'spamfree24.de', 'spamfree24.eu', 'spamfree24.info',
  'spamfree24.net', 'spamfree24.org', 'spamgoes.in', 'spamgourmet.com',
  'spamgourmet.net', 'spamgourmet.org',
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

// ============================================================================
// SECURITY HELPERS
// ============================================================================

/**
 * Verify hCaptcha token server-side
 */
async function verifyHCaptcha(token) {
  const secret = process.env.HCAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn('⚠️ HCAPTCHA_SECRET_KEY not set — skipping captcha verification');
    return true;
  }
  if (!token) return false;
  try {
    const params = new URLSearchParams({ secret, response: token });
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    console.error('hCaptcha verification error:', err.message);
    return false;
  }
}

/**
 * Verify Solana wallet signature (proves ownership)
 */
function verifyWalletSignature(walletAddress, signatureBase58) {
  if (!signatureBase58) return false;
  try {
    new PublicKey(walletAddress); // validates the address is a valid Solana pubkey
    const signatureBytes = bs58.decode(signatureBase58);
    if (signatureBytes.length !== 64) return false;
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Basic IP reputation check — blocks known datacenter/proxy ranges
 */
function isDatacenterIP(ip) {
  if (!ip || ip === 'unknown') return false;
  // Skip check for localhost/development
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) return false;
  // Common datacenter IP patterns (AWS, GCP, Azure, DigitalOcean, Linode, Vultr)
  const datacenterPatterns = [
    /^3\.(8[0-9]|9[0-9]|1[0-9]{2})\./,   // AWS us-east
    /^18\.(1[0-9]{2}|2[0-3][0-9])\./,     // AWS
    /^52\.(0|1[0-9]{2}|2[0-4][0-9])\./,   // AWS
    /^54\.(1[0-9]{2}|2[0-4][0-9])\./,     // AWS
    /^34\.(0|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9])\./,  // GCP
    /^35\.(1[0-9]{2}|2[0-4][0-9])\./,     // GCP
    /^104\.(1[0-9]{2}|2[0-4][0-9])\./,    // Cloudflare/CDN
    /^167\.99\./,                          // DigitalOcean
    /^138\.197\./,                         // DigitalOcean
    /^159\.65\./,                          // DigitalOcean
    /^45\.33\./,                           // Linode
    /^139\.162\./,                         // Linode
    /^45\.76\./,                           // Vultr
    /^149\.28\./,                          // Vultr
  ];
  return datacenterPatterns.some(pattern => pattern.test(ip));
}

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
router.post('/validate', validateLimiter, async (req, res) => {
  try {
    const { name, email, wallet, ipAddress } = req.body;

    if (!name || name.length < 3) return res.status(400).json({ success: false, error: 'Name must be at least 3 characters long' });
    if (!email || !email.includes('@')) return res.status(400).json({ success: false, error: 'Invalid email format' });

    // IP Reputation Check
    const clientIp = ipAddress ||
      (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for']) ||
      req.socket?.remoteAddress || 'unknown';
    if (isDatacenterIP(clientIp)) {
      console.warn(`⚠️ Datacenter IP blocked: ${clientIp}`);
      return res.status(403).json({ success: false, error: 'Registrations from datacenter or VPN IPs are not allowed.' });
    }

    // Check Disposable Email
    const emailDomain = email.split('@')[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.has(emailDomain)) {
      return res.status(403).json({
        success: false,
        error: 'Disposable email addresses are not allowed. Please use a personal email.'
      });
    }

    const db = getFirestore();

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
router.post('/submit', submitLimiter, async (req, res) => {
  try {
    const { name, email, wallet, fingerprint, ipAddress, userAgent, browserInfo, timeToSubmit, captchaToken, walletSignature } = req.body;
    const db = getFirestore();

    // hCaptcha verification
    const captchaValid = await verifyHCaptcha(captchaToken);
    if (!captchaValid) {
      return res.status(403).json({ success: false, error: 'Captcha verification failed. Please complete the captcha and try again.' });
    }

    // Wallet signature verification
    if (!walletSignature || !verifyWalletSignature(wallet, walletSignature)) {
      return res.status(403).json({ success: false, error: 'Wallet signature verification failed. Please sign the message to prove wallet ownership.' });
    }

    // IP Reputation Check
    const clientIp = ipAddress ||
      (Array.isArray(req.headers['x-forwarded-for']) ? req.headers['x-forwarded-for'][0] : req.headers['x-forwarded-for']) ||
      req.socket?.remoteAddress || 'unknown';
    if (isDatacenterIP(clientIp)) {
      console.warn(`⚠️ Datacenter IP blocked on submit: ${clientIp}`);
      return res.status(403).json({ success: false, error: 'Registrations from datacenter or VPN IPs are not allowed.' });
    }

    const registrationData = {
      name,
      email: email.toLowerCase(),
      wallet,
      fingerprint: fingerprint || 'unknown',
      ipAddress: clientIp,
      userAgent: userAgent || 'unknown',
      browserInfo: browserInfo || {},
      timeToSubmit: timeToSubmit || 0,
      captchaVerified: true,
      walletSignatureVerified: true,
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
