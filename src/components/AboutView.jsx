import { LANGUAGES, HEBREW_CAVEAT } from '../data/languages.js'
import { LEXICON } from '../data/lexicon.js'
import { ROOTS } from '../data/roots.js'
import { REFERENCE_DICTIONARIES } from '../data/referenceDictionaries.js'
import { ReadingExplainer } from './PronunciationGuide.jsx'

// The About screen: what the app is, how to read an entry (the data-honesty
// statement), the reference works the conventions follow, and font licenses.

export default function AboutView({ guideLanguage, onGuideLanguageChange }) {
  return (
    <section>
      <div className="settings-section">
        <h2>About Ancient Lexicon</h2>
        <p>
          A comparative dictionary of the ancient Near East, pivoting on
          Hebrew and English across Akkadian, Sumerian, Egyptian, Hittite,
          Imperial Aramaic, and Old South Arabian, with a Semitic root
          explorer and a shelf of public-domain and openly licensed reference
          dictionaries and lexical datasets.
        </p>
        <dl className="app-version" aria-label="Installed app version">
          <div>
            <dt>Version</dt>
            <dd data-app-version={__APP_VERSION__}>{__APP_VERSION__}</dd>
          </div>
          <div>
            <dt>Build</dt>
            <dd data-app-build={__APP_BUILD_ID__}><code dir="ltr">{__APP_BUILD_ID__}</code></dd>
          </div>
        </dl>
        <p className="app-version-note">
          This build identifies the code currently running on this device.
        </p>
        <p>
          The curated comparative database holds {LEXICON.length} concepts and{' '}
          {ROOTS.length} Hebrew roots. The Dictionary tab&rsquo;s Reference
          dictionaries mode adds both published lexicons and clearly labeled
          smaller open wordlists. They load on demand and are then available
          offline.
        </p>
        <p>
          Comparative also has an &lsquo;All Hebrew&rsquo; layer containing every
          Hebrew entry from Strong&rsquo;s and Brown&ndash;Driver&ndash;Briggs. Each
          source-distinct entry opens a sense-specific card with fixed slots for
          the same six ancient languages as the curated cards. English is shown
          only as explanatory bridge metadata, not as a comparison language.
        </p>
        <p>
          There is no backend, no account, and no analytics; your settings and
          custom entries never leave this device. The curated dictionary, the
          root explorer, and Strong&rsquo;s are precached and work offline from
          the first load. The other reference dictionaries download once, the
          first time you open each, and are then available offline too.
          The compact All Hebrew catalog and each comparison shard you open are
          likewise cached after their first online load. A complete source
          dictionary downloads only if you expand its source details.
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
          The &lsquo;All Hebrew&rsquo; layer ranks semantic equivalents separately for
          each dictionary sense; &lsquo;By meaning&rsquo; remains the broader shared-gloss
          discovery tool. A result marked &lsquo;Automatically matched semantic
          equivalent&rsquo; is a responsible semantic lead, not a cognacy claim.
          Results marked &lsquo;Verified/curated comparison&rsquo; come from the
          authoritative hand-curated card, including its intentional gaps.
        </p>
        <p>{HEBREW_CAVEAT}</p>
        {LANGUAGES.map((l) => (
          <p key={l.id}>{l.caveat}</p>
        ))}
        <ReadingExplainer
          guideLanguage={guideLanguage}
          onGuideLanguageChange={onGuideLanguageChange}
        />
      </div>

      <div className="settings-section">
        <h2>Sources &amp; method</h2>
        <p>
          Every verified comparative card is hand-curated, never bulk-imported.
          The separate All Hebrew cards label each populated slot as curated or
          automatic, and state when no reliable match was found. Automatic
          Imperial Aramaic matching is disabled: only curated forms may fill
          that slot. The curated conventions follow the standard reference
          works, and forms should be verified against them for scholarly use:
        </p>
        <ul className="about-sources">
          <li>Akkadian — The Chicago Assyrian Dictionary (CAD), freely published by the ISAC, University of Chicago</li>
          <li>Sumerian — The Electronic Pennsylvania Sumerian Dictionary (ePSD2)</li>
          <li>Egyptian — The Thesaurus Linguae Aegyptiae and the Berlin Wörterbuch (Wb.); Gardiner&rsquo;s sign list for the script</li>
          <li>Hittite — The Chicago Hittite Dictionary (CHD/eCHD)</li>
          <li>Imperial Aramaic — Elephantine and other Imperial-period evidence in the Comprehensive Aramaic Lexicon (CAL), and Porten &amp; Yardeni, Textbook of Aramaic Documents from Ancient Egypt (TAD). Biblical and Jastrow Aramaic remain separately labeled reference material.</li>
          <li>Old South Arabian — The DASI / CSAI corpus and the Sabaic dictionary tradition</li>
          <li>Hebrew — Brown–Driver–Briggs and Strong&rsquo;s (public domain), against the Masoretic text</li>
        </ul>
        <p>
          In the hand-curated comparative database, every cuneiform and
          hieroglyphic character was generated from its independently verified
          Unicode codepoint. Imported lexical datasets preserve the source
          project&rsquo;s Unicode spellings; integrity tests validate their script
          blocks, but the app does not claim to re-verify every imported sign.
        </p>
      </div>

      <div className="settings-section">
        <h2>Reference dictionaries</h2>
        <p>
          This shelf mixes complete historical lexicons with smaller modern
          lexical datasets. Every source is public domain or openly licensed,
          and its label states its real scope. The older works are historical
          references: read them as documents of their time, not as current
          scholarship. Open Hittite coverage combines modern comparative
          datasets, a small basic-vocabulary list, a conservatively filtered
          public-domain 1936 glossary, and small community datasets. Open Old
          South Arabian coverage remains a small community layer, principally
          Sabaean with small Minaean and Qatabanian subsets. Neither is
          presented as a full scholarly dictionary.
        </p>
        <p>
          The Chicago Hittite Dictionary and SabaWeb are not bundled because
          their published terms do not grant redistribution. DASI&rsquo;s record
          data are CC BY 4.0, but DASI is an inscription corpus rather than a
          consistent word-to-English dictionary; the app does not infer a
          word&rsquo;s meaning from an inscription-level translation.
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
