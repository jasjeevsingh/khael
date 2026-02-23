import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import Particles from '../../../components/Particles/Particles';
import styles from './SleepingFox.module.css';
import './modules.css';

const TOTAL_TRIALS = 40;
const GO_RATIO = 0.7;

const FIREFLY_POSITIONS = [
  { x: 12, y: 30, delay: 0 }, { x: 75, y: 25, delay: 1.5 }, { x: 88, y: 50, delay: 0.8 },
  { x: 20, y: 60, delay: 2.2 }, { x: 65, y: 70, delay: 1.0 }, { x: 40, y: 20, delay: 3.0 },
  { x: 92, y: 35, delay: 0.4 }, { x: 8, y: 45, delay: 2.8 },
];

function NightForestBackground() {
  return (
    <svg viewBox="0 0 800 600" className="sceneBg" aria-hidden="true">
      <defs>
        <linearGradient id="sfSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0d1b2a" />
          <stop offset="60%" stopColor="#1b2d4a" />
          <stop offset="100%" stopColor="#2a3d5a" />
        </linearGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FFF8E0" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFF8E0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" fill="url(#sfSky)" />

      {/* Stars */}
      {[{x:100,y:40},{x:250,y:70},{x:380,y:30},{x:520,y:55},{x:650,y:35},{x:720,y:80},{x:150,y:100},{x:450,y:90},{x:580,y:20},{x:300,y:50}].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={i % 3 === 0 ? 1.5 : 1} fill="white" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
        </circle>
      ))}

      {/* Moon */}
      <circle cx="650" cy="90" r="80" fill="url(#moonGlow)" />
      <circle cx="650" cy="90" r="30" fill="#FFF8E0" opacity="0.9" />
      <circle cx="660" cy="90" r="28" fill="#0d1b2a" opacity="0.15" />

      {/* Tree silhouettes */}
      <g opacity="0.7">
        <rect x="30" y="180" width="20" height="420" rx="5" fill="#1a2a1a" />
        <ellipse cx="40" cy="160" rx="55" ry="70" fill="#1a2a1a" />
        <ellipse cx="40" cy="140" rx="40" ry="50" fill="#223322" />
      </g>
      <g opacity="0.6">
        <rect x="140" y="200" width="16" height="400" rx="4" fill="#1a2a1a" />
        <ellipse cx="148" cy="185" rx="45" ry="55" fill="#1a2a1a" />
      </g>
      <g opacity="0.7">
        <rect x="680" y="170" width="22" height="430" rx="5" fill="#1a2a1a" />
        <ellipse cx="691" cy="150" rx="60" ry="75" fill="#1a2a1a" />
        <ellipse cx="691" cy="130" rx="45" ry="55" fill="#223322" />
      </g>
      <g opacity="0.5">
        <rect x="760" y="210" width="14" height="390" rx="4" fill="#1a2a1a" />
        <ellipse cx="767" cy="195" rx="35" ry="50" fill="#1a2a1a" />
      </g>

      {/* Ground - mossy forest floor */}
      <path d="M0 440 Q100 430, 200 442 Q300 454, 400 438 Q500 422, 600 440 Q700 458, 800 445 L800 600 L0 600Z" fill="#1a3020" />
      <path d="M0 460 Q150 450, 300 462 Q450 474, 600 458 Q700 448, 800 462 L800 600 L0 600Z" fill="#1a3520" opacity="0.8" />

      {/* Hollow log / den */}
      <g transform="translate(280, 410)">
        <ellipse cx="120" cy="40" rx="130" ry="35" fill="#3a2a1a" />
        <ellipse cx="120" cy="38" rx="120" ry="30" fill="#4a3a2a" />
        <ellipse cx="0" cy="35" rx="30" ry="35" fill="#2a1a0a" />
        <ellipse cx="0" cy="35" rx="22" ry="28" fill="#1a0a00" />
      </g>

      {/* Ferns */}
      <g opacity="0.4">
        <path d="M100 460 Q110 440, 120 445 Q115 450, 105 460" fill="#2a5530" />
        <path d="M105 458 Q95 438, 85 443 Q90 448, 100 458" fill="#2a5530" />
        <path d="M600 455 Q610 435, 620 440 Q615 445, 605 455" fill="#2a5530" />
      </g>

      {/* Mushrooms */}
      <g transform="translate(520, 445)" opacity="0.5">
        <rect x="5" y="10" width="3" height="8" rx="1" fill="#D4C4A8" />
        <ellipse cx="6" cy="10" rx="7" ry="5" fill="#D45B3A" opacity="0.7" />
        <circle cx="4" cy="8" r="1.5" fill="white" opacity="0.5" />
      </g>
      <g transform="translate(535, 450)" opacity="0.4">
        <rect x="3" y="8" width="2.5" height="6" rx="1" fill="#D4C4A8" />
        <ellipse cx="4" cy="8" rx="5" ry="4" fill="#E87C3F" opacity="0.6" />
      </g>
    </svg>
  );
}

export default function SleepingFox({ ageBand, onComplete, onFeedback }) {
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
      onFeedback?.(true);
    } else {
      const newIrt = updateTheta(currentIrt, false, rt, ageBand);
      setIrtAndRef(newIrt);
      pushTrial({ correct: false, rt, rtNorm, type: 'commission', isGo: false, module: 'EF' });
      setFeedback('oops');
      onFeedback?.(false);
    }
  }, [phase, ageBand, setIrtAndRef, pushTrial]);

  const eyesClosed = isGo && phase === 'stimulus';

  return (
    <div className={`game-area ${styles.scene}`}>
      <NightForestBackground />

      {/* Fireflies */}
      {FIREFLY_POSITIONS.map((ff, i) => (
        <div
          key={i}
          className={styles.firefly}
          style={{
            left: `${ff.x}%`,
            top: `${ff.y}%`,
            animationDelay: `${ff.delay}s`,
            animation: `twinkle ${2 + i * 0.3}s ease-in-out ${ff.delay}s infinite`,
          }}
        />
      ))}

      {/* Zzz when sleeping */}
      {eyesClosed && <div className={styles.zzz}>Z z z</div>}

      <div className="instruction" style={{ color: '#D4DDE8' }}>
        {ageBand <= 3
          ? 'Tap the drum when eyes are closed!'
          : 'Shhh! Tap the drum when the fox sleeps. Freeze when eyes open!'}
      </div>

      {/* Fox with body */}
      <div className={`${styles.foxContainer} ${eyesClosed ? styles.foxBreathing : ''}`}>
        <svg width="220" height="220" viewBox="0 0 220 220">
          {/* Curled body */}
          <ellipse cx="110" cy="165" rx="70" ry="35" fill="#D4783C" />
          <ellipse cx="110" cy="162" rx="65" ry="30" fill="#E87C3F" />
          {/* Belly fur */}
          <ellipse cx="130" cy="168" rx="30" ry="18" fill="#FFE8D4" opacity="0.5" />
          {/* Tail curled around */}
          <path d="M45 160 Q30 140, 50 130 Q70 120, 85 140" stroke="#E87C3F" strokeWidth="18" fill="none" strokeLinecap="round" />
          <path d="M45 160 Q30 140, 50 130" stroke="#FFE8D4" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.5" />

          {/* Ears */}
          <polygon points="65,75 82,18 98,75" fill="#E87C3F" />
          <polygon points="73,72 82,32 91,72" fill="#FFD4B8" />
          <polygon points="122,75 140,18 158,75" fill="#E87C3F" />
          <polygon points="130,72 140,32 150,72" fill="#FFD4B8" />

          {/* Head */}
          <ellipse cx="110" cy="110" rx="58" ry="48" fill="#E87C3F" />
          <ellipse cx="110" cy="122" rx="36" ry="30" fill="#FFE8D4" />

          {/* Eyes */}
          {eyesClosed ? (
            <>
              <path d="M82 102 Q90 110, 98 102" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none" />
              <path d="M122 102 Q130 110, 138 102" stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <ellipse cx="90" cy="100" rx="8" ry="9" fill="#4A3728" />
              <ellipse cx="130" cy="100" rx="8" ry="9" fill="#4A3728" />
              <circle cx="93" cy="97" r="3" fill="white" />
              <circle cx="133" cy="97" r="3" fill="white" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="110" cy="120" rx="6" ry="4.5" fill="#2C2C2C" />
          <circle cx="108" cy="119" r="1.5" fill="white" opacity="0.3" />

          {/* Mouth */}
          <path d="M104 127 Q110 133, 116 127" stroke="#8B6B4E" strokeWidth="1.5" fill="none" />

          {/* Whiskers */}
          <g opacity="0.4">
            <line x1="60" y1="115" x2="82" y2="118" stroke="#D4A574" strokeWidth="1" />
            <line x1="60" y1="125" x2="82" y2="123" stroke="#D4A574" strokeWidth="1" />
            <line x1="160" y1="115" x2="138" y2="118" stroke="#D4A574" strokeWidth="1" />
            <line x1="160" y1="125" x2="138" y2="123" stroke="#D4A574" strokeWidth="1" />
          </g>

          {/* Blush */}
          <circle cx="78" cy="115" r="6" fill="#E8956D" opacity="0.25" />
          <circle cx="142" cy="115" r="6" fill="#E8956D" opacity="0.25" />
        </svg>
      </div>

      {/* Drum */}
      <button
        className={`${styles.drumBtn} ${eyesClosed && phase === 'stimulus' ? styles.drumPulse : ''}`}
        onClick={handleTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleTap();
        }}
        role="button"
        tabIndex={0}
        aria-label={eyesClosed ? 'Tap the drum now!' : "Don't tap - fox is awake!"}
        disabled={phase !== 'stimulus'}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Drum shadow */}
          <ellipse cx="60" cy="105" rx="42" ry="8" fill="black" opacity="0.15" />
          {/* Drum body */}
          <ellipse cx="60" cy="85" rx="44" ry="16" fill="#6B3410" />
          <rect x="16" y="42" width="88" height="43" fill="#B8782F" />
          <rect x="16" y="42" width="88" height="43" fill="url(#drumShine)" />
          <ellipse cx="60" cy="42" rx="44" ry="16" fill="#D4A050" />
          <ellipse cx="60" cy="42" rx="38" ry="12" fill="#E8B860" />
          {/* Drum decorative bands */}
          <ellipse cx="60" cy="55" rx="44" ry="4" fill="#8B5A20" opacity="0.3" />
          <ellipse cx="60" cy="72" rx="44" ry="4" fill="#8B5A20" opacity="0.3" />
          {/* Zig-zag pattern */}
          <path d="M20 58 L30 65 L40 58 L50 65 L60 58 L70 65 L80 58 L90 65 L100 58" stroke="#E8C84A" strokeWidth="2" fill="none" opacity="0.5" />
          {/* Drumsticks */}
          <line x1="38" y1="18" x2="58" y2="40" stroke="#654321" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="82" y1="18" x2="62" y2="40" stroke="#654321" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="38" cy="18" r="5" fill="#D4A050" />
          <circle cx="82" cy="18" r="5" fill="#D4A050" />
          <circle cx="38" cy="18" r="2.5" fill="#E8C84A" />
          <circle cx="82" cy="18" r="2.5" fill="#E8C84A" />
        </svg>
      </button>

      {/* Particles for correct responses */}
      {(feedback === 'hit' || feedback === 'good') && (
        <Particles active={true} x="50%" y="45%" />
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`${styles.feedback} ${
            feedback === 'hit' || feedback === 'good' ? styles.feedbackGood : styles.feedbackBad
          }`}
          aria-hidden="true"
        >
          {feedback === 'hit' && '✓'}
          {feedback === 'good' && '🤫'}
          {feedback === 'oops' && '😮'}
          {feedback === 'miss' && '💤'}
        </div>
      )}

      <div className="trialCounter" style={{ color: '#8B9FB8' }} aria-hidden="true">
        {Math.min(trialNum + 1, TOTAL_TRIALS)}/{TOTAL_TRIALS}
      </div>
    </div>
  );
}
