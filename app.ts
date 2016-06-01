import * as _ from "lodash";
import * as React from "react";
import {render} from "react-dom";
import {createStore, combineReducers} from "redux";
import {Provider} from "react-redux";

import * as actions from "./actions"

import {mkdom} from "./jsx/index.tsx";

require("./node_modules/react-treeview/react-treeview.css")

import './styles/foundation.scss'
// load jquery and foundation in the window scope
import 'script!jquery'
import 'script!what-input'
import 'script!foundation-sites'


const store = createStore(combineReducers({
    action_logger: (state = {}, action) => {
        console.log("base", action);
        return state
    },
    library: (state = [], action) => {
        if(actions.isUpdateLibrary(action)) {
            return action.data.filter(track => track.artist && track.album && track.title && track.path).filter(track => track.path.endsWith("mp3"));
        } else {
            return state
        }
    },
    library_filter: (state = "", action) => {
        if(actions.isLibraryFilterChange(action)) {
            return action.filter;
        } else {
            return state;
        }
    },
    playlist: (state : IPlaylistStore = {playlist: [], current_track: null}, action) : IPlaylistStore => {
        if(actions.isPlayTrack(action)) {
            console.log("Setting current track", action.track);
            state.current_track = action.track;
            return _.clone(state);
        } else if(action.type === "track_ended" || action.type === "next_track") {
            // TODO: Search playlist instead of library
            const library  : ITrack[] = store.getState().library;
            const i = library.indexOf(state.current_track);
            if(i === -1) throw new Error("Error finding track in library");
            if(i+1 > library.length) throw new Error("No next track to play");
            state.current_track = library[i+1];
            return _.clone(state);
        } else {
            return state
        }
    }
}));

store.dispatch({
    type: "update-library",
    data: JSON.parse(localStorage.getItem("library")) || []
});

window.fetch("/tracks.json").
then(response => response.json()).
then(library => {
    localStorage.setItem("library", JSON.stringify(library));
    store.dispatch({type: "update-library", data: library});
});

render(
    mkdom(store),
    document.getElementById("react-target")
);
