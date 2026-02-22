import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useGameState } from '../../state/gameState';
import { computeFullResults } from '../../engine/scoring';
import Noor from '../../components/Noor/Noor';
import ProgressTrail from '../../components/ProgressTrail/ProgressTrail';
import Transition from './Transition';
import styles from './Game.module.css';

const BerryBasket = React.lazy(() => import('./modules/BerryBasket'));
const FallingLeaves = React.lazy(() => import('./modules/FallingLeaves'));
const SleepingFox = React.lazy(() => import('./modules/SleepingFox'));
const BridgeBuilder = React.lazy(() => import('./modules/BridgeBuilder'));
const FeelingForest = React.lazy(() => import('./modules/FeelingForest'));

const MODULES = [BerryBasket, FallingLeaves, SleepingFox, BridgeBuilder, FeelingForest];
const TOTAL_MODULES = 5;

export default function Game() {
  const { state, completeModule, setResults } = useGameState();
  const [showTransition, setShowTransition] = useState(true);
  const moduleIndex = state.currentModule;
  const hasComputedResults = useRef(false);

  const handleModuleComplete = useCallback(
    (result) => {
      completeModule(result);
    },
    [completeModule]
  );

  const handleTransitionContinue = useCallback(() => {
    setShowTransition(false);
  }, []);

  useEffect(() => {
    if (moduleIndex >= TOTAL_MODULES && !hasComputedResults.current) {
      hasComputedResults.current = true;
      const results = computeFullResults(state.moduleResults, state.conditions);
      setResults(results);
    }
  }, [moduleIndex, state.moduleResults, state.conditions, setResults]);

  if (moduleIndex >= TOTAL_MODULES) {
    return null;
  }

  if (showTransition) {
    return (
      <Transition
        moduleIndex={moduleIndex}
        onContinue={handleTransitionContinue}
      />
    );
  }

  const ModuleComponent = MODULES[moduleIndex];

  const onComplete = (result) => {
    handleModuleComplete(result);
    setShowTransition(true);
  };

  return (
    <div className={styles.game}>
      <div className={styles.topBar}>
        <div className={styles.noorCorner}>
          <Noor size={40} mood="happy" />
        </div>
        <ProgressTrail current={moduleIndex} total={TOTAL_MODULES} />
      </div>
      <div className={styles.moduleContainer}>
        <Suspense
          fallback={<div className={styles.loading}>Getting ready...</div>}
        >
          <ModuleComponent ageBand={state.ageBand} onComplete={onComplete} />
        </Suspense>
      </div>
    </div>
  );
}
