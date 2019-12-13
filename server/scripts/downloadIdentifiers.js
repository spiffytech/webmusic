const fs = require("fs");
const gql = require("graphql-tag");
const path = require("path");
const readline = require("readline");
const ws = require("ws");

const libarchive = require("../lib/archive.org");
const graphql = require("../lib/graphql");

async function loadIntoHasura(wsclient, identifiers) {
  console.log(
    await wsclient.query({
      query: gql`
        mutation InsertIdentifiers($identifiers: [archive_identifiers_insert_input!]!) {
          insert_archive_identifiers(objects: $identifiers,  on_conflict: {constraint: archive_identifiers_pkey, update_columns: identifier}) {
            returning {
              identifier
            }
          }
        }
      `,
      variables: { identifiers: identifiers.map(identifier => ({identifier})) }
    })
  );
}

async function main() {
  const file = path.join(__dirname, "..", "etree.csv");
  const handle = fs.createReadStream(file);
  const rl = readline.createInterface({ input: handle });
  const wsclient = graphql.mkClient(
    "ws://localhost:9090/v1/graphql",
    { connectionParams: { headers: { "x-hasura-admin-secret": 'password' } } },
    ws
  );

  let identifiers = [];
  let lineNo = 0;
  for await (const line of rl) {
    lineNo += 1;
    // Skip the header line
    if (lineNo === 1) continue;

    const trimmed = line.replace(/"/g, "");
    identifiers = [...identifiers, trimmed];
    if (identifiers.length === 1000) {
      await loadIntoHasura(wsclient, identifiers);
      identifiers = [];
    }
  }
  await loadIntoHasura(wsclient, identifiers);
  wsclient.client.close()
}

main().catch(console.error);
