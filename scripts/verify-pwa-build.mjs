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
  worker.includes('skipWaiting') && worker.includes('clientsClaim'),
  'the generated worker does not activate and claim clients immediately'
)
verify(
  manifest.start_url === expectedBase && manifest.scope === expectedBase,
  `manifest scope does not match ${expectedBase}`
)

console.log(`verified PWA update build for ${expectedBase}`)
