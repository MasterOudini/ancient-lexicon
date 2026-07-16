import { useEffect, useMemo, useRef, useState } from 'react'
import { normalize } from '../lib/search.js'
import { loadReferenceDictionary } from '../lib/referenceDictionaryLoader.js'
import { REFERENCE_DICTIONARIES, getDictionary } from '../data/referenceDictionaries.js'
import { reviewedSourceMapping } from '../data/reviewedHebrewSourceMappings.js'
import {
  hasConsonantSearchMatch,
  hebrewConsonantSearchKeys,
  isLatinConsonantSearchQuery,
  latinConsonantSearchKeys
} from '../lib/hebrewSearchSpelling.js'

// Browser for the full reference dictionaries. A dictionary picker selects a
// published work; each loads on demand (Strong's from the bundle, the rest
// fetched from public/dicts/ and cached by the service worker after first
// open) and is browsed with search, a first-letter index, and incremental
// rendering so a 35,000-entry dictionary never renders all at once.

const PAGE = 80
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת'
const LATIN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const SOURCE_FORM_LABELS = {
  alternate: 'Alternate headwords',
  plural: 'Plural forms',
  stem: 'Stem forms'
}

export function scoreReferenceIndexItem(item, normalizedQuery, lowerQuery, numericId = null) {
  const nq = normalizedQuery
  const ql = lowerQuery
  if (item.idLower === ql || (numericId && item.idLower.replace(/^h/, '') === numericId)) return 5
  if (nq && (
    item.head === nq || item.sub === nq || item.script === nq ||
    item.aliases.includes(nq) || item.forms.includes(nq)
  )) return 4
  if (nq && (
    item.head.startsWith(nq) || item.sub.startsWith(nq) || item.script.startsWith(nq) ||
    item.aliases.some((alias) => alias.startsWith(nq)) ||
    item.forms.some((form) => form.startsWith(nq))
  )) return 3
  if (nq && (
    item.head.includes(nq) || item.sub.includes(nq) || item.script.includes(nq) ||
    item.aliases.some((alias) => alias.includes(nq)) ||
    item.forms.some((form) => form.includes(nq))
  )) return 2
  if (nq && item.unresolvedLinks.includes(nq)) return 2
  if (nq && item.unresolvedLinks.some((link) => link.includes(nq))) return 1
  return item.def.includes(ql) ? 1 : 0
}

export default function ReferenceDictionaries({ strings }) {
  const [dictId, setDictId] = useState(REFERENCE_DICTIONARIES[0].id)
  const [data, setData] = useState(null)
  const [status, setStatus] = useState('loading')
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)

  const dict = getDictionary(dictId)

  useEffect(() => {
    let alive = true
    setStatus('loading')
    setData(null)
    setQuery('')
    setLetter(null)
    loadReferenceDictionary(dict)
      .then((d) => {
        if (!alive) return
        setData(d)
        setStatus('ready')
      })
      .catch(() => alive && setStatus('failed'))
    return () => {
      alive = false
    }
  }, [dictId])

  // Precompute normalized search keys once per loaded dictionary.
  const index = useMemo(() => {
    if (!data) return []
    const f = dict.fields
    return data.entries.map((rec) => {
      const reviewedAliases = reviewedSourceMapping(dict.id, rec.id)?.aliases || []
      const sourceAliases = dict.id === 'strongs' && rec.pron ? [rec.pron] : []
      return {
        rec,
        head: normalize(rec[f.head] || ''),
        sub: normalize(f.sub ? rec[f.sub] || '' : ''),
        script: normalize(f.script ? rec[f.script] || '' : ''),
        aliases: [...(rec.aliases || []), ...reviewedAliases, ...sourceAliases]
          .map(normalize)
          .filter(Boolean),
        forms: (rec.forms || []).map((form) => normalize(form.word)).filter(Boolean),
        unresolvedLinks: (rec.unresolvedHeadwordLinks || [])
          .flatMap((link) => [link.displayLabel, link.targetLabel])
          .map(normalize)
          .filter(Boolean),
        def: (rec[f.def] || '').toLowerCase(),
        idLower: String(rec.id || '').toLowerCase()
      }
    })
  }, [data, dict])

  const entriesById = useMemo(
    () => new Map((data?.entries || []).map((entry) => [String(entry.id), entry])),
    [data]
  )

  const results = useMemo(() => {
    if (!data) return []
    const q = query.trim()
    const f = dict.fields
    if (q) {
      const nq = normalize(q)
      const ql = q.toLowerCase()
      const numId = /^h?\d+$/i.test(ql) ? ql.replace(/^h/, '') : null
      const scored = []
      for (const item of index) {
        const score = scoreReferenceIndexItem(item, nq, ql, numId)
        if (score > 0) scored.push({ item, score })
      }
      scored.sort((a, b) => b.score - a.score)
      if (scored.length > 0 || dict.index !== 'hebrew' || !isLatinConsonantSearchQuery(q)) {
        return scored.map((s) => s.item.rec)
      }

      const generatedKeys = latinConsonantSearchKeys(q)
      return index
        .filter((item) => hasConsonantSearchMatch(
          [item.rec[f.head], ...(item.rec.forms || []).map((form) => form.word)]
            .flatMap(hebrewConsonantSearchKeys),
          generatedKeys
        ))
        .map((item) => item.rec)
    }
    if (letter) {
      return index.filter((item) => item.head.startsWith(letter)).map((item) => item.rec)
    }
    return data.entries
  }, [data, index, query, letter, dict])

  useEffect(() => {
    setVisible(PAGE)
  }, [query, letter, dictId])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, results.length))
        }
      },
      { rootMargin: '800px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [results.length])

  const alphabet = dict.index === 'hebrew'
    ? HEBREW_ALPHABET
    : dict.index === 'latin'
      ? LATIN_ALPHABET
      : ''
  const f = dict.fields

  function renderPicker() {
    return (
      <div className="chiprow dictpicker" role="tablist" aria-label="Dictionary">
        {REFERENCE_DICTIONARIES.map((d) => (
          <button
            key={d.id}
            role="tab"
            aria-selected={d.id === dictId}
            className={'chip' + (d.id === dictId ? ' on' : '')}
            onClick={() => setDictId(d.id)}
          >
            <span className="chip-lang">{d.language}</span> {d.label}
          </button>
        ))}
      </div>
    )
  }

  const countLine = query.trim()
    ? results.length === 1
      ? strings.oneMatch
      : strings.matchCount.replace('{n}', String(results.length))
    : strings.entryCount.replace('{n}', String(results.length))

  return (
    <>
      {renderPicker()}

      {status === 'loading' && <p className="result-count">{strings.strongsLoading}</p>}
      {status === 'failed' && <p className="result-count">{strings.strongsLoadFailed}</p>}

      {status === 'ready' && data && (
        <>
          <section className="dictionary-provenance" aria-label="Source, license, and coverage">
            <h2>{data.work}</h2>
            <p>{dict.attribution}</p>
            {data.conversion && (
              <p>
                <span className="dictionary-provenance-label">Transformation:</span>{' '}
                {data.conversion}
              </p>
            )}
            {data.fetchedAt && (
              <p>
                <span className="dictionary-provenance-label">Dataset fetched:</span>{' '}
                <time dateTime={data.fetchedAt}>{data.fetchedAt}</time>
                {data.latestRetainedRevisionTimestamp && (
                  <>
                    {' · '}Latest retained source revision:{' '}
                    <time dateTime={data.latestRetainedRevisionTimestamp}>
                      {data.latestRetainedRevisionTimestamp}
                    </time>
                  </>
                )}
              </p>
            )}
            {(data.license || (data.source && /^https?:\/\//.test(data.source))) && (
              <p className="dictionary-provenance-links">
                {data.license && (
                  <>
                    License:{' '}
                    {data.licenseUrl ? (
                      <a href={data.licenseUrl} target="_blank" rel="noreferrer">
                        {data.license}
                      </a>
                    ) : data.license}
                  </>
                )}
                {data.source && /^https?:\/\//.test(data.source) && (
                  <>
                    {data.license && <span aria-hidden="true"> · </span>}
                    <a href={data.source} target="_blank" rel="noreferrer">
                      Open source
                    </a>
                  </>
                )}
              </p>
            )}
          </section>
          <input
            className="searchbar"
            type="search"
            dir="auto"
            placeholder={strings.refSearchPlaceholder.replace('{name}', dict.label)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={strings.refSearchPlaceholder.replace('{name}', dict.label)}
          />
          {!query.trim() && alphabet && (
            <div
              className="chiprow alefbet"
              role="group"
              aria-label="First letter"
              dir={dict.dir}
            >
              <button
                className={'chip' + (letter === null ? ' on' : '')}
                onClick={() => setLetter(null)}
                dir="ltr"
              >
                {strings.allChip}
              </button>
              {Array.from(alphabet).map((l) => (
                <button
                  key={l}
                  lang={dict.index === 'hebrew' ? 'he' : undefined}
                  className={'chip chip-letter' + (letter === l ? ' on' : '')}
                  onClick={() => setLetter(letter === l ? null : l)}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          <p className="result-count" aria-live="polite">
            {countLine}
          </p>

          {results.length === 0 && (
            <div className="empty-state">
              <p className="empty-title">{strings.noResults}</p>
              <button className="btn" onClick={() => { setQuery(''); setLetter(null) }}>
                {strings.clearSearch}
              </button>
            </div>
          )}

          {results.slice(0, visible).map((rec) => {
            const ref = f.ref ? rec[f.ref] : null
            return (
              <details className="lexrow" key={rec.id}>
                <summary>
                  <span
                    className={'lex-lemma ' + (f.headClass || '')}
                    dir={f.headDir || dict.dir}
                    lang={rec.lang || dict.lang || (dict.index === 'hebrew' ? 'he' : undefined)}
                  >
                    {rec[f.head]}
                  </span>
                  {f.script && rec[f.script] && (
                    <span
                      className={'lex-script ' + (f.scriptClass || '')}
                      dir={f.scriptDir}
                      lang={rec.lang || dict.lang}
                      aria-hidden="true"
                    >
                      {rec[f.script]}
                    </span>
                  )}
                  {f.sub && rec[f.sub] && <span className="lex-xlit">{rec[f.sub]}</span>}
                  {ref != null && ref !== '' && (
                    <span className="lex-id">{(f.refPrefix || '') + ref}</span>
                  )}
                  <span className="lex-def">{rec[f.def]}</span>
                </summary>
                <div className="lex-body">
                  <p>{rec[f.def]}</p>
                  {Object.entries(SOURCE_FORM_LABELS).map(([type, label]) => {
                    const forms = (rec.forms || []).filter((form) => form.type === type)
                    if (forms.length === 0) return null
                    return (
                      <p className="lex-kjv" key={type}>
                        {label}:{' '}
                        <span dir="rtl" lang={rec.lang || 'und-Hebr'}>
                          {forms.map((form) => [form.word, form.label].filter(Boolean).join(' · ')).join(', ')}
                        </span>
                      </p>
                    )
                  })}
                  {rec.lexicalRefs?.length > 0 && (
                    <div className="lex-kjv">
                      <span>Linked dictionary entries:</span>
                      <div className="chiprow lexical-ref-list" role="list">
                        {rec.lexicalRefs.map((targetId) => {
                          const target = entriesById.get(String(targetId))
                          return (
                            <button
                              type="button"
                              className="chip"
                              role="listitem"
                              key={targetId}
                              onClick={() => { setQuery(String(targetId)); setLetter(null) }}
                            >
                              <span dir="rtl" lang={target?.lang || 'und-Hebr'}>
                                {target?.[f.head] || targetId}
                              </span>{' '}
                              <span dir="ltr">{targetId}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {rec.unresolvedHeadwordLinks?.length > 0 && (
                    <div className="lex-kjv" data-link-status="source-unresolved-headword-link">
                      <span>Source headword links (no stable entry ID):</span>
                      <div className="chiprow lexical-ref-list" role="list">
                        {rec.unresolvedHeadwordLinks.map((link, index) => {
                          const display = link.displayLabel || link.targetLabel
                          const displayIsHebrew = /[\u0590-\u05ff]/u.test(display)
                          const targetIsHebrew = /[\u0590-\u05ff]/u.test(link.targetLabel || '')
                          const searchLabel = displayIsHebrew ? display : (link.targetLabel || display)
                          return (
                            <button
                              type="button"
                              className="chip"
                              role="listitem"
                              key={`${link.targetLabel}:${link.displayLabel}:${index}`}
                              onClick={() => { setQuery(searchLabel); setLetter(null) }}
                              aria-label={`Search source headword link ${searchLabel}`}
                            >
                              <span
                                dir={displayIsHebrew ? 'rtl' : 'ltr'}
                                lang={displayIsHebrew ? 'und-Hebr' : undefined}
                              >
                                {display}
                              </span>
                              {link.targetLabel && link.targetLabel !== display && (
                                <span
                                  className="lex-id"
                                  dir={targetIsHebrew ? 'rtl' : 'ltr'}
                                  lang={targetIsHebrew ? 'und-Hebr' : undefined}
                                >
                                  {' '}target: {link.targetLabel}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  {(f.extra || []).map(
                    (ex) => rec[ex.key] && (
                      <p className="lex-kjv" key={ex.key}>
                        {ex.label}:{' '}
                        {ex.href ? (
                          <a href={rec[ex.key]} target="_blank" rel="noreferrer">
                            {ex.linkLabel || rec[ex.key]}
                          </a>
                        ) : rec[ex.key]}
                      </p>
                    )
                  )}
                </div>
              </details>
            )
          })}
          <div ref={sentinelRef} aria-hidden="true" />
          {visible < results.length && (
            <p className="list-footer">
              {strings.showingOf
                .replace('{shown}', String(Math.min(visible, results.length)))
                .replace('{total}', String(results.length))}
            </p>
          )}
        </>
      )}
    </>
  )
}
