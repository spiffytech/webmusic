export const types = {
    PLAY_TRACK: "play_track",
    TRACK_ENDED: "track_ended",
    // TODO: handle
    PREV_TRACK: "prev_track",
    NEXT_TRACK: "next_track",
    LIBRARY_FILTER: "library_filter",
    ADD_TO_PLAYLIST: "add_to_playlist",
    REMOVE_FROM_PLAYLIST: "remove_track",
    CLEAR_PLAYLIST: "clear_playlist",
    SHUFFLE_PLAYLIST: "shuffle_playlist",
    UPDATE_CONFIG: "update_config",
    ERROR_MESSAGE: "error_msg"
} ;

// TODO: Figure out how to import Redux's IAction interface from the tsd here
export interface IAction {
    type: string | number;
}

export interface IPlayTrack extends IAction {
    track: ITrack;
}

export interface ITrackEnded extends IAction {
}

export interface IPrevTrack extends IAction {
}

export interface INextTrack extends IAction {
}

export interface ILibraryFilter extends IAction {
    filter: string;
}

export interface IAddToPlaylist extends IAction {
    tracks: ITrack[];
}

export interface IClearPlaylist extends IAction {
}

export interface IShufflePlaylist extends IAction {
}

export interface IRemoveFromPlaylist extends IAction {
    track: ITrack;
}

export interface IUpdateConfig extends IAction {
    config: IConfig;
}

export interface IErrorMessage extends IAction {
    message?: any;
}

export function is_action<actionType extends IAction>(action: IAction, type: string): action is actionType {
    return action.type === type;
}
