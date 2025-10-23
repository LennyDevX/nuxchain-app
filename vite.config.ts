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
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
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
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor libraries
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('wagmi') || id.includes('@tanstack')) return 'wagmi';
            if (id.includes('metamask-sdk')) return 'metamask';
            if (id.includes('reown') || id.includes('appkit')) return 'appkit';
            if (id.includes('ethers') || id.includes('viem')) return 'web3-utils';
            return 'vendor';
          }
          // Pages - each page gets its own chunk
          if (id.includes('/pages/')) {
            const match = id.match(/pages\/([^/]+)\.tsx?/);
            if (match) return `page-${match[1]}`;
          }
          // Chat components - separate chunk for better loading
          if (id.includes('/components/chat/')) {
            return 'chat-components';
          }
          // Other components
          if (id.includes('/components/')) {
            return 'components';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200, // Allow larger chunks but warn at 1.2MB
  },
  esbuild: {
    jsx: 'automatic'
  }
})
