// Qualities & abstracts entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const QUALITIES = [
  {
    id: 'great',
    english: ['great', 'big', 'large'],
    hebrew: { word: 'גָּדוֹל', translit: 'gadol', root: 'גדל' },
    forms: {
      akkadian: {
        translit: 'rabû',
        script: '𒃲',
        scriptNote: 'shown as the logogram GAL, with which the word was commonly written',
        pron: 'ra-boo'
      },
      sumerian: {
        translit: 'gal',
        script: '𒃲',
        pron: 'gal'
      },
      egyptian: {
        translit: 'wr / ꜥꜣ',
        script: '𓅨𓂋',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'wer; aa (modern convention)',
        note: 'wr is shown; ꜥꜣ 𓉻 is also attested for great'
      },
      hittite: {
        translit: 'šalliš',
        pron: 'shal-lish',
        note: 'attested syllabically'
      },
      aramaic: {
        translit: 'rab',
        hebrewLetters: 'רב',
        note: 'Daniel 2:35 טוּר רַב (a great mountain); a different word from Hebrew גָּדוֹל'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'good',
    english: ['good'],
    hebrew: { word: 'טוֹב', translit: 'tov', root: 'טוב' },
    forms: {
      akkadian: {
        translit: 'ṭābu',
        script: '𒄭',
        scriptNote: 'shown as the logogram DUG3 (the sign HI), with which the word was commonly written',
        pron: 'taa-bu',
        note: 'the same root as Hebrew tov'
      },
      sumerian: {
        translit: 'dug3',
        script: '𒄭',
        pron: 'doog',
        note: 'good, sweet; written with the sign HI'
      },
      egyptian: {
        translit: 'nfr',
        script: '𓄤𓆑𓂋',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'nefer (modern convention)',
        note: 'good, beautiful, perfect'
      },
      hittite: {
        translit: 'āššu-',
        pron: 'ash-shu',
        note: 'attested syllabically; dictionary stem form'
      },
      aramaic: {
        translit: 'ṭāb',
        hebrewLetters: 'טב',
        note: 'Daniel 2:32 דִּי־דְהַב טָב (its head of fine gold); the same root as the Hebrew word'
      }
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'evil',
    english: ['evil', 'bad'],
    hebrew: { word: 'רַע', translit: 'ra', root: 'רעע' },
    forms: {
      akkadian: {
        translit: 'lemnu',
        pron: 'lem-nu',
        note: 'evil, bad; an equivalent, not a cognate'
      },
      egyptian: {
        translit: 'bjn',
        pron: 'bin (modern convention)',
        note: 'bad, evil'
      },
      hittite: {
        translit: 'idalu-',
        pron: 'ee-da-lu',
        note: 'evil, bad; attested syllabically; dictionary stem form'
      },
      aramaic: {
        translit: 'bəʾīš',
        hebrewLetters: 'באיש',
        note: 'evil, bad; the rebellious and evil city of Ezra 4:12; the exact written form should be checked',
        verify: true
      }
      // sumerian: deliberately empty; the usual word ḫul is written with a sign
      // outside this database's verified list.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'small',
    english: ['small', 'young'],
    hebrew: { word: 'קָטָן', translit: 'qatan', root: 'קטנ' },
    forms: {
      akkadian: {
        translit: 'ṣeḫru',
        script: '𒌉',
        scriptNote: 'shown as the logogram TUR, with which the word was commonly written',
        pron: 'tseh-khru',
        note: 'small, young; the same word appears under child'
      },
      sumerian: {
        translit: 'tur',
        script: '𒌉',
        pron: 'toor'
      },
      egyptian: {
        translit: 'šrj',
        pron: 'sheri (modern convention)',
        note: 'small, little; also child; attestation should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'zəʿēr',
        hebrewLetters: 'זעיר',
        note: 'Daniel 7:8 קֶרֶן ... זְעֵירָה (a little horn); a different word from Hebrew qatan'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'new',
    english: ['new'],
    hebrew: { word: 'חָדָשׁ', translit: 'chadash', root: 'חדש' },
    forms: {
      akkadian: {
        translit: 'eššu',
        pron: 'esh-shu',
        note: 'new; the related verb edēšu (to be renewed) is the standard comparison with Hebrew chadash'
      },
      egyptian: {
        translit: 'mꜣw',
        pron: 'mau (modern convention)',
        note: 'new; attestation should be checked against Wb.',
        verify: true
      },
      hittite: {
        translit: 'newa-',
        pron: 'neh-wa',
        note: 'attested syllabically; dictionary stem form'
      },
      aramaic: {
        translit: 'ḥădat',
        hebrewLetters: 'חדת',
        note: 'new; Aramaic t corresponds to Hebrew š in this root'
      }
      // sumerian: deliberately empty; the usual writing gibil uses a sign outside
      // this database's verified list.
      // osa: deliberately empty; the verb ḥdṯ (renew, restore) is carried on the
      // root record, not as an entry form.
    }
  },
  {
    id: 'old',
    english: ['old'],
    hebrew: {
      word: 'יָשָׁן',
      translit: 'yashan',
      root: 'ישנ',
      note: 'old (of things); the old person is זָקֵן, filed under elder'
    },
    forms: {
      akkadian: {
        translit: 'labīru',
        pron: 'la-bee-ru',
        note: 'old, ancient (of things)'
      },
      egyptian: {
        translit: 'jsw',
        pron: 'isu (modern convention)',
        note: 'old (of things); attestation should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ʿattīq',
        hebrewLetters: 'עתיק',
        note: 'Daniel 7:9 עַתִּיק יוֹמִין (Ancient of Days); a different word from Hebrew yashan'
      }
      // sumerian: deliberately empty; the usual writing (libir) uses a sign outside
      // this database's verified list.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'strong',
    english: ['strong', 'firm'],
    hebrew: { word: 'חָזָק', translit: 'chazaq', root: 'חזק' },
    forms: {
      akkadian: {
        translit: 'dannu',
        script: '𒆗',
        scriptNote: 'shown as the logogram KAL (KALAG), with which the word was commonly written',
        pron: 'dan-nu',
        note: 'strong, mighty; an equivalent, not a cognate'
      },
      sumerian: {
        translit: 'kalag',
        script: '𒆗',
        pron: 'kah-lag',
        note: 'strong, mighty, as in the royal epithet lugal kalag-ga (mighty king)'
      },
      egyptian: {
        translit: 'wsr',
        pron: 'user (modern convention)',
        note: 'strong, mighty, powerful'
      },
      aramaic: {
        translit: 'taqqīf',
        hebrewLetters: 'תקיף',
        note: 'Daniel 2:40 תַקִּיפָה (strong as iron, of the fourth kingdom); a different word from Hebrew chazaq'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wise',
    english: ['wise'],
    hebrew: { word: 'חָכָם', translit: 'chakham', root: 'חכמ' },
    forms: {
      akkadian: {
        translit: 'emqu',
        pron: 'em-ku',
        note: 'wise, experienced; an equivalent, not a cognate'
      },
      egyptian: {
        translit: 'rḫ-ḫt',
        pron: 'rekh-khet (modern convention)',
        note: 'literally: one who knows things — the Egyptian expression for the wise man'
      },
      aramaic: {
        translit: 'ḥakkīm',
        hebrewLetters: 'חכים',
        note: 'Daniel 2:21 לְחַכִּימִין (to the wise); the same root as Hebrew chakham'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'holy',
    english: ['holy'],
    hebrew: { word: 'קָדוֹשׁ', translit: 'qadosh', root: 'קדש' },
    forms: {
      akkadian: {
        translit: 'qašdu',
        pron: 'kash-du',
        note: 'holy; the same root as Hebrew qadosh; the ordinary Akkadian word for pure, holy is ellu'
      },
      sumerian: {
        translit: 'ku3',
        script: '𒆬',
        pron: 'koo',
        note: 'pure, sacred; also the word for precious metal'
      },
      egyptian: {
        translit: 'ḏsr',
        pron: 'djeser (modern convention)',
        note: 'sacred, set apart — an Egyptian concept of its own, not an equation with Hebrew qadosh'
      },
      aramaic: {
        translit: 'qaddīš',
        hebrewLetters: 'קדיש',
        note: 'Daniel 4:10 עִיר וְקַדִּישׁ (a watcher and a holy one) coming down from heaven'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'full',
    english: ['full'],
    hebrew: { word: 'מָלֵא', translit: 'male', root: 'מלא' },
    forms: {
      akkadian: {
        translit: 'malû',
        pron: 'ma-loo',
        note: 'to be full, to fill; the same root as Hebrew male'
      },
      egyptian: {
        translit: 'mḥ',
        pron: 'meh (modern convention)',
        note: 'to fill, be full'
      },
      aramaic: {
        translit: 'məlā',
        hebrewLetters: 'מלא',
        note: 'Daniel 2:35 וּמְלָת כָּל־אַרְעָא (and it filled the whole earth); the same root as the Hebrew word'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'many',
    english: ['many', 'much'],
    hebrew: { word: 'רַב', translit: 'rav', root: 'רבב' },
    forms: {
      akkadian: {
        translit: 'mādu',
        pron: 'maa-du',
        note: 'many, numerous; the cognate of the Hebrew root is rabû (great), filed under great'
      },
      egyptian: {
        translit: 'ꜥšꜣ',
        pron: 'asha (modern convention)',
        note: 'many, numerous'
      },
      hittite: {
        translit: 'mekki-',
        pron: 'mek-kee',
        note: 'much, many; attested syllabically; dictionary stem form'
      },
      aramaic: {
        translit: 'śaggīʾ',
        hebrewLetters: 'שגיא',
        note: 'Daniel 7:5 בְּשַׂר שַׂגִּיא (much flesh); Aramaic rab (see great) is the great, chief word'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'word',
    english: ['word', 'matter'],
    hebrew: { word: 'דָּבָר', translit: 'davar', root: 'דבר' },
    forms: {
      akkadian: {
        translit: 'awātu',
        script: '𒅗',
        scriptNote: 'shown as the logogram INIM (a reading of the sign KA), with which the word was commonly written',
        pron: 'a-waa-tu',
        note: 'word, matter; later form amātu'
      },
      sumerian: {
        translit: 'inim',
        script: '𒅗',
        pron: 'ee-nim',
        note: 'word; a reading of the sign KA (mouth), which read gu3 means voice'
      },
      egyptian: {
        translit: 'mdw',
        pron: 'medu (modern convention)',
        note: 'word, speech; mdw-nṯr (words of the god) is the Egyptian name for the hieroglyphic script'
      },
      aramaic: {
        translit: 'millāh',
        hebrewLetters: 'מלה',
        note: 'Daniel 4:28 מִלְּתָא (the word), while it was in the mouth of the king'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'voice',
    english: ['voice', 'sound'],
    hebrew: { word: 'קוֹל', translit: 'qol', root: 'קול' },
    forms: {
      akkadian: {
        translit: 'rigmu',
        pron: 'rig-mu',
        note: 'voice, cry, noise; from ragāmu (to call out); an equivalent, not a cognate'
      },
      sumerian: {
        translit: 'gu3',
        script: '𒅗',
        pron: 'goo',
        note: 'voice, cry; a reading of the sign KA (mouth), which read inim means word'
      },
      egyptian: {
        translit: 'ḫrw',
        pron: 'kheru (modern convention)',
        note: 'voice, sound; as in the epithet mꜣꜥ-ḫrw (true of voice) of the justified dead'
      },
      aramaic: {
        translit: 'qāl',
        hebrewLetters: 'קל',
        note: 'Daniel 4:28 קָל מִן־שְׁמַיָּא נְפַל (a voice fell from heaven); the same word as Hebrew qol'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'truth',
    english: ['truth'],
    hebrew: {
      word: 'אֱמֶת',
      translit: 'emet',
      root: 'אמנ',
      note: 'filed under the root אמנ (be firm, faithful) by dictionary convention'
    },
    forms: {
      akkadian: {
        translit: 'kittu',
        pron: 'kit-tu',
        note: 'truth, right order; from kânu (to be firm) — an equivalent whose firm-to-true development parallels the Hebrew root'
      },
      egyptian: {
        translit: 'mꜣꜥt',
        pron: 'maat (modern convention)',
        note: 'truth, right order — the goddess-concept Maat, the cosmic order the king upholds; broader than the Hebrew word'
      },
      aramaic: {
        translit: 'qəšoṭ',
        hebrewLetters: 'קשט',
        note: 'Daniel 2:47 מִן־קְשֹׁט (in truth); a different word from Hebrew emet'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'justice',
    english: ['justice', 'judgment'],
    hebrew: { word: 'מִשְׁפָּט', translit: 'mishpat', root: 'שפט' },
    forms: {
      akkadian: {
        translit: 'dīnu',
        script: '𒁲',
        scriptNote: 'shown as the logogram DI, with which the word was commonly written',
        pron: 'dee-nu',
        note: 'judgment, lawsuit; the verb dânu means to judge; an equivalent, not a cognate'
      },
      sumerian: {
        translit: 'di',
        script: '𒁲',
        pron: 'dee',
        note: 'lawsuit, judgment; di ku5 (to cut a case) is to render judgment'
      },
      aramaic: {
        translit: 'dīn',
        hebrewLetters: 'דין',
        note: 'Daniel 7:10 דִּינָא יְתִב (the court sat in judgment); Hebrew has the same word דִּין beside mishpat'
      }
      // egyptian: deliberately empty; right order is covered by mꜣꜥt, filed under truth.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'work',
    english: ['work', 'occupation'],
    hebrew: {
      word: 'מְלָאכָה',
      translit: 'melakhah',
      root: 'לאכ',
      note: 'filed under לאכ, the root of מַלְאָךְ (messenger), by dictionary convention'
    },
    forms: {
      akkadian: {
        translit: 'šipru',
        pron: 'ship-ru',
        note: 'work, task, commission — from šapāru (to send), as melakhah is filed with malakh (messenger)'
      },
      egyptian: {
        translit: 'bꜣkw',
        pron: 'baku (modern convention)',
        note: 'work, labor, dues; the same word group as bꜣk servant, filed under servant'
      },
      aramaic: {
        translit: 'ʿăbīdāh',
        hebrewLetters: 'עבידה',
        note: 'Ezra 4:24 עֲבִידַת בֵּית־אֱלָהָא (the work on the house of God); from the root עבד, see servant'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
