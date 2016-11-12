import * as React from "react";
import {Glyphicon} from "react-bootstrap";
import {action} from "mobx";
import {observer} from "mobx-react";

export const Track = observer<{
    track: ITrack,
    is_current: boolean,
    onPlay: (track_id: string) => void,
    onRemove: (track_id: string) => void
}>(function TrackView({track, is_current, onPlay: handlePlay, onRemove: handleRemove}) {
    const handleClick = action(() => handlePlay(track.id));
    return (
        <div className={`track-container ${is_current ? "current-track" : ""}`}>
            <div onClick={handleClick} className="track-title">{track.title}</div>
            <div onClick={handleClick} className="track-artist-album">
                <div className="track-artist">{track.artist}</div>
                <div className="track-album">{track.album}</div>
            </div>

            <div className="track-delete-button">
                <a href="#" onClick={() => handleRemove(track.id)}>
                    <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
                </a>
            </div>
        </div>
    );
});
