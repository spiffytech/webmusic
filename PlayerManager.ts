import {observable} from "mobx";

export class PlayerManager {
    public track_url = observable<string>(null);
    public playlist = observable<ITrack>([]);
}
