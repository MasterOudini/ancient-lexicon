// Comparative lexicon: concepts across Hebrew/English and six ancient
// languages, organized in category modules under src/data/lexicon/.
//
// Entry shape:
//   {
//     id      - stable unique id
//     english - array of English glosses (first gloss is the display name)
//     hebrew  - { word (with Masoretic niqqud), translit, root (NON-final
//                 letters, matching src/data/roots.js), note? }
//     forms   - per-language forms keyed by language id from languages.js:
//               { translit?, script?, scriptNote?, pron?, note?, verify?,
//                 hebrewLetters?, tokens? }
//   }
//
// Conventions used in this file and in every module under src/data/lexicon/:
//   - verify: true means the rendering or attestation is conventional or
//     uncertain and must be checked against corpus records (CAD, Wb., TAD,
//     DASI/CSAI, museum catalogues) before scholarly use. The UI shows a
//     "verify against corpus" tag on such forms.
//   - Akkadian and Sumerian cuneiform is given as the logogram with which
//     the word was commonly written; the transliteration is the normalized
//     dictionary form.
//   - aramaic forms give hebrewLetters (square script); the app renders the
//     Imperial Aramaic glyphs automatically from the letter map. osa forms
//     give tokens (consonant token array) rendered automatically to Musnad.
//     Other scripts store the glyph string directly in script.
//   - No reconstructed proto-forms appear anywhere in these files; every form
//     is an attested word, a dictionary normalization, or a labeled modern
//     convention.
//   - A missing language form is intentional: it means no attested or
//     securely conventional form belongs in the database. The UI shows
//     "not in database" for such slots; absence is information.
//   - Use // comments only in the data modules (the integrity test scans
//     raw file text and treats any asterisk as a reconstructed form).

import { KINSHIP } from './lexicon/kinship.js'
import { BODY } from './lexicon/body.js'
import { PEOPLE } from './lexicon/people.js'
import { ANIMALS } from './lexicon/animals.js'
import { NATURE } from './lexicon/nature.js'
import { AGRICULTURE } from './lexicon/agriculture.js'
import { FOOD } from './lexicon/food.js'
import { TOOLS } from './lexicon/tools.js'
import { HOUSEHOLD } from './lexicon/household.js'
import { BUILDINGS } from './lexicon/buildings.js'
import { PLACES } from './lexicon/places.js'
import { TIME } from './lexicon/time.js'
import { NUMBERS } from './lexicon/numbers.js'
import { COLORS } from './lexicon/colors.js'
import { VERBS } from './lexicon/verbs.js'
import { VERBS2 } from './lexicon/verbs2.js'
import { CULTURE } from './lexicon/culture.js'
import { EMOTIONS } from './lexicon/emotions.js'
import { QUALITIES } from './lexicon/qualities.js'

// Categories in display order (the museum walk). Each entry carries its
// category id after aggregation; category files stay clean of it.
export const CATEGORIES = [
  { id: 'kinship', title: 'Kinship & family', entries: KINSHIP },
  { id: 'body', title: 'The body', entries: BODY },
  { id: 'people', title: 'People & society', entries: PEOPLE },
  { id: 'animals', title: 'Animals', entries: ANIMALS },
  { id: 'nature', title: 'Nature & the heavens', entries: NATURE },
  { id: 'agriculture', title: 'Field & harvest', entries: AGRICULTURE },
  { id: 'food', title: 'Food & drink', entries: FOOD },
  { id: 'tools', title: 'Tools & materials', entries: TOOLS },
  { id: 'household', title: 'The household', entries: HOUSEHOLD },
  { id: 'buildings', title: 'Buildings & the city', entries: BUILDINGS },
  { id: 'places', title: 'Places & directions', entries: PLACES },
  { id: 'time', title: 'Time & seasons', entries: TIME },
  { id: 'numbers', title: 'Numbers', entries: NUMBERS },
  { id: 'colors', title: 'Colors', entries: COLORS },
  { id: 'verbs', title: 'Everyday verbs', entries: VERBS },
  { id: 'verbs2', title: 'Verbs of worship & rule', entries: VERBS2 },
  { id: 'culture', title: 'Faith, law & kingship', entries: CULTURE },
  { id: 'emotions', title: 'Emotions & virtues', entries: EMOTIONS },
  { id: 'qualities', title: 'Qualities & abstracts', entries: QUALITIES }
]

export const LEXICON = CATEGORIES.flatMap((c) =>
  c.entries.map((e) => ({ ...e, category: c.id }))
)
