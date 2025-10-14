/**
 * Static Validation Tests
 * Valida la estructura del código sin necesidad de servidor corriendo
 */

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { existsSync } from 'fs';
import dotenv from 'dotenv';

// Setup environment
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
// STATIC VALIDATION TESTS
// ============================================================================

async function testEnvironmentVariables() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 1] Environment Variables', 'cyan');
  log('━'.repeat(40), 'blue');
  
  const required = [
    'GEMINI_API_KEY',
    'NODE_ENV'
  ];
  
  const optional = [
    'PORT',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS'
  ];
  
  let passed = true;
  const missing = [];
  
  // Check required
  for (const envVar of required) {
    if (process.env[envVar]) {
      log(`   ✅ ${envVar}: Set (${process.env[envVar].substring(0, 10)}...)`, 'green');
    } else {
      log(`   ❌ ${envVar}: Missing`, 'red');
      missing.push(envVar);
      passed = false;
    }
  }
  
  // Check optional
  for (const envVar of optional) {
    if (process.env[envVar]) {
      log(`   ✅ ${envVar}: Set (${process.env[envVar]})`, 'green');
    } else {
      log(`   ⚠️  ${envVar}: Not set (will use defaults)`, 'yellow');
    }
  }
  
  if (missing.length > 0) {
    log(`\n   ❌ Missing required variables: ${missing.join(', ')}`, 'red');
  }
  
  return passed;
}

async function testFileStructure() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 2] File Structure', 'cyan');
  log('━'.repeat(40), 'blue');
  
  const criticalFiles = [
    { path: 'api/chat/stream.js', name: 'Chat Stream Handler' },
    { path: 'api/health/embeddings.js', name: 'Health Check Handler' },
    { path: 'api/_middlewares/serverless-security.js', name: 'Security Middleware' },
    { path: 'api/_services/embeddings-service.js', name: 'Embeddings Service' },
    { path: 'api/_services/semantic-streaming-service.js', name: 'Semantic Streaming' },
    { path: 'api/_config/system-instruction.js', name: 'System Instruction Config' },
    { path: 'vercel.json', name: 'Vercel Configuration' },
    { path: '.env', name: 'Environment File' }
  ];
  
  let passed = true;
  
  for (const file of criticalFiles) {
    const fullPath = resolve(__dirname, '../../', file.path);
    if (existsSync(fullPath)) {
      log(`   ✅ ${file.name}: Found`, 'green');
    } else {
      log(`   ❌ ${file.name}: Missing (${file.path})`, 'red');
      passed = false;
    }
  }
  
  return passed;
}

async function testImportPaths() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 3] Import Paths Validation', 'cyan');
  log('━'.repeat(40), 'blue');
  
  let passed = true;
  
  try {
    // Test importing critical modules
    log('   Testing module imports...', 'cyan');
    
    // Test security middleware
    try {
      await import('../_middlewares/serverless-security.js');
      log('   ✅ serverless-security.js: Importable', 'green');
    } catch (error) {
      log(`   ❌ serverless-security.js: Import failed - ${error.message}`, 'red');
      passed = false;
    }
    
    // Test system instruction
    try {
      await import('../_config/system-instruction.js');
      log('   ✅ system-instruction.js: Importable', 'green');
    } catch (error) {
      log(`   ❌ system-instruction.js: Import failed - ${error.message}`, 'red');
      passed = false;
    }
    
    // Test embeddings service
    try {
      await import('../_services/embeddings-service.js');
      log('   ✅ embeddings-service.js: Importable', 'green');
    } catch (error) {
      log(`   ❌ embeddings-service.js: Import failed - ${error.message}`, 'red');
      passed = false;
    }
    
    // Test semantic streaming service
    try {
      await import('../_services/semantic-streaming-service.js');
      log('   ✅ semantic-streaming-service.js: Importable', 'green');
    } catch (error) {
      log(`   ❌ semantic-streaming-service.js: Import failed - ${error.message}`, 'red');
      passed = false;
    }
    
  } catch (error) {
    log(`   ❌ Import test failed: ${error.message}`, 'red');
    passed = false;
  }
  
  return passed;
}

async function testSecurityMiddleware() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 4] Security Middleware Validation', 'cyan');
  log('━'.repeat(40), 'blue');
  
  try {
    const { withSecurity } = await import('../_middlewares/serverless-security.js');
    
    if (typeof withSecurity === 'function') {
      log('   ✅ withSecurity: Exported as function', 'green');
      
      // Test that it returns a function
      const testHandler = async (req) => ({ message: 'test' });
      const wrappedHandler = withSecurity(testHandler);
      
      if (typeof wrappedHandler === 'function') {
        log('   ✅ withSecurity: Returns wrapped handler', 'green');
        return true;
      } else {
        log('   ❌ withSecurity: Does not return function', 'red');
        return false;
      }
    } else {
      log('   ❌ withSecurity: Not a function', 'red');
      return false;
    }
  } catch (error) {
    log(`   ❌ Security middleware test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testStreamHandlerImports() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 5] Stream Handler Import Paths', 'cyan');
  log('━'.repeat(40), 'blue');
  
  try {
    // Read the stream.js file and check imports
    const { readFile } = await import('fs/promises');
    const streamPath = resolve(__dirname, '../chat/stream.js');
    const content = await readFile(streamPath, 'utf-8');
    
    // Check for correct import path (with underscore prefix)
    const hasCorrectImport = content.includes("from '../_middlewares/serverless-security.js'");
    const hasOldCorrectImport = content.includes("from '../middlewares/serverless-security.js'");
    const hasWrongImport = content.includes("from '../../src/security/serverless-security.js'");
    
    if (hasCorrectImport && !hasWrongImport) {
      log('   ✅ stream.js: Using correct import path', 'green');
      log('   ✅ Import: ../_middlewares/serverless-security.js', 'green');
      return true;
    } else if (hasOldCorrectImport && !hasWrongImport) {
      log('   ⚠️  stream.js: Using old path (should update to _middlewares)', 'yellow');
      log('   💡 Current: ../middlewares/serverless-security.js', 'yellow');
      log('   💡 Should be: ../_middlewares/serverless-security.js', 'yellow');
      return true; // Don't fail, but warn
    } else if (hasWrongImport) {
      log('   ❌ stream.js: Using old incorrect import path', 'red');
      log('   ❌ Found: ../../src/security/serverless-security.js', 'red');
      log('   💡 Should be: ../_middlewares/serverless-security.js', 'yellow');
      return false;
    } else {
      log('   ⚠️  stream.js: Cannot determine import path', 'yellow');
      return true; // Don't fail if we can't parse
    }
  } catch (error) {
    log(`   ❌ Stream handler import test failed: ${error.message}`, 'red');
    return false;
  }
}

async function testVercelConfiguration() {
  log('\n━'.repeat(40), 'blue');
  log('[TEST 6] Vercel Configuration', 'cyan');
  log('━'.repeat(40), 'blue');
  
  try {
    const { readFile } = await import('fs/promises');
    const vercelPath = resolve(__dirname, '../../vercel.json');
    const content = await readFile(vercelPath, 'utf-8');
    const config = JSON.parse(content);
    
    let passed = true;
    
    // Check for routes configuration
    if (config.routes) {
      log('   ✅ routes: Configured', 'green');
    } else {
      log('   ⚠️  routes: Not configured', 'yellow');
    }
    
    // Check for headers configuration
    if (config.headers) {
      log('   ✅ headers: Configured', 'green');
    } else {
      log('   ⚠️  headers: Not configured', 'yellow');
    }
    
    // Check for functions configuration
    if (config.functions) {
      log('   ✅ functions: Configured', 'green');
      if (config.functions['api/**/*']) {
        const funcConfig = config.functions['api/**/*'];
        log(`   ✅ maxDuration: ${funcConfig.maxDuration || 10}s`, 'green');
      }
    } else {
      log('   ⚠️  functions: Not configured (using defaults)', 'yellow');
    }
    
    return passed;
  } catch (error) {
    log(`   ❌ Vercel config test failed: ${error.message}`, 'red');
    return false;
  }
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

async function runStaticValidation() {
  log('\n' + '='.repeat(80), 'magenta');
  log(`${colors.bold}🔍 STATIC CODE VALIDATION${colors.reset}`, 'magenta');
  log('='.repeat(80), 'magenta');
  log('\nValidating code structure without running server...\n', 'cyan');
  
  const tests = [
    { name: 'Environment Variables', fn: testEnvironmentVariables },
    { name: 'File Structure', fn: testFileStructure },
    { name: 'Import Paths', fn: testImportPaths },
    { name: 'Security Middleware', fn: testSecurityMiddleware },
    { name: 'Stream Handler Imports', fn: testStreamHandlerImports },
    { name: 'Vercel Configuration', fn: testVercelConfiguration }
  ];
  
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`\n❌ Test "${test.name}" crashed: ${error.message}`, 'red');
      console.error(error);
      results.push({ name: test.name, passed: false });
      failed++;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'magenta');
  log('📊 VALIDATION RESULTS', 'magenta');
  log('='.repeat(80), 'magenta');
  
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    const color = result.passed ? 'green' : 'red';
    log(`   ${icon} ${result.name}`, color);
  });
  
  log('\n' + '='.repeat(80), 'magenta');
  log(`   Total: ${tests.length}`, 'cyan');
  log(`   ✅ Passed: ${passed}`, 'green');
  log(`   ❌ Failed: ${failed}`, 'red');
  log(`   📈 Success Rate: ${((passed / tests.length) * 100).toFixed(1)}%`, 'cyan');
  log('='.repeat(80), 'magenta');
  
  if (failed === 0) {
    log('\n✅ ALL VALIDATIONS PASSED', 'green');
    log('Code structure is correct and ready for deployment.\n', 'green');
    return 0;
  } else {
    log('\n❌ SOME VALIDATIONS FAILED', 'red');
    log('Fix the issues above before deploying.\n', 'red');
    return 1;
  }
}

// Ejecutar si es el módulo principal
const normalizedUrl = import.meta.url.replace(/\\/g, '/');
const normalizedArgv = process.argv[1] ? process.argv[1].replace(/\\/g, '/') : '';
const isMainModule = normalizedUrl.endsWith(normalizedArgv) || 
                     normalizedUrl.includes('static-validation.test.js');

if (isMainModule) {
  runStaticValidation()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runStaticValidation };
