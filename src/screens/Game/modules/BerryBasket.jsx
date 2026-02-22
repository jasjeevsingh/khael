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

const BERRIES = [
  { id: 'red', color: '#E25B45', label: 'Red berry' },
  { id: 'blue', color: '#4A82C8', label: 'Blue berry' },
  { id: 'yellow', color: '#E8C84A', label: 'Yellow berry' },
  { id: 'purple', color: '#8B5FB0', label: 'Purple berry' },
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

export default function BerryBasket({ ageBand, onComplete }) {
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

  const berrySize = 64;

  return (
    <div className="game-area" style={{ background: '#D4E8DF', position: 'relative' }}>
      {/* River scene background */}
      <svg
        viewBox="0 0 800 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="800" height="350" fill="#C8E6C9" />
        <ellipse cx="400" cy="380" rx="500" ry="60" fill="#81C4E8" opacity="0.5">
          <animate attributeName="rx" values="500;480;500" dur="4s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="400" cy="400" rx="500" ry="50" fill="#64B5D6" opacity="0.4">
          <animate attributeName="rx" values="500;510;500" dur="3.5s" repeatCount="indefinite" />
        </ellipse>
        <rect x="0" y="430" width="800" height="170" fill="#A8D5BA" />
      </svg>

      {/* Instruction */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: "var(--font-game, 'Nunito')",
          fontSize: 'clamp(0.85rem, 2.5vw, 1.1rem)',
          color: '#2C3E35',
          padding: '0 16px',
          zIndex: 2,
        }}
      >
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

      {/* Berry display area */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 16,
          zIndex: 2,
        }}
      >
        {sequence.map((berry, i) => {
          const isLit = phase === PHASES.SHOWING && i === showIndex;
          const isTapped = phase === PHASES.RESPONDING && taps[i];
          return (
            <div key={i} style={{ position: 'relative' }}>
              <svg
                width={berrySize}
                height={berrySize}
                viewBox="0 0 64 64"
              >
                <circle
                  cx="32"
                  cy="36"
                  r="22"
                  fill={isLit ? berry.color : '#D5D5D0'}
                  opacity={isLit ? 1 : 0.4}
                  style={{ transition: 'fill 0.2s, opacity 0.2s' }}
                />
                <ellipse cx="32" cy="14" rx="3" ry="6" fill="#5B8C5A" />
                <circle cx="26" cy="30" r="4" fill="white" opacity={isLit ? 0.3 : 0} />
              </svg>
              {isTapped && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: -4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Lily pad response area */}
      {phase === PHASES.RESPONDING && (
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 20,
            zIndex: 2,
          }}
        >
          {BERRIES.map((berry) => (
            <button
              key={berry.id}
              onClick={() => handleTap(berry)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleTap(berry);
              }}
              role="button"
              aria-label={`Tap ${berry.label}`}
              tabIndex={0}
              style={{
                width: 72,
                height: 72,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                padding: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <svg width="72" height="72" viewBox="0 0 72 72">
                {/* Lily pad */}
                <ellipse cx="36" cy="40" rx="32" ry="20" fill="#6BAF6B" opacity="0.8" />
                <ellipse cx="36" cy="38" rx="28" ry="16" fill="#7EC87E" />
                {/* Berry on pad */}
                <circle cx="36" cy="32" r="16" fill={berry.color} />
                <ellipse cx="36" cy="22" rx="2" ry="5" fill="#5B8C5A" />
                <circle cx="30" cy="28" r="3" fill="white" opacity="0.3" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* Tap progress indicator */}
      {phase === PHASES.RESPONDING && (
        <div
          style={{
            position: 'absolute',
            bottom: '4%',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 6,
            zIndex: 2,
          }}
        >
          {sequence.map((_, i) => (
            <div
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: i < taps.length ? 'var(--primary)' : '#ccc',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
      )}

      {/* Feedback overlay */}
      {phase === PHASES.FEEDBACK && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              animation: 'softBounce 0.6s ease-out',
            }}
            aria-hidden="true"
          >
            {feedback ? '⭐' : '💚'}
          </div>
        </div>
      )}
    </div>
  );
}
