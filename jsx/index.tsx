import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

function Player({track, track_ended}) {
    const audio_source = track ? "http://localhost:8000/" + track.path : null
    return <audio controls="controls" style={{width: "100%"}} autoPlay="true" src={audio_source} onEnded={track_ended}>
    </audio>;
}
const PlayerContainer = connect(
    (state) => ({track: state.current_track}),
    {track_ended: () => ({type: "track_ended"})}
)(Player);

function LibraryTrack({track, onClick}) {
    return <div key={track.path} style={{borderTop: "1px dashed black"}} onClick={() => onClick(track)}>
        <p style={{fontWeight: "bold", fontSize: "150%"}}>{track.title}</p>
        <p>{track.artist}</p>
        <p style={{fontStyle: "italic"}}>{track.album}</p>
    </div>;
}

const LibraryTrackContainer = connect(
    null,
    {
        onClick: (track) => ({type: "play_track", track})
    }
)(LibraryTrack) as React.ComponentClass<{track: any}>;

function Library({library}) {
    return <div>
        {library.map((track, index) => <LibraryTrackContainer key={index} track={track} />)}
    </div>;
}
const LibraryContainer = connect(
    (state) => ({library: state.library})
)(Library)

function App() {
    return <div>
        <PlayerContainer />
        <LibraryContainer />
    </div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
