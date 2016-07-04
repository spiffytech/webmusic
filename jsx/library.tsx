import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import * as URI from "urijs";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview-lazy");
import {Grid, Row, Col, Glyphicon, Button} from "react-bootstrap";
import {types as atypes} from "../actions";
import * as mobx from "mobx";
import {observable, action, autorun, asMap as mobx_map} from "mobx";
import {observer} from "mobx-react";

mobx.useStrict(true);

interface Collection {
    tracks: ITrack[];
}

interface ILibrary {
    filter: string;
    collections: mobx.ObservableMap<Collection>;
}

export const library: ILibrary = observable({
    filter: "",
    collections: mobx_map<Collection>()
});

autorun(()  => console.log("lib filter", library.filter));
autorun(()  => console.log("collections changed", library.collections));

(window as any).library = library;

export const set_collection = action(function set_library(id: string, tracks) {
    const collection = library.collections.get(id) || {tracks: ([] as ITrack[])};
    collection.tracks = tracks;
    library.collections.set(id, collection);
});

export function reload_library(music_hosts: MusicHost[]) {
    console.log("Reloading library");
    // set_library(JSON.parse(localStorage.getItem("library")) || []);
    const hosts_enabled = _.filter(music_hosts, host => host.enabled);
    // TODO: handle when fetches fail (failing promises, RxJS?)
    // or, disable the broken source and retry?
    // or, swallow the error with .catch() and ignore the source?
    return Promise.all(hosts_enabled.map(host => {
        return window.fetch(host.listing_url).
        then(response => response.json()).
        then(tracks => tracks.filter((track: ITrack) =>
            Boolean(track.artist) &&
            Boolean(track.album) &&
            Boolean(track.title) &&
            Boolean(track.path)
        )).
        then(tracks => {
            // localStorage.setItem("library", JSON.stringify(tracks));
            set_collection(host.id, tracks);
        });
    }));
}

function ItemLabelView(
    {label, tracks, on_text_click = null, dispatch}:
    {label: string, tracks: ITrack[], dispatch: any, on_text_click: any}
) {
    return <span>
        <span onClick={on_text_click}>{label}</span>
        <Button
            onClick={() => dispatch({type: atypes.ADD_TO_PLAYLIST, tracks: tracks})}
        >
            <Glyphicon glyph="glyphicon glyphicon-plus" />
        </Button>
    </span>;
}
const ItemLabel = connect(
    null,
    {dispatch: action => action}
)(ItemLabelView) as React.ComponentClass<{
    label: string, tracks: ITrack[], on_text_click?: any
}>;

function LibraryTrack({track, onClick}) {
    const label =
        <ItemLabel
            label={track.title}
            tracks={[track]}
            on_text_click={() => onClick(track)}
        />;
    return <div key={track.title}>
        {label}
    </div>;
}

const LibraryTrackContainer = connect(
    null,
    {
        onClick: (track) => ({type: atypes.PLAY_TRACK, track})
    }
)(LibraryTrack) as React.ComponentClass<{track: ITrack}>;

function LibraryAlbum({album, tracks}) {
    const label = <ItemLabel label={album} tracks={tracks} />;
    return <TreeView key={album} lazy={true} nodeLabel={label} defaultCollapsed={true}>
        {_.map(tracks, (track:ITrack, album_name) =>
            <LibraryTrackContainer key={`${album}.${track.title}`} track={track} />
        )}
    </TreeView>;
}

function LibraryArtist({artist, tracks}) {
    const by_album = _.groupBy<ITrack, string>(tracks, "album");

    const label = <ItemLabel label={artist} tracks={tracks} />;

    return <TreeView key={artist} lazy={true} nodeLabel={label} defaultCollapsed={true}>
        {_.map(by_album, (tracks, album) =>
            <LibraryAlbum key={`${artist}.${album}`} album={album} tracks={tracks} />
        )}
    </TreeView>;
}

const fuzzy_filter = (library, filter) =>
    fuzzy.filter(
        latinize(filter),
        library,
        {extract: track => latinize(`${track.title} - ${track.artist} - ${track.album}`)}
    ).map(result => result.original);

const filter_dispatch = _.debounce((filter_string, dispatch) =>
    dispatch({type: atypes.LIBRARY_FILTER, filter: filter_string}),
    250);

export const Library = observer(function Library({library}: {library: ILibrary}) {
    const collections = library.collections.values();
    const tracks: ITrack[] = _(collections).
    map(collection => (collection.tracks as mobx.IObservableArray<ITrack>).slice()).
    flatten<ITrack>().
    value();

    const filter = library.filter;
    const filtered = fuzzy_filter(tracks, filter);
    const by_artist: [string, ITrack[]] = (_(filtered).
        groupBy<ITrack, string>("artist").
        toPairs<[string, ITrack[]]>().
        sortBy(([artist, _tracks]: [string, ITrack[]]) => artist.toLowerCase()).
        sortBy(([_artist, tracks]) => tracks.length > 8 ? -1 : 1).
        value() as any);

    return <div>
        <input name="library_filter" onChange={
            action((e: any) => library.filter = e.target.value)
        } />
        {_.map(by_artist, ([artist, tracks]: [string, ITrack[]]) =>
            <LibraryArtist key={artist} artist={artist} tracks={tracks} />
        )}
    </div>;
});
