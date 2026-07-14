import { getDictionary } from '../data/referenceDictionaries.js'
import { normalize } from './search.js'

export const HEBREW_CATALOG_PATH = 'dicts/hebrew-catalog-2026-07-v1.json'
export const HEBREW_SHARD_DIRECTORY = 'dicts/hebrew-comparisons-2026-07-v1'
export const HEBREW_COMPARISON_LANGUAGES = [
  'akkadian',
  'sumerian',
  'egyptian',
  'hittite',
  'aramaic',
  'osa'
]

const hebrewCollator = new Intl.Collator('he')

let cacheGeneration = 0
let catalogPending = null
let catalogCache = null
const shardPending = new Map()
const shardCache = new Map()

function clearHebrewComparisonCaches() {
  cacheGeneration++
  catalogPending = null
  catalogCache = null
  shardPending.clear()
  shardCache.clear()
}

if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('controllerchange', clearHebrewComparisonCaches)
}

function sourceLabel(source) {
  return getDictionary(source)?.label || source
}

function decodeSense(tuple) {
  return {
    key: tuple[0],
    label: tuple[1],
    sourceText: tuple[2],
    matchable: tuple[3] !== false,
    terms: tuple[4] || []
  }
}

export function decodeHebrewCatalog(payload) {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.entries)) {
    throw new Error('Unsupported Hebrew catalog')
  }
  const sources = payload.sources || []
  const entries = payload.entries.map((tuple) => {
    const source = sources[tuple[0]]
    const senses = (tuple[7] || []).map(decodeSense)
    const sourceKey = `${source}:${tuple[1]}`
    const searchText = tuple[8] || normalize([
      tuple[1],
      tuple[2],
      tuple[3],
      tuple[4],
      tuple[5],
      source,
      sourceLabel(source),
      ...senses.flatMap((sense) => [sense.label, sense.sourceText, ...sense.terms])
    ].filter(Boolean).join(' '))
    return {
      sourceKey,
      source,
      sourceLabel: sourceLabel(source),
      id: tuple[1],
      headword: tuple[2],
      transliteration: tuple[3],
      definition: tuple[4],
      partOfSpeech: tuple[5],
      shard: tuple[6],
      senses,
      searchText,
      sortKey: normalize(tuple[2])
    }
  }).sort((a, b) =>
    hebrewCollator.compare(a.sortKey, b.sortKey) ||
    a.source.localeCompare(b.source) ||
    String(a.id).localeCompare(String(b.id))
  )
  return {
    version: payload.version,
    revision: payload.revision,
    shardCount: payload.shardCount,
    languages: payload.languages || HEBREW_COMPARISON_LANGUAGES,
    entries
  }
}

export function searchHebrewCatalog(catalog, query) {
  const normalizedQuery = normalize(query)
  const entries = catalog?.entries || []
  return normalizedQuery
    ? entries.filter((entry) => entry.searchText.includes(normalizedQuery))
    : entries
}

function decodeCandidate(tuple) {
  if (!tuple) return null
  return {
    dictionaryId: tuple[0],
    entryId: tuple[1],
    word: tuple[2],
    script: tuple[3],
    transliteration: tuple[4],
    meaning: tuple[5],
    bridge: tuple[6],
    evidence: tuple[7]
  }
}

function comparisonStatus(code) {
  if (code === 2) return 'verified'
  if (code === 1) return 'automatic'
  return 'none'
}

function decodeSlot(tuple, candidates, languageId) {
  const status = comparisonStatus(tuple?.[0])
  return {
    languageId,
    status,
    primary: status === 'none' ? null : decodeCandidate(candidates[tuple[1]]),
    alternatives: status === 'none'
      ? []
      : (tuple[2] || []).slice(0, 4).map((index) => decodeCandidate(candidates[index])).filter(Boolean)
  }
}

export function resolveHebrewComparison(entry, shard) {
  const records = shard?.records?.[entry.sourceKey]
  if (!records) throw new Error(`Missing comparison record for ${entry.sourceKey}`)
  const languages = shard.languages || HEBREW_COMPARISON_LANGUAGES
  return entry.senses.map((sense, senseIndex) => ({
    ...sense,
    slots: languages.map((languageId, languageIndex) =>
      decodeSlot(records[senseIndex]?.[languageIndex], shard.candidates || [], languageId)
    )
  }))
}

async function fetchJson(path) {
  const base = import.meta.env?.BASE_URL || '/'
  const response = await fetch(base + path, { cache: 'no-cache' })
  if (!response.ok) throw new Error('fetch failed: ' + response.status)
  return response.json()
}

export function loadHebrewCatalog() {
  if (catalogCache) return Promise.resolve(catalogCache)
  if (!catalogPending) {
    const generation = cacheGeneration
    let pending
    pending = fetchJson(HEBREW_CATALOG_PATH)
      .then((payload) => {
        if (generation !== cacheGeneration) return loadHebrewCatalog()
        catalogCache = decodeHebrewCatalog(payload)
        return catalogCache
      })
      .catch((error) => {
        if (catalogPending === pending) catalogPending = null
        throw error
      })
    catalogPending = pending
  }
  return catalogPending
}

export function loadHebrewComparisonShard(shardId) {
  if (shardCache.has(shardId)) return Promise.resolve(shardCache.get(shardId))
  if (!shardPending.has(shardId)) {
    const generation = cacheGeneration
    let pending
    pending = fetchJson(`${HEBREW_SHARD_DIRECTORY}/${shardId}.json`)
      .then((payload) => {
        if (generation !== cacheGeneration) return loadHebrewComparisonShard(shardId)
        shardCache.set(shardId, payload)
        return payload
      })
      .finally(() => {
        if (shardPending.get(shardId) === pending) shardPending.delete(shardId)
      })
    shardPending.set(shardId, pending)
  }
  return shardPending.get(shardId)
}

export async function loadHebrewComparison(entry) {
  const shard = await loadHebrewComparisonShard(entry.shard)
  return resolveHebrewComparison(entry, shard)
}
