import { triangleStyleInfo } from '../utils/edge';
import { styleInfo as nodeStyleInfo } from  '../utils/node';
import { HighlighterKnob } from '../graph/highlighter';
import { ComponentType } from '../utils/graph.interfaces';

export const EdgeHighlighter = (
    {x1, x2, y1, y2, type, onMouseDownX1Y1, onMouseDownX2Y2}:
    {x1: number, x2: number, y1: number, y2: number, type: ComponentType, onMouseDownX1Y1?: React.MouseEventHandler<SVGGElement>, onMouseDownX2Y2?: React.MouseEventHandler<SVGGElement>}) => {
    
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

                {/* We only want this to render if this highlight is not used to represent repositioning */}
                {   onMouseDownX1Y1 !== undefined &&
                    <g  
                    className="hover:cursor-grab"
                    onMouseDown={e => onMouseDownX1Y1(e)}
                    >
                        <HighlighterKnob
                            cx={x1}
                            cy={y1}
                        />
                    </g>
                }

                {/* We only want this to render if this highlight is not used to represent repositioning */}
                {   onMouseDownX2Y2 !== undefined && 
                    <g  
                    className="hover:cursor-grab"
                    onMouseDown={e => onMouseDownX2Y2(e)}
                    >
                            <HighlighterKnob
                                cx={x2}
                                cy={y2}
                            />
                    </g>
                }

                {
                    type === ComponentType.UNIDIRECTIONALEDGE &&
                    <polygon 
                        points = {`${x2},${y2} ${x2-triangleStyleInfo.sideLength},${y2+triangleStyleInfo.sideLength} ${x2+triangleStyleInfo.sideLength},${y2+triangleStyleInfo.sideLength}`}                         stroke="red"
                        strokeDasharray="2,6"
                        strokeLinecap="round"
                        strokeOpacity={0.4}
                        transform={`rotate(${((Math.atan2(y2 - y1, x2 - x1) + Math.PI/2) * 180) / Math.PI}, ${x2}, ${y2})`}
                    />
                }
                
            </g>
        )
}