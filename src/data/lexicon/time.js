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
        note: 'Daniel 6:11 בְיוֹמָא; Ezra 6:9'
      },
      osa: {
        translit: 'ywm',
        tokens: ['y', 'w', 'm'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'night',
    english: ['night'],
    hebrew: { word: 'לַיְלָה', translit: 'lailah', root: 'ליל' },
    forms: {
      akkadian: {
        translit: 'mūšu',
        script: '𒈪',
        scriptNote: 'shown as the logogram GE6 (MI), with which the word was commonly written',
        pron: 'moo-shu'
      },
      sumerian: {
        translit: 'ge6',
        script: '𒈪',
        pron: 'geh',
        note: 'written with the sign MI'
      },
      egyptian: {
        translit: 'grḥ',
        pron: 'gereh (modern convention)'
      },
      hittite: {
        translit: 'išpant-',
        pron: 'ish-pant',
        note: 'stem; attested syllabically'
      },
      aramaic: {
        translit: 'lēlyā',
        hebrewLetters: 'ליליא',
        note: 'the night (emphatic form); Daniel 2:19 לֵילְיָא'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'morning',
    english: ['morning'],
    hebrew: { word: 'בֹּקֶר', translit: 'boqer', root: 'בקר' },
    forms: {
      akkadian: {
        translit: 'šēru',
        pron: 'shay-ru'
      },
      egyptian: {
        translit: 'dwꜣw',
        pron: 'duau (modern convention)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'evening',
    english: ['evening'],
    hebrew: { word: 'עֶרֶב', translit: 'erev', root: 'ערב' },
    forms: {
      akkadian: {
        translit: 'lilâtu',
        pron: 'lee-laa-tu',
        note: 'evening; attestation should be checked against corpus records (CAD)',
        verify: true
      },
      egyptian: {
        translit: 'mšrw',
        pron: 'mesheru (modern convention)',
        note: 'evening; attestation should be checked against corpus records (Wb.)',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'month',
    english: ['month', 'new moon'],
    hebrew: { word: 'חֹדֶשׁ', translit: 'chodesh', root: 'חדש' },
    forms: {
      akkadian: {
        translit: 'arḫu',
        script: '𒌗',
        scriptNote: 'shown as the logogram ITI, with which the word was commonly written',
        pron: 'ar-khu'
      },
      sumerian: {
        translit: 'iti',
        script: '𒌗',
        pron: 'ih-tee'
      },
      egyptian: {
        translit: 'ꜣbd',
        pron: 'abed (modern convention)'
      },
      aramaic: {
        translit: 'yəraḥ',
        hebrewLetters: 'ירח',
        note: 'Ezra 6:15 לִירַח אֲדָר (the month Adar); also in Egyptian Aramaic documents (check TAD)'
      },
      osa: {
        translit: 'wrḫ',
        tokens: ['w', 'r', 'kh'],
        note: 'month in Sabaic date formulae; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'year',
    english: ['year'],
    hebrew: { word: 'שָׁנָה', translit: 'shanah', root: 'שנה' },
    forms: {
      akkadian: {
        translit: 'šattu',
        script: '𒈬',
        scriptNote: 'shown as the logogram MU, with which the word was commonly written',
        pron: 'shat-tu'
      },
      sumerian: {
        translit: 'mu',
        script: '𒈬',
        pron: 'moo',
        note: 'the same word and sign also write mu, name'
      },
      egyptian: {
        translit: 'rnpt',
        script: '𓆳𓏏𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'renpet (modern convention)'
      },
      hittite: {
        translit: 'witt-',
        note: 'stem; year is usually written logographically (MU); syllabic spellings should be checked (Kloekhorst, EDHIL)',
        verify: true
      },
      aramaic: {
        translit: 'šənāh',
        hebrewLetters: 'שנה',
        note: 'Ezra 5:11 שְׁנִין (years); Elephantine date formulae (שנת, in the year of)'
      },
      osa: {
        translit: 'ḫrf',
        tokens: ['kh', 'r', 'f'],
        note: 'year in Sabaic date formulae; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'week',
    english: ['week'],
    hebrew: { word: 'שָׁבוּעַ', translit: 'shavua', root: 'שבע' },
    forms: {
      // All slots deliberately empty: the seven-day week is not a lexical
      // unit in the other languages in this database; absence is information.
    }
  },
  {
    id: 'sabbath',
    english: ['sabbath'],
    hebrew: { word: 'שַׁבָּת', translit: 'shabbat', root: 'שבת' },
    forms: {
      aramaic: {
        translit: 'šabbətā',
        hebrewLetters: 'שבתא',
        note: 'the sabbath (emphatic form); mentions of the sabbath in Aramaic ostraca from Elephantine should be checked against corpus records (TAD D7)',
        verify: true
      }
      // akkadian: deliberately empty; Akkadian šapattu, the mid-month day,
      // is a discussed comparison, not an attested word for the sabbath.
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'season',
    english: ['season', 'appointed time'],
    hebrew: { word: 'מוֹעֵד', translit: 'moed', root: 'יעד' },
    forms: {
      akkadian: {
        translit: 'adannu',
        pron: 'a-dan-nu',
        note: 'appointed time, fixed date'
      },
      egyptian: {
        translit: 'tr',
        pron: 'ter (modern convention)',
        note: 'time, season; attestation should be checked against corpus records (Wb.)',
        verify: true
      },
      aramaic: {
        translit: 'zəman',
        hebrewLetters: 'זמן',
        note: 'time, appointed time; Daniel 2:16 זְמָן'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'eternity',
    english: ['eternity', 'long duration'],
    hebrew: { word: 'עוֹלָם', translit: 'olam', root: 'עלמ' },
    forms: {
      akkadian: {
        translit: 'dārû',
        pron: 'daa-roo',
        note: 'lasting, everlasting (an adjective; a functional equivalent, not a noun for eternity)'
      },
      egyptian: {
        translit: 'nḥḥ',
        pron: 'neheh (modern convention)',
        note: 'paired in Egyptian usage with ḏt, the other word for eternity'
      },
      aramaic: {
        translit: 'ʿāləmā',
        hebrewLetters: 'עלמא',
        note: 'Daniel 2:20 מִן־עָלְמָא וְעַד־עָלְמָא (from eternity to eternity; emphatic form)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
