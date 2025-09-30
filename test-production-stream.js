/**
 * Script de prueba para verificar el funcionamiento del endpoint /api/chat/stream en producción
 */

const PRODUCTION_URL = 'https://nuxchain-app.vercel.app';

async function testStreamEndpoint() {
  console.log('🧪 Iniciando prueba del endpoint /api/chat/stream en producción...\n');
  
  const testMessage = {
    messages: [
      {
        role: 'user',
        content: '¿Qué es Nuxchain y cuáles son sus características principales?'
      }
    ]
  };

  try {
    console.log('📡 Enviando solicitud a:', `${PRODUCTION_URL}/api/chat/stream`);
    console.log('📝 Mensaje de prueba:', testMessage.messages[0].content);
    console.log('⏱️  Iniciando streaming...\n');

    const response = await fetch(`${PRODUCTION_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(testMessage)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No se recibió un stream de respuesta');
    }

    console.log('✅ Conexión establecida exitosamente');
    console.log('📊 Status:', response.status);
    console.log('🔄 Content-Type:', response.headers.get('content-type'));
    console.log('\n📥 Contenido del stream:\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream completado exitosamente');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      chunkCount++;
      
      // Procesar cada línea del chunk
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('\n🏁 Señal de finalización recibida');
          } else if (data.trim()) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                process.stdout.write(parsed.content);
                fullResponse += parsed.content;
              }
            } catch (e) {
              // Ignorar errores de parsing menores
            }
          }
        }
      }
    }

    console.log('\n\n📈 Estadísticas de la prueba:');
    console.log(`   • Chunks recibidos: ${chunkCount}`);
    console.log(`   • Longitud total: ${fullResponse.length} caracteres`);
    console.log(`   • Respuesta completa: ${fullResponse.length > 0 ? '✅' : '❌'}`);
    
    return {
      success: true,
      chunkCount,
      responseLength: fullResponse.length,
      fullResponse: fullResponse.substring(0, 200) + (fullResponse.length > 200 ? '...' : '')
    };

  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    
    if (error.message.includes('fetch')) {
      console.error('💡 Posibles causas:');
      console.error('   • Problema de conectividad');
      console.error('   • Endpoint no disponible');
      console.error('   • CORS mal configurado');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function testStreamWithToolsEndpoint() {
  console.log('\n🧪 Iniciando prueba del endpoint /api/chat/stream-with-tools en producción...\n');
  
  const testMessage = {
    messages: [
      {
        role: 'user',
        content: 'Busca información sobre las últimas actualizaciones de Nuxchain en su documentación oficial'
      }
    ]
  };

  try {
    console.log('📡 Enviando solicitud a:', `${PRODUCTION_URL}/api/chat/stream-with-tools`);
    console.log('📝 Mensaje de prueba:', testMessage.messages[0].content);
    console.log('⏱️  Iniciando streaming con herramientas...\n');

    const response = await fetch(`${PRODUCTION_URL}/api/chat/stream-with-tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(testMessage)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    console.log('✅ Conexión con herramientas establecida exitosamente');
    console.log('📊 Status:', response.status);
    console.log('🔄 Content-Type:', response.headers.get('content-type'));
    console.log('\n📥 Contenido del stream con herramientas:\n');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let chunkCount = 0;
    let toolsUsed = [];

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('\n✅ Stream con herramientas completado exitosamente');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      chunkCount++;
      
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            console.log('\n🏁 Señal de finalización recibida');
          } else if (data.trim()) {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                process.stdout.write(parsed.content);
                fullResponse += parsed.content;
              }
              if (parsed.tool_used) {
                toolsUsed.push(parsed.tool_used);
                console.log(`\n🔧 Herramienta utilizada: ${parsed.tool_used}`);
              }
            } catch (e) {
              // Ignorar errores de parsing menores
            }
          }
        }
      }
    }

    console.log('\n\n📈 Estadísticas de la prueba con herramientas:');
    console.log(`   • Chunks recibidos: ${chunkCount}`);
    console.log(`   • Longitud total: ${fullResponse.length} caracteres`);
    console.log(`   • Herramientas usadas: ${toolsUsed.length > 0 ? toolsUsed.join(', ') : 'Ninguna'}`);
    console.log(`   • Respuesta completa: ${fullResponse.length > 0 ? '✅' : '❌'}`);
    
    return {
      success: true,
      chunkCount,
      responseLength: fullResponse.length,
      toolsUsed,
      fullResponse: fullResponse.substring(0, 200) + (fullResponse.length > 200 ? '...' : '')
    };

  } catch (error) {
    console.error('❌ Error durante la prueba con herramientas:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando pruebas de endpoints de streaming en producción\n');
  console.log('=' .repeat(60));
  
  // Prueba del endpoint básico
  const streamResult = await testStreamEndpoint();
  
  console.log('\n' + '=' .repeat(60));
  
  // Prueba del endpoint con herramientas
  const streamWithToolsResult = await testStreamWithToolsEndpoint();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 RESUMEN DE PRUEBAS');
  console.log('=' .repeat(60));
  
  console.log('\n🔹 Endpoint /api/chat/stream:');
  if (streamResult.success) {
    console.log('   ✅ Estado: FUNCIONANDO');
    console.log(`   📊 Chunks: ${streamResult.chunkCount}`);
    console.log(`   📏 Longitud: ${streamResult.responseLength} caracteres`);
  } else {
    console.log('   ❌ Estado: ERROR');
    console.log(`   🚨 Error: ${streamResult.error}`);
  }
  
  console.log('\n🔹 Endpoint /api/chat/stream-with-tools:');
  if (streamWithToolsResult.success) {
    console.log('   ✅ Estado: FUNCIONANDO');
    console.log(`   📊 Chunks: ${streamWithToolsResult.chunkCount}`);
    console.log(`   📏 Longitud: ${streamWithToolsResult.responseLength} caracteres`);
    console.log(`   🔧 Herramientas: ${streamWithToolsResult.toolsUsed.length > 0 ? streamWithToolsResult.toolsUsed.join(', ') : 'Ninguna'}`);
  } else {
    console.log('   ❌ Estado: ERROR');
    console.log(`   🚨 Error: ${streamWithToolsResult.error}`);
  }
  
  const overallSuccess = streamResult.success && streamWithToolsResult.success;
  console.log(`\n🎯 Resultado general: ${overallSuccess ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  
  if (!overallSuccess) {
    console.log('\n💡 Recomendaciones:');
    console.log('   • Verificar configuración de variables de entorno en Vercel');
    console.log('   • Revisar logs de Vercel para errores específicos');
    console.log('   • Confirmar que el deployment se completó correctamente');
  }
  
  return { streamResult, streamWithToolsResult, overallSuccess };
}

// Ejecutar las pruebas
runAllTests().catch(console.error);

export { testStreamEndpoint, testStreamWithToolsEndpoint, runAllTests };