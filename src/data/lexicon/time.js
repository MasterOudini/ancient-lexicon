// Time & seasons entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const TIME = [
  {
    id: 'day',
    english: ['day'],
    hebrew: { word: 'יוֹם', translit: 'yom', root: 'יומ' },
    forms: {
      akkadian: {
        translit: 'ūmu',
        script: '𒌓',
        scriptNote: 'shown as the logogram UD, with which the word was commonly written',
        pron: 'oo-mu'
      },
      sumerian: {
        translit: 'ud',
        script: '𒌓',
        pron: 'ood'
      },
      egyptian: {
        translit: 'hrw',
        script: '𓉔𓂋𓅱𓇳',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'heru (modern convention)'
      },
      hittite: {
        translit: 'šiwatt-',
        pron: 'shee-watt',
        note: 'stem; attested syllabically'
      },
      aramaic: {
        translit: 'yōm',
        hebrewLetters: 'יום',
        note: 'Daniel 6:11 בְּיוֹמָא; Ezra 6:9'
      },
      osa: {
        translit: 'ywm',
        tokens: ['y', 'w', 'm'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  }
]
