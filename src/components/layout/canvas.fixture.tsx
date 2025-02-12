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

import { useState, useRef } from 'react';

import { useGraphStore } from '../utils/graph.store';
import { DOMToSVGOnClick, SVGFromGAndSVG } from '../utils/dom-utils'; 
import Node from '../graph/node.fixture';
import { NodeID } from '../utils/node';

export const CANVASID = 'CanvasSVG';

const Canvas = () => {

    const graphComponents = useGraphStore(state => state.graphComponents);

    /**
     * START DRAG AND DROP FOR NODES
     */

    const updateNodePosition = (id: NodeID | undefined, cx: number, cy: number) => {
        useGraphStore.setState(
            {
                adjacencyList: useGraphStore.getState().adjacencyList,
                graphComponents: {
                    edges: graphComponents.edges,
                    nodes: graphComponents.nodes.map((node) => {
                        if(node.id !== id) return node;
                        return { ...node, cx: cx, cy: cy };
                    }),
                }
            }
        );
    }

    // Use this for calculating various drag and drop state
    const [ [ isDragging, nodeID ], setIsDragging ] = useState<[boolean, NodeID | undefined]>([false, undefined]);
    const [ [ xDragOffset, yDragOffset ], setDragOffset ] = useState<[number, number]>([0, 0]);

    // References for a give node, edge
    const circleRef = useRef<SVGCircleElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    const dragAndDropFailureCleanup = () => {
        console.error("Something went wrong, resetting drag and drop state");
        // document.removeEventListener("mouseup", handleOnMouseUp);
        setIsDragging([false, undefined]);
        setDragOffset([0, 0]);
        circleRef.current = null;
    }
    

    const handleOnMouseDown = (e: React.MouseEvent<SVGCircleElement, MouseEvent>, id: NodeID | undefined) => {
        setIsDragging([true, id]);
        setDragOffset([0, 0])
        // document.addEventListener("mouseup", handleOnMouseUp);
        console.log("mouse is down");
        circleRef.current = e.currentTarget;
        const tempCX = circleRef.current.getAttribute('cx');
        const tempCY = circleRef.current.getAttribute('cy');
        if(!tempCX || !tempCY || svgRef.current === null) {
            dragAndDropFailureCleanup();
            return;
        }
        const startingCX = parseFloat(tempCX);
        const startingCY = parseFloat(tempCY);

        const clickPointSVG = SVGFromGAndSVG(circleRef.current, svgRef.current, e.clientX, e.clientY);
        if(!clickPointSVG) {
            return;
        }

        const dragOffsetX = clickPointSVG.x - startingCX;
        const dragOffsetY = clickPointSVG.y - startingCY;
        setDragOffset([dragOffsetX, dragOffsetY]);
    }

    const handleOnMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isDragging || circleRef.current === null) return;
        console.log(`Drag on node ${nodeID} in progress!`);
        const result = DOMToSVGOnClick(e);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateNodePosition(nodeID, x - xDragOffset, y - yDragOffset);

    }

    const handleOnMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        if(!isDragging) return;
        console.log("mouse released");
        const result = DOMToSVGOnClick(e);
        if(!result) {
            dragAndDropFailureCleanup();
            return;
        }
        const [x, y] = result;
        updateNodePosition(nodeID, x - xDragOffset, y - yDragOffset);
        circleRef.current = null;
        setIsDragging([false, undefined]);
        setDragOffset([0, 0]);
        // Remove global event listeners
        // document.removeEventListener("mouseup", handleOnMouseUp);
    }

    /**
     * END DRAG AND DROP FOR NODES
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
                onMouseMove={handleOnMouseMove}
                onMouseUp={handleOnMouseUp}
                id={`${CANVASID}`}
                ref={svgRef}
                >
                {graphComponents.nodes.map((node) => <Node 
                cx={node.cx} 
                cy={node.cy} 
                key={node.id} 
                id={node.id}
                onMouseDown={(e) => handleOnMouseDown(e, node.id)}
                />)}
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