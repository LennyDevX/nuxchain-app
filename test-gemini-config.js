/**
 * Script de prueba para verificar la configuración de Gemini API
 */

import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testGeminiConfig() {
  console.log('🧪 Iniciando prueba de configuración de Gemini API...\n');

  // Verificar variable de entorno
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('🔑 API Key presente:', apiKey ? '✅ Sí' : '❌ No');
  console.log('🔑 Longitud de API Key:', apiKey ? apiKey.length : 'N/A');
  console.log('🔑 Primeros 10 caracteres:', apiKey ? apiKey.substring(0, 10) + '...' : 'N/A');
  console.log('');

  if (!apiKey) {
    console.log('❌ Error: GEMINI_API_KEY no está configurada');
    return;
  }

  try {
    // Inicializar cliente
    console.log('🤖 Inicializando cliente de Google GenAI...');
    const ai = new GoogleGenAI(apiKey);
    
    // Prueba simple
    console.log('💬 Enviando mensaje de prueba...');
    const result = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: 'Hola, responde con "OK" si funciona'
    });
    
    let responseText = '';
    for await (const chunk of result) {
      responseText += chunk.text;
    }
    
    console.log('✅ Respuesta recibida:', responseText);
    console.log('✅ Configuración de Gemini API funcionando correctamente');
    
  } catch (error) {
    console.log('❌ Error en la configuración de Gemini API:');
    console.log('   Tipo:', error.constructor.name);
    console.log('   Mensaje:', error.message);
    console.log('   Status:', error.status || 'N/A');
    console.log('   Code:', error.code || 'N/A');
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 Sugerencia: Verifica que tu API key sea válida');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('\n💡 Sugerencia: Verifica los permisos de tu API key');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.log('\n💡 Sugerencia: Has excedido tu cuota de API');
    }
  }
}

testGeminiConfig().catch(console.error);