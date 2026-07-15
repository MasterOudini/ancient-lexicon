import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import {
  clearReleaseNavigationMarker,
  registerServiceWorkerUpdates
} from './lib/pwaUpdates.js'
import './styles.css'

// This changes on every deployed commit, including data-only releases, so the
// generated service worker can always distinguish one release from the next.
document.documentElement.dataset.build = __APP_BUILD_ID__
document.documentElement.dataset.release = __APP_RELEASE_ID__

const currentRelease = {
  buildId: __APP_BUILD_ID__,
  releaseNumber: __APP_RELEASE_NUMBER__,
  releaseId: __APP_RELEASE_ID__
}

// A successful update navigation carries the immutable release id only long
// enough to prove that the matching app shell booted.
clearReleaseNavigationMarker({ currentRelease })

void registerServiceWorkerUpdates({
  baseUrl: import.meta.env.BASE_URL,
  currentRelease
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
