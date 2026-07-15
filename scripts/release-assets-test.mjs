import assert from 'node:assert/strict'
import test from 'node:test'

import { fetchReleaseAsset } from '../src/lib/releaseAssets.js'

class MemoryCacheStorage {
  constructor() {
    this.caches = new Map()
  }

  async open(name) {
    if (!this.caches.has(name)) this.caches.set(name, new MemoryCache())
    return this.caches.get(name)
  }
}

class MemoryCache {
  constructor() {
    this.responses = new Map()
  }

  async put(request, response) {
    this.responses.set(String(request), response.clone())
  }

  async match(request) {
    return this.responses.get(String(request))?.clone()
  }
}

test('a successful release read is available to the next release offline', async () => {
  const cacheStorage = new MemoryCacheStorage()
  const path = 'dicts/hebrew-comparisons/ab.json'
  const onlineUrls = []
  const releaseNBody = JSON.stringify({ release: 'N', entries: ['exact response'] })

  const releaseNResponse = await fetchReleaseAsset(path, {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-100-aaaa/',
    cacheStorage,
    fetchImpl: async (url) => {
      onlineUrls.push(url)
      return new Response(releaseNBody, {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-release': 'N' }
      })
    }
  })

  assert.equal(await releaseNResponse.text(), releaseNBody)
  assert.deepEqual(onlineUrls, [
    '/ancient-lexicon/release-100-aaaa/dicts/hebrew-comparisons/ab.json'
  ])

  const offlineUrls = []
  const releaseNPlusOneResponse = await fetchReleaseAsset(path, {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-101-bbbb/',
    cacheStorage,
    fetchImpl: async (url) => {
      offlineUrls.push(url)
      throw new TypeError('offline')
    }
  })

  assert.deepEqual(offlineUrls, [
    '/ancient-lexicon/release-101-bbbb/dicts/hebrew-comparisons/ab.json'
  ])
  assert.equal(releaseNPlusOneResponse.status, 200)
  assert.equal(releaseNPlusOneResponse.headers.get('x-release'), 'N')
  assert.equal(await releaseNPlusOneResponse.text(), releaseNBody)

  const [fallbackCache] = cacheStorage.caches.values()
  assert.equal(fallbackCache.responses.size, 1)
})

test('the legacy URL remains a compatible fallback and warms the stable alias', async () => {
  const cacheStorage = new MemoryCacheStorage()
  const path = 'dicts/legacy-only.json'
  const firstUrls = []

  const legacyResponse = await fetchReleaseAsset(path, {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-300-dddd/',
    cacheStorage,
    fetchImpl: async (url) => {
      firstUrls.push(url)
      if (url.includes('/release-300-dddd/')) throw new TypeError('offline')
      return new Response('legacy data', {
        status: 200,
        headers: { 'x-source': 'legacy' }
      })
    }
  })

  assert.deepEqual(firstUrls, [
    '/ancient-lexicon/release-300-dddd/dicts/legacy-only.json',
    '/ancient-lexicon/dicts/legacy-only.json'
  ])
  assert.equal(await legacyResponse.text(), 'legacy data')

  const nextReleaseUrls = []
  const cachedLegacyResponse = await fetchReleaseAsset(path, {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-301-eeee/',
    cacheStorage,
    fetchImpl: async (url) => {
      nextReleaseUrls.push(url)
      throw new TypeError('offline')
    }
  })

  assert.deepEqual(nextReleaseUrls, [
    '/ancient-lexicon/release-301-eeee/dicts/legacy-only.json'
  ])
  assert.equal(cachedLegacyResponse.headers.get('x-source'), 'legacy')
  assert.equal(await cachedLegacyResponse.text(), 'legacy data')
})

test('cache failures do not replace network success or existing fetch failure semantics', async () => {
  const unavailableCacheStorage = {
    async open() {
      throw new Error('Cache Storage unavailable')
    }
  }

  const successful = await fetchReleaseAsset('dicts/example.json', {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-200-cccc/',
    cacheStorage: unavailableCacheStorage,
    fetchImpl: async () => new Response('network data', { status: 200 })
  })
  assert.equal(await successful.text(), 'network data')

  const notFound = await fetchReleaseAsset('dicts/missing.json', {
    baseUrl: '/ancient-lexicon/',
    releasePrefix: 'release-200-cccc/',
    cacheStorage: new MemoryCacheStorage(),
    fetchImpl: async () => new Response('missing', { status: 404 })
  })
  assert.equal(notFound.status, 404)
  assert.equal(await notFound.text(), 'missing')

  const finalError = new TypeError('still offline')
  await assert.rejects(
    fetchReleaseAsset('dicts/uncached.json', {
      baseUrl: '/ancient-lexicon/',
      releasePrefix: 'release-200-cccc/',
      cacheStorage: new MemoryCacheStorage(),
      fetchImpl: async () => {
        throw finalError
      }
    }),
    (error) => error === finalError
  )
})
