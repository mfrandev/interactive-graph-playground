/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: graph.store.tsx
 * DESCRIPTION: Define the GraphStore interface 
 * and export the Zustand-powered `useGraphStore` hook. 
 */

import { 
    GraphComponents, 
    AdjacencyList
} from './graph.interfaces';

import { create } from 'zustand';
import { NodeID, NodeIF } from './node';
import { EdgeID, EdgeIF } from './edge';
import { CollisionManager } from './collision-manager';

/**
 * Hook for accessing the underlying graph data
 */
interface GraphStore {
    graphComponents: GraphComponents,
};

export const useGraphStore = create<GraphStore>(() => ({
    graphComponents: {
        nodes: new Map<NodeID, NodeIF>(),
        edges: new Map<EdgeID, EdgeIF>()
    }
}));

export const useAdjacencyList = create<AdjacencyList>(() => (
    new Map<NodeID, Set<NodeID>>()
));

export const useCollisionManager = create<CollisionManager>(() => (
    new CollisionManager()
));