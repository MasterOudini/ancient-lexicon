// Imports the ORACC RINAP Akkadian glossary into
// public/dicts/akkadian.json.
//
// Provenance
// ----------
// Source: the Akkadian glossary of RINAP (Royal Inscriptions of the
// Neo-Assyrian Period, oracc.museum.upenn.edu/rinap), an ORACC project —
// released CC BY-SA 3.0. Obtained from the committed lexicon artifact of the
// open-source ClassicsViewer project (github.com/threedlite/classicsviewer,
// cuneiform/akkadian_lexicon.zip), grouped by lemma here. This is one ORACC
// Akkadian sub-corpus (Neo-Assyrian royal inscriptions), not the full
// aggregated Akkadian lexicon. Each entry has a citation form (normalized
// transliteration), part of speech, and English guide-word senses.
//
// Usage:
//   node scripts/import-akkadian.mjs akkadian-rinap.json
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-akkadian.mjs <akkadian-rinap.json>')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(src, 'utf8'))
const entries = []
let n = 0
for (const r of raw) {
  const senses = r.senses || []
  const def = senses
    .map((s) => s.guide_word + (s.pos ? ' (' + s.pos + ')' : ''))
    .filter(Boolean)
    .join('; ')
  if (!r.lemma || !def) continue
  n += 1
  const rec = {
    id: 'akk-' + String(n).padStart(5, '0'),
    lemma: r.lemma,
    def
  }
  if (senses[0]?.pos) rec.pos = senses[0].pos
  entries.push(rec)
}

const out = {
  work: "Akkadian glossary of RINAP (Royal Inscriptions of the Neo-Assyrian Period), ORACC / University of Pennsylvania",
  license: 'CC BY-SA 3.0',
  conversion:
    'ORACC RINAP Akkadian glossary (oracc.museum.upenn.edu/rinap), CC BY-SA 3.0, via the committed lexicon of github.com/threedlite/classicsviewer; grouped by lemma with guide-word senses by scripts/import-akkadian.mjs. One Neo-Assyrian sub-corpus, not the full Akkadian lexicon.',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'akkadian.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
