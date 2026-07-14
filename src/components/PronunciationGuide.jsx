import { useEffect, useState } from 'react'
import { GUIDE_LANGUAGE_DEFAULT, PRONUNCIATION_PROVENANCE } from '../lib/pronunciation.js'

const copy = {
  he: {
    pronounce: 'איך מבטאים?', close: 'סגירת מדריך ההגייה', switch: 'שפת המדריך', hebrew: 'עברית', english: 'English',
    syllables: 'חלוקת הברות', stress: 'הטעמה', ipa: 'תעתיק פונטי', hebrewReading: 'קריאה מעשית בעברית',
    englishReading: 'קריאה מעשית באנגלית', note: 'ודאות ומוסכמה', unavailable: 'שמע אינו זמין לצורה זו.',
    play: 'השמעת קירוב עברי מודרני', audioNote: 'קירוב סינתטי בעברית מודרנית בלבד — לא הקלטה היסטורית.',
    explainer: 'איך לקרוא ולהגות', source: 'התעתיק המקורי נשמר ללא שינוי.'
  },
  en: {
    pronounce: 'How to pronounce', close: 'Close pronunciation guide', switch: 'Guide language', hebrew: 'עברית', english: 'English',
    syllables: 'Syllables', stress: 'Stress', ipa: 'Phonetic transcription', hebrewReading: 'Hebrew-friendly reading',
    englishReading: 'English-friendly reading', note: 'Uncertainty and convention', unavailable: 'Audio is not responsibly available for this form.',
    play: 'Play a modern-Hebrew approximation', audioNote: 'Synthetic modern-Hebrew approximation only — not a historical recording.',
    explainer: 'How to read and pronounce', source: 'The original scholarly transliteration is preserved unchanged.'
  }
}

const languageSections = {
  he: [
    ['עברית', 'הניקוד המסורתי נותן קריאה כגון אָב. הוא אינו הופך כל פרט פונטי היסטורי לוודאי.'],
    ['אכדית', 'כתב יתדות עשוי לתת לסימן יותר מערך אחד; ša-rum נקרא לפי התעתיק האשוריולוגי, לא לפי צורת הסימן לבדה.'],
    ['שומרית', 'הקריאה נשענת גם על מסורת סופרים מאוחרת. למשל ĝ עשוי לסמן עיצור אפי, ולכן ההגייה משוחזרת בזהירות.'],
    ['מצרית', 'הירוגליפים בדרך כלל אינם כותבים תנועות: nfr נהגה לעיתים nefer כמוסכמה מצרולוגית, לא כתנועה מתועדת.'],
    ['חיתית', 'כתיב יתדות עשוי להיות הברתי או לוגוגרפי; ḫa-aš-ša הוא תעתיק קריא, אבל לוגוגרמה אינה מוכיחה קריאה חיתית.'],
    ['ארמית אימפריאלית', 'הכתיב בעיקר עיצורי: mlk מציג שלד עיצורים, ותנועות שאינן כתובות הן השלמה זהירה בלבד.'],
    ['ערבית דרום־ערבית עתיקה', 'מוסנד הוא כתב עיצורי: mlk אינו מאשר תנועות, והקורא לא צריך להציג תנועה משוחזרת כוודאית.']
  ],
  en: [
    ['Hebrew', 'Masoretic pointing supplies a traditional reading such as אָב. It does not make every historical phonetic detail certain.'],
    ['Akkadian', 'A cuneiform sign can have more than one value; ša-rum is read from its Assyriological transliteration, not from the sign shape alone.'],
    ['Sumerian', 'Reading also depends on later scribal tradition. For example ĝ can mark a nasal consonant, so the sound is reconstructed cautiously.'],
    ['Egyptian', 'Hieroglyphs normally omit vowels: nfr is often said as nefer by Egyptological convention, not because that vowel sequence is directly written.'],
    ['Hittite', 'Cuneiform spelling may be syllabic or logographic; ḫa-aš-ša is a readable transliteration, but a logogram does not prove a Hittite reading.'],
    ['Imperial Aramaic', 'Writing is chiefly consonantal: mlk shows a consonant skeleton, while unwritten vowels are cautious scholarly supplies only.'],
    ['Old South Arabian', 'Musnad is consonantal: mlk does not confirm any vowel, so a reconstructed vowel must never be presented as certain.']
  ]
}

function ModernHebrewAudio({ guide, language }) {
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    if (guide.audio?.kind !== 'modern-hebrew-synthesis' || !('speechSynthesis' in window)) return
    const check = () => setSupported(window.speechSynthesis.getVoices().some((voice) => /^he(?:-|$)/i.test(voice.lang)))
    check()
    window.speechSynthesis.addEventListener('voiceschanged', check)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check)
  }, [guide.audio?.kind])
  if (!supported) return <p className="pronunciation-audio-note">{copy[language].unavailable}</p>
  return (
    <div className="pronunciation-audio">
      <button type="button" className="btn" onClick={() => {
        const utterance = new SpeechSynthesisUtterance(guide.source)
        utterance.lang = 'he-IL'
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
      }} aria-label={copy[language].play}>🔊 {copy[language].play}</button>
      <p className="pronunciation-audio-note">{copy[language].audioNote}</p>
    </div>
  )
}

export function ReadingExplainer({ guideLanguage = GUIDE_LANGUAGE_DEFAULT, onGuideLanguageChange, compact = false }) {
  const t = copy[guideLanguage]
  const isHebrew = guideLanguage === 'he'
  return (
    <details className={`reading-explainer${compact ? ' reading-explainer-compact' : ''}`} dir={isHebrew ? 'rtl' : 'ltr'} lang={isHebrew ? 'he' : 'en'}>
      <summary>{t.explainer}</summary>
      <GuideSwitch guideLanguage={guideLanguage} onGuideLanguageChange={onGuideLanguageChange} />
      {isHebrew ? (
        <div>
          <p><b>ארבע שכבות:</b> כתב מקורי הוא מה שרואים על הלוח או בכתב־היד; תעתיק הוא האיות המדעי (למשל š, ṣ, ṭ, ḫ, ʿ, ʾ); תעתיק פונטי מתאר צליל; והגייה משוחזרת היא קירוב זהיר, לא הקלטה מן העבר.</p>
          <p><b>סימנים:</b> š = שׁ, ṣ = צ נחצית, ṭ = ט נחצית, ḫ = ח/כ רפה, ʿ = ע, ʾ = א/עצירה גרונית. ā ē ī ū מציינות בדרך כלל תנועה ארוכה; מספרים תחתונים/עליונים מבחינים בין ערכי סימן או הומונימים. קובעים (determinatives), סוגריים, סימן שאלה וחסר מסמנים קטגוריה, השלמה או אי־ודאות.</p>
          <p><b>הברות והטעמה:</b> נקודה אמצעית מפרידה הברות. ההטעמה תסומן רק כשיש בסיס סביר; אחרת המדריך אומר שאינה ידועה.</p>
          <h3>לפי שפה</h3>
          {languageSections.he.map(([title, text]) => <section className="reading-language-section" key={title}><h4>{title}</h4><p>{text}</p></section>)}
          <p><b>הקריאות המעשיות:</b> השורה העברית והאנגלית עוזרות לקרוא בקול, אך אינן מחליפות את התעתיק המדעי. שמע, כאשר מופיע, מסומן במפורש כקירוב סינתטי ולא כהגייה עתיקה מאומתת.</p>
        </div>
      ) : (
        <div>
          <p><b>Four layers:</b> original script is what appears on a tablet or manuscript; transliteration is the scholarly spelling (for example š, ṣ, ṭ, ḫ, ʿ, ʾ); phonetic transcription describes sound; reconstructed pronunciation is a careful approximation, not an ancient recording.</p>
          <p><b>Common signs:</b> š = sh, ṣ = emphatic s, ṭ = emphatic t, ḫ = kh, ʿ = ayin, and ʾ = glottal stop. Long-vowel marks ā ē ī ū usually mark length. Subscripts and superscripts distinguish sign values or homonyms. Determinatives, brackets, question marks, and gaps mark categories, restorations, uncertainty, or damage.</p>
          <p><b>Syllables and stress:</b> centered dots separate syllables. Stress is shown only when responsibly supported; otherwise the guide says it is unknown.</p>
          <h3>By language</h3>
          {languageSections.en.map(([title, text]) => <section className="reading-language-section" key={title}><h4>{title}</h4><p>{text}</p></section>)}
          <p><b>Practical readings:</b> the Hebrew-friendly and English-friendly lines help a non-specialist read aloud but never replace scholarly transliteration. Any audio is explicitly labeled synthetic approximation, never authenticated ancient speech.</p>
        </div>
      )}
      <p className="pronunciation-provenance">{isHebrew ? 'מקורות מוסכמה: ' : 'Convention provenance: '}{Object.values(PRONUNCIATION_PROVENANCE).join(' ')}</p>
    </details>
  )
}

function GuideSwitch({ guideLanguage, onGuideLanguageChange }) {
  const t = copy[guideLanguage]
  return <div className="pronunciation-switch" role="group" aria-label={t.switch}>
    <button type="button" className={`chip${guideLanguage === 'he' ? ' on' : ''}`} onClick={() => onGuideLanguageChange('he')}>{t.hebrew}</button>
    <button type="button" className={`chip${guideLanguage === 'en' ? ' on' : ''}`} onClick={() => onGuideLanguageChange('en')}>{t.english}</button>
  </div>
}

export default function PronunciationGuide({ guide, guideLanguage = GUIDE_LANGUAGE_DEFAULT, onGuideLanguageChange }) {
  const [open, setOpen] = useState(false)
  const t = copy[guideLanguage]
  const isHebrew = guideLanguage === 'he'
  return (
    <div className="pronunciation-control">
      <button type="button" className="btn pronunciation-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? t.close : t.pronounce}</button>
      {open && (
        <section className="pronunciation-panel" data-pronunciation-state={guide.state} data-guide-language={guideLanguage} dir={isHebrew ? 'rtl' : 'ltr'} lang={isHebrew ? 'he' : 'en'}>
          <GuideSwitch guideLanguage={guideLanguage} onGuideLanguageChange={onGuideLanguageChange} />
          <p className="pronunciation-source">{t.source}</p>
          <dl>
            <div><dt>{t.syllables}</dt><dd>{guide.syllables}</dd></div>
            <div><dt>{t.stress}</dt><dd>{guide.stress}</dd></div>
            {guide.ipa && <div><dt>{t.ipa}</dt><dd dir="ltr">{guide.ipa}</dd></div>}
            <div><dt>{t.hebrewReading}</dt><dd dir="rtl">{guide.hebrew}</dd></div>
            <div><dt>{t.englishReading}</dt><dd dir="ltr">{guide.english}</dd></div>
            <div><dt>{t.note}</dt><dd>{guide.note}</dd></div>
          </dl>
          {guide.audio?.state === 'conditional' ? <ModernHebrewAudio guide={guide} language={guideLanguage} /> : <p className="pronunciation-audio-note">{t.unavailable}</p>}
          <ReadingExplainer guideLanguage={guideLanguage} onGuideLanguageChange={onGuideLanguageChange} compact />
        </section>
      )}
    </div>
  )
}
