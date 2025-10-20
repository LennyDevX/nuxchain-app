# 🧪 Test Queries para Validar Fixes del Chat

## Objetivo
Validar que las mejoras al classifier y embeddings service funcionen correctamente con queries específicas que ANTES fallaban.

---

## ✅ Queries que DEBEN Funcionar Ahora

### Categoría 1: APY / ROI / Tasas
```javascript
const apyQueries = [
  "¿Cuál es el APY de staking?",
  "¿Qué APY base tiene Nuxchain?",
  "¿Cuánto rinde el staking?",
  "¿Qué rendimiento tiene el staking?",
  "¿Cuál es el ROI del staking?",
  "¿Qué tasa de retorno ofrece?",
  "¿Qué porcentaje de ganancia tiene el staking?",
  "APY del período de 30 días"
];

// ESPERADO:
// ✅ Classification Score: > 0.45
// ✅ needsKB: true
// ✅ Docs Found: >= 3
// ✅ Top Score: > 0.70
// ✅ Response: Menciona "0.01% por hora" o "87.6% APY"
```

### Categoría 2: Límites (Min/Max)
```javascript
const limitQueries = [
  "¿Cuánto puedo depositar mínimo?",
  "¿Cuál es el mínimo de staking?",
  "¿Cuánto puedo depositar máximo?",
  "¿Cuál es el límite de retiro diario?",
  "¿Cuántos depósitos máximo puedo hacer?",
  "Mínimo para hacer staking",
  "Máximo de retiro por día",
  "Límites del smart contract"
];

// ESPERADO:
// ✅ Classification Score: > 0.40
// ✅ needsKB: true
// ✅ Docs Found: >= 3
// ✅ Semantic Boost: +0.20 (limit pattern match)
// ✅ Response: Menciona "5 POL", "10000 POL", "1000 POL", "300 deposits"
```

### Categoría 3: Períodos de Lockup
```javascript
const lockupQueries = [
  "¿Qué rendimiento tiene el lockup de 90 días?",
  "APY del período de 180 días",
  "¿Cuánto gano con lockup de 365 días?",
  "Tasa del período de 30 días",
  "¿Qué lockup ofrece mejor rendimiento?",
  "Diferencia entre lockup de 90 y 180 días",
  "¿Cuántos períodos de bloqueo hay?"
];

// ESPERADO:
// ✅ Classification Score: > 0.50
// ✅ needsKB: true
// ✅ Number Boost: +0.25 (90, 180, 365 detected)
// ✅ Docs Found: >= 4
// ✅ Response: Menciona tasas específicas (0.012%, 0.016%, 0.02%, 0.03%)
```

### Categoría 4: Procesos y "Cómo Funciona"
```javascript
const processQueries = [
  "¿Cómo funciona el staking?",
  "¿Cómo puedo hacer staking?",
  "¿Cómo funciona el compound?",
  "Proceso de staking paso a paso",
  "¿Cómo reclamar recompensas?",
  "¿Cómo se calculan las recompensas?",
  "Tutorial de staking",
  "Pasos para depositar POL"
];

// ESPERADO:
// ✅ Classification Score: > 0.35
// ✅ needsKB: true
// ✅ Docs Found: >= 3
// ✅ Response: Explica proceso con pasos numerados o lista
```

### Categoría 5: Características Específicas
```javascript
const featureQueries = [
  "Características del marketplace",
  "¿Qué funciones tiene Nuxchain?",
  "¿Qué puedo hacer en la plataforma?",
  "Funcionalidades de staking",
  "¿Qué servicios ofrece Nuxchain?",
  "Capacidades del smart contract",
  "¿Qué beneficios tiene el staking?"
];

// ESPERADO:
// ✅ Classification Score: > 0.40
// ✅ needsKB: true
// ✅ Capability Pattern Match: true
// ✅ Docs Found: >= 4
// ✅ Response: Lista características con bullets
```

### Categoría 6: Queries con Números Específicos
```javascript
const numberQueries = [
  "¿Qué pasa si deposito 5 POL?",
  "¿Puedo depositar 10000 POL?",
  "¿Cuánto gano con 100 POL en 90 días?",
  "Límite de 1000 POL",
  "300 depósitos máximo",
  "APY con 365 días de lockup"
];

// ESPERADO:
// ✅ Numeric Pattern Match: true
// ✅ Number Boost: +0.25
// ✅ Classification Score: > 0.45
// ✅ needsKB: true
// ✅ Response: Usa los números mencionados en respuesta
```

---

## ❌ Queries que DEBEN FALLAR (Generic)

```javascript
const genericQueries = [
  "Hola, ¿cómo estás?",
  "¿Qué es blockchain?",
  "¿Qué es un NFT en general?",
  "Explícame DeFi",
  "¿Qué es Web3?",
  "Buenos días",
  "Tell me about crypto"
];

// ESPERADO:
// ❌ needsKB: false
// ❌ Reason: "generic_question"
// ✅ Response: Respuesta general de Gemini (sin KB)
```

---

## 🧪 Script de Validación Automática

```javascript
// test-chat-classifier.js

import { needsKnowledgeBase } from './src/server/gemini/services/query-classifier.js';
import { getRelevantContext } from './src/server/gemini/services/embeddings-service.js';

async function testQuery(query, expectedNeedsKB = true, category = '') {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📝 Testing: "${query}"`);
  console.log(`📂 Category: ${category}`);
  console.log(`${'='.repeat(80)}`);
  
  // Test 1: Classifier
  const classificationResult = needsKnowledgeBase(query, { 
    includeContext: true, 
    debugMode: true 
  });
  
  console.log(`\n[CLASSIFIER RESULT]`);
  console.log(`  needsKB: ${classificationResult.needsKB ? '✅ true' : '❌ false'}`);
  console.log(`  score: ${classificationResult.score.toFixed(2)}`);
  console.log(`  reason: ${classificationResult.reason}`);
  console.log(`  keywordMatches: ${classificationResult.keywordMatches}`);
  console.log(`  matched: ${classificationResult.matchedKeywords?.slice(0, 5).join(', ')}`);
  console.log(`  isCapability: ${classificationResult.isCapabilityQuestion}`);
  console.log(`  hasNumeric: ${classificationResult.hasNumericPattern}`);
  
  const classifierPass = classificationResult.needsKB === expectedNeedsKB;
  console.log(`\n  CLASSIFIER: ${classifierPass ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test 2: Embeddings (solo si needsKB = true)
  if (classificationResult.needsKB) {
    console.log(`\n[EMBEDDINGS SEARCH]`);
    const contextResult = await getRelevantContext(query, { threshold: 0.15 });
    
    console.log(`  documentsFound: ${contextResult.documentsFound}`);
    console.log(`  avgScore: ${contextResult.score?.toFixed(3)}`);
    console.log(`  topScore: ${contextResult.topScore?.toFixed(3)}`);
    console.log(`  contextLength: ${contextResult.context?.length || 0} chars`);
    console.log(`  usedEmbeddings: ${contextResult.usedEmbeddings ? '✅ yes' : '⚠️  BM25 fallback'}`);
    
    const embeddingsPass = contextResult.documentsFound >= 3 && contextResult.topScore > 0.15;
    console.log(`\n  EMBEDDINGS: ${embeddingsPass ? '✅ PASS' : '❌ FAIL'}`);
    
    return classifierPass && embeddingsPass;
  }
  
  return classifierPass;
}

async function runAllTests() {
  console.log('\n🧪 INICIANDO TESTS AUTOMÁTICOS\n');
  
  const tests = [
    // APY Queries
    { query: "¿Cuál es el APY de staking?", expected: true, category: 'APY' },
    { query: "¿Qué APY base tiene Nuxchain?", expected: true, category: 'APY' },
    { query: "¿Cuánto rinde el staking?", expected: true, category: 'APY' },
    
    // Limit Queries
    { query: "¿Cuánto puedo depositar mínimo?", expected: true, category: 'Limits' },
    { query: "¿Cuál es el límite de retiro diario?", expected: true, category: 'Limits' },
    { query: "Máximo de depósitos por usuario", expected: true, category: 'Limits' },
    
    // Lockup Queries
    { query: "¿Qué rendimiento tiene el lockup de 90 días?", expected: true, category: 'Lockup' },
    { query: "APY del período de 180 días", expected: true, category: 'Lockup' },
    { query: "Tasa del lockup de 365 días", expected: true, category: 'Lockup' },
    
    // Process Queries
    { query: "¿Cómo funciona el staking?", expected: true, category: 'Process' },
    { query: "¿Cómo se calculan las recompensas?", expected: true, category: 'Process' },
    { query: "Tutorial de compound", expected: true, category: 'Process' },
    
    // Feature Queries
    { query: "Características del marketplace", expected: true, category: 'Features' },
    { query: "¿Qué funciones tiene Nuxchain?", expected: true, category: 'Features' },
    { query: "Funcionalidades de staking", expected: true, category: 'Features' },
    
    // Number Queries
    { query: "¿Puedo depositar 5 POL?", expected: true, category: 'Numbers' },
    { query: "Límite de 1000 POL", expected: true, category: 'Numbers' },
    { query: "300 depósitos máximo", expected: true, category: 'Numbers' },
    
    // Generic Queries (should FAIL)
    { query: "Hola, ¿cómo estás?", expected: false, category: 'Generic' },
    { query: "¿Qué es blockchain?", expected: false, category: 'Generic' },
    { query: "Buenos días", expected: false, category: 'Generic' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    const result = await testQuery(test.query, test.expected, test.category);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Delay para no saturar API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n\n${'='.repeat(80)}`);
  console.log(`📊 RESULTADOS FINALES`);
  console.log(`${'='.repeat(80)}`);
  console.log(`✅ Passed: ${passed}/${tests.length} (${((passed/tests.length)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${failed}/${tests.length} (${((failed/tests.length)*100).toFixed(1)}%)`);
  console.log(`${'='.repeat(80)}\n`);
}

// Ejecutar tests
runAllTests().catch(console.error);
```

---

## 📋 Checklist Manual

Para cada query de prueba, verifica:

### Classifier:
- [ ] needsKB = true (para queries específicas)
- [ ] score >= 0.25
- [ ] keywordMatches > 0
- [ ] reasoning incluye pattern matches correctos
- [ ] hasNumericPattern = true (si aplica)

### Embeddings:
- [ ] documentsFound >= 3
- [ ] topScore > 0.15
- [ ] avgScore > 0.15
- [ ] contextLength > 500 chars
- [ ] usedEmbeddings = true (o BM25 fallback aceptable)

### Response Quality:
- [ ] Respuesta específica (no genérica)
- [ ] Menciona números/valores exactos del KB
- [ ] Usa markdown formatting
- [ ] Longitud apropiada (2-3 párrafos)
- [ ] No dice "no tengo información"

---

## 🎯 Criterios de Éxito

**META: 95%+ de queries específicas funcionando correctamente**

- APY Queries: 100% (8/8) ✅
- Limit Queries: 100% (8/8) ✅
- Lockup Queries: 100% (7/7) ✅
- Process Queries: 100% (8/8) ✅
- Feature Queries: 100% (7/7) ✅
- Number Queries: 100% (6/6) ✅
- **Generic Queries: 100% rechazadas (7/7) ✅**

**TOTAL ESPERADO: 51/51 (100%)**

Si logras 48+/51 (>94%), el fix es EXITOSO ✅
