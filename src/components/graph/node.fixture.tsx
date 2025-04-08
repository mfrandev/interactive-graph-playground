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
        onMouseDown = undefined,
        highlight = undefined
    }: 
    { 
        id?: NodeID | undefined, 
        cx?: number | undefined, 
        cy?: number | undefined, 
        onMouseDown?: React.MouseEventHandler<SVGGElement> | undefined,
        highlight?: string | undefined
    }) => {
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
                <circle 
                cx = { cx !== undefined ? cx : styleInfo.circleCenter } 
                cy = { cy !== undefined ? cy : styleInfo.circleCenter } 
                r={styleInfo.radius} 
                strokeWidth={styleInfo.strokeWidth} 
                // fill={styleInfo.fill} 
                // style={{fill: highlight}}
                stroke={styleInfo.stroke}
                className={highlight}
                />
                <text
                    x={ cx !== undefined ? cx : styleInfo.circleCenter }
                    y={ (cy !== undefined ? cy : styleInfo.circleCenter) + styleInfo.fontSize * 1.5}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize = {`${styleInfo.fontSize}em`}
                    fill = 'black'
                    className="select-none"
                >
                    {id}
                </text>
            </g>
    );
}

export default Node;