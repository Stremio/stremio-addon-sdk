// stremio-m3u8-addon.js
// Entry point for the Stremio add-on using playlist and m3u8Parser
const path = require('path');
const AddonBuilder = require('./builder');
const { parseM3U8 } = require('./m3u8Parser');

const PLAYLIST_PATH = path.join(__dirname, '../playlist');
const streams = parseM3U8(PLAYLIST_PATH);

const manifest = {
    id: 'community.m3u8.streams',
    version: '1.0.0',
    name: 'Live M3U8 Streams',
    description: 'Auto-populated live streams from M3U8 playlist.',
    logo: 'https://i.imgur.com/LoQdSia.png',
    resources: ['catalog', 'stream', 'meta'],
    types: ['tv'],
    catalogs: [{
        type: 'tv',
        id: 'm3u8-live',
        name: 'Live TV',
        extra: [{ name: 'search', isRequired: false }]
    }],
    idPrefixes: ['m3u8'],
};

const builder = new AddonBuilder(manifest);

// Catalog handler: returns all streams as items
builder.defineCatalogHandler(({ type, id, extra }) => {
    if (type !== 'tv' || id !== 'm3u8-live') return { metas: [] };
    const metas = streams.map(stream => ({
        id: 'm3u8_' + stream.id,
        type: 'tv',
        name: stream.name,
        poster: stream.logo,
        description: stream.group || '',
        background: stream.logo,
    }));
    return Promise.resolve({ metas });
});

// Stream handler: returns stream URL for playback
builder.defineStreamHandler(({ type, id }) => {
    if (type !== 'tv') return { streams: [] };
    const streamId = id.replace('m3u8_', '');
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return { streams: [] };
    return Promise.resolve({
        streams: [{
            url: stream.url,
            title: stream.name,
            name: stream.name,
            isFree: true,
        }]
    });
});

// Meta handler: returns metadata for each stream
builder.defineMetaHandler(({ type, id }) => {
    if (type !== 'tv') return { meta: null };
    const streamId = id.replace('m3u8_', '');
    const stream = streams.find(s => s.id === streamId);
    if (!stream) return { meta: null };
    return Promise.resolve({
        meta: {
            id: 'm3u8_' + stream.id,
            type: 'tv',
            name: stream.name,
            poster: stream.logo,
            description: stream.group || '',
            background: stream.logo,
        }
    });
});

module.exports = builder.getInterface();
