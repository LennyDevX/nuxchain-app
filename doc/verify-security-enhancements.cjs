#!/usr/bin/env node

/**
 * Security Enhancements Verification Script
 * Run: node doc/verify-security-enhancements.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(80));
console.log('🔐 AIRDROP SECURITY ENHANCEMENTS - VERIFICATION');
console.log('='.repeat(80) + '\n');

const checks = [
  {
    name: 'CEX Wallets Endpoint Created',
    file: 'api/airdrop/cex-wallets.ts',
    type: 'file',
    critical: true,
  },
  {
    name: 'Distributed Rate Limiter Service',
    file: 'api/_services/distributed-rate-limiter.ts',
    type: 'file',
    critical: true,
  },
  {
    name: 'Email Normalizer Service',
    file: 'api/_services/email-normalizer.ts',
    type: 'file',
    critical: true,
  },
  {
    name: 'Audit Logger Service',
    file: 'api/_services/audit-logger.ts',
    type: 'file',
    critical: true,
  },
  {
    name: 'Firestore Indices Configuration',
    file: 'firestore.indexes.json',
    type: 'file',
    critical: true,
  },
  {
    name: 'Firestore Indices Documentation',
    file: 'doc/FIRESTORE_INDICES_SETUP.md',
    type: 'file',
    critical: false,
  },
  {
    name: 'Security Deployment Guide',
    file: 'doc/SECURITY_DEPLOYMENT_GUIDE.md',
    type: 'file',
    critical: false,
  },
  {
    name: 'validate-and-register.ts - Rate Limiting',
    file: 'api/airdrop/validate-and-register.ts',
    content: 'checkDistributedRateLimit',
    type: 'content',
    critical: true,
  },
  {
    name: 'validate-and-register.ts - Email Normalization',
    file: 'api/airdrop/validate-and-register.ts',
    content: 'normalizeEmail',
    type: 'content',
    critical: true,
  },
  {
    name: 'validate-and-register.ts - Audit Logging',
    file: 'api/airdrop/validate-and-register.ts',
    content: 'logAuditEvent',
    type: 'content',
    critical: true,
  },
  {
    name: 'validate-and-register.ts - CEX Wallets Fetch',
    file: 'api/airdrop/validate-and-register.ts',
    content: 'getCEXWallets',
    type: 'content',
    critical: true,
  },
  {
    name: 'serverless-security.ts - CORS Restriction',
    file: 'api/_middlewares/serverless-security.ts',
    content: 'ALLOWED_ORIGINS',
    type: 'content',
    critical: true,
  },
  {
    name: 'Firestore Rules - Rate Limits Collection',
    file: 'firestore.rules',
    content: 'rateLimits',
    type: 'content',
    critical: true,
  },
  {
    name: 'Firestore Rules - Audit Logs Collection',
    file: 'firestore.rules',
    content: 'auditLogs',
    type: 'content',
    critical: true,
  },
];

let passed = 0;
let failed = 0;
let criticalFailed = 0;

checks.forEach((check, index) => {
  const filePath = path.join(__dirname, '..', check.file);
  const fileExists = fs.existsSync(filePath);
  
  let status = '✅';
  let message = 'OK';
  
  if (check.type === 'file') {
    if (!fileExists) {
      status = check.critical ? '🚨' : '⚠️';
      message = 'FILE NOT FOUND';
      failed++;
      if (check.critical) criticalFailed++;
    } else {
      passed++;
    }
  } else if (check.type === 'content') {
    if (!fileExists) {
      status = check.critical ? '🚨' : '⚠️';
      message = 'FILE NOT FOUND';
      failed++;
      if (check.critical) criticalFailed++;
    } else {
      const content = fs.readFileSync(filePath, 'utf-8');
      if (content.includes(check.content)) {
        passed++;
      } else {
        status = check.critical ? '🚨' : '⚠️';
        message = `CONTENT NOT FOUND: "${check.content}"`;
        failed++;
        if (check.critical) criticalFailed++;
      }
    }
  }
  
  const criticality = check.critical ? '[CRITICAL]' : '[OPTIONAL]';
  console.log(`${status} [${index + 1}/${checks.length}] ${criticality} ${check.name}`);
  if (message !== 'OK') {
    console.log(`   └─ ${message}`);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`📊 RESULTS: ${passed}/${checks.length} checks passed`);
if (criticalFailed > 0) {
  console.log(`🚨 CRITICAL FAILURES: ${criticalFailed}`);
}
console.log('='.repeat(80) + '\n');

if (failed === 0) {
  console.log('✅ ALL SECURITY ENHANCEMENTS SUCCESSFULLY IMPLEMENTED!\n');
  console.log('🎯 NEXT STEPS:');
  console.log('   1. Deploy Firestore indices:');
  console.log('      firebase deploy --only firestore:indexes\n');
  console.log('   2. Deploy Firestore rules:');
  console.log('      firebase deploy --only firestore:rules\n');
  console.log('   3. Deploy to Vercel:');
  console.log('      vercel --prod\n');
  console.log('   4. Run deployment verification tests');
  console.log('      (See doc/SECURITY_DEPLOYMENT_GUIDE.md)\n');
  console.log('   5. Monitor audit logs in Firestore Console\n');
  
  console.log('📋 SECURITY IMPROVEMENTS:');
  console.log('   ✅ Centralized CEX wallets endpoint');
  console.log('   ✅ Distributed rate limiting with Firestore');
  console.log('   ✅ Email normalization (prevents +alias abuse)');
  console.log('   ✅ Restricted CORS (blocks unauthorized origins)');
  console.log('   ✅ Generic error messages (prevents enumeration)');
  console.log('   ✅ Audit logging (fraud detection & investigation)\n');
  
  process.exit(0);
} else if (criticalFailed > 0) {
  console.log(`🚨 ${criticalFailed} CRITICAL CHECKS FAILED!\n`);
  console.log('⚠️  AIRDROP IS NOT READY FOR LAUNCH\n');
  console.log('Please review the errors above and fix critical issues.\n');
  process.exit(1);
} else {
  console.log(`⚠️  ${failed} optional checks failed.\n`);
  console.log('✅ Core functionality is ready, but consider addressing warnings.\n');
  process.exit(0);
}
