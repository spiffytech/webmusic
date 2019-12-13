const _  = require('lodash');
const axios = require('axios');
const xml2js = require('xml2js');

const validFileFormats = [
    'VBR MP3',
    'Ogg Vorbis',
    '24bit Flac'
]

function extractSingleValues(metadata) {
    return _.mapValues(metadata, val => {
        if (Array.isArray(val) && val.length === 1 && typeof val[0] === 'string') {
            return val[0];
        } else {
            return val;
        }
    });
}

async function fetchItemMetadata(item) {
    const xml = (await axios.get(`https://archive.org/download/${item}/${item}_meta.xml`)).data;
    return extractSingleValues((await xml2js.parseStringPromise(xml)).metadata);
}

async function fetchItemFiles(item) {
    const xml = (await axios.get(`https://archive.org/download/${item}/${item}_files.xml`)).data;
    const files = (await xml2js.parseStringPromise(xml)).files;
    return files.file.map(file => extractSingleValues(file));
}

function validFileFormatFilter(file) {
    return validFileFormats.indexOf(file.format) !== -1;
}