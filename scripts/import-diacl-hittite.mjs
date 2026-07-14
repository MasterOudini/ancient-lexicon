// Imports the attested Hittite rows from the official DIACL v3.0 release into
// public/dicts/hittite-diacl.json.
//
// Provenance
// ----------
// Source: Gerd Carling (ed.), Diachronic Atlas of Comparative Linguistics
// Online, as released by Lexibank in DIACL v3.0 under CC BY 4.0,
// DOI 10.5281/zenodo.5121561. This is a 149-row comparative lexical dataset,
// not a Hittite dictionary. The release tag is resolved and checked before
// files are fetched from its pinned commit.
//
// Usage:
//   node scripts/import-diacl-hittite.mjs
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const VERSION = 'v3.0'
const RELEASE_COMMIT = '393db4ab0a4b84891b96bbf619c7a94663e44d5e'
const RELEASE_URL = `https://github.com/lexibank/diacl/releases/tag/${VERSION}`
const RELEASE_API = `https://api.github.com/repos/lexibank/diacl/releases/tags/${VERSION}`
const COMMIT_API = `https://api.github.com/repos/lexibank/diacl/commits/${VERSION}`
const RAW_BASE = `https://raw.githubusercontent.com/lexibank/diacl/${RELEASE_COMMIT}`
const DOI = '10.5281/zenodo.5121561'
const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'
const EXPECTED_HITTITE_ROWS = 149
const EXPECTED_RETAINED_CONCEPTS = 121
const EXPECTED_INCONSISTENT_IDS = [
  '35500-33_dog-2',
  '35500-50_silver-1',
  '35500-71_spear-1'
]

async function fetchText(url, accept = 'text/plain') {
  const response = await fetch(url, {
    headers: {
      accept,
      'user-agent': 'Ancient-Lexicon-DIACL-Importer/1.0',
      'x-github-api-version': '2022-11-28'
    }
  })
  if (!response.ok) throw new Error(`DIACL request failed (${response.status}): ${url}`)
  return response.text()
}

async function fetchJson(url) {
  const text = await fetchText(url, 'application/vnd.github+json')
  try {
    return JSON.parse(text)
  } catch (error) {
    throw new Error(`invalid JSON from ${url}: ${error.message}`)
  }
}

// CLDF fields may contain commas, quotes and embedded newlines. Keeping this
// RFC 4180 parser local avoids adding an import-time package dependency.
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"'
          index += 1
        } else {
          quoted = false
        }
      } else {
        field += char
      }
    } else if (char === '"') {
      quoted = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (quoted) throw new Error('unterminated quoted field in DIACL CSV')
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (!rows.length) return []

  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, ''))
  return rows
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])))
}

function bibtexEntries(text) {
  const entries = new Map()
  const blocks = text.match(/^@\w+\{[^\r\n]+,[\s\S]*?^\}\s*$/gm) || []

  for (const block of blocks) {
    const id = block.match(/^@\w+\{([^,]+),/)?.[1]?.trim()
    const field = (name) =>
      block
        .match(new RegExp(`^\\s*${name}\\s*=\\s*\\{([\\s\\S]*?)\\},?\\s*$`, 'm'))?.[1]
        ?.replace(/\s+/g, ' ')
        .trim() || ''
    if (id) {
      entries.set(id, {
        id,
        key: field('key'),
        citation: field('howpublished'),
        note: field('note')
      })
    }
  }
  return entries
}

const CONSISTENCY_STOP_WORDS = new Set(['a', 'an', 'and', 'of', 'or', 'the', 'to'])
function consistencyTokens(value) {
  return new Set(
    (value
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .match(/\p{L}+/gu) || [])
      .filter((token) => !CONSISTENCY_STOP_WORDS.has(token))
  )
}

function meaningMatchesConcept(entry) {
  const meaning = consistencyTokens(entry.def)
  const concept = consistencyTokens(entry.concepticonGloss || '')
  return concept.size > 0 && [...concept].some((token) => meaning.has(token))
}

function groupByDiaclFormId(entries) {
  const groups = new Map()
  for (const entry of entries) {
    if (!groups.has(entry.diaclFormId)) groups.set(entry.diaclFormId, [])
    groups.get(entry.diaclFormId).push(entry)
  }
  return groups
}

const [release, releaseCommit] = await Promise.all([
  fetchJson(RELEASE_API),
  fetchJson(COMMIT_API)
])
if (release.tag_name !== VERSION || release.html_url !== RELEASE_URL) {
  throw new Error(`unexpected DIACL release identity: ${release.tag_name || '(missing tag)'}`)
}
if (!release.body?.includes(DOI)) throw new Error(`DIACL release no longer identifies DOI ${DOI}`)
if (releaseCommit.sha !== RELEASE_COMMIT) {
  throw new Error(`DIACL ${VERSION} tag moved: expected ${RELEASE_COMMIT}, found ${releaseCommit.sha}`)
}

const [projectMetadata, zenodoMetadata, cldfMetadata, formsText, languagesText, parametersText, sourcesText] =
  await Promise.all([
    fetchJson(`${RAW_BASE}/metadata.json`),
    fetchJson(`${RAW_BASE}/.zenodo.json`),
    fetchJson(`${RAW_BASE}/cldf/cldf-metadata.json`),
    fetchText(`${RAW_BASE}/cldf/forms.csv`),
    fetchText(`${RAW_BASE}/cldf/languages.csv`),
    fetchText(`${RAW_BASE}/cldf/parameters.csv`),
    fetchText(`${RAW_BASE}/cldf/sources.bib`)
  ])

if (
  projectMetadata.license !== 'CC-BY-4.0' ||
  zenodoMetadata.license?.id !== 'CC-BY-4.0' ||
  cldfMetadata['dc:license'] !== LICENSE_URL
) {
  throw new Error('DIACL v3.0 no longer consistently declares CC BY 4.0')
}
if (projectMetadata.citation !== cldfMetadata['dc:bibliographicCitation']) {
  throw new Error('DIACL source citation differs between project and CLDF metadata')
}

const forms = parseCsv(formsText)
const languages = parseCsv(languagesText)
const parameters = parseCsv(parametersText)
const parameterById = new Map(parameters.map((parameter) => [parameter.ID, parameter]))
const hittite = languages.find((language) => language.ID === '35500')
if (
  !hittite ||
  hittite.Name !== 'Hittite' ||
  hittite.Glottocode !== 'hitt1242' ||
  hittite.ISO639P3code !== 'hit'
) {
  throw new Error('expected DIACL Hittite language record 35500 / hitt1242 / hit')
}

const sourceRows = forms.filter((form) => form.Language_ID === hittite.ID)
if (sourceRows.length !== EXPECTED_HITTITE_ROWS) {
  throw new Error(`expected ${EXPECTED_HITTITE_ROWS} DIACL Hittite rows, found ${sourceRows.length}`)
}

const isReconstructed = (form) => form.Form.includes('*') || form.Value.includes('*')
const reconstructed = sourceRows.filter(isReconstructed)
const candidateEntries = sourceRows
  .filter((form) => !isReconstructed(form))
  .map((form) => {
    const parameter = parameterById.get(form.Parameter_ID)
    if (!parameter) throw new Error(`unknown DIACL concept ${form.Parameter_ID} for ${form.ID}`)

    const id = form.ID.trim()
    const lemma = form.Form.trim()
    const sourceSpelling = form.Value.trim()
    const def = form.meaning.trim()
    const conceptId = form.Parameter_ID.trim()
    const diaclFormId = form.diacl_id.trim()
    const diaclConceptId = parameter.DIACL_ID.trim()
    const ref = form.Source.trim()
    if (![id, lemma, sourceSpelling, def, conceptId, diaclFormId, diaclConceptId, ref].every(Boolean)) {
      throw new Error(`incomplete DIACL Hittite row: ${id || '(missing id)'}`)
    }

    const entry = {
      id,
      lemma,
      def,
      concept: def,
      conceptId,
      diaclFormId,
      diaclConceptId,
      sourceSpelling,
      ref
    }
    if (parameter.Concepticon_ID) entry.concepticon = parameter.Concepticon_ID.trim()
    if (parameter.Concepticon_Gloss) entry.concepticonGloss = parameter.Concepticon_Gloss.trim()
    if (form.meaning_note) entry.sourceNote = form.meaning_note.trim()
    return entry
  })

if (candidateEntries.length !== EXPECTED_HITTITE_ROWS) {
  throw new Error(
    `expected ${EXPECTED_HITTITE_ROWS} attested DIACL Hittite rows, found ${candidateEntries.length}; ` +
      `${reconstructed.length} starred/reconstructed row(s) were excluded`
  )
}

// DIACL occasionally emits multiple CLDF assignments for one source form ID.
// Only identical source payloads with a sibling whose Concepticon gloss
// directly overlaps the supplied English meaning are safe to resolve
// mechanically. An assignment without that overlap is omitted; ambiguous
// groups fail instead of being guessed. This catches source-linking mistakes
// without treating ordinary homographs or polysemy as errors.
const inconsistentDetails = []
for (const [diaclFormId, group] of groupByDiaclFormId(candidateEntries)) {
  if (group.length < 2) continue

  const payloads = new Set(
    group.map((entry) => [entry.lemma, entry.sourceSpelling, entry.def, entry.ref].join('\u0000'))
  )
  const compatible = group.filter(meaningMatchesConcept)
  if (!compatible.length) {
    throw new Error(`ambiguous repeated DIACL form ${diaclFormId}: no concept matches its meaning`)
  }
  if (payloads.size > 1 && compatible.length !== group.length) {
    throw new Error(`incompatible non-identical rows share DIACL form ${diaclFormId}`)
  }
  if (payloads.size > 1) continue

  for (const entry of group.filter((candidate) => !meaningMatchesConcept(candidate))) {
    inconsistentDetails.push({
      id: entry.id,
      diaclFormId: entry.diaclFormId,
      conceptId: entry.conceptId,
      concepticon: entry.concepticon,
      concepticonGloss: entry.concepticonGloss,
      lemma: entry.lemma,
      def: entry.def,
      ref: entry.ref,
      reason:
        `Concepticon gloss "${entry.concepticonGloss}" has no lexical overlap with the supplied ` +
        `English meaning "${entry.def}", while another assignment of DIACL form ${entry.diaclFormId} does.`
    })
  }
}

inconsistentDetails.sort((a, b) => a.id.localeCompare(b.id))
const inconsistentIds = inconsistentDetails.map((entry) => entry.id)
if (JSON.stringify(inconsistentIds) !== JSON.stringify(EXPECTED_INCONSISTENT_IDS)) {
  throw new Error(`unexpected inconsistent DIACL assignments: ${inconsistentIds.join(', ') || '(none)'}`)
}
const excludedIds = new Set(inconsistentIds)
const entries = candidateEntries.filter((entry) => !excludedIds.has(entry.id))

if (new Set(entries.map((entry) => entry.id)).size !== entries.length) {
  throw new Error('duplicate DIACL Hittite form ids')
}
const conceptCount = new Set(entries.map((entry) => entry.conceptId)).size
if (conceptCount !== EXPECTED_RETAINED_CONCEPTS) {
  throw new Error(`expected ${EXPECTED_RETAINED_CONCEPTS} retained DIACL concepts, found ${conceptCount}`)
}
if (entries.some((entry) => entry.lemma.includes('*') || entry.sourceSpelling.includes('*'))) {
  throw new Error('starred/reconstructed form escaped DIACL filtering')
}

for (const [diaclFormId, group] of groupByDiaclFormId(entries)) {
  if (group.length < 2) continue
  if (
    new Set(group.map((entry) => entry.id)).size !== group.length ||
    new Set(group.map((entry) => entry.conceptId)).size !== group.length ||
    !group.every(meaningMatchesConcept)
  ) {
    throw new Error(`unresolved incompatible duplicate DIACL form id: ${diaclFormId}`)
  }
}

const knownRows = new Map([
  ['35500-45_watern-1', ['u̯ātar/u̯itēn-', 'u̯ātar/u̯itēn-', 'water (n)']],
  ['35500-11_big-1', ['šalli-', 'šalli-, šallai-', 'big']],
  ['35500-13_tobite-1', ['u̯āk-', 'u̯āk-, u̯akk-', 'to bite']]
])
for (const [id, [lemma, sourceSpelling, def]] of knownRows) {
  const entry = entries.find((candidate) => candidate.id === id)
  if (entry?.lemma !== lemma || entry?.sourceSpelling !== sourceSpelling || entry?.def !== def) {
    throw new Error(`unexpected DIACL Hittite source values for ${id}`)
  }
}

const bibliography = bibtexEntries(sourcesText)
const usedSourceIds = [
  ...new Set(candidateEntries.flatMap((entry) => entry.ref.split(';').map((id) => id.trim()).filter(Boolean)))
].sort((a, b) => Number(a) - Number(b))
const sourceReferences = usedSourceIds.map((id) => {
  const source = bibliography.get(id)
  if (!source?.citation) throw new Error(`missing DIACL bibliography citation for source ${id}`)
  return source.note
    ? { id: source.id, key: source.key, citation: source.citation, note: source.note }
    : { id: source.id, key: source.key, citation: source.citation }
})

const out = {
  work: 'DIACL v3.0: Hittite comparative lexical dataset',
  kind: 'comparative lexical dataset',
  scope:
    `DIACL's ${sourceRows.length}-row Hittite comparative lexical dataset; ${entries.length} internally ` +
    `consistent rows retained; not a Hittite dictionary`,
  version: VERSION,
  doi: DOI,
  source: RELEASE_URL,
  sourceData: `https://github.com/lexibank/diacl/tree/${RELEASE_COMMIT}/cldf`,
  releaseCommit: RELEASE_COMMIT,
  released: release.published_at,
  citation: cldfMetadata['dc:bibliographicCitation'],
  creators: zenodoMetadata.creators,
  contributors: zenodoMetadata.contributors,
  sourceReferences,
  license: 'CC BY 4.0',
  licenseUrl: LICENSE_URL,
  languageId: hittite.ID,
  iso: hittite.ISO639P3code,
  glottocode: hittite.Glottocode,
  sourceRowCount: sourceRows.length,
  excludedReconstructed: reconstructed.length,
  excludedInconsistent: inconsistentDetails.length,
  inconsistencyRule:
    'For repeated DIACL form IDs with identical source payloads, omit an assignment only when its ' +
    'Concepticon gloss has no lexical overlap with the supplied English meaning and a sibling assignment ' +
    'does match. Ambiguous or non-identical incompatible groups make the import fail rather than being guessed.',
  excludedInconsistentEntries: inconsistentDetails,
  conversion:
    `${sourceRows.length} Hittite source rows extracted from the pinned DIACL ${VERSION} CLDF release by ` +
    `scripts/import-diacl-hittite.mjs; ${entries.length} rows across ${conceptCount} concepts retained after ` +
    `${reconstructed.length} starred/reconstructed and ${inconsistentDetails.length} source-inconsistent ` +
    `duplicate assignments were excluded. CLDF primary forms are used as lemmas; original source spellings, ` +
    `English meanings, source notes, form/concept/DIACL identifiers and bibliography references are retained. ` +
    `This is a comparative lexical dataset, not a dictionary.`,
  count: entries.length,
  entries
}

if (
  out.license !== 'CC BY 4.0' ||
  out.count !== EXPECTED_HITTITE_ROWS - EXPECTED_INCONSISTENT_IDS.length ||
  out.excludedInconsistent !== EXPECTED_INCONSISTENT_IDS.length
) {
  throw new Error('invalid DIACL output metadata')
}

const here = dirname(fileURLToPath(import.meta.url))
const destination = join(here, '..', 'public', 'dicts', 'hittite-diacl.json')
writeFileSync(destination, JSON.stringify(out))
console.log(
  `wrote ${destination}: ${entries.length} attested rows across ${conceptCount} concepts; ` +
    `${inconsistentDetails.length} inconsistent duplicate assignments excluded; ` +
    `${sourceReferences.length} bibliography sources retained`
)
