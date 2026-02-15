#!/usr/bin/env node

/**
 * Script para Extraer y Actualizar TODOS los ABIs desde Hardhat
 * 
 * Lee directamente los archivos generados por Hardhat:
 * - all-abis.json (contiene TODOS los ABIs compilados)
 * - abis-by-category.json (mismo contenido, organizado por categoría)
 * 
 * Uso:
 * ```bash
 * # Opción 1: Desde archivos en ../nuxchain-protocol
 * node scripts/update-abis-from-export.js ../nuxchain-protocol
 * 
 * # Opción 2: Usar los archivos locales en src/abi/
 * node scripts/update-abis-from-export.js
 * ```
 * 
 * Esto automáticamente:
 * 1. Lee all-abis.json
 * 2. Analiza todas las categorías
 * 3. Actualiza los ABIs existentes
 * 4. Crea nuevos ABIs automáticamente
 * 5. Genera un reporte detallado
 */

const fs = require('fs');
const path = require('path');

// Mapeo personalizado de contratos a carpetas específicas
// (para contratos que necesitan una ruta custom)
const CUSTOM_PATH_MAPPING = {
  // Contratos Principales
  'GameifiedMarketplaceProxy': 'GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json',
  
  // Smart Staking (agrupa todos en carpeta SmartStaking)
  'EnhancedSmartStaking': 'SmartStaking/EnhancedSmartStaking.json',
  'EnhancedSmartStakingRewards': 'SmartStaking/EnhancedSmartStakingRewards.json',
  'EnhancedSmartStakingSkills': 'SmartStaking/EnhancedSmartStakingSkills.json',
  'EnhancedSmartStakingGamification': 'SmartStaking/EnhancedSmartStakingGamification.json',
  'EnhancedSmartStakingView': 'SmartStaking/EnhancedSmartStakingView.json',
  
  // Otros
  'DynamicAPYCalculator': 'DynamicAPYCalculator.sol/DynamicAPYCalculator.json',
};

function loadJSONFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

function getAllAbisFromSource(sourcePath) {
  // Intenta cargar all-abis.json
  const allAbisPath = path.join(sourcePath, 'all-abis.json');
  return loadJSONFile(allAbisPath);
}

function getTargetPath(contractName, category) {
  // 1. Verifica si hay un mapeo personalizado
  if (CUSTOM_PATH_MAPPING[contractName]) {
    return CUSTOM_PATH_MAPPING[contractName];
  }

  // 2. Si la categoría existe, usa: category/ContractName.json
  // (Excepto para 'interfaces' que pueden agruparse diferente)
  if (category && category !== 'interfaces' && category !== 'errors') {
    return `${category}/${contractName}.json`;
  }

  // 3. Por defecto: ContractName/ContractName.json
  return `${contractName}/${contractName}.json`;
}

function updateABIsFromExportFiles(sourcePath) {
  // Obtener fuente de los ABIs
  const allAbis = getAllAbisFromSource(sourcePath);
  
  if (!allAbis) {
    console.error(`❌ No se pudo cargar: all-abis.json`);
    console.log(`   Buscó en: ${path.join(sourcePath, 'all-abis.json')}`);
    process.exit(1);
  }

  console.log(`🔍 Analizando ABIs en: ${sourcePath}\n`);
  console.log(`📦 ABIs encontrados: ${Object.keys(allAbis).length}\n`);

  // Analizar categorías
  const categoriesStat = {};
  for (const [name, data] of Object.entries(allAbis)) {
    const cat = data.category || 'uncategorized';
    categoriesStat[cat] = (categoriesStat[cat] || 0) + 1;
  }

  console.log(`📂 Distribuidos por categoría:`);
  for (const [cat, count] of Object.entries(categoriesStat)) {
    console.log(`   • ${cat.padEnd(20)} → ${count} contratos`);
  }
  console.log('');

  const results = {
    updated: [],
    created: [],
    errors: [],
    skipped: []
  };

  // Procesar cada ABI del archivo all-abis.json
  for (const [contractName, contractData] of Object.entries(allAbis)) {
    try {
      // Validar estructura básica
      if (!contractData.abi || !Array.isArray(contractData.abi)) {
        results.skipped.push({
          contractName,
          reason: 'Sin propiedad "abi" válida'
        });
        continue;
      }

      // Obtener categoría y ruta destino
      const category = contractData.category || 'uncategorized';
      const relativePath = getTargetPath(contractName, category);
      const destDir = path.join(__dirname, '../src/abi', path.dirname(relativePath));
      const destPath = path.join(__dirname, '../src/abi', relativePath);

      // Verificar si ya existe
      const fileExists = fs.existsSync(destPath);

      // Crear carpeta si no existe
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Crear artefacto simplificado
      const simplifiedArtifact = {
        _format: 'hh-sol-artifact-1',
        contractName: contractData.name || contractName,
        sourceName: contractData.source || '',
        abi: contractData.abi
      };

      // Guardar archivo
      fs.writeFileSync(
        destPath,
        JSON.stringify(simplifiedArtifact, null, 2),
        'utf8'
      );

      // Registrar resultado
      const status = fileExists ? 'updated' : 'created';
      const icon = fileExists ? '♻️ ' : '✨';
      
      results[status].push({
        contractName,
        category,
        path: relativePath,
        elements: contractData.abi.length
      });

      console.log(`${icon} ${contractName.padEnd(40)} [${category.padEnd(15)}] ${contractData.abi.length} elementos`);
      
    } catch (error) {
      results.errors.push({
        contractName,
        error: error.message
      });
      console.log(`❌ ${contractName.padEnd(40)} Error: ${error.message}`);
    }
  }

  return results;
}

function main() {
  // Obtener ruta de fuente (puede ser Hardhat project o local)
  let sourcePath = process.argv[2];

  if (!sourcePath) {
    // Usar local src/abi/ si no proporciona ruta
    console.log('\n📝 Uso: node scripts/update-abis-from-export.js [path-to-hardhat or src/abi location]');
    console.log('');
    console.log('Si no proporcionas ruta, intenta usar archivos en: src/abi/all-abis.json');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node scripts/update-abis-from-export.js ../nuxchain-protocol');
    console.log('  node scripts/update-abis-from-export.js  (usa archivos locales)');
    console.log('');
    
    // Intenta usar el archivo local
    sourcePath = path.resolve(__dirname, '../src/abi');
  }

  // Resolver ruta relativa
  if (!path.isAbsolute(sourcePath)) {
    sourcePath = path.resolve(process.cwd(), sourcePath);
  }

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Ruta no encontrada: ${sourcePath}`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(100));
  console.log('🔄 ACTUALIZANDO TODOS LOS ABIs\n');
  console.log('='.repeat(100) + '\n');

  const results = updateABIsFromExportFiles(sourcePath);

  // Mostrar resumen
  console.log('\n' + '='.repeat(100));
  console.log('📊 RESUMEN DE ACTUALIZACIÓN');
  console.log('='.repeat(100));
  console.log(`✨ Creados:       ${results.created.length.toString().padStart(4)}`);
  console.log(`♻️  Actualizados:  ${results.updated.length.toString().padStart(4)}`);
  console.log(`⏭️  Omitidos:      ${results.skipped.length.toString().padStart(4)}`);
  console.log(`❌ Errores:       ${results.errors.length.toString().padStart(4)}`);
  console.log('='.repeat(100));

  if (results.created.length > 0) {
    console.log('\n✨ NUEVOS ABIs CREADOS:');
    for (const { contractName, category, path: contractPath, elements } of results.created) {
      console.log(`   • ${contractName.padEnd(35)} [${category.padEnd(12)}] → ${contractPath}`);
    }
  }

  if (results.updated.length > 0) {
    console.log('\n♻️  ABIs ACTUALIZADOS:');
    for (const { contractName, category, path: contractPath, elements } of results.updated) {
      console.log(`   • ${contractName.padEnd(35)} [${category.padEnd(12)}] → ${contractPath}`);
    }
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  OMITIDOS (sin cambios):');
    for (const { contractName, reason } of results.skipped) {
      console.log(`   • ${contractName}: ${reason}`);
    }
  }

  if (results.errors.length > 0) {
    console.log('\n❌ CON ERRORES:');
    for (const { contractName, error } of results.errors) {
      console.log(`   • ${contractName}: ${error}`);
    }
  }

  // Estadísticas finales
  const total = results.created.length + results.updated.length;
  console.log('\n' + '='.repeat(100));
  console.log(`✅ TOTAL PROCESADOS: ${total} ABIs en ${Object.keys(CUSTOM_PATH_MAPPING).length} categorías`);
  console.log('='.repeat(100));

  if (total > 0) {
    console.log('\n✅ ¡Los ABIs han sido actualizados correctamente!');
    console.log('\n💡 Los nuevos ABIs están listos para usar en tu frontend.');
    console.log('');
    console.log('Próximos pasos:');
    console.log('  1. npm run dev');
    console.log('  2. Los cambios comenzarán a usarse automáticamente');
    console.log('  3. Ctrl+F5 en el navegador para forzar recarga de caché');
  } else if (results.skipped.length > 0) {
    console.log('\n⚠️  Se omitieron algunos ABIs (posiblemente sin estructura ABI válida)');
  } else {
    console.log('\n⚠️  No se procesaron ABIs. Verifica los errores arriba.');
  }

  console.log('');
}

main();
