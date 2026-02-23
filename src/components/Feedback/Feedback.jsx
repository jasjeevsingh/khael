import React, { useState, useEffect, useRef } from 'react';
import Particles from '../Particles/Particles';

/**
 * Multi-layered feedback overlay for game modules.
 * Shows: particle burst + scaling icon + optional screen flash.
 */
const Feedback = React.memo(function Feedback({ correct, active, onComplete }) {
  const [showFlash, setShowFlash] = useState(false);
  const [showShake, setShowShake] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    if (correct) {
      setShowFlash(true);
      timerRef.current = setTimeout(() => setShowFlash(false), 300);
    } else {
      setShowShake(true);
      timerRef.current = setTimeout(() => setShowShake(false), 400);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, correct]);

  if (!active) return null;

  return (
    <>
      {/* Screen flash for correct answers */}
      {correct && showFlash && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(232, 200, 74, 0.12) 0%, transparent 70%)',
            zIndex: 18,
            pointerEvents: 'none',
            animation: 'fadeIn 0.1s ease-out',
          }}
        />
      )}

      {/* Particle burst for correct answers */}
      {correct && <Particles active={active} x="50%" y="45%" />}

      {/* Feedback icon */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 22,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: correct ? '3.5rem' : '2.8rem',
            animation: correct
              ? 'feedbackPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
              : 'gentleAppear 0.4s ease-out',
            filter: correct ? 'drop-shadow(0 4px 12px rgba(232, 200, 74, 0.4))' : 'none',
          }}
          aria-hidden="true"
        >
          {correct ? '⭐' : '💚'}
        </div>
      </div>

      {/* Gentle shake for incorrect (applied to parent via CSS class) */}
      {!correct && showShake && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            animation: 'gentleShake 0.4s ease-out',
          }}
        />
      )}
    </>
  );
});

export default Feedback;
