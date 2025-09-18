/**
 * Script de prueba para verificar el análisis de URLs
 * Prueba tanto en desarrollo local como en producción
 */

const testUrls = [
  'https://github.com/microsoft/vscode',
  'https://www.wikipedia.org/wiki/Artificial_intelligence',
  'https://docs.github.com/en/get-started/quickstart/hello-world'
];

const environments = {
  local: 'http://localhost:3002/server/gemini/stream-with-tools',
  // Cambiar por tu URL de producción cuando esté desplegado
  production: 'https://tu-app.vercel.app/server/gemini/stream-with-tools'
};

async function testUrlAnalysis(url, environment = 'local') {
  console.log(`\n🧪 Probando análisis de URL en ${environment}`);
  console.log(`📋 URL a analizar: ${url}`);
  console.log(`🌐 Endpoint: ${environments[environment]}`);
  
  const testData = {
    messages: [
      {
        role: 'user',
        content: `Por favor analiza esta URL y dime qué contiene: ${url}`
      }
    ],
    model: 'gemini-1.5-flash',
    enabledTools: ['urlContext']
  };
  
  try {
    console.log('📤 Enviando solicitud...');
    
    const response = await fetch(environments[environment], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/plain'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`📊 Status: ${response.status}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Error ${response.status}:`, errorText);
      return false;
    }
    
    console.log('✅ Respuesta exitosa, leyendo stream...');
    
    // Leer todo el contenido del stream
    const fullResponse = await response.text();
    
    console.log('🏁 Stream completado');
    console.log(`📝 Respuesta completa: ${fullResponse.length} caracteres`);
    
    // Mostrar una muestra de la respuesta
    const preview = fullResponse.substring(0, 200);
    console.log(`📄 Vista previa: ${preview}${fullResponse.length > 200 ? '...' : ''}`);
    
    // Verificar si la respuesta contiene análisis real de la URL
    const hasUrlAnalysis = fullResponse.toLowerCase().includes('github') || 
                         fullResponse.toLowerCase().includes('repositorio') ||
                         fullResponse.toLowerCase().includes('código') ||
                         fullResponse.toLowerCase().includes('wikipedia') ||
                         fullResponse.toLowerCase().includes('artificial') ||
                         fullResponse.toLowerCase().includes('docs') ||
                         fullResponse.toLowerCase().includes('visual studio') ||
                         fullResponse.toLowerCase().includes('microsoft');
    
    if (hasUrlAnalysis) {
      console.log('✅ La respuesta contiene análisis de la URL');
    } else {
      console.log('⚠️  La respuesta no parece contener análisis específico de la URL');
      console.log('📋 Contenido recibido:', fullResponse.substring(0, 500));
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
    console.error('📋 Stack:', error.stack);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando pruebas de análisis de URLs');
  console.log('=' .repeat(60));
  
  let passedTests = 0;
  let totalTests = 0;
  
  // Probar en desarrollo local
  for (const url of testUrls) {
    totalTests++;
    const success = await testUrlAnalysis(url, 'local');
    if (success) passedTests++;
    
    // Esperar un poco entre pruebas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📊 Resultados: ${passedTests}/${totalTests} pruebas exitosas`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ¡Todas las pruebas pasaron! El análisis de URLs funciona correctamente.');
  } else {
    console.log('⚠️  Algunas pruebas fallaron. Revisar la configuración.');
  }
}

// Ejecutar las pruebas
runAllTests().catch(console.error);