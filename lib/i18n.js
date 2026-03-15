/**
 * lib/i18n.js
 * Trilingual support: English, Hindi, Tamil
 * Financial terms carefully chosen for accuracy
 */

export const LANGUAGES = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'hi', label: 'हिं', name: 'हिन्दी' },
  { code: 'ta', label: 'தமி', name: 'தமிழ்' },
];

export const T = {
  // ── Header ──────────────────────────────
  brand: {
    en: 'HDFC Mutual Fund',
    hi: 'HDFC म्यूचुअल फंड',
    ta: 'HDFC மியூச்சுவல் ஃபண்ட்',
  },
  tagline: {
    en: 'Investor Education Initiative',
    hi: 'निवेशक शिक्षा पहल',
    ta: 'முதலீட்டாளர் கல்வி முயற்சி',
  },
  badgeLabel: {
    en: 'Goal-Based Calculator',
    hi: 'लक्ष्य आधारित कैलकुलेटर',
    ta: 'இலக்கு அடிப்படையிலான கணிப்பான்',
  },

  // ── Hero ────────────────────────────────
  heroEyebrow: {
    en: 'Investor Education & Awareness',
    hi: 'निवेशक शिक्षा एवं जागरूकता',
    ta: 'முதலீட்டாளர் கல்வி மற்றும் விழிப்புணர்வு',
  },
  heroTitle: {
    en: 'Goal-Based SIP Calculator',
    hi: 'लक्ष्य आधारित SIP कैलकुलेटर',
    ta: 'இலக்கு அடிப்படையிலான SIP கணிப்பான்',
  },
  heroDesc: {
    en: 'Plan your financial goals with our transparent, educational calculator. Understand how inflation, time, and returns shape your investment journey.',
    hi: 'हमारे पारदर्शी, शैक्षिक कैलकुलेटर से अपने वित्तीय लक्ष्यों की योजना बनाएं। जानें कि महंगाई, समय और रिटर्न आपकी निवेश यात्रा को कैसे आकार देते हैं।',
    ta: 'எங்கள் வெளிப்படையான, கல்வி சார்ந்த கணிப்பானை கொண்டு உங்கள் நிதி இலக்குகளை திட்டமிடுங்கள். பணவீக்கம், காலம் மற்றும் வருமானம் உங்கள் முதலீட்டு பயணத்தை எவ்வாறு வடிவமைக்கின்றன என புரிந்துகொள்ளுங்கள்.',
  },

  // ── Steps ───────────────────────────────
  step1num:   { en: 'Step 01', hi: 'चरण 01', ta: 'படி 01' },
  step1title: { en: 'Inflation Adjustment', hi: 'महंगाई समायोजन', ta: 'பணவீக்க சரிசெய்தல்' },
  step1desc:  { en: 'We compound your goal cost to its real future value using your inflation assumption.', hi: 'हम आपकी महंगाई धारणा का उपयोग करके आपके लक्ष्य की लागत को उसके वास्तविक भविष्य मूल्य तक बढ़ाते हैं।', ta: 'உங்கள் பணவீக்க அனுமானத்தை பயன்படுத்தி உங்கள் இலக்கின் செலவை அதன் உண்மையான எதிர்கால மதிப்பிற்கு கணக்கிடுகிறோம்.' },

  step2num:   { en: 'Step 02', hi: 'चरण 02', ta: 'படி 02' },
  step2title: { en: 'SIP Calculation', hi: 'SIP गणना', ta: 'SIP கணக்கீடு' },
  step2desc:  { en: 'Using the industry-standard SIP formula to calculate your required monthly investment.', hi: 'आपकी आवश्यक मासिक निवेश राशि की गणना के लिए उद्योग मानक SIP फॉर्मूले का उपयोग।', ta: 'தேவையான மாதாந்திர முதலீட்டை கணக்கிட தொழில் தர SIP சூத்திரம் பயன்படுத்தப்படுகிறது.' },

  step3num:   { en: 'Step 03', hi: 'चरण 03', ta: 'படி 03' },
  step3title: { en: 'Growth Visualisation', hi: 'वृद्धि दृश्यावलोकन', ta: 'வளர்ச்சி காட்சிப்படுத்தல்' },
  step3desc:  { en: 'See year-by-year corpus growth through interactive charts and educational insights.', hi: 'इंटरैक्टिव चार्ट और शैक्षिक जानकारी के माध्यम से वर्ष-दर-वर्ष कोष वृद्धि देखें।', ta: 'ஊடாடும் வரைபடங்கள் மற்றும் கல்வி நுண்ணறிவு மூலம் ஆண்டுதோறும் நிதித்திரள் வளர்ச்சியை பாருங்கள்.' },

  // ── Section tabs ────────────────────────
  tabGoal:    { en: '🎯 Goal Calculator',       hi: '🎯 लक्ष्य कैलकुलेटर',        ta: '🎯 இலக்கு கணிப்பான்' },
  tabTopUp:   { en: '📈 Step-Up Enhancement',   hi: '📈 स्टेप-अप वृद्धि',          ta: '📈 படி-மேல் மேம்பாடு' },
  tabBuckets: { en: '🏥 Inflation Assumptions', hi: '🏥 महंगाई मान्यताएं',          ta: '🏥 பணவீக்க அனுமானங்கள்' },

  // ── Form labels ─────────────────────────
  defineGoal:     { en: 'Define Your Goal',                   hi: 'अपना लक्ष्य निर्धारित करें',      ta: 'உங்கள் இலக்கை வரையறுங்கள்' },
  defineGoalSub:  { en: 'All assumptions are editable and clearly disclosed', hi: 'सभी मान्यताएं संपादन योग्य और स्पष्ट रूप से प्रकट', ta: 'அனைத்து அனுமானங்களும் திருத்தக்கூடியவை மற்றும் வெளிப்படையாக வெளிப்படுத்தப்பட்டவை' },
  selectGoal:     { en: 'Select Goal Type',                   hi: 'लक्ष्य प्रकार चुनें',              ta: 'இலக்கு வகையை தேர்ந்தெடுங்கள்' },
  currentCost:    { en: 'Current Cost of Goal (₹)',           hi: 'लक्ष्य की वर्तमान लागत (₹)',       ta: 'இலக்கின் தற்போதைய செலவு (₹)' },
  costPlaceholder:{ en: 'e.g. 1500000',                       hi: 'उदा. 1500000',                     ta: 'எ.கா. 1500000' },
  timeHorizon:    { en: 'Time Horizon (Years)',                hi: 'समय अवधि (वर्ष)',                  ta: 'கால அளவு (ஆண்டுகள்)' },
  inflationRate:  { en: 'Expected Inflation Rate (% p.a.)',   hi: 'अपेक्षित महंगाई दर (% प्रति वर्ष)', ta: 'எதிர்பார்க்கப்படும் பணவீக்க விகிதம் (% ஆண்டுக்கு)' },
  expectedReturn: { en: 'Expected Annual Return (% p.a.)',    hi: 'अपेक्षित वार्षिक रिटर्न (% प्रति वर्ष)', ta: 'எதிர்பார்க்கப்படும் ஆண்டு வருமானம் (% ஆண்டுக்கு)' },
  assumptions:    { en: 'Assumptions',                        hi: 'मान्यताएं',                        ta: 'அனுமானங்கள்' },
  calculateBtn:   { en: 'Calculate Required SIP',             hi: 'आवश्यक SIP की गणना करें',          ta: 'தேவையான SIP கணக்கிடுங்கள்' },
  resetBtn:       { en: 'Reset to Defaults',                  hi: 'डिफ़ॉल्ट पर रीसेट करें',           ta: 'இயல்பு நிலைக்கு மீட்டமை' },
  yr:             { en: 'yr',                                  hi: 'वर्ष',                             ta: 'ஆண்.' },

  // ── Goal labels ─────────────────────────
  goalEducation:  { en: '🎓 Education',  hi: '🎓 शिक्षा',     ta: '🎓 கல்வி' },
  goalHome:       { en: '🏠 Home',       hi: '🏠 घर',         ta: '🏠 வீடு' },
  goalRetirement: { en: '🌴 Retirement', hi: '🌴 सेवानिवृत्ति', ta: '🌴 ஓய்வூதியம்' },
  goalWedding:    { en: '💍 Wedding',    hi: '💍 विवाह',       ta: '💍 திருமணம்' },
  goalVehicle:    { en: '🚗 Vehicle',    hi: '🚗 वाहन',        ta: '🚗 வாகனம்' },
  goalCustom:     { en: '✏️ Custom',     hi: '✏️ कस्टम',       ta: '✏️ தனிப்பயன்' },

  // ── Results ─────────────────────────────
  requiredSIP:    { en: 'Required Monthly SIP',       hi: 'आवश्यक मासिक SIP',           ta: 'தேவையான மாதாந்திர SIP' },
  perMonthFor:    { en: 'per month for',              hi: 'प्रति माह',                   ta: 'மாதத்திற்கு' },
  years:          { en: 'years',                      hi: 'वर्ष',                        ta: 'ஆண்டுகள்' },
  totalInvested:  { en: 'Total Invested',             hi: 'कुल निवेश',                   ta: 'மொத்த முதலீடு' },
  estGains:       { en: 'Est. Gains',                 hi: 'अनुमानित लाभ',               ta: 'மதிப்பிடப்பட்ட ஆதாயம்' },
  presentCost:    { en: 'Present Goal Cost',          hi: 'वर्तमान लक्ष्य लागत',        ta: 'தற்போதைய இலக்கு செலவு' },
  inflatedGoal:   { en: 'Inflation-Adj. Goal',        hi: 'महंगाई समायोजित लक्ष्य',     ta: 'பணவீக்க சரிசெய்யப்பட்ட இலக்கு' },
  targetCorpus:   { en: 'Target Corpus',              hi: 'लक्ष्य कोष',                  ta: 'இலக்கு நிதித்திரள்' },
  assumedReturn:  { en: 'Assumed Return',             hi: 'अनुमानित रिटर्न',             ta: 'அனுமானிக்கப்பட்ட வருமானம்' },
  powerComp:      { en: 'Power of compounding',       hi: 'चक्रवृद्धि की शक्ति',        ta: 'கூட்டு வட்டியின் சக்தி' },
  yourAssumption: { en: 'Your editable assumption',   hi: 'आपकी संपादन योग्य मान्यता',  ta: 'உங்கள் திருத்தக்கூடிய அனுமானம்' },
  amountNeeded:   { en: 'Amount needed at goal date', hi: 'लक्ष्य तिथि पर आवश्यक राशि', ta: 'இலக்கு தேதியில் தேவையான தொகை' },
  monthlyPayments:{ en: 'monthly payments',           hi: 'मासिक भुगतान',               ta: 'மாதாந்திர கொடுப்பனவுகள்' },
  todaysValue:    { en: "Today's value",              hi: 'आज का मूल्य',                ta: 'இன்றைய மதிப்பு' },

  // ── Chart tabs ──────────────────────────
  growthChart:    { en: '📊 Growth Chart',  hi: '📊 वृद्धि चार्ट',    ta: '📊 வளர்ச்சி வரைபடம்' },
  milestones:     { en: '📋 Milestones',    hi: '📋 मील के पत्थर',    ta: '📋 கட்டங்கள்' },
  lateStart:      { en: '⏰ Late Start',    hi: '⏰ देर से शुरुआत',   ta: '⏰ தாமதமான தொடக்கம்' },
  totalCorpus:    { en: 'Total Corpus',     hi: 'कुल कोष',            ta: 'மொத்த நிதித்திரள்' },
  amtInvested:    { en: 'Amount Invested',  hi: 'निवेश राशि',          ta: 'முதலீடு செய்த தொகை' },

  // ── Late start ──────────────────────────
  lateStartDesc:  { en: 'Every year you delay investing, your required monthly SIP increases. See the real cost of waiting:', hi: 'हर साल देरी से SIP बढ़ती है। इंतजार की असली कीमत देखें:', ta: 'ஒவ்வொரு ஆண்டும் முதலீடு தாமதமாகும்போது, தேவையான மாதாந்திர SIP அதிகரிக்கும்:' },
  startToday:     { en: 'Start Today',      hi: 'आज शुरू करें',        ta: 'இன்று தொடங்குங்கள்' },
  bestTimeStart:  { en: 'Best time to start ✓', hi: 'शुरू करने का सर्वोत्तम समय ✓', ta: 'தொடங்குவதற்கான சிறந்த நேரம் ✓' },
  extraPerMonth:  { en: 'extra/mo',         hi: 'अतिरिक्त/माह',       ta: 'கூடுதல்/மாதம்' },
  yearsRemaining: { en: 'years remaining',  hi: 'वर्ष शेष',            ta: 'ஆண்டுகள் மீதமுள்ளன' },

  // ── Insights ────────────────────────────
  insightsTitle:    { en: 'What This Means For You',    hi: 'यह आपके लिए क्या मायने रखता है', ta: 'இது உங்களுக்கு என்னை அர்த்தப்படுத்துகிறது' },
  insightsSub:      { en: 'Educational insights based on your plan', hi: 'आपकी योजना के आधार पर शैक्षिक जानकारी', ta: 'உங்கள் திட்டத்தின் அடிப்படையிலான கல்வி நுண்ணறிவு' },

  // ── Formula explainer ───────────────────
  showFormula:    { en: '🧮 Show How We Calculate Your SIP', hi: '🧮 हम आपका SIP कैसे गणना करते हैं', ta: '🧮 நாங்கள் உங்கள் SIP எவ்வாறு கணக்கிடுகிறோம்' },
  hideFormula:    { en: '🧮 Hide How We Calculate Your SIP', hi: '🧮 SIP गणना छुपाएं', ta: '🧮 SIP கணக்கீட்டை மறை' },
  formulaStep1:   { en: 'Step 1 — Inflate Your Goal',       hi: 'चरण 1 — लक्ष्य को महंगाई से बढ़ाएं', ta: 'படி 1 — உங்கள் இலக்கை பணவீக்கப்படுத்துங்கள்' },
  formulaStep2:   { en: 'Step 2 — Monthly Rate',            hi: 'चरण 2 — मासिक दर',                   ta: 'படி 2 — மாதாந்திர விகிதம்' },
  formulaStep3:   { en: 'Step 3 — Required Monthly SIP',    hi: 'चरण 3 — आवश्यक मासिक SIP',           ta: 'படி 3 — தேவையான மாதாந்திர SIP' },
  formulaIllust:  { en: 'All values are illustrative only. Actual returns may vary.', hi: 'सभी मूल्य केवल सांकेतिक हैं। वास्तविक रिटर्न भिन्न हो सकता है।', ta: 'அனைத்து மதிப்புகளும் விளக்கமளிக்கும் நோக்கத்திற்காக மட்டுமே. உண்மையான வருமானம் மாறுபடலாம்.' },

  // ── PDF button ──────────────────────────
  downloadPDF:    { en: '📄 Download My Investment Plan (PDF)', hi: '📄 मेरी निवेश योजना डाउनलोड करें (PDF)', ta: '📄 என் முதலீட்டு திட்டத்தை பதிவிறக்கு (PDF)' },
  generating:     { en: '⏳ Generating...', hi: '⏳ बन रहा है...', ta: '⏳ உருவாக்கப்படுகிறது...' },

  // ── Disclaimer ──────────────────────────
  disclaimerTitle: { en: 'Disclaimer', hi: 'अस्वीकरण', ta: 'மறுப்பு' },
  disclaimerText:  {
    en: 'This tool has been designed for information purposes only. Actual results may vary depending on various factors involved in capital market. Investor should not consider above as a recommendation for any schemes of HDFC Mutual Fund. Past performance may or may not be sustained in future and is not a guarantee of any future returns.',
    hi: 'यह उपकरण केवल सूचना उद्देश्यों के लिए डिज़ाइन किया गया है। पूंजी बाजार में शामिल विभिन्न कारकों के आधार पर वास्तविक परिणाम भिन्न हो सकते हैं। निवेशक को HDFC म्यूचुअल फंड की किसी भी योजना के लिए उपरोक्त को सिफारिश नहीं मानना चाहिए। पिछला प्रदर्शन भविष्य में बनाए रखा जा सकता है या नहीं भी और यह किसी भविष्य के रिटर्न की गारंटी नहीं है।',
    ta: 'இந்த கருவி தகவல் நோக்கங்களுக்காக மட்டுமே வடிவமைக்கப்பட்டுள்ளது. மூலதன சந்தையில் உள்ள பல்வேறு காரணிகளைப் பொறுத்து உண்மையான முடிவுகள் மாறுபடலாம். HDFC மியூச்சுவல் ஃபண்டின் எந்த திட்டத்திற்கும் மேற்கண்டதை முதலீட்டாளர் பரிந்துரையாக கருதக்கூடாது. கடந்த கால செயல்திறன் எதிர்காலத்தில் நீடிக்கலாம் அல்லது நீடிக்காமல் போகலாம், மேலும் இது எதிர்கால வருமானத்திற்கான உத்தரவாதம் அல்ல.',
  },

  // ── Footer ──────────────────────────────
  footer: {
    en: '© HDFC Asset Management Company Limited · Mutual Fund investments are subject to market risks. Read all scheme related documents carefully. · For investor education and awareness purpose only.',
    hi: '© HDFC एसेट मैनेजमेंट कंपनी लिमिटेड · म्यूचुअल फंड निवेश बाजार जोखिमों के अधीन हैं। सभी योजना संबंधित दस्तावेज ध्यान से पढ़ें। · केवल निवेशक शिक्षा और जागरूकता के लिए।',
    ta: '© HDFC அசெட் மேனேஜ்மென்ட் கம்பெனி லிமிடெட் · மியூச்சுவல் ஃபண்ட் முதலீடுகள் சந்தை அபாயங்களுக்கு உட்பட்டவை. அனைத்து திட்ட தொடர்பான ஆவணங்களையும் கவனமாக படிக்கவும். · முதலீட்டாளர் கல்வி மற்றும் விழிப்புணர்வு நோக்கத்திற்காக மட்டுமே.',
  },

  // ── Empty state ─────────────────────────
  resultsHere:    { en: 'Your results will appear here',    hi: 'आपके परिणाम यहाँ दिखेंगे',       ta: 'உங்கள் முடிவுகள் இங்கே தோன்றும்' },
  resultsHereSub: { en: 'Select a goal type and click Calculate Required SIP', hi: 'एक लक्ष्य प्रकार चुनें और Calculate Required SIP पर क्लिक करें', ta: 'ஒரு இலக்கு வகையை தேர்ந்தெடுத்து Calculate Required SIP என்பதை கிளிக் செய்யுங்கள்' },
};

/** Helper: get translation */
export function t(key, lang) {
  if (!T[key]) return key;
  return T[key][lang] || T[key]['en'] || key;
}