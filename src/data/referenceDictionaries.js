// Registry of the full reference dictionaries browsable in the Dictionary
// tab's "Reference dictionaries" mode. These are complete published works —
// public domain or openly licensed — presented as published, distinct from
// the hand-curated comparative database.
//
// Each dictionary's data is a JSON file of the shape
//   { work, license?, conversion, count, entries: [ ... ] }
// Large sets live in public/dicts/ and load on demand (fetched at runtime and
// cached by the service worker after first open); Strong's ships in the app
// bundle. `fields` maps a record's keys onto the display slots the browser
// renders: head (headword), sub (a secondary line, e.g. transliteration or
// part of speech), ref (a small badge, e.g. a Strong's number or page), def
// (the definition), and extra (labeled follow-on lines shown when expanded).

export const REFERENCE_DICTIONARIES = [
  {
    id: 'strongs',
    label: 'Strong’s',
    language: 'Hebrew',
    dir: 'rtl',
    index: 'hebrew',
    source: { kind: 'strongs' },
    fields: {
      head: 'lemma',
      sub: 'xlit',
      ref: 'id',
      def: 'def',
      extra: [
        { key: 'kjv', label: 'KJV renderings' },
        { key: 'deriv', label: 'Derivation' },
        { key: 'pron', label: 'Pronunciation (Strong’s notation)' }
      ]
    },
    license: 'Public domain',
    attribution:
      'Strong’s Concise Dictionary of the Words in the Hebrew Bible (James Strong, 1894). JSON arrangement © Open Scriptures, CC-BY-SA.'
  },
  {
    id: 'bdb',
    label: 'Brown-Driver-Briggs',
    language: 'Hebrew',
    dir: 'rtl',
    index: 'hebrew',
    source: { kind: 'url', url: 'dicts/bdb.json' },
    fields: { head: 'lemma', sub: 'pos', ref: null, def: 'def', extra: [] },
    license: 'Public domain',
    attribution:
      'A Hebrew and English Lexicon of the Old Testament (Brown, Driver & Briggs, 1906; includes Biblical Aramaic). Machine-readable XML by the OpenScriptures HebrewLexicon project.'
  },
  {
    id: 'jastrow',
    label: 'Jastrow',
    language: 'Aramaic',
    dir: 'rtl',
    index: 'hebrew',
    source: { kind: 'url', url: 'dicts/jastrow.json' },
    fields: {
      head: 'lemma',
      sub: null,
      ref: 'page',
      refPrefix: 'p. ',
      def: 'def',
      extra: []
    },
    license: 'Public domain',
    attribution:
      'A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature (Marcus Jastrow, 1903). Digitized by Sefaria.'
  },
  {
    id: 'egyptian',
    label: 'Egyptian (TLA)',
    language: 'Egyptian',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/egyptian.json' },
    fields: {
      head: 'lemma',
      sub: 'pos',
      ref: 'ref',
      def: 'def',
      extra: [{ key: 'de', label: 'German (Wörterbuch)' }]
    },
    license: 'CC BY-SA 4.0',
    attribution:
      'Ancient Egyptian Dictionary (Ägyptische Wortliste), Thesaurus Linguae Aegyptiae / Berlin-Brandenburg Academy, CC BY-SA 4.0, via the AED-TEI edition.'
  },
  {
    id: 'sumerian',
    label: 'Sumerian (ePSD2)',
    language: 'Sumerian',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/sumerian.json' },
    fields: {
      head: 'lemma',
      sub: 'pos',
      ref: null,
      def: 'def',
      script: 'cun',
      scriptClass: 'script-cuneiform',
      extra: []
    },
    license: 'CC BY-SA 3.0',
    attribution:
      'Electronic Pennsylvania Sumerian Dictionary (ePSD2), Steve Tinney et al., University of Pennsylvania / ORACC, CC BY-SA 3.0.'
  },
  {
    id: 'akkadian',
    label: 'Akkadian (RINAP)',
    language: 'Akkadian',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/akkadian.json' },
    fields: { head: 'lemma', sub: 'pos', ref: null, def: 'def', extra: [] },
    license: 'CC BY-SA 3.0',
    attribution:
      'Akkadian glossary of RINAP (Royal Inscriptions of the Neo-Assyrian Period), ORACC / University of Pennsylvania, CC BY-SA 3.0. One Neo-Assyrian sub-corpus, not the full Akkadian lexicon.'
  }
]

export function getDictionary(id) {
  return REFERENCE_DICTIONARIES.find((d) => d.id === id)
}
