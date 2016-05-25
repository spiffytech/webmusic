import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

function LibraryTrack({track}) {
    return <div key={track.path} style={{borderTop: "1px dashed black"}}>
        <p style={{fontWeight: "bold", fontSize: "150%"}}>{track.title}</p>
        <p>{track.artist}</p>
        <p style={{fontStyle: "italic"}}>{track.album}</p>
    </div>;
}

function Library({library}) {
    return <div>
        {library.map((track, index) => <LibraryTrack key={index} track={track} />)}
    </div>;
}
const LibraryContainer = connect(
    (state) => ({library: state.library})
)(Library)

function App() {
    return <div><LibraryContainer /></div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
