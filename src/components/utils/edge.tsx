/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: edge.tsx
 * DESCRIPTION: Define/Export the EdgeID type and Edge interface. 
 */

export type EdgeID = number;

// Isolated edges with assigned cost is valid case
export default interface EdgeIF {
    id: EdgeID,
    to: number | undefined,
    from: number | undefined,
    cost: number | undefined
}

// Styling for the center circle allowing visible edge cost
export const styleInfo = {
    viewBoxSide: 15,
    strokeWidth: 0.5,
    fill: "red",
    stroke: "transparent",
    fontSize: 0.25
};

export const triangleStyleInfo = {
    sideLength: 2.5,
    hypotenuseLength: 3.5355
};