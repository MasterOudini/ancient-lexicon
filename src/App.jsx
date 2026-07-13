import { useCallback, useEffect, useMemo, useState } from 'react'
import DictionaryList from './components/DictionaryList.jsx'
import HebrewLexiconView from './components/HebrewLexiconView.jsx'
import RootsView from './components/RootsView.jsx'
import SettingsView from './components/SettingsView.jsx'
import AboutView from './components/AboutView.jsx'
import { LANGUAGES, HEBREW_CAVEAT } from './data/languages.js'
import { LEXICON } from './data/lexicon.js'
import { findRoot } from './data/roots.js'
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
    modes: { concepts: 'Comparative', strongs: 'Hebrew lexicon' },
    noResults: 'No entries match this search.',
    searchHint:
      'Search by English (lion), Hebrew (אריה), transliteration (labbu), or paste glyphs from any plaque.',
    clearSearch: 'Clear search',
    entryCount: '{n} entries',
    matchCount: '{n} matches',
    oneMatch: '1 match',
    showingOf: 'Showing {shown} of {total} — keep scrolling for more',
    strongsSearchPlaceholder: 'Search lemma, meaning, or Strong’s number…',
    strongsSearchHint:
      'Search by Hebrew (שלום), transliteration (shalom), meaning (peace), or number (H7965).',
    strongsLoading: 'Loading the full Hebrew lexicon…',
    strongsLoadFailed:
      'The lexicon data could not be loaded. Reload the app and try again.',
    strongsKjvLabel: 'KJV renderings:',
    strongsPronLabel: 'Pronunciation (Strong’s notation):',
    strongsPresentedNote: 'Presented as published.'
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

  useEffect(() => {
    setJSON(SETTINGS_KEY, { enabledLangs, theme })
  }, [enabledLangs, theme])

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

  useEffect(() => {
    setJSON(CUSTOM_ENTRIES_KEY, customEntries)
  }, [customEntries])

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

  function toggleLang(id) {
    setEnabledLangs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // A root chip on a dictionary card navigates to that root's detail view.
  const openRoot = useCallback((letters) => {
    const root = findRoot('hebrew', letters)
    if (root) {
      setSelectedRootId(root.id)
      setActiveTab('roots')
    }
  }, [])

  const deleteCustomEntry = useCallback((id) => {
    setCustomEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearQuery = useCallback(() => setQuery(''), [])

  function addCustomEntry(entry) {
    setCustomEntries((prev) => [...prev, entry])
  }

  function importBackup({ settings, customEntries: imported }) {
    if (Array.isArray(settings?.enabledLangs)) {
      setEnabledLangs(settings.enabledLangs)
    }
    if (['auto', 'light', 'dark'].includes(settings?.theme)) {
      setTheme(settings.theme)
    }
    setCustomEntries(imported)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="brand">{CONFIG.appName}</div>
        <p className="header-subtitle">{CONFIG.subtitle}</p>
        <p className="header-meta">
          {LEXICON.length} concepts · {LANGUAGES.length} ancient languages ·
          Strong’s Hebrew lexicon
        </p>
      </header>

      {activeTab === 'dictionary' && (
        <main>
          <div className="segmented" role="tablist" aria-label="Dictionary mode">
            {['concepts', 'strongs'].map((mode) => (
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

              <div className="chiprow" role="group" aria-label="Language filters">
                <button
                  className={'chip' + (allOn ? ' on' : '')}
                  onClick={() =>
                    setEnabledLangs(allOn ? [] : LANGUAGES.map((l) => l.id))
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
          )}

          {dictMode === 'strongs' && (
            <HebrewLexiconView strings={CONFIG.strings} />
          )}
        </main>
      )}

      {activeTab === 'roots' && (
        <RootsView
          selectedRootId={selectedRootId}
          onSelectRoot={setSelectedRootId}
        />
      )}

      {activeTab === 'about' && <AboutView />}

      {activeTab === 'settings' && (
        <SettingsView
          enabledLangs={enabledLangs}
          theme={theme}
          onSetTheme={setTheme}
          customEntries={customEntries}
          onAddEntry={addCustomEntry}
          onDeleteEntry={deleteCustomEntry}
          onImport={importBackup}
        />
      )}

      <nav className="tabbar" aria-label="Tabs">
        <button
          className={activeTab === 'dictionary' ? 'active' : ''}
          onClick={() => setActiveTab('dictionary')}
          aria-current={activeTab === 'dictionary'}
        >
          <span className="tab-glyph script-cuneiform" aria-hidden="true">
            𒁾
          </span>
          {CONFIG.strings.tabs.dictionary}
        </button>
        <button
          className={activeTab === 'roots' ? 'active' : ''}
          onClick={() => setActiveTab('roots')}
          aria-current={activeTab === 'roots'}
        >
          <span className="tab-glyph" aria-hidden="true">
            √
          </span>
          {CONFIG.strings.tabs.roots}
        </button>
        <button
          className={activeTab === 'about' ? 'active' : ''}
          onClick={() => setActiveTab('about')}
          aria-current={activeTab === 'about'}
        >
          <span className="tab-glyph script-egyptian" aria-hidden="true">
            𓏞
          </span>
          {CONFIG.strings.tabs.about}
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
          aria-current={activeTab === 'settings'}
        >
          <span className="tab-glyph" aria-hidden="true">
            ⋯
          </span>
          {CONFIG.strings.tabs.settings}
        </button>
      </nav>
    </div>
  )
}
