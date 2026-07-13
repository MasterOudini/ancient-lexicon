import { memo } from 'react'
import { toImperialAramaic, toMusnad } from '../lib/scripts.js'

// One dictionary entry rendered as a museum object label: Hebrew headword
// with niqqud, English glosses, a tappable root chip, then one plaque per
// enabled language. A language with no attested/entered form shows a subdued
// "not in database" line instead of hiding the plaque — absence is
// information.

const MAQAF = '־'

function rootChipLabel(root) {
  return Array.from(root).join(MAQAF)
}

function Plaque({ language, form, strings }) {
  const eyebrow = `${language.name} · ${language.scriptName}`

  if (!form) {
    return (
      <div className="plaque">
        <div className="eyebrow">{eyebrow}</div>
        <div className="plaque-empty">{strings.notInDatabase}</div>
      </div>
    )
  }

  // Original-script rendering: aramaic derives Imperial Aramaic glyphs from
  // square-script letters; osa derives Musnad from consonant tokens; other
  // languages store the glyph string directly.
  let glyphs = form.script || ''
  if (language.id === 'aramaic' && form.hebrewLetters) {
    glyphs = toImperialAramaic(form.hebrewLetters)
  }
  if (language.id === 'osa' && form.tokens) {
    glyphs = toMusnad(form.tokens)
  }

  return (
    <div className="plaque">
      <div className="eyebrow">
        {eyebrow}
        {form.verify && <span className="tag-verify">{strings.verifyTag}</span>}
      </div>
      <div className="plaque-body">
        {glyphs && (
          <bdi
            className={`plaque-glyph ${language.fontClass}`}
            dir={language.dir}
            aria-label={`${language.name} original script`}
          >
            {glyphs}
          </bdi>
        )}
        <div className="plaque-caption">
          {form.translit && <div className="translit">{form.translit}</div>}
          {language.id === 'aramaic' && form.hebrewLetters && (
            <div className="plaque-square" dir="rtl" lang="he">
              {form.hebrewLetters}
            </div>
          )}
          {form.pron && <div>{form.pron}</div>}
          {form.scriptNote && <div>{form.scriptNote}</div>}
          {form.note && <div>{form.note}</div>}
        </div>
      </div>
    </div>
  )
}

// Memoized: with stable languages/handler props from App, typing in the
// search box re-renders only cards entering or leaving the result list.
function ConceptCard({ entry, languages, onRootClick, onDelete, strings }) {
  return (
    <article className="card">
      <div className="card-head">
        <span className="headword" dir="rtl" lang="he">
          {entry.hebrew.word}
        </span>
        <span className="headword-translit">{entry.hebrew.translit}</span>
        <span className="glosses">{entry.english.join(', ')}</span>
        {entry.hebrew.root && (
          <button
            className="rootchip"
            dir="rtl"
            onClick={() => onRootClick(entry.hebrew.root)}
            aria-label={`Root ${entry.hebrew.root}`}
          >
            {rootChipLabel(entry.hebrew.root)}
          </button>
        )}
        {entry.custom && (
          <span className="badge-custom">{strings.addedByYou}</span>
        )}
        {onDelete && (
          <button className="btn-delete" onClick={() => onDelete(entry.id)}>
            {strings.deleteEntry}
          </button>
        )}
        {entry.hebrew.note && (
          <span className="head-note">{entry.hebrew.note}</span>
        )}
      </div>

      {languages.map((language) => (
        <Plaque
          key={language.id}
          language={language}
          form={entry.forms?.[language.id]}
          strings={strings}
        />
      ))}
    </article>
  )
}

export default memo(ConceptCard)
