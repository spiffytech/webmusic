import * as Hapi from "hapi";
import * as assert from "assert";
const ffmpeg = require("fluent-ffmpeg");
import * as request from "request";

const server = new Hapi.Server();
server.connection({ port: 3001 });

server.route({
    method: 'GET',
    path: '/transcode',
    handler: async function (req, reply) {
        const url:string = req.query["url"];
        const output_format = req.query["output_format"];
        assert(url);
        assert(output_format);

        const stream = await request(url);

        const out = ffmpeg(stream).
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
