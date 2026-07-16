import { getDictionary } from '../data/referenceDictionaries.js'
import { normalize } from './search.js'
import { fetchReleaseAsset } from './releaseAssets.js'

export const HEBREW_CATALOG_PATH = 'dicts/hebrew-catalog-2026-07-v2.json'
export const HEBREW_SHARD_DIRECTORY = 'dicts/hebrew-comparisons-2026-07-v2'
export const HEBREW_JASTROW_CATALOG_PATH = 'dicts/hebrew-jastrow-catalog-2026-07-v1.json'
export const HEBREW_JASTROW_SHARD_DIRECTORY = 'dicts/hebrew-jastrow-comparisons-2026-07-v1'
export const HEBREW_COMPARISON_LANGUAGES = [
  'akkadian',
  'sumerian',
  'egyptian',
  'hittite',
  'aramaic',
  'osa'
]

const hebrewCollator = new Intl.Collator('he')

// Exact source IDs and exact headwords must outrank words that merely contain
// the query. Higher values sort first; only exact headword and source-ID tiers
// automatically open a comparison card.
export const HEBREW_CATALOG_MATCH_TIER = Object.freeze({
  none: 0,
  metadata: 1,
  headwordSubstring: 2,
  prefix: 3,
  transliterationExactDisplayOnly: 4,
  transliterationExact: 5,
  normalizedHeadwordDisplayOnly: 6,
  normalizedHeadword: 7,
  pointedHeadwordDisplayOnly: 8,
  pointedHeadword: 9,
  sourceId: 10
})

const AUTO_OPEN_MINIMUM_TIER = HEBREW_CATALOG_MATCH_TIER.normalizedHeadwordDisplayOnly
const HEBREW_POINTING = /[\u05B0-\u05BD\u05BF-\u05C2\u05C4-\u05C7]/u
const CANTILLATION_AND_EDITORIAL_MARKS = /[\u0591-\u05AF\u05BD\u05BF\u05C4-\u05C6]/gu

// These source records have explicit reviewed overrides in the comparison
// builder. H1 additionally owns the authoritative curated father card.
const REVIEWED_SOURCE_PRIORITY = new Map([
  ['strongs:H1', 3],
  ['strongs:H2803', 2],
  ['strongs:H2805', 1]
])
const REVIEWED_TRANSLITERATION_AUTO_OPEN = new Set(['jastrow:B00486'])

function reviewedPriority(entry, tier) {
  return tier >= HEBREW_CATALOG_MATCH_TIER.normalizedHeadwordDisplayOnly &&
    tier <= HEBREW_CATALOG_MATCH_TIER.pointedHeadword
    ? REVIEWED_SOURCE_PRIORITY.get(entry.sourceKey) || 0
    : 0
}

function canonicalPointedHeadword(value) {
  return String(value || '')
    .trim()
    .normalize('NFD')
    .replace(CANTILLATION_AND_EDITORIAL_MARKS, '')
    .normalize('NFC')
}

function createQueryContext(query) {
  const raw = String(query || '')
  return {
    normalized: normalize(raw),
    hasPointing: HEBREW_POINTING.test(raw),
    pointed: canonicalPointedHeadword(raw)
  }
}

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

function decodeRootReferenceKey(tuple, sources) {
  if (!Array.isArray(tuple) || tuple.length < 2) return null
  const source = sources[tuple[0]]
  if (!source || !tuple[1]) return null
  return {
    sourceKey: `${source}:${tuple[1]}`,
    letters: tuple[2] || null,
    language: tuple[3] || 'hebrew'
  }
}

function decodeRootReferenceKeys(value, sources) {
  if (!Array.isArray(value)) return []
  const tuples = Array.isArray(value[0]) ? value : [value]
  return tuples.map((tuple) => decodeRootReferenceKey(tuple, sources)).filter(Boolean)
}

function decodeRootReference(referenceKey, entriesBySourceKey) {
  if (!referenceKey?.letters) return null
  const entry = entriesBySourceKey.get(referenceKey.sourceKey)
  if (!entry) return null
  return {
    source: entry.source,
    sourceLabel: entry.sourceLabel,
    id: entry.id,
    sourceKey: entry.sourceKey,
    letters: referenceKey.letters,
    language: referenceKey.language || 'hebrew',
    headword: entry.headword,
    definition: entry.definition
  }
}

function compareCatalogEntries(left, right) {
  return hebrewCollator.compare(left.sortKey, right.sortKey) ||
    left.source.localeCompare(right.source) ||
    String(left.id).localeCompare(String(right.id))
}

export function decodeHebrewCatalog(
  payload,
  {
    shardDirectory = payload?.shardDirectory || HEBREW_SHARD_DIRECTORY,
    expectedVersion = null
  } = {}
) {
  if (
    !payload ||
    ![1, 2].includes(payload.version) ||
    (expectedVersion !== null && payload.version !== expectedVersion) ||
    !Array.isArray(payload.entries)
  ) {
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
      aliases: tuple[10] || [],
      languageCode: tuple[11] || null,
      languageLabel: payload.originLabels?.[tuple[11]] || null,
      shard: tuple[6],
      shardDirectory,
      senses,
      rootReferenceKeys: decodeRootReferenceKeys(tuple[9], sources),
      searchText,
      sortKey: normalize(tuple[2]),
      pointedKey: canonicalPointedHeadword(tuple[2]),
      idSearch: normalize(tuple[1]),
      sourceKeySearch: normalize(sourceKey),
      transliterationSearch: normalize(tuple[3]),
      aliasSearches: (tuple[10] || []).map(normalize).filter(Boolean),
      hasMatchableSense: senses.some((sense) => sense.matchable)
    }
  }).sort(compareCatalogEntries)
  const entriesBySourceKey = new Map(entries.map((entry) => [entry.sourceKey, entry]))
  for (const entry of entries) {
    entry.rootReferences = entry.rootReferenceKeys
      .map((reference) => decodeRootReference(reference, entriesBySourceKey))
      .filter(Boolean)
    entry.rootReference = entry.rootReferences[0] || null
    delete entry.rootReferenceKeys
  }
  return {
    version: payload.version,
    revision: payload.revision,
    shardCount: payload.shardCount,
    shardDirectory,
    languages: payload.languages || HEBREW_COMPARISON_LANGUAGES,
    entries
  }
}

export function mergeHebrewCatalogs(...catalogs) {
  const available = catalogs.flat().filter(Boolean)
  if (available.length === 0) throw new Error('No Hebrew catalogs to merge')

  const version = available[0].version
  const languages = available[0].languages || HEBREW_COMPARISON_LANGUAGES
  const entries = []
  const sourceKeys = new Set()
  for (const catalog of available) {
    if (JSON.stringify(catalog.languages || HEBREW_COMPARISON_LANGUAGES) !== JSON.stringify(languages)) {
      throw new Error('Hebrew catalog languages do not match')
    }
    for (const entry of catalog.entries || []) {
      if (sourceKeys.has(entry.sourceKey)) {
        throw new Error(`Duplicate Hebrew catalog entry ${entry.sourceKey}`)
      }
      sourceKeys.add(entry.sourceKey)
      entries.push(entry)
    }
  }

  return {
    version,
    versions: available.map((catalog) => catalog.version),
    revision: available.map((catalog) => catalog.revision).filter(Boolean).join('+'),
    revisions: available.map((catalog) => catalog.revision).filter(Boolean),
    shardCount: available.reduce((count, catalog) => count + (catalog.shardCount || 0), 0),
    languages,
    entries: entries.sort(compareCatalogEntries)
  }
}

function matchTier(entry, queryContext, searchTextMatched) {
  const normalizedQuery = queryContext.normalized
  if (!normalizedQuery || !entry) return HEBREW_CATALOG_MATCH_TIER.none

  if (
    entry.idSearch === normalizedQuery ||
    entry.sourceKeySearch === normalizedQuery
  ) {
    return HEBREW_CATALOG_MATCH_TIER.sourceId
  }

  if (
    queryContext.hasPointing &&
    entry.pointedKey === queryContext.pointed
  ) {
    return entry.hasMatchableSense
      ? HEBREW_CATALOG_MATCH_TIER.pointedHeadword
      : HEBREW_CATALOG_MATCH_TIER.pointedHeadwordDisplayOnly
  }

  if (entry.sortKey === normalizedQuery) {
    return entry.hasMatchableSense
      ? HEBREW_CATALOG_MATCH_TIER.normalizedHeadword
      : HEBREW_CATALOG_MATCH_TIER.normalizedHeadwordDisplayOnly
  }

  if (
    entry.transliterationSearch === normalizedQuery ||
    entry.aliasSearches.includes(normalizedQuery)
  ) {
    return entry.hasMatchableSense
      ? HEBREW_CATALOG_MATCH_TIER.transliterationExact
      : HEBREW_CATALOG_MATCH_TIER.transliterationExactDisplayOnly
  }

  if (
    entry.sortKey.startsWith(normalizedQuery) ||
    entry.idSearch.startsWith(normalizedQuery) ||
    entry.transliterationSearch.startsWith(normalizedQuery) ||
    entry.aliasSearches.some((alias) => alias.startsWith(normalizedQuery))
  ) {
    return HEBREW_CATALOG_MATCH_TIER.prefix
  }

  if (
    entry.sortKey.includes(normalizedQuery) ||
    entry.transliterationSearch.includes(normalizedQuery) ||
    entry.aliasSearches.some((alias) => alias.includes(normalizedQuery))
  ) {
    return HEBREW_CATALOG_MATCH_TIER.headwordSubstring
  }

  return (searchTextMatched ?? entry.searchText.includes(normalizedQuery))
    ? HEBREW_CATALOG_MATCH_TIER.metadata
    : HEBREW_CATALOG_MATCH_TIER.none
}

export function getHebrewCatalogMatchTier(entry, query) {
  return matchTier(entry, createQueryContext(query))
}

export function searchHebrewCatalog(catalog, query) {
  const queryContext = createQueryContext(query)
  const entries = catalog?.entries || []
  if (!queryContext.normalized) return entries

  // Fixed tiers let us retain the catalog's deterministic order without an
  // O(matches log matches) sort for very broad phone-keyboard queries.
  const buckets = Array.from(
    { length: HEBREW_CATALOG_MATCH_TIER.sourceId + 1 },
    () => []
  )
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index]
    const searchTextMatched = entry.searchText.includes(queryContext.normalized)
    if (!searchTextMatched && entry.sourceKeySearch !== queryContext.normalized) continue
    const tier = matchTier(entry, queryContext, searchTextMatched)
    if (tier > HEBREW_CATALOG_MATCH_TIER.none) buckets[tier].push(entry)
  }

  const results = []
  for (let tier = buckets.length - 1; tier > HEBREW_CATALOG_MATCH_TIER.none; tier--) {
    const bucket = buckets[tier]
    if (bucket.length === 0) continue

    const reviewed = bucket
      .filter((entry) => reviewedPriority(entry, tier) > 0)
      .sort((left, right) => reviewedPriority(right, tier) - reviewedPriority(left, tier))
    if (reviewed.length === 0) results.push(...bucket)
    else {
      const reviewedKeys = new Set(reviewed.map((entry) => entry.sourceKey))
      results.push(...reviewed, ...bucket.filter((entry) => !reviewedKeys.has(entry.sourceKey)))
    }
  }
  return results
}

export function selectAutoOpenSourceKey(results, query) {
  const first = results?.[0]
  if (!first) return null
  const tier = matchTier(first, createQueryContext(query))
  return tier >= AUTO_OPEN_MINIMUM_TIER ||
    (tier >= HEBREW_CATALOG_MATCH_TIER.transliterationExact &&
      REVIEWED_TRANSLITERATION_AUTO_OPEN.has(first.sourceKey))
    ? first.sourceKey
    : null
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
  const response = await fetchReleaseAsset(path, {
    options: { cache: 'no-cache' }
  })
  if (!response.ok) throw new Error('fetch failed: ' + response.status)
  return response.json()
}

export function loadHebrewCatalog() {
  if (catalogCache) return Promise.resolve(catalogCache)
  if (!catalogPending) {
    const generation = cacheGeneration
    let pending
    pending = Promise.all([
      fetchJson(HEBREW_CATALOG_PATH),
      fetchJson(HEBREW_JASTROW_CATALOG_PATH)
    ])
      .then(([payload, jastrowPayload]) => {
        if (generation !== cacheGeneration) return loadHebrewCatalog()
        catalogCache = mergeHebrewCatalogs(
          decodeHebrewCatalog(payload, { expectedVersion: 2 }),
          decodeHebrewCatalog(jastrowPayload, {
            shardDirectory: jastrowPayload.shardDirectory || HEBREW_JASTROW_SHARD_DIRECTORY,
            expectedVersion: 1
          })
        )
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

export function loadHebrewComparisonShard(shardId, shardDirectory = HEBREW_SHARD_DIRECTORY) {
  const cacheKey = `${shardDirectory}/${shardId}`
  if (shardCache.has(cacheKey)) return Promise.resolve(shardCache.get(cacheKey))
  if (!shardPending.has(cacheKey)) {
    const generation = cacheGeneration
    const expectedVersion = shardDirectory === HEBREW_SHARD_DIRECTORY ? 2 : 1
    let pending
    pending = fetchJson(`${shardDirectory}/${shardId}.json`)
      .then((payload) => {
        if (payload?.version !== expectedVersion || payload?.shard !== shardId) {
          throw new Error('Unsupported Hebrew comparison shard')
        }
        if (generation !== cacheGeneration) {
          return loadHebrewComparisonShard(shardId, shardDirectory)
        }
        shardCache.set(cacheKey, payload)
        return payload
      })
      .finally(() => {
        if (shardPending.get(cacheKey) === pending) shardPending.delete(cacheKey)
      })
    shardPending.set(cacheKey, pending)
  }
  return shardPending.get(cacheKey)
}

export async function loadHebrewComparison(entry) {
  const shard = await loadHebrewComparisonShard(
    entry.shard,
    entry.shardDirectory || HEBREW_SHARD_DIRECTORY
  )
  return resolveHebrewComparison(entry, shard)
}
