/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/10/2025
 * FILE: node.fixture.tsx
 * DESCRIPTION: Define/Export the Node component. 
 * "fixture" added for Cosmos testing compatability.
 * Programmatically proportion the SVG node image.
 */

import '../../index.css';

import { NodeID, styleInfo } from '../utils/node';

import React from 'react';

const Node = (
    { 
        id = undefined, 
        cx = undefined, 
        cy = undefined,
        onMouseDown = undefined
    }: 
    { 
        id?: NodeID | undefined, 
        cx?: number | undefined, 
        cy?: number | undefined, 
        onMouseDown?: React.MouseEventHandler<SVGGElement> | undefined
    }) => {

    // Calculate the centerpoint of the circle
    const circleCenter = styleInfo.viewBoxSide / 2;
    // const [bbox, setBbox] = React.useState<SVGRect | null>(null);
    const ref = React.useRef<SVGCircleElement>(null);

    // React.useEffect(() => {
    //     if (ref.current) {
    //         const box = ref.current.getBBox();
    //         setBbox(box);
    //     }
    // }, [id, cx, cy]);

    // Return a programmatically proportioned, in-line SVG node component
    return (
            <g
            className = { id !== undefined ? `hover:cursor-move` : '' }
            dominantBaseline='middle'
            onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => {
                if(onMouseDown === undefined) return;
                onMouseDown(e);
            }}
            >
                {/* {bbox && (
                    <rect
                        x={bbox.x}
                        y={bbox.y}
                        width={bbox.width}
                        height={bbox.height}
                        stroke="red"
                        fill="none"
                        strokeWidth="1"
                    />
                )} */}

                <circle 
                cx = { cx !== undefined ? cx : circleCenter } 
                cy = { cy !== undefined ? cy : circleCenter } 
                r={circleCenter - (styleInfo.strokeWidth / 2)} 
                stroke-width={styleInfo.strokeWidth} 
                fill={styleInfo.fill} 
                stroke={styleInfo.stroke}
                ref={ref}
                />
                <text
                    x={ cx !== undefined ? cx : circleCenter }
                    y={ (cy !== undefined ? cy : circleCenter) + styleInfo.fontSize * 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    font-size = {`${styleInfo.fontSize}em`}
                    fill = 'black'
                    className="select-none"
                >
                    {id}
                </text>
            </g>
    );
}

export default Node;