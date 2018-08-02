import {readJson} from 'fs-extra';
import * as _ from 'lodash/fp';
import pLimit from 'p-limit';
import PouchDB from 'pouchdb';

const limitMetadata = pLimit(1);

function urlForIdentifier(identifier: string) {
  return `https://archive.org/download/${identifier}/${identifier}_files.xml`;
}

function urlForTrack(identifier: string, trackName: string) {
  return `https://archive.org/download/${identifier}/${trackName}`;
}

function fetchMetadata(url: string) {

}

async function loadAlbums(filename: string) {
  const archive = await readJson(filename);
  const albums = archive.response.docs;
  return albums;
}

function testDBConnection(db: PouchDB.Database) {
  return db.allDocs({limit: 1});
}

function prepareAlbumsForInsert(albums: any[]) {
  return albums.
  map((album: any) => ({
    ...album,
    fetched: false,
    _id: `album-${album.identifier}`,
    type: 'album',
  }));
}

function chunkAlbums(albums: any[], chunkSize = 1000) {
  return _.chunk(chunkSize, albums);
}

async function storeAlbums(db: PouchDB.Database, albums: any[]) {
  const albumsPrepared = prepareAlbumsForInsert(albums);

  console.log('Inserting albums into DB');
  for (const chunk of chunkAlbums(albumsPrepared)) {
    console.log(await db.bulkDocs(chunk));
  }
}

export default async function main(db: PouchDB.Database) {
  console.log('Testing DB connectivity');
  await testDBConnection(db);
  const albums = await loadAlbums('/home/spiffytech/Downloads/search3.json');
  console.log('DB connection success');
  await storeAlbums(db, albums);
}
