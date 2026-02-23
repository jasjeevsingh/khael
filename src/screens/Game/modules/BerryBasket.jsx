import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createIRTState,
  updateTheta,
  bToSequenceLength,
  shouldStop,
  normalizeRT,
} from '../../../engine/irt';
import { computeITV } from '../../../engine/consistency';
import { estimateDDM } from '../../../engine/driftDiffusion';
import {
  detectEngagementDecay,
  trialWeight,
  computeEarlyBaselineRT,
  estimateExGaussian,
} from '../../../engine/consistency';
import Feedback from '../../../components/Feedback/Feedback';
import styles from './BerryBasket.module.css';
import '../modules/modules.css';

const BERRIES = [
  { id: 'red', color: '#E25B45', highlight: '#FF7B65', label: 'Red berry' },
  { id: 'blue', color: '#4A82C8', highlight: '#6AA2E8', label: 'Blue berry' },
  { id: 'yellow', color: '#E8C84A', highlight: '#FFE86A', label: 'Yellow berry' },
  { id: 'purple', color: '#8B5FB0', highlight: '#AB7FD0', label: 'Purple berry' },
];

const MIN_TRIALS = 8;
const MAX_TRIALS = 12;
const SHOW_INTERVAL = 700;
const BETWEEN_TRIAL_PAUSE = 800;

const PHASES = {
  SHOWING: 'showing',
  RESPONDING: 'responding',
  FEEDBACK: 'feedback',
  PAUSED: 'paused',
};

function RiverBackground() {
  return (
    <svg viewBox="0 0 800 600" className="sceneBg" aria-hidden="true">
      {/* Sky gradient */}
      <defs>
        <linearGradient id="bbSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B8E0F0" />
          <stop offset="100%" stopColor="#D4E8DF" />
        </linearGradient>
        <linearGradient id="bbWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#81C4E8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#5BA8D0" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bbSky)" />

      {/* Distant hills */}
      <ellipse cx="200" cy="280" rx="250" ry="80" fill="#A8D5BA" opacity="0.5" />
      <ellipse cx="600" cy="260" rx="280" ry="90" fill="#98C5AA" opacity="0.4" />

      {/* Trees left */}
      <g opacity="0.6">
        <rect x="30" y="180" width="14" height="140" rx="4" fill="#8B7355" />
        <ellipse cx="37" cy="170" rx="35" ry="45" fill="#5B8C5A" />
        <ellipse cx="37" cy="155" rx="28" ry="35" fill="#6B9C6A" />
        <rect x="90" y="200" width="12" height="120" rx="4" fill="#7B6345" />
        <ellipse cx="96" cy="190" rx="30" ry="40" fill="#4A7C4A" />
      </g>

      {/* Trees right */}
      <g opacity="0.6">
        <rect x="700" y="190" width="14" height="130" rx="4" fill="#8B7355" />
        <ellipse cx="707" cy="180" rx="38" ry="48" fill="#5B8C5A" />
        <rect x="740" y="210" width="11" height="110" rx="4" fill="#7B6345" />
        <ellipse cx="745" cy="200" rx="28" ry="38" fill="#6B9C6A" />
      </g>

      {/* Riverbank top - grass */}
      <path d="M0 340 Q200 320, 400 335 Q600 350, 800 330 L800 380 Q600 370, 400 380 Q200 390, 0 375 Z" fill="#7CB87C" />
      <path d="M0 355 Q200 340, 400 350 Q600 360, 800 345 L800 380 Q600 370, 400 380 Q200 390, 0 375 Z" fill="#8CC88C" opacity="0.7" />

      {/* River water */}
      <rect x="0" y="370" width="800" height="100" fill="url(#bbWater)" />
      {/* Ripple lines */}
      <path d="M0 390 Q100 385, 200 392 Q300 399, 400 390 Q500 381, 600 390 Q700 399, 800 392" stroke="white" strokeWidth="1.5" fill="none" opacity="0.25">
        <animate attributeName="d" values="M0 390 Q100 385, 200 392 Q300 399, 400 390 Q500 381, 600 390 Q700 399, 800 392;M0 392 Q100 399, 200 390 Q300 381, 400 392 Q500 399, 600 392 Q700 385, 800 390;M0 390 Q100 385, 200 392 Q300 399, 400 390 Q500 381, 600 390 Q700 399, 800 392" dur="4s" repeatCount="indefinite" />
      </path>
      <path d="M0 420 Q150 415, 300 422 Q450 429, 600 420 Q700 411, 800 420" stroke="white" strokeWidth="1" fill="none" opacity="0.2">
        <animate attributeName="d" values="M0 420 Q150 415, 300 422 Q450 429, 600 420 Q700 411, 800 420;M0 422 Q150 429, 300 420 Q450 411, 600 422 Q700 429, 800 420;M0 420 Q150 415, 300 422 Q450 429, 600 420 Q700 411, 800 420" dur="3.5s" repeatCount="indefinite" />
      </path>

      {/* Lily pads on water (decorative) */}
      <ellipse cx="150" cy="410" rx="20" ry="8" fill="#6BAF6B" opacity="0.4" />
      <ellipse cx="650" cy="400" rx="18" ry="7" fill="#6BAF6B" opacity="0.35" />

      {/* Cattails */}
      <g opacity="0.5">
        <line x1="120" y1="340" x2="120" y2="380" stroke="#7B9060" strokeWidth="2" />
        <ellipse cx="120" cy="335" rx="3" ry="8" fill="#8B6B4E" />
        <line x1="680" y1="335" x2="680" y2="375" stroke="#7B9060" strokeWidth="2" />
        <ellipse cx="680" cy="330" rx="3" ry="8" fill="#8B6B4E" />
      </g>

      {/* Riverbank bottom - grass */}
      <path d="M0 460 Q200 470, 400 465 Q600 460, 800 470 L800 600 L0 600 Z" fill="#7CB87C" />
      <path d="M0 470 Q200 480, 400 475 Q600 470, 800 478 L800 600 L0 600 Z" fill="#A8D5BA" />

      {/* Flowers on bank */}
      {[{x:60,y:490,c:'#E8A0C8'},{x:180,y:485,c:'#E8C84A'},{x:620,y:488,c:'#B8A0E8'},{x:740,y:492,c:'#E8A0C8'}].map(f => (
        <g key={f.x}>
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y+15} stroke="#5B8C5A" strokeWidth="2" />
          <circle cx={f.x} cy={f.y-3} r="5" fill={f.c} />
          <circle cx={f.x} cy={f.y-3} r="2" fill="white" opacity="0.4" />
        </g>
      ))}

      {/* Clouds */}
      <g opacity="0.4">
        <ellipse cx="180" cy="60" rx="50" ry="20" fill="white">
          <animate attributeName="cx" values="180;195;180" dur="20s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="160" cy="55" rx="30" ry="15" fill="white">
          <animate attributeName="cx" values="160;175;160" dur="20s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="580" cy="80" rx="45" ry="18" fill="white">
          <animate attributeName="cx" values="580;570;580" dur="25s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Butterfly */}
      <g transform="translate(350, 280)" opacity="0.5">
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="#E8A0C8">
          <animate attributeName="ry" values="4;1;4" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="0" cy="0" rx="6" ry="4" fill="#E8A0C8" transform="scale(-1,1)">
          <animate attributeName="ry" values="4;1;4" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
        <animateTransform attributeName="transform" type="translate" values="350,280;360,275;355,282;350,280" dur="6s" repeatCount="indefinite" />
      </g>
    </svg>
  );
}

function BerryShape({ color, highlight, size, lit }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <radialGradient id={`bg${color}`} cx="40%" cy="35%">
          <stop offset="0%" stopColor={highlight || color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="32" cy="54" rx="14" ry="4" fill="black" opacity={lit ? 0.1 : 0} />
      {/* Berry body */}
      <ellipse cx="32" cy="35" rx="20" ry="22" fill={lit ? `url(#bg${color})` : '#D5D5D0'} opacity={lit ? 1 : 0.4} style={{ transition: 'fill 0.2s, opacity 0.2s' }} />
      {/* Dimples */}
      <circle cx="24" cy="32" r="2" fill={lit ? color : '#ccc'} opacity="0.3" />
      <circle cx="38" cy="38" r="1.5" fill={lit ? color : '#ccc'} opacity="0.3" />
      {/* Specular highlight */}
      <ellipse cx="26" cy="28" rx="5" ry="4" fill="white" opacity={lit ? 0.35 : 0} />
      {/* Stem */}
      <path d="M32 14 Q30 10, 32 6" stroke="#5B8C5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="35" cy="10" rx="5" ry="3" fill="#5B8C5A" opacity="0.7" transform="rotate(15, 35, 10)" />
    </svg>
  );
}

export default function BerryBasket({ ageBand, onComplete, onFeedback }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [trialNum, setTrialNum] = useState(0);
  const [phase, setPhase] = useState(PHASES.PAUSED);
  const [sequence, setSequence] = useState([]);
  const [showIndex, setShowIndex] = useState(-1);
  const [taps, setTaps] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [trials, setTrials] = useState([]);
  const startTimeRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const generateSequence = useCallback(
    (b) => {
      const len = bToSequenceLength(b, ageBand);
      const seq = [];
      for (let i = 0; i < len; i++) {
        seq.push(BERRIES[Math.floor(Math.random() * BERRIES.length)]);
      }
      return seq;
    },
    [ageBand]
  );

  const startTrial = useCallback(() => {
    const seq = generateSequence(irt.b);
    setSequence(seq);
    setTaps([]);
    setFeedback(null);
    setShowIndex(0);
    setPhase(PHASES.SHOWING);
  }, [irt.b, generateSequence]);

  useEffect(() => {
    if (phase !== PHASES.SHOWING) return;
    if (showIndex >= sequence.length) {
      const t = setTimeout(() => {
        setShowIndex(-1);
        setPhase(PHASES.RESPONDING);
        startTimeRef.current = performance.now();
      }, 300);
      timersRef.current.push(t);
      return;
    }
    const t = setTimeout(() => {
      setShowIndex((prev) => prev + 1);
    }, SHOW_INTERVAL);
    timersRef.current.push(t);
  }, [phase, showIndex, sequence.length]);

  const handleTap = useCallback(
    (berry) => {
      if (phase !== PHASES.RESPONDING) return;
      const newTaps = [...taps, berry];
      setTaps(newTaps);

      if (newTaps.length >= sequence.length) {
        const rt = performance.now() - startTimeRef.current;
        const correct = newTaps.every((b, i) => b.id === sequence[i].id);

        let firstError = null;
        if (!correct) {
          firstError = newTaps.findIndex((b, i) => b.id !== sequence[i].id);
        }

        const rtNorm = normalizeRT(rt, ageBand);
        const trialCandidate = {
          trialNum,
          correct,
          rt,
          rtNorm,
          difficulty: irt.b,
          sequenceLength: sequence.length,
          firstErrorPosition: firstError,
          module: 'WM',
        };
        const provisionalTrials = [...trials, trialCandidate];
        const baseline = computeEarlyBaselineRT(provisionalTrials, 4) || rt;
        const decay = detectEngagementDecay(provisionalTrials, baseline);
        const weight = trialWeight(trialNum, decay.fatigueOnset);
        const newIrt = updateTheta(irt, correct, rt, ageBand, {
          responseWeight: weight,
        });
        setIrt(newIrt);

        const updatedTrials = provisionalTrials;
        setTrials(updatedTrials);

        setFeedback(correct);
        setPhase(PHASES.FEEDBACK);
        onFeedback?.(correct);

        const nextTrial = trialNum + 1;

        if (shouldStop(newIrt, nextTrial, MIN_TRIALS, MAX_TRIALS)) {
          const rts = updatedTrials.map((t) => t.rt);
          const itv = computeITV(rts);
          const meanRT = rts.reduce((a, b) => a + b, 0) / rts.length;
          const decay = detectEngagementDecay(updatedTrials, baseline || meanRT);
          const ddm = estimateDDM(
            updatedTrials.map((t) => ({ correct: t.correct, rtNorm: t.rtNorm, rt: t.rt })),
            itv
          );
          const exgauss = estimateExGaussian(rts);

          const primacyErrors = updatedTrials.filter(
            (t) => !t.correct && t.firstErrorPosition === 0
          ).length;
          const recencyErrors = updatedTrials.filter(
            (t) => !t.correct && t.firstErrorPosition === t.sequenceLength - 1
          ).length;

          const t = setTimeout(() => {
            onComplete({
              theta: newIrt.theta,
              thetaSE: newIrt.se,
              thetaCI: newIrt.ci,
              itv,
              ddm,
              engagementFatigued: decay.fatigued,
              trials: updatedTrials,
              extras: { primacyErrors, recencyErrors, exgauss },
            });
          }, 600);
          timersRef.current.push(t);
          return;
        }

        setTrialNum(nextTrial);
        const t = setTimeout(() => {
          setPhase(PHASES.PAUSED);
          const t2 = setTimeout(() => startTrial(), BETWEEN_TRIAL_PAUSE);
          timersRef.current.push(t2);
        }, 600);
        timersRef.current.push(t);
      }
    },
    [phase, taps, sequence, irt, trialNum, trials, ageBand, onComplete, startTrial]
  );

  useEffect(() => {
    if (trialNum === 0 && phase === PHASES.PAUSED) {
      const t = setTimeout(() => startTrial(), 500);
      timersRef.current.push(t);
    }
  }, []);

  return (
    <div className={`game-area ${styles.scene}`}>
      <RiverBackground />

      <div className="instruction">
        {phase === PHASES.SHOWING
          ? 'Watch the berries!'
          : phase === PHASES.RESPONDING
          ? 'Now tap them in order!'
          : phase === PHASES.FEEDBACK
          ? feedback
            ? 'Great job!'
            : 'Nice try!'
          : "Let's go!"}
      </div>

      <div className={styles.berryRow}>
        {sequence.map((berry, i) => {
          const isLit = phase === PHASES.SHOWING && i === showIndex;
          const isTapped = phase === PHASES.RESPONDING && taps[i];
          return (
            <div key={i} className={styles.berrySlot}>
              <BerryShape color={berry.color} highlight={berry.highlight} size={64} lit={isLit} />
              {isTapped && <div className={styles.tapIndicator} />}
            </div>
          );
        })}
      </div>

      {phase === PHASES.RESPONDING && (
        <div className={styles.lilyPadRow}>
          {BERRIES.map((berry) => (
            <button
              key={berry.id}
              className={styles.lilyPadBtn}
              onClick={() => handleTap(berry)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleTap(berry);
              }}
              role="button"
              aria-label={`Tap ${berry.label}`}
              tabIndex={0}
            >
              <svg width="80" height="80" viewBox="0 0 80 80">
                <ellipse cx="40" cy="48" rx="36" ry="22" fill="#5A9F5A" opacity="0.7" />
                <ellipse cx="40" cy="45" rx="32" ry="18" fill="#6BAF6B" />
                <ellipse cx="40" cy="44" rx="28" ry="15" fill="#7EC87E" />
                <path d="M40 44 L40 30" stroke="#5B8C5A" strokeWidth="1" opacity="0.3" />
                <ellipse cx="40" cy="36" rx="18" ry="19" fill={berry.color} />
                <ellipse cx="40" cy="26" rx="4" ry="2.5" fill="#5B8C5A" transform="rotate(15, 40, 26)" />
                <ellipse cx="34" cy="32" rx="4" ry="3" fill="white" opacity="0.3" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {phase === PHASES.RESPONDING && (
        <div className={styles.progressDots}>
          {sequence.map((_, i) => (
            <div
              key={i}
              className={`${styles.dot} ${i < taps.length ? styles.dotFilled : styles.dotEmpty}`}
            />
          ))}
        </div>
      )}

      <Feedback correct={feedback === true} active={phase === PHASES.FEEDBACK} />
    </div>
  );
}
