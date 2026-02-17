/**
 * VERIFY VIEW CONTRACT CONFIGURATION
 * 
 * This script verifies that the EnhancedSmartStakingView contract
 * is properly configured and can read data from the Core contract.
 * 
 * Usage: npx hardhat run scripts/verify-view-contract.js --network polygon
 */

const hre = require("hardhat");

async function main() {
  console.log("\n🔍 VERIFYING VIEW CONTRACT CONFIGURATION\n");
  console.log("═".repeat(60));

  // Contract addresses from .env
  const CORE_ADDRESS = process.env.VITE_ENHANCED_SMARTSTAKING_ADDRESS;
  const VIEW_ADDRESS = process.env.VITE_ENHANCED_SMARTSTAKING_VIEWER_ADDRESS;
  
  // Get signer (your wallet)
  const [signer] = await hre.ethers.getSigners();
  const userAddress = signer.address;

  console.log("📋 Configuration:");
  console.log(`   Core Address: ${CORE_ADDRESS}`);
  console.log(`   View Address: ${VIEW_ADDRESS}`);
  console.log(`   User Address: ${userAddress}`);
  console.log("═".repeat(60));

  // Load contracts
  const viewContract = await hre.ethers.getContractAt(
    "EnhancedSmartStakingView",
    VIEW_ADDRESS
  );

  const coreContract = await hre.ethers.getContractAt(
    "EnhancedSmartStakingCoreV2",
    CORE_ADDRESS
  );

  // ══════════════ STEP 1: Check View → Core reference ══════════════
  console.log("\n✅ Step 1: Checking View contract configuration...");
  try {
    const viewStakingContract = await viewContract.stakingContract();
    console.log(`   View → stakingContract: ${viewStakingContract}`);
    
    if (viewStakingContract.toLowerCase() !== CORE_ADDRESS.toLowerCase()) {
      console.log("   ❌ MISMATCH! View contract pointing to wrong Core contract!");
      console.log(`   Expected: ${CORE_ADDRESS}`);
      console.log(`   Actual:   ${viewStakingContract}`);
      console.log("\n   🔧 TO FIX: Run this command as owner:");
      console.log(`   await viewContract.setStakingContract("${CORE_ADDRESS}")`);
      return;
    } else {
      console.log("   ✅ View contract correctly configured");
    }
  } catch (error) {
    console.log(`   ❌ Error checking View contract: ${error.message}`);
    return;
  }

  // ══════════════ STEP 2: Check user deposits in Core ══════════════
  console.log("\n✅ Step 2: Checking user deposits in Core contract...");
  try {
    const userInfo = await coreContract.getUserInfo(userAddress);
    const [totalStaked, pendingRewards, depositCount] = userInfo;
    
    console.log(`   Total Staked: ${hre.ethers.formatEther(totalStaked)} POL`);
    console.log(`   Pending Rewards: ${hre.ethers.formatEther(pendingRewards)} POL`);
    console.log(`   Deposit Count: ${depositCount}`);
    
    if (depositCount === 0n) {
      console.log("   ⚠️  No deposits found for this user");
      return;
    }

    // Get deposit details
    console.log("\n   Deposit Details:");
    for (let i = 0; i < Number(depositCount); i++) {
      const deposit = await coreContract.getUserDeposit(userAddress, i);
      const [amount, timestamp, lastClaimTime, lockupDuration] = deposit;
      
      const lockType = lockupDuration === 0n ? "Flexible" :
                       lockupDuration === 2592000n ? "30 Days" :
                       lockupDuration === 7776000n ? "90 Days" :
                       lockupDuration === 15552000n ? "180 Days" :
                       lockupDuration === 31536000n ? "365 Days" : "Custom";
      
      console.log(`   [${i}] ${hre.ethers.formatEther(amount)} POL (${lockType})`);
    }
  } catch (error) {
    console.log(`   ❌ Error checking Core contract: ${error.message}`);
    return;
  }

  // ══════════════ STEP 3: Test getEarningsBreakdown ══════════════
  console.log("\n✅ Step 3: Testing getEarningsBreakdown...");
  try {
    const breakdown = await viewContract.getEarningsBreakdown(userAddress);
    const [dailyEst, monthlyEst, annualEst] = breakdown;
    
    console.log(`   Daily Estimated: ${hre.ethers.formatEther(dailyEst)} POL`);
    console.log(`   Monthly Estimated: ${hre.ethers.formatEther(monthlyEst)} POL`);
    console.log(`   Annual Estimated: ${hre.ethers.formatEther(annualEst)} POL`);
    
    if (dailyEst === 0n && monthlyEst === 0n && annualEst === 0n) {
      console.log("   ⚠️  All estimates are ZERO!");
      console.log("   This suggests the View contract cannot calculate rewards properly.");
      
      // Additional diagnostics
      console.log("\n   🔍 Diagnostics:");
      const rewards = await coreContract.calculateRewards(userAddress);
      console.log(`   calculateRewards (Core): ${hre.ethers.formatEther(rewards)} POL`);
      
      if (rewards > 0n) {
        console.log("   ℹ️  Core contract CAN calculate rewards.");
        console.log("   ℹ️  Issue is likely in View contract's getEarningsBreakdown logic.");
        console.log("   ℹ️  Possible cause: Deposits are too recent (avgTimeLapsed is very small).");
      } else {
        console.log("   ℹ️  Core contract also returns 0 rewards.");
        console.log("   ℹ️  Possible causes:");
        console.log("      - Deposits are brand new (no time elapsed)");
        console.log("      - Rewards module not properly configured");
        console.log("      - APY settings are 0");
      }
    } else {
      console.log("   ✅ Earnings breakdown working correctly");
    }
  } catch (error) {
    console.log(`   ❌ Error testing getEarningsBreakdown: ${error.message}`);
  }

  // ══════════════ STEP 4: Test getUserRewardsProjection ══════════════
  console.log("\n✅ Step 4: Testing getUserRewardsProjection...");
  try {
    const projection = await viewContract.getUserRewardsProjection(userAddress);
    
    console.log("   Projection Data:");
    console.log(`   Hourly: ${hre.ethers.formatEther(projection.hourlyRewards)} POL`);
    console.log(`   Daily: ${hre.ethers.formatEther(projection.dailyRewards)} POL`);
    console.log(`   Weekly: ${hre.ethers.formatEther(projection.weeklyRewards)} POL`);
    console.log(`   Monthly: ${hre.ethers.formatEther(projection.monthlyRewards)} POL`);
    console.log(`   Yearly: ${hre.ethers.formatEther(projection.yearlyRewards)} POL`);
    console.log(`   Current Pending: ${hre.ethers.formatEther(projection.currentPendingRewards)} POL`);
    
    if (projection.dailyRewards === 0n) {
      console.log("   ⚠️  Projection shows ZERO rewards!");
    } else {
      console.log("   ✅ Projection working correctly");
    }
  } catch (error) {
    console.log(`   ❌ Error testing getUserRewardsProjection: ${error.message}`);
  }

  // ══════════════ STEP 5: Check APY settings ══════════════
  console.log("\n✅ Step 5: Checking APY settings in Core...");
  try {
    const baseAPY = await coreContract.baseAPY();
    console.log(`   Base APY: ${Number(baseAPY) / 100}%`);
    
    const tiers = [
      { name: "30 Days", value: await coreContract.lockupBonuses(0) },
      { name: "90 Days", value: await coreContract.lockupBonuses(1) },
      { name: "180 Days", value: await coreContract.lockupBonuses(2) },
      { name: "365 Days", value: await coreContract.lockupBonuses(3) },
    ];
    
    console.log("   Lockup Bonuses:");
    tiers.forEach(tier => {
      console.log(`   ${tier.name}: +${Number(tier.value) / 100}%`);
    });
    
    if (baseAPY === 0n) {
      console.log("   ❌ Base APY is ZERO! This is the problem.");
      console.log("   🔧 Set base APY: await coreContract.setBaseAPY(1970) // 19.7%");
    } else {
      console.log("   ✅ APY settings configured");
    }
  } catch (error) {
    console.log(`   ⚠️  Could not check APY settings: ${error.message}`);
  }

  console.log("\n" + "═".repeat(60));
  console.log("✅ VERIFICATION COMPLETE");
  console.log("═".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
