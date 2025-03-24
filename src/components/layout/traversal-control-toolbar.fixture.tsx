import PlayPause from './play-pause.fixture';
import { TraversalStepNext, TraversalStepPrevious } from './traversal-step.fixture';

const TraversalControlToolbar = (
    {
        incrementTraversalFunction,
        decrementTraversalFunction
    }:
    {
        incrementTraversalFunction: () => void,
        decrementTraversalFunction: () => void
    }
) => {
    return (
        <div className="flex flex-row items-center justify-center gap-x-2 p-3">
            <TraversalStepPrevious
                decrementTraversalFunction={decrementTraversalFunction}
            />
            <PlayPause/>
            <TraversalStepNext
                incrementTraversalFunction={incrementTraversalFunction}
            />
        </div>
    )
};

export default TraversalControlToolbar;