import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {Glyphicon, Button} from "react-bootstrap";

function TrackView({track, dispatch}: {track: ITrack, dispatch: any}) {
    return <p onClick={() => dispatch({type: "play_track", track: track})}>
        {`${track.title} - ${track.artist} - ${track.album}`}
    </p>
}

export const Track =
    connect(
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
        {tracks.map((track, i) => <Track key={i} track={track} />)}
    </div>;
}

export const Playlist =
    connect(
        state => ({tracks: state.playlist.playlist}),
        {dispatch: _.identity}
    )(PlaylistView);
