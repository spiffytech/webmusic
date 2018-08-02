/* tslint:disable-next-line:no-var-requires */
require('dotenv').config();
import PouchDB from 'pouchdb';

import fetch from '../lib/archive.org';

const db = new PouchDB(process.env.COUCH_URL);

fetch(db).catch(console.error);
