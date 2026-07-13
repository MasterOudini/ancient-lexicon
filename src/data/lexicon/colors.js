// Colors entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const COLORS = [
  {
    id: 'white',
    english: ['white'],
    hebrew: { word: 'לָבָן', translit: 'lavan', root: 'לבנ' },
    forms: {
      akkadian: {
        translit: 'peṣû',
        script: '𒌓',
        scriptNote: 'shown as the logogram BABBAR (the sign UD), with which the word was commonly written',
        pron: 'peh-tsoo'
      },
      sumerian: {
        translit: 'babbar',
        script: '𒌓',
        pron: 'bab-bar',
        note: 'the sign UD, read babbar for white'
      },
      egyptian: {
        translit: 'ḥḏ',
        script: '𓌉𓆓',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'hedj (modern convention)',
        note: 'white, bright'
      },
      hittite: {
        translit: 'ḫarkiš',
        pron: 'har-kish',
        note: 'white, bright; attested syllabically'
      },
      aramaic: {
        translit: 'ḥiwwār',
        hebrewLetters: 'חור',
        note: 'a different word from Hebrew lavan; Daniel 7:9 כִּתְלַג חִוָּר (white as snow)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'black',
    english: ['black'],
    hebrew: { word: 'שָׁחֹר', translit: 'shachor', root: 'שחר' },
    forms: {
      akkadian: {
        translit: 'ṣalmu',
        script: '𒈪',
        scriptNote: 'shown as the logogram GI6 (the sign MI), with which the word was commonly written',
        pron: 'tsal-mu',
        note: 'a separate Akkadian word ṣalmu means image, statue; the logogram equation should be checked against CAD',
        verify: true
      },
      sumerian: {
        translit: 'gi6',
        script: '𒈪',
        pron: 'gee',
        note: 'the sign MI, read gi6 for black and night; the reading should be checked against corpus records',
        verify: true
      },
      egyptian: {
        translit: 'km',
        script: '𓆎𓅓',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'kem (modern convention)',
        note: 'the same word opens Kemet, the Black Land, a native name of Egypt'
      },
      hittite: {
        translit: 'dankuiš',
        pron: 'dan-ku-ish',
        note: 'dark, black; attested syllabically'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'red',
    english: ['red'],
    hebrew: { word: 'אָדֹם', translit: 'adom', root: 'אדמ' },
    forms: {
      akkadian: {
        translit: 'sāmu',
        pron: 'saa-mu',
        note: 'red, red-brown; a different word from Hebrew adom'
      },
      egyptian: {
        translit: 'dšr',
        script: '𓂧𓈙𓂋𓅟',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'desher (modern convention)',
        note: 'shown with the flamingo sign as determinative; the sign sequence should be checked against Wb.',
        verify: true
      }
      // sumerian: deliberately empty; the red sign readings are outside this
      // database's verified list.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'green',
    english: ['green', 'pale green'],
    hebrew: { word: 'יָרֹק', translit: 'yaroq', root: 'ירק' },
    forms: {
      akkadian: {
        translit: 'arqu',
        pron: 'ar-qu',
        note: 'green-yellow; Old Babylonian warqum, with w where Hebrew has y — the standard comparison with yaroq'
      },
      sumerian: {
        translit: 'sig7',
        script: '𒅊',
        pron: 'sig',
        note: 'the sign IGI-gunu, read sig7 for green-yellow; the reading should be checked against corpus records',
        verify: true
      },
      egyptian: {
        translit: 'wꜣḏ',
        script: '𓇅𓆓',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'wadj (modern convention)',
        note: 'green, fresh; the papyrus-stem sign with phonetic complement'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'purple',
    english: ['purple', 'purple wool'],
    hebrew: { word: 'אַרְגָּמָן', translit: 'argaman', root: 'ארגמנ' },
    forms: {
      akkadian: {
        translit: 'argamannu',
        pron: 'ar-ga-man-nu',
        note: 'purple wool; a parallel form of the same culture word, not a demonstrated ancestor'
      },
      aramaic: {
        translit: 'ʾargəwān',
        hebrewLetters: 'ארגון',
        note: 'with w where Hebrew has m; Daniel 5:7 אַרְגְּוָנָא (clothed in purple)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'crimson',
    english: ['crimson', 'scarlet'],
    hebrew: { word: 'שָׁנִי', translit: 'shani', root: 'שני', note: 'often in the phrase תּוֹלַעַת שָׁנִי, scarlet stuff (Exodus 25:4)' },
    forms: {
      // akkadian: deliberately empty; the Akkadian red-wool terms are not
      // securely tied to this word in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'blue',
    english: ['blue', 'blue-purple wool'],
    hebrew: { word: 'תְּכֵלֶת', translit: 'tekhelet', root: 'תכלת' },
    forms: {
      akkadian: {
        translit: 'takiltu',
        pron: 'ta-kil-tu',
        note: 'blue-purple wool; the standard parallel of the same culture word'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
