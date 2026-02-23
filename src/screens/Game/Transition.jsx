import { useCallback, useEffect, useRef } from 'react';
import Noor from '../../components/Noor/Noor';
import JourneyMap from '../../components/JourneyMap/JourneyMap';
import styles from './Game.module.css';

const ENCOURAGEMENTS = [
  "Let's explore the forest together!",
  'Wow! You did great! Ready for the next adventure?',
  "Almost there — let's see what's next!",
  "You're amazing! One more magical place to visit!",
  "Last one! Noor is so proud of you!",
];

const MODULE_INTROS = [
  "Let's help Noor remember some berries!",
  'Look! Leaves are falling from the trees!',
  'Shhh... the fox is sleeping. Can you be sneaky?',
  'Oh no, the bridge is broken! Can you fix it?',
  'Some forest friends need your help!',
];

export default function Transition({ moduleIndex, onContinue }) {
  const message = ENCOURAGEMENTS[moduleIndex % ENCOURAGEMENTS.length];
  const intro = MODULE_INTROS[moduleIndex] ?? '';
  const continueRef = useRef(null);

  useEffect(() => {
    continueRef.current?.focus({ preventScroll: true });
  }, [moduleIndex]);

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  return (
    <div
      className={styles.transition}
      style={{ background: 'var(--bg)' }}
    >
      <JourneyMap current={moduleIndex} total={5} />

      <div style={{ marginTop: 16 }}>
        <Noor
          size={120}
          mood={moduleIndex === 0 ? 'happy' : 'celebrating'}
          animate
          showBody
          showBubble
          bubbleText={moduleIndex === 0 ? intro : `${message}\n${intro}`}
        />
      </div>

      <button
        ref={continueRef}
        className={`btn-game ${styles.continueBtn}`}
        onClick={handleContinue}
        aria-label="Continue to next activity"
      >
        {moduleIndex === 0 ? "Let's go!" : 'Continue →'}
      </button>
    </div>
  );
}
