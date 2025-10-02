/**
 * Test Rápido de Base de Conocimientos
 * Verifica que el sistema encuentre contexto relevante para queries comunes
 */

import { getRelevantContext } from './services/embeddings-service.js';

const TEST_QUERIES = [
  "APY base",
  "¿Cuál es el APY base de Nuxchain?",
  "staking nuxchain",
  "¿Cómo funciona el marketplace?",
  "NFTs en Nuxchain",
  "¿Qué es el token NUC?"
];

async function testKnowledgeBase() {
  console.log('🧪 TEST DE BASE DE CONOCIMIENTOS\n');
  console.log('='.repeat(80));
  
  for (const query of TEST_QUERIES) {
    console.log(`\n📝 Query: "${query}"`);
    console.log('-'.repeat(80));
    
    try {
      const result = await getRelevantContext(query, { threshold: 0.25, limit: 3 });
      
      if (result.documentsFound > 0) {
        console.log(`✅ Encontrados: ${result.documentsFound} documentos`);
        console.log(`📊 Score promedio: ${result.score.toFixed(3)}`);
        console.log(`🎯 Top score: ${result.topScore.toFixed(3)}`);
        console.log(`📏 Longitud contexto: ${result.context.length} caracteres`);
        
        // Mostrar preview del contexto
        const preview = result.context.substring(0, 200).replace(/\n/g, ' ');
        console.log(`📄 Preview: ${preview}...`);
      } else {
        console.log(`⚠️  NO se encontró contexto relevante`);
        console.log(`📊 Score: ${result.score}`);
      }
      
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Test completado\n');
}

testKnowledgeBase().catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});
