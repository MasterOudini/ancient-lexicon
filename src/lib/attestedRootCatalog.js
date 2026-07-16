import { ROOTS, rootKey } from '../data/roots.js'
import { fetchReleaseAsset } from './releaseAssets.js'

export const ATTESTED_ROOT_CATALOG_FILE = 'attested-roots-2026-07-v2.json'
export const ATTESTED_ROOT_CATALOG_FORMAT = 'ancient-lexicon-attested-roots-v2'
export const ATTESTED_ROOT_CATALOG_MARKER = 'attested-root-payload-only-2026-07-v2'
export const JASTROW_ROOT_SOURCE_REVISION = '2d20f977d628c455f66175e6d0a2dfb528c6d7ba'

let catalogPromise = null
let cacheGeneration = 0

function indexRoots(roots) {
  const byUnionKey = new Map()
  const languagePriority = {
    hebrew: 3,
    'biblical-aramaic': 2,
    'hebrew-aramaic-unclassified': 1
  }
  for (const root of roots) {
    const key = rootKey(root.letters)
    const current = byUnionKey.get(key)
    if (!current || (languagePriority[root.lang] || 0) > (languagePriority[current.lang] || 0)) {
      byUnionKey.set(key, root)
    }
  }
  return {
    roots,
    byKey: new Map(roots.map((root) => [`${root.lang}:${rootKey(root.letters)}`, root])),
    byId: new Map(roots.map((root) => [root.id, root])),
    byUnionKey
  }
}

export function mergeAttestedRootCatalog(payload, curatedRoots = ROOTS) {
  const ordered = curatedRoots.map((root) => ({ ...root, catalogKind: 'curated' }))
  const positionByKey = new Map(
    ordered.map((root, index) => [`${root.lang}:${rootKey(root.letters)}`, index])
  )

  for (const referenceRoot of payload?.roots || []) {
    const key = `${referenceRoot.lang}:${rootKey(referenceRoot.letters)}`
    const position = positionByKey.get(key)
    if (position !== undefined) {
      ordered[position] = {
        ...ordered[position],
        sourceLanguages: referenceRoot.sourceLanguages,
        sources: referenceRoot.sources,
        catalogCoverage: 'curated and published lexicons'
      }
      continue
    }

    positionByKey.set(key, ordered.length)
    ordered.push({
      ...referenceRoot,
      catalogKind: 'source-derived',
      catalogCoverage: 'published lexicons'
    })
  }

  return {
    ...indexRoots(ordered),
    format: payload?.format || 'curated-only',
    sourcePolicy: payload?.sourcePolicy || '',
    curatedCount: curatedRoots.length,
    sourceCount: payload?.count || 0
  }
}

export const CURATED_ROOT_CATALOG = mergeAttestedRootCatalog(null)

export function findAttestedRoot(catalog, lang, letters) {
  const key = rootKey(letters)
  return catalog?.byKey.get(`${lang}:${key}`) || catalog?.byUnionKey.get(key) || null
}

export function findAttestedRootExact(catalog, lang, letters) {
  return catalog?.byKey.get(`${lang}:${rootKey(letters)}`) || null
}

export function findAttestedRootById(catalog, id) {
  return catalog?.byId.get(id) || null
}

export function clearAttestedRootCatalogCache() {
  cacheGeneration++
  catalogPromise = null
}

if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    clearAttestedRootCatalogCache
  )
}

function validatePayload(payload) {
  const roots = payload?.roots
  const ids = new Set()
  const keys = new Set()
  const bdb = payload?.sources?.find((source) => source.id === 'bdb')
  const jastrow = payload?.sources?.find((source) => source.id === 'jastrow')
  const structurallyValid =
    payload?.format === ATTESTED_ROOT_CATALOG_FORMAT &&
    payload?.payloadMarker === ATTESTED_ROOT_CATALOG_MARKER &&
    payload.count === roots?.length &&
    payload.count > 1000 &&
    bdb?.sourceRevision === 'b69f909233040133c03654945d7ed1a510d5ea37' &&
    jastrow?.sourceRevision === JASTROW_ROOT_SOURCE_REVISION &&
    roots.every((root) => {
      const key = `${root.lang}:${rootKey(root.letters)}`
      const valid =
        !ids.has(root.id) &&
        !keys.has(key) &&
        ['hebrew', 'biblical-aramaic', 'hebrew-aramaic-unclassified'].includes(root.lang) &&
        Array.isArray(root.letters) &&
        root.letters.length >= 2 &&
        root.letters.length <= 5 &&
        root.letters.every((letter) => /^[אבגדהוזחטיכלמנסעפצקרשת]$/u.test(letter)) &&
        Array.isArray(root.attested) &&
        root.attested.length > 0 &&
        root.attested.every((attestation) => /[\u05d0-\u05ea]/u.test(attestation.word)) &&
        Array.isArray(root.sources) &&
        root.sources.length > 0 &&
        root.sources.every(
          (source) =>
            source.sourceLanguage === root.lang &&
            /[\u05d0-\u05ea]/u.test(source.headword)
        )
      ids.add(root.id)
      keys.add(key)
      return valid
    })

  if (!structurallyValid) {
    throw new Error('The attested-root catalog is missing or incomplete.')
  }
  return payload
}

export function loadAttestedRootCatalog({ fetchImpl = fetch, baseUrl } = {}) {
  if (catalogPromise) return catalogPromise
  const generation = cacheGeneration
  catalogPromise = fetchReleaseAsset(`dicts/${ATTESTED_ROOT_CATALOG_FILE}`, {
    fetchImpl,
    baseUrl,
    options: {
      cache: 'no-cache',
      headers: { accept: 'application/json' }
    }
  })
    .then((response) => {
      if (!response.ok) throw new Error(`Root catalog request failed (${response.status}).`)
      return response.json()
    })
    .then(validatePayload)
    .then((payload) => {
      if (generation !== cacheGeneration) return loadAttestedRootCatalog({ fetchImpl, baseUrl })
      return mergeAttestedRootCatalog(payload)
    })
    .catch((error) => {
      if (generation === cacheGeneration) catalogPromise = null
      throw error
    })

  return catalogPromise
}
