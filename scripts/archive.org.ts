import * as _ from "lodash";
import * as archive from "../lib/archive.org";
import {echo, logger} from "../lib/archive.org";
import * as Rx from "rx";
const fsp = require("fs-promise");

type Throat<T,U> = (
    concurrency: number,
    fn: (arg: U) => Promise<T>
) => (arg: U) => Promise<T>;

const throat: Throat<archive.ArchiveTrack[],string> = require("throat");

process.on("unhandledRejection", function(reason, p){
    console.error(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

interface Unsettled<T> {
    isFulfilled(): boolean;
    value(): T;
    reason(): any;
}
const settle: <T,U>(p: Promise<T>[]) => Promise<Unsettled<U>[]> = require("promise-settle");

function activate_heapdumps() {
    const heapdump = require("heapdump");
    const memwatch = require("memwatch-next");

    let count = 0;
    memwatch.on("stats", () => {
        count += 1;
        if(count % 5 === -1) {
            heapdump.writeSnapshot("/tmp/" + Date.now() + ".heapsnapshot");
            logger.debug("Wrote snapshot");
        }
    });
}

function fetch_track_listings(num_listings = 1000) {
    const counts: {[k: string]: number} = {};
    const throttled_fetcher = throat(50, archive.fetch_metadata);

    return archive.get_listings(num_listings).
    then(listings =>
        listings.map((listing, i) =>
            throttled_fetcher(listing.identifier).
            then(value => _.tap(value, () => logger.debug(`Processed #${i}: ${listing.identifier}`)))
        )
    ).
    then(requests =>
        Rx.Observable.onErrorResumeNext(
            ..._.map(requests, request => Rx.Observable.fromPromise(request))
        )
    );
}

function create_tracksjson(num_tracks = 1000) {
    fetch_track_listings(num_tracks).
    then(observable => {
        // observable.subscribe(logger.debug.bind(logger));

        observable.
        map(archive.filter_invalid_formats).
        map(archive.munge_tracks).
        flatMap(_.identity).
        toArray().
        subscribe(
            array =>
                fsp.writeFile("/tmp/archive.json", JSON.stringify(array, null, 2)),
            logger.error.bind(logger),
            logger.debug.bind(logger, "complete")
        );
    });
}

function count_filetypes(num_tracks = 1000) {
    fetch_track_listings(num_tracks).
    then(observable =>
        observable.
        flatMap<archive.ArchiveTrack>(_.identity).
        map(track => track.format).
        reduce((acc, format) => {
            acc[format] = (acc[format] || 0) + 1;
            return acc;
        }, {}).
        map(stats => _(stats).toPairs().sortBy(1).value()).
        subscribe(logger.debug.bind(logger))
    );
}

// count_filetypes();
create_tracksjson(100);
