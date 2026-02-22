import { useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../../state/gameState';
import Noor from '../../components/Noor/Noor';
import Learn from '../Learn/Learn';
import styles from './Landing.module.css';

export default function Landing() {
  const { goToScreen } = useGameState();
  const mainHeadingRef = useRef(null);

  useEffect(() => {
    mainHeadingRef.current?.focus({ preventScroll: true });
  }, []);

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
        <h1 className={styles.heroTitle} ref={mainHeadingRef} tabIndex={-1}>
          A gentle adventure for curious minds
        </h1>
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

      {/* Trust bar */}
      <section className={styles.trustBar} aria-label="Trust indicators">
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">🔒</span>
          <span>We do not collect or store your child's responses. Fonts load from Google.</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">📵</span>
          <span>No camera or microphone used</span>
        </div>
        <div className={styles.trustItem}>
          <span className={styles.trustIcon} aria-hidden="true">🎮</span>
          <span>Designed to feel like a game</span>
        </div>
      </section>

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
      <section className={styles.disclaimer} id="medical-disclaimer">
        <blockquote className={styles.disclaimerBox}>
          Khael is an educational, observational activity — not a diagnostic tool. It is not
          standardized, normed, or validated against clinical instruments. It does not produce
          a diagnosis and is not a substitute for evaluation by a qualified professional.
          What it offers is a gentle, descriptive window into how your child engaged with
          play-based tasks — something you might bring to your pediatrician if you have
          questions, or simply a way to notice and appreciate how they learn. If what we
          observed suggests a conversation with a professional could help, we'll tell you
          clearly and suggest what to say.
        </blockquote>
      </section>

      {/* Learn section */}
      <Learn />

      {/* Privacy */}
      <section className={styles.legalSection} id="privacy">
        <h2 className={styles.legalTitle}>Privacy</h2>
        <p className={styles.legalText}>
          Khael runs entirely in your browser. We do not collect, store, or transmit
          your child's responses, scores, or any identifying information. Fonts are loaded
          from Google; their privacy policy applies to that request. Session data exists
          only in memory and is discarded when you close the tab. There is no account,
          no database, and no tracking.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => document.getElementById('privacy')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Privacy
          </button>
          <span className={styles.footerDivider}>·</span>
          <button
            type="button"
            className={styles.footerLink}
            onClick={() => document.getElementById('medical-disclaimer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Medical disclaimer
          </button>
        </div>
        <p className={styles.footerTagline}>Khael | A developmental starting point, not a diagnosis | Free forever</p>
      </footer>
    </div>
  );
}
