/**
 * Speed-accuracy summary metrics.
 * Note: this uses robust proxies (RCS + variability) rather than full DDM fitting.
 */

/**
 * Estimate speed-accuracy parameters from module trial data.
 * v proxy uses rate-correct-score (RCS).
 * aBound proxy uses inverse ITV.
 * @param {Array<{correct: boolean, rtNorm: number, rt?: number}>} trials - Trial data
 * @param {number} itv - Inter-trial variability for this module
 * @returns {{ v: number, aBound: number, rcs: number, meanAccuracy: number, meanRtNorm: number }}
 */
export function estimateDDM(trials, itv) {
  if (trials.length === 0) {
    return { v: 0, aBound: 0, rcs: 0, meanAccuracy: 0, meanRtNorm: 0 };
  }

  const evaluable = trials.filter((t) => t.rtNorm > 0);
  const meanAccuracy = evaluable.filter((t) => t.correct).length / Math.max(1, evaluable.length);
  const meanRTNorm =
    evaluable.reduce((s, t) => s + t.rtNorm, 0) / Math.max(1, evaluable.length);

  const totalCorrectRT = evaluable
    .filter((t) => t.correct)
    .reduce((sum, t) => sum + (t.rt ?? t.rtNorm * 1000), 0);
  const rcs =
    totalCorrectRT > 0
      ? evaluable.filter((t) => t.correct).length / (totalCorrectRT / 1000)
      : 0;
  const v = meanRTNorm > 0 ? 0.7 * (meanAccuracy / meanRTNorm) + 0.3 * rcs : 0;
  const aBound = itv > 0 ? 1 / itv : 3;

  return { v, aBound, rcs, meanAccuracy, meanRtNorm: meanRTNorm };
}

/**
 * Classify thinking style from DDM parameters.
 * @param {number} v - Drift rate (evidence accumulation)
 * @param {number} aBound - Boundary separation (caution)
 * @returns {string} Profile description
 */
export function classifyDDMProfile(v, aBound) {
  const highDrift = v > 0.6;
  const highBound = aBound > 1.5;

  if (highDrift && highBound) return 'deliberate';
  if (highDrift && !highBound) return 'impulsive-accurate';
  if (!highDrift && highBound) return 'cautious-slow';
  return 'impulsive-inaccurate';
}

/**
 * Compute mean DDM parameters across all modules.
 * @param {Array<{v: number, aBound: number}>} moduleDDMs - DDM params per module
 * @returns {{ meanDriftRate: number, meanBoundary: number, profile: string }}
 */
export function computeDDMSummary(moduleDDMs) {
  if (moduleDDMs.length === 0) {
    return { meanDriftRate: 0, meanBoundary: 0, profile: 'insufficient-data' };
  }
  const meanDriftRate =
    moduleDDMs.reduce((s, d) => s + d.v, 0) / moduleDDMs.length;
  const meanBoundary =
    moduleDDMs.reduce((s, d) => s + d.aBound, 0) / moduleDDMs.length;
  const profile = classifyDDMProfile(meanDriftRate, meanBoundary);

  return { meanDriftRate, meanBoundary, profile };
}
