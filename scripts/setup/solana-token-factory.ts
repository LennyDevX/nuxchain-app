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
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { keypairIdentity, publicKey as umiPublicKey } from '@metaplex-foundation/umi';

/**
 * Configuration for the NUX Token
 */
export interface TokenConfig {
  name: string;
  symbol: string;
  uri: string; // URL to the JSON metadata (hosted on IPFS/Arweave)
  decimals: number;
  supply: number; // Total supply (e.g., 100,000,000)
}

/**
 * Creates a secure, non-mintable, burnable SPL token with metadata.
 * This script saves you ~3.6 SOL compared to using tools.smithii.
 * 
 * Security features included for high DEXTools score:
 * 1. Fixed Supply (Mint Authority Revoked)
 * 2. No Freeze Authority (Freeze Authority Revoked)
 * 3. Verified Metadata (Metaplex Standard)
 * 4. Burnable (Standard SPL feature)
 * 
 * @param connection Solana RPC Connection
 * @param payer Keypair of the wallet paying for the transaction and initially receiving the tokens
 * @param config Token configuration (name, symbol, uri, decimals, supply)
 * @returns The Mint PublicKey and the Associated Token Account PublicKey
 */
export async function createSecureToken(
  connection: Connection,
  payer: Keypair,
  config: TokenConfig
): Promise<{ mint: PublicKey; tokenAccount: PublicKey }> {
  console.log(`🚀 Starting creation of ${config.name} (${config.symbol})...`);
  
  // 1. Generate a new keypair for the Mint
  const mintKeypair = Keypair.generate();
  const mint = mintKeypair.publicKey;
  console.log(`🔑 Generated Mint Address: ${mint.toBase58()}`);

  // Calculate the minimum balance for rent exemption
  const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);

  // 2. Create the Mint Account and Initialize it
  // Initially, we set the payer as the mint and freeze authority so we can mint the initial supply.
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
      config.decimals,
      payer.publicKey, // Mint Authority (Temporary)
      payer.publicKey, // Freeze Authority (Temporary)
      TOKEN_PROGRAM_ID
    )
  );

  console.log('📝 Creating Mint Account...');
  await sendAndConfirmTransaction(connection, createMintTx, [payer, mintKeypair]);

  // 3. Create Associated Token Account (ATA) for the payer to receive the supply
  const tokenAccount = await getAssociatedTokenAddress(mint, payer.publicKey);
  
  // Check if ATA already exists (unlikely for a new mint, but good practice)
  const ataInfo = await connection.getAccountInfo(tokenAccount);
  if (!ataInfo) {
    console.log('🏦 Creating Associated Token Account...');
    const createAtaTx = new Transaction().add(
      createAssociatedTokenAccountInstruction(
        payer.publicKey, // Payer
        tokenAccount,    // ATA
        payer.publicKey, // Owner
        mint             // Mint
      )
    );
    await sendAndConfirmTransaction(connection, createAtaTx, [payer]);
  }

  // 4. Mint the Total Supply to the Payer's ATA
  const amountToMint = config.supply * Math.pow(10, config.decimals);
  console.log(`🖨️ Minting ${config.supply} tokens to ${tokenAccount.toBase58()}...`);
  
  const mintToTx = new Transaction().add(
    createMintToInstruction(
      mint,
      tokenAccount,
      payer.publicKey, // Authority
      amountToMint
    )
  );
  await sendAndConfirmTransaction(connection, mintToTx, [payer]);

  // 5. Add Metadata using Metaplex Umi
  console.log('🏷️ Adding Token Metadata...');
  const umi = createUmi(connection.rpcEndpoint);
  
  // Convert Web3.js Keypair to Umi Keypair
  const umiKeypair = umi.eddsa.createKeypairFromSecretKey(payer.secretKey);
  umi.use(keypairIdentity(umiKeypair));

  const metadataTx = createMetadataAccountV3(umi, {
    mint: umiPublicKey(mint.toBase58()),
    mintAuthority: umi.identity,
    payer: umi.identity,
    updateAuthority: umi.identity.publicKey,
    data: {
      name: config.name,
      symbol: config.symbol,
      uri: config.uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true, // Keep true if you want to update logo/links later, false to lock forever
    collectionDetails: null,
  });

  await metadataTx.sendAndConfirm(umi);
  console.log('✅ Metadata added successfully!');

  // 6. SECURITY: Revoke Authorities (Crucial for DEXTools Score)
  console.log('🔒 Securing Token (Revoking Authorities)...');
  
  const revokeTx = new Transaction().add(
    // Revoke Mint Authority (Makes it Non-Mintable / Fixed Supply)
    createSetAuthorityInstruction(
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null
    ),
    // Revoke Freeze Authority (Prevents freezing user funds)
    createSetAuthorityInstruction(
      mint,
      payer.publicKey,
      AuthorityType.FreezeAccount,
      null
    )
  );

  await sendAndConfirmTransaction(connection, revokeTx, [payer]);
  console.log('✅ Mint and Freeze Authorities revoked permanently!');

  console.log('\n🎉 Token Creation Complete! 🎉');
  console.log(`Mint Address: ${mint.toBase58()}`);
  console.log(`Your Token Account: ${tokenAccount.toBase58()}`);
  console.log(`View on Explorer: https://explorer.solana.com/address/${mint.toBase58()}`);
  
  return { mint, tokenAccount };
}
