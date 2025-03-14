/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/9/2025
 * FILE: toolbar.fixture.tsx
 * DESCRIPTION: Define/Export the Toolbar component. 
 * Used to add nodes and edges to the graph. 
 * "fixture" added for Cosmos testing compatability.  
 */

import { useState, useEffect } from 'react';

import '../../index.css';

import { useGraphStore, useCollisionManager, useAdjacencyList } from '../utils/graph.store';
import { NodeID } from '../utils/node';
import { EdgeID } from '../utils/edge';
import { ComponentType, isEdge } from '../utils/graph.interfaces';
import { DOMToSVG } from '../utils/dom-utils';

import AddComponentButton from './add-component.fixture';
import { CANVASID } from './canvas.fixture';

let node: NodeID = 0;
let edge: EdgeID = 0;

const Toolbar = () => {
    const graphComponents = useGraphStore(state => state.graphComponents);
    let adjacencyList = useAdjacencyList(state => state);
    let collisionManager = useCollisionManager(state => state);

    const [ center, setCenterXYSVG ] = useState([0, 0]);

    // Query the viewport center coords on load.
    // TODO: Re-run this routine if viewport changes.
    useEffect(() => {
        const [xDOM, yDOM] = [window.innerWidth / 2, window.innerHeight / 2];
        const canvasSVG = document.querySelector(`svg#${CANVASID}`) as SVGSVGElement;
        if(!canvasSVG) {
            console.error("Error retrieving center coords for canvas on-load.");
            return; // Return if could not find the canvas element
        }
        const transformedCoords = DOMToSVG(xDOM, yDOM, canvasSVG);
        if(!transformedCoords) {
            console.error("Error retrieving center coords for canvas on-load.");
            return; // Return if could not find the canvas element
        }
        setCenterXYSVG(transformedCoords);
    }, []);

    /**
     * Add a new node the graph.
     * @param id: NodeID of the node to add to the graph
     * @returns void
     */
    const addNode = (id: NodeID) => {
        if(graphComponents.nodes.size >= 20) return;
        const cx = center[0] ? center[0] : 500;
        const cy = center[1] ? center[1] : 500;
        collisionManager = useCollisionManager.getState();
        const gridCells = collisionManager.getCellsInCircle(cx, cy);
        collisionManager.addToNodeGrid(gridCells, id);
        useCollisionManager.setState(collisionManager);
        adjacencyList = useAdjacencyList.getState()
        adjacencyList.set(id, new Set<NodeID>());
        useAdjacencyList.setState(adjacencyList);
        useGraphStore.setState(
            {
                graphComponents: {
                    nodes: new Map(
                        [
                            ...graphComponents.nodes, 
                            [ id,
                                {
                                    cx: cx, 
                                    cy: cy,
                                    gridCells: gridCells,
                                    connectedEdges: new Set<EdgeID>()
                                }
                            ]
                        ]
                    ),
                    edges: graphComponents.edges
                }
            }
        );
    }

    /**
     * Add a new edge to the graph. 
     * @param id: EdgeID of the edge to add to the graph
     * @param componentType: Specify if unidirection or bidrectional edge
     * @returns void
     */
    const addEdge = (id: EdgeID, componentType: ComponentType) => {
        if(!isEdge(componentType)) return; //TODO error handle, but this should never fire
        const x1 = center[0] ? center[0] - 50 : 450;
        const x2 = center[0] ? center[0] + 50 : 550;
        const y1 = center[0] ? center[0] + 50 : 550;
        const y2 = center[0] ? center[0] - 50 : 450;
        collisionManager = useCollisionManager.getState();
        const firstCell = collisionManager.getCellWithSVGCoords(x1, y1);
        const secondCell = collisionManager.getCellWithSVGCoords(x2, y2);
        collisionManager.addVertexToEdgeGrid(firstCell, id);
        collisionManager.addVertexToEdgeGrid(secondCell, id);
        useCollisionManager.setState(collisionManager);
        useGraphStore.setState(
            {
                graphComponents: {
                    nodes: graphComponents.nodes,
                    edges: new Map(
                        [
                            ...graphComponents.edges, 
                            [ id, 
                                {
                                    to: undefined, 
                                    from: undefined, 
                                    cost: undefined,
                                    type:componentType,
                                    x1: x1,
                                    x2: x2,
                                    y1: y1,
                                    y2: y2,
                                    x1y1GridCell:firstCell,
                                    x2y2GridCell: secondCell
                                }
                            ]
                        ]
                    )
                }
            }
        );
    }

    return (
        <div className="absolute flex flex-col gap-y-2 h-dvh place-content-center p-3">
            <AddComponentButton 
                onClickFunction={() => addNode(node + 1 > 20 ? 20 : node++)}
                componentType={ComponentType.NODE} 
            />
            <AddComponentButton
                onClickFunction={() => addEdge(edge++, ComponentType.UNIDIRECTIONALEDGE)}
                componentType={ComponentType.UNIDIRECTIONALEDGE}
            />
            <AddComponentButton
                onClickFunction={() => addEdge(edge++, ComponentType.BIDIRECTIONALEDGE)}
                componentType={ComponentType.BIDIRECTIONALEDGE}
            />
        </div>
    )
}

export default Toolbar;