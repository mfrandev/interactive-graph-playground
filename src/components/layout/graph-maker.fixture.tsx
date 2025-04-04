import '../../index.css';

import Toolbar from './toolbar.fixture';
import Canvas from './canvas.fixture';

const GraphMakerUI = () => {

    return (
        <div className='flex h-3/4'>
            <Toolbar/>
            <Canvas/>
        </div>
    );

};

export default GraphMakerUI;