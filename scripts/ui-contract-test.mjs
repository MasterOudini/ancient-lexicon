// Server-render the key universal-card contracts with the production JSX
// transform. This catches broken prop wiring without adding a DOM test runtime.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const contractVersion = 'test-version'
const contractBuild = 'test-build-1234567'
const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(contractVersion),
    __APP_BUILD_ID__: JSON.stringify(contractBuild)
  },
  server: { middlewareMode: true }
})

try {
  const {
    default: HebrewComparative,
    HebrewEntryRow,
    UniversalComparisonCard
  } = await server.ssrLoadModule('/src/components/HebrewComparative.jsx')
  const { default: AboutView } = await server.ssrLoadModule('/src/components/AboutView.jsx')
  const { default: TabIcon } = await server.ssrLoadModule('/src/components/TabIcon.jsx')
  const { RootDetail } = await server.ssrLoadModule('/src/components/RootsView.jsx')
  const {
    findAttestedRoot,
    mergeAttestedRootCatalog
  } = await server.ssrLoadModule('/src/lib/attestedRootCatalog.js')

  const entry = {
    sourceKey: 'strongs:H2803',
    source: 'strongs',
    sourceLabel: 'Strong’s',
    id: 'H2803',
    headword: 'חָשַׁב',
    transliteration: 'chashab',
    definition: 'think, count, weave',
    partOfSpeech: 'verb',
    shard: '00'
  }
  const openRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry,
      initiallyOpen: true,
      promotionKey: 'H2803:strongs:H2803'
    })
  )
  assert.match(openRow, /^<details[^>]*\sopen=""[^>]*>/)
  assert.match(openRow, /data-source-key="strongs:H2803"/)
  assert.match(openRow, /Close comparison/)

  const languages = ['akkadian', 'sumerian', 'egyptian', 'hittite', 'aramaic', 'osa']
  const senses = [{
    key: 'think',
    label: 'think/consider/regard',
    sourceText: 'think, consider, regard',
    slots: languages.map((languageId) => ({
      languageId,
      status: 'none',
      primary: null,
      alternatives: []
    }))
  }]
  const card = renderToStaticMarkup(
    React.createElement(UniversalComparisonCard, { entry, senses })
  )
  assert.equal((card.match(/data-language=/g) || []).length, 6)
  for (const language of languages) assert.match(card, new RegExp(`data-language="${language}"`))
  assert.doesNotMatch(card, /data-language="(?:hebrew|english)"/)

  const idleComparative = renderToStaticMarkup(
    React.createElement(HebrewComparative, {
      query: '   ',
      strings: {
        noResults: 'No entries',
        hebrewSearchHint: 'Try another spelling.',
        clearSearch: 'Clear',
        matchCount: '{n} matches'
      },
      onClearQuery: () => {}
    })
  )
  assert.equal(idleComparative, '')

  const about = renderToStaticMarkup(React.createElement(AboutView))
  assert.match(about, /aria-label="Installed app version"/)
  assert.match(about, new RegExp(`data-app-version="${contractVersion}">${contractVersion}<`))
  assert.match(about, new RegExp(`data-app-build="${contractBuild}"><code dir="ltr">${contractBuild}<`))

  for (const name of ['dictionary', 'roots', 'about', 'settings']) {
    const icon = renderToStaticMarkup(React.createElement(TabIcon, { name }))
    assert.match(icon, new RegExp(`^<svg[^>]*data-tab-icon="${name}"`))
    assert.match(icon, /aria-hidden="true"/)
    assert.match(icon, /focusable="false"/)
  }

  const rootPayload = JSON.parse(
    readFileSync(
      join(root, 'public', 'dicts', 'attested-roots-2026-07-v1.json'),
      'utf8'
    )
  )
  const completeRoots = mergeAttestedRootCatalog(rootPayload)
  const noop = () => {}
  const shmr = findAttestedRoot(completeRoots, 'hebrew', 'שמר')
  const rshm = findAttestedRoot(completeRoots, 'hebrew', 'רשמ')
  const abr = findAttestedRoot(completeRoots, 'hebrew', 'עבר')
  const aramaicZaq = completeRoots.byKey.get('biblical-aramaic:זעק')
  const aramaicPrs = completeRoots.byKey.get('biblical-aramaic:פרס')

  const shmrDetail = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: shmr,
      catalog: completeRoots,
      catalogStatus: 'ready',
      onSelectRoot: noop
    })
  )
  assert.match(shmrDetail, /Sharing letters is not evidence of a connection/)
  assert.match(shmrDetail, /<button[^>]*class="perm-tile found"[^>]*>[\s\S]*ר־ש־מ/)

  const rshmDetail = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: rshm,
      catalog: completeRoots,
      catalogStatus: 'ready',
      onSelectRoot: noop
    })
  )
  assert.match(rshmDetail, /data-root-provenance="source-derived"/)
  assert.match(rshmDetail, /BDB t\.es\.aa/)
  assert.match(rshmDetail, /Strong’s H7559/)
  assert.match(rshmDetail, /Daniel 10:21/)

  const abrDetail = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: abr,
      catalog: completeRoots,
      catalogStatus: 'ready',
      onSelectRoot: noop
    })
  )
  assert.equal((abrDetail.match(/class="perm-tile found"/g) || []).length, 5)
  assert.equal((abrDetail.match(/class="perm-tile ghost"/g) || []).length, 1)
  assert.match(abrDetail, /not an attested root here/)

  const unavailable = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: shmr,
      catalog: completeRoots,
      catalogStatus: 'error',
      onSelectRoot: noop
    })
  )
  assert.match(unavailable, /Permutation results are hidden/)
  assert.doesNotMatch(unavailable, /not an attested root here/)

  for (const aramaicRoot of [aramaicZaq, aramaicPrs]) {
    assert.ok(aramaicRoot)
    const aramaicDetail = renderToStaticMarkup(
      React.createElement(RootDetail, {
        root: aramaicRoot,
        catalog: completeRoots,
        catalogStatus: 'ready',
        onSelectRoot: noop
      })
    )
    assert.doesNotMatch(aramaicDetail, /Attested metathesis|Attested variant/)
    assert.doesNotMatch(aramaicDetail, /Interpretive root cluster/)
    assert.doesNotMatch(aramaicDetail, /1 Samuel 8:18/)
  }

  console.log('verified comparison, installed-version, tab-icon, and complete root-permutation UI contracts')
} finally {
  await server.close()
}
