import * as _ from "lodash";
import * as React from "react";
import {connect} from "react-redux";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview");

function LibraryTrack({track, onClick}) {
    return <div key={track.title} onClick={() => onClick(track)}>
        {track.title}
    </div>;
}

const LibraryTrackContainer = connect(
    null,
    {
        onClick: (track) => ({type: "play_track", track})
    }
)(LibraryTrack) as React.ComponentClass<{track: ITrack}>;

function LibraryAlbum({album, tracks}) {
    return <TreeView key={album} nodeLabel={album} defaultCollapsed={true}>
        {_.map(tracks, (track:ITrack, album_name) =>
            <LibraryTrackContainer track={track} />
        )}
    </TreeView>
}

function LibraryArtist({artist, tracks}) {
    const by_album = _.groupBy<ITrack, string>(tracks, "album");

    return <TreeView key={artist} nodeLabel={artist} defaultCollapsed={true}>
        {_.map(by_album, (tracks, album) =>
            <LibraryAlbum key={album} album={album} tracks={tracks} />
        )}
    </TreeView>
}

const fuzzy_filter = _.throttle((library, filter) =>
    fuzzy.filter(
        latinize(filter),
        library,
        {extract: track => latinize(`${track.title} - ${track.artist} - ${track.album}`)}
    ).map(result => result.original), 0);

function Library({library, filter, dispatch}) {
    const filtered = fuzzy_filter(library, filter);
    const by_artist = _.groupBy<ITrack, string>(filtered, "artist");

    return <div>
        <input onChange={
            (e : any) => dispatch({type: "library_filter", filter: e.target.value})
        } />
        {_.map(by_artist, (tracks, artist) =>
            <LibraryArtist key={artist} artist={artist} tracks={tracks} />
        )}
    </div>;
}
export const LibraryContainer = connect(
    (state) => ({library: state.library, filter: state.library_filter}),
    {
        dispatch: action => action,
    }
)(Library)
