import * as _ from "lodash";
import * as Hapi from "hapi";
import * as assert from "assert";
const ffmpeg = require("fluent-ffmpeg");
import * as request from "request";

const server = new Hapi.Server();
server.connection({ port: 3001 });

import * as fs from 'fs';

server.route({
    method: 'GET',
    path: '/transcode',
    handler: async function (req, reply) {
        const _reply = _.once(reply);

        try {
            const url:string = req.query["url"];
            const output_format = req.query["output_format"];

            const container_format = output_format;

            const codecs = {
                mp3: "libmp3lame",
                ogg: "vorbis",
                wav: "pcm_s16le"
            };
            const mime_types = {
                mp3: "audio/mpeg",
                ogg: "audio/vorbis",
                wav: "audio/wav"
            }

            assert(url);
            assert(output_format);
            assert(
                codecs[output_format] !== undefined,
                `Invalid output format: ${output_format}`
            );

            console.log(url);
            console.log(output_format, codecs[output_format]);

            const stream = await request(url);

            const out = ffmpeg(stream).
                on("stderr", console.error).
                on("error", console.error).
                on("error", err => _reply(err.message).code(500)).
                audioCodec(codecs[output_format]).
                format(container_format).
                stream();

            _reply(out).type(mime_types[output_format]);
        } catch(ex) {
            console.error(ex);
            // TODO: Correctly report 404 etc.
            _reply(ex.message).code(500);
            console.log("Errored out");
        }
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
