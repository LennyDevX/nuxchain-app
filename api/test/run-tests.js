#!/usr/bin/env node

/**
 * 🚀 PRODUCTION TEST SUITE RUNNER
 * 
 * Ejecuta la suite completa de tests de producción
 * Run: node api/test/run-tests.js
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('\n🚀 NUXCHAIN PRODUCTION TEST SUITE\n');
console.log('═'.repeat(80));

const tests = [
  {
    name: 'Comprehensive Chat Test',
    file: 'comprehensive-chat-test.js',
    desc: 'Sistema de validación de chat completo'
  },
  {
    name: 'Production Readiness Test',
    file: 'e2e/production-ready.test.js',
    desc: 'Validación de readiness para producción'
  }
];

let totalPassed = 0;
let totalFailed = 0;

console.log('\n📊 Test Configuration:');
console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`   API Key: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`   Tests: ${tests.length} suites\n`);

for (let i = 0; i < tests.length; i++) {
  const test = tests[i];
  const testPath = resolve(__dirname, test.file);
  
  console.log(`\n[${i + 1}/${tests.length}] ${test.name}`);
  console.log(`   📝 ${test.desc}`);
  console.log('   ⏳ Running...\n');
  
  try {
    execSync(`node "${testPath}"`, {
      stdio: 'inherit',
      cwd: __dirname,
      timeout: 300000 // 5 minutos timeout
    });
    
    console.log(`\n✅ ${test.name} PASSED`);
    totalPassed++;
  } catch (error) {
    console.log(`\n❌ ${test.name} FAILED`);
    totalFailed++;
  }
}

console.log('\n' + '═'.repeat(80));
console.log('\n📊 TEST SUMMARY\n');
console.log(`Total Tests: ${tests.length}`);
console.log(`✅ Passed: ${totalPassed}`);
console.log(`❌ Failed: ${totalFailed}`);

const successRate = tests.length > 0 ? ((totalPassed / tests.length) * 100).toFixed(1) : 0;
console.log(`📈 Success Rate: ${successRate}%\n`);

console.log('═'.repeat(80));

if (totalFailed === 0) {
  console.log('\n✅ ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!\n');
  console.log('🚀 Your Nuxchain Chat System is ready for deployment to production.');
  console.log('   • All components are functioning correctly');
  console.log('   • All security validations passed');
  console.log('   • Performance is within acceptable limits\n');
  process.exit(0);
} else {
  console.log('\n❌ SOME TESTS FAILED - DO NOT DEPLOY\n');
  console.log('⚠️  Fix the issues above before deploying to production.\n');
  process.exit(1);
}
