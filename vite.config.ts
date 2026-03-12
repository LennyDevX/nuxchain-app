import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
    }),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      includeAssets: ['favicon.ico', 'robots.txt', 'offline.html', 'icon.svg'],
      manifest: false, // Use existing public/manifest.json
      devOptions: {
        enabled: false, // Disable in dev for faster HMR
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB (increased for better SW coverage)
      },
    })
  ],
  // Disable error overlay in development (prevents ugly red error screens)
  server: {
    hmr: {
      overlay: false
    },
    proxy: {
      // Proxy para rutas de API en desarrollo
      '/gemini': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => `/server${path}`
      },
      '/api/market': {
        target: 'http://localhost:3003',
        changeOrigin: true
      },
      '/api/uniswap': {
        target: 'http://localhost:3003',
        changeOrigin: true
      },
      '/api/launchpad': {
        target: 'http://localhost:3003',
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV !== 'production',
    // modulePreload: enabled (Vite default) — required for parallel vendor chunk fetching.
    // React 19 + Suspense boundaries handle initialization order correctly with static imports.
    // ES module spec guarantees: if A imports B, B executes before A — no race conditions.
    rollupOptions: {
      output: {
        preserveModules: false,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Vendor chunk splitting: separates stable third-party code into independently cacheable units.
        // Browser fetches all chunks in parallel (HTTP/2 + modulePreload hints).
        // Rollup guarantees correct init order via static import graph — no Wagmi/React race conditions.
        manualChunks: (id: string) => {
          // Normalize path separators (Windows uses backslashes, Vite may or may not normalize)
          const mod = id.replace(/\\/g, '/');
          if (!mod.includes('node_modules/')) return undefined;

          // React core: keep react + react-dom + scheduler together (single React instance)
          if (
            mod.includes('/node_modules/react/') ||
            mod.includes('/node_modules/react-dom/') ||
            mod.includes('/node_modules/scheduler/')
          ) return 'react-core';
          // Chart libraries (Market/Labs pages only) — standalone, no circular deps
          if (
            mod.includes('/node_modules/chart.js/') ||
            mod.includes('/node_modules/recharts/') ||
            mod.includes('/node_modules/react-chartjs-2/')
          ) return 'charts';
          // Gemini AI SDK (Chat page only) — standalone
          if (mod.includes('/node_modules/@google/genai/')) return 'ai-sdk';
          // Framer Motion (animations) — standalone
          if (mod.includes('/node_modules/framer-motion/')) return 'animation';
          // Firebase + Firestore — standalone
          if (
            mod.includes('/node_modules/firebase/') ||
            mod.includes('/node_modules/@firebase/')
          ) return 'firebase';
          // NOTE: wagmi, viem, @wagmi, @walletconnect, @metamask, @reown, @apollo,
          // graphql, @solana, @metaplex intentionally fall through to 'vendor'.
          // Splitting these out creates vendor→chunk→vendor circular chunk dependencies
          // (the Rollup "Circular chunk" warning) that cause a runtime TypeError:
          // "Cannot read properties of undefined (reading 'exports')" because their
          // shared sub-dependencies (ethers, @noble, ox, abitype, @tanstack, bs58, etc.)
          // end up split across chunks with no guaranteed init order.
          // All other node_modules → stable vendor chunk (rarely changes between deploys)
          return 'vendor';
        },
      }
    },
    chunkSizeWarningLimit: 1500, // Surface oversized chunks earlier (was 3000)
    reportCompressedSize: true,  // Show gzip sizes to track real payload impact
  },
  esbuild: {
    jsx: 'automatic',
  }
})
