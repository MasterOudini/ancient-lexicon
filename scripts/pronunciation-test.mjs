import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  GUIDE_LANGUAGE_DEFAULT,
  PRONUNCIATION_RULES,
  guideForCandidate,
  guideForHebrewEntry
} from '../src/lib/pronunciation.js'
import { decodeHebrewCatalog, resolveHebrewComparison } from '../src/lib/hebrewComparisonLoader.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))
const catalog = decodeHebrewCatalog(readJson(join(root, 'public/dicts/hebrew-catalog-2026-07-v1.json')))
const languages = ['akkadian', 'sumerian', 'egyptian', 'hittite', 'aramaic', 'osa']

assert.equal(GUIDE_LANGUAGE_DEFAULT, 'he', 'Hebrew must be the default guide language')
assert.deepEqual(Object.keys(PRONUNCIATION_RULES).sort(), ['akkadian', 'aramaic', 'egyptian', 'hebrew', 'hittite', 'osa', 'sumerian'])
assert.equal(catalog.entries.length, 18_992, 'the complete Hebrew catalog must remain present')

for (const entry of catalog.entries) {
  const guide = guideForHebrewEntry(entry)
  assert.equal(guide.state, 'resolved', `${entry.sourceKey} must have Hebrew reading guidance`)
  assert.equal(guide.source, entry.headword, `${entry.sourceKey} must preserve its displayed Hebrew source form`)
}

const important = new Map(['H1', 'H2803', 'H2805'].map((id) => [id, catalog.entries.find((entry) => entry.id === id)]))
for (const [id, entry] of important) {
  assert.ok(entry, `${id} must remain in the catalog`)
  const guide = guideForHebrewEntry(entry)
  assert.equal(guide.source, entry.headword, `${id} must remain phonetically separate from its homographs`)
  assert.ok(guide.syllables, `${id} must have syllable guidance`)
}
assert.notEqual(guideForHebrewEntry(important.get('H2803')).hebrew, guideForHebrewEntry(important.get('H2805')).hebrew)
assert.match(guideForHebrewEntry(important.get('H2803')).stress, /final stress/)
assert.match(guideForHebrewEntry(important.get('H2805')).stress, /final stress/)

const covered = new Set()
for (let shard = 0; shard < catalog.shardCount; shard++) {
  const id = shard.toString(16).padStart(2, '0')
  const payload = readJson(join(root, `public/dicts/hebrew-comparisons-2026-07-v1/${id}.json`))
  for (const entry of catalog.entries.filter((item) => item.shard === id)) {
    for (const sense of resolveHebrewComparison(entry, payload)) {
      for (const slot of sense.slots) {
        if (slot.status === 'none') {
          assert.equal(slot.primary, null, `${entry.sourceKey}/${sense.key}/${slot.languageId} empty plaque must have no primary`)
          assert.equal(slot.alternatives.length, 0, `${entry.sourceKey}/${sense.key}/${slot.languageId} empty plaque must have no pronunciation candidates`)
          continue
        }
        for (const candidate of [slot.primary, ...slot.alternatives]) {
          assert.ok(candidate, 'populated candidates must exist')
          const sourceTransliteration = candidate.transliteration
          const first = guideForCandidate(candidate, slot.languageId)
          const second = guideForCandidate(candidate, slot.languageId)
          assert.deepEqual(first, second, 'pronunciation rules must be deterministic')
          assert.ok(['resolved', 'unavailable'].includes(first.state), 'each populated form must resolve or honestly state unavailability')
          assert.equal(candidate.transliteration, sourceTransliteration, 'source transliteration must remain byte-for-byte unchanged')
          covered.add(slot.languageId)
        }
      }
    }
  }
}
assert.deepEqual([...covered].sort(), [...languages].sort(), 'each comparison language must have a populated tested candidate')

const difficult = guideForCandidate({ transliteration: 'šāṭ ḫuʿʾ' }, 'akkadian')
assert.equal(difficult.state, 'resolved')
assert.match(difficult.hebrew, /ש/)
assert.match(difficult.english, /sh/)
assert.match(difficult.ipa, /ʃ/)
assert.equal(guideForCandidate({ script: '𒀀', word: '𒀀', transliteration: null }, 'akkadian').state, 'unavailable')
assert.equal(guideForCandidate({ transliteration: 'ab' }, 'akkadian').audio.state, 'unavailable', 'ancient-language audio must never be presented as authoritative')

const appText = readFileSync(join(root, 'src/App.jsx'), 'utf8')
const uiText = readFileSync(join(root, 'src/components/HebrewComparative.jsx'), 'utf8')
const guideText = readFileSync(join(root, 'src/components/PronunciationGuide.jsx'), 'utf8')
assert.match(appText, /pronunciationGuideLanguage/)
assert.match(appText, /=== 'en' \? 'en' : 'he'/)
assert.match(uiText, /guideForCandidate/)
assert.match(uiText, /slot\.alternatives\.slice\(0, 4\)/)
assert.match(guideText, /data-guide-language/)
assert.match(guideText, /dir=\{isHebrew \? 'rtl' : 'ltr'\}/)
assert.match(guideText, /modern-Hebrew approximation/i)
for (const language of ['Hebrew', 'Akkadian', 'Sumerian', 'Egyptian', 'Hittite', 'Imperial Aramaic', 'Old South Arabian']) {
  assert.match(guideText, new RegExp(`\\['${language}'`))
}

console.log(`verified pronunciation guidance for ${catalog.entries.length} Hebrew entries and every populated comparison candidate`)
