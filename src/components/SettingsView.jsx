import { useRef, useState } from 'react'
import { LANGUAGES, HEBREW_CAVEAT } from '../data/languages.js'
import { buildExport, parseImport } from '../lib/storage.js'
import { foldFinals } from '../lib/scripts.js'

// Settings: backup (export/import), add-a-word, and about-the-data.

export default function SettingsView({
  enabledLangs,
  customEntries,
  onAddEntry,
  onImport
}) {
  const fileRef = useRef(null)
  const [importStatus, setImportStatus] = useState('')
  const [formStatus, setFormStatus] = useState('')

  // Add-a-word form state.
  const [english, setEnglish] = useState('')
  const [hebrewWord, setHebrewWord] = useState('')
  const [hebrewTranslit, setHebrewTranslit] = useState('')
  const [rootLetters, setRootLetters] = useState('')
  const [langFields, setLangFields] = useState({})

  function setLangField(langId, field, value) {
    setLangFields((prev) => ({
      ...prev,
      [langId]: { ...(prev[langId] || {}), [field]: value }
    }))
  }

  function handleExport() {
    const payload = buildExport({ enabledLangs }, customEntries)
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
              onChange={(e) => setEnglish(e.target.value)}
              placeholder="water, waters"
            />
          </label>
          <label className="field">
            Hebrew word (with niqqud if you have it)
            <input
              dir="rtl"
              lang="he"
              value={hebrewWord}
              onChange={(e) => setHebrewWord(e.target.value)}
            />
          </label>
          <label className="field">
            Hebrew transliteration
            <input
              value={hebrewTranslit}
              onChange={(e) => setHebrewTranslit(e.target.value)}
            />
          </label>
          <label className="field">
            Root letters (no final letters)
            <input
              dir="rtl"
              lang="he"
              value={rootLetters}
              onChange={(e) => setRootLetters(e.target.value)}
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

      <div className="settings-section">
        <h2>About the data</h2>
        <p>{HEBREW_CAVEAT}</p>
        {LANGUAGES.map((l) => (
          <p key={l.id}>{l.caveat}</p>
        ))}
        <p>
          Attested facts are stated as facts with citations; conventions are
          labeled conventions; interpretations are labeled interpretations;
          unknowns are stated as unknown. No reconstructed proto-forms are
          shown or implied anywhere in the app. Forms tagged &lsquo;verify
          against corpus&rsquo; are conventional or uncertain and should be
          checked against corpus records (CAD, Wb., TAD, DASI/CSAI, museum
          catalogues) before scholarly use.
        </p>
        <p>
          Seed data lives in src/data/lexicon.js and src/data/roots.js and can
          be edited by hand; the entry shape is documented in each file.
        </p>
        <p>
          The bundled script fonts (Noto Sans Cuneiform, Noto Sans Egyptian
          Hieroglyphs, Noto Sans Imperial Aramaic, Noto Sans Old South
          Arabian) are licensed under the SIL Open Font License.
        </p>
      </div>
    </section>
  )
}
