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
  },
  {
    id: 'covenant',
    english: ['covenant'],
    hebrew: {
      word: 'בְּרִית',
      translit: 'brit',
      root: 'ברית',
      note: 'the covenant idiom is כָּרַת בְּרִית, to cut a covenant (Genesis 15:18)'
    },
    forms: {
      akkadian: {
        translit: 'riksu',
        pron: 'rik-su',
        note: 'bond, treaty, from rakāsu (to bind); with adê (treaty obligations, loyalty oath) a functional equivalent of בְּרִית, not a cognate'
      },
      hittite: {
        translit: 'išḫiul',
        pron: 'ish-khee-ool',
        note: 'treaty, obligation, from išḫiya- (to bind); the functional equivalent of covenant, not a cognate; attested syllabically'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sacrifice',
    english: ['sacrifice'],
    hebrew: { word: 'זֶבַח', translit: 'zevach', root: 'זבח' },
    forms: {
      akkadian: {
        translit: 'nīqû',
        pron: 'nee-koo',
        note: 'offering, sacrifice, from naqû (to pour out, offer); the functional equivalent, not a cognate of זֶבַח'
      },
      aramaic: {
        translit: 'dəbaḥ',
        hebrewLetters: 'דבח',
        note: 'Ezra 6:3 דִּבְחִין (sacrifices); with d where Hebrew has z, as in דהב gold beside Hebrew זהב'
      },
      osa: {
        translit: 'ḏbḥ',
        tokens: ['dh', 'b', 'hh'],
        note: 'sacrifice; the root is attested in Sabaic inscriptions'
      }
      // sumerian: deliberately empty; the offering logogram (SISKUR) uses a
      // sign identity not verified for this database.
      // egyptian: deliberately empty; no single equivalent is securely
      // conventional for this database.
      // hittite: deliberately empty; sacrifice is written with the SISKUR
      // logogram, whose sign identity is not verified for this database.
    }
  },
  {
    id: 'altar',
    english: ['altar'],
    // מִזְבֵּחַ is the noun of place from זבח; the root chip points to זבח
    // (see sacrifice).
    hebrew: { word: 'מִזְבֵּחַ', translit: 'mizbeach', root: 'זבח' },
    forms: {
      aramaic: {
        translit: 'madbəḥā',
        hebrewLetters: 'מדבח',
        note: 'Ezra 7:17 מַדְבְּחָה (the altar of the house of your God); with d where Hebrew has z'
      }
      // akkadian: deliberately empty; no single equivalent altar word is
      // securely conventional for this database.
      // egyptian: deliberately empty; the altar words have spellings not
      // verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'priest',
    english: ['priest'],
    hebrew: { word: 'כֹּהֵן', translit: 'kohen', root: 'כהנ' },
    forms: {
      akkadian: {
        translit: 'šangû',
        script: '𒋃',
        scriptNote: 'shown as the logogram SANGA (the sign SHID), with which the word was commonly written',
        pron: 'shan-goo',
        note: 'temple administrator, priest; a loanword from Sumerian sanga and a functional equivalent of כֹּהֵן, not a cognate'
      },
      sumerian: {
        translit: 'sanga',
        script: '𒋃',
        pron: 'san-ga',
        note: 'temple administrator, one of several Sumerian priestly titles; written with the sign SHID'
      },
      egyptian: {
        translit: 'ḥm-nṯr',
        script: '𓊹𓍛',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'hem-netjer (modern convention)',
        note: 'literally servant of the god; the god sign is written first by honorific transposition and the title is read ḥm-nṯr'
      },
      hittite: {
        script: '𒋃',
        scriptNote: 'written logographically (SANGA); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'kāhēn',
        hebrewLetters: 'כהן',
        note: 'the priests (כָּהֲנַיָּא) appear in the Aramaic of Ezra; the Elephantine petitions concern the priests of YHW at Elephantine'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'prophet',
    english: ['prophet'],
    hebrew: { word: 'נָבִיא', translit: 'navi', root: 'נבא' },
    forms: {
      aramaic: {
        translit: 'nəbiyyā',
        hebrewLetters: 'נביא',
        note: 'Ezra 5:1, Haggai the prophet prophesying to the Jews'
      }
      // akkadian: deliberately empty; Akkadian prophecy uses several technical
      // terms (apilu, muhhu) with no single equivalent in this database.
      // egyptian: deliberately empty; the older Egyptological rendering
      // prophet for the title hm-ntr is filed under priest.
    }
  },
  {
    id: 'law',
    english: ['law', 'instruction'],
    // תּוֹרָה is filed under ירה, whose hiphil הוֹרָה means direct, instruct
    // (so BDB).
    hebrew: { word: 'תּוֹרָה', translit: 'torah', root: 'ירה' },
    forms: {
      akkadian: {
        translit: 'dīnu',
        pron: 'dee-nu',
        note: 'law case, judgment, law; a functional equivalent, not a cognate of תּוֹרָה (the laws of Hammurapi are called dīnāt mīšarim, just decisions)'
      },
      egyptian: {
        translit: 'hp',
        pron: 'hep (modern convention)',
        note: 'law, custom; attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'dāt',
        hebrewLetters: 'דת',
        note: 'law, decree — a loanword from Old Persian, not a cognate of תּוֹרָה; Daniel 2:13 דָתָא (the decree went out)'
      }
    }
  },
  {
    id: 'temple',
    english: ['temple', 'sanctuary'],
    hebrew: { word: 'מִקְדָּשׁ', translit: 'miqdash', root: 'קדש' },
    forms: {
      egyptian: {
        translit: 'ḥwt-nṯr',
        script: '𓊹𓉗',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'hut-netjer (modern convention)',
        note: 'literally mansion of the god; the god sign is written first by honorific transposition; the sign order should be checked against Wb.',
        verify: true
      }
      // akkadian: deliberately empty; the temple is ordinarily the house
      // (bitu) of the god, filed under house.
      // sumerian: deliberately empty; the temple is the house (e2) of the
      // god, filed under house.
      // aramaic: deliberately empty; the Aramaic היכלא (temple, palace) is
      // filed under palace.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'throne',
    english: ['throne'],
    hebrew: { word: 'כִּסֵּא', translit: 'kisse', root: 'כסא' },
    forms: {
      akkadian: {
        translit: 'kussû',
        script: '𒄖𒍝',
        scriptNote: 'shown as the logogram GU.ZA, with which the word was commonly written',
        pron: 'kus-soo',
        note: 'throne, chair; a loanword from Sumerian gu-za; Hebrew כִּסֵּא belongs to the same loan history'
      },
      sumerian: {
        translit: 'gu-za',
        script: '𒄖𒍝',
        pron: 'goo-za'
      },
      egyptian: {
        translit: 'st',
        script: '𓊨𓏏',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'set (modern convention)',
        note: 'seat, throne, place; attestation and spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        script: '𒄖𒍝',
        scriptNote: 'written logographically (GU.ZA, usually with the wood determinative); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'korsēʾ',
        hebrewLetters: 'כרסא',
        note: 'Daniel 7:9 כָרְסָוָן רְמִיו (thrones were set in place); with r before the s where Hebrew has כִּסֵּא'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'war',
    english: ['war', 'battle'],
    // מִלְחָמָה is filed under לחמ, whose gloss covers both attested word
    // groups, bread and fight.
    hebrew: { word: 'מִלְחָמָה', translit: 'milchamah', root: 'לחמ' },
    forms: {
      akkadian: {
        translit: 'tāḫāzu',
        pron: 'taa-khaa-zu',
        note: 'battle; the functional equivalent, not a cognate of מִלְחָמָה'
      },
      egyptian: {
        translit: 'ꜥḥꜣ',
        pron: 'aha (modern convention)',
        note: 'fight, battle; attestation and spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'kurur',
        pron: 'koo-roor',
        note: 'hostility, enmity, war; attested syllabically'
      },
      aramaic: {
        translit: 'qərāb',
        hebrewLetters: 'קרב',
        note: 'Daniel 7:21 עָבְדָה קְרָב עִם־קַדִּישִׁין (it made war with the holy ones); Hebrew קְרָב battle is the same word'
      }
      // sumerian: deliberately empty; the battle word me3 uses a sign
      // identity not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'judge',
    english: ['judge'],
    hebrew: { word: 'שֹׁפֵט', translit: 'shofet', root: 'שפט' },
    forms: {
      akkadian: {
        translit: 'dayyānu',
        script: '𒁲𒋻',
        scriptNote: 'shown as the logogram DI.KU5 (DI plus the sign TAR, read ku5), with which the word was commonly written',
        pron: 'dah-yaa-nu',
        note: 'the ordinary Akkadian judge word, related to dīnu (law case); it corresponds to Hebrew דַּיָּן rather than to שֹׁפֵט'
      },
      sumerian: {
        translit: 'di-ku5',
        script: '𒁲𒋻',
        pron: 'dee-koo',
        note: 'literally the one who cuts the case; written DI plus TAR (read ku5)'
      },
      aramaic: {
        translit: 'šāpəṭīn',
        hebrewLetters: 'שפטין',
        note: 'judges, magistrates (plural as attested); Ezra 7:25 שָׁפְטִין וְדַיָּנִין (magistrates and judges) sets the cognate of שֹׁפֵט beside the ordinary judge word דַּיָּן'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'blessing',
    english: ['blessing'],
    // The root ברכ is defined with the body category (knee), where the
    // dictionaries file bless and knee as one consonantal root.
    hebrew: { word: 'בְּרָכָה', translit: 'berakhah', root: 'ברכ' },
    forms: {
      akkadian: {
        translit: 'ikribu',
        pron: 'ik-ree-bu',
        note: 'prayer, blessing, from karābu (to pray, bless); the dictionaries compare karābu with Hebrew ברך, the same consonants in a different order'
      },
      aramaic: {
        translit: 'bərak',
        hebrewLetters: 'ברך',
        note: 'Daniel 2:20 מְבָרַךְ (blessed be the name of God); the I-bless-you-by-a-god greeting formula is standard in the Aramaic letters'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'scribe',
    english: ['scribe'],
    // The root ספר is defined with the household category (scroll).
    hebrew: { word: 'סֹפֵר', translit: 'sofer', root: 'ספר' },
    forms: {
      akkadian: {
        translit: 'ṭupšarru',
        script: '𒁾𒊬',
        scriptNote: 'shown as the logogram DUB.SAR, with which the word was commonly written',
        pron: 'tup-shar-ru',
        note: 'a loanword from Sumerian dub-sar, tablet-writer'
      },
      sumerian: {
        translit: 'dub-sar',
        script: '𒁾𒊬',
        pron: 'doob-sar',
        note: 'literally tablet-writer; the DUB sign is the tablet itself'
      },
      egyptian: {
        translit: 'sš',
        script: '𓏞𓀀',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sesh (modern convention)',
        note: 'the same word as the verb write; also transliterated zẖꜣw'
      },
      hittite: {
        script: '𒁾𒊬',
        scriptNote: 'written logographically (DUB.SAR); the native Hittite reading is not established',
        note: 'Hittite scribes sign the tablet colophons with this title'
      },
      aramaic: {
        translit: 'sāpərā',
        hebrewLetters: 'ספרא',
        note: 'Ezra 4:8 שִׁמְשַׁי סָפְרָא (Shimshai the scribe)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'soul',
    english: ['soul', 'life', 'self'],
    hebrew: { word: 'נֶפֶשׁ', translit: 'nefesh', root: 'נפש' },
    forms: {
      akkadian: {
        translit: 'napištu',
        script: '𒍣',
        scriptNote: 'shown as the logogram ZI, with which the word was commonly written',
        pron: 'na-pish-tu',
        note: 'life, breath, throat; the textbook cognate of נֶפֶשׁ'
      },
      sumerian: {
        translit: 'zi',
        script: '𒍣',
        pron: 'zee',
        note: 'life, breath'
      },
      egyptian: {
        translit: 'bꜣ',
        pron: 'ba (modern convention)',
        note: 'the bꜣ is one of several Egyptian soul concepts (bꜣ, kꜣ, ꜣḫ) and does not correspond to Hebrew נֶפֶשׁ; shown as the nearest conventional gloss, not an equivalent'
      },
      osa: {
        translit: 'nfs1',
        tokens: ['n', 'f', 's1'],
        note: 'soul, person; also a funerary monument; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // hittite: deliberately empty; the soul/mind logogram ZI is used in
      // Hittite, but no native form is verified for this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sin',
    english: ['sin'],
    hebrew: { word: 'חֵטְא', translit: 'chet', root: 'חטא' },
    forms: {
      akkadian: {
        translit: 'ḫīṭu',
        pron: 'khee-tu',
        note: 'wrong, sin, crime, from ḫaṭû (to sin, do wrong), the textbook cognate of חטא'
      },
      hittite: {
        translit: 'waštul',
        pron: 'wash-tool',
        note: 'sin, offence; attested syllabically'
      },
      aramaic: {
        translit: 'ḥăṭāy',
        hebrewLetters: 'חטי',
        note: 'sin; Daniel 4:24 urges the king to break off his sins by righteousness'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'shepherd',
    english: ['shepherd'],
    hebrew: { word: 'רֹעֶה', translit: 'roeh', root: 'רעה' },
    forms: {
      akkadian: {
        translit: 'rēʾû',
        script: '𒉺𒇻',
        scriptNote: 'shown as the logogram SIPA (written PA.LU), with which the word was commonly written',
        pron: 'reh-oo',
        note: 'the textbook cognate of רעה; shepherd is also a standard royal epithet in Akkadian'
      },
      sumerian: {
        translit: 'sipa',
        script: '𒉺𒇻',
        pron: 'see-pa',
        note: 'written PA.LU; shepherd of the land is a Sumerian royal epithet'
      }
      // egyptian: deliberately empty; the herdsman word (mniw) has a spelling
      // not verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
