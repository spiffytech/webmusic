import * as _ from "lodash";
import {render} from "react-dom";
import {createStore, combineReducers, applyMiddleware} from "redux";
import {reducer as form_reducer} from "redux-form";
import thunk from "redux-thunk";
import * as shortid from "shortid";
import {action} from "mobx";

import * as actions from "./actions";
import {is_action, types as atypes} from "./actions";
import {reload_library} from "./jsx/library";
import {PlaylistManager} from "./jsx/playlist";
import {PlayerManager} from "./jsx/Player";

import {mkdom} from "./jsx/index";

require("./bootstrap-3.3.6/css/bootstrap.min.css");
require("./bootstrap-3.3.6/css/bootstrap-theme.min.css");
require("./node_modules/react-treeview-lazy/react-treeview.css");

const playlist_mgr = new PlaylistManager();
const player_mgr = new PlayerManager(playlist_mgr);

const store = createStore(combineReducers({
    form: form_reducer,
    error_msg: (_state = null, action: actions.IAction): string => {
        // TODO: A way to dismiss the error
        if (is_action<actions.IErrorMessage>(action, atypes.ERROR_MESSAGE)) {
            return action.message || "Unknown error";
        }

        return null;
    },
    config: (state: IConfig = {music_hosts: []}, action: actions.IAction): IConfig => {
        if (
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
        if (is_action<actions.ILibraryFilter>(action, atypes.LIBRARY_FILTER)) {
            return action.filter;
        }

        return state;
    },
    playlist: action((state: IPlaylistStore = {}, action: actions.IAction): IPlaylistStore => {
        if (is_action<actions.IPlayTrack>(action, atypes.PLAY_TRACK)) {
            console.log("Setting current track", action.track);
            playlist_mgr.current_track_id.set(action.track.id);
            return _.clone(state);
        } else if (
            is_action<actions.IAddToPlaylist>(action, atypes.ADD_TO_PLAYLIST)
        ) {
            playlist_mgr.playlist.replace([
                ...playlist_mgr.playlist.slice(),
                ...action.tracks.map(track => _.merge(track, {id: shortid.generate()}))
            ]);
            return _.clone(state);
        } else if (
            is_action<actions.IRemoveFromPlaylist>(action, atypes.REMOVE_FROM_PLAYLIST)
        ) {
            const t_ = action.track;
            playlist_mgr.playlist.replace(playlist_mgr.playlist.filter(t => t !== t_));
            return _.clone(state);
        }

        return state;
    })
}), applyMiddleware(thunk));

let config = JSON.parse(localStorage.getItem("config")) || {};
if (config && config.music_host !== undefined) {
    console.log("Upgrading config...");
    config.music_hosts = [config.music_host];
    config = {
        music_hosts: [
            {
                id: "d991d867-f560-450c-adb6-b3690a6928cb",
                friendly_name: "My Music",
                listing_url: `${config.music_host}/tracks.json`,
                enabled: true,
                default: false
            }
        ]
    };
    localStorage.setItem("config", JSON.stringify(config));
}

if (!config) {
    const default_config = {music_hosts: []};
    config = default_config;
    localStorage.setItem("config", JSON.stringify(default_config));
}

store.dispatch({
    type: atypes.UPDATE_CONFIG,
    config: JSON.parse(localStorage.getItem("config"))
});

console.log(store.getState().config);
reload_library(config.music_hosts).
catch(err => {
    store.dispatch({type: atypes.ERROR_MESSAGE, message: err.message || err});
    throw err;
});

render(
    mkdom(store, playlist_mgr, player_mgr),
    document.getElementById("react-target")
);
