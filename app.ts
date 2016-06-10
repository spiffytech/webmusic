import * as _ from "lodash";
import * as React from "react";
import {render} from "react-dom";
import {createStore, combineReducers, applyMiddleware} from "redux";
import {Provider} from "react-redux";
import {reducer as form_reducer} from "redux-form";
import { Router, Route, Link, browserHistory } from "react-router";
import thunk from "redux-thunk";

import * as actions from "./actions"
import {reload_library} from "./jsx/library";

import {mkdom} from "./jsx/index.tsx";

require("./node_modules/react-treeview-lazy/react-treeview.css")

const store = createStore(combineReducers({
    form: form_reducer,
    error_msg: (state=null, action) => {
        // TODO: A way to dismiss the error
        if(action.type == "error_msg") return action.message || "Unknown error";
        return state;
    },
    config: (state: IConfig = {music_host: null}, action) => {
        if(actions.isUpdateConfig(action) && action.config) {
            return action.config;
        }

        return state;
    },
    action_logger: (state = {}, action) => {
        console.log("base", action);
        return state
    },
    library: (state: ITrack[] = [], action) => {
        if(actions.isUpdateLibrary(action)) {
            return action.data.filter(track =>
                track.artist &&
                track.album &&
                track.title &&
                track.path
            );
        }

        return state
    },
    library_filter: (state = "", action) => {
        if(actions.isLibraryFilterChange(action)) {
            return action.filter;
        }

        return state;
    },
    playlist: (state : IPlaylistStore = {playlist: [], current_track: null}, action) : IPlaylistStore => {
        if(actions.isPlayTrack(action)) {
            console.log("Setting current track", action.track);
            state.current_track = action.track;
            return _.clone(state);
        } else if(action.type === "track_ended" || action.type === "next_track") {
            const playlist = state.playlist;
            const i = playlist.indexOf(state.current_track);
            if(i === -1) throw new Error("Error finding track in library");
            if(i+1 > playlist.length) throw new Error("No next track to play");
            state.current_track = playlist[i+1];
            return _.clone(state);
        } else if(actions.isAddToPlaylist(action)) {
            state.playlist = [...state.playlist, ...action.tracks];
            return _.clone(state);
        } else if(actions.isClearPlaylist(action)) {
            state.playlist = [];
            return _.clone(state);
        } else if(actions.isShufflePlaylist(action)) {
            state.playlist = _.shuffle(state.playlist);
            return _.clone(state);
        }

        return state
    }
}), applyMiddleware(thunk));

store.dispatch({
    type: "update-library",
    data: JSON.parse(localStorage.getItem("library")) || []
});

store.dispatch({
    type: "update_config",
    config: JSON.parse(localStorage.getItem("config"))
});

console.log(store.getState().config);
reload_library(store.getState().config).
    then(library => store.dispatch({type: "update-library", data: library})).
    catch(err => store.dispatch({type: "error_msg", message: err.message || err}));

render(
    mkdom(store),
    document.getElementById("react-target")
);
