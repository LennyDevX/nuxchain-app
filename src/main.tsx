import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

import './styles/index.css'
import App from './App.tsx'
import { config } from './wagmi.ts'

// ✅ Configure QueryClient with optimal defaults for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache
      
      // Refetch behavior - CRITICAL for tab navigation performance
      refetchOnWindowFocus: false, // Don't refetch when switching tabs/windows
      refetchOnMount: false, // Use cache when component remounts
      refetchOnReconnect: false, // Don't refetch on reconnect
      
      // Error handling
      retry: 2, // Retry failed queries 2 times
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
      <QueryClientProvider client={queryClient}>
        <App />
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)
