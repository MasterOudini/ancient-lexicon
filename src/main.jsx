import React from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import { monitorServiceWorkerUpdates } from './lib/pwaUpdates.js'
import './styles.css'

// This changes on every deployed commit, including data-only releases, so the
// generated service worker can always distinguish one release from the next.
document.documentElement.dataset.build = __APP_BUILD_ID__

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (registration) monitorServiceWorkerUpdates(registration)
  }
})

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
