import * as Hapi from "hapi";
import * as fs from 'fs';
import * as assert from "assert";
const Transcoder = require("stream-transcoder");

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

        const s2 = Transcoder("/home/spiffytech/Music/Yonder Mountain String Band/Old Hands/02 Hill Country Girl.mp3").
            audioCodec("mp3").
            format("mp3").
            stream()
        s2.on("metadata", console.log);
        s2.on("progress", console.log);
        s2.on("finish", console.log);
        s2.on("error", console.error);

        reply(s2);
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }
    console.log('Server running at:', server.info.uri);
});
