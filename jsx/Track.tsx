import * as React from "react";
import * as _ from "lodash";
import {connect} from "react-redux";
import {Glyphicon} from "react-bootstrap";

import {types as atypes} from "../actions";

function TrackView(
    {track, is_current, dispatch}:
    {track: ITrack, is_current: boolean, dispatch: any}
) {
    const handleClick = () => dispatch({type: atypes.PLAY_TRACK, track: track});
    return (
        <div className={`track-container ${is_current ? "current-track" : ""}`}>
            <div onClick={handleClick} className="track-title">{track.title}</div>
            <div onClick={handleClick} className="track-artist-album">
                <div className="track-artist">{track.artist}</div>
                <div className="track-album">{track.album}</div>
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
