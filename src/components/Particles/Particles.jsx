import React, { useState, useEffect, useRef } from 'react';

const PARTICLE_SHAPES = ['⭐', '✨', '💛', '🌟'];
const PARTICLE_COUNT = 10;

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Lightweight SVG/CSS particle burst that spawns from a point
 * and fades out. Pure CSS animation, auto-removes after completion.
 */
const Particles = React.memo(function Particles({ active, x = '50%', y = '50%' }) {
  const [particles, setParticles] = useState([]);
  const idCounter = useRef(0);

  useEffect(() => {
    if (!active) return;

    const newParticles = Array.from({ length: PARTICLE_COUNT }, () => {
      const angle = randomBetween(0, 360);
      const distance = randomBetween(40, 120);
      const size = randomBetween(12, 22);
      const duration = randomBetween(0.5, 0.9);
      const delay = randomBetween(0, 0.15);
      const shape = PARTICLE_SHAPES[Math.floor(Math.random() * PARTICLE_SHAPES.length)];

      return {
        id: idCounter.current++,
        angle,
        distance,
        size,
        duration,
        delay,
        shape,
        tx: Math.cos((angle * Math.PI) / 180) * distance,
        ty: Math.sin((angle * Math.PI) / 180) * distance,
      };
    });

    setParticles(newParticles);

    const timer = setTimeout(() => {
      setParticles([]);
    }, 1200);

    return () => clearTimeout(timer);
  }, [active]);

  if (particles.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 0,
        height: 0,
        zIndex: 25,
        pointerEvents: 'none',
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            fontSize: `${p.size}px`,
            animation: `particleBurst ${p.duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}s forwards`,
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            opacity: 0,
          }}
        >
          {p.shape}
        </div>
      ))}
    </div>
  );
});

export default Particles;
