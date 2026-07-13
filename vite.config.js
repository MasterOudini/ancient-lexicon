import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// The default base '/' works for Cloudflare Pages, Netlify, Vercel, and a
// GitHub Pages user/organization site, with no environment variables.
// A GitHub Pages *project* page served at https://<user>.github.io/<repo>/
// needs the repo name as base, and the manifest start_url and scope must
// match; set VITE_BASE=/<repo-name>/ at build time to do all three at once
// (.github/workflows/deploy-pages.yml does exactly this).
const base = process.env.VITE_BASE || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Ancient Lexicon',
        short_name: 'Lexicon',
        start_url: base,
        scope: base,
        display: 'standalone',
        // Dark is the app's default theme, so the splash and chrome match it.
        background_color: '#1C1813',
        theme_color: '#1C1813',
        icons: [
          {
            src: base + 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: base + 'icon-512.png',
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
