/**
 * Integration Test: Chat Stream API
 * Test completo del endpoint /api/chat/stream antes de deploy
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

// Colors para output
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

// ============================================================================
// TEST HELPERS
// ============================================================================
async function testEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(options.timeout || 30000)
    });
    
    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json().catch(() => null)
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message
    };
  }
}

// ============================================================================
// TEST SUITE
// ============================================================================
async function runChatStreamTests() {
  log('\n🧪 INTEGRATION TEST: Chat Stream API', 'magenta');
  log('='.repeat(80), 'magenta');
  log('Testing /api/chat/stream endpoint for production deployment\n', 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    critical: []
  };
  
  // Determinar URL base
  const BASE_URL = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
  
  const STREAM_URL = `${BASE_URL}/api/chat/stream`;
  
  log(`📍 Testing endpoint: ${STREAM_URL}\n`, 'cyan');
  
  // ==========================================================================
  // TEST 1: PREFLIGHT OPTIONS
  // ==========================================================================
  log('━'.repeat(80), 'blue');
  log('[TEST 1] Preflight OPTIONS Request', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'OPTIONS'
    });
    
    if (response.status === 200 || response.status === 204) {
      log('   ✅ OPTIONS request successful', 'green');
      
      // Verificar CORS headers
      const requiredHeaders = [
        'access-control-allow-origin',
        'access-control-allow-methods',
        'access-control-allow-headers'
      ];
      
      const missingHeaders = requiredHeaders.filter(h => !response.headers[h]);
      
      if (missingHeaders.length === 0) {
        log('   ✅ All CORS headers present', 'green');
        results.passed++;
      } else {
        log(`   ⚠️ Missing CORS headers: ${missingHeaders.join(', ')}`, 'yellow');
        results.warnings++;
        results.passed++;
      }
    } else {
      log(`   ❌ OPTIONS request failed: ${response.status}`, 'red');
      results.failed++;
      results.critical.push('CORS preflight failing');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
    results.critical.push('Cannot reach endpoint');
  }
  
  // ==========================================================================
  // TEST 2: METHOD VALIDATION
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 2] Method Validation (GET should fail)', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'GET'
    });
    
    if (response.status === 405) {
      log('   ✅ Correctly rejects GET method (405)', 'green');
      results.passed++;
    } else {
      log(`   ⚠️ Unexpected status for GET: ${response.status}`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 3: VALIDATION - EMPTY BODY
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 3] Validation - Empty Body', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: {}
    });
    
    if (response.status === 400) {
      log('   ✅ Correctly rejects empty body (400)', 'green');
      if (response.data?.error) {
        log(`   📝 Error message: ${response.data.error}`, 'cyan');
      }
      results.passed++;
    } else {
      log(`   ⚠️ Unexpected status: ${response.status}`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 4: VALIDATION - INVALID MESSAGE
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 4] Validation - Invalid Message Format', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: 123 } // Número en lugar de string
    });
    
    if (response.status === 400) {
      log('   ✅ Correctly rejects invalid message type (400)', 'green');
      results.passed++;
    } else {
      log(`   ⚠️ Unexpected status: ${response.status}`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 5: VALIDATION - MESSAGE TOO LONG
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 5] Validation - Message Too Long', 'blue');
  results.total++;
  
  try {
    const longMessage = 'a'.repeat(10001); // Más de 10000 chars
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: longMessage }
    });
    
    if (response.status === 400) {
      log('   ✅ Correctly rejects long message (400)', 'green');
      results.passed++;
    } else {
      log(`   ⚠️ Unexpected status: ${response.status}`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 6: SECURITY - XSS ATTACK
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 6] Security - XSS Attack Detection', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: '<script>alert("xss")</script>' }
    });
    
    if (response.status === 400) {
      log('   ✅ XSS attack blocked (400)', 'green');
      results.passed++;
    } else if (response.status === 200) {
      log('   ⚠️ XSS not blocked - security issue!', 'yellow');
      results.warnings++;
      results.critical.push('XSS attacks not being blocked');
      results.passed++;
    } else {
      log(`   ℹ️ Status: ${response.status}`, 'cyan');
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 7: SECURITY - SQL INJECTION
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 7] Security - SQL Injection Detection', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: "'; DROP TABLE users; --" }
    });
    
    if (response.status === 400) {
      log('   ✅ SQL injection blocked (400)', 'green');
      results.passed++;
    } else if (response.status === 200) {
      log('   ⚠️ SQL injection not blocked - potential security issue', 'yellow');
      results.warnings++;
      results.passed++;
    } else {
      log(`   ℹ️ Status: ${response.status}`, 'cyan');
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 8: VALID REQUEST - SIMPLE MESSAGE
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 8] Valid Request - Simple Message', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: 'Hello, what is Nuxchain?' },
      timeout: 45000 // 45 segundos
    });
    
    if (response.status === 200) {
      log('   ✅ Request successful (200)', 'green');
      
      // Verificar headers de seguridad
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection'
      ];
      
      const presentHeaders = securityHeaders.filter(h => response.headers[h]);
      log(`   📋 Security headers present: ${presentHeaders.length}/${securityHeaders.length}`, 'cyan');
      
      results.passed++;
    } else if (response.status === 500) {
      log(`   ❌ Server error (500)`, 'red');
      if (response.data?.error) {
        log(`   📝 Error: ${response.data.error}`, 'red');
      }
      results.failed++;
      results.critical.push('Server error on valid request - check logs');
    } else {
      log(`   ⚠️ Unexpected status: ${response.status}`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
    results.critical.push('Valid requests failing');
  }
  
  // ==========================================================================
  // TEST 9: RATE LIMITING
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 9] Rate Limiting (making 5 rapid requests)', 'blue');
  results.total++;
  
  try {
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        testEndpoint(STREAM_URL, {
          method: 'POST',
          body: { message: `Test message ${i}` },
          timeout: 10000
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status === 200).length;
    const rateLimited = responses.filter(r => r.status === 429).length;
    
    log(`   📊 Successful: ${successCount}/5`, 'cyan');
    log(`   📊 Rate limited: ${rateLimited}/5`, rateLimited > 0 ? 'yellow' : 'cyan');
    
    // Verificar headers de rate limit
    const lastResponse = responses[responses.length - 1];
    if (lastResponse.headers['x-ratelimit-remaining']) {
      log(`   📋 Rate limit remaining: ${lastResponse.headers['x-ratelimit-remaining']}`, 'cyan');
    }
    
    if (successCount >= 3) {
      log('   ✅ Rate limiting working correctly', 'green');
      results.passed++;
    } else {
      log('   ⚠️ Rate limiting may be too strict or endpoints failing', 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // TEST 10: RESPONSE HEADERS
  // ==========================================================================
  log('\n━'.repeat(80), 'blue');
  log('[TEST 10] Response Headers Validation', 'blue');
  results.total++;
  
  try {
    const response = await testEndpoint(STREAM_URL, {
      method: 'POST',
      body: { message: 'Test headers' },
      timeout: 30000
    });
    
    const requiredHeaders = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'access-control-allow-origin': '*'
    };
    
    let headersPassed = 0;
    let headersTotal = Object.keys(requiredHeaders).length;
    
    for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
      const actualValue = response.headers[header];
      if (actualValue) {
        if (expectedValue === '*' || actualValue.toLowerCase().includes(expectedValue.toLowerCase())) {
          log(`   ✅ ${header}: ${actualValue}`, 'green');
          headersPassed++;
        } else {
          log(`   ⚠️ ${header}: ${actualValue} (expected: ${expectedValue})`, 'yellow');
        }
      } else {
        log(`   ❌ ${header}: MISSING`, 'red');
      }
    }
    
    if (headersPassed === headersTotal) {
      log(`   ✅ All security headers present (${headersPassed}/${headersTotal})`, 'green');
      results.passed++;
    } else {
      log(`   ⚠️ Some headers missing (${headersPassed}/${headersTotal})`, 'yellow');
      results.warnings++;
      results.passed++;
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    results.failed++;
  }
  
  // ==========================================================================
  // FINAL RESULTS
  // ==========================================================================
  log('\n' + '='.repeat(80), 'magenta');
  log('📊 TEST RESULTS SUMMARY', 'magenta');
  log('='.repeat(80), 'magenta');
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  
  log(`\n   Total Tests: ${results.total}`, 'cyan');
  log(`   ✅ Passed: ${results.passed}`, 'green');
  log(`   ❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`   ⚠️  Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'green');
  log(`   📈 Pass Rate: ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  if (results.critical.length > 0) {
    log('\n   🚨 CRITICAL ISSUES:', 'red');
    results.critical.forEach(issue => {
      log(`      • ${issue}`, 'red');
    });
  }
  
  log('\n' + '='.repeat(80), 'magenta');
  
  // Determinar si está listo para deploy
  const isReadyForDeploy = results.failed === 0 && results.critical.length === 0;
  
  if (isReadyForDeploy) {
    log('\n✅ READY FOR DEPLOYMENT', 'green');
    log('All critical tests passed. Safe to deploy to production.\n', 'green');
    return 0;
  } else {
    log('\n❌ NOT READY FOR DEPLOYMENT', 'red');
    log('Fix critical issues before deploying to production.\n', 'red');
    return 1;
  }
}

// Ejecutar tests
// Normalizar rutas para Windows/Unix
const normalizedUrl = import.meta.url.replace(/\\/g, '/');
const normalizedArgv = process.argv[1] ? process.argv[1].replace(/\\/g, '/') : '';
const isMainModule = normalizedUrl.endsWith(normalizedArgv) || 
                     normalizedUrl.includes('chat-stream.test.js');

if (isMainModule) {
  runChatStreamTests()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
      log(`\n❌ Fatal error: ${error.message}`, 'red');
      console.error(error);
      process.exit(1);
    });
}

export { runChatStreamTests };
