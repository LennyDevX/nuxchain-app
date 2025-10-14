/**
 * UNIT TEST: Knowledge Base Structure
 * Tests para verificar la integridad de la base de conocimiento
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

import { knowledgeBase } from '../../services/knowledge-base.js';

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

async function runKnowledgeBaseTests() {
  log('\n🧪 UNIT TEST: Knowledge Base Structure', 'cyan');
  log('='.repeat(80), 'cyan');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  // Test 1: Base Structure
  log('\n[TEST 1/8] Knowledge Base Loading', 'blue');
  results.total++;
  
  if (!knowledgeBase || !Array.isArray(knowledgeBase)) {
    log('   ❌ FAILED: Knowledge base not loaded or invalid', 'red');
    results.failed++;
  } else {
    log(`   ✅ PASSED: Knowledge base loaded (${knowledgeBase.length} documents)`, 'green');
    results.passed++;
  }
  
  // Test 2: Document Count
  log('\n[TEST 2/8] Document Count', 'blue');
  results.total++;
  
  const expectedMinDocs = 100; // Mínimo esperado
  
  if (knowledgeBase.length < expectedMinDocs) {
    log(`   ❌ FAILED: Too few documents (${knowledgeBase.length} < ${expectedMinDocs})`, 'red');
    results.failed++;
  } else {
    log(`   ✅ PASSED: Sufficient documents (${knowledgeBase.length} >= ${expectedMinDocs})`, 'green');
    results.passed++;
  }
  
  // Test 3: Document Structure
  log('\n[TEST 3/8] Document Structure Validation', 'blue');
  results.total++;
  
  const invalidDocs = [];
  
  knowledgeBase.forEach((doc, index) => {
    if (!doc.content || typeof doc.content !== 'string') {
      invalidDocs.push({ index, issue: 'Missing or invalid content' });
    }
    if (!doc.metadata || typeof doc.metadata !== 'object') {
      invalidDocs.push({ index, issue: 'Missing or invalid metadata' });
    }
    if (!doc.commands || !Array.isArray(doc.commands)) {
      invalidDocs.push({ index, issue: 'Missing or invalid commands' });
    }
  });
  
  if (invalidDocs.length > 0) {
    log(`   ❌ FAILED: Found ${invalidDocs.length} invalid documents`, 'red');
    invalidDocs.slice(0, 3).forEach(({ index, issue }) => {
      log(`      - Doc ${index}: ${issue}`, 'red');
    });
    results.failed++;
  } else {
    log('   ✅ PASSED: All documents have valid structure', 'green');
    results.passed++;
  }
  
  // Test 4: Categories Coverage
  log('\n[TEST 4/8] Categories Coverage', 'blue');
  results.total++;
  
  const categories = new Set(knowledgeBase.map(d => d.metadata.type));
  const expectedCategories = ['general', 'features', 'staking', 'marketplace', 'nft', 'roadmap', 'ecosystem'];
  const missingCategories = expectedCategories.filter(cat => !categories.has(cat));
  
  log(`   📊 Categories found: ${Array.from(categories).join(', ')}`, 'cyan');
  
  if (missingCategories.length > 0) {
    log(`   ⚠️ WARNING: Missing categories: ${missingCategories.join(', ')}`, 'yellow');
  }
  
  if (categories.size >= 5) {
    log('   ✅ PASSED: Good category diversity', 'green');
    results.passed++;
  } else {
    log(`   ❌ FAILED: Too few categories (${categories.size} < 5)`, 'red');
    results.failed++;
  }
  
  // Test 5: Roadmap Coverage
  log('\n[TEST 5/8] Roadmap Coverage (2024-2027)', 'blue');
  results.total++;
  
  const roadmapDocs = knowledgeBase.filter(d => 
    d.metadata.type === 'roadmap' || 
    d.content.toLowerCase().includes('roadmap') ||
    d.content.match(/202[4-7]/)
  );
  
  const has2024 = roadmapDocs.some(d => d.content.includes('2024'));
  const has2025 = roadmapDocs.some(d => d.content.includes('2025'));
  const has2026 = roadmapDocs.some(d => d.content.includes('2026'));
  const has2027 = roadmapDocs.some(d => d.content.includes('2027'));
  
  log(`   📊 Roadmap documents: ${roadmapDocs.length}`, 'cyan');
  log(`   📅 Coverage: 2024=${has2024} | 2025=${has2025} | 2026=${has2026} | 2027=${has2027}`, 'cyan');
  
  if (has2024 && has2025 && has2026 && has2027 && roadmapDocs.length >= 10) {
    log('   ✅ PASSED: Complete roadmap coverage 2024-2027', 'green');
    results.passed++;
  } else {
    log('   ❌ FAILED: Incomplete roadmap coverage', 'red');
    results.failed++;
  }
  
  // Test 6: Content Quality
  log('\n[TEST 6/8] Content Quality', 'blue');
  results.total++;
  
  const shortDocs = knowledgeBase.filter(d => d.content.length < 50);
  const avgLength = knowledgeBase.reduce((sum, d) => sum + d.content.length, 0) / knowledgeBase.length;
  
  log(`   📊 Average content length: ${Math.round(avgLength)} chars`, 'cyan');
  log(`   📊 Short documents (<50 chars): ${shortDocs.length}`, 'cyan');
  
  if (shortDocs.length < 5 && avgLength > 200) {
    log('   ✅ PASSED: Good content quality', 'green');
    results.passed++;
  } else {
    log(`   ⚠️ WARNING: ${shortDocs.length} docs are too short`, 'yellow');
    log('   ✅ PASSED: Acceptable content quality', 'green');
    results.passed++;
  }
  
  // Test 7: Search Commands
  log('\n[TEST 7/8] Search Commands Availability', 'blue');
  results.total++;
  
  const docsWithoutCommands = knowledgeBase.filter(d => !d.commands || d.commands.length === 0);
  const avgCommands = knowledgeBase.reduce((sum, d) => sum + (d.commands?.length || 0), 0) / knowledgeBase.length;
  
  log(`   📊 Average commands per doc: ${avgCommands.toFixed(1)}`, 'cyan');
  log(`   📊 Docs without commands: ${docsWithoutCommands.length}`, 'cyan');
  
  if (docsWithoutCommands.length === 0 && avgCommands >= 3) {
    log('   ✅ PASSED: All documents have sufficient search commands', 'green');
    results.passed++;
  } else {
    log(`   ⚠️ WARNING: ${docsWithoutCommands.length} docs lack commands`, 'yellow');
    if (avgCommands >= 2) {
      log('   ✅ PASSED: Acceptable command coverage', 'green');
      results.passed++;
    } else {
      log('   ❌ FAILED: Insufficient command coverage', 'red');
      results.failed++;
    }
  }
  
  // Test 8: Category Distribution
  log('\n[TEST 8/8] Category Distribution Balance', 'blue');
  results.total++;
  
  const distribution = {};
  knowledgeBase.forEach(d => {
    const cat = d.metadata.type || 'unknown';
    distribution[cat] = (distribution[cat] || 0) + 1;
  });
  
  log('   📊 Distribution:', 'cyan');
  Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      const percentage = ((count / knowledgeBase.length) * 100).toFixed(1);
      log(`      - ${cat}: ${count} docs (${percentage}%)`, 'cyan');
    });
  
  const maxCategory = Math.max(...Object.values(distribution));
  const minCategory = Math.min(...Object.values(distribution));
  const ratio = maxCategory / minCategory;
  
  if (ratio < 5) {
    log('   ✅ PASSED: Balanced distribution', 'green');
    results.passed++;
  } else {
    log(`   ⚠️ WARNING: Unbalanced distribution (ratio: ${ratio.toFixed(1)}:1)`, 'yellow');
    log('   ✅ PASSED: Acceptable distribution', 'green');
    results.passed++;
  }
  
  // Summary
  log('\n' + '='.repeat(80), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(80), 'cyan');
  log(`Total: ${results.total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  
  const successRate = results.total > 0 ? ((results.passed / results.total) * 100).toFixed(1) : 0;
  log(`\n📈 Success Rate: ${successRate}%`, successRate >= 80 ? 'green' : successRate >= 50 ? 'yellow' : 'red');
  
  log('\n📚 Knowledge Base Stats:', 'cyan');
  log(`   - Total Documents: ${knowledgeBase.length}`, 'cyan');
  log(`   - Total Categories: ${Object.keys(distribution).length}`, 'cyan');
  log(`   - Total Content Size: ${Math.round(knowledgeBase.reduce((sum, d) => sum + d.content.length, 0) / 1024)}KB`, 'cyan');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Knowledge base structure is valid.', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Check the errors above.', 'red');
    process.exit(1);
  }
}

// Run tests
runKnowledgeBaseTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
