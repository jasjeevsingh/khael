import { useState, useEffect, useCallback, useRef } from 'react';
import {
  createIRTState,
  updateTheta,
  shouldStop,
  normalizeRT,
} from '../../../engine/irt';
import {
  computeITV,
  detectEngagementDecay,
  computeEarlyBaselineRT,
  estimateExGaussian,
  trialWeight,
} from '../../../engine/consistency';
import { estimateDDM } from '../../../engine/driftDiffusion';

const MIN_TRIALS = 10;
const MAX_TRIALS = 12;

const EMOTIONS = ['happy', 'sad', 'scared', 'angry', 'surprised'];

const EMOTION_FACES = {
  happy: { eyes: '◠', mouth: '‿', color: '#E8C84A', label: 'Happy' },
  sad: { eyes: '◡', mouth: '⌢', color: '#4A82C8', label: 'Sad' },
  scared: { eyes: '●', mouth: 'O', color: '#8B5FB0', label: 'Scared' },
  angry: { eyes: '▼', mouth: '⌢', color: '#E25B45', label: 'Angry' },
  surprised: { eyes: '○', mouth: 'O', color: '#E87C3F', label: 'Surprised' },
};

const SCENES = [
  // Type 1: Face only (easiest)
  { type: 1, difficulty: -2.5, answer: 'happy', animal: 'bear', context: null, description: 'A bear with a big smile' },
  { type: 1, difficulty: -2.2, answer: 'sad', animal: 'rabbit', context: null, description: 'A rabbit looking down with tears' },
  { type: 1, difficulty: -2.0, answer: 'angry', animal: 'bear', context: null, description: 'A bear with a frown and furrowed brows' },
  { type: 1, difficulty: -1.8, answer: 'scared', animal: 'bird', context: null, description: 'A bird with wide eyes shaking' },

  // Type 2: Face + context
  { type: 2, difficulty: -1.5, answer: 'happy', animal: 'rabbit', context: 'birthday_cake', description: 'A rabbit smiling at a birthday cake' },
  { type: 2, difficulty: -1.2, answer: 'sad', animal: 'bear', context: 'rain', description: 'A bear looking sad in the rain' },
  { type: 2, difficulty: -0.8, answer: 'scared', animal: 'rabbit', context: 'thunder', description: 'A rabbit hiding during a thunderstorm' },
  { type: 2, difficulty: -0.5, answer: 'angry', animal: 'bird', context: 'broken_toy', description: 'A bird looking angry at a broken toy' },

  // Type 3: Context only
  { type: 3, difficulty: -0.2, answer: 'sad', animal: null, context: 'dropped_ice_cream', description: 'A dropped ice cream cone on the ground' },
  { type: 3, difficulty: 0.0, answer: 'happy', animal: null, context: 'gift', description: 'A beautifully wrapped present' },
  { type: 3, difficulty: 0.3, answer: 'scared', animal: null, context: 'dark_cave', description: 'A dark cave entrance' },

  // Type 4: Ambiguous
  { type: 4, difficulty: 0.5, answer: 'surprised', animal: 'bear', context: 'gift', description: 'A bear opening an unexpected gift' },
  { type: 4, difficulty: 0.8, answer: 'happy', animal: 'rabbit', context: 'friends', description: 'A rabbit seeing friends arrive' },
  { type: 4, difficulty: 1.0, answer: 'scared', animal: 'bird', context: 'new_place', description: 'A bird in a new, unfamiliar forest' },

  // Type 5: Two-character
  { type: 5, difficulty: 1.3, answer: 'sad', animal: 'rabbit', context: 'taken_toy', description: 'A bear taking a toy from a rabbit' },
  { type: 5, difficulty: 1.5, answer: 'happy', animal: 'bird', context: 'shared_food', description: 'A bear sharing berries with a bird' },
  { type: 5, difficulty: 1.8, answer: 'angry', animal: 'bear', context: 'pushed', description: 'A rabbit accidentally bumping into a bear' },

  // Type 6: Retrospective
  { type: 6, difficulty: 2.0, answer: 'happy', animal: 'bear', context: 'before_rain', description: 'How did the bear feel before it started raining? (Bear was playing happily)' },
  { type: 6, difficulty: 2.3, answer: 'scared', animal: 'rabbit', context: 'before_rescue', description: 'How did the rabbit feel before being rescued? (Rabbit was lost)' },
  { type: 6, difficulty: 2.5, answer: 'surprised', animal: 'bird', context: 'before_party', description: 'How did the bird feel when friends jumped out? (It was a surprise party)' },
];

function EmotionFace({ emotion, size = 60 }) {
  const data = EMOTION_FACES[emotion];
  if (!data) return null;

  const browAngle = emotion === 'angry' ? '15' : emotion === 'sad' ? '-10' : '0';
  const eyeY = emotion === 'scared' || emotion === 'surprised' ? 22 : 24;
  const eyeR = emotion === 'scared' || emotion === 'surprised' ? 6 : 4;
  const mouthY = 38;

  return (
    <svg width={size} height={size} viewBox="0 0 56 56">
      <circle cx="28" cy="28" r="26" fill={data.color} />
      <circle cx="28" cy="28" r="26" fill="white" opacity="0.15" />
      {/* Eyebrows */}
      <line
        x1="14" y1={18} x2="22" y2={18 - parseInt(browAngle) / 3}
        stroke="#4A3728" strokeWidth="2" strokeLinecap="round"
      />
      <line
        x1="34" y1={18 - parseInt(browAngle) / 3} x2="42" y2={18}
        stroke="#4A3728" strokeWidth="2" strokeLinecap="round"
      />
      {/* Eyes */}
      {emotion === 'happy' ? (
        <>
          <path d={`M 15,${eyeY} Q 19,${eyeY - 5} 23,${eyeY}`} stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d={`M 33,${eyeY} Q 37,${eyeY - 5} 41,${eyeY}`} stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="19" cy={eyeY} r={eyeR} fill="#4A3728" />
          <circle cx="37" cy={eyeY} r={eyeR} fill="#4A3728" />
          {(emotion === 'scared' || emotion === 'surprised') && (
            <>
              <circle cx="21" cy={eyeY - 2} r="2" fill="white" />
              <circle cx="39" cy={eyeY - 2} r="2" fill="white" />
            </>
          )}
        </>
      )}
      {/* Mouth */}
      {emotion === 'happy' && (
        <path d={`M 18,${mouthY} Q 28,${mouthY + 10} 38,${mouthY}`} stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {emotion === 'sad' && (
        <path d={`M 18,${mouthY + 5} Q 28,${mouthY - 3} 38,${mouthY + 5}`} stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}
      {(emotion === 'scared' || emotion === 'surprised') && (
        <ellipse cx="28" cy={mouthY + 2} rx="5" ry="6" fill="#4A3728" />
      )}
      {emotion === 'angry' && (
        <path d={`M 20,${mouthY + 3} L 36,${mouthY + 3}`} stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {/* Tears for sad */}
      {emotion === 'sad' && (
        <>
          <ellipse cx="15" cy="32" rx="2" ry="3" fill="#81C4E8" opacity="0.7" />
          <ellipse cx="41" cy="32" rx="2" ry="3" fill="#81C4E8" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

function AnimalScene({ scene }) {
  const animal = scene.animal;
  const emotion = scene.answer;

  return (
    <svg viewBox="0 0 280 200" width="100%" style={{ maxWidth: 300 }}>
      {/* Meadow background */}
      <rect x="0" y="0" width="280" height="120" fill="#B8D4C8" opacity="0.4" />
      <rect x="0" y="120" width="280" height="80" fill="#8BC48B" opacity="0.3" />

      {/* Context elements */}
      {scene.context === 'birthday_cake' && (
        <g transform="translate(180, 80)">
          <rect x="0" y="20" width="40" height="30" rx="4" fill="#E8A0C8" />
          <rect x="5" y="25" width="30" height="5" fill="#FFD4E8" />
          <line x1="20" y1="10" x2="20" y2="20" stroke="#E8C84A" strokeWidth="2" />
          <circle cx="20" cy="8" r="4" fill="#FFB84A" />
        </g>
      )}
      {scene.context === 'rain' && (
        <g>
          <rect x="0" y="0" width="280" height="60" fill="#8BA8C8" opacity="0.3" />
          {[40, 80, 130, 180, 220].map((x) => (
            <line key={x} x1={x} y1="60" x2={x - 5} y2="90" stroke="#81C4E8" strokeWidth="1.5" opacity="0.6" />
          ))}
        </g>
      )}
      {scene.context === 'dropped_ice_cream' && (
        <g transform="translate(120, 130)">
          <ellipse cx="20" cy="30" rx="15" ry="5" fill="#E8A0C8" opacity="0.6" />
          <polygon points="20,0 10,25 30,25" fill="#E8C84A" />
          <circle cx="20" cy="-2" r="10" fill="#FFB8D4" />
        </g>
      )}
      {scene.context === 'gift' && (
        <g transform="translate(180, 95)">
          <rect x="0" y="10" width="40" height="35" rx="3" fill="#E25B45" />
          <rect x="17" y="10" width="6" height="35" fill="#E8C84A" />
          <rect x="0" y="24" width="40" height="6" fill="#E8C84A" />
          <path d="M 20,10 Q 10,0 15,-5 Q 20,0 20,10" fill="#E8C84A" />
          <path d="M 20,10 Q 30,0 25,-5 Q 20,0 20,10" fill="#E8C84A" />
        </g>
      )}
      {scene.context === 'dark_cave' && (
        <g>
          <ellipse cx="140" cy="130" rx="80" ry="60" fill="#3C3C3C" />
          <ellipse cx="140" cy="130" rx="60" ry="45" fill="#2C2C2C" />
        </g>
      )}

      {/* Animal character */}
      {animal === 'bear' && (
        <g transform="translate(80, 50)">
          <circle cx="30" cy="12" r="10" fill="#D4A574" />
          <circle cx="90" cy="12" r="10" fill="#D4A574" />
          <ellipse cx="60" cy="50" rx="35" ry="32" fill="#D4A574" />
          <ellipse cx="60" cy="55" rx="22" ry="18" fill="#EDD5B3" />
          {emotion === 'happy' && <path d="M 48,52 Q 60,62 72,52" stroke="#4A3728" strokeWidth="2" fill="none" />}
          {emotion === 'sad' && <path d="M 48,58 Q 60,50 72,58" stroke="#4A3728" strokeWidth="2" fill="none" />}
          {emotion === 'angry' && <line x1="48" y1="55" x2="72" y2="55" stroke="#4A3728" strokeWidth="2" />}
          {emotion === 'scared' && <ellipse cx="60" cy="55" rx="5" ry="6" fill="#4A3728" />}
          <circle cx="48" cy="40" r="4" fill="#4A3728" />
          <circle cx="72" cy="40" r="4" fill="#4A3728" />
          <ellipse cx="60" cy="47" rx="4" ry="3" fill="#8B6B4E" />
        </g>
      )}
      {animal === 'rabbit' && (
        <g transform="translate(80, 30)">
          <ellipse cx="48" cy="10" rx="8" ry="28" fill="#E0D0C0" />
          <ellipse cx="72" cy="10" rx="8" ry="28" fill="#E0D0C0" />
          <ellipse cx="48" cy="10" rx="5" ry="22" fill="#FFD4D4" />
          <ellipse cx="72" cy="10" rx="5" ry="22" fill="#FFD4D4" />
          <ellipse cx="60" cy="60" rx="28" ry="25" fill="#E0D0C0" />
          {emotion === 'happy' && <path d="M 48,65 Q 60,74 72,65" stroke="#4A3728" strokeWidth="2" fill="none" />}
          {emotion === 'sad' && <path d="M 48,70 Q 60,62 72,70" stroke="#4A3728" strokeWidth="2" fill="none" />}
          {emotion === 'angry' && <line x1="50" y1="67" x2="70" y2="67" stroke="#4A3728" strokeWidth="2" />}
          {emotion === 'scared' && <ellipse cx="60" cy="67" rx="4" ry="5" fill="#4A3728" />}
          <circle cx="50" cy="52" r="4" fill="#E25B8B" />
          <circle cx="70" cy="52" r="4" fill="#E25B8B" />
          <circle cx="50" cy="52" r="2" fill="#4A3728" />
          <circle cx="70" cy="52" r="2" fill="#4A3728" />
          <ellipse cx="60" cy="60" rx="3" ry="2" fill="#FFB8B8" />
        </g>
      )}
      {animal === 'bird' && (
        <g transform="translate(90, 55)">
          <ellipse cx="50" cy="40" rx="25" ry="22" fill="#FFD84A" />
          <circle cx="50" cy="25" r="16" fill="#FFD84A" />
          <polygon points="50,30 42,36 58,36" fill="#E87C3F" />
          {emotion === 'happy' && <path d="M 42,40 Q 50,46 58,40" stroke="#4A3728" strokeWidth="1.5" fill="none" />}
          <circle cx="43" cy="22" r="3" fill="#4A3728" />
          <circle cx="57" cy="22" r="3" fill="#4A3728" />
          {/* Wing */}
          <ellipse cx="30" cy="40" rx="12" ry="8" fill="#E8C84A" />
        </g>
      )}

      {/* No animal — context-only scenes */}
      {!animal && (
        <text x="140" y="60" textAnchor="middle" fontFamily="var(--font-game)" fontSize="12" fill="#4A3728" opacity="0.7">
          {scene.description}
        </text>
      )}
    </svg>
  );
}

function selectScene(targetB, usedIds) {
  const available = SCENES.filter((s) => !usedIds.has(s.difficulty));
  if (available.length === 0) return null;
  available.sort((a, b) => Math.abs(a.difficulty - targetB) - Math.abs(b.difficulty - targetB));
  return available[0];
}

export default function FeelingForest({ ageBand, onComplete }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [trialNum, setTrialNum] = useState(0);
  const [currentScene, setCurrentScene] = useState(null);
  const [emotionOptions, setEmotionOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [trials, setTrials] = useState([]);
  const [usedDifficulties, setUsedDifficulties] = useState(new Set());
  const [confusionMatrix, setConfusionMatrix] = useState({});
  const [highestType, setHighestType] = useState(0);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const loadScene = useCallback(() => {
    const scene = selectScene(irt.b, usedDifficulties);
    if (!scene) return;

    setCurrentScene(scene);
    setUsedDifficulties((prev) => new Set([...prev, scene.difficulty]));

    const correct = scene.answer;
    const others = EMOTIONS.filter((e) => e !== correct);
    const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
    const opts = [correct, ...shuffled].sort(() => Math.random() - 0.5);
    setEmotionOptions(opts);
    setSelected(null);
    setFeedback(null);
    startTimeRef.current = performance.now();
  }, [irt.b, usedDifficulties]);

  useEffect(() => {
    loadScene();
  }, []);

  const handleSelect = useCallback(
    (emotion, idx) => {
      if (selected !== null || !currentScene) return;
      setSelected(idx);

      const rt = performance.now() - startTimeRef.current;
      const rtNorm = normalizeRT(rt, ageBand);
      const correct = emotion === currentScene.answer;

      if (correct && currentScene.type > highestType) {
        setHighestType(currentScene.type);
      }

      if (!correct) {
        setConfusionMatrix((prev) => {
          const key = `${currentScene.answer}_as_${emotion}`;
          return { ...prev, [key]: (prev[key] ?? 0) + 1 };
        });
      }

      const trialCandidate = {
        trialNum,
        correct,
        rt,
        rtNorm,
        difficulty: currentScene.difficulty,
        sceneType: currentScene.type,
        expectedEmotion: currentScene.answer,
        chosenEmotion: emotion,
        module: 'SC',
      };
      const provisionalTrials = [...trials, trialCandidate];
      const baseline = computeEarlyBaselineRT(provisionalTrials, 5) || rt;
      const decay = detectEngagementDecay(provisionalTrials, baseline);
      const weight = trialWeight(trialNum, decay.fatigueOnset);
      const newIrt = updateTheta(irt, correct, rt, ageBand, {
        responseWeight: weight,
      });
      setIrt(newIrt);
      setFeedback(correct);

      const updatedTrials = provisionalTrials;
      setTrials(updatedTrials);

      const nextTrial = trialNum + 1;

      if (shouldStop(newIrt, nextTrial, MIN_TRIALS, MAX_TRIALS) || !selectScene(newIrt.b, usedDifficulties)) {
        timerRef.current = setTimeout(() => {
          const rts = updatedTrials.map((t) => t.rt);
          const itv = computeITV(rts);
          const meanRT = rts.reduce((a, b) => a + b, 0) / rts.length;
          const decay = detectEngagementDecay(updatedTrials, baseline || meanRT);
          const ddm = estimateDDM(
            updatedTrials.map((t) => ({ correct: t.correct, rtNorm: t.rtNorm, rt: t.rt })),
            itv
          );
          const exgauss = estimateExGaussian(rts);
          onComplete({
            theta: newIrt.theta,
            thetaSE: newIrt.se,
            thetaCI: newIrt.ci,
            itv,
            ddm,
            engagementFatigued: decay.fatigued,
            trials: updatedTrials,
            extras: {
              highestSceneType: correct && currentScene.type > highestType ? currentScene.type : highestType,
              confusionMatrix,
              exgauss,
            },
          });
        }, 800);
        return;
      }

      setTrialNum(nextTrial);
      timerRef.current = setTimeout(() => loadScene(), 800);
    },
    [selected, currentScene, irt, trialNum, trials, ageBand, highestType, usedDifficulties, confusionMatrix, onComplete, loadScene]
  );

  if (!currentScene) {
    return (
      <div className="game-area" style={{ background: '#E4DDE8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "var(--font-game)", color: 'var(--text-light)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="game-area" style={{ background: '#E4DDE8', position: 'relative' }}>
      {/* Meadow background */}
      <svg
        viewBox="0 0 800 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="800" height="600" fill="#E4DDE8" />
        <rect x="0" y="380" width="800" height="220" fill="#C8E0C8" opacity="0.4" />
        {/* Flowers - deterministic positions to avoid visual jump on re-render */}
        {[
          { x: 100, y: 420, color: '#E8A0C8' },
          { x: 250, y: 435, color: '#E8C84A' },
          { x: 450, y: 428, color: '#B8A0E8' },
          { x: 600, y: 442, color: '#E8C84A' },
          { x: 720, y: 418, color: '#E8A0C8' },
        ].map((f) => (
          <g key={f.x} transform={`translate(${f.x}, ${f.y})`}>
            <line x1="0" y1="0" x2="0" y2="20" stroke="#5B8C5A" strokeWidth="2" />
            <circle cx="0" cy="-2" r="5" fill={f.color} />
          </g>
        ))}
      </svg>

      {/* Instruction */}
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
          padding: '0 16px',
        }}
      >
        How is the friend feeling?
      </div>

      {/* Scene */}
      <div
        style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
        }}
      >
        <AnimalScene scene={currentScene} />
      </div>

      {/* Emotion options */}
      <div
        style={{
          position: 'absolute',
          bottom: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 12,
          zIndex: 5,
        }}
      >
        {emotionOptions.map((emotion, idx) => {
          const isSelected = selected === idx;
          const showResult = selected !== null;
          let borderColor = 'transparent';
          if (showResult && isSelected) {
            borderColor = emotion === currentScene.answer ? '#4A7C6F' : '#D4956A';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(emotion, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(emotion, idx);
              }}
              role="button"
              tabIndex={0}
              aria-label={EMOTION_FACES[emotion]?.label ?? emotion}
              disabled={selected !== null}
              style={{
                border: `3px solid ${borderColor}`,
                borderRadius: 16,
                background: 'white',
                cursor: selected !== null ? 'default' : 'pointer',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'border-color 0.2s, transform 0.15s',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: 'var(--shadow-sm)',
                minHeight: 44,
                minWidth: 44,
              }}
            >
              <EmotionFace emotion={emotion} size={48} />
              <span
                style={{
                  fontFamily: "var(--font-game, 'Nunito')",
                  fontSize: '0.7rem',
                  color: 'var(--text-dark)',
                }}
              >
                {EMOTION_FACES[emotion]?.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback !== null && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '2.5rem',
            zIndex: 20,
            pointerEvents: 'none',
            animation: 'softBounce 0.6s ease-out',
          }}
          aria-hidden="true"
        >
          {feedback ? '⭐' : '💚'}
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
        {trialNum + 1}/{MAX_TRIALS}
      </div>
    </div>
  );
}
