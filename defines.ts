interface ITrack {
    title: string;
    album: string;
    artist: string;
    path: string;
    length?: number;
    track_num?: number;
    formats?: any[];
}

interface IPlaylistStore {
    playlist: ITrack[];
    current_track: ITrack;
}

interface IConfig {
    music_host: string;
}
