// Imports the electronic Pennsylvania Sumerian Dictionary (ePSD2) glossary
// into public/dicts/sumerian.json.
//
// Provenance
// ----------
// Source: ePSD2 (Electronic Pennsylvania Sumerian Dictionary, 2nd ed.,
// Steve Tinney et al., University of Pennsylvania), an ORACC project,
// oracc.museum.upenn.edu/epsd2 — released CC BY-SA 3.0. Obtained as the
// committed ePSD2 source JSON of the open-source "hubur" searcher
// (github.com/uyumyuuy/hubur, src/assets/epsd2_src.json). Redistributed with
// attribution and share-alike. Each kept entry has a citation form
// (transliteration), part of speech, an English meaning, and — where ORACC
// records it — the cuneiform spelling.
//
// Usage:
//   node scripts/import-epsd2.mjs epsd2_src.json
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-epsd2.mjs <epsd2_src.json>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(src, 'utf8'))
const entries = []
for (const r of raw) {
  const def = r.meaning || (r.gw ? r.gw.toLowerCase() : '')
  if (!r.cf || !def) continue // skip unglossed names/forms
  const rec = { id: r.id, lemma: r.cf, def }
  if (r.pos) rec.pos = r.pos
  const cun = r.orth?.find((o) => o.cuneiform)?.cuneiform
  if (cun) rec.cun = cun
  entries.push(rec)
}

const out = {
  work: "Electronic Pennsylvania Sumerian Dictionary (ePSD2, 2nd ed.), Steve Tinney et al., University of Pennsylvania / ORACC",
  license: 'CC BY-SA 3.0',
  conversion:
    'ePSD2 glossary (oracc.museum.upenn.edu/epsd2), CC BY-SA 3.0, via the committed source JSON of github.com/uyumyuuy/hubur; citation form, part of speech, English meaning and cuneiform extracted by scripts/import-epsd2.mjs',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'sumerian.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
