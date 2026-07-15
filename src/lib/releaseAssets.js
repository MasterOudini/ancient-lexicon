function normalizedBaseUrl(baseUrl) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
}

function compiledReleasePrefix() {
  return typeof __APP_DATA_PREFIX__ === 'string' ? __APP_DATA_PREFIX__ : ''
}

const RELEASE_ASSET_FALLBACK_CACHE = 'ancient-lexicon-release-assets-v1'

function canUseFallbackCache(options) {
  return String(options?.method || 'GET').toUpperCase() === 'GET'
}

async function openFallbackCache(cacheStorage, options) {
  if (!canUseFallbackCache(options) || typeof cacheStorage?.open !== 'function') return null

  try {
    return await cacheStorage.open(RELEASE_ASSET_FALLBACK_CACHE)
  } catch {
    return null
  }
}

async function rememberSuccessfulResponse(cacheStorage, logicalUrl, response, options) {
  const cache = await openFallbackCache(cacheStorage, options)
  if (!cache) return

  try {
    // One stable key per logical asset is overwritten by each successful
    // release, so this cache does not retain a copy for every deployment.
    await cache.put(logicalUrl, response.clone())
  } catch {
    // Cache Storage can be unavailable (for example, in private browsing).
    // A cache failure must not turn a successful network read into a failure.
  }
}

async function readPreviousSuccessfulResponse(cacheStorage, logicalUrl, options) {
  const cache = await openFallbackCache(cacheStorage, options)
  if (!cache) return null

  try {
    const response = await cache.match(logicalUrl)
    return response?.ok ? response : null
  } catch {
    return null
  }
}

export function releaseAssetUrls(
  path,
  {
    baseUrl = import.meta.env?.BASE_URL || '/',
    releasePrefix = compiledReleasePrefix()
  } = {}
) {
  const base = normalizedBaseUrl(baseUrl)
  const normalizedPath = String(path).replace(/^\/+/, '')
  const normalizedPrefix = releasePrefix
    ? `${String(releasePrefix).replace(/^\/+|\/+$/g, '')}/`
    : ''
  const current = `${base}${normalizedPrefix}${normalizedPath}`
  const legacy = `${base}${normalizedPath}`
  return current === legacy ? [current] : [current, legacy]
}

// Release-specific URLs avoid GitHub Pages' cache for mutable dictionary JSON.
// Every successful read also replaces a stable logical-path alias in a
// dedicated cache. That lets release N+1 reuse release N's data immediately
// offline even when the mutable legacy URL was never requested.
export async function fetchReleaseAsset(
  path,
  {
    fetchImpl = fetch,
    cacheStorage = globalThis.caches,
    baseUrl,
    releasePrefix,
    options = {}
  } = {}
) {
  const urls = releaseAssetUrls(path, { baseUrl, releasePrefix })
  const logicalUrl = urls[urls.length - 1]
  let lastResponse = null
  let lastError = null

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index]
    try {
      const response = await fetchImpl(url, options)
      lastResponse = response
      if (response.ok) {
        await rememberSuccessfulResponse(cacheStorage, logicalUrl, response, options)
        return response
      }
    } catch (error) {
      lastError = error
    }

    // Prefer the immediately available last-success alias before asking the
    // service worker to make a second NetworkFirst request for the legacy URL.
    if (index === 0) {
      const previousResponse = await readPreviousSuccessfulResponse(
        cacheStorage,
        logicalUrl,
        options
      )
      if (previousResponse) return previousResponse
    }
  }

  if (lastResponse) return lastResponse
  throw lastError || new Error('Release asset request failed.')
}
