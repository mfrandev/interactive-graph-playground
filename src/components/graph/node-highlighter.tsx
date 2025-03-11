import { styleInfo as nodeStyleInfo } from  '../utils/node';
import { HighlighterKnob } from '../graph/highlighter';

export const NodeHighlighter = ({ cx, cy }: { cx: number, cy: number }) => {   
    return (
        <g>
            <rect
                height = { nodeStyleInfo.radius * 2 }
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
            <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={ cx - nodeStyleInfo.radius }
                    cy={ cy - nodeStyleInfo.radius }
                />
            </g>
            
            <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={ cx + nodeStyleInfo.radius }
                    cy={ cy - nodeStyleInfo.radius }
                />
            </g>

            <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={ cx - nodeStyleInfo.radius }
                    cy={ cy + nodeStyleInfo.radius }
                />
            </g>
            
            <g  
                className="hover:cursor-grab"
            >
                <HighlighterKnob
                    cx={ cx + nodeStyleInfo.radius }
                    cy={ cy + nodeStyleInfo.radius }
                />
            </g>
            
        </g>
    )
}