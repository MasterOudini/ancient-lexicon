// Places & directions entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const PLACES = [
  {
    id: 'east',
    english: ['east'],
    hebrew: {
      word: 'קֶדֶם',
      translit: 'qedem',
      root: 'קדמ',
      note: 'qedem is both east and ancient time, aforetime'
    },
    forms: {
      akkadian: {
        translit: 'šadû',
        pron: 'sha-doo',
        note: 'the east wind in the four-winds scheme; šadû is also mountain (see mountain); check the compass use against CAD',
        verify: true
      },
      egyptian: {
        translit: 'jꜣbtt',
        pron: 'iabtet (modern convention)',
        note: 'the east, the eastern side'
      },
      aramaic: {
        translit: 'qŏdām',
        hebrewLetters: 'קדם',
        note: 'the same root, but meaning before, in front of (Daniel 6:11 קֳדָם אֱלָהֵהּ, before his God), not the compass east'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'west',
    english: ['west'],
    // BDB files מַעֲרָב under ערב evening — the sunset side; the root chip
    // therefore points to ערב.
    hebrew: { word: 'מַעֲרָב', translit: 'maarav', root: 'ערב' },
    forms: {
      akkadian: {
        translit: 'amurru',
        pron: 'a-mur-ru',
        note: 'the west wind and the west; the west is also erēb šamši, the setting of the sun, from erēbu (to enter) — the cognate of the Hebrew root; check the compass use against CAD',
        verify: true
      },
      egyptian: {
        translit: 'jmntt',
        pron: 'imentet (modern convention)',
        note: 'the west; also the West as the realm of the dead'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'north',
    english: ['north'],
    hebrew: { word: 'צָפוֹן', translit: 'tsafon', root: 'צפנ' },
    forms: {
      akkadian: {
        translit: 'ištānu',
        pron: 'ish-taa-nu',
        note: 'the north wind and the north (also written iltānu); check the compass use against CAD',
        verify: true
      },
      egyptian: {
        translit: 'mḥtt',
        pron: 'mehtet (modern convention)',
        note: 'the north, the northern side'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'south',
    english: ['south'],
    hebrew: {
      word: 'נֶגֶב',
      translit: 'negev',
      root: 'נגב',
      note: 'the Negev, the dry country south of Judah, hence south as a direction'
    },
    forms: {
      akkadian: {
        translit: 'šūtu',
        pron: 'shoo-tu',
        note: 'the south wind and the south; check the compass use against CAD',
        verify: true
      },
      egyptian: {
        translit: 'rsy',
        pron: 'resy (modern convention)',
        note: 'the south, the southern side'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'right-hand',
    english: ['right hand', 'right side'],
    hebrew: { word: 'יָמִין', translit: 'yamin', root: 'ימנ' },
    forms: {
      akkadian: {
        translit: 'imittu',
        pron: 'i-mit-tu',
        note: 'right hand, right side (beside imnu); the cognate of Hebrew yamin'
      },
      egyptian: {
        translit: 'wnmy',
        pron: 'wenemy (modern convention)',
        note: 'right, the right side'
      },
      hittite: {
        translit: 'kunna-',
        pron: 'kun-na',
        note: 'right (side), favorable; check against corpus records',
        verify: true
      },
      osa: {
        translit: 'ymnt',
        tokens: ['y', 'm', 'n', 't'],
        note: 'Yamnat, the south country (the later Yemen), in the titulature of the later Sabaean and Himyarite kings; check corpus records (DASI/CSAI)',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'left-hand',
    english: ['left hand', 'left side'],
    hebrew: { word: 'שְׂמֹאל', translit: 'smol', root: 'שמאל' },
    forms: {
      akkadian: {
        translit: 'šumēlu',
        pron: 'shu-meh-lu',
        note: 'left hand, left side; the textbook cognate of Hebrew smol'
      },
      egyptian: {
        translit: 'jꜣby',
        pron: 'iaby (modern convention)',
        note: 'left, the left side'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'border',
    english: ['border', 'territory'],
    hebrew: { word: 'גְּבוּל', translit: 'gvul', root: 'גבל' },
    forms: {
      akkadian: {
        translit: 'miṣru',
        pron: 'mits-ru',
        note: 'border, boundary, territory; the boundary stone is kudurru'
      },
      egyptian: {
        translit: 'tꜣš',
        pron: 'tash (modern convention)',
        note: 'border, boundary (as in extending the borders of Egypt)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'ground',
    english: ['ground', 'soil'],
    // The root chip points to אדמ (red / ground / man), defined via red in
    // the roots database.
    hebrew: { word: 'אֲדָמָה', translit: 'adamah', root: 'אדמ' },
    forms: {
      akkadian: {
        translit: 'qaqqaru',
        script: '𒆠',
        scriptNote: 'shown as the logogram KI, with which the word was commonly written',
        pron: 'qaq-qa-ru',
        note: 'ground, soil, terrain'
      },
      sumerian: {
        translit: 'ki',
        script: '𒆠',
        pron: 'kee',
        note: 'earth, ground, place; filed also under earth'
      }
      // egyptian: deliberately empty; tꜣ (earth, land) is filed under earth.
      // hittite: deliberately empty; tekan (earth) is filed under earth.
      // aramaic: deliberately empty; אַרְעָא (the earth) is filed under earth.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'valley',
    english: ['valley'],
    hebrew: { word: 'עֵמֶק', translit: 'emeq', root: 'עמק' },
    forms: {
      egyptian: {
        translit: 'jnt',
        pron: 'inet (modern convention)',
        note: 'valley (as in the Theban Beautiful Festival of the Valley)'
      },
      aramaic: {
        translit: 'biqʿā',
        hebrewLetters: 'בקעה',
        note: 'a different lexeme, the counterpart of Hebrew בִּקְעָה plain; Daniel 3:1 בְּבִקְעַת דּוּרָא (in the plain of Dura)'
      }
      // akkadian: deliberately empty; emqu, the formal cognate of עמק, means
      // wise, and no ordinary valley word is verified for this database.
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  }
]
