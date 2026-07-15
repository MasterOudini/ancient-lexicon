import { existsSync, readFileSync, readdirSync } from 'node:fs'
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
const release = JSON.parse(readFileSync(join(distDir, 'release.json'), 'utf8'))
const expectedBuildId = (process.env.GITHUB_SHA || release.buildId).slice(0, 18)
const expectedReleaseNumber = process.env.GITHUB_RUN_NUMBER
  ? Number.parseInt(process.env.GITHUB_RUN_NUMBER, 10) || 0
  : release.releaseNumber
const expectedReleaseId = expectedReleaseNumber > 0
  ? `${expectedReleaseNumber}-${expectedBuildId}`
  : expectedBuildId
const releaseShellPath = join(distDir, `shell-${expectedReleaseId}.html`)
const releaseWorkerPath = join(distDir, `sw-${expectedReleaseId}.js`)
const releaseHooksPath = join(distDir, `sw-hooks-${expectedReleaseId}.js`)
const rootDatasetUrl = 'dicts/attested-roots-2026-07-v1.json'
const rootDatasetPath = join(distDir, ...rootDatasetUrl.split('/'))
const releaseRootDatasetUrl = `release-${expectedReleaseId}/${rootDatasetUrl}`
const releaseRootDatasetPath = join(distDir, ...releaseRootDatasetUrl.split('/'))
const rootDatasetFormat = 'ancient-lexicon-attested-roots-v1'
const rootDatasetPayloadMarker = 'attested-root-payload-only-2026-07-v1'
const rootDatasetPayloadProbe = 'attested-root-records-only-2026-07-v1'

function verify(condition, message) {
  if (!condition) throw new Error(`PWA build verification failed: ${message}`)
}

const expectedBase = process.env.VITE_BASE || '/'
verify(!html.includes('registerSW.js'), 'an extra injected registrar is present')
verify(
  release.format === 'ancient-lexicon-release-v1' &&
    release.buildId === expectedBuildId &&
    release.releaseNumber === expectedReleaseNumber &&
    release.releaseId === expectedReleaseId &&
    release.worker === `sw-${expectedReleaseId}.js` &&
    release.shell === `shell-${expectedReleaseId}.html`,
  'release.json does not identify this exact build and workflow run'
)
verify(existsSync(releaseShellPath), 'the immutable release shell is missing')
verify(existsSync(releaseWorkerPath), 'the immutable release worker is missing')
verify(existsSync(releaseHooksPath), 'the release worker hooks are missing')
verify(
  readFileSync(releaseShellPath, 'utf8') === html,
  'the immutable release shell is not the final index.html'
)
verify(
  readFileSync(releaseWorkerPath, 'utf8') === worker,
  'the immutable worker alias differs from the migration worker'
)
verify(
  appModule.includes('updateViaCache') && appModule.includes('none'),
  'the worker registration does not bypass the HTTP cache'
)
verify(
  appModule.includes('controllerchange') &&
    appModule.includes('location.reload') &&
    appModule.includes('GET_ANCIENT_LEXICON_RELEASE') &&
    appModule.includes('release.json') &&
    appModule.includes('no-store') &&
    appModule.includes(expectedReleaseId),
  'the client does not independently detect and converge to the newest release'
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
  worker.includes(`sw-hooks-${expectedReleaseId}.js`) &&
    worker.includes(`shell-${expectedReleaseId}.html`) &&
    worker.includes(`createHandlerBoundToURL("shell-${expectedReleaseId}.html")`),
  'the worker does not import matching release hooks and navigate via its immutable shell'
)
const workerHooks = readFileSync(releaseHooksPath, 'utf8')
verify(
  workerHooks.includes(expectedReleaseId) &&
    workerHooks.includes('GET_ANCIENT_LEXICON_RELEASE') &&
    workerHooks.includes('CLAIM_ANCIENT_LEXICON_CLIENTS') &&
    workerHooks.includes('client.navigate') &&
    !workerHooks.includes('await client.navigate'),
  'the activation hook cannot identify the release and navigate old clients'
)
verify(
  worker.includes('hebrew-comparison-catalog') &&
    worker.includes('hebrew-comparison-shards') &&
    worker.includes('attested-root-catalog'),
  'the generated worker does not keep separate offline caches for Hebrew comparisons and roots'
)
verify(existsSync(rootDatasetPath), 'the attested-root catalog was not copied to dist')
verify(
  existsSync(releaseRootDatasetPath),
  'the immutable release copy of the attested-root catalog is missing'
)
const rootDataset = JSON.parse(readFileSync(rootDatasetPath, 'utf8'))
verify(
  rootDataset.format === rootDatasetFormat &&
    rootDataset.payloadMarker === rootDatasetPayloadMarker &&
    rootDataset.payloadProbe === rootDatasetPayloadProbe &&
    rootDataset.count === rootDataset.roots.length,
  'the built attested-root catalog is malformed'
)

const precacheMatch = worker.match(/precacheAndRoute\((\[[\s\S]*?\]),\{\}\)/)
verify(precacheMatch, 'the generated precache manifest cannot be inspected')
const precacheUrls = [...precacheMatch[1].matchAll(/\burl:"([^"]+)"/g)]
  .map((match) => match[1])
verify(
  !precacheUrls.includes(rootDatasetUrl),
  'the on-demand attested-root catalog entered the precache'
)
verify(
  precacheUrls.includes(`shell-${expectedReleaseId}.html`) &&
    !precacheUrls.includes('release.json') &&
    !precacheUrls.includes(`sw-hooks-${expectedReleaseId}.js`) &&
    !precacheUrls.includes(releaseRootDatasetUrl),
  'the precache does not contain exactly the immutable shell while excluding release discovery and data files'
)
verify(
  !precacheUrls.some((url) => /^dicts\/.*\.json$/.test(url)),
  'a reference dictionary entered the precache'
)
verify(
  worker.includes('attested-roots-2026-07-v1') &&
    worker.includes('NetworkFirst') &&
    worker.includes('attested-root-catalog'),
  'the attested-root catalog is not runtime-cached with NetworkFirst'
)

const javascriptPayload = readdirSync(join(distDir, 'assets'))
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(join(distDir, 'assets', file), 'utf8'))
  .join('\n')
verify(
  !javascriptPayload.includes(rootDatasetPayloadProbe),
  'the attested-root payload marker was bundled into precached JavaScript'
)
verify(
  manifest.start_url === expectedBase && manifest.scope === expectedBase,
  `manifest scope does not match ${expectedBase}`
)

console.log(`verified PWA update build for ${expectedBase}`)
