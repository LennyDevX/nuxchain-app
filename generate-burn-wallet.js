const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

// Generate a new keypair
const burnWallet = Keypair.generate();

// Public key (shareable)
const publicKey = burnWallet.publicKey.toString();

// Secret key (KEEP PRIVATE - this is the private key)
const secretKeyHex = Buffer.from(burnWallet.secretKey).toString('hex');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'keys');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Save keypair as JSON file (KEEP SECURE)
const keypairJson = {
  publicKey: publicKey,
  secretKey: Array.from(burnWallet.secretKey),
  secretKeyHex: secretKeyHex
};

const outputPath = path.join(outputDir, 'burn-wallet.json');
fs.writeFileSync(outputPath, JSON.stringify(keypairJson, null, 2));

console.log('\n═══════════════════════════════════════════════════════');
console.log('✅ BURN WALLET GENERATED SUCCESSFULLY');
console.log('═══════════════════════════════════════════════════════\n');

console.log('📋 PUBLIC KEY (Share this for CoinGecko):');
console.log(`   ${publicKey}\n`);

console.log('🔐 PRIVATE KEY (KEEP SECURE - DO NOT SHARE):');
console.log(`   ${secretKeyHex}\n`);

console.log(`💾 Keypair saved to: ${outputPath}`);
console.log('   ⚠️  IMPORTANT: Backup this file in a secure location!\n');

console.log('═══════════════════════════════════════════════════════\n');
