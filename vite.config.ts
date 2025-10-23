import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
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
    // Prevent scanning subgraph directory during dependency optimization
    include: [],
  },
  server: {
    proxy: {
      // Proxy para rutas de API en desarrollo
      '/gemini': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => `/server${path}`
      },
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '/server')
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Changed from terser to esbuild for better Vercel compatibility
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Skip subgraph code completely
          if (id.includes('subgraph')) {
            return undefined; // Don't include in any chunk
          }
          
          // CRITICAL: Separate Reown AppKit from main wagmi bundle to prevent
          // Activity class initialization error. Reown AppKit comes as transitive
          // dependency from wagmi/connectors but has its own Activity class.
          if (id.includes('@reown/appkit') || id.includes('@walletconnect')) {
            return 'walletconnect';
          }
          
          // Simplified chunking strategy to prevent initialization order issues
          if (id.includes('node_modules')) {
            // React ecosystem - React, wagmi, and react-query MUST be together
            // because wagmi uses React.createContext and needs React to be initialized first
            if (id.includes('react') || 
                id.includes('wagmi') || 
                id.includes('@tanstack/react-query') ||
                id.includes('react-dom') || 
                id.includes('react-router')) {
              return 'react-vendor';
            }
            
            // UI animation libraries
            if (id.includes('framer-motion')) return 'ui-animations';
            
            // Everything else (viem, web3 utils, etc)
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 2000, // Allow larger chunks
  },
  esbuild: {
    jsx: 'automatic'
  }
})
