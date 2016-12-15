import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
import * as Ajv from "ajv";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview-lazy");
import {Glyphicon, Button} from "react-bootstrap";
import {types as atypes} from "../actions";
import {action, asMap, autorun, observable, useStrict, IObservableArray, ObservableMap} from "mobx";
import {observer} from "mobx-react";

useStrict(true);

interface Collection {
    tracks: ITrack[];
}

interface ILibrary {
    filter: string;
    collections: ObservableMap<Collection>;
}

export const library: ILibrary = observable({
    filter: "",
    collections: asMap<Collection>()
});

autorun(()  => console.log("lib filter", library.filter));
autorun(()  => console.log("collections changed", library.collections));

(window as any).library = library;

const track_schema = Ajv().compile({
    properties: {
        title: {
            type: "string"
        },
        album: {
            type: "string"
        },
        artist: {
            type: "string"
        },
        formats: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    format: {
                        type: "string"
                    },
                    url: {
                        type: "string",
                    }
                }
            },
            required: ["format", "url"]
        },
        length: {
            type: "number"
        },
        track_num: {
            type: "number"
        }
    },
    required: ["title", "album", "artist", "formats"]
});

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
        return fetch(host.listing_url).
        then(response => response.json() as Promise<ITrack[]>).
        then(tracks => tracks.filter((track: ITrack) => {
            if(!track_schema(track)) console.log(JSON.stringify(track_schema.errors));
            return track_schema(track);
        })).
        then(tracks => {
            // localStorage.setItem("library", JSON.stringify(tracks));
            set_collection(host.id, tracks);
        }).
        catch(ex => {
            console.error(ex);
            throw ex;
        });
    }));
}

function ItemLabelView(
    {label, tracks, on_text_click = null, dispatch}:
    {label: string, tracks: ITrack[], dispatch: any, on_text_click: any}
) {
    return (
        <div className="item-label">
            <div className="item-title" onClick={on_text_click}>{label}</div>
            <Button
                className="item-add-button"
                onClick={() => dispatch({type: atypes.ADD_TO_PLAYLIST, tracks: tracks})}
            >
                <Glyphicon glyph="glyphicon glyphicon-plus" />
            </Button>
        </div>
    );
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
        {_.map(tracks, (track:ITrack) =>
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

export const Library = observer(function Library({library}: {library: ILibrary}) {
    const collections = library.collections.values();
    const tracks: ITrack[] = _(collections).
    map(collection => (collection.tracks as IObservableArray<ITrack>).slice()).
    flatten<ITrack>().
    value();

    const filter = library.filter;
    const filtered = fuzzy_filter(tracks, filter);
    const by_artist: [string, ITrack[]] = (_(filtered).
        groupBy<ITrack, string>("artist").
        toPairs<[string, ITrack[]]>().
        sortBy(([artist]: [string, ITrack[]]) => artist.toLowerCase()).
        sortBy(([, tracks]) => tracks.length > 8 ? -1 : 1).
        value() as any);

    return <div id="library">
        <input name="library_filter" onChange={
            action((e: any) => library.filter = e.target.value)
        } />
        {_.map(by_artist, ([artist, tracks]: [string, ITrack[]]) =>
            <LibraryArtist key={artist} artist={artist} tracks={tracks} />
        )}
    </div>;
});
