import { useEffect, useState } from 'react'
import {
  DOUBLETS,
  CLUSTERS,
  rootKey,
  uniquePermutations
} from '../data/roots.js'
import { getLanguage } from '../data/languages.js'
import { searchRoots } from '../lib/search.js'
import {
  CURATED_ROOT_CATALOG,
  findAttestedRoot,
  findAttestedRootById,
  loadAttestedRootCatalog
} from '../lib/attestedRootCatalog.js'

const MAQAF = '־'

// Fixed epistemic strings. Attested facts are stated as facts with
// citations; interpretations are labeled interpretations.
const ATTESTED_ONLY_LINE =
  'Attested forms only; no reconstructed proto-forms are shown or implied.'
const PERM_DISCLAIMER =
  'Reorderings of the same letters that also exist as roots in this database. Sharing letters is not evidence of a connection; attested connections are cited separately below.'
const METATHESIS_LABEL =
  'Same word, reordered consonants — a fact of the attested text.'
const VARIANT_LABEL = 'Consonant-variant pair, not a permutation.'
const GHOST_LABEL = 'not an attested root here'
const CATALOG_LOADING =
  'Loading the complete published-root catalog before checking reorderings…'
const CATALOG_UNAVAILABLE =
  'The complete published-root catalog is unavailable. Permutation results are hidden so an uncached root is never mislabeled as unattested.'

function lettersLabel(letters) {
  const arr = Array.isArray(letters) ? letters : Array.from(letters)
  return arr.join(MAQAF)
}

const LONG_ROOT_NOTE =
  'For roots of more than three letters only the reorderings attested as roots are shown ({found} of {all} possible orderings).'

function sourceLabel(source) {
  return source === 'strongs' ? 'Strong’s' : source === 'bdb' ? 'BDB' : source
}

function languageLabel(language) {
  return language === 'biblical-aramaic' ? 'Biblical Aramaic' : 'Hebrew'
}

function languageTag(language) {
  return language === 'biblical-aramaic' ? 'arc' : 'he'
}

export function RootDetail({ root, catalog, catalogStatus, onSelectRoot }) {
  const key = rootKey(root.letters)
  const allPerms = uniquePermutations(root.letters)
  // A 4-letter root has 24 orderings and a 5-letter one 120 — showing every
  // ghost tile would drown the attested ones, so long roots list only found
  // permutations, with an honest count of what was omitted.
  const longRoot = root.letters.length > 3
  const perms = longRoot && catalogStatus === 'ready'
    ? allPerms.filter((p) => findAttestedRoot(catalog, root.lang, p))
    : allPerms
  // DOUBLETS and CLUSTERS are reviewed Hebrew datasets. A Biblical-Aramaic
  // card can share the same consonants without inheriting those Hebrew-only
  // claims or citations.
  const doublets = root.lang === 'hebrew'
    ? DOUBLETS.filter((d) => d.roots.some((r) => rootKey(r) === key))
    : []
  const clusters = root.lang === 'hebrew'
    ? CLUSTERS.filter((c) => c.members.some((m) => rootKey(m) === key))
    : []

  return (
    <section>
      <button className="btn-back" onClick={() => onSelectRoot(null)}>
        ‹ All roots
      </button>

      <div className="root-letters-large" dir="rtl" lang={languageTag(root.lang)}>
        {lettersLabel(root.letters)}
      </div>
      <div className="root-gloss">{root.gloss}</div>

      <div className="section-label">
        {root.catalogKind === 'source-derived'
          ? 'Published lexicon attestations'
          : 'Attested words'}
      </div>
      {root.attested.map((a, index) => (
        <div
          className="attested-word"
          key={`${a.source || 'curated'}:${a.sourceId || index}:${a.word}`}
        >
          <span className="w" dir="rtl" lang={languageTag(a.sourceLanguage || root.lang)}>
            {a.word}
          </span>
          <span className="g">
            {a.gloss}
            {a.citation && ` — ${a.citation}`}
          </span>
        </div>
      ))}

      {root.catalogKind === 'source-derived' && (
        <div className="note-block root-provenance" data-root-provenance="source-derived">
          <div className="doublet-label">Published-lexicon root card</div>
          <div>
            Languages: {root.sourceLanguages.map(languageLabel).join(', ')}.
          </div>
          <div>
            Sources:{' '}
            {root.sources
              .map((source) => `${sourceLabel(source.source)} ${source.sourceId}`)
              .join('; ')}.
          </div>
          <div>
            A lexicon headword records the dictionary’s root heading; it is not
            a claim that this uninflected citation form occurs in the biblical
            text. Direct biblical wording and citations are labeled separately.
          </div>
        </div>
      )}

      {root.homographNote && (
        <div className="note-block">{root.homographNote}</div>
      )}
      {root.interpretationNote && (
        <div className="note-block">{root.interpretationNote}</div>
      )}

      {root.cognates && root.cognates.length > 0 && (
        <>
          <div className="section-label">Cognates in other languages</div>
          <p className="fixed-line">{ATTESTED_ONLY_LINE}</p>
          {root.cognates.map((c, i) => {
            const lang = getLanguage(c.lang)
            return (
              <div className="cognate" key={i}>
                <span className="lang">{lang ? lang.name : c.lang}</span>
                <bdi className="form" dir={lang ? lang.dir : 'ltr'}>
                  {c.form}
                </bdi>
                {c.script && lang && (
                  <bdi className={lang.fontClass} dir={lang.dir}>
                    {c.script}
                  </bdi>
                )}
                {c.note && <span className="cnote">{c.note}</span>}
              </div>
            )
          })}
        </>
      )}

      <div className="section-label">Permutation explorer</div>
      <p className="fixed-line">{PERM_DISCLAIMER}</p>
      {catalogStatus === 'loading' && <p role="status">{CATALOG_LOADING}</p>}
      {catalogStatus === 'error' && (
        <div className="note-block" role="alert">
          {CATALOG_UNAVAILABLE}
        </div>
      )}
      {catalogStatus === 'ready' && longRoot && (
        <p className="fixed-line">
          {LONG_ROOT_NOTE.replace('{found}', String(perms.length)).replace(
            '{all}',
            String(allPerms.length)
          )}
        </p>
      )}
      {catalogStatus === 'ready' && <div className="perm-grid">
        {perms.map((p) => {
          const found = findAttestedRoot(catalog, root.lang, p)
          if (found) {
            return (
              <button
                key={p}
                className="perm-tile found"
                onClick={() => onSelectRoot(found.id)}
              >
                <div className="letters" dir="rtl" lang={languageTag(found.lang)}>
                  {lettersLabel(p)}
                </div>
                <div className="g">{found.gloss}</div>
              </button>
            )
          }
          return (
            <div key={p} className="perm-tile ghost" aria-disabled="true">
              <div className="letters" dir="rtl" lang={languageTag(root.lang)}>
                {lettersLabel(p)}
              </div>
              <div className="g">{GHOST_LABEL}</div>
            </div>
          )
        })}
      </div>}

      {doublets.length > 0 && (
        <>
          <div className="section-label">Attested spelling doublets</div>
          {doublets.map((d, i) => (
            <div className="note-block" key={i}>
              <div className="doublet-label">
                {d.type === 'metathesis' ? METATHESIS_LABEL : VARIANT_LABEL}
              </div>
              <div>
                <bdi dir="rtl" lang="he">
                  {d.roots[0]}
                </bdi>{' '}
                ↔{' '}
                <bdi dir="rtl" lang="he">
                  {d.roots[1]}
                </bdi>{' '}
                — {d.meaning}
              </div>
              <div>{d.citation}</div>
              {d.note && <div>{d.note}</div>}
            </div>
          ))}
        </>
      )}

      {clusters.length > 0 && (
        <>
          <div className="section-label">Cluster membership</div>
          {clusters.map((c) => (
            <div key={c.id}>
              <div>{c.title}</div>
              <div className="cluster-chips">
                {c.members.map((m) => {
                  const memberRoot = findAttestedRoot(catalog, 'hebrew', m)
                  return (
                    <button
                      key={m}
                      className="clusterchip"
                      dir="rtl"
                      lang="he"
                      onClick={() =>
                        memberRoot && onSelectRoot(memberRoot.id)
                      }
                    >
                      {lettersLabel(m)}
                    </button>
                  )
                })}
              </div>
              <div className="note-block">{c.note}</div>
            </div>
          ))}
        </>
      )}
    </section>
  )
}

export default function RootsView({ selectedRootId, onSelectRoot }) {
  const [query, setQuery] = useState('')
  const [catalog, setCatalog] = useState(CURATED_ROOT_CATALOG)
  const [catalogStatus, setCatalogStatus] = useState('loading')

  useEffect(() => {
    let cancelled = false
    loadAttestedRootCatalog()
      .then((loaded) => {
        if (cancelled) return
        setCatalog(loaded)
        setCatalogStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setCatalogStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const selected = selectedRootId
    ? findAttestedRootById(catalog, selectedRootId)
    : null

  if (selected) {
    return (
      <RootDetail
        root={selected}
        catalog={catalog}
        catalogStatus={catalogStatus}
        onSelectRoot={onSelectRoot}
      />
    )
  }

  const results = searchRoots(catalog.roots, query)

  return (
    <section>
      <input
        className="searchbar"
        type="search"
        dir="auto"
        placeholder="Search roots by letters, gloss, or attested word…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search roots"
      />

      <details className="infobox">
        <summary>
          On &lsquo;root permutation&rsquo; — what is attested, what is theory
        </summary>
        <p>
          The Masoretic text itself contains doublets in which the same word
          is spelled with reordered consonants; they are cited under the roots
          below.
        </p>
        <p>
          The systematic claim that every reordering of the same letters is
          semantically connected is a minority position in modern scholarship
          (the &lsquo;matrices and etymons&rsquo; theory associated with
          Georges Bohas), not the consensus. Mainstream comparative Semitics
          treats metathesis as sporadic.
        </p>
        <p>
          This tool therefore keeps the mechanical permutation grid separate
          from the cited attested connections.
        </p>
      </details>

      {catalogStatus === 'loading' && <p role="status">{CATALOG_LOADING}</p>}
      {catalogStatus === 'error' && (
        <div className="note-block" role="alert">
          {CATALOG_UNAVAILABLE} The hand-curated root cards remain searchable.
        </div>
      )}

      {results.map((root) => (
        <button
          key={root.id}
          className="rootlist-item"
          onClick={() => onSelectRoot(root.id)}
        >
          <span className="rootlist-letters" dir="rtl" lang={languageTag(root.lang)}>
            {lettersLabel(root.letters)}
          </span>
          <span className="rootlist-gloss">{root.gloss}</span>
          {root.catalogKind === 'source-derived' && (
            <span
              className="rootlist-source"
              data-root-language={root.lang}
            >
              {languageLabel(root.lang)} · published lexicon
            </span>
          )}
        </button>
      ))}
      {results.length === 0 && <p>No roots match this search.</p>}
    </section>
  )
}
