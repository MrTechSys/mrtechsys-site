import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './cloudflip/src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        cloudflip: path.resolve(__dirname, 'cloudflip/index.html'),
        privacy: path.resolve(__dirname, 'privacy.html'),
        terms: path.resolve(__dirname, 'terms.html'),
        cookies: path.resolve(__dirname, 'cookies.html'),
        dashboard: path.resolve(__dirname, 'dashboard.html'),
        cloudfx_form: path.resolve(__dirname, 'cloudfx-form.html'),
        form_pyscript: path.resolve(__dirname, 'form_pyscript.html'),
        explore_solutions: path.resolve(__dirname, 'explore_solutions_pyscript.html'),
      }
    }
  }
}) 
