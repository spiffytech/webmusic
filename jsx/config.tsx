import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {connect} from "react-redux";
import {reduxForm as redux_form} from "redux-form";
import {Button} from "react-bootstrap";
import * as mobx from "mobx";
import {observable, action} from "mobx";
import {observer} from "mobx-react";

import {types as atypes} from "../actions";
import {reload_library} from "./library";

mobx.useStrict(true);

function handleSubmit(config: IConfig, dispatch, event) {
    event.preventDefault();
    localStorage.setItem("config", JSON.stringify(mobx.toJS(config)));
    dispatch({type: atypes.UPDATE_CONFIG, config: mobx.toJS(config)});

    return reload_library(config.music_hosts).
    catch(err => {
        dispatch({type: atypes.ERROR_MESSAGE, message: err.message});
        throw err;
    });
}

function handleChange(val: Object, key: string) {
    return action(function(event) {
        val[key] = event.target.value;
    });
}

function ConfigForm({config, dispatch}: {config: IConfig, dispatch: Redux.Dispatch}) {
    const music_host =
        config.music_hosts.length > 0 ?
        config.music_hosts[0].listing_url :
        "";
    return <div className="row">
        <form onSubmit={handleSubmit.bind(null, config, dispatch)}>
            <label>
                Music host:
                <input type="url"
                    name="music_host"
                    value={music_host}
                    onChange={handleChange(config.music_hosts[0], "listing_url")}
                />
                <p>Must be valid, full URL.</p>
            </label>
            <Button type="submit">
                Save configuration
            </Button>
        </form>
    </div>;
}

(ConfigForm as React.StatelessComponent<{config: IConfig}>).propTypes = {
    config: React.PropTypes.object
};

export const Config = connect(
    state => ({config: observable(state.config as IConfig)}),
    {dispatch: action => action}
)(observer(ConfigForm));
