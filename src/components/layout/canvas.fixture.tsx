/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: canvas.fixture.tsx
 * DESCRIPTION: Define/Export the Canvas component. 
 * "fixture" added for Cosmos testing compatability.  
 * Display the collection of node and edge components. 
 * Also responsible for handling node/edge updates and deletes.
 */

import '../../index.css';

import { useState, useRef, useEffect } from 'react';

import { useGraphStore } from '../utils/graph.store';
import { DOMToSVGOnClick, SVGFromGAndSVG } from '../utils/dom-utils'; 
import Node from '../graph/node.fixture';
import { NodeID } from '../utils/node';
import Edge from '../graph/edge.fixture';
import { EdgeID } from '../utils/edge';

export const CANVASID = 'CanvasSVG';

const Canvas = () => {

    // Maintain graph state
    const graphComponents = useGraphStore(state => state.graphComponents);

    /**
     * TODO: Optimize drag and drop feature using caching and/or bounding boxes
     * Drag and drop state
     */
    const svgRef = useRef<SVGSVGElement>(null);
    const nodeRef = useRef<SVGGElement>(null);
    const edgeRef = useRef<SVGGElement>(null);
    const [ [ isDraggingNode, nodeID ], setIsDraggingNode ] = useState<[boolean, NodeID | undefined]>([false, undefined]);
    const [ [ isDraggingEdge, edgeID ], setIsDraggingEdge ] = useState<[boolean, NodeID | undefined]>([false, undefined]);
    const [ [ xDragOffsetNode, yDragOffsetNode ], setDragOffsetNode ] = useState<[number, number]>([0, 0]);
    const [ [ x1DragOffsetEdge, x2DragOffsetEdge, y1DragOffsetEdge, y2DragOffsetEdge ], setDragOffsetEdge ] = useState<[number, number, number, number]>([0, 0, 0, 0]);

    const [ svgCTM, setSVGCTM ] = useState<DOMMatrix | null>(null);
    const [ inverseSVGCTM, setInverseSVGCTM ] = useState<DOMMatrix | null>(null);

    const cacheCanvasCTM = () => {
        if(!svgRef.current) return;
        const ctm = svgRef.current.getScreenCTM();
        if(ctm === null) return;
        setSVGCTM(ctm);
        console.log("Cached canvas CTM");
    };

    useEffect(() => {
        if(!svgCTM) return;
        setInverseSVGCTM(svgCTM.inverse());
    }, [svgCTM]);

    useEffect(() => {
        cacheCanvasCTM();
        window.addEventListener('resize', cacheCanvasCTM);
        return () => {
            window.removeEventListener('resize', cacheCanvasCTM);
        }
    }, []);

    const updateNodePosition = (
        id: NodeID | undefined,
        cx: number, cy: number) => {
        useGraphStore.setState((state) => {
            const newNodes = state.graphComponents.nodes.map((node) => {
                if (node.id !== id) return node;
                return { ...node, cx: cx, cy: cy };
            });

            if (newNodes === state.graphComponents.nodes) {
                return state; // No change, prevent re-render
            }

            return {
                ...state,
                graphComponents: {
                    ...state.graphComponents,
                    nodes: newNodes,
                },
            };
        });
    };

    const updateEdgePosition = (
        id: EdgeID | undefined,
        x1: number, x2: number,
        y1: number, y2: number
    ) => {
        useGraphStore.setState((state) => {
            const newEdges = state.graphComponents.edges.map((edge) => {
                if (edge.id !== id) return edge;
                return { ...edge, x1: x1, x2: x2, y1: y1, y2: y2 };
            });

            if (newEdges === state.graphComponents.edges) {
                return state; // No change, prevent re-render
            }

            return {
                ...state,
                graphComponents: {
                    ...state.graphComponents,
                    edges: newEdges,
                },
            };
        });
    };

    /**
     * Reset all drag and drop state if something goes wrong  
     */
    const dragAndDropFailureCleanup = () => {
        if(isDraggingNode) {
            setIsDraggingNode([false, undefined]);
            setDragOffsetNode([0, 0]);
            nodeRef.current = null;
        } 
        if(isDraggingEdge) {
            setIsDraggingEdge([false, undefined]);
            setDragOffsetEdge([0, 0, 0, 0]);
            edgeRef.current = null
        }
    }

    /**
     * Case when user clicks on a node
     * @param e
     * @param id 
     * @returns 
     */
    const handleOnMouseDownNode = (e: React.MouseEvent<SVGGElement, MouseEvent>, id: NodeID | undefined) => {
        setIsDraggingNode([true, id]);
        setDragOffsetNode([0, 0]);
        nodeRef.current = e.currentTarget;
        const circleRef = nodeRef.current.querySelector('circle');
        if(circleRef === null) {
            dragAndDropFailureCleanup();
            return;
        }
        const tempCX = circleRef.getAttribute('cx');
        const tempCY = circleRef.getAttribute('cy');
        if(!tempCX || !tempCY || svgRef.current === null) {
            dragAndDropFailureCleanup();
            return;
        }
        const startingCX = parseFloat(tempCX);
        const startingCY = parseFloat(tempCY);

        const clickPointSVG = SVGFromGAndSVG(nodeRef.current, svgRef.current, e.clientX, e.clientY);
        if(!clickPointSVG) {
            return;
        }

        const dragOffsetX = clickPointSVG.x - startingCX;
        const dragOffsetY = clickPointSVG.y - startingCY;
        setDragOffsetNode([dragOffsetX, dragOffsetY]);
    }

    const throttleDelay = 16; // ~60 FPS (16ms per frame)
    const [lastEventTime, setLastEventTime] = useState(0);

    /**
     * Handle case when user moves a node
     * @param e 
     * @returns 
     */
    const handleOnMouseMoveNode = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isDraggingNode || nodeRef.current === null) return;

        const now = performance.now();
        if (now - lastEventTime < throttleDelay) {
            return;
        }
        setLastEventTime(now);
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateNodePosition(nodeID, x - xDragOffsetNode, y - yDragOffsetNode);
        // nodeRef.current.querySelector('circle')?.setAttribute('cx', `${x - xDragOffsetNode}`);
        // nodeRef.current.querySelector('circle')?.setAttribute('cy', `${y - yDragOffsetNode}`);

    }

    /**
     * Handle case when user releases a node
     * @param e 
     * @returns 
     */
    const handleOnMouseUpNode = (e: React.MouseEvent<SVGSVGElement>) => {
        if(!isDraggingNode) return;
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateNodePosition(nodeID, x - xDragOffsetNode, y - yDragOffsetNode);
        nodeRef.current = null;
        setIsDraggingNode([false, undefined]);
        setDragOffsetNode([0, 0]);
    }

    /**
     * Handle case when user clicks on an edge
     * @param e
     * @param id 
     * @returns 
     */
    const handleOnMouseDownEdge = (e: React.MouseEvent<SVGGElement, MouseEvent>, id: EdgeID | undefined) => {
        setIsDraggingEdge([true, id]);
        setDragOffsetEdge([0, 0, 0, 0]);
        edgeRef.current = e.currentTarget;

        const lineRef = edgeRef.current.querySelector('line');
        if(lineRef === null) {
            dragAndDropFailureCleanup();
            return;
        }

        const tempX1 = lineRef.getAttribute('x1');
        const tempX2 = lineRef.getAttribute('x2');
        const tempY1 = lineRef.getAttribute('y1');
        const tempY2 = lineRef.getAttribute('y2');

        if(!tempX1 || !tempX2 || !tempY1 || !tempY2 || svgRef.current === null) {
            dragAndDropFailureCleanup();
            return;
        }
        const startingX1 = parseFloat(tempX1);
        const startingX2 = parseFloat(tempX2);
        const startingY1 = parseFloat(tempY1);
        const startingY2 = parseFloat(tempY2);

        const clickPointSVG = SVGFromGAndSVG(edgeRef.current, svgRef.current, e.clientX, e.clientY);
        if(!clickPointSVG) {
            return;
        }

        const dragOffsetX1 = clickPointSVG.x - startingX1;
        const dragOffsetX2 = startingX2 - clickPointSVG.x;
        const dragOffsetY1 = clickPointSVG.y - startingY1;
        const dragOffsetY2 = startingY2 - clickPointSVG.y;
        setDragOffsetEdge([dragOffsetX1, dragOffsetX2, dragOffsetY1, dragOffsetY2]);
    }

    /**
     * Handle case when user moves an edge
     * @param e 
     * @returns 
     */
    const handleOnMouseMoveEdge = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isDraggingEdge || edgeRef.current === null) return;

        const now = performance.now();
        if (now - lastEventTime < throttleDelay) {
            return;
        }
        setLastEventTime(now);

        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateEdgePosition(
            edgeID, 
            x - x1DragOffsetEdge, 
            x + x2DragOffsetEdge,
            y - y1DragOffsetEdge,
            y + y2DragOffsetEdge
        );
    }

    /**
     * Handle case when user releases an edge
     * @param e
     * @returns 
     */
    const handleOnMouseUpEdge = (e: React.MouseEvent<SVGSVGElement>) => {
        if(!isDraggingEdge) return;
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateEdgePosition(
            edgeID, 
            x - x1DragOffsetEdge, 
            x + x2DragOffsetEdge,
            y - y1DragOffsetEdge,
            y + y2DragOffsetEdge
        );
        edgeRef.current = null;
        setIsDraggingEdge([false, undefined]);
        setDragOffsetEdge([0, 0, 0, 0]);
    }

    /**
     * END DRAG AND DROP FOR EDGES
     */

    return (
        <div className={`absolute h-dvh w-screen bg-[url('')] bg-no-repeat bg-cover bg-center bg-opacity-50`}
        >
            <svg
                width='100%'
                height='100%'
                viewBox = "0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
                fill="transparent"

                onMouseMove={(e) => {
                    if(isDraggingNode) handleOnMouseMoveNode(e);
                    if(isDraggingEdge) handleOnMouseMoveEdge(e);
                }}
                onMouseUp={(e) => {
                    if(isDraggingNode) handleOnMouseUpNode(e);
                    if(isDraggingEdge) handleOnMouseUpEdge(e);
                }}
                id={`${CANVASID}`}
                ref={svgRef}
                >
                {/* Render nodes */}
                {
                    graphComponents.nodes.map((node) => <Node 
                    key={node.id} 
                    id={node.id}
                    cx={node.cx} 
                    cy={node.cy} 
                    onMouseDown={(e) => handleOnMouseDownNode(e, node.id)}
                    />)
                }

                {/* Render edges */}
                {
                    graphComponents.edges.map((edge) => <Edge
                    type={edge.type}
                    key={edge.id}
                    cost={edge.cost}
                    x1={edge.x1}
                    x2={edge.x2}
                    y1={edge.y1}
                    y2={edge.y2}
                    isToolbar={false}
                    onMouseDown={(e) => handleOnMouseDownEdge(e, edge.id)}
                    />)
                }
            </svg>
        </div>
    );

}  

export default Canvas;

// const deleteEdge = (id: EdgeID) => {
    //     if(graphComponents.edges.length < 0) return;
    //     useGraphStore.setState(
    //         {
    //             adjacencyList: useGraphStore.getState().adjacencyList,
    //             graphComponents: {
    //                 nodes: graphComponents.nodes,
    //                 edges: graphComponents.edges.filter((edges) => edges.id !== id)
    //             }
    //         }
    //     );
    // }

    // const deleteNode = (id: NodeID) => {
    //     if(graphComponents.nodes.length < 0) return;
    //     useGraphStore.setState(
    //         {
    //             adjacencyList: useGraphStore.getState().adjacencyList,
    //             graphComponents: {
    //                 nodes: graphComponents.nodes.filter((nodeID: NodeID) => nodeID !== id),
    //                 edges: graphComponents.edges
    //             }
    //         }
    //     );
    // }