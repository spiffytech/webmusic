import * as assert from "assert";
import * as crypto from "crypto";
import * as path from "path";
import {fs} from "mz";

import * as Hapi from "hapi";
const CookieAuth = require("hapi-auth-cookie");
const Inert = require("inert");
const WebpackPlugin = require("hapi-webpack-plugin");

const ffmpeg = require("fluent-ffmpeg");
import * as request from "request";

import {sendLoginEmail, verifyToken } from './login';

const server = new Hapi.Server({
    connections: {
        routes: {
            files: {
                relativeTo: path.join(__dirname, "build")
            }
        }
    }
});
server.connection({
    host: process.env.HOST ||
    "0.0.0.0", port: process.env.PORT || 8080
});

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
    method: "GET",
    path: "/transcode",
    handler: function (req, reply) {
        const codecs = {
            mp3: "libmp3lame",
            ogg: "vorbis",
            wav: "pcm_s16le"
        };
        /*
        const mime_types = {
            mp3: "audio/mpeg",
            ogg: "audio/vorbis",
            wav: "audio/wav"
        };
        */

        const url:string = req.query["url"];
        const output_format = req.query["output_format"];
        const container_format = output_format;

        try {
            assert(url);
            assert(output_format);
            assert(
                codecs[output_format] !== undefined,
                `Invalid output format: ${output_format}`
            );
        } catch(ex) {
            console.error(ex);
            reply(ex.message).code(500);
        }

        const url_hash = crypto.createHash("sha256").update(url).digest("hex");
        const out_dir = "transcoded_tracks";
        const out_filename = `${url_hash}.${output_format}`;
        const full_out_path = `${out_dir}/${out_filename}`;

        try {
            fs.exists(full_out_path).
            then(exists => {
                if(exists) {
                    return reply.redirect(`/transcoded/${out_filename}`);
                }

                const stream = request(url);

                ffmpeg(stream).
                    // on("stderr", console.error).
                    on("error", console.error).
                    on("error", err => reply(err.message).code(500)).
                    on("end", () => reply.redirect(`/transcoded/${out_filename}`)).
                    audioCodec(codecs[output_format]).
                    format(container_format).
                    save(full_out_path);
            });
        } catch(ex) {
            console.error(ex);
            // TODO: Correctly report 404 etc.
            reply(ex.message).code(500);
            console.log("Errored out");
        }
    }
});

function validate_user(_request, session, callback) {
    callback(null, true, session);
}

export function serve() {
    const plugins = [Inert, CookieAuth];
    if(process.env.NODE_ENV === "development") {
        plugins.push({
            register: WebpackPlugin,
            options: "./webpack.config.js"
        });
    }

    server.register(plugins).
    then(() => {
        server.auth.strategy("session", "cookie", "optional", {
            cookie: "webmusic_session",
            password: "cAHwTEIiI2T5AfcF8HgyxjnPvebe9nVG1aY6OPh2lAcZ6N3EmUd53ROoHfRSRUz",
            redirectTo: false,
            isSecure: false,
            isHttpOnly: false,
            clearInvalid: true,
            ttl: 1000 * 86400 * 365,
            keepAlive: true,
            validateFunc: validate_user
        });

        server.route({
            method: "GET",
            path: "/login",
            config: {
                handler: (request, reply) => {
                    if (request.query.token) {
                        const isValid = verifyToken(request.query.token);
                        if (isValid === false) {
                            return reply("Your login link is no longer valid. Please log in again.");
                        }
                        // Setting an object to the session counts as logging the
                        // user in as far as hapi-auth-cookie is concerned. Must be
                        // an object. Setting this creates the session cookie.
                        (request as any).cookieAuth.set({name: isValid});
                        return reply(request.auth.credentials).redirect("/");
                    }

                    return sendLoginEmail(request.query.email).
                    then(() => reply("Check your email for a login link"));
                }
            }
        });

        server.route({
            method: "GET",
            path: "/username",
            handler: (request, reply) => reply(request.auth.credentials.name)
        });

        // Static files (transcoded tracks)
        server.route({
            method: "GET",
            path: "/transcoded/{param*}",
            handler: {
                directory: {
                    path: path.join(process.env.PWD, "transcoded_tracks"),
                    redirectToSlash: false,
                    index: false
                }
            }
        });

        // Static files (WebPack / SPA)
        server.route({
            method: "GET",
            path: "/{param*}",
            handler: {
                directory: {
                    path: path.join(process.env.PWD, "build"),
                    redirectToSlash: true,
                    index: true
                }
            },
            config: {
                cache: {
                    expiresIn: 30 * 1000,
                    privacy: "public"
                }
            }
        } as any);

        server.ext("onPreResponse", function (request, reply) {
            if(
                request.response.isBoom &&
                (request.response as any).output.statusCode === 404
            ) {
                // Inspect the response here, perhaps see if it's a 404?
                return reply.redirect("/");
            }

            return reply.continue();
        });

        server.on("internalError", function (_request, err) {
            console.log(err.data.stack);
        });

        return server.initialize().
        then(() => server.start()).
        then(() => console.log("Server running at:", server.info.uri));
    }).
    catch(err => { console.error(err); throw err; });
}

serve();
