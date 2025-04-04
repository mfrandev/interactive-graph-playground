import { AlgoType } from "../../algorithms/algo-interfaces";

const BFSDisplay = ({traversal, traversalIndex}: {traversal: any, traversalIndex: number}) => {
    return ( 
        <div key={traversalIndex} className="flex flex-col items-center justify-center gap-y-2">
            <div>
                Current Node: {traversal.states[traversalIndex]?.currentNode}
            </div>
            <div>
                Queue State: &#123; {traversal.states[traversalIndex]?.queue ? [...traversal.states[traversalIndex].queue].map((e) => e + ", ") : ''} &#125;
            </div>
            <div>
                Visited Nodes: &#123; {traversal.states[traversalIndex]?.visited ? [...traversal.states[traversalIndex].visited].map((elem) => elem + ", ") : ''} &#125; 
            </div>
        </div>
    )
}

const getTraversalStateDisplay = (traversal: any, traversalIndex: number) => {
    if(traversal === undefined) return <div></div>;
    switch(traversal.algorithm) {
        case AlgoType.BFS:
            return (
                <BFSDisplay traversal = { traversal } traversalIndex = { traversalIndex } />
            )
        default:
            return (
                <div>
                    Traversal not implemented
                </div>
            )
    }
}

const TraversalStateDisplay = ({traversal, traversalIndex}: {traversal: any, traversalIndex: number}) => {
    
    return (
        <div>
            {getTraversalStateDisplay(traversal, traversalIndex)}
        </div>
    )
}

export default TraversalStateDisplay;