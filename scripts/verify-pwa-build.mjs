import { createHash } from 'node:crypto'
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
const rootDatasetUrl = 'dicts/attested-roots-2026-07-v2.json'
const rootDatasetPath = join(distDir, ...rootDatasetUrl.split('/'))
const releaseRootDatasetUrl = `release-${expectedReleaseId}/${rootDatasetUrl}`
const releaseRootDatasetPath = join(distDir, ...releaseRootDatasetUrl.split('/'))
const rootDatasetFormat = 'ancient-lexicon-attested-roots-v2'
const rootDatasetPayloadMarker = 'attested-root-payload-only-2026-07-v2'
const rootDatasetPayloadProbe = 'attested-root-records-only-2026-07-v2'
const legacyRootDatasetUrl = 'dicts/attested-roots-2026-07-v1.json'
const legacyRootDatasetPath = join(distDir, ...legacyRootDatasetUrl.split('/'))
const releaseLegacyRootDatasetPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...legacyRootDatasetUrl.split('/')
)
const legacyRootDatasetHash = '2677e7e20bd09640120e2a586306ae9fcf3ecfeb492c494f22c3dd386e22143d'
const hebrewCatalogUrl = 'dicts/hebrew-catalog-2026-07-v2.json'
const hebrewCatalogPath = join(distDir, ...hebrewCatalogUrl.split('/'))
const releaseHebrewCatalogPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...hebrewCatalogUrl.split('/')
)
const legacyHebrewCatalogUrl = 'dicts/hebrew-catalog-2026-07-v1.json'
const legacyHebrewCatalogPath = join(distDir, ...legacyHebrewCatalogUrl.split('/'))
const releaseLegacyHebrewCatalogPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...legacyHebrewCatalogUrl.split('/')
)
const legacyHebrewCatalogHash = 'c6f10ac6c21406fbad33ae920220efc0bb71b66f7f23da48d162a84e9c3763fa'
const hebrewShardDirectoryUrl = 'dicts/hebrew-comparisons-2026-07-v2'
const legacyHebrewShardDirectoryUrl = 'dicts/hebrew-comparisons-2026-07-v1'
const legacyHebrewShardFamilyHash = '04215850b0f70c110a25efa704c0ddc547beeceae46e94068d07ea068c25d415'
const hebrewShardDirectoryPath = join(distDir, ...hebrewShardDirectoryUrl.split('/'))
const releaseHebrewShardDirectoryPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...hebrewShardDirectoryUrl.split('/')
)
const legacyHebrewShardDirectoryPath = join(
  distDir,
  ...legacyHebrewShardDirectoryUrl.split('/')
)
const releaseLegacyHebrewShardDirectoryPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...legacyHebrewShardDirectoryUrl.split('/')
)
const jastrowCatalogUrl = 'dicts/hebrew-jastrow-catalog-2026-07-v1.json'
const jastrowCatalogPath = join(distDir, ...jastrowCatalogUrl.split('/'))
const releaseJastrowCatalogUrl = `release-${expectedReleaseId}/${jastrowCatalogUrl}`
const releaseJastrowCatalogPath = join(distDir, ...releaseJastrowCatalogUrl.split('/'))
const jastrowShardDirectoryUrl = 'dicts/hebrew-jastrow-comparisons-2026-07-v1'
const jastrowShardDirectoryPath = join(distDir, ...jastrowShardDirectoryUrl.split('/'))
const releaseJastrowShardDirectoryPath = join(
  distDir,
  `release-${expectedReleaseId}`,
  ...jastrowShardDirectoryUrl.split('/')
)

function verify(condition, message) {
  if (!condition) throw new Error(`PWA build verification failed: ${message}`)
}

function sha256(value) {
  // Git may materialize tracked JSON with CRLF on Windows. Compare the
  // canonical LF payload that Pages deploys, independently of checkout OS.
  return createHash('sha256')
    .update(Buffer.from(value.toString('utf8').replace(/\r\n/g, '\n')))
    .digest('hex')
}

function versionedFamilyHash(directory) {
  const hash = createHash('sha256')
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.json')).sort()) {
    hash.update(file)
    hash.update(Buffer.from([0]))
    hash.update(readFileSync(join(directory, file)))
  }
  return hash.digest('hex')
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
    worker.includes('hebrew-jastrow-comparison-catalog') &&
    worker.includes('hebrew-jastrow-comparison-shards') &&
    worker.includes('attested-root-catalog'),
  'the generated worker does not keep separate offline caches for both Hebrew comparison families and roots'
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
    rootDataset.count === rootDataset.roots.length &&
    rootDataset.roots.some((root) => root.lang === 'hebrew-aramaic-unclassified'),
  'the built attested-root catalog is malformed'
)
verify(
  readFileSync(rootDatasetPath).equals(readFileSync(releaseRootDatasetPath)),
  'the mutable and immutable v2 root catalogs differ'
)
verify(
  existsSync(legacyRootDatasetPath) && existsSync(releaseLegacyRootDatasetPath),
  'the compatibility v1 root catalog is missing from mutable or immutable paths'
)
const legacyRootDatasetBytes = readFileSync(legacyRootDatasetPath)
const legacyRootDataset = JSON.parse(legacyRootDatasetBytes.toString('utf8'))
verify(
  sha256(legacyRootDatasetBytes) === legacyRootDatasetHash &&
    legacyRootDataset.format === 'ancient-lexicon-attested-roots-v1' &&
    legacyRootDataset.payloadMarker === 'attested-root-payload-only-2026-07-v1' &&
    legacyRootDataset.roots.every((root) =>
      ['hebrew', 'biblical-aramaic'].includes(root.lang)
    ) &&
    legacyRootDatasetBytes.equals(readFileSync(releaseLegacyRootDatasetPath)),
  'the frozen v1 root catalog changed or its immutable copy differs'
)

verify(
  existsSync(hebrewCatalogPath) && existsSync(releaseHebrewCatalogPath) &&
    existsSync(legacyHebrewCatalogPath) && existsSync(releaseLegacyHebrewCatalogPath),
  'a mutable or immutable Strong\'s/BDB comparison catalog is missing'
)
const hebrewCatalog = JSON.parse(readFileSync(hebrewCatalogPath, 'utf8'))
const legacyHebrewCatalogBytes = readFileSync(legacyHebrewCatalogPath)
const legacyHebrewCatalog = JSON.parse(legacyHebrewCatalogBytes.toString('utf8'))
verify(
  hebrewCatalog.version === 2 && hebrewCatalog.build === '2026-07-v2' &&
    hebrewCatalog.shardCount === 64 && hebrewCatalog.entries.length === 18_992 &&
    readFileSync(hebrewCatalogPath).equals(readFileSync(releaseHebrewCatalogPath)),
  'the v2 Strong\'s/BDB comparison catalog is malformed or its immutable copy differs'
)
verify(
  sha256(legacyHebrewCatalogBytes) === legacyHebrewCatalogHash &&
    legacyHebrewCatalog.version === 1 && legacyHebrewCatalog.build === '2026-07-v1' &&
    legacyHebrewCatalog.entries.every((tuple) =>
      !Array.isArray(tuple[9]?.[0])
    ) &&
    legacyHebrewCatalogBytes.equals(readFileSync(releaseLegacyHebrewCatalogPath)),
  'the frozen v1 Strong\'s/BDB catalog changed or its immutable copy differs'
)
const expectedHebrewShards = Array.from(
  { length: 64 },
  (_, index) => `${index.toString(16).padStart(2, '0')}.json`
)
verify(
  expectedHebrewShards.every((file) => {
    const v2 = join(hebrewShardDirectoryPath, file)
    const releaseV2 = join(releaseHebrewShardDirectoryPath, file)
    const v1 = join(legacyHebrewShardDirectoryPath, file)
    const releaseV1 = join(releaseLegacyHebrewShardDirectoryPath, file)
    return existsSync(v2) && existsSync(releaseV2) && existsSync(v1) && existsSync(releaseV1) &&
      JSON.parse(readFileSync(v2, 'utf8')).version === 2 &&
      JSON.parse(readFileSync(v1, 'utf8')).version === 1 &&
      readFileSync(v2).equals(readFileSync(releaseV2)) &&
      readFileSync(v1).equals(readFileSync(releaseV1))
  }) &&
    versionedFamilyHash(legacyHebrewShardDirectoryPath) === legacyHebrewShardFamilyHash,
  'a v1/v2 Strong\'s/BDB shard is missing, changed, malformed, or copied incorrectly'
)
verify(existsSync(jastrowCatalogPath), 'the Jastrow Hebrew catalog was not copied to dist')
verify(
  existsSync(releaseJastrowCatalogPath),
  'the immutable release copy of the Jastrow Hebrew catalog is missing'
)
const jastrowCatalog = JSON.parse(readFileSync(jastrowCatalogPath, 'utf8'))
verify(
  jastrowCatalog.version === 1 &&
    jastrowCatalog.shardCount === 128 &&
    jastrowCatalog.shardDirectory === jastrowShardDirectoryUrl &&
    Array.isArray(jastrowCatalog.entries) &&
    jastrowCatalog.sources?.length === 1 &&
    jastrowCatalog.sources[0] === 'jastrow',
  'the built Jastrow Hebrew catalog is malformed'
)
const expectedJastrowShards = Array.from(
  { length: 128 },
  (_, index) => `${index.toString(16).padStart(2, '0')}.json`
)
verify(
  expectedJastrowShards.every((file) =>
    existsSync(join(jastrowShardDirectoryPath, file)) &&
    existsSync(join(releaseJastrowShardDirectoryPath, file))
  ),
  'one or more mutable or immutable Jastrow Hebrew comparison shards are missing'
)

const precacheMatch = worker.match(/precacheAndRoute\((\[[\s\S]*?\]),\{\}\)/)
verify(precacheMatch, 'the generated precache manifest cannot be inspected')
const precacheUrls = [...precacheMatch[1].matchAll(/\burl:"([^"]+)"/g)]
  .map((match) => match[1])
verify(
  !precacheUrls.includes(rootDatasetUrl) &&
    !precacheUrls.includes(legacyRootDatasetUrl) &&
    !precacheUrls.includes(hebrewCatalogUrl) &&
    !precacheUrls.includes(legacyHebrewCatalogUrl),
  'an on-demand v1/v2 root or Hebrew catalog entered the precache'
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
  worker.includes('attested-roots-2026-07-v[12]') &&
    worker.includes('hebrew-catalog-2026-07-v[12]') &&
    worker.includes('hebrew-comparisons-2026-07-v[12]') &&
    worker.includes('NetworkFirst') &&
    worker.includes('attested-root-catalog') &&
    worker.includes('hebrew-comparison-catalog') &&
    worker.includes('hebrew-comparison-shards') &&
    /maxEntries:2\b/.test(worker) &&
    /maxEntries:128\b/.test(worker),
  'the v1/v2 root and Hebrew families lack non-evicting NetworkFirst caches'
)
verify(
  worker.includes('hebrew-jastrow-catalog-2026-07-v1') &&
    worker.includes('hebrew-jastrow-comparisons-2026-07-v1') &&
    worker.includes('hebrew-jastrow-comparison-catalog') &&
    worker.includes('hebrew-jastrow-comparison-shards') &&
    worker.includes('NetworkFirst'),
  'the Jastrow Hebrew comparison artifacts are not runtime-cached with NetworkFirst'
)

const javascriptPayload = readdirSync(join(distDir, 'assets'))
  .filter((file) => file.endsWith('.js'))
  .map((file) => readFileSync(join(distDir, 'assets', file), 'utf8'))
  .join('\n')
verify(
  !javascriptPayload.includes(rootDatasetPayloadProbe) &&
    !javascriptPayload.includes('attested-root-records-only-2026-07-v1'),
  'the attested-root payload marker was bundled into precached JavaScript'
)
verify(
  manifest.start_url === expectedBase && manifest.scope === expectedBase,
  `manifest scope does not match ${expectedBase}`
)

console.log(`verified PWA update build for ${expectedBase}`)
