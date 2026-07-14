import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { registerServiceWorkerUpdates } from './lib/pwaUpdates.js'
import './styles.css'

// This changes on every deployed commit, including data-only releases, so the
// generated service worker can always distinguish one release from the next.
document.documentElement.dataset.build = __APP_BUILD_ID__

void registerServiceWorkerUpdates({ baseUrl: import.meta.env.BASE_URL })

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
