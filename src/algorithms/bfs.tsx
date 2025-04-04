import { AdjacencyList } from'../components/utils/graph.interfaces';
import { NodeID } from '../components/utils/node';
import { AlgoState, AlgoType } from './algo-interfaces';

/**
 * Perform a BFS on the adjacency list and return the result as an array of states.
 * @param graph Represents the graph as an adjacency list
 * @param start Starting node for this BFS traversal
 * @returns A collection of states representing the BFS traversal of the graph
 */
export const bfs = (graph: AdjacencyList, start: NodeID): AlgoState  => {
    const q: NodeID[] = [start];
    const visited: Set<NodeID> = new Set();
    const traversalStates: AlgoState = {
        algorithm: AlgoType.BFS,
        startingNode: start,
        states: []
    };
    while(q.length > 0) {
        const currentNode = q.shift();
        if(currentNode === undefined) return undefined; // Something went seriously wrong
        const neighbors = graph.get(currentNode);
        if(neighbors === undefined) return undefined; // Something went seriously wrong
        for(const neighbor of neighbors) {
            if(visited.has(neighbor) || q.includes(neighbor)) continue;
            q.push(neighbor);
        }
        traversalStates.states.push({
            currentNode: currentNode,
            queue: new Set(q),
            visited: new Set(visited)
        });
        visited.add(currentNode);
    }
    // Add the final state
    traversalStates.states.push({
        currentNode: "Complete",
        queue: new Set(q),
        visited: new Set(visited)
    });
    return traversalStates;
}