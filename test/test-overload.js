/**
 * Utility to test Gemini API overload notifications
 * This file allows simulating 503 errors to verify the functioning
 * of the UI notification system
 */

// Function to simulate an overload error
export function simulateOverloadError() {
  const error = new Error('Service temporarily unavailable. The model is overloaded. Please try again in a few moments.');
  error.status = 503;
  error.retryAfter = 30;
  error.isOverload = true;
  return error;
}

// Function to simulate different types of API errors
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

// Function to test the useChatStreaming hook with simulated errors
export function testChatStreamingWithOverload() {
  console.log('🧪 Starting overload notification test...');
  
  // Simulate overload error
  const overloadError = simulateOverloadError();
  console.log('📋 Simulated error:', {
    message: overloadError.message,
    status: overloadError.status,
    retryAfter: overloadError.retryAfter,
    isOverload: overloadError.isOverload
  });
  
  return overloadError;
}

// Function to test different error scenarios
export function runErrorScenarios() {
  const scenarios = [
    { name: 'API Overload', type: 'overload' },
    { name: 'Request Timeout', type: 'timeout' },
    { name: 'Rate Limit', type: 'rate_limit' },
    { name: 'Server Error', type: 'server_error' }
  ];
  
  console.log('🎯 Running error test scenarios:');
  
  scenarios.forEach((scenario, index) => {
    console.log(`\n${index + 1}. ${scenario.name}:`);
    const error = simulateApiError(scenario.type);
    console.log('   - Status:', error.status);
    console.log('   - Message:', error.message);
    if (error.retryAfter) {
      console.log('   - Retry After:', error.retryAfter, 'seconds');
    }
    if (error.isOverload) {
      console.log('   - Is overload: Yes');
    }
  });
}

// Function to verify overload error detection
export function isOverloadError(error) {
  return (
    error?.status === 503 ||
    error?.isOverload === true ||
    error?.message?.toLowerCase().includes('overloaded') ||
    error?.message?.toLowerCase().includes('sobrecargado')
  );
}

// Function to extract retry information
export function extractRetryInfo(error) {
  const retryAfter = error?.retryAfter || 30; // Default 30 seconds
  const isOverload = isOverloadError(error);
  
  return {
    shouldRetry: isOverload,
    retryAfter,
    isOverload,
    message: error?.message || 'Unknown error'
  };
}

// Function to test the notification component
export function testNotificationComponent() {
  console.log('🔔 Testing notification component...');
  
  // Simulate different notification states
  const testStates = [
    { retryAfter: 30, message: 'Initial overload' },
    { retryAfter: 15, message: 'Half waiting time' },
    { retryAfter: 5, message: 'Almost ready to retry' },
    { retryAfter: 0, message: 'Retrying now' }
  ];
  
  testStates.forEach((state, index) => {
    console.log(`State ${index + 1}:`, state);
  });
  
  return testStates;
}

// Main function to run all tests
export function runAllTests() {
  console.log('🚀 Starting complete overload test suite...');
  console.log('=' .repeat(50));
  
  // Test 1: Error simulation
  console.log('\n📋 Test 1: Error simulation');
  runErrorScenarios();
  
  // Test 2: Overload detection
  console.log('\n🔍 Test 2: Overload detection');
  const overloadError = simulateOverloadError();
  const retryInfo = extractRetryInfo(overloadError);
  console.log('Retry information:', retryInfo);
  
  // Test 3: Notification component
  console.log('\n🔔 Test 3: Notification states');
  const notificationStates = testNotificationComponent();
  
  console.log('\n✅ All tests completed');
  console.log('=' .repeat(50));
  
  return {
    errorScenarios: true,
    overloadDetection: retryInfo,
    notificationStates
  };
}

// Export all functions for development use
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

// For browser console use
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
  
  console.log('🔧 Overload test utilities available in window.testOverload');
  console.log('💡 Run window.testOverload.runAllTests() to test everything');
}