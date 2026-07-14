# Ancient Lexicon

An installable, fully offline Progressive Web App: a comparative dictionary of
ancient languages (Akkadian, Sumerian, Egyptian, Hittite, Imperial Aramaic,
Old South Arabian), pivoting on Hebrew and English, with a Semitic root
explorer and the complete Strong's Hebrew lexicon. No backend, no accounts,
no analytics; all user data stays on the device.

The curated comparative database holds ~250 concepts across kinship, the
body, animals, nature, agriculture, food, tools, the household, buildings,
places, time, numbers, colors, verbs, faith and law, emotions, and
qualities, resolved against ~240 Hebrew roots with attested doublets and
interpretive clusters.

Alongside it, the Dictionary tab's "Reference dictionaries" mode is a shelf
of public-domain and openly licensed dictionaries and lexical datasets. Each
source keeps its own coverage label, loads on demand, and is then available
offline:

- **Hebrew** — Strong's Concise Dictionary (1894, public domain); Brown-Driver-Briggs (1906, public domain, with Biblical Aramaic).
- **Aramaic** — Jastrow's Dictionary of the Targumim (1903, public domain), ~32,000 entries.
- **Egyptian** — the Thesaurus Linguae Aegyptiae word list (CC BY-SA 4.0), ~35,000 entries.
- **Sumerian** — ePSD2 / ORACC (CC BY-SA 3.0), ~9,800 entries with cuneiform.
- **Akkadian** — the RINAP glossary / ORACC (CC BY-SA 3.0).
- **Hittite** — 133 forms across 130 expert core concepts from IE-CoR v1.2
  (CC BY 4.0), plus a dated English Wiktionary community snapshot
  (redistributed under CC BY-SA 4.0).
- **Old South Arabian** — a dated English Wiktionary community snapshot
  (redistributed under CC BY-SA 4.0), principally Sabaean with very small Minaean and
  Qatabanian subsets.

These open Hittite and Old South Arabian sources are useful but are not full
scholarly dictionaries. The Chicago Hittite Dictionary and SabaWeb cannot be
redistributed under their published terms; DASI is openly licensed record data
but is an inscription corpus, not a consistent word-to-English dictionary.
The source-by-source decision record and copy-ready permission requests live in
[`docs/dictionary-source-audit.md`](docs/dictionary-source-audit.md). Generated
data live in `public/dicts/`; their `scripts/import-*.mjs` importers document
source, version, transformation, and license.

The third Dictionary mode, **By meaning**, searches every registered source
together through shared English glosses. English input
goes directly to a build-time inverted index; Hebrew or a Hebrew/Aramaic
transliteration first resolves to English sense words and then pivots through
the same index. Curated comparative cards always lead and are marked as
verified. Every bulk dictionary row names the English keyword that matched and
is explicitly labeled "not a verified equivalent": these are suggestions
gathered for the reader to judge, never claims of cognacy or scholarly
equivalence.

`scripts/build-gloss-index.mjs` generates
`public/dicts/gloss-index.json` without changing any source dictionary. It
indexes conservative leading English senses, skips Egyptian records that
have only the German fallback, caps very common postings at 40 per language,
and records every truncation count in the artifact. The current compact
record-and-sense-table encoding is about 8 MiB, above the 4–5 MiB app-shell target, so
it is not precached; the existing `/dicts/*.json` service-worker rule caches
it after first use, like the full reference dictionaries.

## Run

    npm install
    npm run dev        # development server
    npm run build      # regenerate the gloss index, then build into dist/
    npm run preview    # serve the production build locally
    npm test           # data-layer smoke test (node scripts/smoke-test.mjs)

## Deploy

`npm run build` produces a static `dist/` folder with no environment
variables. Deploy it to any static host:

- Cloudflare Pages: build command `npm run build`, output directory `dist`.
- Netlify: build command `npm run build`, publish directory `dist`.
- Vercel: framework preset Vite, output directory `dist`.
- GitHub Pages: works as-is for a user/organization site. For a project page
  served at `https://<user>.github.io/<repo-name>/`, build with
  `VITE_BASE=/<repo-name>/` — this sets the Vite base and the manifest
  start_url and scope together (see `vite.config.js`). The repository ships
  a ready-made workflow, `.github/workflows/deploy-pages.yml`, that builds
  with the right base and deploys every push to `main`; it requires GitHub
  Pages to be available for the repository (public repository, or a plan that
  allows Pages on private repositories) and Pages source set to GitHub Actions
  (the workflow attempts to enable this itself).

The app must be served over HTTPS (or localhost) for the service worker and
Add to Home Screen to work.

## Install on iPhone

1. Open the deployed HTTPS URL in Safari.
2. Tap the Share button.
3. Tap Add to Home Screen.

The app is fully usable offline after the first load: the service worker
precaches the entire app shell, including the script fonts. New deployments
are checked on launch; after this updater release has loaded once, checks are
also attempted whenever the Home Screen app returns to the foreground or comes
back online, and every five minutes while it is active. When a new release is
found, it activates and reloads automatically. Unfinished Add-a-word drafts
survive that reload, and the Home Screen icon does not need to be deleted or
reinstalled. Large reference dictionaries remain on demand; while online, each
open checks the deployed copy before falling back to its offline cache, so a
new meaning index cannot remain paired with stale dictionary rows.

Note: iOS can clear the stored data of websites that have not been visited
for a while. Custom entries and settings live in that storage, so export a
backup regularly from the Settings tab; import restores it on this or another
device.

## Where to edit data

- `src/data/lexicon/` — dictionary entries, one module per category
  (kinship.js, body.js, animals.js, …). The entry shape and the conventions
  (verify flag, logograms, intentional gaps) are documented in the header
  of `src/data/lexicon.js`, which aggregates the modules and defines the
  category display order.
- `src/data/roots.js` — the Hebrew root database, attested doublets
  (DOUBLETS), and interpretive clusters (CLUSTERS). Root letters are stored
  in non-final form only (מ not ם) so permutation keys match.
- `src/data/strongs.json` — the imported Strong's lexicon, generated by
  `scripts/import-strongs.mjs` (which documents the source and license).
  Edit the script, not the JSON: the file is presented as published.
- `src/data/languages.js` — the language registry and per-language caveats.
- `scripts/build-gloss-index.mjs` — the deterministic cross-dictionary
  English-gloss indexer. Run `npm run gloss:index` after changing an importer
  or dictionary source, then commit `public/dicts/gloss-index.json`.
- `scripts/import-iecor.mjs` and `scripts/import-wiktionary-ancient.mjs` —
  reproducible importers for the open Hittite and Old South Arabian lexical
  datasets. Edit the importer, not its generated JSON.
- `src/App.jsx` — the CONFIG block at the top holds the app name, default
  enabled languages, and UI strings.
- `src/styles.css` — colors (CSS custom properties at the top) and all
  styling.

After editing data, run `npm test` to check database integrity (root chips
resolve, no duplicate ids, no reconstructed forms, Masoretic pointing
present, every original-script string inside its own Unicode block, script
mappers correct).

## Data honesty

The database distinguishes what is attested from what is convention and what
is interpretation:

- Attested facts are stated as facts with citations (verse references,
  corpus names).
- Conventions are labeled conventions: cuneiform words are shown as the
  logograms with which they were commonly written; Egyptian renderings are
  linearized and the pronunciations shown are modern Egyptological
  conventions; Hebrew niqqud follows the Masoretic tradition.
- Interpretations are labeled interpretations, in the entry itself (for
  example, the permutation grid in the Roots tab is kept separate from cited
  attested connections, and cluster notes say the grouping is not provable
  from the texts alone).
- Unknowns are stated as unknown: forms tagged verify against corpus are
  conventional or uncertain and should be checked against corpus records
  (CAD, Wb., TAD, DASI/CSAI, museum catalogues) before scholarly use. A
  missing form means no attested form belongs in the database; gaps are not
  filled with guesses.
- No reconstructed proto-forms appear anywhere.
- Every cuneiform and hieroglyphic character in the hand-curated comparative
  database was generated from an independently verified Unicode codepoint.
  Imported datasets preserve upstream Unicode spellings; smoke tests pin them
  to the declared script block without claiming independent sign verification.
- The comparative entries are hand-curated, never bulk-imported; the About
  tab names the reference works the conventions follow (CAD, ePSD2, eCHD,
  TLA/Wb., CAL/TAD, DASI/CSAI, BDB/Strong's). Imported datasets are kept
  separate from those verified comparisons and carry source, version,
  transformation, license, and real coverage labels. Community wordlists are
  never described as comprehensive scholarly dictionaries.
- The By meaning mode is deliberately weaker evidence: it links records only
  because their published English glosses share a keyword. Its automatic rows
  are never described as equivalents or cognates, and are visually distinct
  from the verified comparative cards.

## Fonts

The bundled script fonts are Noto Sans Cuneiform, Noto Sans Egyptian
Hieroglyphs, Noto Sans Imperial Aramaic, and Noto Sans Old South Arabian,
licensed under the SIL Open Font License and served locally from
`public/fonts/` (never from a CDN) so the app works offline.

App icons are generated by `python3 scripts/make_icons.py` (requires
Pillow).
