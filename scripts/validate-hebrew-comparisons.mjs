// End-to-end validation for the universal, sense-specific Hebrew comparison
// artifacts. This intentionally reads the committed JSON rather than invoking
// the builder; CI rebuilds the artifacts and requires a clean git diff.

import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { LANGUAGES } from '../src/data/languages.js'
import { LEXICON } from '../src/data/lexicon.js'
import { ROOTS, rootKey } from '../src/data/roots.js'
import {
  REFERENCE_DICTIONARIES,
  getDictionary
} from '../src/data/referenceDictionaries.js'
import {
  HEBREW_CATALOG_MATCH_TIER,
  HEBREW_COMPARISON_LANGUAGES,
  decodeHebrewCatalog,
  getHebrewCatalogMatchTier,
  resolveHebrewComparison,
  searchHebrewCatalog,
  selectAutoOpenSourceKey
} from '../src/lib/hebrewComparisonLoader.js'
import { normalize } from '../src/lib/search.js'
import { findAttestedRootExact, mergeAttestedRootCatalog } from '../src/lib/attestedRootCatalog.js'
import { toImperialAramaic, toMusnad } from '../src/lib/scripts.js'
import {
  canonicalTerms,
  compareRankedCandidates,
  normalizePos,
  referencedStrongsIds,
  selectAutomaticCandidates
} from './build-hebrew-comparisons.mjs'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..')
const dicts = join(root, 'public', 'dicts')
const catalogPath = join(dicts, 'hebrew-catalog-2026-07-v2.json')
const shardsPath = join(dicts, 'hebrew-comparisons-2026-07-v2')
const REQUIRED_LANGUAGES = ['akkadian', 'sumerian', 'egyptian', 'hittite', 'aramaic', 'osa']
const LEGACY_HASHES = {
  'gloss-index.json': 'e42c54c8c7bf6b1473c6e0dd63e1c26c3a6051ea143c2db8ffa3e9396173afef',
  'gloss-index-2026-07.json': 'f51686ecdb2bdaf50b5766cb703a777f62d294d95915f71fa1d2b1bae38bb4eb'
}
const BDB_FIELDS_HASH = '174d9c1083f9ce85d38ac3b7082b3d988faaf05ef9c2ff66a552883965723afe'

let failures = 0
function check(name, condition, detail = '') {
  if (condition) console.log(`ok    ${name}`)
  else {
    failures++
    console.error(`FAIL  ${name}${detail ? `: ${detail}` : ''}`)
  }
}

const sameArray = (left, right) =>
  left.length === right.length && left.every((value, index) => value === right[index])
const json = (path) => JSON.parse(readFileSync(path, 'utf8'))
const hash = (value) => createHash('sha256').update(value).digest('hex')
const sourceKey = (source, id) => `${source}:${id}`
const sortedKeys = (entries) => entries.map((entry) => entry.sourceKey).sort()
const candidatesForSense = (sense) => sense.slots.flatMap((slot) =>
  slot.primary ? [slot.primary, ...slot.alternatives] : []
)

const strongs = json(join(root, 'src', 'data', 'strongs.json'))
const bdb = json(join(dicts, 'bdb.json'))
const catalogPayload = json(catalogPath)
const catalog = decodeHebrewCatalog(catalogPayload, { expectedVersion: 2 })
const rawHebrew = new Map()
for (const entry of strongs.entries.filter((row) => !/\(Aramaic\)/i.test(row.deriv || ''))) {
  rawHebrew.set(sourceKey('strongs', entry.id), entry)
}
for (const entry of bdb.entries.filter((row) => !String(row.id).startsWith('x'))) {
  rawHebrew.set(sourceKey('bdb', entry.id), entry)
}

check('catalog version is 2', catalogPayload.version === 2)
check('catalog declares exactly 64 shards', catalogPayload.shardCount === 64)
check(
  'catalog and runtime use the six fixed language slots in order',
  sameArray(catalogPayload.languages, REQUIRED_LANGUAGES) &&
    sameArray(catalog.languages, REQUIRED_LANGUAGES) &&
    sameArray(HEBREW_COMPARISON_LANGUAGES, REQUIRED_LANGUAGES) &&
    sameArray(LANGUAGES.map((language) => language.id), REQUIRED_LANGUAGES)
)
check('catalog sources are Strong\'s and BDB only', sameArray(catalogPayload.sources, ['strongs', 'bdb']))
check('raw Hebrew source count is exactly 18,992', rawHebrew.size === 18_992, String(rawHebrew.size))
check('decoded catalog count is exactly 18,992', catalog.entries.length === 18_992, String(catalog.entries.length))

const catalogByKey = new Map(catalog.entries.map((entry) => [entry.sourceKey, entry]))
const multiRootTuples = catalogPayload.entries.filter((tuple) => Array.isArray(tuple[9]?.[0]))
check(
  'the v2 catalog preserves every multi-root array that the v1 schema could not decode',
  multiRootTuples.length > 600 && multiRootTuples.every((tuple) =>
    catalogByKey.get(`${catalogPayload.sources[tuple[0]]}:${tuple[1]}`)?.rootReferences.length ===
      tuple[9].length
  ),
  String(multiRootTuples.length)
)
let exactRawRoundTrip = catalogByKey.size === rawHebrew.size
let sensesComplete = true
let searchFieldsNormalized = true
let rootReferencesValid = true
let rootReferenceCount = 0
const publishedRootMismatches = []
const attestedRootPayload = json(join(dicts, 'attested-roots-2026-07-v2.json'))
const publishedRootKeysBySource = new Map()
for (const root of attestedRootPayload.roots.filter((entry) => entry.lang === 'hebrew')) {
  for (const source of root.sources || []) {
    const key = sourceKey(source.source, source.sourceId)
    if (!publishedRootKeysBySource.has(key)) publishedRootKeysBySource.set(key, new Set())
    publishedRootKeysBySource.get(key).add(rootKey(root.letters))
  }
}
const completeRootCatalog = mergeAttestedRootCatalog(
  attestedRootPayload,
  ROOTS
)
for (const entry of catalog.entries) {
  const raw = rawHebrew.get(entry.sourceKey)
  if (
    !raw ||
    entry.headword !== raw.lemma ||
    entry.definition !== raw.def ||
    (entry.transliteration || null) !== (raw.xlit || null) ||
    (entry.partOfSpeech || null) !== (raw.pos || null)
  ) exactRawRoundTrip = false
  if (
    !/^[0-9a-f]{2}$/.test(entry.shard) ||
    entry.senses.length === 0 ||
    new Set(entry.senses.map((sense) => sense.key)).size !== entry.senses.length ||
    entry.senses.some((sense) =>
      !sense.key || !sense.label || !sense.sourceText ||
      typeof sense.matchable !== 'boolean' || !Array.isArray(sense.terms)
    )
  ) sensesComplete = false
  if (
    normalize(entry.searchText) !== entry.searchText ||
    !entry.searchText.includes(normalize(entry.headword)) ||
    !entry.searchText.includes(normalize(entry.id)) ||
    !entry.searchText.includes(normalize(entry.definition)) ||
    !entry.searchText.includes(normalize(getDictionary(entry.source)?.label))
  ) searchFieldsNormalized = false
  const roots = entry.rootReferences || []
  for (const root of roots) {
    rootReferenceCount++
    const sourceRoot = rawHebrew.get(root.sourceKey)
    const attestedRoot = findAttestedRootExact(completeRootCatalog, 'hebrew', root.letters)
    if (
      !sourceRoot ||
      root.headword !== sourceRoot.lemma ||
      root.definition !== sourceRoot.def ||
      root.letters !== rootKey(root.letters) ||
      /[\u0591-\u05c7\u05da\u05dd\u05df\u05e3\u05e5]/u.test(root.letters) ||
      !attestedRoot ||
      rootKey(attestedRoot.letters) !== root.letters
    ) rootReferencesValid = false
  }
  const publishedRootKeys = publishedRootKeysBySource.get(entry.sourceKey)
  const ownPublishedRoot = roots.find((root) =>
    root.sourceKey === entry.sourceKey &&
    root.letters === rootKey(entry.headword) &&
    publishedRootKeys?.has(root.letters)
  )
  if (
    publishedRootKeys &&
    !ownPublishedRoot
  ) {
    publishedRootMismatches.push(
      `${entry.sourceKey}:${roots.map((root) => root.letters).join('|') || 'missing'}=>${[...publishedRootKeys].join('|')}`
    )
  }
}
check('all catalog keys are unique', catalogByKey.size === 18_992)
check('every catalog row round-trips its exact raw source fields', exactRawRoundTrip)
check('every catalog row has stable, complete display senses and a shard ID', sensesComplete)
check(
  'every emitted root button uses normalized consonants and opens an attested root',
  rootReferencesValid
)
check(
  'source-backed root buttons cover the Hebrew comparison catalog',
  rootReferenceCount > 17_000,
  String(rootReferenceCount)
)
check(
  'every published root-source card opens its own consonants in source order',
  publishedRootKeysBySource.size > 3_000 && publishedRootMismatches.length === 0,
  publishedRootMismatches.join(', ')
)
const ratsaf = catalogByKey.get('bdb:t.eh.aa')
check(
  'BDB רָצַף keeps the published רצפ root instead of a Strong\'s cross-reference chain',
  ratsaf?.rootReference?.sourceKey === 'bdb:t.eh.aa' &&
    ratsaf.rootReference.letters === 'רצפ'
)
const RATSAF_ROOT = '\u05e8\u05e6\u05e4'
const RESHEPH_ROOT = '\u05e8\u05e9\u05e4'
const SARAPH_ROOT = '\u05e9\u05e8\u05e4'
const ratsafFamily = [
  'strongs:H4837',
  'strongs:H7528',
  'strongs:H7529',
  'strongs:H7530',
  'strongs:H7531',
  'strongs:H7532',
  'bdb:m.dn.ad',
  'bdb:t.eh.aa',
  'bdb:t.eh.ab',
  'bdb:t.eh.ac',
  'bdb:t.ei.aa',
  'bdb:t.ei.ab',
  'bdb:t.ei.ac',
  'bdb:t.ei.ad',
  'bdb:t.ei.ae'
]
check(
  'all רצף-family cards keep רצפ instead of following the רשף-to-שרף chain',
  ratsafFamily.every((key) => catalogByKey.get(key)?.rootReference?.letters === RATSAF_ROOT),
  ratsafFamily
    .filter((key) => catalogByKey.get(key)?.rootReference?.letters !== RATSAF_ROOT)
    .map((key) => `${key}:${catalogByKey.get(key)?.rootReference?.letters || 'missing'}`)
    .join(', ')
)
const reshephFamily = [
  'strongs:H7565',
  'strongs:H7566',
  'bdb:t.eu.aa',
  'bdb:t.eu.ab',
  'bdb:t.eu.ac'
]
check(
  'all רשף-family cards keep רשפ without metathesis to שרפ',
  reshephFamily.every((key) => catalogByKey.get(key)?.rootReference?.letters === RESHEPH_ROOT),
  reshephFamily
    .filter((key) => catalogByKey.get(key)?.rootReference?.letters !== RESHEPH_ROOT)
    .map((key) => `${key}:${catalogByKey.get(key)?.rootReference?.letters || 'missing'}`)
    .join(', ')
)
check(
  'the distinct שרף primitive root remains שרפ',
  catalogByKey.get('strongs:H8313')?.rootReference?.letters === SARAPH_ROOT
)
const reviewedRootRoutes = new Map([
  ['strongs:H4837', ['bdb:t.eh.aa', RATSAF_ROOT]],
  ['strongs:H7528', ['bdb:t.eh.aa', RATSAF_ROOT]],
  ['strongs:H7529', ['bdb:t.ei.aa', RATSAF_ROOT]],
  ['strongs:H7530', ['bdb:t.ei.aa', RATSAF_ROOT]],
  ['strongs:H7531', ['bdb:t.ei.aa', RATSAF_ROOT]],
  ['strongs:H7532', ['bdb:t.ei.aa', RATSAF_ROOT]],
  ['strongs:H7565', ['bdb:t.eu.aa', RESHEPH_ROOT]],
  ['strongs:H7566', ['bdb:t.eu.aa', RESHEPH_ROOT]],
  ['strongs:H8313', ['strongs:H8313', SARAPH_ROOT]],
  ['bdb:m.dn.ad', ['bdb:t.eh.aa', RATSAF_ROOT]],
  ...['t.eh.aa', 't.eh.ab', 't.eh.ac'].map((id) =>
    [`bdb:${id}`, ['bdb:t.eh.aa', RATSAF_ROOT]]
  ),
  ...['t.ei.aa', 't.ei.ab', 't.ei.ac', 't.ei.ad', 't.ei.ae'].map((id) =>
    [`bdb:${id}`, ['bdb:t.ei.aa', RATSAF_ROOT]]
  ),
  ...['t.eu.aa', 't.eu.ab', 't.eu.ac'].map((id) =>
    [`bdb:${id}`, ['bdb:t.eu.aa', RESHEPH_ROOT]]
  ),
  ...['u.cj.aa', 'u.cj.ab', 'u.cj.ac', 'u.cj.ad', 'u.cj.ae', 'u.cj.af', 'u.cj.ag']
    .map((id) => [`bdb:${id}`, ['bdb:u.cj.aa', SARAPH_ROOT]])
])
const reviewedRouteMismatches = [...reviewedRootRoutes].filter(([key, expected]) => {
  const rootReference = catalogByKey.get(key)?.rootReference
  return rootReference?.sourceKey !== expected[0] || rootReference?.letters !== expected[1]
})
check(
  'reviewed רצף, רשף, and שרף cards open the intended published root source',
  reviewedRouteMismatches.length === 0,
  reviewedRouteMismatches
    .map(([key, expected]) =>
      `${key}:${catalogByKey.get(key)?.rootReference?.sourceKey || 'missing'}=>${expected[0]}`
    )
    .join(', ')
)
check(
  'unrelated weak-letter derivations retain their explicit Strong\'s roots',
  catalogByKey.get('strongs:H68')?.rootReference?.sourceKey === 'strongs:H1129' &&
    catalogByKey.get('strongs:H68')?.rootReference?.letters === '\u05d1\u05e0\u05d4' &&
    catalogByKey.get('strongs:H101')?.rootReference?.sourceKey === 'strongs:H5059' &&
    catalogByKey.get('strongs:H101')?.rootReference?.letters === '\u05e0\u05d2\u05e0'
)
const yad = catalogByKey.get('strongs:H3027')
check(
  'Strong\'s יָד keeps its primitive יד base before comparison references',
  yad?.rootReference?.sourceKey === 'strongs:H3027' && yad.rootReference.letters === 'יד'
)
const muthLabben = catalogByKey.get('strongs:H4192')
check(
  'Strong\'s H4192 follows both stated roots instead of the Psalm citation number',
  muthLabben?.rootReference?.sourceKey === 'strongs:H4191' &&
    muthLabben.rootReference.letters === 'מות' &&
    muthLabben.rootReferences.some(
      (root) => root.sourceKey === 'strongs:H1129' && root.letters === 'בנה'
    ) &&
    muthLabben.rootReferences.every((root) => root.sourceKey !== 'strongs:H48')
)
const strongsById = new Map(strongs.entries.map((entry) => [entry.id, entry]))
const reviewedStrongsParentOracle = new Map([
  ['H358', ['H356', 'H1004', 'H2603']],
  ['H883', ['H875', 'H2416', 'H7203']],
  ['H885', ['H875', 'H1121', 'H3292']],
  ['H1842', ['H1835', 'H3282']],
  ['H2910', ['H2909', 'H2902']],
  ['H3060', ['H3068', 'H784']],
  ['H3079', ['H3068', 'H6965']],
  ['H3115', ['H3068', 'H3513']],
  ['H4105', ['H3190', 'H410']],
  ['H7619', ['H7617', 'H7725', 'H410']],
  ['H8287', ['H8281', 'H2580']],
  ['H8423', ['H2986', 'H7014']]
])
const reviewedStrongsParentMismatches = [...reviewedStrongsParentOracle]
  .filter(([id, expected]) =>
    !sameArray(referencedStrongsIds(strongsById.get(id)), expected)
  )
check(
  'Strong\'s parser preserves reviewed comma, qualifier, and resumed compound chains',
  reviewedStrongsParentMismatches.length === 0,
  reviewedStrongsParentMismatches
    .map(([id, expected]) =>
      `${id}:${referencedStrongsIds(strongsById.get(id)).join('|') || 'missing'}=>${expected.join('|')}`
    )
    .join(', ')
)
check(
  'Strong\'s derivation parsing ignores verse and comparison IDs',
  sameArray(referencedStrongsIds(strongsById.get('H4023')), ['H1413']) &&
    sameArray(referencedStrongsIds(strongsById.get('H5612')), ['H5608']) &&
    sameArray(referencedStrongsIds(strongsById.get('H5771')), ['H5753']) &&
    sameArray(referencedStrongsIds(strongsById.get('H4192')), ['H4191', 'H1121']) &&
    sameArray(referencedStrongsIds(strongsById.get('H3027')), []) &&
    ['H1690', 'H1901', 'H5508', 'H6497', 'H4792', 'H2775', 'H5246',
      'H5284', 'H2191', 'H3849', 'H8207', 'H757', 'H7945', 'H982', 'H3426']
      .every((id) => sameArray(referencedStrongsIds(strongsById.get(id)), [])) &&
    sameArray(referencedStrongsIds(strongsById.get('H8336')), ['H7893']) &&
    sameArray(referencedStrongsIds(strongsById.get('H126')), ['H127']) &&
    sameArray(referencedStrongsIds(strongsById.get('H111')), ['H2301']) &&
    sameArray(referencedStrongsIds(strongsById.get('H3197')), ['H3027']) &&
    sameArray(referencedStrongsIds(strongsById.get('H582')), ['H605']) &&
    sameArray(referencedStrongsIds(strongsById.get('H8453')), ['H3427']) &&
    sameArray(referencedStrongsIds(strongsById.get('H7014')), ['H7013']) &&
    sameArray(referencedStrongsIds(strongsById.get('H7198')), ['H7185']) &&
    sameArray(referencedStrongsIds(strongsById.get('H7795')), ['H7786']) &&
    sameArray(referencedStrongsIds(strongsById.get('H8473')), ['H2734']) &&
    sameArray(referencedStrongsIds(strongsById.get('H159')), ['H156']) &&
    sameArray(referencedStrongsIds(strongsById.get('H6041')), ['H6031']) &&
    sameArray(referencedStrongsIds(strongsById.get('H1460')), ['H1342']) &&
    sameArray(referencedStrongsIds(strongsById.get('H4501')), ['H4500']) &&
    sameArray(referencedStrongsIds(strongsById.get('H5934')), ['H5956']) &&
    sameArray(referencedStrongsIds(strongsById.get('H3860')), ['H2005']) &&
    sameArray(referencedStrongsIds(strongsById.get('H3942')), ['H6440']) &&
    sameArray(referencedStrongsIds(strongsById.get('H7158')), ['H7151', 'H5577', 'H5612']) &&
    sameArray(referencedStrongsIds(strongsById.get('H7590')), ['H7750'])
)
check(
  'Strong\'s similarity, form, and alliteration references do not become root parents',
  ['H1690', 'H1901', 'H5508', 'H4792', 'H8336']
    .every((id) => catalogByKey.get(`strongs:${id}`)?.rootReference == null) &&
    catalogByKey.get('strongs:H6497')?.rootReference?.sourceKey === 'bdb:q.cq.aa' &&
    catalogByKey.get('strongs:H6497')?.rootReference?.letters === '\u05e4\u05e7\u05e2'
)
check(
  'source-declared Strong\'s parents inherit every already resolved root without gaps',
  catalog.entries
    .filter((entry) => entry.source === 'strongs' && entry.rootReferences.length === 0)
    .every((entry) =>
      referencedStrongsIds(strongsById.get(entry.id)).every(
        (parentId) =>
          (catalogByKey.get(`strongs:${parentId}`)?.rootReferences.length || 0) === 0
      )
    )
)
const reviewedStrongsRootPropagationMismatches = [...reviewedStrongsParentOracle]
  .flatMap(([id, parentIds]) => {
    const actualRootKeys = new Set(
      catalogByKey.get(`strongs:${id}`)?.rootReferences.map((root) => root.sourceKey) || []
    )
    return parentIds.flatMap((parentId) =>
      (catalogByKey.get(`strongs:${parentId}`)?.rootReferences || [])
        .filter((root) => !actualRootKeys.has(root.sourceKey))
        .map((root) => `${id}:${parentId}=>${root.sourceKey}`)
    )
  })
check(
  'reviewed Strong\'s compound chains propagate every resolved parent root',
  reviewedStrongsRootPropagationMismatches.length === 0,
  reviewedStrongsRootPropagationMismatches.join(', ')
)
check(
  'BDB-backed Strong\'s parents and true compounds expose all source-declared roots',
  catalogByKey.get('strongs:H127')?.rootReference?.sourceKey === 'bdb:a.bd.aa' &&
    catalogByKey.get('strongs:H127')?.rootReference?.letters === '\u05d0\u05d3\u05de' &&
    catalogByKey.get('strongs:H303')?.rootReference?.sourceKey === 'bdb:h.ck.aa' &&
    catalogByKey.get('strongs:H303')?.rootReference?.letters === '\u05d7\u05dc\u05d1' &&
    catalogByKey.get('strongs:H97')?.rootReference?.sourceKey === 'bdb:a.au.aa' &&
    catalogByKey.get('strongs:H97')?.rootReference?.letters === '\u05d0\u05d2\u05dc' &&
    catalogByKey.get('strongs:H126')?.rootReference?.sourceKey === 'bdb:a.bd.aa' &&
    catalogByKey.get('strongs:H111')?.rootReference?.sourceKey === 'strongs:H2300' &&
    catalogByKey.get('strongs:H3197')?.rootReference?.sourceKey === 'strongs:H3027' &&
    new Set(
      catalogByKey.get('strongs:H25')?.rootReferences.map((root) => root.sourceKey)
    ).size === 2 &&
    catalogByKey.get('strongs:H25')?.rootReferences.some(
      (root) => root.sourceKey === 'strongs:H1' && root.letters === '\u05d0\u05d1'
    ) &&
    catalogByKey.get('strongs:H25')?.rootReferences.some(
      (root) => root.sourceKey === 'bdb:c.al.aa' && root.letters === '\u05d2\u05d1\u05e2'
    )
)
const exactRootRoutes = new Map([
  ['strongs:H4023', ['strongs:H1413', '\u05d2\u05d3\u05d3']],
  ['strongs:H5612', ['strongs:H5608', '\u05e1\u05e4\u05e8']],
  ['strongs:H5771', ['strongs:H5753', '\u05e2\u05d5\u05d4']],
  ['strongs:H4192', ['strongs:H4191', '\u05de\u05d5\u05ea']],
  ['bdb:m.cs.ak', ['bdb:o.ck.ac', '\u05e1\u05e4\u05e8']],
  ['bdb:m.di.aq', ['bdb:t.ar.ab', '\u05e8\u05d2\u05dc']],
  ['bdb:m.dw.ai', ['bdb:v.du.aa', '\u05e9\u05dc\u05e9']],
  ['bdb:w.bq.bd', ['bdb:v.bm.aa', '\u05e9\u05d5\u05d0']],
  ['bdb:j.bi.ac', ['bdb:j.bi.aa', '\u05d9\u05d7\u05e9']],
  ['bdb:h.dr.ad', ['bdb:h.dr.aa', '\u05d7\u05de\u05e9']],
  ['bdb:v.bs.aa', ['bdb:v.bs.aa', '\u05e9\u05d5\u05d8']]
])
const exactRootRouteMismatches = [...exactRootRoutes].filter(([key, expected]) => {
  const rootReference = catalogByKey.get(key)?.rootReference
  return rootReference?.sourceKey !== expected[0] || rootReference?.letters !== expected[1]
})
check(
  'audited Strong\'s citations and BDB lexical references open their exact roots',
  exactRootRouteMismatches.length === 0,
  exactRootRouteMismatches
    .map(([key, expected]) =>
      `${key}:${catalogByKey.get(key)?.rootReference?.sourceKey || 'missing'}=>${expected[0]}`
    )
    .join(', ')
)
check('catalog search fields preserve normalized headword, ID, definition, and source label', searchFieldsNormalized)

const bdbFieldPayload = JSON.stringify(
  bdb.entries.map(({ id, lemma, def, pos }) => [id, lemma, def, pos ?? null])
)
check('BDB retains exactly 11,845 original rows', bdb.count === 11_845 && bdb.entries.length === 11_845)
check('BDB original IDs, headwords, definitions, and POS are unchanged', hash(bdbFieldPayload) === BDB_FIELDS_HASH)
check(
  'BDB records the pinned OpenScriptures revision',
  bdb.sourceRevision === 'b69f909233040133c03654945d7ed1a510d5ea37'
)
const bdbThink = bdb.entries.find((entry) => entry.id === 'h.gr.aa')
const bdbBelt = bdb.entries.find((entry) => entry.id === 'h.gr.ab')
const thinkStems = new Set((bdbThink?.senses || []).map((sense) => sense.path?.[0]))
check(
  'h.gr.aa retains Qal/Niph/Pi/Hithp hierarchy with stable leaf paths',
  bdbThink?.senses?.length === 17 &&
    ['Qal', 'Niph', 'Pi', 'Hithp'].every((stem) => thinkStems.has(stem)) &&
    bdbThink.senses.every((sense) => sense.key === sense.path.join('/') && sense.def)
)
check(
  'h.gr.ab remains a separate noun record',
  bdbBelt?.lemma === 'חֵ֫שֶׁב' && bdbBelt?.pos === 'n.m' &&
    catalogByKey.has('bdb:h.gr.ab') && catalogByKey.has('bdb:h.gr.aa')
)

for (const [file, expected] of Object.entries(LEGACY_HASHES)) {
  check(`${file} remains byte-for-byte immutable`, hash(readFileSync(join(dicts, file))) === expected)
}
check(
  'new catalog is smaller than the 9,448,128-byte meaning index',
  statSync(catalogPath).size < 9_448_128,
  String(statSync(catalogPath).size)
)

const expectedShardFiles = Array.from({ length: 64 }, (_, index) =>
  `${index.toString(16).padStart(2, '0')}.json`
)
const actualShardFiles = readdirSync(shardsPath).filter((file) => file.endsWith('.json')).sort()
check('all and only 64 deterministic shard filenames exist', sameArray(actualShardFiles, expectedShardFiles))

const dictionaryData = new Map()
function rawDictionaryEntry(dictionaryId, entryId) {
  if (!dictionaryData.has(dictionaryId)) {
    const dict = getDictionary(dictionaryId)
    if (!dict || dict.source.kind !== 'url') return null
    const data = json(join(root, 'public', dict.source.url))
    dictionaryData.set(dictionaryId, new Map(
      data.entries.map((entry) => [String(entry.id), entry])
    ))
  }
  return dictionaryData.get(dictionaryId)?.get(String(entryId)) || null
}

const curatedById = new Map(LEXICON.map((entry) => [entry.id, entry]))
const languageIdByName = new Map([
  ['Akkadian', 'akkadian'],
  ['Sumerian', 'sumerian'],
  ['Egyptian', 'egyptian'],
  ['Hittite', 'hittite'],
  ['Old South Arabian', 'osa']
])
function coarsePos(value) {
  const pos = String(value || '').toLowerCase()
  if (!pos) return null
  if (/\b(?:vb|verb)\b/.test(pos)) return 'verb'
  if (/\b(?:n|noun|substantive)(?:\b|\.)/.test(pos)) return 'noun'
  if (/\b(?:adj|adjective)\b/.test(pos)) return 'adjective'
  if (/\b(?:adv|adverb)\b/.test(pos)) return 'adverb'
  return null
}

function sourceNativeScript(raw, dict) {
  const configured = dict.fields.script ? raw[dict.fields.script] : null
  if (configured) return configured
  const head = String(raw[dict.fields.head] || '')
  return /[\u{10A60}-\u{10A7F}\u{12000}-\u{1254F}\u{13000}-\u{1345F}]/u.test(head)
    ? head
    : null
}

function targetSensePos(raw, meaning) {
  const marker = String(meaning || '').match(/\((V|N|ADJ|ADV)\)\s*$/i)?.[1]
  if (marker) return normalizePos(marker)
  return normalizePos(raw.pos || raw.lexicalCategoryLabel)
}

let candidateSourcesResolve = true
let candidateFieldsRoundTrip = true
let candidateLanguagesCorrect = true
let candidatePosCompatible = true
let bridgeEligibility = true
let allSlotsValid = true
let allRecordsResolve = true
let unusedCandidates = false
let automaticImperial = false
let verifiedAuthority = true
let unmatchableSlotsEmpty = true
let automaticCount = 0
let verifiedCount = 0
let noneCount = 0
const resolvedByKey = new Map()
const shardPayloads = new Map()

function validateCuratedCandidate(candidate, languageId) {
  const split = String(candidate.entryId).lastIndexOf(':')
  const conceptId = String(candidate.entryId).slice(0, split)
  const candidateLanguage = String(candidate.entryId).slice(split + 1)
  const concept = curatedById.get(conceptId)
  const form = concept?.forms?.[languageId]
  if (!concept || !form || candidateLanguage !== languageId) return false
  const expectedScript = form.script ||
    (languageId === 'aramaic' && form.hebrewLetters ? toImperialAramaic(form.hebrewLetters) : null) ||
    (languageId === 'osa' && form.tokens ? toMusnad(form.tokens) : null)
  const expectedWord = form.translit || form.hebrewLetters || form.script || expectedScript
  return candidate.word === expectedWord &&
    candidate.transliteration === (form.translit || null) &&
    candidate.script === (expectedScript || null) &&
    concept.english.map(normalize).includes(normalize(candidate.meaning)) &&
    Boolean(candidate.bridge)
}

for (const shardFile of actualShardFiles) {
  const shardId = shardFile.slice(0, 2)
  const shardFilePath = join(shardsPath, shardFile)
  const shard = json(shardFilePath)
  shardPayloads.set(shardId, shard)
  check(`${shardFile} stays below 1 MiB`, statSync(shardFilePath).size < 1024 * 1024)
  if (
    shard.version !== 2 || shard.shard !== shardId ||
    !sameArray(shard.languages || [], REQUIRED_LANGUAGES)
  ) allSlotsValid = false
  const usedCandidates = new Set()
  for (const [key, records] of Object.entries(shard.records || {})) {
    const entry = catalogByKey.get(key)
    if (!entry || entry.shard !== shardId || records.length !== entry.senses.length) {
      allRecordsResolve = false
      continue
    }
    let resolved
    try {
      resolved = resolveHebrewComparison(entry, shard)
      resolvedByKey.set(key, resolved)
    } catch {
      allRecordsResolve = false
      continue
    }
    records.forEach((senseSlots, senseIndex) => {
      if (!Array.isArray(senseSlots) || senseSlots.length !== 6) allSlotsValid = false
      const decodedSense = resolved[senseIndex]
      let verifiedConcept = null
      for (let languageIndex = 0; languageIndex < 6; languageIndex++) {
        const languageId = REQUIRED_LANGUAGES[languageIndex]
        const slotTuple = senseSlots[languageIndex]
        const decodedSlot = decodedSense?.slots?.[languageIndex]
        if (
          !Array.isArray(slotTuple) || ![0, 1, 2].includes(slotTuple[0]) ||
          !Array.isArray(slotTuple[2]) || slotTuple[2].length > 4 ||
          new Set(slotTuple[2]).size !== slotTuple[2].length ||
          decodedSlot?.languageId !== languageId
        ) allSlotsValid = false
        const indexes = slotTuple[0] === 0 ? [] : [slotTuple[1], ...slotTuple[2]]
        if (slotTuple[0] === 0) {
          noneCount++
          if (slotTuple[1] !== null || slotTuple[2].length !== 0 || decodedSlot?.primary) {
            allSlotsValid = false
          }
        } else if (!Number.isInteger(slotTuple[1])) allSlotsValid = false
        if (slotTuple[0] === 1) {
          automaticCount++
          if (languageId === 'aramaic') automaticImperial = true
        }
        if (slotTuple[0] === 2) verifiedCount++
        if (!entry.senses[senseIndex].matchable && slotTuple[0] !== 0) unmatchableSlotsEmpty = false

        for (const candidateIndex of indexes) {
          usedCandidates.add(candidateIndex)
          const tuple = shard.candidates?.[candidateIndex]
          if (!Array.isArray(tuple) || tuple.length !== 8) {
            candidateSourcesResolve = false
            continue
          }
          const candidate = {
            dictionaryId: tuple[0], entryId: tuple[1], word: tuple[2], script: tuple[3],
            transliteration: tuple[4], meaning: tuple[5], bridge: tuple[6], evidence: tuple[7]
          }
          if (slotTuple[0] === 2) {
            if (candidate.dictionaryId !== 'curated' || !validateCuratedCandidate(candidate, languageId)) {
              candidateFieldsRoundTrip = false
            }
            const senseTerms = new Set(entry.senses[senseIndex].terms.map(normalize))
            if (canonicalTerms(candidate.bridge).some((term) => !senseTerms.has(normalize(term)))) {
              verifiedAuthority = false
            }
            const concept = String(candidate.entryId).slice(0, String(candidate.entryId).lastIndexOf(':'))
            if (verifiedConcept && verifiedConcept !== concept) verifiedAuthority = false
            verifiedConcept = concept
          } else {
            const dict = getDictionary(candidate.dictionaryId)
            const raw = rawDictionaryEntry(candidate.dictionaryId, candidate.entryId)
            if (!dict || !raw) {
              candidateSourcesResolve = false
              continue
            }
            const expectedLanguage = languageIdByName.get(dict.language)
            if (expectedLanguage !== languageId || candidate.dictionaryId === 'jastrow') {
              candidateLanguagesCorrect = false
            }
            const head = raw[dict.fields.head]
            const script = sourceNativeScript(raw, dict)
            const rawMeaning = raw[dict.fields.def]
            const suppliedTransliteration = raw.xlit ? String(raw.xlit) : null
            const expectedTransliteration = suppliedTransliteration ||
              (script === head ? null : String(head || '') || null)
            if (
              candidate.word !== head ||
              (candidate.script || null) !== (script || null) ||
              (candidate.transliteration || null) !== expectedTransliteration ||
              !normalize(rawMeaning).includes(normalize(candidate.meaning))
            ) candidateFieldsRoundTrip = false
            const sourcePos = normalizePos(entry.partOfSpeech)
            const targetPos = targetSensePos(raw, candidate.meaning)
            if (sourcePos && targetPos && sourcePos !== targetPos) candidatePosCompatible = false
          }
          if (slotTuple[0] === 1) {
            const terms = new Set(entry.senses[senseIndex].terms.map(normalize))
            const bridgeTerms = candidate.bridge.split(' / ').map(normalize).filter(Boolean)
            if (bridgeTerms.length === 0 || bridgeTerms.some((term) => !terms.has(term))) {
              bridgeEligibility = false
            }
          }
        }
      }
      if (verifiedConcept) {
        if (senseSlots.some((slot) => slot[0] === 1 || slot[2].length > 0)) verifiedAuthority = false
        const concept = curatedById.get(verifiedConcept)
        if (
          !concept || normalize(concept.hebrew.word) !== normalize(entry.headword)
        ) verifiedAuthority = false
        for (let index = 0; index < 6; index++) {
          const hasCuratedForm = Boolean(concept.forms?.[REQUIRED_LANGUAGES[index]])
          if ((senseSlots[index][0] === 2) !== hasCuratedForm) verifiedAuthority = false
        }
      }
    })
  }
  if ((shard.candidates || []).some((_, index) => !usedCandidates.has(index))) unusedCandidates = true
}

for (const entry of catalog.entries) {
  if (!resolvedByKey.has(entry.sourceKey)) allRecordsResolve = false
}
check('every catalog row resolves in exactly its named shard', allRecordsResolve && resolvedByKey.size === 18_992)
check('every sense resolves to exactly six valid ordered slots', allSlotsValid)
check('every candidate resolves to its stated source entry', candidateSourcesResolve)
check('candidate word/script/transliteration/meaning fields round-trip to source data', candidateFieldsRoundTrip)
check('candidate dictionaries agree with their displayed ancient language', candidateLanguagesCorrect)
check('known conflicting parts of speech are rejected', candidatePosCompatible)
check('automatic eligibility uses an exact normalized sense bridge, not a substring', bridgeEligibility)
check('curated cards control all six slots, including gaps and alternatives', verifiedAuthority)
check('all matchable:false senses resolve to six empty slots', unmatchableSlotsEmpty)
check('automatic Imperial Aramaic matching is absent', !automaticImperial)
check('no unused candidate rows bloat a shard', !unusedCandidates)
check('artifacts contain both verified and automatic comparisons', verifiedCount > 0 && automaticCount > 0)
check('artifacts retain explicit no-match slots', noneCount > 0)

function verifiedConcepts(key, senseKey) {
  const sense = resolvedByKey.get(key)?.find((item) => item.key === senseKey)
  return new Set((sense?.slots || []).flatMap((slot) => {
    if (slot.status !== 'verified' || !slot.primary) return []
    return [slot.primary.entryId.slice(0, slot.primary.entryId.lastIndexOf(':'))]
  }))
}

check(
  'curated sense agreement rejects audited derivational and polysemous false matches',
  verifiedConcepts('strongs:H7937', 'definition-2').size === 0 &&
    verifiedConcepts('strongs:H8327', 'definition-1').size === 0 &&
    (resolvedByKey.get('bdb:v.gf.ac') || []).every((sense) =>
      !verifiedConcepts('bdb:v.gf.ac', sense.key).has('root')
    ) &&
    verifiedConcepts('bdb:u.bm.aa', '3').size === 0 &&
    verifiedConcepts('bdb:j.cb.ac', '1').has('season') &&
    ['2', '3', '4', '5'].every((sense) => verifiedConcepts('bdb:j.cb.ac', sense).size === 0) &&
    ['Qal', 'Hiph'].every((sense) => verifiedConcepts('bdb:g.cd.ac', sense).size === 0)
)

function rankedFixture({ index, id, meaning, raw, terms, phrase, pos, tier, sourceOrder = 0 }) {
  return {
    index,
    dictionaryId: 'akkadian',
    entryId: id,
    language: 'akkadian',
    word: id,
    script: null,
    translit: id,
    meaning,
    raw,
    terms,
    phrase,
    pos,
    sourceTier: tier,
    sourceOrder
  }
}

const posTargets = [
  rankedFixture({ index: 0, id: 'verb-belt', meaning: 'belt', raw: ['belt'], terms: ['belt'], phrase: 'belt', pos: 'verb', tier: 5 }),
  rankedFixture({ index: 1, id: 'noun-belt', meaning: 'belt', raw: ['belt'], terms: ['belt'], phrase: 'belt', pos: 'noun', tier: 5 })
]
const posFixtureIndex = {
  senses: posTargets,
  byTerm: new Map([['belt', [0, 1]]]),
  documentFrequency: new Map([['belt', 2]])
}
const selectedNoun = selectAutomaticCandidates({
  matchable: true,
  terms: ['belt'],
  raw: ['belt'],
  phrase: 'belt',
  pos: 'noun'
}, 'akkadian', posFixtureIndex)
check(
  'pure ranking rejects a known conflicting part of speech',
  selectedNoun.length === 1 && selectedNoun[0].target.entryId === 'noun-belt'
)

const semanticTargets = [
  rankedFixture({ index: 0, id: 'clear-liquid', meaning: 'clear liquid', raw: ['clear', 'liquid'], terms: ['clear', 'liquid'], phrase: 'clear liquid', pos: 'adjective', tier: 5 })
]
const semanticFixtureIndex = {
  senses: semanticTargets,
  byTerm: new Map([['clear', [0]], ['sighted', []]]),
  documentFrequency: new Map([['clear', 1], ['liquid', 1], ['sighted', 1]])
}
check(
  'pure ranking rejects a polysemous single-token overlap',
  selectAutomaticCandidates({
    matchable: true,
    terms: ['clear', 'sighted'],
    raw: ['clear', 'sighted'],
    phrase: 'clear sighted',
    pos: 'adjective'
  }, 'akkadian', semanticFixtureIndex).length === 0
)

const exactLowTier = {
  exactPhrase: 1, exactConcept: 1, reviewedLink: 1, fit: 2, coverage: 1,
  distinctiveWeight: 1, target: rankedFixture({ index: 0, id: 'exact', meaning: 'father', raw: ['father'], terms: ['father'], phrase: 'father', pos: 'noun', tier: 1 })
}
const looseHighTier = {
  exactPhrase: 0, exactConcept: 0, reviewedLink: 1, fit: 2, coverage: 1,
  distinctiveWeight: 1, target: rankedFixture({ index: 1, id: 'loose', meaning: 'paternal', raw: ['paternal'], terms: ['father'], phrase: 'paternal', pos: 'noun', tier: 5 })
}
const stableA = { ...exactLowTier, target: { ...exactLowTier.target, entryId: 'a' } }
const stableB = { ...exactLowTier, target: { ...exactLowTier.target, entryId: 'b' } }
check(
  'semantic fit outranks source tier and stable IDs break true ties',
  compareRankedCandidates(exactLowTier, looseHighTier) < 0 &&
    compareRankedCandidates(stableA, stableB) < 0
)

const falseClear = (resolvedByKey.get('strongs:H6493') || []).flatMap(candidatesForSense)
const falseCalf = (resolvedByKey.get('strongs:H5695') || []).flatMap(candidatesForSense)
const properNameSlots = (resolvedByKey.get('strongs:H6034') || []).flatMap((sense) => sense.slots)
check(
  'reviewed no-match thresholds reject audited polysemy and metadata cases',
  !falseClear.some((candidate) => candidate.dictionaryId === 'osa-wikidata' && candidate.entryId === 'L238277') &&
    !falseCalf.some((candidate) => /(?:^| \/ )(?:grown|one)(?: \/ |$)/.test(candidate.bridge)) &&
    properNameSlots.length === 6 && properNameSlots.every((slot) => slot.status === 'none')
)

const h1 = catalogByKey.get('strongs:H1')
const h1Senses = resolvedByKey.get('strongs:H1')
const father = curatedById.get('father')
const h1Sense = h1Senses?.find((sense) => normalize(sense.label) === 'father')
check('H1 exposes the reviewed father sense', h1?.senses.length === 1 && Boolean(h1Sense))
check(
  'H1 preserves the authoritative אב forms and intentional Sumerian gap',
  h1Sense?.slots.every((slot) => {
    const expected = father.forms?.[slot.languageId]
    if (!expected) return slot.status === 'none' && !slot.primary && slot.alternatives.length === 0
    return slot.status === 'verified' && slot.primary?.entryId === `father:${slot.languageId}` &&
      slot.alternatives.length === 0
  })
)

const reviewedSenseTerms = new Map([
  ['weave/plait/fabricate', new Set(['weave', 'plait', 'fabricate'])],
  ['plot/contrive/devise', new Set(['plot', 'contrive', 'devise'])],
  ['think/consider/regard', new Set(['think', 'consider', 'regard'])],
  ['count/compute/reckon', new Set(['count', 'compute', 'reckon'])]
])
const h2803 = catalogByKey.get('strongs:H2803')
const h2803Resolved = resolvedByKey.get('strongs:H2803') || []
check(
  'H2803 exposes exactly the four audited sense groups',
  h2803?.senses.length === 4 &&
    sameArray(h2803.senses.map((sense) => sense.label), [...reviewedSenseTerms.keys()])
)
let h2803NoLeakage = h2803Resolved.length === 4
let h2803Useful = true
for (const sense of h2803Resolved) {
  const allowed = reviewedSenseTerms.get(sense.label)
  const candidates = candidatesForSense(sense)
  if (!allowed || candidates.some((candidate) =>
    candidate.bridge.split(' / ').some((term) => !allowed.has(normalize(term)))
  )) {
    h2803NoLeakage = false
  }
  if (sense.slots.filter((slot) => slot.status !== 'none').length === 0) h2803Useful = false
}
check('H2803 candidates cannot leak between think/count/weave/plot senses', h2803NoLeakage)
check('each audited H2803 sense has at least one responsible comparison', h2803Useful)

const h2805 = catalogByKey.get('strongs:H2805')
const h2805Resolved = resolvedByKey.get('strongs:H2805') || []
const beltAllowed = new Set(['belt', 'strap', 'girdle'])
const h2805Candidates = h2805Resolved.flatMap(candidatesForSense)
check(
  'H2805 remains one separate belt/strap/girdle noun sense',
  h2805?.senses.length === 1 && h2805.senses[0].label === 'belt/strap/girdle' &&
    coarsePos(h2805.partOfSpeech) !== 'verb'
)
check(
  'H2805 never receives thinking/counting/weaving candidates',
  h2805Candidates.length > 0 &&
    h2805Candidates.every((candidate) =>
      candidate.bridge.split(' / ').every((term) => beltAllowed.has(normalize(term)))
    )
)

const unpointedHashav = sortedKeys(searchHebrewCatalog(catalog, 'חשב'))
const pointedHashav = sortedKeys(searchHebrewCatalog(catalog, 'חָשַׁב'))
check('pointed and unpointed חשב searches are identical', sameArray(unpointedHashav, pointedHashav))
check(
  'חשב search preserves separate Strong\'s and BDB homographs',
  ['strongs:H2803', 'strongs:H2805', 'bdb:h.gr.aa', 'bdb:h.gr.ab']
    .every((key) => unpointedHashav.includes(key))
)
check(
  'source-ID searches preserve H2803 and H2805 separately',
  searchHebrewCatalog(catalog, 'H2803').some((entry) => entry.sourceKey === 'strongs:H2803') &&
    searchHebrewCatalog(catalog, 'H2805').some((entry) => entry.sourceKey === 'strongs:H2805') &&
    searchHebrewCatalog(catalog, 'h.gr.aa').some((entry) => entry.sourceKey === 'bdb:h.gr.aa') &&
    searchHebrewCatalog(catalog, 'h.gr.ab').some((entry) => entry.sourceKey === 'bdb:h.gr.ab')
)
check(
  'transliteration and final-letter-folded catalog search remain available',
  searchHebrewCatalog(catalog, 'chashab').some((entry) => entry.sourceKey === 'strongs:H2803') &&
    sameArray(sortedKeys(searchHebrewCatalog(catalog, 'מלך')), sortedKeys(searchHebrewCatalog(catalog, 'מלכ')))
)
check(
  'definition-only and dictionary-label catalog searches remain available',
  searchHebrewCatalog(catalog, 'interpenetrate').some((entry) => entry.sourceKey === 'strongs:H2803') &&
    searchHebrewCatalog(catalog, 'Brown-Driver-Briggs').some((entry) => entry.source === 'bdb')
)

const exactMinimum = HEBREW_CATALOG_MATCH_TIER.normalizedHeadwordDisplayOnly
check(
  'all 18,992 records classify their own headword as an exact match',
  catalog.entries.every((entry) => getHebrewCatalogMatchTier(entry, entry.headword) >= exactMinimum)
)
check(
  'all 18,992 source IDs independently select their own card for automatic opening',
  new Set(catalog.entries.map((entry) => entry.idSearch)).size === 18_992 &&
    new Set(catalog.entries.map((entry) => entry.sourceKeySearch)).size === 18_992 &&
    catalog.entries.every((entry) =>
      getHebrewCatalogMatchTier(entry, entry.id) === HEBREW_CATALOG_MATCH_TIER.sourceId &&
      selectAutoOpenSourceKey([entry], entry.id) === entry.sourceKey &&
      selectAutoOpenSourceKey([entry], entry.headword) === entry.sourceKey
    )
)

function exactHeadwordBlock(query) {
  const queryKey = normalize(query)
  const results = searchHebrewCatalog(catalog, query)
  const exact = results.filter((entry) => entry.sortKey === queryKey)
  return {
    results,
    exact,
    leading: results.slice(0, exact.length)
  }
}

const shemenBlock = exactHeadwordBlock('שמן')
check(
  'שמן ranks every exact source-distinct homograph before broader matches',
  shemenBlock.exact.length === 8 &&
    shemenBlock.leading.every((entry) => entry.sortKey === normalize('שמן')) &&
    sameArray(sortedKeys(shemenBlock.leading), sortedKeys(shemenBlock.exact))
)
check(
  'matchable שמן records rank before its display-only cross-reference',
  shemenBlock.leading.slice(0, -1).every((entry) => entry.hasMatchableSense) &&
    shemenBlock.leading.at(-1)?.sourceKey === 'bdb:v.ec.aa' &&
    !shemenBlock.leading.at(-1)?.hasMatchableSense
)

const pointedShemen = searchHebrewCatalog(catalog, 'שֶׁמֶן')
check(
  'pointed שמן narrows the first-ranked homograph group without dropping results',
  pointedShemen[0]?.sourceKey === 'bdb:v.eb.ad' &&
    pointedShemen[1]?.sourceKey === 'strongs:H8081' &&
    sameArray(sortedKeys(pointedShemen), sortedKeys(shemenBlock.results))
)

const pointedGroups = new Map()
for (const entry of catalog.entries) {
  if (!pointedGroups.has(entry.pointedKey)) pointedGroups.set(entry.pointedKey, [])
  pointedGroups.get(entry.pointedKey).push(entry)
}
const pointingPattern = /[\u05B0-\u05BD\u05BF-\u05C2\u05C4-\u05C7]/u
const mixedPointedGroups = [...pointedGroups.values()].filter((group) =>
  group.some((entry) => pointingPattern.test(entry.headword)) &&
  group.some((entry) => entry.hasMatchableSense) &&
  group.some((entry) => !entry.hasMatchableSense)
)
check(
  'pointed exact matches rank real senses before display-only cross-references',
  mixedPointedGroups.length > 0 && mixedPointedGroups.every((group) => {
    const query = group.find((entry) => pointingPattern.test(entry.headword)).headword
    const matchableTier = Math.max(...group
      .filter((entry) => entry.hasMatchableSense)
      .map((entry) => getHebrewCatalogMatchTier(entry, query)))
    const displayOnlyTier = Math.max(...group
      .filter((entry) => !entry.hasMatchableSense)
      .map((entry) => getHebrewCatalogMatchTier(entry, query)))
    return matchableTier > displayOnlyTier
  }) &&
    ['אֲבַדֹּה', 'אַבְנֵט'].every((query) =>
      searchHebrewCatalog(catalog, query)[0]?.hasMatchableSense
    )
)

const hashavBlock = exactHeadwordBlock('חשב')
check(
  'חשב ranks its four audited homographs first and keeps H2803 authoritative',
  hashavBlock.exact.length === 4 &&
    hashavBlock.leading.every((entry) => entry.sortKey === normalize('חשב')) &&
    hashavBlock.leading[0]?.sourceKey === 'strongs:H2803' &&
    new Set(hashavBlock.leading.map((entry) => entry.sourceKey)).size === 4
)
check(
  'אב promotes the authoritative curated H1 card',
  searchHebrewCatalog(catalog, 'אב')[0]?.sourceKey === 'strongs:H1'
)

const exactIdCases = [
  ['H2803', 'strongs:H2803'],
  ['H2805', 'strongs:H2805'],
  ['h.gr.aa', 'bdb:h.gr.aa'],
  ['h.gr.ab', 'bdb:h.gr.ab']
]
check(
  'exact source IDs rank and automatically open their own source record',
  exactIdCases.every(([query, expected]) => {
    const results = searchHebrewCatalog(catalog, query)
    return results[0]?.sourceKey === expected &&
      selectAutoOpenSourceKey(results, query) === expected
  })
)
check(
  'only exact Hebrew headwords and source IDs automatically open a card',
  selectAutoOpenSourceKey(searchHebrewCatalog(catalog, 'interpenetrate'), 'interpenetrate') === null &&
    selectAutoOpenSourceKey(searchHebrewCatalog(catalog, 'chasha'), 'chasha') === null &&
    selectAutoOpenSourceKey(searchHebrewCatalog(catalog, 'שְׁמוֹנ'), 'שְׁמוֹנ') === null &&
    selectAutoOpenSourceKey(searchHebrewCatalog(catalog, 'uwlay'), 'uwlay') === null &&
    searchHebrewCatalog(catalog, 'uwlay')[0]?.hasMatchableSense
)

const shardSourceSamples = new Map()
for (const entry of catalog.entries) {
  const sampleKey = `${entry.shard}:${entry.source}`
  if (!shardSourceSamples.has(sampleKey)) shardSourceSamples.set(sampleKey, entry)
}
check(
  'representative Strong\'s and BDB records from all 64 shards promote an exact card',
  shardSourceSamples.size === 128 && [...shardSourceSamples.values()].every((sample) => {
    const results = searchHebrewCatalog(catalog, sample.headword)
    const selectedKey = selectAutoOpenSourceKey(results, sample.headword)
    const selected = catalogByKey.get(selectedKey)
    const senses = resolvedByKey.get(selectedKey) || []
    return results[0]?.sortKey === sample.sortKey && selected?.sourceKey === results[0]?.sourceKey &&
      senses.length === selected.senses.length &&
      senses.every((sense) => sameArray(sense.slots.map((slot) => slot.languageId), REQUIRED_LANGUAGES))
  })
)

const collisionPairs = [
  ['servant', 'serve'], ['seed', 'sow'], ['nose', 'anger'], ['knee', 'bless'],
  ['hair', 'gate'], ['friend', 'evil'], ['goat', 'strength'], ['cattle', 'morning'],
  ['bed', 'staff'], ['scroll', 'scribe'], ['month', 'new'], ['sabbath', 'rest'],
  ['reign', 'king']
]
check(
  'the 13 curated homograph collisions remain explicit and source-distinct',
  collisionPairs.every(([left, right]) => {
    const first = curatedById.get(left)
    const second = curatedById.get(right)
    return first && second && normalize(first.hebrew.word) === normalize(second.hebrew.word) &&
      normalize(first.english[0]) !== normalize(second.english[0])
  })
)

const uiText = readFileSync(join(root, 'src', 'components', 'HebrewComparative.jsx'), 'utf8')
const stylesText = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
const aboutText = readFileSync(join(root, 'src', 'components', 'AboutView.jsx'), 'utf8')
const loaderText = readFileSync(join(root, 'src', 'lib', 'hebrewComparisonLoader.js'), 'utf8')
const viteText = readFileSync(join(root, 'vite.config.js'), 'utf8')
check(
  'UI uses the exact result and no-match labels',
  uiText.includes('Verified/curated comparison') &&
    uiText.includes('Automatically matched semantic equivalent') &&
    uiText.includes('No reliable match found in the current dictionaries.')
)
check(
  'Biblical and Jastrow Aramaic are not presented as Imperial Aramaic',
  LANGUAGES.find((language) => language.id === 'aramaic')?.caveat.includes('never relabeled Imperial Aramaic') &&
    aboutText.includes('Biblical and Jastrow Aramaic remain separately labeled reference material')
)
check(
  'UI limits candidate expansion to four and never adds Hebrew/English plaques',
  uiText.includes('slot.alternatives.slice(0, 4)') &&
    !REQUIRED_LANGUAGES.includes('hebrew') && !REQUIRED_LANGUAGES.includes('english')
)
check(
  'every Hebrew result exposes a visible mobile comparison control',
  uiText.includes('className="hebrew-row-action"') &&
    uiText.includes('Open comparison') && uiText.includes('Close comparison') &&
    stylesText.includes('.hebrew-row-action') &&
    stylesText.includes('flex: 1 0 100%')
)
check(
  'every source-backed Hebrew root exposes its yellow control',
  uiText.includes('className="rootchip hebrew-row-root"') &&
    uiText.includes('entry.rootReferences.map((reference)') &&
    uiText.includes('data-root-source={reference.sourceKey}') &&
    uiText.includes('data-root-language={reference.language}') &&
    uiText.includes('onRootClick?.(reference)')
)
check(
  'expanded mobile rows remain renderable and failed shard loads can retry',
  stylesText.includes('.hebrew-comparative-row[open] {') &&
    stylesText.includes('content-visibility: visible') &&
    uiText.includes("status === 'loading' || status === 'ready'") &&
    uiText.includes('close and reopen this entry to retry')
)
check(
  'the best exact result is wired to render open and load its comparison automatically',
  uiText.includes('selectAutoOpenSourceKey') &&
    uiText.includes('initiallyOpen={entry.sourceKey === promotedSourceKey}') &&
    uiText.includes('open={open}') &&
    uiText.includes('if (initiallyOpen) loadEntry()')
)
check(
  'About visibly reports the package version and the same installed build marker used by main',
  aboutText.includes('aria-label="Installed app version"') &&
    aboutText.includes('__APP_VERSION__') && aboutText.includes('__APP_BUILD_ID__') &&
    viteText.includes('__APP_VERSION__') && viteText.includes('__APP_BUILD_ID__') &&
    readFileSync(join(root, 'src', 'main.jsx'), 'utf8').includes('__APP_BUILD_ID__')
)
check(
  'both base schema versions and the Jastrow family have non-evicting NetworkFirst caches',
  /attested-roots-2026-07-v\[12\][\s\S]{0,240}cacheName: 'attested-root-catalog'[\s\S]{0,160}maxEntries: 2/.test(viteText) &&
    /hebrew-catalog-2026-07-v\[12\][\s\S]{0,240}cacheName: 'hebrew-comparison-catalog'[\s\S]{0,160}maxEntries: 2/.test(viteText) &&
    /hebrew-comparisons-2026-07-v\[12\][\s\S]{0,320}cacheName: 'hebrew-comparison-shards'[\s\S]{0,160}maxEntries: 128/.test(viteText) &&
    viteText.includes("cacheName: 'hebrew-jastrow-comparison-catalog'") &&
    viteText.includes("cacheName: 'hebrew-jastrow-comparison-shards'") &&
    viteText.includes("handler: 'NetworkFirst'") &&
    viteText.includes('maxEntries: 128')
)
check(
  'comparison loader clears catalog and shard caches on worker replacement',
  loaderText.includes("addEventListener('controllerchange', clearHebrewComparisonCaches)") &&
    loaderText.includes('shardCache.clear()') && loaderText.includes('catalogCache = null')
)

// Prove the initial card path fetches the catalog and only its named shard.
const tinyCatalog = {
  version: 2,
  revision: 'lazy-contract-test',
  shardCount: 64,
  languages: REQUIRED_LANGUAGES,
  sources: ['strongs'],
  entries: [[0, 'H0', 'א', null, 'test', null, '00', [['s', 'test', 'test', false, []]], 'h0 א test']]
}
const tinyJastrowCatalog = {
  version: 1,
  revision: 'lazy-jastrow-contract-test',
  shardCount: 128,
  shardDirectory: 'dicts/hebrew-jastrow-comparisons-2026-07-v1',
  languages: REQUIRED_LANGUAGES,
  sources: ['jastrow'],
  entries: [[0, 'B00486', 'בָּחַשׁ', 'bachash', 'stir', 'vb.', '00', [['stir', 'stir', 'stir', true, ['stir']]], 'jastrow b00486 בחש bachash stir', [0, 'B00486', 'בחש']]]
}
const emptySlots = Array.from({ length: 6 }, () => [0, null, []])
const tinyShard = {
  version: 2,
  shard: '00',
  languages: REQUIRED_LANGUAGES,
  candidates: [],
  records: { 'strongs:H0': [[...emptySlots]] }
}
const tinyJastrowShard = {
  version: 1,
  shard: '00',
  languages: REQUIRED_LANGUAGES,
  candidates: [],
  records: { 'jastrow:B00486': [[...emptySlots]] }
}
const fetchCalls = []
const originalFetch = globalThis.fetch
globalThis.fetch = async (url) => {
  fetchCalls.push(String(url))
  const requested = String(url)
  let payload
  if (requested.endsWith('/dicts/hebrew-catalog-2026-07-v2.json')) payload = tinyCatalog
  else if (requested.endsWith('/dicts/hebrew-jastrow-catalog-2026-07-v1.json')) {
    payload = tinyJastrowCatalog
  } else if (requested.endsWith('/dicts/hebrew-comparisons-2026-07-v2/00.json')) {
    payload = tinyShard
  } else if (requested.endsWith('/dicts/hebrew-jastrow-comparisons-2026-07-v1/00.json')) {
    payload = tinyJastrowShard
  } else {
    throw new Error(`unexpected lazy-contract request ${requested}`)
  }
  return {
    ok: true,
    status: 200,
    json: async () => payload
  }
}
try {
  const freshLoader = await import(`../src/lib/hebrewComparisonLoader.js?lazy-contract=${Date.now()}`)
  const tinyDecoded = await freshLoader.loadHebrewCatalog()
  const baseEntry = tinyDecoded.entries.find((entry) => entry.sourceKey === 'strongs:H0')
  const jastrowEntry = tinyDecoded.entries.find((entry) => entry.sourceKey === 'jastrow:B00486')
  await freshLoader.loadHebrewComparison(baseEntry)
  await freshLoader.loadHebrewComparison(baseEntry)
  await freshLoader.loadHebrewComparison(jastrowEntry)
  await freshLoader.loadHebrewComparison(jastrowEntry)
  check(
    'merged catalogs retain source labels and route each entry to its own cached shard family',
    tinyDecoded.entries.length === 2 &&
      baseEntry.sourceLabel === getDictionary('strongs').label &&
      jastrowEntry.sourceLabel === getDictionary('jastrow').label &&
      jastrowEntry.shardDirectory === 'dicts/hebrew-jastrow-comparisons-2026-07-v1' &&
      jastrowEntry.rootReference?.sourceKey === 'jastrow:B00486' &&
      fetchCalls.length === 4 &&
      fetchCalls.some((url) => url.endsWith('/dicts/hebrew-catalog-2026-07-v2.json')) &&
      fetchCalls.some((url) => url.endsWith('/dicts/hebrew-jastrow-catalog-2026-07-v1.json')) &&
      fetchCalls.some((url) => url.endsWith('/dicts/hebrew-comparisons-2026-07-v2/00.json')) &&
      fetchCalls.some((url) => url.endsWith('/dicts/hebrew-jastrow-comparisons-2026-07-v1/00.json')) &&
      fetchCalls.every((url) => !/\/(?:akkadian|sumerian|egyptian|hittite|osa)-?[^/]*\.json$/.test(url))
  )
} finally {
  globalThis.fetch = originalFetch
}

if (failures > 0) {
  console.error(`\n${failures} universal Hebrew comparison check(s) failed`)
  process.exit(1)
}
console.log(`\nall universal Hebrew comparison checks passed (${catalog.entries.length} entries)`)
