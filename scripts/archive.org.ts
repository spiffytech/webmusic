import * as _ from "lodash";
import * as archive from "../lib/archive.org";
import {echo, logger} from "../lib/archive.org";

type Throat<T,U> = (concurrency: number, fn?: (arg: U) => T) => (arg: U) => Promise<T>;

const throat: Throat<any,string> = require("throat");

process.on("unhandledRejection", function(reason, p){
    console.error(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

archive.get_listings(10).
then(listings =>
    Promise.all(
        listings.map(listing => listing.identifier).
        map(id =>
            throat(50, archive.fetch_metadata)(id).
            then(listing => listing.map(track => track.format))
        )
    )
).then(formats_by_listing => _.flatten(formats_by_listing)).
then(formats => _(formats).countBy().toPairs().sortBy(1).value()).
then(logger.debug.bind(logger)).
catch(logger.error.bind(logger));
