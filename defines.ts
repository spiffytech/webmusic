interface MusicFormat {
    format: string;
    url: string;
}

interface ITrack {
    title: string;
    album: string;
    artist: string;
    formats: MusicFormat[];
    length?: number;
    track_num?: number;
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
