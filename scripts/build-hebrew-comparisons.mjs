// Builds the compact, sense-specific Hebrew comparison catalog and 64 lazy
// comparison shards. English is used only as the semantic bridge; Hebrew is
// the source record and never a target comparison language.

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { LEXICON } from '../src/data/lexicon.js'
import { REFERENCE_DICTIONARIES } from '../src/data/referenceDictionaries.js'
import { englishKeywords, GLOSS_STOP_WORDS } from '../src/lib/glossSearch.js'
import { normalize } from '../src/lib/search.js'
import { toImperialAramaic, toMusnad } from '../src/lib/scripts.js'

export const BUILD_ID = '2026-07-v1'
export const SHARD_COUNT = 64
export const TARGET_LANGUAGES = ['akkadian', 'sumerian', 'egyptian', 'hittite', 'aramaic', 'osa']
export const HEBREW_SOURCES = ['strongs', 'bdb']
export const SLOT_NONE = 0
export const SLOT_AUTOMATIC = 1
export const SLOT_VERIFIED = 2

export const LEGACY_INDEX_HASHES = {
  'gloss-index.json': 'e42c54c8c7bf6b1473c6e0dd63e1c26c3a6051ea143c2db8ffa3e9396173afef',
  'gloss-index-2026-07.json': 'f51686ecdb2bdaf50b5766cb703a777f62d294d95915f71fa1d2b1bae38bb4eb'
}

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const outputCatalog = join(projectRoot, 'public', 'dicts', 'hebrew-catalog-2026-07-v1.json')
const outputShardDirectory = join(projectRoot, 'public', 'dicts', 'hebrew-comparisons-2026-07-v1')
const LEGACY_INDEX_LIMIT = 9_448_128
const MAX_SHARD_BYTES = 1024 * 1024
const MAX_ALTERNATIVES = 4

const TARGET_LANGUAGE_BY_DICTIONARY = {
  akkadian: 'akkadian',
  sumerian: 'sumerian',
  egyptian: 'egyptian',
  'hittite-iecor': 'hittite',
  'hittite-diacl': 'hittite',
  'hittite-asjp': 'hittite',
  'hittite-sturtevant': 'hittite',
  'hittite-wikidata': 'hittite',
  'hittite-wiktionary': 'hittite',
  'osa-wikidata': 'osa',
  'osa-wiktionary': 'osa'
}

const SOURCE_TIER = {
  akkadian: 5,
  sumerian: 5,
  egyptian: 5,
  'hittite-iecor': 5,
  'hittite-diacl': 5,
  'hittite-asjp': 4,
  'hittite-wikidata': 3,
  'hittite-wiktionary': 3,
  'hittite-sturtevant': 1,
  'osa-wikidata': 2,
  'osa-wiktionary': 2
}

const REVIEWED_SYNONYM_GROUPS = [
  ['weave', 'plait', 'braid', 'fabricate', 'woven', 'weaving'],
  ['plot', 'contrive', 'devise', 'plan', 'scheme'],
  ['think', 'thought', 'consider', 'regard', 'esteem', 'ponder', 'mindful'],
  ['count', 'computed', 'compute', 'reckon', 'account', 'calculate', 'enumerate'],
  ['belt', 'strap', 'girdle', 'band', 'sash'],
  ['father', 'parent', 'paternal'],
  ['anger', 'wrath', 'ire'],
  ['friend', 'companion', 'neighbor', 'neighbour', 'associate'],
  ['evil', 'bad', 'wicked'],
  ['strength', 'might', 'power'],
  ['cattle', 'herd'],
  ['scroll', 'book', 'document'],
  ['month', 'moon'],
  ['rest', 'cease'],
  ['bless', 'blessing'],
  ['seed', 'offspring']
]

const CANONICAL_BY_TERM = new Map()
const REVIEWED_CANONICALS = new Set()
for (const group of REVIEWED_SYNONYM_GROUPS) {
  const canonical = group[0]
  REVIEWED_CANONICALS.add(canonical)
  for (const term of group) CANONICAL_BY_TERM.set(term, canonical)
}

// These are the reviewed semantic discriminators for every normalized
// curated-head collision. A collision can never fall back to source order.
export const CURATED_COLLISION_RULES = {
  servant: ['servant', 'slave'],
  serve: ['serve', 'work'],
  seed: ['seed', 'offspring'],
  sow: ['sow'],
  nose: ['nose'],
  anger: ['anger', 'wrath'],
  knee: ['knee'],
  bless: ['bless', 'blessing'],
  hair: ['hair'],
  gate: ['gate'],
  friend: ['friend', 'companion', 'neighbor', 'neighbour'],
  evil: ['evil', 'bad', 'wicked'],
  goat: ['goat'],
  strength: ['strength', 'might'],
  cattle: ['cattle', 'herd'],
  morning: ['morning'],
  bed: ['bed'],
  staff: ['staff', 'rod'],
  scroll: ['scroll', 'book', 'document'],
  scribe: ['scribe'],
  month: ['month', 'moon'],
  new: ['new'],
  sabbath: ['sabbath'],
  rest: ['rest', 'cease'],
  reign: ['reign'],
  king: ['king']
}

const CURATED_SENSE_ALIASES = {
  beer: ['intoxicating drink'],
  ibex: ['mountain goat'],
  season: ['appointment fixed time']
}

const CURATED_SENSE_EXCLUSIONS = {
  staff: new Set(['tribe'])
}

const CURATED_QUALITY_NOUNS = new Set(['word', 'voice', 'truth', 'justice', 'work'])

const STRONGS_OVERRIDES = {
  H1: [
    ['father', 'father', 'father', 'noun']
  ],
  H2803: [
    ['weave-plait-fabricate', 'weave/plait/fabricate', 'weave, plait, fabricate', 'verb'],
    ['plot-contrive-devise', 'plot/contrive/devise', 'plot, contrive, devise', 'verb'],
    ['think-consider-regard', 'think/consider/regard', 'think, consider, regard', 'verb'],
    ['count-compute-reckon', 'count/compute/reckon', 'count, compute, reckon', 'verb']
  ],
  H2805: [
    ['belt-strap-girdle', 'belt/strap/girdle', 'belt, strap, girdle', 'noun']
  ]
}

const CROSS_REFERENCE = /^(?:v\.?|q\.?\s*v\.?|see|compare|cf\.?)\b/i
const PROPER_NAME = /\b(?:proper name|patronymic|gentilic|israelite|descendant of|son of|daughter of|place in|place of|territory|district of|name of (?:an? |the )?(?:man|woman|person|israelite|city|town|place|country|people))\b/i
const UNCERTAINTY_ONLY = /^\s*(?:perhaps|probably|possibly|meaning uncertain|unknown|\?)/i
const WIKTIONARY_META = /^(?:(?:suffix|prefix|particle)\s+(?:forming|used)|(?:alternative|alternate|obsolete|archaic|inflected|plural|singular)\s+(?:form|spelling)\s+of|(?:suffixal|attached to)\b)/i
const COMMON_SINGLE_LINKS = new Set([
  'thing', 'one', 'kind', 'type', 'name', 'part', 'act', 'state', 'object',
  'form', 'make', 'made', 'do', 'become', 'work', 'use', 'used'
])
const BDB_NOISE = new Set([
  'ab', 'arab', 'aram', 'assyr', 'ch', 'compare', 'deut', 'dub', 'ed', 'esp',
  'ethiopic', 'fig', 'gn', 'hithp', 'ib', 'id', 'isr', 'jb', 'koh', 'mng',
  'niph', 'opp', 'perh', 'pers', 'piel', 'prob', 'pron', 'prop', 'qal', 'ref',
  'syr', 'syriac', 'usu', 'whence'
])

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

export function assertLegacyIndexHashes() {
  for (const [filename, expected] of Object.entries(LEGACY_INDEX_HASHES)) {
    const actual = sha256(join(projectRoot, 'public', 'dicts', filename))
    if (actual !== expected) throw new Error(`${filename} changed (${actual}; expected ${expected})`)
  }
}

export function fnv1aShard(sourceKey) {
  let hash = 0x811c9dc5
  for (let i = 0; i < sourceKey.length; i++) {
    hash ^= sourceKey.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return (hash & (SHARD_COUNT - 1)).toString(16).padStart(2, '0')
}

function unique(values) {
  return [...new Set(values.filter(Boolean))]
}

function canonicalTerm(term) {
  return CANONICAL_BY_TERM.get(term) || term
}

export function canonicalTerms(text) {
  return unique(englishKeywords(text).map(canonicalTerm))
}

function rawTerms(text) {
  const tokens = normalize(text || '').match(/[a-z]+(?:-[a-z]+)*/g) || []
  return unique(tokens.filter((term) => {
    const romanNumeral = /^(?:x{1,3}|x{0,3}(?:ix|iv|v?i{1,3}))$/.test(term)
    return term.length >= 2 && !romanNumeral && !GLOSS_STOP_WORDS.has(term)
  }))
}

function phraseKey(text) {
  return rawTerms(text).join(' ')
}

export function normalizePos(value, definition = '') {
  const senseMarker = String(definition || '').match(/\((N|V|ADJ|ADV)\)\s*$/i)?.[1]?.toLowerCase()
  if (senseMarker === 'v') return 'verb'
  if (senseMarker === 'n') return 'noun'
  if (senseMarker === 'adj') return 'adjective'
  if (senseMarker === 'adv') return 'adverb'

  const text = String(value || '').toLowerCase().trim()
  if (!text || /(?:^|\b)n\s*\/\s*v(?:\b|$)/i.test(text)) return null
  if (/\b(?:adjective|adj)(?:\.|\b)/.test(text)) return 'adjective'
  if (/\b(?:adverb|adv)(?:\.|\b)/.test(text)) return 'adverb'
  if (/\b(?:verb|vb|qal|niph|piel|pual|hiph|hoph|hithp)(?:\.|\b)/.test(text) || /^v\.?$/.test(text)) return 'verb'
  if (/\b(?:noun|substantive)\b/.test(text) || /^n(?:\.|$)/.test(text)) return 'noun'
  if (/\b(?:pronoun|pron)(?:\.|\b)/.test(text)) return 'pronoun'
  if (/\b(?:preposition|prep)(?:\.|\b)/.test(text)) return 'preposition'
  return null
}

function cleanLabel(text, fallback) {
  const clean = String(text || '')
    .replace(/[{}\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^[,;:.\-\u2014]+\s*/, '')
    .trim()
  if (!clean) return fallback
  return clean.length <= 84 ? clean : `${clean.slice(0, 81).trimEnd()}…`
}

function strongsAliases(entry) {
  return unique(String(entry.kjv || '')
    .split(/\bCompare\b/i)[0]
    .split(/[,;]/)
    .flatMap((part) => rawTerms(part.replace(/\[[^\]]+]/g, ' ').replace(/\([^)]*\)/g, ' '))))
}

function matchableText(text, pos) {
  const clean = String(text || '').trim()
  if (!clean || CROSS_REFERENCE.test(clean) || UNCERTAINTY_ONLY.test(clean)) return false
  if (normalizePos(pos) === 'noun' && /n\.?pr/i.test(pos || '')) return false
  if (PROPER_NAME.test(clean)) return false
  return canonicalTerms(clean).length > 0
}

function makeSense(key, label, sourceText, termText, matchable, pos = null, allTermsDiscrete = false) {
  const terms = matchable ? canonicalTerms(termText) : []
  return {
    key,
    label: cleanLabel(label, key),
    sourceText: String(sourceText || '').trim(),
    matchable: Boolean(matchable && terms.length > 0),
    terms,
    raw: rawTerms(termText),
    phrase: phraseKey(termText),
    pos,
    allTermsDiscrete
  }
}

function strongsSenses(entry) {
  const override = STRONGS_OVERRIDES[entry.id]
  if (override) {
    return override.map(([key, label, text, pos]) => makeSense(key, label, text, text, true, pos, true))
  }

  const definition = String(entry.def || '').trim()
  const properName = /^[A-Z][A-Za-z'-]+(?:[\s,(]|$)/.test(definition)
  const clauses = definition
    .replace(/[{}]/g, '')
    .split(/[;\u2014]/)
    .map((clause) => clause.trim())
    .filter(Boolean)
  const sourceClauses = clauses.length > 0 ? clauses : [definition || 'No English lexical definition supplied.']
  const pos = /primitive root/i.test(entry.deriv || '') ? 'verb' : null
  const senses = sourceClauses.map((clause, index) => {
    const termText = clause.replace(/\([^)]*\)/g, ' ')
    const okay = !properName && matchableText(termText, pos)
    return makeSense(
      `definition-${index + 1}`,
      cleanLabel(clause, `Sense ${index + 1}`),
      clause,
      termText,
      okay,
      pos
    )
  })

  // KJV renderings are aliases only. They may strengthen an existing sense
  // when they agree canonically, but they never create a display sense.
  const aliases = strongsAliases(entry)
  for (const sense of senses) {
    const agreed = aliases.map(canonicalTerm).filter((term) => sense.terms.includes(term))
    sense.terms = unique([...sense.terms, ...agreed])
  }
  return senses
}

function cleanBdbTermText(text) {
  return String(text || '')
    .replace(/[\u0590-\u05ff]+/g, ' ')
    .replace(/\b\d+(?::\d+)?\b/g, ' ')
    .replace(/\b(?:n\.?m|n\.?f|n\.?pr|vb|adj|adv|qal|niph|hiph|hoph|piel|pual|hithp)\.?\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260)
}

function bdbSenses(entry) {
  const pos = normalizePos(entry.pos, entry.def)
  if (entry.senses?.length) {
    return entry.senses.map((sense) => {
      const termText = sense.defs?.length ? sense.defs.join('; ') : sense.def
      const filteredTerms = rawTerms(cleanBdbTermText(termText)).filter((term) => !BDB_NOISE.has(term))
      const matchable = matchableText(termText, entry.pos) && filteredTerms.length > 0
      const built = makeSense(
        sense.key,
        `${sense.label} — ${cleanLabel(sense.def, sense.label)}`,
        sense.def,
        filteredTerms.join(' '),
        matchable,
        pos,
        true
      )
      return built
    })
  }

  const sourceText = String(entry.def || '').trim() || 'No English lexical definition supplied.'
  const termText = entry.id === 'h.gr.ab'
    ? 'girdle band belt strap'
    : cleanBdbTermText(sourceText)
  const filteredTerms = rawTerms(termText).filter((term) => !BDB_NOISE.has(term))
  const matchable = matchableText(termText, entry.pos) && filteredTerms.length > 0
  return [makeSense(
    'definition-1',
    cleanLabel(termText, 'Dictionary entry'),
    sourceText,
    filteredTerms.join(' '),
    matchable,
    pos,
    entry.id === 'h.gr.ab'
  )]
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function readDictionary(dict) {
  const path = dict.source.kind === 'strongs'
    ? join(projectRoot, 'src', 'data', 'strongs.json')
    : join(projectRoot, 'public', dict.source.url)
  return readJson(path)
}

function nativeScript(entry, dict) {
  const field = dict.fields.script
  if (field && entry[field]) return entry[field]
  const lemma = String(entry.lemma || '')
  if (/[\u{10A60}-\u{10A7F}\u{12000}-\u{1254F}\u{13000}-\u{1345F}]/u.test(lemma)) return lemma
  return null
}

function sourceWordAndTranslit(entry, dict) {
  const word = String(entry.lemma || '').trim()
  const script = nativeScript(entry, dict)
  const supplied = entry.xlit ? String(entry.xlit) : null
  const translit = supplied || (script === word ? null : word || null)
  return { word, script, translit }
}

function splitTargetMeanings(entry) {
  return String(entry.def || '')
    .split(/[;\u2014]/)
    .map((value) => value.trim())
    .filter(Boolean)
}

function targetSenseEligible(dict, entry, meaning) {
  if (dict.id === 'egyptian' && !entry.de) return false
  if (dict.id.endsWith('-wiktionary') && WIKTIONARY_META.test(meaning)) return false
  if (/^(?:letter|symbol|suffix|prefix)$/i.test(entry.pos || '')) return false
  if (/(?:\?|\(\s*\?\s*\))\s*(?:\([A-Z]+\))?\s*$/.test(meaning)) return false
  if (UNCERTAINTY_ONLY.test(meaning) || CROSS_REFERENCE.test(meaning)) return false
  return canonicalTerms(meaning).length > 0
}

function buildTargetIndex() {
  const senses = []
  const byTerm = new Map()
  const documentFrequency = new Map()
  const dictionaryOrder = new Map(REFERENCE_DICTIONARIES.map((dict, index) => [dict.id, index]))

  for (const dict of REFERENCE_DICTIONARIES) {
    const language = TARGET_LANGUAGE_BY_DICTIONARY[dict.id]
    if (!language) continue
    const data = readDictionary(dict)
    for (const entry of data.entries) {
      const { word, script, translit } = sourceWordAndTranslit(entry, dict)
      for (const meaning of splitTargetMeanings(entry)) {
        if (!targetSenseEligible(dict, entry, meaning)) continue
        // A qualified parenthetical such as "garment (belt?)" must not make
        // the uncertain word eligible for a belt comparison.
        const semanticText = meaning
          .replace(/\b[A-Za-z][A-Za-z-]*\s*\(\s*\?\s*\)/g, ' ')
          .replace(/\([^)]*\?[^)]*\)/g, ' ')
        const raw = rawTerms(semanticText)
        const terms = unique(raw.map(canonicalTerm))
        if (terms.length === 0) continue
        const index = senses.length
        const target = {
          index,
          dictionaryId: dict.id,
          entryId: String(entry.id),
          language,
          word,
          script,
          translit,
          meaning,
          raw,
          terms,
          phrase: phraseKey(semanticText),
          pos: normalizePos(entry.pos || entry.lexicalCategoryLabel, meaning),
          sourceTier: SOURCE_TIER[dict.id] || 0,
          sourceOrder: dictionaryOrder.get(dict.id) || 0
        }
        senses.push(target)
        for (const term of terms) {
          const postings = byTerm.get(term) || []
          postings.push(index)
          byTerm.set(term, postings)
          documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1)
        }
      }
    }
  }
  return { senses, byTerm, documentFrequency }
}

function posFit(sourcePos, targetPos) {
  if (!sourcePos || !targetPos) return 1
  return sourcePos === targetPos ? 2 : 0
}

function intersection(a, b) {
  const bSet = new Set(b)
  return a.filter((value) => bSet.has(value))
}

function rankTarget(sourceSense, target, targetIndex) {
  const shared = intersection(sourceSense.terms, target.terms)
  if (shared.length === 0) return null
  const fit = posFit(sourceSense.pos, target.pos)
  if (fit === 0) return null

  const exactPhrase = Boolean(sourceSense.phrase && sourceSense.phrase === target.phrase)
  const exactRaw = intersection(sourceSense.raw, target.raw)
  const reviewed = shared.filter((term) => REVIEWED_CANONICALS.has(term))
  if (sourceSense.pos === 'verb' && !target.pos && target.raw.length === 1 && reviewed.length === 0) {
    return null
  }
  const distinctive = shared.filter((term) =>
    (targetIndex.documentFrequency.get(term) || 0) <= 160 && !COMMON_SINGLE_LINKS.has(term)
  )
  const sourceDiscrete = sourceSense.allTermsDiscrete ? sourceSense.raw : sourceSense.raw.slice(0, 1)
  const exactConcept = exactRaw.some((term) =>
    !COMMON_SINGLE_LINKS.has(term) &&
    sourceDiscrete.includes(term) &&
    ((target.raw.length === 1 && target.raw[0] === term) ||
      (sourceSense.raw.length === 1 && target.raw[0] === term))
  )
  if (!exactPhrase && !exactConcept && reviewed.length === 0 && distinctive.length < 2) return null

  const distinctiveWeight = distinctive.reduce((sum, term) =>
    sum + 1 / Math.max(1, targetIndex.documentFrequency.get(term) || 1), 0)
  const bridgeTerms = [...shared].sort((a, b) =>
    (targetIndex.documentFrequency.get(a) || 0) - (targetIndex.documentFrequency.get(b) || 0) ||
    a.localeCompare(b)
  )
  const evidence = exactPhrase
    ? 'Exact normalized bridge phrase'
    : exactConcept
      ? `Exact bridge concept: ${bridgeTerms[0]}`
      : reviewed.length > 0
        ? `Reviewed canonical synonym: ${reviewed[0]}`
        : `Multiple distinctive guide terms: ${distinctive.join(', ')}`
  return {
    target,
    exactPhrase: Number(exactPhrase),
    exactConcept: Number(exactConcept),
    reviewedLink: Number(reviewed.length > 0),
    fit,
    coverage: shared.length,
    distinctiveWeight,
    bridge: bridgeTerms[0],
    evidence
  }
}

export function compareRankedCandidates(a, b) {
  return b.exactPhrase - a.exactPhrase ||
    b.exactConcept - a.exactConcept ||
    b.reviewedLink - a.reviewedLink ||
    b.fit - a.fit ||
    b.coverage - a.coverage ||
    b.distinctiveWeight - a.distinctiveWeight ||
    b.target.sourceTier - a.target.sourceTier ||
    a.target.meaning.length - b.target.meaning.length ||
    a.target.sourceOrder - b.target.sourceOrder ||
    a.target.dictionaryId.localeCompare(b.target.dictionaryId) ||
    a.target.entryId.localeCompare(b.target.entryId)
}

export function selectAutomaticCandidates(sourceSense, language, targetIndex) {
  if (!sourceSense.matchable || language === 'aramaic') return []
  const pool = new Set()
  for (const term of sourceSense.terms) {
    for (const index of targetIndex.byTerm.get(term) || []) pool.add(index)
  }
  const bestByEntry = new Map()
  for (const index of pool) {
    const target = targetIndex.senses[index]
    if (target.language !== language) continue
    const ranked = rankTarget(sourceSense, target, targetIndex)
    if (!ranked) continue
    const key = `${target.dictionaryId}:${target.entryId}`
    const previous = bestByEntry.get(key)
    if (!previous || compareRankedCandidates(ranked, previous) < 0) bestByEntry.set(key, ranked)
  }
  const ranked = [...bestByEntry.values()].sort(compareRankedCandidates)
  if (ranked.length <= 1) return ranked

  // Alternatives are retained only when they meet the primary's semantic
  // class and coverage. Lower-quality loose matches remain out of the card.
  const primary = ranked[0]
  const alternatives = ranked.slice(1).filter((item) =>
    item.exactPhrase === primary.exactPhrase &&
    item.exactConcept === primary.exactConcept &&
    item.reviewedLink === primary.reviewedLink &&
    item.coverage === primary.coverage &&
    item.fit >= primary.fit - 1
  ).slice(0, MAX_ALTERNATIVES)
  return [primary, ...alternatives]
}

function buildCuratedHeadIndex() {
  const index = new Map()
  for (const entry of LEXICON) {
    const head = normalize(entry.hebrew.word)
    const values = index.get(head) || []
    values.push(entry)
    index.set(head, values)
  }
  for (const [head, entries] of index) {
    if (entries.length <= 1) continue
    for (const entry of entries) {
      if (!CURATED_COLLISION_RULES[entry.id]) {
        throw new Error(`unreviewed curated homograph collision ${head}: ${entries.map((item) => item.id).join(', ')}`)
      }
    }
  }
  return index
}

function curatedPos(entry) {
  if (entry.category === 'verbs' || entry.category === 'verbs2') return 'verb'
  if (entry.category === 'qualities' && !CURATED_QUALITY_NOUNS.has(entry.id)) return 'adjective'
  if (entry.category === 'colors') return 'adjective'
  return 'noun'
}

function curatedSensePhrases(entry) {
  const phrases = [
    ...entry.english,
    ...(CURATED_SENSE_ALIASES[entry.id] || []),
    ...(CURATED_COLLISION_RULES[entry.id] || [])
  ]
  const excluded = CURATED_SENSE_EXCLUSIONS[entry.id] || new Set()
  const seen = new Set()
  return phrases.filter((phrase) => {
    if (seen.has(phrase)) return false
    seen.add(phrase)
    return !excluded.has(normalize(phrase))
  }).map((phrase) => {
    const lexical = phrase.replace(/\([^)]*\)/g, ' ')
    return {
      raw: rawTerms(lexical),
      terms: canonicalTerms(lexical),
      phrase: phraseKey(lexical)
    }
  }).filter((phrase) => phrase.terms.length > 0)
}

function curatedAgreement(entry, sense) {
  if (!sense.matchable) return null
  if (/\b(?:inhabitants? of|people of) (?:the )?(?:earth|land)\b/i.test(sense.sourceText)) return null
  const expectedPos = curatedPos(entry)
  if (sense.pos && expectedPos && sense.pos !== expectedPos) return null
  const sourceSequence = sense.raw.map(canonicalTerm)
  let best = null
  for (const phrase of curatedSensePhrases(entry)) {
    const phraseSequence = phrase.raw.map(canonicalTerm)
    const prefix = phraseSequence.every((term, index) => sourceSequence[index] === term)
    if (!prefix) continue
    const exact = phraseSequence.length === sourceSequence.length
    const surface = phrase.raw.every((term, index) => sense.raw[index] === term)
    const score = (exact ? 100 : 0) + (surface ? 20 : 10) + phrase.terms.length
    const match = { score, bridge: phrase.terms.join(' ') }
    if (!best || match.score > best.score ||
        (match.score === best.score && match.bridge.localeCompare(best.bridge) < 0)) best = match
  }
  return best
}

function selectCuratedEntry(source, sourceId, lemma, sense, curatedHeads) {
  if (source === 'strongs' && sourceId === 'H1' && sense.key === 'father') {
    const entry = LEXICON.find((item) => item.id === 'father')
    return entry ? { entry, bridge: 'father' } : null
  }
  const entries = curatedHeads.get(normalize(lemma)) || []
  if (entries.length === 0) return null
  const ranked = entries.map((entry) => ({ entry, agreement: curatedAgreement(entry, sense) }))
    .filter((item) => item.agreement)
    .sort((a, b) => b.agreement.score - a.agreement.score || a.entry.id.localeCompare(b.entry.id))
  if (ranked.length > 1 && ranked[0].agreement.score === ranked[1].agreement.score) return null
  return ranked[0] ? { entry: ranked[0].entry, bridge: ranked[0].agreement.bridge } : null
}

function curatedCandidate(entry, language, bridge) {
  const formKey = language === 'aramaic' ? 'aramaic' : language
  const form = entry.forms?.[formKey]
  if (!form) return null
  const script = form.script ||
    (form.hebrewLetters ? toImperialAramaic(form.hebrewLetters) : null) ||
    (form.tokens ? toMusnad(form.tokens) : null)
  const word = form.translit || form.hebrewLetters || form.script || script
  return [
    'curated',
    `${entry.id}:${language}`,
    word,
    script || null,
    form.translit || null,
    entry.english[0],
    bridge,
    'Reviewed curated comparison'
  ]
}

function automaticCandidate(ranked) {
  const target = ranked.target
  return [
    target.dictionaryId,
    target.entryId,
    target.word,
    target.script,
    target.translit,
    target.meaning,
    ranked.bridge,
    ranked.evidence
  ]
}

function emptySlots() {
  return TARGET_LANGUAGES.map(() => [SLOT_NONE, null, []])
}

function addCandidate(shard, tuple) {
  const key = JSON.stringify(tuple)
  const existing = shard.candidateIndex.get(key)
  if (existing != null) return existing
  const index = shard.candidates.length
  shard.candidates.push(tuple)
  shard.candidateIndex.set(key, index)
  return index
}

function slotsForSense(source, sourceId, lemma, sense, shard, targetIndex, curatedHeads) {
  if (!sense.matchable) return emptySlots()
  const curated = selectCuratedEntry(source, sourceId, lemma, sense, curatedHeads)
  if (curated) {
    return TARGET_LANGUAGES.map((language) => {
      const candidate = curatedCandidate(curated.entry, language, curated.bridge)
      return candidate
        ? [SLOT_VERIFIED, addCandidate(shard, candidate), []]
        : [SLOT_NONE, null, []]
    })
  }

  return TARGET_LANGUAGES.map((language) => {
    const selected = selectAutomaticCandidates(sense, language, targetIndex)
    if (selected.length === 0) return [SLOT_NONE, null, []]
    const indexes = selected.map((item) => addCandidate(shard, automaticCandidate(item)))
    return [SLOT_AUTOMATIC, indexes[0], indexes.slice(1, 1 + MAX_ALTERNATIVES)]
  })
}

function catalogSearch(source, id, lemma, translit, definition, senses) {
  const sourceAliases = source === 'strongs'
    ? "Strong's Strong Strong’s"
    : 'BDB Brown-Driver-Briggs Brown Driver Briggs'
  return normalize(unique([
    source,
    sourceAliases,
    id,
    lemma,
    translit,
    definition,
    ...senses.flatMap((sense) => [sense.label, ...sense.terms])
  ]).join(' '))
}

function publicSense(sense) {
  return [sense.key, sense.label, sense.sourceText, sense.matchable, sense.terms]
}

function makeCatalogEntry(sourceIndex, entry, shardId, senses) {
  const source = HEBREW_SOURCES[sourceIndex]
  const translit = entry.xlit || null
  return [
    sourceIndex,
    String(entry.id),
    entry.lemma,
    translit,
    entry.def,
    entry.pos || null,
    shardId,
    senses.map(publicSense),
    catalogSearch(source, String(entry.id), entry.lemma, translit, entry.def, senses)
  ]
}

export function buildArtifacts() {
  assertLegacyIndexHashes()
  const strongs = readJson(join(projectRoot, 'src', 'data', 'strongs.json'))
  const bdb = readJson(join(projectRoot, 'public', 'dicts', 'bdb.json'))
  if (bdb.sourceRevision !== 'b69f909233040133c03654945d7ed1a510d5ea37') {
    throw new Error(`BDB source revision is not pinned (${bdb.sourceRevision || 'missing'})`)
  }
  const hebrewStrongs = strongs.entries.filter((entry) => !/\(Aramaic\)/i.test(entry.deriv || ''))
  const hebrewBdb = bdb.entries.filter((entry) => !entry.id.startsWith('x'))
  if (hebrewStrongs.length !== 7_999 || hebrewBdb.length !== 10_993) {
    throw new Error(`Hebrew source counts changed (${hebrewStrongs.length} Strong's, ${hebrewBdb.length} BDB)`)
  }

  const targetIndex = buildTargetIndex()
  const curatedHeads = buildCuratedHeadIndex()
  const shards = Array.from({ length: SHARD_COUNT }, (_, index) => ({
    id: index.toString(16).padStart(2, '0'),
    records: {},
    candidates: [],
    candidateIndex: new Map()
  }))
  const catalogEntries = []
  let senseCount = 0

  for (const [sourceIndex, sourceEntries] of [[0, hebrewStrongs], [1, hebrewBdb]]) {
    const source = HEBREW_SOURCES[sourceIndex]
    for (const entry of sourceEntries) {
      const sourceKey = `${source}:${entry.id}`
      const shardId = fnv1aShard(sourceKey)
      const shard = shards[parseInt(shardId, 16)]
      const senses = source === 'strongs' ? strongsSenses(entry) : bdbSenses(entry)
      if (senses.length === 0) throw new Error(`${sourceKey} has no display sense`)
      shard.records[sourceKey] = senses.map((sense) =>
        slotsForSense(source, String(entry.id), entry.lemma, sense, shard, targetIndex, curatedHeads)
      )
      catalogEntries.push(makeCatalogEntry(sourceIndex, entry, shardId, senses))
      senseCount += senses.length
    }
  }

  const catalog = {
    version: 1,
    build: BUILD_ID,
    revision: BUILD_ID,
    shardCount: SHARD_COUNT,
    languages: TARGET_LANGUAGES,
    sources: HEBREW_SOURCES,
    bdbRevision: bdb.sourceRevision,
    counts: {
      catalog: catalogEntries.length,
      strongs: hebrewStrongs.length,
      bdb: hebrewBdb.length,
      senses: senseCount,
      targetSenses: targetIndex.senses.length
    },
    curatedCollisions: [...curatedHeads.entries()]
      .filter(([, entries]) => entries.length > 1)
      .map(([head, entries]) => [head, entries.map((entry) => entry.id)]),
    entries: catalogEntries
  }
  const shardDocuments = shards.map((shard) => ({
    version: 1,
    build: BUILD_ID,
    revision: BUILD_ID,
    shard: shard.id,
    id: shard.id,
    languages: TARGET_LANGUAGES,
    records: shard.records,
    candidates: shard.candidates
  }))
  const catalogJson = JSON.stringify(catalog)
  const shardJson = shardDocuments.map((shard) => JSON.stringify(shard))

  if (Buffer.byteLength(catalogJson) >= LEGACY_INDEX_LIMIT) {
    throw new Error(`catalog is ${Buffer.byteLength(catalogJson)} bytes (must be below ${LEGACY_INDEX_LIMIT})`)
  }
  shardJson.forEach((json, index) => {
    if (Buffer.byteLength(json) >= MAX_SHARD_BYTES) {
      throw new Error(`shard ${shards[index].id} is ${Buffer.byteLength(json)} bytes (must be below ${MAX_SHARD_BYTES})`)
    }
  })
  return { catalog, shardDocuments, catalogJson, shardJson }
}

function checkFile(path, expected) {
  if (!existsSync(path)) throw new Error(`missing generated artifact ${path}`)
  if (readFileSync(path, 'utf8') !== expected) throw new Error(`generated artifact is stale: ${path}`)
}

export function writeOrCheckArtifacts({ check = false } = {}) {
  const artifacts = buildArtifacts()
  if (check) {
    checkFile(outputCatalog, artifacts.catalogJson)
    for (let i = 0; i < SHARD_COUNT; i++) {
      const id = i.toString(16).padStart(2, '0')
      checkFile(join(outputShardDirectory, `${id}.json`), artifacts.shardJson[i])
    }
  } else {
    mkdirSync(outputShardDirectory, { recursive: true })
    writeFileSync(outputCatalog, artifacts.catalogJson)
    for (let i = 0; i < SHARD_COUNT; i++) {
      const id = i.toString(16).padStart(2, '0')
      writeFileSync(join(outputShardDirectory, `${id}.json`), artifacts.shardJson[i])
    }
  }
  return artifacts
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes('--check')
  const artifacts = writeOrCheckArtifacts({ check })
  const largestShard = Math.max(...artifacts.shardJson.map((json) => Buffer.byteLength(json)))
  console.log(
    `${check ? 'checked' : 'wrote'} ${artifacts.catalog.counts.catalog} Hebrew records, ` +
    `${artifacts.catalog.counts.senses} senses, 64 shards; ` +
    `catalog ${Buffer.byteLength(artifacts.catalogJson)} bytes, largest shard ${largestShard} bytes`
  )
}
