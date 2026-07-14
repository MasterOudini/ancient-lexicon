// All localStorage access goes through this module and is wrapped in
// try/catch: Safari private browsing throws on setItem, and some embedded
// contexts throw on merely touching window.localStorage. The app must keep
// working with storage unavailable (defaults stay in memory).

export const SETTINGS_KEY = 'ancient-lexicon.settings.v1'
export const CUSTOM_ENTRIES_KEY = 'ancient-lexicon.custom-entries.v1'
export const NEW_ENTRY_DRAFT_KEY = 'ancient-lexicon.new-entry-draft.v1'

export function getJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Backup format. iOS can evict web storage of sites that have not been
// visited for a while, so users are encouraged to export regularly.
export function buildExport(settings, customEntries) {
  return {
    app: 'ancient-lexicon-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    customEntries
  }
}

// Validates a parsed backup object. Returns { ok, error?, settings?,
// customEntries? }. Only the app field is strictly validated per the backup
// contract; missing sections fall back to safe defaults.
export function parseImport(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'Not a valid backup file.' }
  }
  if (data.app !== 'ancient-lexicon-backup') {
    return { ok: false, error: 'This file is not an Ancient Lexicon backup.' }
  }
  return {
    ok: true,
    settings: data.settings && typeof data.settings === 'object' ? data.settings : {},
    customEntries: Array.isArray(data.customEntries) ? data.customEntries : []
  }
}
