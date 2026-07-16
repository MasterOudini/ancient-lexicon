// Keep the previous URL immutable during this rollout. An already-open iOS
// Home Screen app can continue running its old JavaScript after a new service
// worker takes control; serving new source IDs at the old URL would make that
// client try to render dictionaries its registry does not know yet.
import { fetchReleaseAsset } from './releaseAssets.js'

export const GLOSS_INDEX_PATH = 'dicts/gloss-index-2026-07-v2.json'

let pending

if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    pending = null
  })
}

export function loadGlossIndex() {
  if (!pending) {
    pending = fetchReleaseAsset(GLOSS_INDEX_PATH, {
      options: { cache: 'no-cache' }
    })
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
