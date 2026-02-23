import React, { useState, useEffect, useRef, useCallback } from 'react';

const TUTORIALS = {
  BerryBasket: {
    duration: 6000,
    steps: [
      { at: 0, text: 'Watch the berries light up!' },
      { at: 2000, text: '' },
      { at: 3500, text: 'Then tap them in the same order!' },
    ],
    renderDemo: (step, ghostPos) => (
      <svg viewBox="0 0 300 200" width="100%" style={{ maxWidth: 320 }}>
        <rect width="300" height="200" rx="16" fill="#D4E8DF" />
        {/* Berries in a row */}
        {[{ x: 80, c: '#E25B45' }, { x: 150, c: '#4A82C8' }, { x: 220, c: '#E8C84A' }].map((b, i) => (
          <g key={i}>
            <ellipse cx={b.x} cy={55} rx={16} ry={18} fill={step >= 1 && ghostPos === i ? b.c : '#D5D5D0'} opacity={step >= 1 && ghostPos === i ? 1 : 0.5}>
              {step >= 1 && ghostPos === i && (
                <animate attributeName="opacity" values="0.5;1;0.5" dur="0.5s" fill="freeze" />
              )}
            </ellipse>
            <path d={`M${b.x} ${40} Q${b.x - 2} ${36}, ${b.x} ${32}`} stroke="#5B8C5A" strokeWidth="2" fill="none" />
          </g>
        ))}
        {/* Lily pads */}
        {[{ x: 80, c: '#E25B45' }, { x: 150, c: '#4A82C8' }, { x: 220, c: '#E8C84A' }].map((b, i) => (
          <g key={`pad-${i}`}>
            <ellipse cx={b.x} cy={145} rx={24} ry={14} fill="#7EC87E" opacity="0.7" />
            <circle cx={b.x} cy={140} r={12} fill={b.c} opacity="0.8" />
          </g>
        ))}
        {/* Ghost hand */}
        {step >= 2 && ghostPos !== null && (
          <g style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <circle cx={80 + ghostPos * 70} cy={145} r={16} fill="white" opacity="0.4" />
            <circle cx={80 + ghostPos * 70} cy={145} r={10} fill="white" opacity="0.3" />
          </g>
        )}
        {/* Star feedback */}
        {step >= 3 && (
          <text x="150" y="110" textAnchor="middle" fontSize="24" style={{ animation: 'feedbackPop 0.5s ease-out' }}>⭐</text>
        )}
      </svg>
    ),
  },

  FallingLeaves: {
    duration: 6000,
    steps: [
      { at: 0, text: 'A leaf falls with a ⭐ — tap it!' },
      { at: 3000, text: 'No star? Let it pass!' },
    ],
    renderDemo: (step) => (
      <svg viewBox="0 0 300 200" width="100%" style={{ maxWidth: 320 }}>
        <rect width="300" height="200" rx="16" fill="#D6E8D0" />
        {/* Canopy hints */}
        <ellipse cx="100" cy="10" rx="80" ry="25" fill="#5B8C5A" opacity="0.3" />
        <ellipse cx="220" cy="5" rx="60" ry="20" fill="#4A7C4A" opacity="0.25" />
        {/* Star leaf */}
        <g style={{ animation: step === 0 ? 'leafFall 3s linear forwards' : 'none' }}>
          <path d="M100 30 C90 34, 82 44, 84 52 C86 60, 94 66, 100 66 C106 66, 114 60, 116 52 C118 44, 110 34, 100 30Z" fill="#E87C3F" />
          <text x="100" y="52" textAnchor="middle" fontSize="12">⭐</text>
        </g>
        {/* Ghost hand tap */}
        {step >= 0 && (
          <g style={{ animation: 'fadeIn 0.5s ease-out 1.5s both' }}>
            <circle cx="100" cy="90" r="16" fill="white" opacity="0.4" />
            <circle cx="100" cy="90" r="10" fill="white" opacity="0.3" />
          </g>
        )}
        {/* Regular leaf (no star) */}
        {step >= 1 && (
          <g style={{ animation: 'leafFall 3s linear forwards' }}>
            <path d="M200 30 C190 34, 182 44, 184 52 C186 60, 194 66, 200 66 C206 66, 214 60, 216 52 C218 44, 210 34, 200 30Z" fill="#D45B3A" />
          </g>
        )}
      </svg>
    ),
  },

  SleepingFox: {
    duration: 7000,
    steps: [
      { at: 0, text: 'Fox eyes close — tap the drum!' },
      { at: 3500, text: 'Eyes open? Freeze! 🤫' },
    ],
    renderDemo: (step) => (
      <svg viewBox="0 0 300 200" width="100%" style={{ maxWidth: 320 }}>
        <rect width="300" height="200" rx="16" fill="#1a2438" />
        {/* Stars */}
        {[{ x: 40, y: 20 }, { x: 260, y: 30 }, { x: 150, y: 15 }].map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="1.5" fill="white" opacity="0.5" />
        ))}
        {/* Fox face */}
        <g transform="translate(100, 25)">
          <polygon points="20,30 30,8 40,30" fill="#E87C3F" />
          <polygon points="60,30 70,8 80,30" fill="#E87C3F" />
          <ellipse cx="50" cy="50" rx="30" ry="24" fill="#E87C3F" />
          <ellipse cx="50" cy="56" rx="18" ry="14" fill="#FFE8D4" />
          {step === 0 ? (
            <>
              <path d="M37 44 Q42 48, 47 44" stroke="#4A3728" strokeWidth="2" fill="none" />
              <path d="M53 44 Q58 48, 63 44" stroke="#4A3728" strokeWidth="2" fill="none" />
            </>
          ) : (
            <>
              <circle cx="40" cy="44" r="4" fill="#4A3728" />
              <circle cx="60" cy="44" r="4" fill="#4A3728" />
              <circle cx="41" cy="42.5" r="1.5" fill="white" />
              <circle cx="61" cy="42.5" r="1.5" fill="white" />
            </>
          )}
          <ellipse cx="50" cy="55" rx="3.5" ry="2.5" fill="#2C2C2C" />
        </g>
        {/* Drum */}
        <g transform="translate(110, 130)">
          <ellipse cx="40" cy="35" rx="28" ry="10" fill="#6B3410" />
          <rect x="12" y="10" width="56" height="25" fill="#B8782F" />
          <ellipse cx="40" cy="10" rx="28" ry="10" fill="#D4A050" />
        </g>
        {/* Ghost hand */}
        {step === 0 && (
          <g style={{ animation: 'fadeIn 0.5s ease-out 1.5s both' }}>
            <circle cx="150" cy="150" r="16" fill="white" opacity="0.35" />
            <circle cx="150" cy="150" r="10" fill="white" opacity="0.25" />
          </g>
        )}
        {/* Zzz */}
        {step === 0 && (
          <text x="210" y="40" fill="white" opacity="0.4" fontSize="14" fontFamily="var(--font-game)">Z z z</text>
        )}
        {/* Checkmark */}
        {step === 0 && (
          <text x="150" y="115" textAnchor="middle" fontSize="20" fill="#4A7C6F" style={{ animation: 'feedbackPop 0.5s ease-out 2.5s both' }}>✓</text>
        )}
      </svg>
    ),
  },

  BridgeBuilder: {
    duration: 6000,
    steps: [
      { at: 0, text: 'Find the missing piece!' },
      { at: 3000, text: 'Tap the right one to fix the bridge!' },
    ],
    renderDemo: (step) => (
      <svg viewBox="0 0 300 200" width="100%" style={{ maxWidth: 320 }}>
        <rect width="300" height="200" rx="16" fill="#DDD5C4" />
        {/* Bridge */}
        <rect x="20" y="70" width="260" height="10" rx="3" fill="#8B7355" opacity="0.6" />
        {/* Pattern tiles */}
        {[
          { x: 50, shape: 'circle', color: '#E25B45' },
          { x: 110, shape: 'square', color: '#4A82C8' },
          { x: 170, shape: null, color: null },
          { x: 230, shape: 'square', color: '#4A82C8' },
        ].map((t, i) => (
          <g key={i} transform={`translate(${t.x - 18}, 30)`}>
            <rect width="36" height="36" rx="6" fill={t.shape ? '#E8E0D4' : 'transparent'} stroke={!t.shape ? 'var(--accent)' : 'none'} strokeWidth="2" strokeDasharray={!t.shape ? '4,3' : 'none'} />
            {t.shape === 'circle' && <circle cx="18" cy="18" r="10" fill={t.color} />}
            {t.shape === 'square' && <rect x="6" y="6" width="24" height="24" rx="3" fill={t.color} />}
            {!t.shape && <text x="18" y="24" textAnchor="middle" fill="var(--accent)" fontSize="16" fontWeight="bold">?</text>}
          </g>
        ))}
        {/* Options */}
        {[
          { x: 80, shape: 'circle', color: '#E25B45', correct: true },
          { x: 160, shape: 'triangle', color: '#8B5FB0', correct: false },
        ].map((o, i) => (
          <g key={`opt-${i}`} transform={`translate(${o.x - 18}, 120)`}>
            <rect width="36" height="36" rx="6" fill="white" stroke={step >= 1 && o.correct ? '#4A7C6F' : 'transparent'} strokeWidth="2" />
            {o.shape === 'circle' && <circle cx="18" cy="18" r="10" fill={o.color} />}
            {o.shape === 'triangle' && <polygon points="18,6 30,30 6,30" fill={o.color} />}
          </g>
        ))}
        {/* Ghost hand */}
        {step >= 1 && (
          <g style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <circle cx="80" cy="138" r="16" fill="white" opacity="0.4" />
            <circle cx="80" cy="138" r="10" fill="white" opacity="0.3" />
          </g>
        )}
      </svg>
    ),
  },

  FeelingForest: {
    duration: 6000,
    steps: [
      { at: 0, text: 'Look at the friend — how do they feel?' },
      { at: 3000, text: 'Tap the matching face!' },
    ],
    renderDemo: (step) => (
      <svg viewBox="0 0 300 200" width="100%" style={{ maxWidth: 320 }}>
        <rect width="300" height="200" rx="16" fill="#E4DDE8" />
        <rect x="0" y="140" width="300" height="60" rx="0" fill="#C8E0C8" opacity="0.3" />
        {/* Happy bear */}
        <g transform="translate(115, 20)">
          <circle cx="20" cy="10" r="10" fill="#D4A574" />
          <circle cx="50" cy="10" r="10" fill="#D4A574" />
          <ellipse cx="35" cy="35" rx="25" ry="22" fill="#D4A574" />
          <ellipse cx="35" cy="40" rx="15" ry="12" fill="#EDD5B3" />
          <path d="M26 40 Q35 48, 44 40" stroke="#4A3728" strokeWidth="2" fill="none" />
          <circle cx="27" cy="30" r="3" fill="#4A3728" />
          <circle cx="43" cy="30" r="3" fill="#4A3728" />
          <ellipse cx="35" cy="37" rx="3" ry="2" fill="#8B6B4E" />
        </g>
        {/* Emotion options */}
        {[
          { x: 60, emotion: 'happy', color: '#E8C84A', correct: true },
          { x: 150, emotion: 'sad', color: '#4A82C8', correct: false },
          { x: 240, emotion: 'angry', color: '#E25B45', correct: false },
        ].map((e, i) => (
          <g key={i} transform={`translate(${e.x - 16}, 120)`}>
            <rect x="-4" y="-4" width="40" height="40" rx="10" fill="white" stroke={step >= 1 && e.correct ? '#4A7C6F' : 'transparent'} strokeWidth="2" />
            <circle cx="16" cy="16" r="14" fill={e.color} />
            {e.emotion === 'happy' && <path d="M8 18 Q16 26, 24 18" stroke="#4A3728" strokeWidth="2" fill="none" />}
            {e.emotion === 'sad' && <path d="M8 22 Q16 16, 24 22" stroke="#4A3728" strokeWidth="2" fill="none" />}
            {e.emotion === 'angry' && <line x1="8" y1="20" x2="24" y2="20" stroke="#4A3728" strokeWidth="2" />}
          </g>
        ))}
        {/* Ghost hand */}
        {step >= 1 && (
          <g style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <circle cx="60" cy="136" r="16" fill="white" opacity="0.4" />
            <circle cx="60" cy="136" r="10" fill="white" opacity="0.3" />
          </g>
        )}
      </svg>
    ),
  },
};

const MODULE_NAMES = ['BerryBasket', 'FallingLeaves', 'SleepingFox', 'BridgeBuilder', 'FeelingForest'];

const Tutorial = React.memo(function Tutorial({ moduleIndex, onComplete }) {
  const moduleName = MODULE_NAMES[moduleIndex];
  const config = TUTORIALS[moduleName];
  const [currentStep, setCurrentStep] = useState(0);
  const [ghostPos, setGhostPos] = useState(null);
  const [finished, setFinished] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!config) {
      onComplete();
      return;
    }

    const { steps, duration } = config;

    steps.forEach((step, i) => {
      const t = setTimeout(() => {
        setCurrentStep(i);
      }, step.at);
      timersRef.current.push(t);
    });

    if (moduleName === 'BerryBasket') {
      [0, 1, 2].forEach((pos, i) => {
        const showTime = 500 + i * 700;
        timersRef.current.push(setTimeout(() => setGhostPos(pos), showTime));
        timersRef.current.push(setTimeout(() => setGhostPos(null), showTime + 500));
      });

      timersRef.current.push(setTimeout(() => setCurrentStep(2), 3500));
      [0, 1, 2].forEach((pos, i) => {
        const tapTime = 3800 + i * 600;
        timersRef.current.push(setTimeout(() => setGhostPos(pos), tapTime));
        timersRef.current.push(setTimeout(() => setGhostPos(null), tapTime + 400));
      });
      timersRef.current.push(setTimeout(() => setCurrentStep(3), 5600));
    }

    const finishTimer = setTimeout(() => {
      setFinished(true);
    }, duration);
    timersRef.current.push(finishTimer);
  }, [config, moduleName, onComplete]);

  const handleSkip = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    onComplete();
  }, [onComplete]);

  if (!config) return null;

  const activeStep = config.steps[Math.min(currentStep, config.steps.length - 1)];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(4px)',
        animation: 'fadeIn 0.3s ease-out',
        gap: 16,
        padding: 24,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 20,
          padding: 24,
          maxWidth: 380,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          animation: 'fadeInUp 0.4s ease-out',
        }}
      >
        <div style={{ width: '100%', borderRadius: 12, overflow: 'hidden' }}>
          {config.renderDemo(currentStep, ghostPos)}
        </div>

        {activeStep?.text && (
          <p
            style={{
              fontFamily: "var(--font-game, 'Nunito')",
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              color: '#2C3E35',
              textAlign: 'center',
              margin: 0,
              fontWeight: 600,
              minHeight: '1.4em',
            }}
          >
            {activeStep.text}
          </p>
        )}

        {finished && (
          <button
            className="btn-game"
            onClick={handleSkip}
            style={{ animation: 'fadeInUp 0.3s ease-out', marginTop: 4 }}
          >
            Let's go! 🎉
          </button>
        )}

        {!finished && (
          <button
            onClick={handleSkip}
            style={{
              fontFamily: "var(--font-game, 'Nunito')",
              fontSize: '0.85rem',
              color: '#6B7F78',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 12px',
              opacity: 0.7,
            }}
          >
            Skip →
          </button>
        )}
      </div>
    </div>
  );
});

export default Tutorial;
