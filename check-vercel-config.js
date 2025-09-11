// Script para verificar la configuración de Vercel en Node.js
// Este script verifica las variables de entorno locales

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function checkVercelConfig() {
  console.log('🔍 Verificando configuración de Vercel...');
  
  // Leer archivo .env
  let envVars = {};
  try {
    const envPath = join(__dirname, '.env');
    const envContent = readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    console.log('📁 Archivo .env encontrado y leído');
  } catch (error) {
    console.error('❌ Error leyendo archivo .env:', error.message);
    return;
  }
  
  console.log('\n📋 Variables de entorno locales:');
  console.log('VITE_PROD_API_BASE_URL:', envVars.VITE_PROD_API_BASE_URL || '❌ NO CONFIGURADA');
  console.log('VITE_PROD_SERVER_URL:', envVars.VITE_PROD_SERVER_URL || '❌ NO CONFIGURADA');
  console.log('VITE_NODE_ENV:', envVars.VITE_NODE_ENV || '❌ NO CONFIGURADA');
  console.log('VITE_API_BASE_URL:', envVars.VITE_API_BASE_URL || '❌ NO CONFIGURADA');
  console.log('VITE_SERVER_URL:', envVars.VITE_SERVER_URL || '❌ NO CONFIGURADA');
  
  // Variables requeridas para producción
  const requiredProdVars = {
    'VITE_PROD_API_BASE_URL': 'https://nuxchain-api.vercel.app',
    'VITE_PROD_SERVER_URL': 'https://nuxchain-api.vercel.app/server',
    'VITE_NODE_ENV': 'production'
  };
  
  console.log('\n🔧 Verificando variables requeridas para producción:');
  
  const missingVars = [];
  const incorrectVars = [];
  
  Object.entries(requiredProdVars).forEach(([key, expectedValue]) => {
    const currentValue = envVars[key];
    
    if (!currentValue) {
      missingVars.push({ key, expectedValue });
      console.log(`❌ ${key}: FALTANTE (esperado: ${expectedValue})`);
    } else if (currentValue !== expectedValue) {
      incorrectVars.push({ key, currentValue, expectedValue });
      console.log(`⚠️  ${key}: ${currentValue} (esperado: ${expectedValue})`);
    } else {
      console.log(`✅ ${key}: ${currentValue}`);
    }
  });
  
  // Resumen y instrucciones
  console.log('\n📊 RESUMEN:');
  console.log(`Variables faltantes: ${missingVars.length}`);
  console.log(`Variables incorrectas: ${incorrectVars.length}`);
  
  if (missingVars.length > 0 || incorrectVars.length > 0) {
    console.log('\n🛠️  ACCIONES REQUERIDAS:');
    
    if (missingVars.length > 0) {
      console.log('\n1. Agregar variables faltantes al archivo .env:');
      missingVars.forEach(({ key, expectedValue }) => {
        console.log(`   ${key}=${expectedValue}`);
      });
    }
    
    if (incorrectVars.length > 0) {
      console.log('\n2. Corregir variables incorrectas en .env:');
      incorrectVars.forEach(({ key, expectedValue }) => {
        console.log(`   ${key}=${expectedValue}`);
      });
    }
    
    console.log('\n3. Configurar las mismas variables en Vercel:');
    console.log('   - Ve a https://vercel.com/dashboard');
    console.log('   - Selecciona tu proyecto nuxchain-app');
    console.log('   - Ve a Settings > Environment Variables');
    console.log('   - Agrega/actualiza cada variable para el entorno "Production"');
    console.log('   - Redespliegue la aplicación');
    
  } else {
    console.log('✅ Todas las variables están configuradas correctamente');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Asegúrate de que estas variables estén también en Vercel');
    console.log('2. Redespliegue la aplicación en Vercel');
    console.log('3. Prueba el chat en https://www.nuxchain.com');
  }
  
  // Instrucciones para verificar en el navegador
  console.log('\n🌐 Para verificar en el navegador (después del deploy):');
  console.log('1. Ve a https://www.nuxchain.com');
  console.log('2. Abre la consola del navegador (F12)');
  console.log('3. Busca el log "🔧 API Configuration:"');
  console.log('4. Verifica que serverURL sea "https://nuxchain-api.vercel.app/server"');
  
  return {
    missingVars: missingVars.length,
    incorrectVars: incorrectVars.length,
    isConfigured: missingVars.length === 0 && incorrectVars.length === 0
  };
}

// Ejecutar verificación
checkVercelConfig();