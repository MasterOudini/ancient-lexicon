// Emotions & virtues entries. Entry shape and data-honesty conventions are
// documented at the top of src/data/lexicon.js. Use // comments only; no
// asterisks; no proto-forms; a missing language slot is intentional.

export const EMOTIONS = [
  {
    id: 'joy',
    english: ['joy', 'gladness'],
    hebrew: { word: 'שִׂמְחָה', translit: 'simchah', root: 'שמח' },
    forms: {
      akkadian: {
        translit: 'ḫidûtu',
        pron: 'khee-doo-tu',
        note: 'joy, rejoicing; from the verb ḫadû (to rejoice)'
      },
      sumerian: {
        translit: 'ḫul2',
        script: '𒄾',
        pron: 'khool',
        note: 'rejoice, be glad'
      },
      egyptian: {
        translit: 'ršwt',
        pron: 'reshut (modern convention)',
        note: 'joy, gladness; spellings vary, so no single sign sequence is shown'
      },
      aramaic: {
        translit: 'ḥedvāh',
        hebrewLetters: 'חדוה',
        note: 'Ezra 6:16 בְחֶדְוָה (with joy), at the temple dedication'
      }
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'anger',
    english: ['anger'],
    hebrew: {
      word: 'אַף',
      translit: 'af',
      root: 'אנפ',
      note: 'anger; literally nose — the same word carries both attested senses'
    },
    forms: {
      akkadian: {
        translit: 'uzzu',
        pron: 'uz-zu',
        note: 'anger, fury'
      },
      hittite: {
        translit: 'kartimmiyatt-',
        pron: 'kar-tim-mee-yat',
        note: 'anger, wrath; the dictionary stem form should be checked against corpus records',
        verify: true
      },
      aramaic: {
        translit: 'rəgaz',
        hebrewLetters: 'רגז',
        note: 'the root of the Aramaic anger words; Ezra 5:12 הַרְגִּזוּ (they provoked to anger)'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'glory',
    english: ['glory', 'honor'],
    hebrew: { word: 'כָּבוֹד', translit: 'kavod', root: 'כבד' },
    forms: {
      akkadian: {
        translit: 'kabtu',
        pron: 'kab-tu',
        note: 'heavy; also important, honored — the same weight-to-honor pairing as Hebrew kavod'
      },
      aramaic: {
        translit: 'yəqār',
        hebrewLetters: 'יקר',
        note: 'Daniel 7:14 וִיקָר (and glory), given to the one like a son of man; a different word from Hebrew kavod'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested equivalent in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'wisdom',
    english: ['wisdom'],
    hebrew: { word: 'חָכְמָה', translit: 'chokhmah', root: 'חכמ' },
    forms: {
      akkadian: {
        translit: 'nēmequ',
        pron: 'neh-meh-ku',
        note: 'wisdom; as in the poem title Ludlul bēl nēmeqi (let me praise the lord of wisdom)'
      },
      aramaic: {
        translit: 'ḥokhmāh',
        hebrewLetters: 'חכמה',
        note: 'Daniel 2:20 חָכְמְתָא (wisdom, emphatic form); the same root as the Hebrew word'
      }
      // sumerian: deliberately empty; the wisdom compounds are not verified for this database.
      // egyptian: deliberately empty; no securely attested equivalent in this database.
      // hittite: deliberately empty; the word for wisdom is not verified for this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'kindness',
    english: ['kindness', 'loyal love'],
    hebrew: { word: 'חֶסֶד', translit: 'chesed', root: 'חסד' },
    forms: {
      akkadian: {
        translit: 'gimillu',
        pron: 'gi-mil-lu',
        note: 'favor, kindness done or repaid; an equivalent, not a cognate'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // aramaic: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'grace',
    english: ['grace', 'favor'],
    hebrew: { word: 'חֵן', translit: 'chen', root: 'חננ' },
    forms: {
      egyptian: {
        translit: 'ḥswt',
        pron: 'hesut (modern convention)',
        note: 'favor, praise; attestation should be checked against Wb.',
        verify: true
      },
      aramaic: {
        translit: 'ḥănan',
        hebrewLetters: 'חנן',
        note: 'the same root as Hebrew chen; Daniel 4:24 בְּמִחַן עֲנָיִן (by showing favor to the poor)'
      }
      // akkadian: deliberately empty; no securely attested equivalent in this database.
      // sumerian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'mercy',
    english: ['mercy', 'compassion'],
    hebrew: { word: 'רַחֲמִים', translit: 'rachamim', root: 'רחמ' },
    forms: {
      akkadian: {
        translit: 'rēmu',
        pron: 'reh-mu',
        note: 'womb, and also compassion — the same pairing as Hebrew; the verb rêmu means to have mercy'
      },
      aramaic: {
        translit: 'raḥămīn',
        hebrewLetters: 'רחמין',
        note: 'Daniel 2:18 וְרַחֲמִין (and mercies), sought from the God of heaven'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; the divine epithet Rḥmnn (the Merciful) of the late
      // monotheistic inscriptions is carried on the root record, not as an entry form.
    }
  },
  {
    id: 'strength',
    english: ['strength', 'might'],
    hebrew: { word: 'עֹז', translit: 'oz', root: 'עזז' },
    forms: {
      akkadian: {
        translit: 'emūqu',
        pron: 'eh-moo-ku',
        note: 'strength, force; an equivalent, not a cognate'
      },
      aramaic: {
        translit: 'təqof',
        hebrewLetters: 'תקף',
        note: 'Daniel 2:37 וְתָקְפָּא (and the strength), given to Nebuchadnezzar; a different word from Hebrew oz'
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; no securely attested form in this database.
      // hittite: deliberately empty; no securely attested form in this database.
      // osa: deliberately empty; no securely attested form in this database.
    }
  },
  {
    id: 'righteousness',
    english: ['righteousness'],
    hebrew: { word: 'צְדָקָה', translit: 'tsedaqah', root: 'צדק' },
    forms: {
      akkadian: {
        translit: 'mīšaru',
        pron: 'mee-sha-ru',
        note: 'justice, equity, as in the royal mīšaru edicts; an equivalent, not a cognate'
      },
      aramaic: {
        translit: 'ṣidqāh',
        hebrewLetters: 'צדקה',
        note: 'Daniel 4:24 בְּצִדְקָה (by righteousness); the same root as the Hebrew word'
      },
      osa: {
        translit: 'ṣdq',
        tokens: ['ss', 'd', 'q'],
        note: 'in royal names and epithets; attestation should be checked against corpus records (DASI/CSAI)',
        verify: true
      }
      // sumerian: deliberately empty; no securely attested form in this database.
      // egyptian: deliberately empty; right order is covered by mꜣꜥt, filed under truth.
      // hittite: deliberately empty; no securely attested form in this database.
    }
  }
]
