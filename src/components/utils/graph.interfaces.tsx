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

export type AdjacencyList = Map<NodeID, Set<EdgeID>>;

export interface ConnectedComponents {
    [nodes: NodeID]: [NodeID | undefined]
}

export enum ComponentType {
    NODE = 0,
    BIDIRECTIONALEDGE = 1,
    UNIDIRECTIONALEDGE = 2,
}

export const isEdge = (componentType: ComponentType) => {
    return componentType !== 0;
}