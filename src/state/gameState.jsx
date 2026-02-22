import { createContext, useContext, useCallback, useState } from 'react';

const INITIAL_STATE = {
  screen: 'landing',
  ageBand: null,
  language: null,
  conditions: [],
  consentGiven: false,
  currentModule: 0,
  moduleResults: [],
  pillarScores: {},
  sessionStartTime: null,
  trialLog: [],
  results: null,
};

const GameStateContext = createContext(null);

export function GameStateProvider({ children }) {
  const [state, setState] = useState({ ...INITIAL_STATE });

  const updateState = useCallback((updates) => {
    setState((prev) => {
      const next = typeof updates === 'function' ? updates(prev) : { ...prev, ...updates };
      if (import.meta.env.DEV) {
        window.__khaelDebug = next;
      }
      return next;
    });
  }, []);

  const goToScreen = useCallback((screen) => {
    updateState({ screen });
  }, [updateState]);

  const startGame = useCallback(() => {
    updateState({
      screen: 'game',
      currentModule: 0,
      moduleResults: [],
      sessionStartTime: Date.now(),
      trialLog: [],
      results: null,
    });
  }, [updateState]);

  const completeModule = useCallback((moduleResult) => {
    updateState((prev) => {
      const moduleResults = [...prev.moduleResults, moduleResult];
      const trialLog = [...prev.trialLog, ...(moduleResult.trials ?? [])];
      return {
        ...prev,
        moduleResults,
        trialLog,
        currentModule: prev.currentModule + 1,
      };
    });
  }, [updateState]);

  const setResults = useCallback((results) => {
    updateState({ results, screen: 'results' });
  }, [updateState]);

  const resetGame = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  const value = {
    state,
    updateState,
    goToScreen,
    startGame,
    completeModule,
    setResults,
    resetGame,
  };

  return (
    <GameStateContext.Provider value={value}>
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
}

export { GameStateContext, INITIAL_STATE };
