import * as React from "react";
import {Provider, connect} from "react-redux";
import {Router, Route, IndexRoute, browserHistory} from "react-router";
import {LinkContainer} from "react-router-bootstrap";
import {action, observable} from "mobx";
import {observer} from "mobx-react";

import {Grid, Row, Col, Button, Alert} from "react-bootstrap";

import {Library, library as library_store} from "./library";
import {Config} from "./config";
import {Playlist, PlaylistManager} from "./playlist";
import {Player, PlayerManager} from "./Player";

const username = observable<string>("");
fetch("/username", {credentials: "include"}).
then(r => r.text()).
then(action((u: string) => username.set(u)));

const loginField = observable<string>("");
function doLogin() {
    const email = loginField.get();
    const emailSafe = encodeURIComponent(email);
    return fetch(`/login?email=${emailSafe}`, {credentials: "include"});
}

const UsernameView = observer(function UsernameView() {
    return <p>{username.get()} | <input onChange={event => {
        action(() => loginField.set((event.target as any).value))();
    }} placeholder="email"/> <input type="submit" onClick={() => doLogin()} /></p>;
});

function AppView({error_msg, player_mgr, children}) {
    return <div>
        <UsernameView />
        <Grid fluid={true}>
            <Row id="nav-buttons">
                <LinkContainer to="/">
                    <Button>Home</Button>
                </LinkContainer>
                <LinkContainer to="/config">
                    <Button>Configuratorizor</Button>
                </LinkContainer>
                <LinkContainer to="/library" className="visible-xs visible-sm">
                    <Button>Library</Button>
                </LinkContainer>
            </Row>

            <Row>
                <Col xs={12}>
                    {
                        (() => {
                            if(error_msg) {
                                return <Alert bsStyle="warning">
                                    {error_msg}
                                </Alert>;
                            } else {
                                return null;
                            }
                        })()
                    }
                </Col>
            </Row>

            <Row>
                <Col xs={12}>
                    <Player player_mgr={player_mgr} />
                </Col>
            </Row>

            {children}
        </Grid>
    </div>;
}

const App = connect((state, ownProps: {player_mgr: PlayerManager}) =>
    ({error_msg: state.error_msg, player_mgr: ownProps.player_mgr})
)(AppView);

function Jukebox({playlist_mgr}: {playlist_mgr: PlaylistManager}) {
    return <Row>
        <Col sm={12} md={4}>
            <div id="library" className="hidden-xs hidden-sm">
                <Library library={library_store}  key="library" />
            </div>
        </Col>
        <Col sm={12} md={8}>
            <Playlist key="playlist" playlist_mgr={playlist_mgr} />
        </Col>
    </Row>;
}

export function mkdom(store, playlist_mgr: PlaylistManager, player_mgr: PlayerManager) {
    function JukeboxWrapped({children}) {
        return <Jukebox playlist_mgr={playlist_mgr}>{children}</Jukebox>;
    }

    function AppWithMgr({children}) {
        return <App player_mgr={player_mgr}>{children}</App>;
    }

    return <Provider store = {store}>
        <Router history={browserHistory}>
            <Route path="/" component={AppWithMgr}>
                <IndexRoute component={JukeboxWrapped} />
                <Route path="config" component={Config}></Route>
                <Route
                    path="library"
                    component={function()
                    {return <Library library={library_store} />;}}
                >
                </Route>
            </Route>
        </Router>
    </Provider>;
}
