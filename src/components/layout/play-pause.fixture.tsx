import playPauseIcon from './../../../dist/PlayPause.svg';

const PlayPause = () => {
    return (
        <div className="flex flex-row items-center justify-between 
        p-3 shadow-md rounded-lg bg-white hover:bg-gray-300 active:shadow-gray-300 active:inset-shadow-sm active:inset-shadow-gray-400"
        style={{userSelect: "none"}}
        >
            <img src={playPauseIcon} alt="Play/Pause"
            style={{pointerEvents: "none"}}/>
        </div>
    )
};

export default PlayPause;