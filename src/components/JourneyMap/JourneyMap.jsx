import React from 'react';

const MODULE_ICONS = [
  { label: 'Berry Basket', emoji: '🫐', color: '#E25B45' },
  { label: 'Falling Leaves', emoji: '🍂', color: '#E87C3F' },
  { label: 'Sleeping Fox', emoji: '🦊', color: '#D4783C' },
  { label: 'Bridge Builder', emoji: '🌉', color: '#8B7355' },
  { label: 'Feeling Forest', emoji: '💛', color: '#E8C84A' },
];

const STOP_POSITIONS = [
  { x: 70, y: 310 },
  { x: 180, y: 240 },
  { x: 300, y: 200 },
  { x: 420, y: 150 },
  { x: 540, y: 90 },
];

/**
 * A winding forest path with 5 stops, each representing a game module.
 * Noor walks along the path as the child progresses.
 */
const JourneyMap = React.memo(function JourneyMap({ current = 0, total = 5, compact = false }) {
  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 0',
        }}
        role="progressbar"
        aria-valuenow={current + 1}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label={`Activity ${current + 1} of ${total}`}
      >
        {MODULE_ICONS.slice(0, total).map((mod, i) => {
          const isActive = i === current;
          const isComplete = i < current;
          return (
            <div
              key={i}
              style={{
                width: isActive ? 28 : 22,
                height: isActive ? 28 : 22,
                borderRadius: '50%',
                background: isComplete
                  ? 'var(--primary)'
                  : isActive
                  ? 'var(--accent)'
                  : '#E8E0D4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isActive ? '14px' : '11px',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: isActive ? '0 0 10px rgba(232,149,109,0.5)' : 'none',
                flexShrink: 0,
              }}
              title={mod.label}
            >
              {isComplete ? '✓' : mod.emoji}
            </div>
          );
        })}
      </div>
    );
  }

  const noorPos = STOP_POSITIONS[Math.min(current, total - 1)];

  return (
    <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '0 16px' }}>
      <svg viewBox="0 0 600 380" width="100%" role="img" aria-label={`Journey map: Activity ${current + 1} of ${total}`}>
        <defs>
          <linearGradient id="jmSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C8DEC8" />
            <stop offset="100%" stopColor="#E4DDE4" />
          </linearGradient>
        </defs>
        <rect width="600" height="380" rx="20" fill="url(#jmSky)" />

        {/* Ground */}
        <path d="M0 320 Q150 310, 300 325 Q450 340, 600 320 L600 380 L0 380Z" fill="#8BC48B" opacity="0.4" />

        {/* Distant hills */}
        <ellipse cx="150" cy="320" rx="200" ry="40" fill="#A8D5BA" opacity="0.3" />
        <ellipse cx="450" cy="310" rx="180" ry="35" fill="#98C5AA" opacity="0.25" />

        {/* Trees */}
        {[{ x: 30, h: 50 }, { x: 560, h: 60 }, { x: 520, h: 40 }].map((t, i) => (
          <g key={i} opacity="0.4">
            <rect x={t.x} y={320 - t.h} width={8} height={t.h} rx={3} fill="#8B7355" />
            <ellipse cx={t.x + 4} cy={320 - t.h - 15} rx={18} ry={22} fill="#5B8C5A" />
          </g>
        ))}

        {/* Winding path */}
        <path
          d="M30 340 Q70 320, 70 310 Q70 280, 180 240 Q220 225, 300 200 Q380 175, 420 150 Q460 130, 540 90 Q570 80, 590 60"
          stroke="#C4A882"
          strokeWidth="18"
          fill="none"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M30 340 Q70 320, 70 310 Q70 280, 180 240 Q220 225, 300 200 Q380 175, 420 150 Q460 130, 540 90 Q570 80, 590 60"
          stroke="#D4B892"
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Path stones */}
        {STOP_POSITIONS.map((pos, i) => {
          const dx = (i % 2 === 0 ? -3 : 3);
          return (
            <g key={`stone-${i}`} opacity="0.3">
              <ellipse cx={pos.x + dx - 10} cy={pos.y + 5} rx="3" ry="2" fill="#A8957A" />
              <ellipse cx={pos.x + dx + 8} cy={pos.y + 3} rx="2.5" ry="1.5" fill="#A8957A" />
            </g>
          );
        })}

        {/* Flowers along path */}
        {[{ x: 120, y: 270, c: '#E8A0C8' }, { x: 250, y: 218, c: '#E8C84A' }, { x: 370, y: 168, c: '#B8A0E8' }, { x: 480, y: 118, c: '#E8A0C8' }].map((f, i) => (
          <g key={`fl-${i}`} opacity="0.5">
            <line x1={f.x} y1={f.y} x2={f.x} y2={f.y + 10} stroke="#5B8C5A" strokeWidth="1.5" />
            <circle cx={f.x} cy={f.y - 2} r="4" fill={f.c} />
          </g>
        ))}

        {/* Module stops */}
        {STOP_POSITIONS.map((pos, i) => {
          const isActive = i === current;
          const isComplete = i < current;
          const isUpcoming = i > current;
          const mod = MODULE_ICONS[i];
          const r = isActive ? 22 : 18;

          return (
            <g key={i}>
              {/* Glow for active */}
              {isActive && (
                <circle cx={pos.x} cy={pos.y} r={r + 8} fill="var(--accent)" opacity="0.2">
                  <animate attributeName="r" values={`${r + 6};${r + 12};${r + 6}`} dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.2;0.1;0.2" dur="2s" repeatCount="indefinite" />
                </circle>
              )}

              {/* Stop circle */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={r}
                fill={isComplete ? 'var(--primary)' : isActive ? 'var(--accent)' : '#E8E0D4'}
                stroke={isComplete ? '#3d6b5f' : isActive ? '#d47e57' : '#D4CCB8'}
                strokeWidth="3"
                opacity={isUpcoming ? 0.5 : 1}
              />

              {/* Icon */}
              <text
                x={pos.x}
                y={pos.y + (isActive ? 6 : 5)}
                textAnchor="middle"
                fontSize={isActive ? 18 : 14}
                opacity={isUpcoming ? 0.4 : 1}
              >
                {isComplete ? '✓' : mod.emoji}
              </text>

              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + r + 16}
                textAnchor="middle"
                fontFamily="var(--font-game, 'Nunito')"
                fontSize="10"
                fill="#4A3728"
                opacity={isUpcoming ? 0.3 : 0.7}
                fontWeight={isActive ? 700 : 400}
              >
                {mod.label}
              </text>
            </g>
          );
        })}

        {/* Noor on the path */}
        <g
          transform={`translate(${noorPos.x - 15}, ${noorPos.y - 52})`}
          style={{ transition: 'transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
        >
          {/* Mini Noor */}
          <g>
            {/* Ears */}
            <circle cx="10" cy="6" r="5" fill="#C4956A" />
            <circle cx="10" cy="6" r="3" fill="#E8B89D" />
            <circle cx="22" cy="6" r="5" fill="#C4956A" />
            <circle cx="22" cy="6" r="3" fill="#E8B89D" />
            {/* Head */}
            <ellipse cx="16" cy="16" rx="12" ry="11" fill="#D4A574" />
            <ellipse cx="16" cy="19" rx="7" ry="5.5" fill="#EDD5B3" />
            {/* Eyes */}
            <circle cx="12" cy="14" r="2" fill="#4A3728" />
            <circle cx="20" cy="14" r="2" fill="#4A3728" />
            <circle cx="12.5" cy="13.2" r="0.8" fill="white" />
            <circle cx="20.5" cy="13.2" r="0.8" fill="white" />
            {/* Nose */}
            <ellipse cx="16" cy="18" rx="1.5" ry="1" fill="#8B6B4E" />
            {/* Mouth */}
            <path d="M13 20 Q16 23, 19 20" stroke="#8B6B4E" strokeWidth="1" fill="none" />
            {/* Blush */}
            <circle cx="9" cy="19" r="2.5" fill="#E8956D" opacity="0.3" />
            <circle cx="23" cy="19" r="2.5" fill="#E8956D" opacity="0.3" />
          </g>
          {/* Bounce */}
          <animateTransform
            attributeName="transform"
            type="translate"
            values={`${noorPos.x - 15},${noorPos.y - 52};${noorPos.x - 15},${noorPos.y - 55};${noorPos.x - 15},${noorPos.y - 52}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </g>

        {/* Destination flag */}
        <g transform="translate(565, 40)" opacity="0.6">
          <line x1="0" y1="0" x2="0" y2="25" stroke="#8B7355" strokeWidth="2" />
          <polygon points="0,0 18,5 0,10" fill="#E8956D" />
        </g>
      </svg>
    </div>
  );
});

export default JourneyMap;
