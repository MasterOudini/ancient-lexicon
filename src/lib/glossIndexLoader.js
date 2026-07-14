// Keep the previous URL immutable during this rollout. An already-open iOS
// Home Screen app can continue running its old JavaScript after a new service
// worker takes control; serving new source IDs at the old URL would make that
// client try to render dictionaries its registry does not know yet.
export const GLOSS_INDEX_PATH = 'dicts/gloss-index-2026-07.json'

let pending

if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    pending = null
  })
}

export function loadGlossIndex() {
  if (!pending) {
    const base = import.meta.env.BASE_URL || '/'
    pending = fetch(base + GLOSS_INDEX_PATH, { cache: 'no-cache' })
      .then((response) => {
        if (!response.ok) throw new Error('fetch failed: ' + response.status)
        return response.json()
      })
      .catch((error) => {
        pending = null
        throw error
      })
  }
  return pending
}
