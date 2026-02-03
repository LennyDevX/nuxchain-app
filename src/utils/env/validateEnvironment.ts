/**
 * Utilidades para validar y diagnosticar variables de entorno
 * Útil para debugging en producción
 */

interface EnvironmentStatus {
  name: string;
  value: string | undefined;
  isValid: boolean;
  issue?: string;
}

interface EnvironmentDiagnostics {
  environment: 'development' | 'production';
  allValid: boolean;
  contracts: EnvironmentStatus[];
  walletConnect: EnvironmentStatus;
  alchemy: EnvironmentStatus;
}

const REQUIRED_CONTRACT_VARS = [
  'VITE_GAMEIFIED_MARKETPLACE_PROXY',
  'VITE_GAMEIFIED_MARKETPLACE_CORE',
  'VITE_GAMEIFIED_MARKETPLACE_SKILLS',
  'VITE_GAMEIFIED_MARKETPLACE_QUESTS',
  'VITE_ENHANCED_SMARTSTAKING_ADDRESS'
];

/**
 * Valida que una dirección es un contrato válido de Ethereum
 */
export const isValidContractAddress = (address: string | undefined): boolean => {
  if (!address) return false;
  if (!address.startsWith('0x')) return false;
  if (address.length !== 42) return false;
  if (address === '0x0000000000000000000000000000000000000000') return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Obtiene diagnóstico completo del ambiente
 */
export const getDiagnostics = (): EnvironmentDiagnostics => {
  const isProd = import.meta.env.PROD;
  
  // Validar contratos
  const contractStatus = REQUIRED_CONTRACT_VARS.map(varName => {
    const value = import.meta.env[varName] as string | undefined;
    const isValid = isValidContractAddress(value);
    
    return {
      name: varName,
      value: value ? `${value.slice(0, 10)}...${value.slice(-8)}` : undefined,
      isValid,
      issue: !value ? 'Not configured' : !isValid ? 'Invalid format or dummy address' : undefined
    };
  });

  // Validar WalletConnect
  const walletConnectValue = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
  const walletConnectValid = !!walletConnectValue && walletConnectValue.length > 0;

  // Validar Alchemy
  const alchemyValue = import.meta.env.VITE_ALCHEMY as string | undefined;
  const alchemyValid = !!alchemyValue && alchemyValue.length > 0;

  return {
    environment: isProd ? 'production' : 'development',
    allValid: contractStatus.every(s => s.isValid) && walletConnectValid && alchemyValid,
    contracts: contractStatus,
    walletConnect: {
      name: 'VITE_WALLETCONNECT_PROJECT_ID',
      value: walletConnectValue ? `${walletConnectValue.slice(0, 20)}...` : undefined,
      isValid: walletConnectValid,
      issue: !walletConnectValue ? 'Not configured' : undefined
    },
    alchemy: {
      name: 'VITE_ALCHEMY',
      value: alchemyValue ? `${alchemyValue.slice(0, 20)}...` : undefined,
      isValid: alchemyValid,
      issue: !alchemyValue ? 'Not configured' : undefined
    }
  };
};

/**
 * Imprime diagnóstico en consola
 */
export const logEnvironmentDiagnostics = () => {
  const diag = getDiagnostics();
  
  console.log('%c╔════════════════════════════════════════════════════════╗', 'color: #4ecdc4; font-weight: bold;');
  console.log('%c║        🔍 NUXCHAIN ENVIRONMENT DIAGNOSTICS             ║', 'color: #4ecdc4; font-weight: bold;');
  console.log('%c╚════════════════════════════════════════════════════════╝', 'color: #4ecdc4; font-weight: bold;');
  
  console.log(`\n📍 Environment: ${diag.environment.toUpperCase()}`);
  console.log(`📊 Status: ${diag.allValid ? '✅ ALL SYSTEMS OPERATIONAL' : '⚠️ CONFIGURATION ISSUES DETECTED'}\n`);
  
  console.log('%c🔗 Smart Contract Addresses:', 'color: #ff6b6b; font-weight: bold; font-size: 12px;');
  console.table(
    diag.contracts.map(c => ({
      'Status': c.isValid ? '✅' : '❌',
      'Variable': c.name,
      'Value': c.value || 'MISSING',
      'Issue': c.issue || '-'
    }))
  );

  console.log('%c🌐 Web3 Configuration:', 'color: #45b7d1; font-weight: bold; font-size: 12px;');
  console.table([
    {
      'Status': diag.walletConnect.isValid ? '✅' : '❌',
      'Variable': diag.walletConnect.name,
      'Value': diag.walletConnect.value || 'MISSING',
      'Issue': diag.walletConnect.issue || '-'
    },
    {
      'Status': diag.alchemy.isValid ? '✅' : '❌',
      'Variable': diag.alchemy.name,
      'Value': diag.alchemy.value || 'MISSING',
      'Issue': diag.alchemy.issue || '-'
    }
  ]);

  if (!diag.allValid) {
    console.log('%c⚠️ ACTION REQUIRED:', 'color: #ffd700; font-weight: bold; background: #333; padding: 8px; border-radius: 4px;');
    console.log('%cMissing environment variables detected!', 'color: #ffd700; font-size: 12px;');
    console.log('%cSteps to fix:', 'color: #ff6b6b; font-weight: bold;');
    console.log('1. Go to Vercel Dashboard → Project Settings');
    console.log('2. Navigate to Environment Variables');
    console.log('3. Add the missing VITE_* variables');
    console.log('4. Deploy again (redeploy or git push)');
    console.log('\n📖 Documentation: https://github.com/LennyDevX/nuxchain-app/doc/ENVIRONMENT_VARIABLES_FIX.md');
  } else {
    console.log('%c✅ All environment variables are properly configured!', 'color: #10b981; font-weight: bold; padding: 8px;');
  }
  
  console.log('%c═══════════════════════════════════════════════════════', 'color: #4ecdc4;');

  return diag;
};

/**
 * Hook para llamar al diagnóstico en desarrollo
 */
export const useEnvironmentDiagnostics = () => {
  if (import.meta.env.DEV) {
    const diag = getDiagnostics();
    if (!diag.allValid) {
      console.warn('⚠️ Environment configuration issues detected in development');
    }
  }
};
