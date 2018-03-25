# stremio-addon-sdk

A NodeJS SDK for making and publishing Stremio add-ons

This can publish an add-on via HTTP(s) or IPFS


## Documentation

### `const addonSDK = require('stremio-addon-sdk')`

Imports the SDK

### `var addon = new addonSDK(manifest)`

Creates a new ready-to-publish add-on with a given manifest. Manifest is defined in `docs/manifest.md` @TODO

### `addon.defineCatalogs(function handler(type, id, cb) { })`

### `addon.defineStreams(function handler(type, id, cb) { })`

### `addon.defineMetas(function handler(type, id, cb) { })`

### `addon.http`


## Example

This arbitrary example creates an add-on that provides a stream for Big Buck Bunny and publishes it on port 19990

```
#!/usr/bin/env node

const addonSDK = require('stremio-addon-sdk')

const addon = new addonSDK({
	id: 'org.myexampleaddon',
	version: '1.0.0',

	name: 'simple example',

	// Properties that determine when Stremio picks this add-on
	// this means your add-on will be used for streams of the type movie
	resources: ['stream'],
	types: ['movie'],
})

// takes function(type, id, cb)
addon.defineStreams(function(type, id, cb) {
	if (type === 'movie' && id === 'tt1254207') {
		// serve one stream to big buck bunny
		const bbbStream = { url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4' }
		cb(null, [bbbStream])
		return
	}

	// otherwise return no streams
	cb(null, [])
})

addon.http.listen(19990, function() {
	console.log('Listening on http://127.0.0.1:19990')
})

```