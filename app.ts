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
            return action.data.filter(track => track.artist && track.album && track.title && track.path);
        } else {
            return state
        }
    }
}));

window.fetch("/tracks.json").
then(response => response.json()).
then(library => store.dispatch({type: "update-library", data: library}));

render(
    mkdom(store),
    document.getElementById("react-target")
);
