/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/11/2025
 * FILE: dom-utils.fixture.tsx
 * DESCRIPTION: Define/Export the "DOMToSVG" function. 
 * Takea a set of DOM coordinates, recieved on-click and converts them into SVG coordinates.
 */

export const DOMToSVGOnClick = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = event.currentTarget;
    const ctm = svg.getScreenCTM();
    if (ctm) {
        const inverseCTM = ctm.inverse();
        const point = svg.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const transformedPoint = point.matrixTransform(inverseCTM);
        return [transformedPoint.x, transformedPoint.y];
    }
}

export const DOMToSVG = (xDOM: number, yDOM: number, svg: SVGSVGElement) => {
    const ctm = svg.getScreenCTM();
    if (ctm) {
        const inverseCTM = ctm.inverse();
        const point = svg.createSVGPoint();
        point.x = xDOM;
        point.y = yDOM;
        const transformedPoint = point.matrixTransform(inverseCTM);
        return [transformedPoint.x, transformedPoint.y];
    }
}

export const SVGFromGAndSVG = (g: SVGGElement, svg: SVGSVGElement, x: number, y: number) => {
    // Get the current transformation matrix of the <g> element
    const gMatrix = g.getScreenCTM();

    // Create an SVG point for the mouse position
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;

    // Transform the mouse position into the <g>'s parent coordinate system
    return point.matrixTransform(gMatrix!.inverse());
}