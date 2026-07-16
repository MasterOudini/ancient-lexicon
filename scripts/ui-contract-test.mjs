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
  const { default: ConceptCard } = await server.ssrLoadModule('/src/components/ConceptCard.jsx')
  const { default: AboutView } = await server.ssrLoadModule('/src/components/AboutView.jsx')
  const { default: TabIcon } = await server.ssrLoadModule('/src/components/TabIcon.jsx')
  const { RootDetail } = await server.ssrLoadModule('/src/components/RootsView.jsx')
  const { scoreReferenceIndexItem } = await server.ssrLoadModule(
    '/src/components/ReferenceDictionaries.jsx'
  )
  const { LANGUAGES } = await server.ssrLoadModule('/src/data/languages.js')
  const {
    findAttestedRootExact,
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
    shard: '00',
    rootReferences: [{
      source: 'strongs',
      sourceLabel: 'Strongâ€™s',
      id: 'H2803',
      sourceKey: 'strongs:H2803',
      letters: '\u05d7\u05e9\u05d1',
      language: 'hebrew',
      headword: '×—Ö¸×©×Ö·×‘',
      definition: 'think, count, weave'
    }]
  }
  const openRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry,
      initiallyOpen: true,
      promotionKey: 'H2803:strongs:H2803',
      onRootClick: () => {}
    })
  )
  assert.match(openRow, /^<details[^>]*\sopen=""[^>]*>/)
  assert.match(openRow, /data-source-key="strongs:H2803"/)
  assert.match(openRow, /Close comparison/)
  assert.match(openRow, /class="rootchip hebrew-row-root"/)
  assert.match(openRow, /class="rootchip hebrew-row-root"[^>]*dir="rtl"[^>]*lang="he"/)
  assert.match(openRow, /data-root-source="strongs:H2803"/)
  assert.match(openRow, />\u05d7\u05e9\u05d1<\/button>/)
  assert.doesNotMatch(openRow, /Published lexical root entry/)

  const multiRootRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry: {
        ...entry,
        sourceKey: 'jastrow:B00502',
        source: 'jastrow',
        sourceLabel: 'Jastrow',
        id: 'B00502',
        languageCode: 'und',
        languageLabel: 'Hebrew/Aramaic (unmarked)',
        rootReferences: [
          { ...entry.rootReferences[0], sourceKey: 'jastrow:B00502', letters: 'בט', language: 'hebrew-aramaic-unclassified' },
          { ...entry.rootReferences[0], sourceKey: 'jastrow:B00502', letters: 'פץ', language: 'hebrew-aramaic-unclassified' }
        ]
      },
      onRootClick: () => {}
    })
  )
  assert.match(multiRootRow, /class="lex-lemma" dir="rtl" lang="und-Hebr"/)
  assert.match(multiRootRow, /Hebrew\/Aramaic \(unmarked\)/)
  assert.equal((multiRootRow.match(/class="rootchip hebrew-row-root"/g) || []).length, 2)
  assert.equal((multiRootRow.match(/data-root-language="hebrew-aramaic-unclassified"/g) || []).length, 2)

  const sourceFormsRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry: {
        ...entry,
        sourceKey: 'jastrow:B00534',
        source: 'jastrow',
        sourceLabel: 'Jastrow',
        id: 'B00534',
        headword: '\u05d1\u05b0\u05bc\u05d8\u05b7\u05e9\u05c1',
        transliteration: 'b\u0259\u1e6da\u0161',
        languageCode: 'und',
        languageLabel: 'Hebrew/Aramaic (unmarked)',
        forms: [
          { type: 'stem', word: '\u05d1\u05b7\u05bc\u05d8\u05b5\u05bc\u05d9\u05e9\u05c1', label: 'Pa.' },
          { type: 'stem', word: '\u05d0\u05b4\u05ea\u05b0\u05d1\u05b7\u05bc\u05d8\u05b5\u05bc\u05e9\u05c1', label: 'Ithpa.' }
        ]
      },
      initiallyOpen: true,
      onRootClick: () => {}
    })
  )
  assert.match(sourceFormsRow, /Stem forms:/)
  assert.match(sourceFormsRow, /Pa\./)
  assert.match(sourceFormsRow, /Ithpa\./)

  const referenceScoreFixture = {
    idLower: 'fixture',
    head: '',
    sub: '',
    script: '',
    aliases: [],
    forms: [],
    unresolvedLinks: [],
    def: ''
  }
  assert.equal(
    scoreReferenceIndexItem(
      { ...referenceScoreFixture, head: '\u05d3\u05e8\u05d1\u05df' },
      '\u05d3\u05e8\u05d1\u05df',
      '\u05d3\u05e8\u05d1\u05df'
    ),
    4
  )
  assert.equal(
    scoreReferenceIndexItem(
      { ...referenceScoreFixture, unresolvedLinks: ['\u05d3\u05e8\u05d1\u05df'] },
      '\u05d3\u05e8\u05d1\u05df',
      '\u05d3\u05e8\u05d1\u05df'
    ),
    2
  )

  const aramaicFirstRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry: { ...entry, languageCode: 'ar+he', rootReferences: [] },
      onRootClick: () => {}
    })
  )
  assert.match(aramaicFirstRow, /class="lex-lemma" dir="rtl" lang="arc"/)

  const unresolvedRow = renderToStaticMarkup(
    React.createElement(HebrewEntryRow, {
      entry: {
        ...entry,
        sourceKey: 'strongs:H5',
        id: 'H5',
        headword: '\u05d0\u05b2\u05d1\u05b7\u05d2\u05b0\u05ea\u05b8\u05d0',
        rootReferences: []
      },
      initiallyOpen: false,
      promotionKey: null,
      onRootClick: () => {}
    })
  )
  assert.match(unresolvedRow, /data-root-status="unresolved"/)
  assert.match(unresolvedRow, /Root not identified by source/)
  assert.doesNotMatch(unresolvedRow, /class="rootchip hebrew-row-root"/)

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

  const scriptForms = Object.fromEntries(
    languages.map((languageId) => [languageId, { script: `${languageId}-script`, translit: languageId }])
  )
  const conceptCard = renderToStaticMarkup(
    React.createElement(ConceptCard, {
      entry: {
        id: 'script-layout-contract',
        hebrew: { word: '\u05d0\u05b8\u05d1', translit: 'av' },
        english: ['father'],
        forms: scriptForms
      },
      languages: LANGUAGES,
      onRootClick: () => {},
      strings: { notInDatabase: 'Not in database', verifyTag: 'Verify' }
    })
  )
  assert.equal((conceptCard.match(/class="plaque-body plaque-body-script"/g) || []).length, 6)

  const scriptCard = renderToStaticMarkup(
    React.createElement(UniversalComparisonCard, {
      entry,
      senses: [{
        ...senses[0],
        slots: languages.map((languageId) => ({
          languageId,
          status: 'verified',
          primary: {
            dictionaryId: 'curated',
            entryId: `${languageId}-entry`,
            script: `${languageId}-script`,
            transliteration: languageId,
            meaning: 'test meaning',
            bridge: 'test'
          },
          alternatives: []
        }))
      }]
    })
  )
  assert.equal((scriptCard.match(/class="comparison-candidate-main plaque-body-script"/g) || []).length, 6)

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
  assert.match(about, /Legacy headword links that lack a stable entry ID/)

  for (const name of ['dictionary', 'roots', 'about', 'settings']) {
    const icon = renderToStaticMarkup(React.createElement(TabIcon, { name }))
    assert.match(icon, new RegExp(`^<svg[^>]*data-tab-icon="${name}"`))
    assert.match(icon, /aria-hidden="true"/)
    assert.match(icon, /focusable="false"/)
  }

  const styles = readFileSync(join(root, 'src', 'styles.css'), 'utf8')
  const appSource = readFileSync(join(root, 'src', 'App.jsx'), 'utf8')
  const referenceSource = readFileSync(join(root, 'src', 'components', 'ReferenceDictionaries.jsx'), 'utf8')
  const documentRule = styles.match(/html,\s*body\s*\{([^}]+)\}/)?.[1] || ''
  const rootRule = styles.match(/#root\s*\{([^}]+)\}/)?.[1] || ''
  const shellRule = styles.match(/\.app-shell\s*\{([^}]+)\}/)?.[1] || ''
  const scrollRule = styles.match(/\.app-scroll\s*\{([^}]+)\}/)?.[1] || ''
  const tabbarRule = styles.match(/\.tabbar\s*\{([^}]+)\}/)?.[1] || ''

  assert.match(appSource, /className="app-shell"/)
  assert.match(appSource, /className="app-scroll" data-app-scroll/)
  assert.match(appSource, /<\/div>\s*<\/div>\s*<nav className="tabbar"/)
  assert.match(referenceSource, /data-link-status="source-unresolved-headword-link"/)
  assert.match(referenceSource, /Source headword links \(no stable entry ID\):/)
  assert.match(documentRule, /height:\s*100%/)
  assert.match(documentRule, /overflow:\s*hidden/)
  assert.match(documentRule, /overscroll-behavior:\s*none/)
  assert.match(rootRule, /height:\s*100dvh/)
  assert.match(rootRule, /overflow:\s*hidden/)
  assert.match(shellRule, /grid-template-rows:\s*minmax\(0,\s*1fr\) auto/)
  assert.match(shellRule, /overflow:\s*hidden/)
  assert.match(scrollRule, /min-height:\s*0/)
  assert.match(scrollRule, /overflow-y:\s*auto/)
  assert.match(scrollRule, /overscroll-behavior-y:\s*none/)
  assert.match(tabbarRule, /position:\s*relative/)
  assert.match(tabbarRule, /padding:\s*6px 8px max\(6px, env\(safe-area-inset-bottom\)\)/)
  assert.doesNotMatch(tabbarRule, /position:\s*fixed/)
  assert.doesNotMatch(tabbarRule, /\bbottom\s*:/)
  assert.doesNotMatch(tabbarRule, /transform\s*:/)
  assert.doesNotMatch(styles, /\.tabbar::after\s*\{/)
  assert.doesNotMatch(styles, /plaque-body-egyptian/)
  assert.match(styles, /\.plaque-body-script\s*\{\s*display:\s*block/)

  const rootPayload = JSON.parse(
    readFileSync(
      join(root, 'public', 'dicts', 'attested-roots-2026-07-v2.json'),
      'utf8'
    )
  )
  const completeRoots = mergeAttestedRootCatalog(rootPayload)
  const noop = () => {}
  const bachash = findAttestedRootExact(completeRoots, 'hebrew', '\u05d1\u05d7\u05e9')
  const batash = findAttestedRootExact(completeRoots, 'hebrew', '\u05d1\u05d8\u05e9')
  const shmr = findAttestedRootExact(completeRoots, 'hebrew', 'שמר')
  const rshm = findAttestedRootExact(completeRoots, 'hebrew', 'רשמ')
  const abr = findAttestedRootExact(completeRoots, 'hebrew', 'עבר')
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

  const bachashDetail = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: bachash,
      catalog: completeRoots,
      catalogStatus: 'ready',
      onSelectRoot: noop
    })
  )
  assert.match(bachashDetail, /data-root-provenance="reviewed-mapping"/)
  assert.match(bachashDetail, /Academy of the Hebrew Language terminology database/)
  assert.match(bachashDetail, /term-28_2/)
  assert.match(bachashDetail, /does not explicitly label the headword as the triliteral root/)

  const batashDetail = renderToStaticMarkup(
    React.createElement(RootDetail, {
      root: batash,
      catalog: completeRoots,
      catalogStatus: 'ready',
      onSelectRoot: noop
    })
  )
  assert.match(batashDetail, /data-root-provenance="reviewed-mapping"/)
  assert.match(batashDetail, /term-26889_1/)
  assert.match(batashDetail, /strike or hit/)
  assert.match(batashDetail, /borrowed from Aramaic/)

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
