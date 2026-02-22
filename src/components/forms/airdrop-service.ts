import { collection, query, where, getDocs, getCountFromServer, type Firestore } from 'firebase/firestore';
import { PublicKey } from '@solana/web3.js';

/**
 * Validate if a string is a valid Solana address (Base58)
 */
function isValidSolanaAddress(address: string): boolean {
  try {
    const pubkey = new PublicKey(address);
    return PublicKey.isOnCurve(pubkey.toBytes());
  } catch {
    return false;
  }
}

/**
 * Detect wallet network type
 */
function detectWalletNetwork(wallet: string): 'solana' | null {
  if (wallet.length >= 32 && wallet.length <= 44 && !wallet.startsWith('0x')) {
    return isValidSolanaAddress(wallet) ? 'solana' : null;
  }
  return null;
}

/**
 * Get client IP address
 */
async function getClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = (await response.json()) as { ip: string };
    return data.ip;
  } catch (error) {
    console.warn('⚠️ Could not fetch client IP:', error);
    return 'unknown';
  }
}

/**
 * Validate registration on server
 * NEW: Server-side validation endpoint
 */
export async function validateRegistrationOnServer(
  name: string,
  email: string,
  wallet: string,
  fingerprint: string,
  browserInfo?: {
    browserName: string;
    browserVersion: string;
    osName: string;
    deviceType: string;
    screenResolution: string;
    timezone: string;
    language: string;
  }
) {
  try {
    console.log('🔍 Validating registration on server...');

    const ipAddress = await getClientIP();

    const response = await fetch('/api/airdrop/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        wallet,
        fingerprint,
        ipAddress,
        userAgent: navigator.userAgent,
        browserInfo,
      }),
    });

    let result;
    try {
      // Read the response body as text first to avoid "stream already read" errors
      const responseText = await response.text();
      
      // Then parse it as JSON
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      result = JSON.parse(responseText) as { success: boolean; error?: string };
    } catch (parseError) {
      console.error('❌ Failed to parse response as JSON:', parseError);
      throw new Error(`Server returned invalid response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    if (!response.ok) {
      console.warn('❌ Server validation failed:', result.error);
      throw new Error(result.error || `Validation failed (${response.status})`);
    }

    console.log('✅ Server validation passed');
    return result;
  } catch (error) {
    console.error('❌ Validation error:', error);
    throw error;
  }
}

/**
 * Submit airdrop registration to server
 * Called AFTER validation passes
 */
export async function submitAirdropRegistration(
  db: Firestore,
  name: string,
  email: string,
  wallet: string,
  _honeypot?: string,
  deviceData?: {
    userAgent: string;
    fingerprint: string;
    browserInfo: {
      browserName: string;
      browserVersion: string;
      osName: string;
      deviceType: string;
      screenResolution: string;
      timezone: string;
      language: string;
    };
    submitTime: number;
    pageLoadTime: number;
    captchaToken?: string;
    walletSignature?: string;
  }
) {
  try {
    console.log('📝 Starting airdrop registration...');

    // ========================================
    // VALIDATE FIRESTORE INSTANCE
    // ========================================
    if (!db) {
      throw new Error('Database connection not initialized. Please refresh the page.');
    }

    // ========================================
    // VALIDATE NAME
    // ========================================
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }

    // ========================================
    // VALIDATE EMAIL
    // ========================================
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim();

    if (!emailRegex.test(trimmedEmail)) {
      throw new Error('Invalid email format');
    }

    // ========================================
    // VALIDATE WALLET ADDRESS
    // ========================================
    if (!wallet || typeof wallet !== 'string') {
      throw new Error('Wallet address is required');
    }

    const walletNetwork = detectWalletNetwork(wallet);

    if (!walletNetwork) {
      throw new Error('Invalid wallet address. This airdrop is only compatible with the Solana network.');
    }

    // Normalize data
    const normalizedEmail = trimmedEmail.toLowerCase();
    const normalizedWallet = wallet;
    const finalName = name.trim();

    console.log('✅ Client-side validations passed');

    // ========================================
    // STEP 1: SERVER-SIDE VALIDATION
    // ========================================
    console.log('🔍 Running server-side validation...');
    
    await validateRegistrationOnServer(
      finalName,
      normalizedEmail,
      normalizedWallet,
      deviceData?.fingerprint || 'unknown',
      deviceData?.browserInfo
    );

    console.log('✅ Server validation passed');

    // ========================================
    // STEP 2: SUBMIT REGISTRATION
    // ========================================
    console.log('📝 Submitting registration...');

    const ipAddress = await getClientIP();

    const response = await fetch('/api/airdrop/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: finalName,
        email: normalizedEmail,
        wallet: normalizedWallet,
        fingerprint: deviceData?.fingerprint || 'unknown',
        ipAddress,
        userAgent: navigator.userAgent,
        browserInfo: deviceData?.browserInfo,
        timeToSubmit: deviceData ? deviceData.submitTime - deviceData.pageLoadTime : 0,
        captchaToken: deviceData?.captchaToken || '',
        walletSignature: deviceData?.walletSignature || '',
      }),
    });

    let submitResult;
    try {
      // Read response as text first to avoid "stream already read" errors
      const responseText = await response.text();
      
      // Then parse it as JSON
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      submitResult = JSON.parse(responseText) as { success: boolean; message?: string; error?: string; docId?: string };
    } catch (parseError) {
      console.error('❌ Failed to parse submit response as JSON:', parseError);
      throw new Error(`Server returned invalid response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }

    if (!response.ok) {
      console.error('❌ Submission failed:', submitResult.error);
      throw new Error(submitResult.error || `Registration failed (${response.status})`);
    }

    console.log('✅ Registration completed successfully');
    return submitResult;
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Check if a user is already registered by wallet or email
 */
export async function checkUserRegistration(
  db: Firestore,
  wallet?: string,
  email?: string
): Promise<boolean> {
  try {
    if (!db) return false;
    if (!wallet && !email) return false;

    const registrationCollection = collection(db, 'nuxchainAirdropRegistrations');

    // Check by wallet
    if (wallet) {
      const qWallet = query(registrationCollection, where('wallet', '==', wallet));
      const walletSnapshot = await getDocs(qWallet);
      if (!walletSnapshot.empty) return true;
    }

    // Check by email
    if (email) {
      const qEmail = query(registrationCollection, where('email', '==', email.toLowerCase().trim()));
      const emailSnapshot = await getDocs(qEmail);
      if (!emailSnapshot.empty) return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error checking registration status:', error);
    return false;
  }
}

/**
 * Get total count of registered users for airdrop
 */
export async function getRegisteredUsersCount(db: Firestore): Promise<number> {
  try {
    if (!db) {
      console.error('❌ Firestore instance is undefined');
      return 0;
    }

    const coll = collection(db, 'nuxchainAirdropRegistrations');
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count;
  } catch (error) {
    console.error('❌ Error getting users count:', error);
    return 0;
  }
}
