import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic'
    })
  ],
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
        manualChunks: {
          vendor: ['react', 'react-dom'],
          wagmi: ['wagmi', '@tanstack/react-query']
        }
      }
    }
  },
  esbuild: {
    jsx: 'automatic'
  }
})
