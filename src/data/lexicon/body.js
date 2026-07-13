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
  },
  {
    id: 'head',
    english: ['head'],
    hebrew: { word: 'רֹאשׁ', translit: 'rosh', root: 'ראש' },
    forms: {
      akkadian: {
        translit: 'rēšu',
        script: '𒊕',
        scriptNote: 'shown as the logogram SAG, with which the word was commonly written',
        pron: 'reh-shu',
        note: 'head, top; cognate with Hebrew rosh'
      },
      sumerian: {
        translit: 'sag',
        script: '𒊕',
        pron: 'sag'
      },
      egyptian: {
        translit: 'tp',
        script: '𓁶𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'tep (modern convention)'
      },
      aramaic: {
        translit: 'rēš',
        hebrewLetters: 'ראש',
        note: 'Daniel 2:32 רֵאשֵׁהּ (its head, of fine gold)'
      }
      // hittite: deliberately empty; head is usually written with the
      // Sumerogram SAG.DU, and the native Hittite word is not verified for
      // this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'eye',
    english: ['eye'],
    hebrew: { word: 'עַיִן', translit: 'ayin', root: 'עינ', note: 'also a spring of water — the same written word' },
    forms: {
      akkadian: {
        translit: 'īnu',
        script: '𒅆',
        scriptNote: 'shown as the logogram IGI, with which the word was commonly written',
        pron: 'ee-nu',
        note: 'cognate with Hebrew ayin'
      },
      sumerian: {
        translit: 'igi',
        script: '𒅆',
        pron: 'ee-gee'
      },
      egyptian: {
        translit: 'jrt',
        script: '𓁹𓏏𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'iret (modern convention)'
      },
      hittite: {
        translit: 'šākuwa',
        pron: 'shaa-ku-wa',
        note: 'eyes; attested syllabically'
      },
      aramaic: {
        translit: 'ʿayin',
        hebrewLetters: 'עין',
        note: 'Daniel 4:31 עַיְנַי (my eyes); Daniel 7:8 עַיְנִין (eyes)'
      },
      osa: {
        translit: 'ʿyn',
        tokens: ['ayn', 'y', 'n'],
        note: 'eye and spring; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'ear',
    english: ['ear'],
    hebrew: { word: 'אֹזֶן', translit: 'ozen', root: 'אזנ' },
    forms: {
      akkadian: {
        translit: 'uznu',
        script: '𒉿',
        scriptNote: 'shown as the logogram GESHTU2 (the sign PI), with which the word was commonly written',
        pron: 'uz-nu',
        note: 'cognate with Hebrew ozen; the logogram writing should be checked against CAD',
        verify: true
      },
      sumerian: {
        translit: 'geštug2',
        script: '𒉿',
        pron: 'gesh-toog',
        note: 'written with the sign PI read geshtug2; fuller compound writings also occur, so check against sign lists',
        verify: true
      },
      egyptian: {
        translit: 'msḏr',
        pron: 'mesedjer (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'ištaman-',
        pron: 'ish-ta-man',
        note: 'attested syllabically; stem cited as in the dictionaries; compare the verb ištamaš- (to hear)'
      },
      aramaic: {
        translit: 'ʾudn',
        hebrewLetters: 'אדן',
        note: 'with d where Hebrew has z (compare Hebrew ozen); attestation should be checked against TAD',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'mouth',
    english: ['mouth'],
    hebrew: { word: 'פֶּה', translit: 'peh', root: 'פה' },
    forms: {
      akkadian: {
        translit: 'pû',
        script: '𒅗',
        scriptNote: 'shown as the logogram KA, with which the word was commonly written',
        pron: 'poo'
      },
      sumerian: {
        translit: 'ka',
        script: '𒅗',
        pron: 'kah'
      },
      egyptian: {
        translit: 'r',
        script: '𓂋𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'er (modern convention)'
      },
      aramaic: {
        translit: 'pum',
        hebrewLetters: 'פם',
        note: 'with m where Hebrew has h; Daniel 6:23 פֻּם אַרְיָוָתָא (the mouth of the lions); Daniel 7:8 וּפֻם מְמַלִּל רַבְרְבָן'
      }
      // hittite: deliberately empty; the Hittite word for mouth (aish) is
      // attested but not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tongue',
    english: ['tongue', 'language'],
    hebrew: { word: 'לָשׁוֹן', translit: 'lashon', root: 'לשנ' },
    forms: {
      akkadian: {
        translit: 'lišānu',
        script: '𒅴',
        scriptNote: 'shown as the logogram EME, with which the word was commonly written',
        pron: 'lee-shaa-nu',
        note: 'tongue, language; cognate with Hebrew lashon'
      },
      sumerian: {
        translit: 'eme',
        script: '𒅴',
        pron: 'eh-meh',
        note: 'written with the compound sign KA times ME'
      },
      egyptian: {
        translit: 'ns',
        script: '𓄓𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'nes (modern convention)'
      },
      aramaic: {
        translit: 'liššān',
        hebrewLetters: 'לשן',
        note: 'tongue, language; Daniel 3:4 וְלִשָּׁנַיָּא (and the languages)'
      }
      // hittite: deliberately empty; tongue is usually written with the
      // Sumerogram EME, and the native Hittite word is not verified for this
      // database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tooth',
    english: ['tooth'],
    hebrew: { word: 'שֵׁן', translit: 'shen', root: 'שנ' },
    forms: {
      akkadian: {
        translit: 'šinnu',
        pron: 'shin-nu',
        note: 'cognate with Hebrew shen'
      },
      sumerian: {
        translit: 'zu2',
        script: '𒅗',
        pron: 'zoo',
        note: 'written with the sign KA read zu2; the sign identification should be checked against sign lists',
        verify: true
      },
      egyptian: {
        translit: 'jbḥ',
        pron: 'ibeh (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'šēn',
        hebrewLetters: 'שן',
        note: 'Daniel 7:7 שִׁנַּיִן דִּי־פַרְזֶל (teeth of iron)'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'nose',
    english: ['nose'],
    hebrew: { word: 'אַף', translit: 'af', root: 'אנפ', note: 'also anger; dual אַפַּיִם nostrils, face' },
    forms: {
      akkadian: {
        translit: 'appu',
        pron: 'ap-pu',
        note: 'nose, tip; cognate with Hebrew af'
      },
      egyptian: {
        translit: 'fnḏ',
        pron: 'fenedj (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'ʾanap',
        hebrewLetters: 'אנף',
        note: 'face; the Aramaic noun keeps the n of the root; Daniel 2:46 נְפַל עַל־אַנְפּוֹהִי (fell on his face)'
      }
      // sumerian: deliberately empty; nose is written with a reading of the
      // sign KA that is not verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'foot',
    english: ['foot'],
    hebrew: { word: 'רֶגֶל', translit: 'regel', root: 'רגל' },
    forms: {
      akkadian: {
        translit: 'šēpu',
        script: '𒄊',
        scriptNote: 'shown as the logogram GIR3, with which the word was commonly written',
        pron: 'sheh-pu'
      },
      sumerian: {
        translit: 'giri3',
        script: '𒄊',
        pron: 'gih-ree'
      },
      egyptian: {
        translit: 'rd',
        pron: 'red (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'rəgal',
        hebrewLetters: 'רגל',
        note: 'Daniel 2:33 רַגְלוֹהִי (its feet, part iron and part clay)'
      }
      // hittite: deliberately empty; foot is usually written with the
      // Sumerogram GIR3, and the native Hittite word is not verified for this
      // database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'arm',
    english: ['arm'],
    // BDB files זְרוֹעַ as a homograph under the same consonants as זרע seed;
    // the root chip therefore points to זרע, defined with the kinship set.
    hebrew: { word: 'זְרוֹעַ', translit: 'zeroa', root: 'זרע' },
    forms: {
      akkadian: {
        translit: 'aḫu',
        pron: 'ah-khu',
        note: 'arm, side; a separate Akkadian word aḫu means brother'
      },
      egyptian: {
        translit: 'ꜥ',
        script: '𓂝𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'a (modern convention)',
        note: 'arm, hand'
      },
      aramaic: {
        translit: 'dərāʿ',
        hebrewLetters: 'דרע',
        note: 'with d where Hebrew has z (compare Hebrew zeroa); Daniel 2:32 וּדְרָעוֹהִי דִּי כְסַף (and its arms of silver)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'blood',
    english: ['blood'],
    hebrew: { word: 'דָּם', translit: 'dam', root: 'דמ' },
    forms: {
      akkadian: {
        translit: 'dāmu',
        pron: 'daa-mu',
        note: 'cognate with Hebrew dam'
      },
      egyptian: {
        translit: 'snf',
        pron: 'senef (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'ēšḫar',
        pron: 'esh-har',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'dam',
        hebrewLetters: 'דם',
        note: 'the common Aramaic word; attestation in Imperial Aramaic documents should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; blood (uš2) is written with a sign whose
      // identity is not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'bone',
    english: ['bone'],
    hebrew: { word: 'עֶצֶם', translit: 'etsem', root: 'עצמ' },
    forms: {
      akkadian: {
        translit: 'eṣemtu',
        pron: 'eh-tsem-tu',
        note: 'cognate with Hebrew etsem'
      },
      egyptian: {
        translit: 'qs',
        pron: 'qes (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'ḫaštai-',
        pron: 'hash-ta-i',
        note: 'attested syllabically; the citation form should be checked against CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'gəram',
        hebrewLetters: 'גרם',
        note: 'a different noun from Hebrew etsem; Daniel 6:25 וְכָל־גַּרְמֵיהוֹן הַדִּקוּ (and crushed all their bones)'
      }
      // sumerian: deliberately empty; the usual writing is a compound whose
      // signs are not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'flesh',
    english: ['flesh'],
    hebrew: { word: 'בָּשָׂר', translit: 'basar', root: 'בשר' },
    forms: {
      akkadian: {
        translit: 'šīru',
        script: '𒍜',
        scriptNote: 'shown as the logogram UZU, with which the word was commonly written',
        pron: 'shee-ru',
        note: 'flesh, meat; not the cognate of basar'
      },
      sumerian: {
        translit: 'uzu',
        script: '𒍜',
        pron: 'oo-zoo'
      },
      egyptian: {
        translit: 'jwf',
        pron: 'iuef (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'bəśar',
        hebrewLetters: 'בשר',
        note: 'Daniel 7:5 אֲכֻלִי בְּשַׂר שַׂגִּיא (devour much flesh)'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'skin',
    english: ['skin', 'hide'],
    hebrew: { word: 'עוֹר', translit: 'or', root: 'עור' },
    forms: {
      akkadian: {
        translit: 'mašku',
        pron: 'mash-ku'
      },
      sumerian: {
        translit: 'kuš',
        script: '𒋢',
        pron: 'koosh',
        note: 'skin, leather; written with the sign SU; the sign identification should be checked against sign lists',
        verify: true
      },
      egyptian: {
        translit: 'jnm',
        pron: 'inem (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'horn',
    english: ['horn'],
    hebrew: { word: 'קֶרֶן', translit: 'qeren', root: 'קרנ', note: 'also a ray of light (Exodus 34:29 קָרַן)' },
    forms: {
      akkadian: {
        translit: 'qarnu',
        script: '𒋛',
        scriptNote: 'shown as the logogram SI, with which the word was commonly written',
        pron: 'kar-nu',
        note: 'cognate with Hebrew qeren'
      },
      sumerian: {
        translit: 'si',
        script: '𒋛',
        pron: 'see'
      },
      egyptian: {
        translit: 'ꜥb',
        pron: 'ab (modern convention)',
        note: 'attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'qeren',
        hebrewLetters: 'קרן',
        note: 'Daniel 7:7 וְקַרְנַיִן עֲשַׂר לַהּ (and it had ten horns); also the musical horn, Daniel 3:5 קַרְנָא'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wing',
    english: ['wing'],
    hebrew: { word: 'כָּנָף', translit: 'kanaf', root: 'כנפ', note: 'also corner, extremity (of a garment, of the earth)' },
    forms: {
      akkadian: {
        translit: 'kappu',
        pron: 'kap-pu',
        note: 'wing (of a bird)'
      },
      egyptian: {
        translit: 'ḏnḥ',
        pron: 'djeneh (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'gap',
        hebrewLetters: 'גף',
        note: 'a different noun from Hebrew kanaf; Daniel 7:4 וְגַפִּין דִּי־נְשַׁר (wings of an eagle)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'belly',
    english: ['belly', 'womb'],
    hebrew: { word: 'בֶּטֶן', translit: 'beten', root: 'בטנ' },
    forms: {
      akkadian: {
        translit: 'karšu',
        pron: 'kar-shu',
        note: 'stomach, belly; also mind; not the cognate of beten'
      },
      egyptian: {
        translit: 'ẖt',
        script: '𓄡𓏏𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'khet (modern convention)',
        note: 'belly, body'
      },
      aramaic: {
        translit: 'məʿēh',
        hebrewLetters: 'מעה',
        note: 'a different noun from Hebrew beten; only the plural is attested in biblical Aramaic: Daniel 2:32 מְעוֹהִי (its belly)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'knee',
    english: ['knee'],
    hebrew: { word: 'בֶּרֶךְ', translit: 'berekh', root: 'ברכ' },
    forms: {
      akkadian: {
        translit: 'birku',
        pron: 'bir-ku',
        note: 'cognate with Hebrew berekh'
      },
      hittite: {
        translit: 'genu',
        pron: 'geh-nu',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'berek',
        hebrewLetters: 'ברך',
        note: 'Daniel 6:11 בָּרֵךְ עַל־בִּרְכוֹהִי (kneeling upon his knees)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; the word for knee is not verified for
      // this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'hair',
    english: ['hair'],
    hebrew: { word: 'שֵׂעָר', translit: 'sear', root: 'שער', note: 'the same consonants also write שַׁעַר gate and שְׂעֹרָה barley' },
    forms: {
      akkadian: {
        translit: 'šārtu',
        pron: 'shaar-tu',
        note: 'hair of the body and head; cognate with Hebrew sear'
      },
      aramaic: {
        translit: 'śəʿar',
        hebrewLetters: 'שער',
        note: 'Daniel 7:9 וּשְׂעַר רֵאשֵׁהּ כַּעֲמַר נְקֵא (the hair of his head like pure wool)'
      }
      // sumerian: deliberately empty; siki (wool) also covers hair, but that
      // use is not verified for this database.
      // egyptian: deliberately empty; the word for hair is not verified for
      // this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
