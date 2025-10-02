import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// ✅ Cargar .env desde la raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '..', '.env');

console.log('🔍 Loading .env from:', envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error loading .env:', result.error.message);
} else {
  console.log('✅ .env loaded successfully');
}

// Importar handler después de cargar .env
const { default: handler } = await import('./chat/stream.js');

// ============================================================================
// EMBEDDINGS INTERCEPTOR - Para capturar métricas de búsqueda
// ============================================================================
let lastEmbeddingMetrics = null;

// Monkey-patch del servicio de embeddings para capturar métricas
async function setupEmbeddingsInterceptor() {
  try {
    const embeddingsModule = await import('./services/embeddings-service.js');
    const originalSearchSimilar = embeddingsModule.searchSimilar;
    const originalGetRelevantContext = embeddingsModule.getRelevantContext;
    
    // Interceptar searchSimilar
    if (originalSearchSimilar) {
      embeddingsModule.searchSimilar = async function(...args) {
        const result = await originalSearchSimilar.apply(this, args);
        
        // Capturar métricas si están disponibles
        if (result && Array.isArray(result)) {
          lastEmbeddingMetrics = {
            documentsFound: result.length,
            scores: result.map(r => r.score).slice(0, 5),
            topScore: result.length > 0 ? result[0].score : 0,
            avgScore: result.length > 0 ? result.reduce((sum, r) => sum + r.score, 0) / result.length : 0,
            contextLength: result.reduce((sum, r) => sum + (r.content?.length || 0), 0),
            hasHighQuality: result.some(r => r.score > 0.7)
          };
        }
        
        return result;
      };
    }
    
    // Interceptar getRelevantContext
    if (originalGetRelevantContext) {
      embeddingsModule.getRelevantContext = async function(...args) {
        const result = await originalGetRelevantContext.apply(this, args);
        
        // Capturar información adicional
        if (result && typeof result === 'string') {
          if (lastEmbeddingMetrics) {
            lastEmbeddingMetrics.contextRetrieved = result.length;
          } else {
            lastEmbeddingMetrics = {
              contextRetrieved: result.length,
              documentsFound: 0,
              scores: []
            };
          }
        }
        
        return result;
      };
    }
    
    console.log('✅ Embeddings interceptor configurado');
  } catch (error) {
    console.log('⚠️  No se pudo configurar interceptor de embeddings:', error.message);
  }
}

// Llamar al setup
await setupEmbeddingsInterceptor();

// ============================================================================
// MOCK RESPONSE
// ============================================================================
class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = {};
    this.body = '';
    this.ended = false;
    this.headersSent = false;
  }
  
  setHeader(key, value) {
    this.headers[key] = value;
  }
  
  status(code) {
    this.statusCode = code;
    return this;
  }
  
  json(data) {
    if (this.ended) return;
    this.setHeader('Content-Type', 'application/json');
    this.body += JSON.stringify(data);
    this.ended = true;
    this.headersSent = true;
  }
  
  write(chunk) {
    if (this.ended) return;
    if (typeof chunk === 'object') chunk = String(chunk);
    this.body += chunk;
    this.headersSent = true;
  }
  
  end() {
    if (this.ended) return;
    this.ended = true;
    this.headersSent = true;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
function createMockRequest(body, opts = {}) {
  return {
    method: opts.method || 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': opts.ip || '127.0.0.1',
      'user-agent': 'Test-Client/1.0',
      ...(opts.headers || {})
    },
    body
  };
}

async function invokeHandler(req, res, timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    let finished = false;
    const timer = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error('Handler timeout'));
      }
    }, timeoutMs);

    (async () => {
      try {
        await handler(req, res);
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve();
        }
      } catch (err) {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          reject(err);
        }
      }
    })();
  });
}

function countChunks(body) {
  const lines = body.split('\n');
  return lines.filter(line => line.startsWith('data:')).length;
}

function analyzeResponse(body) {
  const chunks = countChunks(body);
  const totalChars = body.length;
  
  // Extraer el texto completo de la respuesta
  let fullText = '';
  const lines = body.split('\n');
  for (const line of lines) {
    if (line.startsWith('data:') && !line.includes('[DONE]')) {
      try {
        const data = JSON.parse(line.substring(5).trim());
        if (data.text) fullText += data.text;
      } catch (e) {
        // Ignorar líneas malformadas
      }
    }
  }
  
  // Detectar si probablemente usó la base de conocimientos
  const knowledgeIndicators = [
    /nuxchain/i,
    /staking/i,
    /marketplace/i,
    /nft/i,
    /blockchain/i,
    /pol\b/i,
    /polygon/i,
    /descentralizad/i,
    /smart contract/i,
    /recompensa/i
  ];
  
  const usedKnowledge = knowledgeIndicators.some(pattern => pattern.test(fullText));
  const avgChunkSize = chunks > 0 ? Math.round(totalChars / chunks) : 0;
  
  return {
    chunks,
    totalChars,
    fullText,
    usedKnowledge,
    avgChunkSize,
    wordsCount: fullText.split(/\s+/).length
  };
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================
async function testFormat(name, body, expectKnowledge = false) {
  console.log('\n' + '═'.repeat(80));
  console.log(`📋 TEST: ${name}`);
  console.log('═'.repeat(80));
  
  // Reset metrics antes del test
  lastEmbeddingMetrics = null;
  
  const req = createMockRequest(body);
  const res = new MockResponse();

  const start = Date.now();
  try {
    await invokeHandler(req, res);
    const duration = Date.now() - start;
    const analysis = analyzeResponse(res.body);
    
    // Header del resultado
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📊 RESULTADO DEL TEST`);
    console.log(`${'─'.repeat(80)}`);
    
    // Status y timing
    const statusIcon = res.statusCode === 200 ? '✅' : '❌';
    console.log(`${statusIcon} Status Code: ${res.statusCode}`);
    console.log(`⏱️  Duración: ${duration}ms`);
    console.log(`⚡ Velocidad: ~${Math.round(analysis.wordsCount / (duration / 1000))} palabras/seg`);
    
    // Métricas de streaming
    console.log(`\n� MÉTRICAS DE STREAMING:`);
    console.log(`   • Chunks recibidos: ${analysis.chunks}`);
    console.log(`   • Tamaño promedio por chunk: ${analysis.avgChunkSize} chars`);
    console.log(`   • Total de caracteres: ${analysis.totalChars}`);
    console.log(`   • Total de palabras: ${analysis.wordsCount}`);
    
    // Métricas de embeddings (si están disponibles)
    if (lastEmbeddingMetrics && lastEmbeddingMetrics.documentsFound > 0) {
      console.log(`\n🔍 MÉTRICAS DE BÚSQUEDA SEMÁNTICA:`);
      console.log(`   • Documentos encontrados: ${lastEmbeddingMetrics.documentsFound}`);
      console.log(`   • Score máximo: ${lastEmbeddingMetrics.topScore.toFixed(3)}`);
      console.log(`   • Score promedio: ${lastEmbeddingMetrics.avgScore.toFixed(3)}`);
      console.log(`   • Top 3 scores: ${lastEmbeddingMetrics.scores.slice(0, 3).map(s => s.toFixed(3)).join(', ')}`);
      console.log(`   • Calidad alta (>0.7): ${lastEmbeddingMetrics.hasHighQuality ? '✅ Sí' : '⚠️  No'}`);
      
      if (lastEmbeddingMetrics.contextRetrieved) {
        console.log(`   • Contexto recuperado: ${lastEmbeddingMetrics.contextRetrieved} caracteres`);
      }
      
      // Análisis de calidad
      const qualityLevel = lastEmbeddingMetrics.topScore > 0.7 ? '🟢 Excelente' :
                          lastEmbeddingMetrics.topScore > 0.5 ? '🟡 Bueno' :
                          lastEmbeddingMetrics.topScore > 0.3 ? '🟠 Regular' : '🔴 Bajo';
      console.log(`   • Nivel de relevancia: ${qualityLevel}`);
    } else if (expectKnowledge) {
      console.log(`\n🔍 MÉTRICAS DE BÚSQUEDA SEMÁNTICA:`);
      console.log(`   ⚠️  No se capturaron métricas de embeddings`);
      console.log(`   ℹ️  Posible respuesta sin consulta a KB`);
    }
    
    // Base de conocimientos
    if (expectKnowledge) {
      const knowledgeIcon = analysis.usedKnowledge ? '🎓' : '⚠️';
      console.log(`\n${knowledgeIcon} BASE DE CONOCIMIENTOS:`);
      if (analysis.usedKnowledge) {
        console.log(`   ✓ Detectado uso de conocimiento específico de Nuxchain`);
        console.log(`   ✓ Respuesta contextualizada con información de la KB`);
      } else {
        console.log(`   ⚠ No se detectó uso claro de la base de conocimientos`);
        console.log(`   ℹ La respuesta puede ser general sin contexto específico`);
      }
    }
    
    // Preview de la respuesta
    console.log(`\n💬 PREVIEW DE RESPUESTA:`);
    const preview = analysis.fullText.substring(0, 150);
    console.log(`   "${preview}${analysis.fullText.length > 150 ? '...' : ''}"`);
    
    // Resultado final
    console.log(`\n${'─'.repeat(80)}`);
    if (res.statusCode === 200 && analysis.chunks > 0) {
      console.log(`✅ TEST PASSED`);
    } else {
      console.log(`❌ TEST FAILED`);
    }
    console.log(`${'─'.repeat(80)}`);
    
    return {
      passed: res.statusCode === 200 && analysis.chunks > 0,
      duration,
      ...analysis
    };
    
  } catch (err) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`❌ ERROR EN EL TEST`);
    console.log(`${'─'.repeat(80)}`);
    console.error(`💥 Error: ${err.message}`);
    if (err.stack) {
      console.error(`📍 Stack trace (primeras líneas):`);
      console.error(err.stack.split('\n').slice(0, 5).join('\n'));
    }
    console.log(`${'─'.repeat(80)}`);
    
    return {
      passed: false,
      error: err.message,
      duration: Date.now() - start
    };
  }
}

// ============================================================================
// RUN TESTS
// ============================================================================
async function runTests() {
  console.log('\n' + '█'.repeat(80));
  console.log('🧪 NUXCHAIN API - SUITE DE TESTS COMPLETA');
  console.log('█'.repeat(80));

  // Verificar API key
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('\n❌ GEMINI_API_KEY no configurada en .env');
    console.error('💡 Verifica que el archivo .env existe y contiene:');
    console.error('   GEMINI_API_KEY=tu_api_key_aqui\n');
    process.exit(1);
  }
  
  console.log(`\n✅ API Key configurada: ${apiKey.substring(0, 20)}...`);
  console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
  console.log(`🖥️  Node: ${process.version}\n`);

  const results = [];

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS DE FORMATO DE ENTRADA
  // ═══════════════════════════════════════════════════════════════════════
  
  console.log('\n' + '▓'.repeat(80));
  console.log('📦 SECCIÓN 1: TESTS DE FORMATOS DE ENTRADA');
  console.log('▓'.repeat(80));

  // Test 1: Formato Gemini (messages array)
  results.push(await testFormat(
    'Formato Gemini - Messages Array',
    {
      messages: [
        { role: 'user', parts: [{ text: 'Hola, ¿qué es Nuxchain?' }] }
      ],
      model: 'gemini-2.5-flash-lite',
      stream: true
    },
    true // Espera uso de KB
  ));

  await new Promise(r => setTimeout(r, 2000));

  // Test 2: Formato simple (message string)
  results.push(await testFormat(
    'Formato Simple - Message String',
    {
      message: 'Explícame qué características tiene el staking de Nuxchain'
    },
    true // Espera uso de KB
  ));

  await new Promise(r => setTimeout(r, 2000));

  // Test 3: Formato conversación (array)
  results.push(await testFormat(
    'Formato Conversación - Array',
    [
      { role: 'user', content: 'Hola' },
      { role: 'assistant', content: '¡Hola! ¿En qué puedo ayudarte?' },
      { role: 'user', content: '¿Qué es blockchain?' }
    ],
    false // Pregunta general
  ));

  await new Promise(r => setTimeout(r, 2000));

  // ═══════════════════════════════════════════════════════════════════════
  // TESTS DE BASE DE CONOCIMIENTOS
  // ═══════════════════════════════════════════════════════════════════════
  
  console.log('\n' + '▓'.repeat(80));
  console.log('🎓 SECCIÓN 2: TESTS DE BASE DE CONOCIMIENTOS');
  console.log('▓'.repeat(80));

  // Test 4: Consulta sobre NFT Marketplace
  results.push(await testFormat(
    'KB - NFT Marketplace',
    {
      message: '¿Cómo funciona el marketplace de NFTs en Nuxchain y qué características tiene?'
    },
    true // Espera uso de KB
  ));

  await new Promise(r => setTimeout(r, 2000));

  // Test 5: Consulta sobre Polygon/POL
  results.push(await testFormat(
    'KB - Integración POL',
    {
      message: '¿Qué relación tiene Nuxchain con Polygon POL?'
    },
    true // Espera uso de KB
  ));

  await new Promise(r => setTimeout(r, 2000));

  // Test 6: Consulta sobre Smart Staking
  results.push(await testFormat(
    'KB - Smart Staking',
    {
      message: '¿Qué recompensas puedo obtener con el smart staking?'
    },
    true // Espera uso de KB
  ));

  // ═══════════════════════════════════════════════════════════════════════
  // RESUMEN FINAL
  // ═══════════════════════════════════════════════════════════════════════
  
  console.log('\n' + '█'.repeat(80));
  console.log('📊 RESUMEN FINAL DE TESTS');
  console.log('█'.repeat(80));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  const avgDuration = Math.round(results.reduce((sum, r) => sum + r.duration, 0) / total);
  const totalWords = results.reduce((sum, r) => sum + (r.wordsCount || 0), 0);
  const kbUsage = results.filter(r => r.usedKnowledge).length;
  
  console.log(`\n✅ Tests Exitosos: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  console.log(`❌ Tests Fallidos: ${failed}/${total}`);
  console.log(`⏱️  Duración Promedio: ${avgDuration}ms`);
  console.log(`📝 Total de Palabras Generadas: ${totalWords}`);
  console.log(`🎓 Tests con KB Detectada: ${kbUsage}/${total}`);
  
  console.log(`\n${'─'.repeat(80)}`);
  console.log('📋 DETALLES POR TEST:');
  console.log('─'.repeat(80));
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const kb = result.usedKnowledge ? '🎓 KB' : '💭 General';
    console.log(`${index + 1}. ${status} | ${kb} | ${result.duration}ms | ${result.wordsCount || 0} palabras`);
  });
  
  console.log('\n' + '█'.repeat(80));
  
  if (failed === 0) {
    console.log('🎉 ¡TODOS LOS TESTS PASARON EXITOSAMENTE!');
  } else {
    console.log('⚠️  ALGUNOS TESTS FALLARON - REVISAR LOGS ARRIBA');
  }
  
  console.log('█'.repeat(80) + '\n');
  
  // Exit code basado en resultados
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runTests().catch(err => {
  console.error('💥 Fallo crítico en tests:', err.message);
  if (err.stack) console.error(err.stack);
  process.exit(1);
});
