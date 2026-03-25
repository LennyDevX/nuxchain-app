#!/usr/bin/env node

/**
 * 🔐 Secret Encryption CLI
 * 
 * Quick utility to encrypt secrets for use in .env files
 * 
 * Usage:
 *   node encrypt-secret.cjs encrypt "your_private_key"
 *   node encrypt-secret.cjs generate-key
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Get encryption key from .env.local or generate ephemeral key
function getEncryptionKey() {
  try {
    const envPath = path.join(__dirname, '../../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/ENCRYPTION_KEY=(.+)/);
      if (match) {
        const key = match[1].trim().replace(/^["']|["']$/g, '');
        if (key.length === 64) {
          return Buffer.from(key, 'hex');
        } else if (key.length === 44) {
          return Buffer.from(key, 'base64');
        }
      }
    }
  } catch (e) {
    // Ignore errors, use random key
  }

  console.log('⚠️  ENCRYPTION_KEY not found in .env.local\n');
  console.log('Generate one:');
  console.log('  node scripts/setup/encrypt-secret.cjs generate-key\n');
  
  return crypto.randomBytes(32);
}

function encryptSecret(secret, key = null) {
  const encKey = key || getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encKey, iv);
  const encrypted = Buffer.concat([
    cipher.update(secret, 'utf8'),
    cipher.final()
  ]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

function generateKey() {
  const hex = crypto.randomBytes(32).toString('hex');
  const base64 = crypto.randomBytes(32).toString('base64');
  
  console.log('\n🔐 New Encryption Key Generated:\n');
  console.log('Hex format (recommended):');
  console.log(`  ENCRYPTION_KEY="${hex}"\n`);
  console.log('Base64 format:');
  console.log(`  ENCRYPTION_KEY="${base64}"\n`);
  console.log('⚠️  Save to .env.local (gitignored) or Vercel Secrets\n');
}

// Main CLI
const [command, ...args] = process.argv.slice(2);

if (command === 'encrypt' && args.length > 0) {
  const secret = args.join(' ');
  const encrypted = encryptSecret(secret);
  
  console.log('\n✅ Encrypted Secret Generated:\n');
  console.log('Add to your .env.local:\n');
  console.log(`  PRIVATE_KEY_SOLANA="${encrypted}"\n`);
  console.log('Or for Polygon/EVM:\n');
  console.log(`  PRIVATE_KEY="${encrypted}"\n`);
  console.log('ℹ️  The key is safe to commit. Encryption key stays in .env.local\n');
} else if (command === 'generate-key') {
  generateKey();
} else {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  🔐  ENCRYPTION CLI - Encrypt Secrets for NuxChain            ║
╚════════════════════════════════════════════════════════════════╝

USAGE:
  node encrypt-secret.cjs <command> [args]

COMMANDS:
  encrypt <secret>        Encrypt a private key or secret
  generate-key            Generate a new encryption key

EXAMPLES:
  # Generate a new encryption key
  node encrypt-secret.cjs generate-key

  # Encrypt a Solana private key
  node encrypt-secret.cjs encrypt "4GhpJTbg5gmBnuLwB8HfAb..."

  # Encrypt a Polygon private key
  node encrypt-secret.cjs encrypt "0x9886568a906417aaa8b73..."

WORKFLOW:
  1. Generate key: node encrypt-secret.cjs generate-key
  2. Save ENCRYPTION_KEY to .env.local (gitignored)
  3. Encrypt secret: node encrypt-secret.cjs encrypt "<your_key>"
  4. Add result to .env.local or Vercel
  5. Your scripts will auto-decrypt at runtime

SECURITY:
  ✓ ENCRYPTION_KEY stays in .env.local (never committed)
  ✓ Encrypted secrets can be safely committed
  ✓ Different IVs for each encryption (no patterns)
  ✓ AES-256-CBC standard encryption
`);
}
