import { initializeKnowledgeBaseOnStartup } from './src/server/services/embeddings-service.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

console.log('🔍 Diagnóstico de Base de Conocimientos');
console.log('=====================================');

// Verificar variables de entorno
console.log('\n📋 Variables de entorno:');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Configurada' : '❌ No configurada');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'undefined');

// Verificar archivos necesarios
console.log('\n📁 Verificando archivos:');
try {
  const { knowledgeBase } = await import('./src/server/services/knowledge-base.js');
  console.log('- knowledge-base.js: ✅ Cargado correctamente');
  console.log(`- Documentos en base: ${knowledgeBase.length}`);
} catch (error) {
  console.log('- knowledge-base.js: ❌ Error al cargar:', error.message);
}

// Probar inicialización
console.log('\n🚀 Probando inicialización:');
try {
  await initializeKnowledgeBaseOnStartup();
  console.log('✅ Inicialización completada exitosamente');
} catch (error) {
  console.log('❌ Error en inicialización:', error.message);
  console.log('Stack trace:', error.stack);
}

console.log('\n🏁 Diagnóstico completado');