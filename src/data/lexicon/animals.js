// Animals entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const ANIMALS = [
  {
    id: 'ox',
    english: ['ox', 'bull'],
    hebrew: { word: 'שׁוֹר', translit: 'shor', root: 'שור' },
    forms: {
      akkadian: {
        translit: 'alpu',
        script: '𒄞',
        scriptNote: 'shown as the logogram GUD, with which the word was commonly written',
        pron: 'al-pu'
      },
      sumerian: {
        translit: 'gud',
        script: '𒄞',
        pron: 'good'
      },
      egyptian: {
        translit: 'kꜣ',
        script: '𓂓𓃒',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ka (modern convention)'
      },
      hittite: {
        script: '𒄞',
        scriptNote: 'written logographically (GU4); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'tōr',
        hebrewLetters: 'תור',
        note: 'plural תּוֹרִין Ezra 6:9; Aramaic t here corresponds to Hebrew š (שׁוֹר)'
      },
      osa: {
        translit: 'ṯwr',
        tokens: ['th', 'w', 'r'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'dog',
    english: ['dog'],
    hebrew: { word: 'כֶּלֶב', translit: 'kelev', root: 'כלב' },
    forms: {
      akkadian: {
        translit: 'kalbu',
        script: '𒌨',
        scriptNote: 'shown as the logogram UR, with which the word was commonly written',
        pron: 'kal-bu'
      },
      sumerian: {
        translit: 'ur',
        script: '𒌨',
        pron: 'oor',
        note: 'generic word; the domestic dog is written ur-gi7'
      },
      egyptian: {
        translit: 'ṯsm',
        script: '𓍿𓊃𓅓𓃡',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'tjesem (modern convention)'
      },
      hittite: {
        script: '𒌨𒆪',
        scriptNote: 'written logographically (UR.GI7); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'kalbā',
        hebrewLetters: 'כלבא',
        note: 'the Ahiqar proverbs from Elephantine'
      },
      osa: {
        translit: 'klb',
        tokens: ['k', 'l', 'b'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  }
]
