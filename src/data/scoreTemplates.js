/**
 * Score band language templates for each pillar.
 * 4 bands × 5 pillars = 20 templates.
 */

const PILLAR_FRIENDLY_NAMES = {
  WM: 'Remembering Things',
  PS: 'Thinking Speed',
  EF: 'Staying Focused',
  VS: 'Solving Puzzles',
  SC: 'Understanding Feelings',
};

const PILLAR_DESCRIPTIONS = {
  WM: {
    strong:
      'Your child showed excellent ability to hold and use information in mind during tasks — a great foundation for learning and following multi-step instructions.',
    typical:
      "Your child's ability to hold information in mind is developing as expected for their age. This is a normal part of early learning.",
    emerging:
      'Your child found it a little challenging to hold sequences in mind during the activity. This is something worth noting, though many children develop this skill at different rates.',
    needs_support:
      'Your child struggled significantly with holding and using information in mind. This is an area where additional support from a professional could be very helpful.',
  },
  PS: {
    strong:
      'Your child responded quickly and accurately, showing strong processing speed. They were able to keep up well with fast-moving tasks.',
    typical:
      "Your child's processing speed is within the expected range for their age. They handled time-sensitive tasks at a comfortable pace.",
    emerging:
      'Your child needed a bit more time to respond during faster-paced activities. Some children are naturally more deliberate, but this is worth keeping in mind.',
    needs_support:
      'Your child had significant difficulty keeping up with time-sensitive tasks. This may be worth discussing with your pediatrician to understand whether additional support could help.',
  },
  EF: {
    strong:
      'Your child showed excellent self-control and focus. They were able to stop themselves when needed and stay on task — signs of strong executive function.',
    typical:
      "Your child's ability to control impulses and stay focused is developing normally. Occasional slips are completely expected at this age.",
    emerging:
      'Your child found it somewhat difficult to hold back responses or maintain focus throughout the activity. This is a common area of growth for young children.',
    needs_support:
      'Your child had significant difficulty with impulse control during the activity. This is an important area that could benefit from professional guidance and targeted support strategies.',
  },
  VS: {
    strong:
      'Your child showed strong ability to recognize patterns and solve visual puzzles — a marker of flexible, analytical thinking.',
    typical:
      'Your child handled visual patterns at an age-appropriate level. Their ability to see relationships between shapes and colors is developing well.',
    emerging:
      'Your child found some of the pattern-recognition tasks challenging. This skill develops at different rates and may benefit from practice with puzzles and building activities.',
    needs_support:
      'Your child had significant difficulty with visual pattern recognition. This is an area where a professional evaluation could provide valuable insight into how best to support their learning.',
  },
  SC: {
    strong:
      'Your child showed excellent ability to read emotions and understand social situations — a wonderful foundation for empathy and social relationships.',
    typical:
      "Your child's ability to recognize emotions in others is developing as expected. They showed age-appropriate understanding of feelings.",
    emerging:
      'Your child found it somewhat challenging to identify emotions in the activity. Social-emotional understanding develops at varying rates and is influenced by many factors.',
    needs_support:
      "Your child had difficulty recognizing emotions during the activity. This doesn't define their social capacity, but it may be worth exploring further with a developmental specialist.",
  },
};

/**
 * Get the friendly name for a pillar.
 * @param {string} pillarKey - WM, PS, EF, VS, SC
 * @returns {string}
 */
export function getPillarFriendlyName(pillarKey) {
  return PILLAR_FRIENDLY_NAMES[pillarKey] ?? pillarKey;
}

/**
 * Get the description text for a pillar at a given score band.
 * @param {string} pillarKey
 * @param {string} band - 'strong' | 'typical' | 'emerging' | 'needs_support'
 * @returns {string}
 */
export function getPillarDescription(pillarKey, band) {
  return PILLAR_DESCRIPTIONS[pillarKey]?.[band] ?? '';
}

export { PILLAR_FRIENDLY_NAMES, PILLAR_DESCRIPTIONS };
