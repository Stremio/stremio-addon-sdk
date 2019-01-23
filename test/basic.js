#!/usr/bin/env node

const tape = require('tape')
const request = require('supertest');
const AddonClient = require('stremio-addon-client')
const addonSDK = require('../')

// @TODO: linter, test the linter

const PORT = 5000;

const manifest = {
	id: 'org.myexampleaddon',
	version: '1.0.0',
	description: 'not so simple',

	name: 'simple example',

	logo: `http://localhost:${PORT}/public/logo.png`,
	background: `http://localhost:${PORT}/public/background.jpg`,

	resources: ['stream'],
	types: ['movie'],

	catalogs: [],
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

tape('create an add-on and expose on HTTP with addon.run()', function(t) {
	var addon = new addonSDK(manifest)
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

tape('create an add-on and expose on HTTP with addon.runHTTPWithOptions()', function(t) {
	addon = new addonSDK(manifest)

	addon.runHTTPWithOptions({ port: PORT }, function(err, h) {
		// This executes first
		t.error(err, 'error on addon.runHTTPWithOptions()')

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
			t.ok(res.ok === true, 'has response status 200')
			t.ok(res.status === 200, 'has response status ok')
			t.end()
		})

	})
})

// Test directory serving function (using the static images folder of the sdk)
tape('serve the local directory on /public', function (t) {
	t.ok(addon.serveDir('/public', './static/imgs'), 'can serve the directory');
	t.end();
})

tape('should return a valid logo png image', function (t) {
	request(addonServer)
	.get('/public/logo.png')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.ok(res.ok === true, 'has response status 200');
		t.ok(res.status === 200, 'has response status ok');
		t.ok(res.body !== undefined, 'is not undefined');
		t.ok(res.type === 'image/png', 'is a valid png image');
		t.end();
	});
})

tape('should return a valid background jpg image', function (t) {
	request(addonServer)
	.get('/public/background.jpg')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.ok(res.ok === true, 'has response status 200');
		t.ok(res.status === 200, 'has response status ok');
		t.ok(res.body !== undefined, 'is not undefined');
		t.ok(res.type === 'image/jpeg', 'is a valid jpg image');
		t.end();
	});
})

// Test directory serving function (using the static images folder of the sdk)
tape('publishToWeb', function (t) {
	t.ok(addon.publishToWeb(`https://cinemeta.strem.io/manifest.json`), 'can publishToWeb');
	t.end();
})

// Test the homepage of the addon
tape('should return a valid html document', function (t) {
	request(addonServer)
	.get('/')
	.expect(200)
	.end((err, res) => {
		t.error(err, 'request error');
		t.error(res.error, 'response error');
		t.ok(res.ok === true, 'has response status ok');
		t.ok(res.status === 200, 'has response status 200');
		t.ok(res.text !== undefined, 'is not undefined');
		t.ok(res.type === 'text/html', 'is a valid html document');
		t.end();
	});
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
