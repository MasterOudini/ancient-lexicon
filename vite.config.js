import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { copyFileSync, cpSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

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
const releaseNumber = Number.parseInt(process.env.GITHUB_RUN_NUMBER || '0', 10) || 0
const releaseId = releaseNumber > 0 ? `${releaseNumber}-${buildId}` : buildId
const appVersion = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8')
).version
const releaseShell = `shell-${releaseId}.html`
const releaseWorker = `sw-${releaseId}.js`
const releaseWorkerHooks = `sw-hooks-${releaseId}.js`
const releaseDataPrefix = `release-${releaseId}/`

function workerHooksSource() {
  const release = JSON.stringify({
    format: 'ancient-lexicon-release-v1',
    buildId,
    releaseNumber,
    releaseId
  })

  return `const ANCIENT_LEXICON_RELEASE = ${release};
const ANCIENT_LEXICON_RELEASE_PARAM = '__al_release';

self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_ANCIENT_LEXICON_RELEASE') {
    event.ports?.[0]?.postMessage({
      type: 'ANCIENT_LEXICON_RELEASE',
      release: ANCIENT_LEXICON_RELEASE
    });
    return;
  }

  if (event.data?.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }

  if (event.data?.type === 'CLAIM_ANCIENT_LEXICON_CLIENTS') {
    event.waitUntil(self.clients.claim());
  }
});

// This activation hook is also the migration path for shortcuts still running
// an older client bundle. It does not depend on that old page observing a
// controllerchange event: the new worker navigates every in-scope window once.
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await self.clients.claim();
    const windows = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    for (const client of windows) {
      const url = new URL(client.url);
      if (!url.href.startsWith(self.registration.scope)) continue;
      if (url.searchParams.get(ANCIENT_LEXICON_RELEASE_PARAM) === ANCIENT_LEXICON_RELEASE.releaseId) continue;
      url.searchParams.set(ANCIENT_LEXICON_RELEASE_PARAM, ANCIENT_LEXICON_RELEASE.releaseId);
      try {
        // Start the navigation, but do not keep the activate event waiting on
        // it: a navigation can itself wait for activation to finish.
        client.navigate(url.href).catch(() => {});
      } catch {
        // A client can disappear while activation is running. Other clients
        // must still update, and this one will retry on its next launch.
      }
    }
  })());
});
`
}

function immutableReleaseArtifacts() {
  let outputDirectory

  return {
    name: 'ancient-lexicon-immutable-release-artifacts',
    apply: 'build',
    configResolved(config) {
      outputDirectory = resolve(config.root, config.build.outDir)
    },
    writeBundle() {
      copyFileSync(
        resolve(outputDirectory, 'index.html'),
        resolve(outputDirectory, releaseShell)
      )
      writeFileSync(
        resolve(outputDirectory, 'release.json'),
        `${JSON.stringify({
          format: 'ancient-lexicon-release-v1',
          buildId,
          releaseNumber,
          releaseId,
          worker: releaseWorker,
          shell: releaseShell,
          version: appVersion
        }, null, 2)}\n`
      )
      writeFileSync(
        resolve(outputDirectory, releaseWorkerHooks),
        workerHooksSource()
      )
      // Public dictionaries keep their legacy URLs for already-installed
      // clients, while this release gets immutable paths that cannot resolve
      // to an older GitHub Pages CDN object.
      cpSync(
        resolve(outputDirectory, 'dicts'),
        resolve(outputDirectory, releaseDataPrefix, 'dicts'),
        { recursive: true }
      )
    },
    closeBundle: {
      order: 'post',
      sequential: true,
      handler() {
        // Keep sw.js as the migration endpoint for installations made before
        // immutable workers existed. New clients register the release-specific
        // alias, whose URL cannot be an old GitHub Pages CDN cache hit.
        copyFileSync(
          resolve(outputDirectory, 'sw.js'),
          resolve(outputDirectory, releaseWorker)
        )
      }
    }
  }
}

export default defineConfig({
  base,
  define: {
    __APP_BUILD_ID__: JSON.stringify(buildId),
    __APP_DATA_PREFIX__: JSON.stringify(releaseDataPrefix),
    __APP_RELEASE_ID__: JSON.stringify(releaseId),
    __APP_RELEASE_NUMBER__: JSON.stringify(releaseNumber),
    __APP_VERSION__: JSON.stringify(appVersion),
    __PWA_UPDATE_CHECK_INTERVAL_MS__: JSON.stringify(
      Number.parseInt(process.env.PWA_UPDATE_CHECK_INTERVAL_MS || '', 10) || 2 * 60 * 1000
    ),
    __PWA_UPDATE_CHECK_THROTTLE_MS__: JSON.stringify(
      Number.parseInt(process.env.PWA_UPDATE_CHECK_THROTTLE_MS || '', 10) || 30 * 1000
    )
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
        // The imported hook embeds this release's identity and can navigate an
        // old suspended iPhone client even if it missed controllerchange.
        importScripts: [releaseWorkerHooks],
        // A unique shell path prevents GitHub Pages' ten-minute cache for
        // index.html from being copied into a brand-new worker's precache.
        navigateFallback: releaseShell,
        // Precache the whole app shell, including the script fonts, so the
        // curated app (comparative database, roots, Strong's) is fully usable
        // offline after the first load.
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        globIgnores: ['sw-hooks-*.js', 'sw-*.js'],
        // The default 2 MiB limit would silently skip larger assets.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        // Large reference dictionaries, the legacy meaning index, and the
        // universal Hebrew/root catalogs and shards are not precached (that
        // would bloat installation). They check the network first and fall
        // back to their runtime caches while offline.
        runtimeCaching: [
          {
            // Keep both schemas available: suspended v1 clients still request
            // the mutable v1 URL, while this release reads the expanded v2.
            urlPattern: /\/dicts\/attested-roots-2026-07-v[12]\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'attested-root-catalog',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/hebrew-catalog-2026-07-v[12]\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hebrew-comparison-catalog',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/hebrew-comparisons-2026-07-v[12]\/[0-9a-f]{2}\.json$/,
            handler: 'NetworkFirst',
            options: {
              // Keep every v1/v2 shard an installed client opens available
              // offline; no full reference dictionary is pulled in with it.
              cacheName: 'hebrew-comparison-shards',
              expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/hebrew-jastrow-catalog-2026-07-v1\.json$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'hebrew-jastrow-comparison-catalog',
              expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /\/dicts\/hebrew-jastrow-comparisons-2026-07-v1\/[0-9a-f]{2}\.json$/,
            handler: 'NetworkFirst',
            options: {
              // Jastrow uses 128 shards; keep every opened shard available to
              // the installed app without evicting Strong's/BDB shards.
              cacheName: 'hebrew-jastrow-comparison-shards',
              expiration: { maxEntries: 128, maxAgeSeconds: 60 * 60 * 24 * 365 },
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
    }),
    immutableReleaseArtifacts()
  ]
})
