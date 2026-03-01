/**
 * Verify NUX Token Deployment Ready
 * Checks all required environment variables and files before deploying
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bs58 from 'bs58';
import { Keypair, Connection } from '@solana/web3.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n╔════════════════════════════════════════════════════════════════╗');
console.log('║    NUX TOKEN DEPLOYMENT — PRE-FLIGHT CHECK                    ║');
console.log('╚════════════════════════════════════════════════════════════════╝\n');

let allGood = true;

// Check 1: Image exists
const IMAGE_PATH = path.resolve(__dirname, '../../setup/NuxLogo.png');
const imageExists = fs.existsSync(IMAGE_PATH);
console.log(imageExists ? '✅ NuxLogo.png exists' : '❌ NuxLogo.png NOT FOUND');
allGood &&= imageExists;

// Check 2: Pinata JWT
const PINATA_JWT = process.env.VITE_PINATA_JWT;
console.log(PINATA_JWT ? '✅ VITE_PINATA_JWT configured' : '❌ VITE_PINATA_JWT missing');
allGood &&= !!PINATA_JWT;

// Check 3: Solana RPC
const RPC_URL = process.env.VITE_SOLANA_RPC_QUICKNODE;
console.log(RPC_URL ? '✅ VITE_SOLANA_RPC_QUICKNODE configured' : '❌ VITE_SOLANA_RPC_QUICKNODE missing');
allGood &&= !!RPC_URL;

// Check 4: Private key
const PRIVATE_KEY_SOLANA = process.env.PRIVATE_KEY_SOLANA;
let payerPublicKey = '';
if (PRIVATE_KEY_SOLANA) {
  try {
    const secretKeyBytes = bs58.decode(PRIVATE_KEY_SOLANA);
    const payer = Keypair.fromSecretKey(new Uint8Array(secretKeyBytes));
    payerPublicKey = payer.publicKey.toBase58();
    console.log(`✅ PRIVATE_KEY_SOLANA valid (${payerPublicKey})`);
  } catch (err) {
    console.log('❌ PRIVATE_KEY_SOLANA invalid format');
    allGood = false;
  }
} else {
  console.log('❌ PRIVATE_KEY_SOLANA missing');
  allGood = false;
}

// Check 5: Deployer address
const VITE_DEPLOYER_NUX = process.env.VITE_DEPLOYER_NUX;
console.log(VITE_DEPLOYER_NUX ? `✅ VITE_DEPLOYER_NUX: ${VITE_DEPLOYER_NUX}` : '❌ VITE_DEPLOYER_NUX missing');
if (payerPublicKey && VITE_DEPLOYER_NUX && payerPublicKey !== VITE_DEPLOYER_NUX) {
  console.log(`   ⚠️  Warning: Keypair public key doesn't match VITE_DEPLOYER_NUX`);
}
allGood &&= !!VITE_DEPLOYER_NUX;

// Check 6: Wallet balance
if (RPC_URL && payerPublicKey) {
  try {
    const connection = new Connection(RPC_URL, 'confirmed');
    const balance = await connection.getBalance(new (await import('@solana/web3.js')).PublicKey(payerPublicKey));
    const solBalance = balance / 1e9;
    const isEnough = solBalance >= 0.02;
    console.log(`${isEnough ? '✅' : '❌'} Wallet balance: ${solBalance.toFixed(6)} SOL ${isEnough ? '(OK)' : '(NEED 0.02 SOL)'}`);
    allGood &&= isEnough;
  } catch (err) {
    console.log('⚠️  Could not check wallet balance (RPC may be down)');
  }
}

// Summary
console.log('\n' + '─'.repeat(64));
if (allGood) {
  console.log('🎉 All checks passed! Ready to deploy.\n');
  console.log('Run:  npm run deploy:nux\n');
  process.exit(0);
} else {
  console.log('❌ Some checks failed. Please fix the issues above.\n');
  process.exit(1);
}
