import { useEffect, useMemo, useRef, useState } from 'react'
import { LANGUAGES } from '../data/languages.js'
import { getDictionary } from '../data/referenceDictionaries.js'
import {
  loadHebrewCatalog,
  loadHebrewComparison,
  searchHebrewCatalog
} from '../lib/hebrewComparisonLoader.js'
import { loadReferenceEntry } from '../lib/referenceDictionaryLoader.js'

const PAGE = 60
const EMPTY_SLOT = 'No reliable match found in the current dictionaries.'
const VERIFIED_LABEL = 'Verified/curated comparison'
const AUTOMATIC_LABEL = 'Automatically matched semantic equivalent'

function ReferenceDetail({ candidate, dict }) {
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('idle')
  const fields = dict.fields

  function openDetail(event) {
    if (!event.currentTarget.open || status !== 'idle') return
    setStatus('loading')
    loadReferenceEntry(dict, candidate.entryId)
      .then((entry) => {
        setDetail(entry)
        setStatus(entry ? 'ready' : 'failed')
      })
      .catch(() => setStatus('failed'))
  }

  return (
    <details className="comparison-source-detail" onToggle={openDetail}>
      <summary>Open dictionary source details</summary>
      {status === 'loading' && <p>Loading source entry…</p>}
      {status === 'failed' && <p>The source entry could not be loaded.</p>}
      {status === 'ready' && detail && (
        <div className="comparison-source-body">
          <p>{detail[fields.def]}</p>
          {(fields.extra || []).map(
            (extra) => detail[extra.key] && (
              <p className="lex-kjv" key={extra.key}>
                {extra.label}:{' '}
                {extra.href ? (
                  <a href={detail[extra.key]} target="_blank" rel="noreferrer">
                    {extra.linkLabel || detail[extra.key]}
                  </a>
                ) : detail[extra.key]}
              </p>
            )
          )}
          <p className="lex-source-note">{dict.attribution}</p>
        </div>
      )}
    </details>
  )
}

function ComparisonCandidate({ candidate, language, compact = false }) {
  const dict = getDictionary(candidate.dictionaryId)
  const sourceLabel = candidate.dictionaryId === 'curated'
    ? 'Curated comparative card'
    : dict?.label || candidate.dictionaryId
  const displayWord = candidate.transliteration ||
    (candidate.word !== candidate.script ? candidate.word : null)

  return (
    <div
      className={compact ? 'comparison-candidate comparison-candidate-alt' : 'comparison-candidate'}
      data-dictionary={candidate.dictionaryId}
      data-entry-id={candidate.entryId}
    >
      <div className={`comparison-candidate-main${language.id === 'egyptian' ? ' plaque-body-egyptian' : ''}`}>
        {candidate.script && (
          <bdi
            className={`plaque-glyph ${language.fontClass}`}
            dir={language.dir}
            aria-label={`${language.name} original script`}
          >
            {candidate.script}
          </bdi>
        )}
        <div className="plaque-caption">
          {displayWord && (
            <div className="comparison-word" dir="auto">
              {candidate.transliteration && (
                <span className="comparison-field-label">Transliteration:</span>
              )}{' '}
              {displayWord}
            </div>
          )}
          <div><span className="comparison-field-label">Meaning:</span> {candidate.meaning}</div>
          <div>
            <span className="comparison-field-label">Dictionary source:</span>{' '}
            {sourceLabel} · {candidate.entryId}
          </div>
          <div><span className="comparison-field-label">English bridge:</span> {candidate.bridge}</div>
          {candidate.evidence && (
            <div><span className="comparison-field-label">Evidence:</span> {candidate.evidence}</div>
          )}
        </div>
      </div>
      {dict && <ReferenceDetail candidate={candidate} dict={dict} />}
    </div>
  )
}

function ComparisonPlaque({ language, slot }) {
  const [showAlternatives, setShowAlternatives] = useState(false)
  const statusLabel = slot.status === 'verified' ? VERIFIED_LABEL : AUTOMATIC_LABEL

  return (
    <section
      className="plaque comparison-plaque"
      data-language={language.id}
      data-comparison-status={slot.status}
    >
      <div className="eyebrow">
        {language.name} · {language.scriptName}
        {slot.status !== 'none' && (
          <span className={`comparison-status comparison-status-${slot.status}`}>{statusLabel}</span>
        )}
      </div>
      {slot.status === 'none' || !slot.primary ? (
        <div className="plaque-empty">{EMPTY_SLOT}</div>
      ) : (
        <>
          <ComparisonCandidate candidate={slot.primary} language={language} />
          {slot.alternatives.length > 0 && (
            <>
              <button
                className="btn comparison-candidates-toggle"
                type="button"
                aria-expanded={showAlternatives}
                onClick={() => setShowAlternatives((shown) => !shown)}
              >
                {showAlternatives ? 'Hide additional candidates' : 'Show more candidates'}
              </button>
              {showAlternatives && (
                <div className="comparison-alternatives">
                  {slot.alternatives.slice(0, 4).map((candidate) => (
                    <ComparisonCandidate
                      candidate={candidate}
                      compact
                      key={`${candidate.dictionaryId}:${candidate.entryId}:${candidate.bridge}`}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

function UniversalComparisonCard({ entry, senses }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectedSense = senses[selectedIndex] || senses[0]

  return (
    <div className="universal-comparison-card" data-source-key={entry.sourceKey}>
      <div className="sense-picker">
        <label htmlFor={`sense-${entry.sourceKey}`}>Individual sense</label>
        <select
          id={`sense-${entry.sourceKey}`}
          value={selectedIndex}
          onChange={(event) => setSelectedIndex(Number(event.target.value))}
        >
          {senses.map((sense, index) => (
            <option value={index} key={sense.key}>{sense.label}</option>
          ))}
        </select>
        {selectedSense?.sourceText && (
          <p className="sense-source-text">{selectedSense.sourceText}</p>
        )}
      </div>

      <div className="universal-plaques" data-sense-key={selectedSense?.key}>
        {LANGUAGES.map((language) => {
          const slot = selectedSense?.slots.find((candidateSlot) => candidateSlot.languageId === language.id)
          return (
            <ComparisonPlaque
              key={`${selectedSense?.key}:${language.id}`}
              language={language}
              slot={slot || { languageId: language.id, status: 'none', primary: null, alternatives: [] }}
            />
          )
        })}
      </div>
    </div>
  )
}

function HebrewEntryRow({ entry }) {
  const [senses, setSenses] = useState(null)
  const [status, setStatus] = useState('idle')

  function openEntry(event) {
    if (!event.currentTarget.open || status === 'loading' || status === 'ready') return
    setStatus('loading')
    loadHebrewComparison(entry)
      .then((resolvedSenses) => {
        setSenses(resolvedSenses)
        setStatus('ready')
      })
      .catch(() => setStatus('failed'))
  }

  return (
    <details
      className="lexrow hebrew-comparative-row"
      data-dictionary={entry.source}
      data-source-key={entry.sourceKey}
      data-shard={entry.shard}
      onToggle={openEntry}
    >
      <summary>
        <span className="lex-lemma" dir="rtl" lang="he">{entry.headword}</span>
        {entry.transliteration && <span className="lex-xlit">{entry.transliteration}</span>}
        <span className="lex-id">{entry.id}</span>
        <span className="lex-id">{entry.sourceLabel}</span>
        {entry.partOfSpeech && <span className="lex-id">{entry.partOfSpeech}</span>}
        <span className="lex-def">{entry.definition}</span>
        <span className="hebrew-row-action">
          <span className="hebrew-row-action-open">Open comparison</span>
          <span className="hebrew-row-action-close">Close comparison</span>
          <span className="hebrew-row-action-icon" aria-hidden="true">⌄</span>
        </span>
      </summary>
      <div className="lex-body universal-card-shell">
        {status === 'loading' && <p>Loading sense-specific comparisons…</p>}
        {status === 'failed' && (
          <p>Comparison data could not be loaded. Go online, then close and reopen this entry to retry.</p>
        )}
        {status === 'ready' && senses && <UniversalComparisonCard entry={entry} senses={senses} />}
      </div>
    </details>
  )
}

export default function HebrewComparative({ query, strings, onClearQuery }) {
  const [catalog, setCatalog] = useState(null)
  const [status, setStatus] = useState('loading')
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    let alive = true
    loadHebrewCatalog()
      .then((data) => {
        if (!alive) return
        setCatalog(data)
        setStatus('ready')
      })
      .catch(() => alive && setStatus('failed'))
    return () => {
      alive = false
    }
  }, [])

  const results = useMemo(() => searchHebrewCatalog(catalog, query), [catalog, query])

  useEffect(() => setVisible(PAGE), [query])

  useEffect(() => {
    const element = sentinelRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      (observed) => {
        if (observed.some((entry) => entry.isIntersecting)) {
          setVisible((current) => Math.min(current + PAGE, results.length))
        }
      },
      { rootMargin: '800px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [results.length])

  if (status === 'loading') return <p className="result-count">Loading the Hebrew comparison catalog…</p>
  if (status === 'failed') {
    return <p className="result-count">The Hebrew comparison catalog could not be loaded.</p>
  }

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">{strings.noResults}</p>
        <p className="empty-hint">{strings.hebrewSearchHint}</p>
        <button className="btn" onClick={onClearQuery}>{strings.clearSearch}</button>
      </div>
    )
  }

  return (
    <section className="hebrew-comparative">
      <div className="note-block">
        Every Hebrew source entry has a six-language, sense-specific comparison card. Tap Open comparison on any entry. English explains the bridge; it is not a comparison language.
      </div>
      <p className="result-count" aria-live="polite">
        {(query.trim() ? strings.matchCount : strings.entryCount)
          .replace('{n}', String(results.length))}
      </p>
      {results.slice(0, visible).map((entry) => (
        <HebrewEntryRow key={entry.sourceKey} entry={entry} />
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
      {visible < results.length && (
        <p className="list-footer">
          {strings.showingOf
            .replace('{shown}', String(Math.min(visible, results.length)))
            .replace('{total}', String(results.length))}
        </p>
      )}
    </section>
  )
}
