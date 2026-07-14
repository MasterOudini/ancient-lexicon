import { useEffect, useMemo, useRef, useState } from 'react'
import ConceptCard from './ConceptCard.jsx'
import { MeaningResultRow } from './MeaningSearch.jsx'
import { LANGUAGES } from '../data/languages.js'
import { LEXICON } from '../data/lexicon.js'
import { getDictionary } from '../data/referenceDictionaries.js'
import {
  MEANING_LANGUAGE_ORDER,
  searchGlossIndex
} from '../lib/glossSearch.js'
import { buildHebrewCatalog } from '../lib/hebrewCatalog.js'
import { loadGlossIndex } from '../lib/glossIndexLoader.js'
import { loadReferenceEntry } from '../lib/referenceDictionaryLoader.js'
import { normalize } from '../lib/search.js'

const PAGE = 60
const GROUP_PAGE = 8
const CURATED_BY_ID = new Map(LEXICON.map((entry) => [entry.id, entry]))

function ReferenceDetail({ detail, dict }) {
  const fields = dict.fields
  return (
    <>
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
    </>
  )
}

function AutomaticComparison({ resolution, strings, onRootClick }) {
  const [shownByLanguage, setShownByLanguage] = useState({})
  const curated = resolution.curatedIds
    .map((id) => CURATED_BY_ID.get(id))
    .filter(Boolean)
  const groups = MEANING_LANGUAGE_ORDER.map((language) => [
    language,
    resolution.groups[language].filter((result) => getDictionary(result.d))
  ]).filter(([, results]) => results.length > 0)
  const automaticTotal = groups.reduce((sum, [, results]) => sum + results.length, 0)

  if (curated.length === 0 && automaticTotal === 0) {
    return <p className="meaning-coverage-note">{strings.hebrewNoAutomaticMatches}</p>
  }

  return (
    <section className="hebrew-comparison-results">
      <p className="meaning-coverage-note">
        {strings.hebrewComparisonSummary
          .replace('{n}', String(curated.length + automaticTotal))
          .replace('{meaning}', resolution.matchedKeywords.join(', '))}
        {resolution.truncated > 0 && ' ' + strings.meaningCapped}
      </p>

      {curated.length > 0 && (
        <section data-section="verified">
          <h3 className="category-head">
            {strings.verifiedMatchesTitle}{' '}
            <span className="category-count">{curated.length}</span>
          </h3>
          {curated.map((entry) => (
            <ConceptCard
              key={entry.id}
              entry={entry}
              languages={LANGUAGES}
              onRootClick={onRootClick}
              onDelete={null}
              strings={strings}
              verifiedLabel={strings.verifiedBadge}
            />
          ))}
        </section>
      )}

      {groups.map(([language, results]) => {
        const shown = Math.min(shownByLanguage[language] || GROUP_PAGE, results.length)
        return (
          <section data-language={language.toLowerCase()} key={language}>
            <h3 className="category-head meaning-language-head">
              {language} <span className="category-count">{results.length}</span>
            </h3>
            {results.slice(0, shown).map((result) => (
              <MeaningResultRow
                key={`${result.d}:${result.i}`}
                result={result}
                direct={false}
                strings={strings}
              />
            ))}
            {shown < results.length && (
              <button
                className="btn comparison-more"
                onClick={() => setShownByLanguage((current) => ({
                  ...current,
                  [language]: Math.min(shown + 40, results.length)
                }))}
              >
                {strings.showMoreMatches.replace(
                  '{n}',
                  String(Math.min(40, results.length - shown))
                )}
              </button>
            )}
          </section>
        )
      })}
    </section>
  )
}

function HebrewEntryRow({ entry, index, strings, onRootClick }) {
  const dict = getDictionary(entry.d)
  const [detail, setDetail] = useState(null)
  const [detailStatus, setDetailStatus] = useState('idle')
  const [resolution, setResolution] = useState(null)

  if (!dict) return null

  function openEntry(event) {
    if (!event.currentTarget.open) return
    if (entry.linked && !resolution) {
      setResolution(searchGlossIndex(index, '', { recordId: entry.recordId }))
    }
    if (detailStatus !== 'idle') return
    setDetailStatus('loading')
    loadReferenceEntry(dict, entry.i)
      .then((sourceEntry) => {
        setDetail(sourceEntry)
        setDetailStatus(sourceEntry ? 'ready' : 'failed')
      })
      .catch(() => setDetailStatus('failed'))
  }

  return (
    <details
      className="lexrow hebrew-comparative-row"
      data-dictionary={dict.id}
      data-indexed={entry.recordId != null ? 'true' : 'false'}
      data-linked={entry.linked ? 'true' : 'false'}
      onToggle={openEntry}
    >
      <summary>
        <span className="lex-lemma" dir="rtl" lang="he">{entry.l}</span>
        {entry.x && <span className="lex-xlit">{entry.x}</span>}
        <span className="lex-id">{entry.i}</span>
        <span className="lex-id">{dict.label}</span>
        <span className="lex-def">{entry.g}</span>
        <span className="meaning-tag">
          {entry.linked
            ? strings.hebrewLinkedTag
            : strings.hebrewSourceOnlyTag}
        </span>
      </summary>
      <div className="lex-body">
        {detailStatus === 'loading' && <p>{strings.strongsLoading}</p>}
        {detailStatus === 'failed' && <p>{strings.strongsLoadFailed}</p>}
        {detailStatus === 'ready' && detail && <ReferenceDetail detail={detail} dict={dict} />}
        {!entry.linked ? (
          <p className="meaning-coverage-note">{strings.hebrewNoEnglishBridge}</p>
        ) : resolution && (
          <AutomaticComparison
            resolution={resolution}
            strings={strings}
            onRootClick={onRootClick}
          />
        )}
      </div>
    </details>
  )
}

export default function HebrewComparative({ query, strings, onRootClick, onClearQuery }) {
  const [index, setIndex] = useState(null)
  const [status, setStatus] = useState('loading')
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    let alive = true
    loadGlossIndex()
      .then((data) => {
        if (!alive) return
        setIndex(data)
        setStatus('ready')
      })
      .catch(() => alive && setStatus('failed'))
    return () => {
      alive = false
    }
  }, [])

  const entries = useMemo(() => index ? buildHebrewCatalog(index) : [], [index])
  const normalizedQuery = normalize(query)
  const results = useMemo(
    () => normalizedQuery
      ? entries.filter((entry) => entry.searchText.includes(normalizedQuery))
      : entries,
    [entries, normalizedQuery]
  )

  useEffect(() => setVisible(PAGE), [normalizedQuery])

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

  if (status === 'loading') return <p className="result-count">{strings.meaningIndexLoading}</p>
  if (status === 'failed') return <p className="result-count">{strings.meaningIndexFailed}</p>

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
      <div className="note-block">{strings.hebrewComparativeIntro}</div>
      <p className="result-count" aria-live="polite">
        {(normalizedQuery ? strings.matchCount : strings.entryCount)
          .replace('{n}', String(results.length))}
      </p>
      {results.slice(0, visible).map((entry) => (
        <HebrewEntryRow
          key={`${entry.d}:${entry.i}`}
          entry={entry}
          index={index}
          strings={strings}
          onRootClick={onRootClick}
        />
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
