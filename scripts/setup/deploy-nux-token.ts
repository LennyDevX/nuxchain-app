import { Connection, Keypair } from '@solana/web3.js';
import { createSecureToken, TokenConfig } from './solana-token-factory';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// 🚀 NUX TOKEN DEPLOYMENT SCRIPT
// ============================================================================
// This script deploys the NUX token to the Solana blockchain.
// It implements all security best practices for a high DEXTools score.
//
// PREREQUISITES:
// 1. A Solana wallet with at least 0.05 SOL (for rent and fees)
// 2. The wallet's secret key saved in a JSON file (e.g., wallet.json)
// 3. Metadata JSON uploaded to IPFS/Arweave (containing logo, description, etc.)
// ============================================================================

async function main() {
  // 1. Configuration
  // Change this to 'mainnet-beta' for production deployment
  const NETWORK: 'devnet' | 'mainnet-beta' = 'devnet'; 
  const RPC_URL = NETWORK === 'mainnet-beta' 
    ? 'https://api.mainnet-beta.solana.com' 
    : 'https://api.devnet.solana.com';

  const connection = new Connection(RPC_URL, 'confirmed');

  // 2. Load Wallet
  // Replace 'wallet.json' with the path to your actual keypair file
  const walletPath = path.join(__dirname, 'wallet.json');
  
  if (!fs.existsSync(walletPath)) {
    console.error(`❌ Wallet file not found at ${walletPath}`);
    console.log('To create a new wallet for testing, run:');
    console.log('solana-keygen new -o scripts/setup/wallet.json');
    console.log('Then fund it on devnet: solana airdrop 2 scripts/setup/wallet.json --url devnet');
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

  // 3. Token Configuration
  // IMPORTANT: Update the URI with your actual metadata JSON URL
  const config: TokenConfig = {
    name: 'Nuxchain',
    symbol: 'NUX',
    // Example URI format. You MUST upload your own JSON to IPFS/Arweave
    // The JSON should look like: {"name":"NuxChain","symbol":"NUX","description":"...","image":"https://..."}
    uri: 'https://gateway.pinata.cloud/ipfs/bafkreid75eaapw4xhkxhs3ub5fry7mxnri5p5tse5irxyqt36kxjulqbwq', 
    decimals: 6, // Standard for Solana tokens (USDC uses 6)
    supply: 100_000_000, // 100 Million
  };

  console.log('\n📋 Token Configuration:');
  console.log(JSON.stringify(config, null, 2));
  console.log('\n⚠️ WARNING: This will create the token and permanently revoke mint/freeze authorities.');
  console.log('Press Ctrl+C to cancel, or wait 5 seconds to proceed...');
  
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // 4. Execute Creation
    const { mint, tokenAccount } = await createSecureToken(connection, payer, config);
    
    console.log('\n✅ Deployment Successful!');
    console.log('=========================================');
    console.log(`Token Address (Mint): ${mint.toBase58()}`);
    console.log(`Your Token Account:   ${tokenAccount.toBase58()}`);
    console.log(`Network:              ${NETWORK}`);
    console.log('=========================================');
    
    // Save the result
    const resultPath = path.join(__dirname, `nux-token-${NETWORK}.json`);
    fs.writeFileSync(resultPath, JSON.stringify({
      mint: mint.toBase58(),
      tokenAccount: tokenAccount.toBase58(),
      network: NETWORK,
      timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log(`💾 Saved deployment info to ${resultPath}`);

  } catch (error) {
    console.error('\n❌ Deployment Failed:', error);
  }
}

main();
