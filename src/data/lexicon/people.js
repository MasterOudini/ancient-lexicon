// People & society entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const PEOPLE = [
  {
    id: 'enemy',
    english: ['enemy'],
    hebrew: { word: 'אֹיֵב', translit: 'oyev', root: 'איב' },
    forms: {
      akkadian: {
        translit: 'nakru',
        pron: 'nak-ru',
        note: 'the ordinary Akkadian word for enemy, a functional equivalent; the cognate of אֹיֵב is ayyābu, also attested'
      },
      aramaic: {
        translit: 'śānēʾ',
        hebrewLetters: 'שנא',
        note: 'hater, enemy — a different lexeme; Daniel 4:16, may the dream be for those who hate you'
      }
      // egyptian: deliberately empty; the enemy words (ḫftj, ḫrwy) have
      // spellings not verified for this database.
      // hittite: deliberately empty; enemy is covered by kurur (hostility),
      // filed under war.
    }
  },
  {
    id: 'friend',
    english: ['friend', 'companion', 'neighbor'],
    // רֵעַ is conventionally filed under a second רעה group; the root record
    // is defined with shepherd.
    hebrew: { word: 'רֵעַ', translit: 'rea', root: 'רעה' },
    forms: {
      akkadian: {
        translit: 'rūʾu',
        pron: 'roo-oo',
        note: 'friend, comrade; compared with Hebrew רֵעַ in the dictionaries; attestation should be checked against CAD',
        verify: true
      },
      egyptian: {
        translit: 'ḫnms',
        pron: 'khenmes (modern convention)',
        note: 'friend; attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ḥăbar',
        hebrewLetters: 'חבר',
        note: 'companion — a different lexeme (Hebrew חָבֵר is the same word); Daniel 2:13 דָּנִיֵּאל וְחַבְרוֹהִי (Daniel and his companions)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'stranger',
    english: ['stranger', 'sojourner'],
    hebrew: { word: 'גֵּר', translit: 'ger', root: 'גור' },
    forms: {
      akkadian: {
        translit: 'ubāru',
        pron: 'oo-baa-ru',
        note: 'resident alien, foreign guest under protection; the functional equivalent, not a cognate of גֵּר'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'witness',
    english: ['witness'],
    hebrew: { word: 'עֵד', translit: 'ed', root: 'עוד' },
    forms: {
      akkadian: {
        translit: 'šību',
        pron: 'shee-bu',
        note: 'witness; the same word means old man, elder, and is filed under elder in this database'
      },
      egyptian: {
        translit: 'mtr',
        pron: 'meter (modern convention)',
        note: 'witness; also testify; attestation and spelling should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'śāhēd',
        hebrewLetters: 'שהד',
        note: 'the Aramaic witness word is a different lexeme; witness lists close Elephantine legal documents, and Genesis 31:47 quotes the Aramaic phrase יְגַר שָׂהֲדוּתָא, heap of witness'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'messenger',
    english: ['messenger', 'angel'],
    hebrew: { word: 'מַלְאָךְ', translit: 'malakh', root: 'לאכ' },
    forms: {
      akkadian: {
        translit: 'mār šipri',
        pron: 'maar ship-ree',
        note: 'literally son of the message (šipru, sending, task); the ordinary Akkadian expression for messenger'
      },
      egyptian: {
        translit: 'wpwtj',
        pron: 'weputy (modern convention)',
        note: 'messenger, envoy'
      }
      // aramaic: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'warrior',
    english: ['warrior', 'mighty man'],
    hebrew: { word: 'גִּבּוֹר', translit: 'gibbor', root: 'גבר' },
    forms: {
      akkadian: {
        translit: 'qarrādu',
        script: '𒌨𒊕',
        scriptNote: 'shown as the logogram UR.SAG, with which the word was commonly written',
        pron: 'kar-raa-du',
        note: 'warrior, hero; a functional equivalent, not a cognate of גִּבּוֹר'
      },
      sumerian: {
        translit: 'ur-sag',
        script: '𒌨𒊕',
        pron: 'oor-sang',
        note: 'hero, warrior'
      },
      hittite: {
        script: '𒌨𒊕',
        scriptNote: 'written logographically (UR.SAG, hero, as in the royal titulary); the native Hittite reading is not established'
      },
      aramaic: {
        translit: 'gibbār',
        hebrewLetters: 'גבר',
        note: 'Daniel 3:20 גִּבָּרֵי־חַיִל (mighty men of the army); the ordinary Aramaic גְּבַר man is filed under man'
      }
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'assembly',
    english: ['assembly', 'congregation'],
    hebrew: { word: 'קָהָל', translit: 'qahal', root: 'קהל' },
    forms: {
      akkadian: {
        translit: 'puḫru',
        pron: 'pukh-ru',
        note: 'assembly (of gods or of citizens); the functional equivalent, not a cognate of קָהָל'
      },
      aramaic: {
        translit: 'kənaš',
        hebrewLetters: 'כנש',
        note: 'gather, assemble — a different lexeme; the officials are assembled for the dedication of the image in Daniel 3'
      }
      // sumerian: deliberately empty; the assembly word ukkin is written with
      // a sign whose Unicode identity is not verified for this database.
      // egyptian: deliberately empty; no securely attested form in this database.
    }
  }
]
