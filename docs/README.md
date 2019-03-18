# Getting Started

A NodeJS SDK for making and publishing Stremio add-ons

## Example

**This arbitrary example creates an add-on that provides a stream for Big Buck Bunny and outputs a HTTP address where you can access it**

```javascript
#!/usr/bin/env node

const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')

const builder = new addonBuilder({
    id: 'org.myexampleaddon',
    version: '1.0.0',

    name: 'simple example',

    // Properties that determine when Stremio picks this add-on
    // this means your add-on will be used for streams of the type movie
    resources: ['stream'],
    types: ['movie'],
    idPrefixes: ['tt']
})

// takes function(args), returns Promise
builder.defineStreamHandler(function(args) {
    if (args.type === 'movie' && args.id === 'tt1254207') {
        // serve one stream to big buck bunny
        // return addonSDK.Stream({ url: '...' })
        const stream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
        return Promise.resolve({ streams: [stream] })
    } else {
        // otherwise return no streams
	return Promise.resolve({ streams: [] })
    }
})

serveHTTP(builder.getInterface(), { port: 7000 })

// If you want this add-on to appear in the addon catalogs, call .publishToCentral() with the publically available URL to your manifest
//publishToCentral('https://my-addon.com/manifest.json')

```

Save this as `addon.js` and run:

```bash
npm install stremio-addon-sdk
node ./addon.js
```

It will output a URL that you can use to [install the add-on in Stremio](./docs/testing.md#how-to-install-add-on-in-stremio)

## Documentation

**To get familiar with the resources and their roles, [read this](./api/README.md).**

#### `const { addonBuilder, serveHTTP, getRouter, publishToCentral } = require('stremio-addon-sdk')`

Imports everything the SDK provides:

* `addonBuilder`, which you'll need to define the addon
* `serveHTTP`, which you will need to serve a HTTP server for this addon
* `getRouter`, converts an `addonInterface` to an express router
* `publishToCentral`: publishes an add-on URL to the public add-on catalog


#### `const builder = new addonBuilder(manifest)`

Creates an  add-on builder obbject with a given manifest. This will throw if the manifest is not valid.

The manifest will determine the basic information of your add-on (name, description, images), but most importantly, it will determine **when and how** your add-on will be invoked by Stremio.

[Manifest Object Definition](./api/responses/manifest.md)


#### `builder.defineCatalogHandler(function handler(args) { })`

Handles catalog requests, including search.

[Catalog Request Parameters and Example](./api/requests/defineCatalogHandler.md)


#### `builder.defineMetaHandler(function handler(args) { })`

Handles metadata requests. (title, year, poster, background, etc.)

[Meta Request Parameters and Example](./api/requests/defineMetaHandler.md)


#### `builder.defineStreamHandler(function handler(args) { })`

Handles stream requests.

[Stream Request Parameters and Example](./api/requests/defineStreamHandler.md)


#### `builder.defineSubtitlesHandler(function handler(args) { })`

Handles subtitle requests.

[Subtitle Request Parameters and Example](./api/requests/defineSubtitlesHandler.md)

**The JSON format of the response to these resources is described [here](./api/responses).**


#### `builder.getInterface()`: returns an `addonInterface`

Turns the `addon` into an `addonInterface`, which is an immutable (frozen) object that has `{manifest, get}`; manifest is a regular [manifest object](./api/responses/manifest.md), while `get` is a function that takes one argument of the form `{ resource, type, id, extra }`, and returns a `Promise`


#### `getRouter(addonInterface)`

Turns the `addonInterface` into an express router, that serves the addon according to [the protocol](./protocol.md), and a landing page on the root (`/`)


#### `publishToCentral(url)`

This method expects a string with the url to your `manifest.json` file.

Publish your add-on to the central server. After using this method your add-on will be available in the Community Add-ons list in Stremio for users to install and use. Your add-on needs to be publicly available with a URL in order for this to happen, as local add-ons that are not publicly available cannot be used by other Stremio users.


#### `serveHTTP(addonInterface, options)`

Starts the addon server. `options` is an object that contains:

* `port`
* `cacheMaxAge` (in seconds); `cacheMaxAge` means the `Cache-Control` header being set to `max-age=$cacheMaxAge`

This method is also special in that it will react to certain process arguments, such as:

* `--launch`: launches Stremio in the web browser, and automatically installs/upgrades the add-on
* `--install`: installs the add-on in the desktop version of Stremio


#### `addonInterface`

The `addonInterface`, as returned from `builder.getInterface()`, has two properties:

* `get({ resource, type, id, extra })` - returns a Promise
* `manifest`: [manifest object](./api/responses/manifest.md)
