# Dictionary source audit: Hittite and Old South Arabian

Status: 2026-07-14. Recheck each source before refreshing an imported snapshot.

This audit distinguishes material that Ancient Lexicon may redistribute in its
offline bundle from material that is merely readable online. It is a product
and provenance record, not legal advice.

## The legal distinction

Ancient words and facts are not owned by a modern dictionary. In the United
States, individual words and short phrases generally lack the authorship needed
for copyright ([U.S. Copyright Office, Circular 33][usco-short]). That does not
make a modern dictionary free to copy: its definitions, translations,
commentary, editorial decisions, and creative selection or arrangement may be
protected. A database may also have protectable structure or compilation
authorship ([U.S. Copyright Office, databases][usco-db]). In the European Union,
a database maker may separately prevent extraction or reuse of all or a
substantial part of a qualifying database ([EU database protection][eu-db]).

For this app, “available on a website” is therefore not a redistribution
license. We bundle a source only when an explicit license or written permission
covers the fields we need, the required attribution can travel with the data,
and the imported version is recorded. We do not reconstruct a protected
dictionary by copying many individually short glosses.

## Hittite

### Cleared open data

- **Sturtevant, _A Hittite Glossary_, second edition (1936) — public-domain
  scan.** The [Internet Archive item][sturtevant] records the rights review as
  “Public domain according to HathiTrust rights database” and supplies the
  unrestricted scan and DjVu OCR. Hittite entries are interleaved with
  uppercase Sumerian and Akkadian entries, and the OCR contains real errors.
  **Decision:** bundle only a deliberately lossy automatic subset: lowercase
  Hittite-shaped heads, high-confidence OCR, a nearby English gloss, no
  question-marked uncertainty, no reconstructed asterisked head, and no
  detected Latin/German-only gloss. Retain the printed page, scan leaf, OCR
  confidence, and exact source link on every row. Label it prominently as a
  historical 1936 glossary based on OCR—not current scholarship, not verified
  equivalence, and not a complete or modern Hittite dictionary. The committed
  import retains 633 of 4,234 detected rows and records a reason for all 3,601
  exclusions. Before parsing, the importer verifies the exact DjVuXML byte
  length, MD5, and SHA-1 against the Internet Archive file metadata and fails
  closed on any mismatch.

- **DIACL / Lexibank 3.0 — CC BY 4.0.** The official [versioned
  release][diacl] supplies machine-readable CLDF under CC BY 4.0. Its Hittite
  subset is a comparative lexical dataset, not a general dictionary; it adds
  concepts outside IE-CoR while retaining source form and concept IDs.
  **Decision:** bundle only attested Hittite rows, retain release/citation and
  source identifiers, exclude reconstructed forms, and describe the actual
  concept/form coverage rather than implying completeness. The committed
  import retains 146 rows across 121 concepts after explicitly reporting and
  excluding three source-inconsistent duplicate assignments.

- **IE-CoR 1.2 — CC BY 4.0.** The official [Zenodo release][iecor-zenodo]
  and [versioned repository][iecor-repo] license this expert Indo-European
  cognacy dataset under CC BY 4.0. It covers 170 precisely defined core English
  concepts across the whole dataset; its Hittite rows are a core-concept
  wordlist, not a comprehensive dictionary. It supplies English concept labels.
  **Decision:** bundle the Hittite subset with dataset/version attribution and
  label it “core vocabulary (IE-CoR),” never “full Hittite dictionary.” Its
  cognacy judgements do not turn the app's separate English-gloss matches into
  verified cognates. The imported snapshot retains 133 forms across 130
  concepts after excluding four explicitly reconstructed headwords; five
  reconstructed syllabic spellings are also omitted, and source caveats remain
  without displaying reconstructed forms.

- **ASJP Hittite wordlist — CC BY 4.0.** The official [Hittite wordlist][asjp]
  is a small basic-vocabulary list with English/Concepticon meanings, not
  dictionary definitions. The current official record has 30 rows and credits
  compiler Viveka Velupillai. **Decision:** bundle the exact ASJP transcription
  with compiler/source attribution so every cleared source remains separately
  inspectable, while labeling it as a 30-item basic wordlist rather than a
  dictionary. Do not silently normalize its transcription.

- **Wikidata Lexemes — CC0 1.0.** Wikidata's [licensing
  policy][wikidata-license] applies CC0 to its structured data, including its
  [lexicographical data][wikidata-lexemes]. The 2026-07-14 snapshot has 39
  Hittite lexemes with English senses. It is small community data; many rows
  have no statement-level source and a cited reference item is provenance, not
  permission to copy that publication. **Decision:** bundle the dated CC0
  snapshot with Lexeme IDs and exact revision timestamps, preserve any source
  item IDs as provenance, and label every row as community data—not independently
  verified scholarship.

- **English Wiktionary Hittite entries — redistributed under CC BY-SA 4.0.**
  Wiktionary's original entry text is [dual-licensed][wiktionary-license]; this
  transformed snapshot uses the CC BY-SA 4.0 option. The
  [Hittite lemma category][wiktionary-hittite] contained 286 main-namespace
  pages at import; the filtered snapshot retains 294 lexical entries from 285
  pages because a page may have more than one part of speech. The entries
  supply English meanings. **Decision:** bundle a dated snapshot with exact
  page/revision attribution and the applicable share-alike notices. Label it
  “community dictionary (Wiktionary),” not a scholarly or complete Hittite
  lexicon.

- **TLHdig and UD Hittite-HitTB — open corpora, not dictionaries.** The official
  [TLHdig dataset page][tlhdig] states CC BY-SA 4.0; the
  [UD treebank page][ud-hittite] states CC BY-SA 4.0. They provide annotated
  texts, forms, and lemmata, but not a general English lexical-meaning layer.
  **Decision:** do not feed them into meaning search as dictionaries. They may
  support future attestation checks with their own attribution.

### Permission required

- **Chicago Hittite Dictionary / eCHD.** CHD is a comprehensive Hittite-English
  scholarly dictionary, but the [official publication list][chd-page] shows it
  is published by letter range and that A–K is not yet published. The P-volume
  preliminaries state “All Rights Reserved” ([official PDF][chd-pdf]). Its
  English definitions and articles are exactly the editorial material the app
  would need. **Decision:** do not bundle or systematically extract CHD/eCHD
  content without written permission from the University of Chicago/ISAC. Even
  with permission, describe the actual published letter coverage, not a complete
  A–Z dictionary.

- **University of Texas Hittite Online.** The official
  [Hittite Online collection][hittite-online] includes a master glossary, a base
  form dictionary, and an English meaning index generated from ten lesson texts.
  It is useful English-gloss data, but it is a lesson-corpus dictionary rather
  than a complete language dictionary. The site displays University copyright
  and no redistribution license was identified in this audit. **Decision:** ask
  the UT Linguistics Research Center for a data export and explicit offline
  redistribution/adaptation terms before importing; do not scrape it.

- **Olivier Lauffenburger's Hittite Grammar Homepage.** The site describes its
  [Hittite lexicon][lauffenburger-lexicon] as complete and supplies English
  meanings, but the [project page][lauffenburger-home] displays ©2006 Olivier
  Lauffenburger and no redistribution license was identified. **Decision:** ask
  the author for an export and written permission (preferably an explicit open
  license) before transforming or bundling the lexicon.

## Old South Arabian

“Old South Arabian” is a language family label. Sabaic/Sabaean coverage must not
be presented as complete coverage of Qatabanic, Minaic, Hadramitic, or the whole
family.

### Cleared open data

- **Wikidata Lexemes — CC0 1.0.** The same dated snapshot contains only eight
  Old South Arabian-family Lexemes with English senses: one umbrella OSA row,
  four Qatabanian, two Sabaean, and one Hadramautic; no Minaean row was present.
  **Decision:** bundle with exact Lexeme/revision attribution and show the
  variety on every row. Eight community records do not establish meaningful
  family-wide coverage.

- **English Wiktionary Old South Arabian-language entries — redistributed under
  CC BY-SA 4.0.** The upstream text is dual-licensed; this transformed snapshot
  uses the CC BY-SA 4.0 option. The import reads the [Old South Arabian][wiktionary-osa],
  [Sabaean][wiktionary-sabaean], [Minaean][wiktionary-minaean], and
  [Qatabanian][wiktionary-qatabanian] lemma categories. The
  dated snapshot contains 292 lexical entries: 149 labeled Sabaean, 112 under
  the legacy umbrella label, 20 Minaean, and 11 Qatabanian. Category sets
  overlap and change; the importer de-duplicates legacy/specific sections and
  retains exact source revisions. They supply English meanings. **Decision:**
  bundle the attributed snapshot with applicable share-alike notices. Label it
  “community dictionary (Wiktionary)” and display the variety on every row;
  small variety counts are not proof of complete family coverage.

### Licensed data with an access and attribution gate

- **DASI / CSAI records — record data CC BY 4.0 since 2026; images excluded.**
  DASI's [official terms][dasi-terms] apply CC BY 4.0 to data in CSAI records,
  not to images. They require each reused record to retain its contributing
  scholars, first-publication date, last-revision date, and DOI; a general
  archive acknowledgement is not a substitute. DASI exposes inscription records
  through OAI-PMH and an API available on request, invites prospective reusers
  to contact the project, objects to indiscriminate crawling/scraping, and
  discourages third-party AI-generated summaries or interpretations.

  DASI is an epigraphic corpus and word-list environment, not a ready-made
  English dictionary. The public API schema inspected in this audit exposes
  inscription/object/site records rather than lemma/root/POS/English-sense
  records; anonymous OAI requests currently meet the site challenge, and REST
  access requires a token. No reproducible public lexical record with an
  explicit supplied English word meaning was found. **Decision:** do not crawl
  the website, never import images, and never align inscription translations to
  tokens to infer a dictionary. Request an authorized lexical-layer export and
  confirmation that those fields are CC BY 4.0; preserve every record's editor,
  publication/revision dates, DOI, and license if access is granted.

### Permission required

- **SabaWeb / Sabaic Online Dictionary.** The official
  [project page][sabaweb] describes a broad attested Sabaic lexicon built from
  the inscription corpus. It is Sabaic, not all Old South Arabian, and its
  lexical material is principally German rather than a ready English meaning
  layer. No redistribution license was identified on the official project page
  at this audit. **Decision:** request a licensed export before copying any
  substantial part. If permission is granted, retain the German-language label;
  do not silently machine-translate or place German glosses in the English
  meaning index.

- **KALAM.** The live morphological analyzer can search Old South Arabian
  forms and English meanings across Sabaic, Minaic, Qatabanic, and Hadramitic,
  and a 2016 description reports more than 2,000 Sabaic words. It has no
  documented bulk export or reuse license and can also synthesize forms rather
  than returning dictionary attestations only. **Decision:** do not scrape or
  redistribute it. Request a licensed, provenance-audited dictionary export
  before considering an import.

## Assessed but not bundleable

- **PanLex.** A historical snapshot has substantial English-linked Hittite
  coverage, but PanLex's current [official license][panlex-license] is
  CC BY-NC-SA 4.0, commercial use requires written permission, its live API is
  not currently a reproducible import route, and the largest Hittite component
  traces to an unlicensed Hittite Online source. **Decision:** use PanLex only
  as a discovery lead; do not bundle it under unresolved source-level rights.

- **eDiAna.** Its project data are CC BY-SA 4.0, but the public site exposes
  diachronic entries—often reconstructed Proto-Anatolian or minor-Anatolian
  heads—with linked Hittite sections rather than a standalone Hittite export.
  The API is reserved for project staff. **Decision:** request an official
  attested-Hittite export with per-lemma author/version attribution; do not
  scrape internal endpoints or import reconstructed heads.

## Product rules for every imported source

1. Store source name, release/snapshot date, license, attribution, and upstream
   URL beside the generated data.
2. Say what the source is: scholarly dictionary, community dictionary,
   core-concept wordlist, or corpus. Never describe combined partial sources as
   “the full dictionary.”
3. Index only meanings actually supplied in English. A German-only or
   no-gloss record may be browsable with a language label but must not masquerade
   as an English meaning match.
4. Preserve the app's honesty boundary: curated comparative cards are verified;
   automatic gloss matches say “matched by English meaning — not a verified
   equivalent.” No imported source makes those results cognates.
5. Keep large source files on-demand and offline-cacheable. Never add runtime
   dependencies on the source website.

## Permission and access request templates

Replace bracketed text before sending. Do not claim affiliation or endorsement.

### CHD / eCHD — University of Chicago ISAC

Target: the CHD/ISAC publications team through the official CHD page.

> **Subject:** Permission to redistribute a structured CHD lexical subset in an offline educational PWA
>
> We maintain Ancient Lexicon, an offline comparative-dictionary PWA. We would
> like to display Hittite headwords, parts of speech, and short English glosses
> from the published CHD/eCHD ranges, with a citation and link on every record.
> May we receive a structured export and written permission to transform and
> redistribute those fields in the app and its public source repository? Please
> specify the covered letter ranges, permitted modifications, required credit,
> license text, update process, and whether local/offline caching is allowed. We
> will not reproduce articles or images beyond the expressly permitted fields,
> and will state that the published dictionary is incomplete by letter range.

### Hittite Online — UT Linguistics Research Center

Target: `UTLRC@utexas.edu`, the contact published on Hittite Online.

> **Subject:** Data export and reuse permission for the Hittite Online lexical indexes
>
> We would like to include the Hittite Online base forms and their English
> meanings in Ancient Lexicon, clearly labeled as vocabulary from the ten-lesson
> corpus. May we receive an export and a license permitting transformation to
> JSON, offline redistribution, and public version control? Please confirm the
> required author/editor attribution, source-version citation, license for
> derived data, and whether links to lesson attestations may be retained. We
> will not scrape the site and will not describe the material as a complete
> Hittite dictionary.

### Olivier Lauffenburger — Hittite Grammar Homepage

Target: `olivier.lauffenburger@wanadoo.fr`, linked by the project page.

> **Subject:** Permission to include the English Hittite lexicon in Ancient Lexicon
>
> We would like to transform the English Hittite lexicon into a compact offline
> JSON dictionary containing headword, part of speech, and English meaning.
> Would you grant written permission to redistribute and update that transformed
> dataset in the app and its public repository, ideally under CC BY 4.0 or CC
> BY-SA 4.0? Please specify required attribution, permitted fields and
> modifications, and how the source version should be recorded. We will link to
> your site and will not imply your endorsement. The project page's contact link
> identifies Olivier Lauffenburger as the rights/contact target.

### DASI — API/OAI access and attribution confirmation

Target: DASI's official [contact person][dasi-contact] and API-access channel.

> **Subject:** DASI API/export request for attributed lexical discovery in an offline PWA
>
> We would like to reuse CC BY 4.0 data from CSAI records in Ancient Lexicon.
> Please advise the supported API, OAI-PMH, or export route and whether the
> lexical/word-list fields and any supplied English translations are included
> in that license. We will not crawl the website or copy images. For every reused
> record we will retain contributing scholars, first-publication date,
> last-revision date, DOI, snapshot date, and the required license notice. Please
> confirm the preferred machine-readable attribution fields, update/rate-limit
> process, and whether a formal institutional agreement is appropriate. The app
> performs deterministic keyword matching and labels it as unverified; it will
> not generate scholarly summaries or interpretations from DASI data.

### SabaWeb — Friedrich Schiller University Jena project team

Target: the SabaWeb project team through the official project page.

> **Subject:** Licensed export request for the Sabaic Online Dictionary
>
> We would like to add a clearly labeled Sabaic dictionary to Ancient Lexicon.
> May we receive a structured export and a license permitting transformation,
> offline redistribution, and public version control of headwords, grammatical
> data, and short glosses? Please specify whether English glosses exist, how
> German glosses must be labeled, required contributor/project attribution,
> source version, permitted modifications, and update terms. We will identify
> the coverage as Sabaic rather than all Old South Arabian and will not scrape
> the website or imply project endorsement.

[asjp]: https://asjp.clld.org/languages/HITTITE
[diacl]: https://github.com/lexibank/diacl/releases/tag/v3.0
[chd-page]: https://isac.uchicago.edu/research/publications/chicago-hittite-dictionary
[chd-pdf]: https://isac.uchicago.edu/sites/default/files/uploads/shared/docs/CHDP.pdf
[dasi-contact]: https://dasi.cnr.it/about#contact
[dasi-terms]: https://dasi.cnr.it/terms-of-use
[eu-db]: https://europa.eu/youreurope/business/running-business/intellectual-property/database-protection/index_en.htm
[hittite-online]: https://lrc.la.utexas.edu/eieol_toc/hitol
[iecor-repo]: https://github.com/lexibank/iecor/tree/v1.2
[iecor-zenodo]: https://zenodo.org/records/13304537
[lauffenburger-home]: https://www.assyrianlanguages.org/hittite/index_fr.php?page=accueil
[lauffenburger-lexicon]: https://www.assyrianlanguages.org/hittite/en_lexique_hittite.htm
[panlex-license]: https://panlex.org/license/
[sabaweb]: https://asaweb.uni-jena.de/asaweb_t3/home/the-sabaic-online-dictionary
[sturtevant]: https://archive.org/details/hittiteglossary00stur
[tlhdig]: https://wres-hatti.adwudlit.uni-mainz.de/TLHdig/dataset.php
[ud-hittite]: https://universaldependencies.org/treebanks/hit_hittb/index.html
[usco-db]: https://www.copyright.gov/register/tx-databases.html
[usco-short]: https://www.copyright.gov/circs/circ33.pdf
[wiktionary-hittite]: https://en.wiktionary.org/wiki/Category:Hittite_lemmas
[wikidata-license]: https://www.wikidata.org/wiki/Wikidata:Licensing
[wikidata-lexemes]: https://www.wikidata.org/wiki/Wikidata:Lexicographical_data
[wiktionary-license]: https://en.wiktionary.org/wiki/Wiktionary:Copyrights
[wiktionary-minaean]: https://en.wiktionary.org/wiki/Category:Minaean_lemmas
[wiktionary-osa]: https://en.wiktionary.org/wiki/Category:Old_South_Arabian_lemmas
[wiktionary-qatabanian]: https://en.wiktionary.org/wiki/Category:Qatabanian_lemmas
[wiktionary-sabaean]: https://en.wiktionary.org/wiki/Category:Sabaean_lemmas
