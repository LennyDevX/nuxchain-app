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
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },
    })
  ],
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // Exclude subgraph AssemblyScript code from browser bundle
  optimizeDeps: {
    exclude: [
      '@graphprotocol/graph-ts',
      '@graphprotocol/graph-cli',
      'subgraph'
    ],
    // CRITICAL: Force React to be pre-bundled and loaded first
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'scheduler'
    ],
    // Force Vite to run optimizeDeps even if node_modules changes
    force: true
  },
  server: {
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
        // No rewrite, server now handles /api prefix
      },
      '/api/uniswap': {
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
    // Disable modulePreload to prevent parallel loading that causes race conditions
    modulePreload: false,
    rollupOptions: {
      output: {
        preserveModules: false,
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // NO CODE SPLITTING AT ALL - bundle everything together
        // This guarantees execution order and prevents React initialization issues
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 3000,
    reportCompressedSize: false, // Skip gzip size report (saves time)
  },
  esbuild: {
    jsx: 'automatic',
  }
})
