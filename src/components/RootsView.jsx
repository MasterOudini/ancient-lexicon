import { useState } from 'react'
import {
  ROOTS,
  DOUBLETS,
  CLUSTERS,
  rootKey,
  uniquePermutations,
  findRoot,
  findRootById
} from '../data/roots.js'
import { getLanguage } from '../data/languages.js'
import { searchRoots } from '../lib/search.js'

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

function lettersLabel(letters) {
  const arr = Array.isArray(letters) ? letters : Array.from(letters)
  return arr.join(MAQAF)
}

function RootDetail({ root, onSelectRoot }) {
  const key = rootKey(root.letters)
  const perms = uniquePermutations(root.letters)
  const doublets = DOUBLETS.filter((d) =>
    d.roots.some((r) => rootKey(r) === key)
  )
  const clusters = CLUSTERS.filter((c) =>
    c.members.some((m) => rootKey(m) === key)
  )

  return (
    <section>
      <button className="btn-back" onClick={() => onSelectRoot(null)}>
        ‹ All roots
      </button>

      <div className="root-letters-large" dir="rtl" lang="he">
        {lettersLabel(root.letters)}
      </div>
      <div className="root-gloss">{root.gloss}</div>

      <div className="section-label">Attested words</div>
      {root.attested.map((a) => (
        <div className="attested-word" key={a.word}>
          <span className="w" dir="rtl" lang="he">
            {a.word}
          </span>
          <span className="g">{a.gloss}</span>
        </div>
      ))}

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
      <div className="perm-grid">
        {perms.map((p) => {
          const found = findRoot(root.lang, p)
          if (found) {
            return (
              <button
                key={p}
                className="perm-tile found"
                onClick={() => onSelectRoot(found.id)}
              >
                <div className="letters" dir="rtl" lang="he">
                  {lettersLabel(p)}
                </div>
                <div className="g">{found.gloss}</div>
              </button>
            )
          }
          return (
            <div key={p} className="perm-tile ghost" aria-disabled="true">
              <div className="letters" dir="rtl" lang="he">
                {lettersLabel(p)}
              </div>
              <div className="g">{GHOST_LABEL}</div>
            </div>
          )
        })}
      </div>

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
                  const memberRoot = findRoot('hebrew', m)
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
  const selected = selectedRootId ? findRootById(selectedRootId) : null

  if (selected) {
    return <RootDetail root={selected} onSelectRoot={onSelectRoot} />
  }

  const results = searchRoots(ROOTS, query)

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

      {results.map((root) => (
        <button
          key={root.id}
          className="rootlist-item"
          onClick={() => onSelectRoot(root.id)}
        >
          <span className="rootlist-letters" dir="rtl" lang="he">
            {lettersLabel(root.letters)}
          </span>
          <span className="rootlist-gloss">{root.gloss}</span>
        </button>
      ))}
      {results.length === 0 && <p>No roots match this search.</p>}
    </section>
  )
}
