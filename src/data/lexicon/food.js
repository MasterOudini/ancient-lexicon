// Food & drink entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const FOOD = [
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
        note: 'Daniel 5:1 לְחֶם (there in the extended sense: feast, banquet)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wine',
    english: ['wine'],
    hebrew: { word: 'יַיִן', translit: 'yayin', root: 'יינ' },
    forms: {
      akkadian: {
        translit: 'karānu',
        script: '𒃾',
        scriptNote: 'shown as the logogram GESHTIN, with which the word was commonly written',
        pron: 'ka-raa-nu',
        note: 'the same Akkadian word covers wine and the grapevine'
      },
      sumerian: {
        translit: 'geštin',
        script: '𒃾',
        pron: 'gesh-tin',
        note: 'wine and vine'
      },
      egyptian: {
        translit: 'jrp',
        pron: 'irep (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'wiyanaš',
        pron: 'wee-ya-nash',
        note: 'attested syllabically; a resemblance to Hebrew yayin and Greek oinos is much discussed as a wandering culture word — an interpretation, not an established derivation'
      },
      aramaic: {
        translit: 'ḥămar / ḥamrā',
        hebrewLetters: 'חמרא',
        note: 'a different word from Hebrew yayin; Daniel 5:1 חַמְרָא (the wine at the feast of Belshazzar); Ezra 6:9'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'beer',
    english: ['beer', 'strong drink'],
    hebrew: { word: 'שֵׁכָר', translit: 'shekhar', root: 'שכר', note: 'strong drink; paired with wine in the phrase יַיִן וְשֵׁכָר (Leviticus 10:9)' },
    forms: {
      akkadian: {
        translit: 'šikaru',
        script: '𒁉',
        scriptNote: 'shown as the logogram KASH (the sign BI), with which the word was commonly written',
        pron: 'shi-ka-ru',
        note: 'beer; the standard comparison with Hebrew shekhar — cognate or shared culture word'
      },
      sumerian: {
        translit: 'kaš',
        script: '𒁉',
        pron: 'kash',
        note: 'written with the sign BI'
      },
      egyptian: {
        translit: 'ḥnqt',
        pron: 'henqet (modern convention)',
        note: 'beer; spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        script: '𒁉',
        scriptNote: 'written logographically (KASH, the sign BI); the native Hittite reading is not established'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'oil',
    english: ['oil'],
    // BDB files שֶׁמֶן with the שמן group, whose consonants also write the
    // number eight; the root chip therefore points to שמנ.
    hebrew: { word: 'שֶׁמֶן', translit: 'shemen', root: 'שמנ' },
    forms: {
      akkadian: {
        translit: 'šamnu',
        pron: 'sham-nu'
      },
      sumerian: {
        translit: 'i3',
        script: '𒉌',
        pron: 'ee',
        note: 'the sign NI read i3 for oil; the reading should be checked against corpus records',
        verify: true
      },
      egyptian: {
        translit: 'mrḥt',
        pron: 'merhet (modern convention)',
        note: 'oil, fat; attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'məšaḥ',
        hebrewLetters: 'משח',
        note: 'a different word from Hebrew shemen; Ezra 6:9 מְשַׁח (oil, in the temple provisions)'
      }
      // hittite: deliberately empty; oil words are written with signs outside
      // this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'honey',
    english: ['honey'],
    hebrew: { word: 'דְּבַשׁ', translit: 'dvash', root: 'דבש' },
    forms: {
      akkadian: {
        translit: 'dišpu',
        pron: 'dish-pu',
        note: 'honey, syrup; the standard comparison with Hebrew dvash'
      },
      egyptian: {
        translit: 'bjt',
        pron: 'bit (modern convention)',
        note: 'honey; spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'milit',
        pron: 'mi-lit',
        note: 'honey; the citation form should be checked against CHD corpus records',
        verify: true
      }
      // sumerian: deliberately empty; the honey word lal3 uses a sign outside
      // this database's verified list.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'milk',
    english: ['milk'],
    hebrew: { word: 'חָלָב', translit: 'chalav', root: 'חלב' },
    forms: {
      akkadian: {
        translit: 'šizbu',
        script: '𒂵',
        scriptNote: 'shown as the logogram GA, with which the word was commonly written',
        pron: 'shiz-bu',
        note: 'a different word from Hebrew chalav'
      },
      sumerian: {
        translit: 'ga',
        script: '𒂵',
        pron: 'gah'
      },
      egyptian: {
        translit: 'jrṯt',
        pron: 'iretjet (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        script: '𒂵',
        scriptNote: 'written logographically (GA); the native Hittite reading is not established'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wheat',
    english: ['wheat'],
    hebrew: { word: 'חִטָּה', translit: 'chittah', root: 'חטה' },
    forms: {
      akkadian: {
        translit: 'kibtu',
        pron: 'kib-tu',
        note: 'wheat; not the same word as Hebrew chittah; the citation form should be checked against CAD',
        verify: true
      },
      aramaic: {
        translit: 'ḥinṭīn',
        hebrewLetters: 'חנטין',
        note: 'wheat (plural), with n where Hebrew has doubled ṭ; Ezra 6:9 חִנְטִין (in the temple provisions)'
      }
      // sumerian: deliberately empty; the wheat word gig uses a sign outside
      // this database's verified list.
      // egyptian: deliberately empty; the emmer and wheat words are not
      // securely spelled for this database.
      // hittite: deliberately empty; wheat is written logographically with
      // signs outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'barley',
    english: ['barley'],
    // שְׂעֹרָה is filed under שער, whose consonants also write hair and gate.
    hebrew: { word: 'שְׂעֹרָה', translit: 'seorah', root: 'שער', note: 'usually in the plural שְׂעֹרִים' },
    forms: {
      akkadian: {
        translit: 'uṭṭetu',
        script: '𒊺',
        scriptNote: 'shown as the logogram SHE, with which the word was commonly written',
        pron: 'ut-te-tu',
        note: 'barley, grain; CAD lemmatizes uṭṭetu (AHw has uṭṭatu); check against CAD',
        verify: true
      },
      sumerian: {
        translit: 'še',
        script: '𒊺',
        pron: 'sheh',
        note: 'barley, grain'
      },
      egyptian: {
        translit: 'jt',
        pron: 'it (modern convention)',
        note: 'barley; spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        translit: 'ḫalkiš',
        pron: 'hal-kish',
        note: 'grain, barley; also the name of the grain deity; the citation form should be checked against the Hittite dictionaries (HED, HW²)',
        verify: true
      }
      // aramaic: deliberately empty; the Aramaic barley word is not securely
      // cited in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'vine',
    english: ['vine', 'grapevine'],
    hebrew: { word: 'גֶּפֶן', translit: 'gefen', root: 'גפנ' },
    forms: {
      akkadian: {
        translit: 'karānu',
        script: '𒃾',
        scriptNote: 'shown as the logogram GESHTIN, with which the word was commonly written',
        pron: 'ka-raa-nu',
        note: 'the same Akkadian word covers wine and the grapevine'
      },
      sumerian: {
        translit: 'geštin',
        script: '𒃾',
        pron: 'gesh-tin',
        note: 'the same word and sign write wine and vine'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; the vine is written logographically with
      // the wine sign, filed under wine.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'fig',
    english: ['fig', 'fig tree'],
    hebrew: { word: 'תְּאֵנָה', translit: 'teenah', root: 'תאנ' },
    forms: {
      akkadian: {
        translit: 'tittu',
        pron: 'tit-tu',
        note: 'fig, fig tree; the standard comparison with Hebrew teenah'
      }
      // sumerian: deliberately empty; the fig word pesh3 uses a sign outside
      // this database's verified list.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'olive',
    english: ['olive', 'olive tree'],
    hebrew: { word: 'זַיִת', translit: 'zayit', root: 'זית' },
    forms: {
      akkadian: {
        translit: 'serdu',
        pron: 'ser-du',
        note: 'olive tree; attestation should be checked against CAD',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'pomegranate',
    english: ['pomegranate'],
    hebrew: { word: 'רִמּוֹן', translit: 'rimmon', root: 'רמנ' },
    forms: {
      akkadian: {
        translit: 'nurmû',
        pron: 'nur-moo',
        note: 'pomegranate; whether nurmû and rimmon are related is debated'
      },
      sumerian: {
        translit: 'nu-ur2-ma',
        script: '𒉡𒌫𒈠',
        pron: 'noo-oor-mah',
        note: 'usually preceded by the wood determinative GISH; the writing should be checked against corpus records',
        verify: true
      }
      // egyptian: deliberately empty; the New Kingdom loanword for pomegranate
      // is not securely spelled for this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'salt',
    english: ['salt'],
    hebrew: { word: 'מֶלַח', translit: 'melach', root: 'מלח' },
    forms: {
      akkadian: {
        translit: 'ṭābtu',
        pron: 'taab-tu',
        note: 'salt; a homograph ṭābtu means goodness, kindness'
      },
      egyptian: {
        translit: 'ḥmꜣt',
        pron: 'hemat (modern convention)',
        note: 'attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'məlaḥ',
        hebrewLetters: 'מלח',
        note: 'Ezra 4:14 מְלַח הֵיכְלָא (the salt of the palace); also in the provisions list Ezra 6:9'
      }
      // sumerian: deliberately empty; the salt sign MUN is outside this
      // database's verified list.
      // hittite: deliberately empty; salt is written logographically with a
      // sign outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
