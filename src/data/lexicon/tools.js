// Tools & materials entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const TOOLS = [
  {
    id: 'sword',
    english: ['sword'],
    hebrew: { word: 'חֶרֶב', translit: 'cherev', root: 'חרב' },
    forms: {
      akkadian: {
        translit: 'patru',
        script: '𒄈',
        scriptNote: 'shown as the logogram GIR2, with which the word was commonly written',
        pron: 'pat-ru',
        note: 'sword, dagger'
      },
      sumerian: {
        translit: 'gir2',
        script: '𒄈',
        pron: 'gir',
        note: 'dagger, knife'
      },
      egyptian: {
        translit: 'ḫpš',
        pron: 'khepesh (modern convention)',
        note: 'the sickle-sword (khopesh); the same word ḫpš means foreleg, strong arm'
      },
      aramaic: {
        translit: 'ḥereb',
        hebrewLetters: 'חרב',
        note: 'the common Aramaic word (later ḥarbā); check Imperial Aramaic attestation against TAD',
        verify: true
      }
      // hittite: deliberately empty; sword and dagger appear logographically
      // (GIR2) and no syllabic form is verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'bow',
    english: ['bow'],
    hebrew: { word: 'קֶשֶׁת', translit: 'qeshet', root: 'קשת' },
    forms: {
      akkadian: {
        translit: 'qaštu',
        script: '𒉼',
        scriptNote: 'shown as the logogram PAN, with which the word was commonly written',
        pron: 'kash-tu',
        note: 'the textbook cognate of Hebrew qeshet'
      },
      sumerian: {
        translit: 'pan',
        script: '𒉼',
        pron: 'pan',
        note: 'also read ban; usually written with the wood determinative (ĝeš)',
        verify: true
      },
      egyptian: {
        translit: 'pḏt',
        pron: 'pedjet (modern convention)',
        note: 'bow; spellings vary, so no sign sequence is shown'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'arrow',
    english: ['arrow'],
    hebrew: { word: 'חֵץ', translit: 'chets', root: 'חצצ' },
    forms: {
      akkadian: {
        translit: 'šiltāḫu',
        pron: 'shil-taa-khu',
        note: 'arrow; uṣṣu is also attested'
      },
      sumerian: {
        translit: 'ti',
        script: '𒋾',
        pron: 'tee',
        note: 'arrow; the sign TI also writes ti (life)'
      },
      egyptian: {
        translit: 'šsr',
        pron: 'shesher (modern convention)',
        note: 'arrow; attestation and spelling should be checked against Wb.',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'vessel',
    english: ['vessel', 'implement'],
    // BDB files כְּלִי under כלה (be complete); the root chip therefore
    // points to כלה.
    hebrew: { word: 'כְּלִי', translit: 'kli', root: 'כלה' },
    forms: {
      akkadian: {
        translit: 'unūtu',
        pron: 'oo-noo-tu',
        note: 'utensils, equipment, gear; a clay pot is karpatu'
      },
      sumerian: {
        translit: 'dug',
        script: '𒂁',
        pron: 'doog',
        note: 'pot, vessel (of clay)'
      },
      aramaic: {
        translit: 'māʾn',
        hebrewLetters: 'מאן',
        note: 'a different lexeme from Hebrew kli; Daniel 5:2 מָאנֵי דַהֲבָא (the vessels of gold); Ezra 5:14'
      }
      // egyptian: deliberately empty; no single dictionary form for vessel is
      // verified for this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'seal',
    english: ['seal', 'signet'],
    hebrew: { word: 'חוֹתָם', translit: 'chotam', root: 'חתמ' },
    forms: {
      akkadian: {
        translit: 'kunukku',
        pron: 'ku-nuk-ku',
        note: 'seal, cylinder seal; also a sealed document'
      },
      egyptian: {
        translit: 'ḫtm',
        pron: 'khetem (modern convention)',
        note: 'seal, signet; also the verb to seal'
      },
      aramaic: {
        translit: 'ḥătam',
        hebrewLetters: 'חתם',
        note: 'Daniel 6:18 וְחַתְמַהּ (and the king sealed it with his signet)'
      }
      // sumerian: deliberately empty; the seal word kishib is written with a
      // sign outside this database's verified list.
      // hittite: deliberately empty; seal appears logographically (NA4.KISHIB)
      // with a sign outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'garment',
    english: ['garment', 'clothing'],
    hebrew: {
      word: 'שִׂמְלָה',
      translit: 'simlah',
      root: 'שמל',
      note: 'the metathesis doublet שַׂלְמָה is also attested'
    },
    forms: {
      akkadian: {
        translit: 'ṣubātu',
        script: '𒌆',
        scriptNote: 'shown as the logogram TUG2, with which the word was commonly written',
        pron: 'tsu-baa-tu'
      },
      sumerian: {
        translit: 'tug2',
        script: '𒌆',
        pron: 'toog',
        note: 'garment, cloth'
      },
      egyptian: {
        translit: 'ḥbs',
        pron: 'hebes (modern convention)',
        note: 'garment, clothing; attestation and spelling should be checked against Wb.',
        verify: true
      },
      hittite: {
        script: '𒌆',
        scriptNote: 'written logographically (TUG2); the native Hittite reading is not established',
        note: 'the logogram use should be checked against CHD corpus records',
        verify: true
      },
      aramaic: {
        translit: 'ləbûš',
        hebrewLetters: 'לבוש',
        note: 'a different lexeme (from lbš, clothe); Daniel 7:9 לְבוּשֵׁהּ (his garment, white as snow)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'silver',
    english: ['silver', 'money'],
    hebrew: { word: 'כֶּסֶף', translit: 'kesef', root: 'כספ' },
    forms: {
      akkadian: {
        translit: 'kaspu',
        script: '𒆬𒌓',
        scriptNote: 'shown as the logogram KU3.BABBAR (the BABBAR component is the sign UD), with which the word was commonly written',
        pron: 'kas-pu',
        note: 'the textbook cognate of Hebrew kesef'
      },
      sumerian: {
        translit: 'ku3-babbar',
        script: '𒆬𒌓',
        pron: 'koo-bab-bar',
        note: 'literally shining (white) precious metal'
      },
      egyptian: {
        translit: 'ḥḏ',
        pron: 'hedj (modern convention)',
        note: 'literally the white (metal)'
      },
      hittite: {
        script: '𒆬𒌓',
        scriptNote: 'written logographically (KU3.BABBAR); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'kəsap',
        hebrewLetters: 'כסף',
        note: 'money and silver throughout Elephantine legal documents; Daniel 2:32 דִּי כְסַף (of silver, the statue)'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'gold',
    english: ['gold'],
    hebrew: { word: 'זָהָב', translit: 'zahav', root: 'זהב' },
    forms: {
      akkadian: {
        translit: 'ḫurāṣu',
        script: '𒆬𒄀',
        scriptNote: 'shown as the logogram KU3.GI, with which the word was commonly written',
        pron: 'khu-raa-tsu'
      },
      sumerian: {
        translit: 'ku3-sig17',
        script: '𒆬𒄀',
        pron: 'koo-sig',
        note: 'written KU3.GI; the second sign is read sig17 in this word',
        verify: true
      },
      egyptian: {
        translit: 'nbw',
        script: '𓋞',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'nebu (modern convention)',
        note: 'commonly written with the gold-collar sign'
      },
      hittite: {
        script: '𒆬𒄀',
        scriptNote: 'written logographically (KU3.GI); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'dəhab',
        hebrewLetters: 'דהב',
        note: 'Daniel 2:32 דִּי־דְהַב טָב (of fine gold, the head of the statue); Aramaic d corresponds to Hebrew z in this word'
      },
      osa: {
        translit: 'ḏhb',
        tokens: ['dh', 'h', 'b'],
        note: 'in Sabaic dedicatory formulas, where the sense gold or bronze is debated; check corpus records (DASI/CSAI)',
        verify: true
      }
    }
  },
  {
    id: 'copper',
    english: ['copper', 'bronze'],
    // נְחֹשֶׁת is filed with the consonants נחש, whose root record covers
    // snake, divination, and bronze.
    hebrew: { word: 'נְחֹשֶׁת', translit: 'nechoshet', root: 'נחש' },
    forms: {
      akkadian: {
        translit: 'erû',
        script: '𒍏',
        scriptNote: 'shown as the logogram URUDU, with which the word was commonly written',
        pron: 'eh-roo'
      },
      sumerian: {
        translit: 'urudu',
        script: '𒍏',
        pron: 'oo-roo-doo'
      },
      egyptian: {
        translit: 'bjꜣ',
        pron: 'bia (modern convention)',
        note: 'a metal word of debated range (copper, ore; bjꜣ n pt, metal of the sky, is meteoric iron); check Wb.',
        verify: true
      },
      aramaic: {
        translit: 'nəḥāš',
        hebrewLetters: 'נחש',
        note: 'Daniel 2:32 דִּי נְחָשׁ (of bronze, the belly and thighs of the statue)'
      }
      // hittite: deliberately empty; copper appears logographically (URUDU)
      // and no syllabic form is verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'iron',
    english: ['iron'],
    hebrew: { word: 'בַּרְזֶל', translit: 'barzel', root: 'ברזל' },
    forms: {
      akkadian: {
        translit: 'parzillu',
        script: '𒀭𒁇',
        scriptNote: 'shown as the logogram AN.BAR, with which the word was commonly written',
        pron: 'par-zil-lu',
        note: 'the parallel form of the same culture-word'
      },
      sumerian: {
        translit: 'an-bar',
        script: '𒀭𒁇',
        pron: 'an-bar'
      },
      hittite: {
        translit: 'ḫapalki',
        pron: 'ha-pal-ki',
        note: 'iron; a loanword from Hattic (standard doctrine); attested syllabically'
      },
      aramaic: {
        translit: 'parzel',
        hebrewLetters: 'פרזל',
        note: 'Daniel 2:33 דִּי פַרְזֶל (of iron, the legs of the statue); Daniel 7:7 שִׁנַּיִן דִּי־פַרְזֶל (teeth of iron)'
      }
      // egyptian: deliberately empty; iron appears late (bjꜣ n pt, meteoric
      // iron) and no single dictionary form is verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
