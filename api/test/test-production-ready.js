/**
 * Test Production Ready
 * Valida que el sistema esté listo para producción
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Cargar .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

import { initializeKnowledgeBaseForVercel, getRelevantContext } from '../services/embeddings-service.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function testProductionReadiness() {
  log('\n🚀 NUXCHAIN API - PRODUCTION READINESS TEST', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const checks = {
    environment: false,
    apiKey: false,
    knowledgeBase: false,
    embeddings: false,
    search: false
  };
  
  // 1. Verificar entorno
  log('\n📦 [1/5] Checking Environment...', 'blue');
  const hasNodeEnv = Boolean(process.env.NODE_ENV);
  const isProduction = process.env.NODE_ENV === 'production';
  
  log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`, hasNodeEnv ? 'green' : 'yellow');
  
  if (!hasNodeEnv) {
    log('   ⚠️ NODE_ENV not set - defaulting to development', 'yellow');
  }
  
  checks.environment = true;
  log('   ✅ Environment check passed', 'green');
  
  // 2. Verificar API Key
  log('\n🔑 [2/5] Checking API Key...', 'blue');
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    log('   ❌ GEMINI_API_KEY not configured', 'red');
    log('   💡 Set GEMINI_API_KEY in .env file', 'yellow');
    log('   💡 Get key from: https://aistudio.google.com/apikey', 'yellow');
    checks.apiKey = false;
  } else {
    log(`   ✅ GEMINI_API_KEY configured (${apiKey.substring(0, 20)}...)`, 'green');
    log(`   📏 Key length: ${apiKey.length} chars`, 'cyan');
    checks.apiKey = true;
  }
  
  // 3. Verificar Knowledge Base
  log('\n📚 [3/5] Checking Knowledge Base...', 'blue');
  try {
    const kbStatus = await initializeKnowledgeBaseForVercel();
    log(`   Documents: ${kbStatus.documentsCount}`, 'green');
    log(`   Model: ${kbStatus.embeddingModel}`, 'green');
    log(`   Mode: ${kbStatus.fallbackMode ? 'BM25 Fallback' : 'Gemini Embeddings'}`, kbStatus.fallbackMode ? 'yellow' : 'green');
    
    if (kbStatus.documentsCount === 0) {
      log('   ❌ Knowledge base is empty', 'red');
      checks.knowledgeBase = false;
    } else {
      checks.knowledgeBase = true;
      log('   ✅ Knowledge base initialized', 'green');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    checks.knowledgeBase = false;
  }
  
  // 4. Probar Embeddings (si API key disponible)
  log('\n🧠 [4/5] Testing Embeddings...', 'blue');
  if (checks.apiKey) {
    try {
      log('   📡 Testing with query: "Test embedding generation"', 'cyan');
      const testResult = await getRelevantContext('Test embedding generation', { limit: 1 });
      
      log(`   📊 Results: ${testResult.documentsFound} documents`, 'cyan');
      log(`   🎯 Method used: ${testResult.usedEmbeddings ? 'Gemini Embeddings' : 'BM25 Fallback'}`, 'cyan');
      
      if (testResult && testResult.documentsFound > 0) {
        log('   ✅ Search working correctly', 'green');
        
        if (testResult.usedEmbeddings) {
          log('   ✅ Gemini embeddings active (gemini-embedding-001)', 'green');
          checks.embeddings = true;
        } else {
          log('   ⚠️ Using BM25 fallback', 'yellow');
          log('   💡 This may indicate:', 'yellow');
          log('      - API quota exhausted', 'yellow');
          log('      - Network connectivity issues', 'yellow');
          log('      - Rate limit reached', 'yellow');
          checks.embeddings = false;
        }
      } else {
        log('   ⚠️ Search returned no results', 'yellow');
        checks.embeddings = false;
      }
    } catch (error) {
      log(`   ❌ Error: ${error.message}`, 'red');
      checks.embeddings = false;
    }
  } else {
    log('   ⚠️ Skipped (no API key)', 'yellow');
    log('   💡 BM25 fallback will be used instead', 'yellow');
    checks.embeddings = false; // Not critical
  }
  
  // 5. Probar búsqueda semántica
  log('\n🔍 [5/5] Testing Semantic Search...', 'blue');
  try {
    const queries = [
      'Nuxchain staking APY',
      'NFT marketplace features',
      'How to participate in airdrops'
    ];
    
    let allPassed = true;
    
    for (const query of queries) {
      const result = await getRelevantContext(query, { threshold: 0.25, limit: 3 });
      const found = result.documentsFound || 0;
      const score = result.score || 0;
      
      if (found > 0 && score >= 0.25) {
        log(`   ✅ "${query}": ${found} docs, score ${score.toFixed(3)}`, 'green');
      } else {
        log(`   ⚠️ "${query}": ${found} docs, score ${score.toFixed(3)}`, 'yellow');
        allPassed = false;
      }
    }
    
    checks.search = allPassed;
    if (allPassed) {
      log('   ✅ Semantic search working correctly', 'green');
    } else {
      log('   ⚠️ Some searches returned low quality results', 'yellow');
    }
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
    checks.search = false;
  }
  
  // Resumen final
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 PRODUCTION READINESS SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const checkResults = Object.entries(checks);
  const passed = checkResults.filter(([, v]) => v).length;
  const total = checkResults.length;
  const critical = checks.environment && checks.knowledgeBase && checks.search;
  
  checkResults.forEach(([check, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    const label = check.charAt(0).toUpperCase() + check.slice(1);
    log(`${status} ${label}`, color);
  });
  
  log('='.repeat(80), 'cyan');
  log(`\nScore: ${passed}/${total} checks passed (${((passed/total)*100).toFixed(0)}%)`, passed === total ? 'green' : 'yellow');
  
  if (critical) {
    log('\n🎉 PRODUCTION READY!', 'green');
    log('✅ All critical systems operational', 'green');
    
    if (!checks.embeddings) {
      log('\n⚠️ NOTE: Using BM25 fallback mode', 'yellow');
      log('💡 Reasons: quota exceeded, rate limit, or no API key', 'yellow');
      log('💡 BM25 provides good results for production', 'yellow');
      log('💡 To enable embeddings: upgrade to paid plan', 'yellow');
    }
  } else {
    log('\n⚠️ NOT PRODUCTION READY', 'red');
    log('❌ Critical systems failed - review errors above', 'red');
  }
  
  log('\n' + '='.repeat(80) + '\n', 'cyan');
  
  // Exit code
  process.exit(critical ? 0 : 1);
}

// Run test
testProductionReadiness().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
