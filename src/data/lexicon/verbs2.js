// Verbs of worship & rule entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const VERBS2 = [
  {
    id: 'bless',
    english: ['bless'],
    // The root chip points to ברכ (kneel; bless), defined via knee in the
    // roots database.
    hebrew: {
      word: 'בֵּרַךְ',
      translit: 'berakh',
      root: 'ברכ',
      note: 'piel stem, the ordinary stem for blessing'
    },
    forms: {
      akkadian: {
        translit: 'karābu',
        pron: 'ka-raa-bu',
        note: 'to pray, bless, greet, dedicate; the noun ikribu means prayer, blessing'
      },
      aramaic: {
        translit: 'bārikh',
        hebrewLetters: 'ברך',
        note: 'pael; Daniel 2:19 בָּרִךְ (he blessed the God of heaven); Elephantine letters open with the formula ברכתך (I bless you)'
      },
      osa: {
        translit: 'brk',
        tokens: ['b', 'r', 'k'],
        note: 'well attested in Sabaic dedicatory inscriptions (blessing formulas invoking the gods)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; dwꜣ (praise, worship) is filed under pray.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'curse',
    english: ['curse'],
    hebrew: { word: 'אָרַר', translit: 'arar', root: 'ארר' },
    forms: {
      akkadian: {
        translit: 'arāru',
        pron: 'a-raa-ru',
        note: 'to curse; the textbook cognate of Hebrew arar'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; the Aramaic curse words are different
      // lexemes, none verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'reign',
    english: ['reign', 'be king'],
    hebrew: { word: 'מָלַךְ', translit: 'malakh', root: 'מלכ' },
    forms: {
      akkadian: {
        translit: 'bêlu',
        pron: 'beh-lu',
        note: 'to rule over, be lord of (from bēlu, lord); the similar-sounding malāku means advise, counsel — a false friend of Hebrew malakh'
      },
      egyptian: {
        translit: 'ḥqꜣ',
        script: '𓋾𓈎𓄿',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'heqa (modern convention)',
        note: 'to rule; as a noun, ruler'
      }
      // sumerian: deliberately empty; kingship words are filed under king.
      // hittite: deliberately empty; ḫaššuš (king) is filed under king.
      // aramaic: deliberately empty; Biblical Aramaic attests the nouns king
      // and kingdom (see king), not this verb.
      // osa: deliberately empty; mlk (king) is filed under king.
    }
  },
  {
    id: 'serve',
    english: ['serve', 'work'],
    // The root chip points to עבד, defined via servant in the roots database.
    hebrew: { word: 'עָבַד', translit: 'avad', root: 'עבד' },
    forms: {
      akkadian: {
        translit: 'palāḫu',
        pron: 'pa-laa-khu',
        note: 'to fear, revere, and so to serve (a god or a master); a translation equivalent, not a cognate'
      },
      egyptian: {
        translit: 'bꜣk',
        pron: 'bak (modern convention)',
        note: 'to work, to serve; the noun bꜣk (servant) is filed under servant'
      },
      aramaic: {
        translit: 'pəlaḥ',
        hebrewLetters: 'פלח',
        note: 'a different lexeme, the Biblical Aramaic verb for serving a god; Daniel 6:17 דִּי אַנְתְּ פָּלַח־לֵהּ (whom you serve); the Aramaic verb עבד means do, make'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; ʿbd appears in personal names (see servant).
    }
  },
  {
    id: 'sing',
    english: ['sing'],
    hebrew: {
      word: 'שָׁר',
      translit: 'shar',
      root: 'שיר',
      note: 'qal of the hollow root שיר; Judges 5:1 וַתָּשַׁר (and Deborah sang)'
    },
    forms: {
      akkadian: {
        translit: 'zamāru',
        pron: 'za-maa-ru',
        note: 'to sing; the noun zamāru means song'
      },
      egyptian: {
        translit: 'ḥsi',
        pron: 'hesi (modern convention)',
        note: 'to sing; a separate verb ḥsi means praise, favor; check against Wb.',
        verify: true
      },
      hittite: {
        translit: 'išḫamai-',
        pron: 'ish-kha-mai',
        note: 'to sing; attestation should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'zəmārā',
        hebrewLetters: 'זמרא',
        note: 'music (emphatic form), a noun of the related zmr word group; Daniel 3:5 וְכֹל זְנֵי זְמָרָא (and every kind of music)'
      }
      // sumerian: deliberately empty; the song word šir is written with a sign
      // outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'pray',
    english: ['pray'],
    hebrew: {
      word: 'הִתְפַּלֵּל',
      translit: 'hitpallel',
      root: 'פלל',
      note: 'hitpael stem; 1 Samuel 12:19 הִתְפַּלֵּל בְּעַד־עֲבָדֶיךָ (pray for your servants)'
    },
    forms: {
      akkadian: {
        translit: 'karābu',
        pron: 'ka-raa-bu',
        note: 'to pray, bless, greet (filed also under bless); the noun ikribu means prayer, blessing'
      },
      egyptian: {
        translit: 'dwꜣ',
        pron: 'dua (modern convention)',
        note: 'to praise, worship (a god); a translation equivalent'
      },
      hittite: {
        translit: 'arkuwar',
        pron: 'ar-ku-war',
        note: 'plea, prayer (a noun); the plague prayers of Muršili are framed as arkuwar pleas; check against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'ṣəlā',
        hebrewLetters: 'צלא',
        note: 'a different lexeme (pael: pray); Ezra 6:10 מְצַלַּיִן (praying for the life of the king and his sons); Daniel 6:11 מְצַלֵּא'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'burn',
    english: ['burn'],
    hebrew: { word: 'בָּעַר', translit: 'baar', root: 'בער' },
    forms: {
      akkadian: {
        translit: 'šarāpu',
        pron: 'sha-raa-pu',
        note: 'to burn; the cognate of a different Hebrew burn verb, שָׂרַף'
      },
      hittite: {
        translit: 'warnu-',
        pron: 'war-nu',
        note: 'to set alight (the intransitive burns is urāni); check against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'yəqad',
        hebrewLetters: 'יקד',
        note: 'a different lexeme; Daniel 3:6 אַתּוּן נוּרָא יָקִדְתָּא (the burning fiery furnace)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wash',
    english: ['wash', 'bathe'],
    hebrew: { word: 'רָחַץ', translit: 'rachats', root: 'רחצ' },
    forms: {
      akkadian: {
        translit: 'ramāku',
        pron: 'ra-maa-ku',
        note: 'to bathe; mesû is the ordinary word for washing objects and parts of the body'
      },
      egyptian: {
        translit: 'wꜥb',
        pron: 'wab (modern convention)',
        note: 'to be pure, to cleanse; a priest of the ordinary rank is a wꜥb (pure one)'
      },
      hittite: {
        translit: 'arra-',
        pron: 'ar-ra',
        note: 'to wash; check against corpus records',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; Biblical Aramaic רחץ means trust
      // (Daniel 3:28 הִתְרְחִצוּ, they trusted), not wash.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'anoint',
    english: ['anoint'],
    hebrew: { word: 'מָשַׁח', translit: 'mashach', root: 'משח' },
    forms: {
      akkadian: {
        translit: 'pašāšu',
        pron: 'pa-shaa-shu',
        note: 'to anoint (with oil); a translation equivalent, not a cognate'
      },
      egyptian: {
        translit: 'wrḥ',
        pron: 'wereh (modern convention)',
        note: 'to anoint; check against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'məšaḥ',
        hebrewLetters: 'משח',
        note: 'the attested Biblical Aramaic word of this root is the noun oil (Ezra 6:9 וּמְשַׁח); the anointing verb itself is not attested there'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'redeem',
    english: ['redeem', 'act as kinsman'],
    hebrew: { word: 'גָּאַל', translit: 'gaal', root: 'גאל' },
    forms: {
      akkadian: {
        translit: 'paṭāru',
        pron: 'pa-taa-ru',
        note: 'to loosen, release, redeem (pledges, captives); the noun ipṭiru means ransom; a translation equivalent, not a cognate'
      },
      aramaic: {
        translit: 'pəraq',
        hebrewLetters: 'פרק',
        note: 'a different lexeme; Daniel 4:24 פְרֻק (redeem — or break off — your sins by righteousness; the rendering is debated)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'remember',
    english: ['remember'],
    hebrew: { word: 'זָכַר', translit: 'zakhar', root: 'זכר' },
    forms: {
      akkadian: {
        translit: 'zakāru',
        pron: 'za-kaa-ru',
        note: 'to speak, name, invoke — the formal cognate of zakhar; the ordinary Akkadian verb for remember is ḫasāsu'
      },
      egyptian: {
        translit: 'sḫꜣ',
        script: '𓊃𓐍𓄿',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sekha (modern convention)',
        note: 'to remember, call to mind'
      },
      aramaic: {
        translit: 'dikrōn',
        hebrewLetters: 'דכרן',
        note: 'record, memorandum — Aramaic d answers to Hebrew z in this root; Ezra 6:2 דִּכְרוֹנָה (a record); Ezra 4:15 סְפַר דָּכְרָנַיָּא (the book of the records)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; dhkr appears in the corpus but is not verified
      // for this database.
    }
  },
  {
    id: 'forget',
    english: ['forget'],
    hebrew: { word: 'שָׁכַח', translit: 'shakhach', root: 'שכח' },
    forms: {
      akkadian: {
        translit: 'mašû',
        pron: 'ma-shoo',
        note: 'to forget; a translation equivalent, not a cognate of shakhach'
      },
      egyptian: {
        translit: 'smḫ',
        pron: 'semekh (modern convention)',
        note: 'to forget; check against Wb.',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; in Aramaic the verb שכח means find, not
      // forget (see find).
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'seek',
    english: ['seek'],
    hebrew: {
      word: 'בִּקֵּשׁ',
      translit: 'biqqesh',
      root: 'בקש',
      note: 'piel stem, the stem in which this verb is used'
    },
    forms: {
      akkadian: {
        translit: 'šeʾû',
        pron: 'sheh-oo',
        note: 'to seek, look for'
      },
      egyptian: {
        translit: 'ḥḥj',
        pron: 'hehi (modern convention)',
        note: 'to seek; check against Wb.',
        verify: true
      },
      hittite: {
        translit: 'šanḫ-',
        pron: 'shanh',
        note: 'to seek, attempt; attested syllabically'
      },
      aramaic: {
        translit: 'bəʿāh',
        hebrewLetters: 'בעה',
        note: 'a different lexeme (seek, request); Daniel 2:16 וּבְעָה מִן־מַלְכָּא (and he requested of the king)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'find',
    english: ['find'],
    hebrew: { word: 'מָצָא', translit: 'matsa', root: 'מצא' },
    forms: {
      akkadian: {
        translit: 'atû',
        pron: 'a-too',
        note: 'to find, discover (Old Babylonian watûm); check the citation form against CAD',
        verify: true
      },
      egyptian: {
        translit: 'gmi',
        script: '𓅠𓅓',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'gemi (modern convention)'
      },
      hittite: {
        translit: 'wemiya-',
        pron: 'weh-mi-ya',
        note: 'to find; attested syllabically'
      },
      aramaic: {
        translit: 'haškaḥ',
        hebrewLetters: 'שכח',
        note: 'the haphel of שכח means find: Daniel 2:25 הַשְׁכַּחַת גְּבַר (I have found a man) — the same consonants as Hebrew שָׁכַח forget, a classic false friend'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'rest',
    english: ['rest', 'cease'],
    // The root chip points to שבת, defined via sabbath in the roots database.
    hebrew: {
      word: 'שָׁבַת',
      translit: 'shavat',
      root: 'שבת',
      note: 'to cease, rest; Genesis 2:2 וַיִּשְׁבֹּת (and he rested)'
    },
    forms: {
      akkadian: {
        translit: 'nâḫu',
        pron: 'naa-khu',
        note: 'to rest, calm down; a translation equivalent, not a cognate'
      },
      egyptian: {
        translit: 'ḥtp',
        pron: 'hotep (modern convention)',
        note: 'to rest, be at peace; filed also under peace'
      },
      aramaic: {
        translit: 'šəlēh',
        hebrewLetters: 'שלה',
        note: 'at ease (a different lexeme); Daniel 4:1 שְׁלֵה הֲוֵית בְּבֵיתִי (I was at ease in my house)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
