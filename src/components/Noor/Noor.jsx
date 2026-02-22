import React from 'react';

/**
 * Noor the bear — SVG character component.
 * A warm, simple bear illustration used throughout the app.
 */
const Noor = React.memo(function Noor({
  size = 120,
  mood = 'happy',
  className = '',
  animate = false,
  showBubble = false,
  bubbleText = '',
}) {
  const eyeY = mood === 'sleeping' ? 0 : -2;
  const mouthCurve = mood === 'happy' ? 'M 38,58 Q 45,66 52,58' :
                     mood === 'thinking' ? 'M 38,60 L 52,60' :
                     'M 38,58 Q 45,66 52,58';

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        animation: animate ? 'softBounce 2s ease-in-out infinite' : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 90 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Noor the bear"
      >
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
        {mood === 'sleeping' ? (
          <>
            <path d="M 33,40 Q 36,43 39,40" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 51,40 Q 54,43 57,40" stroke="#4A3728" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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

        {/* Mouth */}
        <path d={mouthCurve} stroke="#8B6B4E" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Blush */}
        <circle cx="28" cy="48" r="5" fill="#E8956D" opacity="0.3" />
        <circle cx="62" cy="48" r="5" fill="#E8956D" opacity="0.3" />
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
