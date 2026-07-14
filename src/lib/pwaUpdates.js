export const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 1000
export const UPDATE_CHECK_THROTTLE_MS = 30 * 1000

export async function registerServiceWorkerUpdates(
  {
    windowObject = window,
    documentObject = document,
    navigatorObject = windowObject.navigator,
    baseUrl = '/'
  } = {}
) {
  const serviceWorker = navigatorObject?.serviceWorker
  if (!serviceWorker) return null

  // Reload exactly once whenever a worker takes control. This also covers a
  // first visit that happens to straddle a deployment; the next navigation is
  // already controlled, so it cannot create a reload loop.
  let reloadStarted = false
  serviceWorker.addEventListener('controllerchange', () => {
    if (reloadStarted) return
    reloadStarted = true
    windowObject.location.reload()
  })

  try {
    const registration = await serviceWorker.register(`${baseUrl}sw.js`, {
      scope: baseUrl,
      // GitHub Pages serves static files with a cache lifetime. The worker is
      // the release detector, so never let that HTTP cache delay its update.
      updateViaCache: 'none'
    })
    monitorServiceWorkerUpdates(registration, { windowObject, documentObject })
    return registration
  } catch {
    // Service-worker failure must not prevent the online app from launching.
    return null
  }
}

// iOS can keep a Home Screen web app suspended instead of starting it again.
// Registration alone therefore is not enough: explicitly check whenever the
// existing app returns to the foreground, and periodically while it stays open.
export function monitorServiceWorkerUpdates(
  registration,
  {
    windowObject = window,
    documentObject = document,
    intervalMs = UPDATE_CHECK_INTERVAL_MS,
    throttleMs = UPDATE_CHECK_THROTTLE_MS,
    now = () => Date.now()
  } = {}
) {
  let updateInFlight = false
  let lastCheck = -Infinity

  async function checkForUpdate() {
    const checkedAt = now()
    if (
      updateInFlight ||
      registration.installing ||
      documentObject.visibilityState !== 'visible' ||
      windowObject.navigator?.onLine === false ||
      checkedAt - lastCheck < throttleMs
    ) {
      return false
    }

    updateInFlight = true
    lastCheck = checkedAt
    try {
      await registration.update()
      return true
    } catch {
      // Being offline or resuming before WebKit is ready must not break launch.
      return false
    } finally {
      updateInFlight = false
    }
  }

  const checkWhenVisible = () => {
    if (documentObject.visibilityState === 'visible') void checkForUpdate()
  }

  windowObject.addEventListener('focus', checkForUpdate)
  windowObject.addEventListener('pageshow', checkForUpdate)
  windowObject.addEventListener('online', checkForUpdate)
  documentObject.addEventListener('visibilitychange', checkWhenVisible)
  windowObject.setInterval(checkForUpdate, intervalMs)

  // Do not leave the first update check to the browser's scheduling heuristics.
  void checkForUpdate()
}
