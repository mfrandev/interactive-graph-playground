import traversalStepNext from './../../../dist/Next.svg';
import traversalStepPrevious from './../../../dist/Previous.svg';

export const TraversalStepNext = ({ incrementTraversalFunction }: { incrementTraversalFunction: () => void }) => {
    return (
        <div className="flex flex-row items-center justify-between
        p-3 shadow-md rounded-lg bg-white hover:bg-gray-300 active:shadow-gray-300 active:inset-shadow-sm active:inset-shadow-gray-400"
        style={{userSelect: "none"}}
        onClick={incrementTraversalFunction}>
            <img src={traversalStepNext} alt="Next"
            style={{pointerEvents: "none"}}/>
        </div>
    )
};

export const TraversalStepPrevious = ({ decrementTraversalFunction }: { decrementTraversalFunction: () => void }) => {
    return (
        <div className="flex flex-row items-center justify-between
        p-3 shadow-md rounded-lg bg-white hover:bg-gray-300 active:shadow-gray-300 active:inset-shadow-sm active:inset-shadow-gray-400"
        style={{userSelect: "none"}}
        onClick={decrementTraversalFunction}>
            <img src={traversalStepPrevious} alt="Next"
            style={{pointerEvents: "none"}}/>
        </div>
    )
};
