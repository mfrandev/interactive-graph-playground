import { styleInfo } from "../utils/node";

export class CollisionManager {
    cellSizeSVG: number;

    constructor() {
        this.cellSizeSVG = (styleInfo.radius - (styleInfo.strokeWidth / 2)) * 2;
    }

    getCellSize = () => {
        return this.cellSizeSVG;
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

    findCollisionCandidates = (cells1: Set<string>, cells2: Set<string>): Set<string> => {
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