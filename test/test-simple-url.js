/**
 * Script simple para probar la funcionalidad de URLs
 */

import { enrichContextWithKnowledgeBase } from '../src/server/services/gemini-service.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testUrlDetection() {
  console.log('🧪 Probando detección de URLs...');
  
  try {
    // Prueba 1: Texto con URL
    console.log('\n📋 Prueba 1: Texto con URL');
    const textWithUrl = 'Analiza este enlace: https://ai.google.dev/gemini-api/docs/function-calling';
    const result1 = await enrichContextWithKnowledgeBase(textWithUrl);
    console.log('Resultado:', result1 === '' ? '✅ Sin contexto de Nuxchain (CORRECTO)' : '❌ Con contexto de Nuxchain (PROBLEMA)');
    
    // Prueba 2: Texto sin URL
    console.log('\n📋 Prueba 2: Texto sin URL');
    const textWithoutUrl = '¿Qué es Nuxchain?';
    const result2 = await enrichContextWithKnowledgeBase(textWithoutUrl);
    console.log('Resultado:', result2 !== '' ? '✅ Con contexto de Nuxchain (CORRECTO)' : '❌ Sin contexto de Nuxchain (PROBLEMA)');
    
    // Prueba 3: Forzar skip de contexto
    console.log('\n📋 Prueba 3: Forzar skip de contexto');
    const result3 = await enrichContextWithKnowledgeBase('¿Qué es Nuxchain?', { skipNuxchainContext: true });
    console.log('Resultado:', result3 === '' ? '✅ Sin contexto de Nuxchain (CORRECTO)' : '❌ Con contexto de Nuxchain (PROBLEMA)');
    
    console.log('\n🎉 Pruebas de detección completadas');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Ejecutar las pruebas
testUrlDetection();