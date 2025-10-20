#!/usr/bin/env node

/**
 * 🚀 SIMPLE TEST RUNNER
 * Ejecuta los tests sin problemas de encoding
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { execSync } from 'child_process';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

console.log('='.repeat(80));
console.log('NUXCHAIN PRODUCTION TEST SUITE');
console.log('='.repeat(80));

const tests = [
  { name: 'Comprehensive Chat Test', file: 'comprehensive-chat-test.js' },
  { name: 'Production Readiness Test', file: 'production-ready.test.js' }
];

let passed = 0;
let failed = 0;

for (let i = 0; i < tests.length; i++) {
  const test = tests[i];
  console.log(`\n[${i + 1}/${tests.length}] Running: ${test.name}...`);
  
  try {
    const result = execSync(`node "${resolve(__dirname, test.file)}"`, {
      stdio: ['pipe', 'pipe', 'pipe'],
      encoding: 'utf-8',
      timeout: 300000
    });
    
    console.log(`[PASS] ${test.name} completed successfully`);
    passed++;
  } catch (error) {
    if (error.status === 0) {
      console.log(`[PASS] ${test.name} passed`);
      passed++;
    } else {
      console.log(`[FAIL] ${test.name} failed with exit code ${error.status}`);
      failed++;
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(80));

process.exit(failed > 0 ? 1 : 0);
