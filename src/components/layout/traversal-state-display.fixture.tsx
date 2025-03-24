import { useAdjacencyList } from "../utils/graph.store";
import { bfs } from "../../algorithms/bfs";
import { AlgoTypeStrings } from "../../algorithms/algo-interfaces";
import TraversalControlToolbar from "./traversal-control-toolbar.fixture";

import { useState } from 'react';

const TraversalStateDisplay = () => {

    const [ traversalIndex, setTraversalIndex ] = useState<number>(0);

    let adjacencyList = useAdjacencyList(state => state);
    let traversal = bfs(adjacencyList, 0);

    const incrementTraversalIndex = () => {
        if(traversal !== undefined && traversalIndex >= traversal.states.length - 1) return;
        setTraversalIndex(traversalIndex + 1);
    }

    const decrementTraversalIndex = () => {
        if(traversal !== undefined && traversalIndex <= 0) return;
        setTraversalIndex(traversalIndex - 1);
    }

    const display = () => {
        console.log("clicked");
        adjacencyList = useAdjacencyList.getState();
        traversal = bfs(adjacencyList, 0);
        return traversal?.states.map((state, index) => {return `${index}: ${state}`})
    }

    return(
        <div className = "flex flex-col bg-gray-200 h-1/4"
        onClick={display}
        >
            <TraversalControlToolbar 
                incrementTraversalFunction = {incrementTraversalIndex}
                decrementTraversalFunction = {decrementTraversalIndex}
            />
            {AlgoTypeStrings[(traversal !== undefined && traversal.algorithm in AlgoTypeStrings ? traversal.algorithm : "") as (keyof typeof AlgoTypeStrings)]} Traversal Data Frame {traversalIndex + 1} / {traversal !== undefined ? traversal.states.length : "undefined"}:
            {traversal && traversal.states && traversal.states[traversalIndex] && 
                <div key={traversalIndex}>
                    current: {traversal.states[traversalIndex]?.currentNode} queue: {traversal.states[traversalIndex]?.queue ? [...traversal.states[traversalIndex].queue].map((e) => e + ", ") : ''} visited: {traversal.states[traversalIndex]?.visited ? [...traversal.states[traversalIndex].visited].map((elem) => elem + ", ") : ''}
                </div>
            }
        </div>       
    );
}

export default TraversalStateDisplay;