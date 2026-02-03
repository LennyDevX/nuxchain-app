#!/usr/bin/env node

/**
 * Setup Script - Configuración inicial para el Airdrop Management
 * Ejecutar una sola vez para preparar el entorno
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.cyan.bold('\n🚀 Setup - Airdrop Management Script\n'));

// ============================================
// 1. Verificar Firebase Credentials
// ============================================

console.log(chalk.blue('📋 Paso 1: Verificando credenciales de Firebase...\n'));

const credentialsPath = path.join(__dirname, '../../../firebase-credentials.json');

if (fs.existsSync(credentialsPath)) {
  console.log(chalk.green('✅ Credenciales encontradas en:'));
  console.log(chalk.gray(`   ${credentialsPath}\n`));
} else {
  console.log(chalk.yellow('⚠️  Credenciales NO encontradas\n'));
  console.log(chalk.white('Para descargarlas:'));
  console.log(chalk.gray('  1. Ve a Firebase Console → nuxchain1'));
  console.log(chalk.gray('  2. Configuración del proyecto → Cuentas de servicio'));
  console.log(chalk.gray('  3. Haz clic en "Generar nueva clave privada" (JSON)'));
  console.log(chalk.gray(`  4. Coloca el archivo en: ${credentialsPath}\n`));
}

// ============================================
// 2. Crear directorio de exportación
// ============================================

console.log(chalk.blue('📋 Paso 2: Preparando directorio de exportación...\n'));

const exportDir = path.join(__dirname, 'airdrop-exports');

if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
  console.log(chalk.green('✅ Directorio creado en:'));
  console.log(chalk.gray(`   ${exportDir}\n`));
} else {
  console.log(chalk.green('✅ Directorio ya existe en:'));
  console.log(chalk.gray(`   ${exportDir}\n`));
}

// ============================================
// 3. Verificar dependencias
// ============================================

console.log(chalk.blue('📋 Paso 3: Verificando dependencias...\n'));

const dependencies = ['firebase-admin', 'json2csv', 'chalk'];
const packageJsonPath = path.join(__dirname, '../../../package.json');

try {
  const packageJson = require(packageJsonPath);
  const missing = [];

  dependencies.forEach(dep => {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies?.[dep]) {
      missing.push(dep);
    }
  });

  if (missing.length === 0) {
    console.log(chalk.green('✅ Todas las dependencias están instaladas\n'));
  } else {
    console.log(chalk.yellow(`⚠️  Faltan instalar: ${missing.join(', ')}\n`));
    console.log(chalk.white('Para instalar, ejecuta:'));
    console.log(chalk.cyan(`  npm install ${missing.join(' ')}\n`));
  }
} catch (error) {
  console.log(chalk.yellow('⚠️  No se pudo verificar package.json\n'));
}

// ============================================
// 4. Crear archivo .env (opcional)
// ============================================

console.log(chalk.blue('📋 Paso 4: Configuración de variables de entorno...\n'));

const envPath = path.join(__dirname, '../../../.env.airdrop');

if (!fs.existsSync(envPath)) {
  const envContent = `# Airdrop Configuration
FIREBASE_CREDENTIALS=${credentialsPath}

# Parámetros del Airdrop
AIRDROP_TOKENS_PER_USER=50000
AIRDROP_MAX_POOL=50000000
AIRDROP_MAX_USERS=1000
AIRDROP_POL_BONUS=20

# Firestore
FIRESTORE_COLLECTION=nuxchainAirdropRegistrations

# Rutas
EXPORT_DIR=./src/utils/scripts/airdrop-exports
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log(chalk.green('✅ Archivo .env.airdrop creado en:'));
  console.log(chalk.gray(`   ${envPath}\n`));
} else {
  console.log(chalk.green('✅ Archivo .env.airdrop ya existe\n'));
}

// ============================================
// 5. Mostrar resumen
// ============================================

console.log(chalk.cyan.bold('='.repeat(60)));
console.log(chalk.cyan.bold('📊 RESUMEN DE CONFIGURACIÓN'));
console.log(chalk.cyan.bold('='.repeat(60) + '\n'));

console.log(chalk.white('Estado de la instalación:'));
console.log(chalk.gray(`  • Credenciales Firebase: ${fs.existsSync(credentialsPath) ? chalk.green('✅') : chalk.red('❌')}`));
console.log(chalk.gray(`  • Directorio de exportación: ${chalk.green('✅')}`));
console.log(chalk.gray(`  • Archivo .env.airdrop: ${chalk.green('✅')}\n`));

console.log(chalk.white('Próximos pasos:'));
if (!fs.existsSync(credentialsPath)) {
  console.log(chalk.cyan('  1. Descarga las credenciales de Firebase'));
}
console.log(chalk.cyan('  2. Instala las dependencias (si falta alguna)'));
console.log(chalk.cyan('  3. Ejecuta: node src/utils/scripts/AirdropsWallet.js stats'));
console.log(chalk.cyan('  4. Lee README.md para más información\n'));

console.log(chalk.cyan.bold('='.repeat(60) + '\n'));

console.log(chalk.green.bold('✅ Setup completado! 🎉\n'));
