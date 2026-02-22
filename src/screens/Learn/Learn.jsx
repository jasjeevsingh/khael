import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EDUCATIONAL_TOPICS } from '../../data/educationalContent';
import {
  PILLAR_RESOURCES,
  getPersonalizedResources,
} from '../../data/pillarResources';
import styles from './Learn.module.css';

/**
 * Learn section with educational resources.
 * When results are provided, shows personalized quick tips and prioritizes relevant topics.
 * @param {Object} props
 * @param {Object} [props.results] - Optional results from scoring engine
 */
export default function Learn({ results }) {
  const [openId, setOpenId] = useState(null);
  const panelRefs = useRef({});

  const toggle = useCallback((id) => {
    setOpenId((prev) => (prev === id ? null : id));
  }, []);

  useEffect(() => {
    const el = panelRefs.current[openId];
    if (el) {
      el.style.maxHeight = el.scrollHeight + 'px';
    }
    Object.entries(panelRefs.current).forEach(([id, ref]) => {
      if (ref && id !== openId) {
        ref.style.maxHeight = '0px';
      }
    });
  }, [openId]);

  const personalized = useMemo(
    () => getPersonalizedResources(results),
    [results]
  );

  const { priorityPillars, quickTips, relevantTopicIds } = personalized;
  const hasPersonalization = priorityPillars.length > 0;

  const sortedTopics = useMemo(() => {
    if (!hasPersonalization) return EDUCATIONAL_TOPICS;
    return [...EDUCATIONAL_TOPICS].sort((a, b) => {
      const aIndex = relevantTopicIds.indexOf(a.id);
      const bIndex = relevantTopicIds.indexOf(b.id);
      const aRelevant = aIndex !== -1;
      const bRelevant = bIndex !== -1;
      if (aRelevant && !bRelevant) return -1;
      if (!aRelevant && bRelevant) return 1;
      if (aRelevant && bRelevant) return aIndex - bIndex;
      return 0;
    });
  }, [hasPersonalization, relevantTopicIds]);

  return (
    <section className={styles.learn} id="learn">
      <h2 className={styles.title}>Learning Resources</h2>
      <p className={styles.subtitle}>
        {hasPersonalization
          ? "Based on today's activity, here are some resources and practical tips tailored to your child."
          : "Understanding your child's development — written for parents, not clinicians."}
      </p>

      {/* Personalized Quick Tips Section */}
      {hasPersonalization && quickTips.length > 0 && (
        <div className={styles.quickTipsSection}>
          <h3 className={styles.quickTipsTitle}>Quick Tips for Your Child</h3>
          <p className={styles.quickTipsIntro}>
            Based on what we observed, here are some practical strategies you can try at home:
          </p>
          <div className={styles.quickTipsGrid}>
            {quickTips.map((tip, index) => (
              <div key={index} className={styles.quickTipCard}>
                <span className={styles.quickTipPillar}>{tip.pillarName}</span>
                <h4 className={styles.quickTipTitle}>{tip.title}</h4>
                <p className={styles.quickTipDescription}>{tip.description}</p>
              </div>
            ))}
          </div>

          {/* When to seek help */}
          <div className={styles.whenToSeek}>
            <h4 className={styles.whenToSeekTitle}>When to Talk to a Professional</h4>
            <ul className={styles.whenToSeekList}>
              {priorityPillars.map((pillarKey) => {
                const resource = PILLAR_RESOURCES[pillarKey];
                if (!resource) return null;
                return (
                  <li key={pillarKey} className={styles.whenToSeekItem}>
                    <strong>{resource.friendlyName}:</strong> {resource.whenToSeek}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Topic Accordion */}
      <div className={styles.accordion}>
        {hasPersonalization && (
          <p className={styles.topicsIntro}>
            For deeper reading, these topics are most relevant based on today's results:
          </p>
        )}
        {sortedTopics.map((topic) => {
          const isOpen = openId === topic.id;
          const isRelevant = relevantTopicIds.includes(topic.id);
          return (
            <div
              key={topic.id}
              className={`${styles.item} ${hasPersonalization && isRelevant ? styles.itemRelevant : ''}`}
            >
              {hasPersonalization && isRelevant && (
                <span className={styles.relevantBadge}>Recommended</span>
              )}
              <button
                id={`trigger-${topic.id}`}
                className={styles.trigger}
                onClick={() => toggle(topic.id)}
                aria-expanded={isOpen}
                aria-controls={`panel-${topic.id}`}
              >
                <span className={styles.triggerIcon} aria-hidden="true">
                  {topic.icon}
                </span>
                <div className={styles.triggerContent}>
                  <div className={styles.triggerTitle}>{topic.title}</div>
                  <div className={styles.triggerTeaser}>{topic.teaser}</div>
                </div>
                <span
                  className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              <div
                id={`panel-${topic.id}`}
                className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}
                ref={(el) => {
                  panelRefs.current[topic.id] = el;
                }}
                role="region"
                aria-labelledby={`trigger-${topic.id}`}
              >
                <div className={styles.panelInner}>
                  {topic.sections.map((section, i) => (
                    <div key={i}>
                      <h3 className={styles.sectionHeading}>{section.heading}</h3>
                      <p className={styles.sectionContent}>{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
