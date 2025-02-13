/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: edge.tsx
 * DESCRIPTION: Define/Export the EdgeID type and Edge interface. 
 * UPDATES: 
 * 2/12/2025: Added 'type' to EdgeIF to allow for edge type differentiation.
 */

export type EdgeID = number;
import { ComponentType } from './graph.interfaces';

// Isolated edges with assigned cost is valid case
export default interface EdgeIF {
    id: EdgeID,
    to: number | undefined,
    from: number | undefined,
    cost: number | undefined,
    type: ComponentType, // Uni or Bi direction edge
    x1: number,
    x2: number,
    y1: number,
    y2: number
}

// Styling for the center circle allowing visible edge cost
export const styleInfo = {
    viewBoxSide: 100,
    strokeWidth: 3,
    fill: "red",
    stroke: "transparent",
    fontSize: 3
};

export const triangleStyleInfo = {
    sideLength: 17.5,
    hypotenuseLength: 24.7487
};