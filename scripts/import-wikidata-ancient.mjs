// Imports the small Wikidata Lexeme subsets for Hittite and the ancient
// Old South Arabian languages into compact, offline reference dictionaries.
//
// Provenance and scope
// --------------------
// Wikidata publishes structured data in the Lexeme namespace under CC0 1.0.
// WDQS is used only to discover Lexemes whose senses currently have an English
// gloss. The corresponding entity JSON is then fetched from the official
// MediaWiki API so exact lemmas, sense IDs, revision metadata and P1343
// ("described by source") item IDs remain attached to every imported record.
//
// A P1343 value records a citation made by Wikidata editors. It does not assert
// that the cited work is openly licensed and is not the legal basis for this
// import; the imported Wikidata structured data is covered by Wikidata's CC0
// terms. These are tiny community-authored subsets, not scholarly or
// comprehensive dictionaries.
//
// Usage:
//   node scripts/import-wikidata-ancient.mjs

import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const WDQS = 'https://query.wikidata.org/sparql'
const API = 'https://www.wikidata.org/w/api.php'
const ENTITY_BASE = 'https://www.wikidata.org/wiki/'
const LICENSE_URL = 'https://creativecommons.org/publicdomain/zero/1.0/'
const WIKIDATA_LICENSE_URL = 'https://www.wikidata.org/wiki/Wikidata:Licensing'
const USER_AGENT =
  'AncientLexiconWikidataImporter/1.0 (https://github.com/MasterOudini/ancient-lexicon)'

const groups = [
  {
    id: 'hittite',
    output: 'hittite-wikidata.json',
    work: 'Wikidata Lexemes — Hittite community subset',
    language: 'Hittite',
    languageIds: ['Q35668'],
    languages: {
      Q35668: { variety: 'Hittite', iso: 'hit' }
    }
  },
  {
    id: 'osa',
    output: 'osa-wikidata.json',
    work: 'Wikidata Lexemes — Old South Arabian-language community subset',
    language: 'Old South Arabian',
    languageIds: ['Q35025', 'Q1070391', 'Q737784', 'Q384101', 'Q1032453'],
    languages: {
      // Q35025 is the umbrella language-family item. Do not assign it xsa:
      // Wikidata also has a more specific Sabaean language item below.
      Q35025: { variety: 'Old South Arabian' },
      Q1070391: { variety: 'Sabaean', iso: 'xsa' },
      Q737784: { variety: 'Minaean', iso: 'inm' },
      Q384101: { variety: 'Qatabanian', iso: 'xqt' },
      Q1032453: { variety: 'Hadramautic', iso: 'xhd' }
    }
  }
]

const allLanguageIds = groups.flatMap(({ languageIds }) => languageIds)
const query = `
SELECT DISTINCT ?lexeme ?language WHERE {
  VALUES ?language { ${allLanguageIds.map((id) => `wd:${id}`).join(' ')} }
  ?lexeme dct:language ?language ;
          ontolex:sense ?sense .
  ?sense skos:definition ?gloss .
  FILTER(LANG(?gloss) = "en")
}
ORDER BY ?language ?lexeme
`.trim()

const here = dirname(fileURLToPath(import.meta.url))
const outputDir = join(here, '..', 'public', 'dicts')
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function fetchJson(url, options, label) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          'User-Agent': USER_AGENT,
          ...options?.headers
        },
        signal: AbortSignal.timeout(45_000)
      })

      if (response.status === 429 || response.status >= 500) {
        const error = new Error(`${label}: HTTP ${response.status}`)
        const retryAfter = Number(response.headers.get('retry-after'))
        if (Number.isFinite(retryAfter)) error.retryAfter = retryAfter * 1_000
        throw error
      }
      if (!response.ok) throw new Error(`${label}: HTTP ${response.status}`)

      const data = await response.json()
      if (data.error) {
        const error = new Error(`${label}: ${data.error.code}: ${data.error.info}`)
        if (data.error.code === 'maxlag') error.retryAfter = 5_000
        throw error
      }
      return data
    } catch (error) {
      if (attempt === 3) throw error
      await wait(Math.max(error.retryAfter || 0, 2_000 * 2 ** attempt))
    }
  }
}

async function discoverLexemes() {
  const body = new URLSearchParams({ query, format: 'json' })
  const data = await fetchJson(
    WDQS,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body
    },
    'WDQS discovery query'
  )

  const rows = data.results?.bindings || []
  return rows.map((row) => {
    const id = row.lexeme?.value?.match(/\/(L\d+)$/)?.[1]
    const languageId = row.language?.value?.match(/\/(Q\d+)$/)?.[1]
    if (!id || !languageId || !allLanguageIds.includes(languageId)) {
      throw new Error(`unexpected WDQS row: ${JSON.stringify(row)}`)
    }
    return { id, languageId }
  })
}

async function mediaWikiEntities(ids, props) {
  const entities = {}
  for (let offset = 0; offset < ids.length; offset += 50) {
    const batch = ids.slice(offset, offset + 50)
    const body = new URLSearchParams({
      action: 'wbgetentities',
      format: 'json',
      formatversion: '2',
      errorformat: 'plaintext',
      maxlag: '5',
      ids: batch.join('|'),
      props
    })
    const data = await fetchJson(
      API,
      {
        method: 'POST',
        headers: {
          'Api-User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body
      },
      `MediaWiki entities ${offset + 1}–${Math.min(offset + 50, ids.length)}`
    )
    Object.assign(entities, data.entities || {})
  }
  return entities
}

function numericEntityOrder(left, right) {
  return Number(left.slice(1)) - Number(right.slice(1))
}

function lemmaList(entity) {
  return Object.entries(entity.lemmas || {})
    .map(([language, lemma]) => ({ language, value: lemma.value }))
    .sort((left, right) =>
      left.language.localeCompare(right.language) || left.value.localeCompare(right.value)
    )
}

function isReconstructed(entity) {
  return lemmaList(entity).some(({ value }) => /^\s*[*∗⁎]/u.test(value))
}

function preferredLemma(lemmas) {
  return (
    lemmas.find(({ language }) => /-latn$/i.test(language)) ||
    lemmas.find(({ value }) => /\p{Script=Latin}/u.test(value)) ||
    lemmas[0]
  )
}

function englishSenses(entity) {
  return (entity.senses || [])
    .flatMap((sense) => {
      const gloss = sense.glosses?.en?.value
      return gloss ? [{ id: sense.id, gloss }] : []
    })
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }))
}

function p1343Ids(entity) {
  return [...new Set(
    (entity.claims?.P1343 || [])
      .map((statement) => statement.mainsnak?.datavalue?.value?.id)
      .filter((id) => /^Q\d+$/.test(id || ''))
  )].sort(numericEntityOrder)
}

function itemLabel(items, id) {
  return items[id]?.labels?.en?.value || id
}

function entryFromEntity(entity, group, items) {
  const languageId = entity.language
  const language = group.languages[languageId]
  if (!language) throw new Error(`${entity.id}: unexpected language ${languageId}`)

  const lemmas = lemmaList(entity)
  const primary = preferredLemma(lemmas)
  const senses = englishSenses(entity)
  if (!lemmas.length || !primary || !senses.length) {
    throw new Error(`${entity.id}: missing lemma or English sense after WDQS discovery`)
  }

  const describedBySources = p1343Ids(entity).map((id) => ({
    id,
    label: itemLabel(items, id),
    url: `${ENTITY_BASE}${id}`
  }))
  const entry = {
    id: entity.id,
    lemma: primary.value,
    lemmas,
    def: senses.map(({ gloss }) => gloss).join('; '),
    senses,
    language: group.language,
    variety: language.variety,
    languageId,
    languageUrl: `${ENTITY_BASE}${languageId}`,
    lexicalCategory: entity.lexicalCategory,
    lexicalCategoryLabel: itemLabel(items, entity.lexicalCategory),
    source: `${ENTITY_BASE}${entity.id}`,
    revision: entity.lastrevid,
    timestamp: entity.modified,
    describedBySources
  }
  if (language.iso) entry.lang = language.iso
  return entry
}

function validate(group, output) {
  const minimum = group.id === 'hittite' ? 20 : 1
  if (output.count < minimum || output.count > 500) {
    throw new Error(`${group.id}: implausible Wikidata count ${output.count}`)
  }
  if (output.count !== output.entries.length) {
    throw new Error(`${group.id}: count does not match entries length`)
  }
  if (new Set(output.entries.map(({ id }) => id)).size !== output.count) {
    throw new Error(`${group.id}: duplicate Lexeme IDs`)
  }

  for (const entry of output.entries) {
    if (!/^L\d+$/.test(entry.id) || entry.source !== `${ENTITY_BASE}${entry.id}`) {
      throw new Error(`${group.id}: invalid Lexeme identity for ${entry.id}`)
    }
    if (entry.lemmas.some(({ value }) => /^\s*[*∗⁎]/u.test(value))) {
      throw new Error(`${entry.id}: reconstructed starred form escaped filtering`)
    }
    if (!entry.senses.length || entry.senses.some(({ id, gloss }) => !id || !gloss)) {
      throw new Error(`${entry.id}: invalid English sense`)
    }
    if (!Number.isInteger(entry.revision) || !/^\d{4}-\d{2}-\d{2}T/.test(entry.timestamp || '')) {
      throw new Error(`${entry.id}: missing revision metadata`)
    }
  }
}

const discovered = await discoverLexemes()
const discoveredIds = [...new Set(discovered.map(({ id }) => id))].sort(numericEntityOrder)
if (!discoveredIds.length) throw new Error('WDQS returned no relevant Lexemes')

console.error(`WDQS discovered ${discoveredIds.length} Lexemes with English senses`)
const entities = await mediaWikiEntities(
  discoveredIds,
  'info|lemmas|claims|senses'
)

for (const { id, languageId } of discovered) {
  const entity = entities[id]
  if (!entity || entity.missing !== undefined) throw new Error(`${id}: MediaWiki entity is missing`)
  if (entity.language !== languageId) {
    throw new Error(`${id}: WDQS language ${languageId} differs from entity language ${entity.language}`)
  }
}

const includedEntities = discoveredIds
  .map((id) => entities[id])
  .filter((entity) => !isReconstructed(entity))
const excludedReconstructed = discoveredIds.length - includedEntities.length

const relatedItemIds = [...new Set(
  includedEntities.flatMap((entity) => [entity.lexicalCategory, ...p1343Ids(entity)])
)].filter((id) => /^Q\d+$/.test(id || '')).sort(numericEntityOrder)
const items = relatedItemIds.length
  ? await mediaWikiEntities(relatedItemIds, 'labels')
  : {}

for (const group of groups) {
  const entries = includedEntities
    .filter((entity) => group.languageIds.includes(entity.language))
    .map((entity) => entryFromEntity(entity, group, items))
    .sort((left, right) => numericEntityOrder(left.id, right.id))

  const groupExcluded = discoveredIds
    .map((id) => entities[id])
    .filter((entity) => group.languageIds.includes(entity.language) && isReconstructed(entity))
    .length
  const output = {
    work: group.work,
    kind: 'tiny community-authored Lexeme subset',
    source: 'https://www.wikidata.org/wiki/Wikidata:Lexicographical_data',
    queryService: WDQS,
    mediaWikiApi: API,
    accessed: new Date().toISOString().slice(0, 10),
    license: 'CC0 1.0',
    licenseUrl: LICENSE_URL,
    wikidataLicenseUrl: WIKIDATA_LICENSE_URL,
    language: group.language,
    languageIds: group.languageIds,
    coverage:
      'Tiny, community-authored Wikidata subset; not a scholarly dictionary and not comprehensive.',
    provenanceNote:
      'describedBySources preserves Wikidata P1343 citations only. A citation does not assert that the cited work is openly licensed; Wikidata structured data is imported under Wikidata CC0 terms.',
    conversion:
      `Lexemes with an English sense discovered through WDQS and fetched from the official MediaWiki API by scripts/import-wikidata-ancient.mjs. Exact lemmas, English sense IDs/glosses, language item, lexical category, revision metadata and P1343 item IDs retained. ${groupExcluded} reconstructed starred form(s) excluded.`,
    excludedReconstructed: groupExcluded,
    count: entries.length,
    entries
  }

  validate(group, output)
  const destination = join(outputDir, group.output)
  writeFileSync(destination, JSON.stringify(output))
  console.log(`wrote ${destination}: ${entries.length} Lexemes`)
}

console.error(`excluded ${excludedReconstructed} reconstructed starred Lexeme(s) in total`)
