// Seed lexicon: seventeen concepts across Hebrew/English and six ancient
// languages.
//
// Entry shape:
//   {
//     id      - stable unique id
//     english - array of English glosses (first gloss is the display name)
//     hebrew  - { word (with Masoretic niqqud), translit, root (NON-final
//                 letters, matching src/data/roots.js), note? }
//     forms   - per-language forms keyed by language id from languages.js:
//               { translit?, script?, scriptNote?, pron?, note?, verify?,
//                 hebrewLetters?, tokens? }
//   }
//
// Conventions used in this file:
//   - verify: true means the rendering or attestation is conventional or
//     uncertain and must be checked against corpus records (CAD, Wb., TAD,
//     DASI/CSAI, museum catalogues) before scholarly use. The UI shows a
//     "verify against corpus" tag on such forms.
//   - Akkadian and Sumerian cuneiform is given as the logogram with which
//     the word was commonly written; the transliteration is the normalized
//     dictionary form.
//   - aramaic forms give hebrewLetters (square script); the app renders the
//     Imperial Aramaic glyphs automatically from the letter map. osa forms
//     give tokens (consonant token array) rendered automatically to Musnad.
//     Other scripts store the glyph string directly in script.
//   - No reconstructed proto-forms appear anywhere in this file; every form
//     is an attested word, a dictionary normalization, or a labeled modern
//     convention.
//   - A missing language form is intentional: it means no attested or
//     securely conventional form belongs in the database. The UI shows
//     "not in database" for such slots; absence is information.

export const LEXICON = [
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
    id: 'water',
    english: ['water'],
    hebrew: { word: 'מַיִם', translit: 'mayim', root: 'מימ' },
    forms: {
      akkadian: {
        translit: 'mû',
        script: '𒀀',
        scriptNote: 'shown as the logogram A, with which the word was commonly written',
        pron: 'moo'
      },
      sumerian: {
        translit: 'a',
        script: '𒀀',
        pron: 'ah'
      },
      egyptian: {
        translit: 'mw',
        script: '𓈗',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'mu (modern convention)'
      },
      hittite: {
        translit: 'wātar',
        script: '𒉿𒀀𒋻',
        scriptNote: 'syllabic spelling wa-a-tar',
        pron: 'wah-tar',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'mayin',
        hebrewLetters: 'מין',
        note: 'the exact attested form should be checked against the Elephantine corpus (TAD)',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sun',
    english: ['sun'],
    hebrew: { word: 'שֶׁמֶשׁ', translit: 'shemesh', root: 'שמש' },
    forms: {
      akkadian: {
        translit: 'šamšu',
        script: '𒌓',
        scriptNote: 'shown as the logogram UD (UTU), with which the word was commonly written',
        pron: 'sham-shu'
      },
      sumerian: {
        translit: 'utu',
        script: '𒌓',
        pron: 'oo-too',
        note: 'the sign UD, read utu for the sun'
      },
      egyptian: {
        translit: 'rꜥ',
        script: '𓂋𓂝𓇳',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ra (modern convention)'
      },
      hittite: {
        translit: 'Ištanu-',
        script: '𒌓',
        scriptNote: 'commonly written with the logogram UTU',
        note: 'the native reading Ištanu- should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'šimšā',
        hebrewLetters: 'שמשא',
        note: 'Daniel 6:15 שִׁמְשָׁא'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
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
  },
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
  },
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
  },
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
  },
  {
    id: 'great',
    english: ['great', 'big', 'large'],
    hebrew: { word: 'גָּדוֹל', translit: 'gadol', root: 'גדל' },
    forms: {
      akkadian: {
        translit: 'rabû',
        script: '𒃲',
        scriptNote: 'shown as the logogram GAL, with which the word was commonly written',
        pron: 'ra-boo'
      },
      sumerian: {
        translit: 'gal',
        script: '𒃲',
        pron: 'gal'
      },
      egyptian: {
        translit: 'wr / ꜥꜣ',
        script: '𓅨𓂋',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'wer; aa (modern convention)',
        note: 'wr is shown; ꜥꜣ 𓉻 is also attested for great'
      },
      hittite: {
        translit: 'šalliš',
        pron: 'shal-lish',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'rab',
        hebrewLetters: 'רב',
        note: 'Daniel 2:35 טוּר רַב (a great mountain); a different word from Hebrew גָּדוֹל'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
