// Script de prueba para evaluar la función de búsqueda mejorada

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configurar entorno de prueba
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar servicios
import { initializeKnowledgeBaseForVercel } from '../services/embeddings-service.js';
import { searchKnowledgeBase, knowledgeBase } from '../services/knowledge-base.js';

// Definir consultas de prueba para diferentes categorías
const testQueries = [
  {
    category: 'Staking',
    query: '¿Cuál es el APY base para diferentes períodos de bloqueo en Nuxchain?',
    keywords: ['apy', 'lockup', 'bloqueo']
  },
  {
    category: 'NFT',
    query: '¿Cuáles son las características del marketplace de NFT de Nuxchain?',
    keywords: ['nft', 'marketplace']
  },
  {
    category: 'Airdrop',
    query: '¿Cómo puedo participar en los airdrops de Nuxchain?',
    keywords: ['airdrop', 'participar']
  },
  {
    category: 'General',
    query: '¿Cuál es la visión de Nuxchain?',
    keywords: ['vision', 'nuxchain']
  }
];

// Función para probar el servicio de embeddings con fallback
async function testEmbeddingsService() {
  console.log('\n=== PRUEBA DEL SERVICIO DE EMBEDDINGS ===');
  
  try {
    const service = await initializeKnowledgeBaseForVercel();
    
    for (const test of testQueries) {
      console.log(`\n🔍 Buscando con embeddings: "${test.query}"`);
      
      try {
        // Realizar búsqueda usando embeddings o fallback
        const results = await service.search('knowledge_base', test.query, 3, {
          threshold: 0.2,
          topK: 3
        });
        
        console.log(`✅ Encontrados ${results.length} resultados para ${test.category}:`);
        results.forEach((result, index) => {
          const snippet = result.content.substring(0, 100) + (result.content.length > 100 ? '...' : '');
          console.log(`  ${index + 1}. Puntuación: ${result.score?.toFixed(3) || 'N/A'} - ${snippet}`);
        });
      } catch (error) {
        console.error(`❌ Error en búsqueda de embeddings para ${test.category}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error inicializando servicio de embeddings:', error.message);
  }
}

// Función para probar directamente la función searchKnowledgeBase
function testDirectSearch() {
  console.log('\n=== PRUEBA DIRECTA DE searchKnowledgeBase ===');
  
  for (const test of testQueries) {
    console.log(`\n🔍 Buscando directamente: "${test.query}"`);
    
    try {
      const results = searchKnowledgeBase(test.query, 3);
      
      console.log(`✅ Encontrados ${results.length} resultados para ${test.category}:`);
      results.forEach((result, index) => {
        const snippet = result.content.substring(0, 100) + (result.content.length > 100 ? '...' : '');
        console.log(`  ${index + 1}. Puntuación: ${result.score?.toFixed(3) || 'N/A'} - ${snippet}`);
        console.log(`    Categoría: ${result.metadata?.type}, Tema: ${result.metadata?.topic}`);
      });
    } catch (error) {
      console.error(`❌ Error en búsqueda directa para ${test.category}:`, error.message);
    }
  }
}

// Ejecutar todas las pruebas
async function runTests() {
  console.log('🚀 Iniciando pruebas de búsqueda mejorada en knowledge base');
  console.log(`📚 Total de documentos en knowledge base: ${knowledgeBase.length}`);
  
  // Ejecutar pruebas directas primero
  testDirectSearch();
  
  // Ejecutar pruebas con embeddings
  await testEmbeddingsService();
  
  console.log('\n✅ Pruebas completadas');
}

// Ejecutar las pruebas
runTests().catch(error => {
  console.error('❌ Error en la ejecución de pruebas:', error);
  process.exit(1);
});