/**
 * 3-Parameter Logistic IRT Model
 * Implements adaptive item selection and ability estimation.
 */

const THETA_MIN = -3;
const THETA_MAX = 3;
const B_MIN = -2.5;
const B_MAX = 2.5;
const DEFAULT_A = 1.0;
const DEFAULT_C = 0.25;
const NEWTON_MAX_ITER = 12;
const NEWTON_TOL = 1e-4;
const PRIOR_SD = 1.0;

const AGE_INITIAL_B = { 2: -1.5, 3: -1.0, 4: -0.5, 5: -0.25, 6: 0.0 };
const AGE_BASELINE_RT = { 2: 2200, 3: 1800, 4: 1400, 5: 1100, 6: 900 };

const AGE_INITIAL_SEQ = { 2: 2, 3: 3, 4: 4, 5: 4, 6: 5 };

/**
 * Create a fresh IRT state for a module.
 * @param {number} ageBand - Child's age (2-6)
 * @returns {object} IRT state object
 */
export function createIRTState(ageBand) {
  return {
    theta: 0.0,
    b: AGE_INITIAL_B[ageBand] ?? -0.5,
    a: DEFAULT_A,
    c: DEFAULT_C,
    responses: [],
    se: Infinity,
  };
}

/**
 * Compute probability of correct response under 3PL model.
 * P(correct | theta, b, a, c) = c + (1-c) / (1 + exp(-a * (theta - b)))
 * @param {number} theta - Ability estimate
 * @param {number} b - Item difficulty
 * @param {number} a - Discrimination parameter
 * @param {number} c - Pseudo-guessing parameter
 * @returns {number} Probability [0, 1]
 */
export function probability3PL(theta, b, a = DEFAULT_A, c = DEFAULT_C) {
  return c + (1 - c) / (1 + Math.exp(-a * (theta - b)));
}

/**
 * Update theta after a response using iterative MAP-style estimation.
 * This approximates posterior mode estimation by combining item likelihood
 * and a weak Gaussian prior over theta.
 * @param {object} irtState - Current IRT state
 * @param {boolean} correct - Whether response was correct
 * @param {number} rt - Response time in ms
 * @param {number} ageBand - Child's age band
 * @param {object} [options] - Optional update controls
 * @param {number} [options.responseWeight=1] - Weight for the current response (e.g., fatigue)
 * @returns {object} Updated IRT state (new object)
 */
export function updateTheta(irtState, correct, rt, ageBand, options = {}) {
  const { theta, b, a, c, responses } = irtState;
  const responseWeight = options.responseWeight ?? 1;
  const expectedRT = AGE_BASELINE_RT[ageBand] ?? 1400;
  const rtPenalty = rt > 2 * expectedRT ? 0.75 : rt > expectedRT ? 0.9 : 1;

  const newResponse = {
    correct,
    rt,
    difficulty: b,
    a,
    c,
    weight: Math.max(0.4, Math.min(1.2, responseWeight * rtPenalty)),
  };
  const allResponses = [...responses, newResponse];
  const newTheta = estimateThetaMAP(allResponses, theta);
  const se = computeSE(allResponses, newTheta, a, c);
  const ci = computeCredibleInterval(newTheta, se);

  const nextB = selectNextB(newTheta, a, c);

  return {
    ...irtState,
    theta: newTheta,
    b: nextB,
    responses: allResponses,
    se,
    ci,
  };
}

/**
 * Select next item difficulty based on maximum-information targeting.
 * For 3PL, maximum information occurs above theta by an offset dependent on c.
 * @param {number} theta - Current ability estimate
 * @param {number} a - Discrimination parameter
 * @param {number} c - Guessing parameter
 * @returns {number} Next item difficulty parameter
 */
export function selectNextB(theta, a = DEFAULT_A, c = DEFAULT_C) {
  const offset = Math.log((1 + Math.sqrt(1 + 8 * c)) / 2) / Math.max(0.5, a);
  return clamp(theta + offset, B_MIN, B_MAX);
}

/**
 * Compute standard error of theta estimate.
 * Uses Fisher information approximation.
 * @param {Array} responses - Response array
 * @param {number} theta - Current theta
 * @param {number} a - Discrimination
 * @param {number} c - Guessing
 * @returns {number} Standard error
 */
function computeSE(responses, theta, a, c) {
  if (responses.length < 2) return Infinity;
  let info = 0;
  for (const r of responses) {
    const itemA = r.a ?? a;
    const itemC = r.c ?? c;
    const p = probability3PL(theta, r.difficulty, itemA, itemC);
    const q = 1 - p;
    const pStar = (p - itemC) / (1 - itemC);
    const w = r.weight ?? 1;
    info += w * itemA * itemA * q * pStar * pStar / p;
  }
  return info > 0 ? 1 / Math.sqrt(info) : Infinity;
}

/**
 * Estimate theta using iterative MAP with weak normal prior.
 * @param {Array} responses - Response history
 * @param {number} initialTheta - Initial value
 * @returns {number} Estimated theta
 */
function estimateThetaMAP(responses, initialTheta) {
  if (responses.length === 0) return initialTheta;
  let theta = clamp(initialTheta, THETA_MIN, THETA_MAX);

  for (let iter = 0; iter < NEWTON_MAX_ITER; iter++) {
    let grad = -theta / (PRIOR_SD * PRIOR_SD);
    let hess = -1 / (PRIOR_SD * PRIOR_SD);

    for (const r of responses) {
      const a = r.a ?? DEFAULT_A;
      const c = r.c ?? DEFAULT_C;
      const w = r.weight ?? 1;
      const y = r.correct ? 1 : 0;
      const p = probability3PL(theta, r.difficulty, a, c);
      const oneMinusP = 1 - p;
      const dP = a * (p - c) * oneMinusP / (1 - c);
      const safeP = clamp(p, 1e-6, 1 - 1e-6);
      const dLogL = (y - safeP) * dP / (safeP * (1 - safeP));
      const fisher = (dP * dP) / (safeP * (1 - safeP));
      grad += w * dLogL;
      hess -= w * fisher;
    }

    if (Math.abs(grad) < NEWTON_TOL) break;
    const step = hess === 0 ? 0 : grad / hess;
    const boundedStep = clamp(step, -0.6, 0.6);
    const nextTheta = clamp(theta - boundedStep, THETA_MIN, THETA_MAX);
    if (Math.abs(nextTheta - theta) < NEWTON_TOL) {
      theta = nextTheta;
      break;
    }
    theta = nextTheta;
  }

  return clamp(theta, THETA_MIN, THETA_MAX);
}

/**
 * Approximate 95% credible interval for theta.
 * @param {number} theta - Ability estimate
 * @param {number} se - Standard error
 * @returns {{lower:number, upper:number, width:number}}
 */
export function computeCredibleInterval(theta, se) {
  if (!Number.isFinite(se)) {
    return { lower: THETA_MIN, upper: THETA_MAX, width: THETA_MAX - THETA_MIN };
  }
  const margin = 1.96 * se;
  const lower = clamp(theta - margin, THETA_MIN, THETA_MAX);
  const upper = clamp(theta + margin, THETA_MIN, THETA_MAX);
  return { lower, upper, width: upper - lower };
}

/**
 * Map difficulty parameter b to sequence length for memory tasks.
 * @param {number} b - Difficulty parameter
 * @param {number} ageBand - Child's age
 * @returns {number} Sequence length (2-8)
 */
export function bToSequenceLength(b, ageBand) {
  const base = AGE_INITIAL_SEQ[ageBand] ?? 3;
  const offset = Math.round(b);
  return clamp(base + offset, 2, 8);
}

/**
 * Normalize response time against age-band baseline.
 * @param {number} rt - Raw response time ms
 * @param {number} ageBand - Child's age
 * @returns {number} Normalized RT (1.0 = baseline speed)
 */
export function normalizeRT(rt, ageBand) {
  const baseline = AGE_BASELINE_RT[ageBand] ?? 1400;
  return rt / baseline;
}

/**
 * Determine if module should stop (SE threshold met or max trials reached).
 * @param {object} irtState - Current IRT state
 * @param {number} trialCount - Current trial number
 * @param {number} minTrials - Minimum trials before stopping
 * @param {number} maxTrials - Maximum trials
 * @param {number} seThreshold - SE threshold to stop
 * @returns {boolean} Whether to stop
 */
export function shouldStop(irtState, trialCount, minTrials, maxTrials, seThreshold = 0.3) {
  if (trialCount >= maxTrials) return true;
  if (trialCount >= minTrials && irtState.se < seThreshold) return true;
  return false;
}

/**
 * Map difficulty to falling leaf speed parameters.
 * @param {number} b - Current difficulty
 * @param {number} ageBand - Child's age
 * @returns {object} { fallDuration, simultaneousLeaves, tapWindow }
 */
export function bToLeafParams(b, ageBand) {
  const normalizedB = (b - B_MIN) / (B_MAX - B_MIN);
  const fallDuration = 4000 - normalizedB * 2500;
  const simultaneousLeaves = normalizedB < 0.33 ? 1 : normalizedB < 0.66 ? 2 : 3;
  const tapWindow = 2500 - normalizedB * 1000;
  return {
    fallDuration: Math.max(fallDuration, 1500),
    simultaneousLeaves,
    tapWindow: Math.max(tapWindow, 1500),
  };
}

/**
 * Get Go/No-Go timing parameters from difficulty.
 * @param {number} b - Current difficulty
 * @returns {object} { goDuration, stopDuration, isi }
 */
export function bToGoNoGoParams(b) {
  const normalizedB = (b - B_MIN) / (B_MAX - B_MIN);
  const goDuration = 1200 - normalizedB * 400;
  const stopDuration = 600 - normalizedB * 200;
  const isi = 400 + Math.random() * 200;
  return {
    goDuration: Math.max(goDuration, 800),
    stopDuration: Math.max(stopDuration, 400),
    isi,
  };
}

/** @param {number} v @param {number} min @param {number} max */
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export { AGE_BASELINE_RT, AGE_INITIAL_B, AGE_INITIAL_SEQ, THETA_MIN, THETA_MAX };
