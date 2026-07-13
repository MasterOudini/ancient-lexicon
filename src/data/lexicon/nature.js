// Nature & the heavens entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const NATURE = [
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
    id: 'moon',
    english: ['moon'],
    hebrew: { word: 'יָרֵחַ', translit: 'yareach', root: 'ירח', note: 'the same root writes יֶרַח month' },
    forms: {
      akkadian: {
        translit: 'arḫu',
        pron: 'ar-khu',
        note: 'moon (crescent), month; Old Babylonian warḫum; the textbook cognate of Hebrew יֶרַח month'
      },
      egyptian: {
        translit: 'jꜥḥ',
        pron: 'iah (modern convention)',
        note: 'moon; also the moon god; no sign spelling is shown because the choice of moon sign varies'
      },
      hittite: {
        translit: 'arma-',
        pron: 'ar-ma',
        note: 'moon, also month; bound up with the moon god Arma; attestation should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'yəraḥ',
        hebrewLetters: 'ירח',
        note: 'month; Ezra 6:15 לִירַח אֲדָר (in the month Adar)'
      },
      osa: {
        translit: 'wrḫ',
        tokens: ['w', 'r', 'kh'],
        note: 'month, in Sabaic date formulas; w where Hebrew has initial y; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // sumerian: deliberately empty; the moon is written with the name of the
      // moon god (Nanna/Suen), whose sign identities are not verified for this
      // database.
    }
  },
  {
    id: 'star',
    english: ['star'],
    hebrew: { word: 'כּוֹכָב', translit: 'kokhav', root: 'ככב' },
    forms: {
      akkadian: {
        translit: 'kakkabu',
        script: '𒀯',
        scriptNote: 'shown as the logogram MUL, with which the word was commonly written',
        pron: 'kak-ka-bu',
        note: 'the textbook cognate of Hebrew kokhav'
      },
      sumerian: {
        translit: 'mul',
        script: '𒀯',
        pron: 'mool',
        note: 'the star sign MUL, written as three AN signs'
      },
      egyptian: {
        translit: 'sbꜣ',
        script: '𓋴𓃀𓄿𓇼',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'seba (modern convention)'
      },
      aramaic: {
        translit: 'kōkab',
        hebrewLetters: 'כוכב',
        note: 'the ordinary Aramaic word; not attested in Biblical Aramaic; Imperial Aramaic attestation should be checked against TAD',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'heaven',
    english: ['heaven', 'sky'],
    hebrew: { word: 'שָׁמַיִם', translit: 'shamayim', root: 'שמימ' },
    forms: {
      akkadian: {
        translit: 'šamû',
        script: '𒀭',
        scriptNote: 'shown as the logogram AN, with which the word was commonly written',
        pron: 'sha-moo',
        note: 'plural in form, like Hebrew shamayim; the textbook cognate'
      },
      sumerian: {
        translit: 'an',
        script: '𒀭',
        pron: 'ahn',
        note: 'the sign AN; the same sign writes dingir (god)'
      },
      egyptian: {
        translit: 'pt',
        script: '𓊪𓏏𓇯',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'pet (modern convention)'
      },
      hittite: {
        translit: 'nepiš',
        pron: 'neh-pish',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'šəmayyā',
        hebrewLetters: 'שמיא',
        note: 'the heavens (emphatic form); Daniel 2:28 בִּשְׁמַיָּא (there is a God in heaven)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'earth',
    english: ['earth', 'land'],
    hebrew: { word: 'אֶרֶץ', translit: 'erets', root: 'ארצ' },
    forms: {
      akkadian: {
        translit: 'erṣetu',
        script: '𒆠',
        scriptNote: 'shown as the logogram KI, with which the word was commonly written',
        pron: 'er-tseh-tu',
        note: 'earth, land, also the netherworld; the textbook cognate of Hebrew erets'
      },
      sumerian: {
        translit: 'ki',
        script: '𒆠',
        pron: 'kee'
      },
      egyptian: {
        translit: 'tꜣ',
        script: '𓇾𓈇𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ta (modern convention)'
      },
      hittite: {
        translit: 'tekan',
        pron: 'teh-kan',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾarʿā',
        hebrewLetters: 'ארעא',
        note: 'the earth (emphatic form); Daniel 2:35 וּמְלָת כָּל־אַרְעָא (and filled the whole earth). Hebrew ṣ answers to Aramaic ʿ in this word; the older spelling אַרְקָא with q stands beside אַרְעָא in Jeremiah 10:11'
      },
      osa: {
        translit: 'ʾrḍ',
        tokens: ["'", 'r', 'dd'],
        note: 'earth, land; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'sea',
    english: ['sea'],
    hebrew: { word: 'יָם', translit: 'yam', root: 'ימ' },
    forms: {
      akkadian: {
        translit: 'tâmtu',
        script: '𒀀𒀊𒁀',
        scriptNote: 'shown as the logogram A.AB.BA, with which the word was commonly written',
        pron: 'taam-tu',
        note: 'the ordinary Akkadian word, not cognate with yam; the older form tiāmtu is the standard comparison with Hebrew תְּהוֹם (the deep)'
      },
      sumerian: {
        translit: 'a-ab-ba',
        script: '𒀀𒀊𒁀',
        pron: 'ah-ab-ba'
      },
      egyptian: {
        translit: 'ym',
        pron: 'yam (modern convention)',
        note: 'a Semitic loanword into Egyptian, in use from the New Kingdom; the standard example of borrowing in that direction'
      },
      hittite: {
        translit: 'arunaš',
        pron: 'ah-roo-nash',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'yammā',
        hebrewLetters: 'ימא',
        note: 'the sea (emphatic form); Daniel 7:2 יַמָּא רַבָּא (the great sea)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'river',
    english: ['river'],
    hebrew: { word: 'נָהָר', translit: 'nahar', root: 'נהר' },
    forms: {
      akkadian: {
        translit: 'nāru',
        pron: 'naa-ru',
        note: 'the textbook cognate of Hebrew nahar'
      },
      egyptian: {
        translit: 'jtrw',
        pron: 'iteru (modern convention)',
        note: 'river, watercourse; used above all of the Nile'
      },
      aramaic: {
        translit: 'nəhar',
        hebrewLetters: 'נהר',
        note: 'Daniel 7:10 נְהַר דִּי־נוּר (a river of fire); the province name עֲבַר־נַהֲרָה (Beyond-the-River) recurs in Ezra'
      }
      // sumerian: deliberately empty; the river sign (ID2) is outside this
      // database's verified list.
      // hittite: deliberately empty; rivers are written with the same river
      // logogram, which is outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'mountain',
    english: ['mountain'],
    hebrew: { word: 'הַר', translit: 'har', root: 'הר' },
    forms: {
      akkadian: {
        translit: 'šadû',
        script: '𒆳',
        scriptNote: 'shown as the logogram KUR, with which the word was commonly written',
        pron: 'sha-doo',
        note: 'mountain; whether Hebrew שָׂדֶה field is related is debated in the dictionaries (see field)'
      },
      sumerian: {
        translit: 'kur',
        script: '𒆳',
        pron: 'koor',
        note: 'mountain; the same sign writes foreign land'
      },
      egyptian: {
        translit: 'ḏw',
        script: '𓆓𓅱𓈋',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'dju (modern convention)'
      },
      aramaic: {
        translit: 'ṭūr',
        hebrewLetters: 'טור',
        note: 'a different lexeme from har; Daniel 2:35 לְטוּר רַב (became a great mountain); its Hebrew counterpart by sound correspondence is צוּר rock'
      }
      // hittite: deliberately empty; mountain is written with a Sumerogram
      // (HUR.SAG) whose sign identities we have not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'stone',
    english: ['stone'],
    hebrew: { word: 'אֶבֶן', translit: 'even', root: 'אבנ' },
    forms: {
      akkadian: {
        translit: 'abnu',
        script: '𒉌𒌓',
        scriptNote: 'shown as the logogram NA4 (written with the sign pair NI.UD), with which the word was commonly written',
        pron: 'ab-nu',
        note: 'the textbook cognate of Hebrew even'
      },
      sumerian: {
        translit: 'na4',
        script: '𒉌𒌓',
        pron: 'nah',
        note: 'written with the sign pair NI.UD, read na4'
      },
      egyptian: {
        translit: 'jnr',
        script: '𓇋𓈖𓂋𓊌',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'iner (modern convention)',
        note: 'the dictionary spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        script: '𒉌𒌓',
        scriptNote: 'written logographically (NA4); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʾeben',
        hebrewLetters: 'אבן',
        note: 'Daniel 2:34 אֶבֶן (the stone cut out not by human hands)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'dust',
    english: ['dust'],
    hebrew: { word: 'עָפָר', translit: 'afar', root: 'עפר' },
    forms: {
      akkadian: {
        translit: 'eperu',
        pron: 'eh-peh-ru',
        note: 'dust, earth, soil; the standard comparison with Hebrew afar'
      }
      // sumerian: deliberately empty; the dust sign (SAHAR) is outside this
      // database's verified list.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'fire',
    english: ['fire'],
    hebrew: { word: 'אֵשׁ', translit: 'esh', root: 'אש' },
    forms: {
      akkadian: {
        translit: 'išātu',
        script: '𒉈',
        scriptNote: 'shown as the logogram IZI (the sign NE), with which the word was commonly written',
        pron: 'ee-shaa-tu'
      },
      sumerian: {
        translit: 'izi',
        script: '𒉈',
        pron: 'ih-zee',
        note: 'written with the sign NE, read izi'
      },
      egyptian: {
        translit: 'sḏt',
        script: '𓋴𓆓𓏏𓊮',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sedjet (modern convention)',
        note: 'the dictionary spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'paḫḫur',
        pron: 'pah-khur',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'nūr',
        hebrewLetters: 'נור',
        note: 'a different lexeme from esh: the blazing furnace of Daniel 3 is אַתּוּן נוּרָא יָקִדְתָּא (Daniel 3:6); the direct cognate אֶשָּׁא occurs in Daniel 7:11'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wind',
    english: ['wind', 'breath', 'spirit'],
    hebrew: { word: 'רוּחַ', translit: 'ruach', root: 'רוח' },
    forms: {
      akkadian: {
        translit: 'šāru',
        script: '𒅎',
        scriptNote: 'shown as the logogram IM, with which the word was commonly written',
        pron: 'shaa-ru',
        note: 'wind; not cognate with ruach'
      },
      sumerian: {
        translit: 'im',
        script: '𒅎',
        pron: 'im',
        note: 'wind, storm; the same sign writes im clay'
      },
      egyptian: {
        translit: 'ṯꜣw',
        script: '𓍿𓄿𓅱𓊡',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'tjau (modern convention)',
        note: 'wind, breath; the dictionary spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'ḫuwant-',
        pron: 'khoo-want',
        note: 'wind, cited as the stem; attestation should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'rūaḥ',
        hebrewLetters: 'רוח',
        note: 'Daniel 2:35 רוּחָא (the wind that carried the chaff away); Daniel 7:2 אַרְבַּע רוּחֵי שְׁמַיָּא (the four winds of heaven)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'rain',
    english: ['rain'],
    hebrew: { word: 'מָטָר', translit: 'matar', root: 'מטר', note: 'גֶּשֶׁם is the other common biblical word for rain' },
    forms: {
      akkadian: {
        translit: 'zunnu',
        pron: 'zun-nu',
        note: 'the ordinary Akkadian word; not cognate with matar'
      },
      aramaic: {
        translit: 'məṭar',
        hebrewLetters: 'מטר',
        note: 'the common Aramaic word; not attested in Biblical Aramaic; Imperial Aramaic attestation should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; the rain writing (SHEG3) is outside this
      // database's verified list.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'cloud',
    english: ['cloud'],
    hebrew: { word: 'עָנָן', translit: 'anan', root: 'עננ' },
    forms: {
      akkadian: {
        translit: 'erpetu',
        pron: 'er-peh-tu',
        note: 'the ordinary Akkadian word; the dictionaries compare it with Hebrew עֲרָפֶל thick cloud rather than with anan'
      },
      aramaic: {
        translit: 'ʿănān',
        hebrewLetters: 'ענן',
        note: 'Daniel 7:13 עִם־עֲנָנֵי שְׁמַיָּא (with the clouds of heaven)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'lightning',
    english: ['lightning'],
    hebrew: { word: 'בָּרָק', translit: 'baraq', root: 'ברק' },
    forms: {
      akkadian: {
        translit: 'birqu',
        pron: 'bir-qu',
        note: 'the standard comparison with Hebrew baraq; the dictionary form varies between birqu and berqu'
      }
      // sumerian: deliberately empty; the lightning writing (NIM.GIR2) is
      // outside this database's verified list.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tree',
    english: ['tree', 'wood'],
    hebrew: { word: 'עֵץ', translit: 'ets', root: 'עצ' },
    forms: {
      akkadian: {
        translit: 'iṣu',
        script: '𒄑',
        scriptNote: 'shown as the logogram GISH, with which the word was commonly written',
        pron: 'ee-tsu',
        note: 'tree, wood; the textbook cognate of Hebrew ets'
      },
      sumerian: {
        translit: 'giš',
        script: '𒄑',
        pron: 'gish'
      },
      egyptian: {
        translit: 'ḫt',
        script: '𓆱𓏏𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'khet (modern convention)',
        note: 'wood, tree, timber'
      },
      aramaic: {
        translit: 'ʾāʿ',
        hebrewLetters: 'אע',
        note: 'wood, timber; Daniel 5:4 אָעָא; Ezra 5:8. Hebrew ṣ answers to Aramaic ʿ here, as in אֶרֶץ beside אֲרַע'
      }
      // hittite: deliberately empty; wood is written with the GISH logogram,
      // and no native reading is given in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'field',
    english: ['field'],
    hebrew: { word: 'שָׂדֶה', translit: 'sadeh', root: 'שדה' },
    forms: {
      akkadian: {
        translit: 'eqlu',
        script: '𒀀𒊮',
        scriptNote: 'shown as the logogram A.SHA3, with which the word was commonly written',
        pron: 'ek-lu',
        note: 'field; Akkadian šadû means mountain, also open country — whether שָׂדֶה is related is debated (see mountain)'
      },
      sumerian: {
        translit: 'a-ša3',
        script: '𒀀𒊮',
        pron: 'ah-shah'
      },
      egyptian: {
        translit: 'sḫt',
        pron: 'sekhet (modern convention)',
        note: 'field, countryside'
      },
      aramaic: {
        translit: 'bārā',
        hebrewLetters: 'ברא',
        note: 'a different lexeme (the open field); Daniel 2:38 חֵיוַת בָּרָא (the beasts of the field)'
      }
      // hittite: deliberately empty; fields are written with the A.SHA3
      // logogram; the native reading is not established in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'garden',
    english: ['garden'],
    hebrew: { word: 'גַּן', translit: 'gan', root: 'גננ' },
    forms: {
      akkadian: {
        translit: 'kirû',
        pron: 'kee-roo',
        note: 'garden, orchard; not cognate with gan'
      },
      sumerian: {
        translit: 'kiri6',
        script: '𒄑𒊬',
        pron: 'kih-ree',
        note: 'written GISH.SAR, read kiri6; the reading should be checked against corpus records',
        verify: true
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; the garden word (like גנתא) is not
      // attested in Biblical Aramaic and is not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'desert',
    english: ['desert', 'wilderness'],
    hebrew: { word: 'מִדְבָּר', translit: 'midbar', root: 'דבר' },
    forms: {
      akkadian: {
        translit: 'ṣēru',
        script: '𒂔',
        scriptNote: 'shown as the logogram EDIN, with which the word was commonly written',
        pron: 'tseh-ru',
        note: 'steppe, open country; the ordinary Akkadian word'
      },
      sumerian: {
        translit: 'edin',
        script: '𒂔',
        pron: 'eh-din',
        note: 'steppe, open plain'
      },
      egyptian: {
        translit: 'dšrt',
        pron: 'desheret (modern convention)',
        note: 'the red land, the desert flanking the Nile valley'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'light',
    english: ['light'],
    hebrew: { word: 'אוֹר', translit: 'or', root: 'אור' },
    forms: {
      akkadian: {
        translit: 'nūru',
        pron: 'noo-ru',
        note: 'light; cognate with the Hebrew lamp word נֵר rather than with or; a separate Akkadian word urru means daytime, daylight'
      },
      aramaic: {
        translit: 'nəhōrā',
        hebrewLetters: 'נהורא',
        note: 'a different lexeme, from the shine group of נהר; Daniel 2:22 (and the light dwells with him); the exact written form (ketiv/qere) there should be checked',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'darkness',
    english: ['darkness'],
    hebrew: { word: 'חֹשֶׁךְ', translit: 'choshekh', root: 'חשכ' },
    forms: {
      akkadian: {
        translit: 'eṭûtu',
        pron: 'eh-too-tu',
        note: 'darkness, from eṭû to be dark; the dictionary form should be checked against CAD',
        verify: true
      },
      egyptian: {
        translit: 'kkw',
        pron: 'keku (modern convention)',
        note: 'darkness; the dictionary form should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ḥăšōkā',
        hebrewLetters: 'חשוכא',
        note: 'the darkness (emphatic form); Daniel 2:22 יָדַע מָה בַחֲשׁוֹכָא (he knows what is in the darkness)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  }
]
