// Imports Marcus Jastrow's "A Dictionary of the Targumim, the Talmud Babli
// and Yerushalmi, and the Midrashic Literature" (1903) into
// public/dicts/jastrow.json.
//
// Provenance
// ----------
// Work: Marcus Jastrow, 1903 — public domain (author died 1903; published
// 1886-1903). Machine-readable digitization by Sefaria (CC BY-NC 4.0),
// obtained here as
// the JSONL data files published in the open-source Jastrow PWA
// (github.com/UniquePixels/jastrow, data/jastrow-part{1,2}.jsonl, which
// credit Sefaria as the source). This script reads those files, strips the
// display HTML from each definition to plain text, and keeps every source
// sense (including nested senses), printed origin markers, and unmarked state.
// No entry is added or dropped. It is presented in the app as a published
// reference work (see the About screen).
//
// Usage:
//   node scripts/import-jastrow.mjs part1.jsonl part2.jsonl
import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { REVIEWED_HEBREW_SOURCE_MAPPINGS } from '../src/data/reviewedHebrewSourceMappings.js'

const SOURCE_REVISION = '2d20f977d628c455f66175e6d0a2dfb528c6d7ba'
const EXPECTED_SOURCE_HASHES = new Set([
  'ea6969f6e8b50b913517fd4fa6d7de7505452b02852535aeb4859a875ea4a0bb',
  '22c7da1dc41b833ed4cc0ab28348fc1ac19656dbd0d646262e48e758a05eb6b9'
])
const EXPECTED_ENTRY_COUNT = 32512
const EXPECTED_TOP_LEVEL_SENSES = 43428
const EXPECTED_NESTED_SENSES = 5703
const EXPECTED_SOURCE_GLOSSES = 28330
const EXPECTED_SENSE_LANGUAGE_MARKERS = 3
const ROOT_SYMBOL = /√/gu
const SECONDARY_ROOT = /\bsec\.?\s+r\.?\s+of\b/gi
const ROOT_MODEL = /^[\u05d0-\u05ea]{2,5}$/u
const HEBREW_ORIGIN_CODES = new Set(['he', 'bh', 'ar+he', 'he+ar', 'ar+bh'])
const SELECTED_RELATION_CODES = new Set(['und', ...HEBREW_ORIGIN_CODES])
const FINAL_TO_MEDIAL = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }

const STEM = '(?:Af|Afel|Aph|Pa|Parel|Pales|Palel|Palp|Palez|Peal|Pi|Pilp|Saf|Shaf|Shafel|Taf|Tafel|Ispe|Ispa|Isp|Ithpe|Ithpa|Ithp|Dithpe|Dispe|Difel|Nif|Hif|Hof)\\.?'
const RELATION_FAMILIES = [
  ['secondary-root', SECONDARY_ROOT, 'direct-root'],
  ['secondary-verb', /\bsec\.?\s+verb\s+of\b/gi, 'exact-target'],
  ['root-usage', /\b(?:use|occurrence)\s+of\s+(?:the\s+)?(?:root|stem)\s+[\u0590-\u05ff]/giu, 'exact-target'],
  ['root-in-lexeme', /\broot\s+in\b(?=\s+[\u0590-\u05ff])/giu, 'direct-root'],
  ['stem-declaration', /\(\s*stem\b(?=\s+[\u0590-\u05ff])/giu, 'direct-root'],
  ['verbal-stem', new RegExp(`\\b${STEM}(?:\\s+(?:noun|denom\\.))?\\s+of\\b`, 'gi'), 'exact-target'],
  ['participle', new RegExp(`\\b(?:part\\.|participle)(?:\\s+(?:pass\\.|f\\.|${STEM}))?\\s+of\\b`, 'gi'), 'exact-target'],
  ['infinitive', new RegExp(`\\b(?:inf\\.|infin\\.|infinitive)(?:\\s+${STEM})?\\s+of\\b`, 'gi'), 'exact-target'],
  ['imperative', /\b(?:imper\.|imperat\.|imperative|Imp\.)(?:\s+[A-Za-z.]+)?\s+of\b/gi, 'exact-target'],
  ['denominative', /\b(?:a\s+|as\s+a\s+|prob\.\s+a\s+|feigned\s+|jocular\s+|apparently\s+a\s+fictitious\s+)?(?:denom\.|denomin\.|denominative)\s+of\b/gi, 'exact-target'],
  ['derivational', /\b(?:deriv\.|derived)\s+of\b/gi, 'exact-target'],
  ['reduplication', /\b(?:reduplic\.|redupl\.)\s+of\b/gi, 'exact-target'],
  ['transposition', /\b(?:transpos\.|transp\.)\s+of\b/gi, 'exact-target'],
  ['inflection', /\b(?:pl\.|plur\.|fem\.|constr\.|pl\.\s+constr\.|part\.\s+f\.)\s+of\b/gi, 'exact-target'],
  ['orthographic-variant', /\b(?:(?:prob\.|perh\.|a|an|popular|hellenized|jocular|corruptions?)\s+)*(?:contr\.|contract\.|abbrev\.|abbr\.|apocop\.|apocope|corrupt\.|corruption|variant|Var\.|dimin\.|diminut\.|enlarg\.|enlargement|comp\.|compound|substitute|transl\.|rendit\.|rendition|form)\s+of\b/gi, 'explicit-exclusion'],
  ['comparison-prose', /\b(?:cmp\.|corresp\.|compare)\s+(?:the\s+)?(?:meanings?\s+)?of\b/gi, 'comparison'],
  ['root-hypothesis', /\b(?:prob\.\s+fr\.|fr\.|from|as\s+if\s+from|derivative\s+of)\s+(?:a\s+|the\s+)?root\s+[\u0590-\u05ff]/giu, 'manual-review'],
  ['conjectural-stem-derivation', /\bseems\s+to\s+be\s+a\s+derivative\s+of\s+a\s+stem\b(?=\s+[\u0590-\u05ff])/giu, 'manual-review']
]

const EXPECTED_RELATION_COUNTS = {
  'secondary-root': [72, 71],
  'secondary-verb': [4, 4],
  'root-usage': [31, 30],
  'root-in-lexeme': [1, 1],
  'stem-declaration': [1, 1],
  'verbal-stem': [302, 300],
  participle: [105, 99],
  infinitive: [40, 40],
  imperative: [27, 27],
  denominative: [622, 594],
  derivational: [12, 12],
  reduplication: [82, 82],
  transposition: [71, 70],
  inflection: [178, 174],
  'orthographic-variant': [503, 487],
  'comparison-prose': [17, 17],
  'root-hypothesis': [2, 2],
  'conjectural-stem-derivation': [1, 1]
}

// Jastrow's finite "secondary root" inventory was reviewed against the
// pinned source. These entries state the current headword itself is the
// secondary root. Keeping an allowlist makes new or malformed prose fail
// closed instead of silently turning a lexical surface into a root.
const REVIEWED_SECONDARY_HEADWORD_IDS = new Set([
  'A00330', 'A00995', 'A01021', 'A01097', 'A01698', 'A01898', 'A02244',
  'A02252', 'A02265', 'A02284', 'A02286', 'A02427', 'A02550', 'A02888',
  'A03361', 'B00942', 'B00962', 'D00980', 'G00582', 'G00698', 'H01302',
  'L00386', 'M00779', 'M00917', 'M02006', 'M02351', 'M02352', 'M02630',
  'M02753', 'M02760', 'N00464', 'N00515', 'N00533', 'O00227', 'O00905',
  'S01552', 'S01603', 'U01100', 'U02117', 'V00088', 'V00191', 'V00734',
  'V00845'
])
const REVIEWED_SECONDARY_FORMS = new Map([
  ['A00303', [{ letters: 'אגל' }]],
  ['A00542', [{ letters: 'אגי' }]],
  ['A01394', [{ letters: 'אנש' }]],
  ['A01855', [{ letters: 'אלל' }]],
  ['A02216', [{ letters: 'ינה', languageCode: 'bh' }]],
  ['A02240', [{ letters: 'אנץ' }, { letters: 'ענץ' }]],
  ['A03394', [{ letters: 'תאה' }, { letters: 'תאו' }]],
  ['A03408', [{ letters: 'אתן' }]],
  ['B00752', [{ letters: 'בית' }]],
  ['D00981', [{ letters: 'דצי' }]],
  ['H00609', [{ letters: 'חטט' }]],
  ['H01641', [{ letters: 'חרת' }]],
  ['I00030', [{ letters: 'טבי' }]],
  ['I00585', [{ letters: 'טסס' }]],
  ['M01659', [{ letters: 'מזר' }]],
  ['P00671', [{ letters: 'עקת' }]],
  ['Q00345', [{ letters: 'פרי' }]],
  ['R00391', [{ letters: 'צנק' }]],
  ['S01030', [{ letters: 'קנף' }]],
  ['V00978', [{ letters: 'תרי' }]]
])
const SQRT_AUTHORITATIVE_SECONDARY_IDS = new Set([
  'A00239', 'A02259', 'A03247', 'B00880', 'B01359'
])
const MALFORMED_SECONDARY_IDS = new Set(['B01007', 'C00299'])
const REVIEWED_SECONDARY_EXCLUSIONS = new Map([
  [
    'H01913',
    'embedded-secondary-form-describes-cited-form-not-entry-root'
  ]
])
const REVIEWED_ROOT_IN_FORMS = new Map([
  ['U01959', { letters: 'שרי', languageCode: 'bh' }]
])
const REVIEWED_STEM_DECLARATIONS = new Map([
  ['I00138', {
    languageCode: 'und',
    rootLetters: ['טה', 'טו'],
    comparisonLetters: ['טהר']
  }]
])
const LANGUAGE = {
  und: { label: 'Hebrew/Aramaic (unmarked)', lang: 'und-Hebr' },
  he: { label: 'Hebrew', lang: 'he' },
  bh: { label: 'Biblical Hebrew', lang: 'he' },
  ar: { label: 'Aramaic', lang: 'arc' },
  ab: { label: 'Arabic', lang: 'ar' },
  'ar+he': { label: 'Aramaic & Hebrew', lang: 'arc' },
  'he+ar': { label: 'Hebrew & Aramaic', lang: 'he' },
  'ar+bh': { label: 'Aramaic & Biblical Hebrew', lang: 'arc' }
}
const reviewedAliases = new Map(
  REVIEWED_HEBREW_SOURCE_MAPPINGS
    .filter((mapping) => mapping.dictionaryId === 'jastrow' && mapping.aliases?.length)
    .map((mapping) => [mapping.entryId, mapping.aliases])
)

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('usage: node scripts/import-jastrow.mjs <part1.jsonl> [part2.jsonl ...]')
  process.exit(1)
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
  '&rsquo;': '’', '&lsquo;': '‘', '&rdquo;': '”', '&ldquo;': '“'
}

function toText(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

function importSense(source) {
  const sense = {}
  const marker = toText(source.n)
  const def = toText(source.d)
  // Jastrow marks the compact lexical gloss in italics before its citation
  // prose. Retain that source-authored span separately so downstream search
  // never has to infer a meaning by slicing flattened references.
  const beforeFirstCitation = String(source.d || '').split(/<a\b[^>]*href=["']https?:/i)[0]
  const gloss = [...beforeFirstCitation.matchAll(/<i>([\s\S]*?)<\/i>/gi)]
    .map((match) => toText(match[1]))
    .filter(Boolean)
    .join('; ')
  const children = (source.s || []).map(importSense)
  const languageCode = normalizeLanguageCode(source.g?.language_code || source.g?.l)
  if (marker) sense.marker = marker
  if (def) sense.def = def
  if (gloss) sense.gloss = gloss
  if (languageCode) {
    sense.languageCode = languageCode
    sense.languageLabel = LANGUAGE[languageCode]?.label || languageCode
  }
  if (children.length > 0) sense.senses = children
  return sense
}

function normalizeLanguageCode(value) {
  if (!value) return null
  if (LANGUAGE[value]) return value
  const text = toText(value).toLowerCase()
  if (/\bb\.?\s*h\.?\b/.test(text)) return 'bh'
  if (/\bch\.?\b/.test(text)) return 'ar'
  if (/\bh\.?\b/.test(text)) return 'he'
  return null
}

function rootMentionRelation(text, markerIndex) {
  const prefix = text.slice(Math.max(0, markerIndex - 96), markerIndex)
  if (/\bcmp\.?\s*$/i.test(prefix)) return 'comparison'
  if (/\bcorresp\.?\s+to(?:\s+the\s+meanings?\s+of)?\s*$/i.test(prefix)) {
    return 'comparison'
  }
  return 'source-root'
}

function normalizeRootLetters(value) {
  const token = String(value || '').normalize('NFD').match(
    /[\u05d0-\u05ea](?:[\u0591-\u05c7]*[\u05d0-\u05ea])*[\u0591-\u05c7\u05be-]*/u
  )?.[0]
  if (!token) return ''
  return [...token]
    .filter((char) => /[\u05d0-\u05ea]/u.test(char))
    .map((char) => FINAL_TO_MEDIAL[char] || char)
    .join('')
}

function readRootToken(text, start) {
  const match = text.slice(start).match(
    /^\s*([\u05d0-\u05ea](?:[\u0591-\u05c7\u05d0-\u05ea\u05be-]*))/u
  )
  if (!match) return null
  return {
    value: match[1],
    letters: normalizeRootLetters(match[1]),
    start: start + match[0].indexOf(match[1]),
    end: start + match[0].length
  }
}

function localMarkerLanguage(text, markerIndex, inheritedCode) {
  const prefix = text.slice(0, markerIndex)
  if (
    /^\s*\(?\s*b\.?\s*h\.?\s*(?:[;,]|[\u0590-\u05ff-]+\s*,)\s*(?:Ispe\.?\s+of\s*)?$/iu.test(prefix)
  ) return 'bh'
  if (
    /^\s*\(?\s*h\.?\s*(?:[;,]|[\u0590-\u05ff-]+\s*,)\s*(?:Ispe\.?\s+of\s*)?$/iu.test(prefix)
  ) return 'he'
  return inheritedCode
}

function alternativeLanguage(text, start, inheritedCode) {
  const match = text.slice(start).match(/^\s*(b\.?\s*h\.?|h\.?|ch\.?|Ar\.?)\s*/iu)
  if (!match) return { languageCode: inheritedCode, end: start }
  return {
    languageCode: normalizeLanguageCode(match[1]) || inheritedCode,
    end: start + match[0].length
  }
}

function parseRootMarkers(text, scope) {
  const occurrences = []
  let printedIndex = 0
  for (const symbol of text.matchAll(ROOT_SYMBOL)) {
    const primary = readRootToken(text, symbol.index + symbol[0].length)
    if (!primary?.letters) continue
    const relation = rootMentionRelation(text, symbol.index)
    const primaryLanguage = localMarkerLanguage(text, symbol.index, scope.languageCode)
    const roots = [{ ...primary, languageCode: primaryLanguage }]
    let cursor = primary.end

    while (true) {
      const separator = text.slice(cursor).match(/^\s*(,|\bor\b|=)\s*/iu)
      if (!separator) break
      let tokenStart = cursor + separator[0].length
      let languageCode = primaryLanguage
      if (separator[1] === '=') {
        const override = alternativeLanguage(text, tokenStart, primaryLanguage)
        languageCode = override.languageCode
        tokenStart = override.end
      }
      const alternative = readRootToken(text, tokenStart)
      if (!alternative?.letters) break
      roots.push({ ...alternative, languageCode })
      cursor = alternative.end
    }

    const marker = text.slice(symbol.index, cursor).trim().replace(/^√\s+/u, '√')
    const occurrenceId = `${scope.key}:sqrt:${printedIndex}`
    for (let alternativeIndex = 0; alternativeIndex < roots.length; alternativeIndex++) {
      const root = roots[alternativeIndex]
      occurrences.push({
        letters: root.letters,
        marker,
        relation,
        languageCode: root.languageCode,
        languageLabel: LANGUAGE[root.languageCode]?.label || root.languageCode,
        provenance: [{
          occurrenceId,
          sourceLocation: scope.sourceLocation,
          ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
          printedMarker: text.slice(symbol.index, primary.end).trim().replace(/^√\s+/u, '√'),
          printedForm: root.value,
          alternativeIndex
        }]
      })
    }
    printedIndex++
  }
  return occurrences
}

function sourceTextWithLinks(html) {
  const text = []
  const links = []
  let activeLink = null
  let textLength = 0
  function append(value) {
    text.push(value)
    textLength += value.length
  }
  const input = String(html || '')
  const tokenPattern = /<[^>]*>|&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);|[^<&]+|[<&]/giu
  for (const token of input.matchAll(tokenPattern)) {
    const value = token[0]
    const opening = value.match(/^<a\b[^>]*href=["']#rid:([^"']+)["'][^>]*>$/i)
    if (opening) {
      append(' ')
      activeLink = { id: opening[1], start: textLength }
      continue
    }
    if (/^<\/a\s*>$/i.test(value)) {
      if (activeLink) {
        activeLink.end = textLength
        links.push(activeLink)
        activeLink = null
      }
      append(' ')
      continue
    }
    if (
      value.startsWith('<') ||
      /^&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]+);$/iu.test(value)
    ) append(' ')
    else append(value)
  }
  if (activeLink) links.push({ ...activeLink, end: textLength })
  return { text: text.join(''), links }
}

function sourceScopes(sourceEntry, entryLanguageCode) {
  const scopes = []
  if (sourceEntry.li) {
    scopes.push({
      key: 'li',
      sourceLocation: 'language-info',
      html: sourceEntry.li,
      languageCode: entryLanguageCode
    })
  }
  function visit(senses, path = [], inheritedCode = entryLanguageCode) {
    for (let index = 0; index < (senses || []).length; index++) {
      const sense = senses[index]
      const nextPath = [...path, index + 1]
      const languageCode = normalizeLanguageCode(
        sense.g?.language_code || sense.g?.l
      ) || inheritedCode
      if (sense.d) {
        scopes.push({
          key: `sense:${nextPath.join('.')}`,
          sourceLocation: 'sense',
          sensePath: nextPath.join('.'),
          html: sense.d,
          languageCode
        })
      }
      visit(sense.s, nextPath, languageCode)
    }
  }
  visit(sourceEntry.c?.s)
  return scopes
}

function exactLinkedTargets(source, match) {
  const end = match.index + match[0].length
  let firstIndex = source.links.findIndex((link) => link.end >= end - 1)
  if (firstIndex < 0) return []
  const first = source.links[firstIndex]
  if (first.start > end) {
    const gap = source.text.slice(end, first.start)
    if (!/^\s*(?:(?:the|a|an|b\.?\s*h\.?|h\.?|ch\.?)\s*)?$/iu.test(gap)) return []
  }
  const targets = [first.id]
  let previous = first
  for (let index = firstIndex + 1; index < source.links.length; index++) {
    const link = source.links[index]
    const gap = source.text.slice(previous.end, link.start)
    if (!/^\s*(?:,|or|and|\/)\s*$/iu.test(gap)) break
    targets.push(link.id)
    previous = link
  }
  return [...new Set(targets)]
}

function dedupeRootMentions(mentions) {
  const byKey = new Map()
  for (const mention of mentions) {
    const key = `${mention.languageCode}:${mention.letters}:${mention.relation}`
    const existing = byKey.get(key)
    if (existing) {
      existing.provenance.push(...mention.provenance)
    } else {
      byKey.set(key, { ...mention, provenance: [...mention.provenance] })
    }
  }
  return [...byKey.values()]
}

function reviewedSecondaryForms(sourceEntry, scope) {
  if (MALFORMED_SECONDARY_IDS.has(sourceEntry.id)) return null
  if (SQRT_AUTHORITATIVE_SECONDARY_IDS.has(sourceEntry.id)) return []
  const reviewed = REVIEWED_SECONDARY_FORMS.get(sourceEntry.id)
  if (reviewed) return reviewed.map((form) => ({
    ...form,
    languageCode: form.languageCode || scope.languageCode
  }))
  if (!REVIEWED_SECONDARY_HEADWORD_IDS.has(sourceEntry.id)) {
    throw new Error(`${sourceEntry.id}: unreviewed secondary-root statement`)
  }
  const letters = normalizeRootLetters(sourceEntry.hw)
  if (!ROOT_MODEL.test(letters)) {
    throw new Error(`${sourceEntry.id}: reviewed secondary-root headword is outside the root model`)
  }
  return [{ letters, languageCode: scope.languageCode }]
}

function declaredRootUsageLetters(text, match) {
  const source = text.slice(match.index)
  const token = source.match(
    /\b(?:use|occurrence)\s+of\s+(?:the\s+)?(?:root|stem)\s+([\u05d0-\u05ea][\u0591-\u05c7\u05d0-\u05ea\u05be-]*)/iu
  )?.[1]
  return normalizeRootLetters(token)
}

const scannedPrintedMarkerKeys = new Set()

function scanSourceEntry(sourceEntry, entryLanguageCode) {
  const markerMentions = []
  const secondaryMentions = []
  const relations = []
  const scopes = sourceScopes(sourceEntry, entryLanguageCode)

  for (const scope of scopes) {
    const source = sourceTextWithLinks(scope.html)
    const scopeMarkerMentions = parseRootMarkers(source.text, scope)
    const printedSymbols = [...source.text.matchAll(ROOT_SYMBOL)].length
    const originalSymbols = [...String(scope.html).matchAll(ROOT_SYMBOL)].length
    if (printedSymbols !== originalSymbols) {
      throw new Error(
        `${sourceEntry.id}:${scope.key}: HTML tokenizer retained ${printedSymbols} of ${originalSymbols} √ markers`
      )
    }
    const parsedSymbols = new Set(scopeMarkerMentions.flatMap((mention) =>
      mention.provenance.map((record) => record.occurrenceId)
    )).size
    if (printedSymbols !== parsedSymbols) {
      throw new Error(
        `${sourceEntry.id}:${scope.key}: parsed ${parsedSymbols} of ${printedSymbols} √ markers`
      )
    }
    for (let index = 0; index < printedSymbols; index++) {
      scannedPrintedMarkerKeys.add(`${sourceEntry.id}:${scope.key}:sqrt:${index}`)
    }
    markerMentions.push(...scopeMarkerMentions)
    if (!SELECTED_RELATION_CODES.has(entryLanguageCode)) continue
    // Match the independent finite-inventory audit exactly. Replacing with
    // equal-width spaces keeps #rid link offsets valid for target resolution.
    const relationSource = {
      ...source,
      text: source.text.replace(/&[^;]+;/g, (entity) => ' '.repeat(entity.length))
    }

    for (const [type, pattern, policy] of RELATION_FAMILIES) {
      pattern.lastIndex = 0
      let ordinal = 0
      for (const match of relationSource.text.matchAll(pattern)) {
        const relation = {
          occurrenceId: `${scope.key}:${type}:${ordinal}`,
          type,
          sourceLocation: scope.sourceLocation,
          ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
          languageCode: scope.languageCode,
          marker: match[0].replace(/\s+/g, ' ').trim(),
          targetIds: exactLinkedTargets(relationSource, match),
          resolution: policy
        }

        if (type === 'secondary-root') {
          const reviewedExclusion = REVIEWED_SECONDARY_EXCLUSIONS.get(sourceEntry.id)
          const forms = reviewedExclusion ? null : reviewedSecondaryForms(sourceEntry, scope)
          if (reviewedExclusion) {
            relation.resolution = 'explicit-exclusion'
            relation.exclusionReason = reviewedExclusion
          } else if (forms === null) {
            relation.resolution = 'explicit-exclusion'
            relation.exclusionReason = 'malformed-source-statement'
          } else if (forms.length === 0) {
            const direct = scopeMarkerMentions.filter((mention) => mention.relation === 'source-root')
            if (direct.length === 0) {
              throw new Error(`${sourceEntry.id}:${scope.key}: secondary root lacks its authoritative √ marker`)
            }
            relation.rootLetters = [...new Set(direct.map((mention) => mention.letters))]
          } else {
            relation.rootLetters = forms.map((form) => form.letters)
            for (const form of forms) {
              secondaryMentions.push({
                letters: form.letters,
                marker: relation.marker,
                relation: 'secondary-root',
                languageCode: form.languageCode,
                languageLabel: LANGUAGE[form.languageCode]?.label || form.languageCode,
                provenance: [{
                  occurrenceId: relation.occurrenceId,
                  sourceLocation: scope.sourceLocation,
                  ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
                  reviewedForm: true
                }]
              })
            }
          }
        } else if (type === 'root-usage') {
          const letters = declaredRootUsageLetters(relationSource.text, match)
          if (!ROOT_MODEL.test(letters)) {
            relation.resolution = 'explicit-exclusion'
            relation.exclusionReason = 'declared-root-outside-model'
          } else {
            relation.resolution = 'direct-root'
            relation.rootLetters = [letters]
            secondaryMentions.push({
              letters,
              marker: relation.marker,
              relation: 'root-usage',
              languageCode: scope.languageCode,
              languageLabel: LANGUAGE[scope.languageCode]?.label || scope.languageCode,
              provenance: [{
                occurrenceId: relation.occurrenceId,
                sourceLocation: scope.sourceLocation,
                ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
                sourceDeclaredRoot: true
              }]
            })
          }
        } else if (type === 'root-in-lexeme') {
          const reviewed = REVIEWED_ROOT_IN_FORMS.get(sourceEntry.id)
          if (!reviewed) {
            relation.resolution = 'explicit-exclusion'
            relation.exclusionReason = 'unreviewed-root-in-lexeme-statement'
          } else {
            relation.resolution = 'direct-root'
            relation.rootLetters = [reviewed.letters]
            secondaryMentions.push({
              letters: reviewed.letters,
              marker: relation.marker,
              relation: 'root-in-lexeme',
              languageCode: reviewed.languageCode,
              languageLabel: LANGUAGE[reviewed.languageCode]?.label || reviewed.languageCode,
              provenance: [{
                occurrenceId: relation.occurrenceId,
                sourceLocation: scope.sourceLocation,
                ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
                reviewedForm: true
              }]
            })
          }
        } else if (type === 'stem-declaration') {
          const reviewed = REVIEWED_STEM_DECLARATIONS.get(sourceEntry.id)
          if (!reviewed) {
            relation.resolution = 'explicit-exclusion'
            relation.exclusionReason = 'unreviewed-stem-declaration'
          } else {
            relation.resolution = 'direct-root'
            relation.rootLetters = reviewed.rootLetters
            relation.comparisonRootLetters = reviewed.comparisonLetters
            for (const letters of reviewed.rootLetters) {
              secondaryMentions.push({
                letters,
                marker: relation.marker,
                relation: 'stem-declaration',
                languageCode: reviewed.languageCode,
                languageLabel: LANGUAGE[reviewed.languageCode]?.label || reviewed.languageCode,
                provenance: [{
                  occurrenceId: relation.occurrenceId,
                  sourceLocation: scope.sourceLocation,
                  ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
                  reviewedForm: true
                }]
              })
            }
            for (let index = 0; index < reviewed.comparisonLetters.length; index++) {
              const letters = reviewed.comparisonLetters[index]
              secondaryMentions.push({
                letters,
                marker: `cmp. ${letters}`,
                relation: 'comparison',
                languageCode: reviewed.languageCode,
                languageLabel: LANGUAGE[reviewed.languageCode]?.label || reviewed.languageCode,
                provenance: [{
                  occurrenceId: `${relation.occurrenceId}:comparison:${index}`,
                  sourceLocation: scope.sourceLocation,
                  ...(scope.sensePath ? { sensePath: scope.sensePath } : {}),
                  reviewedForm: true
                }]
              })
            }
          }
        } else if (policy === 'exact-target' && relation.targetIds.length === 0) {
          relation.resolution = 'explicit-exclusion'
          relation.exclusionReason = 'no-exact-linked-target'
        } else if (policy === 'explicit-exclusion') {
          relation.exclusionReason = 'unsafe-orthographic-or-variant-relation'
        } else if (policy === 'manual-review') {
          relation.exclusionReason = 'conjectural-root-prose'
        }
        relations.push(relation)
        ordinal++
      }
    }
  }

  return {
    markerMentions: dedupeRootMentions(markerMentions),
    secondaryMentions: dedupeRootMentions(secondaryMentions),
    relations
  }
}

function flattenSenseText(senses, output = []) {
  for (const sense of senses) {
    if (sense.def) output.push([sense.marker, sense.def].filter(Boolean).join(' '))
    if (sense.senses) flattenSenseText(sense.senses, output)
  }
  return output
}

function countImportedSenses(senses, depth = 0, counts = { topLevel: 0, nested: 0, glosses: 0 }) {
  for (const sense of senses || []) {
    if (depth === 0) counts.topLevel++
    else counts.nested++
    if (sense.gloss) counts.glosses++
    countImportedSenses(sense.senses, depth + 1, counts)
  }
  return counts
}

function countSenseLanguageMarkers(senses) {
  let count = 0
  for (const sense of senses || []) {
    if (sense.languageCode) count++
    count += countSenseLanguageMarkers(sense.senses)
  }
  return count
}

const entries = []
const seenIds = new Set()
const languageCodeCounts = {}
const sourceLanguageCodeCounts = {}
const seenSourceHashes = new Set()
let senseLanguageMarkers = 0
let entriesWithoutDefinition = 0
for (const f of files) {
  const sourceBuffer = readFileSync(f)
  const sourceHash = createHash('sha256').update(sourceBuffer).digest('hex')
  if (!EXPECTED_SOURCE_HASHES.has(sourceHash)) {
    throw new Error(`${f}: does not match the pinned Jastrow source revision ${SOURCE_REVISION}`)
  }
  if (seenSourceHashes.has(sourceHash)) throw new Error(`${f}: duplicate pinned source part`)
  seenSourceHashes.add(sourceHash)
  const lines = sourceBuffer.toString('utf8').split(/\r?\n/).filter((line) => line.trim())
  for (const [lineIndex, line] of lines.entries()) {
    let o
    try {
      o = JSON.parse(line)
    } catch (error) {
      throw new Error(`${f}:${lineIndex + 1}: invalid JSON: ${error.message}`)
    }
    if (!o.id || !o.hw) throw new Error(`${f}:${lineIndex + 1}: entry lacks id or headword`)
    if (seenIds.has(o.id)) throw new Error(`duplicate Jastrow id: ${o.id}`)
    seenIds.add(o.id)

    const sourceLanguageCode = o.g?.l
    const languageCode = sourceLanguageCode || 'und'
    const language = LANGUAGE[languageCode]
    if (!language) throw new Error(`${o.id}: unknown Jastrow language code: ${languageCode}`)
    languageCodeCounts[languageCode] = (languageCodeCounts[languageCode] || 0) + 1
    const sourceCountKey = sourceLanguageCode || 'unmarked'
    sourceLanguageCodeCounts[sourceCountKey] = (sourceLanguageCodeCounts[sourceCountKey] || 0) + 1

    const senses = (o.c?.s || []).map(importSense)
    senseLanguageMarkers += countSenseLanguageMarkers(senses)
    const def = flattenSenseText(senses).join(' ').trim()
    if (!def) entriesWithoutDefinition++
    const rec = {
      id: o.id,
      lemma: o.hw,
      def,
      senses,
      languageCode,
      languageLabel: language.label,
      lang: language.lang,
      languageClassification: sourceLanguageCode ? 'printed-origin-marker' : 'unmarked'
    }
    const sourceAudit = scanSourceEntry(o, languageCode)
    const rootMentions = dedupeRootMentions([
      ...sourceAudit.markerMentions,
      ...sourceAudit.secondaryMentions
    ])
    if (rootMentions.length > 0) rec.sourceRootMentions = rootMentions
    if (sourceAudit.relations.length > 0) rec.rootRelations = sourceAudit.relations
    const languageInfo = toText(o.li)
    if (languageInfo) rec.languageInfo = languageInfo
    if (o.p) rec.page = o.p
    const aliases = reviewedAliases.get(o.id)
    if (aliases) rec.aliases = aliases
    entries.push(rec)
  }
}

function assignmentKey(languageCode, letters) {
  return `${languageCode}:${letters}`
}

function addUniqueEvidence(root, evidence) {
  const key = JSON.stringify(evidence)
  if (!root._evidenceKeys.has(key)) {
    root._evidenceKeys.add(key)
    root.evidence.push(evidence)
  }
}

function resolveSourceRoots(records) {
  const rootsByEntry = new Map(records.map((entry) => [entry.id, new Map()]))

  function ensureRoot(entryId, source, evidence = null) {
    if (!source?.letters || !source?.languageCode) return false
    const roots = rootsByEntry.get(entryId)
    const key = assignmentKey(source.languageCode, source.letters)
    let root = roots.get(key)
    const added = !root
    if (!root) {
      root = {
        letters: source.letters,
        languageCode: source.languageCode,
        languageLabel: LANGUAGE[source.languageCode]?.label || source.languageCode,
        relation: source.relation || 'exact-target-root',
        marker: source.marker || null,
        provenance: [...(source.provenance || [])],
        evidence: [],
        _evidenceKeys: new Set()
      }
      roots.set(key, root)
    }
    if (evidence) addUniqueEvidence(root, evidence)
    return added
  }

  for (const entry of records) {
    for (const mention of entry.sourceRootMentions || []) {
      if (mention.relation === 'comparison') continue
      ensureRoot(entry.id, mention, {
        type: mention.relation,
        provenance: mention.provenance
      })
    }
  }

  let changed = true
  let passes = 0
  while (changed) {
    changed = false
    passes++
    if (passes > records.length) throw new Error('Jastrow root relation graph did not converge')
    for (const entry of records) {
      for (const relation of entry.rootRelations || []) {
        if (relation.resolution !== 'exact-target' || relation.targetIds.length === 0) continue
        for (const targetId of relation.targetIds) {
          for (const targetRoot of rootsByEntry.get(targetId)?.values() || []) {
            changed = ensureRoot(entry.id, {
              letters: targetRoot.letters,
              languageCode: relation.languageCode,
              relation: 'exact-target-root'
            }) || changed
          }
        }
      }
    }
  }

  for (const entry of records) {
    for (const relation of entry.rootRelations || []) {
      if (relation.resolution !== 'exact-target') continue
      const resolvedTargets = relation.targetIds.filter(
        (targetId) => (rootsByEntry.get(targetId)?.size || 0) > 0
      )
      if (resolvedTargets.length === 0) {
        relation.resolution = 'explicit-exclusion'
        relation.exclusionReason = 'exact-target-has-no-established-root'
        continue
      }
      relation.resolvedTargetIds = resolvedTargets
      relation.rootLetters = [...new Set(resolvedTargets.flatMap((targetId) =>
        [...rootsByEntry.get(targetId).values()].map((root) => root.letters)
      ))]
      for (const targetId of resolvedTargets) {
        for (const targetRoot of rootsByEntry.get(targetId).values()) {
          const root = rootsByEntry.get(entry.id).get(
            assignmentKey(relation.languageCode, targetRoot.letters)
          )
          addUniqueEvidence(root, {
            type: relation.type,
            occurrenceId: relation.occurrenceId,
            targetId
          })
        }
      }
    }

    const roots = [...rootsByEntry.get(entry.id).values()].map((root) => {
      const { _evidenceKeys, ...publicRoot } = root
      if (!publicRoot.marker) delete publicRoot.marker
      if (publicRoot.provenance.length === 0) delete publicRoot.provenance
      return publicRoot
    })
    if (roots.length > 0) {
      entry.sourceRoots = roots
      entry.root = roots[0]
    }
  }
  return passes
}

const relationResolutionPasses = resolveSourceRoots(entries)
const relationInventory = {}
for (const [type] of RELATION_FAMILIES) {
  const matching = entries.flatMap((entry) =>
    (entry.rootRelations || [])
      .filter((relation) => relation.type === type)
      .map((relation) => ({ entry, relation }))
  )
  const expected = EXPECTED_RELATION_COUNTS[type]
  const entryCount = new Set(matching.map(({ entry }) => entry.id)).size
  if (matching.length !== expected[0] || entryCount !== expected[1]) {
    throw new Error(
      `${type}: expected ${expected[0]} occurrences / ${expected[1]} entries, ` +
      `found ${matching.length} / ${entryCount}`
    )
  }
  relationInventory[type] = {
    occurrences: matching.length,
    entries: entryCount,
    outcomes: matching.reduce((counts, { relation }) => {
      counts[relation.resolution] = (counts[relation.resolution] || 0) + 1
      return counts
    }, {})
  }
}

const allRootMentions = entries.flatMap((entry) =>
  (entry.sourceRootMentions || []).map((mention) => ({ entry, mention }))
)
const printedMarkerProvenance = allRootMentions.flatMap(({ entry, mention }) =>
  (mention.provenance || [])
    .filter((record) => record.occurrenceId.includes(':sqrt:'))
    .map((record) => ({ entry, mention, record }))
)
const printedMarkerKeys = new Set(printedMarkerProvenance.map(({ entry, record }) =>
  `${entry.id}:${record.occurrenceId}`
))
const directRootMentions = allRootMentions.filter(
  ({ mention }) => mention.relation !== 'comparison'
)
const comparisonRootMentions = allRootMentions.filter(
  ({ mention }) => mention.relation === 'comparison'
)
const sourceRootAssignments = entries.flatMap((entry) =>
  (entry.sourceRoots || []).map((root) => ({ entry, root }))
)
const explicitRootCounts = {
  entriesWithPrintedMarkers: new Set(printedMarkerProvenance.map(({ entry }) => entry.id)).size,
  printedMarkers: printedMarkerKeys.size,
  languageInfoPrintedMarkers: new Set(printedMarkerProvenance
    .filter(({ record }) => record.sourceLocation === 'language-info')
    .map(({ entry, record }) => `${entry.id}:${record.occurrenceId}`)).size,
  sensePrintedMarkers: new Set(printedMarkerProvenance
    .filter(({ record }) => record.sourceLocation === 'sense')
    .map(({ entry, record }) => `${entry.id}:${record.occurrenceId}`)).size,
  expandedAlternatives: printedMarkerProvenance.filter(
    ({ record }) => record.alternativeIndex > 0
  ).length,
  relationValidDirectRoots: directRootMentions.length,
  comparisonOnlyRoots: comparisonRootMentions.length,
  printedComparisonOnlyRoots: comparisonRootMentions.filter(({ mention }) =>
    mention.provenance?.some((record) => record.occurrenceId.includes(':sqrt:'))
  ).length,
  reviewedStemComparisonRoots: comparisonRootMentions.filter(({ mention }) =>
    mention.provenance?.some((record) => record.occurrenceId.includes(':stem-declaration:'))
  ).length,
  secondaryRootMappings: directRootMentions.filter(
    ({ mention }) => mention.relation === 'secondary-root'
  ).length,
  entriesWithSourceRoots: new Set(sourceRootAssignments.map(({ entry }) => entry.id)).size,
  sourceRootAssignments: sourceRootAssignments.length,
  exactTargetAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence.some((evidence) => Boolean(evidence.targetId))
  ).length,
  directRootUsageAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence.some((evidence) => evidence.type === 'root-usage')
  ).length,
  rootInLexemeAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence.some((evidence) => evidence.type === 'root-in-lexeme')
  ).length,
  stemDeclarationAssignments: sourceRootAssignments.filter(({ root }) =>
    root.evidence.some((evidence) => evidence.type === 'stem-declaration')
  ).length,
  outOfModelDirectRoots: directRootMentions.filter(
    ({ mention }) => !ROOT_MODEL.test(mention.letters)
  ).length
}

if (seenSourceHashes.size !== EXPECTED_SOURCE_HASHES.size) {
  throw new Error(`both pinned Jastrow source parts from ${SOURCE_REVISION} are required`)
}
if (entries.length !== EXPECTED_ENTRY_COUNT) {
  throw new Error(`expected ${EXPECTED_ENTRY_COUNT} pinned Jastrow entries, found ${entries.length}`)
}
const byId = new Map(entries.map((entry) => [entry.id, entry]))
const senseCounts = entries.reduce(
  (counts, entry) => countImportedSenses(entry.senses, 0, counts),
  { topLevel: 0, nested: 0, glosses: 0 }
)
if (
  senseCounts.topLevel !== EXPECTED_TOP_LEVEL_SENSES ||
  senseCounts.nested !== EXPECTED_NESTED_SENSES ||
  senseCounts.glosses !== EXPECTED_SOURCE_GLOSSES
) {
  throw new Error(
    `pinned Jastrow sense counts changed (${senseCounts.topLevel} top-level, ` +
    `${senseCounts.nested} nested, ${senseCounts.glosses} source glosses)`
  )
}
if (byId.get('B00486')?.languageCode !== 'und') {
  throw new Error('B00486 must remain unmarked instead of receiving an invented language classification')
}
if (byId.get('B00487')?.languageCode !== 'ar') {
  throw new Error('B00487 must retain the source Aramaic classification')
}
if (!byId.get('B00487')?.senses.some((sense) => /\bto stir\b/i.test(sense.def || ''))) {
  throw new Error('B00487 must retain its later published “to stir” sense')
}
if (byId.get('B00486')?.senses[2]?.gloss !== 'to stir, to go to the bottom of a thing') {
  throw new Error('B00486 must retain its source-authored second lexical gloss')
}
if (byId.get('B00487')?.senses[1]?.gloss !== 'to stir') {
  throw new Error('B00487 must retain its source-authored second lexical gloss')
}
if (
  byId.get('B00486')?.root?.letters !== 'בח' ||
  !byId.get('B00486')?.sourceRootMentions?.some((mention) =>
    mention.letters === 'בח' && mention.marker === '√בח' && mention.relation === 'source-root'
  )
) {
  throw new Error(
    `B00486 must retain Jastrow’s exact source root marker √בח: ` +
    JSON.stringify(byId.get('B00486')?.sourceRootMentions || [])
  )
}
if (
  explicitRootCounts.printedMarkers !== 223 ||
  explicitRootCounts.languageInfoPrintedMarkers !== 101 ||
  explicitRootCounts.sensePrintedMarkers !== 122
) {
  throw new Error(
    `the pinned 101 language-info and 122 sense-level √ markers changed: ` +
    JSON.stringify({
      ...explicitRootCounts,
      scanned: scannedPrintedMarkerKeys.size,
      missing: [...scannedPrintedMarkerKeys].filter((key) => !printedMarkerKeys.has(key))
    })
  )
}
if (
  !byId.get('B00479')?.sourceRootMentions?.some((mention) =>
    mention.letters === 'בה' && mention.relation === 'comparison'
  ) ||
  !['בו', 'בה', 'בל'].every((letters) =>
    byId.get('B00880')?.sourceRoots?.some((root) => root.letters === letters)
  ) ||
  byId.get('B00880')?.sourceRoots?.some((root) => root.letters === 'מל')
) {
  throw new Error('Jastrow top-level, alternative, or comparison root handling regressed')
}
if (
  !byId.get('U01959')?.sourceRoots?.some((root) =>
    root.letters === 'שרי' &&
    root.languageCode === 'bh' &&
    root.evidence?.some((evidence) => evidence.type === 'root-in-lexeme')
  ) ||
  !byId.get('U01959')?.rootRelations?.some((relation) =>
    relation.type === 'root-in-lexeme' &&
    relation.resolution === 'direct-root' &&
    relation.sourceLocation === 'language-info'
  )
) {
  throw new Error('U01959 must retain its reviewed Biblical-Hebrew root-in-lexeme statement')
}
if (
  !['טה', 'טו'].every((letters) =>
    byId.get('I00138')?.sourceRoots?.some((root) =>
      root.letters === letters &&
      root.languageCode === 'und' &&
      root.evidence?.some((evidence) => evidence.type === 'stem-declaration')
    )
  ) ||
  byId.get('I00138')?.sourceRoots?.some((root) => root.letters === 'טהר') ||
  !byId.get('I00138')?.sourceRootMentions?.some((mention) =>
    mention.letters === 'טהר' && mention.relation === 'comparison'
  )
) {
  throw new Error('I00138 must retain טה and טו as roots while excluding comparison-only טהר')
}
if (
  !byId.get('H01295')?.rootRelations?.some((relation) =>
    relation.type === 'conjectural-stem-derivation' &&
    relation.resolution === 'manual-review' &&
    relation.exclusionReason === 'conjectural-root-prose'
  ) ||
  byId.get('H01295')?.sourceRoots?.some((root) => root.letters === 'חסס')
) {
  throw new Error('H01295 conjectural stem חסס must remain typed and excluded')
}
if (
  byId.get('B01007')?.rootRelations?.some((relation) =>
    relation.type === 'secondary-root' && relation.resolution !== 'explicit-exclusion'
  ) ||
  byId.get('C00299')?.rootRelations?.filter((relation) =>
    relation.type === 'secondary-root' && relation.resolution === 'explicit-exclusion'
  ).length !== 2
) {
  throw new Error('malformed secondary-root prose did not fail closed')
}
if (senseLanguageMarkers !== EXPECTED_SENSE_LANGUAGE_MARKERS) {
  throw new Error(`expected ${EXPECTED_SENSE_LANGUAGE_MARKERS} sense-level language markers, found ${senseLanguageMarkers}`)
}
if (!entries.some((entry) => entry.senses.some((sense) => sense.senses?.length))) {
  throw new Error('nested Jastrow senses were not retained')
}

const out = {
  work: "A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature (Marcus Jastrow, 1903; public domain)",
  conversion:
    'Underlying 1903 work is public domain; Sefaria digitization distributed by the pinned Jastrow PWA under CC BY-NC 4.0. Display HTML is stripped to plain text while source sense boundaries, printed origin markers, unmarked state, and root-marker relations are retained by scripts/import-jastrow.mjs. Printed origin fragments are not treated as complete row-level language metadata.',
  source: 'https://github.com/UniquePixels/jastrow',
  sourceRevision: SOURCE_REVISION,
  license: 'CC BY-NC 4.0 digitization; underlying 1903 work public domain',
  languageCodeCounts,
  sourceLanguageCodeCounts,
  senseCounts: {
    ...senseCounts,
    total: senseCounts.topLevel + senseCounts.nested
  },
  explicitRootCounts,
  rootRelationInventory: relationInventory,
  rootRelationResolutionPasses: relationResolutionPasses,
  senseLanguageMarkers,
  entriesWithoutDefinition,
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'jastrow.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
