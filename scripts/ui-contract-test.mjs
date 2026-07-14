// Server-render the key universal-card contracts with the production JSX
// transform. This catches broken prop wiring without adding a DOM test runtime.

import assert from 'node:assert/strict'
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
    HebrewEntryRow,
    UniversalComparisonCard
  } = await server.ssrLoadModule('/src/components/HebrewComparative.jsx')
  const { default: AboutView } = await server.ssrLoadModule('/src/components/AboutView.jsx')

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

  const about = renderToStaticMarkup(React.createElement(AboutView))
  assert.match(about, /aria-label="Installed app version"/)
  assert.match(about, new RegExp(`data-app-version="${contractVersion}">${contractVersion}<`))
  assert.match(about, new RegExp(`data-app-build="${contractBuild}"><code dir="ltr">${contractBuild}<`))

  console.log('verified exact-row, six-plaque, and installed-version UI contracts')
} finally {
  await server.close()
}
