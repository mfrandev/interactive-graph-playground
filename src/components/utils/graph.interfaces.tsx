/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: graph.interfaces.tsx
 * DESCRIPTION: Define/Export GraphComponents, AdjacencyList,
 * and ConnectedComponents interfaces. 
*/

import { NodeID, NodeIF } from './node';
import EdgeIF from './edge';

export interface GraphComponents {
    nodes: NodeIF[],
    edges: EdgeIF[]
}

export interface AdjacencyList {
    [key: NodeID]: Set<EdgeIF>
}

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