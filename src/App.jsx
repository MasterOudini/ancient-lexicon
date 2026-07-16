import { useCallback, useEffect, useMemo, useState } from 'react'
import DictionaryList from './components/DictionaryList.jsx'
import ReferenceDictionaries from './components/ReferenceDictionaries.jsx'
import MeaningSearch from './components/MeaningSearch.jsx'
import HebrewComparative from './components/HebrewComparative.jsx'
import RootsView from './components/RootsView.jsx'
import SettingsView from './components/SettingsView.jsx'
import AboutView from './components/AboutView.jsx'
import TabIcon from './components/TabIcon.jsx'
import { LANGUAGES, HEBREW_CAVEAT } from './data/languages.js'
import { LEXICON } from './data/lexicon.js'
import { findRoot } from './data/roots.js'
import { findAttestedRootExact, loadAttestedRootCatalog } from './lib/attestedRootCatalog.js'
import { searchEntries } from './lib/search.js'
import {
  getJSON,
  setJSON,
  SETTINGS_KEY,
  CUSTOM_ENTRIES_KEY
} from './lib/storage.js'

// ---------------------------------------------------------------------------
// CONFIG — user-editable app settings.
// Colors are CSS custom properties at the top of src/styles.css.
// Dictionary content lives in src/data/lexicon/ modules; roots in
// src/data/roots.js; the language registry in src/data/languages.js.
// ---------------------------------------------------------------------------
const CONFIG = {
  appName: 'Ancient Lexicon',
  subtitle: 'A comparative lexicon of the ancient Near East',
  // Language ids (from src/data/languages.js) enabled on first launch.
  defaultEnabledLangs: LANGUAGES.map((l) => l.id),
  // The app starts in dark. Settings offers Light and Auto (follow the
  // system preference); the choice persists with the other settings.
  defaultTheme: 'dark',
  strings: {
    searchPlaceholder: 'Search Hebrew or English…',
    allChip: 'All',
    scriptsCaveatsTitle: 'About the scripts and pronunciation',
    notInDatabase: 'not in database',
    verifyTag: 'verify against corpus',
    addedByYou: 'added by you',
    addedByYouGroup: 'Added by you',
    deleteEntry: 'Delete',
    tabs: {
      dictionary: 'Dictionary',
      roots: 'Roots',
      about: 'About',
      settings: 'Settings'
    },
    modes: { concepts: 'Comparative', strongs: 'Reference dictionaries', meaning: 'By meaning' },
    compareAllHebrew: 'All Hebrew',
    compareCards: 'Curated & saved',
    noResults: 'No entries match this search.',
    searchHint:
      'Search by English (lion), Hebrew (אריה), transliteration (labbu), or paste glyphs from any plaque.',
    clearSearch: 'Clear search',
    entryCount: '{n} entries',
    matchCount: '{n} matches',
    oneMatch: '1 match',
    showingOf: 'Showing {shown} of {total} — keep scrolling for more',
    refSearchPlaceholder: 'Search {name} — headword, meaning, or number…',
    strongsLoading: 'Loading dictionary…',
    strongsLoadFailed:
      'This dictionary could not be loaded. Check your connection and try again.',
    meaningSearchPlaceholder: 'Search by English or Hebrew meaning…',
    meaningIntro:
      'Automatic results share an English gloss. They are gathered for comparison, not verified as equivalents or cognates. Only the curated comparative cards are verified cross-language matches.',
    meaningIndexLoading: 'Loading the compact meaning index…',
    meaningIndexFailed:
      'The meaning index could not be loaded. Open this mode once while online so it can be cached for offline use.',
    meaningPromptTitle: 'Search one meaning across every dictionary',
    meaningPromptHint:
      'Try father, water, king, אָב, מַיִם, or a Hebrew transliteration such as ab or melek.',
    meaningCapped: 'Very common glosses are capped per language.',
    noMeaningResults: 'No indexed English meaning matches this search.',
    noMeaningHint:
      'Modern vocabulary may have little ancient coverage. Try a core word or a Hebrew headword.',
    verifiedMatchesTitle: 'Verified comparative entries',
    verifiedBadge: 'Verified comparative entry',
    directMatchesTitle: 'Direct Hebrew / Aramaic headword matches',
    directMatchTag: 'Direct dictionary headword match.',
    hebrewSearchHint:
      'Search a Hebrew headword, English meaning, transliteration, dictionary name, or source number.',
    meaningMatchTag: 'Matched by English meaning “{meaning}” — not a verified equivalent.',
    egyptianCoverage:
      'Only Egyptian entries with an explicit English gloss are searched; German-only entries are omitted.',
    akkadianCoverage:
      'Akkadian results come from the limited RINAP Neo-Assyrian sub-corpus, not a complete Akkadian dictionary.',
    hittiteCoverage:
      'Open Hittite coverage combines expert comparative datasets, a small basic-vocabulary list, a conservatively filtered public-domain 1936 glossary, and small community datasets. Historical and community rows are leads, not modern scholarly verification; this is not the Chicago Hittite Dictionary or a complete Hittite lexicon.',
    osaCoverage:
      'Open Old South Arabian coverage is a small community layer from Wiktionary and Wikidata, mainly Sabaean with tiny variety subsets. DASI is an open inscription corpus, not a publicly exportable word-to-English dictionary, so inscription translations are not used to invent lexical matches.',
    curatedOnlyCoverage:
      'No automatic open-dataset match; a verified comparative form appears above.',
    notFoundInGlosses: 'not found in indexed English glosses'
  }
}
// ---------------------------------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('dictionary')
  const [dictMode, setDictMode] = useState('concepts')
  const [enabledLangs, setEnabledLangs] = useState(() => {
    const stored = getJSON(SETTINGS_KEY, null)
    return Array.isArray(stored?.enabledLangs)
      ? stored.enabledLangs
      : CONFIG.defaultEnabledLangs
  })
  const [theme, setTheme] = useState(() => {
    const stored = getJSON(SETTINGS_KEY, null)
    return ['auto', 'light', 'dark'].includes(stored?.theme)
      ? stored.theme
      : CONFIG.defaultTheme
  })
  const [customEntries, setCustomEntries] = useState(() =>
    getJSON(CUSTOM_ENTRIES_KEY, [])
  )
  const [selectedRootId, setSelectedRootId] = useState(null)
  const [query, setQuery] = useState('')
  const [comparisonScope, setComparisonScope] = useState('hebrew')

  // Apply the theme to the document and keep the browser-chrome color in
  // step (the status bar around the installed app).
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'auto' && media.matches)
      const meta = document.querySelector(
        'meta[name="theme-color"]:not([media])'
      )
      if (meta) meta.setAttribute('content', dark ? '#1C1813' : '#ECE5D5')
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  const allEntries = useMemo(
    () => [...LEXICON, ...customEntries],
    [customEntries]
  )
  const results = useMemo(
    () => searchEntries(allEntries, query),
    [allEntries, query]
  )
  // Stable references keep the memoized cards from re-rendering on every
  // keystroke in the search box.
  const enabledLanguages = useMemo(
    () => LANGUAGES.filter((l) => enabledLangs.includes(l.id)),
    [enabledLangs]
  )
  const allOn = enabledLangs.length === LANGUAGES.length

  function updateSettings(nextEnabledLangs, nextTheme) {
    setEnabledLangs(nextEnabledLangs)
    setTheme(nextTheme)
    setJSON(SETTINGS_KEY, {
      enabledLangs: nextEnabledLangs,
      theme: nextTheme
    })
  }

  function toggleLang(id) {
    const next = enabledLangs.includes(id)
      ? enabledLangs.filter((x) => x !== id)
      : [...enabledLangs, id]
    updateSettings(next, theme)
  }

  function changeTheme(nextTheme) {
    updateSettings(enabledLangs, nextTheme)
  }

  function changeEnabledLangs(nextEnabledLangs) {
    updateSettings(nextEnabledLangs, theme)
  }

  // A root chip on a dictionary card navigates to that root's detail view.
  const openRoot = useCallback((letters) => {
    const root = findRoot('hebrew', letters)
    if (root) {
      setSelectedRootId(root.id)
      setActiveTab('roots')
    }
  }, [])

  const openUniversalRoot = useCallback((reference) => {
    if (!reference?.letters) return

    loadAttestedRootCatalog()
      .then((catalog) => {
        const root = findAttestedRootExact(
          catalog,
          reference.language || 'hebrew',
          reference.letters
        )
        if (!root) return
        setSelectedRootId(root.id)
        setActiveTab('roots')
      })
      .catch(() => {})
  }, [])

  const selectRoot = useCallback((id) => {
    setSelectedRootId(id)
  }, [])

  const deleteCustomEntry = useCallback((id) => {
    const next = customEntries.filter((entry) => entry.id !== id)
    setCustomEntries(next)
    setJSON(CUSTOM_ENTRIES_KEY, next)
  }, [customEntries])

  const clearQuery = useCallback(() => setQuery(''), [])

  function addCustomEntry(entry) {
    const next = [...customEntries, entry]
    setCustomEntries(next)
    setJSON(CUSTOM_ENTRIES_KEY, next)
  }

  function importBackup({ settings, customEntries: imported }) {
    const nextEnabledLangs = Array.isArray(settings?.enabledLangs)
      ? settings.enabledLangs
      : enabledLangs
    const nextTheme = ['auto', 'light', 'dark'].includes(settings?.theme)
      ? settings.theme
      : theme
    updateSettings(nextEnabledLangs, nextTheme)
    setCustomEntries(imported)
    setJSON(CUSTOM_ENTRIES_KEY, imported)
  }

  return (
    <div className="app-shell">
      <div className="app-scroll" data-app-scroll>
        <div className="app">
      <header className="header">
        <div className="brand">{CONFIG.appName}</div>
        <p className="header-subtitle">{CONFIG.subtitle}</p>
        <p className="header-meta">
          {LEXICON.length} concepts · {LANGUAGES.length} ancient languages ·
          reference dictionaries
        </p>
      </header>

      {activeTab === 'dictionary' && (
        <main>
          <div className="segmented" role="tablist" aria-label="Dictionary mode">
            {['concepts', 'strongs', 'meaning'].map((mode) => (
              <button
                key={mode}
                role="tab"
                aria-selected={dictMode === mode}
                className={'segment' + (dictMode === mode ? ' on' : '')}
                onClick={() => setDictMode(mode)}
              >
                {CONFIG.strings.modes[mode]}
              </button>
            ))}
          </div>

          {dictMode === 'concepts' && (
            <>
              <input
                className="searchbar"
                type="search"
                dir="auto"
                placeholder={CONFIG.strings.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label={CONFIG.strings.searchPlaceholder}
              />

              <div className="chiprow comparison-scope" role="tablist" aria-label="Comparative coverage">
                <button
                  role="tab"
                  aria-selected={comparisonScope === 'hebrew'}
                  className={'chip' + (comparisonScope === 'hebrew' ? ' on' : '')}
                  onClick={() => setComparisonScope('hebrew')}
                >
                  {CONFIG.strings.compareAllHebrew}
                </button>
                <button
                  role="tab"
                  aria-selected={comparisonScope === 'cards'}
                  className={'chip' + (comparisonScope === 'cards' ? ' on' : '')}
                  onClick={() => setComparisonScope('cards')}
                >
                  {CONFIG.strings.compareCards}
                </button>
              </div>

              {comparisonScope === 'cards' ? (
                <>
                  <div className="chiprow" role="group" aria-label="Language filters">
                    <button
                      className={'chip' + (allOn ? ' on' : '')}
                      onClick={() =>
                        changeEnabledLangs(allOn ? [] : LANGUAGES.map((l) => l.id))
                      }
                    >
                      {CONFIG.strings.allChip}
                    </button>
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.id}
                        className={'chip' + (enabledLangs.includes(l.id) ? ' on' : '')}
                        onClick={() => toggleLang(l.id)}
                      >
                        {l.name}
                      </button>
                    ))}
                  </div>

                  <details className="infobox">
                    <summary>{CONFIG.strings.scriptsCaveatsTitle}</summary>
                    <ul>
                      <li>{HEBREW_CAVEAT}</li>
                      {LANGUAGES.map((l) => (
                        <li key={l.id}>{l.caveat}</li>
                      ))}
                    </ul>
                  </details>

                  <DictionaryList
                    results={results}
                    query={query}
                    languages={enabledLanguages}
                    onRootClick={openRoot}
                    onDelete={deleteCustomEntry}
                    strings={CONFIG.strings}
                    onClearQuery={clearQuery}
                  />
                </>
              ) : (
                <HebrewComparative
                  query={query}
                  strings={CONFIG.strings}
                  onClearQuery={clearQuery}
                  onRootClick={openUniversalRoot}
                />
              )}
            </>
          )}

          {dictMode === 'strongs' && (
            <ReferenceDictionaries strings={CONFIG.strings} />
          )}

          {dictMode === 'meaning' && (
            <MeaningSearch strings={CONFIG.strings} onRootClick={openRoot} />
          )}
        </main>
      )}

      {activeTab === 'roots' && (
        <RootsView
          selectedRootId={selectedRootId}
          onSelectRoot={selectRoot}
        />
      )}

      {activeTab === 'about' && <AboutView />}

      {activeTab === 'settings' && (
        <SettingsView
          enabledLangs={enabledLangs}
          theme={theme}
          onSetTheme={changeTheme}
          customEntries={customEntries}
          onAddEntry={addCustomEntry}
          onDeleteEntry={deleteCustomEntry}
          onImport={importBackup}
        />
      )}
        </div>
      </div>

      <nav className="tabbar" aria-label="Tabs">
        <button
          className={activeTab === 'dictionary' ? 'active' : ''}
          onClick={() => setActiveTab('dictionary')}
          aria-current={activeTab === 'dictionary'}
        >
          <TabIcon name="dictionary" />
          {CONFIG.strings.tabs.dictionary}
        </button>
        <button
          className={activeTab === 'roots' ? 'active' : ''}
          onClick={() => setActiveTab('roots')}
          aria-current={activeTab === 'roots'}
        >
          <TabIcon name="roots" />
          {CONFIG.strings.tabs.roots}
        </button>
        <button
          className={activeTab === 'about' ? 'active' : ''}
          onClick={() => setActiveTab('about')}
          aria-current={activeTab === 'about'}
        >
          <TabIcon name="about" />
          {CONFIG.strings.tabs.about}
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
          aria-current={activeTab === 'settings'}
        >
          <TabIcon name="settings" />
          {CONFIG.strings.tabs.settings}
        </button>
      </nav>
    </div>
  )
}
