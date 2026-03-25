/**
 * 🔐 Encryption Service for Sensitive Secrets
 * 
 * Handles encryption/decryption of private keys and sensitive data using AES-256-CBC
 * 
 * Usage:
 * - Development: Uses random key or ENCRYPTION_KEY from .env
 * - Production: ENCRYPTION_KEY must be set in Vercel Secrets
 * 
 * Example:
 * const encrypted = encryptSecret('my_private_key');
 * const decrypted = decryptSecret(encrypted);
 */

import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────

const ENCRYPTION_KEY = getEncryptionKey();

/**
 * Get or generate encryption key
 * In production, this MUST be set in environment variables
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    // Development mode: generate ephemeral key (not persisted)
    console.warn(
      '⚠️  ENCRYPTION_KEY not set. Using random ephemeral key for development.\n' +
      '   For production, set ENCRYPTION_KEY in .env or Vercel Secrets.'
    );
    return crypto.randomBytes(32);
  }

  // Convert hex string to Buffer if needed
  if (typeof key === 'string') {
    if (key.length === 64) {
      // Hex-encoded 32-byte key
      return Buffer.from(key, 'hex');
    } else if (key.length === 44) {
      // Base64-encoded 32-byte key
      return Buffer.from(key, 'base64');
    } else {
      throw new Error(
        'ENCRYPTION_KEY must be 32 bytes, encoded as 64 hex chars or 44 base64 chars'
      );
    }
  }

  return key as Buffer;
}

// ─────────────────────────────────────────────────────────────────────────────
// ENCRYPTION / DECRYPTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encrypt a secret using AES-256-CBC
 * 
 * @param secret The plaintext secret to encrypt
 * @returns Encrypted string in format: `iv:ciphertext` (both hex-encoded)
 */
export function encryptSecret(secret: string): string {
  if (!secret) {
    throw new Error('Secret cannot be empty');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final()
  ]);

  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a secret encrypted with encryptSecret()
 * 
 * @param encrypted Encrypted string in format: `iv:ciphertext`
 * @returns Decrypted plaintext secret
 * @throws Error if format is invalid or decryption fails
 */
export function decryptSecret(encrypted: string): string {
  if (!encrypted || typeof encrypted !== 'string') {
    throw new Error('Encrypted secret must be a non-empty string');
  }

  const parts = encrypted.split(':');
  if (parts.length !== 2) {
    throw new Error(
      'Invalid encrypted format. Expected "iv:ciphertext". ' +
      'Make sure you\'re using an encrypted value from encryptSecret().'
    );
  }

  const [ivHex, encHex] = parts;

  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      ENCRYPTION_KEY,
      iv
    );

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encHex, 'hex')),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to decrypt secret: ${message}. ` +
      'This usually means the ENCRYPTION_KEY is wrong or the encrypted value is corrupted.'
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Generate a new encryption key
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a new 256-bit encryption key
 * Use this to create a new ENCRYPTION_KEY for your environment
 * 
 * Output formats:
 * - Hex (use in ENCRYPTION_KEY=...): 64 characters
 * - Base64 (use in ENCRYPTION_KEY=...): 44 characters
 */
export function generateEncryptionKey(format: 'hex' | 'base64' = 'hex'): string {
  const key = crypto.randomBytes(32);
  return format === 'hex' ? key.toString('hex') : key.toString('base64');
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Encrypt value from CLI (development)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CLI helper to encrypt a secret during development
 * Usage:
 *   npx ts-node src/config/encryption.ts encrypt "my_private_key"
 */
if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'encrypt' && args.length > 0) {
    const secret = args.join(' ');
    const encrypted = encryptSecret(secret);
    console.log('\n✅ Encrypted secret:');
    console.log(`PRIVATE_KEY_SOLANA="${encrypted}"\n`);
    console.log('Copy this to your .env file (in .env.local, gitignored)');
  } else if (command === 'generate-key') {
    const hex = generateEncryptionKey('hex');
    const base64 = generateEncryptionKey('base64');
    console.log('\n🔐 New Encryption Key Generated:');
    console.log(`\n  Hex format (recommended):`);
    console.log(`  ENCRYPTION_KEY="${hex}"\n`);
    console.log(`  Base64 format:`);
    console.log(`  ENCRYPTION_KEY="${base64}"\n`);
    console.log('Add to your .env.local (gitignored) or Vercel Secrets');
  } else {
    console.log('Usage:');
    console.log('  npx ts-node src/config/encryption.ts encrypt "secret_value"');
    console.log('  npx ts-node src/config/encryption.ts generate-key');
  }
}

export default {
  encryptSecret,
  decryptSecret,
  generateEncryptionKey,
};
