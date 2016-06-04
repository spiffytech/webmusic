import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";

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
        <button onClick={() => dispatch({type: "shuffle_playlist"})}>Shuffle</button>
        <button onClick={() => dispatch({type: "clear_playlist"})}>Clear</button>
        {tracks.map((track, i) => <Track key={i} track={track} />)}
    </div>;
}

export const Playlist =
    connect(
        state => ({tracks: state.playlist.playlist}),
        {dispatch: _.identity}
    )(PlaylistView);
