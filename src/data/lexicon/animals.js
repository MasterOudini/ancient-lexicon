// Animals entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const ANIMALS = [
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
    id: 'lion',
    english: ['lion'],
    hebrew: { word: 'אַרְיֵה', translit: 'aryeh', root: 'ארי', note: 'also אֲרִי (ari)' },
    forms: {
      akkadian: {
        translit: 'nēšu',
        script: '𒌨𒈤',
        scriptNote: 'shown as the logogram UR.MAH, with which the word was commonly written',
        pron: 'neh-shu',
        note: 'the poetic word labbu matches Hebrew לָבִיא'
      },
      sumerian: {
        translit: 'ur-maḫ',
        script: '𒌨𒈤',
        pron: 'oor-mah'
      },
      egyptian: {
        translit: 'mꜣj',
        pron: 'mai (modern convention)',
        note: 'spellings vary, so no single sign sequence is shown'
      },
      hittite: {
        script: '𒌨𒈤',
        scriptNote: 'written logographically (UR.MAH); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʾaryēh',
        hebrewLetters: 'אריה',
        note: 'Daniel 7:4 כְאַרְיֵה (like a lion); the lions of the den in Daniel 6 are אַרְיָוָתָא'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'horse',
    english: ['horse'],
    hebrew: { word: 'סוּס', translit: 'sus', root: 'סוס' },
    forms: {
      akkadian: {
        translit: 'sīsû',
        script: '𒀲𒆳𒊏',
        scriptNote: 'shown as the logogram ANSHE.KUR.RA, with which the word was commonly written',
        pron: 'see-soo',
        note: 'the same wandering culture word as Hebrew סוּס'
      },
      sumerian: {
        translit: 'anše-kur-ra',
        script: '𒀲𒆳𒊏',
        pron: 'an-sheh koor-ra',
        note: 'literally, donkey of the mountains'
      },
      egyptian: {
        translit: 'ssmt',
        pron: 'sesemet (modern convention)',
        note: 'New Kingdom word; often compared with the Semitic horse word'
      },
      hittite: {
        script: '𒀲𒆳𒊏',
        scriptNote: 'written logographically (ANSHE.KUR.RA); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'sūs',
        hebrewLetters: 'סוס',
        note: 'attestation in Egyptian Aramaic documents should be checked against TAD',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'donkey',
    english: ['donkey', 'ass'],
    hebrew: { word: 'חֲמוֹר', translit: 'chamor', root: 'חמר' },
    forms: {
      akkadian: {
        translit: 'imēru',
        script: '𒀲',
        scriptNote: 'shown as the logogram ANSHE, with which the word was commonly written',
        pron: 'ee-meh-ru',
        note: 'the same animal word as Hebrew חֲמוֹר; Akkadian has no ḥ'
      },
      sumerian: {
        translit: 'anše',
        script: '𒀲',
        pron: 'an-sheh'
      },
      egyptian: {
        translit: 'ꜥꜣ',
        pron: 'aa (modern convention)',
        note: 'a separate Egyptian word ꜥꜣ means great'
      },
      hittite: {
        script: '𒀲',
        scriptNote: 'written logographically (ANSHE); the native Hittite reading is not established',
        note: 'the logogram use should be checked against CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'ḥămār',
        hebrewLetters: 'חמר',
        note: 'the ordinary Aramaic word for donkey (Aramaic חֲמַר wine is a different word); attestation should be checked against TAD',
        verify: true
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'camel',
    english: ['camel'],
    hebrew: { word: 'גָּמָל', translit: 'gamal', root: 'גמל' },
    forms: {
      akkadian: {
        translit: 'gammalu',
        pron: 'gam-ma-lu',
        note: 'in first-millennium sources; matches the West Semitic name of the animal'
      },
      aramaic: {
        translit: 'gəmal',
        hebrewLetters: 'גמל',
        note: 'the ordinary Aramaic word (emphatic גמלא); attestation should be checked against TAD',
        verify: true
      },
      osa: {
        translit: 'gml',
        tokens: ['g', 'm', 'l'],
        note: 'attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; the camel is marginal in Egyptian sources
      // and no dictionary form is verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sheep',
    english: ['sheep', 'lamb'],
    hebrew: { word: 'כֶּבֶשׂ', translit: 'keves', root: 'כבש', note: 'the metathesis doublet כֶּשֶׂב is also attested' },
    forms: {
      akkadian: {
        translit: 'immeru',
        script: '𒇻',
        scriptNote: 'shown as the logogram UDU (the sign LU), with which the word was commonly written',
        pron: 'im-me-ru'
      },
      sumerian: {
        translit: 'udu',
        script: '𒇻',
        pron: 'oo-doo',
        note: 'written with the sign LU'
      },
      hittite: {
        script: '𒇻',
        scriptNote: 'written logographically (UDU); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ʾimmar',
        hebrewLetters: 'אמר',
        note: 'lamb; plural אִמְּרִין Ezra 6:9; the word matches Akkadian immeru'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'goat',
    english: ['goat', 'she-goat'],
    hebrew: { word: 'עֵז', translit: 'ez', root: 'עז' },
    forms: {
      akkadian: {
        translit: 'enzu',
        script: '𒍚',
        scriptNote: 'shown as the logogram UZ3, with which the word was commonly written',
        pron: 'en-zu',
        note: 'the same animal word as Hebrew עֵז'
      },
      sumerian: {
        translit: 'uz3',
        script: '𒍚',
        pron: 'ooz'
      },
      aramaic: {
        translit: 'ʿēz',
        hebrewLetters: 'עז',
        note: 'Ezra 6:17 צְפִירֵי עִזִּין (he-goats)'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'ram',
    english: ['ram'],
    hebrew: { word: 'אַיִל', translit: 'ayil', root: 'איל' },
    forms: {
      aramaic: {
        translit: 'dəkar',
        hebrewLetters: 'דכר',
        note: 'ram, male animal (corresponds to Hebrew זָכָר male); plural דִּכְרִין Ezra 6:9'
      }
      // akkadian: deliberately empty; no securely attested form in this database.
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'cattle',
    english: ['cattle', 'herd'],
    hebrew: { word: 'בָּקָר', translit: 'baqar', root: 'בקר' },
    forms: {
      akkadian: {
        translit: 'littu',
        script: '𒀖',
        scriptNote: 'shown as the logogram AB2, with which the word was commonly written',
        pron: 'lit-tu',
        note: 'cow; Hebrew בָּקָר is a collective (cattle, herd)'
      },
      sumerian: {
        translit: 'ab2',
        script: '𒀖',
        pron: 'ahb',
        note: 'cow'
      }
      // egyptian: deliberately empty; kꜣ (bull) is filed under ox.
      // hittite: deliberately empty; cattle are written GU4 (filed under ox).
      // aramaic: deliberately empty; the ox entry carries tōr (Ezra 6:9 תּוֹרִין).
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'bird',
    english: ['bird'],
    hebrew: { word: 'צִפּוֹר', translit: 'tsippor', root: 'צפר' },
    forms: {
      akkadian: {
        translit: 'iṣṣūru',
        script: '𒄷',
        scriptNote: 'shown as the logogram MUSHEN (the sign HU), with which the word was commonly written',
        pron: 'its-tsoo-ru',
        note: 'the same bird word as Hebrew צִפּוֹר'
      },
      sumerian: {
        translit: 'mušen',
        script: '𒄷',
        pron: 'moo-shen',
        note: 'written with the sign HU'
      },
      egyptian: {
        translit: 'ꜣpd',
        pron: 'aped (modern convention)'
      },
      hittite: {
        script: '𒄷',
        scriptNote: 'written logographically (MUSHEN); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'ṣippar',
        hebrewLetters: 'צפר',
        note: 'צִפֲּרֵי שְׁמַיָּא (the birds of the heavens) in the tree vision of Daniel 4'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'dove',
    english: ['dove', 'pigeon'],
    hebrew: { word: 'יוֹנָה', translit: 'yonah', root: 'יונ' },
    forms: {
      akkadian: {
        translit: 'summatu',
        pron: 'sum-ma-tu',
        note: 'the bird released from the ark in the Gilgamesh flood story'
      }
      // sumerian: deliberately empty; the dove sign readings are not verified
      // for this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'eagle',
    english: ['eagle', 'vulture'],
    hebrew: { word: 'נֶשֶׁר', translit: 'nesher', root: 'נשר' },
    forms: {
      akkadian: {
        translit: 'erû',
        pron: 'eh-roo',
        note: 'a separate Akkadian word erû means copper'
      },
      hittite: {
        translit: 'ḫāraš',
        pron: 'haa-rash',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'nəšar',
        hebrewLetters: 'נשר',
        note: 'Daniel 7:4 גַּפִּין דִּי־נְשַׁר (wings of an eagle)'
      }
      // sumerian: deliberately empty; the eagle sign readings are not verified
      // for this database.
      // egyptian: deliberately empty; bjk falcon is a different bird and is not
      // filed as eagle.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'fish',
    english: ['fish'],
    hebrew: { word: 'דָּג', translit: 'dag', root: 'דג' },
    forms: {
      akkadian: {
        translit: 'nūnu',
        script: '𒄩',
        scriptNote: 'shown as the logogram KU6 (the sign HA), with which the word was commonly written',
        pron: 'noo-nu'
      },
      sumerian: {
        translit: 'ku6',
        script: '𒄩',
        pron: 'koo',
        note: 'written with the sign HA'
      },
      egyptian: {
        translit: 'rm',
        pron: 'rem (modern convention)'
      },
      aramaic: {
        translit: 'nūn',
        hebrewLetters: 'נון',
        note: 'the common Aramaic word, matching Akkadian nūnu; attestation should be checked against TAD',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'snake',
    english: ['snake', 'serpent'],
    hebrew: { word: 'נָחָשׁ', translit: 'nachash', root: 'נחש' },
    forms: {
      akkadian: {
        translit: 'ṣēru',
        script: '𒈲',
        scriptNote: 'shown as the logogram MUSH, with which the word was commonly written',
        pron: 'tseh-ru',
        note: 'a separate Akkadian word ṣēru means steppe, open country'
      },
      sumerian: {
        translit: 'muš',
        script: '𒈲',
        pron: 'moosh'
      },
      egyptian: {
        translit: 'ḥfꜣw',
        pron: 'hefau (modern convention)'
      },
      hittite: {
        script: '𒈲',
        scriptNote: 'written logographically (MUSH); the native Hittite reading is not established'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'scorpion',
    english: ['scorpion'],
    hebrew: { word: 'עַקְרָב', translit: 'aqrav', root: 'עקרב' },
    forms: {
      akkadian: {
        translit: 'zuqaqīpu',
        script: '𒄈𒋰',
        scriptNote: 'shown as the logogram GIR2.TAB, with which the word was commonly written',
        pron: 'zu-qa-qee-pu'
      },
      sumerian: {
        translit: 'gir2-tab',
        script: '𒄈𒋰',
        pron: 'geer-tab'
      },
      egyptian: {
        translit: 'srqt',
        pron: 'serqet (modern convention)',
        note: 'closely tied to the scorpion goddess Serqet; use as the ordinary noun should be checked against Wb.',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wolf',
    english: ['wolf'],
    hebrew: { word: 'זְאֵב', translit: 'zeev', root: 'זאב' },
    forms: {
      akkadian: {
        translit: 'barbaru',
        script: '𒌨𒁇𒊏',
        scriptNote: 'shown as the logogram UR.BAR.RA, with which the word was commonly written',
        pron: 'bar-ba-ru'
      },
      sumerian: {
        translit: 'ur-bar-ra',
        script: '𒌨𒁇𒊏',
        pron: 'oor-bar-ra'
      },
      hittite: {
        script: '𒌨𒁇𒊏',
        scriptNote: 'written logographically (UR.BAR.RA); the native Hittite reading is not established'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'bear',
    english: ['bear'],
    hebrew: { word: 'דֹּב', translit: 'dov', root: 'דב' },
    forms: {
      akkadian: {
        translit: 'dabû',
        pron: 'da-boo',
        note: 'the same animal word as Hebrew דֹּב'
      },
      hittite: {
        translit: 'ḫartaggaš',
        pron: 'har-tag-gash',
        note: 'usually rendered bear; the meaning should be checked against CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'dōb',
        hebrewLetters: 'דב',
        note: 'Daniel 7:5 דָּמְיָה לְדֹב (resembling a bear)'
      }
      // sumerian: deliberately empty; the bear sign (AZ) is outside this
      // database's verified list.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'gazelle',
    english: ['gazelle'],
    hebrew: { word: 'צְבִי', translit: 'tsvi', root: 'צבי' },
    forms: {
      akkadian: {
        translit: 'ṣabītu',
        pron: 'tsa-bee-tu',
        note: 'the same animal word as Hebrew צְבִי'
      },
      egyptian: {
        translit: 'gḥs',
        pron: 'gehes (modern convention)',
        note: 'attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ṭəbī',
        hebrewLetters: 'טבי',
        note: 'Aramaic ṭ here corresponds to Hebrew ṣ (צְבִי); attestation should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; the gazelle logogram uses a sign outside
      // this database's verified list.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'ibex',
    english: ['ibex', 'wild goat'],
    hebrew: { word: 'יָעֵל', translit: 'yael', root: 'יעל', note: 'plural יְעֵלִים, Psalm 104:18' },
    forms: {
      akkadian: {
        translit: 'turāḫu',
        pron: 'tu-raa-khu'
      },
      osa: {
        translit: 'wʿl',
        tokens: ['w', 'ayn', 'l'],
        note: 'Sabaic w here corresponds to Hebrew initial y; the ibex is a recurring motif in Sabaic dedicatory contexts'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  }
]
