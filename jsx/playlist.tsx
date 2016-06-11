import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {Grid, Row, Col, Glyphicon, Button} from "react-bootstrap";

function TrackView(
    {track, is_current, dispatch}:
    {track: ITrack, is_current: boolean, dispatch: any}
) {
    const style = is_current ? {fontWeight: "bold"} : {};
    const handleClick = () => dispatch({type: "play_track", track: track});
    return <Row style={style}>
        <Col xs={12} sm={12} md={4} onClick={handleClick}>{track.title}</Col>
        <Col xs={5} sm={5} md={3} onClick={handleClick}>{track.artist}</Col>
        <Col xs={7} sm={6} md={4} onClick={handleClick}>{track.album}</Col>
        <Col xs={7} sm={1} md={1}>
            <Button onClick={() => dispatch({type: "remove_track", track})}>
                <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
            </Button>
        </Col>
    </Row>;
}

export const Track = connect(
    null,
    {dispatch: _.identity}
)(TrackView) as (React.ComponentClass<{track: ITrack, is_current: boolean}>);

function PlaylistView(
    {tracks, current_track, dispatch}:
    {tracks: ITrack[], current_track: ITrack, dispatch: any}
) {
    return <div>
        <Button onClick={() => dispatch({type: "shuffle_playlist"})}>
            <Glyphicon glyph="glyphicon glyphicon-random" />
            <span style={{marginLeft: "0.5em"}}>Shuffle</span>
        </Button>

        <Button onClick={() => dispatch({type: "clear_playlist"})}>
            <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
            <span style={{marginLeft: "0.5em"}}>Clear</span>
        </Button>
        <Grid fluid={true}>
            {tracks.map((track, i) => <Track
                key={i}
                track={track}
                is_current={_.isEqual(track, current_track)}
            />)}
        </Grid>
    </div>;
}

export const Playlist =
    connect(
        state => ({
            tracks: state.playlist.playlist,
            current_track: state.playlist.current_track
        }),
        {dispatch: _.identity}
    )(PlaylistView);
