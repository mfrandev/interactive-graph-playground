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

import { useGraphStore } from '../utils/graph.store';
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
        if(graphComponents.nodes.length >= 20) return;
        useGraphStore.setState(
            {
                adjacencyList: useGraphStore.getState().adjacencyList,
                graphComponents: {
                    nodes: [...graphComponents.nodes, {
                        id: id, 
                        cx: !center[0] ? 500 : center[0], 
                        cy: !center[1] ? 500 : center[1],
                    }],
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
        useGraphStore.setState(
            {
                adjacencyList: useGraphStore.getState().adjacencyList,
                graphComponents: {
                    nodes: graphComponents.nodes,
                    edges: [...graphComponents.edges, {id: id, to: 0, from: 0, cost: 0}]
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