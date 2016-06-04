import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

import {LibraryContainer} from "./library";
import {Playlist} from "./playlist";

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
        <audio
            controls="controls"
            style={{width: "100%"}}
            autoPlay="true"
            src="http://localhost:3001/transcode?output_format=mp3&url=http%3A%2F%2Flocalhost%3A8000%2F%2Fhome%2Fspiffytech%2FMusic%2FYonder%20Mountain%20String%20Band%2FOld%20Hands%2F02%20Hill%20Country%20Girl.mp3"
        >
        </audio>
        <div className="row">
            <PlayerContainer />
        </div>

        <div className="row">
            <div className="small-12 medium-4 columns">
                <LibraryContainer key="library" />
            </div>
            <div className="small-12 medium-8 columns">
                <Playlist key="playlist" />
            </div>
        </div>
    </div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
