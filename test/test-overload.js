/**
 * Utilidad para probar las notificaciones de sobrecarga de la API de Gemini
 * Este archivo permite simular errores 503 para verificar el funcionamiento
 * del sistema de notificaciones UI
 */

// Función para simular un error de sobrecarga
export function simulateOverloadError() {
  const error = new Error('Servicio temporalmente no disponible. El modelo está sobrecargado. Por favor, inténtalo de nuevo en unos momentos.');
  error.status = 503;
  error.retryAfter = 30;
  error.isOverload = true;
  return error;
}

// Función para simular diferentes tipos de errores de API
export function simulateApiError(type = 'overload') {
  switch (type) {
    case 'overload':
      return simulateOverloadError();
    
    case 'timeout':
      const timeoutError = new Error('Request timeout');
      timeoutError.status = 408;
      return timeoutError;
    
    case 'rate_limit':
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.status = 429;
      rateLimitError.retryAfter = 60;
      return rateLimitError;
    
    case 'server_error':
      const serverError = new Error('Internal server error');
      serverError.status = 500;
      return serverError;
    
    default:
      return simulateOverloadError();
  }
}

// Función para probar el hook useChatStreaming con errores simulados
export function testChatStreamingWithOverload() {
  console.log('🧪 Iniciando prueba de notificaciones de sobrecarga...');
  
  // Simular error de sobrecarga
  const overloadError = simulateOverloadError();
  console.log('📋 Error simulado:', {
    message: overloadError.message,
    status: overloadError.status,
    retryAfter: overloadError.retryAfter,
    isOverload: overloadError.isOverload
  });
  
  return overloadError;
}

// Función para probar diferentes escenarios de error
export function runErrorScenarios() {
  const scenarios = [
    { name: 'Sobrecarga de API', type: 'overload' },
    { name: 'Timeout de solicitud', type: 'timeout' },
    { name: 'Límite de tasa', type: 'rate_limit' },
    { name: 'Error del servidor', type: 'server_error' }
  ];
  
  console.log('🎯 Ejecutando escenarios de prueba de errores:');
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}:`);
    const error = simulateApiError(scenario.type);
    console.log('   - Status:', error.status);
    console.log('   - Message:', error.message);
    if (error.retryAfter) {
      console.log('   - Retry After:', error.retryAfter, 'segundos');
    }
    if (error.isOverload) {
      console.log('   - Es sobrecarga: Sí');
    }
  });
}

// Función para verificar la detección de errores de sobrecarga
export function isOverloadError(error) {
  return (
    error?.status === 503 ||
    error?.isOverload === true ||
    error?.message?.toLowerCase().includes('overloaded') ||
    error?.message?.toLowerCase().includes('sobrecargado')
  );
}

// Función para extraer información de reintento
export function extractRetryInfo(error) {
  const retryAfter = error?.retryAfter || 30; // Default 30 segundos
  const isOverload = isOverloadError(error);
  
  return {
    shouldRetry: isOverload,
    retryAfter,
    isOverload,
    message: error?.message || 'Error desconocido'
  };
}

// Función para probar el componente de notificación
export function testNotificationComponent() {
  console.log('🔔 Probando componente de notificación...');
  
  // Simular diferentes estados de la notificación
  const testStates = [
    { retryAfter: 30, message: 'Sobrecarga inicial' },
    { retryAfter: 15, message: 'Mitad del tiempo de espera' },
    { retryAfter: 5, message: 'Casi listo para reintentar' },
    { retryAfter: 0, message: 'Reintentando ahora' }
  ];
  
  testStates.forEach((state, index) => {
    console.log(`Estado ${index + 1}:`, state);
  });
  
  return testStates;
}

// Función principal para ejecutar todas las pruebas
export function runAllTests() {
  console.log('🚀 Iniciando suite completa de pruebas de sobrecarga...');
  console.log('=' .repeat(50));
  
  // Prueba 1: Simulación de errores
  console.log('\n📋 Prueba 1: Simulación de errores');
  runErrorScenarios();
  
  // Prueba 2: Detección de sobrecarga
  console.log('\n🔍 Prueba 2: Detección de sobrecarga');
  const overloadError = simulateOverloadError();
  const retryInfo = extractRetryInfo(overloadError);
  console.log('Información de reintento:', retryInfo);
  
  // Prueba 3: Componente de notificación
  console.log('\n🔔 Prueba 3: Estados de notificación');
  const notificationStates = testNotificationComponent();
  
  console.log('\n✅ Todas las pruebas completadas');
  console.log('=' .repeat(50));
  
  return {
    errorScenarios: true,
    overloadDetection: retryInfo,
    notificationStates
  };
}

// Exportar todas las funciones para uso en desarrollo
export default {
  simulateOverloadError,
  simulateApiError,
  testChatStreamingWithOverload,
  runErrorScenarios,
  isOverloadError,
  extractRetryInfo,
  testNotificationComponent,
  runAllTests
};

// Para uso en consola del navegador
if (typeof window !== 'undefined') {
  window.testOverload = {
    simulateOverloadError,
    simulateApiError,
    testChatStreamingWithOverload,
    runErrorScenarios,
    isOverloadError,
    extractRetryInfo,
    testNotificationComponent,
    runAllTests
  };
  
  console.log('🔧 Utilidades de prueba de sobrecarga disponibles en window.testOverload');
  console.log('💡 Ejecuta window.testOverload.runAllTests() para probar todo');
}