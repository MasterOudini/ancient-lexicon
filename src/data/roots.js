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
    roots: ['שמל', 'שלם'],
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
    members: ['פרד', 'פרם', 'פרס', 'פרצ', 'פרק', 'פרר'],
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
