// Script mappers: Hebrew square script to Imperial Aramaic letters, and
// consonant tokens to Old South Arabian (Musnad) letters.
//
// No astral-plane glyph is hand-typed in this file. Every mapping is built
// with String.fromCodePoint from codepoints verified against Unicode
// character names (python unicodedata):
//   - Imperial Aramaic block U+10840..U+10855 runs aleph through taw in
//     Hebrew alphabet order (22 letters).
//   - Old South Arabian block U+10A60..U+10A7C (29 letters).

// Hebrew final letters folded to their base forms. Keys and values are
// ordinary one-character strings (BMP, safe to index).
const FINAL_TO_BASE = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ'
}

// Fold final letters to base forms. Used by the Aramaic mapper, by root
// keys, and by search normalization, so the three can never disagree.
export function foldFinals(str) {
  return Array.from(str)
    .map((ch) => FINAL_TO_BASE[ch] || ch)
    .join('')
}

// The 22 Hebrew base letters in alphabet order. The Imperial Aramaic block
// runs in the same order starting at U+10840 (aleph).
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת'

export const HEB_TO_IMPERIAL_ARAMAIC = {}
Array.from(HEBREW_ALPHABET).forEach((letter, i) => {
  HEB_TO_IMPERIAL_ARAMAIC[letter] = String.fromCodePoint(0x10840 + i)
})
// Final letters map to the same Imperial Aramaic letters as their base forms.
for (const [fin, base] of Object.entries(FINAL_TO_BASE)) {
  HEB_TO_IMPERIAL_ARAMAIC[fin] = HEB_TO_IMPERIAL_ARAMAIC[base]
}

// Render a Hebrew-square-script string in Imperial Aramaic letters.
// Hebrew pointing (U+0591..U+05C7) is stripped; characters with no mapping
// (spaces, punctuation) pass through unchanged.
export function toImperialAramaic(hebrew) {
  return Array.from(hebrew.replace(/[֑-ׇ]/g, ''))
    .map((ch) => HEB_TO_IMPERIAL_ARAMAIC[ch] || ch)
    .join('')
}

// Old South Arabian consonant tokens. Token names follow the conventional
// transliteration order used in src/data/lexicon.js `tokens` arrays.
// Sibilant convention: s1 = SAT, s2 = SHIN, s3 = SAMEKH.
// Codepoints verified against Unicode names:
//   U+10A60 HE, U+10A61 LAMEDH, U+10A62 HETH, U+10A63 MEM, U+10A64 QOPH,
//   U+10A65 WAW, U+10A66 SHIN, U+10A67 RESH, U+10A68 BETH, U+10A69 TAW,
//   U+10A6A SAT, U+10A6B KAPH, U+10A6C NUN, U+10A6D KHETH, U+10A6E SADHE,
//   U+10A6F SAMEKH, U+10A70 FE, U+10A71 ALEF, U+10A72 AYN, U+10A73 DHADHE,
//   U+10A74 GIMEL, U+10A75 DALETH, U+10A76 GHAYN, U+10A77 TETH,
//   U+10A78 ZAYN, U+10A79 DHALETH, U+10A7A YODH, U+10A7B THAW, U+10A7C THETH
export const OSA_TOKENS = {
  "'": String.fromCodePoint(0x10a71), // alef
  b: String.fromCodePoint(0x10a68), // beth
  t: String.fromCodePoint(0x10a69), // taw
  th: String.fromCodePoint(0x10a7b), // thaw
  g: String.fromCodePoint(0x10a74), // gimel
  h: String.fromCodePoint(0x10a60), // he
  hh: String.fromCodePoint(0x10a62), // heth
  kh: String.fromCodePoint(0x10a6d), // kheth
  d: String.fromCodePoint(0x10a75), // daleth
  dh: String.fromCodePoint(0x10a79), // dhaleth
  r: String.fromCodePoint(0x10a67), // resh
  z: String.fromCodePoint(0x10a78), // zayn
  s1: String.fromCodePoint(0x10a6a), // sat
  s2: String.fromCodePoint(0x10a66), // shin
  s3: String.fromCodePoint(0x10a6f), // samekh
  ss: String.fromCodePoint(0x10a6e), // sadhe
  dd: String.fromCodePoint(0x10a73), // dhadhe
  tt: String.fromCodePoint(0x10a77), // teth
  zz: String.fromCodePoint(0x10a7c), // theth
  ayn: String.fromCodePoint(0x10a72), // ayn
  gh: String.fromCodePoint(0x10a76), // ghayn
  f: String.fromCodePoint(0x10a70), // fe
  q: String.fromCodePoint(0x10a64), // qoph
  k: String.fromCodePoint(0x10a6b), // kaph
  l: String.fromCodePoint(0x10a61), // lamedh
  m: String.fromCodePoint(0x10a63), // mem
  n: String.fromCodePoint(0x10a6c), // nun
  w: String.fromCodePoint(0x10a65), // waw
  y: String.fromCodePoint(0x10a7a) // yodh
}

// Render an array of consonant tokens as Musnad letters.
// Unknown tokens render as U+FFFD so mistakes are visible, never silent.
export function toMusnad(tokens) {
  return tokens.map((t) => OSA_TOKENS[t] || '�').join('')
}
