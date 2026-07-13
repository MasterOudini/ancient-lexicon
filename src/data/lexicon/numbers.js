// Numbers entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.
//
// Language notes for this category:
//   - Akkadian number words are established dictionary forms, but the texts
//     usually write numerals; no cuneiform is shown for them here.
//   - Sumerian numeral readings come from the later lexical tradition.
//   - Hittite numbers were written with number signs and the native readings
//     are mostly unknown, so hittite slots are deliberately empty throughout;
//     only a discussed reading for three appears, flagged for verification.
//   - Egyptian texts usually write numerals (stroke signs); the number words
//     given here are the dictionary forms.

export const NUMBERS = [
  {
    id: 'one',
    english: ['one'],
    hebrew: { word: 'אֶחָד', translit: 'echad', root: 'אחד' },
    forms: {
      akkadian: {
        translit: 'ištēn',
        scriptNote: 'usually written with number signs',
        pron: 'ish-tayn'
      },
      sumerian: {
        translit: 'diš',
        note: 'numeral; reading from the lexical tradition'
      },
      egyptian: {
        translit: 'wꜥ',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'ḥad',
        hebrewLetters: 'חד',
        note: 'Daniel 2:31 צְלֵם חַד (a single image)'
      },
      osa: {
        translit: 'ʾḥd',
        tokens: ["'", 'hh', 'd'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'two',
    english: ['two'],
    hebrew: {
      word: 'שְׁנַיִם',
      translit: 'shnayim',
      root: 'שנה',
      note: 'conventionally filed with שנה; see the root note'
    },
    forms: {
      akkadian: {
        translit: 'šina',
        scriptNote: 'usually written with number signs',
        pron: 'shi-na'
      },
      sumerian: {
        translit: 'min',
        note: 'numeral; reading from the lexical tradition'
      },
      egyptian: {
        translit: 'snwj',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'tərēn',
        hebrewLetters: 'תרין',
        note: 'Biblical Aramaic attests only the feminine תַּרְתֵּין (Daniel 6:1) and תְּרֵי־ in twelve; the masculine form shown is the dictionary form',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'three',
    english: ['three'],
    hebrew: { word: 'שָׁלוֹשׁ', translit: 'shalosh', root: 'שלש' },
    forms: {
      akkadian: {
        translit: 'šalāš',
        scriptNote: 'usually written with number signs',
        pron: 'sha-lash'
      },
      sumerian: {
        translit: 'eš',
        note: 'numeral; reading from the lexical tradition',
        verify: true
      },
      egyptian: {
        translit: 'ḫmt',
        note: 'texts usually write the numeral with strokes'
      },
      hittite: {
        translit: 'teri-',
        note: 'a native reading discussed for the numeral three, which is otherwise written with number signs; check reference literature',
        verify: true
      },
      aramaic: {
        translit: 'təlāt',
        hebrewLetters: 'תלת',
        note: 'Daniel 6:11 זִמְנִין תְּלָתָה (three times a day)'
      },
      osa: {
        translit: 's2lṯ',
        tokens: ['s2', 'l', 'th'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'four',
    english: ['four'],
    hebrew: { word: 'אַרְבַּע', translit: 'arba', root: 'רבע' },
    forms: {
      akkadian: {
        translit: 'erbe',
        scriptNote: 'usually written with number signs',
        pron: 'er-be'
      },
      sumerian: {
        translit: 'limmu',
        note: 'numeral; reading from the lexical tradition'
      },
      egyptian: {
        translit: 'jfdw',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'ʾarbaʿ',
        hebrewLetters: 'ארבע',
        note: 'Daniel 7:2 אַרְבַּע רוּחֵי שְׁמַיָּא (the four winds of heaven)'
      },
      osa: {
        translit: 'ʾrbʿ',
        tokens: ["'", 'r', 'b', 'ayn'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'five',
    english: ['five'],
    hebrew: { word: 'חָמֵשׁ', translit: 'chamesh', root: 'חמש' },
    forms: {
      akkadian: {
        translit: 'ḫamiš',
        scriptNote: 'usually written with number signs',
        pron: 'kha-mish'
      },
      sumerian: {
        translit: 'ia',
        note: 'numeral; reading from the lexical tradition',
        verify: true
      },
      egyptian: {
        translit: 'djw',
        note: 'texts usually write the numeral with strokes'
      },
      osa: {
        translit: 'ḫms1',
        tokens: ['kh', 'm', 's1'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // aramaic: deliberately empty; not securely attested in Biblical Aramaic.
    }
  },
  {
    id: 'six',
    english: ['six'],
    hebrew: { word: 'שֵׁשׁ', translit: 'shesh', root: 'שש' },
    forms: {
      akkadian: {
        translit: 'šediš',
        scriptNote: 'usually written with number signs',
        pron: 'she-dish'
      },
      sumerian: {
        translit: 'aš',
        note: 'numeral; reading from the lexical tradition',
        verify: true
      },
      egyptian: {
        translit: 'sjsw',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'šēt',
        hebrewLetters: 'שת',
        note: 'Ezra 6:15 שְׁנַת שֵׁת (the sixth year of Darius)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'seven',
    english: ['seven'],
    hebrew: { word: 'שֶׁבַע', translit: 'sheva', root: 'שבע' },
    forms: {
      akkadian: {
        translit: 'sebe',
        scriptNote: 'usually written with number signs',
        pron: 'se-be'
      },
      sumerian: {
        translit: 'imin',
        note: 'numeral; reading from the lexical tradition'
      },
      egyptian: {
        translit: 'sfḫw',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'šəbaʿ',
        hebrewLetters: 'שבע',
        note: 'Ezra 7:14 שִׁבְעַת יָעֲטֹהִי (his seven counselors)'
      },
      osa: {
        translit: 's1bʿ',
        tokens: ['s1', 'b', 'ayn'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'eight',
    english: ['eight'],
    hebrew: { word: 'שְׁמֹנֶה', translit: 'shmoneh', root: 'שמנ' },
    forms: {
      akkadian: {
        translit: 'samāne',
        scriptNote: 'usually written with number signs',
        pron: 'sa-maa-ne'
      },
      sumerian: {
        translit: 'ussu',
        note: 'numeral; reading from the lexical tradition',
        verify: true
      },
      egyptian: {
        translit: 'ḫmnw',
        note: 'texts usually write the numeral with strokes'
      }
      // aramaic: deliberately empty; not securely attested in Biblical Aramaic.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'nine',
    english: ['nine'],
    hebrew: { word: 'תֵּשַׁע', translit: 'tesha', root: 'תשע' },
    forms: {
      akkadian: {
        translit: 'tiše',
        scriptNote: 'usually written with number signs',
        pron: 'ti-she'
      },
      sumerian: {
        translit: 'ilimmu',
        note: 'numeral; reading from the lexical tradition',
        verify: true
      },
      egyptian: {
        translit: 'psḏw',
        note: 'texts usually write the numeral with strokes'
      }
      // aramaic: deliberately empty; not securely attested in Biblical Aramaic.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'ten',
    english: ['ten'],
    hebrew: { word: 'עֶשֶׂר', translit: 'eser', root: 'עשר' },
    forms: {
      akkadian: {
        translit: 'ešer',
        scriptNote: 'usually written with number signs',
        pron: 'e-sher'
      },
      sumerian: {
        translit: 'u',
        note: 'numeral; reading from the lexical tradition'
      },
      egyptian: {
        translit: 'mḏw',
        note: 'texts usually write the numeral with strokes'
      },
      aramaic: {
        translit: 'ʿăśar',
        hebrewLetters: 'עשר',
        note: 'Daniel 7:7 וְקַרְנַיִן עֲשַׂר לַהּ (and it had ten horns)'
      },
      osa: {
        translit: 'ʿs2r',
        tokens: ['ayn', 's2', 'r'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  }
]
