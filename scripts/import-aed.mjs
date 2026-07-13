// Imports the Thesaurus Linguae Aegyptiae "Ägyptische Wortliste" (Ancient
// Egyptian Dictionary) into public/dicts/egyptian.json.
//
// Provenance
// ----------
// Source: the AED-TEI dictionary (github.com/simondschweitzer/aed-tei,
// files/dictionary.xml), a TEI edition of the Thesaurus Linguae Aegyptiae
// lemma list, itself based on the Berlin-Brandenburg Academy database
// "Strukturen und Transformationen des Wortschatzes der ägyptischen Sprache".
// Released under Creative Commons Attribution-ShareAlike 4.0 (CC BY-SA 4.0);
// redistributed here with attribution and share-alike. Each entry keeps its
// Egyptological transliteration headword, part of speech, English and German
// glosses, and Wörterbuch bibliography.
//
// Usage:
//   node scripts/import-aed.mjs dictionary.xml
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const src = process.argv[2]
if (!src) {
  console.error('usage: node scripts/import-aed.mjs <dictionary.xml>')
  process.exit(1)
}

const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
const clean = (s) => decode((s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

const text = readFileSync(src, 'utf8')
const entries = []
const re = /<entry\b[^>]*\bxml:id="([^"]+)"[^>]*>([\s\S]*?)<\/entry>/g
let m
while ((m = re.exec(text))) {
  const id = m[1]
  const body = m[2]
  const orth = body.match(/<orth[^>]*>([\s\S]*?)<\/orth>/)
  const lemma = orth ? clean(orth[1]) : ''
  if (!lemma) continue
  const pos = body.match(/<term[^>]*>([\s\S]*?)<\/term>/)
  const en = body.match(/<cit[^>]*type="translation"[^>]*xml:lang="en"[^>]*>[\s\S]*?<quote>([\s\S]*?)<\/quote>/)
  const de = body.match(/<cit[^>]*type="translation"[^>]*xml:lang="de"[^>]*>[\s\S]*?<quote>([\s\S]*?)<\/quote>/)
  const bibl = body.match(/<bibl[^>]*>([\s\S]*?)<\/bibl>/)
  const rec = { id, lemma }
  const posText = pos ? clean(pos[1]).replace(/\/+$/, '').replace(/\//g, ' · ') : ''
  if (posText) rec.pos = posText
  const enText = en ? clean(en[1]) : ''
  const deText = de ? clean(de[1]) : ''
  rec.def = enText || deText
  if (enText && deText) rec.de = deText
  if (bibl) rec.ref = clean(bibl[1])
  if (!rec.def) continue
  entries.push(rec)
}

const out = {
  work: "Ancient Egyptian Dictionary (Ägyptische Wortliste), Thesaurus Linguae Aegyptiae / Berlin-Brandenburg Academy",
  license: "CC BY-SA 4.0",
  conversion:
    'AED-TEI edition (github.com/simondschweitzer/aed-tei) of the TLA lemma list, CC BY-SA 4.0; transliteration, part of speech, English/German glosses and bibliography extracted by scripts/import-aed.mjs',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'egyptian.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
