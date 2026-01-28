#!/usr/bin/env node

/**
 * Airdrop Management Script
 * Recolecta información de usuarios registrados en Firebase y facilita la distribución
 * 
 * Uso:
 *   node AirdropsWallet.js [comando]
 * 
 * Comandos:
 *   export      - Exportar todos los usuarios a CSV y JSON
 *   stats       - Mostrar estadísticas del airdrop
 *   validate    - Validar direcciones de wallet
 *   distribute  - Preparar datos para distribución
 *   list        - Listar todos los usuarios
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const chalk = require('chalk');

// ============================================
// CONFIGURACIÓN
// ============================================

const FIRESTORE_COLLECTION = 'nuxchainAirdropRegistrations';
const TOKENS_PER_USER = 50000;
const MAX_AIRDROP_POOL = 50000000;
const POL_BONUS_PER_USER = 20;
const OUTPUT_DIR = path.join(__dirname, 'airdrop-exports');

// Crear directorio de salida si no existe
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ============================================
// INICIALIZAR FIREBASE
// ============================================

function initializeFirebase() {
  try {
    // Buscar archivo de credenciales
    const credentialsPath = process.env.FIREBASE_CREDENTIALS || 
      path.join(__dirname, '../../../firebase-credentials.json');
    
    if (!fs.existsSync(credentialsPath)) {
      console.error(chalk.red('❌ Error: Archivo de credenciales de Firebase no encontrado'));
      console.error(chalk.yellow(`Buscar en: ${credentialsPath}`));
      console.error(chalk.yellow('Descarga las credenciales desde Firebase Console y colócalas en la raíz del proyecto'));
      process.exit(1);
    }

    const serviceAccount = require(credentialsPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log(chalk.green('✅ Firebase inicializado correctamente'));
    return admin.firestore();
  } catch (error) {
    console.error(chalk.red('❌ Error inicializando Firebase:'), error.message);
    process.exit(1);
  }
}

// ============================================
// FUNCIONES DE GESTIÓN
// ============================================

/**
 * Obtener todos los registros del airdrop
 */
async function getAllRegistrations(db) {
  try {
    console.log(chalk.blue('\n📥 Obteniendo registros del airdrop...'));
    
    const snapshot = await db.collection(FIRESTORE_COLLECTION).get();
    const registrations = [];

    snapshot.forEach(doc => {
      registrations.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt || new Date(),
      });
    });

    console.log(chalk.green(`✅ Se obtuvieron ${registrations.length} registros`));
    return registrations;
  } catch (error) {
    console.error(chalk.red('❌ Error obteniendo registros:'), error.message);
    throw error;
  }
}

/**
 * Validar direcciones de wallet
 */
function validateWallets(registrations) {
  const results = {
    valid: [],
    invalid: [],
    duplicates: [],
  };

  const walletMap = new Map();

  registrations.forEach((reg) => {
    const wallet = reg.wallet?.toLowerCase();
    
    // Validar formato
    if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
      results.invalid.push({
        ...reg,
        error: 'Formato de wallet inválido',
      });
      return;
    }

    // Detectar duplicados
    if (walletMap.has(wallet)) {
      results.duplicates.push({
        ...reg,
        error: 'Wallet duplicada',
        firstOccurrence: walletMap.get(wallet),
      });
      return;
    }

    walletMap.set(wallet, reg.id);
    results.valid.push(reg);
  });

  return results;
}

/**
 * Exportar a CSV
 */
function exportToCSV(registrations, filename = 'airdrop-users.csv') {
  try {
    const fields = [
      { label: 'ID Firebase', value: 'id' },
      { label: 'Nombre', value: 'name' },
      { label: 'Email', value: 'email' },
      { label: 'Wallet Address', value: 'wallet' },
      { label: 'Tokens NUX', value: () => TOKENS_PER_USER.toLocaleString() },
      { label: 'POL Bonus', value: () => POL_BONUS_PER_USER },
      { label: 'Total Value (NUX)', value: () => TOKENS_PER_USER.toLocaleString() },
      { label: 'Estado', value: (row) => row.status || 'pending' },
      { label: 'Fecha Registro', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(registrations);
    
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, csv);
    
    console.log(chalk.green(`✅ Exportado a CSV: ${filepath}`));
    return filepath;
  } catch (error) {
    console.error(chalk.red('❌ Error exportando CSV:'), error.message);
    throw error;
  }
}

/**
 * Exportar a JSON
 */
function exportToJSON(registrations, filename = 'airdrop-users.json') {
  try {
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(registrations, null, 2));
    console.log(chalk.green(`✅ Exportado a JSON: ${filepath}`));
    return filepath;
  } catch (error) {
    console.error(chalk.red('❌ Error exportando JSON:'), error.message);
    throw error;
  }
}

/**
 * Generar reporte de distribución
 */
function generateDistributionReport(registrations, validations) {
  try {
    const timestamp = new Date().toISOString().split('T')[0];
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalRegistrations: registrations.length,
        validWallets: validations.valid.length,
        invalidWallets: validations.invalid.length,
        duplicateWallets: validations.duplicates.length,
        airdropPool: {
          total: MAX_AIRDROP_POOL.toLocaleString(),
          tokensPerUser: TOKENS_PER_USER.toLocaleString(),
          maxUsers: Math.floor(MAX_AIRDROP_POOL / TOKENS_PER_USER),
        },
        distribution: {
          totalNUXTokens: (validations.valid.length * TOKENS_PER_USER).toLocaleString(),
          totalPOLBonus: (validations.valid.length * POL_BONUS_PER_USER).toLocaleString(),
          poolCapacity: `${((validations.valid.length / 1000) * 100).toFixed(2)}%`,
        },
      },
      validUsers: validations.valid.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        wallet: user.wallet,
        nuxTokens: TOKENS_PER_USER,
        polBonus: POL_BONUS_PER_USER,
        status: 'ready_for_distribution',
        createdAt: user.createdAt,
      })),
      invalidUsers: validations.invalid,
      duplicateWallets: validations.duplicates,
    };

    const filepath = path.join(OUTPUT_DIR, `airdrop-distribution-${timestamp}.json`);
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    
    console.log(chalk.green(`✅ Reporte de distribución: ${filepath}`));
    return filepath;
  } catch (error) {
    console.error(chalk.red('❌ Error generando reporte:'), error.message);
    throw error;
  }
}

/**
 * Mostrar estadísticas
 */
function showStatistics(registrations, validations) {
  console.log(chalk.cyan('\n' + '='.repeat(60)));
  console.log(chalk.cyan.bold('📊 ESTADÍSTICAS DEL AIRDROP'));
  console.log(chalk.cyan('='.repeat(60)));

  const totalRegistrations = registrations.length;
  const validWallets = validations.valid.length;
  const invalidWallets = validations.invalid.length;
  const duplicates = validations.duplicates.length;

  console.log(chalk.white(`
  Registros Totales:        ${chalk.yellow(totalRegistrations)}
  Wallets Válidas:          ${chalk.green(validWallets)}
  Wallets Inválidas:        ${chalk.red(invalidWallets)}
  Wallets Duplicadas:       ${chalk.red(duplicates)}
  
  Pool Máximo NUX:          ${chalk.cyan(MAX_AIRDROP_POOL.toLocaleString())}
  Tokens por Usuario:       ${chalk.cyan(TOKENS_PER_USER.toLocaleString())}
  POL Bonus por Usuario:    ${chalk.cyan(POL_BONUS_PER_USER)}
  
  NUX Total a Distribuir:   ${chalk.magenta((validWallets * TOKENS_PER_USER).toLocaleString())}
  POL Total a Distribuir:   ${chalk.magenta((validWallets * POL_BONUS_PER_USER).toLocaleString())}
  
  Capacidad del Pool:       ${chalk.blue(`${((validWallets / 1000) * 100).toFixed(2)}%`)} (${validWallets}/1000 usuarios)
  Slots Disponibles:        ${chalk.blue((1000 - validWallets).toLocaleString())}
  `));

  console.log(chalk.cyan('='.repeat(60) + '\n'));
}

/**
 * Listar usuarios
 */
function listUsers(registrations, validations, limit = 10) {
  console.log(chalk.cyan(`\n📋 Primeros ${limit} usuarios registrados:\n`));
  
  const users = validations.valid.slice(0, limit);
  
  users.forEach((user, index) => {
    console.log(chalk.white(`${index + 1}. ${user.name}`));
    console.log(chalk.gray(`   Email: ${user.email}`));
    console.log(chalk.gray(`   Wallet: ${user.wallet}`));
    console.log(chalk.gray(`   Registrado: ${new Date(user.createdAt).toLocaleString('es-ES')}`));
    console.log('');
  });

  if (registrations.length > limit) {
    console.log(chalk.yellow(`... y ${registrations.length - limit} usuarios más\n`));
  }
}

// ============================================
// COMANDOS
// ============================================

const commands = {
  async export(db) {
    const registrations = await getAllRegistrations(db);
    const validations = validateWallets(registrations);
    
    exportToCSV(validations.valid);
    exportToJSON(validations.valid);
    
    console.log(chalk.green('\n✅ Exportación completada\n'));
  },

  async stats(db) {
    const registrations = await getAllRegistrations(db);
    const validations = validateWallets(registrations);
    
    showStatistics(registrations, validations);
  },

  async validate(db) {
    const registrations = await getAllRegistrations(db);
    const validations = validateWallets(registrations);
    
    showStatistics(registrations, validations);

    if (validations.invalid.length > 0) {
      console.log(chalk.red(`\n⚠️  ${validations.invalid.length} wallets con formato inválido:\n`));
      validations.invalid.forEach((user) => {
        console.log(chalk.red(`  ❌ ${user.email} - ${user.wallet} (${user.error})`));
      });
    }

    if (validations.duplicates.length > 0) {
      console.log(chalk.red(`\n⚠️  ${validations.duplicates.length} wallets duplicadas:\n`));
      validations.duplicates.forEach((user) => {
        console.log(chalk.red(`  ❌ ${user.email} - ${user.wallet}`));
      });
    }
  },

  async distribute(db) {
    const registrations = await getAllRegistrations(db);
    const validations = validateWallets(registrations);
    
    generateDistributionReport(registrations, validations);
    showStatistics(registrations, validations);
    
    console.log(chalk.green('\n✅ Datos preparados para distribución\n'));
  },

  async list(db) {
    const registrations = await getAllRegistrations(db);
    const validations = validateWallets(registrations);
    
    listUsers(registrations, validations, 20);
    showStatistics(registrations, validations);
  },
};

// ============================================
// MAIN
// ============================================

async function main() {
  const command = process.argv[2] || 'stats';

  if (!commands[command]) {
    console.error(chalk.red(`\n❌ Comando no reconocido: ${command}\n`));
    console.log(chalk.cyan('Comandos disponibles:'));
    console.log(chalk.white('  export      - Exportar todos los usuarios a CSV y JSON'));
    console.log(chalk.white('  stats       - Mostrar estadísticas del airdrop'));
    console.log(chalk.white('  validate    - Validar direcciones de wallet'));
    console.log(chalk.white('  distribute  - Preparar datos para distribución'));
    console.log(chalk.white('  list        - Listar todos los usuarios\n'));
    process.exit(1);
  }

  try {
    const db = initializeFirebase();
    await commands[command](db);
    process.exit(0);
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

main();
