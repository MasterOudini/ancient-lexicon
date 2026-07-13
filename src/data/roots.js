// Hebrew root database.
//
// Root shape:
//   {
//     id                 - stable unique id
//     lang               - language the root belongs to ('hebrew')
//     letters            - array of NON-FINAL Hebrew letters (מ not ם, צ not ץ)
//                          so permutation keys always match
//     gloss              - short meaning(s)
//     attested           - words attested in the Hebrew Bible, with niqqud
//                          and a short gloss each
//     cognates           - optional; attested cognates of the same root in
//                          other languages, with source notes. Attested forms
//                          only; no reconstructed proto-forms appear anywhere.
//     homographNote      - optional; note on same-consonant homographs
//     interpretationNote - optional; marks a claim that is interpretation,
//                          not provable from the texts alone
//   }
//
// DOUBLETS lists attested spelling doublets in the Masoretic text, each with
// verse citations. type 'metathesis' means the same word spelled with
// reordered consonants; type 'variant' means a consonant-variant pair that is
// not a permutation.
//
// CLUSTERS lists interpretive groupings of roots; the cluster note labels the
// grouping itself as interpretation.

import { foldFinals, toImperialAramaic, toMusnad } from '../lib/scripts.js'

// Canonical key for a root's letters: final letters folded, joined.
// Accepts an array of letters or a string.
export function rootKey(letters) {
  const str = Array.isArray(letters) ? letters.join('') : letters
  return foldFinals(str)
}

// All unique orderings of the given letters (array or string), as canonical
// key strings. Repeated letters are deduplicated: לבב yields 3, not 6.
export function uniquePermutations(letters) {
  const arr = Array.from(rootKey(letters))
  const results = new Set()
  const used = new Array(arr.length).fill(false)
  const current = []
  function walk() {
    if (current.length === arr.length) {
      results.add(current.join(''))
      return
    }
    for (let i = 0; i < arr.length; i++) {
      if (used[i]) continue
      used[i] = true
      current.push(arr[i])
      walk()
      current.pop()
      used[i] = false
    }
  }
  walk()
  return Array.from(results)
}

export const ROOTS = [
  // ---- Concept roots with attested cognates -------------------------------
  {
    id: 'he-mlk',
    lang: 'hebrew',
    letters: ['מ', 'ל', 'כ'],
    gloss: 'reign, be king',
    attested: [
      { word: 'מֶלֶךְ', gloss: 'king' },
      { word: 'מָלַךְ', gloss: 'he reigned' },
      { word: 'מַלְכָּה', gloss: 'queen' },
      { word: 'מַמְלָכָה', gloss: 'kingdom' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'מלך / מַלְכָּא',
        script: toImperialAramaic('מלכא'),
        note: 'Elephantine papyri; Daniel, Ezra'
      },
      {
        lang: 'osa',
        form: 'mlk',
        script: toMusnad(['m', 'l', 'k']),
        note: 'Sabaic royal inscriptions'
      },
      {
        lang: 'akkadian',
        form: 'malku',
        note: 'attested; the ordinary Akkadian word for king is šarru'
      }
    ]
  },
  {
    id: 'he-shlm',
    lang: 'hebrew',
    letters: ['ש', 'ל', 'מ'],
    gloss: 'whole, well-being',
    attested: [
      { word: 'שָׁלוֹם', gloss: 'peace, well-being' },
      { word: 'שָׁלֵם', gloss: 'whole, complete' },
      { word: 'שִׁלֵּם', gloss: 'he repaid' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'šalāmu / šulmu',
        note: 'to be whole; well-being'
      },
      {
        lang: 'aramaic',
        form: 'שלם',
        script: toImperialAramaic('שלם'),
        note: 'greeting formula in Elephantine letters'
      }
    ],
    homographNote:
      'שַׂלְמָה garment is written with the same consonants; shin/śin is a Masoretic pointing distinction on an identical consonantal letter.'
  },
  {
    id: 'he-klb',
    lang: 'hebrew',
    letters: ['כ', 'ל', 'ב'],
    gloss: 'dog',
    attested: [{ word: 'כֶּלֶב', gloss: 'dog' }],
    cognates: [
      { lang: 'akkadian', form: 'kalbu', note: 'dog' },
      {
        lang: 'aramaic',
        form: 'כלבא',
        script: toImperialAramaic('כלבא'),
        note: 'the dog (emphatic form)'
      }
    ]
  },
  {
    id: 'he-byt',
    lang: 'hebrew',
    letters: ['ב', 'י', 'ת'],
    gloss: 'house',
    attested: [{ word: 'בַּיִת', gloss: 'house' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ביתא',
        script: toImperialAramaic('ביתא'),
        note: 'the house (emphatic form); Elephantine house documents; Ezra 5:11'
      },
      { lang: 'akkadian', form: 'bītu', note: 'house' }
    ]
  },
  {
    id: 'he-bn',
    lang: 'hebrew',
    letters: ['ב', 'נ'],
    gloss: 'son (noun base)',
    attested: [
      { word: 'בֵּן', gloss: 'son' },
      { word: 'בַּת', gloss: 'daughter' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'בר',
        script: toImperialAramaic('בר'),
        note: 'Aramaic br corresponds to Hebrew bn; both are attested'
      },
      {
        lang: 'osa',
        form: 'bn',
        script: toMusnad(['b', 'n']),
        note: 'genealogical formulas in Sabaic inscriptions'
      }
    ]
  },
  {
    id: 'he-bnh',
    lang: 'hebrew',
    letters: ['ב', 'נ', 'ה'],
    gloss: 'build',
    attested: [{ word: 'בָּנָה', gloss: 'he built' }],
    interpretationNote:
      'A connection between בנה build and בֵּן son is an interpretation, not provable from the texts alone.'
  },

  // ---- Noun-base roots so every dictionary root chip resolves -------------
  {
    id: 'he-el',
    lang: 'hebrew',
    letters: ['א', 'ל'],
    gloss: 'god (noun base)',
    attested: [{ word: 'אֵל', gloss: 'god' }]
  },
  {
    id: 'he-mym',
    lang: 'hebrew',
    letters: ['מ', 'י', 'מ'],
    gloss: 'water (noun base)',
    attested: [{ word: 'מַיִם', gloss: 'water' }]
  },
  {
    id: 'he-shmsh',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'ש'],
    gloss: 'sun (noun base)',
    attested: [{ word: 'שֶׁמֶשׁ', gloss: 'sun' }]
  },
  {
    id: 'he-ywm',
    lang: 'hebrew',
    letters: ['י', 'ו', 'מ'],
    gloss: 'day (noun base)',
    attested: [{ word: 'יוֹם', gloss: 'day' }]
  },
  {
    id: 'he-ab',
    lang: 'hebrew',
    letters: ['א', 'ב'],
    gloss: 'father (noun base)',
    attested: [{ word: 'אָב', gloss: 'father' }]
  },
  {
    id: 'he-em',
    lang: 'hebrew',
    letters: ['א', 'מ'],
    gloss: 'mother (noun base)',
    attested: [{ word: 'אֵם', gloss: 'mother' }]
  },
  {
    id: 'he-yd',
    lang: 'hebrew',
    letters: ['י', 'ד'],
    gloss: 'hand (noun base)',
    attested: [{ word: 'יָד', gloss: 'hand' }]
  },
  {
    id: 'he-lbb',
    lang: 'hebrew',
    letters: ['ל', 'ב', 'ב'],
    gloss: 'heart',
    attested: [
      { word: 'לֵב', gloss: 'heart' },
      { word: 'לֵבָב', gloss: 'heart' }
    ]
  },
  {
    id: 'he-shm',
    lang: 'hebrew',
    letters: ['ש', 'מ'],
    gloss: 'name (noun base)',
    attested: [{ word: 'שֵׁם', gloss: 'name' }]
  },
  {
    id: 'he-shwr',
    lang: 'hebrew',
    letters: ['ש', 'ו', 'ר'],
    gloss: 'ox (noun base)',
    attested: [{ word: 'שׁוֹר', gloss: 'ox' }]
  },
  {
    id: 'he-lchm',
    lang: 'hebrew',
    letters: ['ל', 'ח', 'מ'],
    gloss: 'bread / fight — two attested word groups',
    attested: [
      { word: 'לֶחֶם', gloss: 'bread' },
      { word: 'נִלְחַם', gloss: 'he fought' }
    ]
  },
  {
    id: 'he-gdl',
    lang: 'hebrew',
    letters: ['ג', 'ד', 'ל'],
    gloss: 'be great, grow',
    attested: [
      { word: 'גָּדוֹל', gloss: 'great' },
      { word: 'גָּדַל', gloss: 'he grew great' }
    ]
  },
  {
    id: 'he-ktb',
    lang: 'hebrew',
    letters: ['כ', 'ת', 'ב'],
    gloss: 'write',
    attested: [
      { word: 'כָּתַב', gloss: 'he wrote' },
      { word: 'מִכְתָּב', gloss: 'writing' }
    ]
  },
  {
    id: 'he-shmr',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'ר'],
    gloss: 'keep, guard',
    attested: [
      { word: 'שָׁמַר', gloss: 'he kept, guarded' },
      { word: 'שֹׁמֵר', gloss: 'watchman' }
    ]
  },

  // ---- Permutation demonstration set one: all six orderings of ק ר ב ------
  {
    id: 'he-qrb',
    lang: 'hebrew',
    letters: ['ק', 'ר', 'ב'],
    gloss: 'draw near',
    attested: [
      { word: 'קָרַב', gloss: 'he drew near' },
      { word: 'קֶרֶב', gloss: 'midst, inward part' },
      { word: 'קָרְבָּן', gloss: 'offering' },
      { word: 'קְרָב', gloss: 'battle' }
    ]
  },
  {
    id: 'he-qbr',
    lang: 'hebrew',
    letters: ['ק', 'ב', 'ר'],
    gloss: 'bury',
    attested: [
      { word: 'קָבַר', gloss: 'he buried' },
      { word: 'קֶבֶר', gloss: 'grave' }
    ]
  },
  {
    id: 'he-brq',
    lang: 'hebrew',
    letters: ['ב', 'ר', 'ק'],
    gloss: 'lightning',
    attested: [{ word: 'בָּרָק', gloss: 'lightning' }]
  },
  {
    id: 'he-bqr',
    lang: 'hebrew',
    letters: ['ב', 'ק', 'ר'],
    gloss: 'morning / cattle / inspect — several attested word groups',
    attested: [
      { word: 'בֹּקֶר', gloss: 'morning' },
      { word: 'בָּקָר', gloss: 'cattle' },
      { word: 'בִּקֵּר', gloss: 'he inspected' }
    ]
  },
  {
    id: 'he-rqb',
    lang: 'hebrew',
    letters: ['ר', 'ק', 'ב'],
    gloss: 'rot',
    attested: [{ word: 'רָקָב', gloss: 'rottenness' }]
  },
  {
    id: 'he-rbq',
    lang: 'hebrew',
    letters: ['ר', 'ב', 'ק'],
    gloss: 'stall (noun only)',
    attested: [{ word: 'מַרְבֵּק', gloss: 'stall (for fattening cattle)' }],
    interpretationNote:
      'Only the noun מַרְבֵּק is attested in the Hebrew Bible; a verbal root is not attested.'
  },

  // ---- Permutation demonstration set two: ע ב ר ---------------------------
  {
    id: 'he-abr',
    lang: 'hebrew',
    letters: ['ע', 'ב', 'ר'],
    gloss: 'pass over, cross',
    attested: [
      { word: 'עָבַר', gloss: 'he passed over' },
      { word: 'עֵבֶר', gloss: 'region beyond, other side' }
    ]
  },
  {
    id: 'he-arb',
    lang: 'hebrew',
    letters: ['ע', 'ר', 'ב'],
    gloss: 'evening / mix / pledge — several attested word groups',
    attested: [
      { word: 'עֶרֶב', gloss: 'evening' },
      { word: 'עֵרֶב', gloss: 'mixture, mixed multitude' },
      { word: 'עָרַב', gloss: 'he stood surety, pledged' },
      { word: 'עֹרֵב', gloss: 'raven' }
    ]
  },
  {
    id: 'he-bar',
    lang: 'hebrew',
    letters: ['ב', 'ע', 'ר'],
    gloss: 'burn',
    attested: [{ word: 'בָּעַר', gloss: 'it burned' }]
  },
  {
    id: 'he-rab',
    lang: 'hebrew',
    letters: ['ר', 'ע', 'ב'],
    gloss: 'hunger, famine',
    attested: [
      { word: 'רָעָב', gloss: 'famine' },
      { word: 'רָעֵב', gloss: 'hungry' }
    ]
  },
  {
    id: 'he-rba',
    lang: 'hebrew',
    letters: ['ר', 'ב', 'ע'],
    gloss: 'four-group and lie-down group, both attested',
    attested: [
      { word: 'אַרְבַּע', gloss: 'four' },
      { word: 'רֹבַע', gloss: 'fourth part' },
      { word: 'רָבַע', gloss: 'it lay down (of animals)' }
    ]
  },

  // ---- Doublet roots -------------------------------------------------------
  {
    id: 'he-kbs',
    lang: 'hebrew',
    letters: ['כ', 'ב', 'ש'],
    gloss: 'lamb; also subdue',
    attested: [
      { word: 'כֶּבֶשׂ', gloss: 'lamb' },
      { word: 'כָּבַשׁ', gloss: 'he subdued' }
    ],
    homographNote:
      'כבשׂ lamb and כבשׁ subdue differ only in the Masoretic point on the ש — the consonantal letter is identical.'
  },
  {
    id: 'he-ksb',
    lang: 'hebrew',
    letters: ['כ', 'ש', 'ב'],
    gloss: 'lamb (variant spelling)',
    attested: [{ word: 'כֶּשֶׂב', gloss: 'lamb' }]
  },
  {
    id: 'he-sml',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'ל'],
    gloss: 'garment',
    attested: [{ word: 'שִׂמְלָה', gloss: 'garment' }]
  },

  // ---- Consonant-variant pair roots (cry out) ------------------------------
  {
    id: 'he-zaq',
    lang: 'hebrew',
    letters: ['ז', 'ע', 'ק'],
    gloss: 'cry out',
    attested: [
      { word: 'זָעַק', gloss: 'he cried out' },
      { word: 'זְעָקָה', gloss: 'outcry' }
    ]
  },
  {
    id: 'he-tsaq',
    lang: 'hebrew',
    letters: ['צ', 'ע', 'ק'],
    gloss: 'cry out',
    attested: [
      { word: 'צָעַק', gloss: 'he cried out' },
      { word: 'צְעָקָה', gloss: 'outcry' }
    ]
  },

  // ---- The פ־ר cluster roots (splitting and dividing) ----------------------
  {
    id: 'he-prd',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'ד'],
    gloss: 'separate',
    attested: [{ word: 'נִפְרַד', gloss: 'it separated' }]
  },
  {
    id: 'he-prm',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'מ'],
    gloss: 'tear a garment',
    attested: [{ word: 'פְּרֻמִים', gloss: 'torn (garments), Leviticus 13:45' }]
  },
  {
    id: 'he-prs',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'ס'],
    gloss: 'divide',
    attested: [{ word: 'מַפְרִיס פַּרְסָה', gloss: 'dividing the hoof' }]
  },
  {
    id: 'he-prts',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'צ'],
    gloss: 'break through',
    attested: [{ word: 'פֶּרֶץ', gloss: 'breach' }]
  },
  {
    id: 'he-prq',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'ק'],
    gloss: 'tear off',
    attested: [{ word: 'פָּרְקוּ', gloss: 'tear off (imperative), Exodus 32:2' }]
  },
  {
    id: 'he-prr',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'ר'],
    gloss: 'annul',
    attested: [{ word: 'הֵפֵר', gloss: 'he annulled' }]
  },

  // --- Kinship & family ---
  {
    id: 'he-ach',
    lang: 'hebrew',
    letters: ['א', 'ח'],
    gloss: 'brother (noun base)',
    attested: [
      { word: 'אָח', gloss: 'brother' },
      { word: 'אָחוֹת', gloss: 'sister' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'aḫu',
        note: 'brother; a separate Akkadian word aḫu means arm, side'
      },
      {
        lang: 'aramaic',
        form: 'אח',
        note: 'address form in Elephantine letters (אחי my brother)'
      },
      {
        lang: 'osa',
        form: 'ʾḫ',
        note: 'in personal names; check corpus records (DASI/CSAI)'
      }
    ],
    homographNote:
      'אָח fire-pot (Jeremiah 36:22) is written with the same consonants.'
  },
  {
    id: 'he-aysh',
    lang: 'hebrew',
    letters: ['א', 'י', 'ש'],
    gloss: 'man (noun base)',
    attested: [{ word: 'אִישׁ', gloss: 'man, husband' }],
    interpretationNote:
      'אִישׁ and its plural-in-use אֲנָשִׁים are conventionally filed together; whether אִישׁ derives from the root אנש is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-ashh',
    lang: 'hebrew',
    letters: ['א', 'ש', 'ה'],
    gloss: 'woman (noun base)',
    attested: [
      { word: 'אִשָּׁה', gloss: 'woman, wife' },
      { word: 'נָשִׁים', gloss: 'women (the plural in use)' }
    ],
    interpretationNote:
      'The אִישׁ / אִשָּׁה wordplay of Genesis 2:23 is presented in the text itself; the dictionaries nevertheless usually keep the two words under separate roots.'
  },
  {
    id: 'he-yld',
    lang: 'hebrew',
    letters: ['י', 'ל', 'ד'],
    gloss: 'bear, give birth',
    attested: [
      { word: 'יָלַד', gloss: 'he begot' },
      { word: 'יָלְדָה', gloss: 'she bore' },
      { word: 'יֶלֶד', gloss: 'child, boy' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'alādu',
        note: 'to give birth; Old Babylonian walādum'
      }
    ]
  },
  {
    id: 'he-bkr',
    lang: 'hebrew',
    letters: ['ב', 'כ', 'ר'],
    gloss: 'firstborn, early',
    attested: [
      { word: 'בְּכוֹר', gloss: 'firstborn' },
      { word: 'בְּכֹרָה', gloss: 'birthright' },
      { word: 'בִּכּוּרִים', gloss: 'firstfruits' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'bukru',
        note: 'son, firstborn; chiefly in literary texts'
      }
    ]
  },
  {
    id: 'he-zqn',
    lang: 'hebrew',
    letters: ['ז', 'ק', 'נ'],
    gloss: 'be old',
    attested: [
      { word: 'זָקֵן', gloss: 'old; elder' },
      { word: 'זִקְנָה', gloss: 'old age' }
    ],
    homographNote: 'זָקָן beard is written with the same consonants.'
  },
  {
    id: 'he-almn',
    lang: 'hebrew',
    letters: ['א', 'ל', 'מ', 'נ'],
    gloss: 'widow (noun base)',
    attested: [{ word: 'אַלְמָנָה', gloss: 'widow' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'almattu',
        note: 'widow; the ordinary Akkadian word'
      }
    ]
  },
  {
    id: 'he-abd',
    lang: 'hebrew',
    letters: ['ע', 'ב', 'ד'],
    gloss: 'work, serve',
    attested: [
      { word: 'עֶבֶד', gloss: 'servant, slave' },
      { word: 'עָבַד', gloss: 'he worked, served' },
      { word: 'עֲבֹדָה', gloss: 'work, service' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'עבד',
        note: 'servant (Daniel 6:21 עֲבֵד אֱלָהָא); the Aramaic verb עבד means do, make'
      },
      {
        lang: 'osa',
        form: 'ʿbd',
        note: 'in personal names; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-am',
    lang: 'hebrew',
    letters: ['ע', 'מ'],
    gloss: 'people (noun base)',
    attested: [{ word: 'עַם', gloss: 'people' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'עם',
        note: 'Daniel 3:29 כָּל־עַם (every people); plural עַמְמַיָּא Daniel 3:4'
      }
    ],
    homographNote: 'עִם (with) is written with the same consonants.'
  },
  {
    id: 'he-zra',
    lang: 'hebrew',
    letters: ['ז', 'ר', 'ע'],
    gloss: 'sow; seed, offspring',
    attested: [
      { word: 'זֶרַע', gloss: 'seed, offspring' },
      { word: 'זָרַע', gloss: 'he sowed' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'zēru', note: 'seed' },
      {
        lang: 'aramaic',
        form: 'זרע',
        note: 'Daniel 2:43 בִּזְרַע אֲנָשָׁא (with the seed of men)'
      }
    ],
    homographNote:
      'זְרוֹעַ arm is written with the same consonants and is conventionally filed as a separate homograph.'
  },

  // --- Time & numbers ---
  {
    id: 'he-lyl',
    lang: 'hebrew',
    letters: ['ל', 'י', 'ל'],
    gloss: 'night (noun base)',
    attested: [
      { word: 'לַיְלָה', gloss: 'night' },
      { word: 'לֵיל', gloss: 'night of (construct), Exodus 12:42' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ליליא',
        note: 'the night (emphatic form); Daniel 2:19'
      },
      {
        lang: 'akkadian',
        form: 'lilâtu',
        note: 'evening; the ordinary Akkadian word for night is mūšu, and the comparison is one made in the dictionaries'
      }
    ]
  },
  {
    id: 'he-chdsh',
    lang: 'hebrew',
    letters: ['ח', 'ד', 'ש'],
    gloss: 'be new, renew',
    attested: [
      { word: 'חֹדֶשׁ', gloss: 'month, new moon' },
      { word: 'חָדָשׁ', gloss: 'new' },
      { word: 'חַדֵּשׁ', gloss: 'renew (imperative), Psalm 51:12' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חדת',
        note: 'new; Aramaic t corresponds to Hebrew š in this root'
      },
      {
        lang: 'osa',
        form: 'ḥdṯ',
        note: 'renew, restore; common in Sabaic building inscriptions'
      }
    ],
    homographNote:
      'חֹדֶשׁ denotes both the new-moon day and the month reckoned from it (1 Samuel 20:5 מָחָר חֹדֶשׁ, tomorrow is the new moon); the same consonants write חָדָשׁ new.'
  },
  {
    id: 'he-shnh',
    lang: 'hebrew',
    letters: ['ש', 'נ', 'ה'],
    gloss: 'year; repeat, do again',
    attested: [
      { word: 'שָׁנָה', gloss: 'year' },
      { word: 'שְׁנוּ', gloss: 'do it a second time (imperative), 1 Kings 18:34' },
      { word: 'שֵׁנִית', gloss: 'a second time' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šattu', note: 'year' },
      {
        lang: 'aramaic',
        form: 'שנה',
        note: 'year; Elephantine date formulae; Ezra 5:11 שְׁנִין (years)'
      }
    ],
    homographNote:
      'שָׁנָה year and the verb שָׁנָה he repeated are written identically, and the number שְׁנַיִם two shares the consonants שנ; the dictionaries file שְׁנַיִם under שנה by convention.'
  },
  {
    id: 'he-shba',
    lang: 'hebrew',
    letters: ['ש', 'ב', 'ע'],
    gloss: 'seven; week; swear',
    attested: [
      { word: 'שֶׁבַע', gloss: 'seven' },
      { word: 'שָׁבוּעַ', gloss: 'week, period of seven' },
      { word: 'נִשְׁבַּע', gloss: 'he swore' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'sebe', note: 'seven' },
      {
        lang: 'aramaic',
        form: 'שבע',
        note: 'seven; Ezra 7:14 שִׁבְעַת (seven of)'
      },
      { lang: 'osa', form: 's1bʿ', note: 'seven' }
    ],
    homographNote:
      'The consonants שבע write the number שֶׁבַע seven, שָׁבוּעַ week, and the verb נִשְׁבַּע he swore; שָׂבַע he was sated is written with the same consonantal letters, shin/śin being a Masoretic pointing distinction.',
    interpretationNote:
      'The suggestion that swearing (נִשְׁבַּע) is derived from the number seven is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-shbt',
    lang: 'hebrew',
    letters: ['ש', 'ב', 'ת'],
    gloss: 'cease, rest',
    attested: [
      { word: 'שַׁבָּת', gloss: 'sabbath' },
      { word: 'שָׁבַת', gloss: 'he ceased, rested' }
    ],
    interpretationNote:
      'Akkadian šapattu, the mid-month (full-moon) day, is often discussed as a comparison to שַׁבָּת; the comparison is an interpretation, not an established equation.'
  },
  {
    id: 'he-yad',
    lang: 'hebrew',
    letters: ['י', 'ע', 'ד'],
    gloss: 'appoint',
    attested: [
      { word: 'מוֹעֵד', gloss: 'appointed time, season, meeting' },
      { word: 'וְנוֹעַדְתִּי', gloss: 'and I will meet (with you), Exodus 25:22' }
    ]
  },
  {
    id: 'he-alm',
    lang: 'hebrew',
    letters: ['ע', 'ל', 'מ'],
    gloss: 'long duration (noun base); hidden',
    attested: [
      { word: 'עוֹלָם', gloss: 'eternity, long duration' },
      { word: 'נֶעְלַם', gloss: 'it was hidden' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'עלם',
        note: 'eternity; Daniel 2:20 מִן־עָלְמָא וְעַד־עָלְמָא'
      }
    ],
    homographNote:
      'עֶלֶם young man and נֶעְלַם it was hidden are written with the same consonants עלמ as עוֹלָם; any connection between long duration and hiddenness is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-achd',
    lang: 'hebrew',
    letters: ['א', 'ח', 'ד'],
    gloss: 'be one, unite',
    attested: [
      { word: 'אֶחָד', gloss: 'one' },
      { word: 'אַחַת', gloss: 'one (feminine)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חד',
        note: 'one; Daniel 2:31 חַד; the initial aleph of the Hebrew word has no counterpart in the Aramaic form'
      }
    ]
  },
  {
    id: 'he-shlsh',
    lang: 'hebrew',
    letters: ['ש', 'ל', 'ש'],
    gloss: 'three',
    attested: [
      { word: 'שָׁלוֹשׁ', gloss: 'three' },
      { word: 'שְׁלִישִׁי', gloss: 'third' },
      { word: 'שְׁלוֹשִׁים', gloss: 'thirty' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šalāš', note: 'three' },
      {
        lang: 'aramaic',
        form: 'תלת',
        note: 'three; Daniel 6:11 תְּלָתָה; Aramaic t corresponds to Hebrew š in this word'
      }
    ]
  },
  {
    id: 'he-chmsh',
    lang: 'hebrew',
    letters: ['ח', 'מ', 'ש'],
    gloss: 'five',
    attested: [
      { word: 'חָמֵשׁ', gloss: 'five' },
      { word: 'חֲמִישִׁי', gloss: 'fifth' },
      { word: 'חֲמִשִּׁים', gloss: 'fifty' }
    ],
    cognates: [{ lang: 'akkadian', form: 'ḫamiš', note: 'five' }]
  },
  {
    id: 'he-shsh',
    lang: 'hebrew',
    letters: ['ש', 'ש'],
    gloss: 'six (noun base)',
    attested: [
      { word: 'שֵׁשׁ', gloss: 'six' },
      { word: 'שִׁשִּׁי', gloss: 'sixth' },
      { word: 'שִׁשִּׁים', gloss: 'sixty' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šediš', note: 'six' },
      { lang: 'aramaic', form: 'שת', note: 'six; Ezra 6:15 שְׁנַת שֵׁת (the sixth year)' }
    ],
    homographNote:
      'שֵׁשׁ fine linen (as in the tabernacle fabrics) is written and pointed identically with שֵׁשׁ six; the two are distinguished by context.'
  },
  {
    id: 'he-shmn',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'נ'],
    gloss: 'eight / oil, fat — two attested word groups',
    attested: [
      { word: 'שְׁמֹנֶה', gloss: 'eight' },
      { word: 'שֶׁמֶן', gloss: 'oil' },
      { word: 'שָׁמֵן', gloss: 'fat' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šamnu', note: 'oil' },
      { lang: 'akkadian', form: 'samāne', note: 'eight' }
    ],
    homographNote:
      'The consonants שמן write both שְׁמֹנֶה eight and the oil/fat group שֶׁמֶן and שָׁמֵן; the texts state no connection between the two word groups.'
  },
  {
    id: 'he-tsha',
    lang: 'hebrew',
    letters: ['ת', 'ש', 'ע'],
    gloss: 'nine',
    attested: [
      { word: 'תֵּשַׁע', gloss: 'nine' },
      { word: 'תִּשְׁעִים', gloss: 'ninety' }
    ],
    cognates: [{ lang: 'akkadian', form: 'tiše', note: 'nine' }]
  },
  {
    id: 'he-asr-ten',
    lang: 'hebrew',
    letters: ['ע', 'ש', 'ר'],
    gloss: 'ten',
    attested: [
      { word: 'עֶשֶׂר', gloss: 'ten' },
      { word: 'עָשָׂר', gloss: 'ten (in the numbers eleven to nineteen)' },
      { word: 'עֶשְׂרִים', gloss: 'twenty' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'ešer', note: 'ten' },
      {
        lang: 'aramaic',
        form: 'עשר',
        note: 'ten; Daniel 7:7 עֲשַׂר (ten horns)'
      }
    ],
    homographNote:
      'עֹשֶׁר wealth is written with the same consonantal letters; śin/shin is a Masoretic pointing distinction on an identical letter.'
  },

  // --- Animals ---
  {
    id: 'he-ary',
    lang: 'hebrew',
    letters: ['א', 'ר', 'י'],
    gloss: 'lion (noun base)',
    attested: [
      { word: 'אַרְיֵה', gloss: 'lion' },
      { word: 'אֲרִי', gloss: 'lion (shorter form)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'אריה',
        note: 'Daniel 7:4 כְאַרְיֵה (like a lion); the lions of the den in Daniel 6 are אַרְיָוָתָא'
      }
    ]
  },
  {
    id: 'he-sws',
    lang: 'hebrew',
    letters: ['ס', 'ו', 'ס'],
    gloss: 'horse (noun base)',
    attested: [{ word: 'סוּס', gloss: 'horse' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'sīsû',
        note: 'horse; the same wandering culture word'
      }
    ]
  },
  {
    id: 'he-chmr',
    lang: 'hebrew',
    letters: ['ח', 'מ', 'ר'],
    gloss: 'donkey; also clay/mortar חֹמֶר — several attested word groups',
    attested: [
      { word: 'חֲמוֹר', gloss: 'donkey' },
      { word: 'חֹמֶר', gloss: 'clay, mortar' },
      { word: 'חֹמֶר', gloss: 'homer (a dry measure)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'imēru',
        note: 'donkey; Akkadian has no ḥ'
      },
      {
        lang: 'aramaic',
        form: 'חמר',
        note: 'donkey; the ordinary Aramaic word'
      }
    ],
    homographNote:
      'The consonants חמר write several attested words: חֲמוֹר donkey, חֹמֶר clay, and the dry measure חֹמֶר. Biblical Aramaic חֲמַר wine (Daniel 5:1 חַמְרָא) is a different word again.'
  },
  {
    id: 'he-gml',
    lang: 'hebrew',
    letters: ['ג', 'מ', 'ל'],
    gloss: 'camel; deal fully, wean',
    attested: [
      { word: 'גָּמָל', gloss: 'camel' },
      { word: 'גָּמַל', gloss: 'he dealt fully, requited; also weaned' },
      { word: 'גְּמוּל', gloss: 'recompense' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'gammalu',
        note: 'camel, in first-millennium sources'
      },
      {
        lang: 'osa',
        form: 'gml',
        note: 'check corpus records (DASI/CSAI)'
      }
    ],
    homographNote:
      'גָּמָל camel and the verb גָּמַל deal fully, wean are written with the same consonants; the dictionaries treat them as separate word groups.'
  },
  {
    id: 'he-az',
    lang: 'hebrew',
    letters: ['ע', 'ז'],
    gloss: 'goat (noun base)',
    attested: [
      { word: 'עֵז', gloss: 'goat, she-goat' },
      { word: 'עִזִּים', gloss: 'goats' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'enzu', note: 'goat' },
      {
        lang: 'aramaic',
        form: 'עז',
        note: 'Ezra 6:17 צְפִירֵי עִזִּין (he-goats)'
      }
    ],
    homographNote:
      'עַז strong, fierce is written with the same consonants; the dictionaries file it under עזז.'
  },
  {
    id: 'he-ayl',
    lang: 'hebrew',
    letters: ['א', 'י', 'ל'],
    gloss: 'ram; also leader, terebinth — several attested groups',
    attested: [
      { word: 'אַיִל', gloss: 'ram' },
      { word: 'אַיָּל', gloss: 'hart, deer' },
      { word: 'אֵילִים', gloss: 'terebinths (Isaiah 1:29)' }
    ],
    homographNote:
      'The consonants איל write several attested words: אַיִל ram (also leader, as in אֵילֵי הָאָרֶץ Ezekiel 17:13), אַיָּל hart, and אֵילִים terebinths.'
  },
  {
    id: 'he-tspr',
    lang: 'hebrew',
    letters: ['צ', 'פ', 'ר'],
    gloss: 'bird (noun base)',
    attested: [{ word: 'צִפּוֹר', gloss: 'bird' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'iṣṣūru',
        note: 'bird; the standard comparison with Hebrew צִפּוֹר'
      },
      {
        lang: 'aramaic',
        form: 'צפר',
        note: 'צִפֲּרֵי שְׁמַיָּא (the birds of the heavens) in the tree vision of Daniel 4'
      }
    ],
    homographNote:
      'צָפִיר he-goat (Daniel 8:5, Hebrew) is written with the same consonants; the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-ywn',
    lang: 'hebrew',
    letters: ['י', 'ו', 'נ'],
    gloss: 'dove (noun base)',
    attested: [{ word: 'יוֹנָה', gloss: 'dove' }]
  },
  {
    id: 'he-nshr',
    lang: 'hebrew',
    letters: ['נ', 'ש', 'ר'],
    gloss: 'eagle, vulture (noun base)',
    attested: [{ word: 'נֶשֶׁר', gloss: 'eagle, vulture' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'נשר',
        note: 'Daniel 7:4 גַּפִּין דִּי־נְשַׁר (wings of an eagle)'
      }
    ]
  },
  {
    id: 'he-dg',
    lang: 'hebrew',
    letters: ['ד', 'ג'],
    gloss: 'fish (noun base)',
    attested: [
      { word: 'דָּג', gloss: 'fish' },
      { word: 'דָּגָה', gloss: 'fish (collective)' }
    ]
  },
  {
    id: 'he-nchsh',
    lang: 'hebrew',
    letters: ['נ', 'ח', 'ש'],
    gloss: 'snake; practice divination נִחֵשׁ; bronze נְחֹשֶׁת shares the consonants',
    attested: [
      { word: 'נָחָשׁ', gloss: 'snake' },
      { word: 'נִחֵשׁ', gloss: 'he practiced divination' },
      { word: 'נְחֹשֶׁת', gloss: 'bronze, copper' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'נחש',
        note: 'bronze, copper in Biblical Aramaic (Daniel 2:32 דִּי נְחָשׁ); the Aramaic snake word is different'
      }
    ],
    homographNote:
      'The consonants נחש write the snake נָחָשׁ and the verb נִחֵשׁ practice divination; נְחֹשֶׁת bronze shares the same three consonants. The dictionaries treat these as separate word groups.',
    interpretationNote:
      'A historical link between נָחָשׁ snake, נִחֵשׁ divination, and נְחֹשֶׁת bronze has often been suggested; it is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-aqrb',
    lang: 'hebrew',
    letters: ['ע', 'ק', 'ר', 'ב'],
    gloss: 'scorpion (noun base)',
    attested: [{ word: 'עַקְרָב', gloss: 'scorpion' }]
  },
  {
    id: 'he-zab',
    lang: 'hebrew',
    letters: ['ז', 'א', 'ב'],
    gloss: 'wolf (noun base)',
    attested: [{ word: 'זְאֵב', gloss: 'wolf' }]
  },
  {
    id: 'he-db',
    lang: 'hebrew',
    letters: ['ד', 'ב'],
    gloss: 'bear (noun base)',
    attested: [{ word: 'דֹּב', gloss: 'bear' }],
    cognates: [
      { lang: 'akkadian', form: 'dabû', note: 'bear' },
      {
        lang: 'aramaic',
        form: 'דב',
        note: 'Daniel 7:5 דָּמְיָה לְדֹב (resembling a bear)'
      }
    ]
  },
  {
    id: 'he-tsby',
    lang: 'hebrew',
    letters: ['צ', 'ב', 'י'],
    gloss: 'gazelle; beauty, splendor — both attested',
    attested: [
      { word: 'צְבִי', gloss: 'gazelle' },
      { word: 'צְבִי', gloss: 'beauty, splendor (אֶרֶץ הַצְּבִי Daniel 11:16)' },
      { word: 'צְבִיָּה', gloss: 'female gazelle' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'ṣabītu', note: 'gazelle' },
      {
        lang: 'aramaic',
        form: 'טבי',
        note: 'Aramaic ṭ here corresponds to Hebrew ṣ; standard in later Aramaic'
      }
    ],
    homographNote:
      'צְבִי gazelle and צְבִי beauty, splendor are written and pointed identically; the dictionaries treat them as separate words.'
  },
  {
    id: 'he-yal',
    lang: 'hebrew',
    letters: ['י', 'ע', 'ל'],
    gloss: 'ibex (noun base)',
    attested: [
      { word: 'יָעֵל', gloss: 'ibex, wild goat' },
      { word: 'יְעֵלִים', gloss: 'ibexes (Psalm 104:18)' },
      { word: 'יַעֲלָה', gloss: 'female ibex (Proverbs 5:19 יַעֲלַת־חֵן)' }
    ],
    cognates: [
      {
        lang: 'osa',
        form: 'wʿl',
        note: 'ibex, a recurring motif in Sabaic dedicatory contexts; Sabaic w corresponds to Hebrew initial y'
      }
    ],
    homographNote:
      'The verb הוֹעִיל profit, avail is conventionally filed under the same consonants יעל; the animal noun and the verb are treated as separate words.'
  },

  // --- The body ---
  {
    id: 'he-rash',
    lang: 'hebrew',
    letters: ['ר', 'א', 'ש'],
    gloss: 'head (noun base)',
    attested: [
      { word: 'רֹאשׁ', gloss: 'head' },
      { word: 'רִאשׁוֹן', gloss: 'first' },
      { word: 'רֵאשִׁית', gloss: 'beginning, first part' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'rēšu', note: 'head, top' },
      {
        lang: 'aramaic',
        form: 'ראש',
        note: 'Daniel 2:32 רֵאשֵׁהּ (its head)'
      }
    ],
    homographNote:
      'רֹאשׁ poison, gall (Deuteronomy 29:17 רֹאשׁ וְלַעֲנָה gall and wormwood) is written identically; the dictionaries keep it as a separate word.'
  },
  {
    id: 'he-ayn',
    lang: 'hebrew',
    letters: ['ע', 'י', 'נ'],
    gloss: 'eye (noun base)',
    attested: [
      { word: 'עַיִן', gloss: 'eye; spring of water' },
      { word: 'מַעְיָן', gloss: 'spring of water' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'īnu', note: 'eye' },
      {
        lang: 'aramaic',
        form: 'עין',
        note: 'Daniel 4:31 עַיְנַי (my eyes)'
      },
      {
        lang: 'osa',
        form: 'ʿyn',
        note: 'eye and spring; check corpus records (DASI/CSAI)'
      }
    ],
    homographNote:
      'עַיִן eye and עַיִן spring of water are the same written word; both senses are attested.'
  },
  {
    id: 'he-azn',
    lang: 'hebrew',
    letters: ['א', 'ז', 'נ'],
    gloss: 'ear (noun base); give ear',
    attested: [
      { word: 'אֹזֶן', gloss: 'ear' },
      { word: 'הַאֲזִינוּ', gloss: 'give ear! (Deuteronomy 32:1)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'uznu', note: 'ear; by extension attention, understanding' }
    ]
  },
  {
    id: 'he-ph',
    lang: 'hebrew',
    letters: ['פ', 'ה'],
    gloss: 'mouth (noun base)',
    attested: [{ word: 'פֶּה', gloss: 'mouth' }],
    cognates: [
      { lang: 'akkadian', form: 'pû', note: 'mouth' },
      {
        lang: 'aramaic',
        form: 'פם',
        note: 'with m where Hebrew has h; Daniel 6:23 פֻּם אַרְיָוָתָא (the mouth of the lions)'
      }
    ],
    homographNote: 'פֹּה here is written with the same letters.'
  },
  {
    id: 'he-lshn',
    lang: 'hebrew',
    letters: ['ל', 'ש', 'נ'],
    gloss: 'tongue, language (noun base)',
    attested: [{ word: 'לָשׁוֹן', gloss: 'tongue, language' }],
    cognates: [
      { lang: 'akkadian', form: 'lišānu', note: 'tongue, language' },
      {
        lang: 'aramaic',
        form: 'לשן',
        note: 'Daniel 3:4 וְלִשָּׁנַיָּא (and the languages)'
      }
    ]
  },
  {
    id: 'he-shn',
    lang: 'hebrew',
    letters: ['ש', 'נ'],
    gloss: 'tooth (noun base)',
    attested: [
      { word: 'שֵׁן', gloss: 'tooth' },
      { word: 'שִׁנַּיִם', gloss: 'teeth (dual)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šinnu', note: 'tooth' },
      {
        lang: 'aramaic',
        form: 'שן',
        note: 'Daniel 7:7 שִׁנַּיִן דִּי־פַרְזֶל (teeth of iron)'
      }
    ],
    homographNote:
      'The letters שנ also begin שָׁנָה year, שֵׁנָה sleep, and שְׁנַיִם two; the dictionaries file those under separate roots.'
  },
  {
    id: 'he-anp',
    lang: 'hebrew',
    letters: ['א', 'נ', 'פ'],
    gloss: 'nose; anger',
    attested: [
      { word: 'אַף', gloss: 'nose; anger' },
      { word: 'אַפַּיִם', gloss: 'nostrils, face (dual)' },
      { word: 'אָנַפְתָּ', gloss: 'you were angry (Isaiah 12:1)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'appu', note: 'nose, tip' },
      {
        lang: 'aramaic',
        form: 'אנף',
        note: 'face; keeps the n of the root; Daniel 2:46 עַל־אַנְפּוֹהִי (on his face)'
      }
    ],
    homographNote:
      'אַף nose and אַף anger are the same written word, and both senses are attested; the particle אַף (also, indeed) is spelled identically.',
    interpretationNote:
      'Filing אַף under אנפ follows the dual אַפַּיִם, the attested verb (Isaiah 12:1 אָנַפְתָּ), and the Aramaic אֲנַף face; this is the conventional dictionary arrangement.'
  },
  {
    id: 'he-rgl',
    lang: 'hebrew',
    letters: ['ר', 'ג', 'ל'],
    gloss: 'foot (noun base); go about, spy',
    attested: [
      { word: 'רֶגֶל', gloss: 'foot' },
      { word: 'מְרַגְּלִים', gloss: 'spies (Genesis 42:9)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'רגל',
        note: 'Daniel 2:33 רַגְלוֹהִי (its feet)'
      }
    ],
    homographNote:
      'רֶגֶל foot and the verb רִגֵּל (go about as a spy or slanderer) are written with the same consonants; the dictionaries treat the verb as formed from the noun.'
  },
  {
    id: 'he-dm',
    lang: 'hebrew',
    letters: ['ד', 'מ'],
    gloss: 'blood (noun base)',
    attested: [
      { word: 'דָּם', gloss: 'blood' },
      { word: 'דָּמִים', gloss: 'blood, bloodshed (plural)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'dāmu', note: 'blood' },
      {
        lang: 'aramaic',
        form: 'דם',
        note: 'the common Aramaic word for blood; check Imperial Aramaic attestation against TAD'
      }
    ]
  },
  {
    id: 'he-atsm',
    lang: 'hebrew',
    letters: ['ע', 'צ', 'מ'],
    gloss: 'bone; be mighty, numerous',
    attested: [
      { word: 'עֶצֶם', gloss: 'bone' },
      { word: 'עָצוּם', gloss: 'mighty, numerous' }
    ],
    cognates: [{ lang: 'akkadian', form: 'eṣemtu', note: 'bone' }],
    homographNote:
      'עֶצֶם bone and עָצוּם mighty are written from the same consonants עצם; both are attested, and עֶצֶם also serves for the selfsame (בְּעֶצֶם הַיּוֹם הַזֶּה on this very day).'
  },
  {
    id: 'he-bshr',
    lang: 'hebrew',
    letters: ['ב', 'ש', 'ר'],
    gloss: 'flesh; bear tidings',
    attested: [
      { word: 'בָּשָׂר', gloss: 'flesh' },
      { word: 'מְבַשֵּׂר', gloss: 'one bearing tidings (Isaiah 52:7)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'bussuru',
        note: 'to bring news; compared with the Hebrew verb, not with the flesh noun'
      },
      {
        lang: 'aramaic',
        form: 'בשר',
        note: 'flesh; Daniel 7:5 בְּשַׂר שַׂגִּיא (much flesh)'
      }
    ],
    homographNote:
      'בָּשָׂר flesh and the verb בִּשֵּׂר bear tidings are written with the same consonants בשר; both word groups are attested, and the dictionaries keep them as separate roots.'
  },
  {
    id: 'he-awr',
    lang: 'hebrew',
    letters: ['ע', 'ו', 'ר'],
    gloss: 'skin (noun base)',
    attested: [{ word: 'עוֹר', gloss: 'skin, hide' }],
    homographNote:
      'The consonants עור also write עוּר awake (Psalm 57:9 עוּרָה awake!) and עִוֵּר blind; each word group is attested, and the dictionaries keep them under separate roots.'
  },
  {
    id: 'he-qrn',
    lang: 'hebrew',
    letters: ['ק', 'ר', 'נ'],
    gloss: 'horn; ray',
    attested: [
      { word: 'קֶרֶן', gloss: 'horn' },
      { word: 'קָרַן', gloss: 'it sent out rays (Exodus 34:29)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'qarnu', note: 'horn' },
      {
        lang: 'aramaic',
        form: 'קרן',
        note: 'Daniel 7:7 וְקַרְנַיִן עֲשַׂר (and ten horns)'
      }
    ]
  },
  {
    id: 'he-knp',
    lang: 'hebrew',
    letters: ['כ', 'נ', 'פ'],
    gloss: 'wing; corner, extremity',
    attested: [
      { word: 'כָּנָף', gloss: 'wing' },
      { word: 'כַּנְפוֹת הָאָרֶץ', gloss: 'the corners of the earth (Isaiah 11:12)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'kappu',
        note: 'wing; the standard comparison for kanaf'
      }
    ]
  },
  {
    id: 'he-btn',
    lang: 'hebrew',
    letters: ['ב', 'ט', 'נ'],
    gloss: 'belly, womb (noun base)',
    attested: [{ word: 'בֶּטֶן', gloss: 'belly, womb' }],
    homographNote:
      'בָּטְנִים pistachio nuts (Genesis 43:11) is written with the same consonants.'
  },
  {
    id: 'he-brk',
    lang: 'hebrew',
    letters: ['ב', 'ר', 'כ'],
    gloss: 'kneel; bless',
    attested: [
      { word: 'בֶּרֶךְ', gloss: 'knee' },
      { word: 'בֵּרַךְ', gloss: 'he blessed' },
      { word: 'בְּרָכָה', gloss: 'blessing' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'birku', note: 'knee' },
      {
        lang: 'aramaic',
        form: 'ברך',
        note: 'Daniel 6:11 בָּרֵךְ עַל־בִּרְכוֹהִי (kneeling on his knees); Daniel 2:20 מְבָרַךְ (blessed)'
      }
    ],
    homographNote:
      'בֶּרֶךְ knee and the bless word group (בֵּרַךְ, בְּרָכָה) are written with the same consonants ברך; בְּרֵכָה pool is spelled with the same letters as בְּרָכָה.',
    interpretationNote:
      'The old suggestion that bless grew out of kneel (kneeling to receive a blessing) is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-shar',
    lang: 'hebrew',
    letters: ['ש', 'ע', 'ר'],
    gloss: 'hair; also gate and barley written with the same consonants',
    attested: [
      { word: 'שֵׂעָר', gloss: 'hair' },
      { word: 'שַׁעַר', gloss: 'gate' },
      { word: 'שְׂעֹרָה', gloss: 'barley' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šārtu', note: 'hair of the body and head' },
      {
        lang: 'aramaic',
        form: 'שער',
        note: 'Daniel 7:9 וּשְׂעַר רֵאשֵׁהּ (the hair of his head)'
      }
    ],
    homographNote:
      'שֵׂעָר hair, שַׁעַר gate, and שְׂעֹרָה barley are all written with the same consonants שער; śin/shin is a Masoretic pointing distinction on an identical consonantal letter. שָׂעִיר he-goat (the hairy one) is filed with the hair group in the dictionaries.'
  },

  // --- Food & colors ---
  // --- Food & drink ---
  {
    id: 'he-yyn',
    lang: 'hebrew',
    letters: ['י', 'י', 'נ'],
    gloss: 'wine (noun base)',
    attested: [{ word: 'יַיִן', gloss: 'wine' }],
    interpretationNote:
      'יַיִן is widely held to be a wandering culture word connected with Hittite wiyana- and Greek oinos; the connection is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-shkr',
    lang: 'hebrew',
    letters: ['ש', 'כ', 'ר'],
    gloss: 'be drunk; strong drink',
    attested: [
      { word: 'שֵׁכָר', gloss: 'strong drink, beer' },
      { word: 'שִׁכּוֹר', gloss: 'drunken' },
      { word: 'וַיִּשְׁכָּר', gloss: 'and he became drunk (Genesis 9:21)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šikaru', note: 'beer; the textbook cognate' }
    ],
    homographNote:
      'שָׂכָר wages is written with the same consonantal letters; śin/shin is a Masoretic pointing distinction on an identical letter.'
  },
  {
    id: 'he-dbsh',
    lang: 'hebrew',
    letters: ['ד', 'ב', 'ש'],
    gloss: 'honey (noun base)',
    attested: [{ word: 'דְּבַשׁ', gloss: 'honey' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'dišpu',
        note: 'honey, syrup; the standard comparison with Hebrew dvash'
      }
    ]
  },
  {
    id: 'he-chlb',
    lang: 'hebrew',
    letters: ['ח', 'ל', 'ב'],
    gloss: 'milk (noun base)',
    attested: [{ word: 'חָלָב', gloss: 'milk' }],
    homographNote:
      'חֵלֶב fat is written with the same consonants חלב; the distinction is Masoretic pointing only.'
  },
  {
    id: 'he-chth',
    lang: 'hebrew',
    letters: ['ח', 'ט', 'ה'],
    gloss: 'wheat (noun base)',
    attested: [
      { word: 'חִטָּה', gloss: 'wheat' },
      { word: 'חִטִּים', gloss: 'wheat (plural)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חנטין',
        note: 'wheat (plural), with n where Hebrew has doubled ṭ; Ezra 6:9 חִנְטִין'
      }
    ]
  },
  {
    id: 'he-gpn',
    lang: 'hebrew',
    letters: ['ג', 'פ', 'נ'],
    gloss: 'vine (noun base)',
    attested: [{ word: 'גֶּפֶן', gloss: 'vine, grapevine' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'gapnu / gupnu',
        note: 'bush, tree trunk; the comparison with Hebrew gefen is one made in the dictionaries'
      }
    ]
  },
  {
    id: 'he-tan',
    lang: 'hebrew',
    letters: ['ת', 'א', 'נ'],
    gloss: 'fig tree (noun base)',
    attested: [
      { word: 'תְּאֵנָה', gloss: 'fig tree, fig' },
      { word: 'תְּאֵנִים', gloss: 'figs (plural)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'tittu',
        note: 'fig; the standard comparison with Hebrew teenah'
      }
    ]
  },
  {
    id: 'he-zyt',
    lang: 'hebrew',
    letters: ['ז', 'י', 'ת'],
    gloss: 'olive (noun base)',
    attested: [
      { word: 'זַיִת', gloss: 'olive, olive tree' },
      { word: 'זֵיתִים', gloss: 'olive trees (plural)' }
    ]
  },
  {
    id: 'he-rmn',
    lang: 'hebrew',
    letters: ['ר', 'מ', 'נ'],
    gloss: 'pomegranate (noun base)',
    attested: [{ word: 'רִמּוֹן', gloss: 'pomegranate' }],
    homographNote:
      'רִמּוֹן also occurs as a divine name and in place names (2 Kings 5:18 בֵּית רִמּוֹן).',
    interpretationNote:
      'Akkadian nurmû pomegranate is sometimes compared with רִמּוֹן; the relationship is debated and is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-mlch',
    lang: 'hebrew',
    letters: ['מ', 'ל', 'ח'],
    gloss: 'salt (noun base)',
    attested: [
      { word: 'מֶלַח', gloss: 'salt' },
      { word: 'תִּמְלָח', gloss: 'you shall salt (Leviticus 2:13)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'מלח',
        note: 'salt; Ezra 4:14 מְלַח הֵיכְלָא (the salt of the palace); Ezra 6:9'
      }
    ],
    homographNote:
      'מַלָּח sailor (Jonah 1:5 הַמַּלָּחִים) is written with the same consonants; the dictionaries treat it as a separate word, compared with Akkadian malāḫu.'
  },

  // --- Colors ---
  {
    id: 'he-lbn',
    lang: 'hebrew',
    letters: ['ל', 'ב', 'נ'],
    gloss: 'be white',
    attested: [
      { word: 'לָבָן', gloss: 'white' },
      { word: 'יַלְבִּינוּ', gloss: 'they shall be white (Isaiah 1:18)' }
    ],
    homographNote:
      'לְבֵנָה brick, לְבוֹנָה frankincense, and לְבָנָה moon are written with the same consonants לבנ; the dictionaries treat them as separate words. לָבָן is also the personal name Laban.'
  },
  {
    id: 'he-shchr',
    lang: 'hebrew',
    letters: ['ש', 'ח', 'ר'],
    gloss: 'be black',
    attested: [
      { word: 'שָׁחֹר', gloss: 'black' },
      { word: 'שְׁחַרְחֹרֶת', gloss: 'swarthy, blackish (Song of Songs 1:6)' }
    ],
    homographNote:
      'שַׁחַר dawn is written with the same consonants שחר; the dictionaries keep black and dawn as separate roots.'
  },
  {
    id: 'he-adm',
    lang: 'hebrew',
    letters: ['א', 'ד', 'מ'],
    gloss: 'be red',
    attested: [
      { word: 'אָדֹם', gloss: 'red' },
      { word: 'אֲדָמָה', gloss: 'ground, soil' },
      { word: 'אָדָם', gloss: 'man, mankind; the name Adam' },
      { word: 'אֲדַמְדָּם', gloss: 'reddish (Leviticus 13:49)' }
    ],
    homographNote:
      'The consonants אדמ write אָדֹם red, אָדָם man, and אֲדָמָה ground; the dictionaries file these as separate word groups.',
    interpretationNote:
      'Any historical chain linking red, ground, and man (red earth) is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-yrq',
    lang: 'hebrew',
    letters: ['י', 'ר', 'ק'],
    gloss: 'be green; herbs יֶרֶק',
    attested: [
      { word: 'יֶרֶק', gloss: 'green plants, herbage (Genesis 1:30 יֶרֶק עֵשֶׂב)' },
      { word: 'יָרָק', gloss: 'garden vegetables (1 Kings 21:2 גַן־יָרָק)' },
      { word: 'יְרַקְרַק', gloss: 'greenish (Leviticus 13:49)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'arqu',
        note: 'green-yellow; Old Babylonian warqum, with w where Hebrew has y'
      }
    ]
  },
  {
    id: 'he-argmn',
    lang: 'hebrew',
    letters: ['א', 'ר', 'ג', 'מ', 'נ'],
    gloss: 'purple wool (noun base)',
    attested: [{ word: 'אַרְגָּמָן', gloss: 'purple, purple wool' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'argamannu',
        note: 'purple wool; a parallel form of the same culture word, not a demonstrated ancestor'
      },
      {
        lang: 'aramaic',
        form: 'ארגון',
        note: 'purple; Daniel 5:7 אַרְגְּוָנָא, with w where Hebrew has m'
      }
    ],
    interpretationNote:
      'אַרְגָּמָן is generally taken as a culture word or loanword of debated origin (Anatolian sources are often suggested), not a native Semitic triliteral; any derivation is interpretation.'
  },
  {
    id: 'he-shny',
    lang: 'hebrew',
    letters: ['ש', 'נ', 'י'],
    gloss: 'crimson (noun base)',
    attested: [
      { word: 'שָׁנִי', gloss: 'crimson, scarlet' },
      { word: 'תּוֹלַעַת שָׁנִי', gloss: 'scarlet stuff (Exodus 25:4)' }
    ],
    homographNote:
      'שֵׁנִי second is written with the same letters שני; the dictionaries treat crimson and second as separate words, filing שֵׁנִי under שנה.'
  },
  {
    id: 'he-tklt',
    lang: 'hebrew',
    letters: ['ת', 'כ', 'ל', 'ת'],
    gloss: 'blue-purple dye (noun base)',
    attested: [{ word: 'תְּכֵלֶת', gloss: 'blue, blue-purple wool (Exodus 25:4)' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'takiltu',
        note: 'blue-purple wool; the standard parallel of the same culture word'
      }
    ],
    interpretationNote:
      'A culture word of the dye trade; the direction of any borrowing between Hebrew תְּכֵלֶת and Akkadian takiltu is debated, and any derivation is interpretation.'
  },

  // --- Nature & the heavens ---
  {
    id: 'he-yrch',
    lang: 'hebrew',
    letters: ['י', 'ר', 'ח'],
    gloss: 'moon (noun base); month יֶרַח',
    attested: [
      { word: 'יָרֵחַ', gloss: 'moon' },
      { word: 'יֶרַח', gloss: 'month (1 Kings 6:37 בְּיֶרַח זִו)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'arḫu',
        note: 'moon (crescent), month; Old Babylonian warḫum'
      },
      {
        lang: 'aramaic',
        form: 'ירח',
        note: 'month; Ezra 6:15 לִירַח אֲדָר (in the month Adar)'
      },
      {
        lang: 'osa',
        form: 'wrḫ',
        note: 'month, in Sabaic date formulas; w where Hebrew has initial y; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-kkb',
    lang: 'hebrew',
    letters: ['כ', 'כ', 'ב'],
    gloss: 'star (noun base)',
    attested: [{ word: 'כּוֹכָב', gloss: 'star' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'kakkabu',
        note: 'star; the textbook cognate'
      },
      {
        lang: 'aramaic',
        form: 'כוכב',
        note: 'the ordinary Aramaic word; not attested in Biblical Aramaic; check Imperial Aramaic attestation against TAD'
      }
    ]
  },
  {
    id: 'he-shmym',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'י', 'מ'],
    gloss: 'heavens (noun base)',
    attested: [{ word: 'שָׁמַיִם', gloss: 'heavens, sky' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'šamû',
        note: 'heaven(s); plural in form, like the Hebrew word'
      },
      {
        lang: 'aramaic',
        form: 'שמיא',
        note: 'the heavens (emphatic form); Daniel 2:28 בִּשְׁמַיָּא'
      }
    ]
  },
  {
    id: 'he-arts',
    lang: 'hebrew',
    letters: ['א', 'ר', 'צ'],
    gloss: 'earth, land (noun base)',
    attested: [
      { word: 'אֶרֶץ', gloss: 'earth, land' },
      { word: 'אֲרָצוֹת', gloss: 'lands' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'erṣetu',
        note: 'earth, land, netherworld; the textbook cognate'
      },
      {
        lang: 'aramaic',
        form: 'ארע',
        note: 'Daniel 2:35 אַרְעָא; Hebrew ṣ answers to Aramaic ʿ here, and the older spelling אַרְקָא with q stands beside אַרְעָא in Jeremiah 10:11'
      },
      {
        lang: 'osa',
        form: 'ʾrḍ',
        note: 'earth, land; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-ym',
    lang: 'hebrew',
    letters: ['י', 'מ'],
    gloss: 'sea (noun base)',
    attested: [
      { word: 'יָם', gloss: 'sea' },
      { word: 'יַמִּים', gloss: 'seas' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ימא',
        note: 'the sea (emphatic form); Daniel 7:2 יַמָּא רַבָּא (the great sea)'
      }
    ],
    homographNote:
      'יָם also serves for west, the seaward direction, in Hebrew orientation (לִפְאַת־יָם, on the west side, Exodus 27:12); this is the same word used directionally.'
  },
  {
    id: 'he-nhr',
    lang: 'hebrew',
    letters: ['נ', 'ה', 'ר'],
    gloss: 'river; flow',
    attested: [
      { word: 'נָהָר', gloss: 'river' },
      { word: 'וְנָהֲרוּ', gloss: 'and they will stream (to it), Isaiah 2:2' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'nāru', note: 'river' },
      {
        lang: 'aramaic',
        form: 'נהר',
        note: 'Daniel 7:10 נְהַר דִּי־נוּר (a river of fire); the province name עֲבַר־נַהֲרָה in Ezra'
      }
    ],
    homographNote:
      'The consonants נהר also write an attested shine group: נְהָרָה daylight (Job 3:4) and וְנָהַרְתְּ you will be radiant (Isaiah 60:5); the dictionaries keep flow and shine as separate word groups.'
  },
  {
    id: 'he-hr',
    lang: 'hebrew',
    letters: ['ה', 'ר'],
    gloss: 'mountain (noun base)',
    attested: [
      { word: 'הַר', gloss: 'mountain' },
      { word: 'הָרִים', gloss: 'mountains' }
    ]
  },
  {
    id: 'he-abn',
    lang: 'hebrew',
    letters: ['א', 'ב', 'נ'],
    gloss: 'stone (noun base)',
    attested: [
      { word: 'אֶבֶן', gloss: 'stone' },
      { word: 'אֲבָנִים', gloss: 'stones' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'abnu', note: 'stone; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'אבן',
        note: 'Daniel 2:34 אֶבֶן (the stone cut out not by human hands)'
      }
    ]
  },
  {
    id: 'he-apr',
    lang: 'hebrew',
    letters: ['ע', 'פ', 'ר'],
    gloss: 'dust (noun base)',
    attested: [{ word: 'עָפָר', gloss: 'dust' }],
    cognates: [
      { lang: 'akkadian', form: 'eperu', note: 'dust, earth, soil' }
    ],
    homographNote:
      'עֹפֶר fawn (Song of Songs 2:9) is written with the same consonants; the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-ash',
    lang: 'hebrew',
    letters: ['א', 'ש'],
    gloss: 'fire (noun base)',
    attested: [{ word: 'אֵשׁ', gloss: 'fire' }],
    cognates: [
      { lang: 'akkadian', form: 'išātu', note: 'fire' },
      {
        lang: 'aramaic',
        form: 'אשא',
        note: 'Daniel 7:11 לִיקֵדַת אֶשָּׁא (to the burning of fire); the ordinary Biblical Aramaic word for fire is נוּר'
      }
    ]
  },
  {
    id: 'he-rwch',
    lang: 'hebrew',
    letters: ['ר', 'ו', 'ח'],
    gloss: 'wind, breath, spirit',
    attested: [
      { word: 'רוּחַ', gloss: 'wind, breath, spirit' },
      { word: 'הָרְוָחָה', gloss: 'the relief, respite (Exodus 8:11)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'רוח',
        note: 'Daniel 2:35 רוּחָא; Daniel 7:2 אַרְבַּע רוּחֵי שְׁמַיָּא (the four winds of heaven)'
      }
    ]
  },
  {
    id: 'he-mtr',
    lang: 'hebrew',
    letters: ['מ', 'ט', 'ר'],
    gloss: 'rain',
    attested: [
      { word: 'מָטָר', gloss: 'rain' },
      { word: 'הִמְטִיר', gloss: 'he caused it to rain (Genesis 19:24)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'מטר',
        note: 'the common Aramaic word; not attested in Biblical Aramaic; check Imperial Aramaic attestation against TAD'
      }
    ]
  },
  {
    id: 'he-ann',
    lang: 'hebrew',
    letters: ['ע', 'נ', 'נ'],
    gloss: 'cloud',
    attested: [{ word: 'עָנָן', gloss: 'cloud' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ענן',
        note: 'Daniel 7:13 עִם־עֲנָנֵי שְׁמַיָּא (with the clouds of heaven)'
      }
    ],
    homographNote:
      'A verb of soothsaying is written with the same consonants: מְעוֹנֵן soothsayer (Deuteronomy 18:10); the dictionaries keep cloud and soothsay as separate word groups.'
  },
  {
    id: 'he-ats',
    lang: 'hebrew',
    letters: ['ע', 'צ'],
    gloss: 'tree, wood (noun base)',
    attested: [
      { word: 'עֵץ', gloss: 'tree, wood' },
      { word: 'עֵצִים', gloss: 'trees; pieces of wood' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'iṣu', note: 'tree, wood' },
      {
        lang: 'aramaic',
        form: 'אע',
        note: 'wood, timber; Daniel 5:4 אָעָא; Ezra 5:8; Hebrew ṣ answers to Aramaic ʿ here, as in אֶרֶץ beside אֲרַע'
      }
    ]
  },
  {
    id: 'he-shdh',
    lang: 'hebrew',
    letters: ['ש', 'ד', 'ה'],
    gloss: 'field (noun base)',
    attested: [{ word: 'שָׂדֶה', gloss: 'field' }]
  },
  {
    id: 'he-gnn',
    lang: 'hebrew',
    letters: ['ג', 'נ', 'נ'],
    gloss: 'enclose, protect; garden',
    attested: [
      { word: 'גַּן', gloss: 'garden' },
      { word: 'גִּנָּה', gloss: 'garden (Esther 7:7 גִּנַּת הַבִּיתָן)' },
      { word: 'וְגַנּוֹתִי', gloss: 'and I will defend (this city), Isaiah 37:35' }
    ],
    interpretationNote:
      'The dictionaries file גַּן garden under גנן enclose — a garden as an enclosed plot; the derivation is a conventional arrangement, an interpretation not provable from the texts alone.'
  },
  {
    id: 'he-dbr',
    lang: 'hebrew',
    letters: ['ד', 'ב', 'ר'],
    gloss: 'speak; word; wilderness — several attested word groups on one consonant set',
    attested: [
      { word: 'דָּבָר', gloss: 'word, matter' },
      { word: 'דִּבֶּר', gloss: 'he spoke' },
      { word: 'מִדְבָּר', gloss: 'wilderness, desert' },
      { word: 'דֶּבֶר', gloss: 'pestilence' }
    ],
    homographNote:
      'The consonants דבר write several attested word groups: the speech group דָּבָר and דִּבֶּר, the noun מִדְבָּר wilderness, and דֶּבֶר pestilence.',
    interpretationNote:
      'Derivational stories connecting מִדְבָּר wilderness to the speech group, or to a separate sense drive (pasture land as the place flocks are driven), are interpretations, not provable from the texts alone.'
  },
  {
    id: 'he-awr-light',
    lang: 'hebrew',
    letters: ['א', 'ו', 'ר'],
    gloss: 'light, shine',
    attested: [
      { word: 'אוֹר', gloss: 'light' },
      { word: 'מְאֹרֹת', gloss: 'lights, luminaries (Genesis 1:14)' },
      { word: 'אוֹרָה', gloss: 'light, gladness (Esther 8:16)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'urru',
        note: 'daytime, daylight; the comparison with the Hebrew group is one made in the dictionaries'
      }
    ],
    homographNote:
      'אוּר flame, fire (Isaiah 50:11 בְּאוּר) is written with the same consonants; the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-chshk',
    lang: 'hebrew',
    letters: ['ח', 'ש', 'כ'],
    gloss: 'be dark',
    attested: [
      { word: 'חֹשֶׁךְ', gloss: 'darkness' },
      { word: 'חָשַׁךְ', gloss: 'it grew dark (Isaiah 5:30)' },
      { word: 'חֲשֵׁכָה', gloss: 'darkness (Genesis 15:12)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חשוך',
        note: 'Daniel 2:22 יָדַע מָה בַחֲשׁוֹכָא (he knows what is in the darkness)'
      }
    ]
  },

  // --- Field, harvest & household ---
  {
    id: 'he-shlch',
    lang: 'hebrew',
    letters: ['ש', 'ל', 'ח'],
    gloss: 'send, stretch out',
    attested: [
      { word: 'שָׁלַח', gloss: 'he sent' },
      { word: 'שֻׁלְחָן', gloss: 'table' }
    ],
    homographNote:
      'שֻׁלְחָן table is filed under these consonants by dictionary convention (so BDB); deriving the noun from the verb send is a lexicographic filing, not a fact of the texts.'
  },
  {
    id: 'he-chrsh',
    lang: 'hebrew',
    letters: ['ח', 'ר', 'ש'],
    gloss: 'plow, engrave; also be silent; craftsman חָרָשׁ — several attested word groups',
    attested: [
      { word: 'חָרַשׁ', gloss: 'he plowed, engraved' },
      { word: 'חָרִישׁ', gloss: 'plowing, plowing season (Exodus 34:21)' },
      { word: 'חָרָשׁ', gloss: 'craftsman' },
      { word: 'הֶחֱרִישׁ', gloss: 'he kept silent' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'erēšu',
        note: 'to cultivate, plant; the standard comparison with the plowing group — check CAD'
      }
    ],
    homographNote:
      'The consonants חרש write several attested word groups: plow, engrave; the craftsman noun חָרָשׁ; be silent (הֶחֱרִישׁ); and חֵרֵשׁ deaf. חֶרֶשׂ potsherd differs only in the Masoretic point on the ש.'
  },
  {
    id: 'he-qtsr',
    lang: 'hebrew',
    letters: ['ק', 'צ', 'ר'],
    gloss: 'reap, harvest; also be short — both attested',
    attested: [
      { word: 'קָצַר', gloss: 'he reaped' },
      { word: 'קָצִיר', gloss: 'harvest, harvest season' },
      { word: 'קָצְרָה', gloss: 'it is too short (Isaiah 50:2)' }
    ],
    homographNote:
      'The reap group (קָצַר, קָצִיר) and the be-short group (קָצְרָה) are written with the same consonants קצר; the dictionaries keep them as separate roots.'
  },
  {
    id: 'he-grn',
    lang: 'hebrew',
    letters: ['ג', 'ר', 'נ'],
    gloss: 'threshing floor (noun base)',
    attested: [{ word: 'גֹּרֶן', gloss: 'threshing floor' }]
  },
  {
    id: 'he-krm',
    lang: 'hebrew',
    letters: ['כ', 'ר', 'מ'],
    gloss: 'vineyard (noun base)',
    attested: [
      { word: 'כֶּרֶם', gloss: 'vineyard' },
      { word: 'כֹּרְמִים', gloss: 'vinedressers (2 Kings 25:12)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'כרם',
        note: 'the common Aramaic word; check Imperial Aramaic attestation against TAD'
      },
      {
        lang: 'osa',
        form: 'krm',
        note: 'vineyard; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-tsan',
    lang: 'hebrew',
    letters: ['צ', 'א', 'נ'],
    gloss: 'flock (noun base)',
    attested: [{ word: 'צֹאן', gloss: 'flock, sheep and goats' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ṣēnu',
        note: 'flock of sheep and goats; the textbook comparison'
      },
      {
        lang: 'aramaic',
        form: 'ען',
        note: 'with ʿayin where Hebrew has tsade, a regular correspondence; check attestation against TAD'
      }
    ]
  },
  {
    id: 'he-prh',
    lang: 'hebrew',
    letters: ['פ', 'ר', 'ה'],
    gloss: 'bear fruit, be fruitful',
    attested: [
      { word: 'פְּרִי', gloss: 'fruit' },
      { word: 'פְּרוּ', gloss: 'be fruitful (imperative), Genesis 1:28' },
      { word: 'יִפְרֶה', gloss: 'it shall bear fruit (Isaiah 11:1)' }
    ],
    homographNote:
      'פָּרָה cow is written with the same consonants; the dictionaries keep it as a separate word.'
  },
  {
    id: 'he-anp-branch',
    lang: 'hebrew',
    letters: ['ע', 'נ', 'פ'],
    gloss: 'branch (noun base)',
    attested: [{ word: 'עָנָף', gloss: 'branch' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ענף',
        note: 'Daniel 4:9 וּבְעַנְפוֹהִי (and in its branches), in the tree vision'
      }
    ]
  },
  {
    id: 'he-shrsh',
    lang: 'hebrew',
    letters: ['ש', 'ר', 'ש'],
    gloss: 'root; uproot',
    attested: [
      { word: 'שֹׁרֶשׁ', gloss: 'root' },
      { word: 'וְשֵׁרֶשְׁךָ', gloss: 'and he will uproot you (Psalm 52:7)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'šuršu',
        note: 'root; the textbook comparison'
      },
      {
        lang: 'aramaic',
        form: 'שרש',
        note: 'Daniel 4:12 עִקַּר שָׁרְשׁוֹהִי (the stump of its roots)'
      }
    ]
  },
  {
    id: 'he-ashb',
    lang: 'hebrew',
    letters: ['ע', 'ש', 'ב'],
    gloss: 'herbage (noun base)',
    attested: [{ word: 'עֵשֶׂב', gloss: 'grass, herbage' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'עשב',
        note: 'Daniel 4:30 עִשְׂבָּא כְתוֹרִין (grass like oxen)'
      }
    ]
  },
  {
    id: 'he-qwts',
    lang: 'hebrew',
    letters: ['ק', 'ו', 'צ'],
    gloss: 'thorn (noun base)',
    attested: [
      { word: 'קוֹץ', gloss: 'thorn (Genesis 3:18 קוֹץ וְדַרְדַּר, thorns and thistles)' }
    ],
    homographNote:
      'The verb קוּץ loathe, dread (Genesis 27:46 קַצְתִּי, I loathe) is written with the same consonants; the dictionaries keep it as a separate root.'
  },
  {
    id: 'he-nr',
    lang: 'hebrew',
    letters: ['נ', 'ר'],
    gloss: 'lamp (noun base)',
    attested: [{ word: 'נֵר', gloss: 'lamp' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'nūru',
        note: 'light; the nwr root, standardly compared with Hebrew ner'
      },
      {
        lang: 'aramaic',
        form: 'נור',
        note: 'fire; Daniel 3:6 אַתּוּן נוּרָא יָקִדְתָּא (the burning fiery furnace)'
      }
    ]
  },
  {
    id: 'he-kws',
    lang: 'hebrew',
    letters: ['כ', 'ו', 'ס'],
    gloss: 'cup (noun base)',
    attested: [{ word: 'כּוֹס', gloss: 'cup' }],
    cognates: [
      { lang: 'akkadian', form: 'kāsu', note: 'cup; the textbook comparison' },
      {
        lang: 'aramaic',
        form: 'כס',
        note: 'the common Aramaic word; check Imperial Aramaic attestation against TAD'
      }
    ],
    homographNote:
      'כּוֹס also names a bird, the little owl (Psalm 102:7 כְּכוֹס חֳרָבוֹת); the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-nth',
    lang: 'hebrew',
    letters: ['נ', 'ט', 'ה'],
    gloss: 'stretch out, incline',
    attested: [
      { word: 'נָטָה', gloss: 'he stretched out' },
      { word: 'מִטָּה', gloss: 'bed' },
      { word: 'מַטֶּה', gloss: 'staff, rod; tribe' }
    ],
    homographNote:
      'מִטָּה bed and מַטֶּה staff, tribe are written with the same consonants מטה and are distinguished only by the Masoretic pointing; both are nouns with preformative mem filed under נטה.'
  },
  {
    id: 'he-lwch',
    lang: 'hebrew',
    letters: ['ל', 'ו', 'ח'],
    gloss: 'tablet (noun base)',
    attested: [
      { word: 'לוּחַ', gloss: 'tablet, board' },
      { word: 'לֻחֹת', gloss: 'tablets (of stone), Exodus 31:18' }
    ]
  },
  {
    id: 'he-spr',
    lang: 'hebrew',
    letters: ['ס', 'פ', 'ר'],
    gloss: 'count, recount; document',
    attested: [
      { word: 'סֵפֶר', gloss: 'scroll, book, document' },
      { word: 'סָפַר', gloss: 'he counted' },
      { word: 'סֹפֵר', gloss: 'scribe' },
      { word: 'מִסְפָּר', gloss: 'number' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'ספר',
        note: 'Ezra 4:15 סְפַר דָּכְרָנַיָּא (the book of the records); the ordinary Elephantine word for deed, document'
      }
    ],
    homographNote:
      'The consonants ספר carry both the counting group (סָפַר, מִסְפָּר) and the writing group (סֵפֶר, סֹפֵר); all are attested, and the dictionaries file them together under one root.'
  },
  {
    id: 'he-tba',
    lang: 'hebrew',
    letters: ['ט', 'ב', 'ע'],
    gloss: 'sink; signet',
    attested: [
      { word: 'וַיִּטְבַּע', gloss: 'and he sank (in the mire), Jeremiah 38:6' },
      { word: 'טָבְעוּ', gloss: 'they sank (Lamentations 2:9)' },
      { word: 'טַבַּעַת', gloss: 'ring, signet ring' }
    ],
    interpretationNote:
      'Deriving טַבַּעַת signet ring from טָבַע sink (the seal pressed into the clay) is an interpretation; an Egyptian source (ḏbꜥt, seal) has also been proposed. The dictionaries file the noun under טבע by convention.'
  },

  // --- Tools, materials & buildings ---
  // --- Tools & materials ---
  {
    id: 'he-chrb',
    lang: 'hebrew',
    letters: ['ח', 'ר', 'ב'],
    gloss: 'sword; also be dry, desolate — several attested groups',
    attested: [
      { word: 'חֶרֶב', gloss: 'sword' },
      { word: 'חֹרֶב', gloss: 'drought, heat (Genesis 31:40)' },
      { word: 'חָרְבָּה', gloss: 'ruin, waste place' }
    ],
    homographNote:
      'The consonants חרב write חֶרֶב sword and a dry/desolate word group (חֹרֶב drought, חָרְבָּה ruin); the dictionaries treat these as separate word groups.'
  },
  {
    id: 'he-qsht',
    lang: 'hebrew',
    letters: ['ק', 'ש', 'ת'],
    gloss: 'bow (noun base)',
    attested: [
      { word: 'קֶשֶׁת', gloss: 'bow' },
      { word: 'קַשָּׁת', gloss: 'bowman (Genesis 21:20)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'qaštu', note: 'bow; the textbook cognate' }
    ]
  },
  {
    id: 'he-chtsts',
    lang: 'hebrew',
    letters: ['ח', 'צ', 'צ'],
    gloss: 'arrow (conventionally filed with חצץ divide)',
    attested: [
      { word: 'חֵץ', gloss: 'arrow' },
      { word: 'חָצָץ', gloss: 'gravel (Proverbs 20:17)' }
    ],
    homographNote:
      'חֵץ arrow is conventionally filed under the doubled root חצצ; חָצָץ gravel is written with the same consonants, and the dictionaries treat the word groups separately.'
  },
  {
    id: 'he-klh',
    lang: 'hebrew',
    letters: ['כ', 'ל', 'ה'],
    gloss: 'be complete, finished',
    attested: [
      { word: 'כָּלָה', gloss: 'it was finished, at an end' },
      { word: 'כְּלִי', gloss: 'vessel, implement' },
      { word: 'כָּלִיל', gloss: 'entire, whole (offering)' }
    ],
    interpretationNote:
      'כְּלִי vessel is filed under כלה be complete by dictionary convention; the derivation is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-chtm',
    lang: 'hebrew',
    letters: ['ח', 'ת', 'מ'],
    gloss: 'seal',
    attested: [
      { word: 'חוֹתָם', gloss: 'seal, signet' },
      { word: 'חֲתֹם', gloss: 'seal up (imperative, Daniel 12:4)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חתם',
        note: 'Daniel 6:18 וְחַתְמַהּ (and the king sealed it with his signet)'
      }
    ],
    interpretationNote:
      'The relationship between Hebrew חוֹתָם and Egyptian ḫtm seal is much discussed, often as a borrowing from Egyptian; the direction and route of the relationship are interpretation.'
  },
  {
    id: 'he-ksp',
    lang: 'hebrew',
    letters: ['כ', 'ס', 'פ'],
    gloss: 'silver; long for נִכְסַף — both attested',
    attested: [
      { word: 'כֶּסֶף', gloss: 'silver, money' },
      { word: 'נִכְסַפְתָּה', gloss: 'you longed (Genesis 31:30)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'kaspu', note: 'silver; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'כסף',
        note: 'money and silver throughout Elephantine legal documents; Daniel 2:32'
      }
    ],
    homographNote:
      'The consonants כספ write both כֶּסֶף silver, money and the verb group long for (Genesis 31:30 נִכְסֹף נִכְסַפְתָּה); the dictionaries treat them as separate word groups.'
  },
  {
    id: 'he-zhb',
    lang: 'hebrew',
    letters: ['ז', 'ה', 'ב'],
    gloss: 'gold (noun base)',
    attested: [{ word: 'זָהָב', gloss: 'gold' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'דהב',
        note: 'Daniel 2:32 דִּי־דְהַב (of gold); Aramaic d corresponds to Hebrew z in this word, a regular correspondence like Hebrew shor beside Aramaic tor (ox)'
      },
      {
        lang: 'osa',
        form: 'ḏhb',
        note: 'in Sabaic dedicatory formulas, where the sense gold or bronze is debated; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-brzl',
    lang: 'hebrew',
    letters: ['ב', 'ר', 'ז', 'ל'],
    gloss: 'iron (noun base)',
    attested: [{ word: 'בַּרְזֶל', gloss: 'iron' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'parzillu',
        note: 'iron; the parallel form of the same culture-word'
      },
      {
        lang: 'aramaic',
        form: 'פרזל',
        note: 'Daniel 2:33 דִּי פַרְזֶל (of iron); Daniel 7:7 שִׁנַּיִן דִּי־פַרְזֶל (teeth of iron)'
      }
    ],
    interpretationNote:
      'בַּרְזֶל is generally taken as a culture-word of debated, probably non-Semitic origin; Akkadian parzillu is the parallel form, and any account of the route the word traveled is interpretation.'
  },

  // --- Buildings & the city ---
  {
    id: 'he-ayr',
    lang: 'hebrew',
    letters: ['ע', 'י', 'ר'],
    gloss: 'city (noun base)',
    attested: [
      { word: 'עִיר', gloss: 'city' },
      { word: 'עָרִים', gloss: 'cities (the plural in use)' }
    ],
    homographNote:
      'עַיִר young donkey is written with the same consonants; the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-chwm',
    lang: 'hebrew',
    letters: ['ח', 'ו', 'מ'],
    gloss: 'city wall (noun base)',
    attested: [{ word: 'חוֹמָה', gloss: 'wall, city wall' }]
  },
  {
    id: 'he-dlt',
    lang: 'hebrew',
    letters: ['ד', 'ל', 'ת'],
    gloss: 'door (noun base)',
    attested: [
      { word: 'דֶּלֶת', gloss: 'door' },
      { word: 'דְּלָתַיִם', gloss: 'double doors (dual)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'daltu', note: 'door; the textbook cognate' }
    ]
  },
  {
    id: 'he-ahl',
    lang: 'hebrew',
    letters: ['א', 'ה', 'ל'],
    gloss: 'tent (noun base)',
    attested: [
      { word: 'אֹהֶל', gloss: 'tent' },
      { word: 'וַיֶּאֱהַל', gloss: 'and he pitched his tent (Genesis 13:12)' }
    ]
  },
  {
    id: 'he-drk',
    lang: 'hebrew',
    letters: ['ד', 'ר', 'כ'],
    gloss: 'tread, march; way',
    attested: [
      { word: 'דֶּרֶךְ', gloss: 'way, road' },
      { word: 'דָּרַךְ', gloss: 'he trod, marched (Numbers 24:17)' }
    ]
  },
  {
    id: 'he-bar-well',
    lang: 'hebrew',
    letters: ['ב', 'א', 'ר'],
    gloss: 'well; make plain בֵּאֵר — both attested',
    attested: [
      { word: 'בְּאֵר', gloss: 'well (of water)' },
      { word: 'בֵּאֵר', gloss: 'he made plain, expounded (Deuteronomy 1:5)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'būrtu', note: 'well, cistern; check CAD' }
    ],
    homographNote:
      'The consonants באר write both בְּאֵר well and the verb בֵּאֵר make plain (Deuteronomy 1:5); the dictionaries treat them as separate word groups.'
  },
  {
    id: 'he-hykl',
    lang: 'hebrew',
    letters: ['ה', 'י', 'כ', 'ל'],
    gloss: 'palace, temple (noun base)',
    attested: [{ word: 'הֵיכָל', gloss: 'palace, temple' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ekallu',
        note: 'palace; from Sumerian e2-gal (big house)'
      },
      {
        lang: 'aramaic',
        form: 'היכלא',
        note: 'the palace (emphatic form); Daniel 5:5 הֵיכְלָא; Ezra 4:14'
      }
    ],
    interpretationNote:
      'הֵיכָל is by standard doctrine a loanword from Sumerian e2-gal (big house) transmitted through Akkadian ekallu; the four-letter filing rather than a triliteral root reflects this loan history.'
  },

  // --- Everyday verbs ---
  {
    id: 'he-akl',
    lang: 'hebrew',
    letters: ['א', 'כ', 'ל'],
    gloss: 'eat',
    attested: [
      { word: 'אָכַל', gloss: 'he ate' },
      { word: 'אֹכֶל', gloss: 'food' },
      { word: 'מַאֲכָל', gloss: 'food (Genesis 2:9)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'akālu', note: 'to eat; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'אכל',
        note: 'Daniel 7:7 אָכְלָה (it devoured, of the fourth beast)'
      }
    ]
  },
  {
    id: 'he-shth',
    lang: 'hebrew',
    letters: ['ש', 'ת', 'ה'],
    gloss: 'drink',
    attested: [
      { word: 'שָׁתָה', gloss: 'he drank' },
      { word: 'מִשְׁתֶּה', gloss: 'feast, drinking banquet' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šatû', note: 'to drink; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'שתה',
        note: 'Daniel 5:1 חַמְרָא שָׁתֵה (Belshazzar drinking wine)'
      }
    ]
  },
  {
    id: 'he-hlk',
    lang: 'hebrew',
    letters: ['ה', 'ל', 'כ'],
    gloss: 'go, walk',
    attested: [
      { word: 'הָלַךְ', gloss: 'he went' },
      { word: 'הִתְהַלֵּךְ', gloss: 'he walked about' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'alāku',
        note: 'to go; the standard comparison with הלך'
      },
      {
        lang: 'aramaic',
        form: 'הלך',
        note: 'Daniel 3:25 מַהְלְכִין (walking, in the furnace); the ordinary Aramaic go-verb is אזל, a different lexeme'
      }
    ]
  },
  {
    id: 'he-bwa',
    lang: 'hebrew',
    letters: ['ב', 'ו', 'א'],
    gloss: 'come, enter',
    attested: [
      { word: 'בָּא', gloss: 'he came' },
      { word: 'הֵבִיא', gloss: 'he brought (hiphil)' },
      { word: 'מְבוֹא', gloss: 'entrance of (construct; מְבוֹא הָעִיר, Judges 1:24)' }
    ]
  },
  {
    id: 'he-rah',
    lang: 'hebrew',
    letters: ['ר', 'א', 'ה'],
    gloss: 'see',
    attested: [
      { word: 'רָאָה', gloss: 'he saw' },
      { word: 'מַרְאֶה', gloss: 'appearance, vision' },
      { word: 'רֹאֶה', gloss: 'seer (1 Samuel 9:9)' }
    ]
  },
  {
    id: 'he-shma',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'ע'],
    gloss: 'hear, listen',
    attested: [
      { word: 'שָׁמַע', gloss: 'he heard' },
      { word: 'שְׁמַע', gloss: 'hear! (the imperative that opens the Shema, Deuteronomy 6:4)' },
      { word: 'שְׁמוּעָה', gloss: 'report, tidings' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'šemû', note: 'to hear; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'שמע',
        note: 'Daniel 5:14 שִׁמְעֵת (I have heard)'
      }
    ]
  },
  {
    id: 'he-ntn',
    lang: 'hebrew',
    letters: ['נ', 'ת', 'נ'],
    gloss: 'give',
    attested: [
      { word: 'נָתַן', gloss: 'he gave' },
      { word: 'מַתָּנָה', gloss: 'gift' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'nadānu',
        note: 'to give; the textbook cognate, with d where Hebrew has t'
      },
      {
        lang: 'aramaic',
        form: 'נתן',
        note: 'supplies the imperfect of the Aramaic give-verb, whose perfect in use is יְהַב, a different lexeme'
      }
    ]
  },
  {
    id: 'he-lqch',
    lang: 'hebrew',
    letters: ['ל', 'ק', 'ח'],
    gloss: 'take',
    attested: [
      { word: 'לָקַח', gloss: 'he took' },
      { word: 'לֶקַח', gloss: 'teaching (Proverbs 1:5)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'leqû', note: 'to take; the textbook cognate' }
    ]
  },
  {
    id: 'he-yda',
    lang: 'hebrew',
    letters: ['י', 'ד', 'ע'],
    gloss: 'know',
    attested: [
      { word: 'יָדַע', gloss: 'he knew' },
      { word: 'דַּעַת', gloss: 'knowledge' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'idû',
        note: 'to know; cited as idû or edû in the dictionaries'
      },
      {
        lang: 'aramaic',
        form: 'ידע',
        note: 'Daniel 2:22 יָדַע מָה בַחֲשׁוֹכָא (he knows what is in the darkness)'
      }
    ]
  },
  {
    id: 'he-ahb',
    lang: 'hebrew',
    letters: ['א', 'ה', 'ב'],
    gloss: 'love',
    attested: [
      { word: 'אָהַב', gloss: 'he loved' },
      { word: 'אַהֲבָה', gloss: 'love' }
    ]
  },
  {
    id: 'he-yra',
    lang: 'hebrew',
    letters: ['י', 'ר', 'א'],
    gloss: 'fear',
    attested: [
      { word: 'יָרֵא', gloss: 'he feared; fearing' },
      { word: 'יִרְאָה', gloss: 'fear' },
      { word: 'נוֹרָא', gloss: 'fearsome, awesome' }
    ]
  },
  {
    id: 'he-mwt',
    lang: 'hebrew',
    letters: ['מ', 'ו', 'ת'],
    gloss: 'die',
    attested: [
      { word: 'מֵת', gloss: 'he died' },
      { word: 'מָוֶת', gloss: 'death' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'mâtu', note: 'to die; the textbook cognate' },
      {
        lang: 'aramaic',
        form: 'מות',
        note: 'Ezra 7:26 הֵן לְמוֹת (whether for death), among the penalties of the decree'
      }
    ]
  },
  {
    id: 'he-chyh',
    lang: 'hebrew',
    letters: ['ח', 'י', 'ה'],
    gloss: 'live',
    attested: [
      { word: 'חָיָה', gloss: 'he lived' },
      { word: 'חַי', gloss: 'living, alive' },
      { word: 'חַיִּים', gloss: 'life' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חיה',
        note: 'Daniel 2:4 מַלְכָּא לְעָלְמִין חֱיִי (O king, live forever)'
      }
    ]
  },
  {
    id: 'he-yshb',
    lang: 'hebrew',
    letters: ['י', 'ש', 'ב'],
    gloss: 'sit, dwell',
    attested: [
      { word: 'יָשַׁב', gloss: 'he sat, dwelt' },
      { word: 'מוֹשָׁב', gloss: 'dwelling place, seat' },
      { word: 'תּוֹשָׁב', gloss: 'sojourner' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ašābu',
        note: 'to sit, dwell; Old Babylonian wašābum'
      },
      {
        lang: 'aramaic',
        form: 'יתב',
        note: 'with t where Hebrew has š; Daniel 7:9 יְתִב (the Ancient of Days took his seat)'
      }
    ]
  },
  {
    id: 'he-amd',
    lang: 'hebrew',
    letters: ['ע', 'מ', 'ד'],
    gloss: 'stand',
    attested: [
      { word: 'עָמַד', gloss: 'he stood' },
      { word: 'עַמּוּד', gloss: 'pillar, column' }
    ]
  },
  {
    id: 'he-amr',
    lang: 'hebrew',
    letters: ['א', 'מ', 'ר'],
    gloss: 'say',
    attested: [
      { word: 'אָמַר', gloss: 'he said' },
      { word: 'וַיֹּאמֶר', gloss: 'and he said' },
      { word: 'מַאֲמַר', gloss: 'command of (construct), Esther 1:15' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'אמר',
        note: 'the answered-and-said formula (עָנֵה... וְאָמַר) throughout Daniel'
      },
      {
        lang: 'akkadian',
        form: 'amāru',
        note: 'means to see, not to say; the dictionaries note the same consonants with a different sense'
      }
    ]
  },
  {
    id: 'he-ashh-make',
    lang: 'hebrew',
    letters: ['ע', 'ש', 'ה'],
    gloss: 'make, do',
    attested: [
      { word: 'עָשָׂה', gloss: 'he made, did' },
      { word: 'מַעֲשֶׂה', gloss: 'work, deed' }
    ]
  },

  // --- Verbs of worship & rule; places & directions ---
  // --- Verbs of worship & rule ---
  {
    id: 'he-arr',
    lang: 'hebrew',
    letters: ['א', 'ר', 'ר'],
    gloss: 'curse',
    attested: [
      { word: 'אָרוּר', gloss: 'cursed (Genesis 3:14 אָרוּר אַתָּה)' },
      { word: 'אֵרְרָהּ', gloss: 'he cursed it (Genesis 5:29, of the ground)' },
      { word: 'מְאֵרָה', gloss: 'curse (Malachi 2:2)' }
    ],
    cognates: [
      { lang: 'akkadian', form: 'arāru', note: 'to curse; the textbook cognate' }
    ]
  },
  {
    id: 'he-shyr',
    lang: 'hebrew',
    letters: ['ש', 'י', 'ר'],
    gloss: 'sing',
    attested: [
      { word: 'שִׁיר', gloss: 'song' },
      { word: 'שִׁירָה', gloss: 'song (Exodus 15:1 אֶת־הַשִּׁירָה הַזֹּאת)' },
      { word: 'וַתָּשַׁר', gloss: 'and she sang (Judges 5:1)' },
      { word: 'שָׁרִים', gloss: 'singers (2 Samuel 19:36 שָׁרִים וְשָׁרוֹת)' }
    ]
  },
  {
    id: 'he-pll',
    lang: 'hebrew',
    letters: ['פ', 'ל', 'ל'],
    gloss: 'intervene, arbitrate; pray (hitpael)',
    attested: [
      { word: 'הִתְפַּלֵּל', gloss: 'pray (hitpael; 1 Samuel 12:19 הִתְפַּלֵּל בְּעַד, pray for)' },
      { word: 'תְּפִלָּה', gloss: 'prayer' },
      { word: 'פִלָּלְתִּי', gloss: 'I had (not) expected, judged (Genesis 48:11)' }
    ],
    interpretationNote:
      'How the hitpael הִתְפַּלֵּל pray relates to the qal and piel senses judge, intervene is much discussed; any derivation of pray from arbitrate is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-rchts',
    lang: 'hebrew',
    letters: ['ר', 'ח', 'צ'],
    gloss: 'wash, bathe',
    attested: [
      { word: 'רָחַץ', gloss: 'he washed (Isaiah 4:4 אִם רָחַץ אֲדֹנָי)' },
      { word: 'רַחְצָה', gloss: 'washing (Song of Songs 4:2)' }
    ],
    interpretationNote:
      'Biblical Aramaic רחץ means trust (Daniel 3:28 הִתְרְחִצוּ, they trusted); whether the Aramaic trust verb and the Hebrew wash verb are historically the same root is not established.'
  },
  {
    id: 'he-mshch',
    lang: 'hebrew',
    letters: ['מ', 'ש', 'ח'],
    gloss: 'anoint',
    attested: [
      { word: 'מָשַׁח', gloss: 'he anointed (Isaiah 61:1 יַעַן מָשַׁח יְהוָה אֹתִי)' },
      { word: 'מָשִׁיחַ', gloss: 'anointed one (1 Samuel 24:7 מְשִׁיחַ יְהוָה)' },
      { word: 'מִשְׁחָה', gloss: 'anointing (Exodus 29:7 שֶׁמֶן הַמִּשְׁחָה, the anointing oil)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'משח',
        note: 'oil, the noun of the same root (Ezra 6:9 וּמְשַׁח); the anointing verb itself is not attested in Biblical Aramaic'
      }
    ]
  },
  {
    id: 'he-gal',
    lang: 'hebrew',
    letters: ['ג', 'א', 'ל'],
    gloss: 'redeem, act as kinsman',
    attested: [
      { word: 'גָּאַל', gloss: 'he redeemed (Isaiah 44:23 כִּי־גָאַל יְהוָה יַעֲקֹב)' },
      { word: 'גֹּאֵל', gloss: 'redeemer, kinsman-redeemer (Ruth 4:14)' },
      { word: 'גְּאֻלָּה', gloss: 'right of redemption (Leviticus 25:24)' }
    ],
    homographNote:
      'A second word group גאל means defile (Isaiah 59:3 נְגֹאֲלוּ, defiled with blood); the dictionaries keep redeem and defile as separate roots written with the same consonants.'
  },
  {
    id: 'he-zkr',
    lang: 'hebrew',
    letters: ['ז', 'כ', 'ר'],
    gloss: 'remember',
    attested: [
      { word: 'זָכַר', gloss: 'he remembered (Psalm 98:3 זָכַר חַסְדּוֹ)' },
      { word: 'זִכָּרוֹן', gloss: 'memorial, remembrance (Exodus 12:14)' },
      { word: 'זֵכֶר', gloss: 'remembrance' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'zakāru',
        note: 'to speak, name, invoke; the formal cognate — the ordinary Akkadian verb for remember is ḫasāsu'
      },
      {
        lang: 'aramaic',
        form: 'דכרן',
        note: 'record, memorandum, with d for Hebrew z; Ezra 6:2 דִּכְרוֹנָה (a record)'
      }
    ],
    homographNote:
      'זָכָר male is written with the same consonants זכר; the dictionaries treat remember and male as separate word groups.'
  },
  {
    id: 'he-shkch',
    lang: 'hebrew',
    letters: ['ש', 'כ', 'ח'],
    gloss: 'forget',
    attested: [
      { word: 'שָׁכַח', gloss: 'he forgot (Psalm 10:11 שָׁכַח אֵל)' },
      { word: 'פֶּן־תִּשְׁכַּח', gloss: 'lest you forget (Deuteronomy 8:11)' }
    ],
    interpretationNote:
      'Biblical Aramaic שכח means find (Daniel 2:25 הַשְׁכַּחַת, I have found); whether the Aramaic find verb and the Hebrew forget verb are historically the same root is not established.'
  },
  {
    id: 'he-bqsh',
    lang: 'hebrew',
    letters: ['ב', 'ק', 'ש'],
    gloss: 'seek (piel)',
    attested: [
      { word: 'בִּקֵּשׁ', gloss: 'he sought (Ecclesiastes 12:10 בִּקֵּשׁ קֹהֶלֶת)' },
      { word: 'בַּקָּשָׁה', gloss: 'request (Esther 5:7 שְׁאֵלָתִי וּבַקָּשָׁתִי)' }
    ]
  },
  {
    id: 'he-mtsa',
    lang: 'hebrew',
    letters: ['מ', 'צ', 'א'],
    gloss: 'find',
    attested: [
      { word: 'מָצָא', gloss: 'he found (Proverbs 18:22 מָצָא אִשָּׁה מָצָא טוֹב)' },
      { word: 'נִמְצָא', gloss: 'it was found (1 Samuel 13:22)' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'מטא',
        note: 'to reach, arrive (Daniel 4:8 יִמְטֵא, it reached to heaven); Aramaic ṭ answers to Hebrew ṣ here, and the sense is reach rather than find'
      }
    ]
  },

  // --- Places & directions ---
  {
    id: 'he-qdm',
    lang: 'hebrew',
    letters: ['ק', 'ד', 'מ'],
    gloss: 'be in front; east, ancient',
    attested: [
      { word: 'קֶדֶם', gloss: 'east; ancient time' },
      { word: 'קָדִים', gloss: 'east wind (Genesis 41:6)' },
      { word: 'קִדַּמְתִּי', gloss: 'I came before, anticipated (Psalm 119:147)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'qudmu',
        note: 'front, former time; chiefly in literary texts'
      },
      {
        lang: 'aramaic',
        form: 'קדם',
        note: 'before, in front of; Daniel 6:11 קֳדָם אֱלָהֵהּ (before his God)'
      }
    ],
    interpretationNote:
      'קדם yields both in front and east; the usual explanation, that the east is what lies before one facing the sunrise, is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-tspn',
    lang: 'hebrew',
    letters: ['צ', 'פ', 'נ'],
    gloss: 'hide, store up; north',
    attested: [
      { word: 'צָפוֹן', gloss: 'north' },
      { word: 'צָפֹנָה', gloss: 'northward (Genesis 13:14)' },
      { word: 'צָפַנְתִּי', gloss: 'I have stored up (Psalm 119:11)' }
    ],
    homographNote:
      'צָפוֹן north and the verb צָפַן hide, store up are written with the same consonants צפנ and are conventionally filed together.',
    interpretationNote:
      'Explanations of the north as the hidden, sunless quarter, or via the mountain Zaphon of Canaanite tradition, are interpretations, not provable from the texts alone.'
  },
  {
    id: 'he-ngb',
    lang: 'hebrew',
    letters: ['נ', 'ג', 'ב'],
    gloss: 'south, dry region (noun base)',
    attested: [
      { word: 'נֶגֶב', gloss: 'south; the Negev, the dry country south of Judah' },
      { word: 'וָנֶגְבָּה', gloss: 'and southward (Genesis 13:14)' }
    ],
    interpretationNote:
      'The dictionaries connect נֶגֶב with an Aramaic verb meaning be dry (the Negev as the parched land); the explanation is an interpretation, not provable from the Hebrew texts alone.'
  },
  {
    id: 'he-ymn',
    lang: 'hebrew',
    letters: ['י', 'מ', 'נ'],
    gloss: 'right hand, right side',
    attested: [
      { word: 'יָמִין', gloss: 'right hand, right side' },
      { word: 'הַיְמָנִי', gloss: 'the right-hand (pillar) (1 Kings 7:21)' },
      { word: 'וְאֵימִנָה', gloss: 'then I will go to the right (Genesis 13:9)' },
      { word: 'תֵּימָן', gloss: 'south, the south country (Habakkuk 3:3)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'imnu / imittu',
        note: 'right hand, right side'
      },
      {
        lang: 'osa',
        form: 'ymnt',
        note: 'Yamnat, the south country (the later Yemen), in royal titulature; check corpus records (DASI/CSAI)'
      }
    ],
    interpretationNote:
      'תֵּימָן south as the right-hand side presumes orientation toward the sunrise; the explanation is standard but is an interpretation.'
  },
  {
    id: 'he-shmal',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'א', 'ל'],
    gloss: 'left (noun base)',
    attested: [
      { word: 'שְׂמֹאל', gloss: 'left hand, left side' },
      { word: 'וְאַשְׂמְאִילָה', gloss: 'then I will go to the left (Genesis 13:9)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'šumēlu',
        note: 'left hand, left side; the textbook cognate'
      }
    ]
  },
  {
    id: 'he-gbl',
    lang: 'hebrew',
    letters: ['ג', 'ב', 'ל'],
    gloss: 'bound; border',
    attested: [
      { word: 'גְּבוּל', gloss: 'border, territory' },
      { word: 'וְהִגְבַּלְתָּ', gloss: 'and you shall set bounds (Exodus 19:12)' }
    ],
    homographNote:
      'גְּבַל Gebal (Byblos; Ezekiel 27:9 זִקְנֵי גְבַל) and the region גְּבָל (Psalm 83:8) are written with the same consonants.'
  },
  {
    id: 'he-amq',
    lang: 'hebrew',
    letters: ['ע', 'מ', 'ק'],
    gloss: 'be deep; valley',
    attested: [
      { word: 'עֵמֶק', gloss: 'valley' },
      { word: 'עָמֹק', gloss: 'deep (Leviticus 13:3)' },
      { word: 'עָמְקוּ', gloss: 'they are deep (Psalm 92:6 מְאֹד עָמְקוּ מַחְשְׁבֹתֶיךָ)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'emqu',
        note: 'wise — deep in wisdom, as the dictionaries put it; the formal cognate, whose meaning diverges from the Hebrew'
      },
      {
        lang: 'aramaic',
        form: 'עמיק',
        note: 'deep; Daniel 2:22 עַמִּיקָתָא (the deep things)'
      }
    ]
  },

  // --- Faith, law & kingship; people & society ---
  {
    id: 'he-bryt',
    lang: 'hebrew',
    letters: ['ב', 'ר', 'י', 'ת'],
    gloss: 'covenant (noun base)',
    attested: [{ word: 'בְּרִית', gloss: 'covenant' }],
    interpretationNote:
      'The derivation of בְּרִית is debated in the dictionaries; the idiom כָּרַת בְּרִית, to cut a covenant (Genesis 15:18), is attested usage whatever the etymology.'
  },
  {
    id: 'he-zbch',
    lang: 'hebrew',
    letters: ['ז', 'ב', 'ח'],
    gloss: 'slaughter for sacrifice',
    attested: [
      { word: 'זֶבַח', gloss: 'sacrifice' },
      { word: 'זָבַח', gloss: 'he sacrificed' },
      { word: 'מִזְבֵּחַ', gloss: 'altar' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'דבח',
        note: 'with d where Hebrew has z (as דהב gold beside זהב); Ezra 6:3 דִּבְחִין (sacrifices), Ezra 7:17 מַדְבְּחָה (altar)'
      },
      {
        lang: 'osa',
        form: 'ḏbḥ',
        note: 'sacrifice; attested in Sabaic inscriptions'
      }
    ]
  },
  {
    id: 'he-khn',
    lang: 'hebrew',
    letters: ['כ', 'ה', 'נ'],
    gloss: 'serve as priest',
    attested: [
      { word: 'כֹּהֵן', gloss: 'priest' },
      { word: 'כִּהֵן', gloss: 'he served as priest' },
      { word: 'כְּהֻנָּה', gloss: 'priesthood' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'כהן',
        note: 'the priests (כָּהֲנַיָּא) in the Aramaic of Ezra; the Elephantine petitions concern the priests of YHW'
      }
    ]
  },
  {
    id: 'he-nba',
    lang: 'hebrew',
    letters: ['נ', 'ב', 'א'],
    gloss: 'prophesy',
    attested: [
      { word: 'נָבִיא', gloss: 'prophet' },
      { word: 'נִבָּא', gloss: 'he prophesied' },
      { word: 'נְבוּאָה', gloss: 'prophecy' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'נביא',
        note: 'Ezra 5:1, Haggai the prophet; the same verse uses the verb (he prophesied)'
      }
    ],
    interpretationNote:
      'The comparison with Akkadian nabû, to call, name — the נָבִיא as one called — is discussed in the dictionaries; it is an interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-yrh',
    lang: 'hebrew',
    letters: ['י', 'ר', 'ה'],
    gloss: 'throw, shoot; direct, instruct — several attested groups',
    attested: [
      { word: 'תּוֹרָה', gloss: 'law, instruction' },
      { word: 'יָרָה', gloss: 'he cast (Exodus 15:4, he cast into the sea)' },
      { word: 'מוֹרֶה', gloss: 'teacher' }
    ],
    homographNote:
      'The consonants ירה write the throwing and shooting verb and the hiphil הוֹרָה, direct, instruct, under which the dictionaries file תּוֹרָה and מוֹרֶה; מוֹרֶה also names the early rain (Joel 2:23).'
  },
  {
    id: 'he-qdsh',
    lang: 'hebrew',
    letters: ['ק', 'ד', 'ש'],
    gloss: 'be holy',
    attested: [
      { word: 'קָדוֹשׁ', gloss: 'holy' },
      { word: 'קֹדֶשׁ', gloss: 'holiness' },
      { word: 'מִקְדָּשׁ', gloss: 'sanctuary' },
      { word: 'קִדֵּשׁ', gloss: 'he sanctified' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'קדיש',
        note: 'holy; Daniel 4:10 עִיר וְקַדִּישׁ (a watcher and a holy one)'
      },
      {
        lang: 'akkadian',
        form: 'qadāšu',
        note: 'to become clean, pure; the comparison made in the dictionaries — check CAD'
      }
    ]
  },
  {
    id: 'he-ksa',
    lang: 'hebrew',
    letters: ['כ', 'ס', 'א'],
    gloss: 'throne (noun base)',
    attested: [{ word: 'כִּסֵּא', gloss: 'throne' }],
    cognates: [
      {
        lang: 'akkadian',
        form: 'kussû',
        note: 'throne, chair; a loanword from Sumerian gu-za'
      },
      {
        lang: 'aramaic',
        form: 'כרסא',
        note: 'Daniel 7:9 כָרְסָוָן (thrones were set); with r before the s'
      }
    ],
    interpretationNote:
      'Standard doctrine treats כִּסֵּא as part of a loan history running from Sumerian gu-za through Akkadian kussû; the chain is stated as loan history resting on attested words in each language, and כִּסֵּא is a noun base, not a verbal root.'
  },
  {
    id: 'he-shpt',
    lang: 'hebrew',
    letters: ['ש', 'פ', 'ט'],
    gloss: 'judge, govern',
    attested: [
      { word: 'שָׁפַט', gloss: 'he judged' },
      { word: 'שֹׁפֵט', gloss: 'judge' },
      { word: 'מִשְׁפָּט', gloss: 'judgment, justice' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'šapāṭu',
        note: 'to exercise authority, issue rulings; at Mari the šāpiṭum is a governing official; the standard comparison'
      },
      {
        lang: 'aramaic',
        form: 'שפטין',
        note: 'judges, magistrates; Ezra 7:25'
      }
    ]
  },
  {
    id: 'he-npsh',
    lang: 'hebrew',
    letters: ['נ', 'פ', 'ש'],
    gloss: 'breathe, refresh oneself; soul',
    attested: [
      { word: 'נֶפֶשׁ', gloss: 'soul, life, self' },
      { word: 'וַיִּנָּפַשׁ', gloss: 'and he was refreshed (Exodus 31:17)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'napištu',
        note: 'life, breath, throat; the textbook cognate'
      },
      {
        lang: 'osa',
        form: 'nfs1',
        note: 'soul, person; also a funerary monument; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-chta',
    lang: 'hebrew',
    letters: ['ח', 'ט', 'א'],
    gloss: 'miss a mark, sin',
    attested: [
      { word: 'חָטָא', gloss: 'he sinned' },
      { word: 'חֵטְא', gloss: 'sin' },
      { word: 'חַטָּאת', gloss: 'sin; sin offering' },
      { word: 'יַחֲטִא', gloss: 'he misses the mark (Judges 20:16, of slingers)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ḫaṭû',
        note: 'to sin, do wrong; the textbook cognate'
      },
      {
        lang: 'aramaic',
        form: 'חטי',
        note: 'sin; Daniel 4:24, break off your sins by righteousness'
      }
    ]
  },
  {
    id: 'he-rah-shepherd',
    lang: 'hebrew',
    letters: ['ר', 'ע', 'ה'],
    gloss: 'pasture, tend, shepherd',
    attested: [
      { word: 'רָעָה', gloss: 'he pastured' },
      { word: 'רֹעֶה', gloss: 'shepherd' },
      { word: 'מִרְעֶה', gloss: 'pasture' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'rēʾû',
        note: 'shepherd; the textbook cognate, with the verb reʾû, to pasture, beside it'
      }
    ],
    homographNote:
      'רֵעַ friend, companion, neighbor is conventionally filed as a second group under the same consonants רעה; both word groups are attested.'
  },
  {
    id: 'he-ayb',
    lang: 'hebrew',
    letters: ['א', 'י', 'ב'],
    gloss: 'be hostile',
    attested: [
      { word: 'אֹיֵב', gloss: 'enemy' },
      { word: 'אֵיבָה', gloss: 'enmity (Genesis 3:15)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ayyābu',
        note: 'enemy; the textbook cognate; the ordinary Akkadian word nakru stands beside it'
      }
    ]
  },
  {
    id: 'he-gwr',
    lang: 'hebrew',
    letters: ['ג', 'ו', 'ר'],
    gloss: 'sojourn',
    attested: [
      { word: 'גֵּר', gloss: 'sojourner, stranger' },
      { word: 'גָּר', gloss: 'he sojourned' },
      { word: 'מְגוּרֵי', gloss: 'sojournings of (construct; אֶרֶץ מְגוּרֵי אָבִיו, Genesis 37:1)' }
    ],
    homographNote:
      'גּוּר lion cub (Genesis 49:9 גּוּר אַרְיֵה) and מָגוֹר dread (Jeremiah 20:10 מָגוֹר מִסָּבִיב) are separate attested word groups on the same consonants.'
  },
  {
    id: 'he-awd',
    lang: 'hebrew',
    letters: ['ע', 'ו', 'ד'],
    gloss: 'repeat, do again; bear witness',
    attested: [
      { word: 'עֵד', gloss: 'witness' },
      { word: 'עֵדוּת', gloss: 'testimony' },
      { word: 'עוֹד', gloss: 'again, still' }
    ],
    interpretationNote:
      'The dictionaries file עֵד witness and עוֹד again together under עוד by convention; the semantic bridge between repetition and testimony is the arrangement of the lexicographers, not a claim of the texts.'
  },
  {
    id: 'he-lak',
    lang: 'hebrew',
    letters: ['ל', 'א', 'כ'],
    gloss: 'send (attested only in derived nouns)',
    attested: [
      { word: 'מַלְאָךְ', gloss: 'messenger, angel' },
      { word: 'מְלָאכָה', gloss: 'work, mission' }
    ],
    interpretationNote:
      'No verb of this root is attested in Hebrew; the nouns מַלְאָךְ and מְלָאכָה are the attested material, and the send gloss comes from the comparative dictionaries, where the verb is attested in other Semitic languages.'
  },
  {
    id: 'he-gbr',
    lang: 'hebrew',
    letters: ['ג', 'ב', 'ר'],
    gloss: 'be strong, prevail',
    attested: [
      { word: 'גָּבַר', gloss: 'he prevailed' },
      { word: 'גִּבּוֹר', gloss: 'warrior, mighty man' },
      { word: 'גֶּבֶר', gloss: 'man' },
      { word: 'גְּבוּרָה', gloss: 'might' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'גבר',
        note: 'man; very common at Elephantine; Daniel 2:25 גְּבַר (a man)'
      }
    ]
  },
  {
    id: 'he-qhl',
    lang: 'hebrew',
    letters: ['ק', 'ה', 'ל'],
    gloss: 'assemble',
    attested: [
      { word: 'קָהָל', gloss: 'assembly, congregation' },
      { word: 'וַיַּקְהֵל', gloss: 'and he assembled (Exodus 35:1)' },
      { word: 'קֹהֶלֶת', gloss: 'Qoheleth (Ecclesiastes 1:1), conventionally connected with the assembly' }
    ]
  },

  // --- Emotions, virtues & qualities ---
  {
    id: 'he-shmch',
    lang: 'hebrew',
    letters: ['ש', 'מ', 'ח'],
    gloss: 'rejoice',
    attested: [
      { word: 'שָׂמַח', gloss: 'he rejoiced' },
      { word: 'שִׂמְחָה', gloss: 'joy, gladness' },
      { word: 'שָׂמֵחַ', gloss: 'glad, joyful' }
    ]
  },
  {
    id: 'he-kbd',
    lang: 'hebrew',
    letters: ['כ', 'ב', 'ד'],
    gloss: 'be heavy; be honored',
    attested: [
      { word: 'כָּבֵד', gloss: 'heavy' },
      { word: 'כָּבוֹד', gloss: 'glory, honor' },
      { word: 'כָּבֵד', gloss: 'liver' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'kabātu',
        note: 'to be heavy; also to be honored — the same weight-to-honor pairing'
      }
    ],
    homographNote:
      'כָּבֵד heavy and כָּבֵד liver are written and pointed identically; both are attested, and the dictionaries keep the liver noun as its own entry.'
  },
  {
    id: 'he-chkm',
    lang: 'hebrew',
    letters: ['ח', 'כ', 'מ'],
    gloss: 'be wise',
    attested: [
      { word: 'חָכָם', gloss: 'wise' },
      { word: 'חָכְמָה', gloss: 'wisdom' },
      { word: 'חֲכַם', gloss: 'be wise (imperative), Proverbs 27:11' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חכמה',
        note: 'Daniel 2:20 חָכְמְתָא (wisdom); Daniel 2:21 לְחַכִּימִין (to the wise)'
      }
    ]
  },
  {
    id: 'he-chsd',
    lang: 'hebrew',
    letters: ['ח', 'ס', 'ד'],
    gloss: 'loyal love (noun base)',
    attested: [
      { word: 'חֶסֶד', gloss: 'loyal love, kindness' },
      { word: 'חָסִיד', gloss: 'faithful, devout one' }
    ],
    homographNote:
      'A second חֶסֶד meaning shame, reproach is attested (Leviticus 20:17 חֶסֶד הוּא); the dictionaries treat it as a separate word.'
  },
  {
    id: 'he-chnn',
    lang: 'hebrew',
    letters: ['ח', 'נ', 'נ'],
    gloss: 'be gracious',
    attested: [
      { word: 'חָנַן', gloss: 'he was gracious' },
      { word: 'חֵן', gloss: 'grace, favor' },
      { word: 'תְּחִנָּה', gloss: 'supplication' },
      { word: 'חַנּוּן', gloss: 'gracious' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'חנן',
        note: 'Daniel 4:24 בְּמִחַן עֲנָיִן (by showing favor to the poor)'
      }
    ]
  },
  {
    id: 'he-rchm',
    lang: 'hebrew',
    letters: ['ר', 'ח', 'מ'],
    gloss: 'womb; compassion — both attested word groups',
    attested: [
      { word: 'רֶחֶם', gloss: 'womb' },
      { word: 'רַחֲמִים', gloss: 'compassion, mercy' },
      { word: 'רִחַם', gloss: 'he had compassion (Psalm 103:13)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'rēmu',
        note: 'womb, and also compassion — the same pairing; the verb rêmu means to have mercy'
      },
      {
        lang: 'aramaic',
        form: 'רחמין',
        note: 'mercies; Daniel 2:18 וְרַחֲמִין'
      },
      {
        lang: 'osa',
        form: 'rḥmnn',
        note: 'Rḥmnn (the Merciful), the divine name of the late monotheistic Sabaic inscriptions'
      }
    ],
    homographNote:
      'רֶחֶם womb and רַחֲמִים compassion are written from the same consonants רחמ; both word groups are attested.',
    interpretationNote:
      'The account of compassion as womb-feeling (a mother toward the child of her womb) is the standard dictionary explanation; as a semantic history it is interpretation, not provable from the texts alone.'
  },
  {
    id: 'he-azz',
    lang: 'hebrew',
    letters: ['ע', 'ז', 'ז'],
    gloss: 'be strong',
    attested: [
      { word: 'עֹז', gloss: 'strength, might' },
      { word: 'עַז', gloss: 'strong, fierce' }
    ],
    homographNote:
      'עַז strong and עֵז goat differ only in pointing; the goat noun is filed under the two-letter base עז.'
  },
  {
    id: 'he-tsdq',
    lang: 'hebrew',
    letters: ['צ', 'ד', 'ק'],
    gloss: 'be just, righteous',
    attested: [
      { word: 'צֶדֶק', gloss: 'righteousness, rightness' },
      { word: 'צְדָקָה', gloss: 'righteousness' },
      { word: 'צַדִּיק', gloss: 'righteous' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'צדקה',
        note: 'Daniel 4:24 בְּצִדְקָה (by righteousness)'
      },
      {
        lang: 'osa',
        form: 'ṣdq',
        note: 'in royal names and epithets; check corpus records (DASI/CSAI)'
      }
    ]
  },
  {
    id: 'he-twb',
    lang: 'hebrew',
    letters: ['ט', 'ו', 'ב'],
    gloss: 'be good',
    attested: [
      { word: 'טוֹב', gloss: 'good' },
      { word: 'טוֹבָה', gloss: 'good things, welfare' },
      { word: 'טוּב', gloss: 'goodness, the best (of the land)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'ṭābu',
        note: 'good; the verb ṭâbu, to be good'
      },
      {
        lang: 'aramaic',
        form: 'טב',
        note: 'Daniel 2:32 דִּי־דְהַב טָב (of fine gold)'
      }
    ]
  },
  {
    id: 'he-raa',
    lang: 'hebrew',
    letters: ['ר', 'ע', 'ע'],
    gloss: 'be evil, bad',
    attested: [
      { word: 'רַע', gloss: 'evil, bad' },
      { word: 'רָעָה', gloss: 'evil, distress (noun)' },
      { word: 'הֵרַע', gloss: 'he did evil' }
    ],
    homographNote:
      'The geminate root רעע (be evil) is distinct from רעה (pasture, and the friend word רֵעַ): the consonant sets differ, רעע against רעה, though several surface forms look alike.'
  },
  {
    id: 'he-qtn',
    lang: 'hebrew',
    letters: ['ק', 'ט', 'נ'],
    gloss: 'be small',
    attested: [
      { word: 'קָטָן', gloss: 'small, young' },
      { word: 'קָטֹן', gloss: 'small' },
      { word: 'קָטֹנְתִּי', gloss: 'I am too small (for all the kindnesses), Genesis 32:11' }
    ]
  },
  {
    id: 'he-yshn',
    lang: 'hebrew',
    letters: ['י', 'ש', 'נ'],
    gloss: 'sleep; be old — both attested word groups',
    attested: [
      { word: 'יָשֵׁן', gloss: 'sleeping, asleep' },
      { word: 'יָשָׁן', gloss: 'old (of things)' },
      { word: 'וַיִּישָׁן', gloss: 'and he slept (Genesis 2:21)' }
    ],
    homographNote:
      'יָשֵׁן sleeping and יָשָׁן old (of things) are written with the same consonants ישן; both word groups are attested, and the dictionaries keep them apart. The noun שֵׁנָה sleep is conventionally filed with the sleep group.'
  },
  {
    id: 'he-chzq',
    lang: 'hebrew',
    letters: ['ח', 'ז', 'ק'],
    gloss: 'be strong, firm',
    attested: [
      { word: 'חָזָק', gloss: 'strong' },
      { word: 'חָזַק', gloss: 'he was strong' },
      { word: 'וַיְחַזֵּק', gloss: 'and he hardened (the heart of Pharaoh), Exodus 9:12' }
    ]
  },
  {
    id: 'he-mla',
    lang: 'hebrew',
    letters: ['מ', 'ל', 'א'],
    gloss: 'be full, fill',
    attested: [
      { word: 'מָלֵא', gloss: 'full' },
      { word: 'מִלֵּא', gloss: 'he filled' },
      { word: 'מְלֹא', gloss: 'fullness (Isaiah 6:3)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'malû',
        note: 'to be full, to fill'
      },
      {
        lang: 'aramaic',
        form: 'מלא',
        note: 'Daniel 2:35 וּמְלָת כָּל־אַרְעָא (and it filled the whole earth)'
      }
    ]
  },
  {
    id: 'he-rbb',
    lang: 'hebrew',
    letters: ['ר', 'ב', 'ב'],
    gloss: 'be many',
    attested: [
      { word: 'רַב', gloss: 'many, much' },
      { word: 'רֹב', gloss: 'multitude, abundance' },
      { word: 'רְבָבָה', gloss: 'myriad, ten thousand' },
      { word: 'רַבּוּ', gloss: 'they are many (Psalm 3:2)' }
    ],
    cognates: [
      {
        lang: 'akkadian',
        form: 'rabû',
        note: 'to be great, big — the cognate verb; the adjective is filed under great'
      },
      {
        lang: 'aramaic',
        form: 'רב',
        note: 'great, chief; Daniel 2:35 טוּר רַב (a great mountain)'
      }
    ],
    homographNote:
      'רַב also serves as great, chief (as in רַב־טַבָּחִים chief of the guard); the Aramaic rab on the great entry is this word.'
  },
  {
    id: 'he-qwl',
    lang: 'hebrew',
    letters: ['ק', 'ו', 'ל'],
    gloss: 'voice (noun base)',
    attested: [{ word: 'קוֹל', gloss: 'voice, sound' }],
    cognates: [
      {
        lang: 'aramaic',
        form: 'קל',
        note: 'Daniel 4:28 קָל מִן־שְׁמַיָּא (a voice from heaven)'
      }
    ]
  },
  {
    id: 'he-amn',
    lang: 'hebrew',
    letters: ['א', 'מ', 'נ'],
    gloss: 'confirm, support; be faithful',
    attested: [
      { word: 'אֱמֶת', gloss: 'truth' },
      { word: 'אָמֵן', gloss: 'amen, so be it' },
      { word: 'אֱמוּנָה', gloss: 'faithfulness' },
      { word: 'נֶאֱמָן', gloss: 'faithful, confirmed' }
    ],
    cognates: [
      {
        lang: 'aramaic',
        form: 'הימן',
        note: 'he trusted; Daniel 6:24 דִּי הֵימִן בֵּאלָהֵהּ (because he trusted in his God)'
      }
    ],
    interpretationNote:
      'אֱמֶת truth is filed under אמנ by dictionary convention; the assumed assimilation of the נ is the account of the dictionaries, not something the texts state.'
  }
]

// Attested spelling doublets in the Masoretic text.
// type 'metathesis': same word, reordered consonants — a fact of the attested
// text. type 'variant': consonant-variant pair, not a permutation.
export const DOUBLETS = [
  {
    type: 'metathesis',
    roots: ['כבש', 'כשב'],
    meaning: 'lamb',
    citation:
      'Both spellings occur in the Masoretic text: כֶּשֶׂב Leviticus 3:7; כֶּבֶשׂ Leviticus 4:32.',
    note: 'Both words are written with śin (the left-dotted point on ש).'
  },
  {
    type: 'metathesis',
    roots: ['שמל', 'שלמ'],
    meaning: 'garment',
    citation: 'שִׂמְלָה Genesis 9:23; שַׂלְמָה Exodus 22:8.',
    note:
      'Both with śin; the consonants שלם also write the shin-pointed word group שָׁלוֹם / שָׁלֵם — the distinction is Masoretic pointing.'
  },
  {
    type: 'variant',
    roots: ['זעק', 'צעק'],
    meaning: 'cry out',
    citation:
      'Both attested: וְצָעַק Exodus 22:26; וּזְעַקְתֶּם 1 Samuel 8:18.',
    note: 'A consonant-variant pair (z / ṣ), not a permutation.'
  }
]

// Interpretive clusters. The note labels the grouping as interpretation.
export const CLUSTERS = [
  {
    id: 'pr-splitting',
    title: 'The פ־ר roots in the area of splitting and dividing',
    members: ['פרד', 'פרמ', 'פרס', 'פרצ', 'פרק', 'פרר'],
    note:
      'Each root and its meaning is attested in the Hebrew Bible; the idea that a shared two-letter core פ־ר explains the family resemblance is an interpretation and is not provable from the texts alone.'
  }
]

// Lookup helpers used by the views and the smoke test.
const BY_KEY = new Map(ROOTS.map((r) => [r.lang + ':' + rootKey(r.letters), r]))

export function findRoot(lang, letters) {
  return BY_KEY.get(lang + ':' + rootKey(letters)) || null
}

export function findRootById(id) {
  return ROOTS.find((r) => r.id === id) || null
}
