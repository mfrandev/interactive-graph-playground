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

    const Edge = ({ 
            type = ComponentType.UNIDIRECTIONALEDGE,
            cost = undefined,
            x1, 
            y1,
            x2,
            y2,
            isToolbar = false,
            onMouseDown = undefined
        }:
        { 
            type: ComponentType,
            cost: number | undefined,
            x1: number,
            y1: number,
            x2: number,
            y2: number,
            isToolbar: boolean,
            onMouseDown?: React.MouseEventHandler<SVGGElement> | undefined
        }) => {

        // Calculate the centerpoint of the circle
        const circleCenter = styleInfo.viewBoxSide / 2;
        // const triangleOffset = triangleStyleInfo.sideLength * 0.2;

        // Return a programmatically proportioned, in-line SVG edge component
        return (
        <g
            className = { !isToolbar ? `hover:cursor-move` : '' }
            dominantBaseline='middle'
            onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => {
                if(onMouseDown === undefined) return;
                onMouseDown(e);
            }}
        >
            {/* Fix alignment for SVG arrow element */}
            <line 
                x1={x1} 
                y1={y1} 
                x2={x2} 
                y2={y2} 
                stroke-width={styleInfo.strokeWidth} 
                stroke="black" 
            />

            {
                type === ComponentType.UNIDIRECTIONALEDGE &&
                <polygon 
                    points = {`${x2-triangleStyleInfo.sideLength},${y2} ${x2},${y2} ${x2},${y2+triangleStyleInfo.sideLength}`} 
                    fill="black" 
                />
            }
            

            {/* Display the edge cost in-line, if defined */}
            { cost && <circle cx={circleCenter} cy={circleCenter} r={circleCenter/2.5}
            stroke-width={styleInfo.strokeWidth} fill={styleInfo.fill} stroke={styleInfo.stroke}/> }
            <g>
                { cost && <text
                    x={circleCenter}
                    y={circleCenter + styleInfo.fontSize * 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: `${styleInfo.fontSize}em`, fill: 'black' }}
                    className="select-none"
                >
                    {cost}
                </text> }
            </g>
        </g>
    );
}

export default Edge;