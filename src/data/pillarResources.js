/**
 * Pillar-specific educational resources and quick tips.
 * Used to personalize the Learn section based on child's results.
 */

export const PILLAR_RESOURCES = {
  WM: {
    pillarName: 'Working Memory',
    friendlyName: 'Remembering Things',
    relevantTopics: ['supporting-at-home', 'milestones'],
    quickTips: [
      {
        title: 'Use visual supports',
        description:
          'Picture schedules, checklists with images, and visual timers help children hold information in mind without relying solely on verbal memory.',
      },
      {
        title: 'Practice sequences through play',
        description:
          'Songs like "Head, Shoulders, Knees and Toes" and simple cooking recipes help build sequential memory in a fun, low-pressure way.',
      },
      {
        title: 'Give one instruction at a time',
        description:
          'Instead of "Put on your shoes, get your bag, and meet me at the door," break it into single steps. Gradually add complexity as skills grow.',
      },
      {
        title: 'Play memory games together',
        description:
          'Matching card games, "I went to the store and bought..." verbal games, and hide-and-seek with multiple objects all exercise working memory.',
      },
      {
        title: 'Use spaced repetition',
        description:
          'Review new concepts across multiple days rather than all at once. Brief, repeated practice is more effective than long single sessions.',
      },
    ],
    whenToSeek:
      'If your child consistently struggles to follow simple two-step instructions by age 3, or seems to "lose" information moments after hearing it, mention this to your pediatrician.',
  },

  PS: {
    pillarName: 'Processing Speed',
    friendlyName: 'Thinking Speed',
    relevantTopics: ['supporting-at-home', 'evaluation-process'],
    quickTips: [
      {
        title: 'Allow extra wait time',
        description:
          'After asking a question, count silently to 10 before repeating or rephrasing. Many children who process slowly are remarkably accurate when given time.',
      },
      {
        title: 'Avoid rushing',
        description:
          'Phrases like "hurry up" increase anxiety and actually slow processing further. Build in extra buffer time for transitions.',
      },
      {
        title: 'Provide advance notice',
        description:
          'Tell your child what\'s coming next so they can begin preparing mentally: "In 5 minutes we\'ll start getting ready for bath time."',
      },
      {
        title: 'Use multi-sensory approaches',
        description:
          'Combine seeing, hearing, and doing when teaching new concepts. A child may understand better when they can touch and manipulate objects.',
      },
      {
        title: 'Celebrate accuracy over speed',
        description:
          'Praise careful, correct work rather than fast completion. This builds confidence and reduces anxiety about processing pace.',
      },
    ],
    whenToSeek:
      'If your child seems significantly slower than peers in understanding simple instructions, or often appears "lost" in group activities, discuss this with your pediatrician.',
  },

  EF: {
    pillarName: 'Executive Function',
    friendlyName: 'Staying Focused',
    relevantTopics: ['supporting-at-home', 'milestones', 'evaluation-process'],
    quickTips: [
      {
        title: 'Establish consistent routines',
        description:
          'Predictability frees up cognitive resources for learning. When a child knows what comes next, they can focus energy on the task at hand.',
      },
      {
        title: 'Give transition warnings',
        description:
          '"In 5 minutes we\'re going to clean up" helps children prepare to shift attention. Use visual timers for extra support.',
      },
      {
        title: 'Use movement breaks',
        description:
          'Physical activity improves attention. Short movement breaks between focused tasks—jumping jacks, a quick dance—help reset focus.',
      },
      {
        title: 'Play "stop and go" games',
        description:
          'Games like Red Light Green Light and Simon Says build inhibitory control through play. Freeze dance is another great option.',
      },
      {
        title: 'Model self-regulation out loud',
        description:
          '"I\'m feeling frustrated, so I\'m going to take a deep breath." Narrating your own strategies teaches children they can do the same.',
      },
    ],
    whenToSeek:
      'If your child has extreme difficulty stopping an activity when asked, cannot sit for even brief story time by age 4, or has significantly more difficulty with impulse control than peers, mention this to your pediatrician.',
  },

  VS: {
    pillarName: 'Visuospatial Skills',
    friendlyName: 'Solving Puzzles',
    relevantTopics: ['supporting-at-home', 'milestones'],
    quickTips: [
      {
        title: 'Build with blocks together',
        description:
          'Block play develops spatial reasoning. Start with simple towers, progress to copying patterns, then to creating original structures.',
      },
      {
        title: 'Do puzzles at the right level',
        description:
          'Choose puzzles just challenging enough to require effort but not so hard they cause frustration. Gradually increase piece count as skills grow.',
      },
      {
        title: 'Talk about spatial relationships',
        description:
          'Use words like "above," "below," "next to," "inside," and "between" during everyday activities. Language supports spatial thinking.',
      },
      {
        title: 'Draw and build from imagination',
        description:
          'Ask your child to draw their room, build a house for a toy, or recreate something from memory. This exercises mental visualization.',
      },
      {
        title: 'Play spot-the-difference games',
        description:
          'Looking for differences between similar images exercises visual attention and comparison—key components of visuospatial processing.',
      },
    ],
    whenToSeek:
      'If your child has significant difficulty with age-appropriate puzzles, cannot copy simple shapes by age 4, or struggles to understand basic spatial words, discuss this with your pediatrician.',
  },

  SC: {
    pillarName: 'Social Cognition',
    friendlyName: 'Understanding Feelings',
    relevantTopics: ['milestones', 'evaluation-process', 'intellectual-disability'],
    quickTips: [
      {
        title: 'Name emotions in daily life',
        description:
          '"You seem frustrated that the tower fell down." Labeling emotions helps children recognize and understand feelings in themselves and others.',
      },
      {
        title: 'Read books about feelings',
        description:
          'Picture books with characters experiencing emotions provide safe opportunities to discuss and identify feelings. Ask "How do you think she feels?"',
      },
      {
        title: 'Use emotion faces',
        description:
          'Create or print simple emotion face cards. Practice matching faces to feelings, and use them to help your child express how they feel.',
      },
      {
        title: 'Role-play social scenarios',
        description:
          'Use stuffed animals or dolls to act out situations: "Bear fell down. How does Bear feel? What should Rabbit do?" This builds perspective-taking.',
      },
      {
        title: 'Point out emotions in real time',
        description:
          '"Look, that little boy is crying. I think he might be sad because he dropped his ice cream." Real-world observation builds social understanding.',
      },
    ],
    whenToSeek:
      'If your child shows no interest in other children by age 3, rarely makes eye contact, doesn\'t respond to their name, or has significant difficulty recognizing basic emotions, discuss this with your pediatrician.',
  },
};

/**
 * Returns personalized resource recommendations based on results.
 * @param {Object} results - Full results object from scoring engine
 * @returns {Object} - { priorityPillars, quickTips, relevantTopicIds }
 */
export function getPersonalizedResources(results) {
  if (!results || !results.pillars) {
    return { priorityPillars: [], quickTips: [], relevantTopicIds: [] };
  }

  const { pillars, weakPillars = [] } = results;

  // Determine which pillars need attention (score < 45 or in weakPillars list)
  const priorityPillars = Object.entries(pillars)
    .filter(([key, data]) => {
      const isWeak = weakPillars.includes(key);
      const lowScore = data.score < 45;
      return (isWeak || lowScore) && !data.excludeFromCCI;
    })
    .map(([key]) => key)
    .slice(0, 3); // Limit to top 3 priority areas

  // Gather quick tips for priority pillars
  const quickTips = priorityPillars.flatMap((pillarKey) => {
    const resource = PILLAR_RESOURCES[pillarKey];
    if (!resource) return [];
    return resource.quickTips.slice(0, 3).map((tip) => ({
      ...tip,
      pillarKey,
      pillarName: resource.friendlyName,
    }));
  });

  // Gather relevant topic IDs (deduplicated, ordered by frequency)
  const topicCounts = {};
  priorityPillars.forEach((pillarKey) => {
    const resource = PILLAR_RESOURCES[pillarKey];
    if (!resource) return;
    resource.relevantTopics.forEach((topicId) => {
      topicCounts[topicId] = (topicCounts[topicId] || 0) + 1;
    });
  });

  const relevantTopicIds = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);

  return { priorityPillars, quickTips, relevantTopicIds };
}
