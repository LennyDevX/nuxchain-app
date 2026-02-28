/**
 * 🔑 Generate wallet.json from PRIVATE_KEY_SOLANA in .env
 * 
 * This script reads your base58-encoded Solana private key from .env
 * and converts it to the JSON array format needed by deploy-nux-token.ts
 * 
 * Usage: npx tsx scripts/setup/generate-wallet-from-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file
const envPath = path.join(__dirname, '../../.env');
dotenv.config({ path: envPath });

const PRIVATE_KEY_SOLANA = process.env.PRIVATE_KEY_SOLANA;

if (!PRIVATE_KEY_SOLANA) {
  console.error('❌ PRIVATE_KEY_SOLANA not found in .env');
  console.log('Add this to your .env:');
  console.log('PRIVATE_KEY_SOLANA=<your_base58_key>');
  process.exit(1);
}

console.log('🔑 Converting Solana private key from base58 to JSON...');

try {
  // Dynamic import of bs58
  const { default: bs58 } = await import('bs58');
  
  // Decode base58 to bytes
  const decoded = bs58.decode(PRIVATE_KEY_SOLANA);
  const secretKeyArray = Array.from(decoded);
  
  // Write to wallet.json
  const walletPath = path.join(__dirname, 'wallet.json');
  fs.writeFileSync(walletPath, JSON.stringify(secretKeyArray));
  
  console.log('✅ wallet.json generated successfully!');
  console.log(`📁 Location: ${walletPath}`);
  console.log(`🔐 Size: ${secretKeyArray.length} bytes`);
  
  // Verify by reading it back
  if (fs.existsSync(walletPath)) {
    console.log('✅ File verified and readable');
  }
  
} catch (error: any) {
  console.error('❌ Conversion failed:', error.message);
  console.log('\nMake sure you have bs58 installed:');
  console.log('npm install bs58');
  process.exit(1);
}
