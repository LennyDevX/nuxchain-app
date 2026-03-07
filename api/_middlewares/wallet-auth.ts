/**
 * EVM Wallet Signature Authentication
 * Verifies that a given Polygon/EVM wallet signed a specific message.
 * Uses ethers.verifyMessage (personal_sign / eth_sign EIP-191 style).
 *
 * Security notes:
 * - Message includes domain, timestamp and intent to prevent replay attacks.
 * - Signature is valid for SESSION_TTL_MS (1 hour). Frontend stores it in sessionStorage.
 * - Address comparison is case-insensitive (checksum-agnostic).
 */

import { ethers } from 'ethers';
import type { WalletAuth } from '../types/index.js';

export const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

// Message template prefix that must be present in the signed message
const EXPECTED_PREFIX = 'NuxChain AI Authentication';

/**
 * Builds the canonical sign message for the frontend to present to the user.
 */
export function buildSignMessage(walletAddress: string, timestamp: number): string {
  return `${EXPECTED_PREFIX}\n\nWallet: ${walletAddress.toLowerCase()}\nTimestamp: ${timestamp}\nDomain: nuxchain.app\n\nBy signing you grant NuxBee AI access to your on-chain activity to personalize responses. No transaction is executed.`;
}

/**
 * Verifies an EVM wallet signature.
 * Returns { valid: true, wallet: '0x...' } or { valid: false, error: string }.
 */
export function verifyWalletSignature(auth: WalletAuth): { valid: boolean; wallet?: string; error?: string } {
  try {
    const { walletAddress, message, signature } = auth;

    if (!walletAddress || !message || !signature) {
      return { valid: false, error: 'Missing walletAddress, message, or signature.' };
    }

    // Validate message contains expected prefix to avoid arbitrary message abuse
    if (!message.startsWith(EXPECTED_PREFIX)) {
      return { valid: false, error: 'Invalid message format.' };
    }

    // Extract timestamp from message to reject expired signatures
    const timestampMatch = message.match(/Timestamp:\s*(\d+)/);
    if (!timestampMatch) {
      return { valid: false, error: 'Missing timestamp in message.' };
    }

    const signedAt = parseInt(timestampMatch[1], 10);
    if (Date.now() - signedAt > SESSION_TTL_MS) {
      return { valid: false, error: 'Signature expired. Please sign again.' };
    }

    // Validate future timestamps (clock skew tolerance: 5 minutes)
    if (signedAt - Date.now() > 5 * 60 * 1000) {
      return { valid: false, error: 'Timestamp is in the future. Please check your system clock.' };
    }

    // Recover signer and compare to claimed wallet (case-insensitive)
    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== walletAddress.toLowerCase()) {
      return { valid: false, error: 'Signature mismatch. Recovered address does not match.' };
    }

    return { valid: true, wallet: recovered.toLowerCase() };
  } catch (err) {
    return { valid: false, error: `Signature verification failed: ${err instanceof Error ? err.message : 'unknown error'}` };
  }
}
