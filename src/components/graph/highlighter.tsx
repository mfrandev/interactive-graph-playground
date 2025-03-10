import '../../index.css';
import { ComponentType, isEdge } from '../utils/graph.interfaces';
import { highlighterStyleInfo } from  '../utils/node';
import { NodeHighlighter } from './node-highlighter';
import { EdgeHighlighter } from './edge-highlighter';

export const HighlighterKnob = ({ cx, cy }: { cx: number, cy: number }) => {
    return (
        <circle
            cx={ cx }
            cy={ cy }
            r={ highlighterStyleInfo.radius }
            stroke="red"
            fill="red"
            fillOpacity={0.4}
            strokeWidth={highlighterStyleInfo.strokeWidth}
        />
    )
}

export const Highlighter = (
    {
        isActive, 
        type,
        cx,
        cy,
        x1,
        x2,
        y1,
        y2,
        onMouseDown = undefined,
        onMouseDownX1Y1 = undefined,
        onMouseDownX2Y2 = undefined
    }:
    {
        isActive: boolean,
        type: ComponentType
        cx?: number,
        cy?: number,
        x1?: number, 
        x2?: number,
        y1?: number,
        y2?: number,
        onMouseDown?: React.MouseEventHandler<SVGGElement> | undefined,
        onMouseDownX1Y1?: React.MouseEventHandler<SVGGElement> | undefined, 
        onMouseDownX2Y2?: React.MouseEventHandler<SVGGElement> | undefined
    }
) => {



    return (
        <g
            className = { isActive && onMouseDown !== undefined ? `hover:cursor-move` : '' }
            dominantBaseline='middle'
            onMouseDown={(e: React.MouseEvent<SVGGElement, MouseEvent>) => {
                if(onMouseDown === undefined) return;
                onMouseDown(e);
            }}
        >
            
            { 
                isActive && isEdge(type) && 
                x1 !== undefined && x2 !== undefined &&
                y1 !== undefined && y2 !== undefined &&
                <EdgeHighlighter
                    x1 = { x1 }
                    x2 = { x2 }
                    y1 = { y1 }
                    y2 = { y2 }
                    type = { type }
                    onMouseDownX1Y1 = { onMouseDownX1Y1 }
                    onMouseDownX2Y2 = { onMouseDownX2Y2 }
                />
            }

            { 
                isActive && type === ComponentType.NODE && 
                cx !== undefined && cy !== undefined &&
                <NodeHighlighter
                    cx = { cx }
                    cy = { cy }
                />
            }
            
        </g>
    )
}

export default Highlighter;