import { getDictionary } from '../data/referenceDictionaries.js'
import { expandGlossRecord } from './glossSearch.js'
import { normalize } from './search.js'

const catalogCache = new WeakMap()
const hebrewCollator = new Intl.Collator('he')

export function buildHebrewCatalog(index) {
  if (!index || typeof index !== 'object') return []
  const cached = catalogCache.get(index)
  if (cached) return cached

  const vocabulary = Object.keys(index.keywords || {})
  const indexed = (index.hebrew?.recordIds || []).map((recordId) => {
    const posting = expandGlossRecord(index, recordId)
    const guideWords = (index.records[recordId]?.[5] || [])
      .map((termId) => vocabulary[termId])
      .filter(Boolean)
    return posting
      ? { ...posting, recordId, guideWords, linked: guideWords.length > 0 }
      : null
  }).filter(Boolean)
  const unindexed = (index.hebrew?.unindexed || []).map((row) => ({
    d: index.sources[row[0]],
    i: row[1],
    l: row[2],
    g: row[3],
    x: row[4],
    lang: 'Hebrew',
    recordId: null,
    guideWords: [],
    linked: false
  }))

  const catalog = [...indexed, ...unindexed]
    .map((entry) => {
      const dict = getDictionary(entry.d)
      if (!dict) return null
      return {
        ...entry,
        sortKey: normalize(entry.l),
        searchText: normalize([
          entry.l,
          entry.x,
          entry.g,
          ...entry.guideWords,
          entry.i,
          dict.label
        ].filter(Boolean).join(' '))
      }
    })
    .filter(Boolean)
    .sort((a, b) =>
      hebrewCollator.compare(a.sortKey, b.sortKey) ||
      a.d.localeCompare(b.d) ||
      String(a.i).localeCompare(String(b.i))
    )

  catalogCache.set(index, catalog)
  return catalog
}
