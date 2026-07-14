// Imports the Hittite core-vocabulary records from IE-CoR v1.2 into
// public/dicts/hittite-iecor.json.
//
// Provenance
// ----------
// Source: Indo-European Cognate Relationships database (IE-CoR) release v1.2,
// Heggarty, Anderson & Scarborough et al., Max Planck Institute for
// Evolutionary Anthropology, DOI 10.5281/zenodo.13304537. The release is
// licensed CC BY 4.0. This is a 170-concept comparative wordlist, not a full
// Hittite dictionary. Hittite records were contributed by Matilde Serangeli
// and Matthew Scarborough.
//
// The v1.2 archive's own CLDF citation describes the underlying database as
// version 1.1; that supplied citation is retained verbatim in the output.
//
// Usage:
//   node scripts/import-iecor.mjs <iecor-release-directory-or-cldf-directory>
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-iecor.mjs <iecor-release-directory-or-cldf-directory>')
  process.exit(1)
}

// CLDF CSV fields can contain commas, quotes, and embedded newlines. Keeping
// this small RFC 4180 parser local avoids adding a runtime or build dependency.
const parseCsv = (text) => {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 1
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

const inputDir = resolve(src)
const cldfDir = existsSync(join(inputDir, 'forms.csv')) ? inputDir : join(inputDir, 'cldf')
const required = ['forms.csv', 'languages.csv', 'parameters.csv', 'authors.csv', 'cognates.csv', 'cldf-metadata.json']
for (const file of required) {
  if (!existsSync(join(cldfDir, file))) {
    throw new Error(`missing IE-CoR CLDF file: ${join(cldfDir, file)}`)
  }
}

const loadCsv = (file) => parseCsv(readFileSync(join(cldfDir, file), 'utf8'))
const metadata = JSON.parse(readFileSync(join(cldfDir, 'cldf-metadata.json'), 'utf8'))
if (metadata['dc:license'] !== 'https://creativecommons.org/licenses/by/4.0/') {
  throw new Error(`unexpected IE-CoR license: ${metadata['dc:license'] || 'missing'}`)
}

const languages = loadCsv('languages.csv')
const forms = loadCsv('forms.csv')
const parameters = loadCsv('parameters.csv')
const authors = loadCsv('authors.csv')
const cognates = loadCsv('cognates.csv')

const hittite = languages.find((language) => language.Glottocode === 'hitt1242')
if (!hittite || hittite.Name !== 'Hittite') throw new Error('Hittite (hitt1242) is missing from IE-CoR')

const parameterById = new Map(parameters.map((parameter) => [parameter.ID, parameter]))
const authorById = new Map(authors.map((author) => [author.ID, author]))
const cognateSetsByForm = new Map()
for (const cognate of cognates) {
  if (!cognateSetsByForm.has(cognate.Form_ID)) cognateSetsByForm.set(cognate.Form_ID, [])
  cognateSetsByForm.get(cognate.Form_ID).push(cognate.Cognateset_ID)
}

const hittiteForms = forms.filter((form) => form.Language_ID === hittite.ID)
const isReconstructedHead = (form) =>
  /^\s*\*/.test(form.Form || form.Value) || /\bincluded\s+\*/i.test(form.Comment || '')
const reconstructed = hittiteForms.filter(isReconstructedHead)
let omittedReconstructedSpellings = 0
let sanitizedReconstructionNotes = 0

function attestedNote(value) {
  if (!value) return ''
  const signNumbersExpanded = value.replace(/\*(\d+)/g, 'no. $1')
  if (!signNumbersExpanded.includes('*')) return signNumbersExpanded.trim()
  sanitizedReconstructionNotes += 1
  return 'This IE-CoR note discusses a reconstructed comparative form; the form and note are omitted under Ancient Lexicon\'s attested-form policy.'
}

const entries = hittiteForms
  // Ancient Lexicon displays attested/conventional forms only. IE-CoR marks
  // reconstructed Hittite headwords with a leading asterisk; retain the drop
  // count in provenance, but never ship those rows as dictionary entries.
  .filter((form) => !isReconstructedHead(form))
  .map((form) => {
    const parameter = parameterById.get(form.Parameter_ID)
    if (!parameter) throw new Error(`unknown concept ${form.Parameter_ID} for ${form.ID}`)

    const lemma = (form.Form || form.Value).trim()
    const concept = parameter.Name.trim()
    const sourceGloss = form.Gloss.trim()
    if (!form.ID || !lemma || !concept) throw new Error(`incomplete Hittite form: ${form.ID || '(missing id)'}`)

    const entry = {
      id: form.ID,
      lemma,
      // Parameter.Name is IE-CoR's authoritative English concept. Contributor
      // form glosses can be more specific and are not guaranteed to be
      // English, so they must never become the display/search guide sense.
      def: concept,
      concept,
      conceptId: parameter.ID
    }
    // Retain useful contributor wording only as explicitly labelled source
    // data. The app's meaning index reads `def`, not this field.
    if (sourceGloss && sourceGloss !== concept) entry.sourceGloss = sourceGloss
    if (parameter.Concepticon_ID) entry.concepticon = parameter.Concepticon_ID
    if (form.native_script) {
      const spelling = form.native_script.trim()
      if (spelling.startsWith('*')) {
        omittedReconstructedSpellings += 1
      } else {
        entry.spelling = spelling
      }
    }
    const note = attestedNote(form.Comment)
    if (note) entry.note = note
    if (form.Source) entry.ref = form.Source.trim()
    if (form.url) entry.url = form.url.trim()

    const cognateSets = [...new Set(cognateSetsByForm.get(form.ID) || [])]
    if (cognateSets.length) entry.cognateSet = cognateSets.join('; ')
    return entry
  })
  .sort((a, b) => Number(a.conceptId) - Number(b.conceptId) || a.id.localeCompare(b.id))

if (entries.length < 100) throw new Error(`expected at least 100 Hittite entries, found ${entries.length}`)
if (new Set(entries.map((entry) => entry.id)).size !== entries.length) throw new Error('duplicate Hittite entry ids')

const contributors = hittite.Author_ID.split(';')
  .map((id) => authorById.get(id))
  .filter(Boolean)
  .map((author) => `${author.First_Name} ${author.Last_Name}`)

const conceptCount = new Set(entries.map((entry) => entry.conceptId)).size
const out = {
  work: 'Indo-European Cognate Relationships database (IE-CoR release v1.2): Hittite core vocabulary',
  version: 'v1.2',
  doi: '10.5281/zenodo.13304537',
  source: 'https://github.com/lexibank/iecor/tree/v1.2',
  license: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  citation: metadata['dc:bibliographicCitation'],
  contributors,
  excludedReconstructed: reconstructed.length,
  omittedReconstructedSpellings,
  sanitizedReconstructionNotes,
  conversion:
    `${entries.length} Hittite forms across ${conceptCount} IE-CoR core concepts extracted from the v1.2 CLDF release by scripts/import-iecor.mjs; ${reconstructed.length} explicitly reconstructed headwords excluded, ${omittedReconstructedSpellings} reconstructed syllabic spellings omitted, and ${sanitizedReconstructionNotes} reconstruction-bearing source notes replaced with an omission notice under the app's attested-form policy; authoritative English concept names used as display and meaning-search guide senses, while differing contributor-supplied gloss wording is retained separately as possibly non-English, non-indexed source data; source form IDs, Concepticon links, attested transliterated spellings, other scholarly notes and cognate-set IDs retained. This is a core-vocabulary wordlist, not a comprehensive Hittite dictionary.`,
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'hittite-iecor.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries across ${conceptCount} concepts`)
