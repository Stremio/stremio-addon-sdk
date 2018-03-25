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