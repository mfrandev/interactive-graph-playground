/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: node.tsx
 * DESCRIPTION: Define/Export the NodeID type.
 */

import { EdgeID } from './edge';


export type NodeID = number;

export interface NodeIF {
    cx: number, 
    cy: number,
    gridCells: Set<string>;
    connectedEdges: Set<EdgeID>
}

// Styling for easily adjustable node sizes
export const styleInfo = {
    viewBoxSide: 100,
    strokeWidth: 3,
    fill: "transparent",
    stroke: "black",
    fontSize: 3,
    circleCenter: 50, // viewBoxSide / 2
    radius: 48.5    // circleCenter - (strokeWidth / 2)
};

export const highlighterStyleInfo = {
    viewBoxSide: 10,
    strokeWidth: 1,
    fill: "red",
    stroke: "red",
    circleCenter: 5, // viewBoxSide / 2
    radius: 4.5    // circleCenter - (strokeWidth / 2)
};