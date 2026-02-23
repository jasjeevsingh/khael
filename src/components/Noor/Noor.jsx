import React from 'react';

/**
 * Noor the bear — full-body SVG character component.
 * Moods: happy, celebrating, encouraging, thinking, sleeping, surprised
 */
const Noor = React.memo(function Noor({
  size = 120,
  mood = 'happy',
  className = '',
  animate = false,
  showBody = false,
  showBubble = false,
  bubbleText = '',
}) {
  const headOnly = !showBody;
  const viewBox = headOnly ? '0 0 90 90' : '0 0 90 140';
  const svgHeight = headOnly ? size : size * 1.55;

  const isCelebrating = mood === 'celebrating';
  const isEncouraging = mood === 'encouraging';
  const isThinking = mood === 'thinking';
  const isSleeping = mood === 'sleeping';
  const isSurprised = mood === 'surprised';

  const animClass = isCelebrating
    ? 'noorCelebrate'
    : animate
    ? 'noorIdle'
    : '';

  const eyeY = isSleeping ? 0 : -2;

  let mouthPath;
  if (isCelebrating || mood === 'happy') {
    mouthPath = 'M 36,58 Q 45,68 54,58';
  } else if (isThinking) {
    mouthPath = 'M 38,60 L 52,60';
  } else if (isSurprised) {
    mouthPath = null;
  } else if (isEncouraging) {
    mouthPath = 'M 38,58 Q 45,63 52,58';
  } else {
    mouthPath = 'M 38,58 Q 45,66 52,58';
  }

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        animation: animClass ? `${animClass} ${isCelebrating ? '0.6s ease-out' : '3s ease-in-out infinite'}` : undefined,
      }}
    >
      <svg
        width={size}
        height={svgHeight}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Noor the bear"
      >
        {/* Body (when shown) */}
        {showBody && (
          <g>
            {/* Body */}
            <ellipse cx="45" cy="105" rx="24" ry="28" fill="#D4A574" />
            <ellipse cx="45" cy="108" rx="16" ry="18" fill="#EDD5B3" />

            {/* Feet */}
            <ellipse cx="32" cy="130" rx="10" ry="6" fill="#C4956A" />
            <ellipse cx="58" cy="130" rx="10" ry="6" fill="#C4956A" />
            <ellipse cx="32" cy="130" rx="7" ry="4" fill="#D4A574" />
            <ellipse cx="58" cy="130" rx="7" ry="4" fill="#D4A574" />

            {/* Arms */}
            {isCelebrating ? (
              <>
                {/* Arms up! */}
                <ellipse cx="18" cy="82" rx="7" ry="14" fill="#D4A574" transform="rotate(-25, 18, 82)" />
                <ellipse cx="72" cy="82" rx="7" ry="14" fill="#D4A574" transform="rotate(25, 72, 82)" />
                <ellipse cx="14" cy="72" rx="5" ry="5" fill="#C4956A" />
                <ellipse cx="76" cy="72" rx="5" ry="5" fill="#C4956A" />
              </>
            ) : isEncouraging ? (
              <>
                {/* One arm waving */}
                <ellipse cx="20" cy="100" rx="7" ry="12" fill="#D4A574" transform="rotate(-10, 20, 100)" />
                <ellipse cx="72" cy="85" rx="7" ry="13" fill="#D4A574" transform="rotate(20, 72, 85)">
                  <animateTransform attributeName="transform" type="rotate" values="20,72,85;30,72,85;20,72,85" dur="0.8s" repeatCount="3" />
                </ellipse>
                <ellipse cx="76" cy="75" rx="5" ry="5" fill="#C4956A">
                  <animate attributeName="cx" values="76;78;76" dur="0.8s" repeatCount="3" />
                </ellipse>
              </>
            ) : isThinking ? (
              <>
                {/* One paw on chin */}
                <ellipse cx="20" cy="100" rx="7" ry="12" fill="#D4A574" transform="rotate(-10, 20, 100)" />
                <ellipse cx="64" cy="90" rx="7" ry="13" fill="#D4A574" transform="rotate(40, 64, 90)" />
                <ellipse cx="56" cy="62" rx="5" ry="5" fill="#C4956A" />
              </>
            ) : (
              <>
                {/* Arms at sides */}
                <ellipse cx="20" cy="100" rx="7" ry="12" fill="#D4A574" transform="rotate(-10, 20, 100)" />
                <ellipse cx="70" cy="100" rx="7" ry="12" fill="#D4A574" transform="rotate(10, 70, 100)" />
              </>
            )}
          </g>
        )}

        {/* Ears */}
        <circle cx="24" cy="20" r="12" fill="#C4956A" />
        <circle cx="24" cy="20" r="7" fill="#E8B89D" />
        <circle cx="66" cy="20" r="12" fill="#C4956A" />
        <circle cx="66" cy="20" r="7" fill="#E8B89D" />

        {/* Head */}
        <ellipse cx="45" cy="45" rx="30" ry="28" fill="#D4A574" />

        {/* Face patch */}
        <ellipse cx="45" cy="50" rx="18" ry="14" fill="#EDD5B3" />

        {/* Eyes */}
        {isSleeping ? (
          <>
            <path d="M 33,40 Q 36,43 39,40" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 51,40 Q 54,43 57,40" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : isCelebrating ? (
          <>
            <path d="M 33,38 Q 36,34 39,38" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 51,38 Q 54,34 57,38" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : isSurprised ? (
          <>
            <circle cx="36" cy={38} r="5" fill="#4A3728" />
            <circle cx="54" cy={38} r="5" fill="#4A3728" />
            <circle cx="37.5" cy="36.5" r="2" fill="white" />
            <circle cx="55.5" cy="36.5" r="2" fill="white" />
          </>
        ) : (
          <>
            <circle cx="36" cy={40 + eyeY} r="4" fill="#4A3728" />
            <circle cx="54" cy={40 + eyeY} r="4" fill="#4A3728" />
            <circle cx="37.5" cy={38.5 + eyeY} r="1.5" fill="white" />
            <circle cx="55.5" cy={38.5 + eyeY} r="1.5" fill="white" />
          </>
        )}

        {/* Nose */}
        <ellipse cx="45" cy="48" rx="4" ry="3" fill="#8B6B4E" />
        <circle cx="43.5" cy="47" r="1" fill="white" opacity="0.3" />

        {/* Mouth */}
        {isSurprised ? (
          <ellipse cx="45" cy="58" rx="4" ry="5" fill="#4A3728" opacity="0.7" />
        ) : mouthPath ? (
          <path d={mouthPath} stroke="#8B6B4E" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : null}

        {/* Blush */}
        <circle cx="28" cy="48" r="5" fill="#E8956D" opacity={isCelebrating ? 0.45 : 0.3} />
        <circle cx="62" cy="48" r="5" fill="#E8956D" opacity={isCelebrating ? 0.45 : 0.3} />

        {/* Sparkles for celebrating */}
        {isCelebrating && (
          <g>
            <text x="10" y="18" fontSize="10" opacity="0.7">✨</text>
            <text x="70" y="15" fontSize="8" opacity="0.6">⭐</text>
          </g>
        )}
      </svg>

      {showBubble && bubbleText && (
        <div
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '12px 20px',
            maxWidth: 280,
            fontFamily: "var(--font-game, 'Nunito', sans-serif)",
            fontSize: '1rem',
            color: '#2C3E35',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(44,62,53,0.1)',
            position: 'relative',
            lineHeight: 1.4,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '8px solid white',
            }}
          />
          {bubbleText}
        </div>
      )}
    </div>
  );
});

export default Noor;
