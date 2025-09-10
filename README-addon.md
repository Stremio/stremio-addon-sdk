# Stremio M3U8 Live Streams Addon

This is a custom Stremio add-on that auto-populates live TV streams from an M3U8 playlist. It is designed for easy deployment and use with the Stremio platform.

## Features
- Parses a local M3U8 playlist file (`playlist`)
- Auto-populates the Stremio catalog with all live streams
- Each stream includes metadata (name, logo, group)
- Streams are playable in Stremio
- Ready for deployment on Render, Vercel, or any Node.js host

## Usage

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run locally:**
   ```bash
   node start-m3u8-addon.js
   ```
   The manifest will be available at `http://127.0.0.1:7000/manifest.json`.

3. **Deploy to Render:**
   - Connect your GitHub repo to Render
   - Select "Web Service"
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Your manifest will be at `https://your-app-name.onrender.com/manifest.json`

4. **Install in Stremio:**
   - Use the manifest URL in Stremio desktop/web to install the add-on

## Playlist Format

The add-on reads from a local `playlist` file in M3U8 format. Each stream entry should look like:

```m3u
#EXTINF:-1 tvg-id="SkySpMainEvHD.uk" tvg-name="UK: Sky Sports Main Event UHD" tvg-logo="https://i.ibb.co/gwCk7Bc/sky-m-event-uhd.png" group-title="UHD | 4K",UK: Sky Sports Main Event UHD
https://a1xs.vip/2000015
```

## Customization
- To change the playlist, edit the `playlist` file.
- To update metadata, modify the M3U8 entries.

## Credits
- Built by kinabraytan using GitHub Copilot
- Based on Stremio Addon SDK

## License
MIT

---

For full details on the Stremio Addon SDK, see the [original README](./README.md).
