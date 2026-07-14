// Data-layer smoke test. Run with: node scripts/smoke-test.mjs (or npm test).
// Imports only src/data and src/lib modules (no JSX, no vite virtuals), so it
// runs under bare node. Expected glyph strings are built with
// String.fromCodePoint so no astral literal can be silently corrupted.

import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  foldFinals,
  toImperialAramaic,
  toMusnad,
  OSA_TOKENS,
  HEB_TO_IMPERIAL_ARAMAIC
} from '../src/lib/scripts.js'
import {
  ROOTS,
  DOUBLETS,
  CLUSTERS,
  rootKey,
  uniquePermutations,
  findRoot
} from '../src/data/roots.js'
import { LEXICON, CATEGORIES } from '../src/data/lexicon.js'
import { LANGUAGES } from '../src/data/languages.js'
import { REFERENCE_DICTIONARIES } from '../src/data/referenceDictionaries.js'
import { normalize, searchEntries, searchRoots } from '../src/lib/search.js'
import {
  GLOSS_STOP_WORDS,
  expandGlossRecord,
  expandGlossSense,
  searchGlossIndex
} from '../src/lib/glossSearch.js'

let failures = 0
function check(name, cond) {
  if (cond) {
    console.log(`ok    ${name}`)
  } else {
    failures++
    console.error(`FAIL  ${name}`)
  }
}

const cp = (...codes) => String.fromCodePoint(...codes)

// --- Script mappers ---------------------------------------------------------

check(
  "toImperialAramaic('מלכא') renders mem-lamedh-kaph-aleph",
  toImperialAramaic('מלכא') === cp(0x1084c, 0x1084b, 0x1084a, 0x10840)
)
check(
  'Imperial Aramaic map has all 22 letters plus 5 finals',
  Object.keys(HEB_TO_IMPERIAL_ARAMAIC).length === 27
)
check(
  'final letters fold: מלך and מלכ render identically',
  toImperialAramaic('מלך') === toImperialAramaic('מלכ')
)
for (const [fin, base] of [
  ['ם', 'מ'],
  ['ן', 'נ'],
  ['ף', 'פ'],
  ['ץ', 'צ']
]) {
  check(
    `final ${fin} folds to ${base}`,
    foldFinals(fin) === base &&
      toImperialAramaic(fin) === toImperialAramaic(base)
  )
}
check(
  "toMusnad(['m','l','k']) renders mem-lamedh-kaph",
  toMusnad(['m', 'l', 'k']) === cp(0x10a63, 0x10a61, 0x10a6b)
)
check(
  "toMusnad(['b','n']) renders beth-nun",
  toMusnad(['b', 'n']) === cp(0x10a68, 0x10a6c)
)
check('OSA token map has 29 tokens', Object.keys(OSA_TOKENS).length === 29)

// --- Permutations -----------------------------------------------------------

const qrbPerms = uniquePermutations(['ק', 'ר', 'ב'])
check('קרב has exactly 6 unique permutations', qrbPerms.length === 6)
const qrbFound = qrbPerms.filter((p) => findRoot('hebrew', p))
check(
  'all 6 permutations of קרב are attested roots in the database',
  qrbFound.length === 6
)
const expectedQrb = new Set(['קרב', 'קבר', 'רקב', 'רבק', 'בקר', 'ברק'])
check(
  'the קרב permutation set is exactly {קרב, קבר, רקב, רבק, בקר, ברק}',
  qrbPerms.every((p) => expectedQrb.has(p)) && expectedQrb.size === 6
)
check(
  'repeated letters deduplicate: לבב has 3 unique permutations, not 6',
  uniquePermutations(['ל', 'ב', 'ב']).length === 3
)
check(
  'rootKey folds finals: מלך and מלכ share a key',
  rootKey('מלך') === rootKey(['מ', 'ל', 'כ'])
)

// --- Database integrity -----------------------------------------------------

const lexIds = LEXICON.map((e) => e.id)
check('no duplicate lexicon entry ids', new Set(lexIds).size === lexIds.length)
const rootIds = ROOTS.map((r) => r.id)
check('no duplicate root ids', new Set(rootIds).size === rootIds.length)
const rootKeys = ROOTS.map((r) => r.lang + ':' + rootKey(r.letters))
check(
  'no duplicate (lang, letters) roots',
  new Set(rootKeys).size === rootKeys.length
)

for (const entry of LEXICON) {
  check(
    `root chip resolves: ${entry.id} (${entry.hebrew.root})`,
    findRoot('hebrew', entry.hebrew.root) !== null
  )
}

const FINALS = /[ךםןףץ]/
check(
  'no final letters in any root letters array',
  ROOTS.every((r) => !r.letters.some((l) => FINALS.test(l)))
)
check(
  'no final letters in any lexicon hebrew.root',
  LEXICON.every((e) => !FINALS.test(e.hebrew.root))
)

const langIds = new Set(LANGUAGES.map((l) => l.id))
check('language registry has 6 languages', langIds.size === 6)
for (const entry of LEXICON) {
  const keys = Object.keys(entry.forms || {})
  check(
    `forms keys of ${entry.id} are all registered languages`,
    keys.every((k) => langIds.has(k))
  )
  const ar = entry.forms.aramaic
  if (ar) {
    check(`aramaic form of ${entry.id} has hebrewLetters`, !!ar.hebrewLetters)
  }
  const osa = entry.forms.osa
  if (osa) {
    check(
      `osa form of ${entry.id} has valid tokens`,
      Array.isArray(osa.tokens) && osa.tokens.every((t) => t in OSA_TOKENS)
    )
  }
}

check('DOUBLETS has at least 3 entries', DOUBLETS.length >= 3)
check(
  'every doublet type is metathesis or variant',
  DOUBLETS.every((d) => d.type === 'metathesis' || d.type === 'variant')
)
check(
  'every doublet root resolves in the database',
  DOUBLETS.every((d) => d.roots.every((r) => findRoot('hebrew', r)))
)
check(
  'every doublet has a citation',
  DOUBLETS.every((d) => typeof d.citation === 'string' && d.citation.length > 0)
)
check('CLUSTERS has at least 1 entry', CLUSTERS.length >= 1)
check(
  'every cluster has id, title, note, and at least 2 members',
  CLUSTERS.every(
    (c) => c.id && c.title && c.note && Array.isArray(c.members) && c.members.length >= 2
  )
)
check(
  'every cluster member resolves in the database',
  CLUSTERS.every((c) => c.members.every((m) => findRoot('hebrew', m)))
)
check(
  'no final letters in DOUBLETS root strings',
  DOUBLETS.every((d) => d.roots.every((r) => !FINALS.test(r)))
)
check(
  'no final letters in CLUSTERS member strings',
  CLUSTERS.every((c) => c.members.every((m) => !FINALS.test(m)))
)

// --- No reconstructed forms anywhere in the data files -----------------------

const here = dirname(fileURLToPath(import.meta.url))
const dataDir = join(here, '..', 'src', 'data')
const dataFiles = [
  'languages.js',
  'lexicon.js',
  'roots.js',
  ...readdirSync(join(dataDir, 'lexicon')).map((f) => join('lexicon', f))
]
for (const file of dataFiles) {
  const text = readFileSync(join(dataDir, file), 'utf8')
  check(`no asterisked forms in ${file}`, !text.includes('*'))
  // Comment lines may state the no-proto-forms policy; data strings may not.
  const dataLines = text
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n')
  check(`no proto-forms in ${file}`, !/proto-/i.test(dataLines))
}

// --- Database integrity at scale ---------------------------------------------
// These invariants keep a growing database honest: pointing present where the
// conventions promise it, ids well-formed, and every original-script string
// inside the Unicode block of its own script (a glyph pasted from the wrong
// script, or typed from memory, fails loudly here).

const NIQQUD = /[ְ-ׇּׁׂ]/
check(
  'every lexicon hebrew.word carries Masoretic pointing',
  LEXICON.every((e) => NIQQUD.test(e.hebrew.word))
)
check(
  'every root attested word carries Masoretic pointing',
  ROOTS.every((r) => (r.attested || []).every((a) => NIQQUD.test(a.word)))
)
check(
  'every root has at least one attested word',
  ROOTS.every((r) => Array.isArray(r.attested) && r.attested.length > 0)
)
check(
  'every lexicon entry has at least one English gloss',
  LEXICON.every(
    (e) => Array.isArray(e.english) && e.english.length > 0 && e.english.every(Boolean)
  )
)
check(
  'every lexicon entry has hebrew word, translit, and root',
  LEXICON.every((e) => e.hebrew?.word && e.hebrew?.translit && e.hebrew?.root)
)
check(
  'every form is a non-empty object with a payload field',
  LEXICON.every((e) =>
    Object.values(e.forms || {}).every(
      (f) => f && (f.translit || f.script || f.hebrewLetters || f.tokens)
    )
  )
)
check(
  'lexicon ids are well-formed (lowercase, hyphenated)',
  LEXICON.every((e) => /^[a-z][a-z0-9-]*$/.test(e.id))
)
check(
  'root ids are well-formed (he- prefix)',
  ROOTS.every((r) => /^he-[a-z0-9-]+$/.test(r.id))
)
check(
  'aramaic hebrewLetters use Hebrew letters only (no pointing)',
  LEXICON.every((e) => {
    const hl = e.forms?.aramaic?.hebrewLetters
    return !hl || /^[א-ת]+$/.test(hl)
  })
)
check(
  'every hebrew.word stays inside the Hebrew block',
  LEXICON.every((e) => [...e.hebrew.word].every((ch) => {
    const c = ch.codePointAt(0)
    return c >= 0x0590 && c <= 0x05ff
  }))
)

const inCuneiform = (c) =>
  (c >= 0x12000 && c <= 0x123ff) || (c >= 0x12400 && c <= 0x1247f)
const inHieroglyphs = (c) => c >= 0x13000 && c <= 0x1342f
const SCRIPT_BLOCKS = {
  akkadian: inCuneiform,
  sumerian: inCuneiform,
  hittite: inCuneiform,
  egyptian: inHieroglyphs
}
for (const [lang, inBlock] of Object.entries(SCRIPT_BLOCKS)) {
  check(
    `every ${lang} script string stays inside its own Unicode block`,
    LEXICON.every((e) => {
      const s = e.forms?.[lang]?.script
      return !s || [...s].every((ch) => inBlock(ch.codePointAt(0)))
    })
  )
}

// --- Imported Strong's lexicon (published reference work; checked
// structurally, not editorially — see scripts/import-strongs.mjs) ------------

const strongs = JSON.parse(
  readFileSync(join(dataDir, 'strongs.json'), 'utf8')
)
check('strongs.json has more than 8000 entries', strongs.count > 8000)
check(
  'strongs.json count matches entries length',
  strongs.count === strongs.entries.length
)
const strongsIds = strongs.entries.map((e) => e.id)
check(
  'strongs ids are unique and well-formed',
  new Set(strongsIds).size === strongsIds.length &&
    strongsIds.every((id) => /^H\d+$/.test(id))
)
check(
  'every strongs entry has a Hebrew lemma and a definition',
  strongs.entries.every(
    (e) =>
      e.lemma &&
      [...e.lemma].some((ch) => {
        const c = ch.codePointAt(0)
        return c >= 0x0590 && c <= 0x05ff
      }) &&
      typeof e.def === 'string' &&
      e.def.length > 0
  )
)
check(
  'strongs.json declares its provenance',
  typeof strongs.work === 'string' && strongs.work.includes('public domain')
)

// --- The on-demand reference dictionaries in public/dicts/ ------------------
// Each is a complete published work loaded at runtime; check structure and
// that every one declared in the registry has its data file present.

const projectRoot = join(here, '..')
const dictsDir = join(projectRoot, 'public', 'dicts')
const registryText = readFileSync(
  join(dataDir, 'referenceDictionaries.js'),
  'utf8'
)
const urlDicts = [...registryText.matchAll(/url:\s*'dicts\/([^']+)'/g)].map(
  (m) => m[1]
)
const referenceData = new Map([['strongs', strongs]])
check('reference registry declares on-demand dictionaries', urlDicts.length >= 1)
for (const file of urlDicts) {
  let dict
  try {
    dict = JSON.parse(readFileSync(join(dictsDir, file), 'utf8'))
  } catch {
    check(`reference dictionary ${file} is present and valid JSON`, false)
    continue
  }
  check(
    `${file}: has entries and a matching count`,
    Array.isArray(dict.entries) &&
      dict.entries.length > 100 &&
      dict.count === dict.entries.length
  )
  check(
    `${file}: every entry has an id, a headword, and a definition`,
    dict.entries.every((e) => e.id && e.lemma && typeof e.def === 'string' && e.def.length > 0)
  )
  check(
    `${file}: ids are unique`,
    new Set(dict.entries.map((e) => e.id)).size === dict.entries.length
  )
  check(
    `${file}: declares its source work`,
    typeof dict.work === 'string' && dict.work.length > 0
  )
  const registered = REFERENCE_DICTIONARIES.find(
    (item) => item.source.kind === 'url' && item.source.url.endsWith(file)
  )
  if (registered) referenceData.set(registered.id, dict)
}

// --- Cross-dictionary English gloss index ---------------------------------
// The artifact is generated at build time. Its compact integer references
// expand to {d,i,l,g,lang} postings without loading a full dictionary in the
// browser. Validate every reference against the source data here.

let glossIndex
try {
  glossIndex = JSON.parse(
    readFileSync(join(dictsDir, 'gloss-index.json'), 'utf8')
  )
  check('gloss index is present and valid JSON', true)
} catch {
  check('gloss index is present and valid JSON', false)
  glossIndex = null
}

if (glossIndex) {
  const keywordEntries = Object.entries(glossIndex.keywords || {})
  check('gloss index uses the sense-aware schema', glossIndex.version === 2)
  check('gloss index has records', Array.isArray(glossIndex.records) && glossIndex.records.length > 0)
  check('gloss index has English keyword postings', keywordEntries.length > 0)
  check('gloss index has Hebrew/transliteration headwords', Object.keys(glossIndex.heads || {}).length > 0)
  check(
    'English stop words are absent from gloss index keys',
    [...GLOSS_STOP_WORDS].every((word) => !(word in glossIndex.keywords))
  )

  const sourceIds = new Set(['curated', ...REFERENCE_DICTIONARIES.map((dict) => dict.id)])
  const sourceEntryIds = new Map([
    ['curated', new Set(LEXICON.map((entry) => entry.id))],
    ...[...referenceData].map(([id, data]) => [id, new Set(data.entries.map((entry) => String(entry.id)))])
  ])
  const sourceEntriesById = new Map(
    [...referenceData].map(([id, data]) => [
      id,
      new Map(data.entries.map((entry) => [String(entry.id), entry]))
    ])
  )

  let postingsValid = true
  let postingsResolve = true
  let postingCapsHold = true
  let duplicateFree = true
  let egyptianEnglishOnly = true
  const usedSources = new Set()

  for (const [keyword, encodedPostings] of keywordEntries) {
    if (!Array.isArray(encodedPostings) || encodedPostings.length === 0) {
      postingsValid = false
      continue
    }
    const seen = new Set()
    const languageCounts = new Map()
    for (const encoded of encodedPostings) {
      const senseId = Math.floor(encoded / 3)
      const posting = expandGlossSense(glossIndex, senseId)
      if (
        !Number.isInteger(encoded) ||
        !posting ||
        !sourceIds.has(posting.d) ||
        !posting.i ||
        !posting.l ||
        !posting.g ||
        !posting.lang
      ) {
        postingsValid = false
        continue
      }
      usedSources.add(posting.d)
      if (!sourceEntryIds.get(posting.d)?.has(String(posting.i))) postingsResolve = false
      const duplicateKey = `${posting.d}:${posting.i}:${posting.lang}`
      if (seen.has(duplicateKey)) duplicateFree = false
      seen.add(duplicateKey)
      languageCounts.set(posting.lang, (languageCounts.get(posting.lang) || 0) + 1)
      if (posting.d === 'egyptian' && !sourceEntriesById.get('egyptian')?.get(String(posting.i))?.de) {
        egyptianEnglishOnly = false
      }
    }
    for (const [language, count] of languageCounts) {
      if (language !== 'Comparative' && count > glossIndex.capPerLanguage) postingCapsHold = false
    }
  }

  let headsValid = true
  for (const [head, recordIds] of Object.entries(glossIndex.heads || {})) {
    if (!head || !Array.isArray(recordIds) || recordIds.length === 0) headsValid = false
    if (recordIds.some((recordId) => !glossIndex.records[recordId])) headsValid = false
  }

  let recordTermsValid = true
  const keywordCount = keywordEntries.length
  let sensesValid = Array.isArray(glossIndex.senses) && glossIndex.senses.length > 0
  for (let recordId = 0; recordId < glossIndex.records.length; recordId++) {
    const record = glossIndex.records[recordId]
    const primarySense = glossIndex.senses?.[record?.[3]]
    if (!primarySense || primarySense[0] !== recordId || !primarySense[1]) sensesValid = false
    if (!Array.isArray(record?.[5]) || record[5].some((termId) => termId < 0 || termId >= keywordCount)) {
      recordTermsValid = false
      break
    }
  }
  if (glossIndex.senses?.some((sense) =>
    !Array.isArray(sense) || !glossIndex.records[sense[0]] || !sense[1]
  )) sensesValid = false

  check('every gloss posting has a valid compact shape', postingsValid)
  check('every gloss posting resolves to its named source entry', postingsResolve)
  check('gloss postings are de-duplicated by source and entry', duplicateFree)
  check('gloss posting caps hold per keyword and language', postingCapsHold)
  check('every registered source contributes gloss postings', [...sourceIds].every((id) => usedSources.has(id)))
  check('Egyptian postings use explicit English glosses only', egyptianEnglishOnly)
  check('every gloss headword reference resolves to a record', headsValid)
  check('every gloss sense resolves to its source record', sensesValid)
  check('every record sense-key reference resolves to a keyword', recordTermsValid)

  const languageCount = (result) =>
    Object.values(result.groups).filter((entries) => entries.length > 0).length
  for (const word of ['father', 'water', 'king']) {
    check(
      `meaning search '${word}' reaches at least 3 languages`,
      languageCount(searchGlossIndex(glossIndex, word)) >= 3
    )
  }
  check(
    'every curated primary English gloss returns its own verified card',
    LEXICON.every((entry) =>
      searchGlossIndex(glossIndex, entry.english[0]).curatedIds.includes(entry.id)
    )
  )
  const fatherHebrew = searchGlossIndex(glossIndex, 'אב')
  const waterHebrew = searchGlossIndex(glossIndex, 'מים')
  const fatherEnglish = searchGlossIndex(glossIndex, 'father')
  check('Hebrew אב pivots to father across at least 3 languages', fatherHebrew.curatedIds[0] === 'father' && languageCount(fatherHebrew) >= 3)
  check('Hebrew מים pivots to water across at least 3 languages', waterHebrew.curatedIds.includes('water') && languageCount(waterHebrew) >= 3)
  check(
    'real father head senses rank above incidental BDB prose',
    fatherEnglish.groups.Hebrew[0]?.i === 'H1' &&
      !fatherEnglish.groups.Hebrew.slice(0, 3).some((posting) => posting.i === 'd.ao.ac')
  )
  const firstUnmatchedFatherHead = fatherHebrew.direct.findIndex((posting) => !posting.matchedKeyword)
  check(
    'sense-aligned direct headword hits rank before unrelated homographs',
    firstUnmatchedFatherHead < 0 ||
      fatherHebrew.direct.slice(firstUnmatchedFatherHead).every((posting) => !posting.matchedKeyword)
  )
  check(
    'curated roots are not indexed as extra headword aliases',
    LEXICON.every((entry) => {
      const root = normalize(entry.hebrew.root)
      const aramaic = entry.forms?.aramaic
      const actualHeads = [
        entry.hebrew.word,
        entry.hebrew.translit,
        aramaic?.hebrewLetters,
        aramaic?.translit
      ].filter(Boolean)
      if (actualHeads.some((head) => normalize(head) === root)) return true
      return !(glossIndex.heads[root] || []).some((recordId) => {
        const posting = expandGlossRecord(glossIndex, recordId)
        return posting?.d === 'curated' && posting.i === entry.id
      })
    })
  )
  check(
    'Jastrow superscript sense markers are stripped from head aliases',
    (glossIndex.heads[normalize('אֵגֶד')] || []).some((recordId) =>
      expandGlossRecord(glossIndex, recordId)?.i === 'A00245'
    )
  )
  check(
    'late Sumerian senses keep their matched display gloss',
    searchGlossIndex(glossIndex, 'stand').groups.Sumerian.some(
      (posting) => posting.i === 'o0025986' && /stand/i.test(posting.g)
    )
  )
  check(
    'lowercase semantic parentheticals remain indexed',
    searchGlossIndex(glossIndex, 'cosmic').groups.Akkadian.some(
      (posting) => posting.i === 'akk-00145' && /cosmic/i.test(posting.g)
    )
  )
  check(
    'a truncated display gloss still exposes its matched keyword',
    Object.values(searchGlossIndex(glossIndex, 'abacus').groups)
      .flat()
      .some((posting) => posting.matchedKeyword === 'abacus')
  )
  const melek = searchGlossIndex(glossIndex, 'melek')
  check('melek pivots to king without the incidental number two', melek.curatedIds[0] === 'king' && !melek.curatedIds.includes('two'))
  check('English name returns the verified name card', searchGlossIndex(glossIndex, 'name').curatedIds[0] === 'name')
  check('Hebrew שם pivots through the verified name card', searchGlossIndex(glossIndex, 'שם').curatedIds[0] === 'name')
  check('English man does not inherit the vessel transliteration alias', !searchGlossIndex(glossIndex, 'man').curatedIds.includes('vessel'))
  check('English beer does not inherit the well transliteration alias', !searchGlossIndex(glossIndex, 'beer').curatedIds.includes('well'))
  const figEntry = LEXICON.find((entry) => entry.id === 'fig')
  check('English and Hebrew fig both return the verified fig card',
    searchGlossIndex(glossIndex, 'fig').curatedIds[0] === 'fig' &&
      searchGlossIndex(glossIndex, figEntry.hebrew.word).curatedIds.includes('fig'))
  check('plain transliteration ab pivots through Hebrew father', searchGlossIndex(glossIndex, 'ab').curatedIds[0] === 'father')
  check('a nonsense meaning returns nothing', searchGlossIndex(glossIndex, 'nonsensezzq').total === 0)
}

const categoryIds = CATEGORIES.map((c) => c.id)
check(
  'category ids are unique',
  new Set(categoryIds).size === categoryIds.length
)
check(
  'every lexicon entry carries a valid category id',
  LEXICON.every((e) => categoryIds.includes(e.category))
)
const primaryGlosses = LEXICON.map((e) => e.english[0].toLowerCase())
check(
  'no duplicate primary gloss across entries',
  new Set(primaryGlosses).size === primaryGlosses.length
)

// --- Search normalization ----------------------------------------------------

check(
  'pointed and unpointed Hebrew normalize identically',
  normalize('שָׁלוֹם') === normalize('שלום')
)
check("normalize('šalāmu') is 'salamu'", normalize('šalāmu') === 'salamu')
check(
  'transliteration marks are stripped',
  normalize('ʾab') === 'ab' && normalize('ʿayin') === 'ayin' && normalize('ʼâb') === 'ab'
)
check('Egyptological ꜣ folds for plain-keyboard search', normalize('ꜣb') === 'ab')
check(
  'final letters fold in search too',
  normalize('מלך') === normalize('מלכ')
)

const shalomResults = searchEntries(LEXICON, 'shalom')
check(
  "searching 'shalom' finds peace first",
  shalomResults[0]?.id === 'peace'
)
const glyphResults = searchEntries(LEXICON, cp(0x12217))
check('pasting the LUGAL glyph finds king', glyphResults[0]?.id === 'king')
// Aramaic and Musnad glyphs are derived at render time; pasting the glyphs
// the app displays must still find the entry.
const aramaicPaste = searchEntries(LEXICON, toImperialAramaic('מלכא'))
check(
  'pasting the displayed Imperial Aramaic glyphs finds king',
  aramaicPaste[0]?.id === 'king'
)
const musnadPaste = searchEntries(LEXICON, toMusnad(['m', 'l', 'k']))
check(
  'pasting the displayed Musnad glyphs finds king',
  musnadPaste[0]?.id === 'king'
)
const sulmuResults = searchEntries(LEXICON, 'sulmu')
check(
  "searching 'sulmu' (šulmu without diacritics) finds peace",
  sulmuResults.some((e) => e.id === 'peace')
)
const salamuRoots = searchRoots(ROOTS, 'salamu')
check(
  "root search for 'salamu' (šalāmu without diacritics) finds שלמ",
  salamuRoots.some((r) => rootKey(r.letters) === 'שלמ')
)
check(
  'empty query lists all entries',
  searchEntries(LEXICON, '').length === LEXICON.length
)

// -----------------------------------------------------------------------------

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`)
  process.exit(1)
}
console.log(`\nall checks passed (roots: ${ROOTS.length}, entries: ${LEXICON.length})`)
