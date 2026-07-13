import { useEffect, useMemo, useRef, useState } from 'react'
import { normalize } from '../lib/search.js'

// Full Hebrew lexicon browser: the complete Strong's Concise Dictionary of
// the Words in the Hebrew Bible (1894, public domain), presented as a
// published reference work — distinct from the hand-curated comparative
// database. Data lazy-loads from src/data/strongs.json on first open; the
// row list renders incrementally.

const PAGE = 80
const ALEF_BET = 'אבגדהוזחטיכלמנסעפצקרשת'

export default function HebrewLexiconView({ strings }) {
  const [data, setData] = useState(null)
  const [failed, setFailed] = useState(false)
  const [query, setQuery] = useState('')
  const [letter, setLetter] = useState(null)
  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)

  useEffect(() => {
    let mounted = true
    import('../data/strongs.json')
      .then((m) => mounted && setData(m.default))
      .catch(() => mounted && setFailed(true))
    return () => {
      mounted = false
    }
  }, [])

  // One normalized search key per entry, computed once per load.
  const index = useMemo(() => {
    if (!data) return []
    return data.entries.map((rec) => ({
      rec,
      lemma: normalize(rec.lemma),
      xlit: normalize(rec.xlit || ''),
      text: ((rec.def || '') + ' ' + (rec.kjv || '')).toLowerCase(),
      idLower: rec.id.toLowerCase()
    }))
  }, [data])

  const results = useMemo(() => {
    if (!data) return []
    const q = query.trim()
    if (q) {
      const nq = normalize(q)
      const ql = q.toLowerCase()
      const asId = /^h?\d+$/.test(ql) ? 'h' + ql.replace(/^h/, '') : null
      const scored = []
      for (const item of index) {
        let score = 0
        if (asId && item.idLower === asId) score = 5
        else if (item.lemma === nq || item.xlit === nq) score = 4
        else if (item.lemma.startsWith(nq) || item.xlit.startsWith(nq)) score = 3
        else if (item.lemma.includes(nq) || item.xlit.includes(nq)) score = 2
        else if (item.text.includes(ql)) score = 1
        if (score > 0) scored.push({ item, score })
      }
      scored.sort(
        (a, b) =>
          b.score - a.score ||
          Number(a.item.rec.id.slice(1)) - Number(b.item.rec.id.slice(1))
      )
      return scored.map((s) => s.item.rec)
    }
    if (letter) {
      return index
        .filter((item) => item.lemma.startsWith(letter))
        .map((item) => item.rec)
    }
    return data.entries
  }, [data, index, query, letter])

  useEffect(() => {
    setVisible(PAGE)
  }, [query, letter])

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

  if (failed) {
    return <p className="result-count">{strings.strongsLoadFailed}</p>
  }
  if (!data) {
    return <p className="result-count">{strings.strongsLoading}</p>
  }

  const countLine = query.trim()
    ? results.length === 1
      ? strings.oneMatch
      : strings.matchCount.replace('{n}', String(results.length))
    : strings.entryCount.replace('{n}', String(results.length))

  return (
    <>
      <input
        className="searchbar"
        type="search"
        dir="auto"
        placeholder={strings.strongsSearchPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={strings.strongsSearchPlaceholder}
      />
      {!query.trim() && (
        <div className="chiprow alefbet" role="group" aria-label="First letter" dir="rtl">
          <button
            className={'chip' + (letter === null ? ' on' : '')}
            onClick={() => setLetter(null)}
            dir="ltr"
          >
            {strings.allChip}
          </button>
          {Array.from(ALEF_BET).map((l) => (
            <button
              key={l}
              lang="he"
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
          <p className="empty-hint">{strings.strongsSearchHint}</p>
          <button className="btn" onClick={() => setQuery('')}>
            {strings.clearSearch}
          </button>
        </div>
      )}
      {results.slice(0, visible).map((rec) => (
        <details className="lexrow" key={rec.id}>
          <summary>
            <span className="lex-lemma" dir="rtl" lang="he">
              {rec.lemma}
            </span>
            <span className="lex-xlit">{rec.xlit}</span>
            <span className="lex-id">{rec.id}</span>
            <span className="lex-def">{rec.def}</span>
          </summary>
          <div className="lex-body">
            {rec.deriv && <p>{rec.deriv}</p>}
            <p>{rec.def}</p>
            {rec.kjv && (
              <p className="lex-kjv">
                {strings.strongsKjvLabel} {rec.kjv}
              </p>
            )}
            {rec.pron && (
              <p className="lex-pron">
                {strings.strongsPronLabel} {rec.pron}
              </p>
            )}
          </div>
        </details>
      ))}
      <div ref={sentinelRef} aria-hidden="true" />
      {visible < results.length && (
        <p className="list-footer">
          {strings.showingOf
            .replace('{shown}', String(Math.min(visible, results.length)))
            .replace('{total}', String(results.length))}
        </p>
      )}
      <p className="lex-attribution">
        {data.work} {strings.strongsPresentedNote}
      </p>
    </>
  )
}
