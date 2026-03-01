/**
 * ╔═══════════════════════════════════════════════════════════════════════╗
 * ║   NUX TOKEN - FULL END-TO-END DEPLOY SCRIPT                          ║
 * ║                                                                        ║
 * ║  Steps:                                                                ║
 * ║  1. Upload image PNG → Pinata IPFS                                    ║
 * ║  2. Upload metadata JSON → Pinata IPFS                                ║
 * ║  3. Create new SPL Token Mint                                         ║
 * ║  4. Create Associated Token Account                                   ║
 * ║  5. Write metadata ON-CHAIN via Metaplex (while mint auth is active)  ║
 * ║  6. Mint 100,000,000 NUX tokens                                       ║
 * ║  7. Revoke Mint Authority → non-mintable forever                      ║
 * ║  8. Revoke Freeze Authority → non-freezable forever                   ║
 * ╚═══════════════════════════════════════════════════════════════════════╝
 *
 * IMPORTANT: Run ONCE on mainnet. Irreversible after step 7 & 8.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';
import bs58 from 'bs58';

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  AuthorityType,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  getMinimumBalanceForRentExemptMint,
} from '@solana/spl-token';

// Manual Metaplex Token Metadata instruction (avoids UMI v3 bug with classic SPL tokens)
import {
  TransactionInstruction,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── CONFIG ────────────────────────────────────────────────────────────────────
const RPC_URL = process.env.VITE_SOLANA_RPC_QUICKNODE || 'https://api.mainnet-beta.solana.com';
const PINATA_JWT = process.env.VITE_PINATA_JWT!;
const PINATA_GATEWAY = process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';

// Wallet from environment
const PRIVATE_KEY_SOLANA = process.env.PRIVATE_KEY_SOLANA!;
const DEPLOYER_PUBLIC_KEY = process.env.VITE_DEPLOYER_NUX!;

const TOKEN_NAME    = 'Nuxchain';
const TOKEN_SYMBOL  = 'NUX';
const TOKEN_DECIMALS = 6;
const TOKEN_SUPPLY  = 100_000_000; // 100M
const TOKEN_DESCRIPTION = 'NUX is the native utility token powering the NuxChain ecosystem. Built for a cross-chain architecture and designed for the emerging agentic era, it enables incentives, rewards, and decentralized coordination across the platform’s infrastructure. With a fixed supply and on-chain metadata, NUX is optimized for DeFi integrations, governance, and seamless interoperability across blockchains.';

const IMAGE_PATH   = path.join(__dirname, '../NuxLogo.png');
const RESULT_FILE  = path.join(__dirname, '../nux-token-deploy-result.json');

// ──────────────────────────────────────────────────────────────────────────────

function log(msg: string) { console.log(msg); }
function step(n: number, msg: string) {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`STEP ${n}: ${msg}`);
  console.log('─'.repeat(60));
}

// ─── PINATA ────────────────────────────────────────────────────────────────────

async function uploadImageToPinata(imagePath: string): Promise<string> {
  log('📤 Uploading image to Pinata IPFS...');
  const form = new FormData();
  form.append('file', fs.createReadStream(imagePath));
  form.append('pinataMetadata', JSON.stringify({ name: 'NuxLogo.png' }));
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form as any,
  });
  if (!res.ok) throw new Error(`Image upload failed: ${await res.text()}`);

  const { IpfsHash } = await res.json() as { IpfsHash: string };
  const uri = `${PINATA_GATEWAY}/ipfs/${IpfsHash}`;
  log(`✅ Image uploaded: ${uri}`);
  return uri;
}

async function uploadMetadataToPinata(imageUri: string): Promise<string> {
  log('📤 Uploading metadata JSON to Pinata IPFS...');
  const metadata = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
    description: TOKEN_DESCRIPTION,
    image: imageUri,
    external_url: 'https://www.nuxchain.com',
    properties: {
      files: [{ uri: imageUri, type: 'image/png' }],
      category: 'image',
    },
    attributes: [
      { trait_type: 'Network',   value: 'Solana Mainnet' },
      { trait_type: 'Supply',    value: '100,000,000'    },
      { trait_type: 'Decimals',  value: '6'              },
      { trait_type: 'Mintable',  value: 'No (revoked)'   },
      { trait_type: 'Freezable', value: 'No (revoked)'   },
    ],
  };

  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name: 'nux-token-metadata.json' },
    }),
  });
  if (!res.ok) throw new Error(`Metadata upload failed: ${await res.text()}`);

  const { IpfsHash } = await res.json() as { IpfsHash: string };
  const uri = `${PINATA_GATEWAY}/ipfs/${IpfsHash}`;
  log(`✅ Metadata uploaded: ${uri}`);
  return uri;
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║        NUX TOKEN — FULL END-TO-END DEPLOY                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');

  // Validate
  if (!PINATA_JWT)                   throw new Error('❌ Missing VITE_PINATA_JWT in .env');
  if (!PRIVATE_KEY_SOLANA)           throw new Error('❌ Missing PRIVATE_KEY_SOLANA in .env');
  if (!DEPLOYER_PUBLIC_KEY)          throw new Error('❌ Missing VITE_DEPLOYER_NUX in .env');
  if (!fs.existsSync(IMAGE_PATH))   throw new Error(`❌ Image not found: ${IMAGE_PATH}`);

  // Load wallet from private key
  let payer: Keypair;
  try {
    // Decode from base58 (Solana standard format)
    log(`🔍 Private key length: ${PRIVATE_KEY_SOLANA.length} chars`);
    const secretKeyBytes = bs58.decode(PRIVATE_KEY_SOLANA.trim());
    log(`🔍 Decoded bytes: ${secretKeyBytes.length}`);
    
    if (secretKeyBytes.length !== 64) {
      throw new Error(`Expected 64 bytes, got ${secretKeyBytes.length}`);
    }
    
    payer = Keypair.fromSecretKey(new Uint8Array(secretKeyBytes));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`❌ Invalid PRIVATE_KEY_SOLANA format. ${errorMsg}`);
  }
  log(`\n👛 Wallet : ${payer.publicKey.toBase58()}`);

  const connection = new Connection(RPC_URL, 'confirmed');
  const balance = await connection.getBalance(payer.publicKey);
  log(`💰 Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(6)} SOL`);

  if (balance < 0.02 * LAMPORTS_PER_SOL) {
    throw new Error('❌ Need at least 0.02 SOL to deploy');
  }

  // ── Step 1: Upload image ───────────────────────────────────────────────────
  step(1, 'Upload token image to Pinata IPFS');
  const imageUri = await uploadImageToPinata(IMAGE_PATH);

  // ── Step 2: Upload metadata JSON ───────────────────────────────────────────
  step(2, 'Upload metadata JSON to Pinata IPFS');
  const metadataUri = await uploadMetadataToPinata(imageUri);

  // ── Step 3: Create Mint account ────────────────────────────────────────────
  step(3, 'Create SPL Token Mint on Solana');
  const mintKeypair = Keypair.generate();
  log(`🔑 New Mint Address: ${mintKeypair.publicKey.toBase58()}`);

  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  const createMintTx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey:  payer.publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space:  MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      TOKEN_DECIMALS,
      payer.publicKey,  // mint authority (temporary)
      payer.publicKey,  // freeze authority (temporary)
      TOKEN_PROGRAM_ID,
    )
  );

  const mintSig = await sendAndConfirmTransaction(connection, createMintTx, [payer, mintKeypair]);
  log(`✅ Mint created. TX: ${mintSig}`);

  // ── Step 4: Create Associated Token Account ────────────────────────────────
  step(4, 'Create Associated Token Account');
  const ata = await getAssociatedTokenAddress(mintKeypair.publicKey, payer.publicKey);
  log(`🏦 ATA Address: ${ata.toBase58()}`);

  const ataTx = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      payer.publicKey,
      ata,
      payer.publicKey,
      mintKeypair.publicKey,
    )
  );
  const ataSig = await sendAndConfirmTransaction(connection, ataTx, [payer]);
  log(`✅ ATA created. TX: ${ataSig}`);

  // ── Step 5: Write Metadata ON-CHAIN ────────────────────────────────────────
  step(5, 'Write metadata ON-CHAIN via Metaplex (before revoking authority)');

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

  // Derive metadata PDA: ["metadata", TOKEN_METADATA_PROGRAM_ID, mint]
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );
  log(`📍 Metadata PDA: ${metadataPDA.toBase58()}`);

  // Build CreateMetadataAccountV3 instruction data manually (borsh)
  // Discriminator: 33 (1 byte)
  // DataV2: name(str) + symbol(str) + uri(str) + sellerFeeBasisPoints(u16) + creators(None) + collection(None) + uses(None)
  // isMutable: bool
  // collectionDetails: None
  function encodeStr(s: string): Buffer {
    const b = Buffer.from(s, 'utf8');
    const len = Buffer.alloc(4);
    len.writeUInt32LE(b.length, 0);
    return Buffer.concat([len, b]);
  }

  const dataBuffer = Buffer.concat([
    Buffer.from([33]),          // instruction discriminator
    encodeStr(TOKEN_NAME),      // name
    encodeStr(TOKEN_SYMBOL),    // symbol
    encodeStr(metadataUri),     // uri
    Buffer.from([0, 0]),        // sellerFeeBasisPoints = 0 (u16 LE)
    Buffer.from([0]),           // creators = None
    Buffer.from([0]),           // collection = None
    Buffer.from([0]),           // uses = None
    Buffer.from([1]),           // isMutable = true
    Buffer.from([0]),           // collectionDetails = None
  ]);

  const createMetadataIx = new TransactionInstruction({
    programId: TOKEN_METADATA_PROGRAM_ID,
    keys: [
      { pubkey: metadataPDA,             isSigner: false, isWritable: true  }, // metadata
      { pubkey: mintKeypair.publicKey,   isSigner: false, isWritable: false }, // mint
      { pubkey: payer.publicKey,         isSigner: true,  isWritable: false }, // mintAuthority
      { pubkey: payer.publicKey,         isSigner: true,  isWritable: true  }, // payer
      { pubkey: payer.publicKey,         isSigner: false, isWritable: false }, // updateAuthority
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // systemProgram
      { pubkey: SYSVAR_RENT_PUBKEY,      isSigner: false, isWritable: false }, // rent
    ],
    data: dataBuffer,
  });

  const metaTx = new Transaction().add(createMetadataIx);
  const metaSig = await sendAndConfirmTransaction(connection, metaTx, [payer]);
  log(`✅ Metadata written on-chain! TX: ${metaSig}`);

  // ── Step 6: Mint tokens ────────────────────────────────────────────────────
  step(6, `Mint ${TOKEN_SUPPLY.toLocaleString()} ${TOKEN_SYMBOL} tokens`);
  const mintAmount = BigInt(TOKEN_SUPPLY) * BigInt(10 ** TOKEN_DECIMALS);

  const mintTokensTx = new Transaction().add(
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      payer.publicKey,
      mintAmount,
    )
  );
  const mintTokensSig = await sendAndConfirmTransaction(connection, mintTokensTx, [payer]);
  log(`✅ ${TOKEN_SUPPLY.toLocaleString()} ${TOKEN_SYMBOL} minted. TX: ${mintTokensSig}`);

  // ── Step 7: Revoke Mint Authority ──────────────────────────────────────────
  step(7, 'Revoke Mint Authority → NON-MINTABLE FOREVER');
  const revokeMintTx = new Transaction().add(
    createSetAuthorityInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      AuthorityType.MintTokens,
      null,
    )
  );
  const revokeMintSig = await sendAndConfirmTransaction(connection, revokeMintTx, [payer]);
  log(`✅ Mint Authority revoked. TX: ${revokeMintSig}`);

  // ── Step 8: Revoke Freeze Authority ────────────────────────────────────────
  step(8, 'Revoke Freeze Authority → NON-FREEZABLE FOREVER');
  const revokeFreezetx = new Transaction().add(
    createSetAuthorityInstruction(
      mintKeypair.publicKey,
      payer.publicKey,
      AuthorityType.FreezeAccount,
      null,
    )
  );
  const revokeFreezetSig = await sendAndConfirmTransaction(connection, revokeFreezetx, [payer]);
  log(`✅ Freeze Authority revoked. TX: ${revokeFreezetSig}`);

  // ── Final balance ──────────────────────────────────────────────────────────
  const finalBalance = await connection.getBalance(payer.publicKey);
  const solSpent = (balance - finalBalance) / LAMPORTS_PER_SOL;

  // ── Save result ────────────────────────────────────────────────────────────
  const result = {
    mintAddress:   mintKeypair.publicKey.toBase58(),
    tokenAccount:  ata.toBase58(),
    deployerWallet: payer.publicKey.toBase58(),
    network:       'mainnet-beta',
    name:          TOKEN_NAME,
    symbol:        TOKEN_SYMBOL,
    decimals:      TOKEN_DECIMALS,
    supply:        TOKEN_SUPPLY,
    imageUri,
    metadataUri,
    mintAuthorityRevoked:   true,
    freezeAuthorityRevoked: true,
    solSpent: solSpent.toFixed(6),
    timestamp: new Date().toISOString(),
    transactions: {
      createMint:      mintSig,
      createATA:       ataSig,
      setMetadata:     metaSig,
      mintTokens:      mintTokensSig,
      revokeMint:      revokeMintSig,
      revokeFreeze:    revokeFreezetSig,
    },
  };

  fs.writeFileSync(RESULT_FILE, JSON.stringify(result, null, 2));

  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              ✅  DEPLOYMENT SUCCESSFUL!                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝');
  console.log(`\n🪙  Token Address : ${mintKeypair.publicKey.toBase58()}`);
  console.log(`🏦  Token Account : ${ata.toBase58()}`);
  console.log(`🖼️   Image URI     : ${imageUri}`);
  console.log(`📄  Metadata URI  : ${metadataUri}`);
  console.log(`💸  SOL Spent     : ~${solSpent.toFixed(4)} SOL`);
  console.log(`\n🔒 Mint Authority   : REVOKED`);
  console.log(`🔒 Freeze Authority : REVOKED`);
  console.log(`\n📱 Phantom: refresh your wallet — NUX will show name + image`);
  console.log(`🔎 Solscan: https://solscan.io/token/${mintKeypair.publicKey.toBase58()}`);
  console.log(`\n💾 Full result saved to: nux-token-deploy-result.json`);
  console.log('\n⚠️  UPDATE .env WITH NEW MINT ADDRESS:');
  console.log(`   VITE_NUX_MINT_ADDRESS=${mintKeypair.publicKey.toBase58()}\n`);
}

main().catch((err) => {
  console.error('\n❌ Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
