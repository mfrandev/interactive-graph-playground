import { styleInfo, NodeID } from './node';
import { EdgeID } from './edge';


export class CollisionManager {
    cellSizeSVG: number;
    nodeGrid: Map<string, Set<NodeID>> = new Map();
    edgeGrid: Map<string, Set<EdgeID>> = new Map();

    constructor() {
        this.cellSizeSVG = (styleInfo.radius - (styleInfo.strokeWidth / 2)) * 2;
    }

    getCellSize = () => {
        return this.cellSizeSVG;
    }

    addToNodeGrid = (coords: Set<string>, nodeID: NodeID) => {
        for(const coord of coords) {
            if(this.nodeGrid.has(coord))
                this.nodeGrid.get(coord)?.add(nodeID);
            else
                this.nodeGrid.set(coord, new Set([nodeID]));
        }
    }

    addVertexToEdgeGrid = (coord: string, edgeID: EdgeID) => {
        if(this.edgeGrid.has(coord))
            this.edgeGrid.get(coord)?.add(edgeID);
        else
            this.edgeGrid.set(coord, new Set([edgeID]));
    }

    addEdgeToEdgeGrid = (x1: number, x2: number, y1: number, y2: number, id: number) => {
        this.addVertexToEdgeGrid(this.getCellWithSVGCoords(x1, y1), id);
        this.addVertexToEdgeGrid(this.getCellWithSVGCoords(x2, y2), id);
    }

    deleteFromNodeGrid = (coord: string, nodeID: NodeID) => {
        if(this.nodeGrid.has(coord))
            this.nodeGrid.get(coord)?.delete(nodeID);
    }

    deleteFromEdgeGrid = (coord: string, edgeID: EdgeID) => {
        if(this.edgeGrid.has(coord))
            this.edgeGrid.get(coord)?.delete(edgeID);
    }

    getNodesInNodeGrid = (coord: string): Set<NodeID> | undefined => {
        return this.nodeGrid.get(coord);
    }

    getEdgesInEdgeGrid = (coord: string): Set<EdgeID> | undefined => {
        return this.edgeGrid.get(coord);
    }

    moveNodeInNodeGrid = (oldCoords: Set<string>, newCoords: Set<string>, nodeID: NodeID) => {

        // If node is no longer in a cell, destroy the mapping of its ID to that cell
        for(const cell of oldCoords) {
            if(!newCoords.has(cell)) 
                this.deleteFromNodeGrid(cell, nodeID);
        }

        // If node is now in a new cell, create a mapping of its ID to that cell
        this.addToNodeGrid(newCoords, nodeID);
    }

    moveEdgeInEdgeGrid = (
        oldX1Y1: string, oldX2Y2: string, newX1Y1: string, newX2Y2: string,
        edgeID: EdgeID) => {

        this.deleteFromEdgeGrid(oldX1Y1, edgeID);
        this.addVertexToEdgeGrid(newX1Y1, edgeID);

        this.deleteFromEdgeGrid(oldX2Y2, edgeID);
        this.addVertexToEdgeGrid(newX2Y2, edgeID);
    }

    getCellWithSVGCoords = (xSVG: number, ySVG: number): string => {
        return (`${Math.floor(xSVG / this.cellSizeSVG)},${Math.floor(ySVG / this.cellSizeSVG)}`);
    }

    getCellsInCircle = (xSVGCenter: number, ySVGCenter: number): Set<string> => {
        const cells = new Set<string>();
        const radius = styleInfo.radius;

        cells.add(this.getCellWithSVGCoords(xSVGCenter + radius, ySVGCenter));
        cells.add(this.getCellWithSVGCoords(xSVGCenter - radius, ySVGCenter));
        cells.add(this.getCellWithSVGCoords(xSVGCenter, ySVGCenter + radius));
        cells.add(this.getCellWithSVGCoords(xSVGCenter, ySVGCenter - radius));

        // console.log(cells);

        return cells;
    }   

    getCellsAtVertices = (x1SVG: number, x2SVG: number, y1SVG: number, y2SVG: number): Set<string> => {
        const cells = new Set<string>();

        cells.add(this.getCellWithSVGCoords(x1SVG, y1SVG));
        cells.add(this.getCellWithSVGCoords(x2SVG, y2SVG));

        // console.log(cells);

        return cells;
    }

    findSetIntersection = (cells1: Set<string>, cells2: Set<string>): Set<string> => {
        const intersection = new Set<string>();
        for(const cell of cells1) {
            if(cells2.has(cell))
                intersection.add(cell);
        }
        return intersection;
    }

    findCollisionsBetweenEdgeAndNode = (
        x1SVG: number,  
        y1SVG: number,  
        cx: number, 
        cy: number
    ): boolean => {
        const t1 = (x1SVG - cx) * (x1SVG - cx);
        const t2 = (y1SVG - cy) * (y1SVG - cy);
        const t3 = styleInfo.radius * styleInfo.radius;
        return t1 + t2 <= t3;
    }

    findCollisionsBetweenEdgeAndNodeTemp = (
        x1SVG: number,  
        x2SVG: number,
        y1SVG: number, 
        y2SVG: number, 
        cx: number, 
        cy: number
    ): boolean => {
        return this.findCollisionsBetweenEdgeAndNode(x1SVG, y1SVG, cx, cy) || this.findCollisionsBetweenEdgeAndNode(x2SVG, y2SVG, cx, cy);
    }

}