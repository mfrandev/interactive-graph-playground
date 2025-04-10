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

import { useGraphStore, useCollisionManager, useAdjacencyList, useGraphHighlightStateStore } from '../utils/graph.store';
import { DOMToSVGOnClick, SVGFromGAndSVG } from '../utils/dom-utils'; 
import Node from '../graph/node.fixture';
import Highlighter from '../graph/highlighter';
import { NodeID, NodeIF, NodeHighlights } from '../utils/node';
import Edge from '../graph/edge.fixture';
import { EdgeID, EdgeIF } from '../utils/edge';
import { ComponentType } from '../utils/graph.interfaces';

export const CANVASID = 'CanvasSVG';
export const BACKSPACE = 'Backspace';
export const DELETE = 'Delete';

const Canvas = () => {

    // console.log("Rendering canvas");

    // Maintain graph state
    const graphComponents = useGraphStore(state => state.graphComponents);
    let adjacencyList = useAdjacencyList(state => state);
    let collisionManager = useCollisionManager(state => state);

    /**
     * TODO (Issue #34): This function seems to execute hundreds of times unexpectedly, which is causing the highlight to disappear.
     * Temporary fix is to eliminate the prevState check, but the root cause needs to be addressed.  
     */
    useGraphHighlightStateStore.subscribe((state, prevState) => {
        const nodeIFStates = useGraphStore.getState().graphComponents.nodes;
        for(const nodeIF of nodeIFStates.values()) {
            nodeIF.highlight = NodeHighlights.NONE;
        }
        // if(state.currentNode !== prevState.currentNode) {
            const current = nodeIFStates.get(state.currentNode);
            if(current !== undefined)
                current.highlight = NodeHighlights.CURRENT;
        // }
        // if(state.visitingNodes !== prevState.visitingNodes) {
            for(const nodeID of state.visitingNodes) {
                const visiting = nodeIFStates.get(nodeID);
                if(visiting !== undefined)
                    visiting.highlight = NodeHighlights.VISITING;
            }
        // }
        // if(state.visitedNodes !== prevState.visitedNodes) {
            for(const nodeID of state.visitedNodes) {
                const visited = nodeIFStates.get(nodeID);
                if(visited !== undefined)
                    visited.highlight = NodeHighlights.VISITED;
            }
        // }
        useGraphStore.setState({ graphComponents: { ...graphComponents, nodes: nodeIFStates } });
        console.log("Graph state: ", graphComponents.nodes);   
        setLastEventTime(0);
    });

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

    // Node highligheter state during element drag and drop (separate from node scaling/single vertex repositioning)
    const [ [ isHighlightedEdge, highlightedEdgeID, highlightTypeEdge ], setHighlightEdge ] = useState<[boolean, EdgeID | undefined, ComponentType]>([false, undefined, ComponentType.NONE]);
    const [ [ x1EdgeHighlight, x2EdgeHighlight, y1EdgeHighlight, y2EdgeHighlight ], setHighlightEdgeCoords ] = useState<[number, number, number, number]>([0, 0, 0, 0]);
    const [ [ isHighlightedNode, highlightedNodeID, highlightTypeNode ], setHighlightNode ] = useState<[boolean, NodeID | undefined, ComponentType]>([false, undefined, ComponentType.NONE]);
    const [ [ cxNodeHighlight, cyNodeHighlight ], setHighlightNodeCoords ] = useState<[number, number]>([0, 0]);

    const [ svgCTM, setSVGCTM ] = useState<DOMMatrix | null>(null);
    const [ inverseSVGCTM, setInverseSVGCTM ] = useState<DOMMatrix | null>(null);

    // console.log(`Edge: ${isHighlightedEdge}, ${highlightedEdgeID}, ${highlightTypeEdge} \n Node: ${isHighlightedNode}, ${highlightedNodeID}, ${highlightTypeNode}`);

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

    const deleteHighlightedNode = () => {
        if(highlightedNodeID === undefined) return; // No nodes highlighted
        const nodeToDelete = graphComponents.nodes.get(highlightedNodeID);
        if(nodeToDelete === undefined) {
            console.error(`Tried to delete node ${highlightedNodeID}, but node does not exist!`);
            return; // State mgmt error
        }

        // 1. Update collision manager state
        for(const cell of nodeToDelete.gridCells) { 
            collisionManager.deleteFromNodeGrid(cell, highlightedNodeID);
        }

        // 2. Update adjacency list state
        // Note: This only updates the list for bidirectional edges, and if the "from" node is deleted from a unidirectional edge.
        // cont. Unidirectional "to" connections need to be updated correctly in step 3. 
        const adjacentNodes = adjacencyList.get(highlightedNodeID);
        if(adjacentNodes === undefined) {
            console.error(`Something went wrong retrieving state adjacency state for node ${highlightedNodeID}! State mgmt broken...`);
        } else {
            for(const adjacentNodeID of adjacentNodes) {
                // "Adjacent nodes are no longer adjacent to deleted node"
                const adjacentNode = adjacencyList.get(adjacentNodeID);
                if(adjacentNode === undefined) {
                    console.error(`Deleted node adjacent to a non-existent node with ID ${adjacentNodeID}! State mgmt broken...`)
                    break;
                }
                adjacentNode.delete(highlightedNodeID);
                adjacencyList.set(adjacentNodeID, adjacentNode);
            }
        }
        adjacencyList.delete(highlightedNodeID);

        // 3. Update connected edges state and handle adjacency list unidirectional "to" adjacency list case 
        for(const connectedEdgeID of nodeToDelete.connectedEdges) {
            const connectedEdge = graphComponents.edges.get(connectedEdgeID);
            if(connectedEdge === undefined) { 
                console.error(`Tried to disconnect deleted node ${highlightedNodeID} from edge ${connectedEdgeID}, but this edge does not exist!`);
                break; // State mgmt error
            }
            if(connectedEdge.to === highlightedNodeID) { 
                // Unidirectional edge "to" node is deleted, so update adjacency list
                if(connectedEdge.type === ComponentType.UNIDIRECTIONALEDGE && connectedEdge.from !== undefined) {
                    const fromNodeList = adjacencyList.get(connectedEdge.from);
                    if(fromNodeList === undefined) {
                        console.error(`Could not retrieve the adjancency list data for node ${connectedEdge.from}. State mgmt broken...`);
                    } else {
                        fromNodeList.delete(highlightedNodeID);
                        adjacencyList.set(connectedEdge.from, fromNodeList);
                    }
                }
                connectedEdge.to = undefined;
            }
            if(connectedEdge.from === highlightedNodeID) connectedEdge.from = undefined;
            graphComponents.edges.set(connectedEdgeID, connectedEdge);
        }


        // 4. Clear Drag and drop state (since deletes during drag and drop are valid)
        dragAndDropFailureCleanup();

        // 5. Clear highlighter state
        clearAllHighlighterState();

        // 6. Delete from graph component state
        graphComponents.nodes.delete(highlightedNodeID);

        // 7. Sync store states
        useGraphStore.setState({ graphComponents });
        useAdjacencyList.setState(adjacencyList);
        useCollisionManager.setState(collisionManager);

        // TODO: Implement global node ID tracker so it accounds for this deletion and spawns nodes with valid IDs. 

    }

    /**
     * Errors:
     * 1. Deleting an edge does not update the adjacency list
     * 2.
     * @returns 
     */
    const deleteHighlightedEdge = () => {
        if(highlightedEdgeID === undefined) return; // No edges highlighted
        const edgeToDelete = graphComponents.edges.get(highlightedEdgeID);
        if(edgeToDelete === undefined) {
            console.error(`Tried to delete edge ${highlightedEdgeID}, but edge does not exist!`);
            return; // State mgmt error
        }

        // 1. Update collision manager state
        collisionManager.deleteFromEdgeGrid(edgeToDelete.x1y1GridCell, highlightedEdgeID);
        collisionManager.deleteFromEdgeGrid(edgeToDelete.x2y2GridCell, highlightedEdgeID);

        // 2. Update adjacency list state
        if(edgeToDelete.to !== undefined && edgeToDelete.from !== undefined) {
            // console.log("Updating adjacency list after edge delete");
            const toNodeList = adjacencyList.get(edgeToDelete.to);
            const fromNodeList = adjacencyList.get(edgeToDelete.from);
            if(toNodeList === undefined || fromNodeList === undefined) {
                console.error(`Could not retrieve the adjancency list data for nodes ${edgeToDelete.to} OR ${edgeToDelete.from}. State mgmt broken...`);
            } else {
                toNodeList.delete(edgeToDelete.from);
                fromNodeList.delete(edgeToDelete.to);
                adjacencyList.set(edgeToDelete.to, toNodeList);
                adjacencyList.set(edgeToDelete.from, fromNodeList);
            }
            // console.log("updated adj list after delete: ", adjacencyList);
        }
        
        // 3. Update connected edges state
        if(edgeToDelete.to !== undefined) {
            // Nodes no longer connected via this edge
            const toNode = graphComponents.nodes.get(edgeToDelete.to);
            if(toNode === undefined) {
                console.error(`Deleted edge ${highlightedEdgeID} was connected "to" node ${edgeToDelete.to}, but node ${edgeToDelete.to} doesn't exist! State mgmt broken...`);
            } else {
                toNode.connectedEdges.delete(highlightedEdgeID);
                graphComponents.nodes.set(edgeToDelete.to, toNode);
            }
        }
        if(edgeToDelete.from !== undefined) {
            const fromNode = graphComponents.nodes.get(edgeToDelete.from);
            if(fromNode === undefined) {
                console.error(`Deleted edge ${highlightedEdgeID} was connected "from" node ${edgeToDelete.from}, but node ${edgeToDelete.from} doesn't exist! State mgmt broken...`);
            } else {
                fromNode.connectedEdges.delete(highlightedEdgeID);
                graphComponents.nodes.set(edgeToDelete.from, fromNode);
            }
        }


        // 4. Clear Drag and drop state (since deletes during drag and drop are valid)
        dragAndDropFailureCleanup();

        // 5. Clear highlighter state
        clearAllHighlighterState();

        // 6. Delete from graph component state
        graphComponents.edges.delete(highlightedEdgeID);

        // 7. Sync store states
        useGraphStore.setState({ graphComponents });
        useAdjacencyList.setState(adjacencyList);
        useCollisionManager.setState(collisionManager);

        // TODO: Implement global edge ID tracker so it accounds for this deletion and spawns edges with valid IDs. 

    }

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

    const clearAllHighlighterState = () => {
        setHighlightNode([false, undefined, ComponentType.NONE]);
        setHighlightNodeCoords([0, 0]);
        setHighlightEdge([false, undefined, ComponentType.NONE]);
        setHighlightEdgeCoords([0, 0, 0, 0]);
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

        // Manage highlighter state
        setHighlightNode([true, id, ComponentType.NODE]);
        setHighlightNodeCoords([startingCX, startingCY]);
        setHighlightEdge([false, undefined, ComponentType.NONE])
        // console.log(`On mouse down node: ${isHighlightedEdge},${isHighlightedNode}`);

        e.stopPropagation(); // Prevent the parent canvas component from disabling the highlight

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
        const cx = x - xDragOffsetNode;
        const cy = y - yDragOffsetNode;
        updateNodePosition(nodeID, cx, cy);
        setHighlightNodeCoords([cx, cy]);
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
        const cx = x - xDragOffsetNode;
        const cy = y - yDragOffsetNode
        updateNodePosition(nodeID, cx, cy);
        setHighlightNodeCoords([cx, cy]);
        nodeRef.current = null;
        setIsDraggingNode([false, undefined]);
        setDragOffsetNode([0, 0]);
        // console.log("Edges: ", collisionManager.edgeGrid);
        // console.log(graphComponents.edges);
        // console.log("Nodes: ", collisionManager.nodeGrid);
        // console.log(graphComponents.nodes);
        // console.log("Adjacency List: ", adjacencyList);
    }

    /**
     * Handle case when user clicks on an edge
     * @param e
     * @param id 
     * @returns 
     */
    const handleOnMouseDownEdge = (e: React.MouseEvent<SVGGElement, MouseEvent>, id: EdgeID | undefined, type: ComponentType) => {
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

        // Manage Highlighter state
        setHighlightEdge([true, id, type]);
        setHighlightEdgeCoords([startingX1, startingX2, startingY1, startingY2]);
        setHighlightNode([false, undefined, ComponentType.NONE]);
        // console.log(`On mouse down edge: ${isHighlightedEdge},${isHighlightedNode}`);
        e.stopPropagation(); // Prevent the parent canvas component from disabling the highlight
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

        const x1 = x - x1DragOffsetEdge;
        const x2 = x + x2DragOffsetEdge;
        const y1 = y - y1DragOffsetEdge;
        const y2 = y + y2DragOffsetEdge;

        updateEdgePosition(
            edgeID, 
            x1, 
            x2,
            y1,
            y2
        );

        setHighlightEdgeCoords([x1, x2, y1, y2]);
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
        const x1 = x - x1DragOffsetEdge;
        const x2 = x + x2DragOffsetEdge;
        const y1 = y - y1DragOffsetEdge;
        const y2 = y + y2DragOffsetEdge;

        setHighlightEdgeCoords([x1, x2, y1, y2]);
        updateEdgePosition(
            edgeID, 
            x1, 
            x2,
            y1,
            y2
        );
        edgeRef.current = null;
        setIsDraggingEdge([false, undefined]);
        setDragOffsetEdge([0, 0, 0, 0]);
        // console.log("Edges: ", collisionManager.edgeGrid);
        // console.log(graphComponents.edges);
        // console.log("Nodes: ", collisionManager.nodeGrid);
        // console.log(graphComponents.nodes);
        // console.log("Adjacency List: ", adjacencyList);
        // console.log("y: ", y2 - y1, " x: ", x2 - x1);
        // console.log("Angle of rotation: ", Math.atan2(y2 - y1, x2 - x1));
        
    }

    const [isRepositionHighlighterX1Y1, setIsRepositionHighlighterX1Y1] = useState<boolean>(false);
    const [isRepositionHighlighterX2Y2, setIsRepositionHighlighterX2Y2] = useState<boolean>(false);

    const [[repositionHighlighterXOffset, repositionHighlighterYOffset], setRepositionHighlighterXYOffset] = useState<[number, number]>([0, 0]); // Can use this for node scaling too
    const [[repositionHighlighterAdjustedX, repositionHighlighterAdjustedY], setRepositionHighlighterAdjustedXY] = useState<[number, number]>([0, 0]);

    const cleanupRepositionState = () => {
        setIsRepositionHighlighterX1Y1(false);
        setIsRepositionHighlighterX2Y2(false);
        setRepositionHighlighterXYOffset([0, 0]);
        setRepositionHighlighterAdjustedXY([0, 0]);
    }

    const handleOnMouseDownX1Y1 = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
        // 1. Make a new highlighter object without end-of-vertex circles
        setIsRepositionHighlighterX1Y1(true);

        // 2. Calculate and set offset from center of end-of-vertex circle
        if(!svgRef.current) {
            cleanupRepositionState();
            return;
        }
        const clickPointSVG = SVGFromGAndSVG(e.currentTarget, svgRef.current, e.clientX, e.clientY);
        if(!clickPointSVG) {
            cleanupRepositionState();
            return;
        }
        setRepositionHighlighterXYOffset([clickPointSVG.x - x1EdgeHighlight, clickPointSVG.y - y1EdgeHighlight]);
        setRepositionHighlighterAdjustedXY([x1EdgeHighlight, y1EdgeHighlight]);
        
        // 3. Make sure no undesired, residual onMouseDown effects trigger
        e.stopPropagation();
    }

    const handleOnMouseDownX2Y2 = (e: React.MouseEvent<SVGGElement, MouseEvent>) => {
        // 1. Make a new highlighter object without end-of-vertex circles
        setIsRepositionHighlighterX2Y2(true);

        // 2. Calculate and set offset from center of end-of-vertex circle
        if(!svgRef.current) {
            cleanupRepositionState();
            return;
        }
        const clickPointSVG = SVGFromGAndSVG(e.currentTarget, svgRef.current, e.clientX, e.clientY);
        if(!clickPointSVG) {
            cleanupRepositionState();
            return;
        }
        setRepositionHighlighterXYOffset([clickPointSVG.x - x2EdgeHighlight, clickPointSVG.y - y2EdgeHighlight]);
        setRepositionHighlighterAdjustedXY([x2EdgeHighlight, y2EdgeHighlight]);
        
        // 3. Make sure no undesired, residual onMouseDown effects trigger
        e.stopPropagation();
    }

    const handleOnMouseMoveX1Y1OrX2Y2 = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isRepositionHighlighterX1Y1 && !isRepositionHighlighterX2Y2) {
            cleanupRepositionState();
            return;
        }

        // Throttle to 60FPS
        const now = performance.now();
        if (now - lastEventTime < throttleDelay) {
            return;
        }
        setLastEventTime(now);
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            console.log("Could not derive point");
            cleanupRepositionState();
            return;
        }
        const [x, y] = result;
        setRepositionHighlighterAdjustedXY([x - repositionHighlighterXOffset, y - repositionHighlighterYOffset]);
    }

    const handleOnMouseUpX1Y1 = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isRepositionHighlighterX1Y1) {
            cleanupRepositionState();
            return;
        }
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            cleanupRepositionState();
            return;
        }
        const [x, y] = result;
        const x1Moved = x - repositionHighlighterXOffset
        const y1Moved = y - repositionHighlighterYOffset;
        setHighlightEdgeCoords([x1Moved, x2EdgeHighlight, y1Moved, y2EdgeHighlight]);
        updateEdgePosition(
            highlightedEdgeID, 
            x1Moved, 
            x2EdgeHighlight,
            y1Moved,
            y2EdgeHighlight
        );
        cleanupRepositionState();
    }

    const handleOnMouseUpX2Y2 = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        if(!isRepositionHighlighterX2Y2) {
            cleanupRepositionState();
            return;
        }
        const result = DOMToSVGOnClick(e, svgCTM, inverseSVGCTM);
        if(!result) {
            cleanupRepositionState();
            return;
        }
        const [x, y] = result;
        const x2Moved = x - repositionHighlighterXOffset
        const y2Moved = y - repositionHighlighterYOffset;
        setHighlightEdgeCoords([x1EdgeHighlight, x2Moved, y1EdgeHighlight, y2Moved]);
        updateEdgePosition(
            highlightedEdgeID, 
            x1EdgeHighlight, 
            x2Moved,
            y1EdgeHighlight,
            y2Moved
        );
        cleanupRepositionState();
    }

    // Each edge can use the returned function as a callback to update its cost [love some curry :)]
    const updateEdgeCost = (edgeID: EdgeID) => {
        return (newCost: number | undefined) => {
            useGraphStore.setState((state) => {
                const edgeIF = state.graphComponents.edges.get(edgeID);
                if(edgeIF === undefined) return state;
                state.graphComponents.edges.set(edgeID, { ...edgeIF, cost: newCost });

                // TODO: OPTIMIZE this temporary workaround, since forcing re-render of the edge cost text re-renders the entire canvas. 
                setHighlightEdge([isHighlightedEdge, highlightedEdgeID, highlightTypeEdge]);
                return { ...state };
            })
        }
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
                highlight={nodeIF.highlight}
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
                    onMouseDown={(e) => handleOnMouseDownEdge(e, edgeID, edgeIF.type)}
                    updateEdgeCost={updateEdgeCost(edgeID)}
                />
            );
        }
        return edgeComponents;
    }

    const renderHighlighter = () => {
        if(isHighlightedEdge) {
            return(
                <g>
                <Highlighter
                    isActive={true}
                    type={highlightTypeEdge}
                    x1={x1EdgeHighlight}
                    x2={x2EdgeHighlight}
                    y1={y1EdgeHighlight}
                    y2={y2EdgeHighlight}
                    onMouseDown={(e) => {handleOnMouseDownEdge(e, highlightedEdgeID, highlightTypeEdge)}}
                    onMouseDownX1Y1={ handleOnMouseDownX1Y1 }
                    onMouseDownX2Y2={ handleOnMouseDownX2Y2 }
                />
                {
                    (isRepositionHighlighterX1Y1 || isRepositionHighlighterX2Y2) &&
                    <Highlighter
                    isActive={true}
                    type={highlightTypeEdge}
                    x1={ isRepositionHighlighterX1Y1 ? repositionHighlighterAdjustedX : x1EdgeHighlight }
                    x2={ isRepositionHighlighterX2Y2 ? repositionHighlighterAdjustedX : x2EdgeHighlight }
                    y1={ isRepositionHighlighterX1Y1 ? repositionHighlighterAdjustedY : y1EdgeHighlight } 
                    y2={ isRepositionHighlighterX2Y2 ? repositionHighlighterAdjustedY : y2EdgeHighlight }
                    onMouseDown={undefined}
                    onMouseDownX1Y1={undefined}
                    onMouseDownX2Y2={undefined}
                    />
                }
                </g>
            )
        } else if(isHighlightedNode) { 
            return(    
                <Highlighter
                    isActive={true}
                    type={highlightTypeNode}
                    cx={cxNodeHighlight}
                    cy={cyNodeHighlight}
                />
            )
        }
    }

    /**
     * This is getting updated every render, so the useEffect directly below triggers every render as well.
     * This is an inefficient solution, but it gets around the event listener closure problem for now.  
     */
    const deleteComponentHandler = (e: globalThis.KeyboardEvent) => {
        if(e.key !== BACKSPACE && e.key !== DELETE) return; // did not press delete/backspace
        // console.log("Is highlighted edge? ", isHighlightedEdge, " Is highlighted node? ", isHighlightedNode);
        // console.log(`Edge: ${isHighlightedEdge}, ${highlightedEdgeID}, ${highlightTypeEdge} \n Node: ${isHighlightedNode}, ${highlightedNodeID}, ${highlightTypeNode}`);

        if(!isHighlightedEdge && !isHighlightedNode) return; // no highlighted component to delete
        // console.log(e);
        if(isHighlightedNode) deleteHighlightedNode();
        if(isHighlightedEdge) deleteHighlightedEdge();
    }

        // This only works because it is updated every render, which is horribly inefficient. 
        // TODO: Come back after feature development and optimize.
        useEffect(() => {
            window.addEventListener('keydown', deleteComponentHandler);
            return () => window.removeEventListener('keydown', deleteComponentHandler);
        }, [isHighlightedNode, isHighlightedEdge, deleteComponentHandler]);

    /**
     * END DRAG AND DROP FOR EDGES
     */

    return (
        <div className={`w-screen bg-[url('')] bg-no-repeat bg-cover bg-center bg-opacity-50`}
        >
            <svg
                width='100%'
                height='100%' 
                viewBox = "0 0 1000 1000"
                xmlns="http://www.w3.org/2000/svg"
                fill="transparent"

                // Disable component highlights. onMouseDown does not propagate up from clicks on components
                onMouseDown={() =>{
                    // console.log(`Edge: ${isHighlightedEdge}, ${highlightedEdgeID}, ${highlightTypeEdge} \n Node: ${isHighlightedNode}, ${highlightedNodeID}, ${highlightTypeNode}`);

                   setHighlightEdge([false, undefined, ComponentType.NONE]);
                   setHighlightNode([false, undefined, ComponentType.NONE]);
                }}

                onMouseMove={(e) => {
                    if(isDraggingNode) handleOnMouseMoveNode(e);
                    if(isDraggingEdge) handleOnMouseMoveEdge(e);
                    if(isRepositionHighlighterX1Y1 || isRepositionHighlighterX2Y2) handleOnMouseMoveX1Y1OrX2Y2(e);
                }}

                onMouseUp={(e) => {
                    if(isDraggingNode) handleOnMouseUpNode(e);
                    if(isDraggingEdge) handleOnMouseUpEdge(e);
                    if(isRepositionHighlighterX1Y1) handleOnMouseUpX1Y1(e); 
                    if(isRepositionHighlighterX2Y2) handleOnMouseUpX2Y2(e);
                    // console.log("Adjacency List: ", adjacencyList);
                }}

                id={`${CANVASID}`}
                ref={svgRef}
                >

                {/**
                 * For now, render order matters. 
                 * 1. We want the edges rendered before their highlights so they can be dragged.
                 * 2. We want highlights rendered before nodes so the transparent bounding box is not overlayed over the node.
                 * 3. UPDATE: We render the highlighter first so components fully render. This will have to be fixed at some point, perhaps making the highlight part of the component?
                 */
                }
                    {/* Render component highlight */}
                {
                    renderHighlighter()
                }
                {/* Render edges */}
                {
                    renderEdges(graphComponents.edges)
                }
                {/* Render nodes */}
                {
                    renderNodes(graphComponents.nodes)
                }



            </svg>
        </div>
    );

}  

export default Canvas;