import * as _ from "lodash";
import * as React from "react";
import {PropTypes} from "react";
import {reduxForm as redux_form} from "redux-form";

interface IMyProps {
    fields: IConfig,
    handleSubmit: any,
    resetForm: any,
    submitting: any,
    dispatch: any
}

function save(dispatch, config) {
    dispatch({type: "update_config", config});
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
            <form onSubmit={handleSubmit(save.bind(null, dispatch))}>
                <label>
                    Music host:
                    <input type="url" {...music_host} />
                </label>
                <button className="button" type="submit" disabled={submitting}>
                    {submitting ? <i/> : <i/>} Save configuration
                </button>
            </form>
        </div>;
    }
}

export const Config = redux_form(
    {
        form: "config",
        fields: ["music_host"],
    },
    state => ({initialValues: state.config}),
    {dispatch: _.identity}
)(ConfigView);
