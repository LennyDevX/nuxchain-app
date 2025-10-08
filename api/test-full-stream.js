import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ✅ Cargar .env desde la raíz del proyecto ANTES de usar variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

console.log('[TEST] Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[TEST] Error loading .env:', result.error.message);
  console.error('[TEST] ⚠️ Tests will run without real API key');
} else {
  console.log('[TEST] ✅ .env loaded successfully');
  console.log('[TEST] 🔑 GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Available' : 'Missing');
}

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
  
  // Verificar API key
  const hasApiKey = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[TEST] API Key status: ${hasApiKey ? '✅ Available' : '⚠️ Missing'}`);
  
  if (!hasApiKey) {
    console.warn('[TEST] ⚠️ Running without real API key - expect fallback to BM25');
  }
  
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
    
    console.log('\n[TEST] Test completed!');
    console.log('[TEST] Status code:', testResponse.statusCode);
    
    // Evaluar resultado
    if (testResponse.statusCode === 200) {
      console.log('[TEST] ✅ Stream succeeded');
    } else if (testResponse.statusCode === 500 && !hasApiKey) {
      console.log('[TEST] ⚠️ Stream failed due to missing API key (expected in test mode)');
      console.log('[TEST] 💡 Set GEMINI_API_KEY in .env for full testing');
    } else {
      console.log('[TEST] ❌ Stream failed with unexpected error');
    }
    
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