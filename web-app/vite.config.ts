import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/Inavative-solutions/' : '/',
  server: {
    port: 3000,
    host: true,
    strictPort: false
  },
  preview: {
    port: 3000,
    host: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    sourcemap: false
  }
})
