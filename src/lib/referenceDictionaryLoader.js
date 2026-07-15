// Shared lazy loader for published reference dictionaries. The meaning index
// supplies enough compact data to render result rows; a full dictionary is
// fetched only when the user opens one of those rows.

import { fetchReleaseAsset } from './releaseAssets.js'

const CACHE = new Map()
const ENTRY_CACHE = new Map()
const PENDING = new Map()
let cacheGeneration = 0

function clearReferenceDictionaryCaches() {
  cacheGeneration++
  CACHE.clear()
  ENTRY_CACHE.clear()
  PENDING.clear()
}

// An auto-updated worker can take control before WebKit reloads an installed
// app. Drop parsed rows at that boundary so a newly fetched gloss index cannot
// resolve against dictionary data retained from the previous release.
if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('controllerchange', clearReferenceDictionaryCaches)
}

export async function loadReferenceDictionary(dict) {
  if (CACHE.has(dict.id)) return CACHE.get(dict.id)
  if (!PENDING.has(dict.id)) {
    const generation = cacheGeneration
    let pending
    pending = (async () => {
      let data
      if (dict.source.kind === 'strongs') {
        const mod = await import('../data/strongs.json')
        data = mod.default
      } else {
        const res = await fetchReleaseAsset(dict.source.url, {
          options: { cache: 'no-cache' }
        })
        if (!res.ok) throw new Error('fetch failed: ' + res.status)
        data = await res.json()
      }
      if (generation !== cacheGeneration) return loadReferenceDictionary(dict)
      CACHE.set(dict.id, data)
      ENTRY_CACHE.set(dict.id, new Map(data.entries.map((entry) => [String(entry.id), entry])))
      return data
    })().finally(() => {
      if (PENDING.get(dict.id) === pending) PENDING.delete(dict.id)
    })
    PENDING.set(dict.id, pending)
  }
  return PENDING.get(dict.id)
}

export async function loadReferenceEntry(dict, id) {
  let generation
  do {
    generation = cacheGeneration
    await loadReferenceDictionary(dict)
  } while (generation !== cacheGeneration)
  return ENTRY_CACHE.get(dict.id)?.get(String(id)) || null
}
