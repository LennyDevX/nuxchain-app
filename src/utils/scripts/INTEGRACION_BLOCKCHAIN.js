// ============================================
// Integración con Smart Contract Solana
// ============================================

/**
 * EJEMPLO: Cómo usar los datos exportados para distribuir tokens en blockchain
 * 
 * Requisitos:
 * - Tokens SPL creados en Solana
 * - Cuenta de distribución con tokens
 * - Web3.js o Anchor Framework
 * 
 * Flujo:
 * 1. Ejecutar: node distribute.js solana
 * 2. Cargar archivo distribution-solana-*.json
 * 3. Ejecutar este script para distribuir
 */

// ============================================
// Ejemplo con Web3.js (Solana)
// ============================================

/*
import { Connection, PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import * as fs from 'fs';

const SOLANA_NETWORK = 'https://api.devnet.solana.com'; // o mainnet-beta
const PAYER_KEYPAIR = getKeypairFromFile('path/to/keypair.json');
const TOKEN_MINT = new PublicKey('NUX_TOKEN_MINT_ADDRESS');
const DISTRIBUTION_FILE = './airdrop-exports/distribution-solana-2026-01-28.json';

async function distributeTokens() {
  const connection = new Connection(SOLANA_NETWORK, 'confirmed');
  const distribution = JSON.parse(fs.readFileSync(DISTRIBUTION_FILE, 'utf-8'));
  
  console.log(`🚀 Distribuir ${distribution.totalTransfers} transferencias...`);
  
  for (const tx of distribution.distributions) {
    try {
      // 1. Obtener ATA del destinatario
      const recipientATA = await getAssociatedTokenAddress(
        TOKEN_MINT,
        new PublicKey(tx.recipient)
      );
      
      // 2. Crear instrucción de transferencia
      const instruction = createTransferInstruction(
        PAYER_ASSOCIATED_TOKEN_ACCOUNT,
        recipientATA,
        PAYER_KEYPAIR.publicKey,
        BigInt(tx.nuxTokens * 10 ** 6), // Ajusta decimales
      );
      
      // 3. Crear y enviar transacción
      const transaction = new Transaction().add(instruction);
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [PAYER_KEYPAIR]
      );
      
      console.log(`✅ ${tx.metadata.email}: ${signature}`);
      
    } catch (error) {
      console.error(`❌ ${tx.metadata.email}: ${error.message}`);
    }
  }
}

distributeTokens();
*/

// ============================================
// Ejemplo con Ethers.js (Polygon/EVM)
// ============================================

/*
import { ethers } from 'ethers';
import * as fs from 'fs';

const POLYGON_RPC = 'https://polygon-rpc.com/';
const TOKEN_ADDRESS = 'NUX_TOKEN_ADDRESS';
const DISTRIBUTION_FILE = './airdrop-exports/distribution-evm-2026-01-28.json';
const PRIVATE_KEY = process.env.DISTRIBUTOR_PRIVATE_KEY;

const TOKEN_ABI = [
  'function transfer(address to, uint256 amount) public returns (bool)',
];

async function distributeTokens() {
  const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
  
  const distribution = JSON.parse(fs.readFileSync(DISTRIBUTION_FILE, 'utf-8'));
  
  console.log(`🚀 Distribuir ${distribution.totalTransfers} transferencias...`);
  
  for (const tx of distribution.distributions) {
    try {
      const amount = ethers.parseUnits(tx.nuxTokens.toString(), 18);
      
      const txResponse = await tokenContract.transfer(tx.to, amount);
      const receipt = await txResponse.wait();
      
      console.log(`✅ ${tx.metadata.email}: ${receipt.hash}`);
      
    } catch (error) {
      console.error(`❌ ${tx.metadata.email}: ${error.message}`);
    }
  }
}

distributeTokens();
*/

// ============================================
// Batch Distribution Script (Recomendado)
// ============================================

/*
/**
 * Script para distribuir en lotes
 * Útil para evitar límites de RPC
 */

import * as fs from 'fs';
import { sleep } from './utils';

const BATCH_SIZE = 10; // 10 transferencias por lote
const DELAY_BETWEEN_BATCHES = 2000; // 2 segundos entre lotes

async function batchDistribute() {
  const distribution = JSON.parse(
    fs.readFileSync('./airdrop-exports/distribution-solana-2026-01-28.json', 'utf-8')
  );
  
  const batches = [];
  for (let i = 0; i < distribution.distributions.length; i += BATCH_SIZE) {
    batches.push(distribution.distributions.slice(i, i + BATCH_SIZE));
  }
  
  console.log(`📦 Distribuir en ${batches.length} lotes de ${BATCH_SIZE}...`);
  
  let successful = 0;
  let failed = 0;
  
  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    console.log(`\n📤 Lote ${batchIndex + 1}/${batches.length}`);
    
    const batchPromises = batch.map(async (tx) => {
      try {
        // Enviar transferencia
        await sendTransfer(tx);
        successful++;
        console.log(`  ✅ ${tx.metadata.email}`);
      } catch (error) {
        failed++;
        console.log(`  ❌ ${tx.metadata.email}: ${error.message}`);
      }
    });
    
    await Promise.all(batchPromises);
    
    // Esperar entre lotes
    if (batchIndex < batches.length - 1) {
      console.log(`⏳ Esperando ${DELAY_BETWEEN_BATCHES}ms...`);
      await sleep(DELAY_BETWEEN_BATCHES);
    }
  }
  
  console.log(`\n📊 Resumen:`);
  console.log(`  ✅ Exitosas: ${successful}`);
  console.log(`  ❌ Fallidas: ${failed}`);
  console.log(`  📈 Tasa de éxito: ${((successful / (successful + failed)) * 100).toFixed(2)}%`);
}

async function sendTransfer(tx) {
  // Implementar según blockchain
  // Esta es una función stub
  throw new Error('Implementar sendTransfer()');
}

batchDistribute();

// ============================================
// Verificación Post-Distribución
// ============================================

/*
import { Connection, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';

const SOLANA_NETWORK = 'https://api.mainnet-beta.solana.com';
const TOKEN_MINT = new PublicKey('NUX_TOKEN_MINT_ADDRESS');
const DISTRIBUTION_FILE = './airdrop-exports/distribution-solana-2026-01-28.json';

async function verifyDistribution() {
  const connection = new Connection(SOLANA_NETWORK, 'confirmed');
  const distribution = JSON.parse(fs.readFileSync(DISTRIBUTION_FILE, 'utf-8'));
  
  console.log('🔍 Verificando distribución...\n');
  
  let verified = 0;
  let failed = 0;
  
  for (const tx of distribution.distributions) {
    try {
      const recipient = new PublicKey(tx.recipient);
      const ata = await getAssociatedTokenAddress(TOKEN_MINT, recipient);
      const balance = await connection.getTokenAccountBalance(ata);
      
      if (balance.value.amount >= tx.nuxTokens.toString()) {
        console.log(`✅ ${tx.metadata.email}: ${balance.value.uiAmount} NUX`);
        verified++;
      } else {
        console.log(`⚠️ ${tx.metadata.email}: Balance bajo`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${tx.metadata.email}: No se pudo verificar`);
      failed++;
    }
  }
  
  console.log(`\n📊 Verificación completa:`);
  console.log(`  ✅ Verificadas: ${verified}`);
  console.log(`  ❌ Fallidas: ${failed}`);
}

verifyDistribution();
*/

// ============================================
// Estructura del Archivo Exportado
// ============================================

/*
{
  "network": "solana",
  "timestamp": "2026-01-28T10:30:00Z",
  "totalTransfers": 150,
  "distributions": [
    {
      "id": 1,
      "recipient": "0x1234567890abcdef...",
      "nuxTokens": 50000,
      "polBonus": 20,
      "totalValue": 50020,
      "metadata": {
        "email": "juan@email.com",
        "name": "Juan Pérez",
        "registeredAt": "2026-01-25T10:30:00Z"
      }
    },
    // ... más usuarios
  ],
  "summary": {
    "totalNUX": 7500000,
    "totalPOL": 3000,
    "gasEstimate": "~0.0375 SOL"
  }
}
*/

// ============================================
// Configuración de Entorno (.env)
// ============================================

/*
# Solana
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_PAYER_KEYPAIR=/path/to/keypair.json
NUX_TOKEN_MINT=<TOKEN_ADDRESS>
NUX_TOKEN_DECIMALS=6

# Polygon
POLYGON_RPC_URL=https://polygon-rpc.com/
DISTRIBUTOR_PRIVATE_KEY=<PRIVATE_KEY>
NUX_TOKEN_ADDRESS=<TOKEN_ADDRESS>

# General
BATCH_SIZE=10
DELAY_BETWEEN_BATCHES=2000
*/

console.log('📚 Ver ejemplos de implementación en este archivo');
