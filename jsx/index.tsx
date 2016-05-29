import * as _ from "lodash";
import * as React from "react";
const fuzzy = require("fuzzy");
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

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

const fuzzy_filter = _.throttle((library, filter) =>
    fuzzy.filter(
        filter,
        library,
        {extract: track => `${track.title} - ${track.artist} - ${track.album}`}
    ).map(result => result.original), 500);

function Library({library, filter, dispatch}) {
    const start = new Date().getTime();
    const filtered = fuzzy_filter(library, filter);
    console.log((new Date()).getTime() - start);

    return <div>
        <input onChange={e => dispatch({type: "library_filter", filter: e.target.value})} />
        {filtered.map((track, index) => <LibraryTrackContainer key={index} track={track} />)}
    </div>;
}
const LibraryContainer = connect(
    (state) => ({library: state.library, filter: state.library_filter}),
    {
        dispatch: action => action,
    }
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
