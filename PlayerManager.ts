import {computed, observable} from "mobx";

export class PlayerManager {
    public track_url = observable<string>(null);
    public playlist = observable<ITrack>([]);
    public current_track_id = observable(null as string);
    public current_track = computed(() =>
        this.playlist.find(track => track.id === this.current_track_id.get())
    );
    public next_track = computed(() =>
        const curr_track_index = this.playlist.findIndex(track => track.id === this.current_track_id.get())
        return this.playlist.length <= curr_track_index
    );
}
