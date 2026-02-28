import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PINATA_JWT = process.env.VITE_PINATA_JWT;
const PINATA_GATEWAY = process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud';
const NUX_MINT = '4EQbtdS6mV73CSWMWFonRrLF2FxaPTir8qHKtMgSFAGf';

interface PinataUploadResponse {
  IpfsHash: string;
}

async function uploadMetadataToPinata(metadata: object): Promise<string> {
  console.log('📤 Uploading metadata to Pinata...');

  const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Metadata upload failed: ${error}`);
  }

  const data = (await response.json()) as PinataUploadResponse;
  const metadataUri = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;

  console.log('✅ Metadata uploaded:');
  console.log(`   IPFS Hash: ${data.IpfsHash}`);
  console.log(`   Gateway URL: ${metadataUri}`);

  return metadataUri;
}

async function main() {
  try {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║       NUX TOKEN - CREATE METADATA URI WITH PINATA           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!PINATA_JWT) {
      throw new Error('Missing VITE_PINATA_JWT in .env');
    }

    console.log(`🔑 Mint Address: ${NUX_MINT}\n`);

    // Create metadata JSON with image pointing to the asset location
    // Users can update the image hash later if they upload separately
    const metadata = {
      name: 'NuxChain Token',
      symbol: 'NUX',
      description:
        'The native utility token powering the NuxChain ecosystem. Non-mintable and non-freezable SPL token.',
      image:
        'https://raw.githubusercontent.com/nuxchain/nuxchain-app/main/public/assets/tokens/nux-token.png',
      external_url: 'https://www.nuxchain.com',
      website: 'https://www.nuxchain.com',
      twitter: 'https://twitter.com/nuxchain',
      discord: 'https://discord.gg/nuxchain',
      attributes: [
        {
          trait_type: 'Network',
          value: 'Solana Mainnet',
        },
        {
          trait_type: 'Token Standard',
          value: 'SPL Token',
        },
        {
          trait_type: 'Total Supply',
          value: '100,000,000',
        },
        {
          trait_type: 'Decimals',
          value: '6',
        },
        {
          trait_type: 'Mintable',
          value: 'No (revoked)',
        },
        {
          trait_type: 'Freezable',
          value: 'No (revoked)',
        },
        {
          trait_type: 'Launch Date',
          value: new Date().toISOString().split('T')[0],
        },
      ],
    };

    console.log('📋 Metadata object:');
    console.log(JSON.stringify(metadata, null, 2));
    console.log('');

    // Upload to Pinata
    const metadataUri = await uploadMetadataToPinata(metadata);

    // Save result
    const resultPath = path.join(__dirname, '../../nux-metadata-uri.json');
    const result = {
      mintAddress: NUX_MINT,
      metadataUri: metadataUri,
      timestamp: new Date().toISOString(),
      network: 'mainnet-beta',
      note: 'Store this metadataUri - it can be used by wallets and explorers to display token information',
    };

    const fs = await import('fs');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ METADATA URI CREATED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log(`📌 **Metadata URI**: ${metadataUri}`);
    console.log(`\n💾 Results saved to: nux-metadata-uri.json`);
    console.log('\n📱 Wallet Display Instructions:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log('1. Copy folder: public/assets/tokens/nux-token.png');
    console.log('2. Verify image is in the public folder');
    console.log('3. Push to GitHub');
    console.log('4. Wallets will auto-detect and display the token image\n');
    console.log('🌐 Explorer Info:');
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`View your token: https://solscan.io/token/${NUX_MINT}\n`);
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
