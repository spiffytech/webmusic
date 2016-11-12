import * as _ from "lodash";
import * as React from "react";
import {Glyphicon, Button} from "react-bootstrap";
import {action, autorun, computed, observable, intercept} from "mobx";
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

        return this.playlist.length > curr_track_index + 1 ?
            this.playlist[curr_track_index + 1] :
            null;
    });

    @action
    public shuffle() {
        this.playlist.replace(_.shuffle(this.playlist.slice()));
    }

    @action
    public clear() {
        this.playlist.clear();
    }

    constructor() {
        // TODO: This should be near the player, not inside the playlist
        intercept(this.current_track_id, change => {
            const audio = document.getElementsByTagName("audio");
            if (audio.length) audio[0].pause();

            return change;
        });

        autorun(() => console.log("current id", this.current_track_id.get()));
        autorun(() => console.log("current", this.current_track.get()));
        autorun(() => console.log("next", this.next_track.get()));
    }
}

export const Playlist = observer<
    {playlist_mgr: PlaylistManager}
>(function PlaylistView(
    {playlist_mgr}
) {
    const tracks = playlist_mgr.playlist;
    const current_track_id = playlist_mgr.current_track_id.get();

    return <div>
        <div id="playlist-buttons">
            <Button onClick={() => playlist_mgr.shuffle()}>
                <Glyphicon glyph="glyphicon glyphicon-random" />
                <span style={{marginLeft: "0.5em"}}>Shuffle</span>
            </Button>

            <Button onClick={() => playlist_mgr.clear()}>
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
