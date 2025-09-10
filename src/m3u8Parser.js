// m3u8Parser.js
// Parses M3U8 playlist and returns array of stream objects
const fs = require('fs');
const path = require('path');

function parseM3U8(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);
    const streams = [];
    let currentMeta = null;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#EXTINF')) {
            // Extract metadata
            const metaMatch = line.match(/#EXTINF:-1(.*?)\,(.*)/);
            if (metaMatch) {
                const metaStr = metaMatch[1];
                const name = metaMatch[2].trim();
                const meta = {};
                // Extract tvg-id, tvg-name, tvg-logo, group-title
                const tvgIdMatch = metaStr.match(/tvg-id="([^"]+)"/);
                const tvgNameMatch = metaStr.match(/tvg-name="([^"]+)"/);
                const tvgLogoMatch = metaStr.match(/tvg-logo="([^"]+)"/);
                const groupTitleMatch = metaStr.match(/group-title="([^"]+)"/);
                meta.tvgId = tvgIdMatch ? tvgIdMatch[1] : '';
                meta.tvgName = tvgNameMatch ? tvgNameMatch[1] : name;
                meta.tvgLogo = tvgLogoMatch ? tvgLogoMatch[1] : '';
                meta.groupTitle = groupTitleMatch ? groupTitleMatch[1] : '';
                meta.name = name;
                currentMeta = meta;
            }
        } else if (line && !line.startsWith('#')) {
            // Stream URL
            if (currentMeta) {
                streams.push({
                    id: currentMeta.tvgId || Buffer.from(line).toString('base64'),
                    name: currentMeta.tvgName || currentMeta.name,
                    logo: currentMeta.tvgLogo,
                    group: currentMeta.groupTitle,
                    url: line,
                });
                currentMeta = null;
            }
        }
    }
    return streams;
}

module.exports = { parseM3U8 };
