import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['production']
  },
  define: {
    // Disable Lit development mode warnings
    'process.env.NODE_ENV': '"production"'
  }
})
