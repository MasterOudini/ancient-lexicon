// Nature & the heavens entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const NATURE = [
  {
    id: 'water',
    english: ['water'],
    hebrew: { word: 'מַיִם', translit: 'mayim', root: 'מימ' },
    forms: {
      akkadian: {
        translit: 'mû',
        script: '𒀀',
        scriptNote: 'shown as the logogram A, with which the word was commonly written',
        pron: 'moo'
      },
      sumerian: {
        translit: 'a',
        script: '𒀀',
        pron: 'ah'
      },
      egyptian: {
        translit: 'mw',
        script: '𓈗',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'mu (modern convention)'
      },
      hittite: {
        translit: 'wātar',
        script: '𒉿𒀀𒋻',
        scriptNote: 'syllabic spelling wa-a-tar',
        pron: 'wah-tar',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'mayin',
        hebrewLetters: 'מין',
        note: 'the exact attested form should be checked against the Elephantine corpus (TAD)',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sun',
    english: ['sun'],
    hebrew: { word: 'שֶׁמֶשׁ', translit: 'shemesh', root: 'שמש' },
    forms: {
      akkadian: {
        translit: 'šamšu',
        script: '𒌓',
        scriptNote: 'shown as the logogram UD (UTU), with which the word was commonly written',
        pron: 'sham-shu'
      },
      sumerian: {
        translit: 'utu',
        script: '𒌓',
        pron: 'oo-too',
        note: 'the sign UD, read utu for the sun'
      },
      egyptian: {
        translit: 'rꜥ',
        script: '𓂋𓂝𓇳',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ra (modern convention)'
      },
      hittite: {
        translit: 'Ištanu-',
        script: '𒌓',
        scriptNote: 'commonly written with the logogram UTU',
        note: 'the native reading Ištanu- should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'šimšā',
        hebrewLetters: 'שמשא',
        note: 'Daniel 6:15 שִׁמְשָׁא'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
