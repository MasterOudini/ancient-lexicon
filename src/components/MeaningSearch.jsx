import { useEffect, useMemo, useRef, useState } from 'react'
import ConceptCard from './ConceptCard.jsx'
import { LANGUAGES } from '../data/languages.js'
import { LEXICON } from '../data/lexicon.js'
import { getDictionary } from '../data/referenceDictionaries.js'
import { MEANING_LANGUAGE_ORDER, searchGlossIndex } from '../lib/glossSearch.js'
import { loadReferenceEntry } from '../lib/referenceDictionaryLoader.js'

const PAGE = 60
const CURATED_BY_ID = new Map(LEXICON.map((entry) => [entry.id, entry]))

function MeaningResultRow({ result, direct, strings }) {
  const dict = getDictionary(result.d)
  const [detail, setDetail] = useState(null)
  const [status, setStatus] = useState('idle')
  const rtl = result.lang === 'Hebrew' || result.lang === 'Aramaic'
  const languageTag = result.lang === 'Hebrew' ? 'he' : result.lang === 'Aramaic' ? 'arc' : undefined

  function loadDetail(event) {
    if (!event.currentTarget.open || status !== 'idle') return
    setStatus('loading')
    loadReferenceEntry(dict, result.i)
      .then((entry) => {
        setDetail(entry)
        setStatus(entry ? 'ready' : 'failed')
      })
      .catch(() => setStatus('failed'))
  }

  const fields = dict.fields
  return (
    <details
      className="lexrow meaning-row"
      data-dictionary={dict.id}
      data-language={result.lang.toLowerCase()}
      data-match-kind={direct ? 'direct' : 'meaning'}
      onToggle={loadDetail}
    >
      <summary>
        <span className="lex-lemma" dir={rtl ? 'rtl' : 'ltr'} lang={languageTag}>
          {result.l}
        </span>
        {result.s && (
          <span className="lex-script script-cuneiform" aria-hidden="true">
            {result.s}
          </span>
        )}
        {result.x && <span className="lex-xlit">{result.x}</span>}
        <span className="lex-id">{dict.label}</span>
        <span className="lex-def">{result.g}</span>
        <span className={direct ? 'direct-tag' : 'meaning-tag'}>
          {direct
            ? strings.directMatchTag
            : strings.meaningMatchTag.replace('{meaning}', result.matchedKeyword || result.g)}
        </span>
      </summary>
      <div className="lex-body">
        {status === 'loading' && <p>{strings.strongsLoading}</p>}
        {status === 'failed' && <p>{strings.strongsLoadFailed}</p>}
        {status === 'ready' && detail && (
          <>
            <p>{detail[fields.def]}</p>
            {(fields.extra || []).map(
              (extra) => detail[extra.key] && (
                <p className="lex-kjv" key={extra.key}>
                  {extra.label}: {detail[extra.key]}
                </p>
              )
            )}
            <p className="lex-source-note">{dict.attribution}</p>
          </>
        )}
      </div>
    </details>
  )
}

export default function MeaningSearch({ strings, onRootClick }) {
  const [index, setIndex] = useState(null)
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    let alive = true
    const base = import.meta.env.BASE_URL || '/'
    fetch(base + 'dicts/gloss-index.json')
      .then((response) => {
        if (!response.ok) throw new Error('fetch failed: ' + response.status)
        return response.json()
      })
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

  const resolution = useMemo(
    () => searchGlossIndex(index, query),
    [index, query]
  )
  const curated = useMemo(
    () => resolution.curatedIds.map((id) => CURATED_BY_ID.get(id)).filter(Boolean),
    [resolution.curatedIds]
  )

  const rows = useMemo(() => {
    if (!query.trim()) return []
    const output = []
    if (resolution.direct.length > 0) {
      output.push({ type: 'head', id: 'direct', title: strings.directMatchesTitle, count: resolution.direct.length })
      for (const result of resolution.direct) output.push({ type: 'result', result, direct: true })
    }
    for (const language of MEANING_LANGUAGE_ORDER) {
      const results = resolution.groups[language]
      output.push({ type: 'head', id: language.toLowerCase(), title: language, count: results.length })
      if (language === 'Egyptian') output.push({ type: 'note', text: strings.egyptianCoverage })
      if (language === 'Akkadian') output.push({ type: 'note', text: strings.akkadianCoverage })
      if (results.length === 0) output.push({ type: 'empty', language })
      for (const result of results) output.push({ type: 'result', result, direct: false })
    }
    for (const language of ['Hittite', 'Old South Arabian']) {
      const id = language === 'Hittite' ? 'hittite' : 'osa'
      output.push({ type: 'head', id, title: language, count: null })
      output.push({ type: 'coverage', language, covered: curated.some((entry) => entry.forms?.[id]) })
    }
    return output
  }, [curated, query, resolution, strings])

  useEffect(() => setVisible(PAGE), [query, resolution.total])

  useEffect(() => {
    const element = sentinelRef.current
    if (!element) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible((value) => Math.min(value + PAGE, rows.length))
        }
      },
      { rootMargin: '800px' }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [rows.length])

  const searched = query.trim().length > 0
  const shownResults = curated.length + rows.slice(0, visible).filter((row) => row.type === 'result').length

  return (
    <section className="meaning-search">
      <div className="note-block meaning-intro">{strings.meaningIntro}</div>
      <input
        className="searchbar"
        type="search"
        dir="auto"
        placeholder={strings.meaningSearchPlaceholder}
        aria-label={strings.meaningSearchPlaceholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {status === 'loading' && <p className="result-count">{strings.meaningIndexLoading}</p>}
      {status === 'failed' && <p className="result-count">{strings.meaningIndexFailed}</p>}

      {status === 'ready' && !searched && (
        <div className="empty-state meaning-prompt">
          <p className="empty-title">{strings.meaningPromptTitle}</p>
          <p className="empty-hint">{strings.meaningPromptHint}</p>
        </div>
      )}

      {status === 'ready' && searched && (
        <>
          <p className="result-count" aria-live="polite">
            {resolution.total === 1
              ? strings.oneMatch
              : strings.matchCount.replace('{n}', String(resolution.total))}
            {resolution.truncated > 0 && ' ' + strings.meaningCapped}
          </p>

          {resolution.total === 0 && (
            <div className="empty-state">
              <p className="empty-title">{strings.noMeaningResults}</p>
              <p className="empty-hint">{strings.noMeaningHint}</p>
              <button className="btn" onClick={() => setQuery('')}>{strings.clearSearch}</button>
            </div>
          )}

          {curated.length > 0 && (
            <section data-section="verified">
              <h2 className="category-head">
                {strings.verifiedMatchesTitle}{' '}
                <span className="category-count">{curated.length}</span>
              </h2>
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

          <div data-section="automatic">
            {rows.slice(0, visible).map((row, index) => {
              if (row.type === 'head') {
                return (
                  <h2
                    className="category-head meaning-language-head"
                    data-language={row.id}
                    key={'head-' + row.id}
                  >
                    {row.title}
                    {row.count != null && <span className="category-count">{row.count}</span>}
                  </h2>
                )
              }
              if (row.type === 'result') {
                return <MeaningResultRow key={`${row.result.d}:${row.result.i}:${row.direct}`} result={row.result} direct={row.direct} strings={strings} />
              }
              if (row.type === 'note') return <p className="meaning-coverage-note" key={'note-' + index}>{row.text}</p>
              if (row.type === 'empty') return <p className="plaque-empty meaning-empty" key={'empty-' + row.language}>{strings.notFoundInGlosses}</p>
              return (
                <p className="plaque-empty meaning-empty" key={'coverage-' + row.language}>
                  {row.covered ? strings.curatedOnlyCoverage : strings.noCuratedCoverage}
                </p>
              )
            })}
          </div>
          <div ref={sentinelRef} aria-hidden="true" />
          {visible < rows.length && (
            <p className="list-footer">
              {strings.showingOf
                .replace('{shown}', String(shownResults))
                .replace('{total}', String(resolution.total))}
            </p>
          )}
        </>
      )}
    </section>
  )
}
