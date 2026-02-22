/**
 * Pre-generated item bank for the Bridge Builder module (Raven's analog).
 * 30 items across 7 pattern types, ordered by difficulty.
 * Each item: { id, type, difficulty, sequence, answer, distractors, description }
 *
 * Shape codes: 'circle', 'square', 'triangle', 'star'
 * Color codes: 'red', 'blue', 'yellow', 'purple', 'green', 'orange'
 * Size codes: 'big', 'small'
 * Direction codes: 'up', 'down', 'left', 'right'
 */

const BRIDGE_ITEMS = [
  // Type 1: Color sequence (difficulty -2.5 to -1.5)
  {
    id: 1, type: 1, difficulty: -2.5,
    sequence: [
      { color: 'red' }, { color: 'blue' }, { color: 'red' }, null, { color: 'red' },
    ],
    answer: { color: 'blue' },
    distractors: [{ color: 'red' }, { color: 'yellow' }, { color: 'purple' }],
  },
  {
    id: 2, type: 1, difficulty: -2.2,
    sequence: [
      { color: 'yellow' }, { color: 'purple' }, { color: 'yellow' }, null,
    ],
    answer: { color: 'purple' },
    distractors: [{ color: 'yellow' }, { color: 'red' }, { color: 'blue' }],
  },
  {
    id: 3, type: 1, difficulty: -1.8,
    sequence: [
      { color: 'red' }, { color: 'blue' }, { color: 'yellow' }, { color: 'red' }, null,
    ],
    answer: { color: 'blue' },
    distractors: [{ color: 'red' }, { color: 'yellow' }, { color: 'purple' }],
  },
  {
    id: 4, type: 1, difficulty: -1.5,
    sequence: [
      { color: 'green' }, { color: 'orange' }, { color: 'green' }, { color: 'orange' }, null,
    ],
    answer: { color: 'green' },
    distractors: [{ color: 'orange' }, { color: 'blue' }, { color: 'red' }],
  },

  // Type 2: Shape sequence (difficulty -1.5 to -0.8)
  {
    id: 5, type: 2, difficulty: -1.4,
    sequence: [
      { shape: 'circle' }, { shape: 'square' }, { shape: 'circle' }, null,
    ],
    answer: { shape: 'square' },
    distractors: [{ shape: 'circle' }, { shape: 'triangle' }, { shape: 'star' }],
  },
  {
    id: 6, type: 2, difficulty: -1.2,
    sequence: [
      { shape: 'triangle' }, { shape: 'star' }, { shape: 'triangle' }, { shape: 'star' }, null,
    ],
    answer: { shape: 'triangle' },
    distractors: [{ shape: 'star' }, { shape: 'circle' }, { shape: 'square' }],
  },
  {
    id: 7, type: 2, difficulty: -1.0,
    sequence: [
      { shape: 'circle' }, { shape: 'square' }, { shape: 'triangle' }, { shape: 'circle' }, null,
    ],
    answer: { shape: 'square' },
    distractors: [{ shape: 'circle' }, { shape: 'triangle' }, { shape: 'star' }],
  },
  {
    id: 8, type: 2, difficulty: -0.8,
    sequence: [
      { shape: 'star' }, { shape: 'triangle' }, { shape: 'circle' }, { shape: 'star' }, { shape: 'triangle' }, null,
    ],
    answer: { shape: 'circle' },
    distractors: [{ shape: 'star' }, { shape: 'triangle' }, { shape: 'square' }],
  },

  // Type 3: Size sequence (difficulty -0.8 to -0.2)
  {
    id: 9, type: 3, difficulty: -0.7,
    sequence: [
      { size: 'big' }, { size: 'small' }, { size: 'big' }, null,
    ],
    answer: { size: 'small' },
    distractors: [{ size: 'big' }, { size: 'big' }, { size: 'big' }],
  },
  {
    id: 10, type: 3, difficulty: -0.5,
    sequence: [
      { size: 'big' }, { size: 'big' }, { size: 'small' }, { size: 'big' }, { size: 'big' }, null,
    ],
    answer: { size: 'small' },
    distractors: [{ size: 'big' }, { size: 'big' }, { size: 'big' }],
  },
  {
    id: 11, type: 3, difficulty: -0.3,
    sequence: [
      { size: 'small' }, { size: 'big' }, { size: 'small' }, { size: 'big' }, null,
    ],
    answer: { size: 'small' },
    distractors: [{ size: 'big' }, { size: 'big' }, { size: 'big' }],
  },

  // Type 4: Color+shape combined (difficulty -0.2 to 0.5)
  {
    id: 12, type: 4, difficulty: -0.2,
    sequence: [
      { color: 'red', shape: 'circle' }, { color: 'blue', shape: 'square' },
      { color: 'red', shape: 'circle' }, null,
    ],
    answer: { color: 'blue', shape: 'square' },
    distractors: [
      { color: 'red', shape: 'square' },
      { color: 'blue', shape: 'circle' },
      { color: 'yellow', shape: 'triangle' },
    ],
  },
  {
    id: 13, type: 4, difficulty: 0.0,
    sequence: [
      { color: 'yellow', shape: 'triangle' }, { color: 'purple', shape: 'star' },
      { color: 'yellow', shape: 'triangle' }, { color: 'purple', shape: 'star' }, null,
    ],
    answer: { color: 'yellow', shape: 'triangle' },
    distractors: [
      { color: 'purple', shape: 'triangle' },
      { color: 'yellow', shape: 'star' },
      { color: 'red', shape: 'circle' },
    ],
  },
  {
    id: 14, type: 4, difficulty: 0.2,
    sequence: [
      { color: 'red', shape: 'circle' }, { color: 'blue', shape: 'triangle' },
      { color: 'yellow', shape: 'square' }, { color: 'red', shape: 'circle' }, null,
    ],
    answer: { color: 'blue', shape: 'triangle' },
    distractors: [
      { color: 'red', shape: 'triangle' },
      { color: 'blue', shape: 'square' },
      { color: 'yellow', shape: 'circle' },
    ],
  },
  {
    id: 15, type: 4, difficulty: 0.4,
    sequence: [
      { color: 'green', shape: 'star' }, { color: 'orange', shape: 'circle' },
      { color: 'green', shape: 'star' }, null,
    ],
    answer: { color: 'orange', shape: 'circle' },
    distractors: [
      { color: 'green', shape: 'circle' },
      { color: 'orange', shape: 'star' },
      { color: 'blue', shape: 'square' },
    ],
  },

  // Type 5: Rotation/orientation (difficulty 0.5 to 1.2)
  {
    id: 16, type: 5, difficulty: 0.5,
    sequence: [
      { direction: 'right' }, { direction: 'down' }, { direction: 'right' }, null,
    ],
    answer: { direction: 'down' },
    distractors: [{ direction: 'right' }, { direction: 'up' }, { direction: 'left' }],
  },
  {
    id: 17, type: 5, difficulty: 0.7,
    sequence: [
      { direction: 'up' }, { direction: 'right' }, { direction: 'down' }, { direction: 'left' }, null,
    ],
    answer: { direction: 'up' },
    distractors: [{ direction: 'down' }, { direction: 'right' }, { direction: 'left' }],
  },
  {
    id: 18, type: 5, difficulty: 0.9,
    sequence: [
      { direction: 'up' }, { direction: 'right' }, { direction: 'down' },
      { direction: 'up' }, { direction: 'right' }, null,
    ],
    answer: { direction: 'down' },
    distractors: [{ direction: 'up' }, { direction: 'right' }, { direction: 'left' }],
  },
  {
    id: 19, type: 5, difficulty: 1.1,
    sequence: [
      { direction: 'left' }, { direction: 'up' }, { direction: 'right' },
      { direction: 'left' }, null,
    ],
    answer: { direction: 'up' },
    distractors: [{ direction: 'left' }, { direction: 'down' }, { direction: 'right' }],
  },

  // Type 6: Two-attribute alternation (difficulty 1.2 to 1.8)
  {
    id: 20, type: 6, difficulty: 1.2,
    sequence: [
      { color: 'red', size: 'big' }, { color: 'blue', size: 'small' },
      { color: 'red', size: 'big' }, null,
    ],
    answer: { color: 'blue', size: 'small' },
    distractors: [
      { color: 'red', size: 'small' },
      { color: 'blue', size: 'big' },
      { color: 'yellow', size: 'small' },
    ],
  },
  {
    id: 21, type: 6, difficulty: 1.4,
    sequence: [
      { shape: 'circle', size: 'big' }, { shape: 'square', size: 'small' },
      { shape: 'circle', size: 'big' }, { shape: 'square', size: 'small' }, null,
    ],
    answer: { shape: 'circle', size: 'big' },
    distractors: [
      { shape: 'circle', size: 'small' },
      { shape: 'square', size: 'big' },
      { shape: 'triangle', size: 'big' },
    ],
  },
  {
    id: 22, type: 6, difficulty: 1.5,
    sequence: [
      { color: 'yellow', shape: 'triangle' }, { color: 'purple', shape: 'circle' },
      { color: 'yellow', shape: 'triangle' }, null,
    ],
    answer: { color: 'purple', shape: 'circle' },
    distractors: [
      { color: 'yellow', shape: 'circle' },
      { color: 'purple', shape: 'triangle' },
      { color: 'red', shape: 'star' },
    ],
  },
  {
    id: 23, type: 6, difficulty: 1.7,
    sequence: [
      { color: 'green', size: 'small' }, { color: 'orange', size: 'big' },
      { color: 'green', size: 'small' }, { color: 'orange', size: 'big' },
      { color: 'green', size: 'small' }, null,
    ],
    answer: { color: 'orange', size: 'big' },
    distractors: [
      { color: 'green', size: 'big' },
      { color: 'orange', size: 'small' },
      { color: 'blue', size: 'big' },
    ],
  },

  // Type 7: Three-attribute progression (difficulty 1.8 to 2.5)
  {
    id: 24, type: 7, difficulty: 1.8,
    sequence: [
      { color: 'red', shape: 'circle', size: 'big' },
      { color: 'blue', shape: 'square', size: 'small' },
      { color: 'red', shape: 'circle', size: 'big' }, null,
    ],
    answer: { color: 'blue', shape: 'square', size: 'small' },
    distractors: [
      { color: 'red', shape: 'square', size: 'small' },
      { color: 'blue', shape: 'circle', size: 'big' },
      { color: 'yellow', shape: 'triangle', size: 'small' },
    ],
  },
  {
    id: 25, type: 7, difficulty: 2.0,
    sequence: [
      { color: 'yellow', shape: 'triangle', size: 'small' },
      { color: 'purple', shape: 'star', size: 'big' },
      { color: 'yellow', shape: 'triangle', size: 'small' },
      { color: 'purple', shape: 'star', size: 'big' }, null,
    ],
    answer: { color: 'yellow', shape: 'triangle', size: 'small' },
    distractors: [
      { color: 'purple', shape: 'triangle', size: 'small' },
      { color: 'yellow', shape: 'star', size: 'big' },
      { color: 'red', shape: 'circle', size: 'small' },
    ],
  },
  {
    id: 26, type: 7, difficulty: 2.1,
    sequence: [
      { color: 'red', shape: 'square', size: 'big' },
      { color: 'blue', shape: 'triangle', size: 'small' },
      { color: 'yellow', shape: 'circle', size: 'big' },
      { color: 'red', shape: 'square', size: 'small' }, null,
    ],
    answer: { color: 'blue', shape: 'triangle', size: 'big' },
    distractors: [
      { color: 'blue', shape: 'square', size: 'small' },
      { color: 'yellow', shape: 'triangle', size: 'small' },
      { color: 'red', shape: 'circle', size: 'big' },
    ],
  },
  {
    id: 27, type: 7, difficulty: 2.2,
    sequence: [
      { color: 'green', shape: 'star', size: 'small' },
      { color: 'orange', shape: 'circle', size: 'big' },
      { color: 'green', shape: 'star', size: 'small' }, null,
    ],
    answer: { color: 'orange', shape: 'circle', size: 'big' },
    distractors: [
      { color: 'green', shape: 'circle', size: 'big' },
      { color: 'orange', shape: 'star', size: 'small' },
      { color: 'purple', shape: 'square', size: 'big' },
    ],
  },
  {
    id: 28, type: 7, difficulty: 2.3,
    sequence: [
      { color: 'red', shape: 'circle', size: 'big' },
      { color: 'blue', shape: 'triangle', size: 'small' },
      { color: 'yellow', shape: 'square', size: 'big' },
      { color: 'red', shape: 'circle', size: 'small' },
      { color: 'blue', shape: 'triangle', size: 'big' }, null,
    ],
    answer: { color: 'yellow', shape: 'square', size: 'small' },
    distractors: [
      { color: 'yellow', shape: 'triangle', size: 'big' },
      { color: 'blue', shape: 'square', size: 'small' },
      { color: 'red', shape: 'square', size: 'big' },
    ],
  },
  {
    id: 29, type: 7, difficulty: 2.4,
    sequence: [
      { color: 'purple', shape: 'star', size: 'big' },
      { color: 'green', shape: 'triangle', size: 'small' },
      { color: 'orange', shape: 'circle', size: 'big' },
      { color: 'purple', shape: 'star', size: 'small' }, null,
    ],
    answer: { color: 'green', shape: 'triangle', size: 'big' },
    distractors: [
      { color: 'green', shape: 'star', size: 'small' },
      { color: 'orange', shape: 'triangle', size: 'big' },
      { color: 'purple', shape: 'circle', size: 'small' },
    ],
  },
  {
    id: 30, type: 7, difficulty: 2.5,
    sequence: [
      { color: 'red', shape: 'square', size: 'small' },
      { color: 'blue', shape: 'circle', size: 'big' },
      { color: 'yellow', shape: 'star', size: 'small' },
      { color: 'red', shape: 'square', size: 'big' },
      { color: 'blue', shape: 'circle', size: 'small' }, null,
    ],
    answer: { color: 'yellow', shape: 'star', size: 'big' },
    distractors: [
      { color: 'yellow', shape: 'circle', size: 'small' },
      { color: 'red', shape: 'star', size: 'big' },
      { color: 'blue', shape: 'square', size: 'small' },
    ],
  },
];

/**
 * Select an item from the bank closest to target difficulty.
 * @param {number} targetB - Target difficulty
 * @param {Set<number>} usedIds - Set of already-used item IDs
 * @returns {object|null} Selected item or null if bank exhausted
 */
export function selectBridgeItem(targetB, usedIds = new Set()) {
  const available = BRIDGE_ITEMS.filter((item) => !usedIds.has(item.id));
  if (available.length === 0) return null;

  available.sort(
    (a, b) => Math.abs(a.difficulty - targetB) - Math.abs(b.difficulty - targetB)
  );
  return available[0];
}

/**
 * Shuffle answer options for a bridge item (answer + distractors).
 * @param {object} item - Bridge item
 * @returns {object[]} Shuffled array of 4 options with `isCorrect` flag
 */
export function shuffleBridgeOptions(item) {
  const options = [
    { ...item.answer, isCorrect: true },
    ...item.distractors.map((d) => ({ ...d, isCorrect: false })),
  ];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

export { BRIDGE_ITEMS };
