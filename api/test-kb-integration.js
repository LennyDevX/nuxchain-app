/**
 * Test de Integración de Base de Conocimientos
 * Verifica que el sistema encuentre contexto relevante para preguntas específicas
 */

import { getRelevantContext } from './services/embeddings-service.js';

// Preguntas de test específicas
const TEST_QUERIES = [
  {
    query: '¿Qué es el APY base en Nuxchain?',
    expectedKeywords: ['apy', 'base', 'porcentaje', 'anual', 'retorno'],
    category: 'APY/Staking'
  },
  {
    query: '¿Cómo funciona el staking en Nuxchain?',
    expectedKeywords: ['staking', 'recompensas', 'pol', 'pool', 'depositar'],
    category: 'Staking'
  },
  {
    query: '¿Qué características tiene el marketplace de NFTs?',
    expectedKeywords: ['marketplace', 'nft', 'comprar', 'vender', 'crear'],
    category: 'Marketplace'
  },
  {
    query: 'Explícame sobre los airdrops de Nuxchain',
    expectedKeywords: ['airdrop', 'tokens', 'distribución', 'gratis', 'reclamar'],
    category: 'Airdrops'
  },
  {
    query: '¿Qué es Nuxchain y cuáles son sus características principales?',
    expectedKeywords: ['nuxchain', 'plataforma', 'blockchain', 'descentralizada', 'ecosistema'],
    category: 'General'
  }
];

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

async function testKBIntegration() {
  console.log(colorize('\n🧪 TEST DE INTEGRACIÓN DE BASE DE CONOCIMIENTOS', 'cyan'));
  console.log('='.repeat(70) + '\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  
  for (const testCase of TEST_QUERIES) {
    totalTests++;
    console.log(colorize(`📝 Test ${totalTests}: ${testCase.category}`, 'blue'));
    console.log(colorize(`❓ Query: "${testCase.query}"`, 'cyan'));
    console.log('-'.repeat(70));
    
    try {
      const startTime = Date.now();
      
      // Obtener contexto
      const rawContext = await getRelevantContext(testCase.query, {
        threshold: 0.25,
        limit: 5
      });
      
      const duration = Date.now() - startTime;
      
      // Normalizar contexto (mismo código que stream.js)
      let relevantContext = { context: '', score: 0 };
      if (typeof rawContext === 'string') {
        relevantContext.context = rawContext;
      } else if (rawContext && typeof rawContext === 'object') {
        relevantContext.context = rawContext.context || rawContext.text || '';
        relevantContext.score = Number(rawContext.score) || 0;
      }
      
      // Verificar que se encontró contexto
      const hasContext = relevantContext.context && relevantContext.context.length > 0;
      
      // Verificar keywords esperadas
      const contextLower = relevantContext.context.toLowerCase();
      const foundKeywords = testCase.expectedKeywords.filter(kw => 
        contextLower.includes(kw.toLowerCase())
      );
      const keywordMatchRate = foundKeywords.length / testCase.expectedKeywords.length;
      
      // Criterios de éxito
      const hasGoodScore = relevantContext.score >= 0.25;
      const hasEnoughKeywords = keywordMatchRate >= 0.4; // Al menos 40% de keywords
      const passed = hasContext && hasGoodScore && hasEnoughKeywords;
      
      if (passed) {
        passedTests++;
      } else {
        failedTests++;
      }
      
      // Resultado
      console.log(colorize(`⏱️  Duración: ${duration}ms`, 'cyan'));
      console.log(colorize(`📊 Score: ${relevantContext.score.toFixed(3)}`, hasGoodScore ? 'green' : 'red'));
      console.log(colorize(`📏 Longitud: ${relevantContext.context.length} caracteres`, 'cyan'));
      console.log(colorize(`🔑 Keywords encontradas: ${foundKeywords.length}/${testCase.expectedKeywords.length} (${(keywordMatchRate * 100).toFixed(0)}%)`, keywordMatchRate >= 0.4 ? 'green' : 'yellow'));
      console.log(colorize(`   Encontradas: ${foundKeywords.join(', ')}`, 'cyan'));
      console.log(colorize(`   Faltantes: ${testCase.expectedKeywords.filter(kw => !foundKeywords.includes(kw)).join(', ')}`, 'yellow'));
      
      // Preview del contexto
      if (hasContext) {
        const preview = relevantContext.context.substring(0, 200).replace(/\n/g, ' ');
        console.log(colorize(`\n💬 Contexto Preview:`, 'cyan'));
        console.log(colorize(`   "${preview}..."`, 'cyan'));
      } else {
        console.log(colorize(`\n⚠️  NO SE ENCONTRÓ CONTEXTO`, 'red'));
      }
      
      console.log(colorize(`\n${passed ? '✅ PASSED' : '❌ FAILED'}`, passed ? 'green' : 'red'));
      console.log('='.repeat(70) + '\n');
      
      results.push({
        query: testCase.query,
        category: testCase.category,
        passed,
        score: relevantContext.score,
        contextLength: relevantContext.context.length,
        keywordMatchRate,
        duration
      });
      
    } catch (error) {
      failedTests++;
      console.error(colorize(`❌ ERROR: ${error.message}`, 'red'));
      console.log('='.repeat(70) + '\n');
      
      results.push({
        query: testCase.query,
        category: testCase.category,
        passed: false,
        error: error.message
      });
    }
  }
  
  // Resumen final
  console.log(colorize('\n📊 RESUMEN FINAL', 'cyan'));
  console.log('='.repeat(70));
  console.log(colorize(`Total de tests: ${totalTests}`, 'cyan'));
  console.log(colorize(`✅ Pasados: ${passedTests} (${((passedTests/totalTests)*100).toFixed(1)}%)`, 'green'));
  console.log(colorize(`❌ Fallados: ${failedTests} (${((failedTests/totalTests)*100).toFixed(1)}%)`, failedTests > 0 ? 'red' : 'green'));
  
  // Métricas agregadas
  const validResults = results.filter(r => !r.error);
  if (validResults.length > 0) {
    const avgScore = validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length;
    const avgDuration = validResults.reduce((sum, r) => sum + r.duration, 0) / validResults.length;
    const avgKeywordMatch = validResults.reduce((sum, r) => sum + r.keywordMatchRate, 0) / validResults.length;
    
    console.log(colorize(`\n📈 Métricas Promedio:`, 'cyan'));
    console.log(colorize(`   Score: ${avgScore.toFixed(3)}`, 'cyan'));
    console.log(colorize(`   Duración: ${Math.round(avgDuration)}ms`, 'cyan'));
    console.log(colorize(`   Match de Keywords: ${(avgKeywordMatch * 100).toFixed(1)}%`, 'cyan'));
  }
  
  // Tabla de resultados
  console.log(colorize(`\n📋 Detalle por Categoría:`, 'cyan'));
  console.log('-'.repeat(70));
  results.forEach((result, index) => {
    const status = result.passed ? colorize('✅ PASS', 'green') : colorize('❌ FAIL', 'red');
    const score = result.error ? 'ERROR' : result.score.toFixed(3);
    const match = result.error ? 'N/A' : `${(result.keywordMatchRate * 100).toFixed(0)}%`;
    console.log(`${index + 1}. ${status} | ${result.category.padEnd(15)} | Score: ${score} | Keywords: ${match}`);
  });
  console.log('='.repeat(70));
  
  // Recomendaciones
  if (failedTests > 0) {
    console.log(colorize(`\n⚠️  RECOMENDACIONES:`, 'yellow'));
    console.log(colorize(`   • Revisar la base de conocimientos (knowledge-base.js)`, 'yellow'));
    console.log(colorize(`   • Ajustar threshold de BM25 (actualmente 0.25)`, 'yellow'));
    console.log(colorize(`   • Agregar más contenido específico para categorías fallidas`, 'yellow'));
    console.log(colorize(`   • Verificar que los términos clave están en los documentos`, 'yellow'));
  } else {
    console.log(colorize(`\n🎉 ¡EXCELENTE! Todos los tests pasaron correctamente`, 'green'));
    console.log(colorize(`   La base de conocimientos está funcionando óptimamente`, 'green'));
  }
  
  console.log('\n' + '='.repeat(70) + '\n');
  
  // Exit code basado en resultados
  process.exit(failedTests > 0 ? 1 : 0);
}

// Ejecutar tests
console.log(colorize('🚀 Nuxchain - Test de Integración KB', 'cyan'));
console.log(colorize(`📅 Fecha: ${new Date().toLocaleString()}`, 'cyan'));

testKBIntegration().catch(error => {
  console.error(colorize('💥 Error fatal:', 'red'), error);
  process.exit(1);
});
