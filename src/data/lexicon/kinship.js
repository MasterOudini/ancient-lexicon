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
  },
  {
    id: 'daughter',
    english: ['daughter'],
    // BDB files בַּת under בן; the root chip therefore points to בנ.
    hebrew: { word: 'בַּת', translit: 'bat', root: 'בנ' },
    forms: {
      akkadian: {
        translit: 'mārtu',
        script: '𒌉𒊩',
        scriptNote: 'shown as the logogram DUMU.MUNUS, with which the word was commonly written',
        pron: 'maar-tu'
      },
      sumerian: {
        translit: 'dumu-munus',
        script: '𒌉𒊩',
        pron: 'doo-moo moo-noos'
      },
      egyptian: {
        translit: 'sꜣt',
        script: '𓅭𓏏𓁐',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sat (modern convention)'
      },
      hittite: {
        script: '𒌉𒊩',
        scriptNote: 'written logographically (DUMU.MUNUS); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'bərat',
        hebrewLetters: 'ברת',
        note: 'construct form (daughter of) in Elephantine filiation formulas; corresponds to Hebrew bat'
      },
      osa: {
        translit: 'bnt',
        tokens: ['b', 'n', 't'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'brother',
    english: ['brother'],
    hebrew: { word: 'אָח', translit: 'ach', root: 'אח' },
    forms: {
      akkadian: {
        translit: 'aḫu',
        script: '𒋀',
        scriptNote: 'shown as the logogram SHESH, with which the word was commonly written',
        pron: 'ah-khu',
        note: 'a separate Akkadian word aḫu means arm, side'
      },
      sumerian: {
        translit: 'šeš',
        script: '𒋀',
        pron: 'shesh'
      },
      egyptian: {
        translit: 'sn',
        script: '𓌢𓈖𓀀',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sen (modern convention)'
      },
      hittite: {
        script: '𒋀',
        scriptNote: 'written logographically (SHESH); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʾaḥ',
        hebrewLetters: 'אח',
        note: 'address form in Elephantine letters (אחי my brother, אחוך your brother)'
      },
      osa: {
        translit: 'ʾḫ',
        tokens: ["'", 'kh'],
        note: 'in personal names; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'sister',
    english: ['sister'],
    // אָחוֹת is filed with אח, the root of אָח brother (so BDB).
    hebrew: { word: 'אָחוֹת', translit: 'achot', root: 'אח' },
    forms: {
      akkadian: {
        translit: 'aḫātu',
        pron: 'ah-khaa-tu'
      },
      sumerian: {
        translit: 'nin9',
        script: '𒎐',
        pron: 'nin'
      },
      egyptian: {
        translit: 'snt',
        script: '𓌢𓈖𓏏𓁐',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'senet (modern convention)'
      },
      aramaic: {
        translit: 'ʾaḥāh',
        hebrewLetters: 'אחה',
        note: 'אחתי (my sister) as an address form in Aramaic letters; check exact citations against TAD',
        verify: true
      }
      // hittite: deliberately empty; sister is written with a Sumerogram
      // whose sign identity we have not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'man',
    english: ['man'],
    hebrew: { word: 'אִישׁ', translit: 'ish', root: 'איש' },
    forms: {
      akkadian: {
        translit: 'awīlu',
        script: '𒇽',
        scriptNote: 'shown as the logogram LU2, with which the word was commonly written',
        pron: 'ah-wee-lu'
      },
      sumerian: {
        translit: 'lu2',
        script: '𒇽',
        pron: 'lu'
      },
      egyptian: {
        translit: 's',
        script: '𓊃𓀀',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'se (modern convention)',
        note: 'also transliterated z (the older value of the bolt sign)'
      },
      hittite: {
        translit: 'antuḫšaš',
        pron: 'an-tuh-shash',
        note: 'man, human being; attested syllabically'
      },
      aramaic: {
        translit: 'gəbar',
        hebrewLetters: 'גבר',
        note: 'very common at Elephantine; Daniel 2:25 גְּבַר (a man)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'woman',
    english: ['woman', 'wife'],
    hebrew: { word: 'אִשָּׁה', translit: 'ishah', root: 'אשה' },
    forms: {
      akkadian: {
        translit: 'sinništu',
        script: '𒊩',
        scriptNote: 'shown as the logogram SAL (MUNUS), with which the word was commonly written',
        pron: 'sin-nish-tu'
      },
      sumerian: {
        translit: 'munus',
        script: '𒊩',
        pron: 'moo-noos'
      },
      egyptian: {
        translit: 'ḥmt',
        script: '𓈞𓏏𓁐',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'hemet (modern convention)',
        note: 'woman, wife'
      },
      hittite: {
        script: '𒊩',
        scriptNote: 'written logographically (MUNUS); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʾintāh',
        hebrewLetters: 'אנתה',
        note: 'Elephantine marriage documents (אנתתי my wife); vocalization is a modern convention'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'child',
    english: ['child', 'boy'],
    hebrew: { word: 'יֶלֶד', translit: 'yeled', root: 'ילד' },
    forms: {
      akkadian: {
        translit: 'ṣeḫru',
        script: '𒌉',
        scriptNote: 'shown as the logogram TUR, with which the word was commonly written',
        pron: 'tseh-khru',
        note: 'small, young; as a noun, child'
      },
      egyptian: {
        translit: 'ẖrd',
        script: '𓄡𓂋𓂧𓀔',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'khered (modern convention)'
      }
      // sumerian: deliberately empty; dumu (filed under son) doubles as child.
      // hittite: deliberately empty; child is covered by the DUMU logogram
      // filed under son.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'firstborn',
    english: ['firstborn'],
    hebrew: { word: 'בְּכוֹר', translit: 'bekhor', root: 'בכר' },
    forms: {
      akkadian: {
        translit: 'bukru',
        pron: 'buk-ru',
        note: 'son, firstborn; chiefly in literary texts'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; smsw (eldest) is a different word and its
      // spelling is not verified for this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'elder',
    english: ['elder', 'old man'],
    hebrew: { word: 'זָקֵן', translit: 'zaqen', root: 'זקנ' },
    forms: {
      akkadian: {
        translit: 'šību',
        pron: 'shee-bu',
        note: 'old man, elder; also witness'
      },
      hittite: {
        script: '𒋗𒄀',
        scriptNote: 'written logographically (SHU.GI, old); the native Hittite reading is not established',
        note: 'the logogram use should be checked against CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'śāb',
        hebrewLetters: 'שב',
        note: 'Ezra 5:5 שָׂבֵי יְהוּדָיֵא (the elders of the Jews)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'widow',
    english: ['widow'],
    hebrew: { word: 'אַלְמָנָה', translit: 'almanah', root: 'אלמנ' },
    forms: {
      akkadian: {
        translit: 'almattu',
        pron: 'al-mat-tu'
      },
      egyptian: {
        translit: 'ḫꜣrt',
        pron: 'kharet (modern convention)',
        note: 'attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ʾarmalāh',
        hebrewLetters: 'ארמלה',
        note: 'with r for the first l (compare Hebrew almanah, Akkadian almattu); attestation should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'servant',
    english: ['servant', 'slave'],
    hebrew: { word: 'עֶבֶד', translit: 'eved', root: 'עבד' },
    forms: {
      akkadian: {
        translit: 'ardu',
        script: '𒀴',
        scriptNote: 'shown as the logogram ARAD, with which the word was commonly written',
        pron: 'ar-du'
      },
      sumerian: {
        translit: 'arad',
        script: '𒀴',
        pron: 'ah-rad'
      },
      egyptian: {
        translit: 'bꜣk',
        script: '𓅡𓎡𓀀',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'bak (modern convention)',
        note: 'the dictionary spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        script: '𒀴',
        scriptNote: 'written logographically (ARAD); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʿăbēd',
        hebrewLetters: 'עבד',
        note: 'Daniel 6:21 עֲבֵד אֱלָהָא (servant of God); the your-servant formula is common in Elephantine letters'
      },
      osa: {
        translit: 'ʿbd',
        tokens: ['ayn', 'b', 'd'],
        note: 'in personal names; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'people',
    english: ['people'],
    hebrew: { word: 'עַם', translit: 'am', root: 'עמ' },
    forms: {
      akkadian: {
        translit: 'nišū',
        pron: 'nee-shoo',
        note: 'a plural noun (the people)'
      },
      egyptian: {
        translit: 'rmṯ',
        pron: 'remetch (modern convention)',
        note: 'people, mankind; spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'ʿam',
        hebrewLetters: 'עם',
        note: 'Daniel 3:29 כָּל־עַם (every people); plural עַמְמַיָּא Daniel 3:4'
      }
      // sumerian: deliberately empty; the usual word for people uses a sign
      // reading not verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'seed',
    english: ['seed', 'offspring'],
    hebrew: { word: 'זֶרַע', translit: 'zera', root: 'זרע' },
    forms: {
      akkadian: {
        translit: 'zēru',
        pron: 'zeh-ru',
        note: 'seed; also offspring'
      },
      egyptian: {
        translit: 'prt',
        pron: 'peret (modern convention)',
        note: 'fruit, seed; attestation should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'zəraʿ',
        hebrewLetters: 'זרע',
        note: 'Daniel 2:43 בִּזְרַע אֲנָשָׁא (with the seed of men)'
      }
      // sumerian: deliberately empty; the seed sign (NUMUN) is outside this
      // database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
