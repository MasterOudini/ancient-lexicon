// Builds the lazy Jastrow supplement for Dictionary > Comparative.
//
// Jastrow contains Hebrew, Aramaic, and mixed-language records, but the pinned
// source has no complete row-level language metadata. This builder admits
// entries with a printed Hebrew origin marker and unmarked Hebrew/Aramaic
// entries for recall, while keeping the latter visibly unclassified. Entries
// with an explicit Aramaic-only or Arabic marker remain in Reference
// dictionaries and By meaning. The catalog keeps only compact lexical glosses;
// full citation prose stays in the on-demand Jastrow dictionary.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { REVIEWED_HEBREW_SOURCE_MAPPINGS } from '../src/data/reviewedHebrewSourceMappings.js'
import { GLOSS_STOP_WORDS } from '../src/lib/glossSearch.js'
import { normalize } from '../src/lib/search.js'
import {
  TARGET_LANGUAGES,
  buildCuratedHeadIndex,
  buildTargetIndex,
  canonicalTerms,
  normalizePos,
  slotsForSense
} from './build-hebrew-comparisons.mjs'

export const JASTROW_BUILD_ID = '2026-07-jastrow-v1'
export const JASTROW_SHARD_COUNT = 128
export const JASTROW_SOURCE_REVISION = '2d20f977d628c455f66175e6d0a2dfb528c6d7ba'
export const JASTROW_CATALOG_FILE = 'hebrew-jastrow-catalog-2026-07-v1.json'
export const JASTROW_SHARD_DIRECTORY = 'hebrew-jastrow-comparisons-2026-07-v1'
export const EXPECTED_JASTROW_COUNT = 32_512
export const EXPECTED_HEBREW_SEARCH_COUNT = 29_605

const HEBREW_ORIGIN_CODES = new Set(['he', 'bh', 'ar+he', 'he+ar', 'ar+bh'])
const ROOT_MODEL = /^[\u05d0-\u05ea]{2,5}$/u
const ORIGIN_LABELS = {
  und: 'Hebrew/Aramaic (unmarked)',
  he: 'Hebrew origin marker',
  bh: 'Biblical Hebrew origin marker',
  'ar+he': 'Aramaic & Hebrew origin marker',
  'he+ar': 'Hebrew & Aramaic origin marker',
  'ar+bh': 'Aramaic & Biblical Hebrew origin marker'
}
const CROSS_REFERENCE = /^(?:v\.?|q\.?\s*v\.?|see|compare|cf\.?)\b/i
const MAX_CATALOG_BYTES = 8 * 1024 * 1024
const MAX_SHARD_BYTES = 1024 * 1024
const MAX_PREVIEW_LENGTH = 180
const SOURCE_FORM_TYPES = ['alternate', 'plural', 'stem']

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const inputPath = join(projectRoot, 'public', 'dicts', 'jastrow.json')
const outputCatalog = join(projectRoot, 'public', 'dicts', JASTROW_CATALOG_FILE)
const outputShardDirectory = join(projectRoot, 'public', 'dicts', JASTROW_SHARD_DIRECTORY)

const reviewedById = new Map(
  REVIEWED_HEBREW_SOURCE_MAPPINGS
    .filter((mapping) => mapping.dictionaryId === 'jastrow')
    .map((mapping) => [mapping.entryId, mapping])
)

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function rawTerms(text) {
  const tokens = normalize(text || '').match(/[a-z]+(?:-[a-z]+)*/g) || []
  return unique(tokens.flatMap((token) => token.split('-')).filter((term) => {
    const romanNumeral = /^(?:x{1,3}|x{0,3}(?:ix|iv|v?i{1,3}))$/.test(term)
    return term.length >= 2 && !romanNumeral && !GLOSS_STOP_WORDS.has(term)
  }))
}

function phraseKey(text) {
  return rawTerms(text).join(' ')
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function truncate(value, limit = MAX_PREVIEW_LENGTH) {
  const clean = cleanText(value)
  if (clean.length <= limit) return clean
  const prefix = clean.slice(0, limit + 1)
  const boundary = prefix.lastIndexOf(' ')
  return `${prefix.slice(0, boundary > limit * 0.7 ? boundary : limit).trimEnd()}\u2026`
}

function flattenSourceSenses(senses, output = [], path = []) {
  for (let index = 0; index < (senses || []).length; index++) {
    const source = senses[index]
    const nextPath = [...path, index + 1]
    const gloss = cleanText(source.gloss).replace(/[\s,;:.—-]+$/u, '')
    if (gloss) {
      const raw = rawTerms(gloss)
      const terms = canonicalTerms(gloss)
      const marker = cleanText(source.marker)
      const label = truncate([marker, gloss].filter(Boolean).join(' '), 84)
      output.push({
        key: `sense-${nextPath.join('-')}`,
        label: label || `Sense ${output.length + 1}`,
        sourceText: gloss,
        matchable: !CROSS_REFERENCE.test(gloss) && terms.length > 0,
        terms,
        raw,
        phrase: phraseKey(gloss),
        pos: normalizePos(null, /^to\s+/i.test(gloss) ? `${gloss} (V)` : gloss),
        allTermsDiscrete: true
      })
    }
    if (source.senses?.length) flattenSourceSenses(source.senses, output, nextPath)
  }
  return output
}

function fallbackSense(entry) {
  const text = truncate(entry.def)
  const raw = rawTerms(text)
  const terms = canonicalTerms(text)
  return {
    key: 'definition-1',
    label: truncate(text, 84) || 'Dictionary entry',
    sourceText: text || 'No English lexical gloss supplied.',
    matchable: !CROSS_REFERENCE.test(text) && terms.length > 0,
    terms,
    raw,
    phrase: phraseKey(text),
    pos: null,
    allTermsDiscrete: false
  }
}

export function jastrowSenses(entry) {
  const senses = flattenSourceSenses(entry.senses)
  return senses.length > 0 ? senses : [fallbackSense(entry)]
}

export function isHebrewSearchableJastrowEntry(entry) {
  return entry.languageCode === 'und' || HEBREW_ORIGIN_CODES.has(entry.languageCode)
}

export function fnv1aJastrowShard(sourceKey) {
  let hash = 0x811c9dc5
  for (let index = 0; index < sourceKey.length; index++) {
    hash ^= sourceKey.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return (hash & (JASTROW_SHARD_COUNT - 1)).toString(16).padStart(2, '0')
}

function publicSense(sense) {
  // The compact catalog needs the picker label and matchability only. The
  // full lexical gloss is already visible in the row preview and remains in
  // the lazy source dictionary; build-only terms drive the shard matches but
  // need not be repeated in every downloaded tuple.
  return [sense.key, sense.label, null, sense.matchable]
}

function rootReferences(entry) {
  const references = []
  const reviewed = reviewedById.get(entry.id)?.root?.letters
  if (ROOT_MODEL.test(reviewed || '')) {
    references.push({ letters: reviewed, language: 'hebrew' })
  }
  for (const root of entry.sourceRoots || []) {
    if (ROOT_MODEL.test(root.letters || '')) {
      const language = root.languageCode === 'he' || root.languageCode === 'bh'
        ? 'hebrew'
        : root.languageCode === 'und' || HEBREW_ORIGIN_CODES.has(root.languageCode)
          ? 'hebrew-aramaic-unclassified'
          : null
      if (language) references.push({ letters: root.letters, language })
    }
  }
  const seen = new Set()
  return references.filter((reference) => {
    const key = `${reference.language}:${reference.letters}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function catalogSearch(entry, senses, aliases) {
  return normalize(unique([
    entry.id,
    entry.lemma,
    ...aliases,
    ...(entry.forms || []).map((form) => form.word),
    ...senses.flatMap((sense) => sense.terms)
  ]).join(' '))
}

function makeCatalogEntry(entry, shardId, senses) {
  const reviewed = reviewedById.get(entry.id)
  const aliases = unique([
    ...(entry.aliases || []),
    ...(reviewed?.aliases || [])
  ])
  const displayTransliteration = reviewed?.displayTransliteration || aliases[0] || null
  const roots = rootReferences(entry)
  const forms = (entry.forms || []).map((form) => [
    SOURCE_FORM_TYPES.indexOf(form.type),
    form.word,
    form.label || null
  ])
  return [
    0,
    String(entry.id),
    entry.lemma,
    displayTransliteration,
    truncate(senses.map((sense) => sense.sourceText).join('; ')),
    null,
    shardId,
    senses.map(publicSense),
    catalogSearch(entry, senses, unique([displayTransliteration, ...aliases])),
    roots.length > 0
      ? roots.map((root) => [0, String(entry.id), root.letters, root.language])
      : null,
    aliases,
    entry.languageCode,
    forms.length > 0 ? forms : null
  ]
}

function addShardRecord(shard, sourceKey, entry, senses, targetIndex, curatedHeads) {
  shard.records[sourceKey] = senses.map((sense) =>
    slotsForSense('jastrow', String(entry.id), entry.lemma, sense, shard, targetIndex, curatedHeads)
  )
}

export function buildJastrowArtifacts() {
  const source = JSON.parse(readFileSync(inputPath, 'utf8'))
  if (source.sourceRevision !== JASTROW_SOURCE_REVISION) {
    throw new Error(`Jastrow source revision is not pinned (${source.sourceRevision || 'missing'})`)
  }
  if (source.count !== EXPECTED_JASTROW_COUNT || source.entries?.length !== EXPECTED_JASTROW_COUNT) {
    throw new Error(`Jastrow source count changed (${source.entries?.length || 0})`)
  }

  const entries = source.entries.filter(isHebrewSearchableJastrowEntry)
  if (entries.length !== EXPECTED_HEBREW_SEARCH_COUNT) {
    throw new Error(`Hebrew-searchable Jastrow count changed (${entries.length})`)
  }
  if (entries.some((entry) => entry.id === 'B00487')) {
    throw new Error('pure-Aramaic Jastrow B00487 entered the Hebrew comparison catalog')
  }

  const targetIndex = buildTargetIndex()
  const curatedHeads = buildCuratedHeadIndex()
  const shards = Array.from({ length: JASTROW_SHARD_COUNT }, (_, index) => ({
    id: index.toString(16).padStart(2, '0'),
    records: {},
    candidates: [],
    candidateIndex: new Map()
  }))
  const catalogEntries = []
  let senseCount = 0
  let sourceRootCount = 0
  let reviewedRootCount = 0

  for (const entry of entries) {
    const sourceKey = `jastrow:${entry.id}`
    const shardId = fnv1aJastrowShard(sourceKey)
    const shard = shards[parseInt(shardId, 16)]
    const senses = jastrowSenses(entry)
    addShardRecord(shard, sourceKey, entry, senses, targetIndex, curatedHeads)
    catalogEntries.push(makeCatalogEntry(entry, shardId, senses))
    senseCount += senses.length
    sourceRootCount += (entry.sourceRoots || []).filter((root) => ROOT_MODEL.test(root.letters || '')).length
    if (reviewedById.get(entry.id)?.root?.letters) reviewedRootCount++
  }

  const catalog = {
    version: 1,
    build: JASTROW_BUILD_ID,
    revision: JASTROW_BUILD_ID,
    sourceRevision: source.sourceRevision,
    shardCount: JASTROW_SHARD_COUNT,
    shardDirectory: `dicts/${JASTROW_SHARD_DIRECTORY}`,
    languages: TARGET_LANGUAGES,
    sources: ['jastrow'],
    counts: {
      catalog: catalogEntries.length,
      jastrow: catalogEntries.length,
      senses: senseCount,
      sourceRootMappings: sourceRootCount,
      reviewedRootMappings: reviewedRootCount,
      targetSenses: targetIndex.senses.length
    },
    languageCodeCounts: source.languageCodeCounts,
    originLabels: ORIGIN_LABELS,
    entries: catalogEntries
  }
  const shardDocuments = shards.map((shard) => ({
    version: 1,
    build: JASTROW_BUILD_ID,
    revision: JASTROW_BUILD_ID,
    shard: shard.id,
    id: shard.id,
    languages: TARGET_LANGUAGES,
    records: shard.records,
    candidates: shard.candidates
  }))
  const catalogJson = JSON.stringify(catalog)
  const shardJson = shardDocuments.map((shard) => JSON.stringify(shard))

  if (Buffer.byteLength(catalogJson) >= MAX_CATALOG_BYTES) {
    throw new Error(`Jastrow catalog is ${Buffer.byteLength(catalogJson)} bytes (must be below ${MAX_CATALOG_BYTES})`)
  }
  shardJson.forEach((json, index) => {
    if (Buffer.byteLength(json) >= MAX_SHARD_BYTES) {
      throw new Error(`Jastrow shard ${shards[index].id} is ${Buffer.byteLength(json)} bytes (must be below ${MAX_SHARD_BYTES})`)
    }
  })
  return { catalog, shardDocuments, catalogJson, shardJson }
}

function normalizedFile(path) {
  return readFileSync(path, 'utf8').replace(/\r\n?/g, '\n')
}

function checkFile(path, expected) {
  if (!existsSync(path)) throw new Error(`missing generated artifact ${path}`)
  if (normalizedFile(path) !== expected) throw new Error(`generated artifact is stale: ${path}`)
}

export function writeOrCheckJastrowArtifacts({ check = false } = {}) {
  const artifacts = buildJastrowArtifacts()
  if (check) {
    checkFile(outputCatalog, artifacts.catalogJson)
    for (let index = 0; index < JASTROW_SHARD_COUNT; index++) {
      const id = index.toString(16).padStart(2, '0')
      checkFile(join(outputShardDirectory, `${id}.json`), artifacts.shardJson[index])
    }
  } else {
    mkdirSync(outputShardDirectory, { recursive: true })
    writeFileSync(outputCatalog, artifacts.catalogJson)
    for (let index = 0; index < JASTROW_SHARD_COUNT; index++) {
      const id = index.toString(16).padStart(2, '0')
      writeFileSync(join(outputShardDirectory, `${id}.json`), artifacts.shardJson[index])
    }
  }
  return artifacts
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check')
  const artifacts = writeOrCheckJastrowArtifacts({ check })
  const largestShard = Math.max(...artifacts.shardJson.map((json) => Buffer.byteLength(json)))
  console.log(
    `${check ? 'checked' : 'wrote'} ${artifacts.catalog.counts.catalog} Hebrew-searchable or unmarked Jastrow records, ` +
    `${artifacts.catalog.counts.senses} senses, ${JASTROW_SHARD_COUNT} shards; ` +
    `catalog ${Buffer.byteLength(artifacts.catalogJson)} bytes, largest shard ${largestShard} bytes`
  )
}
