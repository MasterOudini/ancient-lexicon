// Faith, law & kingship entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const CULTURE = [
  {
    id: 'king',
    english: ['king'],
    hebrew: { word: 'מֶלֶךְ', translit: 'melekh', root: 'מלכ' },
    forms: {
      akkadian: {
        translit: 'šarru',
        script: '𒈗',
        scriptNote: 'shown as the logogram LUGAL, with which the word was commonly written',
        pron: 'shar-ru'
      },
      sumerian: {
        translit: 'lugal',
        script: '𒈗',
        pron: 'lu-gal'
      },
      egyptian: {
        translit: 'nswt',
        script: '𓇓𓏏𓈖',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'nesut (modern convention)',
        note: 'written sw-t-n by scribal convention and read nswt'
      },
      hittite: {
        translit: 'ḫaššuš',
        pron: 'hash-shush',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'melek / malkā',
        hebrewLetters: 'מלכא',
        note: 'emphatic form malkā; Elephantine papyri; Daniel 2:37 מַלְכָּא'
      },
      osa: {
        translit: 'mlk',
        tokens: ['m', 'l', 'k'],
        note: 'securely attested in Sabaic royal inscriptions'
      }
    }
  },
  {
    id: 'god',
    english: ['god', 'deity'],
    hebrew: { word: 'אֵל', translit: 'el', root: 'אל' },
    forms: {
      akkadian: {
        translit: 'ilu',
        script: '𒀭',
        scriptNote: 'shown as the logogram AN (DINGIR), with which the word was commonly written',
        pron: 'ee-lu'
      },
      sumerian: {
        translit: 'dingir',
        script: '𒀭',
        pron: 'din-gir'
      },
      egyptian: {
        translit: 'nṯr',
        script: '𓊹𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'netjer (modern convention)'
      },
      hittite: {
        translit: 'šiuš',
        pron: 'shee-ush',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾelāh',
        hebrewLetters: 'אלה',
        note: 'Daniel 2:20; Ezra 5:1 אֱלָהּ'
      },
      osa: {
        translit: 'ʾl',
        tokens: ["'", 'l'],
        note: 'attested at least in personal names'
      }
    }
  },
  {
    id: 'name',
    english: ['name'],
    hebrew: { word: 'שֵׁם', translit: 'shem', root: 'שמ' },
    forms: {
      akkadian: {
        translit: 'šumu',
        script: '𒈬',
        scriptNote: 'shown as the logogram MU, with which the word was commonly written',
        pron: 'shoo-mu'
      },
      sumerian: {
        translit: 'mu',
        script: '𒈬',
        pron: 'moo'
      },
      egyptian: {
        translit: 'rn',
        script: '𓂋𓈖',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ren (modern convention)'
      },
      hittite: {
        translit: 'lāman',
        pron: 'lah-man',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'šum',
        hebrewLetters: 'שם',
        note: 'Ezra 5:1 בְּשֻׁם; Daniel 2:20 שְׁמֵהּ'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'peace',
    english: ['peace', 'well-being', 'wholeness'],
    hebrew: { word: 'שָׁלוֹם', translit: 'shalom', root: 'שלמ' },
    forms: {
      akkadian: {
        translit: 'šulmu',
        script: '𒁲',
        scriptNote: 'shown as the logogram DI (SILIM), with which the word was commonly written',
        pron: 'shul-mu'
      },
      sumerian: {
        translit: 'silim',
        script: '𒁲',
        pron: 'sih-lim',
        note: 'written with the sign DI'
      },
      egyptian: {
        translit: 'ḥtp',
        script: '𓊵𓏏𓊪',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'hotep (modern convention)'
      },
      aramaic: {
        translit: 'šəlām',
        hebrewLetters: 'שלם',
        note: 'greeting formula in Elephantine letters; Ezra 4:17 שְׁלָם'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
