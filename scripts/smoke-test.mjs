// Data-layer smoke test. Run with: node scripts/smoke-test.mjs (or npm test).
// Imports only src/data and src/lib modules (no JSX, no vite virtuals), so it
// runs under bare node. Expected glyph strings are built with
// String.fromCodePoint so no astral literal can be silently corrupted.

import { readFileSync } from 'node:fs'
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
import { LEXICON } from '../src/data/lexicon.js'
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

check('DOUBLETS has exactly 3 entries', DOUBLETS.length === 3)
check(
  'every doublet type is metathesis or variant',
  DOUBLETS.every((d) => d.type === 'metathesis' || d.type === 'variant')
)
check(
  'every doublet root resolves in the database',
  DOUBLETS.every((d) => d.roots.every((r) => findRoot('hebrew', r)))
)
check('CLUSTERS has exactly 1 entry', CLUSTERS.length === 1)
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
for (const file of ['languages.js', 'lexicon.js', 'roots.js']) {
  const text = readFileSync(join(here, '..', 'src', 'data', file), 'utf8')
  check(`no asterisked forms in ${file}`, !text.includes('*'))
  // Comment lines may state the no-proto-forms policy; data strings may not.
  const dataLines = text
    .split('\n')
    .filter((l) => !l.trim().startsWith('//'))
    .join('\n')
  check(`no proto-forms in ${file}`, !/proto-/i.test(dataLines))
}

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
