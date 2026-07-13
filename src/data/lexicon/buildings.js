// Buildings & the city entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const BUILDINGS = [
  {
    id: 'house',
    english: ['house'],
    hebrew: { word: 'בַּיִת', translit: 'bayit', root: 'בית' },
    forms: {
      akkadian: {
        translit: 'bītu',
        script: '𒂍',
        scriptNote: 'shown as the logogram E2, with which the word was commonly written',
        pron: 'bee-tu'
      },
      sumerian: {
        translit: 'e2',
        script: '𒂍',
        pron: 'eh'
      },
      egyptian: {
        translit: 'pr',
        script: '𓉐𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'per (modern convention)'
      },
      hittite: {
        translit: 'per / pir',
        pron: 'per',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'baytā',
        hebrewLetters: 'ביתא',
        note: 'emphatic form; Elephantine house documents; Ezra 5:11 בַּיְתָא'
      },
      osa: {
        translit: 'byt',
        tokens: ['b', 'y', 't'],
        note: 'attested in Sabaic inscriptions'
      }
    }
  }
]
