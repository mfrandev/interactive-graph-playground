/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: edge.tsx
 * DESCRIPTION: Define/Export the EdgeID type and Edge interface. 
 * UPDATES: 
 * 2/12/2025: Added 'type' to EdgeIF to allow for edge type differentiation.
 */

import { ComponentType } from './graph.interfaces';
import { NodeID } from './node';

export type EdgeID = number;

// Isolated edges with assigned cost is valid case
export interface EdgeIF {
    to: NodeID | undefined,
    from: NodeID | undefined,
    cost: number | undefined,
    type: ComponentType, // Uni or Bi direction edge
    x1: number,
    x2: number,
    y1: number,
    y2: number,
    x1y1GridCell: string, 
    x2y2GridCell: string
}

// Styling for the center circle allowing visible edge cost
export const styleInfo = {
    fill: "red",
    stroke: "transparent",
};

export const triangleStyleInfo = {
    sideLength: 17.5,
    hypotenuseLength: 24.7487
};