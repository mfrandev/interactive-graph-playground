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
import { styleInfo as costStyleInfo, triangleStyleInfo } from '../utils/edge';
import { styleInfo as nodeStyleInfo } from  '../utils/node';

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
                strokeWidth={nodeStyleInfo.strokeWidth} 
                stroke="black" 
                strokeLinecap="round"
            />

            {
                type === ComponentType.UNIDIRECTIONALEDGE &&
                <polygon 
                    points = {`${x2},${y2} ${x2-triangleStyleInfo.sideLength},${y2+triangleStyleInfo.sideLength} ${x2+triangleStyleInfo.sideLength},${y2+triangleStyleInfo.sideLength}`} 
                    fill="black" 
                    transform={`rotate(${((Math.atan2(y2 - y1, x2 - x1) + Math.PI/2) * 180) / Math.PI}, ${x2}, ${y2})`}
                />
            }
            

            {/* Display the edge cost in-line, if defined */}
            { cost && <circle cx={nodeStyleInfo.circleCenter} cy={nodeStyleInfo.circleCenter} r={nodeStyleInfo.radius}
            stroke-width={nodeStyleInfo.strokeWidth} fill={costStyleInfo.fill} stroke={costStyleInfo.stroke}/> }
            <g>
                { cost && <text
                    x={nodeStyleInfo.circleCenter}
                    y={nodeStyleInfo.circleCenter + nodeStyleInfo.fontSize * 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: `${nodeStyleInfo.fontSize}em`, fill: 'black' }}
                    className="select-none"
                >
                    {cost}
                </text> }
            </g>
        </g>
    );
}

export default Edge;