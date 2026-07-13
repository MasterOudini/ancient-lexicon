import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base '/' works for Cloudflare Pages, Netlify, Vercel, and a GitHub Pages
// user/organization site. For a GitHub Pages *project* page served at
// https://<user>.github.io/<repo-name>/, change base to '/<repo-name>/' and
// change start_url and scope in the manifest below to '/<repo-name>/' to match.
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ancient Lexicon',
        short_name: 'Lexicon',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ECE5D5',
        theme_color: '#ECE5D5',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // Precache the whole app shell, including the script fonts, so the
        // app is fully usable offline after the first load.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // The default 2 MiB limit would silently skip larger assets.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024
      }
    })
  ]
})
