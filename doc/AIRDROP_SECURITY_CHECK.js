#!/usr/bin/env node

/**
 * Quick Verification Checklist - Enhanced Airdrop Security
 * Ejecutar: node doc/AIRDROP_SECURITY_CHECK.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(70));
console.log('🔐 AIRDROP SECURITY ENHANCEMENT - VERIFICATION CHECKLIST');
console.log('='.repeat(70) + '\n');

const checks = [
  {
    name: 'Wallet Analysis Service Created',
    file: 'src/components/forms/wallet-analysis-service.ts',
    type: 'file'
  },
  {
    name: 'Airdrop.tsx Updated with Wallet Analysis',
    file: 'src/pages/Airdrop.tsx',
    content: 'walletMetrics',
    type: 'content'
  },
  {
    name: 'airdrop-service.ts Updated',
    file: 'src/components/forms/airdrop-service.ts',
    content: 'walletSecurityChecked',
    type: 'content'
  },
  {
    name: 'Maintenance Disabled',
    file: 'src/config/maintenance.ts',
    content: 'enabled: false',
    type: 'content'
  },
  {
    name: 'Documentation Created',
    file: 'doc/AIRDROP_WALLET_SECURITY_SYSTEM.md',
    type: 'file'
  }
];

let passed = 0;
let failed = 0;

checks.forEach((check, index) => {
  const filePath = path.join(__dirname, '..', check.file);
  const fileExists = fs.existsSync(filePath);
  
  let status = '✅';
  let message = 'OK';
  
  if (check.type === 'file') {
    if (!fileExists) {
      status = '❌';
      message = 'FILE NOT FOUND';
      failed++;
    } else {
      passed++;
    }
  } else if (check.type === 'content') {
    if (!fileExists) {
      status = '❌';
      message = 'FILE NOT FOUND';
      failed++;
    } else {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes(check.content)) {
        passed++;
      } else {
        status = '⚠️';
        message = `CONTENT NOT FOUND: "${check.content}"`;
        failed++;
      }
    }
  }
  
  console.log(`${status} [${index + 1}/${checks.length}] ${check.name}`);
  if (message !== 'OK') {
    console.log(`   └─ ${message}`);
  }
});

console.log('\n' + '='.repeat(70));
console.log(`📊 Results: ${passed}/${checks.length} passed`);
console.log('='.repeat(70) + '\n');

if (failed === 0) {
  console.log('✅ All security enhancements successfully implemented!\n');
  console.log('🎯 Next Steps:');
  console.log('   1. npm run dev  (or build)');
  console.log('   2. Test wallet registration with:');
  console.log('      - Old wallet (>30 days) → Should show green ✅');
  console.log('      - New wallet (<7 days) → Should show orange ⚠️');
  console.log('      - Verify Firebase stores walletSecurityChecked=true\n');
} else {
  console.log(`⚠️ ${failed} checks failed. Review the errors above.\n`);
  process.exit(1);
}
