import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy pro backend local (server/) — evita CORS em dev e imita o
    // reverse proxy que a integracao TikTok vai precisar em producao.
    proxy: {
      '/api': 'http://localhost:3001',
      '/auth': 'http://localhost:3001',
    },
  },
})
