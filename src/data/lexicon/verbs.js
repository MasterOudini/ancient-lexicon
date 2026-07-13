// Everyday verbs entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const VERBS = [
  {
    id: 'eat',
    english: ['eat'],
    hebrew: { word: 'אָכַל', translit: 'akhal', root: 'אכל', note: 'qal perfect, he ate' },
    forms: {
      akkadian: {
        translit: 'akālu',
        script: '𒅥',
        scriptNote: 'shown as the logogram GU7, with which the word was commonly written',
        pron: 'ah-kaa-lu',
        note: 'textbook cognate of Hebrew אָכַל'
      },
      sumerian: {
        translit: 'gu7',
        script: '𒅥',
        pron: 'goo',
        note: 'written with the compound sign KA times GAR'
      },
      egyptian: {
        translit: 'wnm',
        script: '𓃹𓈖𓅓𓀁',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'wenem (modern convention)'
      },
      hittite: {
        translit: 'ed-',
        pron: 'ed',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾăkal',
        hebrewLetters: 'אכל',
        note: 'Daniel 7:7 אָכְלָה (it devoured, of the fourth beast)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'drink',
    english: ['drink'],
    hebrew: { word: 'שָׁתָה', translit: 'shatah', root: 'שתה', note: 'qal perfect, he drank' },
    forms: {
      akkadian: {
        translit: 'šatû',
        script: '𒅘',
        scriptNote: 'shown as the logogram NAG, with which the word was commonly written',
        pron: 'shah-tuu',
        note: 'textbook cognate of Hebrew שָׁתָה'
      },
      sumerian: {
        translit: 'naĝ',
        script: '𒅘',
        pron: 'nang',
        note: 'written with the compound sign KA times A'
      },
      egyptian: {
        translit: 'zwr',
        pron: 'zewer (modern convention)',
        note: 'also transliterated swr / swi; spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'eku-',
        pron: 'eh-ku',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'šətāh',
        hebrewLetters: 'שתה',
        note: 'Daniel 5:1 חַמְרָא שָׁתֵה (Belshazzar drinking wine)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'go',
    english: ['go', 'walk'],
    hebrew: { word: 'הָלַךְ', translit: 'halakh', root: 'הלכ', note: 'qal perfect, he went' },
    forms: {
      akkadian: {
        translit: 'alāku',
        script: '𒁺',
        scriptNote: 'shown as the logogram DU, with which the word was commonly written',
        pron: 'ah-laa-ku',
        note: 'the standard comparison with Hebrew הָלַךְ'
      },
      sumerian: {
        translit: 'ĝen',
        script: '𒁺',
        pron: 'gen',
        note: 'the sign DU; the initial consonant is the ng sound'
      },
      egyptian: {
        translit: 'šm',
        script: '𓈝𓅓𓂻',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'shem (modern convention)'
      },
      hittite: {
        translit: 'pai-',
        pron: 'pah-ee',
        note: 'attested syllabically; a separate verb pai- means give'
      },
      aramaic: {
        translit: 'ʾăzal',
        hebrewLetters: 'אזל',
        note: 'the ordinary Aramaic go-verb, a different lexeme from Hebrew הלך; Daniel 2:17 אֲזַל (he went); forms of הלך also occur (Daniel 3:25 מַהְלְכִין, walking)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'come',
    english: ['come'],
    hebrew: { word: 'בָּא', translit: 'ba', root: 'בוא', note: 'qal perfect, he came; the hollow root is בוא' },
    forms: {
      akkadian: {
        translit: 'alāku',
        pron: 'ah-laa-ku',
        note: 'come is alāku (go) with the ventive ending (illikam, he came here); there is no separate dictionary lemma'
      },
      egyptian: {
        translit: 'jj',
        pron: 'iy (modern convention)',
        note: 'alongside jwj; the two verbs together supply come, and spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'uwa-',
        pron: 'oo-wah',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ʾătāh',
        hebrewLetters: 'אתה',
        note: 'Daniel 7:13 כְּבַר אֱנָשׁ אָתֵה הֲוָה (one like a son of man was coming)'
      }
      // sumerian: deliberately empty; ĝen (filed under go) serves with
      // directional prefixes.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'see',
    english: ['see'],
    hebrew: { word: 'רָאָה', translit: 'raah', root: 'ראה', note: 'qal perfect, he saw' },
    forms: {
      akkadian: {
        translit: 'amāru',
        script: '𒅆',
        scriptNote: 'shown as the logogram IGI, with which the word was commonly written',
        pron: 'ah-maa-ru'
      },
      sumerian: {
        translit: 'igi du8',
        scriptNote: 'compound verb; the sign sequence is not shown',
        pron: 'ee-gee doo'
      },
      egyptian: {
        translit: 'mꜣꜣ',
        pron: 'maa (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'auš-',
        pron: 'ah-oosh',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'ḥăzāh',
        hebrewLetters: 'חזה',
        note: 'a different lexeme from Hebrew ראה; the vision formula חָזֵה הֲוֵית (I was seeing) throughout Daniel 7'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'hear',
    english: ['hear', 'listen'],
    hebrew: {
      word: 'שָׁמַע',
      translit: 'shama',
      root: 'שמע',
      note: 'qal perfect, he heard; the Shema (Deuteronomy 6:4) opens with the imperative שְׁמַע'
    },
    forms: {
      akkadian: {
        translit: 'šemû',
        pron: 'sheh-muu',
        note: 'textbook cognate of Hebrew שָׁמַע'
      },
      sumerian: {
        translit: 'ĝeš tuku',
        scriptNote: 'compound verb; the sign sequence is not shown',
        pron: 'gesh too-koo'
      },
      egyptian: {
        translit: 'sḏm',
        script: '𓄔𓅓',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sedjem (modern convention)'
      },
      hittite: {
        translit: 'ištamaš-',
        pron: 'ish-tah-mash',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'šəmaʿ',
        hebrewLetters: 'שמע',
        note: 'Daniel 5:14 שִׁמְעֵת (I have heard)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'give',
    english: ['give'],
    hebrew: { word: 'נָתַן', translit: 'natan', root: 'נתנ', note: 'qal perfect, he gave' },
    forms: {
      akkadian: {
        translit: 'nadānu',
        script: '𒋧',
        scriptNote: 'shown as the logogram SUM, with which the word was commonly written',
        pron: 'nah-daa-nu',
        note: 'textbook cognate of Hebrew נָתַן, with d where Hebrew has t'
      },
      sumerian: {
        translit: 'sum',
        script: '𒋧',
        pron: 'soom',
        note: 'the reading šum2 is also conventional'
      },
      egyptian: {
        translit: 'rdj',
        script: '𓂋𓂞',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'redi (modern convention)',
        note: 'also written with the giving-arm sign alone (dj)'
      },
      hittite: {
        translit: 'pai- / piya-',
        pron: 'pah-ee / pee-yah',
        note: 'attested syllabically; homograph of pai- go — the two verbs are kept apart by their inflection'
      },
      aramaic: {
        translit: 'yəhab',
        hebrewLetters: 'יהב',
        note: 'the common give-verb in Daniel is יהב, a different lexeme (Daniel 2:21 יָהֵב חָכְמְתָא, he gives wisdom); forms of נתן supply its imperfect'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'take',
    english: ['take'],
    hebrew: { word: 'לָקַח', translit: 'laqach', root: 'לקח', note: 'qal perfect, he took' },
    forms: {
      akkadian: {
        translit: 'leqû',
        pron: 'leh-quu',
        note: 'textbook cognate of Hebrew לָקַח'
      },
      egyptian: {
        translit: 'jṯj',
        pron: 'itji (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'dā-',
        pron: 'daa',
        note: 'attested syllabically'
      }
      // sumerian: deliberately empty; take is a compound (šu ti, hand plus TI)
      // whose rendering is not shown.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'know',
    english: ['know'],
    hebrew: { word: 'יָדַע', translit: 'yada', root: 'ידע', note: 'qal perfect, he knew' },
    forms: {
      akkadian: {
        translit: 'idû',
        script: '𒍪',
        scriptNote: 'shown as the logogram ZU, with which the word was commonly written',
        pron: 'ee-duu',
        note: 'cited as idû or edû in the dictionaries; related to Hebrew יָדַע'
      },
      sumerian: {
        translit: 'zu',
        script: '𒍪',
        pron: 'zoo'
      },
      egyptian: {
        translit: 'rḫ',
        script: '𓂋𓐍𓏛',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'rekh (modern convention)'
      },
      hittite: {
        translit: 'šakk-',
        pron: 'shahk',
        note: 'attested syllabically; also šekk-'
      },
      aramaic: {
        translit: 'yədaʿ',
        hebrewLetters: 'ידע',
        note: 'Daniel 2:22 יָדַע מָה בַחֲשׁוֹכָא (he knows what is in the darkness)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'love',
    english: ['love'],
    hebrew: { word: 'אָהַב', translit: 'ahav', root: 'אהב', note: 'qal perfect, he loved' },
    forms: {
      akkadian: {
        translit: 'râmu',
        pron: 'raa-mu'
      },
      egyptian: {
        translit: 'mrj',
        pron: 'meri (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      }
      // sumerian: deliberately empty; love is a compound (ki—áĝ) whose
      // rendering is not shown.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'fear',
    english: ['fear'],
    hebrew: { word: 'יָרֵא', translit: 'yare', root: 'ירא', note: 'qal perfect (stative), he feared' },
    forms: {
      akkadian: {
        translit: 'palāḫu',
        pron: 'pah-laa-khu',
        note: 'to fear, revere'
      },
      egyptian: {
        translit: 'snḏ',
        pron: 'senedj (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      },
      aramaic: {
        translit: 'dəḥal',
        hebrewLetters: 'דחל',
        note: 'a different lexeme from Hebrew ירא; Daniel 7:7 דְּחִילָה (dreadful, of the fourth beast)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'die',
    english: ['die'],
    hebrew: { word: 'מֵת', translit: 'met', root: 'מות', note: 'qal perfect, he died; the hollow root is מות' },
    forms: {
      akkadian: {
        translit: 'mâtu',
        pron: 'maa-tu',
        note: 'textbook cognate of Hebrew מֵת'
      },
      sumerian: {
        translit: 'uš2',
        script: '𒁁',
        pron: 'oosh',
        note: 'written with the sign BAD'
      },
      egyptian: {
        translit: 'mwt',
        script: '𓅓𓏏𓀐',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'mut (modern convention)',
        note: 'the consonants m-w-t match Hebrew מות, a parallel regularly noted in the comparative literature; the sign spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'akk-',
        pron: 'ahk',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'mût',
        hebrewLetters: 'מות',
        note: 'Ezra 7:26 הֵן לְמוֹת (whether for death), among the penalties of the decree; the form is the noun/infinitive — finite verb forms are unattested in Biblical Aramaic'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'live',
    english: ['live'],
    hebrew: { word: 'חָיָה', translit: 'chayah', root: 'חיה', note: 'qal perfect, he lived' },
    forms: {
      akkadian: {
        translit: 'balāṭu',
        script: '𒋾',
        scriptNote: 'shown as the logogram TI (often TI.LA), with which the word was commonly written',
        pron: 'bah-laa-tu'
      },
      sumerian: {
        translit: 'ti',
        script: '𒋾',
        pron: 'tee',
        note: 'written with the sign TI; also read til3'
      },
      egyptian: {
        translit: 'ꜥnḫ',
        script: '𓋹𓈖𓐍',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'ankh (modern convention)'
      },
      hittite: {
        translit: 'ḫuiš-',
        pron: 'hoo-ish',
        note: 'to live, survive; attested syllabically'
      },
      aramaic: {
        translit: 'ḥăyāh',
        hebrewLetters: 'חיה',
        note: 'Daniel 2:4 מַלְכָּא לְעָלְמִין חֱיִי (O king, live forever)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'build',
    english: ['build'],
    hebrew: { word: 'בָּנָה', translit: 'banah', root: 'בנה', note: 'qal perfect, he built' },
    forms: {
      akkadian: {
        translit: 'banû',
        script: '𒆕',
        scriptNote: 'shown as the logogram DU3, with which the word was commonly written',
        pron: 'bah-nuu',
        note: 'textbook cognate of Hebrew בָּנָה'
      },
      sumerian: {
        translit: 'du3',
        script: '𒆕',
        pron: 'doo',
        note: 'written with the sign KAK'
      },
      egyptian: {
        translit: 'qd',
        script: '𓐪𓂧𓀨',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'qed (modern convention)',
        note: 'the sign spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'wete-',
        pron: 'weh-teh',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'bənāh',
        hebrewLetters: 'בנה',
        note: 'Ezra 5:11 בְנֵה (built, of the house built long ago)'
      },
      osa: {
        translit: 'bny',
        tokens: ['b', 'n', 'y'],
        note: 'the verb bny, build, is ubiquitous in Sabaic building inscriptions'
      }
    }
  },
  {
    id: 'write',
    english: ['write'],
    hebrew: { word: 'כָּתַב', translit: 'katav', root: 'כתב', note: 'qal perfect, he wrote' },
    forms: {
      akkadian: {
        translit: 'šaṭāru',
        script: '𒊬',
        scriptNote: 'shown as the logogram SAR, with which the word was commonly written',
        pron: 'shah-taa-ru'
      },
      sumerian: {
        translit: 'sar',
        script: '𒊬',
        pron: 'sar'
      },
      egyptian: {
        translit: 'sš',
        script: '𓏞',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'sesh (modern convention)',
        note: 'also transliterated zẖꜣ'
      },
      hittite: {
        translit: 'ḫatrai-',
        pron: 'hah-trah-ee',
        note: 'to write, send word (of letters and reports); attested syllabically'
      },
      aramaic: {
        translit: 'kətab',
        hebrewLetters: 'כתב',
        note: 'the writing on the wall episode (Daniel 5); Ezra 4:8 כְּתַבוּ (they wrote a letter)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sit',
    english: ['sit', 'dwell'],
    hebrew: { word: 'יָשַׁב', translit: 'yashav', root: 'ישב', note: 'qal perfect, he sat, dwelt' },
    forms: {
      akkadian: {
        translit: 'ašābu',
        script: '𒆪',
        scriptNote: 'shown as the logogram TUSH (the sign KU), with which the word was commonly written',
        pron: 'ah-shaa-bu',
        note: 'Old Babylonian wašābum; cognate of Hebrew יָשַׁב'
      },
      sumerian: {
        translit: 'tuš',
        script: '𒆪',
        pron: 'toosh',
        note: 'written with the sign KU'
      },
      egyptian: {
        translit: 'ḥmsj',
        pron: 'hemsi (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'eš-',
        pron: 'esh',
        note: 'middle-voice forms (he seats himself); a separate verb eš- is the copula be; attested syllabically'
      },
      aramaic: {
        translit: 'yətib',
        hebrewLetters: 'יתב',
        note: 'with t where Hebrew has š; Daniel 7:9 וְעַתִּיק יוֹמִין יְתִב (and the Ancient of Days took his seat)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'stand',
    english: ['stand'],
    hebrew: { word: 'עָמַד', translit: 'amad', root: 'עמד', note: 'qal perfect, he stood' },
    forms: {
      akkadian: {
        translit: 'izuzzu',
        script: '𒁺',
        scriptNote: 'shown as the logogram GUB (the sign DU), with which the word was commonly written',
        pron: 'ee-zuz-zu',
        note: 'also cited as uzuzzu'
      },
      sumerian: {
        translit: 'gub',
        script: '𒁺',
        pron: 'goob',
        note: 'written with the sign DU, the same sign read ĝen (go)'
      },
      egyptian: {
        translit: 'ꜥḥꜥ',
        script: '𓊢𓂝𓂻',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'aha (modern convention)'
      },
      hittite: {
        translit: 'ar-',
        pron: 'ar',
        note: 'middle-voice forms (he stands); attested syllabically'
      },
      aramaic: {
        translit: 'qām',
        hebrewLetters: 'קם',
        note: 'from קום, a different lexeme from Hebrew עמד; Daniel 2:31 קָאֵם (standing, of the statue)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'say',
    english: ['say'],
    hebrew: { word: 'אָמַר', translit: 'amar', root: 'אמר', note: 'qal perfect, he said' },
    forms: {
      akkadian: {
        translit: 'qabû',
        script: '𒅗',
        scriptNote: 'shown as the logogram DUG4 (the sign KA), with which the word was commonly written',
        pron: 'qah-buu'
      },
      sumerian: {
        translit: 'dug4',
        script: '𒅗',
        pron: 'doog',
        note: 'written with the sign KA (ka, mouth)'
      },
      egyptian: {
        translit: 'ḏd',
        script: '𓆓𓂧',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'djed (modern convention)'
      },
      hittite: {
        translit: 'te- / tar-',
        pron: 'teh / tar',
        note: 'the two stems together supply say; attested syllabically'
      },
      aramaic: {
        translit: 'ʾămar',
        hebrewLetters: 'אמר',
        note: 'the answered-and-said formula (עָנֵה... וְאָמַר) throughout Daniel'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'make',
    english: ['make', 'do'],
    hebrew: { word: 'עָשָׂה', translit: 'asah', root: 'עשה', note: 'qal perfect, he made, did' },
    forms: {
      akkadian: {
        translit: 'epēšu',
        script: '𒆕',
        scriptNote: 'shown as the logogram DU3, with which the word was commonly written',
        pron: 'eh-peh-shu'
      },
      sumerian: {
        translit: 'ak',
        script: '𒀝',
        pron: 'ahk'
      },
      egyptian: {
        translit: 'jrj',
        script: '𓁹',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'iri (modern convention)',
        note: 'written with the eye sign'
      },
      hittite: {
        translit: 'iya-',
        pron: 'ee-yah',
        note: 'attested syllabically; a middle-voice verb iya- means march'
      },
      aramaic: {
        translit: 'ʿăbad',
        hebrewLetters: 'עבד',
        note: 'Aramaic עבד means do, make (Daniel 5:1 עֲבַד לְחֶם רַב, made a great feast), whereas Hebrew עבד means work, serve'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'send',
    english: ['send'],
    hebrew: { word: 'שָׁלַח', translit: 'shalach', root: 'שלח', note: 'qal perfect, he sent; also stretch out (the hand)' },
    forms: {
      akkadian: {
        translit: 'šapāru',
        pron: 'shah-paa-ru',
        note: 'the ordinary verb for sending word and letters'
      },
      egyptian: {
        translit: 'hꜣb',
        pron: 'hab (modern convention)',
        note: 'spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'uppa-',
        pron: 'oop-pah',
        note: 'to send (here), of things and persons; attested syllabically'
      },
      aramaic: {
        translit: 'šəlaḥ',
        hebrewLetters: 'שלח',
        note: 'letter formulae in the Elephantine papyri; Ezra 4:11 שְׁלַחוּ (they sent)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
