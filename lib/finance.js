/**
 * lib/finance.js
 * Mathematically correct financial formulas as per PDF specification.
 * Goal-Based Investment Calculator + Enhancements
 */

// ═══════════════════════════════════════════════
// CORE FORMULAS (PDF spec)
// ═══════════════════════════════════════════════

export function calcFutureGoalValue(presentCost, years, inflationRate) {
  return presentCost * Math.pow(1 + inflationRate / 100, years);
}

export function calcRequiredSIP(futureValue, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  const n = years * 12;
  if (r === 0) return futureValue / n;
  return (futureValue * r) / ((Math.pow(1 + r, n) - 1) * (1 + r));
}

export function calcYearlyGrowth(monthlySIP, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  const data = [];
  for (let y = 1; y <= years; y++) {
    const n = y * 12;
    const invested = monthlySIP * n;
    const corpus = r === 0 ? invested : monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    data.push({ year: y, invested: Math.round(invested), corpus: Math.round(corpus), growth: Math.round(corpus - invested) });
  }
  return data;
}

export function calcMilestones(monthlySIP, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  const step = Math.max(1, Math.floor(years / 5));
  const points = [];
  for (let y = step; y <= years; y += step) {
    const n = y * 12;
    const invested = monthlySIP * n;
    const corpus = r === 0 ? invested : monthlySIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    points.push({ year: y, invested: Math.round(invested), corpus: Math.round(corpus), growth: Math.round(corpus - invested) });
  }
  return points;
}

// ═══════════════════════════════════════════════
// ENHANCEMENT 1 — TOP-UP SIP
// PDF: FV = Sum of FV of each year's SIP contribution
// compounded until end of tenure (year-wise logic)
// ═══════════════════════════════════════════════

export function calcTopUpSIP(initialSIP, topUpRate, annualReturn, years) {
  const r = annualReturn / 100 / 12;
  let totalCorpus = 0;
  let totalInvested = 0;
  const yearlyData = [];

  for (let y = 1; y <= years; y++) {
    const currentSIP = initialSIP * Math.pow(1 + topUpRate / 100, y - 1);
    let yearCorpus = 0;
    for (let m = 1; m <= 12; m++) {
      const monthsLeft = (years - y) * 12 + (12 - m + 1);
      yearCorpus += currentSIP * Math.pow(1 + r, monthsLeft);
    }
    totalCorpus += yearCorpus;
    totalInvested += currentSIP * 12;
    yearlyData.push({
      year: y,
      sip: Math.round(currentSIP),
      invested: Math.round(totalInvested),
      corpus: Math.round(totalCorpus),
    });
  }

  // Regular SIP comparison
  const n = years * 12;
  const regularCorpus = r === 0 ? initialSIP * n : initialSIP * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const regularInvested = initialSIP * n;

  return {
    finalCorpus:    Math.round(totalCorpus),
    totalInvested:  Math.round(totalInvested),
    totalGains:     Math.round(totalCorpus - totalInvested),
    yearlyData,
    regular: {
      finalCorpus:   Math.round(regularCorpus),
      totalInvested: Math.round(regularInvested),
      totalGains:    Math.round(regularCorpus - regularInvested),
    },
    extraGains: Math.round(totalCorpus - regularCorpus),
  };
}

// ═══════════════════════════════════════════════
// ENHANCEMENT 2 — INFLATION VARIABILITY BUCKETS
// PDF: "medical, education, lifestyle inflation buckets"
// ═══════════════════════════════════════════════

export function calcInflationBuckets(buckets, totalCost, years, annualReturn) {
  const {
    educationPct = 40, medicalPct = 20, lifestylePct = 40,
    educationInf = 8,  medicalInf = 10, lifestyleInf = 6,
  } = buckets;

  const eCost = totalCost * educationPct  / 100;
  const mCost = totalCost * medicalPct    / 100;
  const lCost = totalCost * lifestylePct  / 100;

  const eFV = calcFutureGoalValue(eCost, years, educationInf);
  const mFV = calcFutureGoalValue(mCost, years, medicalInf);
  const lFV = calcFutureGoalValue(lCost, years, lifestyleInf);

  const totalFV    = eFV + mFV + lFV;
  const blendedSIP = calcRequiredSIP(totalFV, annualReturn, years);
  const avgInf     = (educationInf * educationPct + medicalInf * medicalPct + lifestyleInf * lifestylePct) / 100;
  const simpleFV   = calcFutureGoalValue(totalCost, years, avgInf);
  const simpleSIP  = calcRequiredSIP(simpleFV, annualReturn, years);

  return {
    buckets: [
      { name: 'Education', cost: Math.round(eCost), fv: Math.round(eFV), inflation: educationInf, pct: educationPct },
      { name: 'Medical',   cost: Math.round(mCost), fv: Math.round(mFV), inflation: medicalInf,   pct: medicalPct },
      { name: 'Lifestyle', cost: Math.round(lCost), fv: Math.round(lFV), inflation: lifestyleInf, pct: lifestylePct },
    ],
    totalFV:     Math.round(totalFV),
    blendedSIP:  Math.round(blendedSIP),
    simpleSIP:   Math.round(simpleSIP),
    extraSIP:    Math.round(blendedSIP - simpleSIP),
    avgInflation: avgInf.toFixed(1),
  };
}

// ═══════════════════════════════════════════════
// ENHANCEMENT 3 — LATE START PENALTY
// Shows cost of delaying investment
// ═══════════════════════════════════════════════

export function calcLateStartPenalty(futureGoal, annualReturn, years, maxDelay = 5) {
  const scenarios = [];
  for (let delay = 0; delay <= maxDelay; delay++) {
    const remainingYears = years - delay;
    if (remainingYears <= 0) break;
    const sip          = calcRequiredSIP(futureGoal, annualReturn, remainingYears);
    const totalInvested = sip * remainingYears * 12;
    const baseSIP      = scenarios[0]?.sip || sip;
    const baseInvested = scenarios[0]?.totalInvested || totalInvested;
    scenarios.push({
      delay,
      years:         remainingYears,
      sip:           Math.round(sip),
      totalInvested: Math.round(totalInvested),
      extraPerMonth: Math.round(sip - baseSIP),
      extraTotal:    Math.round(totalInvested - baseInvested),
      label:         delay === 0 ? 'Start Today' : `Delay ${delay} yr${delay > 1 ? 's' : ''}`,
    });
  }
  return scenarios;
}

// ═══════════════════════════════════════════════
// FORMATTERS
// ═══════════════════════════════════════════════

export function formatINR(value) {
  if (!value || isNaN(value)) return '—';
  return '₹' + Math.round(value).toLocaleString('en-IN');
}

export function formatShort(value) {
  if (!value || isNaN(value)) return '—';
  const v = Math.round(value);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return formatINR(v);
}