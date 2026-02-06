#!/usr/bin/env node

/**
 * Script para verificar que todas las variables de entorno requeridas están configuradas
 * Uso: node scripts/check-env.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const REQUIRED_VARS = [
  'VITE_GAMEIFIED_MARKETPLACE_PROXY',
  'VITE_GAMEIFIED_MARKETPLACE_CORE',
  'VITE_GAMEIFIED_MARKETPLACE_SKILLS',
  'VITE_GAMEIFIED_MARKETPLACE_QUESTS',
  'VITE_ENHANCED_SMARTSTAKING_ADDRESS',
  'VITE_WALLETCONNECT_PROJECT_ID',
  'VITE_ALCHEMY'
];

const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.development'];

function isValidContractAddress(address) {
  if (!address) return false;
  if (!address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  if (address === '0x0000000000000000000000000000000000000000') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function checkEnvFiles() {
  console.log('\n📋 Checking environment files...\n');
  
  let allVars = {};
  const projectRoot = path.join(__dirname, '..');
  
  for (const file of ENV_FILES) {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Found ${file}`);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('#') || !line.includes('=')) continue;
        
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim();
        
        if (REQUIRED_VARS.includes(key.trim())) {
          allVars[key.trim()] = value;
        }
      }
    }
  }
  
  return allVars;
}

function validateVariables(vars) {
  console.log('\n🔍 Validating environment variables...\n');
  
  const results = REQUIRED_VARS.map(varName => {
    const value = vars[varName];
    let status = '❌';
    let issue = 'MISSING';
    
    if (value) {
      if (varName.includes('ADDRESS') || varName.includes('PROXY') || varName.includes('CORE') || varName.includes('SKILLS') || varName.includes('QUESTS')) {
        if (isValidContractAddress(value)) {
          status = '✅';
          issue = 'Valid';
        } else {
          status = '⚠️';
          issue = 'Invalid format';
        }
      } else {
        status = '✅';
        issue = 'Configured';
      }
    }
    
    return {
      name: varName,
      status,
      value: value ? `${value.substring(0, 10)}...${value.substring(value.length - 8)}` : 'NOT SET',
      issue
    };
  });
  
  console.table(results);
  
  const allValid = results.every(r => r.status === '✅');
  return { allValid, results };
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   🔧 NUXCHAIN ENVIRONMENT VARIABLES CHECKER            ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const vars = checkEnvFiles();
  const { allValid } = validateVariables(vars);
  
  if (!allValid) {
    console.log('\n⚠️  Some variables are missing or invalid!');
    console.log('\n📌 To fix:');
    console.log('1. Create a .env.local file in the project root');
    console.log('2. Add all VITE_* variables from .env.example (if exists)');
    console.log('3. Or contact the team for the correct values');
    console.log('\n📖 For production (Vercel):');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Select nuxchain-app project');
    console.log('3. Settings → Environment Variables');
    console.log('4. Add all missing VITE_* variables');
    console.log('5. Redeploy the project');
    process.exit(1);
  } else {
    console.log('\n✅ All environment variables are properly configured!');
    console.log('\n🚀 You can now run the development server:');
    console.log('   npm run dev');
    process.exit(0);
  }
}

main();
