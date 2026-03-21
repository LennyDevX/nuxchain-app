/**
 * Converts a base58-encoded Solana private key (from .env) to a Solana CLI keypair JSON file.
 * Usage: node scripts/setup/convert-keypair.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

// Read the private key from .env
const envPath = join(ROOT, '.env');
if (!existsSync(envPath)) {
  console.error('❌ .env file not found at', envPath);
  process.exit(1);
}

const envContent = readFileSync(envPath, 'utf-8');
const match = envContent.match(/SOLANA_DEPLOYER_PRIVATE_KEY=(.+)/);
if (!match) {
  console.error('❌ SOLANA_DEPLOYER_PRIVATE_KEY not found in .env');
  process.exit(1);
}

const base58Key = match[1].trim();
console.log(`✓ Found key (${base58Key.length} chars)`);

// Base58 decode
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str) {
  let result = BigInt(0);
  const base = BigInt(58);
  for (const char of str) {
    const idx = BASE58_ALPHABET.indexOf(char);
    if (idx === -1) throw new Error(`Invalid base58 char: ${char}`);
    result = result * base + BigInt(idx);
  }

  // Convert BigInt to bytes
  const bytes = [];
  while (result > 0n) {
    bytes.unshift(Number(result & 0xffn));
    result >>= 8n;
  }

  // Add leading zeros for leading '1's in base58
  for (const char of str) {
    if (char === '1') bytes.unshift(0);
    else break;
  }

  return new Uint8Array(bytes);
}

const keyBytes = base58Decode(base58Key);
console.log(`✓ Decoded to ${keyBytes.length} bytes`);

if (keyBytes.length !== 64) {
  console.error(`❌ Expected 64 bytes for a Solana keypair, got ${keyBytes.length}`);
  console.error('Make sure SOLANA_DEPLOYER_PRIVATE_KEY is the full 64-byte keypair (not just the 32-byte seed)');
  process.exit(1);
}

const outputPath = join(ROOT, 'keys', 'deployer-keypair.json');
writeFileSync(outputPath, JSON.stringify(Array.from(keyBytes)));
console.log(`✓ Keypair written to: ${outputPath}`);

// Show the public key (last 32 bytes of the 64-byte keypair)
const pubkeyBytes = keyBytes.slice(32);
console.log(`✓ Public key bytes: [${Array.from(pubkeyBytes).join(', ')}]`);
console.log('\nNext: solana address -k keys/deployer-keypair.json');
