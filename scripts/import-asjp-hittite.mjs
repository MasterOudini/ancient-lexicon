// Imports the official ASJP Hittite list into
// public/dicts/hittite-asjp.json.
//
// Provenance
// ----------
// Source: The ASJP Database's Hittite wordlist, compiled by Viveka
// Velupillai and published by the Max Planck Institute for Evolutionary
// Anthropology under CC BY 4.0. ASJP supplies 30 English basic-vocabulary
// meaning labels with forms in its own transcription system. This is a small
// basic-vocabulary wordlist, not a Hittite dictionary.
//
// Usage:
//   node scripts/import-asjp-hittite.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PAGE_URL = 'https://asjp.clld.org/languages/HITTITE'
const JSON_URL = `${PAGE_URL}.json`
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'
const EXPECTED_COMPILER = 'Viveka Velupillai'

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Ancient Lexicon ASJP importer' }
  })
  if (!response.ok) throw new Error(`ASJP request failed (${response.status}): ${url}`)
  return response.text()
}

const cleanHtml = (value) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(parseInt(number, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()

const [jsonText, page] = await Promise.all([fetchText(JSON_URL), fetchText(PAGE_URL)])
const data = JSON.parse(jsonText)

if (data.id !== 'HITTITE' || data.name !== 'Hittite') {
  throw new Error(`unexpected ASJP language record: ${data.id || '(missing id)'}`)
}
if (data.code_iso !== 'hit' || data.code_glottolog !== 'hitt1242') {
  throw new Error(`unexpected Hittite identifiers: ${data.code_iso} / ${data.code_glottolog}`)
}

// License and compiler live on the human-readable record page rather than in
// the JSON representation, so validate both pages before writing a snapshot.
if (!page.includes(`href="${LICENSE_URL}"`) ||
    !page.includes('Creative Commons Attribution 4.0 International License')) {
  throw new Error('the official ASJP page no longer declares CC BY 4.0')
}

const compilerMatch = page.match(/class="Contributor"[^>]*title="([^"]+)"[^>]*>([^<]+)<\/a>/)
const compiler = cleanHtml(compilerMatch?.[2] || '')
if (compiler !== EXPECTED_COMPILER || cleanHtml(compilerMatch?.[1] || '') !== EXPECTED_COMPILER) {
  throw new Error(`unexpected ASJP compiler: ${compiler || '(missing)'}`)
}

const editorsMatch = page.match(/property="cc:attributionName"[\s\S]*?>([\s\S]*?)<\/span>/)
const datasetEditors = cleanHtml(editorsMatch?.[1] || '')
if (!datasetEditors) throw new Error('ASJP dataset editor attribution is missing')

const sourceMatch = page.match(
  /<a class="Source" href="([^"]+)" title="([^"]+)">[^<]+<\/a><\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/
)
if (!sourceMatch) throw new Error('ASJP Hittite source bibliography is missing')

const sourceRecord = {
  label: cleanHtml(sourceMatch[2]),
  url: sourceMatch[1],
  citation: cleanHtml(sourceMatch[3])
}

const lines = String(data.txt || '').replace(/\r\n?/g, '\n').split('\n')
if (!lines[0]?.startsWith('HITTITE{') || !/^\s*1\s+40\.00\s+35\.00\s+-2\s+hit\s*$/.test(lines[1] || '')) {
  throw new Error('unexpected ASJP Hittite text header')
}

const wordLines = lines.slice(2).filter(Boolean)
if (wordLines.length !== 30) {
  throw new Error(`expected exactly 30 ASJP Hittite rows, found ${wordLines.length}`)
}

const entries = wordLines.map((line) => {
  const tab = line.indexOf('\t')
  if (tab < 0) throw new Error(`missing tab separator in ASJP row: ${line}`)

  const heading = line.slice(0, tab)
  const value = line.slice(tab + 1)
  const headingMatch = heading.match(/^(\d+)\s+(.+)$/)
  if (!headingMatch || !value.endsWith(' //')) {
    throw new Error(`unexpected ASJP row: ${line}`)
  }

  const meaningNumber = headingMatch[1]
  const def = headingMatch[2]
  // Remove only ASJP's structural " //" terminator. Do not normalize,
  // transliterate, split, or otherwise alter the supplied transcription.
  const lemma = value.slice(0, -3)
  if (!def || !lemma || def !== def.trim() || lemma !== lemma.trim()) {
    throw new Error(`empty or padded ASJP value in row: ${line}`)
  }

  return {
    id: `asjp-hittite-${meaningNumber}`,
    lemma,
    def,
    meaningNumber
  }
})

if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
  throw new Error('duplicate ASJP Hittite meaning numbers')
}

const expectedForms = new Map([
  ['1', ['I', 'uk']],
  ['54', ['drink', 'ekw~, akw~']],
  ['75', ['water', 'watar, witen']],
  ['86', ['mountain', 'kalmara']]
])
for (const [meaningNumber, [def, lemma]] of expectedForms) {
  const entry = entries.find((candidate) => candidate.meaningNumber === meaningNumber)
  if (entry?.def !== def || entry?.lemma !== lemma) {
    throw new Error(`unexpected ASJP Hittite form for meaning ${meaningNumber}`)
  }
}

const out = {
  work: 'The ASJP Database: Hittite basic-vocabulary wordlist',
  kind: 'basic-vocabulary wordlist',
  source: PAGE_URL,
  sourceData: JSON_URL,
  accessed: new Date().toISOString().slice(0, 10),
  languageId: data.id,
  iso: data.code_iso,
  glottocode: data.code_glottolog,
  compiler,
  datasetEditors,
  sourceRecord,
  license: 'CC BY 4.0',
  licenseUrl: LICENSE_URL,
  transcription: 'ASJP transcription preserved unchanged',
  conversion:
    `${entries.length} rows parsed from the official ASJP Hittite JSON text field by scripts/import-asjp-hittite.mjs; English basic-vocabulary meanings retained and ASJP transcription preserved unchanged. This is a small basic-vocabulary wordlist, not a dictionary.`,
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'hittite-asjp.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} basic-vocabulary entries`)
