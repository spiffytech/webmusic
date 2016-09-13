import * as React from "react";
import {Provider, connect} from "react-redux";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import {LinkContainer} from "react-router-bootstrap";
import * as URI from "urijs";
import {types as atypes} from "../actions";

import {Grid, Row, Col, Button, Glyphicon, Alert} from "react-bootstrap";


import {Library, library as library_store} from "./library";
import {Playlist} from "./playlist";
import {Config} from "./config";

function Player(
    {track, track_ended, music_host, dispatch}:
    {track: ITrack, track_ended: any, music_host: string, dispatch: any}
) {
    if(!track) return null;

    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = "";
    }

    function trans_url(type) {
        const preferred_url = new URI(track.formats[0].url).absoluteTo(music_host).toString();
        const url = encodeURIComponent(preferred_url);
        return `/transcode?output_format=${type}&url=${url}`;
    }

    /**
     * Converts our canonical audio format string to an HTML5 audio mimetype
     */
    function mime_type(audio_type: string) {
        return {
            flac: "audio/flac",
            ogg: "audio/ogg",
            mp3: "audio/mpeg; codec=mp3",
            mp4: "audio/mp4",
            wav: "audio/wav"
        }[audio_type] || null;
    }

    const sources = [
        ...track.formats.map(format =>
            <source
                key={format.format}
                src={new URI(format.url).absoluteTo(music_host).toString()}
                onError={e => console.error(e.nativeEvent)}
                type={mime_type(format.format)}
            />
        ),
        <source key="trans-ogg" src={trans_url("ogg")} type="audio/ogg; codec=vorbis" />,
        <source key="trans-mp3" src={trans_url("mp3")} type="audio/mpeg; codec=mp3" />,
        // <source key="mp4" src={trans_url("mp4")} type="audio/mp4" />,
        <source key="trans-wav" src={trans_url("wav")} type="audio/wav" />,
    ];

    const audio_key = track ? `${track.artist} - ${track.album} - ${track.title}` : null;
    return (
        <div id="player">
            {header}
            <audio
                key={audio_key}
                controls={true}
                style={{width: "100%"}}
                autoPlay={true}
                onEnded={track_ended}
                onError={track_ended}
            >
                {sources}
            </audio>
            <Button key="previous" onClick={() => dispatch({type: atypes.PREV_TRACK})}>
                <Glyphicon glyph="glyphicon glyphicon-step-backward" />
            </Button>

            <Button key="next" onClick={() => dispatch({type: atypes.NEXT_TRACK})}>
                <Glyphicon glyph="glyphicon glyphicon-step-forward" />
            </Button>
        </div>
    );
}
const PlayerContainer = connect(
    (state) => ({
        track: state.playlist.current_track,
        music_host: (state.config as IConfig).music_hosts.length && (state.config as IConfig).music_hosts[0].listing_url || null
    }),
    {
        dispatch: action => action,
        track_ended: () => ({type: atypes.TRACK_ENDED})
    }
)(Player);

function AppView({error_msg, children}) {
    return <div>
        <Grid fluid={true}>
            <Row id="nav-buttons">
                <LinkContainer to="/">
                    <Button>Home</Button>
                </LinkContainer>
                <LinkContainer to="/config">
                    <Button>Configuratorizor</Button>
                </LinkContainer>
                <LinkContainer to="/library" className="visible-xs visible-sm">
                    <Button>Library</Button>
                </LinkContainer>
            </Row>

            <Row>
                <Col xs={12}>
                    {
                        (() => {
                            if(error_msg) {
                                return <Alert bsStyle="warning">
                                    {error_msg}
                                </Alert>;
                            } else {
                                return null;
                            }
                        })()
                    }
                </Col>
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
            <div id="library" className="hidden-xs hidden-sm">
                <Library library={library_store}  key="library" />
            </div>
        </Col>
        <Col sm={12} md={8}>
            <Playlist key="playlist" />
        </Col>
    </Row>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <IndexRoute component={Jukebox} />
                <Route path="config" component={Config}></Route>
                <Route
                    path="library"
                    component={function()
                    {return <Library library={library_store} />;}}
                >
                </Route>
            </Route>
        </Router>
    </Provider>;
}
