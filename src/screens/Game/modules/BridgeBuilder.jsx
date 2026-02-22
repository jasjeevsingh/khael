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
      up: 'M 20,35 L 20,10 L 12,18 M 20,10 L 28,18',
      down: 'M 20,5 L 20,30 L 12,22 M 20,30 L 28,22',
      left: 'M 35,20 L 10,20 L 18,12 M 10,20 L 18,28',
      right: 'M 5,20 L 30,20 L 22,12 M 30,20 L 22,28',
    };
    return (
      <svg width={40} height={40} viewBox="0 0 40 40">
        <rect x="2" y="2" width="36" height="36" rx="6" fill="#E8E0D4" />
        <path d={arrows[dir] ?? arrows.right} stroke="#4A3728" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg width={40} height={40} viewBox="0 0 40 40">
      <rect x="2" y="2" width="36" height="36" rx="6" fill="#E8E0D4" />
      {shape === 'circle' && <circle cx="20" cy="20" r={s / 2.2} fill={color} />}
      {shape === 'square' && (
        <rect x={20 - s / 2.4} y={20 - s / 2.4} width={s / 1.2} height={s / 1.2} rx="2" fill={color} />
      )}
      {shape === 'triangle' && (
        <polygon
          points={`20,${20 - s / 2.2} ${20 + s / 2.2},${20 + s / 2.5} ${20 - s / 2.2},${20 + s / 2.5}`}
          fill={color}
        />
      )}
      {shape === 'star' && (
        <polygon
          points="20,8 23,16 32,16 25,21 27,30 20,25 13,30 15,21 8,16 17,16"
          fill={color}
          transform={`scale(${s / 36})`}
          style={{ transformOrigin: '20px 20px' }}
        />
      )}
      {!shape && !dir && <circle cx="20" cy="20" r={s / 2.2} fill={color} />}
    </svg>
  );
}

export default function BridgeBuilder({ ageBand, onComplete }) {
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
      <div className="game-area" style={{ background: '#DDD5C4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: "var(--font-game)", color: 'var(--text-light)' }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="game-area" style={{ background: '#DDD5C4', position: 'relative' }}>
      {/* Bridge background */}
      <svg
        viewBox="0 0 800 600"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        <rect x="0" y="0" width="800" height="300" fill="#B8CCE0" opacity="0.3" />
        <rect x="0" y="300" width="800" height="300" fill="#A8BCA0" opacity="0.3" />
        {/* Bridge structure */}
        <rect x="50" y="240" width="700" height="30" rx="4" fill="#8B7355" />
        <rect x="50" y="270" width="700" height="10" fill="#6B5335" />
        {/* Supports */}
        <rect x="80" y="270" width="15" height="120" fill="#8B7355" />
        <rect x="705" y="270" width="15" height="120" fill="#8B7355" />
        <rect x="380" y="270" width="15" height="120" fill="#8B7355" />
        {/* Water */}
        <rect x="0" y="380" width="800" height="220" fill="#81C4E8" opacity="0.3" />
      </svg>

      {/* Instruction */}
      <div
        style={{
          position: 'absolute',
          top: 10,
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
        Find the missing stone!
      </div>

      {/* Pattern sequence on bridge */}
      <div
        style={{
          position: 'absolute',
          top: '18%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          zIndex: 5,
        }}
      >
        {sequenceDisplay.map(({ tile, isGap, index }) =>
          isGap ? (
            <div
              key={index}
              style={{
                width: 44,
                height: 44,
                border: '3px dashed var(--accent)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.5)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            >
              <span style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>?</span>
            </div>
          ) : (
            <div key={index}>{renderTileShape(tile)}</div>
          )
        )}
      </div>

      {/* Answer options (2x2 grid) */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          zIndex: 5,
        }}
      >
        {options.map((option, idx) => {
          const isSelected = selected === idx;
          const showResult = selected !== null;
          let borderColor = 'transparent';
          if (showResult && isSelected) {
            borderColor = option.isCorrect ? '#4A7C6F' : '#D4956A';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(option, idx)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleSelect(option, idx);
              }}
              role="button"
              tabIndex={0}
              aria-label={`Option ${idx + 1}`}
              disabled={selected !== null}
              style={{
                width: 64,
                height: 64,
                border: `3px solid ${borderColor}`,
                borderRadius: 12,
                background: 'white',
                cursor: selected !== null ? 'default' : 'pointer',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'border-color 0.2s, transform 0.15s',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                boxShadow: 'var(--shadow-sm)',
                minHeight: 44,
                minWidth: 44,
              }}
            >
              {renderTileShape(option, 28)}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {feedback !== null && (
        <div
          style={{
            position: 'absolute',
            top: '45%',
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
