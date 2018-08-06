import axios from 'axios';
import {readJson} from 'fs-extra';
import * as _ from 'lodash/fp';
import * as natural from 'natural';
import pLimit from 'p-limit';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import {parseString as xml2str} from 'xml2js';
/* tslint:disable-next-line:no-var-requires */
PouchDB.plugin(require('pouchdb-find'));
/* tslint:disable-next-line:no-var-requires */
PouchDB.plugin(PouchDBUpsert);

const limitMetadata = pLimit(50);

declare var emit: any;

function urlForAlbumMetadata(identifier: string) {
  return `${archiveBaseUrl()}/${identifier}/${identifier}_meta.xml`;
}

function urlForAlbumFiles(identifier: string) {
  return `${archiveBaseUrl()}/${identifier}/${identifier}_files.xml`;
}

function urlForTrack(identifier: string, trackName: string) {
  return `${archiveBaseUrl()}/${identifier}/${trackName}`;
}

function archiveBaseUrl() {
  return `https://archive.org/download`;
}

function fetchMetadata(url: string) {
  return axios.get(url);
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

async function listPendingAlbums(db: PouchDB.Database): Promise<any[]> {
  const albumsPendingFetch = await db.find({
    selector: {type: 'album', fetched: false},
    limit: 10000000,
  });
  return albumsPendingFetch.docs;
}

async function listAllAlbums(db: PouchDB.Database): Promise<any[]> {
  const albumsPendingFetch = await db.find({
    selector: {type: 'album'},
    limit: 1000000,
  });
  return albumsPendingFetch.docs;
}

function decodeAlbumXml(metadata: string): any {
  return new Promise((resolve, reject) => {
      xml2str(metadata, (err, result) => {
          if (err) return reject(err);
          return resolve(result);
      });
  });
}

async function fetchAlbumMetadata(identifier: string) {
  const url = urlForAlbumMetadata(identifier);
  const metadataXml = await fetchMetadata(url);
  const metadata = await decodeAlbumXml(metadataXml.data);
  console.log(metadata.metadata);
  return {
    date: (metadata.metadata.date || metadata.metadata.addeddate)[0],
    artist: metadata.metadata.creator[0],
    album: metadata.metadata.title[0],
  };
}

/**
 * Filters an Archive.org track based on whetehr it's a music file
 */
function filterMusicFiles(file: any) {
  if (!file.format) return false;
  return [
    'WAVE', 'Ogg Vorbis', 'VBR MP3', 'Flac',
  ].indexOf(file.format) !== -1;
}

/**
 * Given the files from the Archive.org file listing, return only files that are
 * music files, grouped by their original wav file
 */
function groupMusicFiles(files: any[]) {
  return _.groupBy(
    'original',
    files.map((file) => ({...file, original: file.original})),
  );
}

/**
 * Archive.org doesn't give us the track metadata, so we have to create it
 * ourselves
 */
function parseTrackName(track: any) {
  const matches = track.$.name.match(/^_*(\d{1,3}) ?(\D.*)\.\S+$/);
  if (!matches) return {trackNumber: 0, title: track.$.name};
  return {
    trackNumber: parseInt(matches[1], 10),
    title: matches[2],
  };
}

function processAlbumFile(file: any) {
  return {
    ...file,
    format: file.format ? file.format[0] : null,
    original: file.original ? file.original[0] : file.$.name,
    ...parseTrackName(file),
  };
}

async function listAlbumFiles(identifier: string) {
  const url = urlForAlbumFiles(identifier);
  const metadataXml = await fetchMetadata(url);
  const files = await decodeAlbumXml(metadataXml.data);
  return files.files.file;
}

function formatTrack(metadata: any, v: any[]) {
  const tokenizer = new natural.WordPunctTokenizer();
  const {artist, album} = metadata;
  const {title} = v[0];
  return {
    date: metadata.date,
    artist,
    album,
    title,
    trackNumber: v[0].trackNumber,
    baseUrl: `${archiveBaseUrl()}/${metadata.identifier[0]}`,
    formats: _.fromPairs(v.map((file) => [file.format, file.$.name])),
    keywords: _.flatten([
      tokenizer.tokenize(artist).map(natural.PorterStemmer.stem),
      tokenizer.tokenize(album).map(natural.PorterStemmer.stem),
      tokenizer.tokenize(title).map(natural.PorterStemmer.stem),
    ]),
    length: v[0].length[0],
    _id: encodeURIComponent(`track-${metadata.artist}-${metadata.album}-${v[0].trackNumber}-${v[0].title}`),
    type: 'track',
  };
}

export default async function main(albumsDB: PouchDB.Database, tracksDB: PouchDB.Database) {
  await testDBConnection(albumsDB);
  console.log('DB connection success');

  const albums = await loadAlbums('/home/spiffytech/Downloads/search4.json');
  // await storeAlbums(albumsDB, albums);

  await albumsDB.createIndex({
    index: {
      fields: ['type', 'fetched'],
      ddoc: 'fetched-albums',
    },
  });

  await albumsDB.createIndex({
    index: {
      fields: ['type'],
      ddoc: 'type-index',
    },
  });

  await tracksDB.upsert(
    '_design/tracks',
    (designDoc: any) => ({
      _rev: designDoc._rev,
      _id: '_design/tracks',
      views: {
        albums: {
          /* tslint:disable-next-line:only-arrow-functions */
          map: function(doc: any) {
            emit([doc.artist, doc.album], null);
          }.toString(),
          reduce: '_count',
        },
        artists: {
          /* tslint:disable-next-line:only-arrow-functions */
          map: function(doc: any) {
            emit(doc.artist, null);
          }.toString(),
          reduce: '_count',
        },
      },
    }),
  );

  console.log('Created albums index');

  const albumsPendingFetch = await listPendingAlbums(albumsDB);
  await Promise.all(albumsPendingFetch.map(
    (album) => limitMetadata(async () => {
      const [metadata, tracksUngrouped] = await Promise.all([
        fetchAlbumMetadata(album.identifier),
        (await listAlbumFiles(album.identifier)).map(processAlbumFile),
      ]);
      // if (!album.hidden || album.hidden[0] === 'true') return;
      console.log(metadata);
      const tracksGrouped =
        groupMusicFiles(tracksUngrouped.filter(filterMusicFiles));
      const tracks = Object.values(tracksGrouped).map((v) =>
        formatTrack(metadata, v),
      );

      console.log(tracks);
      await tracksDB.bulkDocs(tracks);
      await albumsDB.upsert(
        album._id,
        (doc: any) => ({...doc, fetched: true}),
      );
    }),
  ));
}

export async function fixUrls(albumsDB: PouchDB.Database, tracksDB: PouchDB.Database) {
  /*
  const albums = await loadAlbums('/home/spiffytech/Downloads/search4.json');
  await storeAlbums(albumsDB, albums);
  await albumsDB.createIndex({
    index: {
      fields: ['type', 'fetched'],
      ddoc: 'fetched-albums',
    },
  });
  */
  /*
  const all = await listAllAlbums(albumsDB);
  await albumsDB.bulkDocs(all.map((album) => ({...album, fetched: false})));
  */

  let fixed = 0;
  const pending = await listPendingAlbums(albumsDB);
  const tokenizer = new natural.WordPunctTokenizer();
  await Promise.all(pending.map(
    (album) => limitMetadata(async () => {
      const albumName = album.title;
      const artist = album.creator;
      const tracksBroken = await tracksDB.find({selector: {album: albumName, artist}, limit: 10000});
      if (tracksBroken.docs.length === 0) {
        console.error(`No tracks found for artist ${artist}, album ${albumName}`);
        await albumsDB.put({...album, fetched: true});
        return;
      }
      const tracksFixed = tracksBroken.docs.map((track: any) => ({
        ...track,
        keywords: _.flatten([
          tokenizer.tokenize(track.artist).map(natural.PorterStemmer.stem),
          tokenizer.tokenize(track.album).map(natural.PorterStemmer.stem),
          tokenizer.tokenize(track.title).map(natural.PorterStemmer.stem),
        ]),
      }));

      await Promise.all([
        tracksDB.bulkDocs(tracksFixed),
        albumsDB.put({...album, fetched: true}),
      ]);
      fixed += 1;
      console.log('Fixed', fixed, '/', pending.length);
    }),
  ));
}
