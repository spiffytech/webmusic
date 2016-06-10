import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router";
import * as URI from "urijs";
const F = require("react-foundation");

import 'script!jquery';
const foundation = require("foundation-sites/js/foundation.core").foundation;
import 'foundation-sites/js/foundation.util.mediaQuery';

import {LibraryContainer} from "./library";
import {Playlist} from "./playlist";
import {Config} from "./config";

function Player(
    {track, track_ended, music_host, dispatch}:
    {track: ITrack, track_ended: any, music_host: string, dispatch: any}
) {
    const audio_source = track ? new URI(track.path).absoluteTo(music_host).toString() : null
    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = ""
    }

    function trans_url(type) {
        const url = encodeURIComponent(audio_source);
        return `/transcode?output_format=${type}&url=${url}`;
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
    (state) => ({
        track: state.playlist.current_track,
        music_host: state.config.music_host
    }),
    {
        dispatch: action => action,
        track_ended: () => ({type: "track_ended"})
    }
)(Player);

function AppView({error_msg, children}) {
    return <div>
        <Link to="/">Home</Link>
        <Link to="/config">Configuratorizor</Link>
        <Link to="/library" className="show-for-small-only">Library</Link>
        <p>{error_msg}</p>

        <p className="panel">
          <strong className="show-for-small-only">This text is shown only on a small screen.</strong>
          <strong className="show-for-medium-up">This text is shown on medium screens and up.</strong>
          <strong className="show-for-medium-only">This text is shown only on a medium screen.</strong>
          <strong className="show-for-large-up">This text is shown on large screens and up.</strong>
          <strong className="show-for-large-only">This text is shown only on a large screen.</strong>
          <strong className="show-for-xlarge-up">This text is shown on xlarge screens and up.</strong>
          <strong className="show-for-xlarge-only">This text is shown only on an xlarge screen.</strong>
          <strong className="show-for-xxlarge-up">This text is shown on xxlarge screens and up.</strong>
        </p>

        <F.Row>
            <PlayerContainer />
        </F.Row>

        {children}
    </div>;
}

const App = connect(state => ({error_msg: state.error_msg}))(AppView);
console.log("?", Foundation.MediaQuery.atLeast('medium'));
console.log("?", Foundation.MediaQuery.current);

function Jukebox() {
    return <F.Row>
        <F.Column small={12} medium={4}>
            {
                Foundation.MediaQuery.atLeast('medium') ?
                <LibraryContainer key="library" /> :
                null
            }
        </F.Column>
        <F.Column small={12} medium={8}>
            <Playlist key="playlist" />
        </F.Column>
    </F.Row>
}

export function mkdom(store) {
    return <Provider store = {store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Jukebox} />
                <Route path="config" component={Config}></Route>
                <Route path="library" component={LibraryContainer}></Route>
            </Route>
        </Router>
    </Provider>
}
