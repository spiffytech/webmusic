import * as _ from "lodash";
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

export interface ArchiveTrack {
    $?: {name: string, source: string};
    creator?: string;
    album?: string;
    title?: string;
    track?: string;
    length?: string;
    format?: string;
    original?: string;
    url: string;
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

const recognized_formats = {
    "WAVE": "wav",
    "Flac": "flac",
    "24bit Flac": "flac",
    "Apple Lossless Audio": "alac",
    "Ogg Vorbis": "ogg",
    "VBR MP3": "mp3",
    "AIFF": "aiff"
};

function music_format_predicate(file) {
    return recognized_formats[file.format] !== undefined;
}

function timestamp_to_seconds(ts: string): number {
    // HH:MM:SS
    if(ts.indexOf(":") !== -1) {
        return new Date("1970-01-01T" + ts + "Z").getTime() / 1000;
    }

    // Assume it's already in seconds
    return parseFloat(ts);
}

function to_itrack(track: ArchiveTrack, formats: MusicFormat[]): ITrack {
    return {
        artist: track.creator || "",
        album: track.album || "",
        title: track.title || "",
        track_num: parseInt(track.track || "-1"),
        length: timestamp_to_seconds(track.length || "-1"),
        formats: formats
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
    const base_url = `https://archive.org/download/${identifier}`;
    const metadata_url = `${base_url}/${identifier}_files.xml`;

    return rp(metadata_url).
    then(parse_metadata).
    // Validate the schema of the incoming metadata, so we know our types are
    // accurate
    then(echo<RawMetadata[]>(files =>
        _.map(files, validate_raw_metadata)
    )).
    // xml2js puts everything into arrays, even single values
    then((files: RawMetadata[]): ArchiveTrack[] =>
        _(files).
        map(file => _.mapValues(file, (v, k) =>
            k === "$" ? v : v[0]
        )).
        map((track: ArchiveTrack) => _.merge(track, {url: `${base_url}/${track.$.name}`})).
        value()
    );
}

export function filter_invalid_formats(tracks: ArchiveTrack[]) {
    return _.filter(tracks, music_format_predicate);
}

function find_all_versions(tracks: ArchiveTrack[], original: ArchiveTrack): ArchiveTrack[] {
    const alt_formats = _(tracks).
    filter(track => track.original === original.$.name).
    value();

    return [
        original,
        ...alt_formats
    ];
}

export function munge_tracks(files: ArchiveTrack[]): ITrack[] {
    const filtered = files.filter(music_format_predicate);
    const originals = _.keyBy(
        filtered.filter(f => f.$.source === "original"),
        f => f["$"].name
    );

    // logger.debug("originals", originals);

    const itracks = _(originals).
        map(original => find_all_versions(files, original)).
        map(versions => {
            const with_metadata: ArchiveTrack =
                _.mergeWith<ArchiveTrack>({}, ...versions, (a, b) => a || b);

            const formats: MusicFormat[] = _.map(
                versions,
                version => ({
                    format: recognized_formats[version.format],
                    url: version.url
                })
            );

            const as_itrack = to_itrack(with_metadata, formats);

            return as_itrack;
        }).
        value();

    return itracks;
}
