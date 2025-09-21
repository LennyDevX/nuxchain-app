import { initializeKnowledgeBaseForVercel } from './api/services/embeddings-service.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Prueba de Inicialización para Vercel');
console.log('====================================');

// Simular entorno de Vercel
process.env.VERCEL_ENV = 'production';
process.env.NODE_ENV = 'production';

console.log('\n📋 Variables de entorno (simulando Vercel):');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- VERCEL_ENV:', process.env.VERCEL_ENV);

// Verificar archivos necesarios para Vercel
console.log('\n📁 Verificando archivos para Vercel:');
try {
  const { knowledgeBase } = await import('./api/chat/knowledge-base.js');
  console.log('- api/chat/knowledge-base.js: ✅ Cargado correctamente');
  console.log(`- Documentos en base: ${knowledgeBase.length}`);
} catch (error) {
  console.log('- api/chat/knowledge-base.js: ❌ Error al cargar:', error.message);
}

// Probar inicialización para Vercel
console.log('\n🚀 Probando inicialización para Vercel:');
try {
  const embeddingsService = await initializeKnowledgeBaseForVercel();
  console.log('✅ Inicialización para Vercel completada exitosamente');
  
  // Probar búsqueda
  console.log('\n🔍 Probando búsqueda:');
  const searchResults = await embeddingsService.search('knowledge_base', 'Nuxchain staking', 3);
  console.log(`- Resultados encontrados: ${searchResults.length}`);
  if (searchResults.length > 0) {
    console.log('- Primer resultado:', searchResults[0].content.substring(0, 100) + '...');
  }
  
} catch (error) {
  console.log('❌ Error en inicialización para Vercel:', error.message);
  console.log('Stack trace:', error.stack);
}

console.log('\n🏁 Prueba completada');