import { collection, addDoc, serverTimestamp, query, where, getDocs, getCountFromServer, type Firestore } from 'firebase/firestore';
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { DEFAULT_SOLANA_NETWORK, SOLANA_RPC_FALLBACKS } from '../../constants/solana';

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
  // Solana addresses are typically 32-44 characters in Base58
  if (wallet.length >= 32 && wallet.length <= 44 && !wallet.startsWith('0x')) {
    return isValidSolanaAddress(wallet) ? 'solana' : null;
  }
  return null;
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

/**
 * Submit airdrop registration to Firestore
 * Comprehensive client-side validation before write
 */
export async function submitAirdropRegistration(
  db: Firestore,
  name: string,
  email: string,
  wallet: string,
  honeypot?: string,
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
  }
) {
  try {
    console.log('📝 Starting airdrop registration...');
    console.log('Received data:', { name, email, wallet });

    // ========================================
    // VALIDATE FIRESTORE INSTANCE
    // ========================================
    if (!db) {
      console.error('❌ Firestore instance is undefined');
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
      console.error('❌ Email validation failed:', trimmedEmail);
      throw new Error('Invalid email format');
    }

    // ========================================
    // VALIDATE WALLET ADDRESS (SOLANA OR EVM)
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
    const normalizedWallet = wallet; // Keep original case for Solana addresses
    const finalName = name.trim();

    console.log('✅ Wallet validation passed:', { wallet: normalizedWallet, network: walletNetwork });

    console.log('✅ All client-side validations passed');

    // ========================================
    // SERVER-SIDE LIMIT CHECK
    // ========================================
    console.log('🔍 Verifying pool capacity...');
    const MAX_USERS = 10000; // MUST match frontend
    const currentCount = await getRegisteredUsersCount(db);

    if (currentCount >= MAX_USERS) {
      console.warn('⚠️ Registration attempted on full pool:', currentCount);
      throw new Error('Airdrop pool is now completely full. Registration is closed.');
    }

    // ========================================
    // CHECK FOR DUPLICATES (BEFORE WRITE)
    // ========================================
    console.log('🔍 Checking for duplicate wallet...');
    const walletQuery = query(
      collection(db, 'nuxchainAirdropRegistrations'),
      where('wallet', '==', normalizedWallet)
    );

    const walletSnapshot = await getDocs(walletQuery);

    if (!walletSnapshot.empty) {
      console.warn('⚠️ Wallet already registered:', normalizedWallet);
      throw new Error('This wallet is already registered for the airdrop');
    }

    console.log('🔍 Checking for duplicate email...');
    const emailQuery = query(
      collection(db, 'nuxchainAirdropRegistrations'),
      where('email', '==', normalizedEmail)
    );

    const emailSnapshot = await getDocs(emailQuery);

    if (!emailSnapshot.empty) {
      console.warn('⚠️ Email already registered:', normalizedEmail);
      throw new Error('This email is already registered for the airdrop');
    }

    console.log('✅ No duplicates found, proceeding with registration');

    // ========================================
    // BOT PROTECTION: SOLANA BALANCE CHECK
    // ========================================
    if (walletNetwork === 'solana') {
      try {
        console.log('🔍 Checking wallet balance for bot protection...');
        
        // Try multiple RPC endpoints with fallback
        let balance = 0;
        let rpcSuccess = false;
        const rpcEndpoints = SOLANA_RPC_FALLBACKS[DEFAULT_SOLANA_NETWORK];
        
        for (let i = 0; i < rpcEndpoints.length && !rpcSuccess; i++) {
          try {
            console.log(`🔌 Attempting RPC connection ${i + 1}/${rpcEndpoints.length}: ${rpcEndpoints[i]}`);
            const connection = new Connection(rpcEndpoints[i], 'confirmed');
            const pubkey = new PublicKey(wallet);
            balance = await connection.getBalance(pubkey);
            rpcSuccess = true;
            console.log(`✅ RPC connection successful on attempt ${i + 1}`);
          } catch (rpcError) {
            console.warn(`⚠️ RPC endpoint ${i + 1} failed:`, rpcError);
            if (i === rpcEndpoints.length - 1) {
              console.error('❌ All RPC endpoints failed. Proceeding without balance check.');
              // Allow registration to proceed if RPC is unavailable
            }
          }
        }
        
        if (rpcSuccess) {
          const solBalance = balance / LAMPORTS_PER_SOL;
          const MIN_SOL_BALANCE = 0.001; // Minimum SOL to be considered "human"
          
          console.log(`💰 Wallet balance: ${solBalance} SOL (minimum required: ${MIN_SOL_BALANCE} SOL)`);
          
          if (solBalance < MIN_SOL_BALANCE) {
            console.warn('⚠️ Insufficient balance for airdrop:', solBalance);
            throw new Error(`Insufficient balance. To prevent bots, your wallet must have at least ${MIN_SOL_BALANCE} SOL to participate. Current balance: ${solBalance.toFixed(4)} SOL`);
          }
          console.log(`✅ Wallet balance check passed: ${solBalance} SOL`);
        } else {
          console.warn('⚠️ Could not verify balance due to RPC issues. Proceeding with registration...');
        }
      } catch (error: unknown) {
        if (error instanceof Error && error.message.includes('Insufficient balance')) {
          throw error; // Re-throw balance errors
        }
        console.error('❌ Error checking Solana balance:', error);
        console.log('ℹ️ Proceeding with registration despite balance check failure');
        // Allow registration to proceed if balance check fails for technical reasons
      }
    }

    // Bot check (honeypot redundant but good to have)
    if (honeypot) {
      throw new Error('Bot detected.');
    }

    // ========================================
    // GET CLIENT IP (for bot identification)
    // ========================================
    let ipAddress = 'unknown';
    try {
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      ipAddress = ipData.ip;
    } catch (ipError) {
      console.warn('⚠️ Could not fetch client IP:', ipError);
    }

    // ========================================
    // CREATE DOCUMENT
    // ========================================
    const airdropData = {
      name: finalName,
      email: normalizedEmail,
      wallet: normalizedWallet,
      network: walletNetwork, // Store network type
      ipAddress: ipAddress, // Store IP for bot farm detection
      createdAt: serverTimestamp(),
      status: 'pending',
      airdropAmount: '6000', // 6K NUX tokens
      // New data capture fields
      userAgent: deviceData?.userAgent || 'unknown',
      fingerprint: deviceData?.fingerprint || 'unknown',
      browserName: deviceData?.browserInfo?.browserName || 'unknown',
      browserVersion: deviceData?.browserInfo?.browserVersion || 'unknown',
      osName: deviceData?.browserInfo?.osName || 'unknown',
      deviceType: deviceData?.browserInfo?.deviceType || 'unknown',
      screenResolution: deviceData?.browserInfo?.screenResolution || 'unknown',
      timezone: deviceData?.browserInfo?.timezone || 'unknown',
      language: deviceData?.browserInfo?.language || 'unknown',
      timeToSubmit: deviceData ? (deviceData.submitTime - deviceData.pageLoadTime) : 0,
    };

    console.log('📤 Sending to Firestore:', airdropData);

    // Timeout protection (30 seconds to allow for slower connections)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error('❌ Timeout after 30 seconds');
        reject(new Error('Request timeout after 30 seconds. Please check your internet connection and try again.'));
      }, 30000);
    });

    const addDocPromise = addDoc(collection(db, 'nuxchainAirdropRegistrations'), airdropData);

    console.log('⏳ Waiting for Firestore response...');
    const docRef = await Promise.race([addDocPromise, timeoutPromise]);

    console.log('✅ Successfully registered for airdrop! Document ID:', docRef.id);
    console.log('🎉 Registration complete. User will receive 6000 NUX tokens.');
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ Error in submitAirdropRegistration:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });

    if (error instanceof Error) {
      // Permission errors
      if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
        console.error('🚫 Firestore permission denied');
        throw new Error('Access denied. Please contact support or verify your connection.');
      }

      // Firebase config errors
      if (error.message.includes('not initialized') || error.message.includes('Firebase') || error.message.includes('app/invalid-credential')) {
        console.error('🔧 Firebase configuration issue');
        throw new Error('Database configuration error. Please refresh the page and try again.');
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout') || error.message.includes('Failed to fetch')) {
        console.error('🌐 Network connectivity issue');
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      // Validation errors - pass through with original message
      if (
        error.message.includes('Invalid') || 
        error.message.includes('required') || 
        error.message.includes('already registered') ||
        error.message.includes('Insufficient balance') ||
        error.message.includes('must be at least') ||
        error.message.includes('pool is now')
      ) {
        console.log('ℹ️ Validation error (user-facing):', error.message);
        throw error;
      }

      // CORS errors
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        console.error('🔒 CORS issue detected');
        throw new Error('Security error. Please disable ad blockers or VPN and try again.');
      }
    }

    // Generic fallback with more helpful message
    console.error('❓ Unknown error type. Showing generic message.');
    throw new Error('Failed to submit airdrop registration. Please try again in a few moments. If the problem persists, contact support.');
  }
}
