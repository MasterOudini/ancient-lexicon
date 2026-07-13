// Imports Marcus Jastrow's "A Dictionary of the Targumim, the Talmud Babli
// and Yerushalmi, and the Midrashic Literature" (1903) into
// src/data/jastrow.json.
//
// Provenance
// ----------
// Work: Marcus Jastrow, 1903 — public domain (author died 1903; published
// 1886-1903). Machine-readable digitization by Sefaria (a public-domain
// text, distributed by Sefaria with no use restrictions), obtained here as
// the JSONL data files published in the open-source Jastrow PWA
// (github.com/UniquePixels/jastrow, data/jastrow-part{1,2}.jsonl, which
// credit Sefaria as the source). This script reads those files, strips the
// display HTML from each definition to plain text, and keeps the headword,
// definition, and page number. No entry is added or dropped. It is presented
// in the app as a published reference work (see the About screen).
//
// Usage:
//   node scripts/import-jastrow.mjs part1.jsonl part2.jsonl
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const files = process.argv.slice(2)
if (files.length === 0) {
  console.error('usage: node scripts/import-jastrow.mjs <part1.jsonl> [part2.jsonl ...]')
  process.exit(1)
}

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&nbsp;': ' ', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…',
  '&rsquo;': '’', '&lsquo;': '‘', '&rdquo;': '”', '&ldquo;': '“'
}

function toText(html) {
  if (!html) return ''
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
    .replace(/\s+/g, ' ')
    .trim()
}

const entries = []
for (const f of files) {
  const lines = readFileSync(f, 'utf8').split('\n').filter(Boolean)
  for (const line of lines) {
    let o
    try {
      o = JSON.parse(line)
    } catch {
      continue
    }
    const def = (o.c?.s || []).map((seg) => toText(seg.d)).join(' ').trim()
    if (!o.hw || !def) continue
    const rec = { id: o.id, lemma: o.hw, def }
    if (o.p) rec.page = o.p
    entries.push(rec)
  }
}

const out = {
  work: "A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature (Marcus Jastrow, 1903; public domain)",
  conversion:
    'Digitized by Sefaria (public-domain text, no use restrictions); obtained as the JSONL data of the open-source Jastrow PWA (github.com/UniquePixels/jastrow); display HTML stripped to plain text by scripts/import-jastrow.mjs',
  count: entries.length,
  entries
}

const here = dirname(fileURLToPath(import.meta.url))
const dest = join(here, '..', 'public', 'dicts', 'jastrow.json')
writeFileSync(dest, JSON.stringify(out))
console.log(`wrote ${dest}: ${entries.length} entries`)
