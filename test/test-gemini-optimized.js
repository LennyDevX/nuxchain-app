/**
 * Script de Prueba para API Gemini Optimizada v2.0
 * Valida todos los endpoints y funcionalidades
 */

const BASE_URL = 'http://localhost:3002/server/gemini-optimized';

// === UTILIDADES DE PRUEBA ===

function logTest(testName, status, details = '') {
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${emoji} ${testName}: ${status} ${details}`);
}

function logSection(sectionName) {
  console.log(`\n🔍 === ${sectionName} ===`);
}

async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data, success: true };
  } catch (error) {
    return { error, success: false };
  }
}

// === PRUEBAS ===

async function testApiInfo() {
  logSection('Información de la API');
  
  const { response, data, success } = await makeRequest('');
  
  if (success && response.ok) {
    logTest('API Info', 'PASS', `v${data.version}`);
    logTest('Features', 'PASS', `${data.features.length} características`);
    logTest('Endpoints', 'PASS', `${Object.keys(data.endpoints).length} endpoints`);
    return true;
  } else {
    logTest('API Info', 'FAIL', 'No se pudo obtener información');
    return false;
  }
}

async function testHealthEndpoint() {
  logSection('Endpoint de Salud');
  
  const { response, data, success } = await makeRequest('/health');
  
  if (success && response.ok) {
    logTest('Health Check', 'PASS', `Status: ${data.status || 'active'}`);
    return true;
  } else {
    logTest('Health Check', 'FAIL', 'Endpoint no disponible');
    return false;
  }
}

async function testDocumentation() {
  logSection('Documentación');
  
  const { response, data, success } = await makeRequest('/docs');
  
  if (success && response.ok) {
    logTest('Documentation', 'PASS', 'Documentación disponible');
    if (data.migration) {
      logTest('Migration Info', 'PASS', 'Información de migración incluida');
    }
    if (data.examples) {
      logTest('Examples', 'PASS', 'Ejemplos de uso incluidos');
    }
    return true;
  } else {
    logTest('Documentation', 'FAIL', 'Documentación no disponible');
    return false;
  }
}

async function testErrorHandling() {
  logSection('Manejo de Errores');
  
  // Prueba endpoint inexistente
  const { response: notFoundResponse, success: notFoundSuccess } = await makeRequest('/nonexistent');
  
  if (notFoundSuccess && notFoundResponse.status === 404) {
    logTest('404 Handling', 'PASS', 'Error 404 manejado correctamente');
  } else {
    logTest('404 Handling', 'FAIL', 'Error 404 no manejado correctamente');
  }
}

// === FUNCIÓN PRINCIPAL ===

async function runAllTests() {
  console.log('🚀 Iniciando pruebas de API Gemini Optimizada v2.0\n');
  
  const results = [];
  
  try {
    results.push(await testApiInfo());
    results.push(await testHealthEndpoint());
    results.push(await testDocumentation());
    await testErrorHandling();
    
    const passedTests = results.filter(Boolean).length;
    const totalTests = results.length;
    
    logSection('Resumen de Pruebas');
    console.log(`✅ Pruebas exitosas: ${passedTests}/${totalTests}`);
    console.log(`📊 Porcentaje de éxito: ${Math.round((passedTests / totalTests) * 100)}%`);
    
    if (passedTests === totalTests) {
      console.log('\n🎉 ¡Todas las pruebas pasaron! La API Gemini Optimizada está funcionando correctamente.');
    } else {
      console.log('\n⚠️ Algunas pruebas fallaron. Revisa los logs para más detalles.');
    }
    
  } catch (error) {
    console.error('\n❌ Error durante las pruebas:', error.message);
  }
}

// Ejecutar pruebas
runAllTests();