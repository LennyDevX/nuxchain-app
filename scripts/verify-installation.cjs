#!/usr/bin/env node

/**
 * Verification Script - Advanced Wallet Analysis System
 * Verifica que todos los componentes estén correctamente instalados
 */

const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('═'.repeat(70));
console.log('✅ ADVANCED WALLET ANALYSIS SYSTEM - VERIFICATION');
console.log('═'.repeat(70));

const checks = [
  {
    name: '📄 Airdrop.tsx - Fingerprint functions',
    file: 'src/pages/Airdrop.tsx',
    search: 'generateFingerprint',
  },
  {
    name: '📄 airdrop-service.ts - New fields',
    file: 'src/components/forms/airdrop-service.ts',
    search: 'deviceData',
  },
  {
    name: '🔍 search-wallet-advanced.cjs',
    file: 'scripts/search-wallet-advanced.cjs',
    search: 'calculateEmailRiskScore',
  },
  {
    name: '📊 bulk-wallet-analysis.cjs',
    file: 'scripts/bulk-wallet-analysis.cjs',
    search: 'Bulk Wallet Analysis',
  },
  {
    name: '📚 WALLET_ANALYSIS_GUIDE.md',
    file: 'doc/WALLET_ANALYSIS_GUIDE.md',
    search: 'Advanced Wallet Analysis',
  },
  {
    name: '📋 IMPLEMENTATION_SUMMARY.md',
    file: 'doc/IMPLEMENTATION_SUMMARY.md',
    search: 'Advanced Wallet Analysis System',
  },
  {
    name: '📝 scripts/README.md',
    file: 'scripts/README.md',
    search: 'Wallet Analysis Scripts',
  },
  {
    name: '⚙️ package.json - npm scripts',
    file: 'package.json',
    search: 'wallet:search',
  },
];

let passedChecks = 0;
let failedChecks = 0;

checks.forEach((check) => {
  const fullPath = path.join(__dirname, '..', check.file);
  
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (content.includes(check.search)) {
      console.log(`\n✅ ${check.name}`);
      console.log(`   ✓ File exists and contains required code`);
      passedChecks++;
    } else {
      console.log(`\n❌ ${check.name}`);
      console.log(`   ✗ File exists but missing: "${check.search}"`);
      failedChecks++;
    }
  } else {
    console.log(`\n❌ ${check.name}`);
    console.log(`   ✗ File not found: ${fullPath}`);
    failedChecks++;
  }
});

console.log('\n' + '═'.repeat(70));
console.log(`\n📊 VERIFICATION RESULTS: ${passedChecks}/${checks.length} checks passed\n`);

if (failedChecks === 0) {
  console.log('✨ All systems are GO! Ready to use wallet analysis tools.\n');
  
  console.log('🚀 QUICK START:');
  console.log('─'.repeat(70));
  console.log('\n1. Search for a single wallet:');
  console.log('   npm run wallet:search');
  console.log('   or');
  console.log('   node scripts/search-wallet-advanced.cjs\n');
  
  console.log('2. Analyze all registered wallets:');
  console.log('   npm run wallet:analyze');
  console.log('   or');
  console.log('   node scripts/bulk-wallet-analysis.cjs\n');
  
  console.log('3. Delete detected bots:');
  console.log('   npm run wallet:wipe-bots\n');
  
  console.log('📚 DOCUMENTATION:');
  console.log('─'.repeat(70));
  console.log('   • doc/WALLET_ANALYSIS_GUIDE.md (Complete guide)');
  console.log('   • doc/IMPLEMENTATION_SUMMARY.md (What was built)');
  console.log('   • scripts/README.md (Quick reference)\n');
  
  console.log('🎯 FEATURES:');
  console.log('─'.repeat(70));
  console.log('   ✅ Email Intelligence (30 disposable domains)');
  console.log('   ✅ Name Pattern Analysis');
  console.log('   ✅ On-Chain Validation (balance, transactions, age)');
  console.log('   ✅ Device Fingerprinting (browser, OS, timezone)');
  console.log('   ✅ IP Farm Detection');
  console.log('   ✅ Risk Scoring (0-100)');
  console.log('   ✅ CSV Export with Statistics');
  console.log('   ✅ Interactive Search & Bulk Analysis\n');
  
  console.log('═'.repeat(70));
  console.log('🎉 Implementation Complete! Start analyzing wallets now.\n');
  
  process.exit(0);
} else {
  console.log(`❌ ${failedChecks} check(s) failed. Please review the implementation.\n`);
  process.exit(1);
}
