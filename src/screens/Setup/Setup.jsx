import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from '../../state/gameState';
import Noor from '../../components/Noor/Noor';
import styles from './Setup.module.css';

const AGE_OPTIONS = [
  { value: 2, label: '2 years' },
  { value: 3, label: '3 years' },
  { value: 4, label: '4 years' },
  { value: 5, label: '5 years' },
  { value: 6, label: '6 years' },
];

const LANG_OPTIONS = [
  { value: 'english', label: 'English' },
  { value: 'arabic', label: 'Arabic' },
  { value: 'other', label: 'Other' },
];

const CONDITION_OPTIONS = [
  { value: 'none', label: 'No' },
  { value: 'autism', label: 'Yes — autism diagnosis' },
  { value: 'hearing', label: 'Yes — hearing difference' },
  { value: 'vision', label: 'Yes — vision difference' },
  { value: 'other', label: 'Yes — other' },
];

export default function Setup() {
  const { updateState, startGame } = useGameState();
  const mainHeadingRef = useRef(null);
  const [ageBand, setAgeBand] = useState(null);

  useEffect(() => {
    mainHeadingRef.current?.focus({ preventScroll: true });
  }, []);
  const [language, setLanguage] = useState(null);
  const [condition, setCondition] = useState(null);
  const [consent, setConsent] = useState(false);

  const canBegin = ageBand !== null && language !== null && condition !== null && consent;

  const handleBegin = useCallback(() => {
    if (!canBegin) return;
    const conditions = condition === 'none' ? [] : [condition];
    updateState({ ageBand, language, conditions, consentGiven: true });
    startGame();
  }, [canBegin, ageBand, language, condition, updateState, startGame]);

  return (
    <div className={styles.setup}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Noor size={80} mood="happy" />
          <h1 className={styles.title} ref={mainHeadingRef} tabIndex={-1}>
            Before we start
          </h1>
          <p className={styles.subtitle}>
            Just a few quick questions — no names or personal information needed.
          </p>
        </div>

        {/* Age band */}
        <div className={styles.section}>
          <span className={styles.label}>How old is your child?</span>
          <div className={styles.buttonGroup}>
            {AGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.optionBtn} ${ageBand === opt.value ? styles.optionBtnActive : ''}`}
                onClick={() => setAgeBand(opt.value)}
                aria-pressed={ageBand === opt.value}
                role="button"
                aria-label={opt.label}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Language */}
        <div className={styles.section}>
          <span className={styles.label}>Primary language at home</span>
          <div className={styles.buttonGroup}>
            {LANG_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.optionBtn} ${language === opt.value ? styles.optionBtnActive : ''}`}
                onClick={() => setLanguage(opt.value)}
                aria-pressed={language === opt.value}
                role="button"
                aria-label={opt.label}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className={styles.section}>
          <span className={styles.label}>
            Does your child have any diagnosed conditions we should know about?
          </span>
          <div className={styles.conditionGroup}>
            {CONDITION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.conditionBtn} ${condition === opt.value ? styles.conditionBtnActive : ''}`}
                onClick={() => setCondition(opt.value)}
                aria-pressed={condition === opt.value}
                role="button"
                aria-label={opt.label}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Consent */}
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-label="Consent confirmation"
          />
          <span className={styles.consentText}>
            I confirm I am this child's parent or guardian, and I understand this
            activity is not a clinical assessment.
          </span>
        </label>

        {/* Begin */}
        <button
          className={`btn-game ${styles.beginBtn}`}
          onClick={handleBegin}
          disabled={!canBegin}
          aria-label="Let's help Noor"
        >
          Let's help Noor! →
        </button>
      </div>
    </div>
  );
}
