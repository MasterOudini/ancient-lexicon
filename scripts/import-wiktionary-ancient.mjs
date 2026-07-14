// Imports the English Wiktionary Hittite and Old South Arabian-language lemma
// categories into compact, offline reference dictionaries.
//
// Provenance
// ----------
// Source: English Wiktionary (en.wiktionary.org), whose upstream text is
// dual-licensed under CC BY-SA 4.0 and the GNU Free Documentation License.
// This transformed snapshot is redistributed under CC BY-SA 4.0. The importer
// records the source page, revision id and revision timestamp on every entry
// so the exact community-authored revision remains attributable. Dictionary
// metadata distinguishes when the API payload was fetched from the newest
// revision timestamp retained in that payload.
//
// This is intentionally a build-time import. The application never contacts
// Wiktionary at runtime. The resulting files are community dictionary subsets,
// not replacements for comprehensive scholarly Hittite or Sabaic lexica.
//
// Usage:
//   node scripts/import-wiktionary-ancient.mjs

// The script uses categorymembers pagination, then fetches current revision
// wikitext in batches of 50 pages through the MediaWiki API. Only the requested
// language sections, lexical head templates and top-level English senses are
// retained.
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { OSA_TOKENS } from '../src/lib/scripts.js'

const API = 'https://en.wiktionary.org/w/api.php'
const USER_AGENT =
  'AncientLexiconWiktionaryImporter/1.0 (https://github.com/MasterOudini/ancient-lexicon)'
const here = dirname(fileURLToPath(import.meta.url))
const outputDir = join(here, '..', 'public', 'dicts')
const osaTokenDisplay = {
  "'": 'ʾ',
  ayn: 'ʿ',
  dd: 'ḍ',
  dh: 'ḏ',
  gh: 'ġ',
  hh: 'ḥ',
  kh: 'ḫ',
  s1: 's¹',
  s2: 's²',
  s3: 's³',
  ss: 'ṣ',
  th: 'ṯ',
  tt: 'ṭ',
  zz: 'ẓ'
}
const musnadToTransliteration = new Map(
  Object.entries(OSA_TOKENS).map(([token, glyph]) => [glyph, osaTokenDisplay[token] || token])
)

const dictionaries = [
  {
    id: 'hittite',
    categories: ['Hittite lemmas'],
    sections: [{ name: 'Hittite', code: 'hit' }],
    languageCodes: ['hit'],
    output: 'hittite-wiktionary.json',
    work: 'English Wiktionary — Hittite lemma pages',
    conversion:
      'Current main-namespace members of Category:Hittite lemmas fetched through the MediaWiki API; Hittite lexical headings, head-template tr= transliterations and top-level English senses extracted by scripts/import-wiktionary-ancient.mjs. Slash- or bracket-delimited IPA found inside tr= is separated into pron before wikitext cleanup. Every entry retains its exact source revision. Community-edited coverage; not a comprehensive scholarly Hittite dictionary.'
  },
  {
    id: 'osa',
    categories: [
      'Old South Arabian lemmas',
      'Sabaean lemmas',
      'Minaean lemmas',
      'Qatabanian lemmas'
    ],
    sections: [
      { name: 'Sabaean', code: 'xsa' },
      { name: 'Minaean', code: 'inm' },
      { name: 'Qatabanian', code: 'xqt' },
      { name: 'Old South Arabian', code: 'sem-srb', legacy: true }
    ],
    languageCodes: ['xsa', 'inm', 'xqt', 'sem-srb'],
    output: 'osa-wiktionary.json',
    work: 'English Wiktionary — Old South Arabian-language lemma pages',
    conversion:
      'Current main-namespace members of Category:Old South Arabian lemmas, Category:Sabaean lemmas, Category:Minaean lemmas and Category:Qatabanian lemmas fetched through the MediaWiki API. Every specific-language section is retained; a duplicate legacy Old South Arabian entry is omitted when the same page, script and part of speech has a specific-language entry. Lexical headings, primary head=/tr= pairs and top-level English senses extracted by scripts/import-wiktionary-ancient.mjs; Musnad is deterministically transliterated when a legacy head template omits tr=. The Wiktionary-internal legacy code sem-srb is retained as sourceLanguageCode rather than exposed as a BCP-47 lang. Every entry retains its exact source revision. Community-edited coverage; not a comprehensive Old South Arabian dictionary.'
  }
]

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function api(params) {
  const body = new URLSearchParams({
    format: 'json',
    formatversion: '2',
    errorformat: 'plaintext',
    maxlag: '5',
    ...params
  })

  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Api-User-Agent': USER_AGENT,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body,
        signal: AbortSignal.timeout(30_000)
      })

      if (response.status === 429 || response.status >= 500) {
        const error = new Error(`HTTP ${response.status}`)
        const retryAfter = Number(response.headers.get('retry-after'))
        if (Number.isFinite(retryAfter)) error.retryAfter = retryAfter * 1_000
        throw error
      }
      if (!response.ok) {
        throw new Error(`MediaWiki API request failed: HTTP ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(`${data.error.code}: ${data.error.info}`)
      }
      return data
    } catch (error) {
      if (attempt === 3) throw error
      await wait(Math.max(error.retryAfter || 0, 2_000 * 2 ** attempt))
    }
  }
}

async function categoryMembers(category) {
  const members = []
  let continuation

  do {
    const data = await api({
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${category}`,
      cmnamespace: '0',
      cmtype: 'page',
      cmlimit: 'max',
      ...(continuation ? { cmcontinue: continuation } : {})
    })
    members.push(...(data.query?.categorymembers || []))
    continuation = data.continue?.cmcontinue
  } while (continuation)

  return members
}

async function currentRevisions(pageIds) {
  const pages = []
  for (let offset = 0; offset < pageIds.length; offset += 50) {
    const batch = pageIds.slice(offset, offset + 50)
    const data = await api({
      action: 'query',
      prop: 'revisions',
      pageids: batch.join('|'),
      rvprop: 'ids|timestamp|content',
      rvslots: 'main',
      redirects: '1'
    })
    pages.push(...(data.query?.pages || []))
    console.error(`  fetched revisions ${offset + 1}–${Math.min(offset + 50, pageIds.length)}`)
    if (offset + 50 < pageIds.length) await wait(500)
  }
  return pages
}

function languageSection(wikitext, name) {
  const headings = []
  const re = /^==\s*([^=\n]+?)\s*==\s*$/gm
  let match
  while ((match = re.exec(wikitext))) {
    headings.push({ name: match[1].trim(), start: re.lastIndex, headingStart: match.index })
  }

  const index = headings.findIndex((heading) => heading.name === name)
  if (index === -1) return null
  const end = headings[index + 1]?.headingStart ?? wikitext.length
  return wikitext.slice(headings[index].start, end)
}

function headingBlocks(section) {
  const headings = []
  const re = /^(={3,6})\s*([^=\n]+?)\s*\1\s*$/gm
  let match
  while ((match = re.exec(section))) {
    headings.push({
      level: match[1].length,
      title: match[2].trim(),
      bodyStart: re.lastIndex,
      headingStart: match.index
    })
  }

  return headings.map((heading, index) => {
    // Only inspect this heading's direct body. Otherwise an Etymology heading
    // would also consume the lexical head nested below it and create a duplicate.
    const next = headings[index + 1]
    return {
      title: heading.title,
      body: section.slice(heading.bodyStart, next?.headingStart ?? section.length)
    }
  })
}

function topLevelTemplates(text) {
  const templates = []
  let start = -1
  let depth = 0

  for (let index = 0; index < text.length - 1; index += 1) {
    const pair = text.slice(index, index + 2)
    if (pair === '{{') {
      if (depth === 0) start = index
      depth += 1
      index += 1
    } else if (pair === '}}' && depth > 0) {
      depth -= 1
      index += 1
      if (depth === 0 && start >= 0) {
        templates.push(text.slice(start, index + 1))
        start = -1
      }
    }
  }

  return templates
}

function templateName(template) {
  return template.slice(2, -2).split('|', 1)[0].trim().toLowerCase().replace(/_/g, ' ')
}

function isHeadTemplate(template, config) {
  const name = templateName(template)
  if (name === 'head') {
    const code = template.slice(2, -2).split('|')[1]?.trim()
    return config.languageCodes.includes(code)
  }
  return config.languageCodes.some((code) => name.startsWith(`${code}-`))
}

function headTemplate(block, config) {
  return topLevelTemplates(block).find((template) => isHeadTemplate(template, config)) || null
}

function namedTemplateArgument(template, name) {
  const match = template.match(new RegExp(`(?:^|\\|)\\s*${name}\\s*=\\s*([^|}\\n]+)`, 'i'))
  return match?.[1]?.trim() || ''
}

function decodeEntities(text) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    hellip: '…',
    ldquo: '“',
    lsquo: '‘',
    lt: '<',
    mdash: '—',
    nbsp: ' ',
    ndash: '–',
    quot: '"',
    rdquo: '”',
    rsquo: '’'
  }
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&([a-z]+);/gi, (whole, name) => named[name.toLowerCase()] ?? whole)
}

function renderTemplate(inner) {
  const parts = inner.split('|').map((part) => part.trim())
  const name = (parts.shift() || '').toLowerCase().replace(/_/g, ' ')
  const positional = []
  const named = {}

  for (const part of parts) {
    const equals = part.indexOf('=')
    if (equals > 0 && /^[\w -]+$/.test(part.slice(0, equals).trim())) {
      named[part.slice(0, equals).trim().toLowerCase()] = part.slice(equals + 1).trim()
    } else {
      positional.push(part)
    }
  }

  if (['lb', 'label', 'context'].includes(name)) {
    const labels = positional.slice(1).filter(Boolean)
    return labels.length ? `(${labels.join(', ')})` : ''
  }
  if (['q', 'qual', 'qualifier'].includes(name)) {
    return positional[0] ? `(${positional[0]})` : ''
  }
  if (['gloss', 'sense', 'non-gloss', 'non-gloss definition', 'n-g', 'ngd'].includes(name)) {
    return positional[0] || ''
  }
  if (['l', 'link', 'm', 'mention', 'term', 'cog', 'inh', 'bor', 'der'].includes(name)) {
    return named.alt || positional[1] || named.t || ''
  }
  if (['w', 'wikipedia', 'pedia'].includes(name)) {
    return positional[1] || positional[0] || ''
  }
  if (name === 'given name') {
    const gender = positional[1] ? `${positional[1]} ` : ''
    return `${gender}given name${named.xlit ? `, ${named.xlit}` : ''}`
  }
  const formName = name.replace(/^(?:hit|xsa|inm|xqt|sem-srb)-/, '')
  if (/\b(?:form|spelling|plural|singular|participle|inflection|alternative|alt) of$/.test(formName)) {
    const term = positional[1] || positional[0] || named.alt || ''
    return term ? `${formName} ${term}` : formName
  }
  if (['senseid', 'sid', 'anchor', 'rfdef', 'defn', 'attention', 'verify'].includes(name)) {
    return ''
  }

  return named.t || named.gloss || named.alt || named.text || ''
}

function cleanWikitext(value) {
  let text = value
    .replace(/<!--[\s\S]*?-->/g, ' ')
    // A named template argument is deliberately read only up to its next `|`.
    // If that separator occurs inside a comment/template/link, the fragment we
    // receive is unclosed; discard it instead of leaking markup into a headword.
    .replace(/<!--[\s\S]*$/g, ' ')
    .replace(/<ref\b[^>]*>[\s\S]*?<\/ref>/gi, ' ')
    .replace(/<ref\b[^>]*\/?\s*>/gi, ' ')

  // Resolve innermost templates first. Unknown structural templates disappear
  // instead of leaking markup or an invented interpretation into a gloss.
  for (let pass = 0; pass < 30 && /\{\{[^{}]*\}\}/.test(text); pass += 1) {
    text = text.replace(/\{\{([^{}]*)\}\}/g, (_, inner) => renderTemplate(inner))
  }

  text = text
    .replace(/\[\[([^\[\]]+)\]\]/g, (_, target) => {
      const parts = target.split('|')
      return (parts.at(-1) || '').replace(/^:/, '').split('#')[0]
    })
    .replace(/\[(?:https?:)?\/\/[^\s\]]+\s+([^\]]+)\]/g, '$1')
    .replace(/\[(?:https?:)?\/\/[^\]]+\]/g, ' ')
    .replace(/'{2,5}/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{\{[\s\S]*?\}\}/g, ' ')
    .replace(/\{\{[\s\S]*$/g, ' ')
    .replace(/\[\[[\s\S]*$/g, ' ')
    .replace(/[\[\]{}]/g, '')

  return decodeEntities(text)
    .replace(/[\u200e\u200f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .trim()
}

function headTransliteration(head, config) {
  const raw = namedTemplateArgument(head, 'tr')
  if (!raw || config.id !== 'hittite') {
    return { lemma: cleanWikitext(raw), pron: '' }
  }

  // Some Hittite head templates append IPA directly to tr=, using either
  // /phonemic/ or [phonetic] delimiters. Extract it from the raw argument:
  // cleanWikitext intentionally removes square brackets, which would otherwise
  // concatenate bracketed IPA onto the transliterated headword.
  const pronunciations = []
  const withoutPronunciation = raw.replace(
    /(?<!\[)(?:\/([^/\n]+)\/|\[([^\[\]\n]+)\])(?!\])/gu,
    (_, phonemic, phonetic) => {
      const value = cleanWikitext(phonemic || phonetic)
      if (value) pronunciations.push(phonemic ? `/${value}/` : `[${value}]`)
      return ' '
    }
  )
  return {
    lemma: cleanWikitext(withoutPronunciation).replace(/[\s,]+$/, ''),
    pron: pronunciations.join(' or ')
  }
}

function definitions(block) {
  const senses = []
  let uncertain = false
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^(#{1,3})(?![#*:])\s*(.+)$/)
    if (!match) continue
    const level = match[1].length
    const raw = match[2]
    if (level === 1) uncertain = /\{\{\s*def-uncertain(?:\||\}\})/i.test(raw)
    const cleaned = cleanWikitext(raw).replace(/[.;]$/, '').trim()
    const sense = uncertain && level > 1 && cleaned ? `possibly ${cleaned}` : cleaned
    if (sense && !senses.includes(sense)) senses.push(sense)
  }
  return senses.join('; ')
}

function sourceUrl(title, revision) {
  return `https://en.wiktionary.org/w/index.php?title=${encodeURIComponent(title)}&oldid=${revision}`
}

function transliterateMusnad(script) {
  return Array.from(script)
    .map((glyph) => musnadToTransliteration.get(glyph) || glyph)
    .join('')
}

function normalizedOsaTransliteration(value) {
  return value
    .toLowerCase()
    .normalize('NFC')
    .replace(/[ʾʼ’']/g, '0')
    .replace(/[ʿʻ‘]/g, '9')
    .replace(/s[¹₁]/g, 's1')
    .replace(/s[²₂]/g, 's2')
    .replace(/s[³₃]/g, 's3')
    .replace(/š/g, 's2')
    .replace(/ḥ/g, 'h2')
    .replace(/[ḫḵ]/g, 'h3')
    .replace(/ṯ/g, 't3')
    .replace(/ḏ/g, 'd3')
    .replace(/ṣ/g, 's4')
    .replace(/ḍ/g, 'd2')
    .replace(/ṭ/g, 't2')
    .replace(/ẓ/g, 'z2')
    .replace(/ġ/g, 'g2')
    .replace(/j/g, 'g')
    .replace(/s(?![1-4])/g, 's1')
    .replace(/[aeiouāēīōūâêîôû]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function isMusnadWord(value) {
  const letters = Array.from(value).filter((glyph) => /\p{L}/u.test(glyph))
  return letters.length > 0 && letters.every((glyph) => musnadToTransliteration.has(glyph))
}

function idPart(value) {
  return value
    .toLowerCase()
    .replace(/\s+\d+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'entry'
}

function entriesFromSection(page, revision, section, text, config, warnings) {
  const lexical = []
  for (const block of headingBlocks(text)) {
    const head = headTemplate(block.body, { languageCodes: [section.code] })
    if (!head) continue
    const def = definitions(block.body)
    if (!def) continue
    lexical.push({ block, head, def })
  }

  if (!lexical.length) {
    warnings.push(`${page.title} [${section.name}]: no lexical head with an English top-level sense`)
    return []
  }

  const headPairs = lexical.map(({ head }) => ({
    script: cleanWikitext(namedTemplateArgument(head, 'head')) || page.title,
    transliteration: headTransliteration(head, config)
  }))
  const occurrences = new Map()

  return lexical.flatMap(({ block, head, def }) => {
    const pos = block.title.replace(/\s+\d+$/, '').trim()
    const posId = idPart(pos)
    const occurrence = (occurrences.get(posId) || 0) + 1
    occurrences.set(posId, occurrence)
    const script = cleanWikitext(namedTemplateArgument(head, 'head')) || page.title
    const currentTransliteration = headTransliteration(head, config)
    const sameScriptTransliteration = headPairs.find(
      (pair) => pair.script === script && pair.transliteration.lemma
    )?.transliteration
    const transliteration =
      currentTransliteration.lemma ||
      sameScriptTransliteration?.lemma ||
      (config.id === 'osa' ? transliterateMusnad(script) : '')
    const pron = currentTransliteration.pron || sameScriptTransliteration?.pron || ''
    if (!transliteration) {
      warnings.push(`${page.title} [${section.name}, ${pos}]: skipped because head has no tr=`)
      return []
    }

    if (config.id === 'osa' && isMusnadWord(script)) {
      const expected = normalizedOsaTransliteration(transliterateMusnad(script))
      const actual = normalizedOsaTransliteration(transliteration)
      if (expected !== actual) {
        warnings.push(
          `${page.title} [${section.name}, ${pos}]: tr=${transliteration} differs from script-derived ${transliterateMusnad(script)}`
        )
      }
    }

    const entry = {
      id: `wiktionary-${config.id}-${section.code}-${page.pageid}-${posId}-${occurrence}`,
      lemma: transliteration,
      script,
      def,
      pos,
      source: sourceUrl(page.title, revision.revid),
      revision: revision.revid,
      timestamp: revision.timestamp
    }
    if (section.code === 'sem-srb') entry.sourceLanguageCode = section.code
    else entry.lang = section.code
    if (pron) entry.pron = pron
    if (config.id === 'osa') entry.variety = section.name
    return [entry]
  })
}

function legacyOverlapKey(entry) {
  const script = entry.script.replace(/[^\p{L}\p{N}]/gu, '')
  return `${script}|${entry.pos.toLowerCase()}`
}

function entriesFromPage(page, config, warnings) {
  const revision = page.revisions?.[0]
  const wikitext = revision?.slots?.main?.content
  if (!revision || !wikitext) {
    warnings.push(`${page.title}: no current wikitext revision`)
    return []
  }

  const found = config.sections.flatMap((section) => {
    const text = languageSection(wikitext, section.name)
    return text ? [{ section, text }] : []
  })
  if (!found.length) {
    warnings.push(`${page.title}: no ${config.sections.map(({ name }) => name).join(' or ')} section`)
    return []
  }

  const extracted = found.map(({ section, text }) => ({
    section,
    entries: entriesFromSection(page, revision, section, text, config, warnings)
  }))
  const specific = extracted.filter(({ section }) => !section.legacy).flatMap(({ entries }) => entries)
  const legacy = extracted.filter(({ section }) => section.legacy).flatMap(({ entries }) => entries)
  if (!specific.length) return legacy

  const specificKeys = new Set(specific.map(legacyOverlapKey))
  return [...specific, ...legacy.filter((entry) => !specificKeys.has(legacyOverlapKey(entry)))]
}

function validateOutput(config, output) {
  if (output.categoryPageCount <= 100 || output.count <= 100) {
    throw new Error(
      `${config.id}: implausibly small import (${output.categoryPageCount} pages, ${output.count} entries)`
    )
  }
  if (output.count !== output.entries.length) {
    throw new Error(`${config.id}: count does not match entries.length`)
  }
  if (new Set(output.entries.map(({ id }) => id)).size !== output.entries.length) {
    throw new Error(`${config.id}: duplicate entry id`)
  }

  const scriptPattern =
    config.id === 'hittite'
      ? /^(?:[\u{12000}-\u{123FF}\u{12400}-\u{1247F}]|[\x20-\x2F\x3A-\x40\x5B-\x60\x7B-\x7E])+$/u
      : /^[\u{10A60}-\u{10A7F}\p{P}\p{Zs}]+$/u
  const nativeCharacter =
    config.id === 'hittite'
      ? /[\u{12000}-\u{123FF}\u{12400}-\u{1247F}]/u
      : /[\u{10A60}-\u{10A7F}]/u
  const osaLanguages = new Map([
    ['Sabaean', 'xsa'],
    ['Minaean', 'inm'],
    ['Qatabanian', 'xqt']
  ])

  for (const entry of output.entries) {
    if (![entry.id, entry.lemma, entry.script, entry.def].every((value) => value?.trim())) {
      throw new Error(`${config.id}: ${entry.id || '(missing id)'} has an empty required field`)
    }
    if (/[<>{}\[\]]/u.test(entry.lemma) || /[<>{}\[\]]/u.test(entry.script)) {
      throw new Error(`${config.id}: ${entry.id} leaks markup debris in its lemma or script`)
    }
    if (!scriptPattern.test(entry.script) || !nativeCharacter.test(entry.script)) {
      throw new Error(`${config.id}: ${entry.id} has unexpected script characters: ${entry.script}`)
    }
    if (nativeCharacter.test(entry.lemma)) {
      throw new Error(`${config.id}: ${entry.id} has native script instead of a transliterated lemma`)
    }
    if (
      config.id === 'hittite' &&
      /[\/\[\]\u0250-\u02af\u02d0\u02d1\u0329\u0361\u0370-\u03ff]/u.test(entry.lemma)
    ) {
      throw new Error(`${config.id}: ${entry.id} leaks IPA into its lemma`)
    }
    if (
      config.id === 'hittite' &&
      entry.pron &&
      !/^(?:\/[^/\n]+\/|\[[^\[\]\n]+\])(?: or (?:\/[^/\n]+\/|\[[^\[\]\n]+\]))*$/u.test(entry.pron)
    ) {
      throw new Error(`${config.id}: ${entry.id} has malformed separated pronunciation data`)
    }
    if (/\b(?:hit|xsa|inm|xqt|sem-srb)-[^;]*\bform of\b/i.test(entry.def)) {
      throw new Error(`${config.id}: ${entry.id} leaks an internal form-template name`)
    }
    if (!Number.isInteger(entry.revision) || entry.revision <= 0) {
      throw new Error(`${config.id}: ${entry.id} has an invalid revision`)
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(entry.timestamp)) {
      throw new Error(`${config.id}: ${entry.id} has an invalid revision timestamp`)
    }
    const sourceRevision = entry.source.match(
      /^https:\/\/en\.wiktionary\.org\/w\/index\.php\?title=.+&oldid=(\d+)$/
    )?.[1]
    if (Number(sourceRevision) !== entry.revision) {
      throw new Error(`${config.id}: ${entry.id} does not link its exact retained revision`)
    }
    if (config.id === 'hittite' && entry.lang !== 'hit') {
      throw new Error(`${config.id}: ${entry.id} has unexpected lang=${entry.lang}`)
    }
    if (
      config.id === 'osa' &&
      entry.variety === 'Old South Arabian' &&
      (entry.lang || entry.sourceLanguageCode !== 'sem-srb')
    ) {
      throw new Error(`${config.id}: ${entry.id} exposes sem-srb as a BCP-47 lang value`)
    }
    if (
      config.id === 'osa' &&
      entry.variety !== 'Old South Arabian' &&
      osaLanguages.get(entry.variety) !== entry.lang
    ) {
      throw new Error(
        `${config.id}: ${entry.id} has invalid variety/lang ${entry.variety}/${entry.lang}`
      )
    }
  }

  const latestRetainedRevisionTimestamp = output.entries.reduce(
    (value, entry) => (entry.timestamp > value ? entry.timestamp : value),
    ''
  )
  if (output.latestRetainedRevisionTimestamp !== latestRetainedRevisionTimestamp) {
    throw new Error(`${config.id}: latest retained revision timestamp is inaccurate`)
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(output.fetchedAt)) {
    throw new Error(`${config.id}: fetchedAt is not an exact UTC fetch timestamp`)
  }
  if (Date.parse(output.fetchedAt) < Date.parse(latestRetainedRevisionTimestamp)) {
    throw new Error(`${config.id}: fetchedAt predates a retained source revision`)
  }
}

async function importDictionary(config) {
  console.error(`Fetching ${config.work}…`)
  const memberLists = []
  for (const category of config.categories) memberLists.push(await categoryMembers(category))
  const members = new Map()
  for (const member of memberLists.flat()) members.set(member.pageid, member)
  console.error(`  ${members.size} unique main-namespace category pages`)

  const pages = await currentRevisions([...members.keys()])
  const fetchedAt = new Date().toISOString()
  pages.sort((a, b) => a.title.localeCompare(b.title, 'en'))
  const warnings = []
  const entries = pages.flatMap((page) => entriesFromPage(page, config, warnings))
  entries.sort((a, b) => a.lemma.localeCompare(b.lemma, 'en') || a.id.localeCompare(b.id))
  const latestRetainedRevisionTimestamp = entries.reduce(
    (latest, entry) => (entry.timestamp > latest ? entry.timestamp : latest),
    ''
  )

  const out = {
    work: config.work,
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
    source: 'https://en.wiktionary.org/',
    categories: config.categories.map((name) => ({
      name: `Category:${name}`,
      url: `https://en.wiktionary.org/wiki/Category:${encodeURIComponent(name).replace(/%20/g, '_')}`
    })),
    fetchedAt,
    latestRetainedRevisionTimestamp,
    categoryPageCount: members.size,
    retainedPageCount: new Set(entries.map((entry) => entry.source)).size,
    conversion: config.conversion,
    count: entries.length,
    entries
  }
  validateOutput(config, out)
  const destination = join(outputDir, config.output)
  writeFileSync(destination, JSON.stringify(out))
  console.log(`wrote ${destination}: ${entries.length} entries from ${pages.length} pages`)
  if (warnings.length) {
    console.error(`  ${warnings.length} skipped/fallback warning(s):`)
    for (const warning of warnings) console.error(`  - ${warning}`)
  }
}

for (const dictionary of dictionaries) await importDictionary(dictionary)
