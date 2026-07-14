// Deterministic reading guides. These are deliberately separate from source
// transliterations: a display string is never rewritten to make it easier to read.

export const GUIDE_LANGUAGE_DEFAULT = 'he'
export const GUIDE_LANGUAGE_OPTIONS = Object.freeze(['he', 'en'])

export const PRONUNCIATION_PROVENANCE = Object.freeze({
  hebrew: 'Masoretic vocalization and standard Biblical Hebrew transliteration conventions.',
  akkadian: 'Standard Assyriological normalized-transliteration conventions.',
  sumerian: 'Standard Sumerological transliteration and later scribal reading conventions.',
  egyptian: 'Egyptological transcription conventions; vowels are largely conventional.',
  hittite: 'Standard Hittitological transliteration conventions for cuneiform sources.',
  aramaic: 'Imperial Aramaic consonantal-script and scholarly transliteration conventions.',
  osa: 'Old South Arabian/Musnad scholarly transliteration conventions.'
})

const VOWELS = /[aeiouāēīūâêîûə]/iu
const TOKEN_MAP = Object.freeze({
  š: ['ש', 'sh', 'ʃ'], ṣ: ['צ', 'ts', 'sˤ'], ṭ: ['ט', 't', 'tˤ'],
  ḫ: ['ח', 'kh', 'x'], ḥ: ['ח', 'h', 'ħ'], ʿ: ['ע', '‘', 'ʕ'],
  ʾ: ['א', '’', 'ʔ'], ĝ: ['ג׳', 'g', 'ɡ'], ŋ: ['נג', 'ng', 'ŋ'],
  ḏ: ['ד׳', 'dh', 'ð'], ṯ: ['ת׳', 'th', 'θ'], ž: ['ז׳', 'zh', 'ʒ'],
  ā: ['א', 'a', 'aː'], ē: ['א', 'e', 'eː'], ī: ['י', 'ee', 'iː'], ū: ['ו', 'oo', 'uː'],
  â: ['א', 'a', 'aː'], ê: ['א', 'e', 'eː'], î: ['י', 'ee', 'iː'], û: ['ו', 'oo', 'uː'],
  a: ['אַ', 'a', 'a'], e: ['אֶ', 'e', 'e'], i: ['אִ', 'i', 'i'], o: ['אוֹ', 'o', 'o'], u: ['אוּ', 'u', 'u'],
  b: ['ב', 'b', 'b'], p: ['פ', 'p', 'p'], g: ['ג', 'g', 'ɡ'], d: ['ד', 'd', 'd'],
  k: ['כ', 'k', 'k'], q: ['ק', 'q', 'q'], l: ['ל', 'l', 'l'], m: ['מ', 'm', 'm'],
  n: ['נ', 'n', 'n'], r: ['ר', 'r', 'r'], s: ['ס', 's', 's'], z: ['ז', 'z', 'z'],
  f: ['פ', 'f', 'f'], v: ['ב', 'v', 'v'], w: ['ו', 'w', 'w'], y: ['י', 'y', 'j'],
  h: ['ה', 'h', 'h'], t: ['ת', 't', 't'], j: ['ג׳', 'j', 'dʒ'], c: ['כ', 'k', 'k'], x: ['כּס', 'ks', 'ks']
})

// The shared fallback only covers straightforward Latin letters. Each profile
// names the scholarly signs that are meaningful in that language's tradition.
// This makes both the selected convention and its uncertainty auditable.
export const PRONUNCIATION_RULES = Object.freeze({
  hebrew: { tokens: { ḥ: TOKEN_MAP.ḥ, ʾ: TOKEN_MAP.ʾ, š: TOKEN_MAP.š, ā: TOKEN_MAP.ā, ē: TOKEN_MAP.ē, ī: TOKEN_MAP.ī, ū: TOKEN_MAP.ū } },
  akkadian: { tokens: { š: TOKEN_MAP.š, ṣ: TOKEN_MAP.ṣ, ṭ: TOKEN_MAP.ṭ, ḫ: TOKEN_MAP.ḫ, ʿ: TOKEN_MAP.ʿ, ʾ: TOKEN_MAP.ʾ, ā: TOKEN_MAP.ā, ē: TOKEN_MAP.ē, ī: TOKEN_MAP.ī, ū: TOKEN_MAP.ū } },
  sumerian: { tokens: { ĝ: ['נג', 'ng', 'ŋ'], š: TOKEN_MAP.š, ḫ: TOKEN_MAP.ḫ, ŋ: TOKEN_MAP.ŋ, ā: TOKEN_MAP.ā, ē: TOKEN_MAP.ē, ī: TOKEN_MAP.ī, ū: TOKEN_MAP.ū } },
  egyptian: { tokens: { ꜣ: ['א', 'a', 'ʔ'], ꜥ: ['ע', '‘', 'ʕ'], ẖ: ['ח׳', 'kh', 'ç'], ḫ: TOKEN_MAP.ḫ, ṯ: TOKEN_MAP.ṯ, ḏ: TOKEN_MAP.ḏ, š: TOKEN_MAP.š } },
  hittite: { tokens: { š: TOKEN_MAP.š, ḫ: TOKEN_MAP.ḫ, ā: TOKEN_MAP.ā, ē: TOKEN_MAP.ē, ī: TOKEN_MAP.ī, ū: TOKEN_MAP.ū } },
  aramaic: { tokens: { ʾ: TOKEN_MAP.ʾ, ʿ: TOKEN_MAP.ʿ, š: TOKEN_MAP.š, ṣ: TOKEN_MAP.ṣ, ṭ: TOKEN_MAP.ṭ, ḏ: TOKEN_MAP.ḏ } },
  osa: { tokens: { ʾ: TOKEN_MAP.ʾ, ʿ: TOKEN_MAP.ʿ, ḏ: TOKEN_MAP.ḏ, ṯ: TOKEN_MAP.ṯ, ṣ: TOKEN_MAP.ṣ, ṭ: TOKEN_MAP.ṭ } }
})

const LANGUAGE_NOTES = Object.freeze({
  hebrew: {
    he: 'הניקוד משקף מסורת מסורה; ההגייה ההיסטורית אינה ידועה בכל פרט.',
    en: 'The pointing follows the Masoretic tradition; not every historical sound is certain.'
  },
  akkadian: {
    he: 'זהו שחזור אשוריולוגי לפי התעתיק; לסימני יתדות עשויות להיות קריאות אחדות.',
    en: 'This is an Assyriological reconstruction from the transliteration; cuneiform signs can have several readings.'
  },
  sumerian: {
    he: 'הקריאה נשענת על מסורת סופרית מאוחרת ועל תעתיק שומרולוגי, ולכן חלקה משוחזר.',
    en: 'The reading follows later scribal tradition and Sumerological transliteration, so parts remain reconstructed.'
  },
  egyptian: {
    he: 'הכתב המצרי בדרך כלל אינו כותב תנועות; התנועות כאן הן מוסכמה מצרולוגית או שחזור.',
    en: 'Egyptian writing normally omits vowels; the vowels here are Egyptological convention or reconstruction.'
  },
  hittite: {
    he: 'הקריאה הולכת אחר תעתיק חיתי; לוגוגרמה לבדה אינה מוכיחה בהכרח קריאה חיתית.',
    en: 'This follows Hittitological transliteration; a logogram alone does not necessarily establish a Hittite reading.'
  },
  aramaic: {
    he: 'הכתב הארמי בעיקר עיצורי; תנועות שאינן כתובות הן השלמה זהירה על פי המוסכמה המלומדת.',
    en: 'Aramaic writing is mainly consonantal; unmarked vowels are cautious scholarly supplies.'
  },
  osa: {
    he: 'כתב מוסנד עיצורי; אין להציג תנועות משוחזרות כוודאיות.',
    en: 'Musnad is consonantal; reconstructed vowels must not be treated as certain.'
  }
})

const HEBREW_OVERRIDES = Object.freeze({
  H1: { syllables: 'אָב', ipa: 'ʔaːv', he: 'אָב — אָב (av)', en: 'ahv', stress: 'הברה יחידה / one syllable' },
  H2803: { syllables: 'חָ־שַׁב', ipa: 'ħaːˈʃav', he: 'חָ־שַׁב — kha-SHAV', en: 'kha-SHAV', stress: 'מלעיל בקריאה זו / final stress in this guide' },
  H2805: { syllables: 'חֵ־שֶׁב', ipa: 'ħeːˈʃev', he: 'חֵ־שֶׁב — khe-SHEV', en: 'khe-SHEV', stress: 'מלעיל בקריאה זו / final stress in this guide' }
})

function tokenise(value) {
  return Array.from(String(value || '').normalize('NFC'))
}

function mapped(value, column, languageId) {
  return tokenise(value).map((character) => {
    const mapping = PRONUNCIATION_RULES[languageId]?.tokens?.[character.toLowerCase()] || TOKEN_MAP[character.toLowerCase()]
    return mapping ? mapping[column] : character
  }).join('')
}

function syllabify(value) {
  const chars = tokenise(value)
  const syllables = []
  let current = ''
  for (let index = 0; index < chars.length; index++) {
    const character = chars[index]
    current += character
    if (VOWELS.test(character) && index + 1 < chars.length && !VOWELS.test(chars[index + 1])) {
      const following = chars[index + 2]
      if (following && VOWELS.test(following)) {
        syllables.push(current)
        current = ''
      }
    }
  }
  if (current) syllables.push(current)
  return syllables.filter(Boolean).join(' · ')
}

function unavailable(languageId, source, guideLanguage) {
  const isHebrew = guideLanguage === 'he'
  return {
    state: 'unavailable', languageId, source,
    syllables: isHebrew ? 'לא ניתן לחלק להברות באחריות' : 'No responsible syllable division is available',
    stress: isHebrew ? 'לא ידוע' : 'Unknown', ipa: null,
    hebrew: isHebrew ? 'אין להמציא קריאה לצורה זו.' : 'No responsible Hebrew-friendly reading can be supplied.',
    english: isHebrew ? 'אין להמציא קריאה לצורה זו.' : 'No responsible English-friendly reading can be supplied.',
    note: isHebrew
      ? 'המקור מציג סימן או לוגוגרמה ללא תעתיק מנורמל שמאפשר שחזור אחראי.'
      : 'The source shows a sign or logogram without a normalized transliteration that would support a responsible reconstruction.',
    audio: { state: 'unavailable' }
  }
}

function genericGuide({ languageId, transliteration, guideLanguage }) {
  const source = String(transliteration || '').trim()
  if (!source) return unavailable(languageId, source, guideLanguage)
  const isHebrew = guideLanguage === 'he'
  const syllables = syllabify(source) || source
  return {
    state: 'resolved', languageId, source, syllables,
    stress: isHebrew ? 'ההטעמה אינה מסומנת במקור; אין לנחש אותה.' : 'Stress is not marked by the source; it is not guessed.',
    ipa: `/${mapped(source, 2, languageId)}/`,
    hebrew: mapped(source, 0, languageId),
    english: mapped(source, 1, languageId),
    note: LANGUAGE_NOTES[languageId]?.[isHebrew ? 'he' : 'en'] || LANGUAGE_NOTES.osa[isHebrew ? 'he' : 'en'],
    audio: { state: 'unavailable' }
  }
}

export function guideForHebrewEntry(entry, guideLanguage = GUIDE_LANGUAGE_DEFAULT) {
  const source = String(entry?.headword || '').trim()
  const override = HEBREW_OVERRIDES[entry?.id]
  if (!source) return unavailable('hebrew', source, guideLanguage)
  const guide = override
    ? { ...genericGuide({ languageId: 'hebrew', transliteration: entry.transliteration || source, guideLanguage }), ...override }
    : genericGuide({ languageId: 'hebrew', transliteration: entry.transliteration || source, guideLanguage })
  return {
    ...guide,
    source,
    note: LANGUAGE_NOTES.hebrew[guideLanguage === 'he' ? 'he' : 'en'],
    audio: { state: 'conditional', kind: 'modern-hebrew-synthesis' }
  }
}

export function guideForCandidate(candidate, languageId, guideLanguage = GUIDE_LANGUAGE_DEFAULT) {
  // A source transliteration is preferred; a dictionary lemma is used only when
  // it is itself the displayed scholarly reading, never as an invented reading.
  const source = candidate?.transliteration ||
    (candidate?.word && candidate.word !== candidate?.script ? candidate.word : '')
  return genericGuide({ languageId, transliteration: source, guideLanguage })
}

export function hasResolvedGuide(candidate, languageId) {
  return guideForCandidate(candidate, languageId).state === 'resolved'
}
