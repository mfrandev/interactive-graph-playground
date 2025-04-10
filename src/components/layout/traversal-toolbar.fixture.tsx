import { useAdjacencyList, useGraphHighlightStateStore } from "../utils/graph.store";
import { bfs } from "../../algorithms/bfs";
import { AlgoTypeStrings } from "../../algorithms/algo-interfaces";
import TraversalControlToolbar from "./traversal-control-toolbar.fixture";
import TraversalStateDisplay from "./traversal-state-display";
import { TRAVERSAL_COMPLETE } from "../utils/graph.interfaces";

import { useState } from 'react';

const SECONDS_TO_MILLISECONDS = 1000;

const TraversalToolbar = () => {

    const [ traversalIndex, setTraversalIndex ] = useState<number>(0);
    const [ isPaused, setIsPaused ] = useState<boolean>(true);
    const [ interval, setUpdateInterval ] = useState<NodeJS.Timeout | null>(null);

    let adjacencyList = useAdjacencyList(state => state);
    let traversal = bfs(adjacencyList, 0);

    const updateGraphHighlightState = (index: number | undefined) => {
        if(index === undefined || traversal === null || traversal === undefined) {
            useGraphHighlightStateStore.setState({
                currentNode: -1,
                visitingNodes: new Set<number>(),
                visitedNodes: new Set<number>()
            });
        } 
        else {
            useGraphHighlightStateStore.setState({
                currentNode: traversal.states[index].currentNode === "Complete" ? TRAVERSAL_COMPLETE : traversal.states[index].currentNode,
                visitingNodes: new Set<number>(), // TODO: implement this once there's a traversal algorithm that uses it.
                visitedNodes: traversal.states[index].visited
            });
        }
    }

    const incrementTraversalIndex = () => {
        if(!isPaused || traversal === undefined) return;
        if(traversalIndex >= traversal.states.length - 1) return;
        const newTraversalIndex: number = traversalIndex + 1;
        updateGraphHighlightState(newTraversalIndex);
        setTraversalIndex(newTraversalIndex);
    }

    const decrementTraversalIndex = () => {
        if(!isPaused || traversal === undefined) return;
        if(traversalIndex <= 0) return;
        const newTraversalIndex: number = traversalIndex - 1;
        updateGraphHighlightState(newTraversalIndex);
        setTraversalIndex(newTraversalIndex);
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
                        const nextIndex: number = t + 1;
                        updateGraphHighlightState(nextIndex);
                        console.log("Traversal index update from " + t + " to " + nextIndex);
                        return nextIndex;
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
                updateGraphHighlightState(undefined);
        }
    };

    const display = () => {
        adjacencyList = useAdjacencyList.getState();
        traversal = bfs(adjacencyList, 0);
        return traversal?.states.map((state, index) => {return `${index}: ${state}`})
    }

    return(
        <div className = "flex flex-col bg-gray-200 h-1/4"
        onClick={display}
        >
            <div className="flex justify-center pt-3">
                <div className="">
                    <span>
                        Traversal <span className={""/*isPaused ? "text-orange-50" : "text-green-50"*/}>{isPaused ? "Paused" : "Playing"}</span>, {AlgoTypeStrings[(traversal !== undefined && traversal.algorithm in AlgoTypeStrings ? traversal.algorithm : "") as (keyof typeof AlgoTypeStrings)]} State Frame { traversal !== undefined ? `${(traversalIndex + 1)} / ${traversal.states.length}` : "N/a"}
                    </span>
                </div>
            </div>
            <TraversalControlToolbar 
                incrementTraversalFunction = {incrementTraversalIndex}
                decrementTraversalFunction = {decrementTraversalIndex}
                playPauseTraveralFunction = {playPauseTraversal}
            />
            {traversal && traversal.states && traversal.states[traversalIndex] && 
                <TraversalStateDisplay traversal = {traversal} traversalIndex = {traversalIndex} />
            }
        </div>       
    );
}

export default TraversalToolbar;