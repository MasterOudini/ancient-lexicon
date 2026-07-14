import { LANGUAGES, HEBREW_CAVEAT } from '../data/languages.js'
import { LEXICON } from '../data/lexicon.js'
import { ROOTS } from '../data/roots.js'
import { REFERENCE_DICTIONARIES } from '../data/referenceDictionaries.js'

// The About screen: what the app is, how to read an entry (the data-honesty
// statement), the reference works the conventions follow, and font licenses.

export default function AboutView() {
  return (
    <section>
      <div className="settings-section">
        <h2>About Ancient Lexicon</h2>
        <p>
          A comparative dictionary of the ancient Near East, pivoting on
          Hebrew and English across Akkadian, Sumerian, Egyptian, Hittite,
          Imperial Aramaic, and Old South Arabian, with a Semitic root
          explorer and a shelf of complete public-domain and openly-licensed
          reference dictionaries.
        </p>
        <p>
          The curated comparative database holds {LEXICON.length} concepts and{' '}
          {ROOTS.length} Hebrew roots. The Dictionary tab&rsquo;s Reference
          dictionaries mode adds complete published lexicons &mdash; tens of
          thousands of headwords each &mdash; that load on demand and are then
          available offline.
        </p>
        <p>
          There is no backend, no account, and no analytics; your settings and
          custom entries never leave this device. The curated dictionary, the
          root explorer, and Strong&rsquo;s are precached and work offline from
          the first load. The other reference dictionaries download once, the
          first time you open each, and are then available offline too.
        </p>
      </div>

      <div className="settings-section">
        <h2>How to read an entry</h2>
        <p>
          Attested facts are stated as facts with citations; conventions are
          labeled conventions; interpretations are labeled interpretations;
          unknowns are stated as unknown. No reconstructed proto-forms are
          shown or implied anywhere in the app.
        </p>
        <p>
          A form tagged &lsquo;verify against corpus&rsquo; is conventional or
          uncertain and should be checked against corpus records (CAD, Wb.,
          TAD, DASI/CSAI, museum catalogues) before scholarly use. A language
          slot reading &lsquo;not in database&rsquo; is deliberate: no attested
          or securely conventional form belongs there — absence is
          information.
        </p>
        <p>
          The &lsquo;By meaning&rsquo; search automatically gathers entries whose
          English glosses share a word. Those rows are leads for the reader
          to judge, not verified equivalents, cognates, or claims of lexical
          relationship. Only cards explicitly marked &lsquo;Verified comparative
          entry&rsquo; are hand-curated cross-language comparisons.
        </p>
        <p>{HEBREW_CAVEAT}</p>
        {LANGUAGES.map((l) => (
          <p key={l.id}>{l.caveat}</p>
        ))}
      </div>

      <div className="settings-section">
        <h2>Sources &amp; method</h2>
        <p>
          Every comparative entry is hand-curated, never bulk-imported. The
          conventions follow the standard reference works, and forms should be
          verified against them for scholarly use:
        </p>
        <ul className="about-sources">
          <li>Akkadian — The Chicago Assyrian Dictionary (CAD), freely published by the ISAC, University of Chicago</li>
          <li>Sumerian — The Electronic Pennsylvania Sumerian Dictionary (ePSD2)</li>
          <li>Egyptian — The Thesaurus Linguae Aegyptiae and the Berlin Wörterbuch (Wb.); Gardiner&rsquo;s sign list for the script</li>
          <li>Hittite — The Chicago Hittite Dictionary (CHD/eCHD)</li>
          <li>Imperial Aramaic — The Comprehensive Aramaic Lexicon (CAL); Porten &amp; Yardeni, Textbook of Aramaic Documents from Ancient Egypt (TAD); the biblical Aramaic of Daniel and Ezra</li>
          <li>Old South Arabian — The DASI / CSAI corpus and the Sabaic dictionary tradition</li>
          <li>Hebrew — Brown–Driver–Briggs and Strong&rsquo;s (public domain), against the Masoretic text</li>
        </ul>
        <p>
          Every cuneiform and hieroglyphic character in the database was
          generated from its verified Unicode codepoint — no glyph was ever
          typed from memory — and an integrity test keeps each script inside
          its own Unicode block.
        </p>
      </div>

      <div className="settings-section">
        <h2>Reference dictionaries</h2>
        <p>
          The Dictionary tab&rsquo;s Reference dictionaries mode is a shelf of complete
          published lexicons. Each is either public domain or openly licensed,
          reproduced unmodified and presented as published &mdash; they are the
          works themselves, not the hand-curated comparative data. The older
          ones are historical references: read them as documents of their time,
          not as current scholarship. There is no open full dictionary for
          Hittite or Old South Arabian, so those are covered only by the
          curated comparative entries.
        </p>
        <ul className="about-sources">
          {REFERENCE_DICTIONARIES.map((d) => (
            <li key={d.id}>
              <strong>
                {d.language} &mdash; {d.label}
              </strong>{' '}
              ({d.license}). {d.attribution}
            </li>
          ))}
        </ul>
      </div>

      <div className="settings-section">
        <h2>Scripts &amp; fonts</h2>
        <p>
          Original scripts are rendered with Noto Sans Cuneiform, Noto Sans
          Egyptian Hieroglyphs, Noto Sans Imperial Aramaic, and Noto Sans Old
          South Arabian, bundled with the app (never fetched from a network)
          and licensed under the SIL Open Font License.
        </p>
        <p>
          The database lives in src/data/ as plain, hand-editable files; the
          entry shape is documented at the top of each file.
        </p>
      </div>
    </section>
  )
}
