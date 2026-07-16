// Registry of the reference dictionaries and open lexical datasets browsable
// in the Dictionary tab. Each source is public domain or openly licensed and
// keeps its own coverage/provenance label; a compact community wordlist must
// never be presented as if it were a comprehensive scholarly dictionary.
//
// Each dictionary's data is a JSON file of the shape
//   { work, license?, conversion, count, entries: [ ... ] }
// Large sets live in public/dicts/ and load on demand (fetched at runtime and
// cached by the service worker after first open); Strong's ships in the app
// bundle. `fields` maps a record's keys onto the display slots the browser
// renders: head (headword), optional headClass/headDir for native-script
// headwords, sub (a secondary line, e.g. transliteration or part of speech),
// ref (a small badge, e.g. a Strong's number or page), def (the definition),
// and extra (labeled follow-on lines shown when expanded).

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
    language: 'Hebrew & Aramaic',
    dir: 'rtl',
    index: 'hebrew',
    source: { kind: 'url', url: 'dicts/jastrow.json' },
    fields: {
      head: 'lemma',
      sub: 'languageLabel',
      ref: 'page',
      refPrefix: 'p. ',
      def: 'def',
      extra: []
    },
    license: 'CC BY-NC 4.0 digitization; underlying 1903 work public domain',
    licenseUrl: 'https://creativecommons.org/licenses/by-nc/4.0/',
    attribution:
      'A Dictionary of the Targumim, the Talmud Babli and Yerushalmi, and the Midrashic Literature (Marcus Jastrow, 1903). Sefaria digitization distributed by the pinned Jastrow PWA. Printed origin markers are retained when supplied; rows without one are labeled Hebrew/Aramaic (unmarked), not inferred as Hebrew or Aramaic.'
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
  },
  {
    id: 'hittite-iecor',
    label: 'Hittite (IE-CoR)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-iecor.json' },
    fields: {
      head: 'lemma',
      sub: null,
      ref: 'conceptId',
      refPrefix: 'concept ',
      def: 'def',
      extra: [
        { key: 'sourceGloss', label: 'IE-CoR contributor gloss (source wording; may be non-English; not meaning-indexed)' },
        { key: 'spelling', label: 'Syllabic spelling (transliterated)' },
        { key: 'note', label: 'IE-CoR note' },
        { key: 'cognateSet', label: 'IE-CoR cognate-set ID' }
      ]
    },
    license: 'CC BY 4.0',
    attribution:
      'IE-CoR release v1.2 (DOI 10.5281/zenodo.13304537), Heggarty, Anderson, Scarborough et al.; Hittite data by Matilde Serangeli and Matthew Scarborough. IE-CoR has a 170-concept frame; this attested-form subset retains 133 Hittite forms across 130 concepts, not a comprehensive dictionary.'
  },
  {
    id: 'hittite-diacl',
    label: 'Hittite (DIACL)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-diacl.json' },
    fields: {
      head: 'lemma',
      sub: null,
      ref: 'conceptId',
      refPrefix: 'concept ',
      def: 'def',
      extra: [
        { key: 'sourceSpelling', label: 'Original source spelling' },
        { key: 'sourceNote', label: 'DIACL source note' },
        { key: 'concepticonGloss', label: 'Concepticon gloss' },
        { key: 'ref', label: 'DIACL bibliography source ID' },
        { key: 'diaclFormId', label: 'DIACL form ID' }
      ]
    },
    license: 'CC BY 4.0',
    attribution:
      'DIACL v3.0 (DOI 10.5281/zenodo.5121561), an openly licensed comparative lexical dataset. This subset retains 146 attested Hittite rows across 121 concepts after three source-inconsistent duplicate assignments were explicitly excluded; it is not a comprehensive dictionary.'
  },
  {
    id: 'hittite-asjp',
    label: 'Hittite (ASJP)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-asjp.json' },
    fields: {
      head: 'lemma',
      sub: null,
      ref: 'meaningNumber',
      refPrefix: 'ASJP ',
      def: 'def',
      extra: []
    },
    license: 'CC BY 4.0',
    attribution:
      'The ASJP Database Hittite wordlist, compiled by Viveka Velupillai. Thirty basic-vocabulary concepts in ASJP transcription, preserved unchanged; a small wordlist, not a Hittite dictionary.'
  },
  {
    id: 'hittite-sturtevant',
    label: 'Hittite (Sturtevant 1936)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-sturtevant.json' },
    fields: {
      head: 'lemma',
      sub: null,
      ref: 'page',
      refPrefix: 'p. ',
      def: 'def',
      extra: [
        { key: 'sourceHead', label: 'Source head/form line' },
        { key: 'ocrConfidence', label: 'Headword OCR confidence' },
        { key: 'source', label: 'Scanned source page', href: true, linkLabel: 'Open scanned page' }
      ]
    },
    license: 'Public domain (HathiTrust rights review)',
    attribution:
      'Edgar H. Sturtevant, A Hittite Glossary, second edition (1936), from an Internet Archive scan marked public domain after HathiTrust rights review. This is a conservatively filtered 633-entry OCR subset of a historical glossary: readings and meanings reflect 1936 scholarship, not modern verification.'
  },
  {
    id: 'hittite-wikidata',
    label: 'Hittite (Wikidata)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-wikidata.json' },
    fields: {
      head: 'lemma',
      sub: 'lexicalCategoryLabel',
      ref: 'id',
      def: 'def',
      extra: [
        { key: 'source', label: 'Wikidata lexeme', href: true, linkLabel: 'Open live lexeme' },
        { key: 'revision', label: 'Snapshot revision ID' },
        { key: 'timestamp', label: 'Snapshot revision timestamp' }
      ]
    },
    license: 'CC0 1.0',
    attribution:
      'A dated snapshot of the small, community-edited Wikidata Hittite Lexeme set with English sense glosses. Structured Wikidata data are CC0; cited dictionary items are retained only as provenance and do not make these rows independently verified scholarship.'
  },
  {
    id: 'hittite-wiktionary',
    label: 'Hittite (Wiktionary)',
    language: 'Hittite',
    lang: 'hit',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/hittite-wiktionary.json' },
    fields: {
      head: 'lemma',
      sub: 'pos',
      ref: null,
      def: 'def',
      script: 'script',
      scriptClass: 'script-cuneiform',
      scriptDir: 'ltr',
      extra: [
        { key: 'pron', label: 'Pronunciation (Wiktionary)' },
        { key: 'source', label: 'Wiktionary source revision', href: true, linkLabel: 'Open exact source revision' },
        { key: 'revision', label: 'Revision ID' },
        { key: 'timestamp', label: 'Revision timestamp' }
      ]
    },
    license: 'CC BY-SA 4.0',
    attribution:
      'A dated, transformed snapshot of English Wiktionary Hittite lemma pages with page and revision attribution. Community-authored coverage, not a comprehensive scholarly Hittite dictionary.'
  },
  {
    id: 'osa-wikidata',
    label: 'OSA varieties (Wikidata)',
    language: 'Old South Arabian',
    dir: 'rtl',
    index: 'none',
    source: { kind: 'url', url: 'dicts/osa-wikidata.json' },
    fields: {
      head: 'lemma',
      headClass: 'script-osa',
      headDir: 'rtl',
      sub: 'lexicalCategoryLabel',
      ref: 'variety',
      def: 'def',
      extra: [
        { key: 'source', label: 'Wikidata lexeme', href: true, linkLabel: 'Open live lexeme' },
        { key: 'revision', label: 'Snapshot revision ID' },
        { key: 'timestamp', label: 'Snapshot revision timestamp' }
      ]
    },
    license: 'CC0 1.0',
    attribution:
      'A dated snapshot of eight community-edited Wikidata Lexemes: one Old South Arabian, four Qatabanian, two Sabaean, and one Hadramautic; no Minaean row was present. Structured Wikidata data are CC0; the variety is shown on every row and the set is not a scholarly or comprehensive dictionary.'
  },
  {
    id: 'osa-wiktionary',
    label: 'OSA varieties (Wiktionary)',
    language: 'Old South Arabian',
    dir: 'ltr',
    index: 'latin',
    source: { kind: 'url', url: 'dicts/osa-wiktionary.json' },
    fields: {
      head: 'lemma',
      sub: 'pos',
      ref: 'variety',
      def: 'def',
      script: 'script',
      scriptClass: 'script-osa',
      scriptDir: 'rtl',
      extra: [
        { key: 'variety', label: 'Language variety' },
        { key: 'source', label: 'Wiktionary source revision', href: true, linkLabel: 'Open exact source revision' },
        { key: 'revision', label: 'Revision ID' },
        { key: 'timestamp', label: 'Revision timestamp' }
      ]
    },
    license: 'CC BY-SA 4.0',
    attribution:
      'A dated, transformed snapshot of English Wiktionary Old South Arabian, Sabaean, Minaean, and Qatabanian lemma pages with exact page-revision attribution. Principally Sabaean community coverage, with small Minaean and Qatabanian subsets; not a comprehensive dictionary of the language family.'
  }
]

export function getDictionary(id) {
  return REFERENCE_DICTIONARIES.find((d) => d.id === id)
}
