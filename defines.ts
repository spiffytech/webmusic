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

interface MusicHost {
    id: string;
    friendly_name: string;
    listing_url: string;
    enabled: boolean;
    default: boolean;
}

interface IConfig {
    music_hosts: MusicHost[];
}
