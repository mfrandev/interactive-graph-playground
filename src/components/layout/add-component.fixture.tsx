/**
 * AUTHOR: mfdev99@gmail.com
 * DATE: 2/10/2025
 * FILE: add-component.fixture.tsx
 * DESCRIPTION: Define/Export the "add-component" component. 
 * "fixture" added for Cosmos testing compatability.
 * Generic component used to add Nodes and Edges to the graph canvas.
 */

import '../../index.css';

import { MouseEventHandler } from 'react';

import { ComponentType, isEdge } from '../utils/graph.interfaces'; 

import Node from '../graph/node.fixture';
import EdgeWrapper from '../graph/edge.fixture';

const AddComponentButton = ({ onClickFunction, componentType = ComponentType.BIDIRECTIONALEDGE}: { onClickFunction: MouseEventHandler<HTMLButtonElement>, componentType: ComponentType }) => {
    return (
        <button onClick={onClickFunction}
        className="flex flex-row p-3 shadow-md rounded-lg bg-white hover:bg-gray-300 active:shadow-gray-300 active:inset-shadow-sm active:inset-shadow-gray-400">
            {!isEdge(componentType) && 
                <div className="size-15">
                    <svg 
                    width='100%'
                    height='100%'
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox='0 0 100 100'
                    >
                        <Node cx={undefined} cy={undefined} />
                    </svg>
                </div>
            }
            {isEdge(componentType) && componentType === ComponentType.UNIDIRECTIONALEDGE
            &&
                <EdgeWrapper edgeType={ComponentType.UNIDIRECTIONALEDGE}/>
            }
            {isEdge(componentType) && componentType === ComponentType.BIDIRECTIONALEDGE
            &&
                <EdgeWrapper edgeType={ComponentType.BIDIRECTIONALEDGE}/>
            }
        </button>
    );
}

export default AddComponentButton;