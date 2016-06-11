import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {Grid, Row, Col, Glyphicon, Button} from "react-bootstrap";

function TrackView({track, dispatch}: {track: ITrack, dispatch: any}) {
    return <Row onClick={() => dispatch({type: "play_track", track: track})}>
        <Col xs={12} sm={12} md={5}>{track.title}</Col>
        <Col xs={5} sm={5} md={3}>{track.artist}</Col>
        <Col xs={7} sm={7} md={4}>{track.album}</Col>
    </Row>;
}

export const Track = connect(
    null,
    {dispatch: _.identity}
)(TrackView) as React.ComponentClass<{track: ITrack}>;

function PlaylistView({tracks, dispatch}: {tracks: ITrack[], dispatch: any}) {
    console.log("tracks", tracks);
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
            {tracks.map((track, i) => <Track key={i} track={track} />)}
        </Grid>
    </div>;
}

export const Playlist =
    connect(
        state => ({tracks: state.playlist.playlist}),
        {dispatch: _.identity}
    )(PlaylistView);
