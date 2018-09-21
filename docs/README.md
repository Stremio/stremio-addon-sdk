# Quick Start Guide

A NodeJS SDK for making and publishing Stremio add-ons

This can publish an add-on via HTTP(s) or IPFS


## Example

**This arbitrary example creates an add-on that provides a stream for Big Buck Bunny and outputs a HTTP address where you can access it**

```javascript
#!/usr/bin/env node

const addonSDK = require('stremio-addon-sdk')

const addon = new addonSDK({
    id: 'org.myexampleaddon',
    version: '1.0.0',

    name: 'simple example',

    // Properties that determine when Stremio picks this add-on
    // this means your add-on will be used for streams of the type movie
    resources: [{
        "name": "stream",
        "types": [
            "movie"
        ],
        "idPrefixes": [
            "tt"
        ]
    }],
    types: ['movie'],
})

// takes function(args, cb)
addon.defineStreamHandler(function(args, cb) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // serve one stream to big buck bunny
        // return addonSDK.Stream({ url: '...' })
        const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
        cb(null, { streams: [stream] })
    } else {
        // otherwise return no streams
        cb(null, { streams: [] })
    }
})

addon.run()

// If you want this add-on to appear in the addon catalogs, call .publishToCentral() with the publically available URL to your manifest
addon.publishToCentral('https://my-addon.com/manifest.json')

```

Save this as `addon.js` and run it:

```bash
node ./addon.js
```

It will output a URL that you can paste inside the Stremio add-on UI to try the add-on

## Documentation


#### `const addonSDK = require('stremio-addon-sdk')`

Imports the SDK module


#### `var addon = new addonSDK(manifest)`

Creates a new ready-to-publish add-on with a given manifest. 

[Manifest Object Definition](./api/responses/manifest.md)


#### `addon.defineCatalogHandler(function handler(args, cb) { })`

Handles catalog feed and search requests.

[Catalog Request Parameters and Example](./api/requests/defineCatalogHandler.md)


#### `addon.defineMetaHandler(function handler(args, cb) { })`

Handles metadata requests. (title, year, poster, background, etc.)

[Meta Request Parameters and Example](./api/requests/defineMetaHandler.md)


#### `addon.defineStreamHandler(function handler(args, cb) { })`

Handles stream requests.

[Stream Request Parameters and Example](./api/requests/defineStreamHandler.md)


#### `addon.defineSubtitlesHandler(function handler(args, cb) { })`

Handles subtitle requests.

[Subtitle Request Parameters and Example](./api/requests/defineSubtitlesHandler.md)


#### `addon.publishToCentral()`

This method expects a string with the url to your `manifest.json` file.

Publish your add-on to the central server. After using this method your add-on will be available in the Community Add-ons list in Stremio for users to install and use. Your add-on needs to be publicly available with a URL in order for this to happen, as local add-ons that are not publicly available cannot be used by other Stremio users.


#### `addon.publishToDir()`

This method expects a string with a folder name.

Publishes your add-on to a directory. This creates a static version of your add-on in a folder that can then be [published with now.sh](https://github.com/Stremio/stremio-static-addon-example) or uploaded to a web server. As this is a static version of your add-on it is not scallable and presumes you are not using a database. Alternatively, you can use a database and re-publish your add-on to a directory periodically to update data.


#### `addon.runHTTPWithOptions({ port: 7000 })`

Starts the addon server on port 7000.

**The JSON format of the response to these resources is described [here](./api/responses).**
