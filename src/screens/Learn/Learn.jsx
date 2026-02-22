import { useState, useCallback, useRef, useEffect } from 'react';
import { EDUCATIONAL_TOPICS } from '../../data/educationalContent';
import styles from './Learn.module.css';

export default function Learn() {
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

  return (
    <section className={styles.learn} id="learn">
      <h2 className={styles.title}>Learning Resources</h2>
      <p className={styles.subtitle}>
        Understanding your child's development — written for parents, not clinicians.
      </p>

      <div className={styles.accordion}>
        {EDUCATIONAL_TOPICS.map((topic) => {
          const isOpen = openId === topic.id;
          return (
            <div key={topic.id} className={styles.item}>
              <button
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
                ref={(el) => { panelRefs.current[topic.id] = el; }}
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
