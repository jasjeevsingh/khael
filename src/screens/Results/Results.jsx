import { useMemo, useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../../state/gameState';
import { PILLAR_KEYS } from '../../engine/scoring';
import { getPillarFriendlyName } from '../../data/scoreTemplates';
import RadarChart from '../../components/RadarChart/RadarChart';
import Noor from '../../components/Noor/Noor';
import PillarCard from './PillarCard';
import PrintSummary from './PrintSummary';
import Learn from '../Learn/Learn';
import styles from './Results.module.css';

const AGE_AVERAGES = {
  2: [45, 40, 35, 40, 38],
  3: [50, 48, 42, 48, 45],
  4: [55, 52, 50, 52, 52],
  5: [60, 58, 55, 58, 58],
  6: [65, 62, 60, 62, 62],
};

export default function Results() {
  const { state, goToScreen, resetGame } = useGameState();
  const results = state.results;
  const mainHeadingRef = useRef(null);

  useEffect(() => {
    mainHeadingRef.current?.focus({ preventScroll: true });
  }, [results]);

  const scores = useMemo(
    () => PILLAR_KEYS.map((k) => results?.pillars[k]?.score ?? 50),
    [results]
  );

  const reference = useMemo(
    () => AGE_AVERAGES[state.ageBand] ?? AGE_AVERAGES[4],
    [state.ageBand]
  );

  const today = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    []
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleBack = useCallback(() => {
    resetGame();
  }, [resetGame]);

  const handleLearnScroll = useCallback(() => {
    const el = document.getElementById('learn');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (!results) return null;

  const {
    profileKey,
    profileLabel,
    cci,
    consistency,
    lowReliability,
    highFatigue,
    weakPillars,
    pillars,
    confidence,
  } = results;
  const isWarrantsAttention = profileKey === 'WARRANTS_ATTENTION';
  const isDeveloping = profileKey === 'DEVELOPING_AT_PACE';
  const isInconclusive = profileKey === 'INCONCLUSIVE';

  return (
    <div className={styles.results}>
      {/* Header */}
      <section className={`${styles.header} no-print`}>
        <Noor size={100} mood="happy" animate />
        <h1 className={styles.profileTitle} ref={mainHeadingRef} tabIndex={-1}>
          {profileLabel}
        </h1>
        <p className={styles.date}>{today}</p>
        <p className={styles.confidenceNote}>
          Session confidence: {typeof confidence === 'number' ? confidence : 0}% — reflects how consistent
          your child's responses were; lower values suggest trying again on another day.
        </p>
      </section>

      {/* Radar chart */}
      <section className={`${styles.chartSection} no-print`}>
        <RadarChart scores={scores} reference={reference} />
      </section>

      {/* Notices */}
      {lowReliability && (
        <div className={`${styles.notice} no-print`}>
          We noticed your child's engagement varied quite a bit during the activity, which can
          affect how accurately we can describe their thinking. The profile below reflects what
          we observed, but we'd recommend trying again on a different day for a clearer picture.
        </div>
      )}

      {highFatigue && !lowReliability && (
        <div className={`${styles.notice} no-print`}>
          Children this age sometimes get tired mid-activity, and that's completely normal!
          Some of Noor's adventure may have been affected by your child being tired. Consider
          this profile a starting point.
        </div>
      )}

      {/* Pillar cards */}
      <section className={`${styles.pillarsGrid} no-print`}>
        {PILLAR_KEYS.map((key) => {
          const pillar = pillars[key];
          if (!pillar) return null;
          return (
            <PillarCard
              key={key}
              pillarKey={key}
              score={pillar.score}
              excluded={pillar.excludeFromCCI}
            />
          );
        })}
      </section>

      {/* Follow-up section */}
      <section className={`${styles.followUp} no-print`}>
        <h2 className={styles.followUpTitle}>What This Means</h2>

        {isWarrantsAttention && (
          <div className={styles.followUpText}>
            <p>
              Based on how your child engaged today, we noticed some patterns that you might want
              to discuss with your pediatrician. This is gentle, descriptive feedback — not a
              diagnosis. If you decide to bring it up, here's something you could say:
            </p>
            <div className={styles.followUpQuote}>
              "I had my child try an online observational activity called Khael. The feedback
              suggested I pay attention to how they engaged with {weakPillars.map((k) => getPillarFriendlyName(k)).join(', ')}.
              I'd like to discuss whether a developmental evaluation might be helpful."
            </div>
            <p>
              A pediatrician can refer you to a developmental-behavioral specialist if that
              seems appropriate. Early conversations are often helpful — even when concerns turn
              out to be within the normal range.
            </p>
          </div>
        )}

        {isDeveloping && (
          <div className={styles.followUpText}>
            <p>
              Today's observations showed some variation in how your child engaged across
              different activities. Children develop at different rates, and this is descriptive
              feedback — not a cause for alarm. You might mention it at your next well-child
              visit as a conversation starter.
            </p>
          </div>
        )}

        {isInconclusive && (
          <div className={styles.followUpText}>
            <p>
              Today's session had quite a bit of variability, which makes it hard for us to give
              you a clear picture. This is completely normal — children have off days, and
              screen-based activities don't always capture a child's true abilities. We'd
              recommend trying again on a different day when your child is rested and engaged.
            </p>
          </div>
        )}

        {!isWarrantsAttention && !isDeveloping && !isInconclusive && (
          <div className={styles.followUpText}>
            <p>
              Your child engaged wonderfully with Noor's adventure! What we observed suggests
              healthy engagement across the activities — a gentle, positive snapshot of how they
              played today. Keep nurturing their curiosity and providing opportunities for
              play-based learning.
            </p>
            <p>
              If you ever have questions about your child's development, your pediatrician is
              always the right first call. Trust your instincts as a parent — you know your child
              best.
            </p>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className={`${styles.actions} no-print`}>
        {(isWarrantsAttention || isDeveloping) && (
          <button className="btn-primary" onClick={handlePrint} aria-label="Print summary for pediatrician">
            Print Summary for Pediatrician
          </button>
        )}
        <button className="btn-secondary" onClick={handleLearnScroll}>
          Explore Learning Resources
        </button>
      </div>

      {/* Print summary (hidden until print) */}
      <PrintSummary results={results} ageBand={state.ageBand} />

      {/* Learn section — personalized based on results */}
      <Learn results={results} />

      {/* Privacy */}
      <section className={`${styles.legalSection} no-print`} id="privacy">
        <h2 className={styles.legalTitle}>Privacy</h2>
        <p className={styles.legalText}>
          Khael runs entirely in your browser. We do not collect, store, or transmit
          your child's responses, scores, or any identifying information. Fonts are loaded
          from Google; their privacy policy applies to that request. Session data exists
          only in memory and is discarded when you close the tab. There is no account,
          no database, and no tracking.
        </p>
      </section>

      {/* Medical disclaimer */}
      <section className={`${styles.legalSection} no-print`} id="medical-disclaimer">
        <h2 className={styles.legalTitle}>Medical disclaimer & limitations</h2>
        <p className={styles.legalText}>
          Khael is an educational, observational activity — not a diagnostic tool. It is not
          standardized, normed, or validated against clinical instruments. It does not produce
          a diagnosis and is not a substitute for evaluation by a qualified professional.
          Results are gentle, descriptive feedback about how your child engaged during play.
          Always consult a pediatrician or qualified specialist for developmental questions.
        </p>
      </section>

      {/* Footer */}
      <div className={`${styles.backLink} no-print`}>
        <button className={styles.backLinkBtn} onClick={handleBack}>
          ← Start over
        </button>
      </div>

      <footer className={`${styles.footer} no-print`}>
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
