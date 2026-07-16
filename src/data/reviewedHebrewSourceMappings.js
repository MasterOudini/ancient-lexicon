// Small, explicitly reviewed bridges that are not safe to infer mechanically
// from spelling alone. Keep the published source's own claim separate from the
// modern Hebrew root convention used by the app.
export const REVIEWED_HEBREW_SOURCE_MAPPINGS = [
  {
    dictionaryId: 'jastrow',
    entryId: 'B00486',
    aliases: ['bachash', 'bakhash'],
    root: {
      letters: 'בחש',
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
  }
]

export function reviewedSourceMapping(dictionaryId, entryId) {
  return REVIEWED_HEBREW_SOURCE_MAPPINGS.find(
    (mapping) => mapping.dictionaryId === dictionaryId && mapping.entryId === entryId
  )
}
