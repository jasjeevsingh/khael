/**
 * Scoring engine — computes pillar scores, CCI, profile classification.
 * All functions are pure: input → output, no side effects.
 */

import { computeDDMSummary } from './driftDiffusion.js';

const PILLAR_WEIGHTS = {
  WM: 0.25,
  PS: 0.20,
  EF: 0.25,
  VS: 0.20,
  SC: 0.10,
};

const PILLAR_KEYS = ['WM', 'PS', 'EF', 'VS', 'SC'];

const PROFILE_LABELS = {
  ENGAGED_LEARNER: "Noor's Bright Star",
  ACTIVE_THINKER: "Noor's Energetic Explorer",
  FOCUSED_EXPLORER: "Noor's Quiet Thinker",
  DEVELOPING_AT_PACE: "Noor's Growing Adventurer",
  WARRANTS_ATTENTION: "Noor's Thoughtful Traveler",
  INCONCLUSIVE: "Today Wasn't Our Day",
};

/**
 * Convert theta (-3 to 3) to a 0-100 display score.
 * @param {number} theta
 * @returns {number} Score 0-100
 */
export function thetaToScore(theta) {
  return Math.round(((theta + 3) / 6) * 100);
}

/**
 * Compute all pillar scores from module results.
 * @param {Array} moduleResults - Array of 5 module result objects
 * @param {string[]} conditions - Parent-reported conditions
 * @returns {object} Map of pillar key → { score, theta, itv, ddm, extras }
 */
export function computePillarScores(moduleResults, conditions) {
  const hasAutism = conditions.includes('autism');
  const hasHearing = conditions.includes('hearing');
  const hasVision = conditions.includes('vision');

  const pillars = {};

  for (let i = 0; i < moduleResults.length; i++) {
    const mod = moduleResults[i];
    if (!mod) continue;
    const key = PILLAR_KEYS[i];
    const score = thetaToScore(mod.theta);

    let weight = 1.0;
    if (key === 'SC' && (hasHearing || hasVision)) weight = 0.8;

    pillars[key] = {
      score: Math.round(score * weight),
      theta: mod.theta,
      thetaSE: mod.thetaSE ?? mod.se ?? 1,
      thetaCI: mod.thetaCI ?? mod.ci ?? { lower: -3, upper: 3, width: 6 },
      itv: mod.itv ?? 0,
      ddm: mod.ddm ?? { v: 0, aBound: 0 },
      engagementFatigued: mod.engagementFatigued ?? false,
      extras: mod.extras ?? {},
      excludeFromCCI: key === 'SC' && hasAutism,
    };
  }

  return pillars;
}

/**
 * Compute the Composite Cognitive Index (CCI).
 * @param {object} pillars - Pillar scores object
 * @returns {number} CCI score 0-100
 */
export function computeCCI(pillars) {
  let totalWeight = 0;
  let weightedSum = 0;

  const scExcluded = pillars.SC?.excludeFromCCI;

  for (const key of PILLAR_KEYS) {
    if (!pillars[key]) continue;
    if (key === 'SC' && scExcluded) continue;

    let w = PILLAR_WEIGHTS[key];
    if (scExcluded) {
      w = w / (1 - PILLAR_WEIGHTS.SC);
    }

    const uncertaintyPenalty = Math.min(10, Math.max(0, (pillars[key].thetaCI?.width ?? 6) - 1.5) * 2);
    weightedSum += (pillars[key].score - uncertaintyPenalty) * w;
    totalWeight += w;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight * (1 / 1)) : 50;
}

/**
 * Compute consistency index from ITV values.
 * Higher = more consistent = more reliable session data.
 * @param {object} pillars - Pillar scores
 * @returns {number} Consistency index 0-1
 */
export function computeConsistencyIndex(pillars) {
  const itvs = PILLAR_KEYS.map((k) => pillars[k]?.itv ?? 0).filter((v) => v > 0);
  if (itvs.length === 0) return 1;
  const meanITV = itvs.reduce((a, b) => a + b, 0) / itvs.length;
  return Math.max(0, Math.min(1, 1 - meanITV / 0.8));
}

/**
 * Check if high fatigue is present (2+ modules fatigued).
 * @param {object} pillars - Pillar scores
 * @returns {boolean}
 */
export function checkHighFatigue(pillars) {
  const fatiguedCount = PILLAR_KEYS.filter(
    (k) => pillars[k]?.engagementFatigued
  ).length;
  return fatiguedCount >= 2;
}

/**
 * Classify the child's profile based on CCI, pillar scores, and consistency.
 * @param {number} cci - Composite Cognitive Index
 * @param {object} pillars - Pillar scores
 * @param {number} consistency - Consistency index
 * @returns {string} Profile classification key
 */
export function classifyProfile(cci, pillars, consistency) {
  if (consistency < 0.4) return 'INCONCLUSIVE';
  if (cci >= 70 && consistency >= 0.6) return 'ENGAGED_LEARNER';
  if (cci >= 55 && (pillars.EF?.score ?? 100) < 40 && (pillars.PS?.score ?? 100) < 45)
    return 'ACTIVE_THINKER';
  if (cci >= 55 && (pillars.SC?.score ?? 100) < 40) return 'FOCUSED_EXPLORER';
  if (cci >= 40 && cci < 55 && consistency >= 0.5) return 'DEVELOPING_AT_PACE';
  if (cci < 40 && consistency >= 0.5) return 'WARRANTS_ATTENTION';
  return 'DEVELOPING_AT_PACE';
}

/**
 * Get the human-friendly profile label.
 * @param {string} profileKey
 * @returns {string} Friendly label
 */
export function getProfileLabel(profileKey) {
  return PROFILE_LABELS[profileKey] ?? PROFILE_LABELS.INCONCLUSIVE;
}

/**
 * Get score band for a pillar score.
 * @param {number} score - 0-100
 * @returns {'strong'|'typical'|'emerging'|'needs_support'}
 */
export function getScoreBand(score) {
  if (score >= 70) return 'strong';
  if (score >= 45) return 'typical';
  if (score >= 25) return 'emerging';
  return 'needs_support';
}

/**
 * Full scoring synthesis — the main entry point called after all modules complete.
 * @param {Array} moduleResults - Array of 5 module result objects
 * @param {string[]} conditions - Parent conditions
 * @returns {object} Complete scoring output
 */
export function computeFullResults(moduleResults, conditions) {
  const pillars = computePillarScores(moduleResults, conditions);
  const cci = computeCCI(pillars);
  const consistency = computeConsistencyIndex(pillars);
  const highFatigue = checkHighFatigue(pillars);
  const lowReliability = consistency < 0.4;

  const ddmParams = PILLAR_KEYS
    .map((k) => pillars[k]?.ddm)
    .filter(Boolean);
  const ddmSummary = computeDDMSummary(ddmParams);

  const profileKey = classifyProfile(cci, pillars, consistency);
  const profileLabel = getProfileLabel(profileKey);

  const weakPillars = PILLAR_KEYS.filter(
    (k) => pillars[k] && !pillars[k].excludeFromCCI && pillars[k].score < 40
  );

  const confidence = Math.round(
    (PILLAR_KEYS
      .filter((k) => pillars[k])
      .reduce((acc, k) => {
        const width = pillars[k].thetaCI?.width ?? 6;
        const c = Math.max(0, Math.min(1, 1 - width / 6));
        return acc + c;
      }, 0) /
      Math.max(1, PILLAR_KEYS.filter((k) => pillars[k]).length)) *
      100
  );

  return {
    pillars,
    cci,
    consistency,
    lowReliability,
    highFatigue,
    ddmSummary,
    profileKey,
    profileLabel,
    weakPillars,
    confidence,
  };
}

export { PILLAR_KEYS, PILLAR_WEIGHTS, PROFILE_LABELS };
