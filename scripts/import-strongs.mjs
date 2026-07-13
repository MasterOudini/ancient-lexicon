// Imports the public-domain Strong's Hebrew dictionary into
// src/data/strongs.json.
//
// Provenance
// ----------
// Work: "A Concise Dictionary of the Words in the Hebrew Bible with their
// Renderings in the King James Version" by James Strong (1894) — public
// domain. Machine-readable JSON arrangement: copyright 2010 Open
// Scriptures, CC-BY-SA, from the openscriptures/strongs project,
// distributed as the npm package strongs@1.0.2. This script reads that
// package's hebrew/strongs-hebrew-dictionary.js VERBATIM and re-emits it
// as compact JSON — no entry is added, dropped, or edited. The imported
// file is presented in the app as a published reference work, distinct
// from the hand-curated comparative database (see the About screen).
//
// Usage:
//   npm pack strongs@1.0.2 && tar xzf strongs-1.0.2.tgz
//   node scripts/import-strongs.mjs package/hebrew/strongs-hebrew-dictionary.js
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-strongs.mjs <strongs-hebrew-dictionary.js>')
  process.exit(1)
}

const text = readFileSync(src, 'utf8')
const start = text.indexOf('{"H1"')
const end = text.lastIndexOf('}', text.indexOf('module.exports')) + 1
const dict = JSON.parse(text.slice(start, end))

const entries = Object.entries(dict)
  .sort((a, b) => Number(a[0].slice(1)) - Number(b[0].slice(1)))
  .map(([id, e]) => {
    const rec = { id, lemma: e.lemma, xlit: e.xlit, pron: e.pron, def: e.strongs_def }
    if (e.derivation) rec.deriv = e.derivation
    if (e.kjv_def) rec.kjv = e.kjv_def
    return rec
  })

const out = {
  work: "A Concise Dictionary of the Words in the Hebrew Bible with their Renderings in the King James Version (James Strong, 1894; public domain)",
  conversion:
    'JSON arrangement copyright 2010 Open Scriptures, CC-BY-SA (openscriptures/strongs, npm package strongs@1.0.2); re-emitted unmodified by scripts/import-strongs.mjs',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'src', 'data', 'strongs.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
