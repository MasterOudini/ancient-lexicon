// Field & harvest entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const AGRICULTURE = [
  {
    id: 'plow',
    english: ['plow', 'engrave'],
    hebrew: { word: 'חָרַשׁ', translit: 'charash', root: 'חרש' },
    forms: {
      akkadian: {
        translit: 'erēšu',
        pron: 'eh-reh-shu',
        note: 'to cultivate, plant (a field); the sense division should be checked against CAD',
        verify: true
      },
      sumerian: {
        translit: 'apin',
        script: '𒀳',
        pron: 'ah-pin',
        note: 'the seeder plow (noun); the same sign read uru4 writes the verb to plow'
      },
      egyptian: {
        translit: 'skꜣ',
        pron: 'seka (modern convention)',
        note: 'plow, cultivate; check spelling against Wb.',
        verify: true
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; the Aramaic plowing words are different
      // roots, none securely attested in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'sow',
    english: ['sow'],
    // The root זרע is filed with seed (kinship); BDB files the verb זָרַע there.
    hebrew: { word: 'זָרַע', translit: 'zara', root: 'זרע' },
    forms: {
      akkadian: {
        translit: 'zarû',
        pron: 'za-roo',
        note: 'to sow (broadcast), scatter, winnow; check CAD',
        verify: true
      },
      aramaic: {
        translit: 'zəraʿ',
        hebrewLetters: 'זרע',
        note: 'the root is common Aramaic; Biblical Aramaic attests the noun זְרַע seed (Daniel 2:43)'
      }
      // sumerian: deliberately empty; the seed sign (NUMUN) is outside this
      // database's verified list.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'reap',
    english: ['reap'],
    hebrew: { word: 'קָצַר', translit: 'qatsar', root: 'קצר' },
    forms: {
      akkadian: {
        translit: 'eṣēdu',
        pron: 'eh-tseh-du',
        note: 'to reap, harvest'
      },
      egyptian: {
        translit: 'ꜣsḫ',
        pron: 'asekh (modern convention)',
        note: 'reap (grain); check spelling against Wb.',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; the Aramaic reaping verb is a different
      // root, not filed in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'harvest',
    english: ['harvest', 'harvest season'],
    // קָצִיר is filed under קצר, the root of קָצַר reap.
    hebrew: { word: 'קָצִיר', translit: 'qatsir', root: 'קצר' },
    forms: {
      akkadian: {
        translit: 'ebūru',
        pron: 'eh-boo-ru',
        note: 'harvest, crop; also the harvest season'
      },
      egyptian: {
        translit: 'šmw',
        pron: 'shemu (modern convention)',
        note: 'the harvest and low-water season, one of the three seasons of the Egyptian year'
      }
      // sumerian: deliberately empty; the harvest word buru14 uses a sign
      // outside this database's verified list.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'threshing-floor',
    english: ['threshing floor'],
    hebrew: { word: 'גֹּרֶן', translit: 'goren', root: 'גרנ' },
    forms: {
      akkadian: {
        translit: 'maškanu',
        pron: 'mash-ka-nu',
        note: 'threshing floor is one sense of maškanu (place, site); check the sense division against CAD',
        verify: true
      },
      aramaic: {
        translit: 'ʾiddar',
        hebrewLetters: 'אדר',
        note: 'a different word; Daniel 2:35 כְּעוּר מִן־אִדְּרֵי־קַיִט (like chaff from the summer threshing floors)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'vineyard',
    english: ['vineyard'],
    hebrew: { word: 'כֶּרֶם', translit: 'kerem', root: 'כרמ' },
    forms: {
      egyptian: {
        translit: 'kꜣmw',
        pron: 'kamu (modern convention)',
        note: 'vineyard, orchard; often compared with the Semitic vineyard word; check spelling against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'kerem',
        hebrewLetters: 'כרם',
        note: 'the common Aramaic word; attestation should be checked against TAD',
        verify: true
      },
      osa: {
        translit: 'krm',
        tokens: ['k', 'r', 'm'],
        note: 'vineyard; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // akkadian: deliberately empty; the similar-looking word karmu means
      // ruin mound, not vineyard, and is deliberately not shown.
      // sumerian: deliberately empty; the garden word kiri6 uses a sign
      // reading we have not verified for this database.
    }
  },
  {
    id: 'flock',
    english: ['flock', 'sheep and goats'],
    hebrew: { word: 'צֹאן', translit: 'tson', root: 'צאנ' },
    forms: {
      akkadian: {
        translit: 'ṣēnu',
        pron: 'tseh-nu',
        note: 'flock of sheep and goats; the textbook cognate of Hebrew tson'
      },
      egyptian: {
        translit: 'ꜥwt',
        pron: 'awet (modern convention)',
        note: 'small cattle, flocks; check spelling against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ʿān',
        hebrewLetters: 'ען',
        note: 'with ʿayin where Hebrew has tsade (a regular correspondence); attestation should be checked against TAD',
        verify: true
      }
      // sumerian: deliberately empty; udu is the sheep word, and no flock
      // collective is filed in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'fruit',
    english: ['fruit'],
    hebrew: { word: 'פְּרִי', translit: 'pri', root: 'פרה' },
    forms: {
      akkadian: {
        translit: 'inbu',
        script: '𒄧',
        scriptNote: 'shown as the logogram GURUN, with which the word was commonly written',
        pron: 'in-bu',
        note: 'fruit; also blossom'
      },
      sumerian: {
        translit: 'gurun',
        script: '𒄧',
        pron: 'goo-roon'
      },
      egyptian: {
        translit: 'prt',
        pron: 'peret (modern convention)',
        note: 'fruit, seed; the same word is filed under seed; attestation should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ʾinb',
        hebrewLetters: 'אנב',
        note: 'Daniel 4:9 וְאִנְבֵּהּ (and its fruit), in the tree vision; corresponds to Akkadian inbu'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'branch',
    english: ['branch'],
    hebrew: { word: 'עָנָף', translit: 'anaf', root: 'ענפ' },
    forms: {
      aramaic: {
        translit: 'ʿănaf',
        hebrewLetters: 'ענף',
        note: 'Daniel 4:9 וּבְעַנְפוֹהִי יְדוּרָן צִפֲּרֵי שְׁמַיָּא (and in its branches dwelt the birds of the heavens)'
      }
      // akkadian: deliberately empty; no securely attested form in this database.
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'root',
    english: ['root (of a plant)'],
    hebrew: { word: 'שֹׁרֶשׁ', translit: 'shoresh', root: 'שרש' },
    forms: {
      akkadian: {
        translit: 'šuršu',
        pron: 'shur-shu',
        note: 'root; the textbook cognate of Hebrew shoresh'
      },
      aramaic: {
        translit: 'šoreš',
        hebrewLetters: 'שרש',
        note: 'Daniel 4:12 עִקַּר שָׁרְשׁוֹהִי (the stump of its roots)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'grass',
    english: ['grass', 'herbage'],
    hebrew: { word: 'עֵשֶׂב', translit: 'esev', root: 'עשב' },
    forms: {
      akkadian: {
        translit: 'šammu',
        script: '𒌑',
        scriptNote: 'shown as the logogram U2, with which the word was commonly written',
        pron: 'sham-mu',
        note: 'plant, herbage, grass'
      },
      sumerian: {
        translit: 'u2',
        script: '𒌑',
        pron: 'oo',
        note: 'plant, grass'
      },
      aramaic: {
        translit: 'ʿiśbā',
        hebrewLetters: 'עשבא',
        note: 'Daniel 4:30 עִשְׂבָּא כְתוֹרִין יֵאכֻל (he ate grass like oxen), of Nebuchadnezzar'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'thorn',
    english: ['thorn'],
    hebrew: { word: 'קוֹץ', translit: 'qots', root: 'קוצ' },
    forms: {
      // akkadian: deliberately empty; the thornbush words are not securely
      // filed in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
    }
  }
]
