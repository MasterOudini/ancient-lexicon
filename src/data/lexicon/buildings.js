// Buildings & the city entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const BUILDINGS = [
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
    id: 'city',
    english: ['city', 'town'],
    hebrew: { word: 'עִיר', translit: 'ir', root: 'עיר' },
    forms: {
      akkadian: {
        translit: 'ālu',
        script: '𒌷',
        scriptNote: 'shown as the logogram URU, with which the word was commonly written',
        pron: 'aa-lu'
      },
      sumerian: {
        translit: 'uru',
        script: '𒌷',
        pron: 'oo-roo',
        note: 'also read iri'
      },
      egyptian: {
        translit: 'njwt',
        script: '𓊖𓏏𓏤',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'niut (modern convention)',
        note: 'city, town'
      },
      aramaic: {
        translit: 'qiryāh',
        hebrewLetters: 'קריה',
        note: 'a different lexeme (Hebrew also has קִרְיָה, chiefly poetic); Ezra 4:12 קִרְיְתָא מָרָדְתָּא (the rebellious city)'
      }
      // hittite: deliberately empty; city appears logographically (URU) and
      // no syllabic form is verified for this database.
      // osa: deliberately empty; the Sabaic town word hgr is a different
      // lexeme whose attestation we have not verified for this database.
    }
  },
  {
    id: 'gate',
    english: ['gate'],
    // שַׁעַר is filed under שער, whose root record also covers hair and
    // barley, written with the same consonants.
    hebrew: { word: 'שַׁעַר', translit: 'shaar', root: 'שער' },
    forms: {
      akkadian: {
        translit: 'abullu',
        script: '𒆍𒃲',
        scriptNote: 'shown as the logogram KA2.GAL, with which the word was commonly written',
        pron: 'ah-bul-lu',
        note: 'city gate; the general word for gate and door is bābu'
      },
      sumerian: {
        translit: 'ka2',
        script: '𒆍',
        pron: 'ka',
        note: 'gate; the city gate is abul, written KA2.GAL'
      },
      egyptian: {
        translit: 'sbꜣ',
        pron: 'seba (modern convention)',
        note: 'door, gateway; the same consonants write sbꜣ star; check Wb.',
        verify: true
      },
      hittite: {
        translit: 'āškaš',
        pron: 'ash-kash',
        note: 'gate(way); attested syllabically; the attestation should be checked against the Hittite dictionaries (HED, HW²)',
        verify: true
      },
      aramaic: {
        translit: 'təraʿ',
        hebrewLetters: 'תרע',
        note: 'a different lexeme from Hebrew shaar; Daniel 2:49 בִּתְרַע מַלְכָּא (at the gate of the king)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wall',
    english: ['wall', 'city wall'],
    hebrew: { word: 'חוֹמָה', translit: 'chomah', root: 'חומ' },
    forms: {
      akkadian: {
        translit: 'dūru',
        script: '𒂦',
        scriptNote: 'shown as the logogram BAD3 (the sign EZEN TIMES BAD), with which the word was commonly written',
        pron: 'doo-ru',
        note: 'city wall, fortification'
      },
      sumerian: {
        translit: 'bad3',
        script: '𒂦',
        pron: 'bad',
        note: 'wall, fortress'
      },
      egyptian: {
        translit: 'jnb',
        pron: 'ineb (modern convention)',
        note: 'wall; the old name of Memphis, jnbw-ḥḏ, means the White Walls'
      },
      aramaic: {
        translit: 'šûr',
        hebrewLetters: 'שור',
        note: 'a different lexeme from Hebrew chomah; the walls of Jerusalem in the Ezra 4 correspondence (Ezra 4:12)'
      }
      // hittite: deliberately empty; wall appears logographically (BAD3) and
      // no syllabic form is verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tower',
    english: ['tower'],
    // BDB files מִגְדָּל under גדל (be great); the root chip therefore
    // points to גדל — a cross-link to great.
    hebrew: { word: 'מִגְדָּל', translit: 'migdal', root: 'גדל' },
    forms: {
      akkadian: {
        translit: 'dimtu',
        pron: 'dim-tu',
        note: 'tower, siege tower'
      },
      osa: {
        translit: 'mḥfd',
        tokens: ['m', 'hh', 'f', 'd'],
        note: 'tower, in Sabaic building inscriptions; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // sumerian: deliberately empty; the tower word (an-za-gar3) uses signs
      // not verified for this database.
      // egyptian: deliberately empty; the New Kingdom fortress word mktr is
      // itself a Semitic loanword (compare migdol), and its spelling is not
      // verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'door',
    english: ['door'],
    hebrew: { word: 'דֶּלֶת', translit: 'delet', root: 'דלת' },
    forms: {
      akkadian: {
        translit: 'daltu',
        script: '𒅅',
        scriptNote: 'shown as the logogram IG, with which the word was commonly written',
        pron: 'dal-tu',
        note: 'the textbook cognate of Hebrew delet'
      },
      sumerian: {
        translit: 'ig',
        script: '𒅅',
        pron: 'ig',
        note: 'door; usually written with the wood determinative (ĝeš)'
      },
      egyptian: {
        translit: 'ꜥꜣ',
        pron: 'aa (modern convention)',
        note: 'door-leaf; the same consonants write ꜥꜣ great; check Wb.',
        verify: true
      }
      // hittite: deliberately empty; door appears logographically (GISH.IG)
      // and no syllabic form is verified for this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tent',
    english: ['tent'],
    hebrew: { word: 'אֹהֶל', translit: 'ohel', root: 'אהל' },
    forms: {
      akkadian: {
        translit: 'kuštāru',
        pron: 'kush-taa-ru',
        note: 'tent (of nomads)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; tent appears logographically (ZA.LAM.GAR)
      // with signs outside this database's verified list.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'way',
    english: ['way', 'road'],
    hebrew: { word: 'דֶּרֶךְ', translit: 'derekh', root: 'דרכ' },
    forms: {
      akkadian: {
        translit: 'ḫarrānu',
        script: '𒆜',
        scriptNote: 'shown as the logogram KASKAL, with which the word was commonly written',
        pron: 'khar-raa-nu',
        note: 'way, road; also caravan, journey'
      },
      sumerian: {
        translit: 'kaskal',
        script: '𒆜',
        pron: 'kas-kal',
        note: 'road, way; journey'
      },
      egyptian: {
        translit: 'wꜣt',
        pron: 'wat (modern convention)',
        note: 'way, road; spellings vary, so no sign sequence is shown'
      },
      hittite: {
        translit: 'palšaš',
        pron: 'pal-shash',
        note: 'way, road (also campaign), the reading behind the logogram KASKAL; check CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'ʾōraḥ',
        hebrewLetters: 'ארח',
        note: 'a different lexeme (Hebrew also has אֹרַח path); Daniel 4:34 וְאֹרְחָתֵהּ (and his ways)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'well',
    english: ['well', 'water source'],
    hebrew: { word: 'בְּאֵר', translit: 'beer', root: 'באר' },
    forms: {
      akkadian: {
        translit: 'būrtu',
        pron: 'boor-tu',
        note: 'well, cistern; the form and range should be checked against CAD',
        verify: true
      },
      sumerian: {
        translit: 'pu2',
        script: '𒇥',
        pron: 'pu',
        note: 'well, cistern; the sign is LAGAB TIMES U, also read tul2'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; a Sabaic well word is not verified for this
      // database.
    }
  },
  {
    id: 'palace',
    english: ['palace', 'temple'],
    hebrew: { word: 'הֵיכָל', translit: 'heikhal', root: 'היכל' },
    forms: {
      akkadian: {
        translit: 'ekallu',
        script: '𒂍𒃲',
        scriptNote: 'shown as the logogram E2.GAL, with which the word was commonly written',
        pron: 'eh-kal-lu',
        note: 'from Sumerian e2-gal (big house)'
      },
      sumerian: {
        translit: 'e2-gal',
        script: '𒂍𒃲',
        pron: 'eh-gal',
        note: 'literally big house'
      },
      egyptian: {
        translit: 'ꜥḥ',
        pron: 'ah (modern convention)',
        note: 'palace; distinct from pr-ꜥꜣ (great house), the palace establishment whose name became the title pharaoh'
      },
      hittite: {
        script: '𒂍𒃲',
        scriptNote: 'written logographically (E2.GAL); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'hêkəlā',
        hebrewLetters: 'היכלא',
        note: 'the palace (emphatic form); also temple; Daniel 5:5 הֵיכְלָא (the palace of the king); Ezra 4:14 (the salt of the palace)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
