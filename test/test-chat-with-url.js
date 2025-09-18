// Test del endpoint de chat con análisis de URL
import fetch from 'node-fetch';

const testChatWithUrl = async () => {
  console.log('🧪 Iniciando prueba del chat con análisis de URL...');
  
  const testData = {
    messages: [
      {
        role: 'user',
        content: 'Analiza esta página web: https://github.com/microsoft/vscode y dime qué es lo más importante'
      }
    ],
    enabledTools: ['urlContext']
  };
  
  try {
    console.log('📤 Enviando solicitud al endpoint...');
    console.log('📋 Datos:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3002/server/gemini/stream-with-tools', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error en la respuesta:', errorText);
      return;
    }
    
    console.log('✅ Respuesta exitosa, leyendo stream...');
    
    // En Node.js, response.body es un ReadableStream diferente
    let fullResponse = '';
    
    response.body.on('data', (chunk) => {
      const text = chunk.toString();
      console.log('📦 Chunk recibido:', text);
      fullResponse += text;
    });
    
    response.body.on('end', () => {
      console.log('🏁 Stream completado');
      console.log('📄 Respuesta completa:', fullResponse);
    });
    
    response.body.on('error', (error) => {
      console.error('❌ Error en stream:', error);
    });
    
    // Esperar a que termine el stream
    await new Promise((resolve, reject) => {
      response.body.on('end', resolve);
      response.body.on('error', reject);
    });
    
    console.log('\n\n🎉 Stream completado');
    console.log('📝 Respuesta completa:', fullResponse.length, 'caracteres');
    
    // Verificar que la respuesta contiene análisis de URL
    if (fullResponse.includes('github') || fullResponse.includes('Visual Studio Code') || fullResponse.includes('Microsoft')) {
      console.log('✅ La respuesta parece contener análisis de la URL');
    } else {
      console.log('⚠️ La respuesta no parece contener análisis específico de la URL');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('📋 Stack:', error.stack);
  }
};

// Ejecutar la prueba
testChatWithUrl();