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

import { useGraphStore, useCollisionManager, useAdjacencyList } from '../utils/graph.store';
import { DOMToSVGOnClick, SVGFromGAndSVG } from '../utils/dom-utils'; 
import Node from '../graph/node.fixture';
import { NodeID, NodeIF } from '../utils/node';
import Edge from '../graph/edge.fixture';
import { EdgeID, EdgeIF } from '../utils/edge';
import { ComponentType } from '../utils/graph.interfaces';

export const CANVASID = 'CanvasSVG';

const Canvas = () => {

    // Maintain graph state
    const graphComponents = useGraphStore(state => state.graphComponents);
    let adjacencyList = useAdjacencyList(state => state);
    let collisionManager = useCollisionManager(state => state);

    /**
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
    
    const resizeEventHandler = () => {
        cacheCanvasCTM();
        // Space reserved for future updates
    }

    useEffect(() => {
        if(!svgCTM) return;
        setInverseSVGCTM(svgCTM.inverse());
    }, [svgCTM]);

    useEffect(() => {
        resizeEventHandler();
        // Update the canvas collision manager here
        window.addEventListener('resize', resizeEventHandler);
        return () => {
            window.removeEventListener('resize', resizeEventHandler);
        }
    }, []);

    const updateAdjacencyListDisconnections = (from: NodeID | undefined, to: NodeID | undefined, type: ComponentType) => {
        if(from !== undefined && to !== undefined) {
            adjacencyList = useAdjacencyList.getState();
            if(adjacencyList.has(from))
                adjacencyList.get(from)?.delete(to);
            if(
                type === ComponentType.BIDIRECTIONALEDGE
                && adjacencyList.has(to)
            )
                adjacencyList.get(to)?.delete(from);
            useAdjacencyList.setState(adjacencyList);
        }
    }

    const updateAdjacencyListConnections = (from: NodeID | undefined, to: NodeID | undefined, type: ComponentType) => {
        if(from !== undefined && to !== undefined) {
            adjacencyList = useAdjacencyList.getState();
            if(adjacencyList.has(from))
                adjacencyList.get(from)?.add(to);
            if(
                type === ComponentType.BIDIRECTIONALEDGE    
                && adjacencyList.has(to)
            )
                adjacencyList.get(to)?.add(from);
            useAdjacencyList.setState(adjacencyList);
        }
    }

    const processNodeMove = (node: NodeIF, id: NodeID, cx: number, cy: number, edges: Map<EdgeID, EdgeIF>): NodeIF | null => { 

        collisionManager = useCollisionManager.getState();
        // console.log(collisionManager);
        // 1. Get the node's grid cells for its new position.
        const newCells: Set<string> = collisionManager.getCellsInCircle(cx, cy);

        // 2. Detatch any nodes from edges which are no longer attached
        const iterEdges = node.connectedEdges;
        // console.log("Starting stale edge check for node ID ", id);
        for(const edgeID of iterEdges) {
            const edge = edges.get(edgeID);
            if(edge === undefined) return null;

            // Case 1: Node does not fall in the same cells as this edge, so no longer connected
            if(!newCells.has(edge.x1y1GridCell) && !newCells.has(edge.x2y2GridCell)) {
                if(edge.to === id) {
                    updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                    edge.to = undefined;
                }
                if(edge.from === id) {
                    updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                    edge.from = undefined;
                }
                // console.log(`NODE DRAG: Detatching node ${id} and edge ${edgeID}`)
                node.connectedEdges.delete(edgeID);
            }

            // Case 2: Node falls in the same cell as node 'from' point
            if(newCells.has(edge.x1y1GridCell)) {
                const isCollision: boolean = collisionManager.findCollisionsBetweenEdgeAndNode(edge.x1, edge.y1, cx, cy);
                if(!isCollision) {
                    // console.log(`NODE DRAG: Detatching node ${id} and edge ${edgeID} in cell ${edge.x1y1GridCell}`)
                    updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                    edge.from = undefined;
                    node.connectedEdges.delete(edgeID);
                }
            }

            // Case 3: Node falls in the same cell as node 'to' point
            if(newCells.has(edge.x2y2GridCell)) {
                const isCollision: boolean = collisionManager.findCollisionsBetweenEdgeAndNode(edge.x2, edge.y2, cx, cy);
                if(!isCollision) {
                    // console.log(`NODE DRAG: Detatching node ${id} and edge ${edgeID} in cell ${edge.x2y2GridCell}`);
                    updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                    edge.to = undefined;
                    node.connectedEdges.delete(edgeID);
                }
            }
        }
        // console.log("Ending stale edge check for node ID ", id);

        // 3. Attach the node to any new edges which may be attached
        // console.log("Starting check for new attached edge candidates");
        for(const cell of newCells) {
            const edgesInNewCell = collisionManager.getEdgesInEdgeGrid(cell);
            // console.log("Edges in new cell: ", edgesInNewCell);

            // If no edges in that cell, check the next cell
            if(edgesInNewCell === undefined) continue;

            
            for(const edgeID of edgesInNewCell) {
                const edge = edges.get(edgeID);
                if(edge === undefined) return null;

                // Case 1: Found a collision between node in new cell and an edge's 'from' point
                if(collisionManager.findCollisionsBetweenEdgeAndNode(edge.x1, edge.y1, cx, cy)) {
                    // console.log(`NODE DRAG: Attaching node ${id} and edge ${edgeID} in cell ${cell}`);
                    node.connectedEdges.add(edgeID);
                    edge.from = id;
                    updateAdjacencyListConnections(edge.from, edge.to, edge.type);
                }

                // Case 2: Found a collision between node in new cell and an edge's 'to' point
                if(collisionManager.findCollisionsBetweenEdgeAndNode(edge.x2, edge.y2, cx, cy)) {
                    // console.log(`NODE DRAG: Attaching node ${id} and edge ${edgeID} in cell ${cell}`);
                    node.connectedEdges.add(edgeID);
                    edge.to = id;
                    updateAdjacencyListConnections(edge.from, edge.to, edge.type);
                }
            }
        }
        // console.log("Ending check for new attached edge candidates");

        // 4. Update the nodeGrid with the node's new coordinates
        collisionManager.moveNodeInNodeGrid(node.gridCells, newCells, id);
        useCollisionManager.setState(collisionManager);
        return { ...node, cx: cx, cy: cy, gridCells: newCells };
    }

    const updateNodePosition = (
        id: NodeID | undefined,
        cx: number, cy: number) => {
        useGraphStore.setState((state) => {
            // console.log("Node ID: ", id);
            if(id === undefined) return state;
            const nodeIF: NodeIF | undefined = state.graphComponents.nodes.get(id);
            if(nodeIF === undefined) return state; // No change if couldn't retrieve node
            const processedIF: NodeIF | null = processNodeMove(nodeIF, id, cx, cy, state.graphComponents.edges);
            // console.log("Processed Node IF: ", processedIF);
            if(processedIF === null) return state;
            // console.log(processedIF);
            state.graphComponents.nodes.set(id, processedIF);
            return { ...state }
        });
    };

    const processEdgeMove = (edge: EdgeIF, id: EdgeID, x1: number, x2: number, y1: number, y2: number, nodes: Map<NodeID, NodeIF>): EdgeIF | null => { 

        collisionManager = useCollisionManager.getState();
        // console.log(collisionManager);  
        // 1. Get the new cells list for the moved edge
        const newCells: Set<string> = collisionManager.getCellsAtVertices(x1, x2, y1, y2);
        const oldNodeFrom = edge.from !== undefined ? nodes.get(edge.from) : undefined;
        const oldNodeTo = edge.to !== undefined ? nodes.get(edge.to) : undefined;

        // 2. Detatch edge from nodes which are possibly no longer attached 
        // Case 1: 'from' vertex is not in the newCells list, implying connection broken
        if(oldNodeFrom !== undefined && !newCells.has(edge.x1y1GridCell)) {
            // console.log(`EDGE DRAG: Detatching edge ${id} from node ${edge.from}`);
            updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
            edge.from = undefined;
            oldNodeFrom.connectedEdges.delete(id);
        }

        // Case 2: 'to' vertex is not in the newCells list, implying connection broken 
        if(oldNodeTo !== undefined && !newCells.has(edge.x2y2GridCell)) {
            // console.log(`EDGE DRAG: Detatching edge ${id} to node ${edge.to}`)
            updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
            edge.to = undefined;
            oldNodeTo.connectedEdges.delete(id);
        }

        // Case 3: 'from' vertex is in the same cell as the old 'from' vertex
        if(oldNodeFrom !== undefined && newCells.has(edge.x1y1GridCell)) {
            if(!collisionManager.findCollisionsBetweenEdgeAndNode(x1, y1, oldNodeFrom.cx, oldNodeFrom.cy)) {
                // console.log(`EDGE DRAG: Detatching edge ${id} from node ${edge.from}`)
                updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                edge.from = undefined;
                oldNodeFrom.connectedEdges.delete(id);
            }
        }
        
        // Case 4: 'to' vertex is in the same cell as the old 'to' vertex
        if(oldNodeTo !== undefined && newCells.has(edge.x2y2GridCell)) {
            if(!collisionManager.findCollisionsBetweenEdgeAndNode(x2, y2, oldNodeTo.cx, oldNodeTo.cy)) {
                // console.log(`EDGE DRAG: Detatching edge ${id} to node ${edge.to}`)
                updateAdjacencyListDisconnections(edge.from, edge.to, edge.type);
                edge.to = undefined;
                oldNodeTo.connectedEdges.delete(id);
            }
        }

        // 3. Check for any new connections to nodes at the new position
        let isFrom = true; // True on first iteration, false on second
        // 'newCells' should never be longer than 2 elements in initial implementation
        for(const cell of newCells) {
            const candidateNodes = collisionManager.getNodesInNodeGrid(cell);
            if(candidateNodes === undefined) {
                isFrom = false;
                continue;
            }
            for(const nodeID of candidateNodes) {
                const node = nodes.get(nodeID);
                if(node === undefined) return null;
                const isCollision = isFrom ? collisionManager.findCollisionsBetweenEdgeAndNode(x1, y1, node.cx, node.cy)
                                           : collisionManager.findCollisionsBetweenEdgeAndNode(x2, y2, node.cx, node.cy);
                if(isCollision) {
                    if(isFrom) {
                        edge.from = nodeID;
                        // console.log(`EDGE DRAG: Attaching edge ${id} from node ${nodeID}`)
                    } else {
                        edge.to = nodeID;
                        // console.log(`EDGE DRAG: Attaching edge ${id} to node ${nodeID}`)
                    }
                    updateAdjacencyListConnections(edge.from, edge.to, edge.type);
                    node.connectedEdges.add(id);
                }
            }
            isFrom = false;
        }

        const iter = newCells.values();
        const firstNew = iter.next().value;
        if(firstNew === undefined) return null;
        const tempSecond = iter.next();
        const secondNew = tempSecond.done ? firstNew : tempSecond.value;
        collisionManager.moveEdgeInEdgeGrid(edge.x1y1GridCell, edge.x2y2GridCell, firstNew, secondNew, id);
        useCollisionManager.setState(collisionManager);
        return { ...edge, x1: x1, x2: x2, y1: y1, y2: y2, x1y1GridCell: firstNew, x2y2GridCell: secondNew  }
    }

    const updateEdgePosition = (
        id: EdgeID | undefined,
        x1: number, x2: number,
        y1: number, y2: number
    ) => {
        useGraphStore.setState((state) => {
            // console.log("Edge ID: ", id);
            if(id === undefined) return state;
            const edgeIF: EdgeIF | undefined = state.graphComponents.edges.get(id);
            if(edgeIF === undefined) return state; // No change if couldn't retrieve edge
            const processedIF: EdgeIF | null = processEdgeMove(edgeIF, id, x1, x2, y1, y2, state.graphComponents.nodes);
            // console.log("Processed Edge IF: ", processedIF);
            if(processedIF === null) return state;
            // console.log(processedIF);
            state.graphComponents.edges.set(id, processedIF);
            return { ...state }
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
        console.log("Edges: ", collisionManager.edgeGrid);
        console.log(graphComponents.edges);
        console.log("Nodes: ", collisionManager.nodeGrid);
        console.log(graphComponents.nodes);
        console.log("Adjacency List: ", adjacencyList);
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
        console.log("Edges: ", collisionManager.edgeGrid);
        console.log(graphComponents.edges);
        console.log("Nodes: ", collisionManager.nodeGrid);
        console.log(graphComponents.nodes);
        console.log("Adjacency List: ", adjacencyList);
    }
    
    const renderNodes = (nodes: Map<NodeID, NodeIF>) => {
        const nodeComponents = [];
        for(const [nodeID, nodeIF] of nodes) {
            nodeComponents.push(
                <Node
                key={nodeID} 
                id={nodeID}
                cx={nodeIF.cx} 
                cy={nodeIF.cy} 
                onMouseDown={(e) => handleOnMouseDownNode(e, nodeID)}
                />
            );
        }
        return nodeComponents;
    }

    const renderEdges = (edges: Map<EdgeID, EdgeIF>) => {
        const edgeComponents = [];
        for(const [edgeID, edgeIF] of edges) {
            edgeComponents.push(
                <Edge
                    type={edgeIF.type}
                    key={edgeID}
                    cost={edgeIF.cost}
                    x1={edgeIF.x1}
                    x2={edgeIF.x2}
                    y1={edgeIF.y1}
                    y2={edgeIF.y2}
                    isToolbar={false}
                    onMouseDown={(e) => handleOnMouseDownEdge(e, edgeID)}
                />
            );
        }
        return edgeComponents;
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
                    renderNodes(graphComponents.nodes)
                }

                {/* Render edges */}
                {
                    renderEdges(graphComponents.edges)
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