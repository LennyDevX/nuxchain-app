/**
 * Script para configurar la integración Treasury - SmartStaking
 * Ejecutar en tu proyecto Hardhat:
 * npx hardhat run CONFIGURE_TREASURY_INTEGRATION.js --network polygon
 */

const hre = require("hardhat");

// ✅ Addresses del deployment actual (Feb 16, 2026)
const STAKING_CORE_ADDRESS = "0x5F084a3E35eca396B5216d67D31CB0c8dcC22703";
const TREASURY_MANAGER_ADDRESS = "0x92BA711B203CF40bb6c5f7f509E0f48aa19e2cD9";

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════════════╗");
  console.log("║     TREASURY INTEGRATION CONFIGURATION SCRIPT                      ║");
  console.log("╚════════════════════════════════════════════════════════════════════╝\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("🔑 Deployer address:", deployer.address);
  console.log("💰 Balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "POL\n");

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Verificar estado actual
  // ═══════════════════════════════════════════════════════════════
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 1: Verificando configuración actual...\n");

  const stakingCore = await hre.ethers.getContractAt(
    "EnhancedSmartStakingCoreV2", 
    STAKING_CORE_ADDRESS
  );

  const treasuryManager = await hre.ethers.getContractAt(
    "TreasuryManager",
    TREASURY_MANAGER_ADDRESS
  );

  // Verificar treasuryManager en SmartStaking
  let currentTreasuryManager;
  try {
    currentTreasuryManager = await stakingCore.treasuryManager();
    console.log("✓ SmartStaking.treasuryManager():", currentTreasuryManager);
  } catch (error) {
    console.log("❌ Error leyendo treasuryManager:", error.message);
    currentTreasuryManager = hre.ethers.ZeroAddress;
  }

  // Verificar autorización en TreasuryManager
  let isAuthorized;
  try {
    isAuthorized = await treasuryManager.authorizedSources(STAKING_CORE_ADDRESS);
    console.log("✓ TreasuryManager.authorizedSources(SmartStaking):", isAuthorized);
  } catch (error) {
    console.log("❌ Error verificando autorización:", error.message);
    isAuthorized = false;
  }

  // Verificar balances
  const treasuryBalance = await hre.ethers.provider.getBalance(TREASURY_MANAGER_ADDRESS);
  const reserveStats = await treasuryManager.getReserveStats();
  
  console.log("\n📊 Estado del Treasury Manager:");
  console.log("   Total Balance:", hre.ethers.formatEther(treasuryBalance), "POL");
  console.log("   Reserve Balance:", hre.ethers.formatEther(reserveStats[0]), "POL");
  console.log("   Total Accumulated:", hre.ethers.formatEther(reserveStats[1]), "POL");
  console.log("   Allocation %:", (Number(reserveStats[3]) / 100).toFixed(2), "%");
  console.log("   Is Enabled:", reserveStats[4]);

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Determinar acciones necesarias
  // ═══════════════════════════════════════════════════════════════
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 2: Analizando configuración...\n");

  const needsSetTreasury = currentTreasuryManager.toLowerCase() !== TREASURY_MANAGER_ADDRESS.toLowerCase();
  const needsAuthorization = !isAuthorized;

  if (!needsSetTreasury && !needsAuthorization) {
    console.log("✅ ¡Todo está correctamente configurado!");
    console.log("\n💡 El Reserve Balance está en 0 POL porque:");
    console.log("   1. Los depósitos anteriores fueron antes de la configuración");
    console.log("   2. Solo NUEVOS depósitos incrementarán el reserve");
    console.log("\n🎯 Siguiente paso: Hacer un nuevo depósito de prueba (ej: 10 POL)");
    console.log("   y verificar que el Reserve Balance aumenta en ~0.12 POL (20% de 6% comisión)\n");
    return;
  }

  console.log("⚠️  Se requieren configuraciones:\n");
  if (needsSetTreasury) {
    console.log("   ❌ SmartStaking.treasuryManager NO configurado correctamente");
    console.log("      Actual:", currentTreasuryManager);
    console.log("      Esperado:", TREASURY_MANAGER_ADDRESS);
  } else {
    console.log("   ✅ SmartStaking.treasuryManager configurado correctamente");
  }

  if (needsAuthorization) {
    console.log("   ❌ SmartStaking NO autorizado en TreasuryManager");
  } else {
    console.log("   ✅ SmartStaking autorizado en TreasuryManager");
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Ejecutar configuraciones
  // ═══════════════════════════════════════════════════════════════
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 3: Ejecutando configuraciones necesarias...\n");

  // Configurar treasuryManager en SmartStaking
  if (needsSetTreasury) {
    console.log("🔧 Configurando SmartStaking.treasuryManager...");
    try {
      const tx1 = await stakingCore.setTreasuryManager(TREASURY_MANAGER_ADDRESS);
      console.log("   Tx hash:", tx1.hash);
      await tx1.wait();
      console.log("   ✅ SmartStaking.setTreasuryManager() exitoso\n");
    } catch (error) {
      console.log("   ❌ Error:", error.message);
      console.log("   💡 Verifica que tienes permisos ADMIN_ROLE\n");
    }
  }

  // Autorizar SmartStaking en TreasuryManager
  if (needsAuthorization) {
    console.log("🔧 Autorizando SmartStaking en TreasuryManager...");
    try {
      const tx2 = await treasuryManager.setAuthorizedSource(STAKING_CORE_ADDRESS, true);
      console.log("   Tx hash:", tx2.hash);
      await tx2.wait();
      console.log("   ✅ TreasuryManager.setAuthorizedSource() exitoso\n");
    } catch (error) {
      console.log("   ❌ Error:", error.message);
      console.log("   💡 Verifica que eres el owner del contrato\n");
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Verificación final
  // ═══════════════════════════════════════════════════════════════
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("STEP 4: Verificando configuración final...\n");

  const finalTreasuryManager = await stakingCore.treasuryManager();
  const finalIsAuthorized = await treasuryManager.authorizedSources(STAKING_CORE_ADDRESS);

  console.log("📊 Estado Final:");
  console.log("   SmartStaking.treasuryManager:", finalTreasuryManager);
  console.log("   TreasuryManager.authorizedSources:", finalIsAuthorized);

  if (finalTreasuryManager.toLowerCase() === TREASURY_MANAGER_ADDRESS.toLowerCase() && finalIsAuthorized) {
    console.log("\n✅ ¡¡CONFIGURACIÓN COMPLETA!!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎯 PRÓXIMOS PASOS:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n1. 🔄 Refresca el frontend (Ctrl+F5)");
    console.log("\n2. 💰 Haz un nuevo depósito de prueba (ej: 10 POL)");
    console.log("   • Comisión 6%: ~0.60 POL");
    console.log("   • Reserve 20%: ~0.12 POL");
    console.log("   • Distributable 80%: ~0.48 POL");
    console.log("\n3. ✓ Verifica en el frontend:");
    console.log("   • Reserve Balance debe mostrar ~0.12 POL");
    console.log("   • Treasury Pool Chart muestra allocations correctas");
    console.log("\n4. 🔍 (Opcional) Verifica en Polygonscan:");
    console.log("   TreasuryManager:", TREASURY_MANAGER_ADDRESS);
    console.log("   Busca evento 'RevenueReceived' después del depósito\n");
  } else {
    console.log("\n⚠️  Configuración incompleta. Revisa errores arriba.\n");
  }

  console.log("╚════════════════════════════════════════════════════════════════════╝\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error fatal:", error);
    process.exit(1);
  });
