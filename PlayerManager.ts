import * as _ from "lodash";
import {autorun, computed, observable} from "mobx";

export class PlayerManager {
    public playlist = observable<ITrack>([]);
    public current_track_id = observable<string | null>();
    public current_track = computed(() =>
        this.playlist.find(track => track.id === this.current_track_id.get())
    );
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
