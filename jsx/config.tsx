import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {reduxForm as redux_form} from "redux-form";
import {Button} from "react-bootstrap";
import {types as atypes} from "../actions";

import {reload_library} from "./library";

interface IMyProps {
    fields: IConfig;
    handleSubmit: any;
    resetForm: any;
    submitting: any;
    dispatch: any;
}

function save(config, dispatch) {
    localStorage.setItem("config", JSON.stringify(config));
    dispatch({type: atypes.UPDATE_CONFIG, config});

    return reload_library(config).
    catch(err => {
        dispatch({type: atypes.ERROR_MESSAGE, message: err.message});
        throw err;
    });
}

class ConfigView extends React.Component<IMyProps, {}> {
    render() {
        const {
            fields: {music_host},
            handleSubmit,
            resetForm,
            submitting,
            dispatch
        } = this.props;

        return <div className="row">
            <form onSubmit={handleSubmit}>
                <label>
                    Music host:
                    <input type="url" {...music_host} pattern=".*/$" />
                    <p>Must be valid, full URL. Must have trailing slash.</p>
                </label>
                <Button type="submit" disabled={submitting}>
                    {submitting ? <i/> : <i/>} Save configuration
                </Button>
            </form>
        </div>;
    }
}

export const Config = redux_form(
    {
        form: "config",
        fields: ["music_host"],
        onSubmit: save
    },
    state => ({initialValues: state.config}),
    {dispatch: _.identity}
)(ConfigView);
