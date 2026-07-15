// Builds the on-demand Hebrew and Biblical-Aramaic root catalog used by the
// permutation explorer. The source dictionaries are pinned, published works;
// this script selects only entries that those works explicitly classify as
// root headings, direct primitive roots, or primitive lexical bases. It never
// infers a missing root from a permutation and never admits an "unused root"
// mentioned by a derivative.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { foldFinals } from '../src/lib/scripts.js'

export const CATALOG_FORMAT = 'ancient-lexicon-attested-roots-v1'
export const CATALOG_FILE = 'attested-roots-2026-07-v1.json'
export const CATALOG_PAYLOAD_MARKER = 'attested-root-payload-only-2026-07-v1'
export const CATALOG_PAYLOAD_PROBE = 'attested-root-records-only-2026-07-v1'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const strongsPath = join(projectRoot, 'src', 'data', 'strongs.json')
const bdbPath = join(projectRoot, 'public', 'dicts', 'bdb.json')
const outputPath = join(projectRoot, 'public', 'dicts', CATALOG_FILE)
const HEBREW_LETTERS = /^[אבגדהוזחטיכלמנסעפצקרשת]{2,5}$/u
// Vowel marks plus shureq (וּ), whose dot is encoded with the dagesh mark.
const POINTING = /[\u05b0-\u05bb\u05c7]|\u05d5\u05bc/u
const REVIEWED_ATTESTATIONS = {
  'hebrew:רשמ': {
    word: 'רָשׁוּם',
    gloss: 'recorded, inscribed',
    source: 'masoretic-text',
    sourceId: 'Daniel 10:21',
    sourceLanguage: 'hebrew',
    evidence: 'reviewed biblical citation',
    citation: 'Daniel 10:21'
  }
}

function compareText(a, b) {
  return a < b ? -1 : a > b ? 1 : 0
}

export function firstHebrewWord(text = '') {
  return text.match(/[א-ת](?:[\u0591-\u05c7]*[א-ת])*[\u0591-\u05c7]*/u)?.[0] || ''
}

export function rootLettersFromLemma(lemma = '') {
  const word = firstHebrewWord(lemma).normalize('NFKD')
  const letters = foldFinals(word.replace(/[\u0591-\u05c7]/gu, ''))
  return HEBREW_LETTERS.test(letters) ? Array.from(letters) : null
}

// Strong's also describes many nouns as coming "from a primitive root".
// Those are derivative records, not root entries. A qualifying occurrence
// must describe this entry itself and therefore must not be governed by
// "from", "of", or "participle from" immediately before the phrase.
export function isDirectStrongsRoot(entry) {
  const derivation = (entry.deriv || '').replace(/\s+/g, ' ').trim()
  return (
    /\ba primitive root\b/i.test(derivation) &&
    !/\bfrom a primitive root\b/i.test(derivation) &&
    !/unused root/i.test(derivation)
  )
}

function isPrimitiveStrongsWord(entry) {
  const derivation = (entry.deriv || '').replace(/\s+/g, ' ').trim()
  return /\ba primitive word\b/i.test(derivation) && !/\bfrom a primitive word\b/i.test(derivation)
}

export function isCorrespondingAramaicStrongsRoot(entry, strongsById) {
  const match = (entry.deriv || '').match(
    /^\(Aramaic\)\s+corresponding to (H\d+)\b/i
  )
  return Boolean(match && isDirectStrongsRoot(strongsById.get(match[1]) || {}))
}

// Strong's sometimes files more than one explicit primitive-root spelling in
// one record, for example "or (by permutation) סוּט; a primitive root" in
// H7750. Only leading clauses introduced by "or" or "also" are alternate
// headings. This deliberately excludes later "akin to", "compare", and
// "erroneously" references, which name related or rejected records instead.
export function alternateStrongsRootLemmas(entry) {
  const derivation = (entry.deriv || '').replace(/\s+/g, ' ').trim()
  const beforePrimitiveRoot = derivation.split(/\ba primitive root\b/i)[0] || ''
  const lemmas = []
  for (const clause of beforePrimitiveRoot.split(';')) {
    if (!/^\s*(?:or|also)\b/i.test(clause)) continue
    const lemma = firstHebrewWord(clause)
    if (lemma) lemmas.push(lemma)
  }
  return [...new Set(lemmas)]
}

function sourceLanguage(source, entry) {
  if (source === 'bdb') return entry.id.startsWith('x') ? 'biblical-aramaic' : 'hebrew'
  return /^\(Aramaic\)/i.test((entry.deriv || '').trim())
    ? 'biblical-aramaic'
    : 'hebrew'
}

function safeGloss(value) {
  if (/\*|\bproto-/i.test(value)) {
    return 'published root entry; source gloss omitted because it includes reconstructed material'
  }
  const clean = value
    .replace(/[{}\[\]]/g, ' ')
    .replace(/[\u0591-\u05c7א-ת]+/gu, ' ')
    .replace(/\bvb\.?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s*[,.;:—-]+\s*/, '')
    .trim()
  const clause = clean.split(/\s*(?:;|—)\s*/u).find(Boolean) || 'published root entry'
  if (clause.length <= 180) return clause
  const shortened = clause.slice(0, 177).replace(/\s+\S*$/, '')
  return `${shortened}…`
}

function sourceGloss(source, entry) {
  if (source === 'bdb') {
    const marker = entry.def.search(/\bvb\b/i)
    return safeGloss(marker >= 0 ? entry.def.slice(marker + 2) : entry.def)
  }
  return safeGloss(entry.def || entry.kjv || 'published root entry')
}

function candidate(source, entry, lemma = entry.lemma) {
  const letters = rootLettersFromLemma(lemma)
  if (!letters) return null
  const word = firstHebrewWord(lemma)
  return {
    source,
    sourceId: entry.id,
    sourceLanguage: sourceLanguage(source, entry),
    letters,
    word,
    pointed: POINTING.test(word),
    gloss: sourceGloss(source, entry)
  }
}

export function extractAttestedRootCandidates(strongs, bdb) {
  const candidates = []
  const strongsById = new Map(strongs.entries.map((entry) => [entry.id, entry]))

  for (const entry of strongs.entries) {
    const directRoot = isDirectStrongsRoot(entry)
    const primitiveWord = isPrimitiveStrongsWord(entry)
    const correspondingAramaic = isCorrespondingAramaicStrongsRoot(
      entry,
      strongsById
    )
    if (!directRoot && !primitiveWord && !correspondingAramaic) continue
    const lemmas = directRoot
      ? [entry.lemma, ...alternateStrongsRootLemmas(entry)]
      : [entry.lemma]
    for (const lemma of lemmas) {
      const record = candidate('strongs', entry, lemma)
      if (record?.pointed) candidates.push(record)
    }
  }

  for (const entry of bdb.entries) {
    // At the pinned BDB revision every XML type="root" group leader is the
    // stable .aa record. Other verb rows can be derived or inflected forms;
    // treating their displayed consonants as radicals creates false roots.
    // Shin/sin dots identify the consonant rather than vocalize it, so a root
    // such as BDB t.eu.aa (רשׁף) is still an unpointed root heading.
    const hasLexicalPointing = POINTING.test(entry.lemma || '')
    const explicitUnpointedRoot = !hasLexicalPointing
    if (
      !entry.id.endsWith('.aa') ||
      (!/^vb(?:\.|$)/i.test(entry.pos || '') && !explicitUnpointedRoot)
    ) continue
    const record = candidate('bdb', entry)
    // Pointed five-consonant verb rows such as Aramaic שׁיציא are derived
    // lexical forms, not the consonantal root headings represented here.
    if (/[\u0591-\u05c7]/u.test(entry.lemma || '') && record?.letters.length > 4) continue
    if (record) candidates.push(record)
  }

  return candidates.sort((a, b) =>
    compareText(a.letters.join(''), b.letters.join('')) ||
    compareText(a.source, b.source) ||
    compareText(a.sourceId, b.sourceId)
  )
}

function rootId(language, letters) {
  const prefix = language === 'biblical-aramaic' ? 'arc' : 'he'
  return `${prefix}-ref-${letters.map((letter) => letter.codePointAt(0).toString(16)).join('-')}`
}

function uniqueSourceRecords(records) {
  const seen = new Set()
  return records.filter((record) => {
    const key = `${record.source}:${record.sourceId}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function uniqueAttestations(records) {
  const seen = new Set()
  const attestations = []
  for (const record of records) {
    const key = `${record.sourceLanguage}:${record.word}`
    if (seen.has(key)) continue
    seen.add(key)
    attestations.push({
      word: record.word,
      gloss: record.gloss,
      source: record.source,
      sourceId: record.sourceId,
      sourceLanguage: record.sourceLanguage,
      evidence: 'published lexicon headword'
    })
  }
  return attestations
}

export function buildAttestedRootCatalog(strongs, bdb) {
  const candidates = extractAttestedRootCandidates(strongs, bdb)
  const grouped = new Map()
  for (const record of candidates) {
    const key = `${record.sourceLanguage}:${record.letters.join('')}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(record)
  }

  const roots = []
  for (const [groupKey, records] of [...grouped].sort(([a], [b]) => compareText(a, b))) {
    const pointedRecords = records.filter((record) => record.pointed)
    const displayRecords = pointedRecords.length > 0 ? pointedRecords : records
    const preferred = displayRecords.find((record) => record.source === 'strongs') || displayRecords[0]
    const sources = uniqueSourceRecords(records).map((record) => ({
      source: record.source,
      sourceId: record.sourceId,
      sourceLanguage: record.sourceLanguage,
      headword: record.word
    }))
    const languages = [...new Set(records.map((record) => record.sourceLanguage))].sort(compareText)
    const language = preferred.sourceLanguage
    const consonantKey = preferred.letters.join('')
    const root = {
      id: rootId(language, preferred.letters),
      lang: language,
      letters: preferred.letters,
      gloss: preferred.gloss,
      attested: uniqueAttestations(displayRecords),
      sourceLanguages: languages,
      sources,
      sourceDerived: true
    }

    // Reviewed surface words are kept separate from dictionary headwords.
    // The lexicon records remain in `sources`; this table names the corpus
    // evidence for the exact displayed biblical form.
    const reviewedAttestation =
      REVIEWED_ATTESTATIONS[`${language}:${consonantKey}`]
    if (reviewedAttestation) root.attested.unshift(reviewedAttestation)

    roots.push(root)
  }

  return {
    format: CATALOG_FORMAT,
    payloadMarker: CATALOG_PAYLOAD_MARKER,
    payloadProbe: CATALOG_PAYLOAD_PROBE,
    sourcePolicy:
      "BDB type-root group leaders explicitly labeled as verbs or preserved as unpointed root headings, direct Strong's primitive roots, Strong's primitive lexical bases, and Biblical-Aramaic Strong's records corresponding to those roots; published headwords are retained as lexical attestations. The hand-curated database supplies reviewed roots and attestations.",
    sources: [
      { id: 'strongs', work: strongs.work, count: strongs.count },
      {
        id: 'bdb',
        work: bdb.work,
        count: bdb.count,
        sourceRevision: bdb.sourceRevision
      }
    ],
    candidateCount: candidates.length,
    count: roots.length,
    roots
  }
}

export function serializeAttestedRootCatalog(catalog) {
  return `${JSON.stringify(catalog)}\n`
}

export function buildFromRepository() {
  const strongs = JSON.parse(readFileSync(strongsPath, 'utf8'))
  const bdb = JSON.parse(readFileSync(bdbPath, 'utf8'))
  return buildAttestedRootCatalog(strongs, bdb)
}

function main() {
  const expected = serializeAttestedRootCatalog(buildFromRepository())
  const checkOnly = process.argv.includes('--check')

  if (checkOnly) {
    if (!existsSync(outputPath) || readFileSync(outputPath, 'utf8') !== expected) {
      console.error(`${CATALOG_FILE} is stale; run node scripts/build-attested-roots.mjs`)
      process.exit(1)
    }
    console.log(`verified ${CATALOG_FILE}`)
    return
  }

  writeFileSync(outputPath, expected)
  const catalog = JSON.parse(expected)
  console.log(`wrote ${outputPath}: ${catalog.count} roots from ${catalog.candidateCount} source entries`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
