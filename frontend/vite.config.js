import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // Proxy all /api calls to the Flask backend.
      // In Docker the backend service is reachable at http://backend:5000.
      // Locally it falls back to http://localhost:5000.
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // Expose the API base URL to the app (empty string = use Vite proxy)
    __API_BASE__: JSON.stringify(process.env.VITE_API_BASE || ''),
  },
})
