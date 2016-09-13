import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {Glyphicon, Button} from "react-bootstrap";
import {types as atypes} from "../actions";

require("../styles/style.css");

function TrackView(
    {track, is_current, dispatch}:
    {track: ITrack, is_current: boolean, dispatch: any}
) {
    const handleClick = () => dispatch({type: atypes.PLAY_TRACK, track: track});
    return (
        <div className={`track-container ${is_current ? "current-track" : ""}`}>
            <div className="track-title" onClick={handleClick}>{track.title}</div>
            <div className="track-artist-album">
                <div className="track-artist" onClick={handleClick}>{track.artist}</div>
                <div className="track-album" onClick={handleClick}>{track.album}</div>
            </div>

            <div className="track-delete-button">
                <a href="#" onClick={() => dispatch({type: atypes.REMOVE_FROM_PLAYLIST, track})}>
                    <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
                </a>
            </div>
        </div>
    );
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
        <div id="playlist-buttons">
            <Button onClick={() => dispatch({type: atypes.SHUFFLE_PLAYLIST})}>
                <Glyphicon glyph="glyphicon glyphicon-random" />
                <span style={{marginLeft: "0.5em"}}>Shuffle</span>
            </Button>

            <Button onClick={() => dispatch({type: atypes.CLEAR_PLAYLIST})}>
                <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
                <span style={{marginLeft: "0.5em"}}>Clear</span>
            </Button>
        </div>

        <div id="playlist">
            {tracks.map((track, i) => (
                <Track
                    key={i}
                    track={track}
                    is_current={_.isEqual(track, current_track)}
                />
            ))}
        </div>
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
