import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createIRTState,
  updateTheta,
  bToLeafParams,
  normalizeRT,
} from '../../../engine/irt';
import {
  computeITV,
  detectEngagementDecay,
  computeEarlyBaselineRT,
  estimateExGaussian,
} from '../../../engine/consistency';
import { estimateDDM } from '../../../engine/driftDiffusion';

const TOTAL_LEAVES = 35;
const TARGET_RATIO = 0.5;
const LEAF_COLORS = ['#E87C3F', '#D45B3A', '#E8A84A', '#C4783C'];

function zScore(p) {
  if (p <= 0) return -3;
  if (p >= 1) return 3;
  const a1 = -1.0976, a2 = 0.2422, b1 = -0.3456, b2 = 0.0527;
  const r = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(r));
  let z = t + (a1 + a2 * t) / (1 + b1 * t + b2 * t * t);
  return p < 0.5 ? -z : z;
}

export default function FallingLeaves({ ageBand, onComplete }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [leaves, setLeaves] = useState([]);
  const [leafIndex, setLeafIndex] = useState(0);
  const [trials, setTrials] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [done, setDone] = useState(false);
  const spawnTimerRef = useRef(null);
  const leafTimersRef = useRef({});
  const leafStartTimes = useRef({});

  const clearAllTimers = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    Object.values(leafTimersRef.current).forEach(clearTimeout);
    leafTimersRef.current = {};
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const spawnLeaf = useCallback(() => {
    if (leafIndex >= TOTAL_LEAVES) return;

    const isTarget = Math.random() < TARGET_RATIO;
    const { fallDuration, tapWindow } = bToLeafParams(irt.b, ageBand);
    const xPos = 10 + Math.random() * 80;
    const colorIdx = Math.floor(Math.random() * LEAF_COLORS.length);

    const leaf = {
      id: leafIndex,
      isTarget,
      x: xPos,
      color: LEAF_COLORS[colorIdx],
      fallDuration,
      tapWindow,
      tapped: false,
      missed: false,
      active: true,
      spawnTime: performance.now(),
    };

    leafStartTimes.current[leafIndex] = performance.now();
    setLeaves((prev) => [...prev, leaf]);
    setLeafIndex((prev) => prev + 1);

    const expireTimer = setTimeout(() => {
      setLeaves((prev) =>
        prev.map((l) => {
          if (l.id === leaf.id && !l.tapped && l.active) {
            if (l.isTarget) {
              setMisses((m) => m + 1);
              setTrials((t) => [
                ...t,
                {
                  correct: false,
                  rt: fallDuration,
                  rtNorm: normalizeRT(fallDuration, ageBand),
                  type: 'omission',
                  module: 'PS',
                },
              ]);
            }
            return { ...l, active: false, missed: true };
          }
          return l;
        })
      );
    }, fallDuration);
    leafTimersRef.current[leaf.id] = expireTimer;
  }, [leafIndex, irt.b, ageBand]);

  useEffect(() => {
    if (done || leafIndex >= TOTAL_LEAVES) {
      if (leafIndex >= TOTAL_LEAVES && !done) {
        const finishTimer = setTimeout(() => {
          finishModule();
        }, 2000);
        return () => clearTimeout(finishTimer);
      }
      return;
    }

    const delay = 600 + Math.random() * 800;
    spawnTimerRef.current = setTimeout(spawnLeaf, delay);
    return () => {
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    };
  }, [leafIndex, done, spawnLeaf]);

  const handleTapLeaf = useCallback(
    (leafId) => {
      setLeaves((prev) =>
        prev.map((l) => {
          if (l.id === leafId && l.active && !l.tapped) {
            const rt = performance.now() - (leafStartTimes.current[leafId] ?? performance.now());
            const rtNorm = normalizeRT(rt, ageBand);

            if (l.isTarget) {
              setHits((h) => h + 1);
              const newIrt = updateTheta(irt, true, rt, ageBand);
              setIrt(newIrt);
              setTrials((t) => [
                ...t,
                { correct: true, rt, rtNorm, type: 'hit', module: 'PS' },
              ]);
            } else {
              setFalseAlarms((f) => f + 1);
              const newIrt = updateTheta(irt, false, rt, ageBand);
              setIrt(newIrt);
              setTrials((t) => [
                ...t,
                { correct: false, rt, rtNorm, type: 'commission', module: 'PS' },
              ]);
            }

            if (leafTimersRef.current[leafId]) {
              clearTimeout(leafTimersRef.current[leafId]);
            }

            return { ...l, tapped: true, active: false };
          }
          return l;
        })
      );
    },
    [irt, ageBand]
  );

  const finishModule = useCallback(() => {
    setDone(true);
    clearAllTimers();

    const targetTrials = TOTAL_LEAVES * TARGET_RATIO;
    const hitRate = Math.min(Math.max(hits / Math.max(targetTrials, 1), 0.01), 0.99);
    const faRate = Math.min(
      Math.max(falseAlarms / Math.max(TOTAL_LEAVES - targetTrials, 1), 0.01),
      0.99
    );
    const dPrime = zScore(hitRate) - zScore(faRate);

    const hitRts = trials.filter((t) => t.type === 'hit').map((t) => t.rt);
    const itv = computeITV(hitRts.length > 1 ? hitRts : trials.map((t) => t.rt));
    const meanRT = hitRts.length > 0 ? hitRts.reduce((a, b) => a + b, 0) / hitRts.length : 1400;
    const baseline = computeEarlyBaselineRT(trials, 6) || meanRT;
    const decay = detectEngagementDecay(trials, baseline);
    const ddm = estimateDDM(
      trials.map((t) => ({ correct: t.correct, rtNorm: t.rtNorm, rt: t.rt })),
      itv
    );
    const exgauss = estimateExGaussian(trials.map((t) => t.rt).filter((rt) => rt > 0));

    onComplete({
      theta: irt.theta,
      thetaSE: irt.se,
      thetaCI: irt.ci,
      itv,
      ddm,
      engagementFatigued: decay.fatigued,
      trials,
      extras: {
        dPrime,
        hitRate,
        falseAlarmRate: faRate,
        commissionRate: faRate,
        omissionRate: 1 - hitRate,
        exgauss,
      },
    });
  }, [hits, falseAlarms, trials, irt.theta, irt.se, irt.ci, onComplete, clearAllTimers]);

  return (
    <div className="game-area" style={{ background: '#D6E8D0', position: 'relative', overflow: 'hidden' }}>
      {/* Forest canopy background */}
      <svg
        viewBox="0 0 800 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="800" height="600" fill="#D6E8D0" />
        {/* Canopy arches */}
        <ellipse cx="200" cy="-20" rx="250" ry="120" fill="#5B8C5A" opacity="0.4" />
        <ellipse cx="600" cy="-40" rx="300" ry="130" fill="#4A7C4A" opacity="0.3" />
        <ellipse cx="400" cy="-10" rx="200" ry="100" fill="#6B9C6A" opacity="0.35" />
        {/* Ground */}
        <rect x="0" y="540" width="800" height="60" rx="0" fill="#8B6B4E" opacity="0.6" />
      </svg>

      {/* Instructions */}
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "var(--font-game, 'Nunito')",
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color: '#2C3E35',
          zIndex: 10,
        }}
      >
        Tap the leaves with a ⭐!
      </div>

      {/* Leaves */}
      {leaves.map((leaf) => {
        if (!leaf.active && !leaf.tapped && !leaf.missed) return null;
        const crumple = leaf.missed && !leaf.tapped;
        const caught = leaf.tapped;

        return (
          <button
            key={leaf.id}
            onClick={() => handleTapLeaf(leaf.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleTapLeaf(leaf.id);
            }}
            role="button"
            tabIndex={leaf.active ? 0 : -1}
            aria-label={leaf.isTarget ? 'Star leaf - tap this!' : 'Regular leaf'}
            disabled={!leaf.active}
            style={{
              position: 'absolute',
              left: `${leaf.x}%`,
              top: 0,
              width: 56,
              height: 56,
              border: 'none',
              background: 'transparent',
              cursor: leaf.active ? 'pointer' : 'default',
              padding: 0,
              zIndex: 5,
              animation: caught
                ? 'crumple 0.3s ease-out forwards'
                : crumple
                ? 'crumple 0.4s ease-out forwards'
                : `leafFall ${leaf.fallDuration}ms linear forwards`,
              pointerEvents: leaf.active ? 'auto' : 'none',
              transform: 'translateX(-50%)',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56">
              <path
                d="M28 4 C18 8, 6 18, 8 30 C10 42, 22 52, 28 52 C34 52, 46 42, 48 30 C50 18, 38 8, 28 4Z"
                fill={leaf.color}
              />
              <line x1="28" y1="8" x2="28" y2="48" stroke="#8B5E3C" strokeWidth="1.5" opacity="0.4" />
              {leaf.isTarget && (
                <text x="28" y="32" textAnchor="middle" dominantBaseline="middle" fontSize="16">
                  ⭐
                </text>
              )}
            </svg>
          </button>
        );
      })}

      {/* Score display - minimal */}
      <div
        style={{
          position: 'absolute',
          bottom: 8,
          right: 12,
          fontFamily: "var(--font-game, 'Nunito')",
          fontSize: '0.8rem',
          color: '#6B7F78',
          zIndex: 10,
        }}
        aria-hidden="true"
      >
        {leafIndex}/{TOTAL_LEAVES}
      </div>
    </div>
  );
}
