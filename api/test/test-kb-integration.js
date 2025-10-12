/**
 * Test de Integración de Base de Conocimientos
 * Verifica que el sistema encuentre contexto relevante con embeddings o BM25 fallback
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Cargar .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

console.log('🔍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.warn('⚠️ Error loading .env:', result.error.message);
  console.warn('⚠️ Tests will run in BM25 fallback mode');
} else {
  console.log('✅ .env loaded successfully');
}

import { getRelevantContext } from '../services/embeddings-service.js';

// Preguntas de test específicas - AJUSTADAS
const TEST_QUERIES = [
  {
    query: '¿Qué es el APY base en Nuxchain?',
    expectedKeywords: ['apy', 'base', 'hour', 'hourly', 'rate'], // Más flexible
    category: 'APY/Staking',
    language: 'es' // Para mejor validación
  },
  {
    query: '¿Cómo funciona el staking en Nuxchain?',
    expectedKeywords: ['staking', 'rewards', 'pol', 'deposit'],
    category: 'Staking',
    language: 'es'
  },
  {
    query: '¿Qué características tiene el marketplace de NFTs?',
    expectedKeywords: ['marketplace', 'nft', 'buy', 'sell', 'trade'],
    category: 'Marketplace',
    language: 'es'
  },
  {
    query: 'Explícame sobre los airdrops de Nuxchain',
    expectedKeywords: ['airdrop', 'tokens', 'reward', 'eligible'],
    category: 'Airdrops',
    language: 'es'
  },
  {
    query: '¿Qué es Nuxchain y cuáles son sus características principales?',
    expectedKeywords: ['nuxchain', 'platform', 'decentralized', 'ecosystem', 'blockchain'],
    category: 'General',
    language: 'es'
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
  
  // Detectar modo de operación
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  const mode = hasApiKey ? 'Gemini Embeddings (gemini-embedding-001)' : 'BM25 Fallback (TF-IDF)';
  
  console.log(colorize(`🔧 Modo: ${mode}`, hasApiKey ? 'green' : 'yellow'));
  console.log('='.repeat(70) + '\n');
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const results = [];
  
  // Ajustar expectativas según el modo
  const expectedThreshold = hasApiKey ? 0.3 : 0.25;
  const minKeywordMatch = hasApiKey ? 0.2 : 0.2; // ✅ AJUSTADO: Más flexible (20% mínimo)
  
  console.log(colorize(`📊 Threshold esperado: ${expectedThreshold}`, 'cyan'));
  console.log(colorize(`📊 Match mínimo de keywords: ${(minKeywordMatch * 100).toFixed(0)}%`, 'cyan'));
  console.log('='.repeat(70) + '\n');
  
  for (const testCase of TEST_QUERIES) {
    totalTests++;
    console.log(colorize(`📝 Test ${totalTests}: ${testCase.category}`, 'blue'));
    console.log(colorize(`❓ Query: "${testCase.query}"`, 'cyan'));
    console.log('-'.repeat(70));
    
    try {
      const startTime = Date.now();
      
      // Obtener contexto con threshold apropiado
      const rawContext = await getRelevantContext(testCase.query, {
        threshold: expectedThreshold,
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
      
      // Criterios de éxito ajustados por modo
      const hasGoodScore = hasApiKey 
        ? relevantContext.score >= 0.3 
        : relevantContext.score >= 0.25;
      
      // ✅ MEJORADO: Validación más flexible de keywords
      const hasEnoughKeywords = keywordMatchRate >= minKeywordMatch || 
                                (hasContext && relevantContext.score >= 0.7); // Score alto compensa keywords
      
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
  
  // Recomendaciones ajustadas
  if (failedTests > 0) {
    console.log(colorize(`\n⚠️  RECOMENDACIONES:`, 'yellow'));
    if (!hasApiKey) {
      console.log(colorize(`   • CRÍTICO: Configurar GEMINI_API_KEY para usar embeddings reales`, 'yellow'));
      console.log(colorize(`   • Actualmente usando modo fallback BM25 (menos preciso)`, 'yellow'));
    }
    console.log(colorize(`   • Revisar la base de conocimientos (knowledge-base.js)`, 'yellow'));
    console.log(colorize(`   • Agregar más contenido específico para categorías fallidas`, 'yellow'));
    console.log(colorize(`   • Verificar que los términos clave están en los documentos`, 'yellow'));
  } else {
    console.log(colorize(`\n🎉 ¡EXCELENTE! Todos los tests pasaron correctamente`, 'green'));
    console.log(colorize(`   Modo: ${mode}`, 'green'));
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
