/**
 * Solana Network Configuration
 * Configuración de redes Solana para la app Nuxchain
 */

// clusterApiUrl removed to fix lint warning


// Tipos para redes Solana
export type SolanaNetwork = 'mainnet-beta' | 'devnet'

// RPC URLs - Updated with more reliable public endpoints to avoid 403 Forbidden errors
export const SOLANA_RPC_URLS = {
  'mainnet-beta': import.meta.env.VITE_SOLANA_RPC_MAINNET || 'https://solana-rpc.publicnode.com' || 'https://api.mainnet-beta.solana.com',
  devnet: import.meta.env.VITE_SOLANA_RPC_DEVNET || 'https://api.devnet.solana.com',
} as const

// Lista de fallbacks para rotación si uno falla
export const SOLANA_RPC_FALLBACKS = {
  'mainnet-beta': [
    import.meta.env.VITE_SOLANA_RPC_MAINNET,
    'https://solana-rpc.publicnode.com',
    'https://api.mainnet-beta.solana.com',
    'https://solana-mainnet.g.allnodes.com',
  ].filter(Boolean) as string[],
  devnet: [
    import.meta.env.VITE_SOLANA_RPC_DEVNET,
    'https://api.devnet.solana.com',
  ].filter(Boolean) as string[],
} as const

// Configuración de redes
export const SOLANA_NETWORKS = {
  'mainnet-beta': {
    label: 'Solana Mainnet',
    rpcUrl: SOLANA_RPC_URLS['mainnet-beta'],
    chainId: 'mainnet-beta',
    isTestnet: false,
  },
  devnet: {
    label: 'Solana Devnet',
    rpcUrl: SOLANA_RPC_URLS['devnet'],
    chainId: 'devnet',
    isTestnet: true,
  },
} as const

// Red por defecto (producción)
export const DEFAULT_SOLANA_NETWORK: SolanaNetwork = 'mainnet-beta'

// Red para desarrollo
export const DEV_SOLANA_NETWORK: SolanaNetwork = import.meta.env.DEV ? 'devnet' : 'mainnet-beta'

// Configuración por defecto para conexión
export const SOLANA_CONNECTION_CONFIG = {
  commitment: 'processed' as const,
  disableRetryOnRateLimit: false,
  maxRetries: 3,
  wsEndpoint: undefined as string | undefined,
} as const

// Wallets soportados en Solana
export const SOLANA_WALLETS = {
  phantom: 'Phantom',
  solflare: 'Solflare',
  okx: 'OKX Wallet',
  trustWallet: 'Trust Wallet',
  ledger: 'Ledger',
} as const

// Detección de wallets disponibles
export const detectSolanaWallets = () => {
  const detected: Record<string, boolean> = {}

  if (typeof window !== 'undefined') {
    // Detectar Phantom
    detected.phantom = !!(window.phantom?.solana?.isPhantom)

    // Detectar OKX
    detected.okx = !!(window.okxwallet?.solana)

    // Detectar Solflare
    detected.solflare = !!(window.solflare)

    // Detectar Trust Wallet
    detected.trustWallet = !!(window.trustwallet?.solana)
  }

  return detected
}

/**
 * Obtener configuración de red Solana
 */
export const getSolanaNetworkConfig = (network: SolanaNetwork) => {
  return SOLANA_NETWORKS[network]
}

/**
 * Validar dirección Solana
 */
export const isValidSolanaAddress = (address: string): boolean => {
  if (!address || typeof address !== 'string') return false

  try {
    // Solana addresses son base58 encoded, típicamente 34-44 caracteres
    const regex = /^[1-9A-HJ-NP-Z]{32,44}$/
    return regex.test(address)
  } catch {
    return false
  }
}

/**
 * Formatear dirección Solana para visualización
 */
export const formatSolanaAddress = (address: string): string => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Obtener URL del explorador para transacción Solana
 */
export const getSolanaExplorerUrl = (
  txHash: string,
  network: SolanaNetwork = 'mainnet-beta'
): string => {
  const baseUrl = 'https://solscan.io'
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `${baseUrl}/tx/${txHash}${cluster}`
}

/**
 * Obtener URL del explorador para dirección Solana
 */
export const getSolanaAddressExplorerUrl = (
  address: string,
  network: SolanaNetwork = 'mainnet-beta'
): string => {
  const baseUrl = 'https://solscan.io'
  const cluster = network === 'mainnet-beta' ? '' : `?cluster=${network}`
  return `${baseUrl}/account/${address}${cluster}`
}
