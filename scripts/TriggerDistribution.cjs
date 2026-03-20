#!/usr/bin/env node
/**
 * TriggerDistribution.cjs
 *
 * Triggers the pending revenue distribution in the TreasuryManager contract.
 * Run this once the 7-day cycle window is open.
 *
 * Sub-treasury routing (already configured on-chain):
 *   REWARDS        0xEa481FB987d95F8a58730bBd89a91ef733f8C128  30%
 *   STAKING        0x2cda88046543be25a3EC4eA2d86dBe975Fda0028  25%
 *   COLLABORATORS  0xc9B1bf1ae921280f2f048fd3d893AF6D18E99C51  20%
 *   DEVELOPMENT    0x581a41c663223bae563134c67151cdc2c274f06a  15%
 *   MARKETPLACE    0xc8Af452F3842805Bc79bfFBBbDB9b130f222d9BC  10%
 *
 * Run:
 *   npx hardhat run scripts/TriggerDistribution.cjs --network polygon
 */

const { ethers } = require("hardhat");
const fs = require("fs");

// ── ABI (minimal — only what we need) ─────────────────────────────────────────

const TREASURY_MANAGER_ABI = [
  "function owner() view returns (address)",
  "function isDistributionReady() view returns (bool ready, uint256 timeUntilNext)",
  "function triggerDistribution() external",
  "function getStats() view returns (uint256 totalReceived, uint256 totalDist, uint256 currentBalance, uint256 availableBalance, uint256 lastDistribution, bool autoDistEnabled)",
  "function getTreasuryConfig(uint8 treasuryType) view returns (address treasuryAddress, uint256 allocation)",
];

// ── Sub-treasury map (for summary display) ────────────────────────────────────

const SUB_TREASURIES = [
  { label: "REWARDS",        bps: 3000, address: "0xEa481FB987d95F8a58730bBd89a91ef733f8C128" },
  { label: "STAKING",        bps: 2500, address: "0x2cda88046543be25a3EC4eA2d86dBe975Fda0028" },
  { label: "COLLABORATORS",  bps: 2000, address: "0xc9B1bf1ae921280f2f048fd3d893AF6D18E99C51" },
  { label: "DEVELOPMENT",    bps: 1500, address: "0x581a41c663223bae563134c67151cdc2c274f06a" },
  { label: "MARKETPLACE",    bps: 1000, address: "0xc8Af452F3842805Bc79bfFBBbDB9b130f222d9BC" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function hr(char = "─", len = 74) { return char.repeat(len); }

function pct(bps) { return (bps / 100).toFixed(0) + "%"; }

function formatTime(secs) {
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

async function getGasOpts(provider) {
  const fee = await provider.getFeeData();
  return {
    maxFeePerGas:         fee.maxFeePerGas         * 130n / 100n,
    maxPriorityFeePerGas: fee.maxPriorityFeePerGas * 130n / 100n,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // ── Load deployment address ──────────────────────────────────────────────
  const addressPath = "./deployments/polygon-addresses.json";
  let addresses;
  try {
    addresses = JSON.parse(fs.readFileSync(addressPath, "utf8"));
  } catch (err) {
    console.error("❌ Cannot load polygon-addresses.json:", err.message);
    process.exit(1);
  }
  const TREASURY_MANAGER = addresses.treasury.manager;

  // ── Signer ────────────────────────────────────────────────────────────────
  const [signer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(signer.address);

  console.log("\n" + hr("═"));
  console.log("       TRIGGER DISTRIBUTION — Polygon Mainnet");
  console.log(hr("═"));
  console.log(`  Signer          : ${signer.address}`);
  console.log(`  Balance         : ${ethers.formatEther(balance)} POL`);
  console.log(`  TreasuryManager : ${TREASURY_MANAGER}`);
  console.log(hr("═") + "\n");

  const tm = new ethers.Contract(TREASURY_MANAGER, TREASURY_MANAGER_ABI, signer);

  // ── Ownership check ───────────────────────────────────────────────────────
  const owner = await tm.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error(`❌ Signer (${signer.address}) is not the owner (${owner}). Aborting.`);
    process.exit(1);
  }
  console.log("✅ Ownership verified\n");

  // ── Current state snapshot ────────────────────────────────────────────────
  console.log(hr("─"));
  console.log("  CURRENT STATE");
  console.log(hr("─"));

  const stats = await tm.getStats();
  const contractBalance  = ethers.formatEther(stats[2]);
  const availableBalance = ethers.formatEther(stats[3]);
  const totalReceived    = ethers.formatEther(stats[0]);
  const totalDistributed = ethers.formatEther(stats[1]);

  console.log(`  Contract balance  : ${contractBalance} POL`);
  console.log(`  Available balance : ${availableBalance} POL`);
  console.log(`  Total received    : ${totalReceived} POL`);
  console.log(`  Total distributed : ${totalDistributed} POL`);

  console.log("\n  Expected distribution:");
  const avail = Number(stats[3]);
  for (const st of SUB_TREASURIES) {
    const share = ethers.formatEther(BigInt(Math.floor(avail * st.bps / 10000)));
    console.log(`    ${st.label.padEnd(14)} ${st.address}  ${pct(st.bps)}  → ${share} POL`);
  }

  // ── Check if window is open ───────────────────────────────────────────────
  console.log("\n" + hr("─"));
  console.log("  DISTRIBUTION WINDOW CHECK");
  console.log(hr("─"));

  const [ready, timeUntilNext] = await tm.isDistributionReady();

  if (!ready) {
    const secsLeft = Number(timeUntilNext);
    console.log(`  🕐 Distribution window NOT yet open.`);
    console.log(`     Time remaining : ${formatTime(secsLeft)}`);
    console.log(`\n  ℹ️  Re-run this script once the window opens.`);
    console.log(`     Funds are safely held in the contract until then.\n`);
    return;
  }

  console.log(`  ✅ Distribution window is OPEN`);
  console.log(`  Available to distribute : ${availableBalance} POL\n`);

  if (stats[3] === 0n) {
    console.log("  ⚠️  Available balance is 0 — nothing to distribute. Aborting.");
    return;
  }

  // ── Verify sub-treasury addresses on-chain before sending ─────────────────
  console.log(hr("─"));
  console.log("  PRE-FLIGHT: VERIFYING SUB-TREASURY ADDRESSES");
  console.log(hr("─"));

  let configOk = true;
  for (let i = 0; i < SUB_TREASURIES.length; i++) {
    const [addr, alloc] = await tm.getTreasuryConfig(i);
    const expected = SUB_TREASURIES[i];
    const addrOk  = addr.toLowerCase() === expected.address.toLowerCase();
    const allocOk = Number(alloc) === expected.bps;
    const mark    = addrOk && allocOk ? "✅" : "❌";
    if (!addrOk || !allocOk) configOk = false;
    console.log(`  ${mark} ${expected.label.padEnd(14)} addr: ${addrOk ? "✅" : `GOT ${addr}`}   alloc: ${alloc} bps`);
  }

  if (!configOk) {
    console.error("\n  ❌ Sub-treasury configuration incomplete. Run SetupTreasurySubAddresses.cjs first.");
    process.exit(1);
  }
  console.log("\n  ✅ All sub-treasury addresses and allocations verified\n");

  // ── Trigger ───────────────────────────────────────────────────────────────
  console.log(hr("─"));
  console.log("  TRIGGERING DISTRIBUTION");
  console.log(hr("─"));

  const gasOpts = await getGasOpts(ethers.provider);
  process.stdout.write("  ⏳ Calling triggerDistribution() … ");

  try {
    const tx = await tm.triggerDistribution(gasOpts);
    process.stdout.write(`submitted, waiting for confirmation … `);
    const receipt = await tx.wait(1);
    console.log(`✅`);
    console.log(`\n  🎉 Distribution complete!`);
    console.log(`  Tx hash : ${receipt.hash}`);
    console.log(`  Polygonscan : https://polygonscan.com/tx/${receipt.hash}`);
  } catch (err) {
    console.log(`❌`);
    console.error(`  FAILED: ${err.message.split("\n")[0]}`);
    console.log("  💡 If the call reverted, check that sub-treasury addresses can receive POL (payable).");
    process.exit(1);
  }

  // ── Final snapshot ────────────────────────────────────────────────────────
  console.log("\n" + hr("─"));
  console.log("  POST-DISTRIBUTION STATE");
  console.log(hr("─"));

  const statsAfter = await tm.getStats();
  console.log(`  Contract balance  : ${ethers.formatEther(statsAfter[2])} POL`);
  console.log(`  Total distributed : ${ethers.formatEther(statsAfter[1])} POL`);
  console.log();
  console.log("  Polygonscan — TreasuryManager:");
  console.log(`  https://polygonscan.com/address/${TREASURY_MANAGER}#events`);
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ Fatal:", err.message ?? err);
    process.exit(1);
  });
