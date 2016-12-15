import * as tap from "tap";

import {LibraryManager} from "./NewLibrary";

tap.test("getters get the right things", t => {
    const mgr = new LibraryManager();
    const getters = mgr.available_views;
    const track = {
        id: "track1",
        title: "track1 title",
        album: "track1 album",
        artist: "track1 artist",
        formats: [],
        length: null,
        track_num: null
    };

    // mgr.tracks.replace(Array(2).fill(track));
    t.equal(getters[0](track), "track1 artist");
    t.equal(getters[1](track), "track1 album");
    t.equal(getters[2](track), "track1 title");

    t.end();
});

tap.test("visible tracks include all artists", t => {
    const mgr = new LibraryManager();
    const track = {
        id: "track1",
        title: "track1 title",
        album: "track1 album",
        artist: "track1 artist",
        formats: [],
        length: null,
        track_num: null
    };

    mgr.tracks.replace([track]);
    t.same(mgr.visible_tracks.get()[0], track);

    t.end();
});
