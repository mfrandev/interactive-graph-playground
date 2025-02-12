import '../../index.css';

import Toolbar from './toolbar.fixture';
import Canvas from './canvas.fixture';

const GraphMakerUI = () => {

    return (
        <div className='flex'>
            <Canvas/>
            <Toolbar/>
        </div>
    );

};

export default GraphMakerUI;