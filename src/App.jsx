import { useEffect, useMemo, useState } from 'react'
import ConceptCard from './components/ConceptCard.jsx'
import RootsView from './components/RootsView.jsx'
import SettingsView from './components/SettingsView.jsx'
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
// Dictionary content lives in src/data/lexicon.js; roots in
// src/data/roots.js; the language registry in src/data/languages.js.
// ---------------------------------------------------------------------------
const CONFIG = {
  appName: 'Ancient Lexicon',
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
    deleteEntry: 'Delete',
    tabs: { dictionary: 'Dictionary', roots: 'Roots', settings: 'Settings' },
    noResults: 'No entries match this search.'
  }
}
// ---------------------------------------------------------------------------

export default function App() {
  const [activeTab, setActiveTab] = useState('dictionary')
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
  const enabledLanguages = LANGUAGES.filter((l) => enabledLangs.includes(l.id))
  const allOn = enabledLangs.length === LANGUAGES.length

  function toggleLang(id) {
    setEnabledLangs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // A root chip on a dictionary card navigates to that root's detail view.
  function openRoot(letters) {
    const root = findRoot('hebrew', letters)
    if (root) {
      setSelectedRootId(root.id)
      setActiveTab('roots')
    }
  }

  function deleteCustomEntry(id) {
    setCustomEntries((prev) => prev.filter((e) => e.id !== id))
  }

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
      <div className="brand">{CONFIG.appName}</div>

      {activeTab === 'dictionary' && (
        <main>
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

          {results.length === 0 && <p>{CONFIG.strings.noResults}</p>}
          {results.map((entry) => (
            <ConceptCard
              key={entry.id}
              entry={entry}
              languages={enabledLanguages}
              onRootClick={openRoot}
              onDelete={entry.custom ? () => deleteCustomEntry(entry.id) : null}
              strings={CONFIG.strings}
            />
          ))}
        </main>
      )}

      {activeTab === 'roots' && (
        <RootsView
          selectedRootId={selectedRootId}
          onSelectRoot={setSelectedRootId}
        />
      )}

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
