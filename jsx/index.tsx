import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router";

import {LibraryContainer} from "./library";
import {Playlist} from "./playlist";

function Player(
    {track, track_ended, dispatch}:
    {track: ITrack, track_ended: any, dispatch: any}
) {
    const audio_source = track ? "http://localhost:8000/" + track.path : null
    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = ""
    }

    function trans_url(type) {
        const transcode_server = "http://localhost:3001";
        const url = encodeURIComponent(audio_source);
        return `${transcode_server}/transcode?output_format=${type}&url=${url}`;
    }
    let sources = null;
    if(audio_source) {
        sources = [
            <source src={audio_source} onError={e => console.error(e.nativeEvent)}/>,
            <source src={trans_url("ogg")} type="audio/ogg" />,
            <source src={trans_url("mp3")} type="audio/mpeg" />,
            <source src={trans_url("mp4")} type="audio/mp4" />,
            <source src={trans_url("wav")} type="audio/wav" />,
        ];
    }

    const audio_key = track ? `${track.artist} - ${track.album} - ${track.title}` : null;
    return (
        <div>
            {header}
            <audio
                key={audio_key}
                controls="controls"
                style={{width: "100%"}}
                autoPlay="true"
                onEnded={track_ended}
                onError={e => console.error(e.nativeEvent)}
            >
                {sources}
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
            <div className="small-12 medium-8 columns">
                <Playlist key="playlist" />
            </div>
        </div>
    </div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="build" component={App}></Route>
            </Route>
        </Router>
    </Provider>
}
