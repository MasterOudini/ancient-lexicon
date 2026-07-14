import { useRef, useState } from 'react'
import { LANGUAGES } from '../data/languages.js'
import {
  buildExport,
  getJSON,
  NEW_ENTRY_DRAFT_KEY,
  parseImport,
  setJSON
} from '../lib/storage.js'
import { foldFinals } from '../lib/scripts.js'

// Settings: appearance, backup (export/import), and add-a-word. The
// data-honesty statement, sources, and font licenses live on the About tab.

const THEMES = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'auto', label: 'Auto' }
]

export default function SettingsView({
  enabledLangs,
  theme,
  onSetTheme,
  customEntries,
  onAddEntry,
  onImport
}) {
  const fileRef = useRef(null)
  const [importStatus, setImportStatus] = useState('')
  const [formStatus, setFormStatus] = useState('')

  // Add-a-word form state.
  const [savedDraft] = useState(() => getJSON(NEW_ENTRY_DRAFT_KEY, {}))
  const [english, setEnglish] = useState(
    typeof savedDraft?.english === 'string' ? savedDraft.english : ''
  )
  const [hebrewWord, setHebrewWord] = useState(
    typeof savedDraft?.hebrewWord === 'string' ? savedDraft.hebrewWord : ''
  )
  const [hebrewTranslit, setHebrewTranslit] = useState(
    typeof savedDraft?.hebrewTranslit === 'string' ? savedDraft.hebrewTranslit : ''
  )
  const [rootLetters, setRootLetters] = useState(
    typeof savedDraft?.rootLetters === 'string' ? savedDraft.rootLetters : ''
  )
  const [langFields, setLangFields] = useState(
    savedDraft?.langFields && typeof savedDraft.langFields === 'object'
      ? savedDraft.langFields
      : {}
  )

  // Persist on the input event itself so an automatic service-worker reload
  // cannot race React's passive effects and erase the latest edit.
  function saveDraft(changes) {
    setJSON(NEW_ENTRY_DRAFT_KEY, {
      english,
      hebrewWord,
      hebrewTranslit,
      rootLetters,
      langFields,
      ...changes
    })
  }

  function setLangField(langId, field, value) {
    const next = {
      ...langFields,
      [langId]: { ...(langFields[langId] || {}), [field]: value }
    }
    setLangFields(next)
    saveDraft({ langFields: next })
  }

  function handleExport() {
    const payload = buildExport({ enabledLangs, theme }, customEntries)
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json'
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ancient-lexicon-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      let parsed
      try {
        parsed = JSON.parse(reader.result)
      } catch {
        setImportStatus('Could not read this file as JSON.')
        return
      }
      const result = parseImport(parsed)
      if (!result.ok) {
        setImportStatus(result.error)
        return
      }
      const confirmed = window.confirm(
        'Importing replaces your current settings and custom entries with the contents of this backup. Continue?'
      )
      if (!confirmed) {
        setImportStatus('Import cancelled.')
        return
      }
      onImport({
        settings: result.settings,
        customEntries: result.customEntries
      })
      setImportStatus(
        `Imported ${result.customEntries.length} custom entr${
          result.customEntries.length === 1 ? 'y' : 'ies'
        }.`
      )
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function handleAddWord(event) {
    event.preventDefault()
    const glosses = english
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (glosses.length === 0 || !hebrewWord.trim()) {
      setFormStatus('English glosses and a Hebrew word are required.')
      return
    }
    const forms = {}
    for (const lang of LANGUAGES) {
      const f = langFields[lang.id]
      if (!f) continue
      const form = {}
      if (f.translit?.trim()) form.translit = f.translit.trim()
      if (f.script?.trim()) {
        // Aramaic input is square-script letters (rendered to Imperial
        // Aramaic automatically); other languages take pasted glyphs.
        if (lang.id === 'aramaic') form.hebrewLetters = f.script.trim()
        else form.script = f.script.trim()
      }
      if (f.note?.trim()) form.note = f.note.trim()
      if (Object.keys(form).length > 0) forms[lang.id] = form
    }
    onAddEntry({
      id: 'custom-' + Date.now(),
      english: glosses,
      hebrew: {
        word: hebrewWord.trim(),
        translit: hebrewTranslit.trim(),
        root: foldFinals(rootLetters.replace(/\s/g, ''))
      },
      forms,
      custom: true
    })
    setJSON(NEW_ENTRY_DRAFT_KEY, {})
    setEnglish('')
    setHebrewWord('')
    setHebrewTranslit('')
    setRootLetters('')
    setLangFields({})
    setFormStatus('Saved. The word now appears in the dictionary.')
  }

  return (
    <section>
      <div className="settings-section">
        <h2>Appearance</h2>
        <p>
          The app starts in Dark. Light overrides it; Auto follows the device
          light/dark setting.
        </p>
        <div
          className="chiprow"
          role="group"
          aria-label="Theme"
          style={{ padding: '2px' }}
        >
          {THEMES.map((t) => (
            <button
              key={t.id}
              className={'chip' + (theme === t.id ? ' on' : '')}
              aria-pressed={theme === t.id}
              onClick={() => onSetTheme(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h2>Backup</h2>
        <p>
          iOS can clear the stored data of websites that have not been visited
          for a while. Export a backup regularly so your custom entries and
          settings survive; import restores them on this or another device.
        </p>
        <div className="btnrow">
          <button className="btn primary" onClick={handleExport}>
            Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
        {importStatus && <p className="form-status">{importStatus}</p>}
      </div>

      <div className="settings-section">
        <h2>Add a word</h2>
        <form onSubmit={handleAddWord}>
          <label className="field">
            English glosses (comma-separated)
            <input
              value={english}
              onChange={(e) => {
                setEnglish(e.target.value)
                saveDraft({ english: e.target.value })
              }}
              placeholder="water, waters"
            />
          </label>
          <label className="field">
            Hebrew word (with niqqud if you have it)
            <input
              dir="rtl"
              lang="he"
              value={hebrewWord}
              onChange={(e) => {
                setHebrewWord(e.target.value)
                saveDraft({ hebrewWord: e.target.value })
              }}
            />
          </label>
          <label className="field">
            Hebrew transliteration
            <input
              value={hebrewTranslit}
              onChange={(e) => {
                setHebrewTranslit(e.target.value)
                saveDraft({ hebrewTranslit: e.target.value })
              }}
            />
          </label>
          <label className="field">
            Root letters (no final letters)
            <input
              dir="rtl"
              lang="he"
              value={rootLetters}
              onChange={(e) => {
                setRootLetters(e.target.value)
                saveDraft({ rootLetters: e.target.value })
              }}
            />
          </label>

          {LANGUAGES.map((lang) => (
            <details className="langfields" key={lang.id}>
              <summary>{lang.name}</summary>
              <label className="field">
                Transliteration
                <input
                  value={langFields[lang.id]?.translit || ''}
                  onChange={(e) =>
                    setLangField(lang.id, 'translit', e.target.value)
                  }
                />
              </label>
              <label className="field">
                {lang.id === 'aramaic'
                  ? 'Square-script letters (Imperial Aramaic glyphs render automatically)'
                  : 'Original-script glyphs (paste)'}
                <input
                  dir={lang.dir}
                  className={lang.fontClass}
                  value={langFields[lang.id]?.script || ''}
                  onChange={(e) =>
                    setLangField(lang.id, 'script', e.target.value)
                  }
                />
              </label>
              <label className="field">
                Note
                <input
                  value={langFields[lang.id]?.note || ''}
                  onChange={(e) =>
                    setLangField(lang.id, 'note', e.target.value)
                  }
                />
              </label>
            </details>
          ))}

          <div className="btnrow">
            <button className="btn primary" type="submit">
              Save word
            </button>
          </div>
          {formStatus && <p className="form-status">{formStatus}</p>}
        </form>
        <p>
          Custom words are stored only on this device, appear in dictionary
          search, and can be deleted from their card.
        </p>
      </div>

    </section>
  )
}
