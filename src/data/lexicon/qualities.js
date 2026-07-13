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
  }
]
