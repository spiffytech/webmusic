import * as React from "react";
import {PropTypes} from "react";
import {Provider, connect} from "react-redux";

function ShowState({hello}) {
    return <p>hello, {hello}</p>
}

function App() {
    const map_state_to_props = (state) => ({hello: "world"});
    const Blah = connect(
        map_state_to_props
    )(ShowState)
    return <div><Blah /></div>;
}

export function mkdom(store) {
    return <Provider store = {store}>
        <App />
    </Provider>
}
