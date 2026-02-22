import React from 'react';
import { getPillarFriendlyName, getPillarDescription } from '../../data/scoreTemplates';
import { getScoreBand } from '../../engine/scoring';
import Noor from '../../components/Noor/Noor';
import styles from './Results.module.css';

const PILLAR_MOODS = {
  WM: 'thinking',
  PS: 'happy',
  EF: 'happy',
  VS: 'thinking',
  SC: 'happy',
};

const PillarCard = React.memo(function PillarCard({ pillarKey, score, excluded }) {
  const band = getScoreBand(score);
  const friendlyName = getPillarFriendlyName(pillarKey);
  const description = getPillarDescription(pillarKey, band);
  const mood = PILLAR_MOODS[pillarKey] ?? 'happy';

  const barColor =
    band === 'strong' ? 'var(--primary)' :
    band === 'typical' ? 'var(--soft)' :
    band === 'emerging' ? 'var(--warning)' :
    '#D4956A';

  return (
    <div className={styles.pillarCard} style={excluded ? { opacity: 0.6 } : undefined}>
      <div className={styles.pillarHeader}>
        <div className={styles.pillarIcon}>
          <Noor size={40} mood={mood} />
        </div>
        <div>
          <div className={styles.pillarName}>{friendlyName}</div>
          {excluded && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
              (Not included in overall score)
            </span>
          )}
        </div>
      </div>
      <div className={styles.scoreBarOuter}>
        <div
          className={styles.scoreBarInner}
          style={{ width: `${score}%`, background: barColor }}
        />
      </div>
      <p className={styles.pillarDesc}>{description}</p>
    </div>
  );
});

export default PillarCard;
