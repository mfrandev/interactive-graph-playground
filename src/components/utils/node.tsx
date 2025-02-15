/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: node.tsx
 * DESCRIPTION: Define/Export the NodeID type.
 */


export type NodeID = number;

export interface NodeIF {
    id: NodeID,
    cx: number, 
    cy: number
}

// Styling for easily adjustable node sizes
export const styleInfo = {
    viewBoxSide: 100,
    strokeWidth: 3,
    fill: "transparent",
    stroke: "black",
    fontSize: 3,
    // highlight: 'outline-blue-400/80 outline-dashed'
};