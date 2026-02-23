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
import styles from './FallingLeaves.module.css';
import './modules.css';

const TOTAL_LEAVES = 35;
const TARGET_RATIO = 0.5;
const LEAF_COLORS = ['#E87C3F', '#D45B3A', '#E8A84A', '#C4783C'];
const LEAF_SHAPES = [
  'M28 4 C18 8, 6 18, 8 30 C10 42, 22 52, 28 52 C34 52, 46 42, 48 30 C50 18, 38 8, 28 4Z',
  'M28 6 C20 6, 8 16, 10 28 C12 40, 22 50, 28 52 C34 50, 44 40, 46 28 C48 16, 36 6, 28 6Z',
  'M28 4 C16 10, 4 22, 10 34 C14 42, 24 52, 28 52 C32 52, 42 42, 46 34 C52 22, 40 10, 28 4Z',
];

const FALL_START_PCT = -5;
const FALL_END_PCT = 92;

function computeCurrentTop(spawnTime, fallDuration) {
  const elapsed = performance.now() - spawnTime;
  const progress = Math.min(elapsed / fallDuration, 1);
  return FALL_START_PCT + progress * (FALL_END_PCT - FALL_START_PCT);
}

function zScore(p) {
  if (p <= 0) return -3;
  if (p >= 1) return 3;
  const a1 = -1.0976, a2 = 0.2422, b1 = -0.3456, b2 = 0.0527;
  const r = p < 0.5 ? p : 1 - p;
  const t = Math.sqrt(-2 * Math.log(r));
  let z = t + (a1 + a2 * t) / (1 + b1 * t + b2 * t * t);
  return p < 0.5 ? -z : z;
}

function ForestBackground() {
  return (
    <svg viewBox="0 0 800 600" className="sceneBg" aria-hidden="true">
      <defs>
        <linearGradient id="flSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C8DEC0" />
          <stop offset="100%" stopColor="#D6E8D0" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#flSky)" />

      {/* Tree trunks */}
      <rect x="60" y="100" width="22" height="500" rx="6" fill="#7B6345" opacity="0.6" />
      <rect x="200" y="80" width="18" height="520" rx="5" fill="#8B7355" opacity="0.5" />
      <rect x="580" y="90" width="20" height="510" rx="6" fill="#7B6345" opacity="0.55" />
      <rect x="720" y="110" width="24" height="490" rx="6" fill="#8B7355" opacity="0.5" />

      {/* Canopy foliage - layered organic shapes */}
      <ellipse cx="80" cy="80" rx="80" ry="60" fill="#3D6B3D" opacity="0.5" />
      <ellipse cx="60" cy="60" rx="60" ry="45" fill="#4A7C4A" opacity="0.4" />
      <ellipse cx="210" cy="60" rx="90" ry="55" fill="#3D6B3D" opacity="0.45" />
      <ellipse cx="400" cy="30" rx="120" ry="65" fill="#4A7C4A" opacity="0.35" />
      <ellipse cx="590" cy="55" rx="85" ry="55" fill="#3D6B3D" opacity="0.5" />
      <ellipse cx="730" cy="70" rx="95" ry="60" fill="#4A7C4A" opacity="0.45" />

      {/* Branches reaching across */}
      <path d="M75 140 Q200 120, 280 160" stroke="#6B5335" strokeWidth="6" fill="none" opacity="0.3" />
      <path d="M725 130 Q620 110, 540 155" stroke="#6B5335" strokeWidth="5" fill="none" opacity="0.25" />

      {/* Dappled sunlight patches on forest floor */}
      <ellipse cx="300" cy="520" rx="40" ry="15" fill="#E8E0A0" opacity="0.15" />
      <ellipse cx="500" cy="540" rx="50" ry="18" fill="#E8E0A0" opacity="0.12" />

      {/* Forest floor */}
      <rect x="0" y="550" width="800" height="50" fill="#6B5335" opacity="0.5" />
      <path d="M0 550 Q100 545, 200 552 Q300 558, 400 550 Q500 542, 600 552 Q700 558, 800 548" fill="#5B4325" opacity="0.4" />

      {/* Fallen leaves on ground */}
      <ellipse cx="150" cy="560" rx="8" ry="4" fill="#D45B3A" opacity="0.3" transform="rotate(15,150,560)" />
      <ellipse cx="400" cy="565" rx="7" ry="3.5" fill="#E8A84A" opacity="0.25" transform="rotate(-20,400,565)" />
      <ellipse cx="600" cy="558" rx="9" ry="4" fill="#E87C3F" opacity="0.3" transform="rotate(30,600,558)" />

      {/* Mushroom */}
      <g transform="translate(680, 530)" opacity="0.4">
        <rect x="8" y="12" width="4" height="12" rx="2" fill="#E8D4B8" />
        <ellipse cx="10" cy="12" rx="10" ry="7" fill="#E25B45" />
        <circle cx="7" cy="10" r="2" fill="white" opacity="0.6" />
        <circle cx="13" cy="8" r="1.5" fill="white" opacity="0.5" />
      </g>

      {/* Squirrel on branch */}
      <g transform="translate(260, 145)" opacity="0.4">
        <ellipse cx="10" cy="10" rx="8" ry="6" fill="#C4956A" />
        <circle cx="5" cy="7" r="4" fill="#C4956A" />
        <circle cx="3" cy="5" r="1" fill="#4A3728" />
        <path d="M18 8 Q25 2, 22 12" stroke="#C4956A" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}

export default function FallingLeaves({ ageBand, onComplete, onFeedback }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [leaves, setLeaves] = useState([]);
  const [leafIndex, setLeafIndex] = useState(0);
  const [trials, setTrials] = useState([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [done, setDone] = useState(false);

  const irtRef = useRef(irt);
  const trialsRef = useRef(trials);
  const hitsRef = useRef(0);
  const falseAlarmsRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const leafTimersRef = useRef({});
  const leafStartTimes = useRef({});

  const setIrtAndRef = useCallback((newIrt) => {
    irtRef.current = newIrt;
    setIrt(newIrt);
  }, []);

  const pushTrial = useCallback((trial) => {
    setTrials((prev) => {
      const next = [...prev, trial];
      trialsRef.current = next;
      return next;
    });
  }, []);

  const clearAllTimers = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    Object.values(leafTimersRef.current).forEach(clearTimeout);
    leafTimersRef.current = {};
  }, []);

  useEffect(() => () => clearAllTimers(), [clearAllTimers]);

  const spawnLeaf = useCallback(() => {
    if (leafIndex >= TOTAL_LEAVES) return;

    const isTarget = Math.random() < TARGET_RATIO;
    const { fallDuration, tapWindow } = bToLeafParams(irtRef.current.b, ageBand);
    const xPos = 10 + Math.random() * 80;
    const colorIdx = Math.floor(Math.random() * LEAF_COLORS.length);
    const shapeIdx = Math.floor(Math.random() * LEAF_SHAPES.length);
    const now = performance.now();

    const leaf = {
      id: leafIndex,
      isTarget,
      x: xPos,
      color: LEAF_COLORS[colorIdx],
      shape: LEAF_SHAPES[shapeIdx],
      fallDuration,
      tapWindow,
      tapped: false,
      missed: false,
      active: true,
      spawnTime: now,
      finalTop: null,
    };

    leafStartTimes.current[leafIndex] = now;
    setLeaves((prev) => [...prev, leaf]);
    setLeafIndex((prev) => prev + 1);

    const expireTimer = setTimeout(() => {
      setLeaves((prev) =>
        prev.map((l) => {
          if (l.id === leaf.id && !l.tapped && l.active) {
            if (l.isTarget) {
              setMisses((m) => m + 1);
              pushTrial({
                correct: false,
                rt: fallDuration,
                rtNorm: normalizeRT(fallDuration, ageBand),
                type: 'omission',
                module: 'PS',
              });
            }
            return {
              ...l,
              active: false,
              missed: true,
              finalTop: computeCurrentTop(l.spawnTime, l.fallDuration),
            };
          }
          return l;
        })
      );
    }, fallDuration);
    leafTimersRef.current[leaf.id] = expireTimer;
  }, [leafIndex, ageBand, pushTrial]);

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
            const currentIrt = irtRef.current;
            const currentTop = computeCurrentTop(l.spawnTime, l.fallDuration);

            if (l.isTarget) {
              setHits((h) => h + 1);
              hitsRef.current += 1;
              const newIrt = updateTheta(currentIrt, true, rt, ageBand);
              setIrtAndRef(newIrt);
              pushTrial({ correct: true, rt, rtNorm, type: 'hit', module: 'PS' });
              onFeedback?.(true);
            } else {
              setFalseAlarms((f) => f + 1);
              falseAlarmsRef.current += 1;
              const newIrt = updateTheta(currentIrt, false, rt, ageBand);
              setIrtAndRef(newIrt);
              pushTrial({ correct: false, rt, rtNorm, type: 'commission', module: 'PS' });
              onFeedback?.(false);
            }

            if (leafTimersRef.current[leafId]) {
              clearTimeout(leafTimersRef.current[leafId]);
            }

            return { ...l, tapped: true, active: false, finalTop: currentTop };
          }
          return l;
        })
      );
    },
    [ageBand, setIrtAndRef, pushTrial]
  );

  const finishModule = useCallback(() => {
    setDone(true);
    clearAllTimers();

    const t = trialsRef.current;
    const currentIrt = irtRef.current;
    const targetTrials = TOTAL_LEAVES * TARGET_RATIO;
    const h = hitsRef.current;
    const fa = falseAlarmsRef.current;
    const hitRate = Math.min(Math.max(h / Math.max(targetTrials, 1), 0.01), 0.99);
    const faRate = Math.min(
      Math.max(fa / Math.max(TOTAL_LEAVES - targetTrials, 1), 0.01),
      0.99
    );
    const dPrime = zScore(hitRate) - zScore(faRate);

    const hitRts = t.filter((r) => r.type === 'hit').map((r) => r.rt);
    const itv = computeITV(hitRts.length > 1 ? hitRts : t.map((r) => r.rt));
    const meanRT = hitRts.length > 0 ? hitRts.reduce((a, b) => a + b, 0) / hitRts.length : 1400;
    const baseline = computeEarlyBaselineRT(t, 6) || meanRT;
    const decay = detectEngagementDecay(t, baseline);
    const ddm = estimateDDM(
      t.map((r) => ({ correct: r.correct, rtNorm: r.rtNorm, rt: r.rt })),
      itv
    );
    const exgauss = estimateExGaussian(t.map((r) => r.rt).filter((rt) => rt > 0));

    onComplete({
      theta: currentIrt.theta,
      thetaSE: currentIrt.se,
      thetaCI: currentIrt.ci,
      itv,
      ddm,
      engagementFatigued: decay.fatigued,
      trials: t,
      extras: {
        dPrime,
        hitRate,
        falseAlarmRate: faRate,
        commissionRate: faRate,
        omissionRate: 1 - hitRate,
        exgauss,
      },
    });
  }, [onComplete, clearAllTimers]);

  return (
    <div className={`game-area ${styles.scene}`}>
      <ForestBackground />

      <div className="instruction">
        Tap the leaves with a ⭐!
      </div>

      {leaves.map((leaf) => {
        if (!leaf.active && !leaf.tapped && !leaf.missed) return null;
        const isCrumpling = leaf.tapped || (leaf.missed && !leaf.tapped);
        const crumpleDuration = leaf.tapped ? 0.35 : 0.4;
        const speedFactor = Math.max(0, (4000 - leaf.fallDuration) / 2500);
        const hitboxSize = Math.round(90 + speedFactor * 40);
        const hitboxPad = Math.round((hitboxSize - 56) / 2);

        return (
          <button
            key={leaf.id}
            className={`${styles.leafBtn} ${isCrumpling ? styles.leafCrumple : styles.leafFalling}`}
            onClick={() => handleTapLeaf(leaf.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') handleTapLeaf(leaf.id);
            }}
            role="button"
            tabIndex={leaf.active ? 0 : -1}
            aria-label={leaf.isTarget ? 'Star leaf - tap this!' : 'Regular leaf'}
            disabled={!leaf.active}
            style={{
              left: `${leaf.x}%`,
              top: isCrumpling ? `${leaf.finalTop ?? 0}%` : undefined,
              width: hitboxSize,
              height: hitboxSize,
              padding: hitboxPad,
              animationDuration: isCrumpling ? `${crumpleDuration}s` : `${leaf.fallDuration}ms`,
              pointerEvents: leaf.active ? 'auto' : 'none',
            }}
          >
            <svg width="56" height="56" viewBox="0 0 56 56">
              <path d={leaf.shape} fill={leaf.color} />
              <path d={leaf.shape} fill="white" opacity="0.1" />
              <line x1="28" y1="10" x2="28" y2="46" stroke="#8B5E3C" strokeWidth="1.5" opacity="0.3" />
              <line x1="18" y1="24" x2="28" y2="18" stroke="#8B5E3C" strokeWidth="1" opacity="0.2" />
              <line x1="38" y1="30" x2="28" y2="24" stroke="#8B5E3C" strokeWidth="1" opacity="0.2" />
              {leaf.isTarget && (
                <text x="28" y="34" textAnchor="middle" dominantBaseline="middle" fontSize="16">
                  ⭐
                </text>
              )}
            </svg>
          </button>
        );
      })}

      <div className="trialCounter" aria-hidden="true">
        {leafIndex}/{TOTAL_LEAVES}
      </div>
    </div>
  );
}
