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
import Feedback from '../../../components/Feedback/Feedback';
import styles from './FeelingForest.module.css';
import './modules.css';

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
  { type: 1, difficulty: -2.5, answer: 'happy', animal: 'bear', context: null, description: 'A bear with a big smile' },
  { type: 1, difficulty: -2.2, answer: 'sad', animal: 'rabbit', context: null, description: 'A rabbit looking down with tears' },
  { type: 1, difficulty: -2.0, answer: 'angry', animal: 'bear', context: null, description: 'A bear with a frown and furrowed brows' },
  { type: 1, difficulty: -1.8, answer: 'scared', animal: 'bird', context: null, description: 'A bird with wide eyes shaking' },
  { type: 2, difficulty: -1.5, answer: 'happy', animal: 'rabbit', context: 'birthday_cake', description: 'A rabbit smiling at a birthday cake' },
  { type: 2, difficulty: -1.2, answer: 'sad', animal: 'bear', context: 'rain', description: 'A bear looking sad in the rain' },
  { type: 2, difficulty: -0.8, answer: 'scared', animal: 'rabbit', context: 'thunder', description: 'A rabbit hiding during a thunderstorm' },
  { type: 2, difficulty: -0.5, answer: 'angry', animal: 'bird', context: 'broken_toy', description: 'A bird looking angry at a broken toy' },
  { type: 3, difficulty: -0.2, answer: 'sad', animal: null, context: 'dropped_ice_cream', description: 'A dropped ice cream cone on the ground' },
  { type: 3, difficulty: 0.0, answer: 'happy', animal: null, context: 'gift', description: 'A beautifully wrapped present' },
  { type: 3, difficulty: 0.3, answer: 'scared', animal: null, context: 'dark_cave', description: 'A dark cave entrance' },
  { type: 4, difficulty: 0.5, answer: 'surprised', animal: 'bear', context: 'gift', description: 'A bear opening an unexpected gift' },
  { type: 4, difficulty: 0.8, answer: 'happy', animal: 'rabbit', context: 'friends', description: 'A rabbit seeing friends arrive' },
  { type: 4, difficulty: 1.0, answer: 'scared', animal: 'bird', context: 'new_place', description: 'A bird in a new, unfamiliar forest' },
  { type: 5, difficulty: 1.3, answer: 'sad', animal: 'rabbit', context: 'taken_toy', description: 'A bear taking a toy from a rabbit' },
  { type: 5, difficulty: 1.5, answer: 'happy', animal: 'bird', context: 'shared_food', description: 'A bear sharing berries with a bird' },
  { type: 5, difficulty: 1.8, answer: 'angry', animal: 'bear', context: 'pushed', description: 'A rabbit accidentally bumping into a bear' },
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
      <circle cx="28" cy="28" r="24" fill={data.color} opacity="0.3" />
      <line
        x1="14" y1={18} x2="22" y2={18 - parseInt(browAngle) / 3}
        stroke="#4A3728" strokeWidth="2" strokeLinecap="round"
      />
      <line
        x1="34" y1={18 - parseInt(browAngle) / 3} x2="42" y2={18}
        stroke="#4A3728" strokeWidth="2" strokeLinecap="round"
      />
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
    <svg viewBox="0 0 320 220" width="100%">
      <defs>
        <linearGradient id="ffSceneSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D4E8D4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#B8D4C8" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="320" height="130" fill="url(#ffSceneSky)" />
      <rect x="0" y="130" width="320" height="90" fill="#8BC48B" opacity="0.35" />
      <path d="M0 130 Q80 125, 160 132 Q240 139, 320 128" fill="#7CB87C" opacity="0.3" />

      {/* Small flowers in scene */}
      {[{x:30,y:165,c:'#E8A0C8'},{x:280,y:170,c:'#E8C84A'}].map(f => (
        <g key={f.x} opacity="0.4">
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y+10} stroke="#5B8C5A" strokeWidth="1.5" />
          <circle cx={f.x} cy={f.y-2} r="3.5" fill={f.c} />
        </g>
      ))}

      {scene.context === 'birthday_cake' && (
        <g transform="translate(210, 90)">
          <rect x="0" y="20" width="45" height="35" rx="5" fill="#E8A0C8" />
          <rect x="3" y="22" width="39" height="6" fill="#FFD4E8" />
          <rect x="3" y="42" width="39" height="6" fill="#FFD4E8" />
          <line x1="22" y1="8" x2="22" y2="20" stroke="#E8C84A" strokeWidth="2.5" />
          <circle cx="22" cy="6" r="5" fill="#FFB84A" />
          <circle cx="22" cy="6" r="2.5" fill="#FFE84A" />
        </g>
      )}
      {scene.context === 'rain' && (
        <g>
          <rect x="0" y="0" width="320" height="70" fill="#8BA8C8" opacity="0.35" />
          {[45, 95, 150, 205, 255].map((x) => (
            <line key={x} x1={x} y1="65" x2={x - 5} y2="100" stroke="#81C4E8" strokeWidth="1.5" opacity="0.6" />
          ))}
        </g>
      )}
      {scene.context === 'dropped_ice_cream' && (
        <g transform="translate(140, 140)">
          <ellipse cx="20" cy="32" rx="18" ry="6" fill="#E8A0C8" opacity="0.5" />
          <polygon points="20,0 8,28 32,28" fill="#E8C84A" />
          <circle cx="20" cy="-2" r="12" fill="#FFB8D4" />
          <circle cx="16" cy="-4" r="2" fill="white" opacity="0.4" />
        </g>
      )}
      {scene.context === 'gift' && (
        <g transform="translate(210, 100)">
          <rect x="0" y="12" width="45" height="40" rx="4" fill="#E25B45" />
          <rect x="19" y="12" width="7" height="40" fill="#E8C84A" />
          <rect x="0" y="28" width="45" height="7" fill="#E8C84A" />
          <path d="M22 12 Q12 2, 17 -4 Q22 2, 22 12" fill="#E8C84A" />
          <path d="M22 12 Q32 2, 27 -4 Q22 2, 22 12" fill="#E8C84A" />
        </g>
      )}
      {scene.context === 'dark_cave' && (
        <g>
          <ellipse cx="160" cy="140" rx="90" ry="65" fill="#3C3C3C" />
          <ellipse cx="160" cy="140" rx="70" ry="50" fill="#2C2C2C" />
          <ellipse cx="160" cy="140" rx="50" ry="35" fill="#1C1C1C" />
        </g>
      )}

      {animal === 'bear' && (
        <g transform="translate(90, 45)">
          {/* Body */}
          <ellipse cx="60" cy="75" rx="30" ry="25" fill="#D4A574" />
          {/* Ears */}
          <circle cx="35" cy="12" r="12" fill="#D4A574" />
          <circle cx="35" cy="12" r="7" fill="#EDD5B3" />
          <circle cx="85" cy="12" r="12" fill="#D4A574" />
          <circle cx="85" cy="12" r="7" fill="#EDD5B3" />
          {/* Head */}
          <ellipse cx="60" cy="45" rx="35" ry="32" fill="#D4A574" />
          <ellipse cx="60" cy="52" rx="22" ry="18" fill="#EDD5B3" />
          {/* Expression */}
          {emotion === 'happy' && <path d="M 48,52 Q 60,64 72,52" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          {emotion === 'sad' && <path d="M 48,58 Q 60,48 72,58" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          {emotion === 'angry' && <line x1="48" y1="55" x2="72" y2="55" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" />}
          {emotion === 'scared' && <ellipse cx="60" cy="55" rx="5" ry="6" fill="#4A3728" />}
          {emotion === 'surprised' && <ellipse cx="60" cy="55" rx="5" ry="7" fill="#4A3728" />}
          {/* Eyes */}
          <circle cx="48" cy="38" r="4.5" fill="#4A3728" />
          <circle cx="72" cy="38" r="4.5" fill="#4A3728" />
          <circle cx="49.5" cy="36.5" r="1.5" fill="white" />
          <circle cx="73.5" cy="36.5" r="1.5" fill="white" />
          {/* Sad tears */}
          {emotion === 'sad' && (
            <>
              <ellipse cx="44" cy="45" rx="2" ry="3" fill="#81C4E8" opacity="0.6" />
              <ellipse cx="76" cy="45" rx="2" ry="3" fill="#81C4E8" opacity="0.6" />
            </>
          )}
          <ellipse cx="60" cy="47" rx="4.5" ry="3.5" fill="#8B6B4E" />
          {/* Blush */}
          <circle cx="40" cy="50" r="5" fill="#E8956D" opacity="0.2" />
          <circle cx="80" cy="50" r="5" fill="#E8956D" opacity="0.2" />
        </g>
      )}
      {animal === 'rabbit' && (
        <g transform="translate(90, 25)">
          {/* Body */}
          <ellipse cx="60" cy="95" rx="25" ry="20" fill="#E0D0C0" />
          {/* Ears */}
          <ellipse cx="48" cy="10" rx="9" ry="30" fill="#E0D0C0" />
          <ellipse cx="72" cy="10" rx="9" ry="30" fill="#E0D0C0" />
          <ellipse cx="48" cy="10" rx="5.5" ry="24" fill="#FFD4D4" />
          <ellipse cx="72" cy="10" rx="5.5" ry="24" fill="#FFD4D4" />
          {/* Head */}
          <ellipse cx="60" cy="58" rx="30" ry="27" fill="#E0D0C0" />
          {emotion === 'happy' && <path d="M 48,65 Q 60,76 72,65" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          {emotion === 'sad' && <path d="M 48,72 Q 60,62 72,72" stroke="#4A3728" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
          {emotion === 'angry' && <line x1="50" y1="68" x2="70" y2="68" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" />}
          {emotion === 'scared' && <ellipse cx="60" cy="68" rx="4.5" ry="5.5" fill="#4A3728" />}
          {/* Eyes */}
          <circle cx="50" cy="52" r="5" fill="#E25B8B" />
          <circle cx="70" cy="52" r="5" fill="#E25B8B" />
          <circle cx="50" cy="52" r="2.5" fill="#4A3728" />
          <circle cx="70" cy="52" r="2.5" fill="#4A3728" />
          <circle cx="51" cy="50.5" r="1" fill="white" />
          <circle cx="71" cy="50.5" r="1" fill="white" />
          {emotion === 'sad' && (
            <>
              <ellipse cx="44" cy="58" rx="2" ry="3" fill="#81C4E8" opacity="0.6" />
              <ellipse cx="76" cy="58" rx="2" ry="3" fill="#81C4E8" opacity="0.6" />
            </>
          )}
          <ellipse cx="60" cy="60" rx="3.5" ry="2.5" fill="#FFB8B8" />
          {/* Whiskers */}
          <g opacity="0.3">
            <line x1="35" y1="60" x2="48" y2="62" stroke="#C4A88C" strokeWidth="1" />
            <line x1="35" y1="65" x2="48" y2="64" stroke="#C4A88C" strokeWidth="1" />
            <line x1="85" y1="60" x2="72" y2="62" stroke="#C4A88C" strokeWidth="1" />
            <line x1="85" y1="65" x2="72" y2="64" stroke="#C4A88C" strokeWidth="1" />
          </g>
        </g>
      )}
      {animal === 'bird' && (
        <g transform="translate(100, 50)">
          {/* Body */}
          <ellipse cx="50" cy="50" rx="28" ry="25" fill="#FFD84A" />
          {/* Head */}
          <circle cx="50" cy="28" r="20" fill="#FFD84A" />
          {/* Beak */}
          <polygon points="50,34 40,40 60,40" fill="#E87C3F" />
          {emotion === 'happy' && <path d="M 42,45 Q 50,52 58,45" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {emotion === 'sad' && <path d="M 42,50 Q 50,43 58,50" stroke="#4A3728" strokeWidth="2" fill="none" strokeLinecap="round" />}
          {emotion === 'scared' && <ellipse cx="50" cy="47" rx="4" ry="5" fill="#4A3728" />}
          {/* Eyes */}
          <circle cx="42" cy="24" r="4" fill="#4A3728" />
          <circle cx="58" cy="24" r="4" fill="#4A3728" />
          <circle cx="43" cy="22.5" r="1.5" fill="white" />
          <circle cx="59" cy="22.5" r="1.5" fill="white" />
          {/* Wing */}
          <ellipse cx="28" cy="48" rx="14" ry="10" fill="#E8C84A" />
          {/* Crest */}
          <path d="M50 10 Q55 0, 52 8 Q58 2, 54 10" fill="#FFB84A" />
        </g>
      )}

      {!animal && (
        <text x="160" y="65" textAnchor="middle" fontFamily="var(--font-game)" fontSize="13" fill="#4A3728" opacity="0.8">
          {scene.description}
        </text>
      )}
    </svg>
  );
}

function MeadowBackground() {
  return (
    <svg viewBox="0 0 800 600" className="sceneBg" aria-hidden="true">
      <defs>
        <linearGradient id="ffSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#D8D0E8" />
          <stop offset="60%" stopColor="#E4DDE8" />
          <stop offset="100%" stopColor="#D8E4D8" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#ffSky)" />

      {/* Soft clouds */}
      <g opacity="0.3">
        <ellipse cx="200" cy="70" rx="60" ry="22" fill="white">
          <animate attributeName="cx" values="200;215;200" dur="25s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="175" cy="63" rx="35" ry="14" fill="white">
          <animate attributeName="cx" values="175;190;175" dur="25s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="600" cy="50" rx="55" ry="20" fill="white">
          <animate attributeName="cx" values="600;588;600" dur="30s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Rainbow arc (subtle) */}
      <path d="M100 300 Q400 50, 700 300" stroke="#E25B45" strokeWidth="4" fill="none" opacity="0.08" />
      <path d="M105 305 Q400 58, 695 305" stroke="#E8C84A" strokeWidth="4" fill="none" opacity="0.08" />
      <path d="M110 310 Q400 66, 690 310" stroke="#5B8C5A" strokeWidth="4" fill="none" opacity="0.08" />

      {/* Big friendly tree */}
      <g opacity="0.5">
        <rect x="620" y="200" width="30" height="200" rx="8" fill="#8B7355" />
        <ellipse cx="635" cy="180" rx="70" ry="80" fill="#5B8C5A" />
        <ellipse cx="635" cy="160" rx="55" ry="60" fill="#6B9C6A" />
        <ellipse cx="620" cy="140" rx="40" ry="45" fill="#7CB87C" />
      </g>

      {/* Rolling meadow ground */}
      <path d="M0 380 Q200 360, 400 375 Q600 390, 800 370 L800 600 L0 600Z" fill="#8BC48B" opacity="0.5" />
      <path d="M0 400 Q200 390, 400 400 Q600 410, 800 395 L800 600 L0 600Z" fill="#A8D8A8" opacity="0.4" />

      {/* Wildflowers scattered */}
      {[
        {x:80,y:410,c:'#E8A0C8'},{x:160,y:420,c:'#E8C84A'},{x:260,y:415,c:'#B8A0E8'},
        {x:380,y:425,c:'#E8A0C8'},{x:500,y:418,c:'#E8C84A'},{x:560,y:428,c:'#B8A0E8'},
        {x:700,y:415,c:'#E8A0C8'},{x:760,y:422,c:'#E8C84A'},
        {x:120,y:440,c:'#B8A0E8'},{x:320,y:445,c:'#E8A0C8'},{x:440,y:435,c:'#E8C84A'},
        {x:650,y:438,c:'#B8A0E8'},
      ].map((f, i) => (
        <g key={i}>
          <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 14} stroke="#5B8C5A" strokeWidth="1.5" />
          <circle cx={f.x} cy={f.y - 2} r={i % 3 === 0 ? 5 : 4} fill={f.c} />
          <circle cx={f.x} cy={f.y - 2} r={i % 3 === 0 ? 2 : 1.5} fill="white" opacity="0.35" />
        </g>
      ))}

      {/* Butterflies */}
      <g transform="translate(250, 350)" opacity="0.45">
        <ellipse cx="0" cy="0" rx="5" ry="3.5" fill="#B8A0E8">
          <animate attributeName="ry" values="3.5;1;3.5" dur="0.6s" repeatCount="indefinite" />
        </ellipse>
        <animateTransform attributeName="transform" type="translate" values="250,350;260,345;255,352;250,350" dur="8s" repeatCount="indefinite" />
      </g>
      <g transform="translate(480, 370)" opacity="0.4">
        <ellipse cx="0" cy="0" rx="4" ry="3" fill="#E8A0C8">
          <animate attributeName="ry" values="3;0.8;3" dur="0.5s" repeatCount="indefinite" />
        </ellipse>
        <animateTransform attributeName="transform" type="translate" values="480,370;475,365;482,372;480,370" dur="7s" repeatCount="indefinite" />
      </g>

      {/* Grass tufts */}
      {[50, 180, 340, 520, 680].map(x => (
        <g key={x} opacity="0.35">
          <path d={`M${x} 400 Q${x-3} 385, ${x-5} 380`} stroke="#5B8C5A" strokeWidth="2" fill="none" />
          <path d={`M${x+2} 400 Q${x+2} 382, ${x} 378`} stroke="#4A7C4A" strokeWidth="1.5" fill="none" />
          <path d={`M${x+4} 400 Q${x+7} 385, ${x+9} 382`} stroke="#5B8C5A" strokeWidth="2" fill="none" />
        </g>
      ))}
    </svg>
  );
}

function selectScene(targetB, usedIds) {
  const available = SCENES.filter((s) => !usedIds.has(s.difficulty));
  if (available.length === 0) return null;
  available.sort((a, b) => Math.abs(a.difficulty - targetB) - Math.abs(b.difficulty - targetB));
  return available[0];
}

export default function FeelingForest({ ageBand, onComplete, onFeedback }) {
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
      onFeedback?.(correct);

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
      <div className={`game-area ${styles.loading}`}>
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`game-area ${styles.scene}`}>
      <MeadowBackground />

      <div className="instruction">
        How is the friend feeling?
      </div>

      <div className={styles.sceneArea}>
        <AnimalScene scene={currentScene} />
      </div>

      <div className={styles.emotionRow}>
        {emotionOptions.map((emotion, idx) => {
          const isSelected = selected === idx;
          const showResult = selected !== null;
          let extraClass = '';
          if (showResult && isSelected) {
            extraClass = emotion === currentScene.answer ? styles.emotionCorrect : styles.emotionIncorrect;
          }

          return (
            <button
              key={idx}
              className={`${styles.emotionBtn} ${isSelected ? styles.emotionSelected : ''} ${extraClass}`}
              onClick={() => handleSelect(emotion, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(emotion, idx);
              }}
              role="button"
              tabIndex={0}
              aria-label={EMOTION_FACES[emotion]?.label ?? emotion}
              disabled={selected !== null}
            >
              <EmotionFace emotion={emotion} size={52} />
              <span className={styles.emotionLabel}>
                {EMOTION_FACES[emotion]?.label}
              </span>
            </button>
          );
        })}
      </div>

      <Feedback correct={feedback === true} active={feedback !== null} />

      <div className="trialCounter" aria-hidden="true">
        {trialNum + 1}/{MAX_TRIALS}
      </div>
    </div>
  );
}
