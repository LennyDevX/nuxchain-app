import { http, fallback, createConfig } from 'wagmi'
import { polygon, polygonAmoy } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'
import { DEFAULT_SOLANA_NETWORK } from './constants/solana'

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined
const alchemyApiKey = import.meta.env.VITE_ALCHEMY as string | undefined

// Log WalletConnect configuration for debugging
if (import.meta.env.DEV) {
  console.log('[Wagmi Config] WalletConnect ProjectID:', projectId ? `✓ Configured (${projectId.slice(0, 8)}...)` : '✗ Missing')
  if (!projectId) {
    console.warn('[Wagmi Config] ⚠️ WalletConnect ProjectID is missing - WalletConnect connector will be disabled')
  }
  console.log('[Wagmi Config] Default Solana Network:', DEFAULT_SOLANA_NETWORK)
}

const appName = 'Nuxchain'
const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nuxchain-app.vercel.app'
const appIconUrl = typeof window !== 'undefined'
  ? `${window.location.origin}/assets/nfts/dragonix/Dragonix.png`
  : 'https://nuxchain-app.vercel.app/assets/nfts/dragonix/Dragonix.png'

export const config = createConfig({
  chains: [polygon, polygonAmoy],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: appName,
        url: appUrl,
        iconUrl: appIconUrl,
      },
    }),
    ...(projectId
      ? [
        walletConnect({
          projectId,
          showQrModal: true,
          // Enable debug mode to see more details about connection issues
          isNewChainsStale: true,
          metadata: {
            name: appName,
            description: 'Nuxchain - Web3 Ecosystem Platform',
            url: appUrl || 'https://nuxchain.app',
            icons: appIconUrl ? [appIconUrl] : [],
          },
          qrModalOptions: {
            themeMode: 'dark',
            themeVariables: {
              '--wcm-z-index': '9999'
            }
          },
        }),
      ]
      : []),
  ],
  transports: {
    [polygon.id]: fallback([
      // Primary: Alchemy (if key is set)
      ...(alchemyApiKey ? [http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`, {
        batch: true,
        retryCount: 2,
        retryDelay: 1000,
        timeout: 10000,
      })] : []),
      // Fallback: Ankr public RPC (more reliable than polygon-rpc.com)
      http('https://rpc.ankr.com/polygon', {
        batch: true,
        retryCount: 3,
        retryDelay: 1000,
        timeout: 10000,
      }),
    ]),
    [polygonAmoy.id]: http(undefined, {
      batch: true,
      retryCount: 3,
      retryDelay: 1000,
      timeout: 10000,
    }),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}