// Small, explicitly reviewed bridges that are not safe to infer mechanically
// from spelling alone. Keep the published source's own claim separate from the
// modern Hebrew root convention used by the app.
export const REVIEWED_HEBREW_SOURCE_MAPPINGS = [
  {
    dictionaryId: 'jastrow',
    entryId: 'B00486',
    displayTransliteration: 'bachash',
    aliases: ['bachash', 'bakhash'],
    root: {
      letters: 'בחש',
      gloss: 'stir; probe or search',
      status: 'reviewed modern Hebrew mapping',
      evidence: [
        {
          source: 'Jastrow',
          entryId: 'B00486',
          claim: 'published unmarked Hebrew-script headword and the senses “to search” and “to stir”'
        },
        {
          source: 'Academy of the Hebrew Language terminology database',
          sourceId: 'term-28_2',
          url: 'https://terms.hebrew-academy.org.il/munnah/28_2/to%20stir',
          claim: 'reviewed modern Hebrew terminology evidence for “to stir”'
        }
      ],
      caveat:
        'Jastrow prints √בח in this entry; it does not explicitly label the headword as the triliteral root בחש.'
    }
  },
  {
    dictionaryId: 'jastrow',
    entryId: 'B00534',
    displayTransliteration: 'bəṭaš',
    aliases: ['batash', 'betash', 'battash', 'botesh', 'livtosh', 'bitesh'],
    root: {
      letters: 'בטש',
      word: 'בָּטַשׁ',
      gloss: 'strike or hit, stamp or trample, kick or push, tamp or ram',
      status: 'reviewed modern Hebrew mapping',
      evidence: [
        {
          source: 'Jastrow',
          entryId: 'B00534',
          url: 'https://www.sefaria.org/Jastrow%2C_%D7%91%D6%B0%D6%BC%D7%98%D6%B7%D7%A9%D7%81.1',
          claim: 'published unmarked Hebrew-script headword with tread, kick, crush, and stamp senses'
        },
        {
          source: 'Klein Dictionary',
          entryId: 'בטש',
          url: 'https://www.sefaria.org/Klein_Dictionary%2C_%D7%91%D7%98%D7%A9%D7%81.1',
          claim: 'documents the Aramaic borrowing in Medieval and New Hebrew with stamp, beat, kick, and push senses'
        },
        {
          source: 'Ben-Yehuda Dictionary',
          entryId: 'בטש',
          url: 'https://benyehuda.org/dict/24412/39026',
          claim: 'records both stamping with the feet and striking another body'
        },
        {
          source: 'Academy of the Hebrew Language terminology database',
          sourceId: 'term-26889_1',
          url: 'https://terms.hebrew-academy.org.il/munnah/26889_1/%D7%91%D6%BC%D6%B8%D7%98%D6%B7%D7%A9%D7%81',
          claim: 'reviewed modern Hebrew technical term for ramming'
        }
      ],
      caveat:
        'Jastrow leaves this source row Hebrew/Aramaic unmarked, and Klein describes the Hebrew verb as borrowed from Aramaic; the reviewed mapping adds a modern Hebrew root without relabeling Jastrow’s source record.'
    }
  }
]

export function reviewedSourceMapping(dictionaryId, entryId) {
  return REVIEWED_HEBREW_SOURCE_MAPPINGS.find(
    (mapping) => mapping.dictionaryId === dictionaryId && mapping.entryId === entryId
  )
}
