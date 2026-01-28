#!/usr/bin/env node

/**
 * Distribution Executor - Script para ejecutar distribución del airdrop
 * 
 * Prepara datos para enviar a Smart Contract en Solana
 * Formato: CSV o JSON según necesidad
 * 
 * Uso:
 *   node distribute.js [formato] [limite_usuarios]
 * 
 * Ejemplos:
 *   node distribute.js csv              // Exportar todos como CSV
 *   node distribute.js json 100         // Exportar 100 primeros como JSON
 *   node distribute.js solana           // Formato para Solana
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const FIRESTORE_COLLECTION = 'nuxchainAirdropRegistrations';
const TOKENS_PER_USER = 50000;
const POL_BONUS_PER_USER = 20;

// ============================================
// INICIALIZAR FIREBASE
// ============================================

function initializeFirebase() {
  try {
    const credentialsPath = process.env.FIREBASE_CREDENTIALS || 
      path.join(__dirname, '../../../firebase-credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credenciales no encontradas en ${credentialsPath}`);
    }

    const serviceAccount = require(credentialsPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    return admin.firestore();
  } catch (error) {
    console.error(chalk.red('❌ Error inicializando Firebase:'), error.message);
    process.exit(1);
  }
}

// ============================================
// FORMATEO PARA DISTRIBUCIÓN
// ============================================

/**
 * Formato para Solana - Instrucciones de transferencia
 */
function formatForSolana(users) {
  return {
    network: 'solana',
    timestamp: new Date().toISOString(),
    totalTransfers: users.length,
    distributions: users.map((user, index) => ({
      id: index + 1,
      recipient: user.wallet,
      nuxTokens: TOKENS_PER_USER,
      polBonus: POL_BONUS_PER_USER,
      totalValue: TOKENS_PER_USER + POL_BONUS_PER_USER,
      metadata: {
        email: user.email,
        name: user.name,
        registeredAt: user.createdAt,
      },
    })),
    summary: {
      totalNUX: users.length * TOKENS_PER_USER,
      totalPOL: users.length * POL_BONUS_PER_USER,
      gasEstimate: `~${Math.ceil(users.length * 0.00025)} SOL`,
    },
  };
}

/**
 * Formato para Ethereum/Polygon
 */
function formatForEVM(users) {
  return {
    network: 'polygon',
    timestamp: new Date().toISOString(),
    chainId: 137,
    totalTransfers: users.length,
    distributions: users.map((user, index) => ({
      index: index,
      to: user.wallet,
      nuxTokens: TOKENS_PER_USER,
      polTokens: POL_BONUS_PER_USER,
      metadata: {
        email: user.email,
        name: user.name,
      },
    })),
  };
}

/**
 * Generar archivo para batch processing
 */
function formatForBatchProcessing(users) {
  return {
    version: '1.0',
    timestamp: new Date().toISOString(),
    batches: [
      {
        name: 'nux_distribution',
        size: users.length,
        data: users.map(user => ({
          wallet: user.wallet,
          amount: TOKENS_PER_USER,
          type: 'NUX',
        })),
      },
      {
        name: 'pol_bonus',
        size: users.length,
        data: users.map(user => ({
          wallet: user.wallet,
          amount: POL_BONUS_PER_USER,
          type: 'POL',
        })),
      },
    ],
  };
}

// ============================================
// MAIN
// ============================================

async function main() {
  const format = process.argv[2] || 'csv';
  const limit = parseInt(process.argv[3]) || null;

  try {
    console.log(chalk.blue.bold('\n🚀 Preparando distribución del airdrop...\n'));

    const db = initializeFirebase();

    // Obtener registros
    console.log(chalk.blue('📥 Obteniendo registros...'));
    const snapshot = await db.collection(FIRESTORE_COLLECTION)
      .orderBy('createdAt')
      .get();

    let users = [];
    snapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      });
    });

    // Aplicar límite si se especifica
    if (limit && limit > 0) {
      users = users.slice(0, limit);
      console.log(chalk.yellow(`⚠️  Limitado a ${limit} usuarios`));
    }

    console.log(chalk.green(`✅ ${users.length} usuarios cargados\n`));

    // Generar archivo según formato
    const timestamp = new Date().toISOString().split('T')[0];
    const exportDir = path.join(__dirname, 'airdrop-exports');

    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    let output;
    let filename;

    switch (format.toLowerCase()) {
      case 'solana':
        output = formatForSolana(users);
        filename = `distribution-solana-${timestamp}.json`;
        break;

      case 'evm':
      case 'polygon':
        output = formatForEVM(users);
        filename = `distribution-evm-${timestamp}.json`;
        break;

      case 'batch':
        output = formatForBatchProcessing(users);
        filename = `distribution-batch-${timestamp}.json`;
        break;

      case 'csv':
      default:
        // CSV simple
        const headers = ['Wallet', 'NUX Tokens', 'POL Bonus', 'Name', 'Email', 'Registered At'];
        const rows = users.map(u => [
          u.wallet,
          TOKENS_PER_USER,
          POL_BONUS_PER_USER,
          u.name || '',
          u.email || '',
          u.createdAt?.toString() || '',
        ]);

        output = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = `distribution-${timestamp}.csv`;
        break;
    }

    // Guardar archivo
    const filepath = path.join(exportDir, filename);
    const content = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
    fs.writeFileSync(filepath, content);

    console.log(chalk.cyan('='.repeat(60)));
    console.log(chalk.green(`\n✅ Archivo guardado: ${filepath}\n`));

    // Mostrar resumen
    console.log(chalk.white('📊 Resumen de distribución:'));
    console.log(chalk.gray(`  Total usuarios: ${users.length}`));
    console.log(chalk.gray(`  Total NUX: ${(users.length * TOKENS_PER_USER).toLocaleString()}`));
    console.log(chalk.gray(`  Total POL: ${users.length * POL_BONUS_PER_USER}`));
    console.log(chalk.gray(`  Formato: ${format.toUpperCase()}\n`));

    console.log(chalk.cyan('='.repeat(60) + '\n'));

  } catch (error) {
    console.error(chalk.red('❌ Error:'), error.message);
    process.exit(1);
  }
}

main();
