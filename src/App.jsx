import { GameStateProvider, useGameState } from './state/gameState';
import Landing from './screens/Landing/Landing';
import Setup from './screens/Setup/Setup';
import Game from './screens/Game/Game';
import Results from './screens/Results/Results';
import './App.css';

function AppContent() {
  const { state } = useGameState();

  switch (state.screen) {
    case 'landing':
      return <Landing />;
    case 'setup':
      return <Setup />;
    case 'game':
      return <Game />;
    case 'results':
      return <Results />;
    default:
      return <Landing />;
  }
}

export default function App() {
  return (
    <GameStateProvider>
      <AppContent />
    </GameStateProvider>
  );
}
