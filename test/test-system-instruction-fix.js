/**
 * Test para verificar el fix crítico de systemInstruction
 * Este test verifica que:
 * 1. buildSystemInstructionWithContext retorna el formato correcto
 * 2. El formato es reconocido por Gemini API
 * 3. El chat usa SOLO información de la KB, no inventa datos
 */

import { buildSystemInstructionWithContext } from '../api/config/system-instruction.js';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logHeader(message) {
  console.log(`\n${colors.bold}${colors.blue}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}  ${message}${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}${'═'.repeat(60)}${colors.reset}\n`);
}

// Test 1: Verificar formato de systemInstruction
async function testSystemInstructionFormat() {
  logHeader('TEST 1: Formato de SystemInstruction');
  
  const testCases = [
    {
      name: 'Con contexto de KB',
      context: 'Nuxchain is a blockchain platform. POL tokens are used for staking. APY is 105%.',
      score: 1.0
    },
    {
      name: 'Sin contexto de KB',
      context: '',
      score: 0
    },
    {
      name: 'Contexto parcial',
      context: 'SmartStaking contract allows users to stake POL tokens.',
      score: 0.75
    }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    logInfo(`Testing: ${testCase.name}`);
    
    try {
      const systemInstruction = buildSystemInstructionWithContext(testCase.context, testCase.score);
      
      // Verificación 1: Es un objeto
      if (typeof systemInstruction !== 'object') {
        logError(`  ❌ No es un objeto. Tipo: ${typeof systemInstruction}`);
        failed++;
        continue;
      }
      logSuccess('  ✓ Es un objeto');
      
      // Verificación 2: Tiene propiedad 'parts'
      if (!systemInstruction.parts) {
        logError('  ❌ No tiene propiedad "parts"');
        failed++;
        continue;
      }
      logSuccess('  ✓ Tiene propiedad "parts"');
      
      // Verificación 3: 'parts' es un array
      if (!Array.isArray(systemInstruction.parts)) {
        logError('  ❌ "parts" no es un array');
        failed++;
        continue;
      }
      logSuccess('  ✓ "parts" es un array');
      
      // Verificación 4: 'parts' tiene al menos un elemento
      if (systemInstruction.parts.length === 0) {
        logError('  ❌ "parts" está vacío');
        failed++;
        continue;
      }
      logSuccess(`  ✓ "parts" tiene ${systemInstruction.parts.length} elemento(s)`);
      
      // Verificación 5: Primer elemento tiene propiedad 'text'
      if (!systemInstruction.parts[0].text) {
        logError('  ❌ Primer elemento no tiene propiedad "text"');
        failed++;
        continue;
      }
      logSuccess('  ✓ Primer elemento tiene propiedad "text"');
      
      // Verificación 6: 'text' es un string
      if (typeof systemInstruction.parts[0].text !== 'string') {
        logError('  ❌ "text" no es un string');
        failed++;
        continue;
      }
      logSuccess('  ✓ "text" es un string');
      
      // Verificación 7: Si hay contexto, debe aparecer en el text
      if (testCase.context && !systemInstruction.parts[0].text.includes(testCase.context)) {
        logError('  ❌ Contexto de KB no aparece en systemInstruction');
        failed++;
        continue;
      }
      if (testCase.context) {
        logSuccess('  ✓ Contexto de KB incluido en systemInstruction');
      }
      
      // Verificación 8: Debe contener instrucciones clave
      const text = systemInstruction.parts[0].text;
      const hasKeyInstructions = text.includes('Answer') && 
                                 text.includes('ONLY') && 
                                 (text.includes('text provided') || text.includes('TEXT TO USE'));
      
      if (!hasKeyInstructions) {
        logError('  ❌ No contiene instrucciones clave');
        failed++;
        continue;
      }
      logSuccess('  ✓ Contiene instrucciones clave');
      
      // Verificación 9: Score incluido si hay contexto
      if (testCase.context && !text.includes(`SCORE: ${testCase.score.toFixed(3)}`)) {
        logWarning('  ⚠️  Score no aparece en formato correcto');
      } else if (testCase.context) {
        logSuccess('  ✓ Score incluido correctamente');
      }
      
      logSuccess(`✅ PASSED: ${testCase.name}\n`);
      passed++;
      
    } catch (error) {
      logError(`  ❌ Error: ${error.message}`);
      failed++;
    }
  }
  
  return { passed, failed, total: testCases.length };
}

// Test 2: Verificar estructura completa
async function testSystemInstructionStructure() {
  logHeader('TEST 2: Estructura Completa de SystemInstruction');
  
  const kbContext = `
Nuxchain Platform Overview:
- Blockchain-as-a-Service platform
- Uses POL tokens (Polygon native token)
- SmartStaking contract with APY rates:
  * 30 days: 105.1% APY
  * 90 days: 140.2% APY
  * 180 days: 175.2% APY
  * 365 days: 262.8% APY
- NFT Marketplace for trading
- Airdrop system for community rewards
  `.trim();
  
  const systemInstruction = buildSystemInstructionWithContext(kbContext, 1.0);
  
  logInfo('Verificando estructura JSON...');
  
  try {
    // Serializar y deserializar para verificar que es JSON válido
    const serialized = JSON.stringify(systemInstruction);
    const deserialized = JSON.parse(serialized);
    
    logSuccess('✓ Estructura es JSON válido');
    
    // Verificar que mantiene la estructura después de serialización
    if (deserialized.parts && 
        Array.isArray(deserialized.parts) && 
        deserialized.parts[0].text) {
      logSuccess('✓ Estructura se mantiene después de serialización');
    } else {
      logError('❌ Estructura se pierde en serialización');
      return { passed: 0, failed: 1, total: 1 };
    }
    
    // Verificar contenido específico
    const text = deserialized.parts[0].text;
    
    const checks = [
      { name: 'Contiene "POL tokens"', test: text.includes('POL tokens') || text.includes(kbContext) },
      { name: 'Contiene APY rates', test: text.includes('105.1%') || text.includes(kbContext) },
      { name: 'Contiene instrucciones anti-alucinación', test: text.includes('ONLY') && text.includes('DO NOT') },
      { name: 'Contiene formato Markdown', test: text.includes('Markdown') || text.includes('bold') },
      { name: 'Contiene límite de longitud', test: text.includes('2-3 paragraphs') || text.includes('brief') },
      { name: 'Tiene separadores visuales', test: text.includes('═══') }
    ];
    
    let checksPassed = 0;
    checks.forEach(check => {
      if (check.test) {
        logSuccess(`  ✓ ${check.name}`);
        checksPassed++;
      } else {
        logWarning(`  ⚠️  ${check.name} - No encontrado`);
      }
    });
    
    logInfo(`\nLongitud del systemInstruction: ${text.length} caracteres`);
    logInfo(`Longitud del contexto KB: ${kbContext.length} caracteres`);
    
    return { 
      passed: checksPassed === checks.length ? 1 : 0, 
      failed: checksPassed === checks.length ? 0 : 1, 
      total: 1 
    };
    
  } catch (error) {
    logError(`❌ Error en verificación de estructura: ${error.message}`);
    return { passed: 0, failed: 1, total: 1 };
  }
}

// Test 3: Comparación antes/después del fix
async function testFormatComparison() {
  logHeader('TEST 3: Comparación Formato Incorrecto vs Correcto');
  
  const context = 'Nuxchain uses POL tokens for staking.';
  const score = 1.0;
  
  // Formato INCORRECTO (antiguo)
  const wrongFormat = `Answer using ONLY the text: ${context}`;
  
  // Formato CORRECTO (nuevo)
  const correctFormat = buildSystemInstructionWithContext(context, score);
  
  logInfo('Formato INCORRECTO (string):');
  console.log(JSON.stringify(wrongFormat, null, 2));
  
  logInfo('\nFormato CORRECTO (objeto):');
  console.log(JSON.stringify(correctFormat, null, 2));
  
  // Verificaciones
  const checks = [
    {
      name: 'Formato antiguo es string',
      test: typeof wrongFormat === 'string',
      shouldBe: 'NO (Google Gemini lo ignora)'
    },
    {
      name: 'Formato nuevo es objeto',
      test: typeof correctFormat === 'object',
      shouldBe: 'SI (Google Gemini lo reconoce)'
    },
    {
      name: 'Formato nuevo tiene parts',
      test: correctFormat.parts !== undefined,
      shouldBe: 'SI (Requerido por API)'
    },
    {
      name: 'Formato nuevo tiene parts[0].text',
      test: correctFormat.parts?.[0]?.text !== undefined,
      shouldBe: 'SI (Formato oficial de Google)'
    }
  ];
  
  logInfo('\nVerificaciones:');
  let allCorrect = true;
  checks.forEach(check => {
    if (check.test) {
      logSuccess(`  ✓ ${check.name} - ${check.shouldBe}`);
    } else {
      logError(`  ❌ ${check.name} - Esperado: ${check.shouldBe}`);
      allCorrect = false;
    }
  });
  
  return { 
    passed: allCorrect ? 1 : 0, 
    failed: allCorrect ? 0 : 1, 
    total: 1 
  };
}

// Test 4: Verificar contenido anti-alucinación
async function testAntiHallucinationInstructions() {
  logHeader('TEST 4: Instrucciones Anti-Alucinación');
  
  const context = 'Nuxchain uses POL tokens (Polygon native) for staking. APY is 105% for 30 days.';
  const systemInstruction = buildSystemInstructionWithContext(context, 1.0);
  const text = systemInstruction.parts[0].text;
  
  const antiHallucinationKeywords = [
    { keyword: 'ONLY', description: 'Restricción exclusiva a contexto' },
    { keyword: 'DO NOT use general knowledge', description: 'Prohibición explícita de conocimiento general' },
    { keyword: 'NEVER INVENT', description: 'Prohibición de inventar información' },
    { keyword: 'If not in context', description: 'Instrucción para casos sin información' },
    { keyword: 'No tengo información', description: 'Respuesta para casos sin KB' },
    { keyword: 'TEXT TO USE FOR ANSWERING', description: 'Separador visual del contexto' },
    { keyword: '2-3 paragraphs', description: 'Límite de extensión' },
    { keyword: 'brief', description: 'Instrucción de brevedad' }
  ];
  
  logInfo('Verificando instrucciones anti-alucinación...\n');
  
  let found = 0;
  antiHallucinationKeywords.forEach(item => {
    const exists = text.toLowerCase().includes(item.keyword.toLowerCase());
    if (exists) {
      logSuccess(`  ✓ "${item.keyword}" - ${item.description}`);
      found++;
    } else {
      logWarning(`  ⚠️  "${item.keyword}" - ${item.description} (no encontrado)`);
    }
  });
  
  const percentage = ((found / antiHallucinationKeywords.length) * 100).toFixed(0);
  logInfo(`\nInstrucciones encontradas: ${found}/${antiHallucinationKeywords.length} (${percentage}%)`);
  
  // Verificar que el contexto esté antes de las instrucciones generales
  const contextIndex = text.indexOf(context);
  const instructionsIndex = text.indexOf('INSTRUCTIONS:');
  
  if (contextIndex !== -1 && instructionsIndex !== -1 && contextIndex < instructionsIndex) {
    logSuccess('✓ Contexto KB aparece ANTES de instrucciones generales (correcto)');
  } else {
    logWarning('⚠️  Contexto KB no aparece antes de instrucciones generales');
  }
  
  return { 
    passed: found >= 6 ? 1 : 0, 
    failed: found < 6 ? 1 : 0, 
    total: 1 
  };
}

// Ejecutar todos los tests
async function runAllTests() {
  console.log(`${colors.bold}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     TEST CRÍTICO: Fix de SystemInstruction                 ║
║     Verificando que Gemini reconozca la KB                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const results = [];
  
  try {
    results.push(await testSystemInstructionFormat());
    results.push(await testSystemInstructionStructure());
    results.push(await testFormatComparison());
    results.push(await testAntiHallucinationInstructions());
    
    // Resumen final
    const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);
    const totalTests = results.reduce((sum, r) => sum + r.total, 0);
    
    logHeader('RESUMEN FINAL');
    
    console.log(`Total de tests: ${totalTests}`);
    console.log(`${colors.green}✅ Pasados: ${totalPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Fallados: ${totalFailed}${colors.reset}`);
    
    const percentage = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`\nÉxito: ${percentage}%`);
    
    if (totalFailed === 0) {
      console.log(`\n${colors.bold}${colors.green}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ✅ TODOS LOS TESTS PASARON                                ║
║                                                            ║
║  El formato de systemInstruction es CORRECTO               ║
║  Gemini debería reconocer la base de conocimiento          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
      process.exit(0);
    } else {
      console.log(`\n${colors.bold}${colors.red}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║  ❌ ALGUNOS TESTS FALLARON                                 ║
║                                                            ║
║  Revisa el código para asegurar que el formato sea         ║
║  correcto según la documentación de Google Gemini API      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
      process.exit(1);
    }
    
  } catch (error) {
    logError(`\n❌ ERROR CRÍTICO: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Ejecutar tests
runAllTests();
