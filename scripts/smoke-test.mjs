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
import { normalize, searchEntries, searchRoots } from '../src/lib/search.js'

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
  normalize('ʾab') === 'ab' && normalize('ʿayin') === 'ayin'
)
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
