/**
 * 🚀 NUX TOKEN DEPLOYMENT (SIMPLE VERSION - No Metadata)
 * 
 * This creates the token without metadata to avoid Metaplex errors.
 * Metadata can be added later using Solana CLI or Metaplex separately.
 * 
 * Usage: npx tsx scripts/setup/deploy-nux-token-simple.ts
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  getAssociatedTokenAddress,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  // 1. Configuration
  const NETWORK: 'devnet' | 'mainnet-beta' = 'mainnet-beta'; 
  const RPC_URL = NETWORK === 'mainnet-beta' 
    ? 'https://api.mainnet-beta.solana.com' 
    : 'https://api.devnet.solana.com';

  const connection = new Connection(RPC_URL, 'confirmed');

  // 2. Load Wallet
  const walletPath = path.join(__dirname, 'wallet.json');
  if (!fs.existsSync(walletPath)) {
    console.error(`❌ Wallet file not found at ${walletPath}`);
    process.exit(1);
  }

  const secretKeyString = fs.readFileSync(walletPath, 'utf8');
  const secretKey = Uint8Array.from(JSON.parse(secretKeyString));
  const payer = Keypair.fromSecretKey(secretKey);

  console.log(`👛 Using wallet: ${payer.publicKey.toBase58()}`);
  
  const balance = await connection.getBalance(payer.publicKey);
  console.log(`💰 Balance: ${balance / 1e9} SOL`);

  if (balance < 0.05 * 1e9) {
    console.error('❌ Insufficient balance. You need at least 0.05 SOL.');
    process.exit(1);
  }

  try {
    // 3. Generate Mint Keypair
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    console.log(`\n🔑 Generated Mint Address: ${mint.toBase58()}`);

    // 4. Get rent exemption
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

    // 5. Create Mint Account
    const createMintTx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint,
        space: MINT_SIZE,
        lamports,
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(
        mint,
        6, // 6 decimals
        payer.publicKey, // Mint Authority (Temporary)
        payer.publicKey, // Freeze Authority (Temporary)
        TOKEN_PROGRAM_ID
      )
    );

    console.log('📝 Creating Mint Account...');
    const createMintSignature = await sendAndConfirmTransaction(
      connection,
      createMintTx,
      [payer, mintKeypair]
    );
    console.log(`✅ Mint created: ${createMintSignature}`);

    // 6. Create ATA
    const tokenAccount = await getAssociatedTokenAddress(mint, payer.publicKey);
    
    console.log('🏦 Creating Associated Token Account...');
    const createAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey,
        tokenAccount,
        payer.publicKey,
        mint
      )
    );
    const ataSignature = await sendAndConfirmTransaction(connection, createAtaTx, [payer]);
    console.log(`✅ ATA created: ${ataSignature}`);

    // 7. Mint Supply
    const amountToMint = 100_000_000 * Math.pow(10, 6); // 100M with 6 decimals
    console.log('🖨️ Minting 100,000,000 NUX...');
    
    const mintToTx = new Transaction().add(
      createMintToInstruction(
        mint,
        tokenAccount,
        payer.publicKey,
        amountToMint
      )
    );
    const mintSignature = await sendAndConfirmTransaction(connection, mintToTx, [payer]);
    console.log(`✅ Tokens minted: ${mintSignature}`);

    // 8. Revoke Mint Authority (PERMANENT - no more minting!)
    console.log('🔒 Revoking Mint Authority...');
    
    const revokeMintTx = new Transaction().add(
      createSetAuthorityInstruction(
        mint,
        payer.publicKey, // Current authority
        AuthorityType.MintTokens,
        null // New authority = null (revoke)
      )
    );
    const revokeMintSignature = await sendAndConfirmTransaction(connection, revokeMintTx, [payer]);
    console.log(`✅ Mint Authority revoked: ${revokeMintSignature}`);

    // 9. Revoke Freeze Authority
    console.log('❄️ Revoking Freeze Authority...');
    
    const revokeFreezeТx = new Transaction().add(
      createSetAuthorityInstruction(
        mint,
        payer.publicKey,
        AuthorityType.FreezeAccount,
        null
      )
    );
    const revokeFreezeSignature = await sendAndConfirmTransaction(connection, revokeFreezeТx, [payer]);
    console.log(`✅ Freeze Authority revoked: ${revokeFreezeSignature}`);

    // 10. Success!
    console.log('\n✅ DEPLOYMENT SUCCESSFUL!');
    console.log('=========================================');
    console.log(`Token Address (Mint): ${mint.toBase58()}`);
    console.log(`Your Token Account:   ${tokenAccount.toBase58()}`);
    console.log(`Network:              ${NETWORK}`);
    console.log('=========================================');

    // Save result
    const resultPath = path.join(__dirname, `nux-token-${NETWORK}.json`);
    fs.writeFileSync(resultPath, JSON.stringify({
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      network: NETWORK,
      decimals: 6,
      supply: 100_000_000,
      timestamp: new Date().toISOString(),
    }, null, 2));

    console.log(`\n💾 Saved to: ${resultPath}`);
    console.log('\n📌 NEXT STEPS:');
    console.log(`1. Copy MINT address: ${mint.toBase58()}`);
    console.log('2. Update .env: VITE_NUX_MINT_ADDRESS=<mint_above>');
    console.log(`3. Update .env: VITE_DEPLOYER_NUX=${payer.publicKey.toBase58()}`);
    console.log('4. Deploy to Vercel: npx vercel --prod');

  } catch (error) {
    console.error('\n❌ Deployment Failed:', error);
    process.exit(1);
  }
}

main();
