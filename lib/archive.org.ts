import * as _ from "lodash";
import * as assert from "assert";
import * as bunyan from "bunyan";
import * as joi from "joi";
import * as rp from "request-promise";
import {parseString as xml2str} from "xml2js";

export const logger = bunyan.createLogger({name: "archive logger", level: "debug"});

interface RawMetadata {
    "$": {
        name: string;
        source: string;
    };
    format: [string];
    // union is hack around TS issue 6041
    [k: string]: [string] | {name: string, source: string};
}

interface AlbumListing {
    date: Date;
    identifier: string;
    subject: string;
    title: string;
}

interface Track {
    artist: string;
    album: string;
    title: string;
    format: string;
    track_num: number;
    length: number;
}

export interface ArchiveTrack {
    $?: {name: string, source: string};
    creator?: string;
    album?: string;
    title?: string;
    track?: number;
    length?: number | string;
    format?: string;
    original?: string;
}

export function echo<T>(fn: (arg: T) => any) {
    return function identity(val: T) {
        fn(val);
        return val;
    };
}

export function get_listings(rows = 10000000000): Promise<AlbumListing[]> {
    const url = `http://archive.org/advancedsearch.php?q=collection%3Aetree&fl%5B%5D=date&fl%5B%5D=identifier&fl%5B%5D=subject&fl%5B%5D=title&sort%5B%5D=&sort%5B%5D=&sort%5B%5D=&rows=${rows}&page=1&indent=yes&output=json&callback=callback&save=yes`;

    return rp(url).
    then(jsonp => jsonp.replace(/^callback\(/, "").replace(/\)$/, "")).
    then(JSON.parse).
    then(resp => resp.response.docs).
    then(docs => docs.map(doc => ({
        date: new Date(doc.date),
        identifier: doc.identifier,
        subject: doc.subject,
        title: doc.title
    })));
}

function parse_metadata(metadata: string): Promise<RawMetadata[]> {
    return new Promise((resolve, reject) => {
        xml2str(metadata, (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    }).
    then((res: any) => res.files.file);
}

function music_format_predicate(file) {
    return [
        "Flac",
        "Ogg Vorbis",
        "VBR MP3",
        "AIFF",
        "WAVE",
        "Apple Lossless Audio"
    ].indexOf(file.format) !== -1;
}

function timestamp_to_seconds(ts: string): number {
    // HH:MM:SS
    if(ts.indexOf(":") !== -1) {
        return new Date("1970-01-01T" + ts + "Z").getTime() / 1000;
    }

    // Assume it's already in seconds
    return parseFloat(ts);
}

function extract_fields(file): Track {
    const formats = {
        "WAVE": "wav",
        "Flac": "flac",
        "24bit Flac": "flac",
        "Apple Lossless Audio": "alac",
        "Ogg Vorbis": "ogg",
        "VBR MP3": "mp3",
        "AIFF": "aiff"
    };

    assert(formats[file.format], `unrecognized file format: ${file.format}`);

    return {
        artist: file.creator || "",
        album: file.album || "",
        title: file.title || "",
        track_num: parseInt(file.track || -1),
        length: timestamp_to_seconds(file.length || -1),
        format: formats[file.format]
    };
}

function validate_raw_metadata(file: RawMetadata) {
    joi.assert(file, joi.object({
        $: joi.object({
            name: joi.string().required(),
            source: joi.string().valid("original", "derivative", "metadata").required()
        }).required(),
        format: joi.array().items(joi.string()).length(1).required(),
        original: joi.any().when(
            joi.ref("$.source", {contextPrefix: "#"}),
            {
                is: "derivative",
                then: joi.array().items(joi.string()).when(
                    joi.ref("format.0"),
                    {
                        is: joi.string().valid("Checksums", "Flac FingerPrint"),
                        then: joi.array().items(joi.string()).required(),
                        otherwise: joi.array().items(joi.string()).length(1).required()
                    }
                )
            }
        )
    }).unknown());
}

export function fetch_metadata(identifier: string): Promise<ArchiveTrack[]> {
    const url = `https://archive.org/download/${identifier}/${identifier}_files.xml`;

    return rp(url).
    then(parse_metadata).
    // Validate the schema of the incoming metadata, so we know our types are
    // accurate
    then(echo<RawMetadata[]>(files =>
        _.map(files, validate_raw_metadata)
    )).
    // xml2js puts everything into arrays, even single values
    then((files: RawMetadata[]): ArchiveTrack[] =>
        _.map(files, file => _.mapValues(file, (v, k) =>
            k === "$" ? v : v[0]
        )
    ));
}

function munge_tracks(files: ArchiveTrack[]): Promise<ITrack[]> {
    return Promise.resolve(files).
    then(files => files.filter(music_format_predicate)).
    then(files => {
        const originals = _.keyBy(
            files.filter(f => f.$.source === "original"),
            f => f["$"].name
        );

        const by_format = _(files).
        map(file =>
            file.$.source === "original" ?
            _.set<ArchiveTrack>(file, "original", file.$.name) :
            file
        ).
        groupBy(file => file.original).
        mapValues((files: ArchiveTrack[]) =>
            _.map(files, file =>
                ({format: file.format, filename: file.$.name})
            )
        ).
        value();

        logger.debug("by_format", by_format);
        return _.values(_.mapValues(originals, extract_fields));
    });
}
