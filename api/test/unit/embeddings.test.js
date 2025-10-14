/**
 * UNIT TEST: Embeddings Service
 * Tests específicos para generación de embeddings con Gemini API
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

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

async function runEmbeddingsTests() {
  log('\n🧪 UNIT TEST: Embeddings Service', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0
  };
  
  // Test 1: API Key Configuration
  log('\n[TEST 1/5] API Key Configuration', 'blue');
  results.total++;
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    log('   ❌ FAILED: API key not configured', 'red');
    log('   💡 Add GEMINI_API_KEY to .env file', 'yellow');
    results.failed++;
  } else if (apiKey.length < 30) {
    log('   ❌ FAILED: API key seems invalid (too short)', 'red');
    results.failed++;
  } else {
    log(`   ✅ PASSED: API key configured (${apiKey.substring(0, 20)}...)`, 'green');
    log(`   📏 Key length: ${apiKey.length} chars`, 'cyan');
    results.passed++;
  }
  
  // Test 2: Client Initialization
  log('\n[TEST 2/5] GoogleGenAI Client Initialization', 'blue');
  results.total++;
  
  if (!apiKey) {
    log('   ⏭️ SKIPPED: No API key available', 'yellow');
    results.skipped++;
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      log('   ✅ PASSED: Client initialized successfully', 'green');
      results.passed++;
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Test 3: Single Embedding Generation
  log('\n[TEST 3/5] Single Embedding Generation', 'blue');
  results.total++;
  
  if (!apiKey) {
    log('   ⏭️ SKIPPED: No API key available', 'yellow');
    results.skipped++;
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const testText = 'Nuxchain is a DeFi platform for staking and NFTs';
      
      log('   🔄 Generating embedding...', 'cyan');
      const startTime = Date.now();
      
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: testText
      });
      
      const duration = Date.now() - startTime;
      const embedding = response.embeddings?.[0]?.values || response.embedding?.values;
      
      if (!embedding || !Array.isArray(embedding)) {
        log('   ❌ FAILED: Invalid embedding response', 'red');
        results.failed++;
      } else {
        log('   ✅ PASSED: Embedding generated successfully', 'green');
        log(`   📊 Dimensions: ${embedding.length}`, 'cyan');
        log(`   ⏱️ Duration: ${duration}ms`, 'cyan');
        log(`   📝 Sample values: [${embedding.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`, 'cyan');
        results.passed++;
      }
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED')) {
        log('   💡 API quota exhausted - upgrade plan or wait', 'yellow');
      }
      results.failed++;
    }
  }
  
  // Test 4: Batch Embeddings
  log('\n[TEST 4/5] Batch Embeddings Generation', 'blue');
  results.total++;
  
  if (!apiKey) {
    log('   ⏭️ SKIPPED: No API key available', 'yellow');
    results.skipped++;
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const testTexts = [
        'Staking rewards',
        'NFT marketplace',
        'Blockchain ecosystem'
      ];
      
      log('   🔄 Generating batch embeddings...', 'cyan');
      const startTime = Date.now();
      const embeddings = [];
      
      for (const text of testTexts) {
        const response = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: text
        });
        const embedding = response.embeddings?.[0]?.values || response.embedding?.values;
        embeddings.push(embedding);
      }
      
      const duration = Date.now() - startTime;
      
      if (embeddings.length !== testTexts.length || embeddings.some(e => !e)) {
        log('   ❌ FAILED: Some embeddings failed to generate', 'red');
        results.failed++;
      } else {
        log('   ✅ PASSED: All embeddings generated', 'green');
        log(`   📊 Count: ${embeddings.length}`, 'cyan');
        log(`   ⏱️ Total duration: ${duration}ms`, 'cyan');
        log(`   ⏱️ Avg per embedding: ${Math.round(duration / embeddings.length)}ms`, 'cyan');
        results.passed++;
      }
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Test 5: Cosine Similarity Calculation
  log('\n[TEST 5/5] Cosine Similarity Calculation', 'blue');
  results.total++;
  
  if (!apiKey) {
    log('   ⏭️ SKIPPED: No API key available', 'yellow');
    results.skipped++;
  } else {
    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const texts = {
        similar1: 'Staking cryptocurrency on blockchain',
        similar2: 'Crypto staking rewards on chain',
        different: 'Buying groceries at supermarket'
      };
      
      log('   🔄 Generating embeddings for similarity test...', 'cyan');
      
      const embeds = {};
      for (const [key, text] of Object.entries(texts)) {
        const response = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: text
        });
        embeds[key] = response.embeddings?.[0]?.values || response.embedding?.values;
      }
      
      // Calculate cosine similarity
      function cosineSimilarity(a, b) {
        let dot = 0, na = 0, nb = 0;
        for (let i = 0; i < a.length; i++) {
          dot += a[i] * b[i];
          na += a[i] * a[i];
          nb += b[i] * b[i];
        }
        return dot / (Math.sqrt(na) * Math.sqrt(nb));
      }
      
      const simScore = cosineSimilarity(embeds.similar1, embeds.similar2);
      const diffScore = cosineSimilarity(embeds.similar1, embeds.different);
      
      log(`   📊 Similar texts similarity: ${simScore.toFixed(4)}`, 'cyan');
      log(`   📊 Different texts similarity: ${diffScore.toFixed(4)}`, 'cyan');
      
      if (simScore > diffScore && simScore > 0.7) {
        log('   ✅ PASSED: Similarity calculation works correctly', 'green');
        results.passed++;
      } else {
        log('   ❌ FAILED: Unexpected similarity scores', 'red');
        results.failed++;
      }
    } catch (error) {
      log(`   ❌ FAILED: ${error.message}`, 'red');
      results.failed++;
    }
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`⏭️ Skipped: ${results.skipped}`, results.skipped > 0 ? 'yellow' : 'reset');
  
  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  if (results.failed === 0 && results.passed > 0) {
    log('\n🎉 All tests passed! Embeddings service is working correctly.', 'green');
    process.exit(0);
  } else if (results.skipped === results.total) {
    log('\n⚠️ All tests skipped - configure GEMINI_API_KEY to run tests.', 'yellow');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Check the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runEmbeddingsTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
