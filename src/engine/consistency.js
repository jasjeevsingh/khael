/**
 * Inter-Trial Variability (ITV) and engagement decay detection.
 */

const ITV_HIGH_THRESHOLD = 0.6;
const DECAY_RT_INCREASE = 0.4;
const DECAY_ACCURACY_THRESHOLD = 0.4;
const ROLLING_WINDOW = 3;

/**
 * Compute coefficient of variation of response times.
 * ITV = stddev(rts) / mean(rts)
 * @param {number[]} rts - Array of response times
 * @returns {number} ITV value (0+), or 0 if insufficient data
 */
export function computeITV(rts) {
  if (rts.length < 2) return 0;
  const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
  if (mean === 0) return 0;
  const variance = rts.reduce((sum, rt) => sum + (rt - mean) ** 2, 0) / rts.length;
  return Math.sqrt(variance) / mean;
}

/**
 * Fit coarse ex-Gaussian style moments from response times.
 * This is a lightweight approximation suitable for low trial counts.
 * @param {number[]} rts - Response times in ms
 * @returns {{mu:number, sigma:number, tau:number}} Approximate ex-Gaussian parameters
 */
export function estimateExGaussian(rts) {
  if (!rts.length) return { mu: 0, sigma: 0, tau: 0 };
  if (rts.length < 4) {
    const mean = rts.reduce((a, b) => a + b, 0) / rts.length;
    return { mu: mean, sigma: 0, tau: 0 };
  }
  const sorted = [...rts].sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, x) => sum + (x - mean) ** 2, 0) / sorted.length;
  const sd = Math.sqrt(variance);
  const p10 = quantile(sorted, 0.1);
  const p90 = quantile(sorted, 0.9);
  const tailSpread = Math.max(0, p90 - p10 - 2.56 * sd);
  const tau = Math.max(0, tailSpread / 2);
  const sigma = Math.max(1, Math.sqrt(Math.max(1, variance - tau * tau)));
  const mu = Math.max(0, mean - tau);
  return { mu, sigma, tau };
}

/**
 * Check whether the ITV value indicates attentional inconsistency.
 * @param {number} itv - ITV value
 * @returns {boolean} true if ITV is above threshold
 */
export function isHighITV(itv) {
  return itv > ITV_HIGH_THRESHOLD;
}

/**
 * Detect engagement fatigue from rolling trial data.
 * Flags true if RT increases >40% above baseline AND accuracy drops below 40%.
 * @param {Array<{correct: boolean, rt: number}>} trials - Trial data
 * @param {number} baselineRT - Module baseline mean RT
 * @returns {{ fatigued: boolean, fatigueOnset: number|null }}
 */
export function detectEngagementDecay(trials, baselineRT) {
  if (trials.length < ROLLING_WINDOW + 1) {
    return { fatigued: false, fatigueOnset: null };
  }

  for (let i = ROLLING_WINDOW; i <= trials.length; i++) {
    const window = trials.slice(i - ROLLING_WINDOW, i);
    const meanRT = window.reduce((s, t) => s + t.rt, 0) / ROLLING_WINDOW;
    const accuracy = window.filter((t) => t.correct).length / ROLLING_WINDOW;

    if (meanRT > baselineRT * (1 + DECAY_RT_INCREASE) && accuracy < DECAY_ACCURACY_THRESHOLD) {
      return { fatigued: true, fatigueOnset: i - ROLLING_WINDOW };
    }
  }

  return { fatigued: false, fatigueOnset: null };
}

/**
 * Compute the trial weight based on engagement state.
 * Trials after fatigue onset are weighted at 0.7.
 * @param {number} trialIndex - Current trial index
 * @param {number|null} fatigueOnset - Index where fatigue was first detected
 * @returns {number} Weight (0.7 or 1.0)
 */
export function trialWeight(trialIndex, fatigueOnset) {
  if (fatigueOnset !== null && trialIndex >= fatigueOnset) return 0.7;
  return 1.0;
}

/**
 * Compute robust baseline RT from early trials.
 * @param {Array<{rt:number}>} trials - Trial objects
 * @param {number} count - Number of early trials to use
 * @returns {number} Baseline RT estimate
 */
export function computeEarlyBaselineRT(trials, count = 5) {
  const early = trials.slice(0, count).map((t) => t.rt).filter((rt) => rt > 0);
  if (!early.length) return 0;
  const sorted = early.sort((a, b) => a - b);
  return quantile(sorted, 0.5);
}

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const next = sorted[base + 1] ?? sorted[base];
  return sorted[base] + rest * (next - sorted[base]);
}

export { ITV_HIGH_THRESHOLD };
