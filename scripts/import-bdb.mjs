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
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, resolve } from 'node:path'

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }
const decode = (s) =>
  s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;/gi, (m) => ENTITIES[m] ?? m)
const strip = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()

function attrs(tag) {
  const out = {}
  for (const match of tag.matchAll(/\b([\w:-]+)="([^"]*)"/g)) out[match[1]] = decode(match[2])
  return out
}

function tidySenseText(parts) {
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,;:.!?])/g, '$1')
    .replace(/([([{])\s+/g, '$1')
    .replace(/\s+([)\]}])/g, '$1')
    .replace(/^[,;:.\-\u2014]+\s*/, '')
    .trim()
}

// BdbSchema.xsd declares <sense> as the only recursive element and declares
// <stem> and <def> as simple strings. This small token/stack parser follows
// exactly that shape; it intentionally is not a general-purpose XML parser.
// The returned flat leaves retain their complete stable hierarchy in `path`.
export function parseStructuredSenses(body) {
  const roots = []
  const senseStack = []
  const captureStack = []
  const skipped = []
  const tokens = body.match(/<[^>]+>|[^<]+/g) || []

  for (const token of tokens) {
    if (!token.startsWith('<')) {
      if (captureStack.length > 0) {
        captureStack[captureStack.length - 1].parts.push(token)
      } else if (skipped.length === 0 && senseStack.length > 0) {
        const text = strip(token)
        if (text) senseStack[senseStack.length - 1].parts.push(text)
      }
      continue
    }

    const closing = /^<\//.test(token)
    const tagName = token.match(/^<\/?\s*([\w:-]+)/)?.[1]
    if (!tagName) continue

    if (closing) {
      if (captureStack[captureStack.length - 1]?.tag === tagName) {
        const capture = captureStack.pop()
        const value = strip(capture.parts.join(' '))
        const node = senseStack[senseStack.length - 1]
        if (node && value) {
          if (tagName === 'stem') node.stem = value
          else {
            node.defs.push(value)
            node.parts.push(value)
          }
        }
      } else if (skipped[skipped.length - 1] === tagName) {
        skipped.pop()
      } else if (tagName === 'sense') {
        senseStack.pop()
      }
      continue
    }

    if (tagName === 'sense') {
      const parent = senseStack[senseStack.length - 1]
      const siblings = parent ? parent.children : roots
      const node = {
        n: attrs(token).n || '',
        ordinal: siblings.length + 1,
        stem: '',
        defs: [],
        parts: [],
        children: []
      }
      siblings.push(node)
      senseStack.push(node)
    } else if ((tagName === 'stem' || tagName === 'def') && senseStack.length > 0) {
      captureStack.push({ tag: tagName, parts: [] })
    } else if (['w', 'pos', 'asp', 'ref', 'foreign', 'page', 'status'].includes(tagName)) {
      if (!/\/>$/.test(token)) skipped.push(tagName)
    }
  }

  const flattened = []
  function visit(node, siblings, inheritedPath = [], inheritedContext = []) {
    const baseComponent = node.stem || node.n || `sense-${node.ordinal}`
    const duplicate = siblings.filter((sibling) =>
      (sibling.stem || sibling.n || `sense-${sibling.ordinal}`) === baseComponent
    ).length > 1
    const component = duplicate ? `${baseComponent}[${node.ordinal}]` : baseComponent
    const path = [...inheritedPath, component]
    const ownText = tidySenseText(node.parts)
    const ownContext = node.defs.length === 0 && ownText && !/^[,;:.()\-\u2014]+$/.test(ownText)
      ? [...inheritedContext, ownText]
      : inheritedContext
    if (node.children.length === 0) {
      const text = tidySenseText([...inheritedContext, ownText].filter(Boolean))
      if (text) {
        flattened.push({
          key: path.join('/'),
          path,
          label: path.join(' › '),
          def: text,
          defs: node.defs
        })
      }
      return
    }
    for (const child of node.children) visit(child, node.children, path, ownContext)
  }
  for (const root of roots) visit(root, roots)
  return flattened
}
const here = dirname(fileURLToPath(import.meta.url))

export function importBdb(src, dest = join(here, '..', 'public', 'dicts', 'bdb.json')) {
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
    const posMatch = body.match(/<pos>([\s\S]*?)<\/pos>/)
    const def = strip(body.replace(/<status[\s\S]*?<\/status>/g, ''))
    const rec = { id, lemma, def }
    if (posMatch) rec.pos = strip(posMatch[1])
    const senses = parseStructuredSenses(body)
    if (senses.length > 0) rec.senses = senses
    entries.push(rec)
  }

  const out = {
    work: "A Hebrew and English Lexicon of the Old Testament (Brown, Driver & Briggs, 1906; public domain; includes Biblical Aramaic)",
    conversion:
      'Machine-readable XML from the OpenScriptures HebrewLexicon project (github.com/openscriptures/HebrewLexicon); markup rendered to plain text by scripts/import-bdb.mjs',
    sourceRevision: 'b69f909233040133c03654945d7ed1a510d5ea37',
    count: entries.length,
    entries
  }

  if (existsSync(dest)) {
    const previous = JSON.parse(readFileSync(dest, 'utf8'))
    if (previous.entries.length !== entries.length) {
      throw new Error(`BDB count changed: ${previous.entries.length} -> ${entries.length}`)
    }
    for (let i = 0; i < entries.length; i++) {
      for (const field of ['id', 'lemma', 'def', 'pos']) {
        if ((previous.entries[i][field] || '') !== (entries[i][field] || '')) {
          throw new Error(`BDB ${field} changed at row ${i} (${previous.entries[i].id})`)
        }
      }
    }
  }
  writeFileSync(dest, JSON.stringify(out))
  return out
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const src = process.argv[2]
  if (!src) {
    console.error('usage: node scripts/import-bdb.mjs <BrownDriverBriggs.xml>')
    process.exit(1)
  }
  const out = importBdb(src)
  console.log(`wrote ${join(here, '..', 'public', 'dicts', 'bdb.json')}: ${out.entries.length} entries`)
}
