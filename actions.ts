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

export function isUpdateLibrary(action: IAction): action is IUpdateLibrary {
    return action.type === "update-library"
}

export function isPlayTrack(action: IAction): action is IPlayTrack {
    return action.type === "play_track"
}


export function isLibraryFilterChange(action: IAction): action is ILibraryFilter {
    return action.type === "library_filter"
}
