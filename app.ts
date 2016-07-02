import * as _ from "lodash";
import * as React from "react";
import {render} from "react-dom";
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import {reducer as form_reducer} from "redux-form";
import { Router, Route, Link, browserHistory } from "react-router";
import thunk from "redux-thunk";

import * as actions from "./actions";
import {is_action, types as atypes} from "./actions";
import {reload_library, library as library_store, set_library} from "./jsx/library";

import {mkdom} from "./jsx/index.tsx";

require("./bootstrap-3.3.6/css/bootstrap.min.css");
require("./bootstrap-3.3.6/css/bootstrap-theme.min.css");
require("./node_modules/react-treeview-lazy/react-treeview.css");

const store = createStore(combineReducers({
    form: form_reducer,
    error_msg: (state=null, action: actions.IAction): string => {
        // TODO: A way to dismiss the error
        if(is_action<actions.IErrorMessage>(action, atypes.ERROR_MESSAGE)) {
            return action.message || "Unknown error";
        }

        return null;
    },
    config: (state: IConfig = {music_host: null}, action: actions.IAction): IConfig => {
        if(
            is_action<actions.IUpdateConfig>(action, atypes.UPDATE_CONFIG) &&
            action.config
        ) {
            return action.config;
        }

        return state;
    },
    action_logger: (state = null, action: actions.IAction) => {
        console.log("base", action);
        return state;
    },
    library_filter: (state = "", action: actions.IAction) => {
        if(is_action<actions.ILibraryFilter>(action, atypes.LIBRARY_FILTER)) {
            return action.filter;
        }

        return state;
    },
    playlist: (state: IPlaylistStore = {playlist: [], current_track: null}, action: actions.IAction): IPlaylistStore => {
        function find_next_track(tracks: ITrack[]): ITrack {
            const i = tracks.indexOf(state.current_track);
            if(i === -1) throw new Error("Error finding track in library");
            // TODO: Update message for "previous tracks" case
            if(i+1 > tracks.length) throw new Error("No next track to play");
            return tracks[i+1];
        }

        if(is_action<actions.IPlayTrack>(action, atypes.PLAY_TRACK)) {
            console.log("Setting current track", action.track);
            state.current_track = action.track;
            return _.clone(state);
        } else if(
            is_action<actions.ITrackEnded>(action, atypes.TRACK_ENDED) ||
            is_action<actions.INextTrack>(action, atypes.NEXT_TRACK)
        ) {
            const tracks = state.playlist;
            state.current_track = find_next_track(tracks);
            return _.clone(state);
        } else if(
            is_action<actions.IPrevTrack>(action, atypes.PREV_TRACK)
        ) {
            const tracks = <ITrack[]>_.reverse(_.clone(state.playlist));
            state.current_track = find_next_track(tracks);
            return _.clone(state);
        } else if(
            is_action<actions.IAddToPlaylist>(action, atypes.ADD_TO_PLAYLIST)
        ) {
            state.playlist = [...state.playlist, ...action.tracks];
            return _.clone(state);
        } else if(
            is_action<actions.IClearPlaylist>(action, atypes.CLEAR_PLAYLIST)
        ) {
            state.playlist = [];
            return _.clone(state);
        } else if(
            is_action<actions.IShufflePlaylist>(action, atypes.SHUFFLE_PLAYLIST)
        ) {
            state.playlist = _.shuffle(state.playlist);
            return _.clone(state);
        } else if(
            is_action<actions.IRemoveFromPlaylist>(action, atypes.REMOVE_FROM_PLAYLIST)
        ) {
            const t_ = action.track;
            state.playlist = state.playlist.filter(t => t !== t_);
            return _.clone(state);
        }

        return state;
    }
}), applyMiddleware(thunk));

set_library(JSON.parse(localStorage.getItem("library")) || []);

store.dispatch({
    type: atypes.UPDATE_CONFIG,
    config: JSON.parse(localStorage.getItem("config"))
});

console.log(store.getState().config);
reload_library(store.getState().config).
catch(err => {
    store.dispatch({type: atypes.ERROR_MESSAGE, message: err.message || err});
    throw err;
});

render(
    mkdom(store),
    document.getElementById("react-target")
);
