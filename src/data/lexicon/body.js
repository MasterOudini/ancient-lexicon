// The body entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const BODY = [
  {
    id: 'hand',
    english: ['hand'],
    hebrew: { word: 'יָד', translit: 'yad', root: 'יד' },
    forms: {
      akkadian: {
        translit: 'qātu',
        script: '𒋗',
        scriptNote: 'shown as the logogram SHU, with which the word was commonly written',
        pron: 'kaa-tu'
      },
      sumerian: {
        translit: 'šu',
        script: '𒋗',
        pron: 'shoo'
      },
      egyptian: {
        translit: 'ḏrt',
        script: '𓂧𓂋𓏏',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'djeret (modern convention)'
      },
      hittite: {
        translit: 'keššar',
        pron: 'kesh-shar',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'yad',
        hebrewLetters: 'יד',
        note: 'Daniel 2:34 בִידַיִן (not by hands)'
      },
      osa: {
        translit: 'yd',
        tokens: ['y', 'd'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'heart',
    english: ['heart', 'mind'],
    hebrew: { word: 'לֵב', translit: 'lev', root: 'לבב', note: 'also לֵבָב levav' },
    forms: {
      akkadian: {
        translit: 'libbu',
        script: '𒊮',
        scriptNote: 'shown as the logogram SHA3, with which the word was commonly written',
        pron: 'lib-bu'
      },
      sumerian: {
        translit: 'šag4',
        script: '𒊮',
        pron: 'shag'
      },
      egyptian: {
        translit: 'ib',
        script: '𓄣𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ib (modern convention)'
      },
      hittite: {
        translit: 'ker',
        pron: 'ker',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ləbab',
        hebrewLetters: 'לבב',
        note: 'Daniel 4:13 לְבַב; Daniel 7:28 לִבִּי'
      },
      osa: {
        translit: 'lb',
        tokens: ['l', 'b'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  }
]
