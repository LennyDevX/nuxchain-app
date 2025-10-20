/**
 * Query Classifier - Test Examples
 * Ejecuta este archivo para ver cómo funciona la clasificación
 * 
 * Uso (local):
 * node src/server/gemini/services/query-classifier.test.js
 * 
 * O importa y usa en tus tests
 */

import { 
  needsKnowledgeBase, 
  updateConversationContext, 
  resetConversationContext,
  getConversationContext 
} from './query-classifier.js';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function testCase(title, query, options = {}) {
  console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.bright}Test: ${title}${colors.reset}`);
  console.log(`Query: "${query}"`);
  
  if (options.setupContext) {
    console.log(`${colors.yellow}Setup: Updating context...${colors.reset}`);
    updateConversationContext(true, ['staking', 'rewards']);
    console.log(`Context: ${JSON.stringify(getConversationContext(), null, 2)}`);
  }
  
  console.log(`\n${colors.cyan}Execution:${colors.reset}`);
  const result = needsKnowledgeBase(query, { 
    includeContext: true, 
    debugMode: true 
  });
  
  console.log(`\n${colors.cyan}Result:${colors.reset}`);
  console.log(`  needsKB: ${result.needsKB ? colors.green + '✅' + colors.reset : colors.red + '❌' + colors.reset}`);
  console.log(`  reason: ${result.reason}`);
  console.log(`  score: ${result.score.toFixed(3)}`);
  console.log(`  reasoning: [${result.reasoning.join(', ')}]`);
  console.log(`  keywordMatches: ${result.keywordMatches}`);
  console.log(`  isCapabilityQuestion: ${result.isCapabilityQuestion}`);
  console.log(`  hasNuxchainContext: ${result.hasNuxchainContext}`);
  
  if (options.cleanup) {
    resetConversationContext();
    console.log(`\n${colors.yellow}Cleanup: Context reset${colors.reset}`);
  }
}

// ============================================================================
// PRUEBAS
// ============================================================================

console.log(`${colors.bright}${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║  Query Classifier - Testing Suite                        ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

resetConversationContext();

// TEST 1: Pregunta Nuxchain-específica (Staking)
testCase(
  'Staking Question (Nuxchain-specific)',
  'minimo de staking',
  { cleanup: true }
);

// TEST 2: Pregunta genérica sobre blockchain
testCase(
  'Generic Blockchain Question',
  'qué es blockchain',
  { cleanup: true }
);

// TEST 3: Saludo genérico
testCase(
  'Generic Greeting',
  'Hola, ¿cómo estás?',
  { cleanup: true }
);

// TEST 4: Pregunta sobre capacidades SIN contexto
testCase(
  'Capability Question - Without Context',
  '¿qué puedes hacer?',
  { cleanup: true }
);

// TEST 5: Pregunta sobre capacidades CON contexto
testCase(
  'Capability Question - With Context',
  '¿qué puedes hacer?',
  { setupContext: true, cleanup: true }
);

// TEST 6: Pregunta sobre features de Nuxchain
testCase(
  'Features Question',
  '¿qué funciones ofrece Nuxchain?',
  { cleanup: true }
);

// TEST 7: Pregunta sobre marketplace
testCase(
  'Marketplace Question',
  'cómo funciona el marketplace de Nuxchain',
  { cleanup: true }
);

// TEST 8: Pregunta sobre NFT
testCase(
  'NFT Question',
  'cómo compro un NFT en Nuxchain',
  { cleanup: true }
);

// TEST 9: Pregunta sobre servicios
testCase(
  'Services Question',
  '¿qué servicios tienes?',
  { cleanup: true }
);

// TEST 10: Pregunta sobre airdrops
testCase(
  'Airdrop Question',
  'cómo participo en airdrops',
  { cleanup: true }
);

console.log(`\n${colors.bright}${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
console.log(`${colors.bright}${colors.green}All tests completed!${colors.reset}\n`);

// ============================================================================
// INTERPRETACIÓN DE RESULTADOS
// ============================================================================

console.log(`${colors.bright}${colors.cyan}
═══════════════════════════════════════════════════════════════
RESULTADO ESPERADO SUMMARY
═══════════════════════════════════════════════════════════════
${colors.reset}

TEST 1: ${colors.green}✅ needsKB: true${colors.reset} (score: 0.15 - 0.30, has keyword 'staking')
TEST 2: ${colors.red}❌ needsKB: false${colors.reset} (generic pattern detected)
TEST 3: ${colors.red}❌ needsKB: false${colors.reset} (greeting pattern detected)
TEST 4: ${colors.red}❌ needsKB: false${colors.reset} (capability question without Nuxchain context)
TEST 5: ${colors.green}✅ needsKB: true${colors.reset} (capability + previous Nuxchain context, score: 0.65)
TEST 6: ${colors.green}✅ needsKB: true${colors.reset} (capability pattern, score: 0.40)
TEST 7: ${colors.green}✅ needsKB: true${colors.reset} (capability + keyword 'marketplace', score: 0.55)
TEST 8: ${colors.green}✅ needsKB: true${colors.reset} (keyword 'NFT' + 'comprar', score: 0.30+)
TEST 9: ${colors.red}❌ needsKB: false${colors.reset} (capability without Nuxchain context, score: 0.40)
TEST 10: ${colors.green}✅ needsKB: true${colors.reset} (keyword 'airdrops', score: 0.15+)

${colors.bright}KEY INSIGHTS:${colors.reset}
- TEST 4 vs TEST 5: Demonstrates importance of conversation context
- TEST 6 vs TEST 9: Similar queries but different results based on context
- Tests with keywords tend to have needsKB: true
- Generic patterns trigger early return (score: 0.1)
- Capability patterns need either keyword or context to reach threshold

${colors.bright}SCORING TIERS:${colors.reset}
- 0.00 - 0.15: Generic responses ❌
- 0.16 - 0.29: Low confidence, no KB search ❌
- 0.30 - 1.00: High confidence, searches KB ✅
`);

