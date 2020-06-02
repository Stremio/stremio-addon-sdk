# Getting Started

A NodeJS SDK for making and publishing Stremio addons

## Example

**This arbitrary example creates an addon that provides a stream for Big Buck Bunny and outputs a HTTP address where you can access it**

```javascript
#!/usr/bin/env node

const { addonBuilder, serveHTTP, publishToCentral } = require('stremio-addon-sdk')

const builder = new addonBuilder({
    id: 'org.myexampleaddon',
    version: '1.0.0',

    name: 'simple example',

    // Properties that determine when Stremio picks this addon
    // this means your addon will be used for streams of the type movie
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

// If you want this addon to appear in the addon catalogs, call .publishToCentral() with the publically available URL to your manifest
//publishToCentral('https://my-addon.com/manifest.json')

```

Save this as `addon.js` and run:

```bash
npm install stremio-addon-sdk
node ./addon.js
```

It will output a URL that you can use to [install the addon in Stremio](./docs/testing.md#how-to-install-add-on-in-stremio)

## Documentation

**To get familiar with the resources and their roles, [read this](./api/README.md).**

#### `const { addonBuilder, serveHTTP, getRouter, publishToCentral } = require('stremio-addon-sdk')`

Imports everything the SDK provides:

* `addonBuilder`, which you'll need to define the addon
* `serveHTTP`, which you will need to serve a HTTP server for this addon
* `getRouter`, converts an `addonInterface` to an express router
* `publishToCentral`: publishes an addon URL to the public addon catalog


#### `const builder = new addonBuilder(manifest)`

Creates an addon builder object with a given manifest. This will throw if the manifest is not valid.

The manifest will determine the basic information of your addon (name, description, images), but most importantly, it will determine **when and how** your addon will be invoked by Stremio.

[Manifest Object Definition](./api/responses/manifest.md)


#### `builder.defineCatalogHandler(function handler(args) { })`

Handles catalog requests, including search.

[Catalog Request Parameters and Example](./api/requests/defineCatalogHandler.md)


#### `builder.defineMetaHandler(function handler(args) { })`

Handles metadata requests. (title, releaseInfo, poster, background, etc.)

[Meta Request Parameters and Example](./api/requests/defineMetaHandler.md)


#### `builder.defineStreamHandler(function handler(args) { })`

Handles stream requests.

[Stream Request Parameters and Example](./api/requests/defineStreamHandler.md)


#### `builder.defineSubtitlesHandler(function handler(args) { })`

Handles subtitle requests.

[Subtitle Request Parameters and Example](./api/requests/defineSubtitlesHandler.md)


#### `builder.defineResourceHandler('addon_catalog', function handler(args) { })`

Handles addon catalog requests, this can be used by an addon to just send a list of other addon manifests.

[Addon Catalog Request Parameters and Example](./api/requests/defineResourceHandler.md)

**The JSON format of the response to these resources is described [here](./api/responses).**


#### `builder.getInterface()`: returns an `addonInterface`

Turns the `addon` into an `addonInterface`, which is an immutable (frozen) object that has `{manifest, get}`; manifest is a regular [manifest object](./api/responses/manifest.md), while `get` is a function that takes one argument of the form `{ resource, type, id, extra }`, and returns a `Promise`


#### `getRouter(addonInterface)`

Turns the `addonInterface` into an express router, that serves the addon according to [the protocol](./protocol.md), and a landing page on the root (`/`)


#### `publishToCentral(url)`

This method expects a string with the url to your `manifest.json` file.

Publish your addon to the central server. After using this method your addon will be available in the Community Addons list in Stremio for users to install and use. Your addon needs to be publicly available with a URL in order for this to happen, as local addons that are not publicly available cannot be used by other Stremio users.


#### `serveHTTP(addonInterface, options)`

Starts the addon server. `options` is an object that contains:

* `port`
* `cacheMaxAge` (in seconds); `cacheMaxAge` means the `Cache-Control` header being set to `max-age=$cacheMaxAge`
* `static`: path to a directory of static files to be served; e.g. `/public` 

This method is also special in that it will react to certain process arguments, such as:

* `--launch`: launches Stremio in the web browser, and automatically installs/upgrades the addon
* `--install`: installs the addon in the desktop version of Stremio


#### `addonInterface`

The `addonInterface`, as returned from `builder.getInterface()`, has two properties:

* `get({ resource, type, id, extra })` - returns a Promise
* `manifest`: [manifest object](./api/responses/manifest.md)
