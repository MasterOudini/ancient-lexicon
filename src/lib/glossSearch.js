import { normalize } from './search.js'

// Shared by the build-time indexer and the browser resolver. These words do
// not carry enough lexical meaning to be useful bridge keys. Number words are
// deliberately retained because they are genuine dictionary concepts.
export const GLOSS_STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'at', 'by', 'for',
  'from', 'as', 'with', 'without', 'be', 'is', 'are', 'was', 'were', 'been',
  'being', 'his', 'her', 'hers', 'its', 'their', 'theirs', 'my', 'your',
  'yours', 'our', 'ours', 'this', 'that', 'these', 'those', 'he', 'she', 'it',
  'they', 'them', 'we', 'you', 'i', 'who', 'which', 'what', 'when', 'where',
  'how', 'not', 'no', 'nor', 'but', 'both', 'either', 'neither', 'if', 'then',
  'than', 'so', 'such', 'into', 'onto', 'out', 'up', 'down', 'over', 'under',
  'above', 'below', 'off', 'about', 'against', 'between', 'among', 'through',
  'during', 'before', 'after', 'per', 'via', 'also', 'used', 'use', 'usually',
  'very', 'etc', 'especially', 'chiefly', 'properly', 'literal', 'literally',
  'figurative', 'figuratively', 'specifically', 'concretely', 'causatively',
  'collectively', 'immediate', 'remote', 'application', 'implication', 'hence',
  'perhaps', 'possible', 'possibly', 'uncertain', 'formerly', 'interpreted',
  'compare', 'meaning', 'unknown',
  'plural', 'singular', 'masculine', 'feminine', 'noun', 'verb', 'substantive',
  'adj', 'adjective', 'adv', 'adverb', 'pronoun', 'preposition', 'conjunction',
  'inflected', 'inflectional', 'conjugation',
  'vb', 'qal', 'niph', 'hiph', 'hoph', 'piel', 'pual', 'hith', 'peal', 'pael',
  'aph', 'cstr', 'const', 'abs', 'gent', 'denom', 'loc', 'lit', 'specif',
  'late', 'rare', 'gen', 'med', 'sem', 'loan', 'cf', 'cmp', 'ibid', 'ib', 'fr',
  'sq', 'supr', 'infr', 'foreg', 'preced', 'ed', 'ms', 'corr', 'acc', 'top',
  'bot'
])

export const MEANING_LANGUAGE_ORDER = [
  'Hebrew',
  'Aramaic',
  'Egyptian',
  'Sumerian',
  'Akkadian',
  'Hittite',
  'Old South Arabian'
]

export function englishKeywords(text) {
  const words = normalize(text || '').match(/[a-z]+(?:-[a-z]+)*/g) || []
  const out = []
  const seen = new Set()
  for (const word of words.flatMap((w) => w.split('-'))) {
    const romanNumeral = /^(?:x{1,3}|x{0,3}(?:ix|iv|v?i{1,3}))$/.test(word)
    if (word.length < 2 || romanNumeral || GLOSS_STOP_WORDS.has(word) || seen.has(word)) continue
    seen.add(word)
    out.push(word)
  }
  return out
}

export function expandGlossRecord(index, recordIndex) {
  const rec = index.records[recordIndex]
  if (!rec) return null
  const primarySense = index.senses?.[rec[3]]
  const posting = {
    d: index.sources[rec[0]],
    i: rec[1],
    l: rec[2],
    g: primarySense?.[1] || '',
    lang: index.languages[rec[4]]
  }
  if (rec[6]) posting.x = rec[6]
  if (rec[7]) posting.s = rec[7]
  if (rec[8]) posting.v = rec[8]
  if (rec[9]) posting.lc = rec[9]
  return posting
}

export function expandGlossSense(index, senseIndex) {
  const sense = index.senses?.[senseIndex]
  if (!sense) return null
  const posting = expandGlossRecord(index, sense[0])
  if (posting) posting.g = sense[1]
  return posting
}

function postingKey(posting) {
  return `${posting.d}\u0000${posting.i}`
}

// Resolve the compact build artifact. `keywords` is an inverted index whose
// values encode `senseIndex * 3 + senseRank` (2 exact guide sense, 1 leading
// guide word, 0 another gloss word); each sense points to its source record,
// and expanding that pair yields the
// public posting shape { d, i, l, g, lang, x?, s?, v?, lc? }. `heads` makes Hebrew or
// transliterated input a two-hop lookup: headword -> English sense keywords
// -> postings in every covered language. No full dictionary is loaded here.
export function searchGlossIndex(index, query, { recordId = null } = {}) {
  const normalizedQuery = normalize(query || '')
  const forcedRecordId = Number.isInteger(recordId) && index?.records?.[recordId]
    ? recordId
    : null
  const empty = {
    mode: 'english',
    curatedIds: [],
    direct: [],
    groups: Object.fromEntries(MEANING_LANGUAGE_ORDER.map((lang) => [lang, []])),
    matchedKeywords: [],
    truncated: 0,
    total: 0
  }
  if ((!normalizedQuery && forcedRecordId == null) || !index?.records?.length || !index?.keywords) {
    return empty
  }

  const vocabulary = Object.keys(index.keywords)
  const headRecordIds = forcedRecordId == null
    ? index.heads?.[normalizedQuery] || []
    : [forcedRecordId]
  const queryWords = forcedRecordId == null ? englishKeywords(query) : []
  // A few genuine Strong's glosses are lexical function words (for example
  // "where" and "we") that the general prose-noise filter normally removes.
  // The builder admits only a conservative exact-gloss allowlist, so honor
  // one of those keys when the whole user query matches it exactly.
  if (
    forcedRecordId == null &&
    /^[a-z]+$/.test(normalizedQuery) &&
    index.keywords[normalizedQuery] &&
    !queryWords.includes(normalizedQuery)
  ) {
    queryWords.push(normalizedQuery)
  }
  const exactEnglish = queryWords.filter((word) => index.keywords[word])
  const hasHebrew = /[\u0590-\u05ff]/.test(query)
  const exactCuratedEnglish = exactEnglish.some((word) =>
    index.keywords[word].some((encoded) => {
      const sense = index.senses[Math.floor(encoded / 3)]
      const rec = index.records[sense?.[0]]
      return index.sources[rec?.[0]] === 'curated'
    })
  )
  const pivot = forcedRecordId != null || hasHebrew ||
    (headRecordIds.length > 0 && !exactCuratedEnglish)

  let termMatches
  if (pivot) {
    // A direct curated headword is the gold-standard disambiguator. When one
    // exists, pivot through its meanings only; otherwise fall back to every
    // matching Hebrew/Aramaic dictionary homograph.
    const curatedHeadRecords = forcedRecordId == null
      ? headRecordIds.filter((headRecordId) => {
          const rec = index.records[headRecordId]
          return index.sources[rec?.[0]] === 'curated'
        })
      : []
    const pivotRecords = forcedRecordId != null
      ? headRecordIds
      : curatedHeadRecords.length > 0
        ? curatedHeadRecords
        : headRecordIds
    const termIds = new Set()
    for (const recordId of pivotRecords) {
      for (const termId of index.records[recordId]?.[5] || []) termIds.add(termId)
    }
    termMatches = [...termIds].map((termId) => ({ key: vocabulary[termId], exact: true }))
  } else if (exactEnglish.length > 0) {
    termMatches = exactEnglish.map((key) => ({ key, exact: true }))
  } else {
    termMatches = []
    for (const word of queryWords) {
      if (word.length < 3) continue
      for (const key of vocabulary) {
        if (key.includes(word)) termMatches.push({ key, exact: false })
      }
    }
  }

  const best = new Map()
  let truncated = 0
  for (const match of termMatches) {
    if (!match.key) continue
    const encodedPostings = index.keywords[match.key] || []
    for (const encoded of encodedPostings) {
      const senseId = Math.floor(encoded / 3)
      const recordId = index.senses[senseId]?.[0]
      const senseRank = encoded % 3
      const posting = expandGlossSense(index, senseId)
      if (!posting) continue
      const score = (match.exact ? 200 + senseRank * 50 : 100) - posting.g.length / 1000
      const id = postingKey(posting)
      const previous = best.get(id)
      if (!previous || score > previous.score) {
        best.set(id, { ...posting, recordId, score, matchedKeyword: match.key })
      }
    }
    const dropped = index.truncated?.[match.key]
    if (dropped) truncated += Object.values(dropped).reduce((sum, n) => sum + n, 0)
  }

  const directIds = new Set(headRecordIds)
  const directCuratedIds = headRecordIds
    .map((recordId) => expandGlossRecord(index, recordId))
    .filter((posting) => posting?.d === 'curated')
    .map((posting) => posting.i)
  const curatedIds = []
  const direct = []
  const groups = Object.fromEntries(MEANING_LANGUAGE_ORDER.map((lang) => [lang, []]))
  const sorted = [...best.values()].sort(
    (a, b) => b.score - a.score || a.g.length - b.g.length || a.l.localeCompare(b.l)
  )

  for (const result of sorted) {
    if (result.d === 'curated') {
      curatedIds.push(result.i)
    } else if (pivot && directIds.has(result.recordId)) {
      direct.push(result)
    } else if (groups[result.lang]) {
      groups[result.lang].push(result)
    }
  }

  if (pivot) {
    const present = new Set(direct.map((result) => result.recordId))
    for (const recordId of headRecordIds) {
      if (present.has(recordId)) continue
      const posting = expandGlossRecord(index, recordId)
      if (!posting || posting.d === 'curated') continue
      // Keep unrelated homographs visible as direct dictionary hits, but
      // below headword records whose gloss also matches the resolved sense.
      direct.push({ ...posting, recordId, score: 0, matchedKeyword: null })
    }
    direct.sort((a, b) => b.score - a.score || a.g.length - b.g.length || a.l.localeCompare(b.l))
  }

  const uniqueCurated = [...new Set(pivot ? [...directCuratedIds, ...curatedIds] : curatedIds)]
  const total = uniqueCurated.length + direct.length +
    Object.values(groups).reduce((sum, entries) => sum + entries.length, 0)

  return {
    mode: pivot ? 'pivot' : 'english',
    curatedIds: uniqueCurated,
    direct,
    groups,
    matchedKeywords: [...new Set(termMatches.map((m) => m.key).filter(Boolean))],
    truncated,
    total
  }
}
