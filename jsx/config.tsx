import * as React from "react";
import {connect} from "react-redux";
import {
    Button,
    Glyphicon,
    Form,
    FormGroup,
    InputGroup,
    FormControl,
    ControlLabel
} from "react-bootstrap";
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

const add_music_host = action(function add_music_host(config: IConfig) {
    const uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        const r = Math.random()*16|0, v = c === "x" ? r : (r&0x3|0x8);
        return v.toString(16);
    });

    config.music_hosts.push({
        id: uuid,
        friendly_name: "",
        listing_url: "",
        enabled: true,
        default: false
    });
});

const MusicHost = observer(function MusicHost(
    {music_host, onChange, onDelete}:
    {music_host: MusicHost, onChange: any, onDelete: any}
) {
    return <FormGroup>
        <ControlLabel>Music host</ControlLabel>
        <InputGroup>
            <FormControl
                type="url"
                name="music_host"
                value={music_host.listing_url}
                onChange={onChange(music_host, "listing_url")}
            />

            <Button onClick={onDelete.bind(null, music_host)}>
                <Glyphicon glyph="glyphicon glyphicon-remove-sign" />
            </Button>

            <FormControl.Static>Must be valid, full URL.</FormControl.Static>
        </InputGroup>
    </FormGroup>;
});

function ConfigForm({config, dispatch}: {config: IConfig, dispatch: Redux.Dispatch}) {
    const handleDelete = action((music_host) =>
        (config.music_hosts as mobx.IObservableArray<MusicHost>).remove(music_host));

    return <div className="row">
        <Form vertical onSubmit={handleSubmit.bind(null, config, dispatch)}>
            {config.music_hosts.map((music_host, i) =>
                <MusicHost
                    key={i}
                    music_host={music_host}
                    onChange={handleChange}
                    onDelete={handleDelete}
                />
            )}

            <Button type="button" onClick={add_music_host.bind(null, config)}>
                Add music host
            </Button>

            <Button type="submit">
                Save configuration
            </Button>
        </Form>
    </div>;
}

(ConfigForm as React.StatelessComponent<{config: IConfig}>).propTypes = {
    config: React.PropTypes.object
};

export const Config = connect(
    state => ({config: observable(state.config as IConfig)}),
    {dispatch: action => action}
)(observer(ConfigForm));
