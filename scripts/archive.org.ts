import * as _ from "lodash";
import * as archive from "../lib/archive.org";
import {echo, logger} from "../lib/archive.org";

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

function count_filetypes(n = 1000) {
    const counts: {[k: string]: number} = {};
    const throttled_fetcher = throat(50, archive.fetch_metadata);

    archive.get_listings(n).
    then(listings =>
        settle(
            listings.map((listing, i) => {
                logger.debug(`Processing #${i}: ${listing.identifier}`);

                return throttled_fetcher(listing.identifier).
                then(listing => listing.map(track => track.format)).
                then(formats => _.flatten(formats)).
                then(formats => _.forEach(formats, format => {
                    counts[format] =
                        counts[format] === undefined ?
                        1 :
                        counts[format] + 1;
                }));
            })
        )
    ).
    then(unsettled =>
        _.forEach(unsettled, u => {
            if(!u.isFulfilled()) logger.warn("Unfulfilled fetch:", u.reason());
        })
    ).
    then(() => _(counts).toPairs().sortBy(1).value()).
    then(logger.debug.bind(logger)).
    catch(logger.error.bind(logger));
}


count_filetypes(10);
