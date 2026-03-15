import Head from 'next/head';
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  calcFutureGoalValue, calcRequiredSIP, calcYearlyGrowth,
  calcMilestones, calcTopUpSIP, calcInflationBuckets,
  calcLateStartPenalty, formatShort,
} from '../lib/finance';
import { LANGUAGES, t } from '../lib/i18n';
import GrowthChart from '../components/GrowthChart';
import MilestoneTable from '../components/MilestoneTable';

// ─── Goal presets ───────────────────────────────────────────
const GOAL_KEYS = [
  { id: 'education',  labelKey: 'goalEducation',  amount: 1500000,  years: 12, inflation: 6 },
  { id: 'home',       labelKey: 'goalHome',        amount: 5000000,  years: 15, inflation: 6 },
  { id: 'retirement', labelKey: 'goalRetirement',  amount: 10000000, years: 25, inflation: 6 },
  { id: 'wedding',    labelKey: 'goalWedding',     amount: 2000000,  years: 5,  inflation: 6 },
  { id: 'vehicle',    labelKey: 'goalVehicle',     amount: 1200000,  years: 4,  inflation: 6 },
  { id: 'custom',     labelKey: 'goalCustom',      amount: '',       years: '', inflation: 6 },
];

const DEFAULT_FORM = {
  goalId: 'education', presentCost: '1500000',
  years: '12', inflationRate: '6', expectedReturn: '12',
};
const DEFAULT_TOPUP   = { initialSIP: '', topUpRate: '10', topUpReturn: '12', topUpYears: '12' };
const DEFAULT_BUCKETS = {
  educationPct: '40', medicalPct: '20', lifestylePct: '40',
  educationInf: '8',  medicalInf: '10', lifestyleInf: '6',
};

function numOr(val, fb = 0) { const n = parseFloat(val); return isNaN(n) ? fb : n; }

// ─── FEATURE: What-If Scenario Presets ─────────────────────
const SCENARIOS = [
  {
    id: 'conservative',
    label: { en: '🐢 Conservative', hi: '🐢 रूढ़िवादी', ta: '🐢 பழமைவாதி' },
    desc:  { en: 'Low risk · Safe returns', hi: 'कम जोखिम · सुरक्षित रिटर्न', ta: 'குறைந்த ஆபத்து · பாதுகாப்பான வருமானம்' },
    inflationRate: '8', expectedReturn: '10',
    color: '#6b7280',
  },
  {
    id: 'moderate',
    label: { en: '⚖️ Moderate', hi: '⚖️ मध्यम', ta: '⚖️ மிதமான' },
    desc:  { en: 'Balanced · Realistic', hi: 'संतुलित · यथार्थवादी', ta: 'சமநிலை · யதார்த்தமான' },
    inflationRate: '6', expectedReturn: '12',
    color: '#224c87',
  },
  {
    id: 'aggressive',
    label: { en: '🚀 Aggressive', hi: '🚀 आक्रामक', ta: '🚀 தீவிரமான' },
    desc:  { en: 'Higher risk · Higher returns', hi: 'अधिक जोखिम · अधिक रिटर्न', ta: 'அதிக ஆபத்து · அதிக வருமானம்' },
    inflationRate: '5', expectedReturn: '14',
    color: '#1a7a4a',
  },
];

// ─── FEATURE: Donut Chart ───────────────────────────────────
function DonutChart({ invested, gains, lang }) {
  const total    = invested + gains;
  const invPct   = total > 0 ? invested / total : 0.5;
  const gainsPct = total > 0 ? gains    / total : 0.5;

  const R   = 70;
  const cx  = 90;
  const cy  = 90;
  const stroke = 28;
  const circ = 2 * Math.PI * R;

  const invDash  = circ * invPct;
  const gainDash = circ * gainsPct;

  // invested arc starts at top (−π/2), gains arc follows
  const invOffset  = circ * 0.25; // rotate so start is top
  const gainsOffset = -(circ * gainsPct) + circ * 0.25;

  return (
    <div className="donut-wrap">
      <svg width="180" height="180" viewBox="0 0 180 180" aria-label="Investment breakdown chart">
        {/* Background ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#e8eef7" strokeWidth={stroke} />
        {/* Invested arc — blue */}
        <circle cx={cx} cy={cy} r={R} fill="none"
          stroke="#224c87" strokeWidth={stroke}
          strokeDasharray={`${invDash} ${circ - invDash}`}
          strokeDashoffset={invOffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* Gains arc — green */}
        <circle cx={cx} cy={cy} r={R} fill="none"
          stroke="#1a7a4a" strokeWidth={stroke}
          strokeDasharray={`${gainDash} ${circ - gainDash}`}
          strokeDashoffset={gainsOffset}
          strokeLinecap="butt"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)' }}
        />
        {/* Centre text */}
        <text x={cx} y={cy - 8} textAnchor="middle" fill="#224c87" fontSize="13" fontWeight="800" fontFamily="Montserrat,Arial,sans-serif">
          {(gainsPct * 100).toFixed(0)}%
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#666" fontSize="9" fontFamily="Montserrat,Arial,sans-serif">
          {lang === 'en' ? 'from market' : lang === 'hi' ? 'बाजार से' : 'சந்தையிலிருந்து'}
        </text>
      </svg>
      <div className="donut-legend">
        <div className="donut-legend-item">
          <div className="donut-dot" style={{ background: '#224c87' }}></div>
          <div>
            <div className="donut-legend-label">{lang === 'en' ? 'You Invested' : lang === 'hi' ? 'आपने निवेश किया' : 'நீங்கள் முதலீடு செய்தது'}</div>
            <div className="donut-legend-value" style={{ color: '#224c87' }}>{formatShort(invested)}</div>
            <div className="donut-legend-pct">{(invPct * 100).toFixed(0)}%</div>
          </div>
        </div>
        <div className="donut-legend-item">
          <div className="donut-dot" style={{ background: '#1a7a4a' }}></div>
          <div>
            <div className="donut-legend-label">{lang === 'en' ? 'Market Earned' : lang === 'hi' ? 'बाजार ने कमाया' : 'சந்தை சம்பாதித்தது'}</div>
            <div className="donut-legend-value" style={{ color: '#1a7a4a' }}>{formatShort(gains)}</div>
            <div className="donut-legend-pct">{(gainsPct * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── FEATURE: Animated Counter ──────────────────────────────
function useAnimatedValue(target, duration = 600) {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);
  const rafRef  = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to   = target;
    if (from === to) return;
    const start = performance.now();
    const tick  = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // cubic ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      else { prevRef.current = to; setDisplay(to); }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
}

function AnimatedAmount({ value, format = 'short' }) {
  const animated = useAnimatedValue(Math.round(value || 0));
  if (format === 'short') return <>{formatShort(animated)}</>;
  return <>₹{animated.toLocaleString('en-IN')}</>;
}

// ─── FEATURE: Voice Input ───────────────────────────────────
function VoiceButton({ onResult, lang, disabled }) {
  const [listening, setListening] = useState(false);
  const recRef = useRef(null);

  const toggle = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser. Try Chrome.'); return; }
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : 'en-IN';
    rec.continuous = false; rec.interimResults = false;
    rec.onstart  = () => setListening(true);
    rec.onresult = (e) => { onResult(e.results[0][0].transcript); setListening(false); };
    rec.onerror  = () => setListening(false);
    rec.onend    = () => setListening(false);
    rec.start();
  }, [listening, lang, onResult]);

  return (
    <button type="button" className={`voice-btn${listening ? ' listening' : ''}`}
      onClick={toggle} disabled={disabled}
      title={listening ? 'Stop listening' : 'Voice input (en-IN / hi-IN / ta-IN)'}
      aria-label="Voice input">
      {listening ? '⏹' : '🎙'}
    </button>
  );
}

// ─── FEATURE: Risk Gauge ────────────────────────────────────
function RiskGauge({ monthlySIP, years, expectedReturn, inflationRate, scenario, lang }) {
  let score = 0;

  // ── Factor 1: Return assumption (most important!) ──
  // Conservative ≤10% → low risk
  // Moderate 11-14%   → medium risk
  // Aggressive 15%+   → high risk
  if (expectedReturn <= 8)       score += 10;
  else if (expectedReturn <= 10) score += 20;
  else if (expectedReturn <= 12) score += 35;
  else if (expectedReturn <= 14) score += 50;
  else if (expectedReturn <= 18) score += 70;
  else                           score += 85;

  // ── Factor 2: Scenario preset ──
  if (scenario === 'aggressive')   score += 10;
  else if (scenario === 'moderate') score += 3;
  // conservative adds 0

  // ── Factor 3: Real return (return minus inflation) ──
  const realReturn = expectedReturn - inflationRate;
  if (realReturn < 2)  score += 10;

  // ── Factor 4: Time horizon ──
  if (years < 3)        score += 10;
  else if (years >= 10) score -= 5;

  score = Math.min(100, Math.max(0, Math.round(score)));

  const angle   = -135 + (score / 100) * 270;
  const color   = score < 30 ? '#1a7a4a' : score < 55 ? '#b5620a' : score < 75 ? '#c04800' : '#da3832';
  const label   = score < 30
    ? (lang === 'en' ? 'Low Risk'  : lang === 'hi' ? 'कम जोखिम'     : 'குறைந்த ஆபத்து')
    : score < 55
    ? (lang === 'en' ? 'Moderate'  : lang === 'hi' ? 'मध्यम'         : 'மிதமான')
    : score < 75
    ? (lang === 'en' ? 'Elevated'  : lang === 'hi' ? 'ऊंचा जोखिम'   : 'உயர்ந்த ஆபத்து')
    : (lang === 'en' ? 'High Risk' : lang === 'hi' ? 'उच्च जोखिम'   : 'அதிக ஆபத்து');
  const desc = score < 30
    ? (lang === 'en' ? 'Conservative plan. Low volatility expected.'
      : lang === 'hi' ? 'रूढ़िवादी योजना। कम उतार-चढ़ाव अपेक्षित।'
      : 'பழமைவாதி திட்டம். குறைந்த ஏற்ற இறக்கம் எதிர்பார்க்கப்படுகிறது.')
    : score < 55
    ? (lang === 'en' ? 'Balanced risk. Annual review recommended.'
      : lang === 'hi' ? 'संतुलित जोखिम। वार्षिक समीक्षा की सिफारिश।'
      : 'சமநிலை ஆபத்து. வருடாந்திர மதிப்பாய்வு பரிந்துரைக்கப்படுகிறது.')
    : score < 75
    ? (lang === 'en' ? 'Elevated risk. Equity exposure is high.'
      : lang === 'hi' ? 'ऊंचा जोखिम। इक्विटी एक्सपोज़र अधिक है।'
      : 'உயர்ந்த ஆபத்து. ஈக்விட்டி வெளிப்பாடு அதிகம்.')
    : (lang === 'en' ? 'High risk. Aggressive equity assumption.'
      : lang === 'hi' ? 'उच्च जोखिम। आक्रामक इक्विटी धारणा।'
      : 'அதிக ஆபத்து. தீவிர ஈக்விட்டி அனுமானம்.');

  const rad    = (deg) => (deg * Math.PI) / 180;
  const nx     = 70 + 46 * Math.cos(rad(angle - 90));
  const ny     = 76 + 46 * Math.sin(rad(angle - 90));
  const dashLen = (score / 100) * 176;

  return (
    <div className="risk-gauge-wrap">
      <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '.75rem' }}>
        {lang === 'en' ? '🎯 Risk Score' : lang === 'hi' ? '🎯 जोखिम स्कोर' : '🎯 ஆபத்து மதிப்பெண்'}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <svg width="140" height="100" viewBox="0 0 140 100" aria-label={`Risk score ${score}`}>
          <path d="M 14 84 A 56 56 0 0 1 126 84"
            fill="none" stroke="var(--border)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 14 84 A 56 56 0 0 1 126 84"
            fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${dashLen} 176`}
            style={{ transition: 'stroke-dasharray .7s ease, stroke .4s' }} />
          <line x1="70" y1="76" x2={nx.toFixed(1)} y2={ny.toFixed(1)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round"
            style={{ transition: 'x2 .7s ease, y2 .7s ease' }} />
          <circle cx="70" cy="76" r="5" fill={color} style={{ transition: 'fill .4s' }} />
          <text x="70" y="68" textAnchor="middle" fontSize="13" fontWeight="700"
            fill={color} fontFamily="Montserrat,Arial,sans-serif">{score}</text>
          <text x="12" y="97" fontSize="9" fill="#919090" fontFamily="Arial,sans-serif">Low</text>
          <text x="110" y="97" fontSize="9" fill="#919090" fontFamily="Arial,sans-serif">High</text>
        </svg>
        <div>
          <div style={{ fontWeight: 800, fontSize: '.95rem', color, marginBottom: '.25rem' }}>{label}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--text3)', lineHeight: 1.6, maxWidth: '180px' }}>{desc}</div>
        </div>
      </div>
      {/* Risk factors */}
      <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
        {[
          { label: lang === 'en' ? 'Return assumption' : lang === 'hi' ? 'रिटर्न धारणा' : 'வருமான அனுமானம்',
            ok: expectedReturn <= 14, val: `${expectedReturn}%` },
          { label: lang === 'en' ? 'Real return (net inflation)' : lang === 'hi' ? 'वास्तविक रिटर्न' : 'உண்மையான வருமானம்',
            ok: expectedReturn - inflationRate >= 3, val: `${(expectedReturn - inflationRate).toFixed(1)}%` },
          { label: lang === 'en' ? 'Time horizon' : lang === 'hi' ? 'समय अवधि' : 'கால அளவு',
            ok: years >= 7, val: `${years} yrs` },
          { label: lang === 'en' ? 'Scenario' : lang === 'hi' ? 'परिदृश्य' : 'சூழல்',
            ok: scenario !== 'aggressive',
            val: scenario === 'conservative' ? '🐢 Conservative' : scenario === 'moderate' ? '⚖️ Moderate' : '🚀 Aggressive' },
        ].map((f, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '.7rem', padding: '4px 8px', borderRadius: 5,
            background: f.ok ? 'rgba(26,122,74,0.07)' : 'rgba(218,56,50,0.07)',
            border: `1px solid ${f.ok ? '#a8d8bb' : '#f0b0aa'}` }}>
            <span style={{ color: 'var(--text2)' }}>{f.label}</span>
            <span style={{ fontWeight: 700, color: f.ok ? '#1a7a4a' : '#da3832' }}>{f.val} {f.ok ? '✓' : '!'}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── FEATURE: Visual Milestone Timeline ─────────────────────
function MilestoneTimeline({ sip, expectedReturn, years, lang }) {
  const targets = [500000, 1000000, 2500000, 5000000, 10000000, 25000000, 50000000, 100000000];
  const labels  = ['₹5L','₹10L','₹25L','₹50L','₹1Cr','₹2.5Cr','₹5Cr','₹10Cr'];

  const milestones = targets.map((tgt, i) => {
    const r = expectedReturn / 100 / 12;
    let reached = null;
    for (let m = 1; m <= years * 12; m++) {
      const corpus = r > 0
        ? sip * ((Math.pow(1 + r, m) - 1) / r) * (1 + r)
        : sip * m;
      if (corpus >= tgt) { reached = +(m / 12).toFixed(1); break; }
    }
    return { label: labels[i], tgt, reached };
  });

  const lastReached = milestones.reduce((acc, m, i) => m.reached !== null ? i : acc, -1);
  const trackPct    = lastReached >= 0 ? ((lastReached + 1) / targets.length) * 100 : 0;

  return (
    <div className="milestone-timeline-wrap">
      <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
        <div style={{ minWidth: '520px', position: 'relative', paddingTop: '32px', paddingBottom: '8px' }}>
          {/* Track background */}
          <div style={{ position: 'absolute', top: '38px', left: '24px', right: '24px',
            height: '3px', background: 'var(--border)', borderRadius: 99 }} />
          {/* Track fill */}
          <div style={{ position: 'absolute', top: '38px', left: '24px',
            height: '3px', background: 'var(--hdfc-blue)', borderRadius: 99,
            width: `${trackPct}%`, transition: 'width .6s ease' }} />

          {/* Milestone dots */}
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {milestones.map((m, i) => {
              const done = m.reached !== null;
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column',
                  alignItems: 'center', flex: 1 }}>
                  {/* Dot */}
                  <div style={{
                    width: done ? '14px' : '10px', height: done ? '14px' : '10px',
                    borderRadius: '50%', zIndex: 2, marginBottom: '10px',
                    background: done ? 'var(--hdfc-blue)' : 'var(--white)',
                    border: `2px solid ${done ? 'var(--hdfc-blue)' : 'var(--border)'}`,
                    boxShadow: done ? '0 0 0 3px rgba(34,76,135,0.15)' : 'none',
                    transition: 'all .4s ease',
                  }} />
                  {/* Label */}
                  <div style={{ fontSize: '10px', fontWeight: done ? 700 : 400,
                    color: done ? 'var(--hdfc-blue)' : 'var(--text3)',
                    textAlign: 'center', lineHeight: 1.3 }}>{m.label}</div>
                  {/* Year badge */}
                  <div style={{ fontSize: '10px', marginTop: '2px', textAlign: 'center',
                    color: done ? 'var(--text2)' : 'var(--text3)',
                    fontWeight: done ? 600 : 400 }}>
                    {done ? `${m.reached}y` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {lastReached >= 0 && (
        <div style={{ fontSize: '.72rem', color: 'var(--text3)', marginTop: '.5rem', textAlign: 'center' }}>
          {lang === 'en'
            ? `Reaching ${milestones[lastReached].label} in ${milestones[lastReached].reached} years`
            : lang === 'hi'
            ? `${milestones[lastReached].reached} वर्षों में ${milestones[lastReached].label} तक पहुंचेंगे`
            : `${milestones[lastReached].reached} ஆண்டுகளில் ${milestones[lastReached].label} அடைவீர்கள்`}
        </div>
      )}
    </div>
  );
}

function validate(form) {
  const e = {};
  if (!form.presentCost || numOr(form.presentCost) <= 0) e.presentCost = 'Enter a valid goal amount';
  if (!form.years || numOr(form.years) < 1 || numOr(form.years) > 50) e.years = 'Years must be 1–50';
  if (numOr(form.inflationRate) < 0 || numOr(form.inflationRate) > 30) e.inflationRate = 'Inflation must be 0–30%';
  if (numOr(form.expectedReturn) < 1 || numOr(form.expectedReturn) > 50) e.expectedReturn = 'Return must be 1–50%';
  return e;
}

// ─── Behavioural nudges ─────────────────────────────────────
function getBehaviourNudges(form, lang) {
  const nudges = [];
  const ret = numOr(form.expectedReturn);
  const inf = numOr(form.inflationRate);
  const yr  = numOr(form.years);
  if (ret > 18)
    nudges.push({ type: 'warn', icon: '⚠️', msg: {
      en: `${ret}% annual return is historically rare. Consider using 12% for a realistic illustration.`,
      hi: `${ret}% वार्षिक रिटर्न ऐतिहासिक रूप से दुर्लभ है। वास्तविक चित्रण के लिए 12% उपयोग करें।`,
      ta: `${ret}% வருடாந்திர வருமானம் வரலாற்று ரீதியாக அரிதானது. யதார்த்தமான விளக்கத்திற்கு 12% பயன்படுத்துங்கள்.`,
    }[lang] });
  if (ret > 0 && ret <= inf)
    nudges.push({ type: 'warn', icon: '⚠️', msg: {
      en: `Return (${ret}%) ≤ inflation (${inf}%). Your real purchasing power may not grow.`,
      hi: `रिटर्न (${ret}%) ≤ महंगाई (${inf}%)। आपकी क्रय शक्ति नहीं बढ़ सकती।`,
      ta: `வருமானம் (${ret}%) ≤ பணவீக்கம் (${inf}%). உங்கள் கொள்முதல் சக்தி வளராமல் போகலாம்.`,
    }[lang] });
  if (inf > 12)
    nudges.push({ type: 'warn', icon: '⚠️', msg: {
      en: `Inflation above 12% is extremely high. India's long-term average is 5–7%.`,
      hi: `12% से ऊपर महंगाई बहुत अधिक है। भारत का दीर्घकालिक औसत 5–7% है।`,
      ta: `12% க்கு மேல் பணவீக்கம் மிக அதிகமாகும். இந்தியாவின் நீண்ட கால சராசரி 5–7% ஆகும்.`,
    }[lang] });
  if (yr < 3)
    nudges.push({ type: 'info', icon: 'ℹ️', msg: {
      en: `Very short horizon (${yr} yrs). SIP works best over 5+ years when compounding grows significantly.`,
      hi: `बहुत छोटी अवधि (${yr} वर्ष)। SIP 5+ वर्षों में सबसे अच्छा काम करती है।`,
      ta: `மிகவும் குறுகிய காலம் (${yr} ஆண்டுகள்). SIP 5+ ஆண்டுகளில் சிறப்பாக செயல்படுகிறது.`,
    }[lang] });
  if (ret >= 12 && ret <= 15 && inf >= 5 && inf <= 8)
    nudges.push({ type: 'good', icon: '✅', msg: {
      en: `Your assumptions (${ret}% return, ${inf}% inflation) are within realistic historical ranges. Good choice!`,
      hi: `आपकी मान्यताएं (${ret}% रिटर्न, ${inf}% महंगाई) यथार्थवादी सीमा में हैं। बढ़िया!`,
      ta: `உங்கள் அனுமானங்கள் (${ret}% வருமானம், ${inf}% பணவீக்கம்) யதார்த்தமான வரம்பில் உள்ளன. சிறப்பு!`,
    }[lang] });
  return nudges;
}

// ─── Smart insights ─────────────────────────────────────────
function getInsights(result, lang) {
  const { monthlySIP, totalInvested, totalGrowth, futureGoal, years, expectedReturn, pc } = result;
  const avgSalary = 35000;
  const sipPct    = ((monthlySIP / avgSalary) * 100).toFixed(0);
  const r = expectedReturn / 100 / 12;
  let doubleYear = null;
  for (let y = 1; y <= years; y++) {
    const n = y * 12;
    const corpus = monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    if (corpus >= totalInvested * 2) { doubleYear = y; break; }
  }
  const gainsPct = ((totalGrowth / totalInvested) * 100).toFixed(0);
  const inflationImpact = futureGoal - pc;

  return [
    {
      icon: '💼',
      title: { en: 'Affordability Check', hi: 'वहनीयता जांच', ta: 'வசதி சோதனை' }[lang],
      text: {
        en: `Your ₹${Math.round(monthlySIP).toLocaleString('en-IN')}/mo SIP is ~${sipPct}% of the avg Indian salary (₹35,000). ${sipPct < 20 ? 'Very manageable!' : sipPct < 40 ? 'Achievable with budgeting.' : 'Consider a longer timeline to reduce SIP.'}`,
        hi: `आपका ₹${Math.round(monthlySIP).toLocaleString('en-IN')}/माह SIP औसत भारतीय वेतन (₹35,000) का ~${sipPct}% है। ${sipPct < 20 ? 'बहुत सुलभ!' : sipPct < 40 ? 'बजट के साथ संभव।' : 'SIP कम करने के लिए लंबी अवधि पर विचार करें।'}`,
        ta: `உங்கள் ₹${Math.round(monthlySIP).toLocaleString('en-IN')}/மாத SIP சராசரி இந்திய சம்பளத்தின் (₹35,000) ~${sipPct}% ஆகும். ${sipPct < 20 ? 'மிகவும் நிர்வகிக்கக்கூடியது!' : sipPct < 40 ? 'பட்ஜெட்டுடன் சாத்தியம்.' : 'SIP குறைக்க நீண்ட காலத்தை பரிசீலியுங்கள்.'}`,
      }[lang],
    },
    doubleYear ? {
      icon: '📈',
      title: { en: 'Power of Compounding', hi: 'चक्रवृद्धि की शक्ति', ta: 'கூட்டு வட்டியின் சக்தி' }[lang],
      text: {
        en: `Your invested amount doubles in just ${doubleYear} years thanks to compounding at ${expectedReturn}% p.a. The longer you stay invested, the greater the compounding effect.`,
        hi: `${expectedReturn}% प्रति वर्ष की चक्रवृद्धि से आपकी निवेश राशि सिर्फ ${doubleYear} वर्षों में दोगुनी हो जाती है।`,
        ta: `${expectedReturn}% கூட்டு வட்டியால் உங்கள் முதலீடு ${doubleYear} ஆண்டுகளில் இரட்டிப்பாகும். நீண்ட காலம் முதலீடு செய்யும்போது, கூட்டு வட்டியின் விளைவு அதிகமாகும்.`,
      }[lang],
    } : null,
    {
      icon: '🎯',
      title: { en: 'Wealth Multiplier', hi: 'संपत्ति गुणक', ta: 'செல்வ பெருக்கி' }[lang],
      text: {
        en: `For every ₹1 you invest, compounding adds ₹${(totalGrowth / totalInvested).toFixed(2)} in gains. Your estimated gains (${formatShort(totalGrowth)}) are ${gainsPct}% of your total investment.`,
        hi: `आप जो ₹1 निवेश करते हैं, उस पर चक्रवृद्धि ₹${(totalGrowth / totalInvested).toFixed(2)} का लाभ जोड़ती है।`,
        ta: `நீங்கள் முதலீடு செய்யும் ₹1 க்கு, கூட்டு வட்டி ₹${(totalGrowth / totalInvested).toFixed(2)} ஆதாயம் சேர்க்கிறது.`,
      }[lang],
    },
    {
      icon: '🏷️',
      title: { en: 'Inflation Impact', hi: 'महंगाई का प्रभाव', ta: 'பணவீக்க தாக்கம்' }[lang],
      text: {
        en: `Inflation will add ${formatShort(inflationImpact)} to your goal over ${years} years. Simply saving in a bank account will not be enough — investing in market-linked instruments can help bridge this gap.`,
        hi: `महंगाई ${years} वर्षों में आपके लक्ष्य में ${formatShort(inflationImpact)} जोड़ देगी। बैंक खाते में बचत पर्याप्त नहीं होगी।`,
        ta: `பணவீக்கம் ${years} ஆண்டுகளில் உங்கள் இலக்கில் ${formatShort(inflationImpact)} சேர்க்கும். வங்கி கணக்கில் சேமிப்பது மட்டும் போதாது.`,
      }[lang],
    },
  ].filter(Boolean);
}

// ─── Tooltip ────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap"
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}       onBlur={() => setShow(false)}>
      <button type="button" className="tooltip-btn" aria-label="More information" tabIndex={0}>ℹ️</button>
      {show && <div className="tooltip-box" role="tooltip">{text}</div>}
    </span>
  );
}

// ─── Formula explainer ──────────────────────────────────────
function FormulaExplainer({ form, result, lang }) {
  const [open, setOpen] = useState(false);
  const pc  = numOr(form.presentCost), yr = numOr(form.years);
  const inf = numOr(form.inflationRate), ret = numOr(form.expectedReturn);
  const fv  = result ? result.futureGoal : calcFutureGoalValue(pc, yr, inf);
  const sip = result ? result.monthlySIP : calcRequiredSIP(fv, ret, yr);
  const r   = (ret / 100 / 12).toFixed(6);
  const n   = yr * 12;
  return (
    <div className="formula-wrap">
      <button type="button" className="formula-toggle" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {open ? t('hideFormula', lang) : t('showFormula', lang)}
      </button>
      {open && (
        <div className="formula-box animate-in">
          <div className="formula-step">
            <div className="formula-step-num">{t('formulaStep1', lang)}</div>
            <div className="formula-eq">FV = {formatShort(pc)} × (1 + {inf}%)^{yr}</div>
            <div className="formula-result">= {formatShort(fv)} 📌</div>
          </div>
          <div className="formula-divider" />
          <div className="formula-step">
            <div className="formula-step-num">{t('formulaStep2', lang)}</div>
            <div className="formula-eq">r = {ret}% ÷ 12 = {r}</div>
          </div>
          <div className="formula-divider" />
          <div className="formula-step">
            <div className="formula-step-num">{t('formulaStep3', lang)}</div>
            <div className="formula-eq">SIP = FV × r ÷ [((1+r)^n − 1) × (1+r)]</div>
            <div className="formula-calc">= {formatShort(fv)} × {r} ÷ [((1+{r})^{n}−1)×(1+{r})]</div>
            <div className="formula-result">= {formatShort(sip)} 🎯</div>
          </div>
          <div className="formula-note">{t('formulaIllust', lang)}</div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════
export default function Home() {
  const [lang, setLang]               = useState('en');
  const [form, setForm]               = useState(DEFAULT_FORM);
  const [errors, setErrors]           = useState({});
  const [result, setResult]           = useState(null);
  const [activeTab, setActiveTab]     = useState('chart');
  const [activeSection, setActiveSection] = useState('goal');
  const [activeScenario, setActiveScenario] = useState('moderate');
  const [topUpForm, setTopUpForm]     = useState(DEFAULT_TOPUP);
  const [topUpResult, setTopUpResult] = useState(null);
  const [bucketsForm, setBucketsForm] = useState(DEFAULT_BUCKETS);
  const [bucketsResult, setBucketsResult] = useState(null);
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [aiMessages, setAiMessages]   = useState([]);
  const [aiInput, setAiInput]         = useState('');
  const [aiLoading, setAiLoading]     = useState(false);
  const aiChatRef                     = useRef(null);

  const rangeStyle = (min, max, val) => ({ '--pct': `${((numOr(val) - min) / (max - min)) * 100}%` });
  const nudges = getBehaviourNudges(form, lang);

  const handleGoalPill = useCallback((goal) => {
    setForm(p => ({ ...p, goalId: goal.id,
      presentCost: goal.amount !== '' ? String(goal.amount) : p.presentCost,
      years:       goal.years  !== '' ? String(goal.years)  : p.years,
      inflationRate: goal.inflation !== '' ? String(goal.inflation) : p.inflationRate,
    }));
    setErrors({}); setResult(null);
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setErrors(p => ({ ...p, [name]: undefined }));
  }, []);

  const handleRange = useCallback((name, value) => setForm(p => ({ ...p, [name]: String(value) })), []);

  const handleScenario = useCallback((scenario) => {
    setActiveScenario(scenario.id);
    setForm(p => ({ ...p, inflationRate: scenario.inflationRate, expectedReturn: scenario.expectedReturn }));
    setResult(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const pc = numOr(form.presentCost), yr = numOr(form.years);
    const inf = numOr(form.inflationRate), ret = numOr(form.expectedReturn);
    const futureGoal    = calcFutureGoalValue(pc, yr, inf);
    const monthlySIP    = calcRequiredSIP(futureGoal, ret, yr);
    const growthData    = calcYearlyGrowth(monthlySIP, ret, yr);
    const milestones    = calcMilestones(monthlySIP, ret, yr);
    const totalInvested = monthlySIP * yr * 12;
    const lateStart     = calcLateStartPenalty(futureGoal, ret, yr);
    setResult({ pc, futureGoal, monthlySIP, totalInvested, totalGrowth: futureGoal - totalInvested, growthData, milestones, years: yr, expectedReturn: ret, inflationRate: inf, lateStart });
    setActiveTab('chart');
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(DEFAULT_FORM); setErrors({}); setResult(null);
    setTopUpResult(null); setBucketsResult(null);
  }, []);

  const handleTopUpCalc = useCallback(() => {
    const sip = numOr(topUpForm.initialSIP);
    if (!sip || sip <= 0) return;
    setTopUpResult(calcTopUpSIP(sip, numOr(topUpForm.topUpRate), numOr(topUpForm.topUpReturn), numOr(topUpForm.topUpYears)));
  }, [topUpForm]);

  const handleBucketsCalc = useCallback(() => {
    const pc = numOr(form.presentCost), yr = numOr(form.years), ret = numOr(form.expectedReturn);
    if (!pc || !yr) return;
    setBucketsResult(calcInflationBuckets({
      educationPct: numOr(bucketsForm.educationPct), medicalPct: numOr(bucketsForm.medicalPct),
      lifestylePct: numOr(bucketsForm.lifestylePct), educationInf: numOr(bucketsForm.educationInf),
      medicalInf:   numOr(bucketsForm.medicalInf),   lifestyleInf: numOr(bucketsForm.lifestyleInf),
    }, pc, yr, ret));
  }, [bucketsForm, form]);

  const handleAiSend = useCallback(async (overrideText) => {
    const text = (overrideText || aiInput).trim();
    if (!text || aiLoading) return;
    setAiInput('');

    // Build context from current calculator state
    const ctx = result
      ? `User's current SIP plan: Goal=${form.goalId}, Present Cost=₹${form.presentCost}, Years=${form.years}, Inflation=${form.inflationRate}%, Return=${form.expectedReturn}%, Required Monthly SIP=₹${Math.round(result.monthlySIP)}, Target Corpus=${formatShort(result.futureGoal)}, Total Invested=${formatShort(result.totalInvested)}, Est Gains=${formatShort(result.totalGrowth)}.`
      : 'User has not calculated a SIP plan yet.';

    const userMsg = { role: 'user', content: text };
    const newMessages = [...aiMessages, userMsg];
    setAiMessages(newMessages);
    setAiLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      if (aiChatRef.current) aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
    }, 50);

    try {
      // Force AI to respond in the user's selected language
      const langInstruction = lang === 'ta'
        ? `CRITICAL: You MUST respond ONLY in Tamil language (தமிழ்). Every word of your response must be in Tamil. Do not use English or Hindi at all. You are fully capable of speaking Tamil fluently.`
        : lang === 'hi'
        ? `CRITICAL: You MUST respond ONLY in Hindi language (हिन्दी). Every word of your response must be in Hindi. Do not use English or Tamil at all. You are fully capable of speaking Hindi fluently.`
        : `CRITICAL: You MUST respond ONLY in English. Keep it clear and simple.`;

      const systemPrompt = `You are an expert HDFC Mutual Fund financial advisor AI. You help Indian investors understand SIP (Systematic Investment Plan) investing, mutual funds, goal-based planning, inflation, and compounding.

${ctx}

${langInstruction}

Guidelines:
- Give concise, practical advice in 2-4 sentences
- Always remind users results are illustrative, not guaranteed
- Use Indian financial context (₹, lakhs, crores, SEBI, AMFI)
- Be warm, educational, and encouraging
- If asked about specific funds, remind them to consult a registered advisor
- Keep responses focused and helpful
- Never say you cannot speak a language — always respond in the language instructed above`;

      const res = await fetch('/api/ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, system: systemPrompt }),
      });

      const data = await res.json();
      if (data.content) {
        setAiMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setAiMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I could not process that. Please try again.' }]);
      }
    } catch {
      setAiMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please check your setup and try again.' }]);
    } finally {
      setAiLoading(false);
      setTimeout(() => {
        if (aiChatRef.current) aiChatRef.current.scrollTop = aiChatRef.current.scrollHeight;
      }, 100);
    }
  }, [aiInput, aiMessages, aiLoading, result, form]);

  const handlePDFDownload = useCallback(() => {
    if (!result) return;
    setPdfLoading(true);
    const insights = getInsights(result, lang);
    const content = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>HDFC SIP Plan</title>
    <style>body{font-family:Arial,sans-serif;color:#1a1a2e;padding:40px;max-width:800px;margin:0 auto}
    .header{background:#224c87;color:#fff;padding:24px 32px;border-radius:8px;margin-bottom:24px}
    .header h1{margin:0 0 4px;font-size:22px}.header p{margin:0;font-size:13px;opacity:.8}
    .sip-box{background:#224c87;color:#fff;padding:20px 24px;border-radius:8px;margin-bottom:20px}
    .sip-amt{font-size:36px;font-weight:800}.sip-sub{font-size:13px;opacity:.8;margin-top:4px}
    .grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px}
    .stat{background:#f4f6fb;border:1px solid #d0daea;border-radius:8px;padding:14px}
    .stat-label{font-size:11px;text-transform:uppercase;color:#919090;font-weight:700;margin-bottom:6px}
    .stat-value{font-size:18px;font-weight:800;color:#224c87}
    h2{color:#224c87;font-size:16px;border-bottom:2px solid #224c87;padding-bottom:6px;margin:20px 0 12px}
    table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:20px}
    th{background:#224c87;color:#fff;padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase}
    td{padding:9px 12px;border-bottom:1px solid #e2e8f0}tr:nth-child(even) td{background:#f8fafc}
    .insight{background:#f0f4fb;border-left:4px solid #224c87;border-radius:6px;padding:12px 16px;margin-bottom:10px}
    .insight-title{font-weight:700;font-size:13px;margin-bottom:4px;color:#224c87}
    .insight-text{font-size:12px;color:#444;line-height:1.6}
    .disclaimer{background:#fff8e1;border:1.5px solid #f0c040;border-radius:8px;padding:14px 16px;font-size:12px;color:#5a4000;line-height:1.7}
    @media print{body{padding:20px}}</style></head><body>
    <div class="header">
      <h1>HDFC Mutual Fund — ${t('heroTitle', lang)}</h1>
      <p>${t('heroEyebrow', lang)} · ${new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
    <div class="sip-box">
      <div style="font-size:12px;opacity:.8;text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">${t('requiredSIP', lang)}</div>
      <div class="sip-amt">${formatShort(result.monthlySIP)}</div>
      <div class="sip-sub">${t('perMonthFor', lang)} ${result.years} ${t('years', lang)} · ${result.inflationRate}% · ${result.expectedReturn}%</div>
    </div>
    <div class="grid">
      <div class="stat"><div class="stat-label">${t('presentCost', lang)}</div><div class="stat-value">${formatShort(result.pc)}</div></div>
      <div class="stat"><div class="stat-label">${t('inflatedGoal', lang)}</div><div class="stat-value">${formatShort(result.futureGoal)}</div></div>
      <div class="stat"><div class="stat-label">${t('totalInvested', lang)}</div><div class="stat-value">${formatShort(result.totalInvested)}</div></div>
      <div class="stat"><div class="stat-label">${t('estGains', lang)}</div><div class="stat-value" style="color:#1a7a4a">${formatShort(result.totalGrowth)}</div></div>
      <div class="stat"><div class="stat-label">${t('targetCorpus', lang)}</div><div class="stat-value">${formatShort(result.futureGoal)}</div></div>
      <div class="stat"><div class="stat-label">${t('assumedReturn', lang)}</div><div class="stat-value" style="color:#b5620a">${result.expectedReturn}% p.a.</div></div>
    </div>
    <h2>${t('insightsTitle', lang)}</h2>
    ${insights.map(i=>`<div class="insight"><div class="insight-title">${i.icon} ${i.title}</div><div class="insight-text">${i.text}</div></div>`).join('')}
    <h2>${t('milestones', lang)}</h2>
    <table><thead><tr><th>Year</th><th>${t('totalInvested', lang)}</th><th>${t('totalCorpus', lang)}</th><th>${t('estGains', lang)}</th></tr></thead>
    <tbody>${result.milestones.map(m=>`<tr><td>Yr ${m.year}</td><td>${formatShort(m.invested)}</td><td>${formatShort(m.corpus)}</td><td style="color:#1a7a4a">${formatShort(m.growth)}</td></tr>`).join('')}</tbody></table>
    <div class="disclaimer"><strong>${t('disclaimerTitle', lang)}:</strong> ${t('disclaimerText', lang)}</div>
    </body></html>`;
    const blob = new Blob([content],{type:'text/html'});
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url,'_blank');
    if (win) win.onload = () => { win.print(); URL.revokeObjectURL(url); };
    setPdfLoading(false);
  }, [result, lang]);

  // Tooltip texts per language
  const tooltips = {
    cost: {
      en: "Enter what your goal costs TODAY. We will automatically inflate it to future value.",
      hi: "आज की लागत दर्ज करें। हम इसे भविष्य के मूल्य तक स्वचालित रूप से बढ़ाएंगे।",
      ta: "இன்றைய செலவை உள்ளிடுங்கள். நாங்கள் தானாகவே அதை எதிர்கால மதிப்பிற்கு கணக்கிடுவோம்.",
    },
    years: {
      en: "Longer horizon = smaller monthly SIP. Even 2–3 extra years significantly reduces your SIP.",
      hi: "लंबी अवधि = छोटी मासिक SIP। 2–3 अतिरिक्त वर्ष आपकी SIP को काफी कम कर देते हैं।",
      ta: "நீண்ட காலம் = குறைவான மாதாந்திர SIP. 2–3 கூடுதல் ஆண்டுகள் உங்கள் SIP ஐ கணிசமாக குறைக்கும்.",
    },
    inflation: {
      en: "Prices rise over time. India's avg long-term inflation: 5–7%. Education/medical is 8–10%.",
      hi: "समय के साथ कीमतें बढ़ती हैं। भारत की औसत दीर्घकालिक महंगाई: 5–7%। शिक्षा/चिकित्सा: 8–10%।",
      ta: "காலப்போக்கில் விலைகள் உயரும். இந்தியாவின் சராசரி நீண்ட கால பணவீக்கம்: 5–7%. கல்வி/மருத்துவம்: 8–10%.",
    },
    returns: {
      en: "Historical avg for equity mutual funds in India: 10–15%. Use 12% as a balanced assumption. Not guaranteed.",
      hi: "भारत में इक्विटी म्यूचुअल फंड का ऐतिहासिक औसत: 10–15%। संतुलित धारणा के लिए 12% उपयोग करें।",
      ta: "இந்தியாவில் ஈக்விட்டி மியூச்சுவல் ஃபண்டின் வரலாற்று சராசரி: 10–15%. சமநிலை அனுமானத்திற்கு 12% பயன்படுத்துங்கள்.",
    },
  };

  return (
    <>
      <Head><title>{t('heroTitle', lang)} | HDFC Mutual Fund</title></Head>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <div className="app-shell">
        {/* HEADER */}
        <header className="site-header" role="banner">
          <a href="/" className="logo" aria-label="HDFC Mutual Fund SIP Calculator">
            <span className="logo-icon" aria-hidden="true">📊</span>
            <div>
              <div className="logo-text">{t('brand', lang)}</div>
              <div className="logo-sub">{t('tagline', lang)}</div>
            </div>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* LANGUAGE SWITCHER */}
            <div className="lang-switcher" role="group" aria-label="Select language">
              {LANGUAGES.map(l => (
                <button key={l.code}
                  className={`lang-btn${lang === l.code ? ' active' : ''}`}
                  onClick={() => setLang(l.code)}
                  aria-pressed={lang === l.code}
                  title={l.name}>
                  {l.label}
                </button>
              ))}
            </div>
            <span className="header-badge">{t('badgeLabel', lang)}</span>
          </div>
        </header>

        <main id="main-content" className="main-content" role="main">

          {/* HERO */}
          <div className="hero animate-in">
            <div className="hero-eyebrow">{t('heroEyebrow', lang)}</div>
            <h1>{t('heroTitle', lang)}</h1>
            <p>{t('heroDesc', lang)}</p>
          </div>

          {/* STEPS */}
          <div className="steps-row animate-in" style={{ marginBottom: '2rem' }}>
            {[
              { num: t('step1num',lang), title: t('step1title',lang), desc: t('step1desc',lang) },
              { num: t('step2num',lang), title: t('step2title',lang), desc: t('step2desc',lang) },
              { num: t('step3num',lang), title: t('step3title',lang), desc: t('step3desc',lang) },
            ].map(s => (
              <div className="step-card" key={s.num}>
                <div className="step-num">{s.num}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          {/* SECTION TABS */}
          <div className="section-tabs" role="tablist">
            {[
              { id: 'goal',    key: 'tabGoal' },
              { id: 'topup',   key: 'tabTopUp' },
              { id: 'buckets', key: 'tabBuckets' },
              { id: 'ai',      label: '🤖 AI Advisor' },
            ].map(s => (
              <button key={s.id} role="tab" aria-selected={activeSection === s.id}
                className={`section-tab${activeSection === s.id ? ' active' : ''}${s.id === 'ai' ? ' ai-tab' : ''}`}
                onClick={() => setActiveSection(s.id)}>
                {s.label || t(s.key, lang)}
              </button>
            ))}
          </div>

          {/* ═══ GOAL CALCULATOR ═══ */}
          {activeSection === 'goal' && (
            <div className="calc-grid">
              {/* LEFT */}
              <section aria-labelledby="input-heading">
                <div className="card animate-in">
                  <div className="card-header">
                    <div className="card-icon">🎯</div>
                    <div>
                      <h2 className="card-title" id="input-heading">{t('defineGoal', lang)}</h2>
                      <div className="card-subtitle">{t('defineGoalSub', lang)}</div>
                    </div>
                  </div>

                  {nudges.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      {nudges.map((n, i) => (
                        <div key={i} className={`nudge nudge-${n.type}`} role="alert">
                          <span>{n.icon}</span> {n.msg}
                        </div>
                      ))}
                    </div>
                  )}

                  <fieldset style={{ border: 'none', padding: 0, marginBottom: '1.25rem' }}>
                    <legend style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '.75rem', display: 'block' }}>{t('selectGoal', lang)}</legend>
                    <div className="goal-cards">
                      {GOAL_KEYS.map(g => (
                        <button key={g.id} type="button"
                          className={`goal-card${form.goalId === g.id ? ' active' : ''}`}
                          onClick={() => handleGoalPill(g)}
                          aria-pressed={form.goalId === g.id}>
                          <div className="gc-emoji">{t(g.labelKey, lang).split(' ')[0]}</div>
                          <div className="gc-name">{t(g.labelKey, lang).split(' ').slice(1).join(' ')}</div>
                          <div className="gc-amount">
                            {g.amount !== '' ? formatShort(g.amount) : '—'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <hr className="divider" />

                  {/* SCENARIO PRESETS */}
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '.5rem' }}>
                      {lang === 'en' ? '🔀 What-If Scenario' : lang === 'hi' ? '🔀 क्या-होगा-अगर परिदृश्य' : '🔀 என்ன-ஆகும் சூழல்'}
                    </div>
                    <div className="scenario-row">
                      {SCENARIOS.map(s => (
                        <button key={s.id} type="button"
                          className={`scenario-btn${activeScenario === s.id ? ' active' : ''}`}
                          style={{ '--sc-color': s.color }}
                          onClick={() => handleScenario(s)}
                          aria-pressed={activeScenario === s.id}>
                          <div className="sc-label">{s.label[lang]}</div>
                          <div className="sc-desc">{s.desc[lang]}</div>
                          <div className="sc-rates">{s.inflationRate}% inf · {s.expectedReturn}% ret</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="presentCost" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('currentCost', lang)} <Tooltip text={tooltips.cost[lang]} />
                    </label>
                    <div className="input-wrap">
                      <span className="input-prefix">₹</span>
                      <input id="presentCost" name="presentCost" type="number"
                        className="has-prefix" placeholder={t('costPlaceholder', lang)}
                        value={form.presentCost} onChange={handleChange}
                        aria-required="true" aria-invalid={!!errors.presentCost} />
                    </div>
                    {errors.presentCost && <div className="error-msg show" role="alert">⚠ {errors.presentCost}</div>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="yearsRange" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('timeHorizon', lang)} <Tooltip text={tooltips.years[lang]} />
                    </label>
                    <div className="range-group">
                      <input id="yearsRange" type="range" min="1" max="40" step="1"
                        value={numOr(form.years, 12)}
                        onChange={e => handleRange('years', e.target.value)}
                        style={rangeStyle(1, 40, form.years)}
                        aria-valuenow={numOr(form.years, 12)} aria-valuemin={1} aria-valuemax={40} />
                      <span className="range-val">{numOr(form.years, 12)} {t('yr', lang)}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="inflationRange" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('inflationRate', lang)} <Tooltip text={tooltips.inflation[lang]} />
                    </label>
                    <div className="range-group">
                      <input id="inflationRange" type="range" min="0" max="20" step="0.5"
                        value={numOr(form.inflationRate, 6)}
                        onChange={e => handleRange('inflationRate', e.target.value)}
                        style={rangeStyle(0, 20, form.inflationRate)} />
                      <span className="range-val">{numOr(form.inflationRate, 6).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="returnRange" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {t('expectedReturn', lang)} <Tooltip text={tooltips.returns[lang]} />
                    </label>
                    <div className="range-group">
                      <input id="returnRange" type="range" min="1" max="30" step="0.5"
                        value={numOr(form.expectedReturn, 12)}
                        onChange={e => handleRange('expectedReturn', e.target.value)}
                        style={rangeStyle(1, 30, form.expectedReturn)} />
                      <span className="range-val">{numOr(form.expectedReturn, 12).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="assumptions-box" role="note">
                    <p><strong>{t('assumptions', lang)}:</strong> {t('inflationRate', lang)} {numOr(form.inflationRate, 6).toFixed(1)}% · {t('expectedReturn', lang)} {numOr(form.expectedReturn, 12).toFixed(1)}% · {numOr(form.years, 12)} {t('yr', lang)}</p>
                  </div>

                  <FormulaExplainer form={form} result={result} lang={lang} />

                  <button type="button" className="calc-btn" onClick={handleCalculate}>{t('calculateBtn', lang)}</button>
                  <button type="button" className="reset-btn" onClick={handleReset}>{t('resetBtn', lang)}</button>
                </div>
              </section>

              {/* RIGHT */}
              <section aria-live="polite">
                {result ? (
                  <div className="results-col animate-in" key={String(result.monthlySIP)}>
                    <div className="highlight-card">
                      <div className="highlight-sip">
                        <div className="hl-label">{t('requiredSIP', lang)}</div>
                        <div className="hl-amount">
                          <AnimatedAmount value={result.monthlySIP} />
                        </div>
                        <div className="hl-sub">{t('perMonthFor', lang)} {result.years} {t('years', lang)}</div>
                      </div>
                      <div className="highlight-meta">
                        <div className="meta-item"><span className="meta-dot" style={{ background: 'rgba(255,255,255,0.6)' }}></span>{t('totalInvested', lang)}: <strong><AnimatedAmount value={result.totalInvested} /></strong></div>
                        <div className="meta-item"><span className="meta-dot" style={{ background: '#6ee7b7' }}></span>{t('estGains', lang)}: <strong style={{ color: '#6ee7b7' }}><AnimatedAmount value={result.totalGrowth} /></strong></div>
                      </div>
                    </div>

                    {/* DONUT CHART */}
                    <div className="card donut-card">
                      <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--hdfc-blue)', marginBottom: '.75rem' }}>
                        🍩 {lang === 'en' ? 'Your Money vs Market Returns' : lang === 'hi' ? 'आपका पैसा vs बाजार रिटर्न' : 'உங்கள் பணம் vs சந்தை வருமானம்'}
                      </div>
                      <DonutChart invested={result.totalInvested} gains={result.totalGrowth} lang={lang} />
                      {result.totalGrowth > result.totalInvested && (
                        <div className="donut-wow">
                          🎉 {lang === 'en'
                            ? `The market earned MORE than you invested! Compounding at work.`
                            : lang === 'hi'
                            ? 'बाजार ने आपके निवेश से अधिक कमाया! चक्रवृद्धि का जादू।'
                            : 'சந்தை நீங்கள் முதலீடு செய்ததை விட அதிகமாக சம்பாதித்தது! கூட்டு வட்டியின் அதிசயம்.'}
                        </div>
                      )}
                    </div>

                    {/* RISK GAUGE */}
                    <div className="card">
                      <RiskGauge
                        monthlySIP={result.monthlySIP}
                        years={result.years}
                        expectedReturn={result.expectedReturn}
                        inflationRate={result.inflationRate}
                        scenario={activeScenario}
                        lang={lang}
                      />
                    </div>

                    <div className="stats-grid">
                      {[
                        { labelKey: 'presentCost',   value: result.pc,            cls: 'sv-blue',  noteKey: 'todaysValue' },
                        { labelKey: 'inflatedGoal',  value: result.futureGoal,    cls: 'sv-amber', note: `After ${result.years} ${t('yr',lang)} @ ${result.inflationRate}%` },
                        { labelKey: 'targetCorpus',  value: result.futureGoal,    cls: 'sv-green', noteKey: 'amountNeeded' },
                        { labelKey: 'totalInvested', value: result.totalInvested, cls: 'sv-blue',  note: `${result.years * 12} ${t('monthlyPayments',lang)}` },
                        { labelKey: 'estGains',      value: result.totalGrowth,   cls: 'sv-green', noteKey: 'powerComp' },
                      ].map(s => (
                        <div className="stat-card" key={s.labelKey}>
                          <div className="stat-label">{t(s.labelKey, lang)}</div>
                          <div className={`stat-value ${s.cls}`}><AnimatedAmount value={s.value} /></div>
                          <div className="stat-note">{s.note || t(s.noteKey, lang)}</div>
                        </div>
                      ))}
                      <div className="stat-card">
                        <div className="stat-label">{t('assumedReturn', lang)}</div>
                        <div className="stat-value sv-amber">{result.expectedReturn}% p.a.</div>
                        <div className="stat-note">{t('yourAssumption', lang)}</div>
                      </div>
                    </div>

                    {/* Smart Insights */}
                    <div className="card insights-card">
                      <div className="insights-header">
                        <span>💡</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--hdfc-blue)' }}>{t('insightsTitle', lang)}</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{t('insightsSub', lang)}</div>
                        </div>
                      </div>
                      <div className="insights-list">
                        {getInsights(result, lang).map((ins, i) => (
                          <div key={i} className="insight-item">
                            <div className="insight-icon">{ins.icon}</div>
                            <div>
                              <div className="insight-title">{ins.title}</div>
                              <div className="insight-text">{ins.text}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="card">
                      <div className="tabs" role="tablist">
                        {[
                          { id: 'chart',      key: 'growthChart' },
                          { id: 'milestones', key: 'milestones' },
                          { id: 'late',       key: 'lateStart' },
                        ].map(tb => (
                          <button key={tb.id} role="tab" aria-selected={activeTab === tb.id}
                            className={`tab-btn${activeTab === tb.id ? ' active' : ''}`}
                            onClick={() => setActiveTab(tb.id)}>{t(tb.key, lang)}</button>
                        ))}
                      </div>

                      {activeTab === 'chart' && (
                        <div>
                          <div className="chart-legend">
                            <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--hdfc-blue)' }}></div>{t('totalCorpus', lang)}</div>
                            <div className="legend-item"><div className="legend-dot" style={{ background: 'var(--green)' }}></div>{t('amtInvested', lang)}</div>
                          </div>
                          <div className="chart-wrap"><GrowthChart data={result.growthData} /></div>
                        </div>
                      )}
                      {activeTab === 'milestones' && (
                        <MilestoneTimeline
                          sip={result.monthlySIP}
                          expectedReturn={result.expectedReturn}
                          years={result.years}
                          lang={lang}
                        />
                      )}
                      {activeTab === 'late' && (
                        <div>
                          <p style={{ fontSize: '.78rem', color: 'var(--text3)', marginBottom: '1rem', lineHeight: 1.6 }}>{t('lateStartDesc', lang)}</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem' }}>
                            {result.lateStart.map((s, i) => (
                              <div key={s.delay} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', borderRadius: 8,
                                background: i === 0 ? 'rgba(26,122,74,0.08)' : 'rgba(218,56,50,0.06)',
                                border: `1.5px solid ${i === 0 ? '#1a7a4a' : '#e0c0b0'}`,
                              }}>
                                <div>
                                  <div style={{ fontWeight: 700, fontSize: '.85rem', color: i === 0 ? '#1a7a4a' : 'var(--hdfc-red)' }}>{i === 0 ? t('startToday', lang) : s.label}</div>
                                  <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{s.years} {t('yearsRemaining', lang)}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                  <div style={{ fontWeight: 800, fontSize: '1rem', color: i === 0 ? '#1a7a4a' : 'var(--hdfc-red)' }}>{formatShort(s.sip)}/mo</div>
                                  {i > 0
                                    ? <div style={{ fontSize: '.72rem', color: 'var(--hdfc-red)' }}>+{formatShort(s.extraPerMonth)} {t('extraPerMonth', lang)}</div>
                                    : <div style={{ fontSize: '.72rem', color: '#1a7a4a' }}>{t('bestTimeStart', lang)}</div>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button type="button" className="pdf-btn" onClick={handlePDFDownload} disabled={pdfLoading}>
                      {pdfLoading ? t('generating', lang) : t('downloadPDF', lang)}
                    </button>

                    <div className="disclaimer" role="note">
                      <span className="disclaimer-icon">⚠️</span>
                      <p><strong>{t('disclaimerTitle', lang)}:</strong> {t('disclaimerText', lang)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="card animate-in">
                    <div className="empty-state">
                      <div className="empty-icon">📊</div>
                      <h3>{t('resultsHere', lang)}</h3>
                      <p>{t('resultsHereSub', lang)}</p>
                    </div>
                    <div className="disclaimer" style={{ marginTop: '1.5rem' }} role="note">
                      <span className="disclaimer-icon">⚠️</span>
                      <p><strong>{t('disclaimerTitle', lang)}:</strong> {t('disclaimerText', lang)}</p>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══ STEP-UP SIP ═══ */}
          {activeSection === 'topup' && (
            <div className="calc-grid">
              <section>
                <div className="card animate-in">
                  <div className="card-header">
                    <div className="card-icon">📈</div>
                    <div>
                      <h2 className="card-title">{t('tabTopUp', lang)}</h2>
                      <div className="card-subtitle">{lang === 'en' ? 'Increase your SIP each year as your income grows' : lang === 'hi' ? 'आय बढ़ने पर हर साल SIP बढ़ाएं' : 'வருமானம் வளரும்போது ஒவ்வொரு ஆண்டும் SIP அதிகரிக்கவும்'}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="initialSIP">{lang === 'en' ? 'Initial Monthly SIP (₹)' : lang === 'hi' ? 'प्रारंभिक मासिक SIP (₹)' : 'ஆரம்ப மாதாந்திர SIP (₹)'}</label>
                    <div className="input-wrap">
                      <span className="input-prefix">₹</span>
                      <input id="initialSIP" type="number" className="has-prefix" placeholder="5000"
                        value={topUpForm.initialSIP}
                        onChange={e => setTopUpForm(p => ({ ...p, initialSIP: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{lang === 'en' ? 'Annual Step-Up Rate (%)' : lang === 'hi' ? 'वार्षिक स्टेप-अप दर (%)' : 'வருடாந்திர படி-மேல் விகிதம் (%)'}</label>
                    <div className="range-group">
                      <input type="range" min="1" max="30" step="1" value={numOr(topUpForm.topUpRate, 10)}
                        onChange={e => setTopUpForm(p => ({ ...p, topUpRate: e.target.value }))}
                        style={rangeStyle(1, 30, topUpForm.topUpRate)} />
                      <span className="range-val">{numOr(topUpForm.topUpRate, 10)}%</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('expectedReturn', lang)}</label>
                    <div className="range-group">
                      <input type="range" min="1" max="30" step="0.5" value={numOr(topUpForm.topUpReturn, 12)}
                        onChange={e => setTopUpForm(p => ({ ...p, topUpReturn: e.target.value }))}
                        style={rangeStyle(1, 30, topUpForm.topUpReturn)} />
                      <span className="range-val">{numOr(topUpForm.topUpReturn, 12).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('timeHorizon', lang)}</label>
                    <div className="range-group">
                      <input type="range" min="1" max="40" step="1" value={numOr(topUpForm.topUpYears, 12)}
                        onChange={e => setTopUpForm(p => ({ ...p, topUpYears: e.target.value }))}
                        style={rangeStyle(1, 40, topUpForm.topUpYears)} />
                      <span className="range-val">{numOr(topUpForm.topUpYears, 12)} {t('yr', lang)}</span>
                    </div>
                  </div>
                  <button type="button" className="calc-btn" onClick={handleTopUpCalc}>
                    {lang === 'en' ? 'Calculate Step-Up SIP' : lang === 'hi' ? 'स्टेप-अप SIP गणना करें' : 'படி-மேல் SIP கணக்கிடுங்கள்'}
                  </button>
                </div>
              </section>
              <section aria-live="polite">
                {topUpResult ? (
                  <div className="results-col animate-in">
                    <div className="highlight-card">
                      <div className="highlight-sip">
                        <div className="hl-label">{lang === 'en' ? 'Final Corpus' : lang === 'hi' ? 'अंतिम कोष' : 'இறுதி நிதித்திரள்'}</div>
                        <div className="hl-amount">{formatShort(topUpResult.finalCorpus)}</div>
                      </div>
                      <div className="highlight-meta">
                        <div className="meta-item"><span className="meta-dot" style={{ background: 'rgba(255,255,255,0.6)' }}></span>{t('totalInvested', lang)}: <strong>{formatShort(topUpResult.totalInvested)}</strong></div>
                        <div className="meta-item"><span className="meta-dot" style={{ background: '#6ee7b7' }}></span>{t('estGains', lang)}: <strong style={{ color: '#6ee7b7' }}>{formatShort(topUpResult.totalGains)}</strong></div>
                      </div>
                    </div>
                    <div className="card">
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--bg2)', border: '2px solid var(--hdfc-blue)', borderRadius: 10, padding: '1.25rem' }}>
                          <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--hdfc-blue)', textTransform: 'uppercase', marginBottom: 6 }}>{lang === 'en' ? 'Step-Up SIP' : lang === 'hi' ? 'स्टेप-अप SIP' : 'படி-மேல் SIP'}</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--hdfc-blue)' }}>{formatShort(topUpResult.finalCorpus)}</div>
                        </div>
                        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '1.25rem' }}>
                          <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 6 }}>{lang === 'en' ? 'Regular SIP' : lang === 'hi' ? 'नियमित SIP' : 'வழக்கமான SIP'}</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text2)' }}>{formatShort(topUpResult.regular.finalCorpus)}</div>
                        </div>
                      </div>
                      <div style={{ padding: '12px 16px', background: 'rgba(26,122,74,0.08)', border: '1.5px solid #1a7a4a', borderRadius: 8, fontSize: '.82rem', fontWeight: 700, color: '#1a7a4a' }}>
                        💡 {lang === 'en' ? `Step-Up builds ${formatShort(topUpResult.extraGains)} more wealth!` : lang === 'hi' ? `स्टेप-अप SIP ${formatShort(topUpResult.extraGains)} अधिक संपत्ति बनाती है!` : `படி-மேல் SIP ${formatShort(topUpResult.extraGains)} கூடுதல் செல்வம் உருவாக்குகிறது!`}
                      </div>
                    </div>
                    <div className="disclaimer" role="note">
                      <span className="disclaimer-icon">⚠️</span>
                      <p><strong>{t('disclaimerTitle', lang)}:</strong> {t('disclaimerText', lang)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="card animate-in">
                    <div className="empty-state">
                      <div className="empty-icon">📈</div>
                      <h3>{lang === 'en' ? 'Results will appear here' : lang === 'hi' ? 'परिणाम यहाँ दिखेंगे' : 'முடிவுகள் இங்கே தோன்றும்'}</h3>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══ INFLATION BUCKETS ═══ */}
          {activeSection === 'buckets' && (
            <div className="calc-grid">
              <section>
                <div className="card animate-in">
                  <div className="card-header">
                    <div className="card-icon">🏥</div>
                    <div>
                      <h2 className="card-title">{t('tabBuckets', lang)}</h2>
                      <div className="card-subtitle">{lang === 'en' ? 'Different inflation rates for different life expenses' : lang === 'hi' ? 'विभिन्न जीवन खर्चों के लिए अलग महंगाई दरें' : 'வெவ்வேறு வாழ்க்கை செலவுகளுக்கு வெவ்வேறு பணவீக்க விகிதங்கள்'}</div>
                    </div>
                  </div>
                  {[
                    { label: lang === 'en' ? '🎓 Education' : lang === 'hi' ? '🎓 शिक्षा' : '🎓 கல்வி', color: 'var(--hdfc-blue)', pctKey: 'educationPct', infKey: 'educationInf', defPct: 40, defInf: 8 },
                    { label: lang === 'en' ? '🏥 Medical'   : lang === 'hi' ? '🏥 चिकित्सा' : '🏥 மருத்துவம்', color: 'var(--hdfc-red)',  pctKey: 'medicalPct',   infKey: 'medicalInf',   defPct: 20, defInf: 10 },
                    { label: lang === 'en' ? '✨ Lifestyle' : lang === 'hi' ? '✨ जीवनशैली' : '✨ வாழ்க்கை முறை', color: 'var(--green)',     pctKey: 'lifestylePct', infKey: 'lifestyleInf', defPct: 40, defInf: 6 },
                  ].map(b => (
                    <div key={b.pctKey} className="bucket-card" style={{ borderLeft: `4px solid ${b.color}` }}>
                      <div className="bucket-title">{b.label}</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>{lang === 'en' ? '% of Total' : lang === 'hi' ? 'कुल का %' : 'மொத்தத்தின் %'}</label>
                          <div className="range-group">
                            <input type="range" min="0" max="100" step="5"
                              value={numOr(bucketsForm[b.pctKey], b.defPct)}
                              onChange={e => setBucketsForm(p => ({ ...p, [b.pctKey]: e.target.value }))}
                              style={rangeStyle(0, 100, bucketsForm[b.pctKey])} />
                            <span className="range-val">{numOr(bucketsForm[b.pctKey], b.defPct)}%</span>
                          </div>
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label>{lang === 'en' ? 'Inflation Rate' : lang === 'hi' ? 'महंगाई दर' : 'பணவீக்க விகிதம்'}</label>
                          <div className="range-group">
                            <input type="range" min="0" max="20" step="0.5"
                              value={numOr(bucketsForm[b.infKey], b.defInf)}
                              onChange={e => setBucketsForm(p => ({ ...p, [b.infKey]: e.target.value }))}
                              style={rangeStyle(0, 20, bucketsForm[b.infKey])} />
                            <span className="range-val">{numOr(bucketsForm[b.infKey], b.defInf).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="calc-btn" style={{ marginTop: '1rem' }} onClick={handleBucketsCalc}>
                    {lang === 'en' ? 'Calculate with Inflation Assumptions' : lang === 'hi' ? 'महंगाई मान्यताओं के साथ गणना करें' : 'பணவீக்க அனுமானங்களுடன் கணக்கிடுங்கள்'}
                  </button>
                </div>
              </section>
              <section aria-live="polite">
                {bucketsResult ? (
                  <div className="results-col animate-in">
                    <div className="highlight-card">
                      <div className="highlight-sip">
                        <div className="hl-label">{lang === 'en' ? 'Blended Monthly SIP' : lang === 'hi' ? 'मिश्रित मासिक SIP' : 'கலந்த மாதாந்திர SIP'}</div>
                        <div className="hl-amount">{formatShort(bucketsResult.blendedSIP)}</div>
                      </div>
                      <div className="highlight-meta">
                        <div className="meta-item"><span className="meta-dot" style={{ background: 'rgba(255,255,255,0.6)' }}></span>{lang === 'en' ? 'Simple SIP' : lang === 'hi' ? 'सरल SIP' : 'எளிய SIP'}: <strong>{formatShort(bucketsResult.simpleSIP)}</strong></div>
                        <div className="meta-item"><span className="meta-dot" style={{ background: '#fca5a5' }}></span>{lang === 'en' ? 'Extra' : lang === 'hi' ? 'अतिरिक्त' : 'கூடுதல்'}: <strong style={{ color: '#fca5a5' }}>+{formatShort(bucketsResult.extraSIP)}/mo</strong></div>
                      </div>
                    </div>
                    <div className="card">
                      {bucketsResult.buckets.map(b => (
                        <div key={b.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 8, marginBottom: '.6rem', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{b.name}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{b.pct}% · {b.inflation}% p.a.</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--hdfc-blue)' }}>{formatShort(b.fv)}</div>
                            <div style={{ fontSize: '.72rem', color: 'var(--text3)' }}>{lang === 'en' ? 'from' : lang === 'hi' ? 'से' : 'இல் இருந்து'} {formatShort(b.cost)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="disclaimer" role="note">
                      <span className="disclaimer-icon">⚠️</span>
                      <p><strong>{t('disclaimerTitle', lang)}:</strong> {t('disclaimerText', lang)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="card animate-in">
                    <div className="empty-state">
                      <div className="empty-icon">🏥</div>
                      <h3>{lang === 'en' ? 'Results will appear here' : lang === 'hi' ? 'परिणाम यहाँ दिखेंगे' : 'முடிவுகள் இங்கே தோன்றும்'}</h3>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ═══ AI ADVISOR ═══ */}
          {activeSection === 'ai' && (
            <div className="ai-advisor-wrap animate-in">
              {/* Left: Intro + Quick Questions */}
              <div className="ai-left">
                <div className="card ai-intro-card">
                  <div className="ai-avatar">🤖</div>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--hdfc-blue)', margin: '0 0 .5rem' }}>
                    {lang === 'en' ? 'AI Financial Advisor' : lang === 'hi' ? 'AI वित्तीय सलाहकार' : 'AI நிதி ஆலோசகர்'}
                  </h2>
                  <p style={{ fontSize: '.8rem', color: 'var(--text3)', lineHeight: 1.6, margin: '0 0 1rem' }}>
                    {lang === 'en'
                      ? 'Powered by Claude AI. Ask me anything about your SIP plan, mutual funds, inflation, or investment strategy.'
                      : lang === 'hi'
                      ? 'Claude AI द्वारा संचालित। SIP, म्यूचुअल फंड, महंगाई या निवेश रणनीति के बारे में कुछ भी पूछें।'
                      : 'Claude AI மூலம் இயக்கப்படுகிறது. உங்கள் SIP திட்டம், மியூச்சுவல் ஃபண்ட் பற்றி எதையும் கேளுங்கள்.'}
                  </p>
                  {result && (
                    <div className="ai-context-box">
                      <div style={{ fontSize: '.7rem', fontWeight: 700, color: 'var(--hdfc-blue)', marginBottom: 4 }}>
                        📊 {lang === 'en' ? 'Your Plan Context' : lang === 'hi' ? 'आपकी योजना संदर्भ' : 'உங்கள் திட்ட சூழல்'}
                      </div>
                      <div style={{ fontSize: '.72rem', color: 'var(--text2)' }}>
                        SIP: <strong>₹{Math.round(result.monthlySIP).toLocaleString('en-IN')}/mo</strong> ·
                        Goal: <strong>{formatShort(result.futureGoal)}</strong> ·
                        {result.years} {lang === 'en' ? 'yrs' : lang === 'hi' ? 'वर्ष' : 'ஆண்.'}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card" style={{ marginTop: '1rem' }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text2)', marginBottom: '.75rem' }}>
                    💬 {lang === 'en' ? 'Quick Questions' : lang === 'hi' ? 'त्वरित प्रश्न' : 'விரைவு கேள்விகள்'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                    {[
                      { en: 'Is my SIP amount realistic for my salary?',       hi: 'क्या मेरी SIP राशि मेरी सैलरी के लिए उचित है?',     ta: 'என் SIP தொகை என் சம்பளத்திற்கு நடைமுறையானதா?' },
                      { en: 'How does inflation affect my goal?',               hi: 'महंगाई मेरे लक्ष्य को कैसे प्रभावित करती है?',         ta: 'பணவீக்கம் என் இலக்கை எவ்வாறு பாதிக்கிறது?' },
                      { en: 'What happens if I miss a few SIP payments?',      hi: 'अगर मैं कुछ SIP भुगतान चूक जाऊं तो क्या होगा?',     ta: 'சில SIP கட்டணங்களை தவறவிட்டால் என்ன ஆகும்?' },
                      { en: 'Should I increase my SIP every year?',            hi: 'क्या मुझे हर साल अपनी SIP बढ़ानी चाहिए?',             ta: 'ஒவ்வொரு ஆண்டும் என் SIP அதிகரிக்க வேண்டுமா?' },
                      { en: 'Explain the power of compounding simply.',        hi: 'चक्रवृद्धि की शक्ति को सरलता से समझाएं।',             ta: 'கூட்டு வட்டியின் சக்தியை எளிமையாக விளக்குங்கள்.' },
                      { en: 'What is the difference between SIP and lumpsum?', hi: 'SIP और एकमुश्त निवेश में क्या अंतर है?',             ta: 'SIP மற்றும் மொத்தத் தொகை முதலீட்டிற்கு இடையே என்ன வித்தியாசம்?' },
                    ].map((q, i) => (
                      <button key={i} type="button" className="quick-q-btn"
                        onClick={() => handleAiSend(q[lang] || q.en)}>
                        {q[lang] || q.en}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Chat window */}
              <div className="ai-chat-col">
                <div className="card ai-chat-card">
                  {/* Chat messages */}
                  <div className="ai-chat-messages" ref={aiChatRef}>
                    {aiMessages.length === 0 ? (
                      <div className="ai-empty">
                        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>💬</div>
                        <div style={{ fontWeight: 700, fontSize: '.9rem', color: 'var(--text2)', marginBottom: '.25rem' }}>
                          {lang === 'en' ? 'Ask me anything!' : lang === 'hi' ? 'कुछ भी पूछें!' : 'எதையும் கேளுங்கள்!'}
                        </div>
                        <div style={{ fontSize: '.75rem', color: 'var(--text3)' }}>
                          {lang === 'en' ? 'Try one of the quick questions →' : lang === 'hi' ? 'त्वरित प्रश्नों में से एक आज़माएं →' : 'விரைவு கேள்விகளில் ஒன்றை முயற்சிக்கவும் →'}
                        </div>
                      </div>
                    ) : (
                      aiMessages.map((msg, i) => (
                        <div key={i} className={`ai-msg ${msg.role}`}>
                          <div className="ai-msg-avatar">
                            {msg.role === 'user' ? '👤' : '🤖'}
                          </div>
                          <div className="ai-msg-bubble">
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {aiLoading && (
                      <div className="ai-msg assistant">
                        <div className="ai-msg-avatar">🤖</div>
                        <div className="ai-msg-bubble ai-typing">
                          <span></span><span></span><span></span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="ai-input-row">
                    <input
                      type="text"
                      className="ai-input"
                      placeholder={lang === 'en' ? 'Ask about your SIP plan...' : lang === 'hi' ? 'अपनी SIP योजना के बारे में पूछें...' : 'உங்கள் SIP திட்டத்தைப் பற்றி கேளுங்கள்...'}
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAiSend()}
                      disabled={aiLoading}
                      aria-label="Ask AI advisor"
                    />
                    <VoiceButton
                      lang={lang}
                      disabled={aiLoading}
                      onResult={(text) => { setAiInput(text); setTimeout(() => handleAiSend(text), 100); }}
                    />
                    <button type="button" className="ai-send-btn"
                      onClick={() => handleAiSend()} disabled={aiLoading || !aiInput.trim()}>
                      {aiLoading ? '⏳' : '➤'}
                    </button>
                  </div>

                  <div style={{ fontSize: '.65rem', color: 'var(--text3)', marginTop: '.5rem', textAlign: 'center', lineHeight: 1.5 }}>
                    {lang === 'en'
                      ? 'AI responses are for educational purposes only. Not financial advice. Consult a SEBI-registered advisor.'
                      : lang === 'hi'
                      ? 'AI प्रतिक्रियाएं केवल शैक्षिक उद्देश्यों के लिए हैं। वित्तीय सलाह नहीं।'
                      : 'AI பதில்கள் கல்வி நோக்கங்களுக்காக மட்டுமே. நிதி ஆலோசனை அல்ல.'}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

        <footer className="site-footer" role="contentinfo">
          <p>{t('footer', lang)}</p>
        </footer>
      </div>
    </>
  );
}