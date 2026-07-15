export const UPDATE_CHECK_INTERVAL_MS =
  typeof __PWA_UPDATE_CHECK_INTERVAL_MS__ === 'number'
    ? __PWA_UPDATE_CHECK_INTERVAL_MS__
    : 2 * 60 * 1000
export const UPDATE_CHECK_THROTTLE_MS =
  typeof __PWA_UPDATE_CHECK_THROTTLE_MS__ === 'number'
    ? __PWA_UPDATE_CHECK_THROTTLE_MS__
    : 30 * 1000
export const UPDATE_RETRY_MS = 5 * 1000
export const RELEASE_FETCH_TIMEOUT_MS = 10 * 1000
export const RELEASE_FORMAT = 'ancient-lexicon-release-v1'
export const RELEASE_QUERY_PARAM = '__al_release'

const RELEASE_NAVIGATION_STORAGE_KEY = 'ancient-lexicon:update-navigation'
const RELEASE_NAVIGATION_GUARD_MS = 15 * 1000
const WORKER_MESSAGE_TIMEOUT_MS = 1500
const WORKER_ACTIVATION_POLL_MS = 250
const WORKER_ACTIVATION_ATTEMPTS = 20

function normalizedBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

export function normalizeRelease(value) {
  if (!value || typeof value !== 'object') return null

  const buildId = typeof value.buildId === 'string'
    ? value.buildId.trim().toLowerCase()
    : ''
  const releaseNumber = Number(value.releaseNumber)
  if (
    !/^[a-z0-9][a-z0-9_-]{2,63}$/.test(buildId) ||
    !Number.isSafeInteger(releaseNumber) ||
    releaseNumber < 0
  ) {
    return null
  }

  const releaseId = releaseNumber > 0
    ? `${releaseNumber}-${buildId}`
    : buildId
  if (value.releaseId && value.releaseId !== releaseId) return null

  return {
    format: RELEASE_FORMAT,
    buildId,
    releaseNumber,
    releaseId,
    worker: `sw-${releaseId}.js`,
    shell: `shell-${releaseId}.html`
  }
}

export function newestRelease(currentRelease, ...candidates) {
  let latest = normalizeRelease(currentRelease)
  if (!latest) return null

  for (const value of candidates) {
    const candidate = normalizeRelease(value)
    if (!candidate || candidate.releaseId === latest.releaseId) continue

    if (candidate.releaseNumber > latest.releaseNumber) {
      latest = candidate
      continue
    }

    // Local/test builds do not have a workflow run number. In that one case,
    // the same-origin release marker is authoritative for the served snapshot.
    if (candidate.releaseNumber === 0 && latest.releaseNumber === 0) {
      latest = candidate
    }
  }

  return latest
}

async function fetchJson(
  fetchObject,
  url,
  options,
  {
    timeoutMs = RELEASE_FETCH_TIMEOUT_MS,
    AbortControllerObject = globalThis.AbortController,
    setTimeoutObject = globalThis.setTimeout,
    clearTimeoutObject = globalThis.clearTimeout
  } = {}
) {
  if (typeof fetchObject !== 'function') return null

  const controller = typeof AbortControllerObject === 'function'
    ? new AbortControllerObject()
    : null
  const request = (async () => {
    try {
      const response = await fetchObject(
        url,
        controller ? { ...options, signal: controller.signal } : options
      )
      if (!response?.ok) return null
      return await response.json()
    } catch {
      return null
    }
  })()

  if (
    !Number.isFinite(timeoutMs) ||
    timeoutMs < 0 ||
    typeof setTimeoutObject !== 'function'
  ) {
    return request
  }

  let timer = null
  const timeout = new Promise((resolve) => {
    timer = setTimeoutObject(() => {
      try {
        controller?.abort()
      } catch {
        // The timeout still releases the check when abort is unavailable.
      }
      resolve(null)
    }, timeoutMs)
  })

  try {
    return await Promise.race([request, timeout])
  } finally {
    if (timer !== null && typeof clearTimeoutObject === 'function') {
      clearTimeoutObject(timer)
    }
  }
}

export async function discoverLatestRelease(
  {
    currentRelease,
    baseUrl = '/',
    fetchObject = globalThis.fetch,
    fetchTimeoutMs = RELEASE_FETCH_TIMEOUT_MS,
    AbortControllerObject = globalThis.AbortController,
    setTimeoutObject = globalThis.setTimeout,
    clearTimeoutObject = globalThis.clearTimeout,
    now = () => Date.now()
  } = {}
) {
  const current = normalizeRelease(currentRelease)
  if (!current) return { release: null }

  const markerUrl = `${normalizedBaseUrl(baseUrl)}release.json?update-check=${encodeURIComponent(now())}`
  const marker = await fetchJson(
    fetchObject,
    markerUrl,
    {
      cache: 'no-store',
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    },
    {
      timeoutMs: fetchTimeoutMs,
      AbortControllerObject,
      setTimeoutObject,
      clearTimeoutObject
    }
  )
  const markerRelease = marker?.format === RELEASE_FORMAT
    ? normalizeRelease(marker)
    : null

  return {
    release: newestRelease(current, markerRelease),
    markerRelease,
    markerValue: marker?.releaseId || null
  }
}

export async function queryServiceWorkerRelease(
  worker,
  {
    MessageChannelObject = globalThis.MessageChannel,
    setTimeoutObject = globalThis.setTimeout,
    clearTimeoutObject = globalThis.clearTimeout,
    timeoutMs = WORKER_MESSAGE_TIMEOUT_MS
  } = {}
) {
  if (!worker || typeof worker.postMessage !== 'function' || !MessageChannelObject) {
    return null
  }

  return new Promise((resolve) => {
    let finished = false
    const channel = new MessageChannelObject()
    const finish = (release) => {
      if (finished) return
      finished = true
      clearTimeoutObject(timer)
      channel.port1.close?.()
      resolve(normalizeRelease(release))
    }
    const timer = setTimeoutObject(() => finish(null), timeoutMs)

    channel.port1.onmessage = (event) => {
      if (event.data?.type !== 'ANCIENT_LEXICON_RELEASE') return
      finish(event.data.release)
    }
    channel.port1.start?.()

    try {
      worker.postMessage(
        { type: 'GET_ANCIENT_LEXICON_RELEASE' },
        [channel.port2]
      )
    } catch {
      finish(null)
    }
  })
}

function sameRelease(left, right) {
  const a = normalizeRelease(left)
  const b = normalizeRelease(right)
  return Boolean(a && b && a.releaseId === b.releaseId)
}

function waitWith(windowObject, milliseconds) {
  return new Promise((resolve) => windowObject.setTimeout(resolve, milliseconds))
}

async function waitForActiveRelease(
  registration,
  targetRelease,
  {
    queryWorkerRelease,
    windowObject,
    attempts = WORKER_ACTIVATION_ATTEMPTS,
    pollMs = WORKER_ACTIVATION_POLL_MS
  }
) {
  for (let attempt = 0; attempt < attempts; attempt++) {
    const activeRelease = await queryWorkerRelease(registration.active)
    if (sameRelease(activeRelease, targetRelease)) {
      return registration.active
    }

    const waitingRelease = await queryWorkerRelease(registration.waiting)
    if (sameRelease(waitingRelease, targetRelease)) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }

    await waitWith(windowObject, pollMs)
  }

  return null
}

export function clearReleaseNavigationMarker(
  {
    windowObject = window,
    currentRelease
  } = {}
) {
  const current = normalizeRelease(currentRelease)
  if (!current || !windowObject.location?.href || !windowObject.history?.replaceState) {
    return false
  }

  try {
    const url = new URL(windowObject.location.href)
    if (url.searchParams.get(RELEASE_QUERY_PARAM) !== current.releaseId) {
      return false
    }
    url.searchParams.delete(RELEASE_QUERY_PARAM)
    windowObject.history.replaceState(windowObject.history.state, '', url.href)
    windowObject.sessionStorage?.removeItem(RELEASE_NAVIGATION_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

export function replaceWithRelease(
  windowObject,
  targetRelease,
  { now = () => Date.now() } = {}
) {
  const target = normalizeRelease(targetRelease)
  if (!target || !windowObject.location?.href || !windowObject.location?.replace) {
    return false
  }

  const checkedAt = now()
  try {
    const previous = JSON.parse(
      windowObject.sessionStorage?.getItem(RELEASE_NAVIGATION_STORAGE_KEY) || 'null'
    )
    if (
      previous?.releaseId === target.releaseId &&
      checkedAt - Number(previous.at) < RELEASE_NAVIGATION_GUARD_MS
    ) {
      return false
    }
    windowObject.sessionStorage?.setItem(
      RELEASE_NAVIGATION_STORAGE_KEY,
      JSON.stringify({ releaseId: target.releaseId, at: checkedAt })
    )
  } catch {
    // Navigation still works when sessionStorage is unavailable.
  }

  const url = new URL(windowObject.location.href)
  url.searchParams.set(RELEASE_QUERY_PARAM, target.releaseId)
  windowObject.location.replace(url.href)
  return true
}

export function monitorServiceWorkerUpdates(
  registration,
  {
    windowObject = window,
    documentObject = document,
    serviceWorker = windowObject.navigator?.serviceWorker,
    currentRelease,
    baseUrl = '/',
    intervalMs = UPDATE_CHECK_INTERVAL_MS,
    throttleMs = UPDATE_CHECK_THROTTLE_MS,
    fetchTimeoutMs = RELEASE_FETCH_TIMEOUT_MS,
    retryMs = UPDATE_RETRY_MS,
    now = () => Date.now(),
    discoverRelease = discoverLatestRelease,
    queryWorkerRelease = (worker) => queryServiceWorkerRelease(worker),
    navigateToRelease = (release) => replaceWithRelease(windowObject, release, { now })
  } = {}
) {
  const current = normalizeRelease(currentRelease)
  if (!current || !registration || !serviceWorker) return null

  const scopeBase = normalizedBaseUrl(baseUrl)
  let activeRegistration = registration
  let checkInFlight = null
  let lastSuccessfulCheck = -Infinity
  let retryTimer = null
  let navigationStarted = false
  let latestKnownRelease = current

  function reportUpdateState(state, release = latestKnownRelease) {
    const root = documentObject.documentElement
    if (!root?.dataset) return
    root.dataset.updateState = state
    if (release?.releaseId) root.dataset.latestRelease = release.releaseId
  }

  function scheduleRetry() {
    if (retryTimer !== null || navigationStarted) return
    retryTimer = windowObject.setTimeout(() => {
      retryTimer = null
      void checkForUpdate(true)
    }, retryMs)
  }

  function navigateOnce(release) {
    if (navigationStarted || sameRelease(release, current)) return false
    const navigated = navigateToRelease(release)
    if (navigated) navigationStarted = true
    return navigated
  }

  async function performUpdateCheck(checkedAt) {
    reportUpdateState('checking')
    // Only the fixed migration worker is a mutable URL. A release-specific
    // worker intentionally disappears from the next Pages artifact, so asking
    // the browser to update that old immutable URL would receive a 404 and can
    // make WebKit discard the still-useful offline registration. With no
    // active worker this is the first installation; update() can wait on the
    // installation that is already in progress, so leave it alone as well.
    const activeScriptUrl = activeRegistration.active?.scriptURL
    const shouldUpdateRegisteredUrl = Boolean(activeScriptUrl) && (() => {
      try {
        return new URL(activeScriptUrl).pathname.endsWith('/sw.js')
      } catch {
        return activeScriptUrl.endsWith('/sw.js')
      }
    })()
    if (shouldUpdateRegisteredUrl) {
      try {
        await activeRegistration.update()
      } catch {
        // Continue: an immutable worker URL from the release marker may work.
      }
    }

    const discovered = await discoverRelease({
      currentRelease: latestKnownRelease,
      baseUrl: scopeBase,
      fetchObject: windowObject.fetch?.bind(windowObject),
      fetchTimeoutMs,
      setTimeoutObject: windowObject.setTimeout?.bind(windowObject),
      clearTimeoutObject: windowObject.clearTimeout?.bind(windowObject),
      now
    })
    const root = documentObject.documentElement
    if (root?.dataset) {
      root.dataset.markerRelease =
        discovered?.markerRelease?.releaseId ||
        (discovered?.markerValue ? `invalid-${discovered.markerValue}` : 'unavailable')
    }
    latestKnownRelease = newestRelease(
      latestKnownRelease,
      discovered?.release
    ) || latestKnownRelease
    reportUpdateState('discovered', latestKnownRelease)

    const installedRelease = await queryWorkerRelease(activeRegistration.active)
    latestKnownRelease = newestRelease(
      latestKnownRelease,
      installedRelease
    ) || latestKnownRelease

    let activeWorker = sameRelease(installedRelease, latestKnownRelease)
      ? activeRegistration.active
      : null

    if (!activeWorker) {
      reportUpdateState('installing', latestKnownRelease)
      activeRegistration = await serviceWorker.register(
        `${scopeBase}${latestKnownRelease.worker}`,
        {
          scope: scopeBase,
          updateViaCache: 'none'
        }
      )
      activeWorker = await waitForActiveRelease(
        activeRegistration,
        latestKnownRelease,
        { queryWorkerRelease, windowObject }
      )
    }

    if (!activeWorker) {
      reportUpdateState('retrying', latestKnownRelease)
      scheduleRetry()
      return false
    }

    activeWorker.postMessage({ type: 'CLAIM_ANCIENT_LEXICON_CLIENTS' })
    lastSuccessfulCheck = checkedAt
    reportUpdateState('ready', latestKnownRelease)
    if (!sameRelease(latestKnownRelease, current)) {
      navigateOnce(latestKnownRelease)
    }
    return true
  }

  function checkForUpdate(force = false) {
    const checkedAt = now()
    if (
      navigationStarted ||
      documentObject.visibilityState !== 'visible' ||
      windowObject.navigator?.onLine === false ||
      (!force && checkedAt - lastSuccessfulCheck < throttleMs)
    ) {
      return Promise.resolve(false)
    }
    if (checkInFlight) return checkInFlight

    checkInFlight = performUpdateCheck(checkedAt)
      .catch((error) => {
        reportUpdateState(
          `retrying-${String(error?.name || 'error').toLowerCase()}`
        )
        scheduleRetry()
        return false
      })
      .finally(() => {
        checkInFlight = null
      })
    return checkInFlight
  }

  const checkWhenVisible = () => {
    if (documentObject.visibilityState === 'visible') void checkForUpdate()
  }
  const requestCheck = () => void checkForUpdate()

  windowObject.addEventListener('focus', requestCheck)
  windowObject.addEventListener('pageshow', requestCheck)
  windowObject.addEventListener('online', requestCheck)
  documentObject.addEventListener('visibilitychange', checkWhenVisible)
  windowObject.setInterval(requestCheck, intervalMs)

  // Do not leave the first convergence check to browser scheduling heuristics.
  void checkForUpdate(true)

  return { checkForUpdate }
}

export async function registerServiceWorkerUpdates(
  {
    windowObject = window,
    documentObject = document,
    navigatorObject = windowObject.navigator,
    currentRelease,
    baseUrl = '/',
    retryMs = UPDATE_RETRY_MS,
    queryWorkerRelease = (worker) => queryServiceWorkerRelease(worker)
  } = {}
) {
  const serviceWorker = navigatorObject?.serviceWorker
  const current = normalizeRelease(currentRelease)
  if (!serviceWorker || !current) return null

  const scopeBase = normalizedBaseUrl(baseUrl)
  let monitorStarted = false
  let controllerNavigationStarted = false
  let controllerChangeInFlight = false

  serviceWorker.addEventListener('controllerchange', async () => {
    if (controllerNavigationStarted || controllerChangeInFlight) return
    controllerChangeInFlight = true
    try {
      const controlledRelease = await queryWorkerRelease(serviceWorker.controller)
      if (sameRelease(controlledRelease, current)) return

      controllerNavigationStarted = true
      if (
        controlledRelease &&
        replaceWithRelease(windowObject, controlledRelease)
      ) {
        return
      }
      // Compatibility fallback for a controller installed by an older worker
      // that cannot answer the version handshake.
      windowObject.location.reload()
    } finally {
      controllerChangeInFlight = false
    }
  })

  async function start() {
    try {
      const existing = typeof serviceWorker.getRegistration === 'function'
        ? await serviceWorker.getRegistration(scopeBase)
        : null
      const registration = existing || await serviceWorker.register(
        `${scopeBase}${current.worker}`,
        {
          scope: scopeBase,
          updateViaCache: 'none'
        }
      )

      if (!monitorStarted) {
        monitorStarted = true
        monitorServiceWorkerUpdates(registration, {
          windowObject,
          documentObject,
          serviceWorker,
          currentRelease: current,
          baseUrl: scopeBase,
          retryMs,
          queryWorkerRelease
        })
      }
      return registration
    } catch {
      windowObject.setTimeout(() => void start(), retryMs)
      return null
    }
  }

  return start()
}
