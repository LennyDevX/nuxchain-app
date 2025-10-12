/**
 * Test directo de la API de Gemini Embeddings
 * Verifica que la API key funcione correctamente
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { GoogleGenAI } from '@google/genai';

// Cargar .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

console.log('🔍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
  process.exit(1);
}

async function testEmbeddingsAPI() {
  console.log('\n🧪 TEST DIRECTO DE GEMINI EMBEDDINGS API');
  console.log('='.repeat(70) + '\n');
  
  // 1. Verificar API key
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    console.error('💡 Add this line to your .env file:');
    console.error('   GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  console.log('✅ API Key found:', apiKey.substring(0, 20) + '...');
  console.log('📏 Key length:', apiKey.length, 'chars\n');
  
  // 2. Crear cliente
  console.log('🔧 Initializing GoogleGenAI client...');
  const ai = new GoogleGenAI({ apiKey });
  console.log('✅ Client initialized\n');
  
  // 3. Test de embeddings
  const testTexts = [
    'Nuxchain is a blockchain platform',
    'Staking rewards in cryptocurrency',
    'NFT marketplace features'
  ];
  
  console.log('📝 Testing embeddings for', testTexts.length, 'texts:\n');
  
  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`Test ${i + 1}/${testTexts.length}: "${text}"`);
    
    try {
      const startTime = Date.now();
      
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: text
      });
      
      const duration = Date.now() - startTime;
      
      // Extraer embedding
      const embedding = response.embeddings?.[0]?.values || response.embedding?.values;
      
      if (!embedding) {
        console.error('   ❌ No embedding in response');
        console.error('   Response:', JSON.stringify(response, null, 2));
        continue;
      }
      
      console.log(`   ✅ Success in ${duration}ms`);
      console.log(`   📊 Embedding dimensions: ${embedding.length}`);
      console.log(`   📈 Sample values: [${embedding.slice(0, 3).map(v => v.toFixed(4)).join(', ')}...]`);
      console.log(`   📉 Range: [${Math.min(...embedding).toFixed(4)}, ${Math.max(...embedding).toFixed(4)}]`);
      console.log();
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      if (error.message?.includes('quota')) {
        console.error('   💡 Quota exceeded - you may need to wait or upgrade');
      } else if (error.message?.includes('API key')) {
        console.error('   💡 Invalid API key - check your key at https://aistudio.google.com/apikey');
      }
      console.error('   Full error:', JSON.stringify(error, null, 2));
      console.log();
    }
  }
  
  console.log('='.repeat(70));
  console.log('✅ Embeddings API test completed\n');
}

// Run test
testEmbeddingsAPI().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
