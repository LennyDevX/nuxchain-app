import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import type { WalletAdapter } from '@solana/wallet-adapter-base'
import { registerSW } from 'virtual:pwa-register'
import { getMobileOptimizationConfig } from './utils/mobile/performanceOptimization'
import { logEnvironmentDiagnostics } from './utils/env/validateEnvironment'
import { SOLANA_NETWORKS, DEFAULT_SOLANA_NETWORK } from './constants/solana'

// ✅ Log environment diagnostics at app startup (helps debug production issues)
if (typeof window !== 'undefined') {
  logEnvironmentDiagnostics();
}

// ✅ Initialize mobile optimization config at app startup
const mobileOptConfig = getMobileOptimizationConfig();

// ✅ Reduce animations on low-end devices or slow connections
if (mobileOptConfig.reduceAnimations) {
  document.documentElement.style.setProperty('--animation-duration', '0.1s');
  document.documentElement.style.setProperty('--animation-timing', 'linear');
}

// ✅ Disable Lit dev mode warnings (WalletConnect uses Lit internally)
// This prevents "Element scheduled an update after update completed" warnings
if (typeof window !== 'undefined') {
  try {
    // Suppress Lit development warnings globally
    const litModule = (globalThis as Record<string, unknown>).__litModule;
    if (litModule && typeof litModule === 'object' && 'setIsDevMode' in litModule) {
      (litModule as { setIsDevMode?: (isDev: boolean) => void }).setIsDevMode?.(false);
    }

    // Also suppress via global flag
    (globalThis as Record<string, unknown>).litIssuedWarnings = new Set(['change-in-update']);
  } catch {
    // Silently fail if Lit module not accessible
  }
}

import './styles/index.css'
import './styles/spacing.css'
import './styles/responsive-grid.css'
import './styles/walletconnect.css'
import App from './App.tsx'
import { config } from './wagmi.ts'

// ✅ Solana wallet adapters configuration
// Modern wallets (Phantom, OKX, Solflare) are now "Standard Wallets"
// and will be detected automatically by the WalletProvider.
// We only need to provide adapters for wallets that don't support the standard.
const solanaWallets: WalletAdapter[] = []

// Get Solana RPC URL
const solanaRpcUrl = SOLANA_NETWORKS[DEFAULT_SOLANA_NETWORK].rpcUrl

// ✅ Register Service Worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    immediate: true,
    onNeedRefresh() {
      console.log('🔄 New content available, please refresh.');
      // Optional: Show toast notification to user
      if (confirm('New version available! Reload to update?')) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log('✅ App ready to work offline');
    },
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      console.log('✅ Service Worker registered:', registration);

      // Check for updates every hour
      setInterval(() => {
        registration?.update();
      }, 60 * 60 * 1000);
    },
    onRegisterError(error: Error) {
      console.error('❌ Service Worker registration failed:', error);
    },
  });
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration - OPTIMIZED for mobile
      staleTime: mobileOptConfig.reduceAnimations ? 10 * 60 * 1000 : 5 * 60 * 1000,
      gcTime: mobileOptConfig.reduceAnimations ? 60 * 60 * 1000 : 30 * 60 * 1000,

      // Refetch behavior - CRITICAL for tab navigation performance
      refetchOnWindowFocus: false, // Don't refetch when switching tabs/windows
      refetchOnMount: false, // Use cache when component remounts
      refetchOnReconnect: false, // Don't refetch on reconnect

      // Error handling
      retry: mobileOptConfig.reduceAnimations ? 1 : 2, // Fewer retries on low-end devices
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: 1, // Retry mutations only once
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WagmiProvider config={config}>
      <ConnectionProvider endpoint={solanaRpcUrl}>
        <WalletProvider wallets={solanaWallets} autoConnect>
          <WalletModalProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <Analytics />
              <SpeedInsights />
            </QueryClientProvider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </WagmiProvider>
  </StrictMode>,
)

