/**
 * Simple Test script to diagnose 500 Internal Server Error
 * in /api/chat/stream endpoint
 * ES Module compatible version
 */

// Set environment variables if not present
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-key';
process.env.API_KEY = process.env.API_KEY || 'test-key';

// Mock Vercel request object - Vercel automatically parses JSON body
  const createMockRequest = (body = {}, method = 'POST', headers = {}) => ({
    method,
    headers: {
      'content-type': 'application/json',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'en-US,en;q=0.9',
      ...headers
    },
    // In Vercel, the body is already parsed
    body: body,
    url: '/api/chat/stream',
    // Add remoteAddress for rate limiter
    socket: {
      remoteAddress: '127.0.0.1'
    },
    // Add for Express compatibility
    on: () => {},
    destroy: () => {}
  });

// Mock Vercel response object
const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    writableEnded: false,
    destroyed: false,
    headersSent: false,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    getHeader(key) {
      return this.headers[key];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      console.log('[RESPONSE JSON]', data);
      this.writableEnded = true;
      return Promise.resolve(this);
    },
    write(chunk) {
      console.log('[RESPONSE CHUNK]', chunk.toString().substring(0, 100) + (chunk.length > 100 ? '...' : ''));
      return true;
    },
    end() {
      console.log('[RESPONSE END]');
      this.writableEnded = true;
    }
  };
  return res;
};

// Create a simple shim for modules that might be causing issues
  const shimModules = () => {
    // Shim for @google/genai
    class MockGoogleGenAI {
      constructor() {
        this.models = {
          generateContentStream: () => ({
            stream: {
              async *[Symbol.asyncIterator]() {
                yield { text: 'Hello! I am Nuvim AI 1.0, your intelligent Nuxchain assistant. I am here to help you with any questions about our blockchain ecosystem.' };
                yield { text: 'How can I assist you today?' };
              }
            }
          })
        };
      }
    }
    
    // Make the mock available globally temporarily
    global.MockGoogleGenAI = MockGoogleGenAI;
    
    // Mock the dynamic import for @google/genai
    const originalImport = globalThis.import;
    Object.defineProperty(globalThis, 'import', {
      value: async (specifier) => {
        if (specifier.includes('@google/genai')) {
          return { GoogleGenAI: MockGoogleGenAI };
        }
        return originalImport(specifier);
      },
      configurable: true
    });
  };

// Main test function
async function runTest() {
  console.log('\n[TEST] Starting stream endpoint diagnosis...\n');
  
  try {
    // Apply module shims
    shimModules();
    
    // Try importing the stream handler
    console.log('[TEST] Attempting to import stream.js...');
    
    // For ES modules, we need to use dynamic import
    let streamHandler;
    try {
      // First try ES module import
      const module = await import('./chat/stream.js');
      streamHandler = module.default || module;
      console.log('[TEST] Successfully imported stream handler');
    } catch (importError) {
      console.error('[TEST] Import error:', importError.message);
      
      // Try CommonJS require as fallback
      try {
        const module = require('./chat/stream.js');
        streamHandler = module.default || module;
        console.log('[TEST] Successfully required stream handler');
      } catch (requireError) {
        console.error('[TEST] Require error:', requireError.message);
        throw new Error('Failed to load stream handler module. Check module type compatibility (ESM vs CommonJS)');
      }
    }
    
    // Create test request with correct format according to API docs
      const testRequest = createMockRequest({
        message: 'What is Nuxchain?',
        conversationHistory: []
      });
      const testResponse = createMockResponse();
    
    // Execute the handler
    console.log('[TEST] Executing stream handler...');
    await streamHandler(testRequest, testResponse);
    
    console.log('\n[TEST] Test completed successfully!');
    console.log('[TEST] Status code:', testResponse.statusCode);
    console.log('[TEST] Headers:', testResponse.headers);
    
  } catch (error) {
    console.error('\n[TEST] Test failed with error:');
    console.error(error);
    
    // Try to identify common issues
    if (error.message.includes('Cannot find module')) {
      console.error('\n[DIAGNOSIS] Missing dependency or incorrect file path');
      console.error('Suggestion: Run "npm install" to ensure all dependencies are installed');
    } else if (error.message.includes('Unexpected token')) {
      console.error('\n[DIAGNOSIS] Syntax error or incompatible module type');
      console.error('Suggestion: Check if all files use the same module system (ESM) as specified in package.json');
    } else if (error.message.includes('export')) {
      console.error('\n[DIAGNOSIS] Export/import mismatch');
      console.error('Suggestion: Verify all modules use consistent ESM export syntax');
    } else {
      console.error('\n[DIAGNOSIS] General server error');
      console.error('Suggestion: Check server logs for detailed error information');
    }
  }
}

// Run the test
runTest().catch(err => {
  console.error('[FATAL] Unhandled error:', err);
  process.exit(1);
});