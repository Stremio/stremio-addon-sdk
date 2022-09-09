#!/usr/bin/env node

const tape = require('tape')
const request = require('supertest')
const AddonClient = require('stremio-addon-client')
const { addonBuilder, serveHTTP, getRouter, publishToCentral } = require('../')

const PORT = 5000

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

tape('try to create an addon with an invalid manifest', function(t) {
	try { new addonBuilder(null) }
	catch(e) {
		t.ok(e.message, 'invalid manifest')
		t.end()
	}
})

tape('try to create an addon with an invalid manifest: linter', function(t) {
	try { new addonBuilder({ name: 'something' }) }
	catch(e) {
		t.equal(e.message, 'manifest.id must be a string')
		t.end()
	}
})

tape('try to create an addon with an unspecified resource', function(t) {
	try { new addonBuilder(manifest).defineMetaHandler(function() { }).getInterface() }
	catch(e) {
		t.equal(e.message, 'manifest.resources does not contain: meta')
		t.end()
	}
})


tape('create an addon and get the router', function(t) {
	// getRouter requires all handlers to be defined
	var addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve())
		.defineStreamHandler(() => Promise.resolve())
	t.ok(getRouter(addon.getInterface()), 'can get router')
	t.end()
})

tape('create an addon and expose on HTTP with serveHTTP()', function(t) {
	const builder = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve({ metas: [] }))
		// NOTE: we're not supposed to mirror back the `args`, but we're doing it for easier testing
		.defineStreamHandler((args) => Promise.resolve({ streams: [], args }))

	serveHTTP(builder.getInterface(), { port: PORT, cacheMaxAge: 3600 }).then(function(h) {
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
				t.equal(res.headers['cache-control'], 'max-age=3600, public', 'cache headers are correct')
				t.end()
			})

	})
})

tape('try to serve a directory that does not exist', function (t) {
	var addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve())
		.defineStreamHandler(() => Promise.resolve())
	try {
		serveHTTP(addon.getInterface(), { static: '/notexist' })
	} catch (e) {
		t.equal(e.message, 'directory to serve does not exist')
		t.end()
	}
})

tape('try to serve a directory', function (t) {
	var addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve())
		.defineStreamHandler(() => Promise.resolve())

	serveHTTP(addon.getInterface(), { static: '/docs' }).then(function (h) {
		request(h.server)
			.get('/docs/README.md')
			.expect(200)
			.end((err, res) => {
				h.server.close()
				t.error(err, 'request error')
				t.error(res.error, 'response error')
				t.equal(res.ok, true, 'has response status 200')
				t.equal(res.status, 200, 'has response status ok')
				t.equal(res.type, 'text/markdown', 'is a valid markdown document')
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
			t.error(err, 'request error')
			t.error(res.error, 'response error')
			t.equal(res.ok, true, 'has response status ok')
			t.equal(res.status, 200, 'has response status 200')
			t.notEqual(res.text, undefined, 'is not undefined')
			t.equal(res.type, 'text/html', 'is a valid html document')
			t.end()
		})
})


tape('initialize an addon client for the addon', function(t) {
	AddonClient.detectFromURL(addonUrl)
		.then(function(resp) {
			t.ok(resp.addon, 'has addon')

			t.ok(resp.addon.manifest, 'has manifest')
			// NOTE: this is an important design principle - immutability on the manifest object
			t.deepEquals(resp.addon.manifest, manifest, 'addon.manifest is immutable')

			const addonClient = resp.addon
			return addonClient.get('stream', 'channel', '11')
				.then(function(resp) {
					t.ok(resp.streams, 'has streams')
					t.deepEqual(resp.args, { type: 'channel', id: '11', extra: {}, config: {} }, 'args parsed right')
					return addonClient.get('stream', 'channel', '11', { search: 'foobar' })
				})
				.then(function(resp) {
					t.ok(resp.streams, 'has streams')
					t.deepEqual(resp.args, { type: 'channel', id: '11', extra: { search: 'foobar' }, config: {} }, 'args parsed right')
				})
		})
		.then(() => t.end())
		.catch(function(err) {
			t.error(err, 'error on addonClient')
			t.end()
		})
})

tape('getInterface: define a stream handler on the addon and test it', function(t) {
	const addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve({ metas: [] }))
		.defineStreamHandler(function(args) {
			t.equals(args.type, 'channel', 'args.type is right')
			t.equals(args.id, '11', 'args.id is right')
			t.deepEquals(args.extra, {}, 'args.extra is empty')
			return Promise.resolve({streams:[]})
		})
	const addonInterface = addon.getInterface()
	t.ok(addonInterface.manifest, 'interface has manifest')
	addonInterface.manifest.name += 'foobar'
	t.equal(addonInterface.manifest.name, manifest.name, 'interface.manifest is immutable')
	addonInterface.get('stream', 'channel', '11')
		.then(r => {
			t.ok(r.streams, 'response has streams')
		})
		.then(() => t.end())
		.catch(function(err) {
			t.error(err, 'error on addonClient stream request')
			t.end()
		})
})

tape('defining the same handler throws', function(t) {
	const addon = new addonBuilder(manifest)
		.defineCatalogHandler(() => Promise.resolve({ metas: [] }))
		.defineStreamHandler(() => Promise.resolve({ streams: [] }))
	try {
		addon.defineStreamHandler(() => Promise.resolve())
	} catch(e) {
		t.ok(e, 'has exception')
		t.equal(e.message, 'handler for stream already defined')
		t.end()
	}
})

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
	addonServer.close()
})
