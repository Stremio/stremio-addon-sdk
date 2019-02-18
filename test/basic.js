#!/usr/bin/env node

const tape = require('tape')
const request = require('supertest');
const AddonClient = require('stremio-addon-client')
const { addonBuilder, serveHTTP, publishToCentral } = require('../')

const PORT = 5000;

let addonUrl
let addonServer

const manifest = {
	id: 'org.myexampleaddon',
	version: '1.0.0',
	description: 'not so simple',

	name: 'simple example',

	logo: `http://localhost:${PORT}/static/imgs/logo.png`,
	background: `http://localhost:${PORT}/static/imgs/background.jpg`,

	resources: ['stream'],
	types: ['movie'],

	catalogs: [{ type: 'movie', id: 'test' }],
}

tape('try to create an add-on with an invalid manifest', function(t) {
	try { new addonBuilder(null) }
	catch(e) {
		t.ok(e.message, 'invalid manifest')
		t.end()
	}
})

tape('try to create an add-on with an invalid manifest: linter', function(t) {
        try { new addonBuilder({ name: 'something' }) }
        catch(e) {
                t.equal(e.message, 'manifest.id must be a string')
                t.end()
        }
})

tape('try to create an add-on with an unspecified resource', function(t) {
        try { new addonBuilder(manifest).defineMetaHandler(function() { }).getInterface() }
        catch(e) {
                t.equal(e.message, 'manifest.resources does not contain: meta')
                t.end()
        }
})


tape('create an add-on and get the router', function(t) {
	// getRouter requires all handlers to be defined
	var addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve())
		.defineStreamHandler(() => Promise.resolve())
	t.ok(addon.getRouter(), 'can get router')
	t.end()
})

tape('create an add-on and expose on HTTP with serveHTTP()', function(t) {
	const addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve({ metas: [] }))
		.defineStreamHandler(() => Promise.resolve({ streams: [] }))

	serveHTTP(addon, { port: PORT, cache: 3600 }).then(function(h) {
		t.ok(h.url, 'has url')
		t.ok(h.url.endsWith('manifest.json'), 'url ends with manifest.json')

		t.ok(h.server, 'has h.server')

		addonUrl = h.url
		addonServer = h.server

		request(addonServer)
		.get('/manifest.json')
		.expect(200)
		.end((err, res) => {
			t.error(err, 'request error')
			t.error(res.error, 'response error')
			t.equal(res.ok, true, 'has response status 200')
			t.equal(res.status, 200, 'has response status ok')
			t.equal(res.headers['cache-control'], 'max-age=3600', 'cache headers are correct')
			t.end()
		})

	})
})

// Test the homepage of the addon
tape('should return a valid html document', function (t) {
	request(addonServer)
	.get('/')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.equal(res.ok, true, 'has response status ok');
		t.equal(res.status, 200, 'has response status 200');
		t.notEqual(res.text, undefined, 'is not undefined');
		t.equal(res.type, 'text/html', 'is a valid html document');
		t.end();
	});
})


tape('initialize an add-on client for the add-on', function(t) {
	AddonClient.detectFromURL(addonUrl)
	.then(function(resp) {
		t.ok(resp.addon, 'has addon')

		t.ok(resp.addon.manifest, 'has manifest')
		// NOTE: this is an important design principle - immutability on the manifest object
		t.deepEquals(resp.addon.manifest, manifest, 'addon.manifest is the same as manifest')

		return resp.addon.get('stream', 'channel', '11')
		.then(function(resp) {
			t.ok(resp.streams, 'has streams')
		})
	})
	.then(() => t.end())
	.catch(function(err) {
		t.error(err, 'error on addonClient')
		t.end()
	})
})

tape('define a stream handler on the add-on and test it', function(t) {
	const addon = new addonBuilder(manifest)
		.defineCatalogHandler(({ type, id }) => Promise.resolve({ metas: [] }))
		.defineStreamHandler(function(args) {
			t.equals(args.type, 'channel', 'args.type is right')
			t.equals(args.id, '11', 'args.id is right')
			t.deepEquals(args.extra, {}, 'args.extra is empty')
			return Promise.resolve({streams:[]})
		})
	const addonInterface = addon.getInterface()
	addonInterface.get('stream', 'channel', '11')
	.then(r => {
		t.ok(r.streams, 'response has streams')
		t.end()
	})
	.catch(function(err) {
		t.error(err, 'error on addonClient stream request')
		t.end()
	})
})

tape('defining the same handler throws', function(t) {
	const addon = new addonBuilder(manifest)
		.defineCatalogHandler(({ type, id }) => Promise.resolve({ metas: [] }))
		.defineStreamHandler(({ type, id }) => Promise.resolve({ streams: [] }))
	try {
		addon.defineStreamHandler(() => Promise.resolve())
	} catch(e) {
		t.ok(e, 'has exception')
		t.equal(e.message, 'handler for stream already defined')
		t.end()
	}
})

// @WARNING: we should throw the second time we call defineStreamHandler (same goes for define*Handler)
/*
// @TODO test this through the router (parsing extra)
tape('define a handler on the add-on and test it, with extra args', function(t) {
	addonClient.get('catalog', 'movie', 'top', { search: 'the office' })
	.then(r => {
		t.ok(r.metas, 'response has metas)')
		t.end()
	})
	.catch(function(err) {
		t.error(err, 'error on addonclient stream request')
		t.end()
	})

	addon.defineCatalogHandler(function(args) {
		t.equals(args.type, 'movie', 'args.type is right')
		t.equals(args.id, 'top', 'args.id is right')
		t.deepEquals(args.extra, { search: 'the office' }, 'args.extra is right')
		return Promise.resolve({ metas: [] })
	})
})
*/

// publishToCentral publishes to the API
tape('publishToCentral', function(t) {
	publishToCentral('https://cinemeta.strem.io/manifest.json')
	.then(function(resp) {
		t.equal(resp.success, true, 'can announce')
		t.end()
	})
	.catch(function(err) {
		t.error(err)
		t.end()
	})
})

tape.onFinish(function() {
	// cause the server is still listening
	// @TODO find a better way to mitigate that
	process.exit()
})
