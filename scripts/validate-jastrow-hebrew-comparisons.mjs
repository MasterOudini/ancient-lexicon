import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ROOTS, rootKey } from '../src/data/roots.js'
import { getDictionary } from '../src/data/referenceDictionaries.js'
import {
  findAttestedRootExact,
  mergeAttestedRootCatalog
} from '../src/lib/attestedRootCatalog.js'
import { MEANING_LANGUAGE_ORDER, searchGlossIndex } from '../src/lib/glossSearch.js'
import {
  HEBREW_CATALOG_MATCH_TIER,
  decodeHebrewCatalog,
  getHebrewCatalogMatchTier,
  mergeHebrewCatalogs,
  resolveHebrewComparison,
  searchHebrewCatalog,
  selectAutoOpenSourceKey
} from '../src/lib/hebrewComparisonLoader.js'
import { hebrewConsonantSearchKeys } from '../src/lib/hebrewSearchSpelling.js'
import { normalize } from '../src/lib/search.js'
import {
  EXPECTED_HEBREW_SEARCH_COUNT,
  EXPECTED_JASTROW_COUNT,
  JASTROW_BUILD_ID,
  JASTROW_CATALOG_FILE,
  JASTROW_SHARD_COUNT,
  JASTROW_SHARD_DIRECTORY,
  JASTROW_SOURCE_REVISION,
  isHebrewSearchableJastrowEntry
} from './build-jastrow-hebrew-comparisons.mjs'
import { extractAttestedRootCandidates } from './build-attested-roots.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(here, '..')
const dicts = join(projectRoot, 'public', 'dicts')
const HEBREW_ORIGIN_CODES = new Set(['he', 'bh', 'ar+he', 'he+ar', 'ar+bh'])
const SOURCE_LANGUAGE_COUNTS = {
  und: 26_670,
  bh: 2_627,
  'ar+he': 219,
  ar: 2_891,
  he: 84,
  ab: 16,
  'he+ar': 3,
  'ar+bh': 2
}
const SOURCE_ROOT_COUNTS = {
  entriesWithPrintedMarkers: 216,
  printedMarkers: 223,
  languageInfoPrintedMarkers: 101,
  sensePrintedMarkers: 122,
  expandedAlternatives: 22,
  relationValidDirectRoots: 337,
  comparisonOnlyRoots: 6,
  printedComparisonOnlyRoots: 5,
  reviewedStemComparisonRoots: 1,
  secondaryRootMappings: 65,
  entriesWithSourceRoots: 344,
  sourceRootAssignments: 384,
  exactTargetAssignments: 48,
  directRootUsageAssignments: 30,
  rootInLexemeAssignments: 1,
  stemDeclarationAssignments: 2,
  outOfModelDirectRoots: 3
}
const ROOT_MODEL = /^[\u05d0-\u05ea]{2,5}$/u
const SELECTED_RELATION_CODES = new Set(['und', ...HEBREW_ORIGIN_CODES])
const RELATION_OCCURRENCE_DIGEST = '1d56ed403616f69022cc64683cb363ba744c21a46aad6b3198bcf1e3e29a0bc3'
const STEM = '(?:Af|Afel|Aph|Pa|Parel|Pales|Palel|Palp|Palez|Peal|Pi|Pilp|Saf|Shaf|Shafel|Taf|Tafel|Ispe|Ispa|Isp|Ithpe|Ithpa|Ithp|Dithpe|Dispe|Difel|Nif|Hif|Hof)\\.?'
// This is intentionally an independent finite-inventory oracle rather than an
// import from import-jastrow.mjs: a parser change must not silently change both
// production output and its validator in lockstep.
const RELATION_FAMILIES = [
  ['secondary-root', /\bsec\.?\s+r\.?\s+of\b/gi],
  ['secondary-verb', /\bsec\.?\s+verb\s+of\b/gi],
  ['root-usage', /\b(?:use|occurrence)\s+of\s+(?:the\s+)?(?:root|stem)\s+[\u0590-\u05ff]/giu],
  ['root-in-lexeme', /\broot\s+in\b(?=\s+[\u0590-\u05ff])/giu],
  ['stem-declaration', /\(\s*stem\b(?=\s+[\u0590-\u05ff])/giu],
  ['verbal-stem', new RegExp(`\\b${STEM}(?:\\s+(?:noun|denom\\.))?\\s+of\\b`, 'gi')],
  ['participle', new RegExp(`\\b(?:part\\.|participle)(?:\\s+(?:pass\\.|f\\.|${STEM}))?\\s+of\\b`, 'gi')],
  ['infinitive', new RegExp(`\\b(?:inf\\.|infin\\.|infinitive)(?:\\s+${STEM})?\\s+of\\b`, 'gi')],
  ['imperative', /\b(?:imper\.|imperat\.|imperative|Imp\.)(?:\s+[A-Za-z.]+)?\s+of\b/gi],
  ['denominative', /\b(?:a\s+|as\s+a\s+|prob\.\s+a\s+|feigned\s+|jocular\s+|apparently\s+a\s+fictitious\s+)?(?:denom\.|denomin\.|denominative)\s+of\b/gi],
  ['derivational', /\b(?:deriv\.|derived)\s+of\b/gi],
  ['reduplication', /\b(?:reduplic\.|redupl\.)\s+of\b/gi],
  ['transposition', /\b(?:transpos\.|transp\.)\s+of\b/gi],
  ['inflection', /\b(?:pl\.|plur\.|fem\.|constr\.|pl\.\s+constr\.|part\.\s+f\.)\s+of\b/gi],
  ['orthographic-variant', /\b(?:(?:prob\.|perh\.|a|an|popular|hellenized|jocular|corruptions?)\s+)*(?:contr\.|contract\.|abbrev\.|abbr\.|apocop\.|apocope|corrupt\.|corruption|variant|Var\.|dimin\.|diminut\.|enlarg\.|enlargement|comp\.|compound|substitute|transl\.|rendit\.|rendition|form)\s+of\b/gi],
  ['comparison-prose', /\b(?:cmp\.|corresp\.|compare)\s+(?:the\s+)?(?:meanings?\s+)?of\b/gi],
  ['root-hypothesis', /\b(?:prob\.\s+fr\.|fr\.|from|as\s+if\s+from|derivative\s+of)\s+(?:a\s+|the\s+)?root\s+[\u0590-\u05ff]/giu],
  ['conjectural-stem-derivation', /\bseems\s+to\s+be\s+a\s+derivative\s+of\s+a\s+stem\b(?=\s+[\u0590-\u05ff])/giu]
]
const RELATION_EXPECTATIONS = {
  'secondary-root': { occurrences: 72, entries: 71, outcomes: { 'direct-root': 68, 'explicit-exclusion': 4 } },
  'secondary-verb': { occurrences: 4, entries: 4, outcomes: { 'explicit-exclusion': 4 } },
  'root-usage': { occurrences: 31, entries: 30, outcomes: { 'direct-root': 31 } },
  'root-in-lexeme': { occurrences: 1, entries: 1, outcomes: { 'direct-root': 1 } },
  'stem-declaration': { occurrences: 1, entries: 1, outcomes: { 'direct-root': 1 } },
  'verbal-stem': { occurrences: 302, entries: 300, outcomes: { 'explicit-exclusion': 287, 'exact-target': 15 } },
  participle: { occurrences: 105, entries: 99, outcomes: { 'explicit-exclusion': 97, 'exact-target': 8 } },
  infinitive: { occurrences: 40, entries: 40, outcomes: { 'explicit-exclusion': 40 } },
  imperative: { occurrences: 27, entries: 27, outcomes: { 'explicit-exclusion': 26, 'exact-target': 1 } },
  denominative: { occurrences: 622, entries: 594, outcomes: { 'explicit-exclusion': 616, 'exact-target': 6 } },
  derivational: { occurrences: 12, entries: 12, outcomes: { 'exact-target': 1, 'explicit-exclusion': 11 } },
  reduplication: { occurrences: 82, entries: 82, outcomes: { 'explicit-exclusion': 82 } },
  transposition: { occurrences: 71, entries: 70, outcomes: { 'explicit-exclusion': 68, 'exact-target': 3 } },
  inflection: { occurrences: 178, entries: 174, outcomes: { 'explicit-exclusion': 174, 'exact-target': 4 } },
  'orthographic-variant': { occurrences: 503, entries: 487, outcomes: { 'explicit-exclusion': 503 } },
  'comparison-prose': { occurrences: 17, entries: 17, outcomes: { comparison: 17 } },
  'root-hypothesis': { occurrences: 2, entries: 2, outcomes: { 'manual-review': 2 } },
  'conjectural-stem-derivation': { occurrences: 1, entries: 1, outcomes: { 'manual-review': 1 } }
}

function json(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function check(condition, message, detail = '') {
  if (!condition) throw new Error(`${message}${detail ? `: ${detail}` : ''}`)
}

function sameJson(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function jastrowRootLanguage(languageCode) {
  return languageCode === 'he' || languageCode === 'bh'
    ? 'hebrew'
    : languageCode === 'und' || HEBREW_ORIGIN_CODES.has(languageCode)
      ? 'hebrew-aramaic-unclassified'
      : null
}

function rootReferenceSummary(entry) {
  return (entry?.rootReferences || []).map(
    (reference) => `${reference.language}:${rootKey(reference.letters)}`
  )
}

function hasSource(root, sourceId, language) {
  return Boolean(root?.sources?.some((record) =>
    record.source === 'jastrow' &&
    record.sourceId === sourceId &&
    record.sourceLanguage === language
  ))
}

function collectSenseLanguageMarkers(entry, senses, path = [], output = []) {
  for (let index = 0; index < (senses || []).length; index++) {
    const sense = senses[index]
    const nextPath = [...path, index + 1]
    if (sense.languageCode) {
      output.push({
        entryId: entry.id,
        path: nextPath.join('.'),
        code: sense.languageCode,
        label: sense.languageLabel,
        hasChildren: Boolean(sense.senses?.length)
      })
    }
    collectSenseLanguageMarkers(entry, sense.senses, nextPath, output)
  }
  return output
}

function collectSourceScopes(entry, senses = null, path = [], output = []) {
  if (senses === null) senses = entry.senses || []
  if (path.length === 0 && entry.languageInfo) {
    output.push({ key: 'li', sourceLocation: 'language-info', text: entry.languageInfo })
  }
  for (let index = 0; index < (senses || []).length; index++) {
    const sense = senses[index]
    const nextPath = [...path, index + 1]
    if (sense.def) {
      output.push({
        key: `sense:${nextPath.join('.')}`,
        sourceLocation: 'sense',
        text: sense.def
      })
    }
    collectSourceScopes(entry, sense.senses || [], nextPath, output)
  }
  return output
}

function collectRawSourceScopes(entry) {
  const output = []
  if (entry.li) output.push({ key: 'li', text: entry.li })
  function visit(senses, path = []) {
    for (let index = 0; index < (senses || []).length; index++) {
      const sense = senses[index]
      const nextPath = [...path, index + 1]
      if (sense.d) output.push({ key: `sense:${nextPath.join('.')}`, text: sense.d })
      visit(sense.s, nextPath)
    }
  }
  visit(entry.c?.s)
  return output
}

function countOutcomes(relations) {
  return relations.reduce((counts, relation) => {
    counts[relation.resolution] = (counts[relation.resolution] || 0) + 1
    return counts
  }, {})
}

const source = json(join(dicts, 'jastrow.json'))
const basePayload = json(join(dicts, 'hebrew-catalog-2026-07-v2.json'))
const payload = json(join(dicts, JASTROW_CATALOG_FILE))
const rootPayload = json(join(dicts, 'attested-roots-2026-07-v2.json'))
const glossIndex = json(join(dicts, 'gloss-index-2026-07-v2.json'))
const attestedRootCandidates = extractAttestedRootCandidates(
  json(join(projectRoot, 'src', 'data', 'strongs.json')),
  json(join(dicts, 'bdb.json')),
  source
)
const rawSourceFiles = [
  join(projectRoot, '..', 'jastrow-upstream', 'data', 'jastrow-part1.jsonl'),
  join(projectRoot, '..', 'jastrow-upstream', 'data', 'jastrow-part2.jsonl')
]
const rawRelationOracleEntries = rawSourceFiles.every(existsSync)
  ? rawSourceFiles.flatMap((path) => readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => JSON.parse(line)))
  : null
const sourceById = new Map(source.entries.map((entry) => [String(entry.id), entry]))
const expectedEntries = source.entries.filter(isHebrewSearchableJastrowEntry)
const expectedIds = new Set(expectedEntries.map((entry) => String(entry.id)))

check(
  source.count === EXPECTED_JASTROW_COUNT &&
    source.entries.length === EXPECTED_JASTROW_COUNT &&
    source.sourceRevision === JASTROW_SOURCE_REVISION,
  'the pinned Jastrow source count or revision changed'
)
check(
  sameJson(source.languageCodeCounts, SOURCE_LANGUAGE_COUNTS) &&
    sameJson(source.sourceLanguageCodeCounts, {
      unmarked: SOURCE_LANGUAGE_COUNTS.und,
      bh: SOURCE_LANGUAGE_COUNTS.bh,
      'ar+he': SOURCE_LANGUAGE_COUNTS['ar+he'],
      ar: SOURCE_LANGUAGE_COUNTS.ar,
      he: SOURCE_LANGUAGE_COUNTS.he,
      ab: SOURCE_LANGUAGE_COUNTS.ab,
      'he+ar': SOURCE_LANGUAGE_COUNTS['he+ar'],
      'ar+bh': SOURCE_LANGUAGE_COUNTS['ar+bh']
    }),
  'the pinned Jastrow printed-origin inventory changed'
)
check(source.entriesWithoutDefinition === 6, 'source-empty Jastrow rows were added or dropped')
check(
  sameJson(source.sourceFormCounts, {
    alternate: 11_076,
    plural: 10_275,
    stem: 4_913,
    total: 26_264
  }) &&
    sameJson(source.hebrewSearchableFormCounts, {
      alternate: 9_280,
      plural: 8_271,
      stem: 3_229,
      total: 20_780
    }) &&
    sameJson(source.lexicalReferenceCounts, {
      edges: 66_169,
      hebrewSearchableEdges: 57_240,
      hebrewSearchableInternalEdges: 51_497,
      unresolvedTargets: 0
    }),
  'the retained Jastrow source-form or lexical-link inventory changed'
)
check(
  source.entries.every((entry) => {
    const formKeys = (entry.forms || []).map((form) =>
      `${form.type}\u0000${form.word}\u0000${form.label || ''}`
    )
    return new Set(formKeys).size === formKeys.length &&
      (entry.forms || []).every((form) =>
        ['alternate', 'plural', 'stem'].includes(form.type) &&
        /[\u0590-\u05ff]/u.test(form.word || '')
      ) &&
      new Set(entry.lexicalRefs || []).size === (entry.lexicalRefs || []).length &&
      (entry.lexicalRefs || []).every((targetId) => sourceById.has(targetId))
  }),
  'a retained Jastrow form is malformed or an internal lexical link is unresolved'
)
check(
  expectedEntries.every((entry) => hebrewConsonantSearchKeys(entry.lemma).length > 0),
  'a Hebrew-searchable Jastrow headword lacks a deterministic hidden consonant key'
)
check(
  source.license === 'CC BY-NC 4.0 digitization; underlying 1903 work public domain' &&
    /CC BY-NC 4\.0/.test(source.conversion || '') &&
    /not treated as complete row-level language metadata/i.test(source.conversion || ''),
  'the Jastrow digitization license or language caveat is missing'
)

const senseLanguageMarkers = source.entries.flatMap((entry) =>
  collectSenseLanguageMarkers(entry, entry.senses)
)
check(
  source.senseLanguageMarkers === 3 &&
    senseLanguageMarkers.length === 3 &&
    sameJson(
      senseLanguageMarkers.map((marker) => marker.entryId).sort(),
      ['B01238', 'D00633', 'U01849']
    ) &&
    senseLanguageMarkers.every((marker) =>
      marker.code === 'bh' && marker.label === 'Biblical Hebrew' && marker.hasChildren
    ),
  'the three retained nested Jastrow language markers changed'
)

const sourceRootEntries = source.entries.filter((entry) => entry.sourceRoots?.length)
const sourceRootAssignments = source.entries.flatMap((entry) =>
  (entry.sourceRoots || []).map((root) => ({ entry, root }))
)
const rootMentions = source.entries.flatMap((entry) =>
  (entry.sourceRootMentions || []).map((mention) => ({ entry, mention }))
)
const directRootMentions = rootMentions.filter(({ mention }) => mention.relation !== 'comparison')
const comparativeRootMentions = rootMentions.filter(({ mention }) => mention.relation === 'comparison')
const outOfModelMentions = directRootMentions.filter(
  ({ mention }) => !ROOT_MODEL.test(rootKey(mention.letters))
)
const printedMarkerProvenance = rootMentions.flatMap(({ entry, mention }) =>
  (mention.provenance || [])
    .filter((record) => record.occurrenceId.includes(':sqrt:'))
    .map((record) => ({ entry, mention, record }))
)
const emittedPrintedMarkerKeys = new Set(printedMarkerProvenance.map(
  ({ entry, record }) => `${entry.id}:${record.occurrenceId}`
))
const scannedPrintedMarkers = source.entries.flatMap((entry) =>
  collectSourceScopes(entry).flatMap((scope) =>
    [...scope.text.matchAll(/√/gu)].map((_, index) => ({
      key: `${entry.id}:${scope.key}:sqrt:${index}`,
      sourceLocation: scope.sourceLocation
    }))
  )
)
const scannedPrintedMarkerKeys = new Set(scannedPrintedMarkers.map(({ key }) => key))
const independentlyCountedRoots = {
  entriesWithPrintedMarkers: new Set(
    scannedPrintedMarkers.map(({ key }) => key.split(':')[0])
  ).size,
  printedMarkers: scannedPrintedMarkerKeys.size,
  languageInfoPrintedMarkers: scannedPrintedMarkers.filter(
    ({ sourceLocation }) => sourceLocation === 'language-info'
  ).length,
  sensePrintedMarkers: scannedPrintedMarkers.filter(
    ({ sourceLocation }) => sourceLocation === 'sense'
  ).length,
  expandedAlternatives: printedMarkerProvenance.filter(
    ({ record }) => record.alternativeIndex > 0
  ).length,
  relationValidDirectRoots: directRootMentions.length,
  comparisonOnlyRoots: comparativeRootMentions.length,
  printedComparisonOnlyRoots: comparativeRootMentions.filter(({ mention }) =>
    mention.provenance?.some((record) => record.occurrenceId.includes(':sqrt:'))
  ).length,
  reviewedStemComparisonRoots: comparativeRootMentions.filter(({ mention }) =>
    mention.provenance?.some((record) => record.occurrenceId.includes(':stem-declaration:'))
  ).length,
  secondaryRootMappings: directRootMentions.filter(
    ({ mention }) => mention.relation === 'secondary-root'
  ).length,
  entriesWithSourceRoots: sourceRootEntries.length,
  sourceRootAssignments: sourceRootAssignments.length,
  exactTargetAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence?.some((evidence) => Boolean(evidence.targetId))
  ).length,
  directRootUsageAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence?.some((evidence) => evidence.type === 'root-usage')
  ).length,
  rootInLexemeAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence?.some((evidence) => evidence.type === 'root-in-lexeme')
  ).length,
  stemDeclarationAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence?.some((evidence) => evidence.type === 'stem-declaration')
  ).length,
  outOfModelDirectRoots: outOfModelMentions.length
}
check(
  sameJson(source.explicitRootCounts, SOURCE_ROOT_COUNTS) &&
    sameJson(independentlyCountedRoots, SOURCE_ROOT_COUNTS) &&
    sameJson([...emittedPrintedMarkerKeys].sort(), [...scannedPrintedMarkerKeys].sort()),
  'Jastrow root-marker accounting changed',
  JSON.stringify({ artifact: source.explicitRootCounts, independent: independentlyCountedRoots })
)
check(
  sourceRootAssignments.every(({ root }) => root.evidence?.length) &&
    comparativeRootMentions.every(({ entry, mention }) =>
      (mention.provenance || []).every((provenance) =>
        !(entry.sourceRoots || []).some((root) =>
          (root.evidence || []).some((evidence) =>
            (evidence.provenance || []).some(
              (rootProvenance) => rootProvenance.occurrenceId === provenance.occurrenceId
            )
          )
        )
      )
    ),
  'a comparison-only Jastrow marker entered sourceRoots'
)
check(
  sameJson(
    comparativeRootMentions
      .map(({ entry, mention }) => `${entry.id}:${rootKey(mention.letters)}`)
      .sort(),
    ['B00073:בז', 'B00479:בה', 'B00880:מל', 'C00039:גפ', 'C00039:כפ', 'I00138:טהר']
  ) &&
    sameJson(
      [...new Set(comparativeRootMentions.flatMap(({ entry, mention }) =>
        (mention.provenance || [])
          .filter(({ occurrenceId }) => occurrenceId.includes(':sqrt:'))
          .map(({ occurrenceId }) => `${entry.id}:${occurrenceId}`)
      ))].sort(),
      ['B00073:sense:1:sqrt:1', 'B00479:li:sqrt:1', 'B00880:sense:1:sqrt:2', 'C00039:sense:1:sqrt:1']
    ) &&
    comparativeRootMentions.some(({ entry, mention }) =>
      entry.id === 'I00138' &&
      rootKey(mention.letters) === 'טהר' &&
      mention.provenance?.some(({ occurrenceId }) =>
        occurrenceId === 'sense:1:stem-declaration:0:comparison:0'
      )
    ),
  'the printed or reviewed comparison-only root inventory changed'
)
check(
  sameJson(
    outOfModelMentions
      .map(({ entry, mention }) => `${entry.id}:${rootKey(mention.letters)}`)
      .sort(),
    ['A00401:ד', 'A00401:ז', 'A00510:ה']
  ) &&
    new Set(outOfModelMentions.flatMap(({ entry, mention }) =>
      (mention.provenance || []).map(({ occurrenceId }) => `${entry.id}:${occurrenceId}`)
    )).size === 2,
  'the two one-radical √ occurrences or three expanded direct mentions changed'
)

const relationRows = source.entries.flatMap((entry) =>
  (entry.rootRelations || []).map((relation) => ({ entry, relation }))
)
const relationOccurrenceKeys = new Set(relationRows.map(
  ({ entry, relation }) => `${entry.id}:${relation.occurrenceId}`
))
const independentlyScannedRelationKeys = new Set()
for (const [type, pattern] of RELATION_FAMILIES) {
  const independent = []
  if (rawRelationOracleEntries) {
    for (const entry of rawRelationOracleEntries) {
      if (!SELECTED_RELATION_CODES.has(entry.g?.l || 'und')) continue
      for (const scope of collectRawSourceScopes(entry)) {
        const text = scope.text.replace(/<[^>]*>/g, ' ').replace(/&[^;]+;/g, ' ')
        pattern.lastIndex = 0
        let ordinal = 0
        for (const match of text.matchAll(pattern)) {
          const key = `${entry.id}:${scope.key}:${type}:${ordinal++}`
          independentlyScannedRelationKeys.add(key)
          independent.push({ entry, match, key })
        }
      }
    }
  }
  const artifact = relationRows.filter(({ relation }) => relation.type === type)
  if (!rawRelationOracleEntries) {
    for (const { entry, relation } of artifact) {
      const key = `${entry.id}:${relation.occurrenceId}`
      independentlyScannedRelationKeys.add(key)
      independent.push({ entry, key })
    }
  }
  const expectation = RELATION_EXPECTATIONS[type]
  check(
    independent.length === expectation.occurrences &&
      new Set(independent.map(({ entry }) => entry.id)).size === expectation.entries &&
      artifact.length === expectation.occurrences &&
      new Set(artifact.map(({ entry }) => entry.id)).size === expectation.entries &&
      sameJson(source.rootRelationInventory?.[type], expectation) &&
      sameJson(countOutcomes(artifact.map(({ relation }) => relation)), expectation.outcomes) &&
      sameJson(
        artifact.map(({ entry, relation }) => `${entry.id}:${relation.occurrenceId}`).sort(),
        independent.map(({ key }) => key).sort()
      ),
    `Jastrow ${type} relation inventory changed`,
    JSON.stringify({
      independentOccurrences: independent.length,
      independentEntries: new Set(independent.map(({ entry }) => entry.id)).size,
      artifactOccurrences: artifact.length,
      artifactEntries: new Set(artifact.map(({ entry }) => entry.id)).size,
      artifactInventory: source.rootRelationInventory?.[type],
      expectation,
      missing: independent.map(({ key }) => key).filter((key) =>
        !artifact.some(({ entry, relation }) => `${entry.id}:${relation.occurrenceId}` === key)
      ).slice(0, 5),
      extra: artifact.map(({ entry, relation }) => `${entry.id}:${relation.occurrenceId}`).filter((key) =>
        !independent.some((record) => record.key === key)
      ).slice(0, 5)
    })
  )
}
check(
  sameJson([...relationOccurrenceKeys].sort(), [...independentlyScannedRelationKeys].sort()) &&
    createHash('sha256')
      .update([...relationOccurrenceKeys].sort().join('\n'))
      .digest('hex') === RELATION_OCCURRENCE_DIGEST,
  'a finite Jastrow relation occurrence was omitted or multiply classified'
)
const sourceIds = new Set(source.entries.map((entry) => entry.id))
check(
  relationRows.every(({ relation }) => {
    if (relation.resolution === 'exact-target') {
      return relation.targetIds?.length > 0 &&
        relation.targetIds.every((id) => sourceIds.has(id)) &&
        relation.resolvedTargetIds?.length > 0 &&
        relation.resolvedTargetIds.every((id) => sourceIds.has(id)) &&
        relation.rootLetters?.length > 0
    }
    if (relation.resolution === 'explicit-exclusion') return Boolean(relation.exclusionReason)
    if (relation.resolution === 'direct-root') return relation.rootLetters?.length > 0
    return relation.resolution === 'comparison' || relation.resolution === 'manual-review'
  }),
  'a typed Jastrow relation lacks a source-honest resolution'
)
check(
  sourceById.get('B01007')?.rootRelations?.filter(
    (relation) => relation.type === 'secondary-root' && relation.resolution === 'explicit-exclusion'
  ).length === 1 &&
    sourceById.get('C00299')?.rootRelations?.filter(
      (relation) => relation.type === 'secondary-root' && relation.resolution === 'explicit-exclusion'
    ).length === 2 &&
    sourceById.get('H01913')?.rootRelations?.some((relation) =>
      relation.type === 'secondary-root' &&
      relation.resolution === 'explicit-exclusion' &&
      relation.exclusionReason === 'embedded-secondary-form-describes-cited-form-not-entry-root'
    ) &&
    sourceById.get('O01719')?.rootRelations?.some((relation) =>
      relation.type === 'verbal-stem' &&
      relation.resolution === 'explicit-exclusion' &&
      relation.exclusionReason === 'exact-target-has-no-established-root'
    ),
  'malformed or embedded secondary-root prose did not fail closed'
)

const jastrowDictionary = getDictionary('jastrow')
check(
  jastrowDictionary?.language === 'Hebrew & Aramaic' &&
    jastrowDictionary.fields.sub === 'languageLabel' &&
    /^CC BY-NC 4\.0 digitization/.test(jastrowDictionary.license || '') &&
    /not inferred as Hebrew or Aramaic/i.test(jastrowDictionary.attribution || '') &&
    sourceById.get('B00486')?.languageCode === 'und' &&
    sourceById.get('B00486')?.languageLabel === 'Hebrew/Aramaic (unmarked)' &&
    sourceById.get('B00487')?.languageCode === 'ar' &&
    sourceById.get('B00487')?.languageLabel === 'Aramaic',
  'the reference shelf lost Jastrow provenance or honest language labels'
)

const unresolvedHeadwordLinkEntries = source.entries.filter(
  (entry) => entry.unresolvedHeadwordLinks?.length > 0
)
const unresolvedHeadwordLinks = unresolvedHeadwordLinkEntries.flatMap(
  (entry) => entry.unresolvedHeadwordLinks
)
const selectedUnresolvedHeadwordLinkEntries = expectedEntries.filter(
  (entry) => entry.unresolvedHeadwordLinks?.length > 0
)
check(
  sameJson(source.unresolvedHeadwordLinkCounts, {
    occurrences: 85,
    edges: 84,
    entries: 83,
    hebrewSearchableOccurrences: 84,
    hebrewSearchableEdges: 83,
    hebrewSearchableEntries: 82
  }) &&
    unresolvedHeadwordLinkEntries.length === 83 &&
    unresolvedHeadwordLinks.length === 84 &&
    selectedUnresolvedHeadwordLinkEntries.length === 82 &&
    selectedUnresolvedHeadwordLinkEntries.reduce(
      (count, entry) => count + entry.unresolvedHeadwordLinks.length,
      0
    ) === 83 &&
    unresolvedHeadwordLinks.every((link) =>
      sameJson(Object.keys(link).sort(), ['displayLabel', 'status', 'targetLabel']) &&
      link.status === 'source-unresolved-headword-link' &&
      Boolean(link.targetLabel || link.displayLabel)
    ),
  'legacy Jastrow headword links were lost or promoted to invented stable targets'
)
check(
  sourceById.get('D00354')?.unresolvedHeadwordLinks?.some((link) =>
    rootKey(link.targetLabel) === rootKey('\u05d3\u05e8\u05d1\u05df') &&
      link.status === 'source-unresolved-headword-link'
  ) &&
    sourceById.get('D00478')?.unresolvedHeadwordLinks?.some((link) =>
      link.targetLabel === '\u05db\u05b8\u05bc\u05dc\u05d5\u05bc\u05dc.1'
    ) &&
    sourceById.get('J00597')?.unresolvedHeadwordLinks?.some((link) =>
      link.targetLabel === '\u05d3\u05b4\u05bc\u05dc\u05b0\u05d3\u05b5\u05bc\u05dc.1' &&
      /B\. Mets\./.test(link.displayLabel)
    ),
  'ordinary or malformed legacy Jastrow headword links did not fail closed as searchable labels'
)

check(
  expectedEntries.length === EXPECTED_HEBREW_SEARCH_COUNT,
  'the Hebrew-searchable or unmarked Jastrow selection changed',
  String(expectedEntries.length)
)
check(
  payload.version === 1 &&
    payload.build === JASTROW_BUILD_ID &&
    payload.sourceRevision === JASTROW_SOURCE_REVISION &&
    payload.shardCount === JASTROW_SHARD_COUNT &&
    payload.shardDirectory === `dicts/${JASTROW_SHARD_DIRECTORY}` &&
    payload.sources?.length === 1 && payload.sources[0] === 'jastrow' &&
    payload.counts?.catalog === EXPECTED_HEBREW_SEARCH_COUNT &&
    payload.counts?.sourceRootMappings === 375 &&
    payload.counts?.reviewedRootMappings === 2 &&
    payload.entries?.length === EXPECTED_HEBREW_SEARCH_COUNT &&
    sameJson(payload.languageCodeCounts, SOURCE_LANGUAGE_COUNTS) &&
    payload.originLabels?.und === 'Hebrew/Aramaic (unmarked)',
  'the Jastrow comparison catalog header is malformed'
)
check(
  statSync(join(dicts, JASTROW_CATALOG_FILE)).size < 8 * 1024 * 1024,
  'the compact Jastrow catalog exceeded its mobile transfer budget'
)

const tuplesById = new Map()
for (const tuple of payload.entries) {
  const id = String(tuple[1])
  const entry = sourceById.get(id)
  check(!tuplesById.has(id), 'duplicate Jastrow comparison ID', id)
  check(expectedIds.has(id), 'non-searchable Jastrow row entered Comparative', id)
  check(tuple[0] === 0 && tuple[2] === entry?.lemma, 'catalog row lost source identity', id)
  check(
    tuple[11] === entry?.languageCode && payload.originLabels?.[tuple[11]],
    'catalog row lost its printed-origin or unmarked status',
    id
  )
  tuplesById.set(id, tuple)
}
check(
  expectedEntries.every((entry) => tuplesById.has(String(entry.id))),
  'one or more Hebrew-searchable or unmarked Jastrow rows are missing from Comparative'
)
check(!tuplesById.has('B00487'), 'explicitly Aramaic B00487 entered All Hebrew')
check(!tuplesById.has('A00401'), 'explicitly Aramaic A00401 entered All Hebrew')

const shardFiles = readdirSync(join(dicts, JASTROW_SHARD_DIRECTORY))
  .filter((file) => /^[0-9a-f]{2}\.json$/.test(file))
  .sort()
check(shardFiles.length === JASTROW_SHARD_COUNT, 'the Jastrow shard family is incomplete')
const shardById = new Map()
const emittedRecordKeys = new Set()
for (const filename of shardFiles) {
  const id = filename.slice(0, 2)
  const shard = json(join(dicts, JASTROW_SHARD_DIRECTORY, filename))
  check(
    shard.version === 1 && shard.shard === id && shard.languages?.length === 6,
    'malformed Jastrow shard',
    filename
  )
  check(
    statSync(join(dicts, JASTROW_SHARD_DIRECTORY, filename)).size < 1024 * 1024,
    'Jastrow shard exceeded one MiB',
    filename
  )
  for (const [sourceKey, records] of Object.entries(shard.records || {})) {
    check(!emittedRecordKeys.has(sourceKey), 'duplicate Jastrow shard record', sourceKey)
    emittedRecordKeys.add(sourceKey)
    const sourceId = sourceKey.replace(/^jastrow:/, '')
    const tuple = tuplesById.get(sourceId)
    check(tuple && tuple[6] === id, 'Jastrow record is in the wrong shard', sourceKey)
    check(records.length === tuple[7].length, 'Jastrow record lost a source sense', sourceKey)
    for (const slots of records) {
      check(Array.isArray(slots) && slots.length === 6, 'Jastrow sense lost a language slot', sourceKey)
      for (const slot of slots) {
        const candidateIndexes = slot?.[0] === 0 ? [] : [slot?.[1], ...(slot?.[2] || [])]
        check(
          candidateIndexes.every((index) => Number.isInteger(index) && shard.candidates[index]),
          'Jastrow slot points outside its candidate table',
          sourceKey
        )
      }
    }
  }
  shardById.set(id, shard)
}
check(
  emittedRecordKeys.size === EXPECTED_HEBREW_SEARCH_COUNT &&
    expectedEntries.every((entry) => emittedRecordKeys.has(`jastrow:${entry.id}`)),
  'the Jastrow shard family does not cover every selected source row'
)

const decodedBase = decodeHebrewCatalog(basePayload)
const decodedJastrow = decodeHebrewCatalog(payload)
const decodedJastrowById = new Map(decodedJastrow.entries.map((entry) => [String(entry.id), entry]))
const merged = mergeHebrewCatalogs(decodedBase, decodedJastrow)
check(
  decodedBase.entries.length === 18_992 &&
    decodedJastrow.entries.length === EXPECTED_HEBREW_SEARCH_COUNT &&
    merged.entries.length === 48_597,
  'the merged All Hebrew catalog is incomplete'
)
check(
  expectedEntries.every((sourceEntry) => {
    const decoded = decodedJastrowById.get(String(sourceEntry.id))
    const compactForms = (forms) => (forms || []).map((form) => [
      form.type,
      form.word,
      form.label || null
    ])
    return sameJson(compactForms(decoded?.forms), compactForms(sourceEntry.forms)) &&
      (decoded?.forms || []).every((form) =>
        decoded.formSearches.includes(normalize(form.word)) &&
        decoded.searchText.includes(normalize(form.word))
      )
  }),
  'a retained Jastrow alternate, plural, or stem form is missing from Comparative search'
)

const expectedB00486 = sourceById.get('B00486')
const b00486 = decodedJastrowById.get('B00486')
check(
  b00486?.headword === expectedB00486.lemma &&
    b00486.transliteration === 'bachash' &&
    b00486.aliases.includes('bakhash') &&
    b00486.languageCode === 'und' &&
    b00486.languageLabel === 'Hebrew/Aramaic (unmarked)' &&
    sameJson(rootReferenceSummary(b00486), [
      'hebrew:בחש',
      'hebrew-aramaic-unclassified:בח'
    ]) &&
    b00486.rootReference === b00486.rootReferences[0] &&
    b00486.senses.some((sense) => /\bstir\b/i.test(sense.label)),
  'the reviewed B00486 comparison row is incomplete'
)
check(
  sameJson(rootReferenceSummary(decodedJastrowById.get('B00502')), [
    'hebrew-aramaic-unclassified:בט',
    'hebrew-aramaic-unclassified:פצ'
  ]) &&
    sameJson(rootReferenceSummary(decodedJastrowById.get('B00880')), [
      'hebrew:בל',
      'hebrew:בו',
      'hebrew:בה'
    ]),
  'a Jastrow entry with multiple source roots lost one of its root chips'
)
for (const query of ['בחש', 'בָּחַשׁ', 'B00486', 'bachash', 'bakhash']) {
  const results = searchHebrewCatalog(merged, query)
  check(
    results[0]?.sourceKey === 'jastrow:B00486' &&
      selectAutoOpenSourceKey(results, query) === 'jastrow:B00486',
    'an exact B00486 spelling or alias does not auto-open the source row',
    query
  )
}
const resolvedB00486 = resolveHebrewComparison(b00486, shardById.get(b00486.shard))
check(
  resolvedB00486.some((sense) => /\bstir\b/i.test(sense.label)) &&
    resolvedB00486.every((sense) => sense.slots.length === 6),
  'B00486 does not open a complete sense-specific comparison card'
)

const expectedB00534 = sourceById.get('B00534')
const b00534 = decodedJastrowById.get('B00534')
check(
  expectedB00534?.languageCode === 'und' &&
    b00534?.headword === expectedB00534.lemma &&
    b00534.transliteration === 'bəṭaš' &&
    ['batash', 'betash', 'battash', 'botesh', 'livtosh', 'bitesh']
      .every((alias) => b00534.aliases.includes(alias)) &&
    b00534.languageCode === 'und' &&
    b00534.languageLabel === 'Hebrew/Aramaic (unmarked)' &&
    sameJson(rootReferenceSummary(b00534), ['hebrew:\u05d1\u05d8\u05e9']) &&
    sameJson(expectedB00534.lexicalRefs, ['B00502', 'B00586', 'B01397']) &&
    b00534.forms.length === 2 &&
    b00534.forms.every((form) => form.type === 'stem' && ['Pa.', 'Ithpa.'].includes(form.label)) &&
    b00534.senses.some((sense) => /\b(?:kick|stamp)\b/i.test(sense.label)),
  'the reviewed B00534 word, forms, links, provenance, or root mapping is incomplete'
)
for (const query of ['\u05d1\u05d8\u05e9', 'B00534', 'batash', 'betash', 'battash', 'botesh']) {
  const results = searchHebrewCatalog(merged, query)
  check(
    results[0]?.sourceKey === 'jastrow:B00534' &&
      selectAutoOpenSourceKey(results, query) === 'jastrow:B00534',
    'an exact B00534 spelling or reviewed alias does not auto-open its source row',
    query
  )
}
for (const form of b00534.forms) {
  const tier = getHebrewCatalogMatchTier(b00534, form.word)
  check(
    tier >= HEBREW_CATALOG_MATCH_TIER.sourceFormExactDisplayOnly &&
      tier <= HEBREW_CATALOG_MATCH_TIER.sourceFormExact &&
      selectAutoOpenSourceKey([b00534], form.word) === null,
    'a B00534 source-listed stem form is not searchable as a closed result',
    form.word
  )
}
const genericBatashResults = searchHebrewCatalog(merged, 'butsha')
check(
  genericBatashResults.some((entry) => entry.sourceKey === 'jastrow:B00534') &&
    genericBatashResults.length > 1 &&
    selectAutoOpenSourceKey(genericBatashResults, 'butsha') === null,
  'the hidden consonant fallback does not return an ambiguity-preserving B00534 result list'
)
const resolvedB00534 = resolveHebrewComparison(b00534, shardById.get(b00534.shard))
check(
  resolvedB00534.some((sense) => /\b(?:kick|stamp)\b/i.test(sense.label)) &&
    resolvedB00534.every((sense) => sense.slots.length === 6),
  'B00534 does not open a complete sense-specific comparison card'
)

const completeRoots = mergeAttestedRootCatalog(rootPayload, ROOTS)
let modeledSourceRootAssignments = 0
let modeledSelectedRootAssignments = 0
for (const entry of source.entries) {
  for (const explicit of entry.sourceRoots || []) {
    if (!ROOT_MODEL.test(rootKey(explicit.letters))) continue
    const language = jastrowRootLanguage(explicit.languageCode)
    if (!language) continue
    modeledSourceRootAssignments++
    if (expectedIds.has(entry.id)) modeledSelectedRootAssignments++
    const root = findAttestedRootExact(completeRoots, language, explicit.letters)
    check(
      hasSource(root, entry.id, language),
      'a modeled Jastrow source-root marker is absent from its exact-language root catalog',
      `${entry.id}:${language}:${explicit.letters}`
    )
  }
}
check(
  modeledSourceRootAssignments === 378 &&
    modeledSelectedRootAssignments === 375 &&
    payload.counts.sourceRootMappings === modeledSelectedRootAssignments,
  'the modeled Jastrow source-root assignment count changed'
)
const b00242Source = sourceById.get('B00242')
const b00242HebrewRoots = ['בו', 'בה'].map((letters) =>
  findAttestedRootExact(completeRoots, 'hebrew', letters)
)
const b00242Candidates = attestedRootCandidates.filter(
  (candidate) => candidate.source === 'jastrow' && candidate.sourceId === 'B00242'
)
check(
  b00242Source?.languageCode === 'ar' &&
    !tuplesById.has('B00242') &&
    sameJson(
      (b00242Source.sourceRoots || []).map((root) => [root.languageCode, rootKey(root.letters)]),
      [['bh', 'בו'], ['bh', 'בה']]
    ) &&
    sameJson(
      b00242Candidates.map((candidate) => [
        candidate.sourceLanguage,
        rootKey(candidate.letters),
        candidate.word,
        candidate.gloss,
        candidate.evidence,
        candidate.sourceHeadword,
        candidate.sourceHeadwordLanguageCode
      ]),
      ['בה', 'בו'].map((letters) => [
        'hebrew',
        letters,
        letters,
        'explicit Biblical Hebrew root marker in Jastrow entry',
        'explicit Biblical Hebrew root marker in Jastrow entry',
        b00242Source.lemma,
        'ar'
      ])
    ) &&
    b00242HebrewRoots.every((root) =>
      hasSource(root, 'B00242', 'hebrew') &&
      root.sources.some((record) =>
        record.source === 'jastrow' &&
        record.sourceId === 'B00242' &&
        record.headword === b00242Source.lemma &&
        record.headwordLanguageCode === 'ar'
      ) &&
      root.attested.every((record) =>
        record.source !== 'jastrow' ||
        record.sourceId !== 'B00242' ||
        (
          rootKey(record.word) === rootKey(root.letters) &&
          record.word !== b00242Source.lemma &&
          record.gloss === 'explicit Biblical Hebrew root marker in Jastrow entry' &&
          record.evidence === 'explicit Biblical Hebrew root marker in Jastrow entry'
        )
      )
    ),
  'B00242 did not preserve its Aramaic row classification and inline Biblical-Hebrew roots'
)
const a01200 = decodedJastrowById.get('A01200')
const a01200UnclassifiedRoot = findAttestedRootExact(
  completeRoots,
  'hebrew-aramaic-unclassified',
  'מל'
)
check(
  sameJson(rootReferenceSummary(a01200), ['hebrew-aramaic-unclassified:מל']) &&
    hasSource(a01200UnclassifiedRoot, 'A01200', 'hebrew-aramaic-unclassified') &&
    !hasSource(findAttestedRootExact(completeRoots, 'hebrew', 'מל'), 'A01200', 'hebrew'),
  'mixed he+ar root evidence was promoted to an exact Hebrew root card'
)
const u01959Source = sourceById.get('U01959')
const u01959Root = findAttestedRootExact(completeRoots, 'hebrew', 'שרי')
check(
  u01959Source?.languageCode === 'bh' &&
    u01959Source.languageInfo === '(b. h. root in מִשְׁרָה)' &&
    u01959Source.sourceRoots?.some((root) =>
      root.languageCode === 'bh' &&
      rootKey(root.letters) === 'שרי' &&
      root.evidence?.some((evidence) => evidence.type === 'root-in-lexeme')
    ) &&
    u01959Source.rootRelations?.some((relation) =>
      relation.type === 'root-in-lexeme' &&
      relation.sourceLocation === 'language-info' &&
      relation.resolution === 'direct-root' &&
      sameJson(relation.rootLetters, ['שרי'])
    ) &&
    sameJson(rootReferenceSummary(decodedJastrowById.get('U01959')), ['hebrew:שרי']) &&
    hasSource(u01959Root, 'U01959', 'hebrew'),
  'U01959 lost its reviewed Biblical-Hebrew root-in-lexeme relationship'
)
const i00138Source = sourceById.get('I00138')
check(
  i00138Source?.languageCode === 'und' &&
    sameJson(
      (i00138Source.sourceRoots || []).map((root) => [root.languageCode, rootKey(root.letters)]),
      [['und', 'טה'], ['und', 'טו']]
    ) &&
    i00138Source.rootRelations?.some((relation) =>
      relation.type === 'stem-declaration' &&
      relation.resolution === 'direct-root' &&
      sameJson(relation.rootLetters, ['טה', 'טו']) &&
      sameJson(relation.comparisonRootLetters, ['טהר'])
    ) &&
    sameJson(rootReferenceSummary(decodedJastrowById.get('I00138')), [
      'hebrew-aramaic-unclassified:טה',
      'hebrew-aramaic-unclassified:טו'
    ]) &&
    ['טה', 'טו'].every((letters) =>
      hasSource(
        findAttestedRootExact(completeRoots, 'hebrew-aramaic-unclassified', letters),
        'I00138',
        'hebrew-aramaic-unclassified'
      )
    ) &&
    !hasSource(
      findAttestedRootExact(completeRoots, 'hebrew-aramaic-unclassified', 'טהר'),
      'I00138',
      'hebrew-aramaic-unclassified'
    ),
  'I00138 lost its two reviewed stems or admitted comparison-only טהר'
)
const h01295Source = sourceById.get('H01295')
check(
  h01295Source?.rootRelations?.some((relation) =>
    relation.type === 'conjectural-stem-derivation' &&
    relation.sourceLocation === 'sense' &&
    relation.sensePath === '2' &&
    relation.resolution === 'manual-review' &&
    relation.exclusionReason === 'conjectural-root-prose'
  ) &&
    !(h01295Source.sourceRoots || []).some((root) => rootKey(root.letters) === 'חסס') &&
    !rootReferenceSummary(decodedJastrowById.get('H01295')).some((reference) =>
      reference.endsWith(':חסס')
    ),
  'H01295 conjectural stem חסס was untyped or promoted to a root'
)
for (const sourceId of ['A00568', 'A00924', 'B00487']) {
  check(
    completeRoots.roots.every((root) => !hasSource(root, sourceId, root.lang)),
    'a pure-Aramaic Jastrow source root entered the Hebrew/unclassified root catalog',
    sourceId
  )
}

const bachashRoot = findAttestedRootExact(completeRoots, 'hebrew', 'בחש')
const bachashSourceRoot = findAttestedRootExact(
  completeRoots,
  'hebrew-aramaic-unclassified',
  'בח'
)
check(
  bachashRoot?.reviewedMapping?.status === 'reviewed modern Hebrew mapping' &&
    bachashRoot.sources.some((record) =>
      record.source === 'academy-hebrew-terms' && record.sourceId === 'term-28_2'
    ) &&
    /does not explicitly label/i.test(bachashRoot.reviewedMapping.caveat) &&
    hasSource(bachashSourceRoot, 'B00486', 'hebrew-aramaic-unclassified'),
  'the reviewed B00486 mapping or its separate unclassified source root lost evidence'
)
const batashRoot = findAttestedRootExact(completeRoots, 'hebrew', '\u05d1\u05d8\u05e9')
check(
  batashRoot?.reviewedMapping?.status === 'reviewed modern Hebrew mapping' &&
    batashRoot.sources.some((record) =>
      record.source === 'academy-hebrew-terms' && record.sourceId === 'term-26889_1'
    ) &&
    batashRoot.attested.some((record) =>
      record.word === '\u05d1\u05b8\u05bc\u05d8\u05b7\u05e9\u05c1' &&
        /(?:strike|hit)/i.test(record.gloss)
    ) &&
    /unmarked/i.test(batashRoot.reviewedMapping.caveat) &&
    /borrowed from Aramaic/i.test(batashRoot.reviewedMapping.caveat),
  'the reviewed B00534 modern Hebrew root card lost its word, evidence, meaning, or provenance caveat'
)

for (const { entry, mention } of comparativeRootMentions) {
  const entryId = entry.id
  const comparisonLetters = mention.letters
  const language = jastrowRootLanguage(mention.languageCode)
  const root = findAttestedRootExact(completeRoots, language, comparisonLetters)
  check(
    !hasSource(root, entryId, language) &&
      !rootReferenceSummary(decodedJastrowById.get(entryId)).includes(
        `${language}:${rootKey(comparisonLetters)}`
      ),
    'a comparison-only Jastrow root mention entered a root catalog or chip',
    `${entryId}:${comparisonLetters}`
  )
}
check(
  rootReferenceSummary(decodedJastrowById.get('A00510')).length === 0 &&
    rootReferenceSummary(decodedJastrowById.get('H01913')).length === 0 &&
    rootReferenceSummary(decodedJastrowById.get('O01719')).length === 0,
  'an out-of-model or source-ambiguous Jastrow relation entered the root model'
)

check(
  glossIndex.version === 2 &&
    sameJson(glossIndex.languages.slice(1), MEANING_LANGUAGE_ORDER),
  'By meaning has a stale or misordered language inventory'
)
const stirResults = searchGlossIndex(glossIndex, 'stir')
check(
  stirResults.groups.Hebrew.some((result) =>
    result.d === 'jastrow' && result.i === 'B00486' && result.lc === 'he' && /\bstir\b/i.test(result.g)
  ) &&
    stirResults.groups.Hebrew.some((result) =>
      result.d === 'jastrow' && result.i === 'B00880' && result.lc === 'he' && /\bstir\b/i.test(result.g)
    ) &&
    stirResults.groups.Aramaic.some((result) =>
      result.d === 'jastrow' && result.i === 'B00487' && result.lc === 'arc' && /\bstir\b/i.test(result.g)
    ) &&
    stirResults.groups['Hebrew/Aramaic (unclassified)'].some((result) =>
      result.d === 'jastrow' && result.i === 'C00447' && result.lc === 'und-Hebr' && /\bstir\b/i.test(result.g)
    ),
  'By meaning lost a reviewed Hebrew, printed Hebrew, Aramaic, or unclassified Jastrow stir sense'
)
const treadResults = searchGlossIndex(glossIndex, 'tread')
check(
  treadResults.groups['Hebrew/Aramaic (unclassified)'].some((result) =>
    result.d === 'jastrow' && result.i === 'B00502' && result.lc === 'und-Hebr'
  ),
  'By meaning relabeled an unmarked Jastrow result'
)
for (const alias of ['bachash', 'bakhash']) {
  const result = searchGlossIndex(glossIndex, alias)
  check(
    result.direct.some((entry) =>
      entry.d === 'jastrow' &&
      entry.i === 'B00486' &&
      entry.lang === 'Hebrew' &&
      entry.lc === 'he'
    ),
    'By meaning does not resolve the reviewed B00486 alias',
    alias
  )
}
for (const alias of ['batash', 'betash', 'battash', 'botesh', 'livtosh', 'bitesh']) {
  const result = searchGlossIndex(glossIndex, alias)
  check(
    result.direct.some((entry) =>
      entry.d === 'jastrow' &&
      entry.i === 'B00534' &&
      entry.lang === 'Hebrew' &&
      entry.lc === 'he' &&
      entry.x === 'b\u0259\u1e6da\u0161'
    ),
    'By meaning does not resolve a reviewed B00534 alias to the Hebrew result',
    alias
  )
}

console.log(
  `validated ${payload.entries.length} Hebrew-searchable or unmarked Jastrow comparison rows, ` +
  `${emittedRecordKeys.size} shard records, ${modeledSourceRootAssignments} exact-language source-root assignments, ` +
  '4 comparison √ occurrences (5 mentions), 1 reviewed stem comparison, ' +
  '2 out-of-model √ occurrences (3 mentions), and honest meaning groups'
)
