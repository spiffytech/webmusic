// TODO: Figure out how to import Redux's IAction interface from the tsd here
interface IAction {
    type: string | number
}

interface IUpdateLibrary extends IAction {
    data: ITrack[]
}

interface  IPlayTrack extends IAction {
    track: ITrack
}

interface  ILibraryFilter extends IAction {
    filter: string
}

interface  IAddToPlaylist extends IAction {
    tracks: ITrack[]
}

interface  IClearPlaylist extends IAction {
}

interface  IShufflePlaylist extends IAction {
}

interface  IUpdateConfig extends IAction {
    config: IConfig
}

export function isUpdateLibrary(action: IAction): action is IUpdateLibrary {
    return action.type === "update-library"
}

export function isPlayTrack(action: IAction): action is IPlayTrack {
    return action.type === "play_track"
}

export function isLibraryFilterChange(action: IAction): action is ILibraryFilter {
    return action.type === "library_filter"
}

export function isAddToPlaylist(action: IAction): action is IAddToPlaylist {
    return action.type === "add_to_playlist"
}

export function isClearPlaylist(action: IAction): action is IClearPlaylist {
    return action.type === "clear_playlist"
}

export function isShufflePlaylist(action: IAction): action is IShufflePlaylist {
    return action.type === "shuffle_playlist"
}

export function isUpdateConfig(action: IAction): action is IUpdateConfig {
    return action.type === "update_config"
}
