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

export function isUpdateLibrary(action: IAction): action is IUpdateLibrary {
    return action.type === "update-library"
}

export function isPlayTrack(action: IAction): action is IPlayTrack {
    return action.type === "play_track"
}
