// Search normalization and scoring.
//
// One normalizer is applied to both the query and the indexed fields:
//   - Hebrew pointing and cantillation (U+0591..U+05C7) is stripped and
//     final letters are folded, so pointed and unpointed spellings match.
//   - Latin text is lowercased, NFD-normalized, stripped of combining marks,
//     and stripped of the transliteration marks ʾ ʿ ' ' ` so a user can type
//     "shalom" or "salamu" without diacritics.
//   - Superscript/subscript 1–3 used to distinguish South Arabian sibilants
//     fold to plain digits for phone keyboards (s² and s2 search alike).

import { foldFinals, toImperialAramaic, toMusnad } from './scripts.js'

const HEBREW_POINTING = /[֑-ׇ]/g
const COMBINING_MARKS = /\p{M}/gu
// U+02BE ʾ, U+02BF ʿ, U+02BC ʼ (used by Strong's), U+0027 ',
// U+2019 right quote, U+2018 left quote, U+0060 grave accent.
const TRANSLIT_MARKS = /[ʾʿʼ'’‘`]/g
// Egyptological aleph/ayin are spacing letters rather than combining marks,
// so NFD does not simplify them. Folding both to a lets a plain keyboard
// query find a headword that uses either scholarly sign.
const EGYPTOLOGICAL_MARKS = /[ꜣꜥ]/g
const SCRIPT_INDEX_DIGITS = /[¹²³₁₂₃]/g
const SCRIPT_INDEX_DIGIT_VALUE = {
  '¹': '1', '²': '2', '³': '3',
  '₁': '1', '₂': '2', '₃': '3'
}

export function normalize(str) {
  if (!str) return ''
  return foldFinals(
    str
      .toLowerCase()
      .replace(HEBREW_POINTING, '')
      .normalize('NFD')
      .replace(COMBINING_MARKS, '')
      .replace(TRANSLIT_MARKS, '')
      .replace(EGYPTOLOGICAL_MARKS, 'a')
      .replace(SCRIPT_INDEX_DIGITS, (digit) => SCRIPT_INDEX_DIGIT_VALUE[digit])
  ).trim()
}

// Collect every searchable string for an entry: English glosses, the Hebrew
// word and transliteration, root letters, all per-language transliterations,
// square-script letters, and raw original-script glyphs (pasting a glyph
// finds its entry).
function searchFields(entry) {
  const fields = [
    ...(entry.english || []),
    entry.hebrew?.word,
    entry.hebrew?.translit,
    entry.hebrew?.root
  ]
  for (const form of Object.values(entry.forms || {})) {
    fields.push(form.translit, form.script, form.hebrewLetters)
    // Aramaic and Musnad glyphs are derived at render time, so index the
    // derived strings too — pasting a glyph the app displays must find
    // its entry.
    if (form.hebrewLetters) fields.push(toImperialAramaic(form.hebrewLetters))
    if (form.tokens) fields.push(toMusnad(form.tokens))
  }
  return fields.filter(Boolean)
}

// Score: exact match 3, prefix match 2, substring match 1, no match 0.
// The entry's score is the best score across its fields.
export function scoreEntry(entry, normalizedQuery) {
  let best = 0
  for (const field of searchFields(entry)) {
    const norm = normalize(field)
    if (!norm) continue
    if (norm === normalizedQuery) return 3
    if (best < 2 && norm.startsWith(normalizedQuery)) best = 2
    else if (best < 1 && norm.includes(normalizedQuery)) best = 1
  }
  return best
}

// Search roots by letters, gloss, attested word, or cognate form (so a
// diacritic-free query like "salamu" finds the root whose cognate is šalāmu).
export function searchRoots(roots, query) {
  const q = normalize(query || '')
  if (!q) return [...roots]
  return roots.filter((root) => {
    const fields = [
      root.letters.join(''),
      root.gloss,
      ...(root.attested || []).flatMap((a) => [a.word, a.gloss]),
      ...(root.cognates || []).map((c) => c.form)
    ]
    return fields.some((f) => f && normalize(f).includes(q))
  })
}

// Search a list of entries. Empty query lists all entries alphabetically by
// first English gloss. Results are ordered by score, then alphabetically.
export function searchEntries(entries, query) {
  const alpha = (a, b) =>
    (a.english?.[0] || '').localeCompare(b.english?.[0] || '')
  const q = normalize(query || '')
  if (!q) return [...entries].sort(alpha)
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, q) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || alpha(a.entry, b.entry))
    .map((r) => r.entry)
}
