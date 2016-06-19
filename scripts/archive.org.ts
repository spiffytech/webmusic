import * as _ from "lodash";
import * as archive from "../lib/archive.org";
import {echo, logger} from "../lib/archive.org";

/*
const memwatch = require("memwatch");
memwatch.on("leak", logger.warn.bind(logger));
memwatch.on("stats", logger.info.bind(logger));
*/

type Throat<T,U> = (concurrency: number, fn?: (arg: U) => Promise<T>) => (arg: U) => Promise<T>;

const throat: Throat<archive.ArchiveTrack[],string> = require("throat");

process.on("unhandledRejection", function(reason, p){
    console.error(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

const counts: {[k: string]: number} = {};

archive.get_listings(10).
then(listings =>
    Promise.all(
        listings.map(listing => listing.identifier).
        map(id =>
            throat(10, archive.fetch_metadata)(id).
            then(listing => listing.map(track => track.format)).
            then(formats => _.flatten(formats)).
            then(formats => _.forEach(formats, format => {
                counts[format] =
                    counts[format] === undefined ?
                    1 :
                    counts[format] + 1;
            }))
        )
    )
).
then(() => _(counts).toPairs().sortBy(1).value()).
then(logger.debug.bind(logger)).
catch(logger.error.bind(logger));
