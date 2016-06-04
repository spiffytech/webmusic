import * as Hapi from "hapi";
import * as fs from 'fs';
import * as assert from "assert";
import * as stream from "stream";
const ffmpeg = require("fluent-ffmpeg");

const server = new Hapi.Server();
server.connection({ port: 3001 });

server.route({
    method: 'GET',
    path: '/transcode',
    handler: function (request, reply) {
        const url = request.query["url"];
        const output_format = request.query["output_format"];
        assert(url);
        assert(output_format);

        const f = fs.createReadStream(url);

        const out = ffmpeg(f).
            audioCodec("libmp3lame").
            format("mp3").
            stream();

        reply(out);
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
