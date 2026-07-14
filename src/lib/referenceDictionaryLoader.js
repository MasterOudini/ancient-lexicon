// Shared lazy loader for published reference dictionaries. The meaning index
// supplies enough compact data to render result rows; a full dictionary is
// fetched only when the user opens one of those rows.

const CACHE = new Map()
const ENTRY_CACHE = new Map()
const PENDING = new Map()

export async function loadReferenceDictionary(dict) {
  if (CACHE.has(dict.id)) return CACHE.get(dict.id)
  if (!PENDING.has(dict.id)) {
    const pending = (async () => {
      let data
      if (dict.source.kind === 'strongs') {
        const mod = await import('../data/strongs.json')
        data = mod.default
      } else {
        const base = import.meta.env.BASE_URL || '/'
        const res = await fetch(base + dict.source.url)
        if (!res.ok) throw new Error('fetch failed: ' + res.status)
        data = await res.json()
      }
      CACHE.set(dict.id, data)
      ENTRY_CACHE.set(dict.id, new Map(data.entries.map((entry) => [String(entry.id), entry])))
      return data
    })().finally(() => PENDING.delete(dict.id))
    PENDING.set(dict.id, pending)
  }
  return PENDING.get(dict.id)
}

export async function loadReferenceEntry(dict, id) {
  await loadReferenceDictionary(dict)
  return ENTRY_CACHE.get(dict.id)?.get(String(id)) || null
}
