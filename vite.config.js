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
// A data-only commit may otherwise produce a byte-identical app shell, which
// gives an installed service worker nothing new to detect. GitHub supplies a
// stable SHA for each deployment; local builds get a unique diagnostic id.
const buildId = (process.env.GITHUB_SHA || `local-${Date.now().toString(36)}`).slice(0, 18)

export default defineConfig({
  base,
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId)
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registration is handled in src/lib/pwaUpdates.js so the worker script
      // itself always bypasses the HTTP cache on update checks.
      injectRegister: false,
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
        // Manual registration still needs the auto-update worker lifecycle:
        // activate immediately and take control of open app windows.
        skipWaiting: true,
        clientsClaim: true,
        // Precache the whole app shell, including the script fonts, so the
        // curated app (comparative database, roots, Strong's) is fully usable
        // offline after the first load.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // The default 2 MiB limit would silently skip larger assets.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Large reference dictionaries, the legacy meaning index, and the
        // universal Hebrew catalog/shards are not precached (that would bloat
        // installation). They check the network first and fall back to their
        // runtime caches while offline.
        runtimeCaching: [
          {
            urlPattern: /\/dicts\/hebrew-catalog-2026-07-v1\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hebrew-comparison-catalog',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/hebrew-comparisons-2026-07-v1\/[0-9a-f]{2}\.json$/,
            handler: 'NetworkFirst',
            options: {
              // Every shard that an installed client opens remains available
              // offline; no full reference dictionary is pulled in with it.
              cacheName: 'hebrew-comparison-shards',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/gloss-index(?:-[^/]+)?\.json$/,
            handler: 'NetworkFirst',
            options: {
              // Keep the established cache name so this upgrade can still
              // read an index that an existing installation cached offline.
              cacheName: 'reference-dictionaries',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/.*\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'reference-dictionaries',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ]
})
