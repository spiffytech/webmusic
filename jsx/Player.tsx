import * as React from "react";
import * as URI from "urijs";
import {IComputedValue} from "mobx";
import {observer} from "mobx-react";
import {Button, Glyphicon} from "react-bootstrap";
import {connect} from "react-redux";

import {types as atypes} from "../actions";
import {PlaylistManager} from "./playlist";

export class PlayerManager {
    public current_track: IComputedValue<ITrack>;
    public next_track: IComputedValue<ITrack>;

    constructor(playlist_mgr: PlaylistManager) {
        this.current_track = playlist_mgr.current_track;
        this.next_track = playlist_mgr.next_track;
    }
}

function PlayerHeader({track}: {track: ITrack | null}) {
    if(!track) return null;
    return <p>{track.title} / {track.artist} - {track.album}</p>;
}

const PlayerRaw = observer<{
    player_mgr: PlayerManager;
    track_ended: any;
    music_host: string;
    dispatch: any;
}>(function Player({player_mgr, track_ended, music_host, dispatch}) {
    const track = player_mgr.current_track.get();
    const next_track = player_mgr.next_track.get();

    if(!track) console.log("null track");
    if(!track) return null;

    function trans_url(type: string, track: ITrack) {
        const preferred_url = new URI(track.formats[0].url).absoluteTo(music_host).toString();
        const url = encodeURIComponent(preferred_url);
        return `/transcode?output_format=${type}&url=${url}`;
    }

    /**
     * Converts our canonical audio format string to an HTML5 audio mimetype
     */
    function mime_type(audio_type: string) {
        return {
            flac: "audio/flac",
            ogg: "audio/ogg",
            mp3: "audio/mpeg; codec=mp3",
            mp4: "audio/mp4",
            wav: "audio/wav"
        }[audio_type] || null;
    }

    function key_for_track(track: ITrack) {
        return `${track.artist} - ${track.album} - ${track.title}`;
    }

    function mksources(track: ITrack) {
        const track_key = key_for_track(track);

        return [
            ...track.formats.map(format =>
                <source
                    key={format.format + track_key}
                    src={new URI(format.url).absoluteTo(music_host).toString()}
                    onError={e => console.error(e.nativeEvent)}
                    type={mime_type(format.format)}
                />
            ),
            <source key={`trans-ogg-${track_key}`} src={trans_url("ogg", track)} type="audio/ogg; codec=vorbis" />,
            <source key={`trans-mp3-${track_key}`} src={trans_url("mp3", track)} type="audio/mpeg; codec=mp3" />,
            // <source key="mp4" src={trans_url("mp4")} type="audio/mp4" />,
            <source key={`trans-wav-${track_key}`} src={trans_url("wav", track)} type="audio/wav" />,
        ];
    }

    return (
        <div id="player">
            <PlayerHeader track={track} />
            <audio
                key={key_for_track(track)}
                controls={true}
                style={{width: "100%"}}
                autoPlay={true}
                preload={"auto"}
                onEnded={track_ended}
                onError={(e: any) => {
                    if(e.target.error && (e.target.error.code === e.target.error.MEDIA_ERR_NETWORK || e.target.error.code === e.target.error.MEDIA_ERR_NETWORK)) {
                        track_ended();
                    }
                }}
            >
                {mksources(track)}
            </audio>
            {next_track ? <audio
                key={key_for_track(next_track)}
                controls={false}
                style={{width: "100%"}}
                autoPlay={false}
                preload={"auto"}
                onEnded={track_ended}
                onError={(e: any) => {
                    if(e.target.error && (e.target.error.code === e.target.error.MEDIA_ERR_NETWORK || e.target.error.code === e.target.error.MEDIA_ERR_NETWORK)) {
                        track_ended();
                    }
                }}
            >
                {mksources(next_track)}
            </audio>
            : null}
            <div id="player-next-prev-btns">
                <Button key="previous" onClick={() => dispatch({type: atypes.PREV_TRACK})}>
                    <Glyphicon glyph="glyphicon glyphicon-step-backward" />
                </Button>

                <Button key="next" onClick={() => dispatch({type: atypes.NEXT_TRACK})}>
                    <Glyphicon glyph="glyphicon glyphicon-step-forward" />
                </Button>
            </div>
        </div>
    );
});
export const Player = connect(
    (state, ownProps: {player_mgr: PlayerManager}) => ({
        music_host: (state.config as IConfig).music_hosts.length && (state.config as IConfig).music_hosts[0].listing_url || null,
        player_mgr: ownProps.player_mgr
    }),
    {
        dispatch: action => action,
        track_ended: () => ({type: atypes.TRACK_ENDED})
    }
)(PlayerRaw);
