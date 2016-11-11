import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import {Glyphicon, Button} from "react-bootstrap";
import {types as atypes} from "../actions";
import {observable, computed, autorun} from "mobx";
import {observer} from "mobx-react";

import {Track} from "./Track";

require("../styles/style.css");

export class PlaylistManager {
    public playlist = observable<ITrack>([]);
    public current_track_id = observable<string | null>();

    public current_track = computed(() =>
        this.playlist.find(track => track.id === this.current_track_id.get())
    );

    public previous_track = computed(() => {
        const curr_track_index = _.findIndex(
            this.playlist.slice(),
            track => track.id === this.current_track_id.get()
        );

        return curr_track_index > 0 ?
            this.playlist[curr_track_index - 1] :
            null;
    });

    public next_track = computed(() => {
        const curr_track_index = _.findIndex(
            this.playlist.slice(),
            track => track.id === this.current_track_id.get()
        );

        return this.playlist.length < curr_track_index + 1 ?
            this.playlist[curr_track_index + 1] :
            null;
    });

    constructor() {
        autorun(() => console.log(this.current_track_id.get()));
        autorun(() => console.log(this.current_track.get()));
    }
}

const PlaylistView = observer<
    {playlist_mgr: PlaylistManager, dispatch: any}
>(function PlaylistView(
    {playlist_mgr, dispatch}
) {
    const tracks = playlist_mgr.playlist;
    const current_track_id = playlist_mgr.current_track_id.get();

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
                    is_current={track.id === current_track_id}
                />
            ))}
        </div>
    </div>;
});

export const Playlist =
    connect(
        (_state, ownProps: {playlist_mgr: PlaylistManager}) => ({
            playlist_mgr: ownProps.playlist_mgr
        }),
        {dispatch: _.identity}
    )(PlaylistView);
