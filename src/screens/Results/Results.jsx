import { useMemo, useCallback } from 'react';
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
        <h1 className={styles.profileTitle}>{profileLabel}</h1>
        <p className={styles.date}>{today}</p>
        <p className={styles.date}>Session confidence: {confidence}%</p>
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
              Based on what we observed today, your child's profile suggests it may be worth having
              a conversation with your pediatrician about a developmental evaluation. This is not a
              diagnosis — it's a data point. Here is what we'd recommend saying:
            </p>
            <div className={styles.followUpQuote}>
              "I had my child complete an online developmental activity called Khael. The results
              suggested some challenges in {weakPillars.map((k) => getPillarFriendlyName(k)).join(', ')}.
              I'd like to discuss whether a formal developmental evaluation is appropriate."
            </div>
            <p>
              A pediatrician can refer you to a developmental-behavioral pediatrician or
              neuropsychologist who can conduct a thorough assessment. Early evaluation is always
              better than waiting — even if the results turn out to be within normal range, the
              information is valuable.
            </p>
          </div>
        )}

        {isDeveloping && (
          <div className={styles.followUpText}>
            <p>
              Your child's profile shows some areas that are developing a little differently from
              what we might expect. This is not cause for alarm — children develop at different
              rates — but it may be worth mentioning to your pediatrician at your next well-child
              visit. Use the summary below as a conversation starter.
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
              Your child engaged wonderfully with Noor's adventure! Their profile shows healthy
              engagement across the activities we explored together. Keep nurturing their curiosity
              and providing opportunities for play-based learning.
            </p>
            <p>
              If you ever have concerns about your child's development, your pediatrician is
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

      {/* Learn section */}
      <Learn />

      {/* Footer */}
      <div className={`${styles.backLink} no-print`}>
        <button className={styles.backLinkBtn} onClick={handleBack}>
          ← Start over
        </button>
      </div>

      <footer className={`${styles.footer} no-print`}>
        Khael | A developmental starting point, not a diagnosis | Free forever
      </footer>
    </div>
  );
}
