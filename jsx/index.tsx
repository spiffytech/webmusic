import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";
import { Router, Route, IndexRoute, Link, browserHistory } from "react-router";
import * as URI from "urijs";

import {Grid, Row, Col, Button, Glyphicon} from "react-bootstrap";


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
            <source key="default" src={audio_source} onError={e => console.error(e.nativeEvent)}/>,
            <source key="ogg" src={trans_url("ogg")} type="audio/ogg" />,
            <source key="mp3" src={trans_url("mp3")} type="audio/mpeg" />,
            <source key="mp4" src={trans_url("mp4")} type="audio/mp4" />,
            <source key="wav" src={trans_url("wav")} type="audio/wav" />,
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
            <Button key="previous" onClick={() => dispatch({type: "prev_track"})}>
                <Glyphicon glyph="glyphicon glyphicon-step-backward" />
            </Button>

            <Button key="next" onClick={() => dispatch({type: "next_track"})}>
                <Glyphicon glyph="glyphicon glyphicon-step-forward" />
            </Button>
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
        <Grid fluid={true}>
            <Row>
                <Col xs={2}><Link to="/">Home</Link></Col>
                <Col xs={2}><Link to="/config">Configuratorizor</Link></Col>
                <Col xs={2}><Link to="/library" className="visible-xs visible-sm">Library</Link></Col>
                <Col xs={2}>{error_msg}</Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <PlayerContainer />
                </Col>
            </Row>

            {children}
        </Grid>
    </div>;
}

const App = connect(state => ({error_msg: state.error_msg}))(AppView);

function Jukebox() {
    return <Row>
        <Col sm={12} md={4}>
            <div className="hidden-xs hidden-sm">
                <LibraryContainer key="library" />
            </div>
        </Col>
        <Col sm={12} md={8}>
            <Playlist key="playlist" />
        </Col>
    </Row>
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
