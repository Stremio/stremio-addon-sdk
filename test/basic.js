#!/usr/bin/env node

const tape = require('tape')
const AddonClient = require('stremio-addon-client')
const addonSDK = require('../')

// @TODO: linter, test the linter

const manifest = {
	id: 'org.myexampleaddon',
	version: '1.0.0',

	name: 'simple example',

	resources: ['stream'],
	types: ['movie'],
}

let addon
let addonUrl
let addonServer

let addonClient

tape('try to create an add-on with an invalid manifest', function(t) {
	try { new addonSDK(null) }
	catch(e) {
		t.ok(e.message, 'invalid manifest')
		t.end()
	}
})


tape('create an add-on and get the router', function(t) {
	var addon = new addonSDK(manifest)
	t.ok(addon.getRouter(), 'can get router')
	t.end()
})

tape('create an add-on and expose on HTTP', function(t) {
	addon = new addonSDK(manifest)

	addon.run(function(err, h) {
		// This executes first
		t.error(err, 'error on addon.run()')

		t.ok(h.url, 'has url')
		t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')

		t.ok(h.server, 'has h.server')

		addonUrl = h.url
		addonServer = h.server

		t.end()
	})
})



// pubishToCentral publishes to the API
tape('publishToCentral', function(t) {
	addon.publishToCentral('https://cinemeta.strem.io/manifest.json')
	.then(function(resp) {
		t.equal(resp.success, true, 'can announce')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
		t.end()
	})
})

tape('initialize an add-on client for the add-on', function(t) {
	AddonClient.detectFromURL(addonUrl)
	.then(function(resp) {
		t.ok(resp.addon, 'has addon')

		t.ok(resp.addon.manifest, 'has manifest')
		// NOTE: this is an important design principle - immutability on the manifest object
		t.deepEquals(resp.addon.manifest, manifest, 'addon.manifest is the same as manifest')

		addonClient = resp.addon
		t.end()
	})
	.catch(function(err) {
		t.error(err, 'error on addonclient')
		t.end()
	})
})

tape('define a stream handler on the add-on and test it', function(t) {
	addonClient.get('stream', 'channel', '11')
	.catch(function(err) {
		t.error(err, 'error on addonclient stream request')
		t.end()
	})

	// NOTE: this also tests the case where .defineStreamHandler is invoked after .run()
	addon.defineStreamHandler(function(args, cb) {
		t.equals(args.type, 'channel', 'args.type is right')
		t.equals(args.id, '11', 'args.id is right')
		t.deepEquals(args.extra, { }, 'args.extra is empty')

		t.end()
	})
})

tape('defining the same handler throws', function(t) {
	try {
		addon.defineStreamHandler(function(args, cb) {
			cb(null, null)
		})
	} catch(e) {
		t.ok(e, 'has exception')
		t.end()
	}
})



// @WARNING: we should throw the second time we call defineStreamHandler (same goes for define*Handler)
tape('define a handler on the add-on and test it, with extra args', function(t) {
	addonClient.get('catalog', 'movie', 'top', { search: 'the office' })
	.catch(function(err) {
		t.error(err, 'error on addonclient stream request')
		t.end()
	})

	addon.defineCatalogHandler(function(args, cb) {
		t.equals(args.type, 'movie', 'args.type is right')
		t.equals(args.id, 'top', 'args.id is right')
		t.deepEquals(args.extra, { search: 'the office' }, 'args.extra is right')

		t.end()

		// Our measure of quitting while the server is running
		process.exit()
	})
})