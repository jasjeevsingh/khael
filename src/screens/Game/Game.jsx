import React, { useState, useCallback, Suspense, useEffect, useRef } from 'react';
import { useGameState } from '../../state/gameState';
import { computeFullResults } from '../../engine/scoring';
import Noor from '../../components/Noor/Noor';
import JourneyMap from '../../components/JourneyMap/JourneyMap';
import Tutorial from '../../components/Tutorial/Tutorial';
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
  const [showTutorial, setShowTutorial] = useState(false);
  const [noorMood, setNoorMood] = useState('happy');
  const moduleIndex = state.currentModule;
  const hasComputedResults = useRef(false);
  const shownTutorials = useRef(new Set());
  const moodTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    };
  }, []);

  const triggerNoorReaction = useCallback((correct) => {
    if (moodTimerRef.current) clearTimeout(moodTimerRef.current);
    setNoorMood(correct ? 'celebrating' : 'encouraging');
    moodTimerRef.current = setTimeout(() => {
      setNoorMood('happy');
    }, 1200);
  }, []);

  const handleModuleComplete = useCallback(
    (result) => {
      completeModule(result);
    },
    [completeModule]
  );

  const handleTransitionContinue = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/67da0dca-cfc0-4e6f-b8ab-f9e1187045ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Game.jsx:handleTransitionContinue',message:'Transition continue clicked',data:{moduleIndex,willShowTutorial:!shownTutorials.current.has(moduleIndex)},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    setShowTransition(false);
    if (!shownTutorials.current.has(moduleIndex)) {
      shownTutorials.current.add(moduleIndex);
      setShowTutorial(true);
    }
  }, [moduleIndex]);

  const handleTutorialComplete = useCallback(() => {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/67da0dca-cfc0-4e6f-b8ab-f9e1187045ea',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Game.jsx:handleTutorialComplete',message:'Tutorial dismissed',data:{moduleIndex},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    setShowTutorial(false);
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

  if (showTutorial) {
    return (
      <div className={styles.game}>
        <div className={styles.topBar}>
          <div className={styles.noorCorner}>
            <Noor size={40} mood="happy" />
          </div>
          <JourneyMap current={moduleIndex} total={TOTAL_MODULES} compact />
        </div>
        <div className={styles.moduleContainer} style={{ position: 'relative' }}>
          <Tutorial moduleIndex={moduleIndex} onComplete={handleTutorialComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.game}>
      <div className={styles.topBar}>
        <div className={styles.noorCorner}>
          <Noor size={40} mood={noorMood} />
        </div>
        <JourneyMap current={moduleIndex} total={TOTAL_MODULES} compact />
      </div>
      <div className={styles.moduleContainer}>
        <Suspense
          fallback={<div className={styles.loading}>Getting ready...</div>}
        >
          <ModuleComponent
            ageBand={state.ageBand}
            onComplete={onComplete}
            onFeedback={triggerNoorReaction}
          />
        </Suspense>
      </div>
    </div>
  );
}
