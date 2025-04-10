/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: graph.interfaces.tsx
 * DESCRIPTION: Define/Export GraphComponents, AdjacencyList,
 * and ConnectedComponents interfaces. 
*/

import { NodeID, NodeIF } from './node';
import { EdgeID, EdgeIF } from './edge';

export interface GraphComponents {
    nodes: Map<NodeID, NodeIF>,
    edges: Map<EdgeID, EdgeIF>
}

export type AdjacencyList = Map<NodeID, Set<NodeID>>;

export interface ConnectedComponents {
    [nodes: NodeID]: [NodeID | undefined]
}

export enum ComponentType {
    NONE = -1,
    NODE = 0,
    BIDIRECTIONALEDGE = 1,
    UNIDIRECTIONALEDGE = 2,
}

export const isEdge = (componentType: ComponentType) => {
    return componentType !== 0;
}

export interface GraphHighlightState {
    currentNode: number,
    visitingNodes: Set<number>,
    visitedNodes: Set<number>
};

export const TRAVERSAL_COMPLETE = -2;