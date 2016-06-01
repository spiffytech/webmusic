import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

import {LibraryContainer} from "./library";

function Player({track, track_ended, dispatch}) {
    const audio_source = track ? "http://localhost:8000/" + track.path : null
    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = ""
    }
    return (
        <div>
            {header}
            <audio
                controls="controls"
                style={{width: "100%"}}
                autoPlay="true"
                src={audio_source}
                onEnded={track_ended}
            >
            </audio>
            <button onClick={() => dispatch({type: "prev_track"})}>Prev</button>
            <button onClick={() => dispatch({type: "next_track"})}>Next</button>
        </div>
    );
}
const PlayerContainer = connect(
    (state) => ({track: state.playlist.current_track}),
    {
        dispatch: action => action,
        track_ended: () => ({type: "track_ended"})
    }
)(Player);

function App() {
    return <div>
        <div className="row">
            <PlayerContainer />
        </div>

        <div className="row">
            <div className="small-12 medium-4 columns">
                <LibraryContainer key="library" />
            </div>
        </div>
    </div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
