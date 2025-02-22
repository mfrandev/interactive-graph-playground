import '../../index.css';
import { ComponentType, isEdge } from '../utils/graph.interfaces';
import { triangleStyleInfo } from '../utils/edge';
import { styleInfo as nodeStyleInfo, highlighterStyleInfo } from  '../utils/node';

const HighlighterKnob = ({ cx, cy }: { cx: number, cy: number }) => {
    return (<circle
        cx={ cx }
        cy={ cy }
        r={ highlighterStyleInfo.radius }
        stroke="red"
        fill="red"
        fillOpacity={0.4}
        strokeWidth={highlighterStyleInfo.strokeWidth}
    />)
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
        onMouseDown = undefined
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
        onMouseDown?: React.MouseEventHandler<SVGGElement> | undefined
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
            {/* Node highlight */}
            { 
                isActive && type === ComponentType.NODE 
                && cx !== undefined && cy !== undefined &&
                <rect
                    height= { nodeStyleInfo.radius * 2 }
                    width = { nodeStyleInfo.radius * 2 }
                    x = { cx - nodeStyleInfo.radius }
                    y = { cy - nodeStyleInfo.radius }
                    strokeWidth={nodeStyleInfo.strokeWidth}
                    stroke="red"
                    strokeDasharray="2,6"
                    strokeLinecap="round"
                    fill="transparent"
                    strokeOpacity={0.4}
                />

                
            }


            {
                isActive && type === ComponentType.NODE 
                && cx !== undefined && cy !== undefined &&
                <HighlighterKnob
                    cx={ cx - nodeStyleInfo.radius }
                    cy={ cy - nodeStyleInfo.radius }
                />
            }

            {
                isActive && type === ComponentType.NODE 
                && cx !== undefined && cy !== undefined &&
                <HighlighterKnob
                    cx={ cx + nodeStyleInfo.radius }
                    cy={ cy - nodeStyleInfo.radius }
                />
            }

            {
                isActive && type === ComponentType.NODE 
                && cx !== undefined && cy !== undefined &&
                <HighlighterKnob
                    cx={ cx - nodeStyleInfo.radius }
                    cy={ cy + nodeStyleInfo.radius }
                />
            }

            {
                isActive && type === ComponentType.NODE 
                && cx !== undefined && cy !== undefined &&
                <HighlighterKnob
                    cx={ cx + nodeStyleInfo.radius }
                    cy={ cy + nodeStyleInfo.radius }
                />
            }

            {/* Edge highlight */}
            { 
                isActive && isEdge(type) && 
                x1 !== undefined && x2 !== undefined &&
                y1 !== undefined && y2 !== undefined &&
                <line
                    x1={x1}
                    x2={x2}
                    y1={y1}
                    y2={y2}
                    strokeWidth={nodeStyleInfo.strokeWidth}
                    stroke="red"
                    strokeDasharray="2,6"
                    strokeLinecap="round"
                    strokeOpacity={0.4}
                />
            }
            
            {
                isActive && isEdge(type) &&
                x1 !== undefined && y1 !== undefined &&
                <HighlighterKnob
                    cx={x1}
                    cy={y1}
                />
            }

            {
                isActive && isEdge(type) &&
                x2 !== undefined && y2 !== undefined &&
                <HighlighterKnob
                    cx={x2}
                    cy={y2}
                />
            }
            
            {
                isActive && type === ComponentType.UNIDIRECTIONALEDGE
                && x2 !== undefined && y2 !== undefined &&
                <polygon 
                    points = {`${x2-triangleStyleInfo.sideLength},${y2} ${x2},${y2} ${x2},${y2+triangleStyleInfo.sideLength}`} 
                    stroke="red"
                    strokeDasharray="2,6"
                    strokeLinecap="round"
                    strokeOpacity={0.4}
                />
            }
        </g>
    )
}

export default Highlighter;