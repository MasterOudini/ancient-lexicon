// Kinship & family entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const KINSHIP = [
  {
    id: 'father',
    english: ['father'],
    hebrew: { word: 'אָב', translit: 'av', root: 'אב' },
    forms: {
      akkadian: {
        translit: 'abu',
        script: '𒀜',
        scriptNote: 'shown as the logogram AD, with which the word was commonly written',
        pron: 'ah-bu'
      },
      egyptian: {
        translit: 'it',
        script: '𓇋𓏏𓆑',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'it (modern convention)',
        note: 'conventionally written with 𓆑 (f) although the reading is it'
      },
      hittite: {
        translit: 'attaš',
        pron: 'at-tash',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾab',
        hebrewLetters: 'אב',
        note: 'Daniel 5:2 אֲבוּהִי (his father)'
      },
      osa: {
        translit: 'ʾb',
        tokens: ["'", 'b'],
        note: 'attested at least in personal names'
      }
      // sumerian: deliberately empty; the usual writing ad-da uses a sign
      // outside this database's verified list.
    }
  },
  {
    id: 'mother',
    english: ['mother'],
    hebrew: { word: 'אֵם', translit: 'em', root: 'אמ' },
    forms: {
      akkadian: {
        translit: 'ummu',
        script: '𒂼',
        scriptNote: 'shown as the logogram AMA, with which the word was commonly written',
        pron: 'um-mu'
      },
      sumerian: {
        translit: 'ama',
        script: '𒂼',
        pron: 'ah-ma'
      },
      egyptian: {
        translit: 'mwt',
        script: '𓅐𓏏𓁐',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'mut (modern convention)'
      },
      hittite: {
        translit: 'annaš',
        pron: 'an-nash',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾem',
        hebrewLetters: 'אם',
        note: 'Elephantine family and legal documents'
      },
      osa: {
        translit: 'ʾm',
        tokens: ["'", 'm'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'son',
    english: ['son'],
    hebrew: { word: 'בֵּן', translit: 'ben', root: 'בנ' },
    forms: {
      akkadian: {
        translit: 'māru',
        script: '𒌉',
        scriptNote: 'shown as the logogram DUMU, with which the word was commonly written',
        pron: 'maa-ru'
      },
      sumerian: {
        translit: 'dumu',
        script: '𒌉',
        pron: 'doo-moo'
      },
      egyptian: {
        translit: 'sꜣ',
        script: '𓅭𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sa (modern convention)'
      },
      hittite: {
        script: '𒌉',
        scriptNote: 'written logographically (DUMU); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'bar',
        hebrewLetters: 'בר',
        note: 'Aramaic br corresponds to Hebrew bn; both attested. Daniel 5:22 בְּרֵהּ; Ezra 5:1 בַר'
      },
      osa: {
        translit: 'bn',
        tokens: ['b', 'n'],
        note: 'securely attested in genealogical formulas'
      }
    }
  }
]
