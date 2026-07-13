// Language registry for the comparative dictionary.
//
// Each language has:
//   id         - stable key used in lexicon entry `forms` objects
//   name       - display name
//   scriptName - display name of the writing system
//   fontClass  - CSS class from styles.css that applies the bundled script font
//   dir        - text direction of the original-script rendering
//   caveat     - one plain-prose sentence shown in the
//                "About the scripts and pronunciation" box
//
// Order matters: plaques on each dictionary card render in this order.

export const LANGUAGES = [
  {
    id: 'akkadian',
    name: 'Akkadian',
    scriptName: 'Cuneiform',
    fontClass: 'script-cuneiform',
    dir: 'ltr',
    caveat:
      'Akkadian words are shown as the logograms with which they were commonly written; the normalized transliteration follows dictionary convention.'
  },
  {
    id: 'sumerian',
    name: 'Sumerian',
    scriptName: 'Cuneiform',
    fontClass: 'script-cuneiform',
    dir: 'ltr',
    caveat:
      'Sumerian pronunciation is known only through later scribal tradition.'
  },
  {
    id: 'egyptian',
    name: 'Egyptian',
    scriptName: 'Hieroglyphs',
    fontClass: 'script-egyptian',
    dir: 'ltr',
    caveat:
      'The hieroglyphic script records no vowels; renderings here are linearized and monument spellings vary; pronunciations shown are modern conventions (Egyptological pronunciation).'
  },
  {
    id: 'hittite',
    name: 'Hittite',
    scriptName: 'Cuneiform',
    fontClass: 'script-cuneiform',
    dir: 'ltr',
    caveat:
      'Many Hittite words were written logographically; where only the logogram is attested, the native Hittite reading is not established and the entry says so.'
  },
  {
    id: 'aramaic',
    name: 'Imperial Aramaic',
    scriptName: 'Imperial Aramaic script',
    fontClass: 'script-aramaic',
    dir: 'rtl',
    caveat:
      'Aramaic forms are as attested in the Elephantine papyri and biblical Aramaic (Daniel, Ezra); they are shown in both Hebrew square script and Imperial Aramaic letters.'
  },
  {
    id: 'osa',
    name: 'Old South Arabian',
    scriptName: 'Musnad',
    fontClass: 'script-osa',
    dir: 'rtl',
    caveat:
      'The Musnad script records no vowels; only consonantal skeletons are shown; several slots are deliberately empty or flagged where attestation is uncertain.'
  }
]

// Shown alongside the per-language caveats.
export const HEBREW_CAVEAT =
  'Hebrew niqqud (vowel pointing) in headwords follows the Masoretic tradition.'

export function getLanguage(id) {
  return LANGUAGES.find((l) => l.id === id)
}
