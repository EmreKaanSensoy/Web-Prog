import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/route': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/csrf-token': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/admin': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req, res, options) => {
          if (req.headers.accept && req.headers.accept.includes('text/html')) {
             return req.url; // Skip proxy
          }
        }
      },
      '/blog': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req, res, options) => {
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
               return req.url; // Skip proxy
            }
        }
      },
      '/api/gallery': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/announcements': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        bypass: (req, res, options) => {
            if (req.headers.accept && req.headers.accept.includes('text/html')) {
               return req.url; // Skip proxy
            }
        }
      },
      '/uploads': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
