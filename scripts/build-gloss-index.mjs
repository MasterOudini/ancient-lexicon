// Builds the compact English-meaning bridge used by Dictionary > By meaning.
//
// Every reference dictionary is keyed in its own ancient language. English
// glosses are the only shared field, so this script extracts conservative
// leading sense words and writes an inverted index. The browser can then do:
//   English query -> English sense keyword -> all language postings
//   Hebrew/translit query -> Hebrew/Aramaic headword -> English keywords
//                           -> all language postings
//
// The generated artifact uses normalized record/sense tables and numeric
// posting references instead of repeating {d,i,l,g,lang} under every keyword.
// The browser expands them to that logical posting shape. This keeps the file
// substantially smaller while preserving a true keyword-to-postings index and
// a matched short gloss for every indexed sense.
//
// Usage: node scripts/build-gloss-index.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { LEXICON } from '../src/data/lexicon.js'
import { REFERENCE_DICTIONARIES } from '../src/data/referenceDictionaries.js'
import { REVIEWED_HEBREW_SOURCE_MAPPINGS } from '../src/data/reviewedHebrewSourceMappings.js'
import { englishKeywords } from '../src/lib/glossSearch.js'
import { normalize } from '../src/lib/search.js'

const POSTING_CAP_PER_LANGUAGE = 40
const MAX_DISPLAY_GLOSS = 96
const MAX_STRONGS_EXACT_FALLBACK = 48
const HEBREW_CATALOG_SOURCES = new Set(['strongs', 'bdb'])
const HEBREW_SCRIPT_MEANING_LANGUAGES = new Set([
  'Hebrew',
  'Aramaic',
  'Hebrew/Aramaic (unclassified)'
])
const REVIEWED_HEBREW_ENTRY_MAPPINGS = new Map(
  REVIEWED_HEBREW_SOURCE_MAPPINGS.map(
    (mapping) => [`${mapping.dictionaryId}\u0000${mapping.entryId}`, mapping]
  )
)
const REVIEWED_HEBREW_ENTRY_KEYS = new Set(REVIEWED_HEBREW_ENTRY_MAPPINGS.keys())
const STRONGS_GENERIC_FALLBACK_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'by', 'for',
  'from', 'as', 'with', 'without', 'into', 'onto', 'out', 'up', 'down', 'over',
  'under', 'above', 'below', 'off', 'about', 'against', 'between', 'among',
  'through', 'during', 'before', 'after', 'per', 'via', 'upon', 'etc'
])
// KJV's bracketed idiom renderings are contextual by default. Keep only
// individually reviewed cases that still name the entry's lexical concept.
const STRONGS_AUDITED_IDIOM_GUIDES = new Map([
  ['H1', new Set(['patrimony'])]
])
const POS_PARENTHETICAL = /\s*\((?:[A-Z][A-Z/.-]{0,10}|adj|adv|n|v|vb|subst|pron|prep|conj)\.?\)/g
const HEBREW = /[\u0590-\u05ff]+/g
const SOURCE_QUALIFIERS = /\b(?:properly|literally|figuratively|specifically|concretely|causatively|collectively|by implication|by extension|especially|usually|perhaps|compare)\b[,:]?/gi
const MORPHOLOGY = /\b(?:n\.?m|n\.?f|n\.?pr|vb|v|adj|adv|qal|niph|hiph|hoph|piel|pual|hith|pe|pa|aph|pf|impf|inf|pt|cstr|const|abs)\.?\b/gi
const UNKNOWN = /^(?:\[?(?:noun|verb|unknown(?: meaning)?)\]?|\?+)$/i
const LEGACY_CROSS_REFERENCE = /^(?:id|v|q\.?\s*v|see)\.?\b/i
const WIKTIONARY_META_REFERENCE = /^(?:(?:(?:[a-z-]+-)?state\s+form|(?:alternative|alternate|obsolete|archaic|inflected|inflectional|plural|singular|comparative|superlative)\s+(?:form|spelling)|inflection)\s+of\b|(?:source-listed\s+)?(?:(?:first|second|third)[-\s]person|masculine|feminine|oblique|singular|dual|plural)\b[^;:]*\bform(?:\s+of\b|$))/i
const WIKTIONARY_SENSE_BOUNDARY = /[;:]/
const LEGACY_NOISE = new Set([
  'ab', 'af', 'appar', 'ar', 'arab', 'arabic', 'aram', 'assyr', 'au', 'benj',
  'cant', 'ch', 'coll', 'constr', 'contr', 'contrad', 'corresp', 'corr', 'ct',
  'deut', 'dl', 'dn', 'dr', 'dt', 'dub', 'ed', 'esp', 'est', 'esth', 'et',
  'eth', 'ethiopic', 'ex', 'ez', 'ezr', 'fig', 'foll', 'foregoing', 'gn', 'hag', 'hif',
  'hithp', 'hull', 'ib', 'id', 'isr', 'jb', 'je', 'jos', 'ju', 'koh', 'kt',
  'lam', 'lev', 'lv', 'midr', 'mng', 'ne', 'nh', 'nu', 'num', 'opp', 'perh',
  'pers', 'pfl', 'pi', 'pl', 'po', 'pr', 'prob', 'pron', 'prop', 'pu', 'qr',
  'quot', 'reduplic', 'ref', 'sabb', 'saf', 'sec', 'sf', 'sifre', 'snh', 'sub',
  'syr', 'syriac', 'tanh', 'targ', 'thes', 'tosef', 'transpos', 'trnsf', 'usu',
  'wds', 'whence', 'yalk', 'ylamd'
])

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')

function readDictionary(dict) {
  const path = dict.source.kind === 'strongs'
    ? join(projectRoot, 'src', 'data', 'strongs.json')
    : join(projectRoot, 'public', dict.source.url)
  return JSON.parse(readFileSync(path, 'utf8'))
}

function entryLanguage(dict, entry) {
  if (dict.id === 'strongs' && /\(Aramaic\)/i.test(entry.deriv || '')) return 'Aramaic'
  if (dict.id === 'bdb' && entry.id.startsWith('x')) return 'Aramaic'
  if (dict.id === 'jastrow') {
    if (entry.languageCode === 'ab') return null
    if (REVIEWED_HEBREW_ENTRY_KEYS.has(`${dict.id}\u0000${entry.id}`)) return 'Hebrew'
    if (entry.languageCode === 'und') return 'Hebrew/Aramaic (unclassified)'
    // Printed mixed-origin markers retain their exact label in jastrow.json;
    // the English bridge groups them under the printed first-named language.
    return /^(?:ar|ar\+)/.test(entry.languageCode || '') ? 'Aramaic' : 'Hebrew'
  }
  return dict.language
}

function entryLangCode(dict, entry, language) {
  if (
    dict.id === 'jastrow' &&
    language === 'Hebrew' &&
    REVIEWED_HEBREW_ENTRY_KEYS.has(`${dict.id}\u0000${entry.id}`)
  ) {
    return 'he'
  }
  return entry.lang || dict.lang
}

function cleanSenseText(dictId, entry, sourceText = entry.def) {
  let text = String(sourceText || '')
    .replace(POS_PARENTHETICAL, '')
    .replace(/[{}\[\]]/g, '')
    .replace(SOURCE_QUALIFIERS, ' ')

  if (dictId.endsWith('-wiktionary')) {
    text = text
      // Treat a colon like a sense boundary so "inflection of X: we" keeps
      // the lexical sense while discarding only its morphology label.
      .split(WIKTIONARY_SENSE_BOUNDARY)
      .filter((segment) => !WIKTIONARY_META_REFERENCE.test(segment.trim()))
      .join('; ')
  }

  if (dictId === 'bdb' || dictId === 'jastrow') {
    text = text
      .replace(HEBREW, ' ')
      .replace(/\b\d+(?::\d+)?\b/g, ' ')
      .replace(MORPHOLOGY, ' ')
    if (dictId === 'jastrow') {
      // Each Jastrow source sense is handled independently below. Within a
      // sense, stop before its first citation rather than truncating the whole
      // entry (which used to discard later published senses).
      text = text.split(/\.\s+(?=(?:[A-Z][a-z]{0,12}\.?|[A-Z]\.)\s)/)[0]
    }
    // These historical dictionaries become citation-heavy very quickly.
    text = text.slice(0, dictId === 'bdb' ? 220 : 240)
  }

  return text.replace(/\s+/g, ' ').replace(/^[\s,;:.\-\u2014]+/, '').trim()
}

function jastrowSenseTexts(senses, output = []) {
  for (const sense of senses || []) {
    // Prefer the source's leading italic lexical gloss. Fall back to the full
    // sense only when that compact source field is absent.
    if (sense.gloss || sense.def) output.push(sense.gloss || sense.def)
    if (sense.senses) jastrowSenseTexts(sense.senses, output)
  }
  return output
}

function shortGloss(text) {
  if (text.length <= MAX_DISPLAY_GLOSS) return text
  const cut = text.slice(0, MAX_DISPLAY_GLOSS + 1)
  const boundary = cut.lastIndexOf(' ')
  return (boundary > 72 ? cut.slice(0, boundary) : cut.slice(0, MAX_DISPLAY_GLOSS)).trim() + '\u2026'
}

function shortRawGloss(value) {
  return shortGloss(String(value || '').replace(/\s+/g, ' ').trim())
}

function strongsFallbackSense(entry, text) {
  const words = normalize(text).match(/[a-z]+(?:-[a-z]+)*/g) || []
  const contentWords = [...new Set(words.flatMap((word) => word.split('-')))]
    .filter((word) => !STRONGS_GENERIC_FALLBACK_WORDS.has(word))
  const keywords = text.length <= MAX_STRONGS_EXACT_FALLBACK &&
      !UNKNOWN.test(text) &&
      contentWords.length === 1 &&
      contentWords[0].length >= 2
    ? contentWords
    : []
  return {
    display: shortGloss(text || shortRawGloss(entry.def)),
    keywords,
    guide: new Set(keywords),
    exact: new Set(keywords)
  }
}

function strongsKjvSenses(entry) {
  const beforeCompare = String(entry.kjv || '').split(/\bCompare\b/i)[0]
  const senses = []
  for (const rawSegment of beforeCompare.split(/[,;]/)) {
    const idiom = /^\s*\[idiom\]\s*/i.test(rawSegment)
    const segment = rawSegment
      .trim()
      .replace(/^\[idiom\]\s*/i, '')
      .replace(/\.\s*$/, '')
      .trim()
    if (idiom && !STRONGS_AUDITED_IDIOM_GUIDES.get(String(entry.id))?.has(normalize(segment))) {
      continue
    }
    // Other bracketed phrase renderings are contextual English, not senses.
    if (!segment || /[\[\]()\d]/.test(segment)) continue
    if (!/^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/.test(segment)) continue
    const keywords = englishKeywords(segment)
      .filter((word) => !STRONGS_GENERIC_FALLBACK_WORDS.has(word))
    if (keywords.length === 0) continue
    senses.push({
      display: shortGloss(segment),
      keywords,
      guide: new Set(keywords),
      exact: new Set(keywords.length === 1 ? keywords : [])
    })
  }
  return senses
}

function sensesFor(dictId, entry) {
  const sourceTexts = dictId === 'jastrow' && entry.senses?.length
    ? jastrowSenseTexts(entry.senses)
    : [entry.def]
  const texts = sourceTexts
    .map((sourceText) => cleanSenseText(dictId, entry, sourceText))
    .filter((text) => text && (dictId === 'strongs' || !UNKNOWN.test(text)))
    .filter((text) => !(
      (dictId === 'bdb' || dictId === 'jastrow') && LEGACY_CROSS_REFERENCE.test(text)
    ))
  if (dictId !== 'strongs' && texts.length === 0) return null

  const senses = []
  const properName = dictId === 'bdb' && /n\.?pr/i.test(entry.pos || '')
  // Semicolons delimit published senses in the compact Egyptian, Sumerian,
  // and Akkadian guides and in the leading spans retained from the historical
  // lexicons. Commas usually join synonyms or descriptive prose, so treating
  // them as sense boundaries would promote incidental words ("father of",
  // "name of two Israelites") into false guide meanings.
  for (const text of texts) {
    const segments = text.split(/[;\u2014]/)
    for (const rawSegment of segments) {
      const segment = rawSegment.replace(/^[\s,;:.\-]+/, '').trim()
      const words = englishKeywords(segment).filter(
        (word) => (dictId !== 'bdb' && dictId !== 'jastrow') || !LEGACY_NOISE.has(word)
      )
      if (words.length === 0) continue
      const strongsProperName = dictId === 'strongs' && /\bname of\b/i.test(segment)
      const jastrowProperName = dictId === 'jastrow' &&
        /^(?:the\s+)?(?:father|mother|son|daughter|brother|sister|wife|husband)\s+of\b/i.test(segment)
      const sourceProperName = properName || strongsProperName || jastrowProperName
      const guide = new Set(
        sourceProperName ? [] : dictId === 'strongs' ? words : [words[0]]
      )
      const exact = new Set(!sourceProperName && words.length === 1 ? [words[0]] : [])
      senses.push({
        display: shortGloss(segment),
        keywords: [...new Set(words)],
        guide,
        exact
      })
    }
  }
  if (dictId === 'strongs') {
    if (senses.length === 0) senses.push(strongsFallbackSense(entry, texts[0] || ''))
    const seenDisplays = new Set(senses.map((sense) => normalize(sense.display)))
    for (const sense of strongsKjvSenses(entry)) {
      const display = normalize(sense.display)
      if (!seenDisplays.has(display)) {
        senses.push(sense)
        seenDisplays.add(display)
      }
    }
  }
  return senses.length > 0 ? senses : null
}

function skipAutomaticMeaning(dict, entry) {
  if (!dict.id.endsWith('-wiktionary')) return false
  if (/^(?:letter|symbol)$/i.test(entry.pos || '')) return true
  const useful = String(entry.def || '')
    .split(WIKTIONARY_SENSE_BOUNDARY)
    .some((segment) => segment.trim() && !WIKTIONARY_META_REFERENCE.test(segment.trim()))
  return !useful
}

function headAliases(value) {
  if (!value) return []
  const raw = String(value).trim()
  const variants = new Set([raw])
  variants.add(
    raw
      .replace(/^\*+/, '')
      .replace(/(?:\s+(?:[IVX]+|[\u00b2\u00b3\u00b9\u2070-\u2079]+))+$/i, '')
      .replace(/[\-\u05be]+$/, '')
      .trim()
  )
  return [...variants].map(normalize).filter(Boolean)
}

const sourceIds = ['curated', ...REFERENCE_DICTIONARIES.map((dict) => dict.id)]
const languageNames = [
  'Comparative',
  'Hebrew',
  'Aramaic',
  'Hebrew/Aramaic (unclassified)',
  'Egyptian',
  'Sumerian',
  'Akkadian',
  'Hittite',
  'Old South Arabian'
]
const sourceCode = new Map(sourceIds.map((id, i) => [id, i]))
const languageCode = new Map(languageNames.map((name, i) => [name, i]))
const candidates = []
const headKeysByCandidate = []
const hebrewUnindexed = []
const coverage = {}

function addCandidate({ dictId, id, lemma, language, langCode, translit, script, variety, senses, heads, forms = [] }) {
  const index = candidates.length
  candidates.push({ dictId, id, lemma, language, langCode, translit, script, variety, senses, forms })
  headKeysByCandidate[index] = [...new Set(heads.flatMap(headAliases))]
}

for (const entry of LEXICON) {
  const senses = entry.english.map((sense) => {
    const keywords = englishKeywords(sense)
    return {
      display: shortGloss(sense),
      keywords,
      guide: new Set(keywords[0] ? [keywords[0]] : []),
      exact: new Set(keywords.length === 1 ? keywords : [])
    }
  }).filter((sense) => sense.keywords.length > 0)
  if (senses.length === 0) continue
  const heads = [entry.hebrew.word, entry.hebrew.translit]
  const aramaic = entry.forms?.aramaic
  if (aramaic) heads.push(aramaic.hebrewLetters, aramaic.translit)
  addCandidate({
    dictId: 'curated',
    id: entry.id,
    lemma: entry.hebrew.word,
    language: 'Comparative',
    translit: entry.hebrew.translit,
    senses,
    heads
  })
}
coverage.curated = { sourceEntries: LEXICON.length, indexedEntries: LEXICON.length }

for (const dict of REFERENCE_DICTIONARIES) {
  const data = readDictionary(dict)
  let skippedNoEnglish = 0
  let skippedMeta = 0
  let skippedOutsideLanguageScope = 0
  let indexedEntries = 0
  for (const entry of data.entries) {
    const language = entryLanguage(dict, entry)
    if (!language) {
      skippedOutsideLanguageScope++
      continue
    }
    // In the Egyptian import, `def` is English only when `de` is also
    // present; otherwise `def` contains the German fallback. German-only
    // records are deliberately skipped rather than mislabeled as English.
    if (dict.id === 'egyptian' && !entry.de) {
      skippedNoEnglish++
      continue
    }
    // Letter-name records and bare "form of" cross-references are useful in
    // dictionary browsing but do not supply an independent lexical meaning.
    // Feeding their boilerplate into the bridge would make searches such as
    // "letter" or "abjad" look like cross-language sense matches.
    if (skipAutomaticMeaning(dict, entry)) {
      skippedMeta++
      continue
    }
    const senses = sensesFor(dict.id, entry)
    if (!senses) {
      if (HEBREW_CATALOG_SOURCES.has(dict.id) && language === 'Hebrew') {
        const unindexed = [
          sourceCode.get(dict.id),
          entry.id,
          entry.lemma,
          shortRawGloss(entry.def)
        ]
        if (entry.xlit) unindexed[4] = entry.xlit
        hebrewUnindexed.push(unindexed)
      }
      continue
    }
    indexedEntries++
    const reviewedMapping = REVIEWED_HEBREW_ENTRY_MAPPINGS.get(`${dict.id}\u0000${entry.id}`)
    const heads = HEBREW_SCRIPT_MEANING_LANGUAGES.has(language)
      ? [
          entry.lemma,
          entry.xlit,
          entry.pron,
          ...(entry.aliases || []),
          ...(reviewedMapping?.aliases || []),
          ...(entry.forms || []).map((form) => form.word)
        ]
      : []
    addCandidate({
      dictId: dict.id,
      id: entry.id,
      lemma: entry.lemma,
      language,
      langCode: entryLangCode(dict, entry, language),
      translit: reviewedMapping?.displayTransliteration || entry.xlit,
      script: dict.fields.script ? entry[dict.fields.script] : undefined,
      variety: entry.variety,
      senses,
      heads,
      forms: (entry.forms || []).map((form) => form.word)
    })
  }
  coverage[dict.id] = {
    sourceEntries: data.entries.length,
    indexedEntries,
    skippedNoEnglish,
    skippedMeta,
    skippedOutsideLanguageScope
  }
}

const candidatesByKeyword = new Map()
const senses = []
const primarySenseIds = []
for (let recordId = 0; recordId < candidates.length; recordId++) {
  const candidate = candidates[recordId]
  primarySenseIds[recordId] = senses.length
  for (const sense of candidate.senses) {
    const senseId = senses.length
    senses.push([recordId, sense.display])
    for (const keyword of sense.keywords) {
      const byRecord = candidatesByKeyword.get(keyword) || new Map()
      const match = {
        recordId,
        senseId,
        rank: sense.exact.has(keyword) ? 2 : sense.guide.has(keyword) ? 1 : 0,
        glossLength: sense.display.length
      }
      const previous = byRecord.get(recordId)
      if (!previous || match.rank > previous.rank ||
          (match.rank === previous.rank && match.glossLength < previous.glossLength)) {
        byRecord.set(recordId, match)
      }
      candidatesByKeyword.set(keyword, byRecord)
    }
  }
}
const allKeywords = [...candidatesByKeyword.keys()].sort()
const termId = new Map(allKeywords.map((keyword, i) => [keyword, i]))
const records = candidates.map((candidate, recordId) => {
  const guideKeywords = new Set(candidate.senses.flatMap((sense) => [...sense.guide]))
  const record = [
    sourceCode.get(candidate.dictId),
    candidate.id,
    candidate.lemma,
    primarySenseIds[recordId],
    languageCode.get(candidate.language),
    [...guideKeywords].map((keyword) => termId.get(keyword)).sort((a, b) => a - b)
  ]
  if (candidate.translit || candidate.script) record[6] = candidate.translit || null
  if (candidate.script) record[7] = candidate.script
  if (candidate.variety) record[8] = candidate.variety
  if (candidate.langCode) record[9] = candidate.langCode
  if (candidate.forms.length > 0) record[10] = candidate.forms
  return record
})
const hebrewRecordIds = candidates.flatMap((candidate, recordId) =>
  HEBREW_CATALOG_SOURCES.has(candidate.dictId) && candidate.language === 'Hebrew'
    ? [recordId]
    : []
)
const hebrewSpellingRecordIds = candidates.flatMap((candidate, recordId) =>
  HEBREW_SCRIPT_MEANING_LANGUAGES.has(candidate.language) ? [recordId] : []
)

const keywords = {}
const truncated = {}
let droppedTotal = 0
for (const keyword of allKeywords) {
  const byLanguage = new Map()
  for (const match of candidatesByKeyword.get(keyword).values()) {
    const candidate = candidates[match.recordId]
    const list = byLanguage.get(candidate.language) || []
    list.push({
      ...match,
      curated: candidate.dictId === 'curated'
    })
    byLanguage.set(candidate.language, list)
  }

  const encoded = []
  for (const [language, list] of byLanguage) {
    list.sort((a, b) =>
      Number(b.curated) - Number(a.curated) ||
      b.rank - a.rank ||
      a.glossLength - b.glossLength ||
      a.recordId - b.recordId
    )
    const kept = language === 'Comparative' || language === 'Hebrew'
      ? list
      : list.slice(0, POSTING_CAP_PER_LANGUAGE)
    encoded.push(...kept.map((item) => item.senseId * 3 + item.rank))
    const dropped = list.length - kept.length
    if (dropped > 0) {
      truncated[keyword] ||= {}
      truncated[keyword][language] = dropped
      droppedTotal += dropped
      console.warn(`cap ${keyword} / ${language}: dropped ${dropped} posting(s)`)
    }
  }
  keywords[keyword] = encoded
}

const heads = {}
for (let recordId = 0; recordId < headKeysByCandidate.length; recordId++) {
  for (const head of headKeysByCandidate[recordId]) {
    heads[head] ||= []
    heads[head].push(recordId)
  }
}
for (const values of Object.values(heads)) values.sort((a, b) => a - b)

const output = {
  version: 2,
  capPerLanguage: POSTING_CAP_PER_LANGUAGE,
  sources: sourceIds,
  languages: languageNames,
  records,
  senses,
  keywords,
  heads,
  hebrew: {
    recordIds: hebrewRecordIds,
    spellingRecordIds: hebrewSpellingRecordIds,
    unindexed: hebrewUnindexed
  },
  truncated,
  coverage
}

// Do not overwrite the established gloss-index.json URL in this release.
// Older installed iOS bundles can remain alive while a new service worker
// activates, so the expanded source table ships at a versioned URL that only
// the matching application bundle requests.
const outputFilename = 'gloss-index-2026-07-v2.json'
const destination = join(projectRoot, 'public', 'dicts', outputFilename)
const json = JSON.stringify(output)
writeFileSync(destination, json)
const mib = Buffer.byteLength(json) / (1024 * 1024)
console.log(`wrote ${destination}: ${records.length} records, ${senses.length} senses, ${allKeywords.length} keywords, ${mib.toFixed(2)} MiB`)
console.log(`posting cap dropped ${droppedTotal} candidate match(es); counts are recorded in ${outputFilename}`)
