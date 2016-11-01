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
    {track, next_track, track_ended, music_host, dispatch}:
    {track: ITrack, next_track: ITrack, track_ended: any, music_host: string, dispatch: any}
) {
    if(!track) return null;

    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = "";
    }

    function trans_url(type: string, track: ITrack) {
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

    function key_for_track(track: ITrack) {
        return `${track.artist} - ${track.album} - ${track.title}`;
    }

    function mksources(track: ITrack) {
        const track_key = key_for_track(track);

        return [
            ...track.formats.map(format =>
                <source
                    key={format.format + track_key}
                    src={new URI(format.url).absoluteTo(music_host).toString()}
                    onError={e => console.error(e.nativeEvent)}
                    type={mime_type(format.format)}
                />
            ),
            <source key={`trans-ogg-${track_key}`} src={trans_url("ogg", track)} type="audio/ogg; codec=vorbis" />,
            <source key={`trans-mp3-${track_key}`} src={trans_url("mp3", track)} type="audio/mpeg; codec=mp3" />,
            // <source key="mp4" src={trans_url("mp4")} type="audio/mp4" />,
            <source key={`trans-wav-${track_key}`} src={trans_url("wav", track)} type="audio/wav" />,
        ];
    }

    return (
        <div id="player">
            {header}
            <audio
                key={key_for_track(track)}
                controls={true}
                style={{width: "100%"}}
                autoPlay={true}
                preload={"auto"}
                onEnded={track_ended}
                onError={(e: any) => {
                    if(e.target.error.code === e.target.error.MEDIA_ERR_NETWORK || e.target.error.code === e.target.error.MEDIA_ERR_NETWORK) {
                        track_ended();
                    }
                }}
            >
                {mksources(track)}
            </audio>
            {next_track ? <audio
                key={key_for_track(next_track)}
                controls={false}
                style={{width: "100%"}}
                autoPlay={false}
                preload={"auto"}
                onEnded={track_ended}
                onError={(e: any) => {
                    if(e.target.error.code === e.target.error.MEDIA_ERR_NETWORK || e.target.error.code === e.target.error.MEDIA_ERR_NETWORK) {
                        track_ended();
                    }
                }}
            >
                {mksources(next_track)}
            </audio>
            : null}
            <div id="player-next-prev-btns">
                <Button key="previous" onClick={() => dispatch({type: atypes.PREV_TRACK})}>
                    <Glyphicon glyph="glyphicon glyphicon-step-backward" />
                </Button>

                <Button key="next" onClick={() => dispatch({type: atypes.NEXT_TRACK})}>
                    <Glyphicon glyph="glyphicon glyphicon-step-forward" />
                </Button>
            </div>
        </div>
    );
}
const PlayerContainer = connect(
    (state) => ({
        track: state.playlist.current_track,
        next_track: state.playlist.next_track,
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
