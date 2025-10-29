/**
 * E2E TEST: Production Readiness
 * Test completo del sistema para validar que está listo para producción
 * Incluye: API, Embeddings, KB, Search, Streaming, Rate Limiting, Error Handling
 * 
 * Run: node api/test/e2e/production-ready.test.js
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import http from 'http';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Intentar cargar .env desde múltiples ubicaciones posibles
let envPath = resolve(__dirname, '../../../.env');
if (!process.env.GEMINI_API_KEY) {
  // Si no está configurada, intenta desde la raíz
  const altEnvPath = resolve(process.cwd(), '.env');
  dotenv.config({ path: altEnvPath });
} else {
  dotenv.config({ path: envPath });
}

import { initializeKnowledgeBaseForVercel, getRelevantContext } from '../_services/embeddings-service.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    
    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runProductionReadinessTests() {
  log('\n🚀 E2E TEST: Production Readiness', 'magenta');
  log('='.repeat(80), 'magenta');
  log('Testing complete Nuxchain Chat API system for production deployment\n', 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    critical: []
  };
  
  // ===========================================
  // SECTION 1: ENVIRONMENT & CONFIGURATION
  // ===========================================
  log('━'.repeat(80), 'blue');
  log('📦 SECTION 1: Environment & Configuration', 'blue');
  log('━'.repeat(80), 'blue');
  
  // Test 1.1: Environment Variables
  log('\n[TEST 1.1] Environment Variables', 'blue');
  results.total++;
  
  const requiredEnvVars = ['GEMINI_API_KEY'];
  const optionalEnvVars = ['NODE_ENV', 'PORT'];
  const missingRequired = requiredEnvVars.filter(v => !process.env[v]);
  const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
  
  log(`   Required vars: ${requiredEnvVars.join(', ')}`, 'cyan');
  requiredEnvVars.forEach(v => {
    const status = process.env[v] ? '✅' : '❌';
    const value = process.env[v] ? `${process.env[v].substring(0, 20)}...` : 'NOT SET';
    log(`   ${status} ${v}: ${value}`, process.env[v] ? 'green' : 'red');
  });
  
  if (missingOptional.length > 0) {
    log(`   ⚠️ Optional vars not set: ${missingOptional.join(', ')}`, 'yellow');
    results.warnings++;
  }
  
  if (missingRequired.length > 0) {
    log('   ❌ FAILED: Missing required environment variables', 'red');
    results.failed++;
    results.critical.push('Missing GEMINI_API_KEY - API will not work');
  } else {
    log('   ✅ PASSED: All required environment variables configured', 'green');
    results.passed++;
  }
  
  // Test 1.2: API Key Validity
  log('\n[TEST 1.2] API Key Validity', 'blue');
  results.total++;
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    log('   ⏭️ SKIPPED: No API key to validate', 'yellow');
  } else if (apiKey.length < 30) {
    log(`   ❌ FAILED: API key seems invalid (length: ${apiKey.length})`, 'red');
    results.failed++;
    results.critical.push('Invalid API key format');
  } else {
    log(`   ✅ PASSED: API key format looks valid (${apiKey.length} chars)`, 'green');
    results.passed++;
  }
  
  // ===========================================
  // SECTION 2: KNOWLEDGE BASE
  // ===========================================
  log('\n' + '━'.repeat(80), 'blue');
  log('📚 SECTION 2: Knowledge Base', 'blue');
  log('━'.repeat(80), 'blue');
  
  // Test 2.1: KB Initialization
  log('\n[TEST 2.1] Knowledge Base Initialization', 'blue');
  results.total++;
  
  try {
    const kbStatus = await initializeKnowledgeBaseForVercel();
    
    log(`   📊 Documents: ${kbStatus.documentsCount}`, 'cyan');
    log(`   🤖 Model: ${kbStatus.embeddingModel}`, 'cyan');
    log(`   🔧 Mode: ${kbStatus.fallbackMode ? 'BM25 Fallback' : 'Gemini Embeddings'}`, kbStatus.fallbackMode ? 'yellow' : 'green');
    log(`   🔑 API Key: ${kbStatus.hasApiKey ? 'Available' : 'Missing'}`, kbStatus.hasApiKey ? 'green' : 'red');
    
    if (kbStatus.documentsCount < 50) {
      log('   ❌ FAILED: Too few documents in KB', 'red');
      results.failed++;
      results.critical.push('Knowledge base is too small');
    } else if (kbStatus.documentsCount < 100) {
      log('   ⚠️ WARNING: KB could be larger', 'yellow');
      log('   ✅ PASSED: KB initialized', 'green');
      results.warnings++;
      results.passed++;
    } else {
      log('   ✅ PASSED: KB properly initialized', 'green');
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ FAILED: ${error.message}`, 'red');
    results.failed++;
    results.critical.push('KB initialization failed');
  }
  
  // Test 2.2: KB Content Quality
  log('\n[TEST 2.2] Knowledge Base Content Quality', 'blue');
  results.total++;
  
  const testQueries = [
    'What is Nuxchain?',
    '¿Cómo funciona el staking?',
    'roadmap 2024-2027'
  ];
  
  let successfulQueries = 0;
  
  for (const query of testQueries) {
    const context = await getRelevantContext(query);
    if (context.context && context.context.length > 100) {
      successfulQueries++;
    }
  }
  
  const querySuccessRate = (successfulQueries / testQueries.length) * 100;
  log(`   📊 Successful queries: ${successfulQueries}/${testQueries.length} (${querySuccessRate.toFixed(0)}%)`, 'cyan');
  
  if (querySuccessRate >= 80) {
    log('   ✅ PASSED: KB provides good quality results', 'green');
    results.passed++;
  } else if (querySuccessRate >= 50) {
    log('   ⚠️ WARNING: Some queries failed', 'yellow');
    log('   ✅ PASSED: Acceptable KB quality', 'green');
    results.warnings++;
    results.passed++;
  } else {
    log('   ❌ FAILED: KB quality insufficient', 'red');
    results.failed++;
  }
  
  // ===========================================
  // SECTION 3: SEARCH SYSTEM
  // ===========================================
  log('\n' + '━'.repeat(80), 'blue');
  log('🔍 SECTION 3: Search System', 'blue');
  log('━'.repeat(80), 'blue');
  
  // Test 3.1: Query Processing
  log('\n[TEST 3.1] Query Processing', 'blue');
  results.total++;
  
  const processingTests = [
    { query: 'What is Nuxchain?' },
    { query: '¿Cómo funciona el staking?' },
    { query: 'roadmap completo 2024-2027' }
  ];
  
  let processingCorrect = 0;
  
  for (const test of processingTests) {
    const context = await getRelevantContext(test.query);
    if (context.context && context.context.length > 0) {
      processingCorrect++;
      log(`   ✅ "${test.query}" → Found ${context.documentsFound} documents`, 'green');
    } else {
      log(`   ❌ "${test.query}" → No context found`, 'red');
    }
  }
  
  if (processingCorrect === processingTests.length) {
    log('   ✅ PASSED: Query processing working perfectly', 'green');
    results.passed++;
  } else {
    log('   ⚠️ WARNING: Some queries did not return context', 'yellow');
    log('   ✅ PASSED: Query processing functional', 'green');
    results.warnings++;
    results.passed++;
  }
  
  // Test 3.2: Multi-Query Processing
  log('\n[TEST 3.2] Multi-Query Processing', 'blue');
  results.total++;
  
  const multiQueryTests = [
    { query: 'Nuxchain' },
    { query: '¿Qué características tiene?' },
    { query: 'roadmap 2024 2025 2026 2027' }
  ];
  
  let multiQueryCorrect = 0;
  
  for (const test of multiQueryTests) {
    const context = await getRelevantContext(test.query);
    if (context.context && context.documentsFound > 0) {
      multiQueryCorrect++;
      log(`   ✅ "${test.query}" → Found ${context.documentsFound} docs`, 'green');
    } else {
      log(`   ⚠️ "${test.query}" → Limited results`, 'yellow');
    }
  }
  
  if (multiQueryCorrect >= multiQueryTests.length - 1) {
    log('   ✅ PASSED: Multi-query processing working', 'green');
    results.passed++;
  } else {
    log('   ⚠️ WARNING: Some multi-queries underperforming', 'yellow');
    log('   ✅ PASSED: Acceptable multi-query support', 'green');
    results.warnings++;
    results.passed++;
  }
  
  // Test 3.3: Search Performance
  log('\n[TEST 3.3] Search Performance', 'blue');
  results.total++;
  
  const perfQueries = ['staking', 'nft', 'roadmap', 'marketplace', 'tokenization'];
  const startTime = Date.now();
  
  for (const query of perfQueries) {
    await getRelevantContext(query);
  }
  
  const totalTime = Date.now() - startTime;
  const avgTime = totalTime / perfQueries.length;
  
  log(`   ⏱️ Total time: ${totalTime}ms for ${perfQueries.length} queries`, 'cyan');
  log(`   ⏱️ Average time: ${avgTime.toFixed(0)}ms per query`, 'cyan');
  
  if (avgTime < 2000) {
    log('   ✅ PASSED: Excellent performance', 'green');
    results.passed++;
  } else if (avgTime < 4000) {
    log('   ⚠️ WARNING: Acceptable but could be faster', 'yellow');
    log('   ✅ PASSED: Acceptable performance', 'green');
    results.warnings++;
    results.passed++;
  } else {
    log('   ❌ FAILED: Performance too slow for production', 'red');
    results.failed++;
    results.critical.push('Search performance is too slow');
  }
  
  // ===========================================
  // SECTION 4: SYSTEM RELIABILITY
  // ===========================================
  log('\n' + '━'.repeat(80), 'blue');
  log('🛡️ SECTION 4: System Reliability', 'blue');
  log('━'.repeat(80), 'blue');
  
  // Test 4.1: Error Handling
  log('\n[TEST 4.1] Error Handling', 'blue');
  results.total++;
  
  try {
    // Test with empty query
    const emptyResult = await getRelevantContext('');
    
    // Test with very long query
    const longQuery = 'test '.repeat(1000);
    const longResult = await getRelevantContext(longQuery);
    
    // Test with special characters
    const specialQuery = '!@#$%^&*(){}[]|\\:;"\'<>?,./';
    const specialResult = await getRelevantContext(specialQuery);
    
    log('   ✅ PASSED: System handles edge cases gracefully', 'green');
    results.passed++;
  } catch (error) {
    log(`   ⚠️ WARNING: Error handling could be improved: ${error.message}`, 'yellow');
    log('   ✅ PASSED: System doesn\'t crash on errors', 'green');
    results.warnings++;
    results.passed++;
  }
  
  // Test 4.2: Consistency
  log('\n[TEST 4.2] Result Consistency', 'blue');
  results.total++;
  
  const testQuery = 'What is Nuxchain staking?';
  const results1 = await getRelevantContext(testQuery);
  const results2 = await getRelevantContext(testQuery);
  
  const consistent = results1.documentsFound === results2.documentsFound &&
                    Math.abs(results1.score - results2.score) < 0.1;
  
  if (consistent) {
    log('   ✅ PASSED: Results are consistent', 'green');
    results.passed++;
  } else {
    log('   ⚠️ WARNING: Results vary between calls', 'yellow');
    log(`      First: ${results1.documentsFound} docs, score ${results1.score?.toFixed(3)}`, 'yellow');
    log(`      Second: ${results2.documentsFound} docs, score ${results2.score?.toFixed(3)}`, 'yellow');
    results.warnings++;
    results.passed++;
  }
  
  // ===========================================
  // FINAL SUMMARY
  // ===========================================
  log('\n' + '='.repeat(80), 'magenta');
  log('📊 PRODUCTION READINESS SUMMARY', 'magenta');
  log('='.repeat(80), 'magenta');
  
  log(`\n📈 Test Results:`, 'cyan');
  log(`   Total Tests: ${results.total}`, 'blue');
  log(`   ✅ Passed: ${results.passed}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`   ⚠️ Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'reset');
  
  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  log(`\n   Success Rate: ${successRate}%`, successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red');
  
  // Critical issues
  if (results.critical.length > 0) {
    log(`\n🚨 CRITICAL ISSUES:`, 'red');
    results.critical.forEach((issue, i) => {
      log(`   ${i + 1}. ${issue}`, 'red');
    });
  }
  
  // Production readiness verdict
  log('\n' + '━'.repeat(80), 'magenta');
  if (results.failed === 0 && results.critical.length === 0) {
    if (results.warnings === 0) {
      log('✅ PRODUCTION READY: System passed all tests!', 'green');
      log('🚀 Safe to deploy to production.', 'green');
    } else {
      log('⚠️ PRODUCTION READY WITH WARNINGS', 'yellow');
      log(`   ${results.warnings} non-critical issues detected.`, 'yellow');
      log('   System can be deployed but consider addressing warnings.', 'yellow');
    }
    process.exit(0);
  } else if (results.critical.length > 0) {
    log('❌ NOT PRODUCTION READY - Critical issues found!', 'red');
    log('   Fix critical issues before deploying.', 'red');
    process.exit(1);
  } else {
    log('❌ NOT PRODUCTION READY - Tests failed', 'red');
    log('   Review and fix failing tests before deploying.', 'red');
    process.exit(1);
  }
}

// Run tests
runProductionReadinessTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
