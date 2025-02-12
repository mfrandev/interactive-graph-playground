/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/10/2025
 * FILE: edge.fixture.tsx
 * DESCRIPTION: Define/Export the Edge component. 
 * "fixture" added for Cosmos testing compatability.
 * Programmatically proportion the SVG edge image.
 */

import '../../index.css';

import { ComponentType } from '../utils/graph.interfaces';
import { styleInfo, triangleStyleInfo } from '../utils/edge';

const BiDirectionalEdge = ({ cost=undefined, x1=0, y1=styleInfo.viewBoxSide, x2=styleInfo.viewBoxSide, y2=0, tailwindSize=10 }:
    { cost?: number, x1?: number, y1?: number, x2?: number, y2?: number, tailwindSize?: number }) => {

    // Calculate the centerpoint of the circle
    const circleCenter = styleInfo.viewBoxSide / 2;

    // Return a programmatically proportioned, in-line SVG edge component
    return (
        <div 
            className="size-15"
        >
            <svg width='100%' height='100%' viewBox={`0 0 ${styleInfo.viewBoxSide} ${styleInfo.viewBoxSide}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke-width={styleInfo.strokeWidth} stroke="black" />
                { cost && <circle cx={circleCenter} cy={circleCenter} r={`${styleInfo.fontSize*0.75}em`}
                stroke-width={styleInfo.strokeWidth} fill={styleInfo.fill} stroke={styleInfo.stroke}/> }
                { cost&& <text
                    x={circleCenter}
                    y={circleCenter + (0.125 * (styleInfo.viewBoxSide * styleInfo.fontSize))}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: `${styleInfo.fontSize}em`, fill: 'black' }}
                >
                    {cost}
                </text> }
            </svg>
        </div>);
    }

    const UniDirectionalEdge = ({ cost=undefined, x1=0, y1=15, x2=15, y2=0, tailwindSize=10 }:
        { cost?: number, x1?: number, y1?: number, x2?: number, y2?: number, tailwindSize?: number }) => {

        // Calculate the centerpoint of the circle
        const circleCenter = styleInfo.viewBoxSide / 2;
        // const circleCenterX = circleCenter + (x2 - x1) / 2;
        // const circleCenterY = circleCenter + (y2 - y1) / 2;
        const triangleOffset = triangleStyleInfo.sideLength * 0.2;

        let rot = 0;

        // Return a programmatically proportioned, in-line SVG edge component
        return (
        <div 
            className="size-15"
        >
            <svg width='100%' height='100%' viewBox={`0 0  ${styleInfo.viewBoxSide} ${styleInfo.viewBoxSide}`} xmlns="http://www.w3.org/2000/svg">
                <g transform={`rotate(${rot} ${x1} ${y1})`}>
                    <line x1={x1+(styleInfo.strokeWidth/2)} y1={y1 - (styleInfo.strokeWidth / 2)} x2={x2 - (styleInfo.strokeWidth / 2)-triangleOffset} y2={y2 + (styleInfo.strokeWidth/2) + triangleOffset} stroke-width={styleInfo.strokeWidth} stroke="black" />

                    <polygon points={`${x2-triangleStyleInfo.sideLength},${y2} ${x2},${y2} ${x2},${y2+triangleStyleInfo.sideLength}`} fill="black" />
                    { cost && <circle cx={circleCenter} cy={circleCenter} r={circleCenter/2.5}
                    stroke-width={styleInfo.strokeWidth} fill={styleInfo.fill} stroke={styleInfo.stroke}/> }
                    <g transform={`rotate(${-rot} ${circleCenter} ${circleCenter})`}>
                        { cost && <text
                            x={circleCenter}
                            y={circleCenter + styleInfo.fontSize * 1.5}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            style={{ fontSize: `${styleInfo.fontSize}em`, fill: 'black' }}
                        >
                            {cost}
                        </text> }
                    </g>
                </g>
            </svg>
        </div>
    );
}

/**
 * Edge component Factory Wrapper. Returns right kind of edge component based on prop. 
 * @param param0 
 * @returns 
 */
const EdgeWrapper = ({ edgeType = ComponentType.UNIDIRECTIONALEDGE }: { edgeType: ComponentType }) => {
    return (
        edgeType === ComponentType.UNIDIRECTIONALEDGE 
        ? <UniDirectionalEdge />
        : <BiDirectionalEdge />
    );
}

export default EdgeWrapper;