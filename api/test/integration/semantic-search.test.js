/**
 * INTEGRATION TEST: Semantic Search
 * Tests del sistema completo de búsqueda (Embeddings + BM25 + Query Complexity)
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

import { getRelevantContext, initializeKnowledgeBaseForVercel } from '../../services/embeddings-service.js';

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

// Test queries con diferentes complejidades
const TEST_QUERIES = [
  // Simple queries (should use 5 docs, threshold 0.25)
  {
    query: '¿Qué es Nuxchain?',
    expectedComplexity: 'simple',
    expectedLimit: 5,
    expectedKeywords: ['nuxchain', 'platform', 'defi', 'ecosystem'],
    minScore: 0.4,
    description: 'Simple platform definition'
  },
  {
    query: 'What is staking?',
    expectedComplexity: 'simple',
    expectedLimit: 5,
    expectedKeywords: ['staking', 'rewards', 'pol', 'deposit'],
    minScore: 0.4,
    description: 'Simple staking definition'
  },
  
  // Medium queries (should use 6 docs, threshold 0.27)
  {
    query: '¿Cómo funciona el staking en Nuxchain?',
    expectedComplexity: 'medium',
    expectedLimit: 6,
    expectedKeywords: ['staking', 'funciona', 'pol', 'rewards', 'apy'],
    minScore: 0.35,
    description: 'Medium process explanation'
  },
  {
    query: '¿Qué características tiene el marketplace?',
    expectedComplexity: 'medium',
    expectedLimit: 6,
    expectedKeywords: ['marketplace', 'nft', 'features', 'buy', 'sell'],
    minScore: 0.35,
    description: 'Medium features query'
  },
  
  // High complexity queries (should use 8 docs, threshold 0.30)
  {
    query: 'roadmap completo 2024-2027',
    expectedComplexity: 'high',
    expectedLimit: 8,
    expectedKeywords: ['roadmap', '2024', '2025', '2026', '2027', 'phase'],
    minScore: 0.3,
    description: 'High complexity roadmap query'
  },
  {
    query: 'compare staking and NFT marketplace features',
    expectedComplexity: 'high',
    expectedLimit: 8,
    expectedKeywords: ['staking', 'nft', 'marketplace', 'compare'],
    minScore: 0.3,
    description: 'High complexity comparison'
  },
  {
    query: '¿Qué planes hay para 2026 y 2027?',
    expectedComplexity: 'high',
    expectedLimit: 8,
    expectedKeywords: ['2026', '2027', 'plan', 'future', 'roadmap'],
    minScore: 0.3,
    description: 'High complexity multi-year query'
  }
];

async function runSemanticSearchTests() {
  log('\n🧪 INTEGRATION TEST: Semantic Search', 'cyan');
  log('='.repeat(80), 'cyan');
  
  // Initialize KB first
  log('\n🔧 Initializing Knowledge Base...', 'blue');
  const kbStatus = await initializeKnowledgeBaseForVercel();
  log(`   ✅ KB initialized: ${kbStatus.documentsCount} docs`, 'green');
  log(`   🔧 Mode: ${kbStatus.fallbackMode ? 'BM25 Fallback' : 'Gemini Embeddings'}`, kbStatus.fallbackMode ? 'yellow' : 'green');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  };
  
  // Run tests for each query
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const test = TEST_QUERIES[i];
    results.total++;
    
    log(`\n[TEST ${i + 1}/${TEST_QUERIES.length}] ${test.description}`, 'blue');
    log(`   Query: "${test.query}"`, 'cyan');
    log(`   Expected complexity: ${test.expectedComplexity}`, 'cyan');
    
    try {
      const startTime = Date.now();
      const context = await getRelevantContext(test.query);
      const duration = Date.now() - startTime;
      
      // Check if context was found
      if (!context.context || context.context.length === 0) {
        log('   ❌ FAILED: No context found', 'red');
        results.failed++;
        continue;
      }
      
      log(`   ✅ Context found: ${context.context.length} chars`, 'green');
      log(`   ⏱️ Duration: ${duration}ms`, 'cyan');
      log(`   📊 Documents: ${context.documentsFound}`, 'cyan');
      log(`   📊 Complexity: ${context.queryComplexity || 'unknown'}`, 'cyan');
      log(`   📊 Limit used: ${context.searchLimit || 'unknown'}`, 'cyan');
      log(`   📊 Threshold: ${context.threshold?.toFixed(2) || 'unknown'}`, 'cyan');
      log(`   📊 Score: ${context.score?.toFixed(3) || 'N/A'}`, 'cyan');
      log(`   🔧 Method: ${context.usedEmbeddings ? 'Gemini Embeddings' : 'BM25 Fallback'}`, 'cyan');
      
      // Validate complexity detection
      if (context.queryComplexity !== test.expectedComplexity) {
        log(`   ⚠️ WARNING: Complexity mismatch (expected ${test.expectedComplexity}, got ${context.queryComplexity})`, 'yellow');
        results.warnings++;
      }
      
      // Validate document limit
      if (context.searchLimit !== test.expectedLimit) {
        log(`   ⚠️ WARNING: Limit mismatch (expected ${test.expectedLimit}, got ${context.searchLimit})`, 'yellow');
        results.warnings++;
      }
      
      // Validate content relevance (check keywords)
      const contextLower = context.context.toLowerCase();
      const foundKeywords = test.expectedKeywords.filter(kw => contextLower.includes(kw.toLowerCase()));
      const keywordScore = foundKeywords.length / test.expectedKeywords.length;
      
      log(`   📝 Keywords found: ${foundKeywords.length}/${test.expectedKeywords.length}`, 'cyan');
      log(`      ${foundKeywords.join(', ')}`, 'cyan');
      
      if (keywordScore < 0.3) {
        log('   ❌ FAILED: Insufficient keyword coverage', 'red');
        results.failed++;
      } else if (keywordScore < 0.5) {
        log('   ⚠️ WARNING: Low keyword coverage', 'yellow');
        results.warnings++;
        results.passed++;
      } else {
        log('   ✅ PASSED: Good keyword coverage', 'green');
        results.passed++;
      }
      
      // Validate score
      if (context.score && context.score < test.minScore) {
        log(`   ⚠️ WARNING: Score below minimum (${context.score.toFixed(3)} < ${test.minScore})`, 'yellow');
        results.warnings++;
      }
      
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Performance test: multiple queries in sequence
  log('\n[PERFORMANCE TEST] Sequential Queries', 'blue');
  results.total++;
  
  const perfQueries = ['staking', 'nft', 'roadmap'];
  const startTime = Date.now();
  
  for (const query of perfQueries) {
    await getRelevantContext(query);
  }
  
  const totalDuration = Date.now() - startTime;
  const avgDuration = totalDuration / perfQueries.length;
  
  log(`   ⏱️ Total duration: ${totalDuration}ms`, 'cyan');
  log(`   ⏱️ Average per query: ${avgDuration.toFixed(0)}ms`, 'cyan');
  
  if (avgDuration < 3000) {
    log('   ✅ PASSED: Good performance', 'green');
    results.passed++;
  } else if (avgDuration < 5000) {
    log('   ⚠️ WARNING: Acceptable performance', 'yellow');
    results.warnings++;
    results.passed++;
  } else {
    log('   ❌ FAILED: Slow performance', 'red');
    results.failed++;
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`⚠️ Warnings: ${results.warnings}`, results.warnings > 0 ? 'yellow' : 'reset');
  
  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Semantic search is working correctly.', 'green');
    if (results.warnings > 0) {
      log(`⚠️ Note: ${results.warnings} warnings detected (non-critical)`, 'yellow');
    }
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Check the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runSemanticSearchTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
