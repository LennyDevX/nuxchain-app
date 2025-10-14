#!/usr/bin/env node

/**
 * Pre-Deploy Test Runner
 * Ejecuta todos los tests antes de permitir el deploy
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// ============================================================================
// CHECKS
// ============================================================================
async function checkEnvironment() {
  log('\n━'.repeat(80), 'blue');
  log('🔍 Environment Check', 'blue');
  log('━'.repeat(80), 'blue');
  
  const required = ['GEMINI_API_KEY'];
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    log(`\n❌ Missing required environment variables:`, 'red');
    missing.forEach(v => log(`   • ${v}`, 'red'));
    return false;
  }
  
  log('\n✅ All required environment variables present', 'green');
  return true;
}

async function checkDependencies() {
  log('\n━'.repeat(80), 'blue');
  log('📦 Dependencies Check', 'blue');
  log('━'.repeat(80), 'blue');
  
  try {
    // Verificar que los módulos críticos estén disponibles
    await import('../_services/embeddings-service.js');
    await import('../_services/semantic-streaming-service.js');
    await import('../_config/system-instruction.js');
    await import('../_middlewares/serverless-security.js');
    
    log('\n✅ All critical dependencies available', 'green');
    return true;
  } catch (error) {
    log(`\n❌ Dependency error: ${error.message}`, 'red');
    return false;
  }
}

async function runStaticValidation() {
  log('\n━'.repeat(80), 'blue');
  log('🧪 Static Code Validation', 'blue');
  log('━'.repeat(80), 'blue');
  
  try {
    const { runStaticValidation: validate } = await import('./static-validation.test.js');
    const exitCode = await validate();
    return exitCode === 0;
  } catch (error) {
    log(`\n❌ Validation error: ${error.message}`, 'red');
    console.error(error);
    return false;
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function runPreDeployChecks() {
  log('\n' + '='.repeat(80), 'magenta');
  log(`${colors.bold}🚀 PRE-DEPLOY CHECKS${colors.reset}`, 'magenta');
  log('='.repeat(80), 'magenta');
  log('\nValidating system before deployment...\n', 'cyan');
  
  const checks = [
    { name: 'Environment Variables', fn: checkEnvironment },
    { name: 'Dependencies', fn: checkDependencies },
    { name: 'Static Code Validation', fn: runStaticValidation }
  ];
  
  let allPassed = true;
  const results = [];
  
  for (const check of checks) {
    try {
      const passed = await check.fn();
      results.push({ name: check.name, passed });
      if (!passed) allPassed = false;
    } catch (error) {
      log(`\n❌ ${check.name} failed: ${error.message}`, 'red');
      results.push({ name: check.name, passed: false });
      allPassed = false;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'magenta');
  log('📊 PRE-DEPLOY CHECKS SUMMARY', 'magenta');
  log('='.repeat(80), 'magenta');
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`   ${icon} ${result.name}`, color);
  });
  
  log('\n' + '='.repeat(80), 'magenta');
  
  if (allPassed) {
    log('\n✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT', 'green');
    log('You can safely deploy to production.\n', 'green');
    return 0;
  } else {
    log('\n❌ SOME CHECKS FAILED - DO NOT DEPLOY', 'red');
    log('Fix the issues above before deploying.\n', 'red');
    return 1;
  }
}

// Ejecutar si es el módulo principal
// Normalizar rutas para Windows/Unix
const normalizedUrl = import.meta.url.replace(/\\/g, '/');
const normalizedArgv = process.argv[1].replace(/\\/g, '/');
const isMainModule = normalizedUrl.endsWith(normalizedArgv) || 
                     normalizedUrl.includes('pre-deploy.js');

if (isMainModule) {
  runPreDeployChecks()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runPreDeployChecks };
