// Builds the on-demand Hebrew, Biblical-Aramaic, and explicitly unclassified
// Hebrew/Aramaic root catalog used by the
// permutation explorer. The source dictionaries are pinned, published works;
// this script selects only entries that those works explicitly classify as
// root headings, direct primitive roots, or primitive lexical bases. It never
// infers a missing root from a permutation and never admits an "unused root"
// mentioned by a derivative.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { REVIEWED_HEBREW_SOURCE_MAPPINGS } from '../src/data/reviewedHebrewSourceMappings.js'
import { foldFinals } from '../src/lib/scripts.js'

export const CATALOG_FORMAT = 'ancient-lexicon-attested-roots-v2'
export const CATALOG_FILE = 'attested-roots-2026-07-v2.json'
export const CATALOG_PAYLOAD_MARKER = 'attested-root-payload-only-2026-07-v2'
export const CATALOG_PAYLOAD_PROBE = 'attested-root-records-only-2026-07-v2'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const strongsPath = join(projectRoot, 'src', 'data', 'strongs.json')
const bdbPath = join(projectRoot, 'public', 'dicts', 'bdb.json')
const jastrowPath = join(projectRoot, 'public', 'dicts', 'jastrow.json')
const outputPath = join(projectRoot, 'public', 'dicts', CATALOG_FILE)
const HEBREW_LETTERS = /^[אבגדהוזחטיכלמנסעפצקרשת]{2,5}$/u
// Vowel marks plus shureq (וּ), whose dot is encoded with the dagesh mark.
const POINTING = /[\u05b0-\u05bb\u05c7]|\u05d5\u05bc/u
const JASTROW_HEBREW_ORIGIN_CODES = new Set(['he', 'bh', 'ar+he', 'he+ar', 'ar+bh'])
// OpenScriptures preserves these four pointed BDB verbal headwords as
// type="root" rows with direct lexical <def> glosses, but their source XML
// omits a <pos> tag. They are the complete verbal subset found in the audited
// pool of 36 otherwise-excluded Hebrew type-root rows without POS metadata;
// the remainder are letters, particles, pronouns, or other non-root lexemes.
export const BDB_VERBAL_ROOT_IDS_WITHOUT_POS = new Set([
  'h.gt.aa',
  'k.de.aa',
  'p.df.aa',
  'p.gd.aa'
])
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

export function isSourceDeclaredBdbVerb(entry) {
  if (/^vb(?:\.|\s|$)/i.test((entry.pos || '').trim())) return true
  if (
    BDB_VERBAL_ROOT_IDS_WITHOUT_POS.has(entry.id) &&
    entry.type === 'root' &&
    entry.headDefinitions?.length > 0
  ) return true

  const lemma = (entry.lemma || '').trim()
  const definition = (entry.def || '').replace(/\s+/g, ' ').trim()
  if (!lemma || !definition.startsWith(lemma)) return false

  return /^vb(?:\.|\s|$)/i.test(definition.slice(lemma.length).trimStart())
}

function isBareBdbRootHeading(entry) {
  const compact = (value) => String(value || '').replace(/[\[\]\s]/g, '')
  return entry.type === 'root' && compact(entry.def) === compact(entry.lemma)
}

function hasExplicitBdbRootSignal(entry) {
  return /(?:√\s*(?:of|assumed)|\broot\s+of\b)/i.test(entry.def || '')
}

function isNonRootBdbLexeme(entry) {
  const remainder = String(entry.def || '')
    .replace(entry.lemma || '', '')
    .replace(/^[\s[\](),.;:—-]+/, '')
  return /^(?:interrog(?:ative)?\.?\s+)?(?:adv|adj|conj|interj|n\.|noun|prep|pron|particle)\b/i.test(remainder)
}

function sourceLanguage(source, entry) {
  if (source === 'bdb') return entry.id.startsWith('x') ? 'biblical-aramaic' : 'hebrew'
  if (source === 'academy-hebrew-terms') return 'hebrew'
  if (source === 'jastrow') {
    return JASTROW_HEBREW_ORIGIN_CODES.has(entry.languageCode)
      ? 'hebrew'
      : 'hebrew-aramaic-unclassified'
  }
  return /^\(Aramaic\)/i.test((entry.deriv || '').trim())
    ? 'biblical-aramaic'
    : 'hebrew'
}

function jastrowRootLanguage(languageCode) {
  if (languageCode === 'he' || languageCode === 'bh') return 'hebrew'
  if (languageCode === 'und' || JASTROW_HEBREW_ORIGIN_CODES.has(languageCode)) {
    return 'hebrew-aramaic-unclassified'
  }
  return null
}

function jastrowRootStatementGloss(languageCode, relation) {
  const language = languageCode === 'he'
    ? 'Hebrew'
    : languageCode === 'bh'
      ? 'Biblical Hebrew'
      : 'Hebrew/Aramaic'
  const statement = relation === 'source-root' ? 'root marker' : 'root relationship'
  return `explicit ${language} ${statement} in Jastrow entry`
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
  if (source === 'jastrow') {
    const pending = [...(entry.senses || [])]
    while (pending.length > 0) {
      const sense = pending.shift()
      if (sense?.gloss) return safeGloss(sense.gloss)
      if (sense?.senses?.length) pending.unshift(...sense.senses)
    }
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

function explicitLettersCandidate(source, entry, lettersValue, options = {}) {
  const letters = rootLettersFromLemma(lettersValue)
  const word = firstHebrewWord(options.word || entry.lemma)
  if (!letters || !word) return null
  return {
    source,
    sourceId: options.sourceId || entry.id,
    sourceLanguage: options.sourceLanguage || sourceLanguage(source, entry),
    letters,
    word,
    pointed: POINTING.test(word),
    gloss: options.gloss || sourceGloss(source, entry),
    evidence: options.evidence || null,
    reviewedMapping: options.reviewedMapping || null,
    sourceHeadword: options.sourceHeadword || null,
    sourceHeadwordLanguageCode: options.sourceHeadwordLanguageCode || null
  }
}

export function extractAttestedRootCandidates(strongs, bdb, jastrow = null) {
  const candidates = []
  const strongsById = new Map(strongs.entries.map((entry) => [entry.id, entry]))
  const referencedBdbSourceIds = new Set(
    bdb.entries.flatMap((entry) => entry.lexicalRefs || [])
  )

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
    // Preserve the source's explicit type="root" classification. The source
    // also links some lexical bases without marking them as root headings;
    // admit those exact targets only when BDB itself labels them as verbs.
    // Shin/sin dots identify the consonant rather than vocalize it, so a root
    // such as BDB t.eu.aa (רשׁף) is still an unpointed root heading.
    const hasLexicalPointing = POINTING.test(entry.lemma || '')
    const explicitUnpointedRoot = !hasLexicalPointing
    const sourceDeclaredVerb = isSourceDeclaredBdbVerb(entry)
    const bareRootHeading = isBareBdbRootHeading(entry)
    const explicitRootSignal = hasExplicitBdbRootSignal(entry)
    const unattestedRootHeading =
      entry.form === 'false' && !isNonRootBdbLexeme(entry)
    const sourceRoot =
      entry.type === 'root' && (
        sourceDeclaredVerb ||
        explicitUnpointedRoot ||
        bareRootHeading ||
        explicitRootSignal ||
        unattestedRootHeading
      )
    const referencedLexicalBase =
      referencedBdbSourceIds.has(entry.id) && sourceDeclaredVerb
    if (!sourceRoot && !referencedLexicalBase) continue
    const record = candidate('bdb', entry)
    // Pointed five-consonant verb rows such as Aramaic שׁיציא are derived
    // lexical forms, not the consonantal root headings represented here.
    if (/[\u0591-\u05c7]/u.test(entry.lemma || '') && record?.letters.length > 4) continue
    if (record) candidates.push(record)
  }

  const jastrowById = new Map((jastrow?.entries || []).map((entry) => [entry.id, entry]))
  for (const entry of jastrow?.entries || []) {
    const explicitRoots = []
    const seenExplicitRoots = new Set()
    for (const root of entry.sourceRoots?.length ? entry.sourceRoots : entry.root ? [entry.root] : []) {
      const sourceLanguage = jastrowRootLanguage(root.languageCode || entry.languageCode)
      if (!root?.letters || !sourceLanguage) continue
      const key = `${sourceLanguage}:${root.letters}`
      if (seenExplicitRoots.has(key)) continue
      seenExplicitRoots.add(key)
      explicitRoots.push({ ...root, sourceLanguage })
    }
    for (const explicitRoot of explicitRoots) {
      const entrySourceLanguage = jastrowRootLanguage(entry.languageCode)
      const crossesEntryLanguage = entrySourceLanguage !== explicitRoot.sourceLanguage
      const record = explicitLettersCandidate('jastrow', entry, explicitRoot.letters, {
        sourceLanguage: explicitRoot.sourceLanguage,
        ...(crossesEntryLanguage
          ? {
              word: explicitRoot.letters,
              gloss: jastrowRootStatementGloss(
                explicitRoot.languageCode,
                explicitRoot.relation
              ),
              evidence: jastrowRootStatementGloss(
                explicitRoot.languageCode,
                explicitRoot.relation
              ),
              sourceHeadword: entry.lemma,
              sourceHeadwordLanguageCode: entry.languageCode
            }
          : {
              evidence: explicitRoot.relation === 'exact-target-root'
                ? 'exact linked Jastrow root relation'
                : 'explicit Jastrow root statement'
            })
      })
      if (record) candidates.push(record)
    }
  }

  for (const mapping of REVIEWED_HEBREW_SOURCE_MAPPINGS) {
    if (mapping.dictionaryId !== 'jastrow' || !mapping.root?.letters) continue
    const entry = jastrowById.get(mapping.entryId)
    if (!entry) continue
    const academyEvidence = mapping.root.evidence?.find(
      (evidence) => evidence.source === 'Academy of the Hebrew Language terminology database'
    )
    const reviewedGloss = (entry.senses || [])
      .flatMap((sense) => [sense, ...(sense.senses || [])])
      .map((sense) => sense.gloss)
      .find((gloss) => /\bstir\b/i.test(gloss || ''))
    const record = explicitLettersCandidate(
      'academy-hebrew-terms',
      entry,
      mapping.root.letters,
      {
        sourceId: academyEvidence?.sourceId || mapping.entryId,
        gloss: reviewedGloss ? safeGloss(reviewedGloss) : sourceGloss('jastrow', entry),
        evidence: 'reviewed Jastrow and Academy mapping',
        reviewedMapping: mapping.root
      }
    )
    if (record) candidates.push(record)
  }

  return candidates.sort((a, b) =>
    compareText(a.letters.join(''), b.letters.join('')) ||
    compareText(a.source, b.source) ||
    compareText(a.sourceId, b.sourceId)
  )
}

function rootId(language, letters) {
  const prefix = language === 'biblical-aramaic'
    ? 'arc'
    : language === 'hebrew-aramaic-unclassified'
      ? 'und'
      : 'he'
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
      evidence: record.evidence || 'published lexicon headword'
    })
  }
  return attestations
}

export function buildAttestedRootCatalog(strongs, bdb, jastrow = null) {
  const candidates = extractAttestedRootCandidates(strongs, bdb, jastrow)
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
      headword: record.sourceHeadword || record.word,
      ...(record.sourceHeadwordLanguageCode
        ? { headwordLanguageCode: record.sourceHeadwordLanguageCode }
        : {})
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
    const reviewedMapping = records.find((record) => record.reviewedMapping)?.reviewedMapping
    if (reviewedMapping) root.reviewedMapping = reviewedMapping

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
      "BDB type-root headings explicitly labeled as verbs or preserved as unpointed root headings, exact targets of BDB lexical references when the source labels them as verbs, direct Strong's primitive roots, Strong's primitive lexical bases, Biblical-Aramaic Strong's records corresponding to those roots, and relation-valid Jastrow source root markers. Jastrow rows without a printed origin marker remain a separate Hebrew/Aramaic-unclassified language instead of being relabeled Hebrew; comparison-only root mentions are excluded. Jastrow's direct root inventory is preserved in source data, while every marker outside the 2-5-radical root model is counted in the attached audited root-marker metadata and excluded from catalog roots. Separately labeled reviewed mappings combine a published headword with named modern Hebrew terminology evidence. The hand-curated database supplies reviewed roots and attestations.",
    sources: [
      { id: 'strongs', work: strongs.work, count: strongs.count },
      {
        id: 'bdb',
        work: bdb.work,
        count: bdb.count,
        sourceRevision: bdb.sourceRevision
      },
      {
        id: 'jastrow',
        work: jastrow?.work,
        count: jastrow?.count || 0,
        sourceRevision: jastrow?.sourceRevision,
        rootMarkerCounts: jastrow?.explicitRootCounts
      },
      {
        id: 'academy-hebrew-terms',
        work: 'Academy of the Hebrew Language terminology database',
        count: REVIEWED_HEBREW_SOURCE_MAPPINGS.filter(
          (mapping) => mapping.root?.evidence?.some(
            (evidence) => evidence.source === 'Academy of the Hebrew Language terminology database'
          )
        ).length
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
  const jastrow = JSON.parse(readFileSync(jastrowPath, 'utf8'))
  return buildAttestedRootCatalog(strongs, bdb, jastrow)
}

function main() {
  const expected = serializeAttestedRootCatalog(buildFromRepository())
  const checkOnly = process.argv.includes('--check')

  if (checkOnly) {
    const actual = existsSync(outputPath)
      ? readFileSync(outputPath, 'utf8').replace(/\r\n?/g, '\n')
      : null
    if (actual !== expected) {
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
