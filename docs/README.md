# Getting Started

A NodeJS SDK for making and publishing Stremio add-ons

This can publish an add-on via HTTP(s) or IPFS


## Example

**This arbitrary example creates an add-on that provides a stream for Big Buck Bunny and outputs a HTTP address where you can access it**

```javascript
#!/usr/bin/env node

const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')

const addon = new addonBuilder({
    id: 'org.myexampleaddon',
    version: '1.0.0',

    name: 'simple example',

    // Properties that determine when Stremio picks this add-on
    // this means your add-on will be used for streams of the type movie
    resources: ['stream'],
    types: ['movie'],
    idPrefixes: ['tt']
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

serveHTTP(addon.getRouter(), { port: 7000 })

// If you want this add-on to appear in the addon catalogs, call .publishToCentral() with the publically available URL to your manifest
//publishToCentral('https://my-addon.com/manifest.json')

```

Save this as `addon.js` and run:

```bash
$ npm install stremio-addon-sdk
$ node ./addon.js
```

It will output a URL that you can use to [install the add-on in Stremio](./docs/testing.md#how-to-install-add-on-in-stremio)

## Documentation


#### `const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')`

Imports `addonBuilder`, which you'll need to define the addon, 
and `serveHTTP`, which you will need to serve a HTTP server for this addon


#### `const addon = new addonBuilder(manifest)`

Creates an  add-on builder obbject with a given manifest. 

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


#### `publishToCentral(url)`

This method expects a string with the url to your `manifest.json` file.

Publish your add-on to the central server. After using this method your add-on will be available in the Community Add-ons list in Stremio for users to install and use. Your add-on needs to be publicly available with a URL in order for this to happen, as local add-ons that are not publicly available cannot be used by other Stremio users.


#### `publishToDir()`

@TODO

This method expects a string with a folder name.

Publishes your add-on to a directory. This creates a static version of your add-on in a folder that can then be [published with now.sh](https://github.com/Stremio/stremio-static-addon-example) or uploaded to a web server. As this is a static version of your add-on it is not scallable and presumes you are not using a database. Alternatively, you can use a database and re-publish your add-on to a directory periodically to update data.


#### `serveHTTP(options)`

Starts the addon server. `options` is an object that contains:

* `port`
* `cache` (in seconds); `cache` means the `Cache-Control` header being set to `max-age=$cache`


**The JSON format of the response to these resources is described [here](./api/responses).**


### `addon.getServerlessHandler()`

@TODO

Returns an object that contains `{manifest, catalog, stream, meta}`, where each one is a handler that can be used for a serverless application

To do that, we encourage that you export your `addon` from a separate module (e.g. `addon.js`) and then create each entrypoint like so:

`catalog.js`

```
const addon = require('./addon')
module.exports = addon.getServerlessHandler().catalog // or manifest, stream, meta
```


#### `addon.publishToWeb(url)`

@TODO

Creates an add-on homepage on the root of the web server that includes an "Install Add-on" button. This method expects a URL using HTTPS pointing to the manifest (example: `https://example.com/manifest.json`)


#### `addon.serveDir(publicDirectory, localDirectory)`

@TODO

Serve a local (static) directory through the web server. Useful if you need to host the logo and background images for the add-on on the same server (example: `addon.serveDir('/public', './static/imgs')`
