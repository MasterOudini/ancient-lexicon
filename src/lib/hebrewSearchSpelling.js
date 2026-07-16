// Hidden search-only consonant keys for Hebrew-script dictionary rows.
//
// These keys improve recall when a source supplies no Latin transliteration.
// They are deliberately never displayed as scholarly transliterations and
// never establish a lexical, etymological, or root relationship. Ambiguous
// matches stay as a result list instead of opening a card automatically.

const HEBREW_MARK = /[\u0591-\u05c7]/u
const HEBREW_LETTER = /[\u05d0-\u05ea]/u
const FINAL_TO_MEDIAL = {
  '\u05da': '\u05db',
  '\u05dd': '\u05de',
  '\u05df': '\u05e0',
  '\u05e3': '\u05e4',
  '\u05e5': '\u05e6'
}

function hebrewChoices(raw) {
  const source = String(raw || '').normalize('NFD')
  const tokens = []
  const consonants = []

  for (let index = 0; index < source.length; index++) {
    const letter = FINAL_TO_MEDIAL[source[index]] || source[index]
    if (!HEBREW_LETTER.test(letter)) continue
    consonants.push(letter)

    let markIndex = index + 1
    let marks = ''
    while (markIndex < source.length && HEBREW_MARK.test(source[markIndex])) {
      marks += source[markIndex]
      markIndex++
    }

    const hasDagesh = marks.includes('\u05bc')
    const hasShinDot = marks.includes('\u05c1')
    const hasSinDot = marks.includes('\u05c2')
    let choices = []

    switch (letter) {
      case '\u05d0':
      case '\u05e2':
        break
      case '\u05d1': choices = hasDagesh ? ['B'] : ['B', 'V']; break
      case '\u05d2': choices = ['G']; break
      case '\u05d3': choices = ['D']; break
      case '\u05d4': choices = ['H']; break
      case '\u05d5': choices = ['W']; break
      case '\u05d6': choices = ['Z']; break
      case '\u05d7': choices = ['X']; break
      case '\u05d8': choices = ['T']; break
      case '\u05d9': choices = ['Y']; break
      case '\u05db': choices = hasDagesh ? ['K'] : ['K', 'X']; break
      case '\u05dc': choices = ['L']; break
      case '\u05de': choices = ['M']; break
      case '\u05e0': choices = ['N']; break
      case '\u05e1': choices = ['S']; break
      case '\u05e4': choices = hasDagesh ? ['P'] : ['P', 'F']; break
      case '\u05e6': choices = ['C']; break
      case '\u05e7': choices = ['Q']; break
      case '\u05e8': choices = ['R']; break
      case '\u05e9':
        choices = hasShinDot ? ['J'] : hasSinDot ? ['S'] : ['J', 'S']
        break
      case '\u05ea': choices = ['T']; break
      default: break
    }

    if (choices.length > 0) tokens.push(choices)
  }

  return { tokens, consonants }
}

function normalizedLatinSource(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[\u1d49\u0259]/gu, 'e')
    // Preserve meaningful scholarly distinctions before NFD removes marks.
    .replace(/[š]/gu, 'sh')
    .replace(/[śç]/gu, 's')
    .replace(/[ḥḫ]/gu, 'kh')
    .replace(/[ṣ]/gu, 'ts')
    .replace(/[ṭ]/gu, 't')
    .replace(/[ḳ]/gu, 'q')
    .replace(/[ḵ]/gu, 'kh')
    .replace(/[ḇ]/gu, 'v')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[\u02be\u02bf\u02bc'\u2019\u2018`]/gu, '')
    .replace(/[^a-z]/gu, '')
}

function latinChoices(raw, { tshAsTSh = false } = {}) {
  const source = normalizedLatinSource(raw)
  const tokens = []

  for (let index = 0; index < source.length;) {
    const trigraph = source.slice(index, index + 3)
    const digraph = source.slice(index, index + 2)
    let choices
    let consumed = 1

    if (trigraph === 'tsh' && tshAsTSh) {
      choices = ['T']
      consumed = 1
    } else if (digraph === 'sh') {
      choices = ['J']
      consumed = 2
    } else if (digraph === 'ts' || digraph === 'tz') {
      choices = ['C']
      consumed = 2
    } else if (digraph === 'ch' || digraph === 'kh') {
      choices = ['X']
      consumed = 2
    } else if (digraph === 'th') {
      choices = ['T']
      consumed = 2
    } else if (digraph === 'ph') {
      choices = ['F']
      consumed = 2
    } else {
      choices = {
        a: [], e: [], i: ['', 'Y'], o: ['', 'W'], u: ['', 'W'],
        b: ['B'], v: ['V', 'W'], w: ['W'],
        g: ['G'], d: ['D'], h: ['H', 'X'], z: ['Z'], t: ['T'],
        y: ['Y'], j: ['Y'], k: ['K', 'Q'], c: ['S', 'K'],
        l: ['L'], m: ['M'], n: ['N'], s: ['S'],
        p: ['P'], f: ['F'], q: ['Q'], r: ['R'], x: ['X', 'K']
      }[source[index]] || []
    }

    index += consumed
    if (choices.length > 0) tokens.push(choices)
  }

  return tokens
}

function expandChoices(choiceTokens, cap = 512) {
  let keys = ['']
  for (const choices of choiceTokens) {
    const next = []
    for (const prefix of keys) {
      for (const choice of choices) {
        next.push(prefix + choice)
        if (next.length >= cap) break
      }
      if (next.length >= cap) break
    }
    keys = next
    if (keys.length >= cap) break
  }
  return [...new Set(keys)]
}

function degeminate(key) {
  return key.replace(/(.)\1+/gu, '$1')
}

function withDegeminated(keys) {
  return [...new Set(keys.flatMap((key) => [key, degeminate(key)]).filter(Boolean))]
}

function weakLetterNameFallback(consonants) {
  if (consonants.length === 0 || consonants.some((letter) => !/[\u05d0\u05e2]/u.test(letter))) {
    return []
  }
  return [consonants.map((letter) => letter === '\u05d0' ? 'ALEF' : 'AYIN').join('')]
}

export function hebrewConsonantSearchKeys(raw) {
  const { tokens, consonants } = hebrewChoices(raw)
  const keys = withDegeminated(expandChoices(tokens))
  return keys.length > 0 ? keys : weakLetterNameFallback(consonants)
}

export function latinConsonantSearchKeys(raw) {
  const compact = normalizedLatinSource(raw)
  const letterNameKey = /^(?:aleph|alef|ayin|ain)+$/u.test(compact)
    ? compact
      .replace(/aleph|alef/gu, 'ALEF')
      .replace(/ayin|ain/gu, 'AYIN')
    : null
  const tokenizations = [latinChoices(raw)]
  if (compact.includes('tsh')) tokenizations.push(latinChoices(raw, { tshAsTSh: true }))
  return [...new Set([
    ...(letterNameKey ? [letterNameKey] : []),
    ...tokenizations.flatMap((tokens) => withDegeminated(expandChoices(tokens)))
  ])]
}

export function isLatinConsonantSearchQuery(raw) {
  const text = String(raw || '')
  const consonantUnits = latinChoices(text).filter((choices) => !choices.includes('')).length
  return !/[\u0590-\u05ff]/u.test(text) && consonantUnits >= 2
}

export function hasConsonantSearchMatch(hebrewKeys, latinKeys) {
  if (!hebrewKeys?.length || !latinKeys?.length) return false
  const lookup = new Set(latinKeys)
  return hebrewKeys.some((key) => lookup.has(key))
}
