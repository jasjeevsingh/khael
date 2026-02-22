import { useCallback } from 'react';
import Noor from '../../components/Noor/Noor';
import styles from './Game.module.css';

const ENCOURAGEMENTS = [
  "You're so good at this! Ready for the next adventure?",
  'Wow! Noor loves having you as a helper!',
  "Almost there — let's see what's next in the forest!",
  "You're amazing! One more magical place to visit!",
  "Great job! Noor is so happy you're here!",
];

const MODULE_THEMES = [
  { bg: '#E8D5C4', name: 'Berry Basket' },
  { bg: '#D4E8D0', name: 'Falling Leaves' },
  { bg: '#C8D4D8', name: 'Sleeping Fox' },
  { bg: '#DDD5C4', name: 'Bridge Builder' },
  { bg: '#E4DDE8', name: 'Feeling Forest' },
];

export default function Transition({ moduleIndex, onContinue }) {
  const message = ENCOURAGEMENTS[moduleIndex % ENCOURAGEMENTS.length];
  const theme = MODULE_THEMES[moduleIndex] ?? MODULE_THEMES[0];

  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  return (
    <div
      className={styles.transition}
      style={{ background: theme.bg }}
    >
      <Noor size={160} mood="happy" animate showBubble bubbleText={message} />
      <button
        className={`btn-game ${styles.continueBtn}`}
        onClick={handleContinue}
        aria-label="Continue to next activity"
      >
        Continue →
      </button>
    </div>
  );
}
