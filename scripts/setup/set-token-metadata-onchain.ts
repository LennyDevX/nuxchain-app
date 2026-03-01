/**
 * SET NUX TOKEN METADATA ON-CHAIN
 * 
 * This script:
 * 1. Uploads the token image to Pinata IPFS
 * 2. Uploads the metadata JSON to Pinata IPFS
 * 3. Writes the metadata ON-CHAIN using Metaplex Token Metadata Program
 * 
 * After this, wallets like Phantom will display the name, symbol and image.
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import FormData from 'form-data';

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import {
  createMetadataAccountV3,
  findMetadataPda,
  mplTokenMetadata,
} from '@metaplex-foundation/mpl-token-metadata';
import {
  createSignerFromKeypair,
  signerIdentity,
  publicKey as umiPublicKey,
} from '@metaplex-foundation/umi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Config ───────────────────────────────────────────────────────────────────
const RPC_URL =
  process.env.VITE_SOLANA_RPC_QUICKNODE || 'https://api.mainnet-beta.solana.com';
const PINATA_JWT = process.env.VITE_PINATA_JWT!;
const PINATA_GATEWAY =
  process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const NUX_MINT = '4EQbtdS6mV73CSWMWFonRrLF2FxaPTir8qHKtMgSFAGf';
const IMAGE_PATH = path.join(__dirname, '../../public/assets/tokens/nux-token.png');
const WALLET_PATH = path.join(__dirname, 'wallet.json');

// ─── Pinata Helpers ────────────────────────────────────────────────────────────
async function uploadImageToPinata(imagePath: string): Promise<string> {
  console.log('🖼️  Uploading image to Pinata IPFS...');

  const fileStream = fs.createReadStream(imagePath);
  const form = new FormData();
  form.append('file', fileStream);
  form.append(
    'pinataMetadata',
    JSON.stringify({ name: 'nux-token.png' })
  );

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form as any,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata image upload failed: ${err}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  const uri = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
  console.log(`   ✅ Image URI: ${uri}`);
  return uri;
}

async function uploadJsonToPinata(metadata: object): Promise<string> {
  console.log('📄 Uploading metadata JSON to Pinata IPFS...');

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

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Pinata JSON upload failed: ${err}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  const uri = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
  console.log(`   ✅ Metadata URI: ${uri}`);
  return uri;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     NUX TOKEN — SET ON-CHAIN METADATA (Metaplex)           ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Validate prerequisites
  if (!PINATA_JWT) throw new Error('❌ Missing VITE_PINATA_JWT in .env');
  if (!fs.existsSync(WALLET_PATH)) throw new Error(`❌ wallet.json not found at: ${WALLET_PATH}`);
  if (!fs.existsSync(IMAGE_PATH)) {
    throw new Error(
      `❌ Image not found at: ${IMAGE_PATH}\n` +
      `   → Save nux-token.png to: public/assets/tokens/nux-token.png`
    );
  }

  // Load wallet
  const walletJson = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
  const keypair = Keypair.fromSecretKey(new Uint8Array(walletJson));
  console.log(`👛 Wallet: ${keypair.publicKey.toBase58()}`);

  // Check balance
  const connection = new Connection(RPC_URL, 'confirmed');
  const balance = await connection.getBalance(keypair.publicKey);
  console.log(`💰 Balance: ${(balance / 1e9).toFixed(6)} SOL\n`);

  if (balance < 0.01 * 1e9) {
    throw new Error('❌ Insufficient balance. Need at least 0.01 SOL for metadata creation.');
  }

  // Step 1: Upload image
  const imageUri = await uploadImageToPinata(IMAGE_PATH);

  // Step 2: Build and upload metadata JSON (Metaplex standard)
  const metadataJson = {
    name: 'NuxChain Token',
    symbol: 'NUX',
    description:
      'The native utility token powering the NuxChain ecosystem. Non-mintable and non-freezable.',
    image: imageUri,
    external_url: 'https://www.nuxchain.com',
    properties: {
      files: [{ uri: imageUri, type: 'image/png' }],
      category: 'image',
    },
    attributes: [
      { trait_type: 'Network', value: 'Solana Mainnet' },
      { trait_type: 'Supply', value: '100,000,000' },
      { trait_type: 'Decimals', value: '6' },
      { trait_type: 'Mintable', value: 'No' },
    ],
  };

  const metadataUri = await uploadJsonToPinata(metadataJson);

  // Step 3: Write on-chain metadata via Metaplex UMI
  console.log('\n⛓️  Writing metadata ON-CHAIN via Metaplex...');

  const umi = createUmi(RPC_URL).use(mplTokenMetadata());

  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(keypair.secretKey);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(signerIdentity(signer));

  const mintPublicKey = umiPublicKey(NUX_MINT);
  const metadataPda = findMetadataPda(umi, { mint: mintPublicKey });

  const tx = await createMetadataAccountV3(umi, {
    metadata: metadataPda,
    mint: mintPublicKey,
    mintAuthority: signer,  // Must be the current signer (update authority)
    payer: signer,
    updateAuthority: signer,
    data: {
      name: 'NuxChain Token',
      symbol: 'NUX',
      uri: metadataUri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,        // Keep mutable so we can update image/description later
    collectionDetails: null,
  }).sendAndConfirm(umi);

  const txSig = Buffer.from(tx.signature).toString('base64');
  console.log(`   ✅ Metadata written on-chain!`);
  console.log(`   🔗 TX Signature: ${txSig}`);

  // Save result
  const result = {
    mintAddress: NUX_MINT,
    imageUri,
    metadataUri,
    txSignature: txSig,
    timestamp: new Date().toISOString(),
  };

  const resultPath = path.join(__dirname, '../../nux-token-metadata-result.json');
  fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('✅ SUCCESS! On-chain metadata set for NUX token');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\n🖼️  Image URI   : ${imageUri}`);
  console.log(`📄 Metadata URI : ${metadataUri}`);
  console.log(`\n📱 Phantom Wallet:`);
  console.log('   → Refresh your wallet (swipe down)');
  console.log('   → The token will now show "NUX" with the image\n');
  console.log(`🔎 Solscan: https://solscan.io/token/${NUX_MINT}\n`);
}

main().catch((err) => {
  console.error('\n❌ Error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
