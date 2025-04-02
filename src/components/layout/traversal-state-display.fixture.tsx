import { useAdjacencyList } from "../utils/graph.store";
import { bfs } from "../../algorithms/bfs";
import { AlgoTypeStrings } from "../../algorithms/algo-interfaces";
import TraversalControlToolbar from "./traversal-control-toolbar.fixture";

import { useState } from 'react';

const SECONDS_TO_MILLISECONDS = 1000;

const TraversalStateDisplay = () => {

    const [ traversalIndex, setTraversalIndex ] = useState<number>(0);
    const [ isPaused, setIsPaused ] = useState<boolean>(true);
    const [ interval, setUpdateInterval ] = useState<NodeJS.Timeout | null>(null);

    let adjacencyList = useAdjacencyList(state => state);
    let traversal = bfs(adjacencyList, 0);

    const incrementTraversalIndex = () => {
        if(!isPaused || traversal === undefined) return;
        if(traversalIndex >= traversal.states.length - 1) return;
        setTraversalIndex(traversalIndex + 1);
    }

    const decrementTraversalIndex = () => {
        if(!isPaused || traversal === undefined) return;
        if(traversalIndex <= 0) return;
        setTraversalIndex(traversalIndex - 1);
    }

    const playPauseTraversal = () => {
        if(traversal === undefined) return; // No traversal to play/pause
        if(isPaused) { // play
            setIsPaused(false);
            const interval = setInterval(() => {
                if(traversal !== undefined) {

                    // Use this functional update to avoid stale closure !!
                    setTraversalIndex((t) => {
                        if(traversal !== undefined && t >= traversal.states.length - 1) {
                            clearInterval(interval);
                            setUpdateInterval(null);
                            setIsPaused(true);
                            return t;
                        }
                        return t + 1;
                    });
                } else {
                    setIsPaused(true);
                    clearInterval(interval);
                }
            }, SECONDS_TO_MILLISECONDS);
            setUpdateInterval(interval);
        } else { // pause, clear the interval
            setIsPaused(true);
            if(interval !== null)
                clearInterval(interval);
                setUpdateInterval(null);
        }
    };

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
            Paused: {isPaused ? "true" : "false"}
            <TraversalControlToolbar 
                incrementTraversalFunction = {incrementTraversalIndex}
                decrementTraversalFunction = {decrementTraversalIndex}
                playPauseTraveralFunction = {playPauseTraversal}
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