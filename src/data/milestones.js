/**
 * Developmental milestone content organized by age band and domain.
 */

const MILESTONES = {
  24: {
    label: '24 months (2 years)',
    language: [
      'Uses 50+ words',
      'Begins combining two words ("more milk")',
      'Points to things when named',
      'Follows simple instructions',
    ],
    motor: [
      'Walks steadily, begins running',
      'Kicks a ball forward',
      'Stacks 4+ blocks',
      'Turns pages of a book (may turn several at once)',
    ],
    cognitive: [
      'Begins simple pretend play',
      'Finds hidden objects',
      'Sorts shapes and colors',
      'Completes sentences in familiar books',
    ],
    social: [
      'Shows defiant behavior ("no!")',
      'Plays alongside other children (parallel play)',
      'Shows increasing independence',
      'Imitates adult behaviors',
    ],
    redFlags: [
      "Doesn't use two-word phrases",
      "Doesn't know what to do with common objects (cup, phone)",
      "Doesn't copy actions or words",
      'Loses skills previously had',
    ],
  },
  36: {
    label: '36 months (3 years)',
    language: [
      'Speaks in 3-4 word sentences',
      'Can name most familiar things',
      'Understands "in," "on," "under"',
      'Strangers can understand most speech',
    ],
    motor: [
      'Climbs well, runs easily',
      'Pedals a tricycle',
      'Turns door handles',
      'Draws a circle when shown how',
    ],
    cognitive: [
      'Does puzzles with 3-4 pieces',
      'Turns book pages one at a time',
      'Plays make-believe with dolls, animals, people',
      'Understands "two"',
    ],
    social: [
      'Takes turns in games',
      'Shows concern for a crying friend',
      'Shows a wide range of emotions',
      'Separates from caregivers more easily',
    ],
    redFlags: [
      "Doesn't make eye contact",
      "Can't work simple toys (peg boards, simple puzzles)",
      "Doesn't speak in sentences",
      "Doesn't play pretend or make-believe",
    ],
  },
  48: {
    label: '48 months (4 years)',
    language: [
      'Tells stories',
      'Says first and last name',
      'Understands "same" and "different"',
      'Uses correct grammar most of the time',
    ],
    motor: [
      'Hops on one foot',
      'Catches a bounced ball most of the time',
      'Pours, cuts with supervision, mashes own food',
      'Draws a person with 2-4 body parts',
    ],
    cognitive: [
      'Names some colors and numbers',
      'Understands counting',
      'Begins to understand time',
      'Remembers parts of a story',
    ],
    social: [
      'Enjoys doing new things',
      'Plays cooperatively with other children',
      'Talks about likes and interests',
      "Can tell what's real vs. make-believe (sometimes confused)",
    ],
    redFlags: [
      "Can't jump in place",
      'Has trouble scribbling',
      'Shows no interest in interactive games',
      "Can't retell a favorite story",
    ],
  },
  60: {
    label: '60 months (5 years)',
    language: [
      'Speaks clearly, uses full sentences',
      'Tells a simple story using complete sentences',
      'Uses future tense ("Grandma will be here")',
      'Says name and address',
    ],
    motor: [
      'Stands on one foot for 10+ seconds',
      'Hops and may skip',
      'Can use a fork and spoon, sometimes a table knife',
      'Uses the toilet independently',
    ],
    cognitive: [
      'Counts 10+ things',
      'Draws a person with at least 6 body parts',
      'Prints some letters or numbers',
      'Understands everyday things like money and food',
    ],
    social: [
      'Wants to please friends',
      'Wants to be like friends',
      'More likely to agree with rules',
      'Likes to sing, dance, and act',
    ],
    redFlags: [
      "Doesn't show a wide range of emotions",
      'Is extremely withdrawn',
      "Can't tell what's real and what's make-believe",
      "Doesn't draw pictures",
    ],
  },
  72: {
    label: '72 months (6 years)',
    language: [
      'Speaks in complex sentences',
      'Can describe a sequence of events',
      'Understands and uses opposites',
      'Begins to read simple words',
    ],
    motor: [
      'Rides a bicycle (may use training wheels)',
      'Ties shoelaces (beginning)',
      'Draws recognizable pictures',
      'Writes some letters and numbers clearly',
    ],
    cognitive: [
      'Counts to 100',
      'Understands concepts of "more," "less," "equal"',
      'Begins logical thinking',
      'Attention span increases significantly',
    ],
    social: [
      'Develops deeper friendships',
      'Shows more independence from family',
      'Begins to understand different perspectives',
      'Shows empathy more consistently',
    ],
    redFlags: [
      "Doesn't show interest in reading or writing",
      'Has significant difficulty following multi-step directions',
      'Shows extreme anxiety about separation',
      'Cannot engage in back-and-forth conversation',
    ],
  },
};

/**
 * Get milestones for a specific age band.
 * @param {number} ageBand - Age in years (2-6)
 * @returns {object|null} Milestone data for that age
 */
export function getMilestones(ageBand) {
  const months = ageBand * 12;
  return MILESTONES[months] ?? null;
}

export { MILESTONES };
