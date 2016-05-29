interface ITrack {
    title: string,
    album: string,
    artist: string,
    path: string,
}

interface IPlaylistStore {
    playlist: ITrack[],
    current_track: ITrack
}
