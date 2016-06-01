import * as _ from "lodash";
import * as React from "react";
const fuzzy = require("fuzzy");
const latinize = require("latinize");
const TreeView = require("react-treeview");
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

function Player({track, track_ended, dispatch}) {
    const audio_source = track ? "http://localhost:8000/" + track.path : null
    let header = undefined;
    if(track) {
        header = <p>{track.title} / {track.artist} - {track.album}</p>;
    } else {
        header = ""
    }
    return (
        <div>
            {header}
            <audio
                controls="controls"
                style={{width: "100%"}}
                autoPlay="true"
                src={audio_source}
                onEnded={track_ended}
            >
            </audio>
            <button onClick={() => dispatch({type: "prev_track"})}>Prev</button>
            <button onClick={() => dispatch({type: "next_track"})}>Next</button>
        </div>
    );
}
const PlayerContainer = connect(
    (state) => ({track: state.playlist.current_track}),
    {
        dispatch: action => action,
        track_ended: () => ({type: "track_ended"})
    }
)(Player);

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
            <LibraryAlbum album={album} tracks={tracks} />
        )}
    </TreeView>
}

const fuzzy_filter = _.throttle((library, filter) =>
    fuzzy.filter(
        latinize(filter),
        library,
        {extract: track => latinize(`${track.title} - ${track.artist} - ${track.album}`)}
    ).map(result => result.original), 500);

function Library({library, filter, dispatch}) {
    const filtered = fuzzy_filter(library, filter);
    const by_artist = _.groupBy<ITrack, string>(filtered, "artist");

    return <div>
        <input onChange={
            (e : any) => dispatch({type: "library_filter", filter: e.target.value})
        } />
        {_.map(by_artist, (tracks, artist) =>
            <LibraryArtist artist={artist} tracks={tracks} />
        )}
    </div>;
}
const LibraryContainer = connect(
    (state) => ({library: state.library, filter: state.library_filter}),
    {
        dispatch: action => action,
    }
)(Library)

function App() {
    return <div>
        <PlayerContainer />
        <LibraryContainer />
    </div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
