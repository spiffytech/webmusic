// This is for using WebPack loaders. Only works with non-global require()
// (i.e., called from inside a function)
// <reference path="typings/require.d.ts" />

import * as React from "react";
import {render} from "react-dom";
import {createStore, combineReducers} from "redux";
import {Provider} from "react-redux";

//import * as dom from "./jsx/index.tsx";
import {mkdom} from "./jsx/index.tsx";

const store = createStore(combineReducers({
    action_logger: (state = {}, action) => {
        console.log("base", action);
        return state
    },
    library: (state = [], action) => {
        if(action.type === "update-library") {
            return action.data.filter(track => track.artist && track.album && track.title && track.path).filter(track => track.path.endsWith("mp3"));
        } else {
            return state
        }
    },
    current_track: (state = null, action) => {
        if(action.type === "play_track") {
            return action.track
        } else if(action.type === "track_ended") {
            const library = store.getState().library;
            const i = library.indexOf(state);
            if(i === -1) throw new Error("Error finding track in library");
            if(i+1 > library.length) throw new Error("No next track to play");
            return library[i+1];
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
