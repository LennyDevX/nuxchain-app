/**
 * Script de prueba para el URL Context Tool
 * Simula exactamente cómo se ejecuta desde el chat
 */

import { executeFunctionCall } from './src/server/services/gemini-service.js';
import urlContextService from './src/server/services/url-context-service.js';

async function testUrlContextFromChat() {
  console.log('🧪 Probando URL Context Tool como se ejecuta desde el chat...');
  
  try {
    // Simular la llamada exacta que hace Gemini
    const functionCall = {
      name: 'urlContext',
      args: {
        url: 'https://example.com',
        includeImages: false
      }
    };
    
    console.log('\n1. Ejecutando función como lo haría Gemini...');
    console.log('FunctionCall:', JSON.stringify(functionCall, null, 2));
    
    const result = await executeFunctionCall(functionCall);
    
    console.log('\n✅ Resultado de executeFunctionCall:');
    console.log(JSON.stringify(result, null, 2));
    
    // Verificar si hay errores
     if (result.error) {
       console.error('❌ Error detectado en el resultado:', result.message);
     } else {
       console.log('\n🎉 URL Context Tool funcionó correctamente!');
       console.log('- Título:', result.data?.title || 'No disponible');
       console.log('- Contenido length:', result.data?.content?.length || 0);
       console.log('- Summary:', result.data?.summary?.substring(0, 100) + '...' || 'No disponible');
       console.log('- Success:', result.success);
       console.log('- Message:', result.message);
     }
    
  } catch (error) {
    console.error('❌ Error crítico en la prueba:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
  }
}

async function testDirectUrlContextService() {
  console.log('\n🔧 Probando UrlContextService directamente...');
  
  try {
    const result = await urlContextService.fetchUrlContext('https://example.com');
    console.log('✅ UrlContextService resultado:', {
      title: result.title,
      contentLength: result.content?.length || 0,
      success: result.success !== false
    });
  } catch (error) {
    console.error('❌ Error en UrlContextService:', error.message);
  }
}

// Ejecutar ambas pruebas
async function runAllTests() {
  await testDirectUrlContextService();
  await testUrlContextFromChat();
}

runAllTests().catch(console.error);