/**
 * Simple Stream Test - Local testing
 * Tests just the core streaming functionality without full KB
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function testGeminiConnection() {
  log('\n🧪 Testing Gemini API Connection\n', 'blue');
  log('═'.repeat(60), 'cyan');
  
  try {
    // Test 1: Check API Key
    log('\n[TEST 1] Checking API Key...', 'blue');
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (!apiKey) {
      log('❌ FAILED: No API key found', 'red');
      log('Set GEMINI_API_KEY in your .env file', 'yellow');
      process.exit(1);
    }
    
    log(`✅ API Key found: ${apiKey.substring(0, 20)}...`, 'green');
    
    // Test 2: Initialize Client
    log('\n[TEST 2] Initializing Google GenAI Client...', 'blue');
    const client = new GoogleGenAI({ apiKey });
    log('✅ Client initialized successfully', 'green');
    
    // Test 3: Test model exists
    log('\n[TEST 3] Testing gemini-2.5-flash-lite model...', 'blue');
    try {
      const streamResponse = await client.models.generateContentStream({
        model: "gemini-2.5-flash-lite",
        contents: "Say 'Hello'",
        config: {
          temperature: 0.7,
          maxOutputTokens: 50,
        }
      });
      
      log('✅ Model gemini-2.5-flash-lite is accessible', 'green');
      
      // Collect response
      let response = '';
      for await (const chunk of streamResponse) {
        const text = chunk.text || '';
        response += text;
      }
      
      log(`✅ Response received: "${response.substring(0, 50)}..."`, 'green');
      
    } catch (modelError) {
      log(`❌ Model Error: ${modelError.message}`, 'red');
      
      // Try fallback model
      log('\n[TEST 3b] Trying fallback model gemini-1.5-flash...', 'yellow');
      try {
        const fallbackStream = await client.models.generateContentStream({
          model: "gemini-1.5-flash",
          contents: "Say 'Hello'",
          config: {
            temperature: 0.7,
            maxOutputTokens: 50,
          }
        });
        
        let fallbackResponse = '';
        for await (const chunk of fallbackStream) {
          fallbackResponse += chunk.text || '';
        }
        
        log('✅ Fallback model gemini-1.5-flash works', 'green');
        log(`   Response: "${fallbackResponse.substring(0, 50)}..."`, 'cyan');
        log('⚠️  Consider using gemini-1.5-flash in production', 'yellow');
        
      } catch (fallbackError) {
        log(`❌ Fallback also failed: ${fallbackError.message}`, 'red');
        throw fallbackError;
      }
    }
    
    // Test 4: Test streaming with longer content
    log('\n[TEST 4] Testing streaming with longer content...', 'blue');
    const longStream = await client.models.generateContentStream({
      model: "gemini-2.5-flash-lite",
      contents: "Explain what is blockchain in 3 sentences",
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });
    
    let chunks = 0;
    let totalChars = 0;
    for await (const chunk of longStream) {
      const text = chunk.text || '';
      totalChars += text.length;
      chunks++;
    }
    
    log(`✅ Streaming successful: ${chunks} chunks, ${totalChars} characters`, 'green');
    
    // Final result
    log('\n' + '═'.repeat(60), 'cyan');
    log('\n✅ ALL TESTS PASSED!', 'green');
    log('Your Gemini API connection is working correctly.\n', 'green');
    
  } catch (error) {
    log('\n' + '═'.repeat(60), 'cyan');
    log('\n❌ TEST FAILED', 'red');
    log(`Error: ${error.message}`, 'red');
    
    if (error.message?.includes('API key')) {
      log('\n💡 Tip: Check your GEMINI_API_KEY in .env', 'yellow');
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      log('\n💡 Tip: You may have exceeded your API quota', 'yellow');
    } else if (error.message?.includes('model')) {
      log('\n💡 Tip: The model name may be incorrect or unavailable', 'yellow');
    }
    
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testGeminiConnection();
