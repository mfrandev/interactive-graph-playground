/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/10/2025
 * FILE: edge.fixture.tsx
 * DESCRIPTION: Define/Export the Edge component. 
 * "fixture" added for Cosmos testing compatability.
 * Programmatically proportion the SVG edge image.
 */

import '../../index.css';

import { useState, useRef, useEffect } from 'react';

import { ComponentType } from '../utils/graph.interfaces';
import { styleInfo as costStyleInfo, triangleStyleInfo } from '../utils/edge';
import { styleInfo as nodeStyleInfo } from  '../utils/node';
import { BACKSPACE, DELETE } from '../layout/canvas.fixture';

    const Edge = ({ 
            type = ComponentType.UNIDIRECTIONALEDGE,
            cost = undefined,
            x1, 
            y1,
            x2,
            y2,
            isToolbar = false,
            onMouseDown = undefined,
            updateEdgeCost = undefined
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
            updateEdgeCost?: (edgeCost: number | undefined) => void | undefined
        }) => {

            const [ isEditingCost, setIsEditingCost ] = useState<boolean>(false);
            const inputRef = useRef<HTMLInputElement>(null);
            const circleRef = useRef<SVGCircleElement>(null);

            // If the user double clicked the edge, the inputRef becomes defined and should be auto-focused
            useEffect(() => {
                if(isEditingCost && inputRef !== null && inputRef.current !== null && circleRef !== null && circleRef.current !== null) {
                    inputRef.current.focus();
                    console.log("Focusing");
                }
            }, [isEditingCost, inputRef]);

        // Return a programmatically proportioned, in-line SVG edge component
        return (
        <g
            className = { !isToolbar ? `hover:cursor-move` : '' }
            dominantBaseline='middle'
            onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => {
                if(onMouseDown === undefined) return;
                onMouseDown(e);
            }}
            onDoubleClick={() => {
                if(isEditingCost) return;
                setIsEditingCost(true);
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
            

            <g>
                {/* Display the edge cost in-line, if defined */}
                { updateEdgeCost !== undefined && (cost !== undefined || isEditingCost) && 
                <circle ref={circleRef} cx={x1 + (x2 - x1) / 2} cy={y1 + (y2 - y1) / 2} r={nodeStyleInfo.radius / 2}
                strokeWidth={nodeStyleInfo.strokeWidth} fill={isEditingCost ? costStyleInfo.focusFill : costStyleInfo.fill} stroke={costStyleInfo.stroke}/>}
                {/* Display the edge's traversal cost */}
                { cost !== undefined && !isEditingCost && <text
                    x={x1 + (x2 - x1) / 2}
                    y={y1 + (y2 - y1) / 2 + nodeStyleInfo.fontSize}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontSize: `${nodeStyleInfo.fontSize/2}em`, fill: 'black' }}
                    className="select-none"
                >
                    {cost}
                </text> }

                {/* Set the edge's traveral cost */}
                {
                    updateEdgeCost !== undefined &&
                    isEditingCost && 
                    <foreignObject x={x1 + (x2-x1)/2 - nodeStyleInfo.radius/2} y={y1 + (y2-y1)/2 - nodeStyleInfo.radius/2} width={nodeStyleInfo.radius} height={nodeStyleInfo.radius}>
                        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <form 
                        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                            e.preventDefault();
                            setIsEditingCost(false);
                            if(!(e.target instanceof HTMLFormElement)) {
                                setIsEditingCost(false);
                                cost = undefined;
                                updateEdgeCost(cost);
                                inputRef.current = null
                                return;
                            }
                            if(!("cost" in e.target)) {
                                setIsEditingCost(false);
                                cost = undefined;
                                updateEdgeCost(cost);
                                inputRef.current = null
                                return;
                            }
                            const newCost = parseInt((e.target.cost as HTMLInputElement).value);
                            if(isNaN(newCost)) {
                                setIsEditingCost(false);
                                cost = undefined;
                                updateEdgeCost(cost);
                                inputRef.current = null
                                return;
                            }
                            cost = newCost;
                            updateEdgeCost(cost);
                            setIsEditingCost(false);
                            inputRef.current = null;

                        }}>
                            <input
                                ref={inputRef}
                                type="text"
                                name="cost"
                                defaultValue={cost !== undefined ? cost.toString() : ''}
                                onKeyDown={(e) => {
                                    if(e.key === BACKSPACE || e.key === DELETE) e.stopPropagation();
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: '50%',
                                    textAlign: 'center',
                                    fontSize: `${nodeStyleInfo.fontSize/2}em`,
                                    border: `${nodeStyleInfo.strokeWidth}px solid ${costStyleInfo.stroke}`,
                                    background: "transparent",
                                    color: 'black',
                                    padding: '0px',
                                    outline: 'none'
                                }}
                            />
                        </form>
                        </div>
                    </foreignObject>
                }
            </g>
        </g>
    );
}

export default Edge;