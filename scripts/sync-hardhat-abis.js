#!/usr/bin/env node

/**
 * Script para Extraer y Actualizar ABIs desde Hardhat
 * 
 * Uso:
 * ```bash
 * node scripts/sync-hardhat-abis.js ../path-to-hardhat-project
 * ```
 * 
 * Esto:
 * 1. Lee los artefactos compilados de Hardhat
 * 2. Extrae solo la propiedad 'abi' (sin bytecode ni metadata)
 * 3. Los guarda en src/abi/ con la estructura correcta
 */

const fs = require('fs');
const path = require('path');

// Mapeo de contratos: [nombre en Hardhat] -> [ruta en frontend]
const CONTRACT_MAPPING = {
  // Contratos Principales
  'GameifiedMarketplaceProxy': { path: 'GameifiedMarketplaceProxy/GameifiedMarketplaceProxy.json' },
  'GameifiedMarketplaceCore': { path: 'MarketplaceCore/GameifiedMarketplaceCoreV1.json' },
  
  // Habilidades
  'IndividualSkills': { path: 'IndividualSkillsMarketplace/IndividualSkillsMarketplace.json' },
  'GameifiedMarketplaceSkills': { path: 'GameifiedMarketplaceSkillsV2/GameifiedMarketplaceSkillsV2.json' },
  'GameifiedMarketplaceQuests': { path: 'GameifiedMarketplaceQuests/GameifiedMarketplaceQuests.json' },
  'IndividualSkillsMarketplaceImpl': { path: 'IndividualSkillsMarketplaceImpl/IndividualSkillsMarketplaceImpl.json' },
  
  // Sistema de Niveles y Referidos
  'LevelingSystem': { path: 'LevelingSystem/LevelingSystem.json' },
  'ReferralSystem': { path: 'ReferralSystem/ReferralSystem.json' },
  
  // Smart Staking (módulos separados)
  'EnhancedSmartStaking': { path: 'SmartStaking/EnhancedSmartStaking.json' },
  'EnhancedSmartStakingRewards': { path: 'SmartStaking/EnhancedSmartStakingRewards.json' },
  'EnhancedSmartStakingSkills': { path: 'SmartStaking/EnhancedSmartStakingSkills.json' },
  'EnhancedSmartStakingGamification': { path: 'SmartStaking/EnhancedSmartStakingGamification.json' },
  'EnhancedSmartStakingView': { path: 'SmartStaking/EnhancedSmartStakingView.json' },
  
  // Utilidades
  'DynamicAPYCalculator': { path: 'DynamicAPYCalculator.sol/DynamicAPYCalculator.json' },
  'TreasuryManager': { path: 'TreasuryManager/TreasuryManager.json' },
  'CollaboratorBadgeRewards': { path: 'ColabRewards/CollaboratorBadgeRewards.json' }
};

function extractABIsFromHardhat(hardhatProjectPath) {
  const artifactsDir = path.join(hardhatProjectPath, 'artifacts', 'contracts');
  
  if (!fs.existsSync(artifactsDir)) {
    console.error(`❌ No se encontró: ${artifactsDir}`);
    console.log('   Asegúrate de que la ruta a tu proyecto Hardhat es correcta');
    process.exit(1);
  }

  console.log(`📦 Buscando artefactos en: ${artifactsDir}\n`);

  const results = {
    success: [],
    skipped: [],
    errors: []
  };

  // Buscar archivos .json en artifacts
  function findArtifacts(dir, contractName) {
    try {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (file === `${contractName}.json` && stat.isFile()) {
          return filePath;
        }
        
        if (stat.isDirectory() && !file.startsWith('.')) {
          const result = findArtifacts(filePath, contractName);
          if (result) return result;
        }
      }
    } catch (error) {
      // Ignorar errores de lectura
    }
    
    return null;
  }

  // Procesar cada contrato
  for (const [contractName, config] of Object.entries(CONTRACT_MAPPING)) {
    try {
      // Buscar el artefacto
      const artifactPath = findArtifacts(artifactsDir, contractName);
      
      if (!artifactPath) {
        results.skipped.push(contractName);
        console.log(`⏭️  ${contractName.padEnd(40)} - No encontrado`);
        continue;
      }

      // Leer el artefacto
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      
      if (!artifact.abi) {
        throw new Error('Sin propiedad "abi" en el artefacto');
      }

      // Crear la carpeta de destino si no existe
      const destDir = path.join(
        __dirname,
        '../src/abi',
        path.dirname(config.path)
      );
      
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Guardar solo el ABI (en formato completo del artefacto para compatibilidad)
      const destPath = path.join(
        __dirname,
        '../src/abi',
        config.path
      );

      // Crear un artefacto simplificado con solo lo necesario
      const simplifiedArtifact = {
        _format: artifact._format,
        contractName: artifact.contractName,
        sourceName: artifact.sourceName,
        abi: artifact.abi,
        // Incluir bytecode si existe (para contratos sin proxy)
        ...(artifact.bytecode && { bytecode: artifact.bytecode }),
        ...(artifact.deployedBytecode && { deployedBytecode: artifact.deployedBytecode })
      };

      fs.writeFileSync(
        destPath,
        JSON.stringify(simplifiedArtifact, null, 2),
        'utf8'
      );

      const abiLines = artifact.abi.length;
      results.success.push({ contractName, path: config.path, lines: abiLines });
      console.log(`✅ ${contractName.padEnd(40)} → ${config.path} (${abiLines} elementos ABI)`);
      
    } catch (error) {
      results.errors.push({ contractName, error: error.message });
      console.log(`❌ ${contractName.padEnd(40)} - Error: ${error.message}`);
    }
  }

  return results;
}

function main() {
  // Obtener ruta del proyecto Hardhat desde argumentos
  let hardhatPath = process.argv[2];

  if (!hardhatPath) {
    console.log('📝 Uso: node scripts/sync-hardhat-abis.js <path-to-hardhat-project>');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node scripts/sync-hardhat-abis.js ../nuxchain-protocol');
    console.log('  node scripts/sync-hardhat-abis.js /home/user/projects/smart-contracts');
    console.log('');
    process.exit(0);
  }

  // Resolver ruta relativa
  if (!path.isAbsolute(hardhatPath)) {
    hardhatPath = path.resolve(process.cwd(), hardhatPath);
  }

  if (!fs.existsSync(hardhatPath)) {
    console.error(`❌ Ruta no encontrada: ${hardhatPath}`);
    process.exit(1);
  }

  console.log('🔄 Sincronizando ABIs desde Hardhat...\n');
  console.log(`📂 Proyecto Hardhat: ${hardhatPath}\n`);

  const results = extractABIsFromHardhat(hardhatPath);

  // Mostrar resumen
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMEN');
  console.log('='.repeat(70));
  console.log(`✅ Actualizados: ${results.success.length}`);
  console.log(`⏭️  Omitidos:     ${results.skipped.length}`);
  console.log(`❌ Errores:      ${results.errors.length}`);
  console.log('='.repeat(70));

  if (results.success.length > 0) {
    console.log('\n✅ ABIs ACTUALIZADOS:');
    for (const { contractName, path: contractPath, lines } of results.success) {
      console.log(`   • ${contractName} (${lines} elementos)`);
    }
  }

  if (results.skipped.length > 0) {
    console.log('\n⏭️  NO ENCONTRADOS:');
    for (const contractName of results.skipped) {
      console.log(`   • ${contractName}`);
    }
  }

  if (results.errors.length > 0) {
    console.log('\n❌ CON ERRORES:');
    for (const { contractName, error } of results.errors) {
      console.log(`   • ${contractName}: ${error}`);
    }
  }

  console.log('\n✨ ¡Sincronización completada!');
  console.log('\n💡 Próximos pasos:');
  console.log('   1. Verifica que los ABIs se actualizaron correctamente');
  console.log('   2. Ejecuta: npm run dev');
  console.log('   3. Los cambios se reflejarán automáticamente en tu app');
}

main();
