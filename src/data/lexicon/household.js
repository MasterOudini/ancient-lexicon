// The household entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const HOUSEHOLD = [
  {
    id: 'lamp',
    english: ['lamp'],
    hebrew: { word: 'נֵר', translit: 'ner', root: 'נר' },
    forms: {
      akkadian: {
        translit: 'nūru',
        pron: 'noo-ru',
        note: 'light; from the same nwr root as Hebrew ner — the lamp itself has other Akkadian words'
      },
      aramaic: {
        translit: 'nūr',
        hebrewLetters: 'נור',
        note: 'fire, not lamp, from the same nwr root; Daniel 3:6 אַתּוּן נוּרָא יָקִדְתָּא (the burning fiery furnace)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'table',
    english: ['table'],
    // BDB files שֻׁלְחָן under שלח (send); the root chip therefore points there.
    hebrew: { word: 'שֻׁלְחָן', translit: 'shulchan', root: 'שלח' },
    forms: {
      akkadian: {
        translit: 'paššūru',
        pron: 'pash-shoo-ru',
        note: 'table, tray; a loanword from Sumerian banšur'
      },
      sumerian: {
        translit: 'banšur',
        pron: 'ban-shur',
        note: 'table, offering table; the source of Akkadian paššūru. The banšur sign is outside the verified sign list of this database, so no glyph is shown'
      }
      // egyptian: deliberately empty; the offering-table words are not
      // securely filed in this database.
      // hittite: deliberately empty; table is written with a Sumerogram whose
      // sign identity we have not verified for this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'cup',
    english: ['cup'],
    hebrew: { word: 'כּוֹס', translit: 'kos', root: 'כוס' },
    forms: {
      akkadian: {
        translit: 'kāsu',
        pron: 'kaa-su',
        note: 'cup, bowl; the textbook cognate of Hebrew kos'
      },
      aramaic: {
        translit: 'kās',
        hebrewLetters: 'כס',
        note: 'the common Aramaic word; attestation should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'bed',
    english: ['bed'],
    // מִטָּה is a noun with preformative mem from נטה stretch out; so BDB.
    hebrew: { word: 'מִטָּה', translit: 'mittah', root: 'נטה' },
    forms: {
      akkadian: {
        translit: 'eršu',
        script: '𒈿',
        scriptNote: 'shown as the logogram NA2, with which the word was commonly written (usually with the wood determinative)',
        pron: 'er-shu'
      },
      aramaic: {
        translit: 'miškab',
        hebrewLetters: 'משכב',
        note: 'a different word, from the root שכב lie down; Daniel 2:28 חֶזְוֵי רֵאשָׁךְ עַל־מִשְׁכְּבָךְ (the visions of your head upon your bed)'
      }
      // sumerian: deliberately empty; the bed word shares the NA2 sign shown
      // with the Akkadian form, and no separate reading is filed here.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'tablet',
    english: ['tablet', 'board'],
    hebrew: { word: 'לוּחַ', translit: 'luach', root: 'לוח' },
    forms: {
      akkadian: {
        translit: 'ṭuppu',
        script: '𒁾',
        scriptNote: 'shown as the logogram DUB, with which the word was commonly written',
        pron: 'tup-pu',
        note: 'clay tablet; a loanword from Sumerian dub (the DUB sign serves as the tab icon of this app). The wooden writing board was a different word, lēʾu.'
      },
      sumerian: {
        translit: 'dub',
        script: '𒁾',
        pron: 'doob'
      },
      hittite: {
        translit: 'tuppi',
        pron: 'tup-pee',
        note: 'clay tablet, a loanword from Akkadian ṭuppu; check the syllabic attestation against CHD',
        verify: true
      }
      // egyptian: deliberately empty; the writing-board words are not
      // securely filed in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'scroll',
    english: ['scroll', 'book', 'document'],
    hebrew: { word: 'סֵפֶר', translit: 'sefer', root: 'ספר' },
    forms: {
      egyptian: {
        translit: 'mḏꜣt',
        pron: 'medjat (modern convention)',
        note: 'papyrus roll, book; check spelling against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'səfar',
        hebrewLetters: 'ספר',
        note: 'Ezra 4:15 סְפַר דָּכְרָנַיָּא (the book of the records); deeds and letters at Elephantine are called ספר'
      }
      // akkadian: deliberately empty; documents were clay tablets, and ṭuppu
      // is filed under tablet.
      // sumerian: deliberately empty; dub (filed under tablet) doubles as
      // document.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'staff',
    english: ['staff', 'rod', 'tribe'],
    // מַטֶּה, like מִטָּה bed, is filed under נטה stretch out; so BDB.
    hebrew: { word: 'מַטֶּה', translit: 'matteh', root: 'נטה' },
    forms: {
      akkadian: {
        translit: 'ḫaṭṭu',
        script: '𒉺',
        scriptNote: 'shown as the logogram PA, with which the word was commonly written',
        pron: 'khat-tu',
        note: 'staff, scepter'
      },
      sumerian: {
        translit: 'gidru',
        script: '𒉺',
        pron: 'gid-ru',
        note: 'staff, scepter; written with the sign PA'
      },
      egyptian: {
        translit: 'mdw',
        script: '𓌃',
        scriptNote: 'linearized; monument spellings vary',
        pron: 'medu (modern convention)',
        note: 'staff, stick; the sign is the walking-stick hieroglyph'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'ring',
    english: ['ring', 'signet ring'],
    hebrew: { word: 'טַבַּעַת', translit: 'tabbaat', root: 'טבע' },
    forms: {
      akkadian: {
        translit: 'kunukku',
        pron: 'ku-nuk-ku',
        note: 'cylinder seal, seal; the Mesopotamian counterpart of the signet ring, not a ring'
      },
      egyptian: {
        translit: 'ḏbꜥt',
        pron: 'djebat (modern convention)',
        note: 'seal, signet; the related ḏbꜥ is finger; check spelling against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ʿizqāh',
        hebrewLetters: 'עזקה',
        note: 'a different word; Daniel 6:18 וְחַתְמַהּ מַלְכָּא בְּעִזְקְתֵהּ (and the king sealed it with his signet ring)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
