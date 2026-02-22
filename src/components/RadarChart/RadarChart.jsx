import React, { useMemo } from 'react';

const LABELS = ['Remembering', 'Speed', 'Focus', 'Puzzles', 'Feelings'];
const AXES = 5;
const CENTER = 150;
const MAX_RADIUS = 110;
const ANGLE_OFFSET = -Math.PI / 2;

function polarToCartesian(angle, radius) {
  return {
    x: CENTER + radius * Math.cos(angle),
    y: CENTER + radius * Math.sin(angle),
  };
}

function makePolygonPoints(values, maxVal = 100) {
  return values
    .map((v, i) => {
      const angle = ANGLE_OFFSET + (2 * Math.PI * i) / AXES;
      const r = (v / maxVal) * MAX_RADIUS;
      const { x, y } = polarToCartesian(angle, r);
      return `${x},${y}`;
    })
    .join(' ');
}

/**
 * Pentagon radar chart using pure SVG.
 * @param {number[]} scores - Array of 5 scores (0-100)
 * @param {number[]} [reference] - Optional reference polygon (age-band average)
 */
const RadarChart = React.memo(function RadarChart({ scores = [], reference = null }) {
  const gridLevels = [20, 40, 60, 80, 100];

  const gridPolygons = useMemo(
    () =>
      gridLevels.map((level) =>
        makePolygonPoints(Array(AXES).fill(level))
      ),
    []
  );

  const scorePoints = useMemo(
    () => (scores.length === AXES ? makePolygonPoints(scores) : ''),
    [scores]
  );

  const refPoints = useMemo(
    () =>
      reference && reference.length === AXES
        ? makePolygonPoints(reference)
        : '',
    [reference]
  );

  const axisLines = useMemo(
    () =>
      Array.from({ length: AXES }, (_, i) => {
        const angle = ANGLE_OFFSET + (2 * Math.PI * i) / AXES;
        const end = polarToCartesian(angle, MAX_RADIUS);
        return { x1: CENTER, y1: CENTER, x2: end.x, y2: end.y };
      }),
    []
  );

  const labelPositions = useMemo(
    () =>
      LABELS.map((label, i) => {
        const angle = ANGLE_OFFSET + (2 * Math.PI * i) / AXES;
        const { x, y } = polarToCartesian(angle, MAX_RADIUS + 28);
        return { label, x, y };
      }),
    []
  );

  return (
    <svg
      viewBox="0 0 300 300"
      width="100%"
      style={{ maxWidth: 360 }}
      role="img"
      aria-label={`Radar chart showing 5 pillar scores: ${scores.map((s, i) => `${LABELS[i]} ${s}`).join(', ')}`}
    >
      {/* Grid */}
      {gridPolygons.map((points, i) => (
        <polygon
          key={i}
          points={points}
          fill="none"
          stroke="var(--soft, #B8D4C8)"
          strokeWidth="0.75"
          opacity={0.6}
        />
      ))}

      {/* Axis lines */}
      {axisLines.map((line, i) => (
        <line
          key={i}
          {...line}
          stroke="var(--soft, #B8D4C8)"
          strokeWidth="0.75"
          opacity={0.6}
        />
      ))}

      {/* Reference polygon */}
      {refPoints && (
        <polygon
          points={refPoints}
          fill="var(--soft, #B8D4C8)"
          fillOpacity={0.2}
          stroke="var(--soft, #B8D4C8)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Score polygon */}
      {scorePoints && (
        <polygon
          points={scorePoints}
          fill="var(--primary, #4A7C6F)"
          fillOpacity={0.3}
          stroke="var(--primary, #4A7C6F)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Score dots */}
      {scores.length === AXES &&
        scores.map((v, i) => {
          const angle = ANGLE_OFFSET + (2 * Math.PI * i) / AXES;
          const r = (v / 100) * MAX_RADIUS;
          const { x, y } = polarToCartesian(angle, r);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="var(--primary, #4A7C6F)"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

      {/* Labels */}
      {labelPositions.map(({ label, x, y }, i) => (
        <text
          key={i}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fontFamily="var(--font-body, 'DM Sans', sans-serif)"
          fill="var(--text-light, #6B7F78)"
          fontWeight="500"
        >
          {label}
        </text>
      ))}
    </svg>
  );
});

export default RadarChart;
