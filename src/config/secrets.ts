/**
 * 🔑 Encrypted Secrets Manager
 * 
 * Centralized utility to load and decrypt secrets from environment variables
 * 
 * Usage:
 * const solanaKey = getEncryptedSecret('SOLANA_DEPLOYER_PRIVATE_KEY');
 * const polygonKey = getEncryptedSecret('PRIVATE_KEY', 'plaintext'); // No decryption
 */

import { decryptSecret } from './encryption';

export interface SecretOptions {
  encrypted?: boolean;
  required?: boolean;
  fallback?: string;
}

/**
 * Get a secret from environment, optionally decrypting it
 * 
 * @param envVar Environment variable name
 * @param options Configuration options
 * @returns Decrypted/plain secret value
 * @throws Error if required secret is missing
 */
export function getSecret(
  envVar: string,
  options: SecretOptions = {}
): string {
  const {
    encrypted = true,
    required = true,
    fallback = undefined
  } = options;

  const value = process.env[envVar];

  if (!value) {
    if (required && !fallback) {
      throw new Error(
        `❌ Missing required secret: ${envVar}\n` +
        `   Set it in .env.local (local dev) or Vercel Secrets (production)\n` +
        `   If encrypted, use: npm run secret:encrypt -- "your_value"`
      );
    }
    return fallback || '';
  }

  try {
    // Detect if value looks encrypted (contains ':' separator)
    const looksEncrypted = value.includes(':') && value.split(':').every(
      part => /^[a-f0-9]{32,}$/.test(part)
    );

    if (encrypted && looksEncrypted) {
      return decryptSecret(value);
    }

    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `❌ Failed to load secret "${envVar}": ${message}`
    );
  }
}

/**
 * Batch load and decrypt multiple secrets
 */
export function getSecrets(vars: Record<string, SecretOptions>): Record<string, string> {
  const secrets: Record<string, string> = {};

  for (const [key, options] of Object.entries(vars)) {
    try {
      secrets[key] = getSecret(key, options);
    } catch (error) {
      if (options.required && !options.fallback) {
        throw error;
      }
      secrets[key] = options.fallback || '';
    }
  }

  return secrets;
}

/**
 * Example usage for Solana deployment scripts:
 */
export const SolanaSecrets = {
  /**
   * Get Solana private key (encrypted in .env)
   * 
   * Usage in deploy-nux-token.ts:
   * const privateKey = SolanaSecrets.getPrivateKey();
   * const keypair = Keypair.fromSecretKey(Buffer.from(privateKey, 'base58'));
   */
  getPrivateKey(): string {
    return getSecret('PRIVATE_KEY_SOLANA', {
      encrypted: true,
      required: true
    });
  },

  /**
   * Get deployer wallet address (usually not encrypted)
   */
  getDeployerAddress(): string {
    return getSecret('VITE_DEPLOYER_NUX', {
      encrypted: false,
      required: true
    });
  },

  /**
   * Get RPC URL (usually not encrypted, public)
   */
  getRpcUrl(): string {
    return getSecret('VITE_SOLANA_RPC_QUICKNODE', {
      encrypted: false,
      required: false,
      fallback: 'https://api.mainnet-beta.solana.com'
    });
  }
};

/**
 * Example usage for Polygon/EVM deployment scripts:
 */
export const PolygonSecrets = {
  getPrivateKey(): string {
    return getSecret('PRIVATE_KEY', {
      encrypted: true,
      required: true
    });
  },

  getDeployerAddress(): string {
    return getSecret('DEPLOYER_OWNER_ADDRESS', {
      encrypted: false,
      required: true
    });
  },

  getRpcUrl(): string {
    return getSecret('VITE_RPC_URL', {
      encrypted: false,
      required: false,
      fallback: 'https://polygon-rpc.com/'
    });
  }
};

export default {
  getSecret,
  getSecrets,
  SolanaSecrets,
  PolygonSecrets
};
