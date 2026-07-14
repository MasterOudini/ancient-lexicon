import { useEffect, useMemo, useRef, useState } from 'react'
import { normalize } from '../lib/search.js'
import { loadReferenceDictionary } from '../lib/referenceDictionaryLoader.js'
import { REFERENCE_DICTIONARIES, getDictionary } from '../data/referenceDictionaries.js'

// Browser for the full reference dictionaries. A dictionary picker selects a
// published work; each loads on demand (Strong's from the bundle, the rest
// fetched from public/dicts/ and cached by the service worker after first
// open) and is browsed with search, a first-letter index, and incremental
// rendering so a 35,000-entry dictionary never renders all at once.

const PAGE = 80
const HEBREW_ALPHABET = 'אבגדהוזחטיכלמנסעפצקרשת'
const LATIN_ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

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
    return data.entries.map((rec) => ({
      rec,
      head: normalize(rec[f.head] || ''),
      sub: normalize(f.sub ? rec[f.sub] || '' : ''),
      script: normalize(f.script ? rec[f.script] || '' : ''),
      def: (rec[f.def] || '').toLowerCase(),
      idLower: String(rec.id || '').toLowerCase()
    }))
  }, [data, dict])

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
        let score = 0
        if (numId && item.idLower.replace(/^h/, '') === numId) score = 5
        else if (nq && (item.head === nq || item.sub === nq || item.script === nq)) score = 4
        else if (nq && (item.head.startsWith(nq) || item.sub.startsWith(nq) || item.script.startsWith(nq))) score = 3
        else if (nq && (item.head.includes(nq) || item.sub.includes(nq) || item.script.includes(nq))) score = 2
        else if (item.def.includes(ql)) score = 1
        if (score > 0) scored.push({ item, score })
      }
      scored.sort((a, b) => b.score - a.score)
      return scored.map((s) => s.item.rec)
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
