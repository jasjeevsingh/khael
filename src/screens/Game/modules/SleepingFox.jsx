import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createIRTState,
  updateTheta,
  bToGoNoGoParams,
  normalizeRT,
} from '../../../engine/irt';
import {
  computeITV,
  detectEngagementDecay,
  computeEarlyBaselineRT,
  estimateExGaussian,
} from '../../../engine/consistency';
import { estimateDDM } from '../../../engine/driftDiffusion';

const TOTAL_TRIALS = 40;
const GO_RATIO = 0.7;

export default function SleepingFox({ ageBand, onComplete }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [trialNum, setTrialNum] = useState(0);
  const [isGo, setIsGo] = useState(true);
  const [phase, setPhase] = useState('waiting');
  const [feedback, setFeedback] = useState(null);
  const [trials, setTrials] = useState([]);
  const [done, setDone] = useState(false);

  const irtRef = useRef(irt);
  const trialsRef = useRef(trials);
  const stimulusStartRef = useRef(null);
  const timerRef = useRef(null);
  const tappedRef = useRef(false);
  const isGoRef = useRef(true);

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

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (done) return;
    if (trialNum >= TOTAL_TRIALS) {
      setDone(true);
      const t = trialsRef.current;
      const currentIrt = irtRef.current;
      const rts = t.filter((r) => r.type === 'hit').map((r) => r.rt);
      const allRts = t.filter((r) => r.rt > 0).map((r) => r.rt);
      const itv = computeITV(rts.length > 1 ? rts : allRts);
      const meanRT = allRts.length > 0 ? allRts.reduce((a, b) => a + b, 0) / allRts.length : 1200;
      const baseline = computeEarlyBaselineRT(t, 6) || meanRT;
      const decay = detectEngagementDecay(t, baseline);
      const ddm = estimateDDM(
        t
          .filter((r) => r.rt > 0)
          .map((r) => ({ correct: r.correct, rtNorm: r.rtNorm, rt: r.rt })),
        itv
      );
      const exgauss = estimateExGaussian(allRts);

      const goTrials = t.filter((r) => r.isGo);
      const stopTrials = t.filter((r) => !r.isGo);
      const commissionRate =
        stopTrials.length > 0
          ? stopTrials.filter((r) => r.type === 'commission').length / stopTrials.length
          : 0;
      const omissionRate =
        goTrials.length > 0
          ? goTrials.filter((r) => r.type === 'omission').length / goTrials.length
          : 0;
      const hitTrialRts = t.filter((r) => r.type === 'hit').map((r) => r.rt);
      const meanGoRT =
        hitTrialRts.length > 0
          ? hitTrialRts.reduce((a, b) => a + b, 0) / hitTrialRts.length
          : 0;

      let postErrorSlowing = 1.0;
      const commissionIndices = t
        .map((r, i) => (r.type === 'commission' ? i : -1))
        .filter((i) => i >= 0);
      if (commissionIndices.length > 0 && hitTrialRts.length > 0) {
        const postErrorRTs = commissionIndices
          .map((i) => {
            for (let j = i + 1; j < t.length; j++) {
              if (t[j].type === 'hit') return t[j].rt;
            }
            return null;
          })
          .filter(Boolean);
        if (postErrorRTs.length > 0) {
          const meanPostError = postErrorRTs.reduce((a, b) => a + b, 0) / postErrorRTs.length;
          postErrorSlowing = meanGoRT > 0 ? meanPostError / meanGoRT : 1.0;
        }
      }

      onComplete({
        theta: currentIrt.theta,
        thetaSE: currentIrt.se,
        thetaCI: currentIrt.ci,
        itv,
        ddm,
        engagementFatigued: decay.fatigued,
        trials: t,
        extras: {
          commissionRate,
          omissionRate,
          meanGoRT,
          postErrorSlowing,
          exgauss,
        },
      });
      return;
    }

    // Start a new trial
    const goTrial = Math.random() < GO_RATIO;
    isGoRef.current = goTrial;
    setIsGo(goTrial);
    setPhase('stimulus');
    setFeedback(null);
    tappedRef.current = false;
    stimulusStartRef.current = performance.now();

    const currentIrt = irtRef.current;
    const params = bToGoNoGoParams(currentIrt.b);
    const duration = goTrial ? params.goDuration : params.stopDuration;

    timerRef.current = setTimeout(() => {
      if (!tappedRef.current) {
        const latestIrt = irtRef.current;
        if (goTrial) {
          const rt = duration;
          const rtNorm = normalizeRT(rt, ageBand);
          const newIrt = updateTheta(latestIrt, false, rt, ageBand);
          setIrtAndRef(newIrt);
          pushTrial({ correct: false, rt, rtNorm, type: 'omission', isGo: true, module: 'EF' });
          setFeedback('miss');
        } else {
          pushTrial({ correct: true, rt: 0, rtNorm: 0, type: 'correct_reject', isGo: false, module: 'EF' });
          setFeedback('good');
        }
      }

      setPhase('isi');
      const isi = 400 + Math.random() * 200;
      timerRef.current = setTimeout(() => {
        setTrialNum((n) => n + 1);
      }, isi);
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [trialNum, done, ageBand, onComplete, setIrtAndRef, pushTrial]);

  const handleTap = useCallback(() => {
    if (phase !== 'stimulus' || tappedRef.current) return;
    tappedRef.current = true;

    const rt = performance.now() - stimulusStartRef.current;
    const rtNorm = normalizeRT(rt, ageBand);
    const currentIrt = irtRef.current;
    const goTrial = isGoRef.current;

    if (goTrial) {
      const newIrt = updateTheta(currentIrt, true, rt, ageBand);
      setIrtAndRef(newIrt);
      pushTrial({ correct: true, rt, rtNorm, type: 'hit', isGo: true, module: 'EF' });
      setFeedback('hit');
    } else {
      const newIrt = updateTheta(currentIrt, false, rt, ageBand);
      setIrtAndRef(newIrt);
      pushTrial({ correct: false, rt, rtNorm, type: 'commission', isGo: false, module: 'EF' });
      setFeedback('oops');
    }
  }, [phase, ageBand, setIrtAndRef, pushTrial]);

  const eyesClosed = isGo && phase === 'stimulus';

  return (
    <div className="game-area" style={{ background: '#C8D4D8', position: 'relative' }}>
      {/* Forest floor background */}
      <svg
        viewBox="0 0 800 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="800" height="600" fill="#C8D4D8" />
        <rect x="0" y="420" width="800" height="180" fill="#6B8C5A" opacity="0.3" />
        <ellipse cx="100" cy="440" rx="80" ry="20" fill="#5B7C4A" opacity="0.3" />
        <ellipse cx="650" cy="450" rx="100" ry="25" fill="#5B7C4A" opacity="0.25" />
        {/* Tree roots */}
        <path d="M0 350 Q50 380, 30 420 Q10 450, 0 500" stroke="#8B6B4E" strokeWidth="8" fill="none" opacity="0.3" />
        <path d="M800 320 Q750 370, 770 420 Q790 460, 800 500" stroke="#8B6B4E" strokeWidth="8" fill="none" opacity="0.3" />
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
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color: '#2C3E35',
          zIndex: 10,
          padding: '0 16px',
        }}
      >
        {ageBand <= 3
          ? 'Tap the drum when eyes are closed!'
          : 'Shhh! Tap the drum when the fox sleeps. Freeze when eyes open!'}
      </div>

      {/* Fox face */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Ears */}
          <polygon points="40,80 60,20 80,80" fill="#E87C3F" />
          <polygon points="50,75 60,35 70,75" fill="#FFD4B8" />
          <polygon points="120,80 140,20 160,80" fill="#E87C3F" />
          <polygon points="130,75 140,35 150,75" fill="#FFD4B8" />

          {/* Head */}
          <ellipse cx="100" cy="120" rx="65" ry="55" fill="#E87C3F" />

          {/* White face patch */}
          <ellipse cx="100" cy="135" rx="40" ry="35" fill="#FFE8D4" />

          {/* Eyes */}
          {eyesClosed ? (
            <>
              <path
                d="M 72,108 Q 80,115 88,108"
                stroke="#4A3728"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 112,108 Q 120,115 128,108"
                stroke="#4A3728"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            <>
              <ellipse cx="80" cy="108" rx="8" ry="9" fill="#4A3728" />
              <ellipse cx="120" cy="108" rx="8" ry="9" fill="#4A3728" />
              <circle cx="83" cy="105" r="3" fill="white" />
              <circle cx="123" cy="105" r="3" fill="white" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="100" cy="130" rx="7" ry="5" fill="#2C2C2C" />

          {/* Mouth */}
          <path d="M 93,137 Q 100,143 107,137" stroke="#8B6B4E" strokeWidth="1.5" fill="none" />

          {/* Whiskers */}
          <line x1="50" y1="125" x2="75" y2="128" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
          <line x1="50" y1="135" x2="75" y2="133" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
          <line x1="150" y1="125" x2="125" y2="128" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
          <line x1="150" y1="135" x2="125" y2="133" stroke="#D4A574" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>

      {/* Drum */}
      <button
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleTap();
        }}
        role="button"
        tabIndex={0}
        aria-label={eyesClosed ? 'Tap the drum now!' : "Don't tap - fox is awake!"}
        disabled={phase !== 'stimulus'}
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 100,
          height: 100,
          border: 'none',
          background: 'transparent',
          cursor: phase === 'stimulus' ? 'pointer' : 'default',
          padding: 0,
          zIndex: 10,
          animation: eyesClosed && phase === 'stimulus' ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          {/* Drum body */}
          <ellipse cx="50" cy="70" rx="40" ry="15" fill="#8B4513" />
          <rect x="10" y="35" width="80" height="35" fill="#CD853F" />
          <ellipse cx="50" cy="35" rx="40" ry="15" fill="#DEB887" />
          {/* Drum pattern */}
          <path d="M 15,45 L 25,55 L 15,65" stroke="#8B4513" strokeWidth="2" fill="none" opacity="0.5" />
          <path d="M 85,45 L 75,55 L 85,65" stroke="#8B4513" strokeWidth="2" fill="none" opacity="0.5" />
          {/* Drumsticks */}
          <line x1="35" y1="15" x2="55" y2="35" stroke="#654321" strokeWidth="3" strokeLinecap="round" />
          <line x1="65" y1="15" x2="45" y2="35" stroke="#654321" strokeWidth="3" strokeLinecap="round" />
          <circle cx="35" cy="15" r="4" fill="#DEB887" />
          <circle cx="65" cy="15" r="4" fill="#DEB887" />
        </svg>
      </button>

      {/* Feedback */}
      {feedback && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2rem',
            fontFamily: "var(--font-game, 'Nunito')",
            color:
              feedback === 'hit' || feedback === 'good'
                ? 'var(--primary)'
                : 'var(--warning)',
            zIndex: 20,
            pointerEvents: 'none',
            animation: 'fadeIn 0.2s ease-out',
          }}
          aria-hidden="true"
        >
          {feedback === 'hit' && '✓'}
          {feedback === 'good' && '🤫'}
          {feedback === 'oops' && '😮'}
          {feedback === 'miss' && '💤'}
        </div>
      )}

      {/* Trial counter */}
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
        {Math.min(trialNum + 1, TOTAL_TRIALS)}/{TOTAL_TRIALS}
      </div>
    </div>
  );
}
