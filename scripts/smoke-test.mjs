// Data-layer smoke test. Run with: node scripts/smoke-test.mjs (or npm test).
// Imports only src/data and src/lib modules (no JSX, no vite virtuals), so it
// runs under bare node. Expected glyph strings are built with
// String.fromCodePoint so no astral literal can be silently corrupted.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  foldFinals,
  toImperialAramaic,
  toMusnad,
  OSA_TOKENS,
  HEB_TO_IMPERIAL_ARAMAIC
} from '../src/lib/scripts.js'
import {
  ROOTS,
  DOUBLETS,
  CLUSTERS,
  rootKey,
  uniquePermutations,
  findRoot
} from '../src/data/roots.js'
import { LEXICON, CATEGORIES } from '../src/data/lexicon.js'
import { LANGUAGES } from '../src/data/languages.js'
import { REFERENCE_DICTIONARIES } from '../src/data/referenceDictionaries.js'
import { normalize, searchEntries, searchRoots } from '../src/lib/search.js'
import {
  GLOSS_STOP_WORDS,
  expandGlossRecord,
  expandGlossSense,
  searchGlossIndex
} from '../src/lib/glossSearch.js'
import { buildHebrewCatalog } from '../src/lib/hebrewCatalog.js'
import {
  clearReleaseNavigationMarker,
  discoverLatestRelease,
  monitorServiceWorkerUpdates,
  normalizeRelease,
  queryServiceWorkerRelease,
  registerServiceWorkerUpdates,
  replaceWithRelease,
  UPDATE_CHECK_INTERVAL_MS
} from '../src/lib/pwaUpdates.js'
import {
  fetchReleaseAsset,
  releaseAssetUrls
} from '../src/lib/releaseAssets.js'
import {
  clearAttestedRootCatalogCache,
  findAttestedRoot,
  loadAttestedRootCatalog,
  mergeAttestedRootCatalog
} from '../src/lib/attestedRootCatalog.js'
import {
  CATALOG_FILE,
  CATALOG_FORMAT
} from './build-attested-roots.mjs'

let failures = 0
function check(name, cond) {
  if (cond) {
    console.log(`ok    ${name}`)
  } else {
    failures++
    console.error(`FAIL  ${name}`)
  }
}

const cp = (...codes) => String.fromCodePoint(...codes)

// --- Installed-app updates -------------------------------------------------

const releaseA = normalizeRelease({
  buildId: 'aaaaaaaaaaaaaaaaaa',
  releaseNumber: 101
})
const releaseB = normalizeRelease({
  buildId: 'bbbbbbbbbbbbbbbbbb',
  releaseNumber: 102
})
const releaseC = normalizeRelease({
  buildId: 'cccccccccccccccccc',
  releaseNumber: 103
})

function memoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key)
  }
}

function updateTestWindow() {
  const windowObject = new EventTarget()
  windowObject.navigator = { onLine: true, serviceWorker: new EventTarget() }
  windowObject.location = {
    href: 'https://example.test/ancient-lexicon/',
    hostname: 'example.test',
    replace: () => {},
    reload: () => {}
  }
  windowObject.localStorage = memoryStorage()
  windowObject.sessionStorage = memoryStorage()
  windowObject.setTimeout = (callback) => {
    callback()
    return 1
  }
  return windowObject
}

const fakeWindow = new EventTarget()
const fakeDocument = new EventTarget()
const currentWorker = {
  release: releaseA,
  scriptURL: 'https://example.test/ancient-lexicon/sw.js',
  postMessage: () => {}
}
const fakeServiceWorker = new EventTarget()
fakeServiceWorker.register = async () => {
  throw new Error('an up-to-date worker must not be re-registered')
}
fakeWindow.navigator = { onLine: true, serviceWorker: fakeServiceWorker }
fakeWindow.location = {
  href: 'https://example.test/ancient-lexicon/',
  hostname: 'example.test',
  replace: () => {},
  reload: () => {}
}
fakeWindow.localStorage = memoryStorage()
fakeWindow.sessionStorage = memoryStorage()
fakeDocument.visibilityState = 'visible'
let intervalCallback
let updateInterval
fakeWindow.setInterval = (callback, interval) => {
  intervalCallback = callback
  updateInterval = interval
  return 1
}
let updateClock = 0
let updateCalls = 0
const currentRegistration = {
  active: currentWorker,
  waiting: null,
  installing: null,
  update: async () => {
    updateCalls++
  }
}
const updateMonitor = monitorServiceWorkerUpdates(
  currentRegistration,
  {
    windowObject: fakeWindow,
    documentObject: fakeDocument,
    serviceWorker: fakeServiceWorker,
    currentRelease: releaseA,
    discoverRelease: async () => ({ release: releaseA }),
    queryWorkerRelease: async (worker) => worker?.release || null,
    throttleMs: 1000,
    now: () => updateClock
  }
)
await updateMonitor.checkForUpdate(true)
const settleUpdateEvent = () => new Promise((resolve) => setImmediate(resolve))
check('PWA update polling uses the configured interval', updateInterval === UPDATE_CHECK_INTERVAL_MS)
check('PWA checks for an update as soon as registration completes', updateCalls === 1)
updateClock = 2000
fakeWindow.dispatchEvent(new Event('focus'))
await settleUpdateEvent()
check('PWA checks for updates when the installed app regains focus', updateCalls === 2)
fakeWindow.dispatchEvent(new Event('focus'))
await settleUpdateEvent()
check('PWA throttles duplicate lifecycle events', updateCalls === 2)
updateClock = 4000
fakeDocument.visibilityState = 'hidden'
fakeDocument.dispatchEvent(new Event('visibilitychange'))
check('PWA does not check for updates while hidden', updateCalls === 2)
fakeDocument.visibilityState = 'visible'
fakeDocument.dispatchEvent(new Event('visibilitychange'))
await settleUpdateEvent()
check('PWA checks for updates when the installed app returns to the foreground', updateCalls === 3)
updateClock = 6000
fakeWindow.navigator.onLine = false
fakeWindow.dispatchEvent(new Event('pageshow'))
check('PWA skips update checks while offline', updateCalls === 3)
fakeWindow.navigator.onLine = true
fakeWindow.dispatchEvent(new Event('online'))
await settleUpdateEvent()
check('PWA checks for updates when connectivity returns', updateCalls === 4)
updateClock = 8000
intervalCallback()
await settleUpdateEvent()
check('PWA periodically checks while it remains open', updateCalls === 5)

const fetchCalls = []
const discoveredRelease = await discoverLatestRelease({
  currentRelease: releaseA,
  baseUrl: '/ancient-lexicon/',
  now: () => 2468,
  fetchObject: async (url, options) => {
    fetchCalls.push({ url, options })
    if (url.startsWith('/ancient-lexicon/release.json')) {
      return { ok: true, json: async () => ({ ...releaseB }) }
    }
    throw new Error('release discovery must stay on the app origin')
  }
})
check(
  'PWA release discovery chooses the same-origin deployed marker',
  discoveredRelease.release.releaseId === releaseB.releaseId
)
check(
  'PWA release discovery bypasses caches without polling a per-client remote feed',
  fetchCalls.length === 1 &&
    fetchCalls[0].url === '/ancient-lexicon/release.json?update-check=2468' &&
    fetchCalls[0].options.cache === 'no-store' &&
    fetchCalls[0].options.credentials === 'same-origin'
)

const failedDiscovery = await discoverLatestRelease({
  currentRelease: releaseB,
  baseUrl: '/ancient-lexicon/',
  fetchObject: async () => { throw new Error('offline') }
})
check(
  'PWA release discovery preserves the installed release while offline',
  failedDiscovery.release.releaseId === releaseB.releaseId
)

const timeoutWindow = new EventTarget()
const timeoutDocument = new EventTarget()
const timeoutServiceWorker = new EventTarget()
const timeoutCurrentWorker = {
  release: releaseA,
  scriptURL: `https://example.test/ancient-lexicon/${releaseA.worker}`,
  postMessage: () => {}
}
const timeoutNextWorker = {
  release: releaseB,
  scriptURL: `https://example.test/ancient-lexicon/${releaseB.worker}`,
  postMessage: () => {}
}
const timeoutRegistration = {
  active: timeoutCurrentWorker,
  waiting: null,
  update: async () => {}
}
let timeoutClock = 0
let timeoutFetchCalls = 0
let timeoutFetchAborted = false
let timeoutRegistrationUrl
let timeoutNavigations = 0
let resolveTimeoutNavigation
const timeoutNavigation = new Promise((resolve) => {
  resolveTimeoutNavigation = resolve
})
timeoutWindow.navigator = { onLine: true, serviceWorker: timeoutServiceWorker }
timeoutWindow.location = {
  href: 'https://example.test/ancient-lexicon/',
  hostname: 'example.test',
  replace: () => {},
  reload: () => {}
}
timeoutWindow.fetch = (_url, options) => {
  timeoutFetchCalls++
  if (timeoutFetchCalls === 1) {
    return new Promise(() => {
      options.signal?.addEventListener('abort', () => {
        timeoutFetchAborted = true
      })
    })
  }
  return Promise.resolve({ ok: true, json: async () => ({ ...releaseB }) })
}
timeoutWindow.setTimeout = globalThis.setTimeout.bind(globalThis)
timeoutWindow.clearTimeout = globalThis.clearTimeout.bind(globalThis)
timeoutWindow.setInterval = () => 1
timeoutWindow.localStorage = memoryStorage()
timeoutWindow.sessionStorage = memoryStorage()
timeoutDocument.visibilityState = 'visible'
timeoutDocument.documentElement = { dataset: {} }
timeoutServiceWorker.register = async (url) => {
  timeoutRegistrationUrl = url
  return {
    active: timeoutNextWorker,
    waiting: null,
    update: async () => {}
  }
}
const timeoutMonitor = monitorServiceWorkerUpdates(timeoutRegistration, {
  windowObject: timeoutWindow,
  documentObject: timeoutDocument,
  serviceWorker: timeoutServiceWorker,
  currentRelease: releaseA,
  baseUrl: '/ancient-lexicon/',
  fetchTimeoutMs: 5,
  throttleMs: 10,
  now: () => timeoutClock,
  queryWorkerRelease: async (worker) => worker?.release || null,
  navigateToRelease: () => {
    timeoutNavigations++
    resolveTimeoutNavigation()
    return true
  }
})
await timeoutMonitor.checkForUpdate(true)
check(
  'PWA aborts a hung same-origin marker fetch and releases the in-flight check',
  timeoutFetchCalls === 1 && timeoutFetchAborted && timeoutNavigations === 0
)
timeoutClock = 20
timeoutWindow.dispatchEvent(new Event('pageshow'))
await Promise.race([
  timeoutNavigation,
  new Promise((_, reject) => globalThis.setTimeout(
    () => reject(new Error('pageshow did not retry the timed-out update check')),
    1000
  ))
])
check(
  'PWA retries after a marker timeout on the next lifecycle event and converges',
  timeoutFetchCalls === 2 &&
    timeoutRegistrationUrl === `/ancient-lexicon/${releaseB.worker}` &&
    timeoutNavigations === 1
)

async function proveMissedControllerChange(currentRelease, targetRelease) {
  const windowObject = updateTestWindow()
  const documentObject = new EventTarget()
  const serviceWorker = windowObject.navigator.serviceWorker
  const active = {
    release: targetRelease,
    scriptURL: `https://example.test/ancient-lexicon/${targetRelease.worker}`,
    postMessage: () => {}
  }
  let updateCalls = 0
  const registration = {
    active,
    waiting: null,
    update: async () => { updateCalls++ }
  }
  let registrations = 0
  let navigations = 0
  serviceWorker.register = async () => {
    registrations++
    return registration
  }
  documentObject.visibilityState = 'visible'
  windowObject.setInterval = () => 1
  const monitor = monitorServiceWorkerUpdates(registration, {
    windowObject,
    documentObject,
    serviceWorker,
    currentRelease,
    discoverRelease: async () => ({ release: targetRelease }),
    queryWorkerRelease: async (worker) => worker?.release || null,
    navigateToRelease: (release) => {
      if (release.releaseId === targetRelease.releaseId) navigations++
      return true
    }
  })
  await monitor.checkForUpdate(true)
  await monitor.checkForUpdate(true)
  return { registrations, navigations, updateCalls }
}

const missedAB = await proveMissedControllerChange(releaseA, releaseB)
const missedBC = await proveMissedControllerChange(releaseB, releaseC)
check(
  'PWA A to B update converges when the newer worker is already active and controllerchange was missed',
  missedAB.registrations === 0 && missedAB.navigations === 1 && missedAB.updateCalls === 0
)
check(
  'PWA B to C update repeats automatically without relying on controllerchange',
  missedBC.registrations === 0 && missedBC.navigations === 1
)

const waitingWindow = updateTestWindow()
const waitingDocument = new EventTarget()
const waitingServiceWorker = waitingWindow.navigator.serviceWorker
waitingDocument.visibilityState = 'visible'
waitingWindow.setInterval = () => 1
const oldWorker = { release: releaseA, postMessage: () => {} }
const nextWorker = {
  release: releaseB,
  postMessage: (message) => {
    if (message.type !== 'SKIP_WAITING') return
    waitingRegistration.active = nextWorker
    waitingRegistration.waiting = null
  }
}
const waitingRegistration = {
  active: oldWorker,
  waiting: null,
  update: async () => {}
}
let immutableRegistration
let waitingNavigations = 0
waitingServiceWorker.register = async (url, options) => {
  immutableRegistration = { url, options }
  waitingRegistration.waiting = nextWorker
  return waitingRegistration
}
const waitingMonitor = monitorServiceWorkerUpdates(waitingRegistration, {
  windowObject: waitingWindow,
  documentObject: waitingDocument,
  serviceWorker: waitingServiceWorker,
  currentRelease: releaseA,
  discoverRelease: async () => ({ release: releaseB }),
  queryWorkerRelease: async (worker) => worker?.release || null,
  navigateToRelease: () => {
    waitingNavigations++
    return true
  }
})
await waitingMonitor.checkForUpdate(true)
check(
  'PWA registers the immutable worker URL and activates an already-waiting release',
  immutableRegistration.url === '/sw-102-bbbbbbbbbbbbbbbbbb.js' &&
    immutableRegistration.options.scope === '/' &&
    immutableRegistration.options.updateViaCache === 'none' &&
    waitingRegistration.active === nextWorker &&
    waitingNavigations === 1
)

class FakeMessageChannel {
  constructor() {
    this.port1 = { onmessage: null, close: () => {}, start: () => {} }
    this.port2 = {
      postMessage: (data) => queueMicrotask(() => this.port1.onmessage?.({ data }))
    }
  }
}
const queriedRelease = await queryServiceWorkerRelease(
  {
    postMessage: (_message, ports) => ports[0].postMessage({
      type: 'ANCIENT_LEXICON_RELEASE',
      release: releaseB
    })
  },
  { MessageChannelObject: FakeMessageChannel }
)
check(
  'PWA identifies the active worker release through a MessageChannel handshake',
  queriedRelease.releaseId === releaseB.releaseId
)

const replaceStorage = memoryStorage()
let replacedUrl
const replaceWindow = {
  location: {
    href: 'https://example.test/ancient-lexicon/?keep=yes',
    replace: (url) => { replacedUrl = url }
  },
  sessionStorage: replaceStorage
}
check(
  'PWA update navigation is release-specific and guarded against a tight loop',
  replaceWithRelease(replaceWindow, releaseB, { now: () => 1000 }) &&
    new URL(replacedUrl).searchParams.get('__al_release') === releaseB.releaseId &&
    new URL(replacedUrl).searchParams.get('keep') === 'yes' &&
    !replaceWithRelease(replaceWindow, releaseB, { now: () => 2000 })
)

let cleanedUrl
const markerWindow = {
  location: {
    href: `https://example.test/ancient-lexicon/?keep=yes&__al_release=${releaseB.releaseId}`
  },
  history: {
    state: { retained: true },
    replaceState: (_state, _title, url) => { cleanedUrl = url }
  },
  sessionStorage: replaceStorage
}
check(
  'PWA removes its update marker only after the matching release boots',
  clearReleaseNavigationMarker({ windowObject: markerWindow, currentRelease: releaseB }) &&
    !new URL(cleanedUrl).searchParams.has('__al_release') &&
    new URL(cleanedUrl).searchParams.get('keep') === 'yes'
)

const immutableAssetUrls = releaseAssetUrls('dicts/example.json', {
  baseUrl: '/ancient-lexicon/',
  releasePrefix: `release-${releaseB.releaseId}/`
})
const assetFetchUrls = []
const fallbackAsset = await fetchReleaseAsset('dicts/example.json', {
  baseUrl: '/ancient-lexicon/',
  releasePrefix: `release-${releaseB.releaseId}/`,
  fetchImpl: async (url) => {
    assetFetchUrls.push(url)
    if (url === immutableAssetUrls[0]) throw new Error('offline cache miss')
    return { ok: true, marker: 'legacy-cache' }
  }
})
check(
  'release data uses an immutable URL and falls back to the prior offline cache',
  immutableAssetUrls[0] === `/ancient-lexicon/release-${releaseB.releaseId}/dicts/example.json` &&
    immutableAssetUrls[1] === '/ancient-lexicon/dicts/example.json' &&
    assetFetchUrls.join('|') === immutableAssetUrls.join('|') &&
    fallbackAsset.marker === 'legacy-cache'
)

const registrationWindow = new EventTarget()
const registrationDocument = new EventTarget()
const serviceWorker = new EventTarget()
let registeredWorker
let reloadCalls = 0
registrationDocument.visibilityState = 'hidden'
registrationWindow.location = {
  href: 'https://example.test/ancient-lexicon/',
  hostname: 'example.test',
  replace: () => {},
  reload: () => reloadCalls++
}
registrationWindow.navigator = { onLine: true, serviceWorker }
registrationWindow.setInterval = () => 1
registrationWindow.setTimeout = () => 1
registrationWindow.localStorage = memoryStorage()
registrationWindow.sessionStorage = memoryStorage()
serviceWorker.controller = {}
serviceWorker.register = async (url, options) => {
  registeredWorker = { url, options }
  return { active: null, waiting: null, installing: null, update: async () => {} }
}
await registerServiceWorkerUpdates({
  windowObject: registrationWindow,
  documentObject: registrationDocument,
  currentRelease: releaseA,
  baseUrl: '/ancient-lexicon/',
  queryWorkerRelease: async () => null
})
check(
  'PWA worker registration uses the immutable release URL, bypasses caches, and preserves scope',
  registeredWorker.url === '/ancient-lexicon/sw-101-aaaaaaaaaaaaaaaaaa.js' &&
    registeredWorker.options.scope === '/ancient-lexicon/' &&
    registeredWorker.options.updateViaCache === 'none'
)
serviceWorker.dispatchEvent(new Event('controllerchange'))
serviceWorker.dispatchEvent(new Event('controllerchange'))
await Promise.resolve()
await Promise.resolve()
check('PWA fallback reload runs exactly once for a legacy worker without a release handshake', reloadCalls === 1)

const firstInstallWindow = new EventTarget()
const firstInstallDocument = new EventTarget()
const firstInstallWorker = new EventTarget()
let registrationAttempts = 0
let retryRegistration
firstInstallDocument.visibilityState = 'hidden'
firstInstallWindow.location = {
  href: 'https://example.test/ancient-lexicon/',
  hostname: 'example.test',
  replace: () => {},
  reload: () => {}
}
firstInstallWindow.navigator = { onLine: true, serviceWorker: firstInstallWorker }
firstInstallWindow.setInterval = () => 1
firstInstallWindow.setTimeout = (callback) => {
  retryRegistration = callback
  return 1
}
firstInstallWindow.localStorage = memoryStorage()
firstInstallWindow.sessionStorage = memoryStorage()
firstInstallWorker.controller = null
firstInstallWorker.register = async () => {
  registrationAttempts++
  if (registrationAttempts === 1) throw new Error('WebKit not ready')
  return { active: null, waiting: null, installing: null, update: async () => {} }
}
const firstRegistration = await registerServiceWorkerUpdates({
  windowObject: firstInstallWindow,
  documentObject: firstInstallDocument,
  currentRelease: releaseA,
  retryMs: 10,
  queryWorkerRelease: async () => null
})
check('PWA launch survives a transient service-worker registration failure', firstRegistration === null)
await retryRegistration()
check('PWA retries service-worker registration in the same app session', registrationAttempts === 2)

// --- Script mappers ---------------------------------------------------------

check(
  "toImperialAramaic('מלכא') renders mem-lamedh-kaph-aleph",
  toImperialAramaic('מלכא') === cp(0x1084c, 0x1084b, 0x1084a, 0x10840)
)
check(
  'Imperial Aramaic map has all 22 letters plus 5 finals',
  Object.keys(HEB_TO_IMPERIAL_ARAMAIC).length === 27
)
check(
  'final letters fold: מלך and מלכ render identically',
  toImperialAramaic('מלך') === toImperialAramaic('מלכ')
)
for (const [fin, base] of [
  ['ם', 'מ'],
  ['ן', 'נ'],
  ['ף', 'פ'],
  ['ץ', 'צ']
]) {
  check(
    `final ${fin} folds to ${base}`,
    foldFinals(fin) === base &&
      toImperialAramaic(fin) === toImperialAramaic(base)
  )
}
check(
  "toMusnad(['m','l','k']) renders mem-lamedh-kaph",
  toMusnad(['m', 'l', 'k']) === cp(0x10a63, 0x10a61, 0x10a6b)
)
check(
  "toMusnad(['b','n']) renders beth-nun",
  toMusnad(['b', 'n']) === cp(0x10a68, 0x10a6c)
)
check('OSA token map has 29 tokens', Object.keys(OSA_TOKENS).length === 29)

// --- Permutations -----------------------------------------------------------

const qrbPerms = uniquePermutations(['ק', 'ר', 'ב'])
check('קרב has exactly 6 unique permutations', qrbPerms.length === 6)
const qrbFound = qrbPerms.filter((p) => findRoot('hebrew', p))
check(
  'all 6 permutations of קרב are attested roots in the database',
  qrbFound.length === 6
)
const expectedQrb = new Set(['קרב', 'קבר', 'רקב', 'רבק', 'בקר', 'ברק'])
check(
  'the קרב permutation set is exactly {קרב, קבר, רקב, רבק, בקר, ברק}',
  qrbPerms.every((p) => expectedQrb.has(p)) && expectedQrb.size === 6
)
check(
  'repeated letters deduplicate: לבב has 3 unique permutations, not 6',
  uniquePermutations(['ל', 'ב', 'ב']).length === 3
)
check(
  'rootKey folds finals: מלך and מלכ share a key',
  rootKey('מלך') === rootKey(['מ', 'ל', 'כ'])
)
check(
  'rootKey strips Masoretic pointing and folds final forms',
  rootKey('\u05e9\u05c1\u05b5\u05dd') === '\u05e9\u05de' &&
    rootKey('\u05d2\u05bc\u05b8\u05e8\u05b7\u05e9\u05c1') === '\u05d2\u05e8\u05e9'
)

// --- Complete published-root catalog --------------------------------------

const rootProjectPath = join(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = join(rootProjectPath, 'public', 'dicts', CATALOG_FILE)
const catalogText = readFileSync(catalogPath, 'utf8')
const publishedCatalog = JSON.parse(catalogText)
const strongsSource = JSON.parse(
  readFileSync(join(rootProjectPath, 'src', 'data', 'strongs.json'), 'utf8')
)
const bdbSource = JSON.parse(
  readFileSync(join(rootProjectPath, 'public', 'dicts', 'bdb.json'), 'utf8')
)
const independentRootLetters = (lemma) => {
  const word = (lemma || '').match(/[א-ת](?:[\u0591-\u05c7]*[א-ת])*[\u0591-\u05c7]*/u)?.[0] || ''
  const letters = foldFinals(
    word.normalize('NFKD').replace(/[\u0591-\u05c7]/gu, '')
  )
  return /^[אבגדהוזחטיכלמנסעפצקרשת]{2,5}$/u.test(letters)
    ? Array.from(letters)
    : null
}
const independentlyDirectStrongs = (entry) =>
  /\ba primitive root\b/i.test(entry.deriv || '') &&
  !/\bfrom a primitive root\b/i.test(entry.deriv || '') &&
  !/unused root/i.test(entry.deriv || '')
const strongsBySourceId = new Map(
  strongsSource.entries.map((entry) => [entry.id, entry])
)
const independentlyCorrespondingAramaic = (entry) => {
  const match = (entry.deriv || '').match(/^\(Aramaic\)\s+corresponding to (H\d+)\b/i)
  return Boolean(match && independentlyDirectStrongs(strongsBySourceId.get(match[1]) || {}))
}
const independentlyAlternateStrongs = (entry) => {
  const derivation = (entry.deriv || '').replace(/\s+/g, ' ').trim()
  const rootMarker = derivation.search(/\ba primitive root\b/i)
  if (rootMarker < 0) return []
  return derivation
    .slice(0, rootMarker)
    .split(';')
    .filter((clause) => /^\s*(?:or|also)\b/i.test(clause))
    .map(
      (clause) =>
        clause.match(/[א-ת](?:[\u0591-\u05c7]*[א-ת])*[\u0591-\u05c7]*/u)?.[0] || ''
    )
    .filter(Boolean)
}
const independentlyPointedRoot = (word) =>
  /[\u05b0-\u05bb\u05c7]|\u05d5\u05bc/u.test(word)
const sourceCandidates = []
for (const entry of strongsSource.entries) {
  const directRoot = independentlyDirectStrongs(entry)
  const primitiveWord =
    /\ba primitive word\b/i.test(entry.deriv || '') &&
    !/\bfrom a primitive word\b/i.test(entry.deriv || '')
  const correspondingAramaic = independentlyCorrespondingAramaic(entry)
  if (!directRoot && !primitiveWord && !correspondingAramaic) continue
  const lemmas = directRoot
    ? [entry.lemma, ...independentlyAlternateStrongs(entry)]
    : [entry.lemma]
  for (const lemma of lemmas) {
    const letters = independentRootLetters(lemma)
    if (!letters || !independentlyPointedRoot(lemma)) continue
    sourceCandidates.push({
      source: 'strongs',
      sourceId: entry.id,
      sourceLanguage: /^\(Aramaic\)/i.test((entry.deriv || '').trim())
        ? 'biblical-aramaic'
        : 'hebrew',
      letters
    })
  }
}
for (const entry of bdbSource.entries) {
  // Shin/sin dots identify the consonant; they are not lexical pointing.
  const hasLexicalPointing = independentlyPointedRoot(entry.lemma || '')
  const explicitUnpointedRoot = !hasLexicalPointing
  if (
    !entry.id.endsWith('.aa') ||
    (!/^vb(?:\.|$)/i.test(entry.pos || '') && !explicitUnpointedRoot)
  ) continue
  const letters = independentRootLetters(entry.lemma)
  if (!letters || (/[\u0591-\u05c7]/u.test(entry.lemma || '') && letters.length > 4)) continue
  sourceCandidates.push({
    source: 'bdb',
    sourceId: entry.id,
    sourceLanguage: entry.id.startsWith('x') ? 'biblical-aramaic' : 'hebrew',
    letters
  })
}
const completeCatalog = mergeAttestedRootCatalog(publishedCatalog)

let requestedRootCatalog
const loadedRootCatalog = await loadAttestedRootCatalog({
  baseUrl: '/ancient-lexicon/',
  fetchImpl: async (url, options) => {
    requestedRootCatalog = { url, options }
    return { ok: true, json: async () => publishedCatalog }
  }
})
check(
  'published-root loader bypasses the HTTP cache and respects project base paths',
  requestedRootCatalog.url ===
    '/ancient-lexicon/dicts/attested-roots-2026-07-v1.json' &&
    requestedRootCatalog.options.cache === 'no-cache' &&
    loadedRootCatalog.sourceCount === publishedCatalog.count
)
clearAttestedRootCatalogCache()

check('published-root catalog has the expected versioned format', publishedCatalog.format === CATALOG_FORMAT)
check(
  'published-root catalog count matches its records and exceeds the curated set',
  publishedCatalog.count === publishedCatalog.roots.length &&
    publishedCatalog.count > ROOTS.length
)
check(
  'published-root catalog candidate count is independently reproducible',
  publishedCatalog.candidateCount === sourceCandidates.length
)

const publishedIds = publishedCatalog.roots.map((root) => root.id)
const publishedKeys = publishedCatalog.roots.map(
  (root) => `${root.lang}:${rootKey(root.letters)}`
)
check('published-root ids are unique', new Set(publishedIds).size === publishedIds.length)
check('published-root consonant keys are unique', new Set(publishedKeys).size === publishedKeys.length)
check(
  'every published root has non-final letters, an attestation, and exact source provenance',
  publishedCatalog.roots.every((root) =>
    ['hebrew', 'biblical-aramaic'].includes(root.lang) &&
    root.sourceDerived === true &&
    Array.isArray(root.letters) &&
    root.letters.length >= 2 &&
    root.letters.length <= 5 &&
    root.letters.every((letter) => !/[ךםןףץ]/u.test(letter)) &&
    Array.isArray(root.attested) &&
    root.attested.length > 0 &&
    root.attested.every((attestation) =>
      /[א-ת]/u.test(attestation.word) &&
      attestation.gloss &&
      attestation.source &&
      attestation.sourceId &&
      attestation.sourceLanguage === root.lang
    ) &&
    Array.isArray(root.sources) &&
    root.sources.length > 0 &&
    root.sources.every((source) =>
      source.source &&
      source.sourceId &&
      source.headword &&
      /[\u05d0-\u05ea]/u.test(source.headword) &&
      source.sourceLanguage === root.lang
    )
  )
)

const publishedByKey = new Map(
  publishedCatalog.roots.map((root) => [
    `${root.lang}:${rootKey(root.letters)}`,
    root
  ])
)
check(
  'every eligible pinned-dictionary record is represented in the generated catalog',
  sourceCandidates.every((candidate) => {
    const root = publishedByKey.get(
      `${candidate.sourceLanguage}:${rootKey(candidate.letters)}`
    )
    return root?.sources.some(
      (source) =>
        source.source === candidate.source &&
        source.sourceId === candidate.sourceId &&
        source.sourceLanguage === candidate.sourceLanguage
    )
  })
)
check(
  'unpointed BDB root headings with a shin dot remain source-backed roots',
  publishedByKey
    .get(`hebrew:${rootKey('\u05e8\u05e9\u05e3')}`)
    ?.sources.some((source) => source.source === 'bdb' && source.sourceId === 't.eu.aa')
)
check(
  'the pointed five-consonant Aramaic derivative remains excluded from roots',
  !publishedCatalog.roots.some((root) =>
    root.sources?.some((source) => source.source === 'bdb' && source.sourceId === 'xv.am.aa')
  )
)
const alternateRootRegressions = new Map([
  ['סוט', 'H7750'],
  ['גול', 'H1523'],
  ['עמש', 'H6006'],
  ['סכר', 'H7936']
])
check(
  'explicit Strong’s alternate primitive-root headings remain source-backed roots',
  [...alternateRootRegressions].every(([letters, sourceId]) =>
    publishedByKey
      .get(`hebrew:${rootKey(letters)}`)
      ?.sources.some(
        (source) => source.source === 'strongs' && source.sourceId === sourceId
      )
  )
)
check(
  'Strong’s related and erroneous references are not imported as alternate headings',
  !publishedByKey
    .get(`hebrew:${rootKey('ילכ')}`)
    ?.sources.some((source) => source.sourceId === 'H1980') &&
    !publishedByKey
      .get(`hebrew:${rootKey('שבר')}`)
      ?.attested.some(
        (attestation) =>
          attestation.sourceId === 'H7663' && attestation.word === 'שָׁבַר'
      )
)
check('generated root catalog contains no asterisked forms', !catalogText.includes('*'))
check('generated root catalog contains no reconstructed-form labels', !/proto-/i.test(catalogText))

const completeByKey = completeCatalog.byUnionKey
const signature = (root) =>
  Array.from(foldFinals(root.letters.join(''))).sort().join('')
const groups = new Map()
for (const root of completeByKey.values()) {
  const groupKey = signature(root)
  if (!groups.has(groupKey)) groups.set(groupKey, [])
  groups.get(groupKey).push(root)
}

let exactPermutationResolution = true
let symmetricPermutationResolution = true
let directedPermutationPairs = 0
for (const group of groups.values()) {
  const expected = new Set(group.map((root) => rootKey(root.letters)))
  const neighbors = new Map()

  for (const root of group) {
    const foundKeys = new Set()
    for (const permutation of uniquePermutations(root.letters)) {
      const requestedKey = rootKey(permutation)
      const expectedRoot = completeByKey.get(requestedKey)
      const found = findAttestedRoot(completeCatalog, root.lang, permutation)
      exactPermutationResolution &&= expectedRoot
        ? Boolean(found) && rootKey(found.letters) === requestedKey
        : found === null
      if (found) foundKeys.add(rootKey(found.letters))
    }
    exactPermutationResolution &&=
      foundKeys.size === expected.size &&
      [...expected].every((expectedKey) => foundKeys.has(expectedKey))
    neighbors.set(rootKey(root.letters), foundKeys)
  }

  for (const first of group) {
    for (const second of group) {
      if (first === second) continue
      directedPermutationPairs++
      symmetricPermutationResolution &&=
        neighbors.get(rootKey(first.letters)).has(rootKey(second.letters)) &&
        neighbors.get(rootKey(second.letters)).has(rootKey(first.letters))
    }
  }
}

check(
  'attested permutation resolution is exact for every root and every possible ordering',
  exactPermutationResolution
)
check(
  'every attested anagram relationship is mutual and the invariant is non-vacuous',
  directedPermutationPairs > 0 && symmetricPermutationResolution
)

// Repeat the invariant from every language-specific card, not only the
// preferred record in each consonant-key bucket. Hebrew and Biblical-Aramaic
// cards can share an exact spelling, but every distinct reordering must still
// resolve from both cards to the requested consonant key.
let everyCatalogCardResolution = true
let catalogCardDirectedPairs = 0
for (const root of completeCatalog.roots) {
  const expectedKeys = new Set(
    (groups.get(signature(root)) || []).map((member) => rootKey(member.letters))
  )
  const foundKeys = new Set()
  for (const permutation of uniquePermutations(root.letters)) {
    const requestedKey = rootKey(permutation)
    const expectedRoot = completeByKey.get(requestedKey)
    const found = findAttestedRoot(completeCatalog, root.lang, permutation)
    everyCatalogCardResolution &&= expectedRoot
      ? Boolean(found) && rootKey(found.letters) === requestedKey
      : found === null
    if (found) foundKeys.add(rootKey(found.letters))
  }
  everyCatalogCardResolution &&=
    foundKeys.size === expectedKeys.size &&
    [...expectedKeys].every((expectedKey) => foundKeys.has(expectedKey))
  catalogCardDirectedPairs += Math.max(0, expectedKeys.size - 1)
}
check(
  'every Hebrew and Biblical-Aramaic card resolves its complete mutual anagram set',
  catalogCardDirectedPairs > 0 && everyCatalogCardResolution
)

const shmr = findAttestedRoot(completeCatalog, 'hebrew', 'שמר')
const rshm = findAttestedRoot(completeCatalog, 'hebrew', 'רשמ')
const aramaicRshm = findAttestedRoot(
  completeCatalog,
  'biblical-aramaic',
  'רשמ'
)
check(
  'שמר and רשמ resolve mutually through the comprehensive catalog',
  shmr &&
    rshm &&
    uniquePermutations(shmr.letters).some((permutation) => rootKey(permutation) === rootKey(rshm.letters)) &&
    uniquePermutations(rshm.letters).some((permutation) => rootKey(permutation) === rootKey(shmr.letters))
)
check(
  'Hebrew and Biblical-Aramaic רשמ remain separate source cards',
  rshm?.lang === 'hebrew' &&
    aramaicRshm?.lang === 'biblical-aramaic' &&
    rshm.id !== aramaicRshm.id &&
    rshm.sources.every((source) => source.sourceLanguage === 'hebrew') &&
    aramaicRshm.sources.every(
      (source) => source.sourceLanguage === 'biblical-aramaic'
    )
)
check(
  'רשמ records the attested רָשׁוּם form and Daniel 10:21 citation',
  rshm?.attested.some(
    (attestation) =>
      attestation.word === 'רָשׁוּם' && attestation.citation === 'Daniel 10:21'
  )
)

const qrbComprehensive = uniquePermutations('קרב').filter((permutation) =>
  findAttestedRoot(completeCatalog, 'hebrew', permutation)
)
check('the complete catalog preserves all six קרב roots', qrbComprehensive.length === 6)
const expectedAbr = new Set(['עבר', 'ערב', 'בער', 'רעב', 'רבע'])
const foundAbr = new Set(
  uniquePermutations('עבר')
    .filter((permutation) => findAttestedRoot(completeCatalog, 'hebrew', permutation))
    .map((permutation) => rootKey(permutation))
)
check(
  'the עבר grid resolves every source-attested member and keeps ברע as an honest ghost',
  foundAbr.size === expectedAbr.size &&
    [...expectedAbr].every((key) => foundAbr.has(key)) &&
    findAttestedRoot(completeCatalog, 'hebrew', 'ברע') === null
)
check(
  'derived BDB verb forms are not misclassified as roots',
  ['התיחש', 'קיננ', 'שיזב', 'שיציא'].every(
    (letters) => !completeCatalog.byUnionKey.has(rootKey(letters))
  )
)
check(
  'canonical roots behind audited derived forms remain present',
  ['יחש', 'שזב', 'יצא'].every((letters) =>
    completeCatalog.byUnionKey.has(rootKey(letters))
  )
)

const reviewedBiconsonantals = new Set([
  'בנ', 'אל', 'אב', 'אמ', 'יד', 'שמ', 'אח', 'עמ', 'שש', 'עז',
  'דג', 'דב', 'פה', 'שנ', 'דמ', 'ימ', 'הר', 'אש', 'עצ', 'נר'
])
const actualBiconsonantals = new Set(
  ROOTS.filter((root) => root.letters.length === 2).map((root) => rootKey(root.letters))
)
check(
  'the reviewed attested biconsonantal inventory remains exact and source-backed',
  actualBiconsonantals.size === reviewedBiconsonantals.size &&
    [...reviewedBiconsonantals].every(
      (key) =>
        actualBiconsonantals.has(key) &&
        completeCatalog.byUnionKey.has(key) &&
        completeCatalog.byUnionKey.get(key).attested.length > 0
    )
)

// --- Database integrity -----------------------------------------------------

const lexIds = LEXICON.map((e) => e.id)
check('no duplicate lexicon entry ids', new Set(lexIds).size === lexIds.length)
const rootIds = ROOTS.map((r) => r.id)
check('no duplicate root ids', new Set(rootIds).size === rootIds.length)
const rootKeys = ROOTS.map((r) => r.lang + ':' + rootKey(r.letters))
check(
  'no duplicate (lang, letters) roots',
  new Set(rootKeys).size === rootKeys.length
)

for (const entry of LEXICON) {
  check(
    `root chip resolves: ${entry.id} (${entry.hebrew.root})`,
    findRoot('hebrew', entry.hebrew.root) !== null
  )
}

const FINALS = /[ךםןףץ]/
check(
  'no final letters in any root letters array',
  ROOTS.every((r) => !r.letters.some((l) => FINALS.test(l)))
)
check(
  'no final letters in any lexicon hebrew.root',
  LEXICON.every((e) => !FINALS.test(e.hebrew.root))
)

const langIds = new Set(LANGUAGES.map((l) => l.id))
check('language registry has 6 languages', langIds.size === 6)
for (const entry of LEXICON) {
  const keys = Object.keys(entry.forms || {})
  check(
    `forms keys of ${entry.id} are all registered languages`,
    keys.every((k) => langIds.has(k))
  )
  const ar = entry.forms.aramaic
  if (ar) {
    check(`aramaic form of ${entry.id} has hebrewLetters`, !!ar.hebrewLetters)
  }
  const osa = entry.forms.osa
  if (osa) {
    check(
      `osa form of ${entry.id} has valid tokens`,
      Array.isArray(osa.tokens) && osa.tokens.every((t) => t in OSA_TOKENS)
    )
  }
}

check('DOUBLETS has at least 3 entries', DOUBLETS.length >= 3)
check(
  'every doublet type is metathesis or variant',
  DOUBLETS.every((d) => d.type === 'metathesis' || d.type === 'variant')
)
check(
  'every doublet root resolves in the database',
  DOUBLETS.every((d) => d.roots.every((r) => findRoot('hebrew', r)))
)
check(
  'every doublet has a citation',
  DOUBLETS.every((d) => typeof d.citation === 'string' && d.citation.length > 0)
)
check('CLUSTERS has at least 1 entry', CLUSTERS.length >= 1)
check(
  'every cluster has id, title, note, and at least 2 members',
  CLUSTERS.every(
    (c) => c.id && c.title && c.note && Array.isArray(c.members) && c.members.length >= 2
  )
)
check(
  'every cluster member resolves in the database',
  CLUSTERS.every((c) => c.members.every((m) => findRoot('hebrew', m)))
)
check(
  'no final letters in DOUBLETS root strings',
  DOUBLETS.every((d) => d.roots.every((r) => !FINALS.test(r)))
)
check(
  'no final letters in CLUSTERS member strings',
  CLUSTERS.every((c) => c.members.every((m) => !FINALS.test(m)))
)

// --- No reconstructed forms anywhere in the data files -----------------------

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'src', 'data')
const dataFiles = [
  'languages.js',
  'lexicon.js',
  'roots.js',
  ...readdirSync(join(dataDir, 'lexicon')).map((f) => join('lexicon', f))
]
for (const file of dataFiles) {
  const text = readFileSync(join(dataDir, file), 'utf8')
  check(`no asterisked forms in ${file}`, !text.includes('*'))
  // Comment lines may state the no-proto-forms policy; data strings may not.
  const dataLines = text
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n')
  check(`no proto-forms in ${file}`, !/proto-/i.test(dataLines))
}

// --- Database integrity at scale ---------------------------------------------
// These invariants keep a growing database honest: pointing present where the
// conventions promise it, ids well-formed, and every original-script string
// inside the Unicode block of its own script (a glyph pasted from the wrong
// script, or typed from memory, fails loudly here).

const NIQQUD = /[ְ-ׇּׁׂ]/
check(
  'every lexicon hebrew.word carries Masoretic pointing',
  LEXICON.every((e) => NIQQUD.test(e.hebrew.word))
)
check(
  'every root attested word carries Masoretic pointing',
  ROOTS.every((r) => (r.attested || []).every((a) => NIQQUD.test(a.word)))
)
check(
  'every root has at least one attested word',
  ROOTS.every((r) => Array.isArray(r.attested) && r.attested.length > 0)
)
check(
  'every lexicon entry has at least one English gloss',
  LEXICON.every(
    (e) => Array.isArray(e.english) && e.english.length > 0 && e.english.every(Boolean)
  )
)
check(
  'every lexicon entry has hebrew word, translit, and root',
  LEXICON.every((e) => e.hebrew?.word && e.hebrew?.translit && e.hebrew?.root)
)
check(
  'every form is a non-empty object with a payload field',
  LEXICON.every((e) =>
    Object.values(e.forms || {}).every(
      (f) => f && (f.translit || f.script || f.hebrewLetters || f.tokens)
    )
  )
)
check(
  'lexicon ids are well-formed (lowercase, hyphenated)',
  LEXICON.every((e) => /^[a-z][a-z0-9-]*$/.test(e.id))
)
check(
  'root ids are well-formed (he- prefix)',
  ROOTS.every((r) => /^he-[a-z0-9-]+$/.test(r.id))
)
check(
  'aramaic hebrewLetters use Hebrew letters only (no pointing)',
  LEXICON.every((e) => {
    const hl = e.forms?.aramaic?.hebrewLetters
    return !hl || /^[א-ת]+$/.test(hl)
  })
)
check(
  'every hebrew.word stays inside the Hebrew block',
  LEXICON.every((e) => [...e.hebrew.word].every((ch) => {
    const c = ch.codePointAt(0)
    return c >= 0x0590 && c <= 0x05ff
  }))
)

const inCuneiform = (c) =>
  (c >= 0x12000 && c <= 0x123ff) || (c >= 0x12400 && c <= 0x1247f)
const inHieroglyphs = (c) => c >= 0x13000 && c <= 0x1342f
const SCRIPT_BLOCKS = {
  akkadian: inCuneiform,
  sumerian: inCuneiform,
  hittite: inCuneiform,
  egyptian: inHieroglyphs
}
for (const [lang, inBlock] of Object.entries(SCRIPT_BLOCKS)) {
  check(
    `every ${lang} script string stays inside its own Unicode block`,
    LEXICON.every((e) => {
      const s = e.forms?.[lang]?.script
      return !s || [...s].every((ch) => inBlock(ch.codePointAt(0)))
    })
  )
}

// --- Imported Strong's lexicon (published reference work; checked
// structurally, not editorially — see scripts/import-strongs.mjs) ------------

const strongs = JSON.parse(
  readFileSync(join(dataDir, 'strongs.json'), 'utf8')
)
check('strongs.json has more than 8000 entries', strongs.count > 8000)
check(
  'strongs.json count matches entries length',
  strongs.count === strongs.entries.length
)
const strongsIds = strongs.entries.map((e) => e.id)
check(
  'strongs ids are unique and well-formed',
  new Set(strongsIds).size === strongsIds.length &&
    strongsIds.every((id) => /^H\d+$/.test(id))
)
check(
  'every strongs entry has a Hebrew lemma and a definition',
  strongs.entries.every(
    (e) =>
      e.lemma &&
      [...e.lemma].some((ch) => {
        const c = ch.codePointAt(0)
        return c >= 0x0590 && c <= 0x05ff
      }) &&
      typeof e.def === 'string' &&
      e.def.length > 0
  )
)
check(
  'strongs.json declares its provenance',
  typeof strongs.work === 'string' && strongs.work.includes('public domain')
)

// --- The on-demand reference dictionaries in public/dicts/ ------------------
// Each is a published dictionary or openly licensed lexical dataset loaded at
// runtime; check structure and that every registry item has its data file.

const projectRoot = join(here, '..')
const dictsDir = join(projectRoot, 'public', 'dicts')
const referenceUiText = readFileSync(
  join(projectRoot, 'src', 'components', 'ReferenceDictionaries.jsx'),
  'utf8'
)
check(
  'reference source scope, transformation, and links render before dictionary entries',
  referenceUiText.indexOf('className="dictionary-provenance"') >= 0 &&
    referenceUiText.indexOf('className="dictionary-provenance"') <
      referenceUiText.indexOf('results.slice(0, visible)') &&
    referenceUiText.includes('data.conversion') &&
    referenceUiText.includes('data.licenseUrl') &&
    referenceUiText.includes('data.source') &&
    referenceUiText.includes('data.fetchedAt') &&
    referenceUiText.includes('data.latestRetainedRevisionTimestamp')
)
const viteConfigText = readFileSync(join(projectRoot, 'vite.config.js'), 'utf8')
const mainText = readFileSync(join(projectRoot, 'src', 'main.jsx'), 'utf8')
check(
  'PWA build keeps one manual registration with immediate worker takeover',
  viteConfigText.includes('injectRegister: false') &&
    viteConfigText.includes('skipWaiting: true') &&
    viteConfigText.includes('clientsClaim: true') &&
    mainText.includes('registerServiceWorkerUpdates') &&
    !mainText.includes('virtual:pwa-register')
)
const dictionaryRouteStart = viteConfigText.indexOf(
  "urlPattern: /\\/dicts\\/.*\\.json$/"
)
const dictionaryRouteHeader = dictionaryRouteStart >= 0
  ? viteConfigText.slice(
      dictionaryRouteStart,
      viteConfigText.indexOf('options:', dictionaryRouteStart)
    )
  : ''
check(
  'all runtime dictionary JSON uses network-first freshness with offline fallback',
  dictionaryRouteHeader.includes("handler: 'NetworkFirst'")
)
const dictionaryLoaderText = readFileSync(
  join(projectRoot, 'src', 'lib', 'referenceDictionaryLoader.js'),
  'utf8'
)
check(
  'parsed dictionary caches reset safely when an updated worker takes control',
  dictionaryLoaderText.includes(
    "addEventListener('controllerchange', clearReferenceDictionaryCaches)"
  ) &&
    dictionaryLoaderText.includes('generation !== cacheGeneration') &&
    dictionaryLoaderText.includes('PENDING.get(dict.id) === pending')
)
const registryText = readFileSync(
  join(dataDir, 'referenceDictionaries.js'),
  'utf8'
)
const urlDicts = [...registryText.matchAll(/url:\s*'dicts\/([^']+)'/g)].map(
  (m) => m[1]
)
const referenceData = new Map([['strongs', strongs]])
const reviewedSmallDictionaryMinimums = new Map([
  ['hittite-asjp.json', 30],
  ['hittite-wikidata.json', 39],
  ['osa-wikidata.json', 8]
])
check('reference registry declares on-demand dictionaries', urlDicts.length >= 1)
for (const file of urlDicts) {
  let dict
  try {
    dict = JSON.parse(readFileSync(join(dictsDir, file), 'utf8'))
  } catch {
    check(`reference dictionary ${file} is present and valid JSON`, false)
    continue
  }
  check(
    `${file}: has entries and a matching count`,
    Array.isArray(dict.entries) &&
      dict.entries.length >= (reviewedSmallDictionaryMinimums.get(file) || 101) &&
      dict.count === dict.entries.length
  )
  check(
    `${file}: every entry has an id, a headword, and a definition`,
    dict.entries.every((e) => e.id && e.lemma && typeof e.def === 'string' && e.def.length > 0)
  )
  check(
    `${file}: ids are unique`,
    new Set(dict.entries.map((e) => e.id)).size === dict.entries.length
  )
  check(
    `${file}: declares its source work`,
    typeof dict.work === 'string' && dict.work.length > 0
  )
  const registered = REFERENCE_DICTIONARIES.find(
    (item) => item.source.kind === 'url' && item.source.url.endsWith(file)
  )
  if (registered) referenceData.set(registered.id, dict)
}

const hittiteIecor = referenceData.get('hittite-iecor')
check(
  'IE-CoR Hittite subset records its exact open source and attested-form filtering',
  hittiteIecor?.doi === '10.5281/zenodo.13304537' &&
    hittiteIecor?.license === 'CC BY 4.0' &&
    hittiteIecor?.licenseUrl === 'https://creativecommons.org/licenses/by/4.0/' &&
    hittiteIecor?.excludedReconstructed === 4 &&
    hittiteIecor?.omittedReconstructedSpellings === 5
)
check(
  'IE-CoR bundled fields contain no reconstructed starred form',
  hittiteIecor?.entries.every((entry) => !JSON.stringify(entry).includes('*'))
)
const iecorLeg = hittiteIecor?.entries.find((entry) => entry.id === '80-93-1')
check(
  'IE-CoR meaning guides use authoritative English concepts, not contributor glosses',
  hittiteIecor?.entries.every((entry) => entry.def === entry.concept) &&
    iecorLeg?.def === 'leg' &&
    /Beines/i.test(iecorLeg?.sourceGloss || '') &&
    hittiteIecor.entries.every((entry) => !/Beines/i.test(entry.def))
)

const hittiteWiktionary = referenceData.get('hittite-wiktionary')
const osaWiktionary = referenceData.get('osa-wiktionary')
const exactRevisionSource = (entry) =>
  /^https:\/\/en\.wiktionary\.org\/w\/index\.php\?title=.+&oldid=\d+$/.test(entry.source) &&
  Number.isInteger(entry.revision) &&
  /^\d{4}-\d{2}-\d{2}T/.test(entry.timestamp)
const truthfulWiktionaryFetchMetadata = (data) => {
  const latestRetainedRevisionTimestamp = data.entries.reduce(
    (latest, entry) => (entry.timestamp > latest ? entry.timestamp : latest),
    ''
  )
  return (
    !Object.hasOwn(data, 'snapshot') &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(data.fetchedAt) &&
    data.latestRetainedRevisionTimestamp === latestRetainedRevisionTimestamp &&
    Date.parse(data.fetchedAt) >= Date.parse(latestRetainedRevisionTimestamp)
  )
}
check(
  'Wiktionary snapshots select CC BY-SA 4.0 and retain exact revision attribution',
  [hittiteWiktionary, osaWiktionary].every((data) =>
    data?.license === 'CC BY-SA 4.0' &&
    data?.licenseUrl === 'https://creativecommons.org/licenses/by-sa/4.0/' &&
    data.entries.every(exactRevisionSource) &&
    truthfulWiktionaryFetchMetadata(data)
  )
)
check(
  'Hittite Wiktionary headwords and scripts are clean and correctly tagged',
  hittiteWiktionary?.entries.every((entry) =>
    entry.lang === 'hit' &&
    !entry.lemma.includes('/') &&
    !/[<>{}\[\]]/.test(`${entry.lemma}${entry.script}`) &&
    !JSON.stringify(entry).includes('*') &&
    [...entry.script].every((char) => char === '-' || inCuneiform(char.codePointAt(0)))
  )
)
check(
  'truncated Wiktionary comment does not leak into the Hittite headword',
  hittiteWiktionary?.entries.find(
    (entry) => entry.id === 'wiktionary-hittite-hit-1022842-verb-1'
  )?.lemma === 'i-ya-at-ta'
)
check(
  'bracket-delimited Hittite IPA is separated from both known headwords',
  [
    {
      id: 'wiktionary-hittite-hit-6895917-adjective-1',
      lemma: 'iš-ḫa-nu-wa-an-za',
      pron: '[ʔsχn̩want͡s]'
    },
    {
      id: 'wiktionary-hittite-hit-7037188-adjective-1',
      lemma: 'iš-ḫar-wa-an-za',
      pron: '[ʔsχr̩want͡s]'
    }
  ].every(({ id, lemma, pron }) => {
    const entry = hittiteWiktionary?.entries.find((candidate) => candidate.id === id)
    return entry?.lemma === lemma && entry?.pron === pron
  })
)
const osaLanguageTags = {
  Sabaean: 'xsa',
  Minaean: 'inm',
  Qatabanian: 'xqt',
  'Old South Arabian': undefined
}
check(
  'OSA Wiktionary rows retain variety, valid language tags, and Musnad script',
  osaWiktionary?.entries.every((entry) =>
    Object.hasOwn(osaLanguageTags, entry.variety) &&
    entry.lang === osaLanguageTags[entry.variety] &&
    !JSON.stringify(entry).includes('*') &&
    [...entry.script].every((char) => char === ' ' || (
      char.codePointAt(0) >= 0x10a60 && char.codePointAt(0) <= 0x10a7f
    ))
  )
)
check(
  'Wiktionary browse definitions do not leak internal language-template codes',
  [...(hittiteWiktionary?.entries || []), ...(osaWiktionary?.entries || [])]
    .every((entry) => !/\b(?:xsa|hit)-.* form of/i.test(entry.def))
)

const hittiteAsjp = referenceData.get('hittite-asjp')
const hittiteDiacl = referenceData.get('hittite-diacl')
check(
  'DIACL v3.0 Hittite subset retains its open release and honest coverage',
  hittiteDiacl?.count === 146 &&
    new Set(hittiteDiacl.entries.map((entry) => entry.conceptId)).size === 121 &&
    hittiteDiacl?.doi === '10.5281/zenodo.5121561' &&
    hittiteDiacl?.license === 'CC BY 4.0' &&
    hittiteDiacl?.releaseCommit === '393db4ab0a4b84891b96bbf619c7a94663e44d5e' &&
    hittiteDiacl?.excludedReconstructed === 0
)
check(
  'DIACL inconsistent duplicate assignments are reported and absent',
  hittiteDiacl?.excludedInconsistent === 3 &&
    ['35500-33_dog-2', '35500-50_silver-1', '35500-71_spear-1'].every((id) =>
      hittiteDiacl.excludedInconsistentEntries.some((entry) => entry.id === id && entry.reason) &&
      !hittiteDiacl.entries.some((entry) => entry.id === id)
    ) &&
    hittiteDiacl.entries.every((entry) => !entry.lemma.includes('*'))
)
const hittiteSturtevant = referenceData.get('hittite-sturtevant')
check(
  'Sturtevant historical glossary retains exact public-domain scan provenance',
  hittiteSturtevant?.count === 633 &&
    hittiteSturtevant?.rights === 'Copyright review: Public domain according to HathiTrust rights database' &&
    hittiteSturtevant?.sourceIdentifier === 'hittiteglossary00stur' &&
    hittiteSturtevant?.sourceFile?.name === 'hittiteglossary00stur_djvu.xml' &&
    hittiteSturtevant?.sourceFile?.md5 === 'f83008a69cd53cab9d5048f53ce7b9e7' &&
    hittiteSturtevant?.sourceFile?.sha1 === '013de555c3856ac89f5c25e070601398a6feb6ce' &&
    hittiteSturtevant?.sourceFile?.verifiedAgainstMetadata === true
)
check(
  'Sturtevant OCR subset keeps strict exclusions and accounts for every row',
  hittiteSturtevant?.entries.every((entry) =>
    entry.ocrConfidence >= 90 &&
    !entry.lemma.startsWith('*') &&
    !/[?\p{Lu}]/u.test(entry.lemma) &&
    entry.source === `https://archive.org/details/hittiteglossary00stur/page/n${entry.iaLeaf}/mode/1up`
  ) &&
    Object.values(hittiteSturtevant?.extraction?.dropped || {})
      .reduce((sum, count) => sum + count, 0) + hittiteSturtevant.count === 4234
)
check(
  'Sturtevant Latin-only and Latin-contaminated glosses are reported and excluded',
  hittiteSturtevant?.extraction?.dropped?.latinOnlyGloss === 11 &&
    hittiteSturtevant?.extraction?.dropped?.latinContaminatedGloss === 8 &&
    [
      'kwis', '-nas', 'netta', 'nutta', '-ta', '-du-', 'tuk', 'ukel', 'ukus',
      'ehu', 'enessan', 'gimras', 'kinun', 'lalu', 'warss-', 'weheske/a-'
    ]
      .every((lemma) => !hittiteSturtevant.entries.some((entry) => entry.lemma === lemma))
)
check(
  'Sturtevant known high-confidence entries survive while uncertain and reconstructed rows do not',
  [
    ['ais', 'mouth'],
    ['annas', 'mother'],
    ['antuhsas', 'human being, man'],
    ['attas', 'father'],
    ['hassus', 'king']
  ].every(([lemma, def]) =>
    hittiteSturtevant?.entries.some((entry) => entry.lemma === lemma && entry.def === def)
  ) &&
    !hittiteSturtevant.entries.some((entry) =>
      (entry.lemma === 'aki' && entry.def === 'death') || entry.lemma === 'akkantes'
    )
)
check(
  'ASJP Hittite snapshot is the attributed 30-item basic-vocabulary list',
  hittiteAsjp?.count === 30 &&
    hittiteAsjp?.license === 'CC BY 4.0' &&
    hittiteAsjp?.compiler === 'Viveka Velupillai' &&
    hittiteAsjp?.iso === 'hit' &&
    hittiteAsjp?.glottocode === 'hitt1242' &&
    hittiteAsjp.entries.find((entry) => entry.id === 'asjp-hittite-86')?.lemma === 'kalmara'
)
check(
  'ASJP transcription is preserved and no reconstructed form is introduced',
  hittiteAsjp?.entries.find((entry) => entry.id === 'asjp-hittite-54')?.lemma === 'ekw~, akw~' &&
    hittiteAsjp.entries.every((entry) => !entry.lemma.startsWith('*'))
)

const hittiteWikidata = referenceData.get('hittite-wikidata')
const osaWikidata = referenceData.get('osa-wikidata')
const osaWikidataRegistry = REFERENCE_DICTIONARIES.find(
  (dictionary) => dictionary.id === 'osa-wikidata'
)
const validWikidataRevision = (entry) =>
  /^L\d+$/.test(entry.id) &&
  entry.source === `https://www.wikidata.org/wiki/${entry.id}` &&
  Number.isInteger(entry.revision) &&
  /^\d{4}-\d{2}-\d{2}T/.test(entry.timestamp) &&
  Array.isArray(entry.senses) &&
  entry.senses.length > 0
check(
  'Wikidata Lexeme snapshots are CC0 community data with exact revisions',
  [hittiteWikidata, osaWikidata].every((data) =>
    data?.license === 'CC0 1.0' &&
    data?.licenseUrl === 'https://creativecommons.org/publicdomain/zero/1.0/' &&
    data.entries.every(validWikidataRevision)
  )
)
check(
  'Wikidata snapshot sizes and language varieties remain explicit',
  hittiteWikidata?.count === 39 &&
    hittiteWikidata.entries.every((entry) => entry.languageId === 'Q35668' && entry.lang === 'hit') &&
    osaWikidata?.count === 8 &&
    new Set(osaWikidata.entries.map((entry) => entry.variety)).size === 4 &&
    osaWikidata.entries.some((entry) => entry.variety === 'Hadramautic') &&
    ![...hittiteWikidata.entries, ...osaWikidata.entries]
      .some((entry) => entry.lemma.trim().startsWith('*'))
)
check(
  'OSA Wikidata rows and browser metadata treat each lemma as native Musnad',
  osaWikidata?.entries.every((entry) =>
    [...entry.lemma].every((char) => char === ' ' || (
      char.codePointAt(0) >= 0x10a60 && char.codePointAt(0) <= 0x10a7f
    ))
  ) &&
    osaWikidataRegistry?.index === 'none' &&
    osaWikidataRegistry?.dir === 'rtl' &&
    osaWikidataRegistry?.fields.headClass === 'script-osa' &&
    osaWikidataRegistry?.fields.headDir === 'rtl'
)

// --- Cross-dictionary English gloss index ---------------------------------
// The artifact is generated at build time. Its compact integer references
// expand to {d,i,l,g,lang} postings without loading a full dictionary in the
// browser. Validate every reference against the source data here.

const expandedSourceIds = [
  'hittite-diacl',
  'hittite-asjp',
  'hittite-sturtevant',
  'hittite-wikidata',
  'osa-wikidata'
]
let legacyGlossIndex
try {
  legacyGlossIndex = JSON.parse(
    readFileSync(join(dictsDir, 'gloss-index.json'), 'utf8')
  )
} catch {
  legacyGlossIndex = null
}
check(
  'legacy gloss-index URL remains compatible with already-open installed bundles',
  legacyGlossIndex?.version === 2 &&
    expandedSourceIds.every((id) => !legacyGlossIndex.sources.includes(id))
)
const meaningSearchText = readFileSync(
  join(projectRoot, 'src', 'components', 'MeaningSearch.jsx'),
  'utf8'
)
const appText = readFileSync(join(projectRoot, 'src', 'App.jsx'), 'utf8')
const glossIndexLoaderText = readFileSync(
  join(projectRoot, 'src', 'lib', 'glossIndexLoader.js'),
  'utf8'
)
check(
  'meaning search uses the matching versioned index and guards unknown sources',
  glossIndexLoaderText.includes("export const GLOSS_INDEX_PATH = 'dicts/gloss-index-2026-07.json'") &&
    meaningSearchText.includes("import { loadGlossIndex } from '../lib/glossIndexLoader.js'") &&
    meaningSearchText.includes('loadGlossIndex()') &&
    meaningSearchText.includes('resolution.direct.filter((result) => getDictionary(result.d))') &&
    meaningSearchText.includes('resolution.groups[language].filter((result) => getDictionary(result.d))')
)
check(
  'comparative scope distinguishes curated and locally saved cards from verified matches',
  appText.includes("compareCards: 'Curated & saved'") &&
    !appText.includes('compareVerified')
)

let glossIndex
try {
  glossIndex = JSON.parse(
    readFileSync(join(dictsDir, 'gloss-index-2026-07.json'), 'utf8')
  )
  check('gloss index is present and valid JSON', true)
} catch {
  check('gloss index is present and valid JSON', false)
  glossIndex = null
}

if (glossIndex) {
  const keywordEntries = Object.entries(glossIndex.keywords || {})
  check('gloss index uses the sense-aware schema', glossIndex.version === 2)
  check('gloss index has records', Array.isArray(glossIndex.records) && glossIndex.records.length > 0)
  check('gloss index has English keyword postings', keywordEntries.length > 0)
  check('gloss index has Hebrew/transliteration headwords', Object.keys(glossIndex.heads || {}).length > 0)
  const retainedStopwordEntries = keywordEntries.filter(([word]) => GLOSS_STOP_WORDS.has(word))
  check(
    'only exact Strong’s fallback senses retain stop words as index keys',
    retainedStopwordEntries.length > 0 &&
      retainedStopwordEntries.every(([, encodedPostings]) => encodedPostings.every((encoded) => {
        const recordId = glossIndex.senses[Math.floor(encoded / 3)]?.[0]
        const record = glossIndex.records[recordId]
        return encoded % 3 === 2 && glossIndex.sources[record?.[0]] === 'strongs'
      })) &&
      ['a', 'an', 'the', 'of', 'to', 'in', 'on', 'at', 'by', 'for', 'from', 'with']
        .every((word) => !(word in glossIndex.keywords))
  )

  const sourceIds = new Set(['curated', ...REFERENCE_DICTIONARIES.map((dict) => dict.id)])
  const sourceEntryIds = new Map([
    ['curated', new Set(LEXICON.map((entry) => entry.id))],
    ...[...referenceData].map(([id, data]) => [id, new Set(data.entries.map((entry) => String(entry.id)))])
  ])
  const sourceEntriesById = new Map(
    [...referenceData].map(([id, data]) => [
      id,
      new Map(data.entries.map((entry) => [String(entry.id), entry]))
    ])
  )
  const hebrewCatalogSources = ['strongs', 'bdb']
  const hebrewCatalogKey = (sourceId, entryId) => `${sourceId}:${entryId}`
  const expectedHebrewEntries = new Map()
  for (const sourceId of hebrewCatalogSources) {
    for (const entry of referenceData.get(sourceId)?.entries || []) {
      const aramaic = sourceId === 'strongs'
        ? /\(Aramaic\)/i.test(entry.deriv || '')
        : String(entry.id).startsWith('x')
      if (!aramaic) expectedHebrewEntries.set(hebrewCatalogKey(sourceId, entry.id), entry)
    }
  }

  const hebrewRecordIds = glossIndex.hebrew?.recordIds
  const unindexedHebrew = glossIndex.hebrew?.unindexed
  const catalogKeys = []
  let hebrewCatalogResolves = Array.isArray(hebrewRecordIds) && Array.isArray(unindexedHebrew)
  if (hebrewCatalogResolves) {
    for (const recordId of hebrewRecordIds) {
      const record = glossIndex.records?.[recordId]
      const sourceId = glossIndex.sources?.[record?.[0]]
      const key = hebrewCatalogKey(sourceId, record?.[1])
      const sourceEntry = expectedHebrewEntries.get(key)
      if (
        !Number.isInteger(recordId) ||
        !sourceEntry ||
        glossIndex.languages?.[record?.[4]] !== 'Hebrew' ||
        record?.[2] !== sourceEntry.lemma
      ) hebrewCatalogResolves = false
      catalogKeys.push(key)
    }
    for (const row of unindexedHebrew) {
      const sourceId = glossIndex.sources?.[row?.[0]]
      const key = hebrewCatalogKey(sourceId, row?.[1])
      const sourceEntry = expectedHebrewEntries.get(key)
      const rawGloss = String(sourceEntry?.def || '').replace(/\s+/g, ' ').trim()
      const storedGloss = row?.[3]
      const rawGlossMatches = rawGloss.length <= 96
        ? storedGloss === rawGloss
        : typeof storedGloss === 'string' &&
          storedGloss.endsWith('\u2026') &&
          storedGloss.length <= 97 &&
          rawGloss.startsWith(storedGloss.slice(0, -1))
      if (
        !Array.isArray(row) ||
        (row.length !== 4 && row.length !== 5) ||
        !Number.isInteger(row[0]) ||
        !sourceEntry ||
        row[2] !== sourceEntry.lemma ||
        !rawGlossMatches ||
        (sourceEntry.xlit ? row[4] !== sourceEntry.xlit : row.length !== 4)
      ) hebrewCatalogResolves = false
      catalogKeys.push(key)
    }
  }
  const uniqueCatalogKeys = new Set(catalogKeys)
  const hebrewCatalogComplete =
    catalogKeys.length === expectedHebrewEntries.size &&
    uniqueCatalogKeys.size === expectedHebrewEntries.size &&
    [...expectedHebrewEntries.keys()].every((key) => uniqueCatalogKeys.has(key))
  const strongsRecordEntries = glossIndex.records
    .map((record, recordId) => [record, recordId])
    .filter(([record]) => glossIndex.sources[record[0]] === 'strongs')
  const strongsRecordById = new Map(
    strongsRecordEntries.map(([record, recordId]) => [String(record[1]), { record, recordId }])
  )
  const everyStrongsIdIndexed =
    strongsRecordEntries.length === strongs.entries.length &&
    strongsRecordById.size === strongs.entries.length &&
    strongs.entries.every((entry) => strongsRecordById.has(String(entry.id))) &&
    glossIndex.coverage?.strongs?.indexedEntries === strongs.entries.length

  let postingsValid = true
  let postingsResolve = true
  let postingCapsHold = true
  let hebrewExceedsPostingCap = false
  let duplicateFree = true
  let egyptianEnglishOnly = true
  const usedSources = new Set()

  for (const [keyword, encodedPostings] of keywordEntries) {
    if (!Array.isArray(encodedPostings) || encodedPostings.length === 0) {
      postingsValid = false
      continue
    }
    const seen = new Set()
    const languageCounts = new Map()
    for (const encoded of encodedPostings) {
      const senseId = Math.floor(encoded / 3)
      const posting = expandGlossSense(glossIndex, senseId)
      if (
        !Number.isInteger(encoded) ||
        !posting ||
        !sourceIds.has(posting.d) ||
        !posting.i ||
        !posting.l ||
        !posting.g ||
        !posting.lang
      ) {
        postingsValid = false
        continue
      }
      usedSources.add(posting.d)
      if (!sourceEntryIds.get(posting.d)?.has(String(posting.i))) postingsResolve = false
      const duplicateKey = `${posting.d}:${posting.i}:${posting.lang}`
      if (seen.has(duplicateKey)) duplicateFree = false
      seen.add(duplicateKey)
      languageCounts.set(posting.lang, (languageCounts.get(posting.lang) || 0) + 1)
      if (posting.d === 'egyptian' && !sourceEntriesById.get('egyptian')?.get(String(posting.i))?.de) {
        egyptianEnglishOnly = false
      }
    }
    for (const [language, count] of languageCounts) {
      if (language === 'Hebrew' && count > glossIndex.capPerLanguage) hebrewExceedsPostingCap = true
      if (language !== 'Comparative' && language !== 'Hebrew' && count > glossIndex.capPerLanguage) {
        postingCapsHold = false
      }
    }
  }
  const noHebrewTruncation = Object.values(glossIndex.truncated || {}).every(
    (counts) => !Object.prototype.hasOwnProperty.call(counts, 'Hebrew')
  )

  let headsValid = true
  for (const [head, recordIds] of Object.entries(glossIndex.heads || {})) {
    if (!head || !Array.isArray(recordIds) || recordIds.length === 0) headsValid = false
    if (recordIds.some((recordId) => !glossIndex.records[recordId])) headsValid = false
  }

  let recordTermsValid = true
  const keywordCount = keywordEntries.length
  let sensesValid = Array.isArray(glossIndex.senses) && glossIndex.senses.length > 0
  for (let recordId = 0; recordId < glossIndex.records.length; recordId++) {
    const record = glossIndex.records[recordId]
    const primarySense = glossIndex.senses?.[record?.[3]]
    if (!primarySense || primarySense[0] !== recordId || !primarySense[1]) sensesValid = false
    if (!Array.isArray(record?.[5]) || record[5].some((termId) => termId < 0 || termId >= keywordCount)) {
      recordTermsValid = false
      break
    }
  }
  if (glossIndex.senses?.some((sense) =>
    !Array.isArray(sense) || !glossIndex.records[sense[0]] || !sense[1]
  )) sensesValid = false

  const hebrewGuideTermsReachable = Array.isArray(hebrewRecordIds) && hebrewRecordIds.every(
    (recordId) => {
      const guideTerms = glossIndex.records?.[recordId]?.[5]
      return Array.isArray(guideTerms) && guideTerms.every((termId) => {
        const keyword = keywordEntries[termId]?.[0]
        return (glossIndex.keywords[keyword] || []).some((encoded) =>
          glossIndex.senses[Math.floor(encoded / 3)]?.[0] === recordId
        )
      })
    }
  )
  const hebrewCatalog = buildHebrewCatalog(glossIndex)
  const linkedHebrewRecordIds = new Set((hebrewRecordIds || []).filter(
    (recordId) => (glossIndex.records?.[recordId]?.[5] || []).length > 0
  ))
  const hebrewCatalogLinksHonest =
    hebrewCatalog.length === expectedHebrewEntries.size &&
    hebrewCatalog.some((entry) => entry.linked) &&
    hebrewCatalog.some((entry) => !entry.linked) &&
    hebrewCatalog.every((entry) =>
      entry.linked === (
        Number.isInteger(entry.recordId) && linkedHebrewRecordIds.has(entry.recordId)
      )
    )

  check('every gloss posting has a valid compact shape', postingsValid)
  check('every gloss posting resolves to its named source entry', postingsResolve)
  check('gloss postings are de-duplicated by source and entry', duplicateFree)
  check('gloss posting caps hold for capped languages', postingCapsHold)
  check(
    'Hebrew postings exceed the general cap without recorded truncation',
    hebrewExceedsPostingCap && noHebrewTruncation
  )
  check('every registered source contributes gloss postings', [...sourceIds].every((id) => usedSources.has(id)))
  check('Egyptian postings use explicit English glosses only', egyptianEnglishOnly)
  check('every gloss headword reference resolves to a record', headsValid)
  check('every gloss sense resolves to its source record', sensesValid)
  check('every record sense-key reference resolves to a keyword', recordTermsValid)
  check('Hebrew catalog rows resolve to raw Strong’s and BDB entries', hebrewCatalogResolves)
  check(
    'indexed and unindexed Hebrew catalog rows exactly cover raw Hebrew records',
    hebrewCatalogComplete
  )
  check(
    'every indexed Hebrew record is reachable through each guide term',
    hebrewGuideTermsReachable
  )
  check(
    'All Hebrew labels only records with guide terms as automatically linked',
    hebrewCatalogLinksHonest
  )
  check(
    'All Hebrew reuses its derived catalog across remounts',
    buildHebrewCatalog(glossIndex) === hebrewCatalog
  )
  check('every Strong’s ID resolves to one compact index record', everyStrongsIdIndexed)
  check(
    'generic preposition-only Strong’s records stay display-only',
    ['H1119', 'H3926'].every((id) => strongsRecordById.get(id)?.record[5].length === 0)
  )

  const languageCount = (result) =>
    Object.values(result.groups).filter((entries) => entries.length > 0).length
  for (const word of ['father', 'water', 'king']) {
    check(
      `meaning search '${word}' reaches at least 3 languages`,
      languageCount(searchGlossIndex(glossIndex, word)) >= 3
    )
  }
  const fatherAcrossSources = searchGlossIndex(glossIndex, 'father')
  const waterAcrossSources = searchGlossIndex(glossIndex, 'water')
  const kingAcrossSources = searchGlossIndex(glossIndex, 'king')
  const legAcrossSources = searchGlossIndex(glossIndex, 'leg')
  const hasStrongsResult = (query, id) =>
    searchGlossIndex(glossIndex, query).groups.Hebrew.some(
      (posting) => posting.d === 'strongs' && posting.i === id
    )
  check(
    'exact Strong’s fallbacks connect where, loan, and we',
    hasStrongsResult('where', 'H165') &&
      hasStrongsResult('loan', 'H4859') &&
      hasStrongsResult('we', 'H5168')
  )
  check(
    'plain KJV rendering guides connect H1 to chief, patrimony, and principal',
    ['chief', 'patrimony', 'principal'].every((query) => hasStrongsResult(query, 'H1'))
  )
  const h1RecordId = strongsRecordById.get('H1')?.recordId
  const h1Comparison = searchGlossIndex(glossIndex, '', { recordId: h1RecordId })
  check(
    'an exact Hebrew source record compares through its own English guides',
    h1Comparison.direct.some((posting) => posting.d === 'strongs' && posting.i === 'H1') &&
      h1Comparison.curatedIds.includes('father') &&
      ['father', 'chief', 'patrimony', 'principal'].every((word) =>
        h1Comparison.matchedKeywords.includes(word)
      ) &&
      h1Comparison.groups.Hittite.length > 0
  )
  check(
    'Strong’s KJV notation, citations, and Compare tails are not indexed',
    hasStrongsResult('perish', 'H6') &&
      !hasStrongsResult('surely', 'H6') &&
      !hasStrongsResult('utterly', 'H6') &&
      !hasStrongsResult('hosea', 'H165') &&
      !hasStrongsResult('names', 'H1')
  )
  check(
    'father reaches open Hittite and Sabaean Wiktionary records',
    fatherAcrossSources.groups.Hittite.some(
      (posting) => posting.d === 'hittite-wiktionary' && posting.i === 'wiktionary-hittite-hit-855325-noun-1'
    ) && fatherAcrossSources.groups['Old South Arabian'].some(
      (posting) => posting.i === 'wiktionary-osa-xsa-9460592-noun-1' && posting.v === 'Sabaean' && posting.lc === 'xsa'
    )
  )
  check(
    'water reaches both Hittite sources and the Sabaean water headword',
    waterAcrossSources.groups.Hittite.some(
      (posting) => posting.d === 'hittite-iecor' && posting.i === '80-188-1'
    ) && waterAcrossSources.groups.Hittite.some(
      (posting) => posting.d === 'hittite-wiktionary' && posting.i === 'wiktionary-hittite-hit-855375-noun-1'
    ) && waterAcrossSources.groups['Old South Arabian'].some(
      (posting) => posting.i === 'wiktionary-osa-xsa-3397501-noun-1' && posting.v === 'Sabaean'
    )
  )
  check(
    'new Hittite sources are connected to known meaning searches',
    fatherAcrossSources.groups.Hittite.some(
      (posting) => posting.d === 'hittite-sturtevant' && posting.l === 'attas'
    ) &&
      waterAcrossSources.groups.Hittite.some(
        (posting) => posting.d === 'hittite-diacl' && posting.i === '35500-45_watern-1'
      ) &&
      waterAcrossSources.groups.Hittite.some(
        (posting) => posting.d === 'hittite-asjp' && posting.i === 'asjp-hittite-75'
      ) &&
      kingAcrossSources.groups.Hittite.some(
        (posting) => posting.d === 'hittite-wikidata'
      ) &&
      kingAcrossSources.groups.Hittite.some(
        (posting) => posting.d === 'hittite-sturtevant' && posting.l === 'hassus'
      )
  )
  check(
    'audited Sturtevant Latin gloss markers never become English meaning matches',
    ['agedum', 'ita', 'rus', 'demum', 'erectus', 'mulcere', 'versari'].every((query) =>
      !searchGlossIndex(glossIndex, query).groups.Hittite.some(
        (posting) => posting.d === 'hittite-sturtevant'
      )
    )
  )
  const kingVarieties = new Set(
    kingAcrossSources.groups['Old South Arabian']
      .filter((posting) => posting.l === 'mlk')
      .map((posting) => posting.v)
  )
  check(
    'king reaches Hittite plus separately labeled Sabaean, Minaean, and Qatabanian rows',
    kingAcrossSources.groups.Hittite.some(
      (posting) => posting.i === 'wiktionary-hittite-hit-6557087-noun-1'
    ) && ['Sabaean', 'Minaean', 'Qatabanian'].every((variety) => kingVarieties.has(variety))
  )
  check(
    'IE-CoR leg uses its English concept and excludes the German contributor wording',
    legAcrossSources.groups.Hittite.some(
      (posting) => posting.d === 'hittite-iecor' && posting.i === '80-93-1'
    ) && !searchGlossIndex(glossIndex, 'beines').groups.Hittite.some(
      (posting) => posting.d === 'hittite-iecor'
    )
  )
  check(
    'Wiktionary meta records remain browseable but are excluded from automatic meaning matches',
    glossIndex.coverage?.['hittite-wiktionary']?.skippedMeta > 0 &&
      glossIndex.coverage?.['osa-wiktionary']?.skippedMeta > 0 &&
      ['letter', 'abjad'].every((query) =>
        searchGlossIndex(glossIndex, query).groups['Old South Arabian'].every((posting) =>
          !/^(?:letter|symbol)$/i.test(
            sourceEntriesById.get(posting.d)?.get(String(posting.i))?.pos || ''
          )
        )
      )
  )
  const morphologyOnlyOsaId = 'wiktionary-osa-xsa-11771511-verb-1'
  check(
    'bare Wiktionary morphology cross-reference is excluded from third meaning matches',
    osaWiktionary?.entries.some((entry) =>
      entry.id === morphologyOnlyOsaId && /^Third-person\b.*\bform of\b/i.test(entry.def)
    ) && !searchGlossIndex(glossIndex, 'third').groups['Old South Arabian'].some(
      (posting) => posting.i === morphologyOnlyOsaId
    )
  )
  check(
    'lexical senses after Wiktionary colon and semicolon morphology labels remain indexed',
    searchGlossIndex(glossIndex, 'pair').groups['Old South Arabian'].some(
      (posting) => posting.i === 'wiktionary-osa-xsa-11736929-pronoun-1'
    ) && searchGlossIndex(glossIndex, 'captives').groups['Old South Arabian'].some(
      (posting) => posting.i === 'wiktionary-osa-xsa-8142283-noun-1'
    )
  )
  check(
    'every curated primary English gloss returns its own verified card',
    LEXICON.every((entry) =>
      searchGlossIndex(glossIndex, entry.english[0]).curatedIds.includes(entry.id)
    )
  )
  const fatherHebrew = searchGlossIndex(glossIndex, 'אב')
  const waterHebrew = searchGlossIndex(glossIndex, 'מים')
  const fatherEnglish = searchGlossIndex(glossIndex, 'father')
  check('Hebrew אב pivots to father across at least 3 languages', fatherHebrew.curatedIds[0] === 'father' && languageCount(fatherHebrew) >= 3)
  check('Hebrew מים pivots to water across at least 3 languages', waterHebrew.curatedIds.includes('water') && languageCount(waterHebrew) >= 3)
  check(
    'real father head senses rank above incidental BDB prose',
    fatherEnglish.groups.Hebrew[0]?.i === 'H1' &&
      !fatherEnglish.groups.Hebrew.slice(0, 3).some((posting) => posting.i === 'd.ao.ac')
  )
  const firstUnmatchedFatherHead = fatherHebrew.direct.findIndex((posting) => !posting.matchedKeyword)
  check(
    'sense-aligned direct headword hits rank before unrelated homographs',
    firstUnmatchedFatherHead < 0 ||
      fatherHebrew.direct.slice(firstUnmatchedFatherHead).every((posting) => !posting.matchedKeyword)
  )
  check(
    'curated roots are not indexed as extra headword aliases',
    LEXICON.every((entry) => {
      const root = normalize(entry.hebrew.root)
      const aramaic = entry.forms?.aramaic
      const actualHeads = [
        entry.hebrew.word,
        entry.hebrew.translit,
        aramaic?.hebrewLetters,
        aramaic?.translit
      ].filter(Boolean)
      if (actualHeads.some((head) => normalize(head) === root)) return true
      return !(glossIndex.heads[root] || []).some((recordId) => {
        const posting = expandGlossRecord(glossIndex, recordId)
        return posting?.d === 'curated' && posting.i === entry.id
      })
    })
  )
  check(
    'Jastrow superscript sense markers are stripped from head aliases',
    (glossIndex.heads[normalize('אֵגֶד')] || []).some((recordId) =>
      expandGlossRecord(glossIndex, recordId)?.i === 'A00245'
    )
  )
  check(
    'late Sumerian senses keep their matched display gloss',
    searchGlossIndex(glossIndex, 'stand').groups.Sumerian.some(
      (posting) => posting.i === 'o0025986' && /stand/i.test(posting.g)
    )
  )
  check(
    'lowercase semantic parentheticals remain indexed',
    searchGlossIndex(glossIndex, 'cosmic').groups.Akkadian.some(
      (posting) => posting.i === 'akk-00145' && /cosmic/i.test(posting.g)
    )
  )
  check(
    'a truncated display gloss still exposes its matched keyword',
    Object.values(searchGlossIndex(glossIndex, 'abacus').groups)
      .flat()
      .some((posting) => posting.matchedKeyword === 'abacus')
  )
  const melek = searchGlossIndex(glossIndex, 'melek')
  check('melek pivots to king without the incidental number two', melek.curatedIds[0] === 'king' && !melek.curatedIds.includes('two'))
  check('English name returns the verified name card', searchGlossIndex(glossIndex, 'name').curatedIds[0] === 'name')
  check('Hebrew שם pivots through the verified name card', searchGlossIndex(glossIndex, 'שם').curatedIds[0] === 'name')
  check('English man does not inherit the vessel transliteration alias', !searchGlossIndex(glossIndex, 'man').curatedIds.includes('vessel'))
  check('English beer does not inherit the well transliteration alias', !searchGlossIndex(glossIndex, 'beer').curatedIds.includes('well'))
  const figEntry = LEXICON.find((entry) => entry.id === 'fig')
  check('English and Hebrew fig both return the verified fig card',
    searchGlossIndex(glossIndex, 'fig').curatedIds[0] === 'fig' &&
      searchGlossIndex(glossIndex, figEntry.hebrew.word).curatedIds.includes('fig'))
  check('plain transliteration ab pivots through Hebrew father', searchGlossIndex(glossIndex, 'ab').curatedIds[0] === 'father')
  check('a nonsense meaning returns nothing', searchGlossIndex(glossIndex, 'nonsensezzq').total === 0)
}

const categoryIds = CATEGORIES.map((c) => c.id)
check(
  'category ids are unique',
  new Set(categoryIds).size === categoryIds.length
)
check(
  'every lexicon entry carries a valid category id',
  LEXICON.every((e) => categoryIds.includes(e.category))
)
const primaryGlosses = LEXICON.map((e) => e.english[0].toLowerCase())
check(
  'no duplicate primary gloss across entries',
  new Set(primaryGlosses).size === primaryGlosses.length
)

// --- Search normalization ----------------------------------------------------

check(
  'pointed and unpointed Hebrew normalize identically',
  normalize('שָׁלוֹם') === normalize('שלום')
)
check("normalize('šalāmu') is 'salamu'", normalize('šalāmu') === 'salamu')
check(
  'transliteration marks are stripped',
  normalize('ʾab') === 'ab' && normalize('ʿayin') === 'ayin' && normalize('ʼâb') === 'ab'
)
check('Egyptological ꜣ folds for plain-keyboard search', normalize('ꜣb') === 'ab')
check(
  'South Arabian sibilant index digits fold for plain-keyboard search',
  normalize('s¹m s² s₃') === normalize('s1m s2 s3')
)
check(
  'final letters fold in search too',
  normalize('מלך') === normalize('מלכ')
)

const shalomResults = searchEntries(LEXICON, 'shalom')
check(
  "searching 'shalom' finds peace first",
  shalomResults[0]?.id === 'peace'
)
const glyphResults = searchEntries(LEXICON, cp(0x12217))
check('pasting the LUGAL glyph finds king', glyphResults[0]?.id === 'king')
// Aramaic and Musnad glyphs are derived at render time; pasting the glyphs
// the app displays must still find the entry.
const aramaicPaste = searchEntries(LEXICON, toImperialAramaic('מלכא'))
check(
  'pasting the displayed Imperial Aramaic glyphs finds king',
  aramaicPaste[0]?.id === 'king'
)
const musnadPaste = searchEntries(LEXICON, toMusnad(['m', 'l', 'k']))
check(
  'pasting the displayed Musnad glyphs finds king',
  musnadPaste[0]?.id === 'king'
)
const sulmuResults = searchEntries(LEXICON, 'sulmu')
check(
  "searching 'sulmu' (šulmu without diacritics) finds peace",
  sulmuResults.some((e) => e.id === 'peace')
)
const salamuRoots = searchRoots(ROOTS, 'salamu')
check(
  "root search for 'salamu' (šalāmu without diacritics) finds שלמ",
  salamuRoots.some((r) => rootKey(r.letters) === 'שלמ')
)
check(
  'empty query lists all entries',
  searchEntries(LEXICON, '').length === LEXICON.length
)

// -----------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log(`\nall checks passed (roots: ${ROOTS.length}, entries: ${LEXICON.length})`)
