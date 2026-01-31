import { collection, addDoc, serverTimestamp, query, where, getDocs, getCountFromServer, type Firestore } from 'firebase/firestore';
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
  // Solana addresses are typically 32-44 characters in Base58
  if (wallet.length >= 32 && wallet.length <= 44 && !wallet.startsWith('0x')) {
    return isValidSolanaAddress(wallet) ? 'solana' : null;
  }
  return null;
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
  wallet: string
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
    // CREATE DOCUMENT
    // ========================================
    const airdropData = {
      name: finalName,
      email: normalizedEmail,
      wallet: normalizedWallet,
      network: walletNetwork, // Store network type
      createdAt: serverTimestamp(),
      status: 'pending',
      airdropAmount: '5000', // 5K NUX tokens
      polBonus: '10', // 10 POL bonus
    };

    console.log('📤 Sending to Firestore:', airdropData);

    // Timeout protection
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout. Please check your connection.')), 10000);
    });

    const addDocPromise = addDoc(collection(db, 'nuxchainAirdropRegistrations'), airdropData);

    const docRef = await Promise.race([addDocPromise, timeoutPromise]);

    console.log('✅ Successfully registered for airdrop:', docRef.id);
    return { success: true, id: docRef.id };

  } catch (error) {
    console.error('❌ Error in submitAirdropRegistration:', error);

    if (error instanceof Error) {
      // Permission errors
      if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Access denied. Please contact support or check Firestore rules.');
      }

      // Firebase config errors
      if (error.message.includes('not initialized') || error.message.includes('Firebase') || error.message.includes('app/invalid-credential')) {
        throw new Error('Database configuration error. Please refresh and try again.');
      }

      // Network errors
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }

      // Validation errors - pass through
      if (error.message.includes('Invalid') || error.message.includes('required') || error.message.includes('already registered')) {
        throw error;
      }
    }

    throw new Error('Failed to submit airdrop registration. Please try again later.');
  }
}
