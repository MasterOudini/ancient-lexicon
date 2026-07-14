import { readFileSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(projectRoot, 'dist')
const html = readFileSync(join(distDir, 'index.html'), 'utf8')
const manifest = JSON.parse(
  readFileSync(join(distDir, 'manifest.webmanifest'), 'utf8')
)
const worker = readFileSync(join(distDir, 'sw.js'), 'utf8')
const modulePath = html.match(/<script[^>]+type="module"[^>]+src="[^"]*\/([^/"?]+\.js)"/)?.[1]
const moduleFile = modulePath || readdirSync(join(distDir, 'assets'))
  .find((file) => /^index-.*\.js$/.test(file))
const appModule = moduleFile
  ? readFileSync(join(distDir, 'assets', moduleFile), 'utf8')
  : ''
const packageVersion = JSON.parse(
  readFileSync(join(projectRoot, 'package.json'), 'utf8')
).version

function verify(condition, message) {
  if (!condition) throw new Error(`PWA build verification failed: ${message}`)
}

const expectedBase = process.env.VITE_BASE || '/'
verify(!html.includes('registerSW.js'), 'an extra injected registrar is present')
verify(
  appModule.includes('updateViaCache') && appModule.includes('none'),
  'the worker registration does not bypass the HTTP cache'
)
verify(
  appModule.includes('controllerchange') && appModule.includes('location.reload'),
  'controller replacement does not reload the open app'
)
verify(
  appModule.includes('Installed app version') &&
    appModule.includes('This build identifies the code currently running on this device.') &&
    appModule.includes('data-app-version') && appModule.includes('data-app-build') &&
    appModule.includes(packageVersion),
  'About does not expose the installed version and build information'
)
if (process.env.GITHUB_SHA) {
  verify(
    appModule.includes(process.env.GITHUB_SHA.slice(0, 18)),
    'About does not contain the deployed GitHub build marker'
  )
}
verify(
  worker.includes('skipWaiting') && worker.includes('clientsClaim'),
  'the generated worker does not activate and claim clients immediately'
)
verify(
  worker.includes('hebrew-comparison-catalog') &&
    worker.includes('hebrew-comparison-shards'),
  'the generated worker does not keep separate offline caches for the Hebrew catalog and shards'
)
verify(
  manifest.start_url === expectedBase && manifest.scope === expectedBase,
  `manifest scope does not match ${expectedBase}`
)

console.log(`verified PWA update build for ${expectedBase}`)
