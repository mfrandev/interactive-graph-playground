import { NodeID } from '../components/utils/node';

export enum AlgoType {
    BFS = 1,
    DFS = 2,
    Dijkstra = 3,
    AStar = 4
};

export interface BFSStateSnapshot {
    currentNode: NodeID,
    queue: Set<NodeID>,
    visited: Set<NodeID>
};

type StateSnapshot = BFSStateSnapshot;

export type AlgoState = {
    algorithm: AlgoType,
    startingNode: NodeID,
    states: StateSnapshot[]

} | undefined;