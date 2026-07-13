import { useEffect, useMemo, useRef, useState } from 'react'
import ConceptCard from './ConceptCard.jsx'
import { CATEGORIES } from '../data/lexicon.js'

// The dictionary card list. Browsing (empty query) groups entries by
// category in museum order with a jump-chip row; searching shows a flat
// relevance-ranked list. Cards render incrementally — a sentinel below the
// list loads more as it approaches the viewport — so hundreds of plaques
// never mount at once.

const PAGE = 30

export default function DictionaryList({
  results,
  query,
  languages,
  onRootClick,
  onDelete,
  strings,
  onClearQuery
}) {
  const searching = query.trim().length > 0

  // One flat stream of rows (group headers + entries) so incremental
  // rendering and grouping compose.
  const rows = useMemo(() => {
    if (searching) {
      return results.map((entry) => ({ type: 'entry', entry }))
    }
    const byId = new Map(results.map((e) => [e.id, e]))
    const out = []
    for (const cat of CATEGORIES) {
      const entries = cat.entries.filter((e) => byId.has(e.id))
      if (entries.length === 0) continue
      out.push({ type: 'head', id: cat.id, title: cat.title, count: entries.length })
      for (const e of entries) out.push({ type: 'entry', entry: byId.get(e.id) })
    }
    const custom = results.filter((e) => e.custom)
    if (custom.length > 0) {
      out.push({ type: 'head', id: 'custom', title: strings.addedByYouGroup, count: custom.length })
      for (const e of custom) out.push({ type: 'entry', entry: e })
    }
    return out
  }, [results, searching, strings.addedByYouGroup])

  const groups = useMemo(
    () => rows.filter((r) => r.type === 'head'),
    [rows]
  )

  const [visible, setVisible] = useState(PAGE)
  const sentinelRef = useRef(null)
  const pendingScroll = useRef(null)

  useEffect(() => {
    setVisible(PAGE)
  }, [query])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + PAGE, rows.length))
        }
      },
      { rootMargin: '600px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rows.length])

  // Jump chips reveal enough rows to include the target group, then scroll.
  function jumpTo(groupId) {
    const idx = rows.findIndex((r) => r.type === 'head' && r.id === groupId)
    if (idx === -1) return
    pendingScroll.current = groupId
    setVisible((v) => Math.max(v, idx + Math.min(PAGE, 8)))
  }

  useEffect(() => {
    if (!pendingScroll.current) return
    const el = document.getElementById('cat-' + pendingScroll.current)
    pendingScroll.current = null
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })

  const countLine = searching
    ? results.length === 1
      ? strings.oneMatch
      : strings.matchCount.replace('{n}', String(results.length))
    : strings.entryCount.replace('{n}', String(results.length))

  if (results.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-title">{strings.noResults}</p>
        <p className="empty-hint">{strings.searchHint}</p>
        <button className="btn" onClick={onClearQuery}>
          {strings.clearSearch}
        </button>
      </div>
    )
  }

  const shown = rows.slice(0, visible)
  const shownEntries = shown.filter((r) => r.type === 'entry').length

  return (
    <>
      <p className="result-count" aria-live="polite">
        {countLine}
      </p>
      {!searching && groups.length > 1 && (
        <div className="chiprow jumprow" role="navigation" aria-label="Categories">
          {groups.map((g) => (
            <button key={g.id} className="chip" onClick={() => jumpTo(g.id)}>
              {g.title}
            </button>
          ))}
        </div>
      )}
      {shown.map((row) =>
        row.type === 'head' ? (
          <h2 className="category-head" id={'cat-' + row.id} key={'head-' + row.id}>
            {row.title} <span className="category-count">{row.count}</span>
          </h2>
        ) : (
          <ConceptCard
            key={row.entry.id}
            entry={row.entry}
            languages={languages}
            onRootClick={onRootClick}
            onDelete={row.entry.custom ? onDelete : null}
            strings={strings}
          />
        )
      )}
      <div ref={sentinelRef} aria-hidden="true" />
      {visible < rows.length && (
        <p className="list-footer">
          {strings.showingOf
            .replace('{shown}', String(shownEntries))
            .replace('{total}', String(results.length))}
        </p>
      )}
    </>
  )
}
