/**
 * Script de prueba para verificar que el análisis de URLs funciona correctamente
 * sin mezclar información de Nuxchain
 */

import { processGeminiRequestWithTools } from './src/server/services/gemini-service.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testUrlAnalysisWithoutNuxchainContext() {
  console.log('🧪 Iniciando prueba de análisis de URL sin contexto de Nuxchain...');
  
  try {
    // Prueba 1: URL de documentación de Google AI
    console.log('\n📋 Prueba 1: Análisis de documentación de Google AI');
    const testUrl1 = 'https://ai.google.dev/gemini-api/docs/function-calling';
    const prompt1 = `Analiza este enlace: ${testUrl1} y explícame qué es function calling en Gemini AI`;
    
    const result1 = await processGeminiRequestWithTools(
      prompt1,
      'gemini-1.5-flash',
      {},
      ['urlContext']
    );
    
    console.log('✅ Respuesta 1:');
    console.log(result1.text);
    console.log('\n🔍 Function calls ejecutados:', result1.functionCalls?.length || 0);
    
    // Verificar que no menciona Nuxchain
    const mentionsNuxchain = result1.text.toLowerCase().includes('nuxchain');
    console.log(`🎯 Menciona Nuxchain: ${mentionsNuxchain ? '❌ SÍ (PROBLEMA)' : '✅ NO (CORRECTO)'}`);
    
    // Prueba 2: URL de GitHub
    console.log('\n📋 Prueba 2: Análisis de repositorio de GitHub');
    const testUrl2 = 'https://github.com/google/generative-ai-js';
    const prompt2 = `¿Qué es este repositorio? ${testUrl2}`;
    
    const result2 = await processGeminiRequestWithTools(
      prompt2,
      'gemini-1.5-flash',
      {},
      ['urlContext']
    );
    
    console.log('✅ Respuesta 2:');
    console.log(result2.text);
    console.log('\n🔍 Function calls ejecutados:', result2.functionCalls?.length || 0);
    
    // Verificar que no menciona Nuxchain
    const mentionsNuxchain2 = result2.text.toLowerCase().includes('nuxchain');
    console.log(`🎯 Menciona Nuxchain: ${mentionsNuxchain2 ? '❌ SÍ (PROBLEMA)' : '✅ NO (CORRECTO)'}`);
    
    // Prueba 3: Pregunta sin URL (debería usar contexto de Nuxchain)
    console.log('\n📋 Prueba 3: Pregunta sobre Nuxchain sin URL');
    const prompt3 = '¿Qué es Nuxchain?';
    
    const result3 = await processGeminiRequestWithTools(
      prompt3,
      'gemini-1.5-flash',
      {},
      [] // Sin herramientas
    );
    
    console.log('✅ Respuesta 3:');
    console.log(result3.text);
    
    // Verificar que SÍ menciona Nuxchain
    const mentionsNuxchain3 = result3.text.toLowerCase().includes('nuxchain');
    console.log(`🎯 Menciona Nuxchain: ${mentionsNuxchain3 ? '✅ SÍ (CORRECTO)' : '❌ NO (PROBLEMA)'}`);
    
    console.log('\n🎉 Pruebas completadas');
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
    console.error(error.stack);
  }
}

// Ejecutar las pruebas
testUrlAnalysisWithoutNuxchainContext();