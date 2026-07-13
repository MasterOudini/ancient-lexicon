// Food & drink entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const FOOD = [
  {
    id: 'bread',
    english: ['bread', 'food'],
    hebrew: { word: 'לֶחֶם', translit: 'lechem', root: 'לחמ' },
    forms: {
      akkadian: {
        translit: 'akalu',
        script: '𒃻',
        scriptNote: 'shown as the logogram GAR (NINDA), with which the word was commonly written',
        pron: 'ah-ka-lu'
      },
      sumerian: {
        translit: 'ninda',
        script: '𒃻',
        pron: 'nin-da'
      },
      egyptian: {
        translit: 't',
        script: '𓏏𓏐𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ta (modern convention)'
      },
      hittite: {
        script: '𒃻',
        scriptNote: 'written logographically (NINDA); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ləḥem',
        hebrewLetters: 'לחם',
        note: 'Daniel 5:1 לְחֶם'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
