/* tslint:disable-next-line:no-var-requires */
require('dotenv').config();
import PouchDB from 'pouchdb';

import fetch from '../lib/archive.org';

const albumsDB = new PouchDB(process.env.COUCH_ARCHIVE_ALBUMS_URL);
const tracksDB = new PouchDB(process.env.COUCH_ARCHIVE_TRACKS_URL);

fetch(albumsDB, tracksDB).catch(console.error);
