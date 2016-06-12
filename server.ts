import * as assert from "assert";
import * as _ from "lodash";
import * as path from "path";

import * as Hapi from "hapi";
const Inert = require("inert");
const WebpackPlugin = require("hapi-webpack-plugin");

const ffmpeg = require("fluent-ffmpeg");
import * as request from "request";

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'build')
            }
        }
    }
});
server.connection({
    host: process.env.HOST ||
    "0.0.0.0", port: process.env.PORT || 3001
});

server.register(Inert);

server.register(
    {
        register: WebpackPlugin,
        options: "./webpack.config.js"
    }
);

server.on("response", function (request) {
    let status_code = null;
    if(request.response.statusCode === 200 || request.response.statusCode === 304) {
        status_code = "---";
    } else {
        status_code = request.response.statusCode;
    }
    console.log(request.info.remoteAddress + " : " + status_code + " : " + request.method.toUpperCase() + " " + request.url.path);
});

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

// Static files (WebPack / SPA)
server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: path.join(process.env.PWD, "build"),
            redirectToSlash: true,
            index: true
        }
    }
});

export function serve() {
    server.initialize().
    then(() => server.start()).
    then(() => console.log('Server running at:', server.info.uri)).
    catch(err => { console.error(err); throw err; });
}

serve()
