import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5001,
    proxy: {
      // Catch any request starting with /api
      '/api': {
        target: 'http://localhost:5000', // Forward to backend
        changeOrigin: true,
        secure: false,
        // Rewrite the path: remove '/api' before sending to backend
        // e.g., /api/upload/1 -> /upload/1
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Proxy static file requests
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    },
  },
})