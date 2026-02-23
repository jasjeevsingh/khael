import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { selectBridgeItem, shuffleBridgeOptions } from '../../../data/bridgeItems';
import Feedback from '../../../components/Feedback/Feedback';
import styles from './BridgeBuilder.module.css';
import './modules.css';

const MIN_TRIALS = 10;
const MAX_TRIALS = 14;

const SHAPE_COLORS = {
  red: '#E25B45',
  blue: '#4A82C8',
  yellow: '#E8C84A',
  purple: '#8B5FB0',
  green: '#5B8C5A',
  orange: '#E87C3F',
};

const SIZES = { big: 36, small: 22 };

function renderTileShape(tile, size = 32) {
  const color = SHAPE_COLORS[tile.color] ?? '#888';
  const s = SIZES[tile.size] ?? size;
  const shape = tile.shape ?? 'circle';
  const dir = tile.direction;

  if (dir) {
    const arrows = {
      up: 'M 24,38 L 24,12 L 14,22 M 24,12 L 34,22',
      down: 'M 24,8 L 24,34 L 14,24 M 24,34 L 34,24',
      left: 'M 40,24 L 12,24 L 22,14 M 12,24 L 22,34',
      right: 'M 8,24 L 36,24 L 26,14 M 36,24 L 26,34',
    };
    return (
      <svg width={48} height={48} viewBox="0 0 48 48">
        <rect x="2" y="2" width="44" height="44" rx="8" fill="#E8E0D4" />
        <rect x="2" y="2" width="44" height="44" rx="8" fill="white" opacity="0.15" />
        <path d={arrows[dir] ?? arrows.right} stroke="#4A3728" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg width={48} height={48} viewBox="0 0 48 48">
      <rect x="2" y="2" width="44" height="44" rx="8" fill="#E8E0D4" />
      <rect x="2" y="2" width="44" height="44" rx="8" fill="white" opacity="0.15" />
      {shape === 'circle' && <circle cx="24" cy="24" r={s / 2} fill={color} />}
      {shape === 'square' && (
        <rect x={24 - s / 2.2} y={24 - s / 2.2} width={s / 1.1} height={s / 1.1} rx="3" fill={color} />
      )}
      {shape === 'triangle' && (
        <polygon
          points={`24,${24 - s / 2} ${24 + s / 2},${24 + s / 2.2} ${24 - s / 2},${24 + s / 2.2}`}
          fill={color}
        />
      )}
      {shape === 'star' && (
        <polygon
          points="24,10 27.5,18 36,18 29,23 31.5,32 24,27 16.5,32 19,23 12,18 20.5,18"
          fill={color}
          transform={`scale(${s / 36})`}
          style={{ transformOrigin: '24px 24px' }}
        />
      )}
      {!shape && !dir && <circle cx="24" cy="24" r={s / 2} fill={color} />}
    </svg>
  );
}

function BridgeBackground() {
  return (
    <svg viewBox="0 0 800 600" className="sceneBg" aria-hidden="true">
      <defs>
        <linearGradient id="bbgSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C4D8F0" />
          <stop offset="100%" stopColor="#DDD5C4" />
        </linearGradient>
        <linearGradient id="bbgWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#81C4E8" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#5BA8D0" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bbgSky)" />

      {/* Mountains */}
      <polygon points="0,300 120,140 240,300" fill="#A8BCA0" opacity="0.4" />
      <polygon points="150,300 320,100 490,300" fill="#98AC90" opacity="0.35" />
      <polygon points="400,300 560,120 720,300" fill="#A8BCA0" opacity="0.3" />
      <polygon points="600,300 740,160 800,300" fill="#98AC90" opacity="0.25" />

      {/* Clouds */}
      <g opacity="0.35">
        <ellipse cx="160" cy="80" rx="50" ry="18" fill="white">
          <animate attributeName="cx" values="160;180;160" dur="30s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="140" cy="74" rx="30" ry="12" fill="white">
          <animate attributeName="cx" values="140;160;140" dur="30s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="550" cy="60" rx="60" ry="20" fill="white">
          <animate attributeName="cx" values="550;535;550" dur="35s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Cliff sides */}
      <rect x="0" y="260" width="130" height="340" fill="#8B7355" />
      <path d="M0 260 L130 260 L110 280 L0 290Z" fill="#9B8365" />
      <rect x="670" y="260" width="130" height="340" fill="#8B7355" />
      <path d="M670 260 L800 260 L800 290 L690 280Z" fill="#9B8365" />

      {/* Grass on cliffs */}
      <rect x="0" y="250" width="135" height="15" rx="4" fill="#6BAF6B" />
      <rect x="665" y="250" width="140" height="15" rx="4" fill="#6BAF6B" />

      {/* Bridge rope/wood structure */}
      {/* Rope top */}
      <path d="M120 230 Q400 200, 680 230" stroke="#8B6B4E" strokeWidth="4" fill="none" />
      <path d="M120 235 Q400 205, 680 235" stroke="#6B4B2E" strokeWidth="3" fill="none" />
      {/* Planks */}
      {Array.from({ length: 18 }, (_, i) => {
        const x = 140 + i * 30;
        return <rect key={i} x={x} y="265" width="24" height="8" rx="2" fill="#A08060" opacity={i % 3 === 1 ? 0.7 : 0.85} />;
      })}
      {/* Bridge deck */}
      <rect x="130" y="260" width="540" height="14" rx="3" fill="#8B7355" opacity="0.6" />
      {/* Rope bottom / railing */}
      <path d="M130 274 Q400 290, 670 274" stroke="#8B6B4E" strokeWidth="3" fill="none" opacity="0.6" />
      {/* Vertical ropes */}
      {[180, 280, 380, 480, 580].map(x => (
        <line key={x} x1={x} y1={232 + Math.abs(x - 400) * 0.02} x2={x} y2={274} stroke="#8B6B4E" strokeWidth="2" opacity="0.4" />
      ))}

      {/* Water below */}
      <rect x="120" y="400" width="560" height="200" fill="url(#bbgWater)" />
      <path d="M120 430 Q250 425, 380 432 Q510 439, 640 430 Q680 426, 680 430" stroke="white" strokeWidth="1" fill="none" opacity="0.2">
        <animate attributeName="d" values="M120 430 Q250 425, 380 432 Q510 439, 640 430 Q680 426, 680 430;M120 432 Q250 439, 380 430 Q510 421, 640 432 Q680 436, 680 432;M120 430 Q250 425, 380 432 Q510 439, 640 430 Q680 426, 680 430" dur="4s" repeatCount="indefinite" />
      </path>

      {/* Vines on cliff */}
      <path d="M125 260 Q130 290, 120 320 Q115 340, 125 360" stroke="#4A7C4A" strokeWidth="3" fill="none" opacity="0.4" />
      <path d="M675 260 Q670 285, 678 310" stroke="#4A7C4A" strokeWidth="2.5" fill="none" opacity="0.35" />

      {/* Trees on cliffs */}
      <g opacity="0.5">
        <rect x="40" y="210" width="10" height="45" rx="3" fill="#6B5335" />
        <ellipse cx="45" cy="200" rx="22" ry="28" fill="#4A7C4A" />
        <rect x="730" y="215" width="10" height="40" rx="3" fill="#6B5335" />
        <ellipse cx="735" cy="205" rx="20" ry="26" fill="#4A7C4A" />
      </g>

      {/* Flowers on cliff edge */}
      {[{x:15,c:'#E8A0C8'},{x:55,c:'#E8C84A'},{x:95,c:'#B8A0E8'},{x:700,c:'#E8A0C8'},{x:755,c:'#E8C84A'}].map(f => (
        <g key={f.x} opacity="0.5">
          <line x1={f.x} y1={252} x2={f.x} y2={260} stroke="#5B8C5A" strokeWidth="1.5" />
          <circle cx={f.x} cy={250} r="4" fill={f.c} />
        </g>
      ))}
    </svg>
  );
}

export default function BridgeBuilder({ ageBand, onComplete, onFeedback }) {
  const [irt, setIrt] = useState(() => createIRTState(ageBand));
  const [trialNum, setTrialNum] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [trials, setTrials] = useState([]);
  const [usedIds, setUsedIds] = useState(new Set());
  const [highestType, setHighestType] = useState(0);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const loadItem = useCallback(() => {
    const item = selectBridgeItem(irt.b, usedIds);
    if (!item) {
      finishModule();
      return;
    }
    setCurrentItem(item);
    setOptions(shuffleBridgeOptions(item));
    setSelected(null);
    setFeedback(null);
    startTimeRef.current = performance.now();
    setUsedIds((prev) => new Set([...prev, item.id]));
  }, [irt.b, usedIds]);

  useEffect(() => {
    loadItem();
  }, []);

  const finishModule = useCallback(() => {
    const rts = trials.map((t) => t.rt);
    const itv = computeITV(rts);
    const meanRT = rts.length > 0 ? rts.reduce((a, b) => a + b, 0) / rts.length : 2000;
    const baseline = computeEarlyBaselineRT(trials, 5) || meanRT;
    const decay = detectEngagementDecay(trials, baseline);
    const ddm = estimateDDM(
      trials.map((t) => ({ correct: t.correct, rtNorm: t.rtNorm, rt: t.rt })),
      itv
    );
    const exgauss = estimateExGaussian(rts);

    onComplete({
      theta: irt.theta,
      thetaSE: irt.se,
      thetaCI: irt.ci,
      itv,
      ddm,
      engagementFatigued: decay.fatigued,
      trials,
      extras: { highestPatternType: highestType, exgauss },
    });
  }, [trials, irt.theta, irt.se, irt.ci, highestType, onComplete]);

  const handleSelect = useCallback(
    (option, idx) => {
      if (selected !== null || !currentItem) return;
      setSelected(idx);

      const rt = performance.now() - startTimeRef.current;
      const rtNorm = normalizeRT(rt, ageBand);
      const correct = option.isCorrect;

      if (correct && currentItem.type > highestType) {
        setHighestType(currentItem.type);
      }

      const provisionalTrials = [
        ...trials,
        {
          trialNum,
          correct,
          rt,
          rtNorm,
          difficulty: currentItem.difficulty,
          itemType: currentItem.type,
          chosenIndex: idx,
          module: 'VS',
        },
      ];
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

      if (shouldStop(newIrt, nextTrial, MIN_TRIALS, MAX_TRIALS) || !selectBridgeItem(newIrt.b, usedIds)) {
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
              highestPatternType:
                correct && currentItem.type > highestType
                  ? currentItem.type
                  : highestType,
              exgauss,
            },
          });
        }, 800);
        return;
      }

      setTrialNum(nextTrial);
      timerRef.current = setTimeout(() => {
        loadItem();
      }, 800);
    },
    [selected, currentItem, irt, trialNum, trials, ageBand, highestType, usedIds, onComplete, loadItem]
  );

  const sequenceDisplay = useMemo(() => {
    if (!currentItem) return [];
    return currentItem.sequence.map((tile, i) => ({
      tile,
      isGap: tile === null,
      index: i,
    }));
  }, [currentItem]);

  if (!currentItem) {
    return (
      <div className={`game-area ${styles.loading}`}>
        <span className={styles.loadingText}>Loading...</span>
      </div>
    );
  }

  return (
    <div className={`game-area ${styles.scene}`}>
      <BridgeBackground />

      <div className="instruction">
        Find the missing stone!
      </div>

      <div className={styles.patternRow}>
        {sequenceDisplay.map(({ tile, isGap, index }) =>
          isGap ? (
            <div key={index} className={styles.gapSlot}>
              <span className={styles.gapLabel}>?</span>
            </div>
          ) : (
            <div key={index}>{renderTileShape(tile)}</div>
          )
        )}
      </div>

      <div className={styles.optionsGrid}>
        {options.map((option, idx) => {
          const isSelected = selected === idx;
          const showResult = selected !== null;
          let extraClass = '';
          if (showResult && isSelected) {
            extraClass = option.isCorrect ? styles.optionCorrect : styles.optionIncorrect;
          }

          return (
            <button
              key={idx}
              className={`${styles.optionBtn} ${isSelected ? styles.optionSelected : ''} ${extraClass}`}
              onClick={() => handleSelect(option, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(option, idx);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Option ${idx + 1}`}
              disabled={selected !== null}
            >
              {renderTileShape(option, 28)}
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
