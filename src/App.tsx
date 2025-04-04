import GraphMakerUI from "./components/layout/graph-maker.fixture"
import TraversalToolbar from "./components/layout/traversal-toolbar.fixture"

import './index.css';

function App() {
  return (
    <div className="flex flex-col h-screen">
      <GraphMakerUI/>
      <TraversalToolbar/>
    </div>
  )
}

export default App
