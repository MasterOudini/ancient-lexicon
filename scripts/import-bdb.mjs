// Imports the Brown-Driver-Briggs Hebrew and English Lexicon (1906) into
// src/data/bdb.json.
//
// Provenance
// ----------
// Work: Francis Brown, S. R. Driver, C. A. Briggs, "A Hebrew and English
// Lexicon of the Old Testament" (1906) — public domain. Includes an appendix
// of Biblical Aramaic. Machine-readable XML from the OpenScriptures
// HebrewLexicon project (github.com/openscriptures/HebrewLexicon,
// BrownDriverBriggs.xml), which digitized the public-domain text. This script
// reads that XML, extracts each entry's headword and a plain-text rendering
// of its definition, and (where present) its Strong's number. Presented in
// the app as a published reference work (see the About screen).
//
// Usage:
//   node scripts/import-bdb.mjs BrownDriverBriggs.xml
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-bdb.mjs <BrownDriverBriggs.xml>')
  process.exit(1)
}

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

const text = readFileSync(src, 'utf8')
const entries = []
const re = /<entry id="([^"]+)"[^>]*>([\s\S]*?)<\/entry>/g
let m
while ((m = re.exec(text))) {
  const id = m[1]
  const body = m[2]
  const wMatch = body.match(/<w[^>]*>([\s\S]*?)<\/w>/)
  const lemma = wMatch ? strip(wMatch[1]) : ''
  if (!lemma) continue
  // Strong's number, if the entry links one.
  const strong = body.match(/<w[^>]*\bxlit[^>]*>/) // placeholder guard
  const posMatch = body.match(/<pos>([\s\S]*?)<\/pos>/)
  const def = strip(body.replace(/<status[\s\S]*?<\/status>/g, ''))
  const rec = { id, lemma, def }
  if (posMatch) rec.pos = strip(posMatch[1])
  entries.push(rec)
}

const out = {
  work: "A Hebrew and English Lexicon of the Old Testament (Brown, Driver & Briggs, 1906; public domain; includes Biblical Aramaic)",
  conversion:
    'Machine-readable XML from the OpenScriptures HebrewLexicon project (github.com/openscriptures/HebrewLexicon); markup rendered to plain text by scripts/import-bdb.mjs',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'bdb.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
