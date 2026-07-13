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
