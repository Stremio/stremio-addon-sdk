// start-m3u8-addon.js
// Script to start the Stremio M3U8 add-on on a fixed port and show the URL
const { serveHTTP } = require('./src');
const addon = require('./src/stremio-m3u8-addon');

const PORT = process.env.PORT || 7000;

serveHTTP(addon, { port: PORT }).then(({ url }) => {
    console.log(`Stremio M3U8 Addon running at: ${url}`);
}).catch(err => {
    console.error('Failed to start addon:', err);
});
