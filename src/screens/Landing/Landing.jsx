import { useCallback } from 'react';
import { useGameState } from '../../state/gameState';
import Noor from '../../components/Noor/Noor';
import Learn from '../Learn/Learn';
import styles from './Landing.module.css';

export default function Landing() {
  const { goToScreen } = useGameState();

  const handleBegin = useCallback(() => {
    goToScreen('setup');
  }, [goToScreen]);

  const scrollToLearn = useCallback(() => {
    const el = document.getElementById('learn');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.landing}>
      {/* Hero */}
      <section className={styles.hero}>
        <Noor size={140} mood="happy" animate />
        <h1 className={styles.heroTitle}>A gentle adventure for curious minds</h1>
        <p className={styles.heroSub}>
          Khael is a free, play-based activity designed to give parents a starting point
          for understanding how their child thinks, learns, and grows. No sterile assessments. Just a game to enjoy.
        </p>
        <div className={styles.heroCta}>
          <button
            className="btn-primary"
            onClick={handleBegin}
            aria-label="Begin Noor's Adventure"
          >
            Begin Noor's Adventure →
          </button>
          <button
            className={styles.secondaryLink}
            onClick={scrollToLearn}
            aria-label="Jump to Learning Resources"
          >
            Jump to Learning Resources ↓
          </button>
        </div>
      </section>

      {/* Trust bar
      <section className={styles.trustBar} aria-label="Trust indicators">
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">🔒</span>
          <span>No data collected or stored</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">📵</span>
          <span>No camera or microphone used</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">🎮</span>
          <span>Designed to feel like a game</span>
        </div>
      </section> */}

      {/* How it works */}
      <section className={styles.howSection}>
        <div className={styles.howInner}>
          <h2 className={styles.howTitle}>How it works</h2>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <h3 className={styles.stepTitle}>Tell us a little about your child</h3>
              <p className={styles.stepDesc}>
                Just their age range, no names or personal information required.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <h3 className={styles.stepTitle}>Noor goes on an adventure</h3>
              <p className={styles.stepDesc}>
                Your child helps Noor through five short, playful activities.
              </p>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <h3 className={styles.stepTitle}>You receive a gentle summary</h3>
              <p className={styles.stepDesc}>
                A profile of how your child engaged, with guidance on next steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className={styles.disclaimer}>
        <blockquote className={styles.disclaimerBox}>
          Khael is not a diagnostic tool. It does not produce a diagnosis and it is not a
          substitute for a clinical evaluation by a qualified professional. What it does is
          give you a structured, thoughtful starting point — something to bring to your
          pediatrician if you have concerns, or simply a window into how your child engages
          with different types of thinking tasks. If the results suggest speaking with a
          professional, we'll tell you clearly and tell you exactly what to say.
        </blockquote>
      </section>

      {/* Learn section */}
      <Learn />

      {/* Footer */}
      <footer className={styles.footer}>
        Khael | A developmental starting point, not a diagnosis | Free forever
      </footer>
    </div>
  );
}
