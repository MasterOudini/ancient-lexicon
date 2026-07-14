// Imports a deliberately conservative OCR-derived subset of Edgar H.
// Sturtevant's A Hittite Glossary (second edition, 1936) into
// public/dicts/hittite-sturtevant.json.
//
// Internet Archive records this scan as public domain after a HathiTrust
// rights review. The importer refuses to write anything unless that exact
// statement is still present in the live or supplied metadata. The book is a
// historical glossary, not current scholarship: only high-confidence,
// lowercase Hittite heads with a short, positively English first quoted gloss
// are retained. Reconstructions, uncertainty marks, logograms, non-English
// glosses and ambiguous OCR are reported and dropped.
//
// Usage:
//   node scripts/import-sturtevant-hittite.mjs [djvu.xml] [metadata.json]
//
// With no arguments both files are fetched from Internet Archive. Supplying a
// local DjVuXML and/or metadata snapshot makes review and reproduction easier.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const IDENTIFIER = 'hittiteglossary00stur'
const DETAILS_URL = `https://archive.org/details/${IDENTIFIER}`
const DOWNLOAD_BASE = `https://archive.org/download/${IDENTIFIER}`
const XML_URL = `${DOWNLOAD_BASE}/${IDENTIFIER}_djvu.xml`
const METADATA_URL = `https://archive.org/metadata/${IDENTIFIER}`
const EXPECTED_RIGHTS = 'Copyright review: Public domain according to HathiTrust rights database'
const FIRST_OBJECT = 21
const LAST_OBJECT = 192
const MAX_ENTRIES = 702

const here = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(here, '..')

async function loadInput(input, fallbackUrl, label) {
  if (input) {
    const path = resolve(input)
    if (!existsSync(path)) throw new Error(`${label} file does not exist: ${path}`)
    const bytes = readFileSync(path)
    return { bytes, text: bytes.toString('utf8') }
  }

  const response = await fetch(fallbackUrl, {
    headers: { 'user-agent': 'Ancient Lexicon Sturtevant importer' }
  })
  if (!response.ok) throw new Error(`${label} request failed (${response.status}): ${fallbackUrl}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  return { bytes, text: bytes.toString('utf8') }
}

const decodeXml = (value) =>
  value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

function parseWords(fragment) {
  const words = []
  for (const match of fragment.matchAll(/<WORD\b([^>]*)>([\s\S]*?)<\/WORD>/g)) {
    const attrs = match[1]
    const coords = attrs.match(/\bcoords="(\d+),(\d+),(\d+),(\d+)"/)
    const confidence = attrs.match(/\bx-confidence="(\d+)"/)
    const text = decodeXml(match[2].replace(/<[^>]+>/g, '')).trim()
    if (!text || !coords || !confidence) continue
    words.push({
      text,
      x: Number(coords[1]),
      y: Number(coords[2]),
      confidence: Number(confidence[1])
    })
  }
  return words
}

function parseLine(fragment) {
  const tokens = parseWords(fragment)
  return {
    tokens,
    text: tokens.map((token) => token.text).join(' ').replace(/\s+/g, ' ').trim(),
    firstX: tokens[0]?.x ?? Number.POSITIVE_INFINITY,
    firstY: tokens[0]?.y ?? 0
  }
}

function parseObjects(xml) {
  const objects = []
  for (const match of xml.matchAll(/<OBJECT\b[^>]*>([\s\S]*?)<\/OBJECT>/g)) {
    // Do not trust PARAGRAPH boundaries. On at least printed pages 41 and
    // 141, OCR merges the entire dictionary page into one paragraph. LINE
    // indentation remains stable and preserves every head boundary.
    const lines = []
    for (const line of match[1].matchAll(/<LINE\b[^>]*>([\s\S]*?)<\/LINE>/g)) {
      const parsed = parseLine(line[1])
      if (parsed.text) lines.push(parsed)
    }
    objects.push({ lines })
  }
  return objects
}

function appendLine(row, line) {
  const previous = row.tokens.at(-1)
  const first = line.tokens[0]
  // A line-final printed hyphen followed by a lowercase continuation is OCR
  // layout, not lexical punctuation. Rejoining it prevents "trans- gress"
  // from failing the English gate while retaining the lower confidence.
  if (previous?.text.endsWith('-') && first && /^\p{Ll}/u.test(first.text)) {
    previous.text = previous.text.slice(0, -1) + first.text
    previous.confidence = Math.min(previous.confidence, first.confidence)
    row.tokens.push(...line.tokens.slice(1))
  } else {
    row.tokens.push(...line.tokens)
  }
  row.text = row.tokens.map((token) => token.text).join(' ').replace(/\s+/g, ' ').trim()
}

function hangingIndentBoundary(lines, objectIndex) {
  const starts = lines
    .map((line) => line.firstX)
    .filter((x) => x >= 200 && x < 1000)
    .sort((a, b) => a - b)

  // The audited pages have two horizontal clusters: entry starts and hanging
  // continuation lines. Requiring at least three lines on both sides prevents
  // a lone marginal mark or centered fragment from defining the boundary.
  for (let index = 2; index < starts.length - 3; index += 1) {
    if (starts[index + 1] - starts[index] >= 55) return starts[index]
  }
  throw new Error(`no audited hanging-indent gap in OBJECT[${objectIndex}]: ${starts.join(',')}`)
}

function groupRows(objects, report) {
  const rows = []
  let current = null
  let reachedNumerals = false

  for (let objectIndex = FIRST_OBJECT; objectIndex <= LAST_OBJECT; objectIndex += 1) {
    const object = objects[objectIndex]
    if (!object) throw new Error(`DjVuXML is missing OBJECT[${objectIndex}]`)

    const body = []
    for (const line of object.lines) {
      if (/^(?:\d+\s+)?WORD[- ]LIST(?:\s+\d+)?$/i.test(line.text)) {
        report.structural.pageHeaders += 1
        continue
      }
      if (/^\d+$/.test(line.text)) {
        report.structural.pageNumbers += 1
        continue
      }
      if (objectIndex === FIRST_OBJECT &&
          (/^The alphabetic order is as follows:/i.test(line.text) || /^a@ ted beats\)/i.test(line.text))) {
        report.structural.wordListPreface += 1
        continue
      }
      if (/^NUMERALS\b/.test(line.text)) {
        report.structural.numeralsHeading += 1
        reachedNumerals = true
        break
      }
      body.push(line)
    }

    const entryStartMaxX = hangingIndentBoundary(body, objectIndex)

    for (const line of body) {
      report.structural.bodyLines += 1
      const continuation = line.firstX > entryStartMaxX
      if (continuation && current) {
        appendLine(current, line)
        report.structural.continuations += 1
        continue
      }

      if (current) rows.push(current)
      current = {
        objectIndex,
        iaLeaf: objectIndex,
        page: objectIndex - 3,
        tokens: [...line.tokens],
        text: line.text
      }
    }

    if (reachedNumerals) break
  }

  if (current) rows.push(current)
  if (!reachedNumerals) throw new Error('NUMERALS boundary was not found in OBJECT[192]')
  report.groupedRows = rows.length
  return rows
}

const normalizeEnglishToken = (value) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const englishTokens = (value) => normalizeEnglishToken(value).match(/[a-z]+/g) || []

function buildEnglishVocabulary() {
  const sources = [
    ['src/data/strongs.json', false],
    ['public/dicts/bdb.json', false],
    ['public/dicts/jastrow.json', false],
    ['public/dicts/sumerian.json', false],
    ['public/dicts/akkadian.json', false],
    ['public/dicts/hittite-iecor.json', false],
    ['public/dicts/hittite-wiktionary.json', false],
    ['public/dicts/osa-wiktionary.json', false],
    // AED's `def` falls back to German when English is absent. A paired `de`
    // field proves that this particular `def` is the English translation.
    ['public/dicts/egyptian.json', true]
  ]
  const vocabulary = new Set()

  for (const [relativePath, requireGermanPair] of sources) {
    const path = join(repoRoot, ...relativePath.split('/'))
    const data = JSON.parse(readFileSync(path, 'utf8'))
    const entries = data.entries || data
    if (!Array.isArray(entries)) throw new Error(`English vocabulary source has no entries: ${relativePath}`)

    for (const entry of entries) {
      if (requireGermanPair && !entry.de) continue
      for (const field of ['def', 'kjv']) {
        if (typeof entry[field] !== 'string') continue
        englishTokens(entry[field]).forEach((token) => vocabulary.add(token))
      }
    }
  }

  if (vocabulary.size < 5000) {
    throw new Error(`English gloss vocabulary is unexpectedly small: ${vocabulary.size} tokens`)
  }
  return vocabulary
}

const ENGLISH_STOP_WORDS = new Set([
  'a', 'an', 'and', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'of',
  'on', 'one', 'or', 'some', 'the', 'to', 'was', 'were', 'with'
])

// These are deliberately short and unambiguous. Ambiguous forms such as
// Latin `dies` / English `dies` and German `die` / English `die` are not
// denied; the positive-English vocabulary gate handles the remaining cases.
const FOREIGN_DENYLIST = new Set([
  'erhoben', 'geliebt', 'gegeben', 'geworden', 'ungewiss', 'unbekannt',
  'wahrscheinlich', 'singulus', 'dexter', 'sinister', 'ignis', 'mulier',
  'filius', 'filia', 'frater', 'soror', 'aqua', 'deus', 'bonus', 'malus',
  'magnus', 'parvus', 'caput', 'oculus', 'lingua', 'domus', 'arbor',
  'lapis', 'canis', 'panis', 'sanguis', 'bibere', 'facere'
])

// Sturtevant gives several pronominal meanings only in Latin. Some of those
// words also occur in the bundled English-dictionary vocabulary (notably
// `ego`, `nos` and `te`), so the positive-English gate alone cannot reject
// them. Require the entire quoted gloss to use this audited Latin vocabulary,
// plus an unambiguous marker, to avoid treating isolated shared spellings in
// otherwise English definitions as Latin.
const LATIN_ONLY_GLOSS_WORDS = new Set([
  'aliquis', 'ea', 'ego', 'ei', 'eos', 'et', 'ipse', 'nobis', 'nos', 'qui',
  'quis', 'te', 'tibi'
])
const LATIN_ONLY_GLOSS_MARKERS = new Set([
  'aliquis', 'ego', 'eos', 'ipse', 'nobis', 'quis', 'tibi'
])
// A few first quotes mix a Latin synonym with English. Rejecting the whole
// row is deliberately lossy, but prevents a Latin token from becoming an
// automatic English meaning match while leaving the published quote intact.
const LATIN_CONTAMINATION_MARKERS = new Set([
  'agedum', 'demum', 'erectus', 'ita', 'mulcere', 'rus', 'versari'
])

const isLatinOnlyGloss = (tokens) =>
  tokens.length > 0 &&
  tokens.every((token) => LATIN_ONLY_GLOSS_WORDS.has(token)) &&
  tokens.some((token) => LATIN_ONLY_GLOSS_MARKERS.has(token))

function sourceHead(row) {
  const first = row.text.match(/^\S+/u)?.[0] || ''
  return first.replace(/[,:;.]$/u, '')
}

function headConfidence(row, head) {
  let remaining = head.length
  const confidences = []
  for (const token of row.tokens) {
    if (remaining <= 0) break
    confidences.push(token.confidence)
    remaining -= token.text.length
  }
  return confidences.length ? Math.min(...confidences) : 0
}

function stableId(row, head, gloss) {
  const slug = normalizeEnglishToken(head)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32) || 'head'
  const hash = createHash('sha256')
    .update(`${row.page}\0${head}\0${gloss}`)
    .digest('hex')
    .slice(0, 10)
  return `sturtevant-hittite-${String(row.page).padStart(3, '0')}-${slug}-${hash}`
}

function extractEntries(rows, vocabulary, report) {
  const entries = []
  const samples = new Map()

  const drop = (reason, row) => {
    report.dropped[reason] = (report.dropped[reason] || 0) + 1
    if (!samples.has(reason)) samples.set(reason, [])
    const sampleLimit = process.env.STURTEVANT_REPORT_ALL === '1' ? Number.POSITIVE_INFINITY : 3
    if (samples.get(reason).length < sampleLimit) samples.get(reason).push(`p.${row.page}: ${row.text.slice(0, 180)}`)
    return null
  }

  for (const row of rows) {
    if (/^\s*\*/u.test(row.text)) {
      drop('leadingReconstruction', row)
      continue
    }
    if (row.text.includes('?')) {
      drop('containsUncertaintyMark', row)
      continue
    }

    const quote = row.text.match(/‘([^’]+)’/u)
    if (!quote) {
      drop('noCompleteCurlyQuotedGloss', row)
      continue
    }
    const quoteAt = quote.index ?? -1
    if (quoteAt < 0 || quoteAt > 160) {
      drop('firstGlossAfter160Characters', row)
      continue
    }

    const head = sourceHead(row)
    if (!head || !/^[-]?\p{Ll}[\p{Ll}\p{M}0-9()./'’·-]*$/u.test(head)) {
      drop(/[\p{Lu}]/u.test(head) ? 'uppercaseOrMixedHead' : 'invalidLowercaseHead', row)
      continue
    }

    const confidence = headConfidence(row, head)
    if (confidence < 90) {
      drop('headConfidenceBelow90', row)
      continue
    }

    const def = quote[1].replace(/\s+/g, ' ').trim()
    if (!def || def.length > 120) {
      drop('emptyOrLongGloss', row)
      continue
    }
    if (/\b(?:meaning\s+(?:is\s+)?unknown|unknown\s+meaning|unidentified(?:\s+meaning)?)\b/i.test(row.text)) {
      drop('unknownMeaning', row)
      continue
    }
    if (/[^\p{L}\p{N}\s,;:.'’()/-]/u.test(def) || /[|{}\[\]<>_=]/u.test(def)) {
      drop('quoteJunk', row)
      continue
    }

    const glossTokens = englishTokens(def)
    if (isLatinOnlyGloss(glossTokens)) {
      drop('latinOnlyGloss', row)
      continue
    }
    if (glossTokens.some((token) => LATIN_CONTAMINATION_MARKERS.has(token))) {
      drop('latinContaminatedGloss', row)
      continue
    }
    if (glossTokens.some((token) => FOREIGN_DENYLIST.has(token))) {
      drop('foreignDenylist', row)
      continue
    }
    const meaningful = glossTokens.filter((token) => token.length >= 3 && !ENGLISH_STOP_WORDS.has(token))
    if (!meaningful.length || !meaningful.some((token) => vocabulary.has(token))) {
      drop('noPositiveEnglishToken', row)
      continue
    }

    const sourceHeadSpan = row.text.slice(0, quoteAt).replace(/\s+/g, ' ').trim()

    entries.push({
      id: stableId(row, head, def),
      lemma: head,
      def,
      page: row.page,
      iaLeaf: row.iaLeaf,
      source: `${DETAILS_URL}/page/n${row.objectIndex}/mode/1up`,
      ocrConfidence: confidence,
      sourceHead: sourceHeadSpan
    })
  }

  report.accepted = entries.length
  report.dropSamples = Object.fromEntries(samples)
  return entries
}

const [xmlInput, metadataInput] = process.argv.slice(2)
const [xmlInputData, metadataInputData] = await Promise.all([
  loadInput(xmlInput, XML_URL, 'DjVuXML'),
  loadInput(metadataInput, METADATA_URL, 'metadata')
])
const xml = xmlInputData.text
const metadataText = metadataInputData.text

const metadataResponse = JSON.parse(metadataText)
const metadata = metadataResponse.metadata || metadataResponse
if (metadata.identifier !== IDENTIFIER) {
  throw new Error(`unexpected Internet Archive identifier: ${metadata.identifier || '(missing)'}`)
}
if (metadata.rights !== EXPECTED_RIGHTS) {
  throw new Error(`unexpected Internet Archive rights statement: ${metadata.rights || '(missing)'}`)
}
if (String(metadata.date) !== '1936') {
  throw new Error(`unexpected publication date: ${metadata.date || '(missing)'}`)
}

const sourceFile = (metadataResponse.files || []).find((file) => file.name === `${IDENTIFIER}_djvu.xml`)
if (!sourceFile?.md5 || !sourceFile?.sha1 || Number(sourceFile.size) < 4_000_000) {
  throw new Error('Internet Archive DjVuXML file provenance is missing or unexpected')
}
const actualMd5 = createHash('md5').update(xmlInputData.bytes).digest('hex')
const actualSha1 = createHash('sha1').update(xmlInputData.bytes).digest('hex')
if (xmlInputData.bytes.length !== Number(sourceFile.size) ||
    actualMd5 !== sourceFile.md5.toLowerCase() ||
    actualSha1 !== sourceFile.sha1.toLowerCase()) {
  throw new Error(
    `DjVuXML bytes do not match Internet Archive metadata: ` +
    `size ${xmlInputData.bytes.length}/${sourceFile.size}, ` +
    `md5 ${actualMd5}/${sourceFile.md5}, sha1 ${actualSha1}/${sourceFile.sha1}`
  )
}

const objects = parseObjects(xml)
if (objects.length !== 200) throw new Error(`expected 200 DjVuXML OBJECTs, found ${objects.length}`)

const report = {
  objects: `${FIRST_OBJECT}-${LAST_OBJECT}`,
  structural: {
    pageHeaders: 0,
    pageNumbers: 0,
    numeralsHeading: 0,
    wordListPreface: 0,
    bodyLines: 0,
    continuations: 0
  },
  groupedRows: 0,
  accepted: 0,
  dropped: {},
  dropSamples: {}
}
const rows = groupRows(objects, report)
const vocabulary = buildEnglishVocabulary()
const entries = extractEntries(rows, vocabulary, report)

if (entries.length < 600 || entries.length > 650) {
  throw new Error(`conservative accepted count must remain in the reviewed 600-650 range; found ${entries.length}\n${JSON.stringify(report, null, 2)}`)
}
if (entries.length > MAX_ENTRIES) throw new Error(`hard entry cap exceeded: ${entries.length} > ${MAX_ENTRIES}`)
if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error('duplicate Sturtevant entry ids')

const required = new Map([
  ['annas', 'mother'],
  ['antuhsas', 'human being, man'],
  ['attas', 'father'],
  ['hassus', 'king']
])
for (const [lemma, def] of required) {
  if (!entries.some((entry) => entry.lemma === lemma && entry.def === def)) {
    throw new Error(`known conservative smoke entry is missing: ${lemma} ‘${def}’`)
  }
}
if (entries.some((entry) => entry.lemma.startsWith('*') || /[?\p{Lu}]/u.test(entry.lemma))) {
  throw new Error('a reconstructed, uncertain, uppercase or mixed-case head escaped filtering')
}
if (entries.some((entry) => entry.lemma === 'aki' && entry.def === 'death')) {
  throw new Error('uncertain aki ‘death’ must not be retained')
}
if (entries.some((entry) => entry.lemma === 'akkantes')) {
  throw new Error('reconstructed *akkantes must not be retained')
}
if (entries.some((entry) => isLatinOnlyGloss(englishTokens(entry.def)))) {
  throw new Error('a Latin-only pronominal gloss escaped filtering')
}
if (entries.some((entry) =>
  englishTokens(entry.def).some((token) => LATIN_CONTAMINATION_MARKERS.has(token)))) {
  throw new Error('a gloss containing an audited Latin marker escaped filtering')
}

const out = {
  work: 'A Hittite Glossary, second edition (Edgar H. Sturtevant, 1936)',
  kind: 'historical glossary (conservative OCR-derived subset)',
  author: metadata.creator,
  publicationYear: 1936,
  source: DETAILS_URL,
  sourceData: XML_URL,
  sourceMetadata: METADATA_URL,
  sourceIdentifier: IDENTIFIER,
  rights: EXPECTED_RIGHTS,
  accessed: new Date().toISOString().slice(0, 10),
  sourceFile: {
    name: sourceFile.name,
    size: Number(sourceFile.size),
    md5: sourceFile.md5,
    sha1: sourceFile.sha1,
    mtime: sourceFile.mtime,
    verifiedAgainstMetadata: true
  },
  extraction: {
    objectRange: [FIRST_OBJECT, LAST_OBJECT],
    stoppedBefore: 'NUMERALS',
    englishVocabularySize: vocabulary.size,
    dropped: report.dropped
  },
  conversion:
    `${entries.length} high-confidence lowercase Hittite headwords conservatively extracted from Internet Archive DjVuXML by scripts/import-sturtevant-hittite.mjs. Leading reconstructions, every row containing an uncertainty mark, uppercase/mixed logograms, low-confidence heads, long/distant or malformed quotes, unknown meanings, Latin-only or Latin-contaminated glosses and glosses without a positive match in the bundled English-dictionary vocabulary were excluded and reported. Printed page, Internet Archive leaf/source URL, OCR confidence and source head text are retained. This is OCR from a historical 1936 glossary: spellings and analyses are outdated, coverage is not comprehensive, and entries are not modern verified scholarship.`,
  count: entries.length,
  entries
}

const dest = join(repoRoot, 'public', 'dicts', 'hittite-sturtevant.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} conservative historical entries`)
console.log(`English gloss vocabulary: ${vocabulary.size} tokens`)
console.log('Sturtevant import review report:')
console.log(JSON.stringify(report, null, 2))
