// AT the top so we load the Debug setting before loading the module
const dotenv = require("dotenv");
dotenv.config();

const Debug = require('debug');
const express = require("express");
const genericPool = require('generic-pool');
const ws = require("ws");

const graphql = require("../lib/graphql");
const hasura = require("../lib/hasura");
const archive = require("../lib/archive.org");

const debug = Debug('WebMusic:server');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const wsclientFactory = {
    create() {
        return graphql.mkClient(
            process.env.HASURA_URL,
            {reconnect: true, connectionParams: { headers: { "x-hasura-admin-secret": "password" } } },
            ws
        );
    },
    destroy(client) {
        client.client.close();
    }
}

const wsclientPool = genericPool.createPool(wsclientFactory, {max: 15, min: 2});

app.get("/", (req, res) => res.send("Hello World!"));

let outstandingRequests = 0;

app.post("/webhooks/identifier_loaded", async (req, res) => {
  outstandingRequests += 1;
  if (req.body.event.data.old && req.body.event.data.old.processed_at) {
      debug('Skipping processed entry');
      res.json({processed: false});
      outstandingRequests -= 1;
      debug('Outstanding requests: %s', outstandingRequests);
      return;
  }

  const wsclient = await wsclientPool.acquire();

  try {
    const identifier = req.body.event.data.new.identifier;
    const [metadata, files] = await Promise.all([
      archive.fetchItemMetadata(identifier),
      archive.fetchItemFiles(identifier)
    ]);
    await Promise.all([
      hasura.uploadMetadata(wsclient, identifier, metadata),
      hasura.uploadFiles(wsclient, identifier, files)
    ]);
    await hasura.setIdentiferProcessed(wsclient, identifier);
    debug('Processed %s', identifier);
  } catch (ex) {
    console.error(ex);
    res.status(500);
    res.json({processed: false, error: ex.message});
    outstandingRequests -= 1;
    debug('Outstanding requests: %s', outstandingRequests);
    return;
  } finally {
    wsclientPool.release(wsclient);
  }
  outstandingRequests -= 1;
  debug('Outstanding requests: %s', outstandingRequests);
  res.json({processed: true});
});

app.listen(port, () => debug(`App listening on port ${port}!`));
