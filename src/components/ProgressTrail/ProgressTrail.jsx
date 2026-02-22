import React from 'react';

const MODULE_NAMES = [
  'Berry Basket',
  'Falling Leaves',
  'Sleeping Fox',
  'Bridge Builder',
  'Feeling Forest',
];

/**
 * Progress trail — 5 dots showing module progression.
 */
const ProgressTrail = React.memo(function ProgressTrail({ current = 0, total = 5 }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 0',
      }}
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Module ${current + 1} of ${total}: ${MODULE_NAMES[current] ?? ''}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isComplete = i < current;
        return (
          <div
            key={i}
            style={{
              width: isActive ? 14 : 10,
              height: isActive ? 14 : 10,
              borderRadius: '50%',
              background: isComplete
                ? 'var(--primary, #4A7C6F)'
                : isActive
                ? 'var(--accent, #E8956D)'
                : 'var(--soft, #B8D4C8)',
              transition: 'all 0.3s ease',
              boxShadow: isActive ? '0 0 8px rgba(232,149,109,0.5)' : 'none',
              flexShrink: 0,
            }}
            title={MODULE_NAMES[i]}
          />
        );
      })}
    </div>
  );
});

export default ProgressTrail;
