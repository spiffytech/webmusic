import * as archive from "../lib/archive.org";
import {echo, logger} from "../lib/archive.org";

process.on("unhandledRejection", function(reason, p){
    console.error(`Possibly Unhandled Rejection at: Promise ${p} reason: ${reason}`);
});

archive.get_listings(1).
then(listings =>
    Promise.all(
        listings.map(
            listing => archive.fetch_metadata(listing.identifier)
        )
    )
).then(logger.debug.bind(logger)).
catch(logger.error.bind(logger));
