import { triangleStyleInfo } from '../utils/edge';
import { styleInfo as nodeStyleInfo } from  '../utils/node';
import { HighlighterKnob } from '../graph/highlighter';
import { ComponentType } from '../utils/graph.interfaces';



export const EdgeHighlighter = (
    {x1, x2, y1, y2, type}:
    {x1: number, x2: number, y1: number, y2: number, type: ComponentType}) => {
    return (
        <g>
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
            <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={x1}
                    cy={y1}
                />
            </g>

                <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={x2}
                    cy={y2}
                />
            </g>

            {
                type === ComponentType.UNIDIRECTIONALEDGE &&
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