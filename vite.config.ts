import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react'
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
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '/server')
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true,
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
  },
  esbuild: {
    jsx: 'automatic',
  }
})
