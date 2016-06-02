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

function PlaylistView({tracks}: {tracks: ITrack[]}) {
    console.log("tracks", tracks);
    return <div>
        {tracks.map((track, i) => <Track key={i} track={track} />)}
    </div>;
}

export const Playlist =
    connect(
        state => ({tracks: state.playlist.playlist})
    )(PlaylistView);
