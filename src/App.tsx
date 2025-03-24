import GraphMakerUI from "./components/layout/graph-maker.fixture"
import TraversalStateDisplay from "./components/layout/traversal-state-display.fixture"

import './index.css';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <GraphMakerUI/>
      <TraversalStateDisplay/>
    </div>
  )
}

export default App
